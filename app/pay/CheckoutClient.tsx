"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { PaymentSession } from "@/types/payment";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";

interface CheckoutResponse {
  session: PaymentSession;
  merchant: {
    id: string;
    businessCode: string;
    displayName: string;
    logoUrl?: string;
  } | null;
}

export default function CheckoutClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [data, setData] = useState<CheckoutResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "mobile">("card");

  useEffect(() => {
    if (!sessionId) {
      setError("Falta el parámetro sessionId en la URL.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadSession() {
      try {
        setLoading(true);
        const res = await fetch(`/api/payment-sessions/${sessionId}`, {
          cache: "no-store"
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          const message =
            payload?.error ??
            "No se pudo obtener la información de la sesión de pago.";
          if (!cancelled) {
            setError(message);
          }
          return;
        }

        const json = (await res.json()) as CheckoutResponse;
        if (!cancelled) {
          setData(json);
        }
      } catch (e) {
        console.error("Error al cargar la sesión de pago:", e);
        if (!cancelled) {
          setError("Error inesperado al cargar la sesión de pago.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  async function handleProceedToPayment() {
    if (!sessionId) return;
    setIsRedirecting(true);
    setError(null);

    try {
      const res = await fetch("/api/mercantil/button/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ sessionId })
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        const message =
          payload?.error ??
          "No se pudo iniciar el proceso de pago con el banco.";
        setError(message);
        setIsRedirecting(false);
        return;
      }

      const json = (await res.json()) as { paymentUrl: string };
      if (json.paymentUrl) {
        // Redirección al entorno del banco (sandbox / producción).
        window.location.href = json.paymentUrl;
      } else {
        setError("La respuesta del proveedor bancario no contiene paymentUrl.");
        setIsRedirecting(false);
      }
    } catch (e) {
      console.error("Error al crear orden de pago en el banco:", e);
      setError("Error inesperado al iniciar el pago con el banco.");
      setIsRedirecting(false);
    }
  }

  const merchantName =
    data?.merchant?.displayName ?? data?.session?.businessCode ?? "Negocio";

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Resumen del pago</CardTitle>
        <CardDescription>
          Estás a punto de pagar en{" "}
          <span className="font-medium text-slate-100">{merchantName}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : error ? (
          <Alert>{error}</Alert>
        ) : data ? (
          <>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Monto a pagar
              </p>
              <p className="mt-1 text-3xl font-semibold text-slate-50">
                {data.session.amount.toFixed(2)}{" "}
                <span className="text-base font-normal text-slate-300">
                  {data.session.currency}
                </span>
              </p>
            </div>

            <div className="space-y-1 text-sm text-slate-300">
              <p>
                <span className="text-slate-400">Descripción:</span>{" "}
                {data.session.description}
              </p>
              <p>
                <span className="text-slate-400">Código de negocio:</span>{" "}
                {data.session.businessCode}
              </p>
              <p>
                <span className="text-slate-400">Origen:</span>{" "}
                {data.session.originSystem}
              </p>
              {data.session.customerName && (
                <p>
                  <span className="text-slate-400">Cliente:</span>{" "}
                  {data.session.customerName}
                </p>
              )}
              {data.session.customerEmail && (
                <p>
                  <span className="text-slate-400">Email:</span>{" "}
                  {data.session.customerEmail}
                </p>
              )}
            </div>

            <div className="rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-400">
              El pago se procesará a través de la pasarela{" "}
              <span className="font-medium text-slate-100">trends172 Pay</span>{" "}
              y luego serás redirigido a la plataforma del banco para completar
              la operación de forma segura.
            </div>
          </>
        ) : null}

        <div className="pt-2 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPaymentMethod("card")}
              className={`rounded-md border p-2 text-sm font-medium transition-colors ${paymentMethod === "card"
                  ? "border-slate-50 bg-slate-800 text-slate-50"
                  : "border-slate-800 bg-transparent text-slate-400 hover:border-slate-700"
                }`}
            >
              Tarjeta (Mercantil)
            </button>
            <button
              onClick={() => setPaymentMethod("mobile")}
              className={`rounded-md border p-2 text-sm font-medium transition-colors ${paymentMethod === "mobile"
                  ? "border-slate-50 bg-slate-800 text-slate-50"
                  : "border-slate-800 bg-transparent text-slate-400 hover:border-slate-700"
                }`}
            >
              Pago Móvil
            </button>
          </div>

          {paymentMethod === "mobile" ? (
            <div className="rounded-md bg-slate-900 p-4 text-sm text-slate-300">
              <p className="font-semibold text-slate-50 mb-2">Datos para Pago Móvil:</p>
              <ul className="list-disc pl-4 space-y-1 text-xs">
                <li>Banco: 0105 - Mercantil</li>
                <li>Teléfono: 0414-1234567</li>
                <li>C.I. / RIF: J-12345678-9</li>
              </ul>
              <p className="mt-3 text-xs text-yellow-500">
                * Funcionalidad de reporte automático en construcción.
              </p>
            </div>
          ) : (
            <Button
              className="w-full"
              disabled={loading || !!error || isRedirecting}
              onClick={handleProceedToPayment}
            >
              {isRedirecting ? "Redirigiendo al banco..." : "Pagar con Tarjeta"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

