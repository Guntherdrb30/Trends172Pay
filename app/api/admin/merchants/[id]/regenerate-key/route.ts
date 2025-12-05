import { NextRequest, NextResponse } from "next/server";
import { regenerateApiKey } from "@/lib/merchantAppStore";

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

// POST /api/admin/merchants/[id]/regenerate-key
// Regenera la apiKey de un MerchantApp. Debe usarse con cuidado, ya que
// invalida inmediatamente la integración anterior.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireRootAuth(request);
  if (authError) return authError;

  const { id } = await params;

  try {
    const updated = await regenerateApiKey(id);
    return NextResponse.json(
      {
        merchant: {
          id: updated.id,
          businessCode: updated.businessCode,
          displayName: updated.displayName,
          apiKey: updated.apiKey
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Error en POST /api/admin/merchants/[id]/regenerate-key:",
      error
    );
    return NextResponse.json(
      { error: "Error interno al regenerar la API key." },
      { status: 500 }
    );
  }
}
