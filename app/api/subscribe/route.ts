import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, birthDate, zodiac, hue1, hue2, hue3 } = await req.json();

    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    // Log for now — replace with Resend/Mailchimp/ConvertKit when ready
    console.log('[Subscribe]', { email, birthDate, zodiac, hue1, hue2, hue3 });

    // ── DROP IN YOUR EMAIL SERVICE HERE ──────────────────────────────
    // Example with Resend:
    //
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'readings@auraspanse.com',
    //   to: email,
    //   subject: `Your AuraSpanse Reading — ${zodiac}`,
    //   html: `<p>Your three hues: ${hue1}, ${hue2}, ${hue3}</p>`,
    // });
    // ─────────────────────────────────────────────────────────────────

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Subscribe error]', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
