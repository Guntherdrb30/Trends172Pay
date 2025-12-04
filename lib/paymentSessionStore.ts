import {
  PaymentSession,
  PaymentStatus,
  MerchantApp
} from "@/types/payment";
import { calculateFees } from "./fees";
import { getMerchantById } from "./merchantAppStore";

// Almacenamiento en memoria de PaymentSession.
// Cada sesión de pago está asociada a un MerchantApp específico mediante:
// - merchantAppId (referencia directa)
// - businessCode (para filtros / reportes rápidos)
const paymentSessions: PaymentSession[] = [];

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `ps_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

// Datos mínimos necesarios para crear una PaymentSession desde la capa de
// aplicación. La comisión y el businessCode se calculan internamente a partir
// del MerchantApp asociado.
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
}

// Crea una nueva PaymentSession en memoria.
// - Busca el MerchantApp correspondiente (por merchantAppId).
// - Calcula la comisión de trends172 y el neto del negocio usando calculateFees.
// - Asocia la sesión al negocio vía merchantAppId y businessCode.
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

  const session: PaymentSession = {
    id: generateId(),

    // Asociación fuerte a MerchantApp.
    merchantAppId: merchant.id,
    businessCode: merchant.businessCode,

    originSystem: input.originSystem,
    amount: input.amount,
    currency: input.currency,

    // La comisión depende del tipo de negocio:
    // usamos merchant.commissionPercent para obtener la parte de trends172
    // (platformFeeAmount) y el neto para el cliente (merchantNetAmount).
    platformFeeAmount,
    merchantNetAmount,

    description: input.description,
    status,

    customerName: input.customerName,
    customerEmail: input.customerEmail,
    successUrl: input.successUrl,
    cancelUrl: input.cancelUrl,
    externalOrderId: input.externalOrderId,
    bankPaymentId: input.bankPaymentId,

    createdAt: now,
    updatedAt: now
  };

  paymentSessions.push(session);
  return session;
}

export async function getSessionById(
  id: string
): Promise<PaymentSession | null> {
  const session = paymentSessions.find((s) => s.id === id);
  return session ?? null;
}

export async function updateSession(
  id: string,
  partial: Partial<PaymentSession>
): Promise<PaymentSession> {
  const index = paymentSessions.findIndex((s) => s.id === id);
  if (index === -1) {
    throw new Error(`PaymentSession con id "${id}" no encontrada.`);
  }

  const existing = paymentSessions[index];
  const now = new Date().toISOString();

  const updated: PaymentSession = {
    ...existing,
    ...partial,
    id: existing.id,
    merchantAppId: existing.merchantAppId,
    businessCode: existing.businessCode,
    createdAt: existing.createdAt,
    updatedAt: now
  };

  paymentSessions[index] = updated;
  return updated;
}

export async function listSessionsByBusinessCode(
  code: string
): Promise<PaymentSession[]> {
  return paymentSessions.filter((s) => s.businessCode === code);
}

export async function listSessions(filters?: {
  businessCode?: string;
  originSystem?: string;
  status?: PaymentStatus;
  fromDate?: string;
  toDate?: string;
}): Promise<PaymentSession[]> {
  if (!filters) {
    return [...paymentSessions];
  }

  const { businessCode, originSystem, status, fromDate, toDate } = filters;
  let result = [...paymentSessions];

  if (businessCode) {
    result = result.filter((s) => s.businessCode === businessCode);
  }

  if (originSystem) {
    result = result.filter((s) => s.originSystem === originSystem);
  }

  if (status) {
    result = result.filter((s) => s.status === status);
  }

  if (fromDate) {
    const from = new Date(fromDate);
    if (!Number.isNaN(from.getTime())) {
      result = result.filter(
        (s) => new Date(s.createdAt).getTime() >= from.getTime()
      );
    }
  }

  if (toDate) {
    const to = new Date(toDate);
    if (!Number.isNaN(to.getTime())) {
      result = result.filter(
        (s) => new Date(s.createdAt).getTime() <= to.getTime()
      );
    }
  }

  return result;
}

