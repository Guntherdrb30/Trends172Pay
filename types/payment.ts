export type PaymentStatus = "pending" | "processing" | "paid" | "failed";
export type PaymentProviderCode = "mercantil";

export interface MerchantApp {
  id: string;
  businessCode: string;
  displayName: string;
  apiKey: string;
  defaultProviderCode?: PaymentProviderCode;

  logoUrl?: string;
  allowedDomains?: string[];

  webhookUrl?: string;
  webhookSecret?: string;
  techStackHint?: string;

  commissionPercent: number;
  payoutCurrency: string;
  payoutBankName?: string;
  payoutAccountNumber?: string;
  payoutAccountHolder?: string;

  contactName?: string;
  contactEmail?: string;
  notes?: string;

  email?: string;
  passwordHash?: string;
  balanceCurrency?: string;

  createdAt: string;
  updatedAt: string;
}

export interface PaymentSession {
  id: string;
  merchantAppId: string;
  businessCode: string;
  originSystem: string;

  amount: number;
  currency: string;
  platformFeeAmount: number;
  merchantNetAmount: number;

  description: string;
  status: PaymentStatus;

  paymentMethod?: string;
  commissionAmount?: number;
  customerName?: string;
  customerEmail?: string;

  successUrl: string;
  cancelUrl: string;

  externalOrderId?: string;
  bankPaymentId?: string;
  providerCode?: PaymentProviderCode;
  providerReference?: string;
  providerRawStatus?: string;
  failureCode?: string;
  failureReason?: string;
  idempotencyKey?: string;
  paidAt?: string;
  processingStartedAt?: string;
  lastProviderSyncAt?: string;
  providerMetadata?: unknown;

  createdAt: string;
  updatedAt: string;
}
