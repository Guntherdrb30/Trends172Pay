import { NextRequest, NextResponse } from "next/server";
import { getMerchantByApiKey } from "@/lib/merchantAppStore";
import { getSessionById } from "@/lib/paymentSessionStore";
import type { MerchantApp } from "@/types/payment";

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

// GET /api/v1/payment-sessions/[id]
// Devuelve el detalle de una PaymentSession siempre y cuando
// pertenezca al MerchantApp autenticado por x-api-key.
// Esta es parte de la API sencilla para integradores externos.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { merchant, response } = await getAuthenticatedMerchant(request);
    if (!merchant) return response!;

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Falta el parámetro id en la ruta." },
        { status: 400 }
      );
    }

    const session = await getSessionById(id);
    if (!session || session.merchantAppId !== merchant.id) {
      // Se responde 404 para no filtrar la existencia de sesiones
      // de otros merchants.
      return NextResponse.json(
        { error: `PaymentSession con id "${id}" no encontrada.` },
        { status: 404 }
      );
    }

    // Solo se devuelve información relacionada al pago; no hay datos
    // sensibles de integración bancaria en la entidad PaymentSession.
    const payload = {
      id: session.id,
      businessCode: session.businessCode,
      originSystem: session.originSystem,
      amount: session.amount,
      currency: session.currency,
      description: session.description,
      status: session.status,
      platformFeeAmount: session.platformFeeAmount,
      merchantNetAmount: session.merchantNetAmount,
      customerName: session.customerName,
      customerEmail: session.customerEmail,
      externalOrderId: session.externalOrderId,
      successUrl: session.successUrl,
      cancelUrl: session.cancelUrl,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    };

    return NextResponse.json({ session: payload });
  } catch (error) {
    console.error("Error en GET /api/v1/payment-sessions/[id]:", error);
    return NextResponse.json(
      { error: "Error interno al obtener la sesión de pago." },
      { status: 500 }
    );
  }
}
