import { NextRequest, NextResponse } from "next/server";
import { getSessionById, updateSession } from "@/lib/paymentSessionStore";
import { searchPaymentStatusForSession } from "@/lib/mercantilTransferSearchService";

// POST /api/mercantil/transfer-search
// Stub que simula la verificación de un pago en el banco (búsqueda
// de transferencias / pagos acreditados).
// - Recibe { sessionId }.
// - Busca la PaymentSession.
// - Llama al servicio de Mercantil (actualmente simulado).
// - Actualiza el status de la sesión.
// - Devuelve un resumen con el estado y algunos metadatos.
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

    const result = await searchPaymentStatusForSession(session);

    const updated = await updateSession(session.id, {
      status: result.status
    });

    return NextResponse.json({
      status: updated.status,
      businessCode: updated.businessCode,
      originSystem: updated.originSystem,
      rawResponse: result.rawResponse
    });
  } catch (error) {
    console.error("Error en POST /api/mercantil/transfer-search:", error);
    return NextResponse.json(
      { error: "Error interno al verificar el estado del pago." },
      { status: 500 }
    );
  }
}

