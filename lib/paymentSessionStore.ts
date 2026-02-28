import { db } from "@/lib/db";
import { calculateFees } from "@/lib/fees";
import { getMerchantById } from "@/lib/merchantAppStore";
import type {
  MerchantApp,
  PaymentProviderCode,
  PaymentSession,
  PaymentStatus
} from "@/types/payment";

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `ps_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function toIso(value: unknown): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return String(value);
}

function mapRowToSession(row: any): PaymentSession {
  return {
    id: row.id,
    merchantAppId: row.merchant_app_id,
    businessCode: row.business_code,
    originSystem: row.origin_system,
    amount: Number(row.amount),
    currency: row.currency,
    platformFeeAmount: Number(row.platform_fee_amount),
    merchantNetAmount: Number(row.merchant_net_amount),
    description: row.description,
    status: row.status as PaymentStatus,
    paymentMethod: row.payment_method ?? undefined,
    commissionAmount:
      row.commission_amount !== null && row.commission_amount !== undefined
        ? Number(row.commission_amount)
        : undefined,
    customerName: row.customer_name ?? undefined,
    customerEmail: row.customer_email ?? undefined,
    successUrl: row.success_url,
    cancelUrl: row.cancel_url,
    externalOrderId: row.external_order_id ?? undefined,
    bankPaymentId: row.bank_payment_id ?? undefined,
    providerCode: (row.provider_code as PaymentProviderCode) ?? "mercantil",
    providerReference: row.provider_reference ?? undefined,
    providerRawStatus: row.provider_raw_status ?? undefined,
    failureCode: row.failure_code ?? undefined,
    failureReason: row.failure_reason ?? undefined,
    idempotencyKey: row.idempotency_key ?? undefined,
    paidAt: toIso(row.paid_at),
    processingStartedAt: toIso(row.processing_started_at),
    lastProviderSyncAt: toIso(row.last_provider_sync_at),
    providerMetadata: row.provider_metadata ?? undefined,
    createdAt: toIso(row.created_at) ?? new Date(0).toISOString(),
    updatedAt: toIso(row.updated_at) ?? new Date(0).toISOString()
  };
}

export interface CreateSessionInput {
  merchantAppId: string;
  originSystem: string;
  amount: number;
  currency: string;
  description: string;
  customerName?: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  externalOrderId?: string;
  bankPaymentId?: string;
  status?: PaymentStatus;
  paymentMethod?: string;
  commissionAmount?: number;
  providerCode?: PaymentProviderCode;
  idempotencyKey?: string;
}

export async function createSession(
  input: CreateSessionInput
): Promise<PaymentSession> {
  const merchant: MerchantApp | null = await getMerchantById(input.merchantAppId);
  if (!merchant) {
    throw new Error(`No se encontró MerchantApp con id "${input.merchantAppId}".`);
  }

  const { platformFeeAmount, merchantNetAmount } = calculateFees(
    input.amount,
    merchant
  );

  const now = new Date().toISOString();
  const status: PaymentStatus = input.status ?? "pending";
  const id = generateId();

  const rows = await db`
    INSERT INTO payment_sessions (
      id,
      merchant_app_id,
      business_code,
      origin_system,
      amount,
      currency,
      platform_fee_amount,
      merchant_net_amount,
      description,
      status,
      customer_name,
      customer_email,
      success_url,
      cancel_url,
      external_order_id,
      bank_payment_id,
      created_at,
      updated_at,
      payment_method,
      commission_amount,
      provider_code,
      idempotency_key
    )
    VALUES (
      ${id},
      ${merchant.id},
      ${merchant.businessCode},
      ${input.originSystem},
      ${input.amount},
      ${input.currency},
      ${platformFeeAmount},
      ${merchantNetAmount},
      ${input.description},
      ${status},
      ${input.customerName ?? null},
      ${input.customerEmail ?? null},
      ${input.successUrl},
      ${input.cancelUrl},
      ${input.externalOrderId ?? null},
      ${input.bankPaymentId ?? null},
      ${now}::timestamptz,
      ${now}::timestamptz,
      ${input.paymentMethod ?? null},
      ${input.commissionAmount ?? null},
      ${input.providerCode ?? merchant.defaultProviderCode ?? "mercantil"},
      ${input.idempotencyKey ?? null}
    )
    RETURNING *
  `;

  return mapRowToSession(rows[0]);
}

export async function getSessionById(id: string): Promise<PaymentSession | null> {
  const rows = await db`
    SELECT *
    FROM payment_sessions
    WHERE id = ${id}
    LIMIT 1
  `;

  if (!rows[0]) return null;
  return mapRowToSession(rows[0]);
}

export const getPaymentSession = getSessionById;

export async function getSessionByMerchantAndIdempotencyKey(
  merchantAppId: string,
  idempotencyKey: string
): Promise<PaymentSession | null> {
  const rows = await db`
    SELECT *
    FROM payment_sessions
    WHERE merchant_app_id = ${merchantAppId}
      AND idempotency_key = ${idempotencyKey}
    LIMIT 1
  `;

  if (!rows[0]) return null;
  return mapRowToSession(rows[0]);
}

export async function updateSession(
  id: string,
  partial: Partial<PaymentSession>
): Promise<PaymentSession> {
  const existing = await getSessionById(id);
  if (!existing) {
    throw new Error(`PaymentSession con id "${id}" no encontrada.`);
  }

  const now = new Date().toISOString();
  const merged: PaymentSession = {
    ...existing,
    ...partial,
    id: existing.id,
    merchantAppId: existing.merchantAppId,
    businessCode: existing.businessCode,
    createdAt: existing.createdAt,
    updatedAt: now
  };

  const rows = await db`
    UPDATE payment_sessions
    SET
      origin_system = ${merged.originSystem},
      amount = ${merged.amount},
      currency = ${merged.currency},
      platform_fee_amount = ${merged.platformFeeAmount},
      merchant_net_amount = ${merged.merchantNetAmount},
      description = ${merged.description},
      status = ${merged.status},
      customer_name = ${merged.customerName ?? null},
      customer_email = ${merged.customerEmail ?? null},
      success_url = ${merged.successUrl},
      cancel_url = ${merged.cancelUrl},
      external_order_id = ${merged.externalOrderId ?? null},
      bank_payment_id = ${merged.bankPaymentId ?? null},
      payment_method = ${merged.paymentMethod ?? null},
      commission_amount = ${merged.commissionAmount ?? null},
      provider_code = ${merged.providerCode ?? "mercantil"},
      provider_reference = ${merged.providerReference ?? null},
      provider_raw_status = ${merged.providerRawStatus ?? null},
      failure_code = ${merged.failureCode ?? null},
      failure_reason = ${merged.failureReason ?? null},
      idempotency_key = ${merged.idempotencyKey ?? null},
      paid_at = ${merged.paidAt ?? null}::timestamptz,
      processing_started_at = ${merged.processingStartedAt ?? null}::timestamptz,
      last_provider_sync_at = ${merged.lastProviderSyncAt ?? null}::timestamptz,
      provider_metadata = ${merged.providerMetadata ? JSON.stringify(merged.providerMetadata) : null}::jsonb,
      updated_at = ${now}::timestamptz
    WHERE id = ${id}
    RETURNING *
  `;

  return mapRowToSession(rows[0]);
}

export async function claimSessionForProcessing(
  id: string
): Promise<PaymentSession | null> {
  const now = new Date().toISOString();
  const rows = await db`
    UPDATE payment_sessions
    SET
      status = 'processing',
      processing_started_at = COALESCE(processing_started_at, ${now}::timestamptz),
      updated_at = ${now}::timestamptz
    WHERE id = ${id}
      AND status = 'pending'
    RETURNING *
  `;

  if (!rows[0]) return null;
  return mapRowToSession(rows[0]);
}

interface FinalizePaidInput {
  providerCode?: PaymentProviderCode;
  paymentMethod?: string;
  bankPaymentId?: string;
  providerReference?: string;
  providerRawStatus?: string;
  providerMetadata?: unknown;
}

export async function markSessionPaid(
  id: string,
  input: FinalizePaidInput
): Promise<PaymentSession | null> {
  const now = new Date().toISOString();
  const rows = await db`
    UPDATE payment_sessions
    SET
      status = 'paid',
      payment_method = COALESCE(${input.paymentMethod ?? null}, payment_method),
      bank_payment_id = COALESCE(${input.bankPaymentId ?? null}, bank_payment_id),
      provider_code = COALESCE(${input.providerCode ?? null}, provider_code, 'mercantil'),
      provider_reference = COALESCE(${input.providerReference ?? null}, provider_reference),
      provider_raw_status = COALESCE(${input.providerRawStatus ?? null}, provider_raw_status),
      provider_metadata = COALESCE(${input.providerMetadata ? JSON.stringify(input.providerMetadata) : null}::jsonb, provider_metadata),
      failure_code = NULL,
      failure_reason = NULL,
      paid_at = COALESCE(paid_at, ${now}::timestamptz),
      last_provider_sync_at = ${now}::timestamptz,
      updated_at = ${now}::timestamptz
    WHERE id = ${id}
      AND status IN ('processing', 'pending')
    RETURNING *
  `;

  if (!rows[0]) return null;
  return mapRowToSession(rows[0]);
}

interface FinalizeFailedInput {
  providerCode?: PaymentProviderCode;
  providerReference?: string;
  providerRawStatus?: string;
  failureCode?: string;
  failureReason?: string;
  providerMetadata?: unknown;
}

export async function markSessionFailed(
  id: string,
  input: FinalizeFailedInput
): Promise<PaymentSession | null> {
  const now = new Date().toISOString();
  const rows = await db`
    UPDATE payment_sessions
    SET
      status = 'failed',
      provider_code = COALESCE(${input.providerCode ?? null}, provider_code, 'mercantil'),
      provider_reference = COALESCE(${input.providerReference ?? null}, provider_reference),
      provider_raw_status = COALESCE(${input.providerRawStatus ?? null}, provider_raw_status),
      failure_code = COALESCE(${input.failureCode ?? null}, failure_code),
      failure_reason = COALESCE(${input.failureReason ?? null}, failure_reason),
      provider_metadata = COALESCE(${input.providerMetadata ? JSON.stringify(input.providerMetadata) : null}::jsonb, provider_metadata),
      last_provider_sync_at = ${now}::timestamptz,
      updated_at = ${now}::timestamptz
    WHERE id = ${id}
      AND status IN ('processing', 'pending')
    RETURNING *
  `;

  if (!rows[0]) return null;
  return mapRowToSession(rows[0]);
}

export async function listSessionsByBusinessCode(
  code: string
): Promise<PaymentSession[]> {
  const rows = await db`
    SELECT *
    FROM payment_sessions
    WHERE business_code = ${code}
    ORDER BY created_at DESC
  `;

  return rows.map(mapRowToSession);
}

export async function listSessionsByExternalOrderId(input: {
  businessCode: string;
  externalOrderId: string;
}): Promise<PaymentSession[]> {
  const rows = await db`
    SELECT *
    FROM payment_sessions
    WHERE business_code = ${input.businessCode}
      AND external_order_id = ${input.externalOrderId}
    ORDER BY created_at DESC
  `;

  return rows.map(mapRowToSession);
}

export async function listSessions(filters?: {
  businessCode?: string;
  originSystem?: string;
  status?: PaymentStatus;
  fromDate?: string;
  toDate?: string;
}): Promise<PaymentSession[]> {
  if (!filters) {
    const rows = await db`
      SELECT *
      FROM payment_sessions
      ORDER BY created_at DESC
    `;
    return rows.map(mapRowToSession);
  }

  const { businessCode, originSystem, status, fromDate, toDate } = filters;
  const conditions: string[] = [];
  const params: any[] = [];

  if (businessCode) {
    conditions.push(`business_code = $${conditions.length + 1}`);
    params.push(businessCode);
  }

  if (originSystem) {
    conditions.push(`origin_system = $${conditions.length + 1}`);
    params.push(originSystem);
  }

  if (status) {
    conditions.push(`status = $${conditions.length + 1}`);
    params.push(status);
  }

  if (fromDate) {
    conditions.push(`created_at >= $${conditions.length + 1}`);
    params.push(fromDate);
  }

  if (toDate) {
    conditions.push(`created_at <= $${conditions.length + 1}`);
    params.push(toDate);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const query = `
    SELECT *
    FROM payment_sessions
    ${whereClause}
    ORDER BY created_at DESC
  `;

  const rows = await db(query, params as any);
  return rows.map(mapRowToSession);
}

export async function getMerchantBalance(merchantAppId: string): Promise<number> {
  const rows = await db`
    SELECT COALESCE(SUM(merchant_net_amount), 0) as total
    FROM payment_sessions
    WHERE merchant_app_id = ${merchantAppId}
      AND status = 'paid'
  `;

  return Number(rows[0].total);
}
