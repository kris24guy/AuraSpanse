import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { AURA_SPECTRUM_PRIMARY_POINTS } from '../../lib/auraSpectrumCycloneData'
import { getBirthstoneResonance } from '../../lib/birthstoneResonance'
import { generateOriginSpectrum } from '../../lib/originSpectrumEngine'
import { generatePersonalizedEmotionReading, PersonalizedReadingError } from '../../lib/personalizedEmotionReading'
import { getZodiacSign, zodiacMap } from '../../lib/zodiacMap'

export const runtime = 'nodejs'

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function readableName(name: string): string {
  return name.replace(/^The-/, '').replace(/-/g, ' ')
}

function blendTwoPrimaryHex(firstHex: string, secondHex: string): string {
  const read = (hex: string) => {
    const clean = hex.replace('#', '')
    if (!/^[0-9a-fA-F]{6}$/.test(clean)) throw new Error('Primary hue color is invalid.')
    return [0, 2, 4].map((offset) => Number.parseInt(clean.slice(offset, offset + 2), 16))
  }
  const first = read(firstHex)
  const second = read(secondHex)
  return '#' + first.map((value, index) =>
    Math.round((value + second[index]) / 2).toString(16).padStart(2, '0')
  ).join('')
}

const REVEAL_COOKIE = 'auraspanse-aura-spectrum-ticket'
const REVEAL_TTL_MS = 90 * 24 * 60 * 60 * 1000

interface RevealTicket {
  email: string
  birthDate: string
  expiresAt: number
}

function calculatePrimaryResult(birthDate: string, now = new Date()) {
  return generateOriginSpectrum(birthDate, {
    now,
    spectrum: AURA_SPECTRUM_PRIMARY_POINTS,
    zodiacMap,
    resolveZodiacSign: (date) => getZodiacSign(date),
    getBirthstoneResonance,
    includeComposite: false,
  })
}

function signRevealPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

function createRevealTicket(email: string, birthDate: string, secret: string): string {
  const payload = Buffer.from(JSON.stringify({
    email,
    birthDate,
    expiresAt: Date.now() + REVEAL_TTL_MS,
  } satisfies RevealTicket)).toString('base64url')
  return payload + '.' + signRevealPayload(payload, secret)
}

function verifyRevealTicket(token: string, birthDate: string, secret: string): RevealTicket | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const expected = Buffer.from(signRevealPayload(parts[0], secret))
  const received = Buffer.from(parts[1])
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null

  try {
    const ticket = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')) as RevealTicket
    if (
      !ticket ||
      typeof ticket.email !== 'string' ||
      !ticket.email.includes('@') ||
      ticket.birthDate !== birthDate ||
      !Number.isFinite(ticket.expiresAt) ||
      ticket.expiresAt < Date.now()
    ) return null
    return ticket
  } catch {
    return null
  }
}

function setRevealCookie(response: NextResponse, email: string, birthDate: string, secret: string) {
  response.cookies.set(REVEAL_COOKIE, createRevealTicket(email, birthDate, secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/subscribe-aura-spectrum',
    maxAge: Math.floor(REVEAL_TTL_MS / 1000),
  })
}

