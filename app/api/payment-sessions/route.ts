import { NextRequest, NextResponse } from "next/server";
import { getMerchantByBusinessCode } from "@/lib/merchantAppStore";
import { createSession } from "@/lib/paymentSessionStore";

// POST /api/payment-sessions
// Endpoint interno para crear PaymentSessions desde sistemas propios.
// - Recibe un payload con businessCode y datos del pago.
// - Busca el MerchantApp asociado al businessCode.
// - Crea la PaymentSession asociándola a ese negocio.
// - Devuelve el sessionId y una checkoutUrl basada en BASE_URL.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      businessCode,
      originSystem,
      amount,
      currency,
      description,
      customerName,
      customerEmail,
      successUrl,
      cancelUrl,
      externalOrderId
    } = body ?? {};

    if (
      !businessCode ||
      !originSystem ||
      typeof amount !== "number" ||
      !currency ||
      !description ||
      !successUrl ||
      !cancelUrl
    ) {
      return NextResponse.json(
        {
          error:
            "Faltan campos obligatorios: businessCode, originSystem, amount, currency, description, successUrl, cancelUrl."
        },
        { status: 400 }
      );
    }

    const merchant = await getMerchantByBusinessCode(businessCode);
    if (!merchant) {
      return NextResponse.json(
        {
          error: `No se encontró MerchantApp con businessCode "${businessCode}".`
        },
        { status: 400 }
      );
    }

    const session = await createSession({
      merchantAppId: merchant.id,
      originSystem,
      amount,
      currency,
      description,
      customerName,
      customerEmail,
      successUrl,
      cancelUrl,
      externalOrderId,
      bankPaymentId: undefined
    });

    const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
    const checkoutUrl = `${baseUrl.replace(/\/$/, "")}/pay?sessionId=${
      session.id
    }`;

    return NextResponse.json(
      {
        sessionId: session.id,
        checkoutUrl
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear PaymentSession:", error);
    return NextResponse.json(
      {
        error: "Error interno al crear la sesión de pago."
      },
      { status: 500 }
    );
  }
}
