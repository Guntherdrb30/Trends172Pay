import type { PaymentSession } from "@/types/payment";
import { getPaymentProvider } from "@/lib/payments/providerRouter";

interface C2PPaymentRequest {
  destinationMobileNumber: string;
  payerMobileNumber: string;
  payerId: string;
  amount: number;
  currency: string;
  otp: string;
  ipAddress: string;
}

interface C2PResponse {
  success: boolean;
  reference?: string;
  error?: string;
  raw?: unknown;
}

// Compat wrapper: mantiene la firma previa para evitar roturas.
// El flujo principal ahora usa el adapter de proveedores.
export async function processC2PPayment(
  req: C2PPaymentRequest
): Promise<C2PResponse> {
  const provider = getPaymentProvider("mercantil");

  const session: PaymentSession = {
    id: "legacy-session",
    merchantAppId: "legacy-merchant",
    businessCode: "LEGACY",
    originSystem: "legacy",
    amount: req.amount,
    currency: req.currency,
    platformFeeAmount: 0,
    merchantNetAmount: req.amount,
    description: "Legacy C2P call",
    status: "processing",
    successUrl: "",
    cancelUrl: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    providerCode: "mercantil"
  };

  const result = await provider.processC2P({
    session,
    payerId: req.payerId,
    payerMobile: req.payerMobileNumber,
    otp: req.otp,
    ipAddress: req.ipAddress
  });

  return {
    success: result.outcome === "approved",
    reference: result.providerReference,
    error: result.outcome === "approved" ? undefined : result.message,
    raw: result.raw
  };
}