export async function GET(request: NextRequest) {
  try {
    const secret = process.env.RESEND_API_KEY
    const birthDate = request.nextUrl.searchParams.get('birthDate') || ''
    const token = request.cookies.get(REVEAL_COOKIE)?.value
    if (!secret || !token || !birthDate) {
      return NextResponse.json({ success: false, subscribed: false }, { status: 401 })
    }

    const ticket = verifyRevealTicket(token, birthDate, secret)
    if (!ticket) {
      return NextResponse.json({ success: false, subscribed: false }, { status: 401 })
    }

    const result = calculatePrimaryResult(ticket.birthDate)
    const blendHex = blendTwoPrimaryHex(result.zodiacHue1.hex, result.birthstone.hex)
    const response = NextResponse.json({
      success: true,
      subscribed: true,
      emailSent: false,
      birthDate: result.birthDate,
      primaryHueName: readableName(result.zodiacHue1.name),
      primaryHueHex: result.zodiacHue1.hex,
      birthstoneName: result.birthstone.name,
      birthstoneHex: result.birthstone.hex,
      birthstoneOpacityPercent: result.birthstone.opacityPercent,
      blendHex,
    })
    setRevealCookie(response, ticket.email, result.birthDate, secret)
    return response
  } catch (error) {
    console.error('[Aura-Spectrum ticket restore]', error)
    return NextResponse.json({ success: false, subscribed: false }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const birthDate = typeof body?.birthDate === 'string' ? body.birthDate : ''
    const generatedAt = typeof body?.generatedAt === 'string' ? body.generatedAt : ''
    const consent = body?.consent === true

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !birthDate || !consent) {
      return NextResponse.json(
        { error: 'A valid email, a saved birthdate, and email-subscription consent are required.' },
        { status: 400 }
      )
    }

    const snapshotTime = /^\d{4}-\d{2}-\d{2}$/.test(generatedAt)
      ? new Date(`${generatedAt}T12:00:00.000Z`)
      : generatedAt ? new Date(generatedAt) : new Date()
    if (!Number.isFinite(snapshotTime.getTime()) || snapshotTime.getTime() > Date.now() + 5 * 60_000) {
      return NextResponse.json({ error: 'The reading date is invalid. Please recalculate and try again.' }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY
    const audienceId = process.env.RESEND_AUDIENCE_ID
    const emailFrom = process.env.EMAIL_FROM
    const missing = [
      !apiKey ? 'RESEND_API_KEY' : '',
      !audienceId ? 'RESEND_AUDIENCE_ID' : '',
      !emailFrom ? 'EMAIL_FROM' : '',
    ].filter(Boolean)

    if (!apiKey || !audienceId || !emailFrom) {
      return NextResponse.json(
        { error: 'AuraSpanse email signup is not configured. Set these Render environment variables: ' + missing.join(', ') + '.' },
        { status: 503 }
      )
    }

    // Recreate the reading shown in the browser, then synthesize one personal
    // definition from the zodiac triad, time-weighted fourth color, and Hue 1 result.
    const result = calculatePrimaryResult(birthDate, snapshotTime)
    const personalized = await generatePersonalizedEmotionReading([
      ...result.zodiac.traitChannels.map((trait) => ({ name: trait.name, hex: trait.hex })),
      result.currentPlacement,
      { name: result.zodiacHue1.name, hex: result.zodiacHue1.hex },
    ])

    // Add the address to the configured Resend audience before producing the blend.
    // The blend does not get returned to the browser unless the audience reports that
    // the contact is subscribed, or that contact is already subscribed.
    const resend = new Resend(apiKey)
    let subscribed = false
    const created = await resend.contacts.create({
      email,
      audienceId,
      unsubscribed: false,
    })

    if (!created.error) {
      subscribed = true
    } else {
      // A previously subscribed address may already exist. Confirm the contact status
      // rather than treating every create conflict as a successful subscription.
      const listed = await resend.contacts.list({ audienceId })
      const payload = listed.data as unknown as {
        data?: Array<{ id?: string; email?: string; unsubscribed?: boolean }>
      } | null
      const existing = payload?.data?.find((contact) => contact.email?.toLowerCase() === email)

      if (existing?.id && existing.unsubscribed === false) {
        subscribed = true
      } else if (existing?.id && existing.unsubscribed === true) {
        const updated = await resend.contacts.update({
          audienceId,
          id: existing.id,
          unsubscribed: false,
        })
        if (!updated.error) subscribed = true
      }

      if (!subscribed) {
        return NextResponse.json(
          { error: 'Resend could not confirm this email as subscribed. Check the audience configuration and try again.' },
          { status: 502 }
        )
      }
    }

    if (!subscribed) {
      return NextResponse.json({ error: 'Subscription was not confirmed.' }, { status: 502 })
    }

    // Only after the mailing-list confirms subscription do the two separate primaries blend.
    const blendHex = blendTwoPrimaryHex(result.zodiacHue1.hex, result.birthstone.hex)
    let emailSent = false
    const firstHueName = readableName(result.zodiacHue1.name)
    const secondHueName = result.birthstone.name
    const generatedAtLabel = escapeHtml(result.currentDate)
    const emotionCards = personalized.components.map((component) => `
      <div style="border:1px solid ${component.hex}66;border-radius:12px;padding:12px;background:#101018">
        <div style="height:54px;border-radius:7px;background:${component.hex};margin-bottom:9px"></div>
        <strong style="color:${component.hex}">${escapeHtml(readableName(component.sourceName))}</strong>
        <p style="font-size:12px;color:#bfc0ce;margin:6px 0 0">${escapeHtml(component.emotion)} · ${escapeHtml(component.hex)}</p>
      </div>`).join('')

    try {
      const message = await resend.emails.send({
        from: emailFrom,
        to: email,
        subject: `Your personal AuraSpanse reading: ${personalized.title}`,
        text: [
          'Your personalized AuraSpanse reading: ' + personalized.title,
          '',
          personalized.definition,
          '',
          'Reading snapshot: ' + result.currentDate,
          ...personalized.components.map((component) => `${component.emotion} — ${component.hex}`),
          '',
          'Primary Hue 1 — ' + firstHueName,
          'Hue 1 equally blends the positive, neutral, and shadow zodiac colors with the fourth time-weighted current-placement color.',
          'Primary Hue 2 — ' + secondHueName,
          'Your combined hue is shown below.',
          '',
          'The combined hue is the equal-weight RGB blend of Primary Hue 1 and the literal birthstone Primary Hue 2.',
          'The AuraSpanse model is a symbolic tool for entertainment and personal reflection.',
          'Future AuraScope updates will be sent to this subscribed email address.',
        ].join('\n'),
        html: `
          <div style="max-width:620px;margin:0 auto;padding:32px;background:#0a0a12;color:#f3f0eb;font-family:Arial,sans-serif">
            <p style="font-size:11px;letter-spacing:3px;color:#aaa">AURASPANSE · AURA-SPECTRUM</p>
            <h1 style="font-weight:400;line-height:1.2">Your two-primary reveal</h1>
            <p style="color:#c9e0d8">Personalized reading snapshot · ${generatedAtLabel}</p>
            <h2 style="font-family:Georgia,serif;font-weight:400;color:#d9c9ff">${escapeHtml(personalized.title)}</h2>
            <p style="line-height:1.75;color:#e3e0eb">${escapeHtml(personalized.definition)}</p>
            <h2 style="margin-top:24px">Five emotion colors in this reading</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:10px">${emotionCards}</div>
            <p style="margin-top:18px;color:#c9e0d8">Subscription confirmed.</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
              <div style="border:1px solid #ffffff22;border-radius:14px;padding:14px">
                <div style="height:72px;border-radius:8px;background:${result.zodiacHue1.hex}"></div>
                <h2 style="font-size:16px">${escapeHtml(firstHueName)}</h2>
                <p>Primary Hue 1 · four-color zodiac/time blend</p>
              </div>
              <div style="border:1px solid #ffffff22;border-radius:14px;padding:14px">
                <div style="height:72px;border-radius:8px;background:${result.birthstone.hex}"></div>
                <h2 style="font-size:16px">${escapeHtml(secondHueName)}</h2>
                <p>Primary Hue 2 · natural stone color</p>
                <p style="font-size:12px;color:#bfc0ce">Geographic opacity: ${result.birthstone.opacityPercent.toFixed(1)}%</p>
              </div>
            </div>
            <h2 style="margin-top:28px">Your combined hue</h2>
            <div style="height:136px;border-radius:14px;background:${blendHex};border:1px solid #ffffff33"></div>
            <p><strong>Your two colors are now blended.</strong></p>
            <p style="line-height:1.7;color:#d2d2dc">Primary Hue 1 is the equal-weight blend of the positive, neutral, and shadow zodiac colors plus the fourth time-weighted placement color. The final color equally blends that Hue 1 with the literal birthstone Hue 2.</p>
            <p style="font-size:12px;line-height:1.6;color:#888">AuraSpanse is a symbolic tool for entertainment and personal reflection, not a scientifically validated measure of personality or emotional state. You subscribed to AuraScope email updates; future list mailings should provide an unsubscribe option.</p>
          </div>
        `,
      })
      emailSent = !message.error
    } catch (error) {
      console.error('[Aura-Spectrum reading email]', error)
    }

    const response = NextResponse.json({
      success: true,
      subscribed: true,
      emailSent,
      birthDate: result.birthDate,
      primaryHueName: firstHueName,
      primaryHueHex: result.zodiacHue1.hex,
      birthstoneName: secondHueName,
      birthstoneHex: result.birthstone.hex,
      birthstoneOpacityPercent: result.birthstone.opacityPercent,
      blendHex,
      personalizedReading: { title: personalized.title, definition: personalized.definition },
      generatedAt: result.currentDate,
    })
    // Persist a signed, HttpOnly ticket so a confirmed subscriber can restore the
    // reveal after refresh. The client cannot unlock it by editing localStorage.
    setRevealCookie(response, email, result.birthDate, apiKey)
    return response
  } catch (error) {
    if (error instanceof PersonalizedReadingError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[Aura-Spectrum subscription]', error)
    return NextResponse.json({ error: 'AuraSpanse could not confirm the subscription. Please try again.' }, { status: 500 })
  }
}
