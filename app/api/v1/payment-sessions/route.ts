import { NextRequest, NextResponse } from "next/server";
import { getMerchantByApiKey } from "@/lib/merchantAppStore";
import {
  createSession,
  getSessionByMerchantAndIdempotencyKey,
  listSessions
} from "@/lib/paymentSessionStore";
import type { MerchantApp, PaymentStatus } from "@/types/payment";

async function getAuthenticatedMerchant(request: NextRequest): Promise<{
  merchant: MerchantApp | null;
  response: NextResponse | null;
}> {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey) {
    return {
      merchant: null,
      response: NextResponse.json(
        { error: "Falta el header x-api-key." },
        { status: 401 }
      )
    };
  }

  const merchant = await getMerchantByApiKey(apiKey);
  if (!merchant) {
    return {
      merchant: null,
      response: NextResponse.json(
        { error: "API key inválida o MerchantApp no encontrado." },
        { status: 401 }
      )
    };
  }

  return { merchant, response: null };
}

function buildCheckoutUrl(sessionId: string): string {
  const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
  return `${baseUrl.replace(/\/$/, "")}/pay?sessionId=${sessionId}`;
}

function normalizeIdempotencyKey(request: NextRequest): string | undefined {
  const key = request.headers.get("idempotency-key")?.trim();
  if (!key) return undefined;
  return key.slice(0, 128);
}

function isIdempotencyUniqueError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return message.includes("idx_payment_sessions_merchant_idempotency");
}

export async function POST(request: NextRequest) {
  try {
    const { merchant, response } = await getAuthenticatedMerchant(request);
    if (!merchant) return response!;

    const body = await request.json();
    const idempotencyKey = normalizeIdempotencyKey(request);

    const {
      amount,
      currency,
      description,
      originSystem,
      customerName,
      customerEmail,
      successUrl,
      cancelUrl,
      externalOrderId
    } = body ?? {};

    if (
      typeof amount !== "number" ||
      !currency ||
      !description ||
      !originSystem ||
      !successUrl ||
      !cancelUrl
    ) {
      return NextResponse.json(
        {
          error:
            "Faltan campos obligatorios: amount, currency, description, originSystem, successUrl, cancelUrl."
        },
        { status: 400 }
      );
    }

    if (idempotencyKey) {
      const existing = await getSessionByMerchantAndIdempotencyKey(
        merchant.id,
        idempotencyKey
      );
      if (existing) {
        return NextResponse.json(
          {
            sessionId: existing.id,
            checkoutUrl: buildCheckoutUrl(existing.id),
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
      if (idempotencyKey && isIdempotencyUniqueError(error)) {
        const existing = await getSessionByMerchantAndIdempotencyKey(
          merchant.id,
          idempotencyKey
        );
        if (existing) {
          return NextResponse.json(
            {
              sessionId: existing.id,
              checkoutUrl: buildCheckoutUrl(existing.id),
              reused: true
            },
            { status: 200 }
          );
        }
      }
      throw error;
    }

    return NextResponse.json(
      {
        sessionId: session.id,
        checkoutUrl: buildCheckoutUrl(session.id)
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en POST /api/v1/payment-sessions:", error);
    return NextResponse.json(
      { error: "Error interno al crear la sesión de pago." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { merchant, response } = await getAuthenticatedMerchant(request);
    if (!merchant) return response!;

    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get("status");
    const originSystem = searchParams.get("originSystem") ?? undefined;
    const fromDate = searchParams.get("fromDate") ?? undefined;
    const toDate = searchParams.get("toDate") ?? undefined;

    let status: PaymentStatus | undefined;
    if (statusParam) {
      const allowed: PaymentStatus[] = [
        "pending",
        "processing",
        "paid",
        "failed"
      ];
      if (!allowed.includes(statusParam as PaymentStatus)) {
        return NextResponse.json(
          {
            error:
              "El parámetro status debe ser uno de: pending, processing, paid, failed."
          },
          { status: 400 }
        );
      }
      status = statusParam as PaymentStatus;
    }

    const sessions = await listSessions({
      businessCode: merchant.businessCode,
      originSystem,
      status,
      fromDate,
      toDate
    });

    const items = sessions.map((s) => ({
      id: s.id,
      businessCode: s.businessCode,
      originSystem: s.originSystem,
      amount: s.amount,
      currency: s.currency,
      status: s.status,
      platformFeeAmount: s.platformFeeAmount,
      merchantNetAmount: s.merchantNetAmount,
      externalOrderId: s.externalOrderId,
      providerCode: s.providerCode,
      createdAt: s.createdAt
    }));

    return NextResponse.json({ sessions: items });
  } catch (error) {
    console.error("Error en GET /api/v1/payment-sessions:", error);
    return NextResponse.json(
      { error: "Error interno al listar las sesiones de pago." },
      { status: 500 }
    );
  }
}
