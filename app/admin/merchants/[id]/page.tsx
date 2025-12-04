import { notFound } from "next/navigation";
import {
  getMerchantById,
  updateMerchant
} from "@/lib/merchantAppStore";
import { revalidatePath } from "next/cache";

async function updateCommissionAction(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const commissionValue = formData.get("commissionPercent") as string;
  const commissionPercent = parseFloat(commissionValue);

  if (!id || Number.isNaN(commissionPercent)) {
    return;
  }

  await updateMerchant(id, { commissionPercent });
  revalidatePath(`/admin/merchants/${id}`);
}

async function updateSettlementAction(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;

  if (!id) return;

  await updateMerchant(id, {
    payoutCurrency: (formData.get("payoutCurrency") as string) || "VES",
    payoutBankName: (formData.get("payoutBankName") as string) || undefined,
    payoutAccountNumber:
      (formData.get("payoutAccountNumber") as string) || undefined,
    payoutAccountHolder:
      (formData.get("payoutAccountHolder") as string) || undefined
  });

  revalidatePath(`/admin/merchants/${id}`);
}

async function updateTechnicalAction(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) return;

  const rawDomains = (formData.get("allowedDomains") as string) || "";
  const allowedDomains = rawDomains
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean);

  await updateMerchant(id, {
    allowedDomains: allowedDomains.length ? allowedDomains : undefined,
    webhookUrl: (formData.get("webhookUrl") as string) || undefined,
    webhookSecret: (formData.get("webhookSecret") as string) || undefined,
    techStackHint: (formData.get("techStackHint") as string) || undefined,
    contactName: (formData.get("contactName") as string) || undefined,
    contactEmail: (formData.get("contactEmail") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined
  });

  revalidatePath(`/admin/merchants/${id}`);
}

