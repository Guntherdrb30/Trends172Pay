import type { PaymentProviderCode } from "@/types/payment";
import type { PaymentProviderAdapter } from "@/lib/payments/types";
import { mercantilProvider } from "@/lib/payments/providers/mercantilProvider";

const providers: Record<PaymentProviderCode, PaymentProviderAdapter> = {
  mercantil: mercantilProvider
};

function normalizeProviderCode(
  providerCode?: string | null
): PaymentProviderCode {
  if (!providerCode) return "mercantil";

  const normalized = providerCode.toLowerCase().trim();
  if (normalized === "mercantil") return "mercantil";
  return "mercantil";
}

export function getPaymentProvider(
  providerCode?: string | null
): PaymentProviderAdapter {
  const code = normalizeProviderCode(providerCode);
  return providers[code];
}
