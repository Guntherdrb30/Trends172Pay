import crypto from "crypto";
import type {
  CreateHostedPaymentInput,
  CreateHostedPaymentResult,
  PaymentProviderAdapter,
  ProcessC2PInput,
  ProviderOperationResult,
  QueryPaymentStatusInput
} from "@/lib/payments/types";

const MERCANTIL_CODE = "mercantil" as const;
const RETRY_ATTEMPTS = 2;

interface MercantilConfig {
  clientId?: string;
  merchantId?: string;
  integratorId: string;
  c2pUrl?: string;
  transferSearchUrl?: string;
  buttonUrl?: string;
  encryptKey?: string;
}

function getMercantilConfig(): MercantilConfig {
  return {
    clientId: process.env.MERCANTIL_CLIENT_ID,
    merchantId: process.env.MERCANTIL_MERCHANT_ID,
    integratorId: process.env.MERCANTIL_INTEGRATOR_ID ?? "1",
    c2pUrl: process.env.MERCANTIL_C2P_URL,
    transferSearchUrl: process.env.MERCANTIL_TRANSFER_SEARCH_ENDPOINT_SANDBOX,
    buttonUrl: process.env.MERCANTIL_BUTTON_ENDPOINT_SANDBOX,
    encryptKey: process.env.MERCANTIL_ENCRYPT_KEY ?? process.env.MERCANTIL_CRYPTO_KEY
  };
}

function normalizedAes128Key(input: string): Buffer {
  const raw = Buffer.from(input, "utf-8");
  if (raw.length === 16) return raw;
  if (raw.length > 16) return raw.subarray(0, 16);

  const output = Buffer.alloc(16);
  raw.copy(output);
  return output;
}

function encryptPayload(jsonPayload: string, key: string): string {
  const keyBuffer = normalizedAes128Key(key);
  const cipher = crypto.createCipheriv("aes-128-ecb", keyBuffer, null);
  let encrypted = cipher.update(jsonPayload, "utf8", "base64");
  encrypted += cipher.final("base64");
  return encrypted;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  attempts = RETRY_ATTEMPTS,
  timeoutMs = 20000
): Promise<Response> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= attempts; attempt++) {
    try {
      const timeoutSignal =
        typeof AbortSignal !== "undefined" && "timeout" in AbortSignal
          ? (AbortSignal as any).timeout(timeoutMs)
          : undefined;
      const response = await fetch(url, {
        ...init,
        signal: init.signal ?? timeoutSignal
      });
      if (response.status >= 500 && attempt < attempts) {
        await sleep(150 * 2 ** attempt);
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await sleep(150 * 2 ** attempt);
        continue;
      }
      throw error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Error de red desconocido.");
}

function readPath(source: any, path: string): unknown {
  const keys = path.split(".");
  let current: any = source;

  for (const key of keys) {
    if (!current || typeof current !== "object") return undefined;
    current = current[key];
  }

  return current;
}

function firstValue(source: any, paths: string[]): unknown {
  for (const path of paths) {
    const value = readPath(source, path);
    if (value !== undefined && value !== null && value !== "") return value;
  }

  return undefined;
}

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function mapMercantilOutcome(raw: any): {
  outcome: ProviderOperationResult["outcome"];
  reference?: string;
  rawStatus?: string;
  code?: string;
  message?: string;
} {
  const rawStatus = firstValue(raw, [
    "transaction_response.status",
    "transaction_response.trx_status",
    "transaction.status",
    "status",
    "response.status"
  ]);
  const rawCode = firstValue(raw, [
    "transaction_response.code",
    "transaction_response.status_code",
    "code",
    "response.code"
  ]);
  const rawMessage = firstValue(raw, [
    "transaction_response.message",
    "message",
    "response.message",
    "error.message"
  ]);
  const reference = firstValue(raw, [
    "transaction_response.reference",
    "transaction_response.trx_id",
    "transaction_response.authorization",
    "reference",
    "transaction.id"
  ]);

  const status = normalizeText(rawStatus);
  const code = normalizeText(rawCode);

  const approvedStatuses = [
    "approved",
    "success",
    "succeeded",
    "paid",
    "aprobado",
    "completado"
  ];
  const pendingStatuses = ["pending", "processing", "in_process", "in_progress"];
  const declinedStatuses = [
    "declined",
    "rejected",
    "failed",
    "error",
    "denied",
    "denegado"
  ];

  if (approvedStatuses.includes(status) || code === "00" || code === "0") {
    return {
      outcome: "approved",
      reference: reference ? String(reference) : undefined,
      rawStatus: rawStatus ? String(rawStatus) : undefined,
      code: rawCode ? String(rawCode) : undefined,
      message: rawMessage ? String(rawMessage) : undefined
    };
  }

  if (pendingStatuses.includes(status)) {
    return {
      outcome: "pending",
      reference: reference ? String(reference) : undefined,
      rawStatus: rawStatus ? String(rawStatus) : undefined,
      code: rawCode ? String(rawCode) : undefined,
      message: rawMessage ? String(rawMessage) : undefined
    };
  }

  if (declinedStatuses.includes(status)) {
    return {
      outcome: "declined",
      reference: reference ? String(reference) : undefined,
      rawStatus: rawStatus ? String(rawStatus) : undefined,
      code: rawCode ? String(rawCode) : undefined,
      message: rawMessage ? String(rawMessage) : undefined
    };
  }

  if (status || code) {
    return {
      outcome: "pending",
      reference: reference ? String(reference) : undefined,
      rawStatus: rawStatus ? String(rawStatus) : undefined,
      code: rawCode ? String(rawCode) : undefined,
      message: rawMessage ? String(rawMessage) : undefined
    };
  }

  return {
    outcome: "error",
    reference: reference ? String(reference) : undefined,
    rawStatus: rawStatus ? String(rawStatus) : undefined,
    code: rawCode ? String(rawCode) : undefined,
    message: rawMessage ? String(rawMessage) : undefined
  };
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => ({}));
  }

  const text = await response.text().catch(() => "");
  return text || {};
}

