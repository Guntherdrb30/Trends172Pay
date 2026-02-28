import { NextRequest, NextResponse } from "next/server";
import {
  getMerchantByBusinessCode,
  getMerchantById
} from "@/lib/merchantAppStore";
import { createSession } from "@/lib/paymentSessionStore";

function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function clampAmount(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(value, 5000));
}

export async function POST(request: NextRequest) {
  try {
    const merchantSessionId = request.cookies.get("merchant_session")?.value;
    const body = (await request.json().catch(() => null)) as
      | {
          amount?: number;
          currency?: string;
          description?: string;
          customerName?: string;
          customerEmail?: string;
        }
      | null;

    const amount = clampAmount(body?.amount);
    const currency = cleanText(body?.currency ?? "USD", 8).toUpperCase() || "USD";
    const description =
      cleanText(body?.description, 200) || "Instalacion de prueba - Boton de pago";
    const customerName = cleanText(body?.customerName, 120);
    const customerEmail = cleanText(body?.customerEmail, 160);

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Monto invalido. Debe ser mayor a 0." },
        { status: 400 }
      );
    }

    let merchant = null;

    if (merchantSessionId) {
      merchant = await getMerchantById(merchantSessionId);
    }

    if (!merchant) {
      const fallbackBusinessCode =
        cleanText(process.env.INSTALLATION_DEMO_BUSINESS_CODE, 60) || "CARPIHOGAR";
      merchant = await getMerchantByBusinessCode(fallbackBusinessCode);
    }

    if (!merchant) {
      return NextResponse.json(
        {
          error:
            "No hay comercio disponible para prueba. Define INSTALLATION_DEMO_BUSINESS_CODE o inicia sesion."
        },
        { status: 404 }
      );
    }

    const baseUrl =
      cleanText(process.env.BASE_URL, 200) || new URL(request.url).origin;
    const normalizedBaseUrl = baseUrl.replace(/\/$/, "");

    const session = await createSession({
      merchantAppId: merchant.id,
      originSystem: "installation_demo_page",
      amount,
      currency,
      description,
      customerName: customerName || undefined,
      customerEmail: customerEmail || undefined,
      successUrl: `${normalizedBaseUrl}/instalacion-prueba?status=success`,
      cancelUrl: `${normalizedBaseUrl}/instalacion-prueba?status=cancelled`,
      externalOrderId: `inst_demo_${Date.now()}`
    });

    return NextResponse.json(
      {
        sessionId: session.id,
        businessCode: merchant.businessCode,
        checkoutUrl: `${normalizedBaseUrl}/pay?sessionId=${session.id}`
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating installation demo session:", error);
    return NextResponse.json(
      { error: "No se pudo crear la sesion de prueba." },
      { status: 500 }
    );
  }
}
