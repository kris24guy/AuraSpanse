import { NextResponse } from "next/server";

/**
 * This endpoint previously accepted caller-controlled recipient, subject, and
 * HTML and passed them directly to the email provider. That made it a
 * general-purpose email-sending endpoint. Keep it disabled until a narrowly
 * scoped, validated use case with abuse controls is implemented.
 */
export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: "This email endpoint is temporarily disabled.",
    },
    { status: 410 }
  );
}
