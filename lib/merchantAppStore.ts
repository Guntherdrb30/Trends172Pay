import { MerchantApp } from "@/types/payment";
import { db } from "@/lib/db";

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `m_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function generateApiKey(): string {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return `trends172_${hex}`;
  }

  return `trends172_${Math.random().toString(36).slice(2)}${Date.now().toString(
    36
  )}`;
}

function mapRowToMerchant(row: any): MerchantApp {
  return {
    id: row.id,
    businessCode: row.business_code,
    displayName: row.display_name,
    apiKey: row.api_key,
    logoUrl: row.logo_url ?? undefined,
    allowedDomains: row.allowed_domains ?? undefined,
    webhookUrl: row.webhook_url ?? undefined,
    webhookSecret: row.webhook_secret ?? undefined,
    techStackHint: row.tech_stack_hint ?? undefined,
    commissionPercent: Number(row.commission_percent),
    payoutCurrency: row.payout_currency,
    payoutBankName: row.payout_bank_name ?? undefined,
    payoutAccountNumber: row.payout_account_number ?? undefined,
    payoutAccountHolder: row.payout_account_holder ?? undefined,
    contactName: row.contact_name ?? undefined,
    contactEmail: row.contact_email ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at?.toISOString
      ? row.created_at.toISOString()
      : String(row.created_at),
    updatedAt: row.updated_at?.toISOString
      ? row.updated_at.toISOString()
      : String(row.updated_at)
  };
}

// Semilla inicial en BD: solo si no existen merchants.
export async function seedMerchantApps(): Promise<void> {
  const rows = await db`SELECT COUNT(*)::int AS count FROM merchant_apps`;
  const count = rows[0]?.count ?? 0;
  if (count > 0) return;

  const now = new Date().toISOString();

  const carpiHogarId = generateId();
  const academiaXId = generateId();

  await db`
    INSERT INTO merchant_apps (
      id,
      business_code,
      display_name,
      api_key,
      logo_url,
      allowed_domains,
      webhook_url,
      webhook_secret,
      tech_stack_hint,
      commission_percent,
      payout_currency,
      payout_bank_name,
      payout_account_number,
      payout_account_holder,
      contact_name,
      contact_email,
      notes,
      created_at,
      updated_at
    )
    VALUES
      (${carpiHogarId},
       'CARPIHOGAR',
       'Carpi Hogar',
       ${generateApiKey()},
       NULL,
       ARRAY['https://carpihogar.com'],
       '',
       '',
       'Laravel',
       3.5,
       'VES',
       'Banco de Ejemplo VES',
       '0102-0000-0000-00000000',
       'Carpi Hogar C.A.',
       'Equipo Carpi Hogar',
       'soporte@carpihogar.com',
       'Instalación principal de e-commerce.',
       ${now}::timestamptz,
       ${now}::timestamptz
      ),
      (${academiaXId},
       'ACADEMIA_X',
       'Academia X Online',
       ${generateApiKey()},
       NULL,
       ARRAY['https://academiax.com'],
       '',
       '',
       'WordPress',
       5.0,
       'USD',
       'Banco de Ejemplo USD',
       '0001-0000-0000-00000000',
       'Academia X LLC',
       'Soporte Academia X',
       'pagos@academiax.com',
       'Venta de cursos online.',
       ${now}::timestamptz,
       ${now}::timestamptz
      )
  `;
}

export async function listMerchants(): Promise<MerchantApp[]> {
  const rows = await db`
    SELECT *
    FROM merchant_apps
    ORDER BY created_at ASC
  `;

  return rows.map(mapRowToMerchant);
}

export async function getMerchantById(
  id: string
): Promise<MerchantApp | null> {
  const rows = await db`
    SELECT *
    FROM merchant_apps
    WHERE id = ${id}
    LIMIT 1
  `;

  if (!rows[0]) return null;
  return mapRowToMerchant(rows[0]);
}

export async function getMerchantByApiKey(
  apiKey: string
): Promise<MerchantApp | null> {
  const rows = await db`
    SELECT *
    FROM merchant_apps
    WHERE api_key = ${apiKey}
    LIMIT 1
  `;

  if (!rows[0]) return null;
  return mapRowToMerchant(rows[0]);
}

export async function getMerchantByBusinessCode(
  code: string
): Promise<MerchantApp | null> {
  const rows = await db`
    SELECT *
    FROM merchant_apps
    WHERE business_code = ${code}
    LIMIT 1
  `;

  if (!rows[0]) return null;
  return mapRowToMerchant(rows[0]);
}

export async function createMerchant(
  data: Omit<MerchantApp, "id" | "apiKey" | "createdAt" | "updatedAt">
): Promise<MerchantApp> {
  const now = new Date().toISOString();

  const exists = await db`
    SELECT 1
    FROM merchant_apps
    WHERE business_code = ${data.businessCode}
    LIMIT 1
  `;

  if (exists.length > 0) {
    throw new Error(
      `Ya existe un MerchantApp con businessCode "${data.businessCode}".`
    );
  }

  const id = generateId();
  const apiKey = generateApiKey();

  const rows = await db`
    INSERT INTO merchant_apps (
      id,
      business_code,
      display_name,
      api_key,
      logo_url,
      allowed_domains,
      webhook_url,
      webhook_secret,
      tech_stack_hint,
      commission_percent,
      payout_currency,
      payout_bank_name,
      payout_account_number,
      payout_account_holder,
      contact_name,
      contact_email,
      notes,
      created_at,
      updated_at
    )
    VALUES (
      ${id},
      ${data.businessCode},
      ${data.displayName},
      ${apiKey},
      ${data.logoUrl ?? null},
      ${data.allowedDomains ?? null},
      ${data.webhookUrl ?? null},
      ${data.webhookSecret ?? null},
      ${data.techStackHint ?? null},
      ${data.commissionPercent},
      ${data.payoutCurrency},
      ${data.payoutBankName ?? null},
      ${data.payoutAccountNumber ?? null},
      ${data.payoutAccountHolder ?? null},
      ${data.contactName ?? null},
      ${data.contactEmail ?? null},
      ${data.notes ?? null},
      ${now}::timestamptz,
      ${now}::timestamptz
    )
    RETURNING *
  `;

  return mapRowToMerchant(rows[0]);
}

export async function updateMerchant(
  id: string,
  partial: Partial<MerchantApp>
): Promise<MerchantApp> {
  const existing = await getMerchantById(id);
  if (!existing) {
    throw new Error(`MerchantApp con id "${id}" no encontrado.`);
  }

  const now = new Date().toISOString();

  const merged: MerchantApp = {
    ...existing,
    ...partial,
    id: existing.id,
    apiKey: existing.apiKey,
    createdAt: existing.createdAt,
    updatedAt: now
  };

  const rows = await db`
    UPDATE merchant_apps
    SET
      business_code = ${merged.businessCode},
      display_name = ${merged.displayName},
      logo_url = ${merged.logoUrl ?? null},
      allowed_domains = ${merged.allowedDomains ?? null},
      webhook_url = ${merged.webhookUrl ?? null},
      webhook_secret = ${merged.webhookSecret ?? null},
      tech_stack_hint = ${merged.techStackHint ?? null},
      commission_percent = ${merged.commissionPercent},
      payout_currency = ${merged.payoutCurrency},
      payout_bank_name = ${merged.payoutBankName ?? null},
      payout_account_number = ${merged.payoutAccountNumber ?? null},
      payout_account_holder = ${merged.payoutAccountHolder ?? null},
      contact_name = ${merged.contactName ?? null},
      contact_email = ${merged.contactEmail ?? null},
      notes = ${merged.notes ?? null},
      updated_at = ${now}::timestamptz
    WHERE id = ${id}
    RETURNING *
  `;

  return mapRowToMerchant(rows[0]);
}

export async function regenerateApiKey(id: string): Promise<MerchantApp> {
  const existing = await getMerchantById(id);
  if (!existing) {
    throw new Error(`MerchantApp con id "${id}" no encontrado.`);
  }

  const now = new Date().toISOString();
  const newKey = generateApiKey();

  const rows = await db`
    UPDATE merchant_apps
    SET api_key = ${newKey},
        updated_at = ${now}::timestamptz
    WHERE id = ${id}
    RETURNING *
  `;

  return mapRowToMerchant(rows[0]);
}

