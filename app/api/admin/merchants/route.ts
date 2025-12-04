import { NextRequest, NextResponse } from "next/server";
import {
  listMerchants,
  createMerchant,
  seedMerchantApps
} from "@/lib/merchantAppStore";

function requireRootAuth(request: NextRequest): NextResponse | null {
  const expected = process.env.ROOT_DASHBOARD_TOKEN;
  const provided = request.headers.get("x-root-token");

  if (!expected) {
    return NextResponse.json(
      {
        error:
          "ROOT_DASHBOARD_TOKEN no está configurado en el entorno del servidor."
      },
      { status: 500 }
    );
  }

  if (!provided || provided !== expected) {
    return NextResponse.json(
      { error: "Acceso no autorizado al dashboard root." },
      { status: 401 }
    );
  }

  return null;
}

// GET /api/admin/merchants
// Lista todos los MerchantApp registrados. Endpoint pensado para
// uso interno del dashboard root.
export async function GET(request: NextRequest) {
  const authError = requireRootAuth(request);
  if (authError) return authError;

  await seedMerchantApps();
  const merchants = await listMerchants();
  return NextResponse.json({ merchants });
}

// POST /api/admin/merchants
// Crea un nuevo MerchantApp. Solo se exponen los campos necesarios
// para el alta; id, apiKey, createdAt y updatedAt son generados
// por el store.
export async function POST(request: NextRequest) {
  const authError = requireRootAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const {
      businessCode,
      displayName,
      logoUrl,
      allowedDomains,
      webhookUrl,
      webhookSecret,
      techStackHint,
      commissionPercent,
      payoutCurrency,
      payoutBankName,
      payoutAccountNumber,
      payoutAccountHolder,
      contactName,
      contactEmail,
      notes
    } = body ?? {};

    if (
      !businessCode ||
      !displayName ||
      typeof commissionPercent !== "number" ||
      !payoutCurrency
    ) {
      return NextResponse.json(
        {
          error:
            "Faltan campos obligatorios: businessCode, displayName, commissionPercent, payoutCurrency."
        },
        { status: 400 }
      );
    }

    const merchant = await createMerchant({
      businessCode,
      displayName,
      logoUrl,
      allowedDomains,
      webhookUrl,
      webhookSecret,
      techStackHint,
      commissionPercent,
      payoutCurrency,
      payoutBankName,
      payoutAccountNumber,
      payoutAccountHolder,
      contactName,
      contactEmail,
      notes
    });

    return NextResponse.json({ merchant }, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/admin/merchants:", error);
    return NextResponse.json(
      { error: "Error interno al crear el MerchantApp." },
      { status: 500 }
    );
  }
}

