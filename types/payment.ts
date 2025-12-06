// Tipos de dominio principales para trends172 Pay.
// No contienen lógica, solo definen la forma de los datos que
// se compartirán entre stores, servicios y APIs.

export type PaymentStatus = "pending" | "processing" | "paid" | "failed";

// Representa un negocio / instalación que utiliza la pasarela.
export interface MerchantApp {
  id: string;
  businessCode: string; // Código corto único, ej: "CARPIHOGAR"
  displayName: string; // Nombre comercial del negocio
  apiKey: string; // Clave privada para consumir la API pública /v1

  logoUrl?: string;
  allowedDomains?: string[];

  webhookUrl?: string;
  webhookSecret?: string;
  techStackHint?: string;

  // Condiciones comerciales
  commissionPercent: number; // Porcentaje de comisión que retiene trends172
  payoutCurrency: string; // "VES" o "USD"
  payoutBankName?: string;
  payoutAccountNumber?: string;
  payoutAccountHolder?: string;

  // Contacto y notas internas
  contactName?: string;
  contactEmail?: string;
  notes?: string;

  // Autenticación y Saldo (Nuevo)
  email?: string; // Para login
  passwordHash?: string; // Para login
  balanceCurrency?: string; // Moneda principal del saldo (generalmente USD)

  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// Representa una sesión de pago creada por un MerchantApp.
export interface PaymentSession {
  id: string;

  // Asociación directa con el negocio al que pertenece el pago.
  merchantAppId: string;

  // businessCode se guarda de forma redundante para facilitar
  // filtros y reportes rápidos sin joins.
  businessCode: string;

  // Indica desde qué parte de la plataforma del cliente se originó
  // el pago (ecommerce, landing, app, etc.).
  originSystem: string;

  // Monto total cobrado al usuario final.
  amount: number;
  currency: string;

  // Comisión absoluta de trends172 para esta sesión, calculada
  // en función del porcentaje de comisión del MerchantApp.
  platformFeeAmount: number;

  // Neto que le corresponde al negocio después de aplicar la comisión.
  merchantNetAmount: number;

  description: string;
  status: PaymentStatus;

  // Datos opcionales del cliente final.
  customerName?: string;
  customerEmail?: string;

  // URLs de redirección hacia la plataforma del cliente.
  successUrl: string;
  cancelUrl: string;

  // Identificadores externos.
  externalOrderId?: string; // ID de pedido en el sistema del cliente
  bankPaymentId?: string; // ID devuelto por el banco / proveedor

  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

