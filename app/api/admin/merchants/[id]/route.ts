import { NextRequest, NextResponse } from "next/server";
import {
  getMerchantById,
  updateMerchant
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

// GET /api/admin/merchants/[id]
// Devuelve el detalle de un MerchantApp concreto.
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const authError = requireRootAuth(request);
  if (authError) return authError;

  const { id } = context.params;
  const merchant = await getMerchantById(id);
  if (!merchant) {
    return NextResponse.json(
      { error: `MerchantApp con id "${id}" no encontrado.` },
      { status: 404 }
    );
  }

  return NextResponse.json({ merchant });
}

// PATCH /api/admin/merchants/[id]
// Actualiza los campos configurables de un MerchantApp:
// - Datos visibles en el dashboard
// - Condiciones comerciales
// - Datos de liquidación
// - Configuración técnica
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const authError = requireRootAuth(request);
  if (authError) return authError;

  const { id } = context.params;

  try {
    const existing = await getMerchantById(id);
    if (!existing) {
      return NextResponse.json(
        { error: `MerchantApp con id "${id}" no encontrado.` },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      displayName,
      logoUrl,
      commissionPercent,
      payoutCurrency,
      payoutBankName,
      payoutAccountNumber,
      payoutAccountHolder,
      allowedDomains,
      webhookUrl,
      webhookSecret,
      techStackHint,
      contactName,
      contactEmail,
      notes
    } = body ?? {};

    const partial: Record<string, unknown> = {};

    if (typeof displayName === "string") partial.displayName = displayName;
    if (typeof logoUrl === "string" || logoUrl === null)
      partial.logoUrl = logoUrl ?? undefined;
    if (typeof commissionPercent === "number")
      partial.commissionPercent = commissionPercent;
    if (typeof payoutCurrency === "string")
      partial.payoutCurrency = payoutCurrency;
    if (typeof payoutBankName === "string" || payoutBankName === null)
      partial.payoutBankName = payoutBankName ?? undefined;
    if (
      typeof payoutAccountNumber === "string" ||
      payoutAccountNumber === null
    )
      partial.payoutAccountNumber = payoutAccountNumber ?? undefined;
    if (
      typeof payoutAccountHolder === "string" ||
      payoutAccountHolder === null
    )
      partial.payoutAccountHolder = payoutAccountHolder ?? undefined;
    if (Array.isArray(allowedDomains)) partial.allowedDomains = allowedDomains;
    if (typeof webhookUrl === "string" || webhookUrl === null)
      partial.webhookUrl = webhookUrl ?? undefined;
    if (typeof webhookSecret === "string" || webhookSecret === null)
      partial.webhookSecret = webhookSecret ?? undefined;
    if (typeof techStackHint === "string" || techStackHint === null)
      partial.techStackHint = techStackHint ?? undefined;
    if (typeof contactName === "string" || contactName === null)
      partial.contactName = contactName ?? undefined;
    if (typeof contactEmail === "string" || contactEmail === null)
      partial.contactEmail = contactEmail ?? undefined;
    if (typeof notes === "string" || notes === null)
      partial.notes = notes ?? undefined;

    const updated = await updateMerchant(id, partial);
    return NextResponse.json({ merchant: updated });
  } catch (error) {
    console.error("Error en PATCH /api/admin/merchants/[id]:", error);
    return NextResponse.json(
      { error: "Error interno al actualizar el MerchantApp." },
      { status: 500 }
    );
  }
}

