import { NextRequest, NextResponse } from "next/server";

function requireRootAuth(request: NextRequest): NextResponse | null {
  const expected = process.env.ROOT_DASHBOARD_TOKEN;
  const provided = request.headers.get("x-root-token");
  const session = request.cookies.get("admin_session")?.value;

  if (!expected) {
    return NextResponse.json(
      {
        error:
          "ROOT_DASHBOARD_TOKEN no está configurado en el entorno del servidor."
      },
      { status: 500 }
    );
  }

  const headerValid = !!provided && provided === expected;
  const sessionValid = session === "active";

  if (!headerValid && !sessionValid) {
    return NextResponse.json(
      { error: "Acceso no autorizado al dashboard root." },
      { status: 401 }
    );
  }

  return null;
}

// POST /api/admin/onboarding/test-webhook
// Stub para el asistente de conexión inteligente.
// Simula el envío de un webhook de prueba al backend del cliente.
// En el futuro, aquí se utilizará webhookNotifier.ts y se hará una
// llamada HTTP real al webhookUrl configurado.
export async function POST(request: NextRequest) {
  const authError = requireRootAuth(request);
  if (authError) return authError;

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
