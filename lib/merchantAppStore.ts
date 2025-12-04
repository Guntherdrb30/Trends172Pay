import { MerchantApp } from "@/types/payment";

// Almacenamiento en memoria de MerchantApp.
// En el futuro esto podrá ser reemplazado por una base de datos real
// sin cambiar la interfaz pública de este módulo.
const merchantApps: MerchantApp[] = [];

// Generador sencillo de IDs únicos.
// Usa crypto.randomUUID cuando está disponible y cae a un fallback
// predecible en otros entornos (solo para desarrollo).
function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `m_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

// Genera una apiKey pseudo-aleatoria para un MerchantApp.
function generateApiKey(): string {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return `trends172_${hex}`;
  }

  return `trends172_${Math.random().toString(36).slice(2)}${Date.now().toString(
    36
  )}`;
}

// Inicializa algunos negocios de ejemplo para desarrollo.
// Cada MerchantApp representa un negocio distinto con su propia
// comisión, datos bancarios y configuración técnica.
export async function seedMerchantApps(): Promise<void> {
  if (merchantApps.length > 0) return;

  const now = new Date().toISOString();

  const carpiHogar: MerchantApp = {
    id: generateId(),
    businessCode: "CARPIHOGAR",
    displayName: "Carpi Hogar",
    apiKey: generateApiKey(),
    logoUrl: undefined,
    allowedDomains: ["https://carpihogar.com"],
    webhookUrl: "",
    webhookSecret: "",
    techStackHint: "Laravel",
    commissionPercent: 3.5,
    payoutCurrency: "VES",
    payoutBankName: "Banco de Ejemplo VES",
    payoutAccountNumber: "0102-0000-0000-00000000",
    payoutAccountHolder: "Carpi Hogar C.A.",
    contactName: "Equipo Carpi Hogar",
    contactEmail: "soporte@carpihogar.com",
    notes: "Instalación principal de e-commerce.",
    createdAt: now,
    updatedAt: now
  };

  const academiaX: MerchantApp = {
    id: generateId(),
    businessCode: "ACADEMIA_X",
    displayName: "Academia X Online",
    apiKey: generateApiKey(),
    logoUrl: undefined,
    allowedDomains: ["https://academiax.com"],
    webhookUrl: "",
    webhookSecret: "",
    techStackHint: "WordPress",
    commissionPercent: 5,
    payoutCurrency: "USD",
    payoutBankName: "Banco de Ejemplo USD",
    payoutAccountNumber: "0001-0000-0000-00000000",
    payoutAccountHolder: "Academia X LLC",
    contactName: "Soporte Academia X",
    contactEmail: "pagos@academiax.com",
    notes: "Venta de cursos online.",
    createdAt: now,
    updatedAt: now
  };

  merchantApps.push(carpiHogar, academiaX);
}

export async function listMerchants(): Promise<MerchantApp[]> {
  return [...merchantApps];
}

export async function getMerchantById(
  id: string
): Promise<MerchantApp | null> {
  const merchant = merchantApps.find((m) => m.id === id);
  return merchant ?? null;
}

export async function getMerchantByApiKey(
  apiKey: string
): Promise<MerchantApp | null> {
  const merchant = merchantApps.find((m) => m.apiKey === apiKey);
  return merchant ?? null;
}

export async function getMerchantByBusinessCode(
  code: string
): Promise<MerchantApp | null> {
  const merchant = merchantApps.find((m) => m.businessCode === code);
  return merchant ?? null;
}

export async function createMerchant(
  data: Omit<MerchantApp, "id" | "apiKey" | "createdAt" | "updatedAt">
): Promise<MerchantApp> {
  const now = new Date().toISOString();

  const existsWithCode = merchantApps.some(
    (m) => m.businessCode === data.businessCode
  );
  if (existsWithCode) {
    throw new Error(
      `Ya existe un MerchantApp con businessCode "${data.businessCode}".`
    );
  }

  const merchant: MerchantApp = {
    ...data,
    id: generateId(),
    apiKey: generateApiKey(),
    createdAt: now,
    updatedAt: now
  };

  merchantApps.push(merchant);
  return merchant;
}

export async function updateMerchant(
  id: string,
  partial: Partial<MerchantApp>
): Promise<MerchantApp> {
  const index = merchantApps.findIndex((m) => m.id === id);
  if (index === -1) {
    throw new Error(`MerchantApp con id "${id}" no encontrado.`);
  }

  const existing = merchantApps[index];
  const now = new Date().toISOString();

  const updated: MerchantApp = {
    ...existing,
    ...partial,
    id: existing.id,
    apiKey: existing.apiKey,
    createdAt: existing.createdAt,
    updatedAt: now
  };

  merchantApps[index] = updated;
  return updated;
}

export async function regenerateApiKey(id: string): Promise<MerchantApp> {
  const index = merchantApps.findIndex((m) => m.id === id);
  if (index === -1) {
    throw new Error(`MerchantApp con id "${id}" no encontrado.`);
  }

  const existing = merchantApps[index];
  const now = new Date().toISOString();

  const updated: MerchantApp = {
    ...existing,
    apiKey: generateApiKey(),
    updatedAt: now
  };

  merchantApps[index] = updated;
  return updated;
}