async function processC2P({
  session,
  payerId,
  payerMobile,
  otp,
  ipAddress
}: ProcessC2PInput): Promise<ProviderOperationResult> {
  const config = getMercantilConfig();

  if (!config.clientId || !config.merchantId || !config.c2pUrl || !config.encryptKey) {
    return {
      providerCode: MERCANTIL_CODE,
      outcome: "error",
      code: "provider_not_configured",
      message:
        "Faltan variables de entorno de Mercantil para C2P (CLIENT_ID, MERCHANT_ID, C2P_URL, ENCRYPT_KEY).",
      retryable: false
    };
  }

  const transactionData = {
    merchant_identify: {
      integratorId: config.integratorId,
      merchantId: config.merchantId,
      terminalId: "1"
    },
    client_identify: {
      ipaddress: ipAddress,
      browser_agent: "Trends172Pay/1.0",
      mobile_number: payerMobile,
      customer_id: payerId
    },
    transaction: {
      amount: session.amount,
      currency: session.currency,
      payment_method: "c2p",
      otp
    }
  };

  const encrypted = encryptPayload(JSON.stringify(transactionData), config.encryptKey);

  const requestBody = JSON.stringify({
    merchant_identify: {
      integratorId: config.integratorId,
      merchantId: config.merchantId,
      terminalId: "1"
    },
    transaction_encrypted: encrypted
  });

  let response: Response;
  try {
    response = await fetchWithRetry(config.c2pUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-IBM-Client-Id": config.clientId
      },
      body: requestBody
    });
  } catch (error) {
    return {
      providerCode: MERCANTIL_CODE,
      outcome: "error",
      code: "network_error",
      message: error instanceof Error ? error.message : "Error de red con Mercantil.",
      retryable: true
    };
  }

  const raw = await parseResponseBody(response);
  if (!response.ok) {
    return {
      providerCode: MERCANTIL_CODE,
      outcome: response.status >= 500 ? "error" : "declined",
      code: `http_${response.status}`,
      message: "Mercantil devolvió un error HTTP.",
      raw,
      retryable: response.status >= 500
    };
  }

  const mapped = mapMercantilOutcome(raw);
  return {
    providerCode: MERCANTIL_CODE,
    outcome: mapped.outcome,
    providerReference: mapped.reference,
    providerRawStatus: mapped.rawStatus,
    code: mapped.code,
    message: mapped.message,
    raw,
    retryable: mapped.outcome === "pending"
  };
}

