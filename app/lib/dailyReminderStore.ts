import { randomBytes } from "node:crypto";

export type DailyReminderSubscriber = {
  id: string;
  email: string;
  unsubscribe_token: string;
  last_sent_at: string | null;
};

export function getSupabaseAdminConfig(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const key =
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return { url, key };
}

export async function supabaseAdminFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const config = getSupabaseAdminConfig();
  if (!config) throw new Error("Supabase server configuration is missing");
  const headers = new Headers(init.headers);
  headers.set("apikey", config.key);
  headers.set("Authorization", "Bearer " + config.key);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return fetch(config.url + "/rest/v1/" + path, { ...init, headers, cache: "no-store" });
}

export function getAppBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.BASE_URL || "https://auraspanse.onrender.com";
  try {
    const normalized = /^https?:\/\//i.test(configured) ? configured : "https://" + configured;
    return new URL(normalized).origin;
  } catch {
    return "https://auraspanse.onrender.com";
  }
}

export function makeToken(): string {
  return randomBytes(32).toString("hex");
}

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

export function htmlNoticePage(title: string, message: string): string {
  const appUrl = getAppBaseUrl();
  return "<!doctype html><html lang=\"en\"><meta charset=\"utf-8\">" +
    "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">" +
    "<title>" + escapeHtml(title) + " — AuraSpanse</title>" +
    "<body style=\"margin:0;background:#0c0b13;color:#f7f3ff;font:16px/1.6 system-ui,sans-serif\">" +
    "<main style=\"max-width:620px;margin:10vh auto;padding:32px 24px\">" +
    "<p style=\"letter-spacing:.16em;font-size:11px;color:#b9a7ff;text-transform:uppercase\">AURASPANSE · DAILY AURASCOPE</p>" +
    "<h1 style=\"font-size:clamp(28px,5vw,40px);line-height:1.1\">" + escapeHtml(title) + "</h1>" +
    "<p style=\"color:#d3cfe0\">" + escapeHtml(message) + "</p>" +
    "<a style=\"display:inline-block;margin-top:14px;padding:12px 18px;border-radius:999px;background:#b8a2ff;color:#171225;text-decoration:none;font-weight:700\" href=\"" +
    escapeHtml(appUrl) + "\">Return to AuraSpanse</a></main></body></html>";
}
