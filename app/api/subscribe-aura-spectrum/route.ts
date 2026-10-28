import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { AURA_SPECTRUM_PRIMARY_POINTS } from '../../../lib/auraSpectrumCycloneData'
import { getBirthstoneResonance } from '../../../lib/birthstoneResonance'
import { generateOriginSpectrum } from '../../../lib/originSpectrumEngine'
import { getZodiacSign, zodiacMap } from '../../../lib/zodiacMap'

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
    if (!/^[0-9a-fA-F]{6}$/.test(clean)) throw new Error('Primary hue is not a valid hex color.')
    return [0, 2, 4].map((offset) => Number.parseInt(clean.slice(offset, offset + 2), 16))
  }
  const first = read(firstHex)
  const second = read(secondHex)
  return '#' + first.map((value, index) =>
    Math.round((value + second[index]) / 2).toString(16).padStart(2, '0')
  ).join('')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const birthDate = typeof body?.birthDate === 'string' ? body.birthDate : ''
    const consent = body?.consent === true

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !birthDate || !consent) {
      return NextResponse.json(
        { error: 'A valid email, a saved birthdate, and email-subscription consent are required.' },
        { status: 400 }
      )
    }

    const apiKey = process.env.RESEND_API_KEY
    const audienceId = process.env.RESEND_AUDIENCE_ID
    const emailFrom = process.env.EMAIL_FROM
    const missing = [
      !apiKey ? 'RESEND_API_KEY' : '',
      !audienceId ? 'RESEND_AUDIENCE_ID' : '',
      !emailFrom ? 'EMAIL_FROM' : '',
    ].filter(Boolean)

    if (missing.length) {
      return NextResponse.json(
        { error: 'AuraSpanse email signup is not configured. Set these Render environment variables: ' + missing.join(', ') + '.' },
        { status: 503 }
      )
    }

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

    // Only now run the reveal for this request. The existing engine supplies the same
    // age-derived first hue and literal birthstone second hue used by the public page.
    const result = generateOriginSpectrum(birthDate, {
      now: new Date(),
      spectrum: AURA_SPECTRUM_PRIMARY_POINTS,
      zodiacMap,
      resolveZodiacSign: (date) => getZodiacSign(date),
      getBirthstoneResonance,
      includeComposite: false,
    })

    // The only post-subscription blend is the equal-weight RGB average of the two primaries.
    const blendHex = blendTwoPrimaryHex(result.firstHue.hex, result.birthstone.hex)
    let emailSent = false
    const firstHueName = readableName(result.firstHue.name)
    const secondHueName = result.birthstone.name

    try {
      const message = await resend.emails.send({
        from: emailFrom,
        to: email,
        subject: 'Your AuraSpanse two-primary reveal',
        text: [
          'Your AuraSpanse subscription is confirmed.',
          '',
          'Primary Hue 1 — ' + firstHueName + ': ' + result.firstHue.hex,
          'Primary Hue 2 — ' + secondHueName + ': ' + result.birthstone.hex,
          'Your combined hue — ' + blendHex,
          '',
          'The combined hue is the equal-weight RGB blend of the two primaries only.',
          'The AuraSpanse model is a symbolic tool for entertainment and personal reflection.',
          'Future AuraScope updates will be sent to this subscribed email address.',
        ].join('\n'),
        html: `
          <div style="max-width:620px;margin:0 auto;padding:32px;background:#0a0a12;color:#f3f0eb;font-family:Arial,sans-serif">
            <p style="font-size:11px;letter-spacing:3px;color:#aaa">AURASPANSE · AURA-SPECTRUM</p>
            <h1 style="font-weight:400;line-height:1.2">Your two-primary reveal</h1>
            <p style="color:#c9e0d8">Subscription confirmed.</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
              <div style="border:1px solid #ffffff22;border-radius:14px;padding:14px">
                <div style="height:72px;border-radius:8px;background:${result.firstHue.hex}"></div>
                <h2 style="font-size:16px">${escapeHtml(firstHueName)}</h2>
                <p>${escapeHtml(result.firstHue.hex)} · Primary Hue 1</p>
              </div>
              <div style="border:1px solid #ffffff22;border-radius:14px;padding:14px">
                <div style="height:72px;border-radius:8px;background:${result.birthstone.hex}"></div>
                <h2 style="font-size:16px">${escapeHtml(secondHueName)}</h2>
                <p>${escapeHtml(result.birthstone.hex)} · Primary Hue 2</p>
                <p style="font-size:12px;color:#bfc0ce">Geographic opacity: ${result.birthstone.opacityPercent.toFixed(1)}%</p>
              </div>
            </div>
            <h2 style="margin-top:28px">Your combined hue</h2>
            <div style="height:136px;border-radius:14px;background:${blendHex};border:1px solid #ffffff33"></div>
            <p><strong>${escapeHtml(blendHex)}</strong></p>
            <p style="line-height:1.7;color:#d2d2dc">This color is the equal-weight RGB average of Primary Hue 1 and Primary Hue 2 only. The zodiac frame and current placement remain contextual and are not added as extra blend ingredients.</p>
            <p style="font-size:12px;line-height:1.6;color:#888">AuraSpanse is a symbolic tool for entertainment and personal reflection, not a scientifically validated measure of personality or emotional state. You subscribed to AuraScope email updates; future list mailings should provide an unsubscribe option.</p>
          </div>
        `,
      })
      emailSent = !message.error
    } catch (error) {
      console.error('[Aura-Spectrum reading email]', error)
    }

    return NextResponse.json({
      success: true,
      subscribed: true,
      emailSent,
      birthDate: result.birthDate,
      primaryHueName: firstHueName,
      primaryHueHex: result.firstHue.hex,
      birthstoneName: secondHueName,
      birthstoneHex: result.birthstone.hex,
      birthstoneOpacityPercent: result.birthstone.opacityPercent,
      blendHex,
    })
  } catch (error) {
    console.error('[Aura-Spectrum subscription]', error)
    return NextResponse.json({ error: 'AuraSpanse could not confirm the subscription. Please try again.' }, { status: 500 })
  }
}
