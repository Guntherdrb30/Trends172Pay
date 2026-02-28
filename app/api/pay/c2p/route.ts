import { NextResponse } from "next/server";
import {
  claimSessionForProcessing,
  getPaymentSession,
  markSessionFailed,
  markSessionPaid,
  updateSession
} from "@/lib/paymentSessionStore";
import { getPaymentProvider } from "@/lib/payments/providerRouter";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, payerId, payerMobile, otp } = body;

    if (!sessionId || !payerId || !payerMobile || !otp) {
      return NextResponse.json(
        {
          error:
            "Faltan datos requeridos (sessionId, cédula, teléfono, clave)."
        },
        { status: 400 }
      );
    }

    const current = await getPaymentSession(sessionId);
    if (!current) {
      return NextResponse.json({ error: "Sesión inválida." }, { status: 404 });
    }

    if (current.status === "paid") {
      return NextResponse.json({
        success: true,
        alreadyPaid: true,
        reference: current.bankPaymentId ?? current.providerReference
      });
    }

    const claimed = await claimSessionForProcessing(current.id);
    if (!claimed) {
      const latest = await getPaymentSession(current.id);

      if (latest?.status === "paid") {
        return NextResponse.json({
          success: true,
          alreadyPaid: true,
          reference: latest.bankPaymentId ?? latest.providerReference
        });
      }

      if (latest?.status === "processing") {
        return NextResponse.json(
          { error: "Ya hay una operación de cobro en progreso para esta sesión." },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "No se pudo iniciar el cobro para esta sesión." },
        { status: 409 }
      );
    }

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    const provider = getPaymentProvider(claimed.providerCode);
    const result = await provider.processC2P({
      session: claimed,
      payerId,
      payerMobile,
      otp,
      ipAddress
    });

    if (result.outcome === "approved") {
      const updated =
        (await markSessionPaid(claimed.id, {
          providerCode: result.providerCode,
          paymentMethod: "mobile",
          bankPaymentId: result.providerReference,
          providerReference: result.providerReference,
          providerRawStatus: result.providerRawStatus,
          providerMetadata: result.raw
        })) ?? claimed;

      return NextResponse.json({
        success: true,
        status: updated.status,
        reference: updated.bankPaymentId ?? updated.providerReference
      });
    }

    if (result.outcome === "declined") {
      const updated =
        (await markSessionFailed(claimed.id, {
          providerCode: result.providerCode,
          providerReference: result.providerReference,
          providerRawStatus: result.providerRawStatus,
          failureCode: result.code,
          failureReason: result.message,
          providerMetadata: result.raw
        })) ?? claimed;

      return NextResponse.json(
        {
          success: false,
          status: updated.status,
          error: result.message || "El banco rechazó la transacción.",
          code: result.code
        },
        { status: 400 }
      );
    }

    if (result.outcome === "pending") {
      await updateSession(claimed.id, {
        providerCode: result.providerCode,
        providerReference: result.providerReference ?? claimed.providerReference,
        providerRawStatus: result.providerRawStatus ?? claimed.providerRawStatus,
        failureCode: result.code ?? claimed.failureCode,
        failureReason: result.message ?? claimed.failureReason,
        providerMetadata: result.raw ?? claimed.providerMetadata,
        lastProviderSyncAt: new Date().toISOString()
      });

      return NextResponse.json(
        {
          success: false,
          status: "processing",
          code: result.code,
          error:
            result.message ||
            "El pago quedó en validación. Consulta el estado en unos segundos."
        },
        { status: 202 }
      );
    }

    if (!result.retryable) {
      await markSessionFailed(claimed.id, {
        providerCode: result.providerCode,
        providerReference: result.providerReference,
        providerRawStatus: result.providerRawStatus,
        failureCode: result.code,
        failureReason: result.message,
        providerMetadata: result.raw
      });
    }

    return NextResponse.json(
      {
        success: false,
        status: result.retryable ? "processing" : "failed",
        code: result.code,
        error: result.message || "No fue posible procesar el pago."
      },
      { status: result.retryable ? 502 : 400 }
    );
  } catch (error: any) {
    console.error("Error en endpoint C2P:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
