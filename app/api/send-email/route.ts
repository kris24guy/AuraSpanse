// app/api/send-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.EMAIL_FROM || "Aurascope <auraspanse@gmail.com>";

export async function POST(req: NextRequest) {
  try {
    const { to, subject, html } = await req.json();

    const data = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
    });

    return NextResponse.json({ ok: true, id: data.id });
  } catch (err: any) {
    console.error("Send email error", err);
    return NextResponse.json(
      { ok: false, error: err.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
On the client, hit it like this:

await fetch("/api/send-email", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    to: "profarkler@gmail.com",
    subject: "Test from AuraSpanse",
    html: "<p>It works.</p>",
  }),
});
