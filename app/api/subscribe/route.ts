import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { email, birthDate, zodiac, hue1, hue2, hue3 } =
      await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 400 }
      )
    }

    await resend.emails.send({
      from: 'AuraSpanse <onboarding@resend.dev>',
      to: email,
      subject: `Your AuraSpanse Reading — ${zodiac}`,
      html: `
        <div style="background:black;color:white;padding:40px;font-family:sans-serif;">
          <h1 style="font-size:32px;">AuraSpanse Reading</h1>

          <p><strong>Birth Date:</strong> ${birthDate}</p>
          <p><strong>Zodiac:</strong> ${zodiac}</p>

          <hr style="margin:30px 0;border-color:#333;" />

          <h2>Hue One</h2>
          <p>${hue1}</p>

          <h2>Hue Two</h2>
          <p>${hue2}</p>

          <h2>Hue Three</h2>
          <p>${hue3}</p>

          <hr style="margin:30px 0;border-color:#333;" />

          <p>
            Your AuraSpanse spectrum stabilizes uniquely over time through
            emotional frequency weighting and cyclical resonance.
          </p>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
    })
  } catch (err) {
    console.error('[Subscribe error]', err)

    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
