import { NextRequest } from "next/server";
import { getSupabaseAdminConfig, htmlNoticePage, supabaseAdminFetch } from "../../../lib/dailyReminderStore";

type ConfirmationRow = { id: string; unsubscribed_at: string | null };

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") || "";
  const headers = { "Content-Type": "text/html; charset=utf-8" };
  if (!/^[a-f0-9]{64}$/i.test(token)) {
    return new Response(htmlNoticePage("Link not recognized", "This confirmation link is invalid or incomplete."), { status: 400, headers });
  }
  if (!getSupabaseAdminConfig()) {
    return new Response(htmlNoticePage("Temporarily unavailable", "The reminder service is not configured yet."), { status: 503, headers });
  }

  try {
    const params = new URLSearchParams({ confirmation_token: "eq." + token, select: "id,unsubscribed_at", limit: "1" });
    const lookup = await supabaseAdminFetch("aurascope_daily_reminders?" + params.toString());
    if (!lookup.ok) throw new Error("Confirmation lookup failed");
    const rows = (await lookup.json()) as ConfirmationRow[];
    const row = rows[0];
    if (!row || row.unsubscribed_at) {
      return new Response(htmlNoticePage("Link expired", "This confirmation link is invalid or has already been used. Start again from AuraSpanse to request a fresh link."), { status: 400, headers });
    }

    const updateParams = new URLSearchParams({ id: "eq." + row.id, confirmation_token: "eq." + token });
    const update = await supabaseAdminFetch("aurascope_daily_reminders?" + updateParams.toString(), {
      method: "PATCH", headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ confirmed_at: new Date().toISOString(), confirmation_token: null }),
    });
    if (!update.ok) throw new Error("Confirmation update failed");

    return new Response(htmlNoticePage("You're confirmed", "Daily Aurascope reminders are now active. Look for a gentle email each day inviting you back to check your aura."), { status: 200, headers });
  } catch {
    console.error("Daily reminder confirmation failed");
    return new Response(htmlNoticePage("We couldn't confirm you", "Please try the confirmation link again, or request a new link from AuraSpanse."), { status: 503, headers });
  }
}
