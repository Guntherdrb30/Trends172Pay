"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { CreditCard, Smartphone, Building2, ArrowRight } from "lucide-react";

type DemoSessionResponse = {
  checkoutUrl?: string;
  error?: string;
};

export function CheckoutDemo() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "mobile" | "bank">(
    "card"
  );

  const amount = 125;
  const currency = "USD";
  const merchantName = "Demo Store";
  const description = "Pago de prueba - Flujo real";

  async function handlePayment() {
    setLoading(true);
    setError(null);

    try {
      const methodLabel =
        paymentMethod === "card"
          ? "Tarjeta"
          : paymentMethod === "mobile"
            ? "Pago Movil"
            : "Banco Mercantil";

      const response = await fetch("/api/public/installation-demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount,
          currency,
          description: `${description} (${methodLabel})`,
          customerName: "Cliente Demo",
          customerEmail: "cliente-demo@trends172.com"
        })
      });

      const payload = (await response.json().catch(() => null)) as
        | DemoSessionResponse
        | null;

      if (!response.ok || !payload?.checkoutUrl) {
        throw new Error(payload?.error || "No se pudo crear checkout de prueba.");
      }

      // Importante: esto abre el mismo checkout real usado en produccion.
      window.location.href = payload.checkoutUrl;
    } catch (e) {
      console.error("Error creating real demo checkout:", e);
      setError(
        e instanceof Error
          ? e.message
          : "Error inesperado al iniciar el checkout de prueba."
      );
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md border-slate-800 bg-slate-950">
      <CardHeader>
        <div className="mb-2 flex items-center gap-2">
          <div className="rounded-lg bg-indigo-500/10 p-2">
            <Building2 className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <CardTitle className="text-xl">Resumen del pago</CardTitle>
            <CardDescription className="text-slate-400">
              Estas en <span className="font-medium text-white">{merchantName}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 py-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total a pagar
          </p>
          <p className="mt-2 text-4xl font-bold text-white">
            {amount.toFixed(2)}{" "}
            <span className="text-lg font-normal text-slate-400">{currency}</span>
          </p>
          <p className="mt-2 text-sm text-slate-400">{description}</p>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-300">Metodo de pago</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setPaymentMethod("card")}
              className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all ${
                paymentMethod === "card"
                  ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                  : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:bg-slate-800"
              }`}
            >
              <CreditCard className="h-5 w-5" />
              Tarjeta
            </button>
            <button
              onClick={() => setPaymentMethod("bank")}
              className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all ${
                paymentMethod === "bank"
                  ? "border-blue-500 bg-blue-500/10 text-blue-400"
                  : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:bg-slate-800"
              }`}
            >
              <Building2 className="h-5 w-5" />
              Mercantil
            </button>
            <button
              onClick={() => setPaymentMethod("mobile")}
              className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all ${
                paymentMethod === "mobile"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                  : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:bg-slate-800"
              }`}
            >
              <Smartphone className="h-5 w-5" />
              Pago Movil
            </button>
          </div>
        </div>

        <div className="rounded-md border border-emerald-400/30 bg-emerald-400/5 px-3 py-2 text-xs text-emerald-100">
          Modo prueba conectado al flujo real: al continuar entras al checkout real de
          trends172 Pay.
        </div>

        {error ? <Alert>{error}</Alert> : null}

        <Button
          className="h-12 w-full text-base font-bold"
          disabled={loading}
          onClick={handlePayment}
        >
          {loading ? "Abriendo checkout real..." : "Continuar al checkout real"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <div className="text-center">
          <p className="text-xs text-slate-500">
            No es simulacion visual: usa el mismo checkout real de produccion.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
