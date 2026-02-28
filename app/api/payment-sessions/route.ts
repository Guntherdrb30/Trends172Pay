import { NextRequest, NextResponse } from "next/server";
import {
  getMerchantByApiKey,
  getMerchantByBusinessCode
} from "@/lib/merchantAppStore";
import {
  createSession,
  getSessionByMerchantAndIdempotencyKey
} from "@/lib/paymentSessionStore";

// POST /api/payment-sessions
// Endpoint interno para crear PaymentSessions:
// - Auth recomendada: x-api-key del comercio.
// - Auth alternativa (integraciones internas): x-internal-token + businessCode.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiKey = request.headers.get("x-api-key");
    const internalToken = request.headers.get("x-internal-token");
    const expectedInternalToken = process.env.INTERNAL_API_TOKEN;
    const idempotencyKey = request.headers
      .get("idempotency-key")
      ?.trim()
      .slice(0, 128);

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
            "Faltan campos obligatorios: originSystem, amount, currency, description, successUrl, cancelUrl."
        },
        { status: 400 }
      );
    }

    let merchant = null;

    if (apiKey) {
      merchant = await getMerchantByApiKey(apiKey);
      if (!merchant) {
        return NextResponse.json(
          { error: "x-api-key inválida o MerchantApp no encontrado." },
          { status: 401 }
        );
      }
    } else {
      if (!expectedInternalToken) {
        return NextResponse.json(
          {
            error:
              "INTERNAL_API_TOKEN no está configurado y x-api-key no fue enviada."
          },
          { status: 500 }
        );
      }

      if (!internalToken || internalToken !== expectedInternalToken) {
        return NextResponse.json(
          {
            error:
              "No autorizado. Usa x-api-key del comercio o x-internal-token válido."
          },
          { status: 401 }
        );
      }

      if (!businessCode) {
        return NextResponse.json(
          { error: "Con x-internal-token se requiere businessCode." },
          { status: 400 }
        );
      }

      merchant = await getMerchantByBusinessCode(businessCode);
      if (!merchant) {
        return NextResponse.json(
          {
            error: `No se encontró MerchantApp con businessCode "${businessCode}".`
          },
          { status: 400 }
        );
      }
    }

    if (idempotencyKey) {
      const existing = await getSessionByMerchantAndIdempotencyKey(
        merchant.id,
        idempotencyKey
      );
      if (existing) {
        const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
        return NextResponse.json(
          {
            sessionId: existing.id,
            checkoutUrl: `${baseUrl.replace(/\/$/, "")}/pay?sessionId=${existing.id}`,
            reused: true
          },
          { status: 200 }
        );
      }
    }

    let session;
    try {
      session = await createSession({
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
        bankPaymentId: undefined,
        providerCode: merchant.defaultProviderCode ?? "mercantil",
        idempotencyKey
      });
    } catch (error) {
      if (
        idempotencyKey &&
        error instanceof Error &&
        error.message.includes("idx_payment_sessions_merchant_idempotency")
      ) {
        const existing = await getSessionByMerchantAndIdempotencyKey(
          merchant.id,
          idempotencyKey
        );
        if (existing) {
          const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
          return NextResponse.json(
            {
              sessionId: existing.id,
              checkoutUrl: `${baseUrl.replace(/\/$/, "")}/pay?sessionId=${existing.id}`,
              reused: true
            },
            { status: 200 }
          );
        }
      }
      throw error;
    }

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
      { error: "Error interno al crear la sesión de pago." },
      { status: 500 }
    );
  }
}
