import { NextRequest, NextResponse } from "next/server";
import { getMerchantByApiKey } from "@/lib/merchantAppStore";
import { listSessions } from "@/lib/paymentSessionStore";
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

// GET /api/v1/payment-sessions/by-external/[externalOrderId]
// Devuelve todas las sesiones de pago de un MerchantApp concreto
// asociadas al mismo externalOrderId. Útil para que las plataformas
// reconciliEN pedidos externos con múltiples intentos de pago.
export async function GET(
  request: NextRequest,
  context: { params: { externalOrderId: string } }
) {
  try {
    const { merchant, response } = await getAuthenticatedMerchant(request);
    if (!merchant) return response!;

    const { externalOrderId } = context.params;
    if (!externalOrderId) {
      return NextResponse.json(
        { error: "Falta el parámetro externalOrderId en la ruta." },
        { status: 400 }
      );
    }

    const allForMerchant = await listSessions({
      businessCode: merchant.businessCode
    });

    const filtered = allForMerchant.filter(
      (s) => s.externalOrderId === externalOrderId
    );

    const sessions = filtered.map((s) => ({
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

    // Se devuelve siempre un array (que puede estar vacío) para
    // facilitar el consumo desde distintas tecnologías.
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error(
      "Error en GET /api/v1/payment-sessions/by-external/[externalOrderId]:",
      error
    );
    return NextResponse.json(
      {
        error:
          "Error interno al obtener las sesiones de pago por externalOrderId."
      },
      { status: 500 }
    );
  }
}

