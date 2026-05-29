// app/api/send-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.EMAIL_FROM || "Aurascope <auraspanse@gmail.com>";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, html } = body as {
      to: string;
      subject: string;
      html: string;
    };

    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error", error);
      return NextResponse.json(
        { ok: false, error: error.message || "Failed to send email" },
        { status: 500 }
      );
    }

    // At this point TypeScript knows `data` is not null, but
    // we still guard in case the SDK shape changes.
    return NextResponse.json({
      ok: true,
      id: (data as { id?: string }).id ?? null,
    });
  } catch (err: any) {
    console.error("Send email error", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
