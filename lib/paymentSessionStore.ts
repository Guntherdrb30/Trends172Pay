import {
  PaymentSession,
  PaymentStatus,
  MerchantApp
} from "@/types/payment";
import { db } from "@/lib/db";
import { calculateFees } from "./fees";
import { getMerchantById } from "./merchantAppStore";

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `ps_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
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
    commissionAmount: row.commission_amount ? Number(row.commission_amount) : undefined,
    customerName: row.customer_name ?? undefined,
    customerEmail: row.customer_email ?? undefined,
    successUrl: row.success_url,
    cancelUrl: row.cancel_url,
    externalOrderId: row.external_order_id ?? undefined,
    bankPaymentId: row.bank_payment_id ?? undefined,
    createdAt: row.created_at?.toISOString
      ? row.created_at.toISOString()
      : String(row.created_at),
    updatedAt: row.updated_at?.toISOString
      ? row.updated_at.toISOString()
      : String(row.updated_at)
  };
}

export async function createSession(
  input: CreateSessionInput
): Promise<PaymentSession> {
  const merchant: MerchantApp | null = await getMerchantById(
    input.merchantAppId
  );
  if (!merchant) {
    throw new Error(
      `No se encontró MerchantApp con id "${input.merchantAppId}".`
    );
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
      commission_amount
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
      ${input.commissionAmount ?? null}
    )
    RETURNING *
  `;

  return mapRowToSession(rows[0]);
}

export async function getSessionById(
  id: string
): Promise<PaymentSession | null> {
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
      updated_at = ${now}::timestamptz
    WHERE id = ${id}
    RETURNING *
  `;

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

  // Usamos una plantilla dinámica simple: @neondatabase/serverless
  // no soporta parametrización posicional con $n fácilmente, así que
  // construimos la consulta mediante un join manual.
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

