import { NextRequest, NextResponse } from "next/server";
import { getSessionById } from "@/lib/paymentSessionStore";

// POST /api/mercantil/button/create
// Stub interno que simula la creación de una orden de pago
// con el "Botón de Pagos" del banco Mercantil.
// Más adelante este endpoint utilizará mercantilButtonService.ts
// y la configuración real del banco.
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

    // En esta fase solo simulamos la URL de pago.
    // En la integración real, aquí se llamará al servicio de Mercantil
    // para obtener el enlace oficial del botón de pago.
    const encodedRef = encodeURIComponent(session.id);
    const paymentUrl = `https://banco-sandbox.com/pago-ficticio?ref=${encodedRef}`;

    return NextResponse.json({ paymentUrl });
  } catch (error) {
    console.error("Error en POST /api/mercantil/button/create:", error);
    return NextResponse.json(
      { error: "Error interno al crear la orden de pago en el banco." },
      { status: 500 }
    );
  }
}

