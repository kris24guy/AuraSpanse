import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getAppBaseUrl, getSupabaseAdminConfig, supabaseAdminFetch, type DailyReminderSubscriber } from "../../../lib/dailyReminderStore";

export const maxDuration = 300;
function authorized(req: NextRequest, expected: string): boolean {
  return req.headers.get("authorization") === "Bearer " + expected;
}

export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return NextResponse.json({ error: "Daily reminder scheduler is not configured." }, { status: 503 });
  if (!authorized(req, cronSecret)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !getSupabaseAdminConfig()) {
    return NextResponse.json({ error: "Daily reminder delivery is not configured." }, { status: 503 });
  }

  try {
    // Fetch all subscribers before delivery updates so pagination remains stable.
    const subscribers: DailyReminderSubscriber[] = [];
    const pageSize = 1000;
    let offset = 0;
    while (offset < 10000) {
      const params = new URLSearchParams({
        select: "id,email,unsubscribe_token,last_sent_at",
        confirmed_at: "not.is.null",
        unsubscribed_at: "is.null",
        order: "created_at.asc",
        limit: String(pageSize),
        offset: String(offset),
      });
      const response = await supabaseAdminFetch("aurascope_daily_reminders?" + params.toString());
      if (!response.ok) {
        console.error("Daily reminder list fetch failed with status " + response.status);
        return NextResponse.json({ error: "Could not load the reminder list." }, { status: 503 });
      }
      const page = (await response.json()) as DailyReminderSubscriber[];
      subscribers.push(...page);
      if (page.length < pageSize) break;
      offset += page.length;
    }

    const now = new Date();
    const nowMs = now.getTime();
    const minimumIntervalMs = 23 * 60 * 60 * 1000;
    const appUrl = getAppBaseUrl();
    const resend = new Resend(apiKey);
    let sent = 0, failed = 0, skipped = 0;

    for (const subscriber of subscribers) {
      if (subscriber.last_sent_at && nowMs - Date.parse(subscriber.last_sent_at) < minimumIntervalMs) {
        skipped++;
        continue;
      }

      const unsubscribeUrl = appUrl + "/api/newsletter/unsubscribe?token=" + encodeURIComponent(subscriber.unsubscribe_token);
      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM || "AuraSpanse <auraspanse@gmail.com>",
        to: subscriber.email,
        subject: "Your daily Aurascope check-in",
        html:
          "<div style=\"margin:0;background:#0c0b13;color:#f7f3ff;padding:36px 20px;font:16px/1.6 system-ui,sans-serif\"><div style=\"max-width:560px;margin:auto\">" +
          "<p style=\"font-size:11px;letter-spacing:.18em;color:#b9a7ff\">AURASPANSE · DAILY AURASCOPE</p>" +
          "<h1 style=\"font-size:32px;line-height:1.15\">A moment for your aura.</h1>" +
          "<p style=\"color:#d6d0e5\">Your daily reminder is here. Take a breath, return to AuraSpanse, and check in with your aura. Notice what feels different today.</p>" +
          "<p style=\"margin:28px 0\"><a href=\"" + appUrl + "\" style=\"display:inline-block;background:#b8a2ff;color:#171225;text-decoration:none;padding:13px 20px;border-radius:999px;font-weight:700\">Check my aura</a></p>" +
          "<p style=\"font-size:13px;color:#a8a1ba\">You subscribed to daily Aurascope reminder emails. To stop them, <a style=\"color:#d0c3ff\" href=\"" +
          unsubscribeUrl + "\">unsubscribe here</a>.</p></div></div>",
        text: "Your daily Aurascope check-in\n\nTake a breath, return to AuraSpanse, and check in with your aura: " + appUrl +
          "\n\nStop daily reminders: " + unsubscribeUrl,
        headers: {
          "List-Unsubscribe": "<" + unsubscribeUrl + ">",
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });

      if (result.error) {
        failed++;
        console.error("A daily Aurascope reminder email failed to send.");
        continue;
      }

      const updateParams = new URLSearchParams({ id: "eq." + subscriber.id });
      const update = await supabaseAdminFetch("aurascope_daily_reminders?" + updateParams.toString(), {
        method: "PATCH", headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ last_sent_at: now.toISOString() }),
      });
      if (!update.ok) {
        failed++;
        console.error("A daily reminder was sent, but its delivery timestamp could not be saved.");
        continue;
      }
      sent++;
    }

    return NextResponse.json({ ok: failed === 0, sent, failed, skipped, activeSubscribersLoaded: subscribers.length });
  } catch {
    console.error("Daily Aurascope reminder run failed unexpectedly");
    return NextResponse.json({ error: "Daily reminder run failed." }, { status: 500 });
  }
}
