"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

type TechStackOption = "WordPress" | "Laravel" | "Next.js" | "Otro" | "";

interface WizardData {
  displayName: string;
  businessCode: string;
  contactName: string;
  contactEmail: string;

  commissionPercent: string;
  payoutCurrency: string;
  payoutBankName: string;
  payoutAccountNumber: string;
  payoutAccountHolder: string;

  techStackHint: TechStackOption;
  webhookUrl: string;
  allowedDomains: string; // como texto separado por comas

  apiKey: string;
  webhookSecret: string;
}

interface TestWebhookResult {
  ok: boolean;
  message: string;
}

function generateRandomToken(prefix: string): string {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return `${prefix}_${hex}`;
  }

  return `${prefix}_${Math.random().toString(36).slice(2)}${Date.now().toString(
    36
  )}`;
}

export default function NewMerchantWizardPage() {
  const router = useRouter();

  const [step, setStep] = useState<WizardStep>(1);
  const [data, setData] = useState<WizardData>({
    displayName: "",
    businessCode: "",
    contactName: "",
    contactEmail: "",
    commissionPercent: "3.50",
    payoutCurrency: "VES",
    payoutBankName: "",
    payoutAccountNumber: "",
    payoutAccountHolder: "",
    techStackHint: "",
    webhookUrl: "",
    allowedDomains: "",
    apiKey: "",
    webhookSecret: ""
  });

  const [error, setError] = useState<string | null>(null);
  const [isGeneratingCreds, setIsGeneratingCreds] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [testWebhookResult, setTestWebhookResult] =
    useState<TestWebhookResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<"apiKey" | "webhookSecret" | null>(null);

  function nextStep() {
    setError(null);
    setStep((prev) => (prev < 6 ? ((prev + 1) as WizardStep) : prev));
  }

  function prevStep() {
    setError(null);
    setStep((prev) => (prev > 1 ? ((prev - 1) as WizardStep) : prev));
  }

  async function handleGenerateCreds() {
    setError(null);
    setTestWebhookResult(null);
    setIsGeneratingCreds(true);
    try {
      setData((prev) => ({
        ...prev,
        apiKey: prev.apiKey || generateRandomToken("trends172_pk"),
        webhookSecret: prev.webhookSecret || generateRandomToken("whsec")
      }));
    } finally {
      setIsGeneratingCreds(false);
    }
  }

  async function handleCopy(value: string, field: "apiKey" | "webhookSecret") {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => {
        setCopiedField(null);
      }, 1500);
    } catch {
      setError("No se pudo copiar al portapapeles.");
    }
  }

  async function handleTestWebhook() {
    setError(null);
    setTestWebhookResult(null);

    if (!data.webhookUrl) {
      setError("Configura un webhookUrl antes de probar la conexión.");
      return;
    }

    setIsTestingWebhook(true);
    try {
      const res = await fetch("/api/admin/onboarding/test-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          webhookUrl: data.webhookUrl,
          webhookSecret: data.webhookSecret || null,
          businessCode: data.businessCode || null
        })
      });

      const json = (await res.json().catch(() => null)) as
        | TestWebhookResult
        | null;

      if (!res.ok || !json) {
        setTestWebhookResult({
          ok: false,
          message:
            json?.message ??
            "No se pudo simular el webhook de prueba. Revisa la URL."
        });
      } else {
        setTestWebhookResult(json);
      }
    } catch (e) {
      console.error("Error al probar webhook:", e);
      setTestWebhookResult({
        ok: false,
        message:
          "Error inesperado al enviar el webhook de prueba. Revisa la consola para más detalles."
      });
    } finally {
      setIsTestingWebhook(false);
    }
  }

  async function handleCreateMerchant() {
    setError(null);
    setIsSubmitting(true);

    try {
      const commissionPercent = parseFloat(data.commissionPercent || "0");
      const allowedDomains =
        data.allowedDomains
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean) ?? [];

      const res = await fetch("/api/admin/merchants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
          // En entornos más avanzados, aquí se podría añadir
          // un header x-root-token para proteger el dashboard.
        },
        body: JSON.stringify({
          businessCode: data.businessCode,
          displayName: data.displayName,
          logoUrl: null,
          allowedDomains,
          webhookUrl: data.webhookUrl || null,
          webhookSecret: data.webhookSecret || null,
          techStackHint: data.techStackHint || null,
          // Las siguientes condiciones comerciales y bancarias
          // determinan cómo se calcularán comisiones y pagos.
          commissionPercent: Number.isNaN(commissionPercent)
            ? 0
            : commissionPercent,
          payoutCurrency: data.payoutCurrency || "VES",
          payoutBankName: data.payoutBankName || null,
          payoutAccountNumber: data.payoutAccountNumber || null,
          payoutAccountHolder: data.payoutAccountHolder || null,
          contactName: data.contactName || null,
          contactEmail: data.contactEmail || null,
          notes: null,
          // apiKey se generará en el backend; aquí solo se utiliza
          // para mostrar un ejemplo de cómo luciría.
          apiKey: data.apiKey || undefined
        })
      });

      const json = (await res.json().catch(() => null)) as
        | { merchant?: { id: string } }
        | { error?: string }
        | null;

      if (!res.ok || !json || !("merchant" in json) || !json.merchant?.id) {
        setError(
          (json as any)?.error ??
            "No se pudo crear el negocio. Revisa los datos e inténtalo de nuevo."
        );
        return;
      }

      router.push(`/admin/merchants/${json.merchant.id}`);
    } catch (e) {
      console.error("Error al crear MerchantApp:", e);
      setError(
        "Error inesperado al crear el negocio. Revisa la consola para más detalles."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          Nuevo negocio · Asistente de conexión
        </h1>
        <p className="text-sm text-slate-400">
          Configura paso a paso un MerchantApp para integrarlo con trends172
          Pay.
        </p>
      </header>

      {error && <Alert>{error}</Alert>}

      <Card className="border border-slate-800 bg-slate-950/80">
        <CardHeader>
          <CardTitle className="text-sm text-slate-100">
            Paso {step} de 6
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            {step === 1 && "Datos básicos del negocio."}
            {step === 2 &&
              "Define la comisión y los datos de liquidación bancaria."}
            {step === 3 &&
              "Configura cómo se integrará técnicamente este cliente."}
            {step === 4 &&
              "Genera las credenciales necesarias para la integración."}
            {step === 5 &&
              "Prueba la conexión del webhook antes de activar la integración."}
            {step === 6 &&
              "Revisa el resumen final y crea el MerchantApp."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="grid gap-3 text-xs sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="displayName"
                  className="text-[11px] font-medium text-slate-400"
                >
                  Nombre comercial
                </label>
                <input
                  id="displayName"
                  value={data.displayName}
                  onChange={(e) =>
                    setData((d) => ({ ...d, displayName: e.target.value }))
                  }
                  className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="businessCode"
                  className="text-[11px] font-medium text-slate-400"
                >
                  Código de negocio (slug)
                </label>
                <input
                  id="businessCode"
                  value={data.businessCode}
                  onChange={(e) =>
                    setData((d) => ({ ...d, businessCode: e.target.value }))
                  }
                  placeholder="CARPIHOGAR, ACADEMIA_X..."
                  className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="contactName"
                  className="text-[11px] font-medium text-slate-400"
                >
                  Persona de contacto
                </label>
                <input
                  id="contactName"
                  value={data.contactName}
                  onChange={(e) =>
                    setData((d) => ({ ...d, contactName: e.target.value }))
                  }
                  className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="contactEmail"
                  className="text-[11px] font-medium text-slate-400"
                >
                  Email de contacto
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  value={data.contactEmail}
                  onChange={(e) =>
                    setData((d) => ({ ...d, contactEmail: e.target.value }))
                  }
                  className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-3 text-xs sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="commissionPercent"
                  className="text-[11px] font-medium text-slate-400"
                >
                  Comisión trends172 (%){" "}
                </label>
                <input
                  id="commissionPercent"
                  type="number"
                  step="0.01"
                  value={data.commissionPercent}
                  onChange={(e) =>
                    setData((d) => ({ ...d, commissionPercent: e.target.value }))
                  }
                  className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="payoutCurrency"
                  className="text-[11px] font-medium text-slate-400"
                >
                  Moneda de liquidación
                </label>
                <input
                  id="payoutCurrency"
                  value={data.payoutCurrency}
                  onChange={(e) =>
                    setData((d) => ({ ...d, payoutCurrency: e.target.value }))
                  }
                  className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="payoutBankName"
                  className="text-[11px] font-medium text-slate-400"
                >
                  Banco
                </label>
                <input
                  id="payoutBankName"
                  value={data.payoutBankName}
                  onChange={(e) =>
                    setData((d) => ({ ...d, payoutBankName: e.target.value }))
                  }
                  className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="payoutAccountNumber"
                  className="text-[11px] font-medium text-slate-400"
                >
                  N.º de cuenta
                </label>
                <input
                  id="payoutAccountNumber"
                  value={data.payoutAccountNumber}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      payoutAccountNumber: e.target.value
                    }))
                  }
                  className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label
                  htmlFor="payoutAccountHolder"
                  className="text-[11px] font-medium text-slate-400"
                >
                  Titular
                </label>
                <input
                  id="payoutAccountHolder"
                  value={data.payoutAccountHolder}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      payoutAccountHolder: e.target.value
                    }))
                  }
                  className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-3 text-xs sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="techStackHint"
                  className="text-[11px] font-medium text-slate-400"
                >
                  Stack del cliente
                </label>
                <select
                  id="techStackHint"
                  value={data.techStackHint}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      techStackHint: e.target.value as TechStackOption
                    }))
                  }
                  className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="WordPress">WordPress</option>
                  <option value="Laravel">Laravel</option>
                  <option value="Next.js">Next.js</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="webhookUrl"
                  className="text-[11px] font-medium text-slate-400"
                >
                  Webhook URL
                </label>
                <input
                  id="webhookUrl"
                  value={data.webhookUrl}
                  onChange={(e) =>
                    setData((d) => ({ ...d, webhookUrl: e.target.value }))
                  }
                  placeholder="https://cliente.com/api/webhooks/trends172"
                  className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label
                  htmlFor="allowedDomains"
                  className="text-[11px] font-medium text-slate-400"
                >
                  Dominios permitidos (separados por coma)
                </label>
                <textarea
                  id="allowedDomains"
                  rows={2}
                  value={data.allowedDomains}
                  onChange={(e) =>
                    setData((d) => ({ ...d, allowedDomains: e.target.value }))
                  }
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-xs">
              <p className="text-slate-400">
                Genera credenciales preliminares para esta integración. En una
                implementación más avanzada, estas credenciales podrían
                generarse y almacenarse exclusivamente en el backend.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  disabled={isGeneratingCreds}
                  onClick={handleGenerateCreds}
                >
                  {isGeneratingCreds
                    ? "Generando credenciales..."
                    : "Generar API Key y Webhook Secret"}
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="apiKey"
                    className="text-[11px] font-medium text-slate-400"
                  >
                    API Key (vista previa)
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="apiKey"
                      readOnly
                      value={data.apiKey}
                      className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 font-mono text-[11px] text-slate-100"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!data.apiKey}
                      onClick={() => handleCopy(data.apiKey, "apiKey")}
                    >
                      {copiedField === "apiKey" ? "Copiado" : "Copiar"}
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="webhookSecret"
                    className="text-[11px] font-medium text-slate-400"
                  >
                    Webhook Secret
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="webhookSecret"
                      readOnly
                      value={data.webhookSecret}
                      className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 font-mono text-[11px] text-slate-100"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!data.webhookSecret}
                      onClick={() =>
                        handleCopy(data.webhookSecret, "webhookSecret")
                      }
                    >
                      {copiedField === "webhookSecret" ? "Copiado" : "Copiar"}
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Después de crear el negocio, podrás ver la API Key final en la
                pantalla de detalle del MerchantApp.
              </p>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4 text-xs">
              <p className="text-slate-400">
                Antes de activar la integración, puedes enviar un evento de
                prueba al webhook configurado para verificar que el backend del
                cliente recibe y procesa correctamente las notificaciones.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  disabled={isTestingWebhook}
                  onClick={handleTestWebhook}
                >
                  {isTestingWebhook
                    ? "Enviando webhook de prueba..."
                    : "Enviar webhook de prueba"}
                </Button>
              </div>
              {testWebhookResult && (
                <Alert
                  className={
                    testWebhookResult.ok
                      ? "border-emerald-700/70 bg-emerald-950/40 text-emerald-100"
                      : undefined
                  }
                >
                  {testWebhookResult.message}
                </Alert>
              )}
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4 text-xs">
              <p className="text-slate-400">
                Revisa la información antes de crear el negocio. Podrás editar
                la mayoría de los campos desde la pantalla de detalle.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-[11px] font-medium text-slate-400">
                    Negocio
                  </p>
                  <p className="text-slate-100">{data.displayName || "—"}</p>
                  <p className="font-mono text-[11px] text-slate-400">
                    {data.businessCode || "sin businessCode"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-medium text-slate-400">
                    Contacto
                  </p>
                  <p className="text-slate-100">{data.contactName || "—"}</p>
                  <p className="text-slate-400">{data.contactEmail || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-medium text-slate-400">
                    Comisión
                  </p>
                  <p className="text-slate-100">
                    {data.commissionPercent || "0"}%
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-medium text-slate-400">
                    Liquidación
                  </p>
                  <p className="text-slate-100">
                    {data.payoutCurrency || "VES"}
                  </p>
                  <p className="text-slate-400">
                    {data.payoutBankName || "Banco no definido"}
                  </p>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <p className="text-[11px] font-medium text-slate-400">
                    Webhook y dominios
                  </p>
                  <p className="text-slate-100">
                    Webhook:{" "}
                    <span className="text-slate-300">
                      {data.webhookUrl || "no configurado"}
                    </span>
                  </p>
                  <p className="text-slate-100">
                    Dominios:{" "}
                    <span className="text-slate-300">
                      {data.allowedDomains || "no definidos"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-2 text-xs">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={step === 1}
              onClick={prevStep}
            >
              Anterior
            </Button>
            {step < 6 ? (
              <Button type="button" size="sm" onClick={nextStep}>
                Siguiente
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                disabled={isSubmitting}
                onClick={handleCreateMerchant}
              >
                {isSubmitting ? "Creando negocio..." : "Crear negocio"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

