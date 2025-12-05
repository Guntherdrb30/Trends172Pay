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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { merchant, response } = await getAuthenticatedMerchant(request);
    if (!merchant) return response!;

    const { id } = await params;
    const session = await getSessionById(id);

    if (!session || session.businessCode !== merchant.businessCode) {
      return NextResponse.json(
        { error: "PaymentSession no encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      session: {
        id: session.id,
        businessCode: session.businessCode,
        originSystem: session.originSystem,
        amount: session.amount,
        currency: session.currency,
        status: session.status,
        platformFeeAmount: session.platformFeeAmount,
        merchantNetAmount: session.merchantNetAmount,
        externalOrderId: session.externalOrderId,
        successUrl: session.successUrl,
        cancelUrl: session.cancelUrl,
        customerName: session.customerName,
        customerEmail: session.customerEmail,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      }
    });
  } catch (error) {
    console.error("Error en GET /api/v1/payment-sessions/[id]:", error);
    return NextResponse.json(
      { error: "Error interno al obtener la sesión de pago." },
      { status: 500 }
    );
  }
}
