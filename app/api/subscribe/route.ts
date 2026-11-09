import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { generateAura } from '../../lib/auraEngine'
import { generateAurascope } from '../../lib/auracle'
import { getAuraLore } from '../../lib/auraLore'
import { generatePersonalizedEmotionReading, PersonalizedReadingError } from '../../lib/personalizedEmotionReading'

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function safeHex(value: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000'
}

function cleanName(name: string): string {
  return name.replace(/^The-/, '').replace(/-/g, ' ')
}

function parseSnapshotTime(value: unknown): Date | null {
  if (value === undefined || value === null || value === '') return new Date()
  if (typeof value !== 'string') return null
  const date = new Date(value)
  if (!Number.isFinite(date.getTime()) || date.getTime() > Date.now() + 5 * 60_000) return null
  return date
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = typeof body?.email === 'string' ? body.email.trim() : ''
    const birthDate = typeof body?.birthDate === 'string' ? body.birthDate : ''
    const registeredAt = typeof body?.registeredAt === 'string' ? body.registeredAt : undefined
    const snapshotTime = parseSnapshotTime(body?.generatedAt)

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !birthDate) {
      return NextResponse.json({ error: 'A valid email and birth date are required.' }, { status: 400 })
    }
    if (!snapshotTime) {
      return NextResponse.json({ error: 'The reading timestamp is invalid. Please recalculate your Aurascope.' }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Email delivery is not configured yet.' }, { status: 503 })
    }

    const aura = generateAura(birthDate, registeredAt, snapshotTime)
    const aurascope = generateAurascope(aura)
    const personalized = await generatePersonalizedEmotionReading([
      aura.hues[0],
      aura.hues[1],
      aura.timeHue,
      aura.firstHue,
      aura.currentPlacement,
      aura.finalEmotion,
      aura.zodiacAverage,
      aura.birthstoneAverage,
    ])
    const lore = getAuraLore({
      finalAuraName: aura.finalAuraName,
      finalEmotion: aura.finalEmotion,
      zodiacSign: aura.zodiac.sign,
      birthstone: aura.zodiac.birthstone,
      zodiacHue: aura.hues[0],
      birthstoneHue: aura.hues[1],
      timeHue: aura.hues[3],
      timeState: aura.timeState,
      currentAuraDay: aura.currentAuraDay,
      stoneOpacity: aura.stoneOpacity,
      daysAlive: aura.daysAlive,
      tenureDays: aura.tenureDays,
      timeFactor: aura.timeFactor,
    })

    const finalAuraName = escapeHtml(aura.finalAuraName)
    const finalHex = safeHex(aura.finalHex)
    const generatedAtLabel = escapeHtml(snapshotTime.toISOString().replace('T', ' ').replace('Z', ' UTC'))
    const componentCards = personalized.components.map((component) => {
      const color = safeHex(component.hex)
      return `
        <div style="border:1px solid ${color}66;border-radius:16px;padding:16px;background:#0d0d12;">
          <div style="height:46px;border-radius:10px;background:${color};margin-bottom:12px;"></div>
          <strong style="color:${color};">${escapeHtml(cleanName(component.sourceName))}</strong>
          <div style="font-size:12px;color:rgba(255,255,255,.6);margin-top:5px;">${escapeHtml(component.emotion)} · ${escapeHtml(color)}</div>
        </div>`
    }).join('')
    const hueCards = aurascope.hueSummary.map((hue) => {
      const color = safeHex(hue.hex)
      return `
        <div style="border-left:4px solid ${color};padding:12px 16px;margin:12px 0;background:#0d0d12;">
          <strong>${escapeHtml(hue.label)}</strong><br />
          <span style="color:${color};">${escapeHtml(hue.name)} · ${escapeHtml(color)}</span><br />
          <span style="color:rgba(255,255,255,.62);font-size:13px;">${escapeHtml(hue.meaning)}</span>
        </div>`
    }).join('')

    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'AuraSpanse <onboarding@resend.dev>',
      to: email,
      subject: `Your personal AuraSpanse reading: ${personalized.title}`,
      html: `
        <div style="background:#05030a;color:white;padding:38px;font-family:Arial,sans-serif;max-width:680px;margin:0 auto;">
          <p style="letter-spacing:3px;font-size:11px;color:#9c74ff;margin:0 0 22px;">AURASPANSE // AURACLE</p>
          <h1 style="font-size:34px;line-height:1.05;margin:0 0 8px;font-weight:700;">${escapeHtml(personalized.title)}</h1>
          <p style="margin:0 0 12px;color:rgba(255,255,255,.66);">A personal synthesis of ${escapeHtml(personalized.components.map((component) => component.emotion).join(' · '))} · ${escapeHtml(aura.zodiac.sign)}</p>
          <p style="font-size:12px;color:rgba(255,255,255,.45);margin:0 0 24px;">Reading snapshot: ${generatedAtLabel}</p>

          <div style="width:164px;height:164px;border-radius:999px;background:${finalHex};box-shadow:0 0 90px ${finalHex};margin:26px auto;border:1px solid rgba(255,255,255,.3);"></div>

          <div style="background:#101018;border:1px solid ${finalHex}55;border-radius:22px;padding:22px;margin:28px 0;">
            <h2 style="margin:0 0 12px;color:${finalHex};">Your personalized Aurascope reading</h2>
            <p style="line-height:1.8;margin:0;color:rgba(255,255,255,.9);">${escapeHtml(personalized.definition)}</p>
          </div>

          <h2 style="margin:30px 0 8px;">Five emotion colors in this reading</h2>
          <p style="color:rgba(255,255,255,.62);line-height:1.6;margin:0 0 14px;">These are the exact source colors generated for this Aurascope snapshot.</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;">${componentCards}</div>

          <div style="background:#101018;border:1px solid rgba(255,255,255,.1);border-radius:22px;padding:22px;margin:28px 0;">
            <h2 style="margin:0 0 12px;color:${finalHex};">AuraScope engine detail</h2>
            <p style="line-height:1.75;margin:0;color:rgba(255,255,255,.88);">${escapeHtml(aurascope.reading)}</p>
            <p style="font-style:italic;color:${finalHex};line-height:1.7;margin-bottom:0;">${escapeHtml(aurascope.mantra)}</p>
          </div>

          <h2 style="margin:30px 0 14px;">Generated AuraScope colors</h2>
          ${hueCards}

          <div style="background:#08080d;border:1px solid ${finalHex}55;border-radius:22px;padding:24px;margin:30px 0;">
            <h2 style="color:${finalHex};margin:0 0 12px;">The Lore of ${finalAuraName}</h2>
            <p style="line-height:1.75;color:rgba(255,255,255,.88);"><strong>Origin:</strong> ${escapeHtml(lore.origin)}</p>
            <p style="line-height:1.75;color:rgba(255,255,255,.88);"><strong>Historical color layer:</strong> ${escapeHtml(lore.historical)}</p>
            <p style="line-height:1.75;color:rgba(255,255,255,.88);"><strong>Modern meaning:</strong> ${escapeHtml(lore.modern)}</p>
            <p style="line-height:1.75;color:rgba(255,255,255,.72);"><strong>Equation:</strong> ${escapeHtml(lore.equation)}</p>
          </div>

          <h2 style="margin:30px 0 14px;">3 modern exercises</h2>
          <div style="background:#101018;border-radius:20px;padding:20px;margin-bottom:24px;">
            <p style="line-height:1.7;"><strong>Morning · Activate</strong><br />${escapeHtml(lore.exercises.morning)}</p>
            <p style="line-height:1.7;"><strong>Midday · Integrate</strong><br />${escapeHtml(lore.exercises.midday)}</p>
            <p style="line-height:1.7;"><strong>Evening · Log</strong><br />${escapeHtml(lore.exercises.evening)}</p>
          </div>

          <p style="font-size:12px;line-height:1.6;color:rgba(255,255,255,.45);margin-top:34px;">AuraSpanse readings are symbolic entertainment and personal reflection, not medical, psychological, financial, or professional advice.</p>
        </div>
      `,
    })

    if (error) {
      console.error('[Subscribe email delivery]', error.message)
      return NextResponse.json({ error: 'Your personalized reading was created, but email delivery failed. Please try again.' }, { status: 502 })
    }

    return NextResponse.json({
      success: true,
      finalAuraName: aura.finalAuraName,
      personalizedReading: { title: personalized.title, definition: personalized.definition },
      generatedAt: snapshotTime.toISOString(),
    })
  } catch (err) {
    if (err instanceof PersonalizedReadingError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[Subscribe error]', err instanceof Error ? err.message : 'unknown error')
    return NextResponse.json({ error: 'Failed to create and send your personalized reading.' }, { status: 500 })
  }
}