async function queryPaymentStatus({
  session
}: QueryPaymentStatusInput): Promise<ProviderOperationResult> {
  const config = getMercantilConfig();

  if (!config.clientId || !config.merchantId || !config.transferSearchUrl) {
    return {
      providerCode: MERCANTIL_CODE,
      outcome: "pending",
      code: "provider_not_configured",
      message:
        "MERCANTIL_TRANSFER_SEARCH_ENDPOINT_SANDBOX no está configurado. Se mantiene estado pendiente.",
      retryable: false
    };
  }

  const reference = session.bankPaymentId ?? session.providerReference ?? session.id;
  const body = JSON.stringify({
    merchant_identify: {
      integratorId: config.integratorId,
      merchantId: config.merchantId,
      terminalId: "1"
    },
    transaction: {
      reference
    }
  });

  let response: Response;
  try {
    response = await fetchWithRetry(config.transferSearchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-IBM-Client-Id": config.clientId
      },
      body
    });
  } catch (error) {
    return {
      providerCode: MERCANTIL_CODE,
      outcome: "error",
      code: "network_error",
      message: error instanceof Error ? error.message : "Error de red consultando Mercantil.",
      retryable: true
    };
  }

  const raw = await parseResponseBody(response);
  if (!response.ok) {
    return {
      providerCode: MERCANTIL_CODE,
      outcome: response.status >= 500 ? "error" : "declined",
      code: `http_${response.status}`,
      message: "Mercantil devolvió error al consultar estado.",
      raw,
      retryable: response.status >= 500
    };
  }

  const mapped = mapMercantilOutcome(raw);
  return {
    providerCode: MERCANTIL_CODE,
    outcome: mapped.outcome,
    providerReference: mapped.reference ?? reference,
    providerRawStatus: mapped.rawStatus,
    code: mapped.code,
    message: mapped.message,
    raw,
    retryable: mapped.outcome === "pending"
  };
}

function resolveBaseUrl(request: Request): string {
  const protocol = request.headers.get("x-forwarded-proto") || "http";
  const host = request.headers.get("host");
  if (host) return `${protocol}://${host}`;
  return process.env.BASE_URL ?? "http://localhost:3000";
}

async function createHostedPayment({
  session,
  request
}: CreateHostedPaymentInput): Promise<CreateHostedPaymentResult> {
  const config = getMercantilConfig();
  const baseUrl = resolveBaseUrl(request);

  if (config.buttonUrl) {
    const encodedRef = encodeURIComponent(session.id);
    const encodedAmount = encodeURIComponent(String(session.amount));
    const encodedCurrency = encodeURIComponent(String(session.currency));
    const redirectUrl = config.buttonUrl
      .replace("{sessionId}", encodedRef)
      .replace("{amount}", encodedAmount)
      .replace("{currency}", encodedCurrency);

    return {
      providerCode: MERCANTIL_CODE,
      redirectUrl
    };
  }

  const fallbackUrl = `${baseUrl}/mock-bank/login?sessionId=${encodeURIComponent(
    session.id
  )}&amount=${encodeURIComponent(String(session.amount))}&currency=${encodeURIComponent(
    String(session.currency)
  )}`;

  return {
    providerCode: MERCANTIL_CODE,
    redirectUrl: fallbackUrl
  };
}

export const mercantilProvider: PaymentProviderAdapter = {
  code: MERCANTIL_CODE,
  createHostedPayment,
  processC2P,
  queryPaymentStatus
};
