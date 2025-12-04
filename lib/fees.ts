import { MerchantApp } from "@/types/payment";

// Helper centralizado para calcular comisiones por sesión de pago.
// - platformFeeAmount: lo que retiene trends172 según el porcentaje
//   configurado en el MerchantApp.
// - merchantNetAmount: lo que se liquida al negocio.
export function calculateFees(amount: number, merchant: MerchantApp) {
  const platformFeeAmount = +(
    amount *
    (merchant.commissionPercent / 100)
  ).toFixed(2);
  const merchantNetAmount = +(amount - platformFeeAmount).toFixed(2);

  return { platformFeeAmount, merchantNetAmount };
}