export default async function MerchantDetailPage({
  params
}: {
  params: { id: string };
}) {
  const merchant = await getMerchantById(params.id);
  if (!merchant) {
    notFound();
  }

  const apiExample = `POST /api/v1/payment-sessions HTTP/1.1
Host: trends172.com
Content-Type: application/json
x-api-key: ${merchant.apiKey}

{
  "amount": 250.5,
  "currency": "VES",
  "description": "Pedido #CARPI-00123",
  "originSystem": "web_ecommerce",
  "customerName": "Juan Pérez",
  "customerEmail": "juan@example.com",
  "successUrl": "https://cliente.com/pago/exitoso",
  "cancelUrl": "https://cliente.com/pago/cancelado",
  "externalOrderId": "CARPI-00123"
}`;

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          {merchant.displayName}
        </h1>
        <p className="text-sm text-slate-400">
          Código de negocio:{" "}
          <span className="font-mono text-slate-200">
            {merchant.businessCode}
          </span>
        </p>
      </header>

      <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
        <h2 className="text-sm font-semibold text-slate-100">Credenciales</h2>
        <p className="text-xs text-slate-400">
          Clave de API para integraciones de este negocio.
        </p>
        <div className="mt-2 flex flex-col gap-2 text-xs">
          <label
            htmlFor="apiKey"
            className="text-[11px] font-medium text-slate-400"
          >
            API Key (solo lectura)
          </label>
          <input
            id="apiKey"
            readOnly
            value={merchant.apiKey}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 font-mono text-[11px] text-slate-100"
          />
          <p className="text-[11px] text-slate-500">
            Copia esta clave de forma segura. En producción, se podrán añadir
            controles adicionales para su rotación.
          </p>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
        <h2 className="text-sm font-semibold text-slate-100">
          Comisión de esta instalación
        </h2>
        <p className="text-xs text-slate-400">
          Define el porcentaje que trends172 retiene por cada pago de este
          negocio.
        </p>
        <form
          action={updateCommissionAction}
          className="mt-2 flex max-w-xs items-end gap-2 text-xs"
        >
          <input type="hidden" name="id" value={merchant.id} />
          <div className="flex flex-1 flex-col gap-1">
            <label
              htmlFor="commissionPercent"
              className="text-[11px] font-medium text-slate-400"
            >
              Porcentaje de comisión (%)
            </label>
            <input
              id="commissionPercent"
              name="commissionPercent"
              type="number"
              step="0.01"
              defaultValue={merchant.commissionPercent}
              className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="h-8 rounded-md border border-slate-700 bg-slate-900 px-3 text-[11px] font-medium text-slate-100 hover:bg-slate-800"
          >
            Guardar
          </button>
        </form>
      </section>

      <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
        <h2 className="text-sm font-semibold text-slate-100">
          Datos bancarios de liquidación
        </h2>
        <p className="text-xs text-slate-400">
          Información donde se liquidarán los fondos correspondientes al
          negocio.
        </p>
        <form
          action={updateSettlementAction}
          className="mt-2 grid gap-3 text-xs sm:grid-cols-2"
        >
          <input type="hidden" name="id" value={merchant.id} />
          <div className="flex flex-col gap-1">
            <label
              htmlFor="payoutCurrency"
              className="text-[11px] font-medium text-slate-400"
            >
              Moneda de liquidación
            </label>
            <input
              id="payoutCurrency"
              name="payoutCurrency"
              defaultValue={merchant.payoutCurrency}
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
              name="payoutBankName"
              defaultValue={merchant.payoutBankName ?? ""}
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
              name="payoutAccountNumber"
              defaultValue={merchant.payoutAccountNumber ?? ""}
              className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="payoutAccountHolder"
              className="text-[11px] font-medium text-slate-400"
            >
              Titular
            </label>
            <input
              id="payoutAccountHolder"
              name="payoutAccountHolder"
              defaultValue={merchant.payoutAccountHolder ?? ""}
              className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              className="h-8 rounded-md border border-slate-700 bg-slate-900 px-3 text-[11px] font-medium text-slate-100 hover:bg-slate-800"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
        <h2 className="text-sm font-semibold text-slate-100">
          Integración técnica
        </h2>
        <p className="text-xs text-slate-400">
          Dominios permitidos y configuración de webhooks para esta
          integración.
        </p>
        <form
          action={updateTechnicalAction}
          className="mt-2 grid gap-3 text-xs sm:grid-cols-2"
        >
          <input type="hidden" name="id" value={merchant.id} />
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label
              htmlFor="allowedDomains"
              className="text-[11px] font-medium text-slate-400"
            >
              Dominios permitidos (separados por coma)
            </label>
            <input
              id="allowedDomains"
              name="allowedDomains"
              defaultValue={merchant.allowedDomains?.join(", ") ?? ""}
              className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
            />
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
              name="webhookUrl"
              defaultValue={merchant.webhookUrl ?? ""}
              className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="webhookSecret"
              className="text-[11px] font-medium text-slate-400"
            >
              Webhook Secret
            </label>
            <input
              id="webhookSecret"
              name="webhookSecret"
              defaultValue={merchant.webhookSecret ?? ""}
              className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="techStackHint"
              className="text-[11px] font-medium text-slate-400"
            >
              Pista de stack del cliente
            </label>
            <input
              id="techStackHint"
              name="techStackHint"
              defaultValue={merchant.techStackHint ?? ""}
              placeholder="Laravel, WordPress, Next.js..."
              className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="contactName"
              className="text-[11px] font-medium text-slate-400"
            >
              Contacto
            </label>
            <input
              id="contactName"
              name="contactName"
              defaultValue={merchant.contactName ?? ""}
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
              name="contactEmail"
              defaultValue={merchant.contactEmail ?? ""}
              className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label
              htmlFor="notes"
              className="text-[11px] font-medium text-slate-400"
            >
              Notas internas
            </label>
            <textarea
              id="notes"
              name="notes"
              defaultValue={merchant.notes ?? ""}
              rows={3}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              className="h-8 rounded-md border border-slate-700 bg-slate-900 px-3 text-[11px] font-medium text-slate-100 hover:bg-slate-800"
            >
              Guardar configuración
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
        <h2 className="text-sm font-semibold text-slate-100">
          Guía rápida de integración
        </h2>
        <p className="text-xs text-slate-400">
          Ejemplo de cómo crear una sesión de pago desde el backend del cliente
          usando la API pública de trends172 Pay.
        </p>
        <pre className="mt-2 overflow-x-auto rounded-md bg-slate-950 px-3 py-2 text-xs text-slate-100">
          <code>{apiExample}</code>
        </pre>
      </section>
    </div>
  );
}

