import type { PaymentProviderCode, PaymentSession } from "@/types/payment";

export type ProviderPaymentOutcome = "approved" | "declined" | "pending" | "error";

export interface ProviderOperationResult {
  providerCode: PaymentProviderCode;
  outcome: ProviderPaymentOutcome;
  providerReference?: string;
  providerRawStatus?: string;
  code?: string;
  message?: string;
  retryable?: boolean;
  raw?: unknown;
}

export interface CreateHostedPaymentInput {
  session: PaymentSession;
  request: Request;
}

export interface CreateHostedPaymentResult {
  providerCode: PaymentProviderCode;
  redirectUrl: string;
  raw?: unknown;
}

export interface ProcessC2PInput {
  session: PaymentSession;
  payerId: string;
  payerMobile: string;
  otp: string;
  ipAddress: string;
}

export interface QueryPaymentStatusInput {
  session: PaymentSession;
}

export interface PaymentProviderAdapter {
  code: PaymentProviderCode;
  createHostedPayment(
    input: CreateHostedPaymentInput
  ): Promise<CreateHostedPaymentResult>;
  processC2P(input: ProcessC2PInput): Promise<ProviderOperationResult>;
  queryPaymentStatus(
    input: QueryPaymentStatusInput
  ): Promise<ProviderOperationResult>;
}
