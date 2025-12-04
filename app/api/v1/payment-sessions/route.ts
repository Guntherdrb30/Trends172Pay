import { NextRequest, NextResponse } from "next/server";
import { getMerchantByApiKey } from "@/lib/merchantAppStore";
import { createSession, listSessions } from "@/lib/paymentSessionStore";
import type { MerchantApp, PaymentStatus } from "@/types/payment";

// Helper de autenticación por API key para la API pública v1.
// Todas las rutas bajo /api/v1/payment-sessions utilizan este helper
// para resolver el MerchantApp asociado al header x-api-key.
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

// POST /api/v1/payment-sessions
// Crea una PaymentSession pública asociada al MerchantApp resuelto
// por x-api-key. Esta es la API sencilla que cualquier plataforma
// puede usar para iniciar pagos en trends172 Pay.
export async function POST(request: NextRequest) {
  try {
    const { merchant, response } = await getAuthenticatedMerchant(request);
    if (!merchant) return response!;

    const body = await request.json();

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
    console.error("Error en POST /api/v1/payment-sessions:", error);
    return NextResponse.json(
      { error: "Error interno al crear la sesión de pago." },
      { status: 500 }
    );
  }
}

// GET /api/v1/payment-sessions
// Lista PaymentSessions asociadas al MerchantApp autenticado, con filtros
// básicos. Pensado para que las plataformas integradas consulten su
// propio historial de pagos sin ver datos de otros negocios.
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
      if (allowed.includes(statusParam as PaymentStatus)) {
        status = statusParam as PaymentStatus;
      } else {
        return NextResponse.json(
          {
            error:
              "El parámetro status debe ser uno de: pending, processing, paid, failed."
          },
          { status: 400 }
        );
      }
    }

    const sessions = await listSessions({
      businessCode: merchant.businessCode,
      originSystem,
      status,
      fromDate,
      toDate
    });

    // Respuesta resumida: información esencial del pago y comisiones,
    // sin exponer detalles internos de la integración bancaria.
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
