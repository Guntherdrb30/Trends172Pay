import { NextRequest, NextResponse } from "next/server";
import { getSessionById } from "@/lib/paymentSessionStore";
import { getPaymentProvider } from "@/lib/payments/providerRouter";

// POST /api/mercantil/button/create
// Compat route: mantiene el endpoint histórico, pero ya delega
// la generación de link al router de proveedores.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const sessionId = body?.sessionId as string | undefined;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Falta el campo sessionId en el cuerpo de la petición." },
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

    const provider = getPaymentProvider(session.providerCode);
    const result = await provider.createHostedPayment({ session, request });

    return NextResponse.json({ paymentUrl: result.redirectUrl });
  } catch (error) {
    console.error("Error en POST /api/mercantil/button/create:", error);
    return NextResponse.json(
      { error: "Error interno al crear la orden de pago en el banco." },
      { status: 500 }
    );
  }
}
