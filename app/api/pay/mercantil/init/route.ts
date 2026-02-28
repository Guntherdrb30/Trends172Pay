import { NextResponse } from "next/server";
import { getPaymentSession } from "@/lib/paymentSessionStore";
import { getPaymentProvider } from "@/lib/payments/providerRouter";

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Se requiere sessionId." },
        { status: 400 }
      );
    }

    const session = await getPaymentSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Sesión de pago inválida o expirada." },
        { status: 404 }
      );
    }

    const provider = getPaymentProvider(session.providerCode);
    const result = await provider.createHostedPayment({ session, request });

    return NextResponse.json({ redirectUrl: result.redirectUrl });
  } catch (error) {
    console.error("Error iniciando pago bancario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
