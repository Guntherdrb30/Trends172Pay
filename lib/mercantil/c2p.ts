
import crypto from 'crypto';

interface C2PPaymentRequest {
    destinationMobileNumber: string; // Telf del comercio (credencial) o destino
    payerMobileNumber: string;       // Telf del cliente
    payerId: string;                 // Cedula del cliente (V123456)
    amount: number;
    currency: string;                // VES
    otp: string;                     // Clave de compra
    ipAddress: string;
}

interface C2PResponse {
    success: boolean;
    reference?: string;
    error?: string;
    raw?: any;
}

const ALGORITHM = 'aes-128-ecb';

function getKey() {
    const key = process.env.MERCANTIL_ENCRYPT_KEY;
    if (!key) throw new Error("MERCANTIL_ENCRYPT_KEY no configurada");
    return key;
}

function encrypt(text: string): string {
    const key = getKey();
    // Mercantil usa AES-128-ECB. La clave debe ser string (utf8) o buffer.
    // Aseguramos que sea buffer utf8.
    const keyBuffer = Buffer.from(key, 'utf-8');

    const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, null);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}

export async function processC2PPayment(req: C2PPaymentRequest): Promise<C2PResponse> {
    const merchantId = process.env.MERCANTIL_MERCHANT_ID;
    const clientId = process.env.MERCANTIL_CLIENT_ID;
    const apiUrl = process.env.MERCANTIL_C2P_URL;

    if (!merchantId || !clientId || !apiUrl) {
        throw new Error("Faltan variables de entorno de Mercantil (MERCHANT_ID, CLIENT_ID, C2P_URL)");
    }

    // Estructura del payload C2P Mercantil (basado en estándares habituales de ellos)
    // Nota: La estructura exacta puede variar según la versión del API. 
    // Usaremos la estructura estándar JSON para C2P.

    const transactionData = {
        "merchant_identify": {
            "integratorId": "1", // Generalmente 1 o vacio si somos directos
            "merchantId": merchantId,
            "terminalId": "1" // Defecto web
        },
        "client_identify": {
            "ipaddress": req.ipAddress,
            "browser_agent": "Trends172Pay/1.0",
            "mobile_number": req.payerMobileNumber,
            "customer_id": req.payerId
        },
        "transaction": {
            "amount": req.amount,
            "currency": req.currency, // "VES"
            "payment_method": "c2p",
            "otp": req.otp
        }
    };

    // Convertir a string y encriptar
    const jsonString = JSON.stringify(transactionData);
    const encryptedPayload = encrypt(jsonString);

    // Payload final que se envía al API
    const body = JSON.stringify({
        "merchant_identify": {
            "integratorId": "1",
            "merchantId": merchantId,
            "terminalId": "1"
        },
        "transaction_encrypted": encryptedPayload
    });

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-IBM-Client-Id': clientId,
                'Accept': 'application/json'
            },
            body: body
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Mercantil API Error:", response.status, errorText);
            return { success: false, error: `Error del Banco: ${response.status}` };
        }

        const json = await response.json();

        // Analizar respuesta 
        // Mercantil suele retornar algo como { "transaction_response": { "status": "approved", ... } }
        // OJO: En sandbox a veces retorna distinto. Asumiremos estructura estándar.

        // Si la respuesta es exitosa lógica de negocio
        // Ajustar según documentation real. 
        // Por ahora, asumimos que si status HTTP es 200 y no hay campo de error explícito, es éxito.

        return {
            success: true,
            reference: json?.transaction_response?.trx_status || "simulated_ref",
            raw: json
        };

    } catch (error: any) {
        console.error("Excepción en llamada Mercantil C2P:", error);
        return { success: false, error: error.message };
    }
}
