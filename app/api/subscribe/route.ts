import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { generateAura } from '../../lib/auraEngine'
import { generateAurascope } from '../../lib/auracle'
import { getAuraLore } from '../../lib/auraLore'


function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function cleanName(name: string): string {
  return name.replace(/^The-/, '').replace(/-/g, ' ')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, birthDate, registeredAt } = body

    if (!email || !birthDate) {
      return NextResponse.json(
        { error: 'Email and birth date required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing RESEND_API_KEY' },
        { status: 500 }
      )
    }

    // Initialize the email client only for a request. This avoids failing the
    // Next.js production build when optional secrets are unavailable at build time.
    const resend = new Resend(apiKey)

    const aura = generateAura(birthDate, registeredAt)
    const aurascope = generateAurascope(aura)
    const lore = getAuraLore({
      finalAuraName: aura.finalAuraName,
      finalEmotion: aura.finalEmotion,
      zodiacSign: aura.zodiac.sign,
      birthstone: aura.zodiac.birthstone,
      zodiacHue: aura.hues[0],
      birthstoneHue: aura.hues[1],
      timeHue: aura.hues[2],
      timeState: aura.timeState,
      currentAuraDay: aura.currentAuraDay,
      stoneOpacity: aura.stoneOpacity,
      daysAlive: aura.daysAlive,
      tenureDays: aura.tenureDays,
      timeFactor: aura.timeFactor
    })

    const finalAuraName = escapeHtml(aura.finalAuraName)
    const finalHex = escapeHtml(aura.finalHex)
    const zodiac = escapeHtml(aura.zodiac.sign)
    const birthstone = escapeHtml(aura.zodiac.birthstone)

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'AuraSpanse <onboarding@resend.dev>',
      to: email,
      subject: `Your AuraSpanse reading: ${aura.finalAuraName}`,
      html: `
        <div style="background:#05030a;color:white;padding:38px;font-family:Arial,sans-serif;max-width:680px;margin:0 auto;">
          <p style="letter-spacing:3px;font-size:11px;color:#9c74ff;margin:0 0 22px;">AURASPANSE // AURACLE</p>
          <h1 style="font-size:34px;line-height:1.05;margin:0 0 14px;font-weight:700;">${finalAuraName}</h1>
          <p style="margin:0 0 26px;color:rgba(255,255,255,0.68);">${escapeHtml(cleanName(aura.finalEmotion.name))} · ${zodiac}</p>

          <div style="width:164px;height:164px;border-radius:999px;background:${finalHex};box-shadow:0 0 90px ${finalHex};margin:26px auto;border:1px solid rgba(255,255,255,0.3);"></div>

          <div style="background:#101018;border:1px solid rgba(255,255,255,0.1);border-radius:22px;padding:22px;margin:28px 0;">
            <h2 style="margin:0 0 12px;color:${finalHex};">Your AuraScope</h2>
            <p style="line-height:1.75;margin:0;color:rgba(255,255,255,0.88);">${escapeHtml(aurascope.reading)}</p>
          </div>

          <h2 style="margin:30px 0 14px;">The 3-Hue Reveal</h2>
          <div style="display:block;">
            <div style="border-left:4px solid ${escapeHtml(aura.hues[0].hex)};padding:12px 16px;margin:12px 0;background:#0d0d12;">
              <strong>Hue 1 · Zodiac</strong><br />
              <span style="color:${escapeHtml(aura.hues[0].hex)};">${escapeHtml(cleanName(aura.hues[0].name))}</span><br />
              <span style="color:rgba(255,255,255,0.62);font-size:13px;">${zodiac} traits: ${escapeHtml(aura.zodiac.traits.join(' / '))}</span>
            </div>
            <div style="border-left:4px solid ${escapeHtml(aura.hues[1].hex)};padding:12px 16px;margin:12px 0;background:#0d0d12;">
              <strong>Hue 2 · Birthstone Resonance</strong><br />
              <span style="color:${escapeHtml(aura.hues[1].hex)};">${escapeHtml(cleanName(aura.hues[1].name))}</span> · ${Math.round(aura.stoneOpacity * 100)}% stone-color strength<br />
              <span style="color:rgba(255,255,255,0.62);font-size:13px;">${birthstone} properties: ${escapeHtml(aura.zodiac.stoneTraits.join(' / '))}</span>
            </div>
            <div style="border-left:4px solid ${escapeHtml(aura.hues[2].hex)};padding:12px 16px;margin:12px 0;background:#0d0d12;">
              <strong>Hue 3 · Time State</strong><br />
              <span style="color:${escapeHtml(aura.hues[2].hex)};">${escapeHtml(aura.timeState)}</span> · Aura Day ${aura.currentAuraDay}<br />
              <span style="color:rgba(255,255,255,0.62);font-size:13px;">Time hue: ${escapeHtml(cleanName(aura.hues[2].name))}</span>
            </div>
          </div>

          <div style="background:#08080d;border:1px solid ${finalHex}55;border-radius:22px;padding:24px;margin:30px 0;">
            <h2 style="color:${finalHex};margin:0 0 12px;">The Lore of ${finalAuraName}</h2>
            <p style="line-height:1.75;color:rgba(255,255,255,0.88);"><strong>Origin:</strong> ${escapeHtml(lore.origin)}</p>
            <p style="line-height:1.75;color:rgba(255,255,255,0.88);"><strong>Historical color layer:</strong> ${escapeHtml(lore.historical)}</p>
            <p style="line-height:1.75;color:rgba(255,255,255,0.88);"><strong>Modern meaning:</strong> ${escapeHtml(lore.modern)}</p>
            <p style="line-height:1.75;color:rgba(255,255,255,0.72);"><strong>Equation:</strong> ${escapeHtml(lore.equation)}</p>
          </div>

          <h2 style="margin:30px 0 14px;">3 Modern Exercises</h2>
          <div style="background:#101018;border-radius:20px;padding:20px;margin-bottom:24px;">
            <p style="line-height:1.7;"><strong>Morning · Activate</strong><br />${escapeHtml(lore.exercises.morning)}</p>
            <p style="line-height:1.7;"><strong>Midday · Integrate</strong><br />${escapeHtml(lore.exercises.midday)}</p>
            <p style="line-height:1.7;"><strong>Evening · Log</strong><br />${escapeHtml(lore.exercises.evening)}</p>
          </div>

          <p style="font-style:italic;color:${finalHex};line-height:1.7;">${escapeHtml(aurascope.mantra)}</p>
          <p style="font-size:12px;line-height:1.6;color:rgba(255,255,255,0.45);margin-top:34px;">AuraSpanse and Auracle readings are for entertainment and personal reflection only. They are not medical, psychological, financial, or professional advice.</p>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      finalAuraName: aura.finalAuraName
    })
  } catch (err) {
    console.error('[Subscribe error]', err)

    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
