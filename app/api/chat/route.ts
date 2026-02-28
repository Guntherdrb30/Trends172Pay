import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export const maxDuration = 60;

type InstallationMessage = {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
};

function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

const SYSTEM_PROMPT = `
Eres "Asistente de Instalacion trends172".
Tu trabajo es guiar la instalacion del boton de pago trends172 paso a paso.

Reglas operativas:
1. Prioriza pasos concretos y accionables.
2. Si recibes una imagen, analizala y describe lo que ves antes de recomendar cambios.
3. Si la imagen no es clara, pide otra captura con instrucciones exactas.
4. Siempre responde con este formato:
   - Diagnostico rapido
   - Siguiente paso
   - Checklist de validacion
5. Enfocate en instalacion real:
   - Obtener credenciales en /dashboard/integration
   - Crear session de pago
   - Redirigir a checkoutUrl
   - Verificar resultado (paid o failed)
6. Si detectas riesgo de exponer llaves secretas en frontend, advierte y da alternativa segura.
7. Cuando sea util, recomienda probar en /instalacion-prueba para la primera instalacion.

Contexto tecnico:
- API base: /api/v1
- Header requerido en backend del comercio: x-api-key
- Flujo minimo:
  1) POST /api/v1/payment-sessions
  2) Recibir checkoutUrl
  3) Redirigir cliente a checkoutUrl
`;

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as
      | { messages?: InstallationMessage[] }
      | null;

    const incoming = Array.isArray(body?.messages) ? body.messages : [];
    const normalized = incoming
      .slice(-10)
      .map((message) => {
        const role = message?.role === "assistant" ? "assistant" : "user";
        const content = cleanText(message?.content, 4000);
        const imageUrl = cleanText(message?.imageUrl, 1000);
        return {
          role,
          content,
          imageUrl: isHttpUrl(imageUrl) ? imageUrl : ""
        } as InstallationMessage;
      })
      .filter((message) => message.content || message.imageUrl);

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Falta GOOGLE_GENERATIVE_AI_API_KEY. Configurala para habilitar el asistente de instalacion."
        },
        { status: 500 }
      );
    }

    const modelMessages = normalized.map((message) => {
      if (message.role === "assistant") {
        return {
          role: "assistant" as const,
          content: message.content
        };
      }

      const parts: Array<
        { type: "text"; text: string } | { type: "image"; image: string }
      > = [];

      if (message.content) {
        parts.push({ type: "text", text: message.content });
      }
      if (message.imageUrl) {
        parts.push({ type: "image", image: message.imageUrl });
      }

      if (parts.length === 1 && parts[0].type === "text") {
        return {
          role: "user" as const,
          content: parts[0].text
        };
      }

      return {
        role: "user" as const,
        content: parts.length
          ? parts
          : [{ type: "text" as const, text: "Necesito ayuda con la instalacion." }]
      };
    });

    const result = await generateText({
      model: google("gemini-1.5-flash"),
      system: SYSTEM_PROMPT,
      messages: modelMessages as any,
      temperature: 0.2,
      maxOutputTokens: 700
    });

    return NextResponse.json({ reply: result.text });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    return NextResponse.json(
      { error: "No pude procesar la consulta del asistente." },
      { status: 500 }
    );
  }
}
