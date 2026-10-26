import { NextRequest } from "next/server";
import {
  escapeHtml, getAppBaseUrl, getSupabaseAdminConfig, htmlNoticePage, supabaseAdminFetch,
} from "../../../lib/dailyReminderStore";

type UnsubscribeRow = { id: string };
function validToken(token: string): boolean { return /^[a-f0-9]{64}$/i.test(token); }

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") || "";
  const headers = { "Content-Type": "text/html; charset=utf-8" };
  if (!validToken(token)) {
    return new Response(htmlNoticePage("Unsubscribe link not recognized", "This unsubscribe link is invalid or incomplete."), { status: 400, headers });
  }
  const action = getAppBaseUrl() + "/api/newsletter/unsubscribe?token=" + encodeURIComponent(token);
  const html = "<!doctype html><html lang=\"en\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">" +
    "<title>Unsubscribe — AuraSpanse</title><body style=\"margin:0;background:#0c0b13;color:#f7f3ff;font:16px/1.6 system-ui,sans-serif\">" +
    "<main style=\"max-width:620px;margin:10vh auto;padding:32px 24px\"><p style=\"letter-spacing:.16em;font-size:11px;color:#b9a7ff\">AURASPANSE · DAILY AURASCOPE</p>" +
    "<h1 style=\"font-size:clamp(28px,5vw,40px);line-height:1.1\">Unsubscribe from daily reminders?</h1>" +
    "<p style=\"color:#d3cfe0\">Confirm below to stop Daily Aurascope reminder emails.</p>" +
    "<form method=\"post\" action=\"" + escapeHtml(action) + "\"><button type=\"submit\" style=\"margin-top:14px;padding:12px 18px;border:0;border-radius:999px;background:#b8a2ff;color:#171225;font-weight:700;cursor:pointer\">Unsubscribe me</button></form>" +
    "<p style=\"font-size:13px;color:#a8a1ba;margin-top:20px\">You can sign up again from AuraSpanse whenever you choose.</p></main></body></html>";
  return new Response(html, { status: 200, headers });
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  let token = url.searchParams.get("token") || "";
  if (!token) {
    try { const form = await req.formData(); token = String(form.get("token") || ""); }
    catch { /* One-click email clients include the token in the URL query. */ }
  }

  const headers = { "Content-Type": "text/html; charset=utf-8" };
  if (!validToken(token)) {
    return new Response(htmlNoticePage("Unsubscribe link not recognized", "This unsubscribe link is invalid or incomplete."), { status: 400, headers });
  }
  if (!getSupabaseAdminConfig()) {
    return new Response(htmlNoticePage("Temporarily unavailable", "The reminder service is not configured yet."), { status: 503, headers });
  }

  try {
    const params = new URLSearchParams({ unsubscribe_token: "eq." + token, select: "id", limit: "1" });
    const lookup = await supabaseAdminFetch("aurascope_daily_reminders?" + params.toString());
    if (!lookup.ok) throw new Error("Unsubscribe lookup failed");
    const rows = (await lookup.json()) as UnsubscribeRow[];
    const row = rows[0];
    if (!row) {
      return new Response(htmlNoticePage("Already handled", "This link is invalid or the address has already been removed from the reminder list."), { status: 200, headers });
    }
    const updateParams = new URLSearchParams({ id: "eq." + row.id });
    const update = await supabaseAdminFetch("aurascope_daily_reminders?" + updateParams.toString(), {
      method: "PATCH", headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ unsubscribed_at: new Date().toISOString(), confirmation_token: null }),
    });
    if (!update.ok) throw new Error("Unsubscribe update failed");
    return new Response(htmlNoticePage("You've been unsubscribed", "Daily Aurascope reminders have been stopped for this address."), { status: 200, headers });
  } catch {
    console.error("Daily reminder unsubscribe failed");
    return new Response(htmlNoticePage("We couldn't unsubscribe you", "Please try this link again. If the problem continues, contact AuraSpanse support."), { status: 503, headers });
  }
}
