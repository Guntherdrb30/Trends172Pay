import { NextRequest, NextResponse } from "next/server";

// POST /api/admin/onboarding/test-webhook
// Stub para el asistente de conexión inteligente.
// Simula el envío de un webhook de prueba al backend del cliente.
// En el futuro, aquí se utilizará webhookNotifier.ts y se hará una
// llamada HTTP real al webhookUrl configurado.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const webhookUrl = body?.webhookUrl as string | undefined;
    const webhookSecret = body?.webhookSecret as string | undefined;
    const businessCode = body?.businessCode as string | undefined;

    if (!webhookUrl) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "No se ha configurado webhookUrl. Define una URL antes de probar la conexión."
        },
        { status: 400 }
      );
    }

    // Simulación: en una versión posterior se enviará un evento real
    // tipo integration.test al webhook del cliente, firmado con webhookSecret.
    console.log(
      "[onboarding:test-webhook] Simulando envío de evento de prueba",
      {
        businessCode,
        webhookUrl,
        hasSecret: Boolean(webhookSecret)
      }
    );

    return NextResponse.json({
      ok: true,
      message:
        "Webhook de prueba simulado correctamente. En una versión posterior se enviará una petición real."
    });
  } catch (error) {
    console.error(
      "Error en POST /api/admin/onboarding/test-webhook:",
      error
    );
    return NextResponse.json(
      {
        ok: false,
        message: "Error interno al simular el webhook de prueba."
      },
      { status: 500 }
    );
  }
}

