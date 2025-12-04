import { NextRequest, NextResponse } from "next/server";
import { getSessionById } from "@/lib/paymentSessionStore";
import { getMerchantById } from "@/lib/merchantAppStore";

// GET /api/payment-sessions/[sessionId]
// Endpoint interno para obtener el detalle de una PaymentSession.
// Devuelve la sesión completa, incluyendo información de montos y comisiones,
// y, cuando es posible, un pequeño resumen del MerchantApp asociado para
// poder mostrar logo y nombre comercial en el checkout.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  if (!sessionId) {
    return NextResponse.json(
      { error: "Falta el parámetro sessionId en la ruta." },
      { status: 400 }
    );
  }

  const session = await getSessionById(sessionId);
  if (!session) {
    return NextResponse.json(
      { error: `PaymentSession con id "${sessionId}" no encontrada.` },
      { status: 404 }
    );
  }

  const merchant = await getMerchantById(session.merchantAppId);
  const merchantSummary = merchant
    ? {
        id: merchant.id,
        businessCode: merchant.businessCode,
        displayName: merchant.displayName,
        logoUrl: merchant.logoUrl
      }
    : null;

  return NextResponse.json({ session, merchant: merchantSummary });
}
