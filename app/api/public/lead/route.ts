import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 12;
const leadAttempts = new Map<string, { count: number; firstAt: number }>();

function getClientKey(request: NextRequest): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const ip = xForwardedFor.split(",")[0]?.trim();
    if (ip) return ip;
  }
  return "unknown";
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = leadAttempts.get(key);

  if (!entry) {
    leadAttempts.set(key, { count: 1, firstAt: now });
    return false;
  }

  if (now - entry.firstAt > WINDOW_MS) {
    leadAttempts.set(key, { count: 1, firstAt: now });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  try {
    const clientKey = getClientKey(request);
    if (isRateLimited(clientKey)) {
      return NextResponse.json(
        { ok: false, error: "Demasiadas solicitudes. Intenta de nuevo en unos minutos." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const honeypot = cleanText(body?.website, 255);
    if (honeypot) {
      // Respuesta neutra para no enseñar regla anti-bot.
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const fullName = cleanText(body?.fullName, 120);
    const businessName = cleanText(body?.businessName, 120);
    const email = cleanText(body?.email, 160).toLowerCase();
    const phone = cleanText(body?.phone, 40);
    const monthlyVolume = cleanText(body?.monthlyVolume, 80);
    const message = cleanText(body?.message, 1200);
    const sessionId = cleanText(body?.sessionId, 80);

    if (!fullName || !email) {
      return NextResponse.json(
        { ok: false, error: "Nombre y email son obligatorios." },
        { status: 400 }
      );
    }

    if (!isEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "Email no válido." },
        { status: 400 }
      );
    }

    const rows = await db`
      INSERT INTO public_leads (
        full_name,
        business_name,
        email,
        phone,
        monthly_volume,
        message,
        source,
        metadata
      )
      VALUES (
        ${fullName},
        ${businessName || null},
        ${email},
        ${phone || null},
        ${monthlyVolume || null},
        ${message || null},
        'website',
        ${JSON.stringify({ sessionId, path: body?.path ?? null })}::jsonb
      )
      RETURNING id
    `;

    return NextResponse.json({ ok: true, leadId: rows[0]?.id ?? null }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/public/lead:", error);
    return NextResponse.json(
      { ok: false, error: "No fue posible enviar la solicitud." },
      { status: 500 }
    );
  }
}
