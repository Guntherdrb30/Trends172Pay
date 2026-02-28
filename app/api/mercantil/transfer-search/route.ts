import { NextRequest, NextResponse } from "next/server";
import {
  getSessionById,
  markSessionFailed,
  markSessionPaid,
  updateSession
} from "@/lib/paymentSessionStore";
import { getPaymentProvider } from "@/lib/payments/providerRouter";

// POST /api/mercantil/transfer-search
// Compat route: conserva el path histórico, pero usa el router de proveedores.
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
    const result = await provider.queryPaymentStatus({ session });

    let updated = session;
    if (result.outcome === "approved") {
      updated =
        (await markSessionPaid(session.id, {
          providerCode: result.providerCode,
          providerReference: result.providerReference,
          providerRawStatus: result.providerRawStatus,
          bankPaymentId: result.providerReference ?? session.bankPaymentId,
          providerMetadata: result.raw
        })) ?? session;
    } else if (result.outcome === "declined") {
      updated =
        (await markSessionFailed(session.id, {
          providerCode: result.providerCode,
          providerReference: result.providerReference,
          providerRawStatus: result.providerRawStatus,
          failureCode: result.code,
          failureReason: result.message,
          providerMetadata: result.raw
        })) ?? session;
    } else {
      updated = await updateSession(session.id, {
        providerCode: result.providerCode,
        providerReference: result.providerReference ?? session.providerReference,
        providerRawStatus: result.providerRawStatus ?? session.providerRawStatus,
        failureCode: result.code ?? session.failureCode,
        failureReason: result.message ?? session.failureReason,
        providerMetadata: result.raw ?? session.providerMetadata,
        lastProviderSyncAt: new Date().toISOString()
      });
    }

    return NextResponse.json({
      status: updated.status,
      businessCode: updated.businessCode,
      originSystem: updated.originSystem,
      providerCode: updated.providerCode,
      providerReference: updated.providerReference,
      rawResponse: result.raw
    });
  } catch (error) {
    console.error("Error en POST /api/mercantil/transfer-search:", error);
    return NextResponse.json(
      { error: "Error interno al verificar el estado del pago." },
      { status: 500 }
    );
  }
}
