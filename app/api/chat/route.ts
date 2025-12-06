import { google } from "@ai-sdk/google";
import { streamText, convertToCoreMessages } from "ai";
import { z } from "zod";
import { getMerchantByEmail, getMerchantByBusinessCode, listMerchants } from "@/lib/merchantAppStore";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    const systemContext = `
    Eres "TrendBot", el asistente experto en integración de la pasarela de pagos trends172 Pay.
    Tu objetivo es guiar a desarrolladores y dueños de negocios para conectar sus aplicaciones con nuestra plataforma.

    INFORMACIÓN TÉCNICA CLAVE:
    1. Base URL de API: https://trends172-pay.vercel.app/api/v1
    2. Autenticación: Header 'x-api-key' (se obtiene en el Dashboard > Integración).
    3. Flujo de Pago:
       a. El comercio (backend) llama a POST /api/v1/payment-sessions con { amount, currency, description, orderId, returnUrl... }
       b. La API responde con una { checkoutUrl }.
       c. El comercio redirige al usuario a esa URL.
       d. El usuario paga (Tarjeta o Pago Móvil).
       e. trends172 redirige al usuario de vuelta a 'returnUrl'.
    4. Dashboard: Disponible en /dashboard (requiere autenticación). Muestra saldo y transacciones.
    
    TONO Y ESTILO:
    - Profesional pero cercano.
    - Conciso: da respuestas directas.
    - Si te piden código, usa ejemplos en JavaScript/Node.js o cURL.
    - Si no sabes algo, sugiere contactar a soporte humano: soporte@trends172.com
    
    INSTRUCCIONES DE INTERACCIÓN:
    - Si el usuario dice "Hola", preséntate y ofrece ayuda para integrar la pasarela.
    - Si preguntan por "credenciales", guíalos a /dashboard/integration.
    - Si preguntan cómo funciona, explica los 3 pasos del flujo.
  `;

    try {
        const result = await streamText({
            model: google("gemini-1.5-flash"),
            system: systemContext,
            messages: convertToCoreMessages(messages),
            tools: {
                getMerchantDetails: {
                    description: "Obtiene información pública de un comercio registrado dado su email o código de negocio.",
                    parameters: z.object({
                        email: z.string().optional().describe("El correo electrónico del comercio a buscar"),
                        businessCode: z.string().optional().describe("El código único del negocio (ej: CARPIHOGAR)")
                    }),
                    execute: async ({ email, businessCode }) => {
                        console.log("Tool executing: getMerchantDetails", { email, businessCode });
                        try {
                            if (email) {
                                const m = await getMerchantByEmail(email);
                                if (!m) return "No se encontró ningún comercio con ese correo.";
                                return JSON.stringify({ name: m.displayName, code: m.businessCode, currency: m.payoutCurrency, tech: m.techStackHint });
                            }
                            if (businessCode) {
                                const m = await getMerchantByBusinessCode(businessCode);
                                if (!m) return "No se encontró ningún comercio con ese código.";
                                return JSON.stringify({ name: m.displayName, email: m.contactEmail || "No público", currency: m.payoutCurrency });
                            }
                            return "Debes proporcionar un email o un businessCode.";
                        } catch (e: any) {
                            return `Error consultando BD: ${e.message}`;
                        }
                    },
                },
                countMerchants: {
                    description: "Cuenta cuántos comercios hay registrados en total en la plataforma.",
                    parameters: z.object({}),
                    execute: async () => {
                        // Implementación rápida directa
                        // Nota: Idealmente importar una función optimizada
                        try {
                            const list = await listMerchants();
                            return `Actualmente hay ${list.length} comercios registrados.`;
                        } catch (e: any) {
                            return `Error contando: ${e.message}`;
                        }
                    }
                }
            },
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error("Error in AI Chat:", error);
        return new Response("Error procesando tu solicitud de IA. Verifica tu API Key.", { status: 500 });
    }
}
