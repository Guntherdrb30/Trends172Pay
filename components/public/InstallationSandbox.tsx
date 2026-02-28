"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Copy, Loader2, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type DemoSessionResponse = {
  sessionId: string;
  businessCode: string;
  checkoutUrl: string;
};

type PlacementType = "home" | "product" | "checkout";

const placementGuides: Record<
  PlacementType,
  {
    label: string;
    exactPlace: string;
    check: string;
  }
> = {
  home: {
    label: "Pagina principal (Home)",
    exactPlace:
      "Dentro de <main>, justo despues de la seccion de planes/precios y antes del footer.",
    check:
      "Si al hacer scroll desde el hero ves el boton antes del footer, esta en el lugar correcto."
  },
  product: {
    label: "Pagina de producto",
    exactPlace:
      "En la columna derecha del producto, debajo del precio y del boton 'Agregar al carrito'.",
    check:
      "El usuario debe poder ver precio, luego CTA de compra normal y despues el boton de pago directo."
  },
  checkout: {
    label: "Pagina de checkout/carrito",
    exactPlace:
      "Dentro del resumen de orden, justo antes del boton final de confirmar compra.",
    check:
      "Si el cliente revisa subtotal y el siguiente elemento es tu boton de pago, esta bien ubicado."
  }
};

