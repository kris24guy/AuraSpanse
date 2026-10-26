import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  escapeHtml, getAppBaseUrl, getSupabaseAdminConfig, makeToken, supabaseAdminFetch,
} from "../../../lib/dailyReminderStore";

type ExistingRow = {
  id: string; email: string; confirmation_token: string | null; unsubscribe_token: string;
  confirmed_at: string | null; unsubscribed_at: string | null;
};

export async function POST(req: NextRequest) {
  let body: { email?: unknown; consent?: unknown };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 }); }

  if (body.consent !== true) {
    return NextResponse.json({ error: "Please consent to daily reminder emails before signing up." }, { status: 400 });
  }
  if (typeof body.email !== "string") {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const email = body.email.trim();
  const normalized = email.toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !getSupabaseAdminConfig()) {
    return NextResponse.json({ error: "Daily reminders are not configured yet. Please try again later." }, { status: 503 });
  }

  try {
    const params = new URLSearchParams({
      email_normalized: "eq." + normalized,
      select: "id,email,confirmation_token,unsubscribe_token,confirmed_at,unsubscribed_at",
      limit: "1",
    });
    const lookup = await supabaseAdminFetch("aurascope_daily_reminders?" + params.toString());
    if (!lookup.ok) {
      console.error("Daily reminder list lookup failed with status " + lookup.status);
      return NextResponse.json({ error: "We couldn't start your signup. Please try again shortly." }, { status: 503 });
    }

    const found = (await lookup.json()) as ExistingRow[];
    const existing = found[0];
    if (existing?.confirmed_at && !existing.unsubscribed_at) {
      return NextResponse.json({ ok: true, message: "This address is already confirmed for Daily Aurascope reminders." });
    }

    const confirmationToken = makeToken();
    const unsubscribeToken = existing?.unsubscribe_token || makeToken();
    const row = {
      email, email_normalized: normalized, confirmation_token: confirmationToken,
      unsubscribe_token: unsubscribeToken, confirmed_at: null, unsubscribed_at: null,
      consented_at: new Date().toISOString(),
    };

    let write: Response;
    if (existing) {
      const updateParams = new URLSearchParams({ id: "eq." + existing.id });
      write = await supabaseAdminFetch("aurascope_daily_reminders?" + updateParams.toString(), {
        method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify(row),
      });
    } else {
      write = await supabaseAdminFetch("aurascope_daily_reminders", {
        method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(row),
      });
    }

    if (!write.ok) {
      console.error("Daily reminder signup write failed with status " + write.status);
      return NextResponse.json({ error: "We couldn't save your signup. Please try again shortly." }, { status: write.status === 409 ? 409 : 503 });
    }

    const confirmUrl = getAppBaseUrl() + "/api/newsletter/confirm?token=" + confirmationToken;
    const resend = new Resend(apiKey);
    const sent = await resend.emails.send({
      from: process.env.EMAIL_FROM || "AuraSpanse <auraspanse@gmail.com>",
      to: email,
      subject: "Confirm your Daily Aurascope reminders",
      html:
        "<div style=\"margin:0;background:#0c0b13;color:#f7f3ff;padding:36px 20px;font:16px/1.6 system-ui,sans-serif\"><div style=\"max-width:560px;margin:auto\">" +
        "<p style=\"font-size:11px;letter-spacing:.18em;color:#b9a7ff\">AURASPANSE · DAILY AURASCOPE</p>" +
        "<h1 style=\"font-size:32px;line-height:1.15\">Make room for a daily check-in.</h1>" +
        "<p style=\"color:#d6d0e5\">Confirm your email to receive one gentle daily reminder to return to AuraSpanse and check in with your aura.</p>" +
        "<p style=\"margin:28px 0\"><a href=\"" + confirmUrl + "\" style=\"display:inline-block;background:#b8a2ff;color:#171225;text-decoration:none;padding:13px 20px;border-radius:999px;font-weight:700\">Confirm daily reminders</a></p>" +
        "<p style=\"font-size:13px;color:#a8a1ba\">You asked to receive daily Aurascope reminders at " + escapeHtml(email) +
        ". No daily reminders will be sent until you confirm. If you didn't request this, ignore this message.</p></div></div>",
      text: "Confirm your Daily Aurascope reminders\n\nOpen this link to confirm: " + confirmUrl +
        "\n\nYou will receive one daily reminder to return to AuraSpanse. If you didn't request this, ignore this message.",
    });

    if (sent.error) {
      console.error("Daily reminder confirmation email failed");
      return NextResponse.json({ error: "We saved the signup, but couldn't send the confirmation email. Please submit again shortly." }, { status: 502 });
    }
    return NextResponse.json({ ok: true, message: "Check your inbox for a confirmation link. Daily reminders start after you confirm." });
  } catch {
    console.error("Daily reminder signup failed unexpectedly");
    return NextResponse.json({ error: "We couldn't complete your signup. Please try again shortly." }, { status: 500 });
  }
}
