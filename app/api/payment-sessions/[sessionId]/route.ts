import { NextRequest, NextResponse } from "next/server";
import { getSessionById } from "@/lib/paymentSessionStore";
import {
  getMerchantById,
  getMerchantByBusinessCode
} from "@/lib/merchantAppStore";
import type { PaymentSession, MerchantApp } from "@/types/payment";

type CheckoutResponse = {
  session: PaymentSession;
  merchant: {
    id: string;
    businessCode: string;
    displayName: string;
    logoUrl?: string;
  } | null;
};

// GET /api/payment-sessions/[sessionId]
// Endpoint interno para obtener la información necesaria para el checkout
// alojado (/pay). Devuelve la PaymentSession y un resumen del MerchantApp
// asociado (si existe).
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    const session = await getSessionById(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: `PaymentSession con id "${sessionId}" no encontrada.` },
        { status: 404 }
      );
    }

    let merchant: MerchantApp | null = null;

    if (session.merchantAppId) {
      merchant = await getMerchantById(session.merchantAppId);
    }

    if (!merchant && session.businessCode) {
      merchant = await getMerchantByBusinessCode(session.businessCode);
    }

    const payload: CheckoutResponse = {
      session,
      merchant: merchant
        ? {
            id: merchant.id,
            businessCode: merchant.businessCode,
            displayName: merchant.displayName,
            logoUrl: merchant.logoUrl
          }
        : null
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error(
      "Error en GET /api/payment-sessions/[sessionId]:",
      error
    );
    return NextResponse.json(
      { error: "Error interno al obtener la sesión de pago." },
      { status: 500 }
    );
  }
}


