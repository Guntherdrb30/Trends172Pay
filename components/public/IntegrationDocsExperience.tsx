"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clipboard,
  Code2,
  Rocket,
  Terminal,
  Webhook
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type QuickstartLang = "curl" | "node" | "python";

function CopyButton({
  value,
  onCopied
}: {
  value: string;
  onCopied: () => void;
}) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      onCopied();
    } catch {
      // Silent fail to keep UX clean if clipboard permission is blocked.
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 border-slate-700 text-slate-300 hover:bg-slate-800"
      onClick={copy}
    >
      <Clipboard className="mr-2 h-3.5 w-3.5" />
      Copiar
    </Button>
  );
}

function CodePanel({
  title,
  code,
  copied,
  onCopy
}: {
  title: string;
  code: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2">
        <span className="text-xs font-mono uppercase tracking-wide text-slate-500">
          {title}
        </span>
        <div className="flex items-center gap-2">
          {copied ? (
            <span className="inline-flex items-center text-xs text-emerald-400">
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
              Copiado
            </span>
          ) : null}
          <CopyButton value={code} onCopied={onCopy} />
        </div>
      </div>
      <div className="overflow-x-auto p-4">
        <pre className="text-xs leading-relaxed text-slate-200 sm:text-sm">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

export function IntegrationDocsExperience() {
  const [quickLang, setQuickLang] = useState<QuickstartLang>("curl");
  const [copiedKey, setCopiedKey] = useState<string>("");
  const docsBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://tu-dominio.com";

  const snippets = useMemo(() => {
    const payload = `{
  "amount": 125.0,
  "currency": "VES",
  "description": "Pago de prueba",
  "originSystem": "landing-checkout",
  "successUrl": "https://mi-negocio.com/pago/exito",
  "cancelUrl": "https://mi-negocio.com/pago/cancelado",
  "externalOrderId": "ORDER-10025"
}`;

    return {
      curl: `curl -X POST "${docsBaseUrl}/api/v1/payment-sessions" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: TU_API_KEY_DEL_MERCHANT" \\
  -H "idempotency-key: order-10025-v1" \\
  -d '${payload}'`,
      node: `const response = await fetch("${docsBaseUrl}/api/v1/payment-sessions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.TRENDS172_API_KEY,
    "idempotency-key": "order-10025-v1"
  },
  body: JSON.stringify({
    amount: 125.0,
    currency: "VES",
    description: "Pago de prueba",
    originSystem: "landing-checkout",
    successUrl: "https://mi-negocio.com/pago/exito",
    cancelUrl: "https://mi-negocio.com/pago/cancelado",
    externalOrderId: "ORDER-10025"
  })
});

const data = await response.json();
console.log(data.sessionId, data.checkoutUrl);`,
      python: `import requests

url = "${docsBaseUrl}/api/v1/payment-sessions"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "TU_API_KEY_DEL_MERCHANT",
    "idempotency-key": "order-10025-v1"
}
payload = {
    "amount": 125.0,
    "currency": "VES",
    "description": "Pago de prueba",
    "originSystem": "landing-checkout",
    "successUrl": "https://mi-negocio.com/pago/exito",
    "cancelUrl": "https://mi-negocio.com/pago/cancelado",
    "externalOrderId": "ORDER-10025"
}

response = requests.post(url, json=payload, headers=headers, timeout=30)
print(response.status_code, response.json())`,
      response: `{
  "sessionId": "48d8e95d-1aed-48d9-aaf9-4f9c428478d4",
  "checkoutUrl": "${docsBaseUrl}/pay?sessionId=48d8e95d-1aed-48d9-aaf9-4f9c428478d4"
}`,
      polling: `const sessionId = "48d8e95d-1aed-48d9-aaf9-4f9c428478d4";
const statusUrl = "${docsBaseUrl}/api/v1/payment-sessions/" + sessionId;

async function waitForPaid() {
  for (let i = 0; i < 60; i++) {
    const res = await fetch(statusUrl, {
      headers: { "x-api-key": process.env.TRENDS172_API_KEY }
    });
    const json = await res.json();
    const status = json?.session?.status;

    if (status === "paid") return json;
    if (status === "failed") throw new Error("Pago fallido");

    await new Promise((r) => setTimeout(r, 3000));
  }

  throw new Error("Timeout esperando confirmacion de pago");
}`,
      testWebhook: `curl -X POST "${docsBaseUrl}/api/admin/onboarding/test-webhook" \\
  -H "Content-Type: application/json" \\
  -H "x-root-token: TU_ROOT_DASHBOARD_TOKEN" \\
  -d '{
    "businessCode": "CARPIHOGAR",
    "webhookUrl": "https://mi-negocio.com/api/webhooks/trends172",
    "webhookSecret": "mi-secreto"
  }'`
    };
  }, [docsBaseUrl]);

  return (
    <div className="flex flex-col items-center justify-center py-16 animate-in fade-in duration-500">
      <div className="w-full max-w-5xl space-y-10">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6">
            <Code2 className="h-8 w-8 text-cyan-300" />
          </div>
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
            Integracion <span className="text-cyan-300">de verdad</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto">
            Esta guia usa los endpoints reales de Trends172 Pay para crear
            sesiones, abrir checkout y confirmar pagos sin inventar SDKs que no
            existen.
          </p>
        </div>

        <Tabs defaultValue="quickstart" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="h-12 border border-slate-800 bg-slate-900/60">
              <TabsTrigger value="quickstart" className="px-6">
                Quickstart
              </TabsTrigger>
              <TabsTrigger value="sdks" className="px-6">
                SDKs y Librerias
              </TabsTrigger>
              <TabsTrigger value="webhooks" className="px-6">
                Webhooks y Estados
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="quickstart" className="space-y-6">
            <div className="grid gap-4 rounded-xl border border-cyan-700/30 bg-cyan-500/5 p-5 sm:grid-cols-3">
              <div className="rounded-lg border border-cyan-600/30 bg-slate-900/60 p-4">
                <p className="text-xs uppercase tracking-widest text-cyan-300">
                  Paso 1
                </p>
                <p className="mt-1 text-sm text-slate-200">
                  Crea una sesion con `x-api-key` e `idempotency-key`.
                </p>
              </div>
              <div className="rounded-lg border border-cyan-600/30 bg-slate-900/60 p-4">
                <p className="text-xs uppercase tracking-widest text-cyan-300">
                  Paso 2
                </p>
                <p className="mt-1 text-sm text-slate-200">
                  Redirige al cliente al `checkoutUrl` recibido.
                </p>
              </div>
              <div className="rounded-lg border border-cyan-600/30 bg-slate-900/60 p-4">
                <p className="text-xs uppercase tracking-widest text-cyan-300">
                  Paso 3
                </p>
                <p className="mt-1 text-sm text-slate-200">
                  Consulta estado en API hasta `paid` o `failed`.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(["curl", "node", "python"] as QuickstartLang[]).map((lang) => (
                <Button
                  key={lang}
                  variant={quickLang === lang ? "default" : "outline"}
                  className={quickLang === lang ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950" : ""}
                  onClick={() => setQuickLang(lang)}
                >
                  {lang.toUpperCase()}
                </Button>
              ))}
            </div>

            <CodePanel
              title={`quickstart.${quickLang}`}
              code={snippets[quickLang]}
              copied={copiedKey === `quick-${quickLang}`}
              onCopy={() => setCopiedKey(`quick-${quickLang}`)}
            />

            <CodePanel
              title="respuesta.json"
              code={snippets.response}
              copied={copiedKey === "response"}
              onCopy={() => setCopiedKey("response")}
            />
          </TabsContent>

          <TabsContent value="sdks" className="space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <div className="flex items-start gap-3">
                <Rocket className="mt-0.5 h-5 w-5 text-emerald-300" />
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Estado actual de SDKs
                  </h3>
                  <p className="text-sm text-slate-300">
                    Hoy la via recomendada es HTTP directo. Puedes envolverla en
                    helpers internos para tu stack.
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
              <div className="border-b border-slate-800 bg-slate-900 px-4 py-2 text-xs font-mono text-slate-500">
                terminal
              </div>
              <div className="space-y-3 p-4 font-mono text-sm text-slate-200">
                <p>npm install axios</p>
                <p>pip install requests</p>
                <p>composer require guzzlehttp/guzzle</p>
              </div>
            </div>

            <CodePanel
              title="polling.js"
              code={snippets.polling}
              copied={copiedKey === "polling"}
              onCopy={() => setCopiedKey("polling")}
            />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {["Node.js", "Python", "PHP", "Ruby", "Go", "Java", ".NET"].map(
                (lang) => (
                  <div
                    key={lang}
                    className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-center text-xs text-slate-300"
                  >
                    {lang}
                  </div>
                )
              )}
            </div>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                  <Webhook className="h-4 w-4 text-cyan-300" />
                  Modo actual
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  <li>- Consulta de estado por API publica v1.</li>
                  <li>- Endpoint de prueba de webhook para onboarding admin.</li>
                  <li>- Webhooks firmados productivos: roadmap inmediato.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                  <Terminal className="h-4 w-4 text-amber-300" />
                  Endpoints clave
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  <li>- POST /api/v1/payment-sessions</li>
                  <li>- GET /api/v1/payment-sessions/:id</li>
                  <li>- GET /api/v1/payment-sessions/by-external/:externalOrderId</li>
                  <li>- POST /api/admin/onboarding/test-webhook</li>
                </ul>
              </div>
            </div>

            <CodePanel
              title="test-webhook.sh"
              code={snippets.testWebhook}
              copied={copiedKey === "test-webhook"}
              onCopy={() => setCopiedKey("test-webhook")}
            />
          </TabsContent>
        </Tabs>

        <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
          <Button asChild className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
            <Link href="/signup">Activar cuenta para integrar</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <Link href="/pay/demo">Probar checkout demo</Link>
          </Button>
        </div>

        <div className="flex justify-center">
          <Button
            asChild
            variant="ghost"
            className="text-slate-400 hover:bg-slate-900 hover:text-white"
          >
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
