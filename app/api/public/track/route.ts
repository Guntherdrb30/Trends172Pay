import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const ALLOWED_EVENTS = new Set([
  "public_home_viewed",
  "video_continue_clicked",
  "learn_more_clicked",
  "demo_started",
  "contract_clicked",
  "whatsapp_clicked",
  "sales_email_clicked",
  "lead_form_submitted"
]);

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  if (!cleaned) return null;
  return cleaned.slice(0, maxLength);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const eventName = cleanText(body?.eventName, 64);

    if (!eventName || !ALLOWED_EVENTS.has(eventName)) {
      return NextResponse.json({ ok: false, error: "Invalid eventName." }, { status: 400 });
    }

    const path = cleanText(body?.path, 300);
    const referrer = cleanText(body?.referrer, 500);
    const sessionId = cleanText(body?.sessionId, 80);
    const metadata =
      body?.metadata && typeof body.metadata === "object" ? body.metadata : null;

    await db`
      INSERT INTO public_tracking_events (
        event_name,
        path,
        referrer,
        session_id,
        source,
        metadata
      )
      VALUES (
        ${eventName},
        ${path},
        ${referrer},
        ${sessionId},
        'website',
        ${metadata ? JSON.stringify(metadata) : null}::jsonb
      )
    `;

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/public/track:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
