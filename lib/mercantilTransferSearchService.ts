import type { PaymentSession, PaymentStatus } from "@/types/payment";
import { getPaymentProvider } from "@/lib/payments/providerRouter";

export interface TransferSearchResult {
  status: PaymentStatus;
  rawResponse: unknown;
}

export async function searchPaymentStatusForSession(
  session: PaymentSession
): Promise<TransferSearchResult> {
  const provider = getPaymentProvider(session.providerCode ?? "mercantil");
  const result = await provider.queryPaymentStatus({ session });

  const status: PaymentStatus =
    result.outcome === "approved"
      ? "paid"
      : result.outcome === "declined"
        ? "failed"
        : session.status === "paid" || session.status === "failed"
          ? session.status
          : "processing";

  return {
    status,
    rawResponse: result.raw
  };
}
