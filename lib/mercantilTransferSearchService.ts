import type { PaymentSession, PaymentStatus } from "@/types/payment";

// Resultado genérico de una búsqueda de pago en el banco.
// Más adelante se adaptará a la respuesta real de la API de Mercantil.
export interface TransferSearchResult {
  status: PaymentStatus;
  rawResponse: unknown;
}

// Interfaz de un servicio que consulta el estado de un pago en el banco
// a partir de la información de la PaymentSession.
// En el futuro, aquí se usarán las variables de entorno:
// - MERCANTIL_TRANSFER_SEARCH_ENDPOINT_SANDBOX
// - MERCANTIL_CLIENT_ID
// - MERCANTIL_MERCHANT_ID
// - MERCANTIL_INTEGRATOR_ID
// - MERCANTIL_CRYPTO_KEY
//
// TODO: Mapear el payload y la firma exactamente según la documentación
// oficial del banco Mercantil.
export async function searchPaymentStatusForSession(
  _session: PaymentSession
): Promise<TransferSearchResult> {
  // Implementación stub: asumimos que el pago siempre se acredita (paid).
  // La llamada real hará un fetch al endpoint de Mercantil y parseará
  // el estado del pago y la respuesta cruda.
  const simulatedStatus: PaymentStatus = "paid";

  return {
    status: simulatedStatus,
    rawResponse: {
      simulated: true,
      provider: "mercantil",
      note:
        "Este es un resultado simulado. Aquí se incluirá la respuesta real del banco."
    }
  };
}