export function InstallationSandbox() {
  const [amount, setAmount] = useState("25");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("Producto de prueba");
  const [customerName, setCustomerName] = useState("Cliente Demo");
  const [customerEmail, setCustomerEmail] = useState("cliente@demo.com");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [businessCode, setBusinessCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedBlock, setCopiedBlock] = useState(false);
  const [placementType, setPlacementType] = useState<PlacementType>("home");

  const embedSnippet = useMemo(() => {
    if (!checkoutUrl) {
      return [
        "<a href=\"https://tu-dominio.com/checkout-generado\"",
        "   style=\"display:inline-block;padding:12px 20px;border-radius:10px;background:#0f172a;color:#fff;text-decoration:none;font-family:system-ui;\">",
        "  Pagar con trends172 Pay",
        "</a>"
      ].join("\n");
    }

    return [
      `<a href="${checkoutUrl}"`,
      "   target=\"_blank\"",
      "   rel=\"noreferrer\"",
      "   style=\"display:inline-block;padding:12px 20px;border-radius:10px;background:#0f172a;color:#fff;text-decoration:none;font-family:system-ui;\">",
      "  Pagar con trends172 Pay",
      "</a>"
    ].join("\n");
  }, [checkoutUrl]);

  const placementBlockSnippet = useMemo(() => {
    const href = checkoutUrl || "PEGA_AQUI_TU_CHECKOUT_URL";

    return [
      "<!-- INICIO BLOQUE BOTON TRENDS172 -->",
      "<section id=\"trends172-pay-cta\" style=\"margin-top:24px;padding:16px;border:1px solid #1f2937;border-radius:12px;background:#0b1220;\">",
      "  <p style=\"margin:0 0 10px;font-size:14px;color:#cbd5e1;\">Paga de forma segura con trends172 Pay</p>",
      `  <a href="${href}" target="_blank" rel="noreferrer" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#06b6d4;color:#0b1220;text-decoration:none;font-weight:700;font-family:system-ui;">`,
      "    Pagar ahora",
      "  </a>",
      "</section>",
      "<!-- FIN BLOQUE BOTON TRENDS172 -->"
    ].join("\n");
  }, [checkoutUrl]);

  async function createDemoSession() {
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Ingresa un monto valido mayor a 0.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/public/installation-demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: parsedAmount,
          currency,
          description,
          customerName,
          customerEmail
        })
      });

      const payload = (await response.json().catch(() => null)) as
        | (DemoSessionResponse & { error?: string })
        | null;

      if (!response.ok || !payload?.checkoutUrl) {
        throw new Error(payload?.error || "No se pudo crear la sesion de prueba.");
      }

      setCheckoutUrl(payload.checkoutUrl);
      setBusinessCode(payload.businessCode);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(embedSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }

  async function copyPlacementBlock() {
    try {
      await navigator.clipboard.writeText(placementBlockSnippet);
      setCopiedBlock(true);
      setTimeout(() => setCopiedBlock(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }

  return (
    <div className="w-full space-y-6">
      <section className="rounded-2xl border border-cyan-300/30 bg-slate-900/70 p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Instalacion de prueba</p>
        <h1 className="mt-2 text-3xl font-black text-white">
          Tu primera web con boton de pago en vivo
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Esta pantalla simula tu pagina propia. Genera una sesion real y abre el checkout para
          validar el recorrido completo.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-lg font-bold text-white">1) Configura la prueba</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-300">
              <span>Monto</span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-slate-100"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-300">
              <span>Moneda</span>
              <input
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                className="h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-slate-100"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-300 sm:col-span-2">
              <span>Descripcion</span>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-slate-100"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-300">
              <span>Cliente</span>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-slate-100"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-300">
              <span>Email</span>
              <input
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-slate-100"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={createDemoSession}
              disabled={loading}
              className="bg-cyan-300 text-slate-950 hover:bg-cyan-200"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <PlayCircle className="mr-2 h-4 w-4" />
              )}
              Generar checkout de prueba
            </Button>

            {checkoutUrl ? (
              <Button variant="outline" asChild>
                <a href={checkoutUrl} target="_blank" rel="noreferrer">
                  Abrir checkout
                </a>
              </Button>
            ) : null}
          </div>

          {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}

          {businessCode ? (
            <p className="mt-3 text-xs text-slate-400">
              Business code usado: <span className="text-cyan-300">{businessCode}</span>
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-lg font-bold text-white">2) Pega este boton en tu web</h2>
          <p className="mt-2 text-sm text-slate-300">
            Este snippet representa la instalacion minima para probar rapidamente.
          </p>

          <pre className="mt-4 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-200">
            {embedSnippet}
          </pre>

          <Button variant="outline" onClick={copySnippet} className="mt-3">
            <Copy className="mr-2 h-4 w-4" />
            {copied ? "Snippet copiado" : "Copiar snippet"}
          </Button>

          <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-3 text-sm text-emerald-100">
            <p className="font-semibold">Checklist rapido</p>
            <ul className="mt-2 space-y-1 text-emerald-100/90">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Boton visible en tu pagina.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Redirecciona a checkoutUrl.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Completa pago demo y valida resultado.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-amber-300/30 bg-slate-900/60 p-5">
        <h2 className="text-lg font-bold text-white">3) Donde pegarlo exactamente en tu web</h2>
        <p className="mt-2 text-sm text-slate-300">
          Selecciona el tipo de pagina y pega el bloque en ese lugar exacto.
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-[320px_1fr]">
          <div className="space-y-3">
            <label className="text-sm text-slate-300">
              Tipo de pagina
              <select
                value={placementType}
                onChange={(e) => setPlacementType(e.target.value as PlacementType)}
                className="mt-1 h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-slate-100"
              >
                <option value="home">{placementGuides.home.label}</option>
                <option value="product">{placementGuides.product.label}</option>
                <option value="checkout">{placementGuides.checkout.label}</option>
              </select>
            </label>

            <div className="rounded-xl border border-amber-300/25 bg-amber-300/5 p-3 text-sm text-amber-100">
              <p className="font-semibold">Ubicacion exacta</p>
              <p className="mt-1">{placementGuides[placementType].exactPlace}</p>
            </div>

            <div className="rounded-xl border border-cyan-300/25 bg-cyan-300/5 p-3 text-sm text-cyan-100">
              <p className="font-semibold">Validacion visual</p>
              <p className="mt-1">{placementGuides[placementType].check}</p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-200">Bloque listo para pegar</p>
            <pre className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-200">
              {placementBlockSnippet}
            </pre>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" onClick={copyPlacementBlock}>
                <Copy className="mr-2 h-4 w-4" />
                {copiedBlock ? "Bloque copiado" : "Copiar bloque completo"}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
