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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ externalOrderId: string }> }
) {
  try {
    const { merchant, response } = await getAuthenticatedMerchant(request);
    if (!merchant) return response!;

    const { externalOrderId } = await params;

    const sessions = await listSessions({
      businessCode: merchant.businessCode
    });

    const filtered = sessions.filter(
      (s) => s.externalOrderId === externalOrderId
    );

    if (filtered.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron PaymentSessions para ese externalOrderId." },
        { status: 404 }
      );
    }

    const items = filtered.map((s) => ({
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
    console.error(
      "Error en GET /api/v1/payment-sessions/by-external/[externalOrderId]:",
      error
    );
    return NextResponse.json(
      { error: "Error interno al buscar sesiones por externalOrderId." },
      { status: 500 }
    );
  }
}
