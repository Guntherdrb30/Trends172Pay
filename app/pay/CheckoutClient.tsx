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

import { MercantilButton } from "./components/MercantilButton";

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
  const [paymentMethod, setPaymentMethod] = useState<"card" | "mobile" | "bank">("card");

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
              Tarjeta
            </button>
            <button
              onClick={() => setPaymentMethod("bank")}
              className={`rounded-md border p-2 text-sm font-medium transition-colors ${paymentMethod === "bank"
                ? "border-[#0047BA] bg-blue-900/20 text-blue-100"
                : "border-slate-800 bg-transparent text-slate-400 hover:border-slate-700"
                }`}
            >
              Banco Mercantil
            </button>
            <button
              onClick={() => setPaymentMethod("mobile")}
              className={`col-span-2 rounded-md border p-2 text-sm font-medium transition-colors ${paymentMethod === "mobile"
                ? "border-slate-50 bg-slate-800 text-slate-50"
                : "border-slate-800 bg-transparent text-slate-400 hover:border-slate-700"
                }`}
            >
              Pago Móvil (C2P)
            </button>
          </div>

          {paymentMethod === "mobile" ? (
            <div className="space-y-4 rounded-md bg-slate-900 p-4 text-sm text-slate-300">
              <p className="font-semibold text-slate-50">Pago Móvil C2P</p>

              {/* Inputs C2P */}
              <div className="grid gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Cédula de Identidad</label>
                  <div className="flex gap-2">
                    <select id="user-doc-type" className="bg-slate-950 border border-slate-700 rounded text-slate-200 p-2 text-sm max-w-[60px]">
                      <option value="V">V</option>
                      <option value="E">E</option>
                      <option value="J">J</option>
                    </select>
                    <input
                      id="user-doc-num"
                      type="text"
                      placeholder="12345678"
                      className="flex-1 bg-slate-950 border border-slate-700 rounded text-slate-200 p-2 text-sm"
                      onChange={(e) => {
                        // Guardamos el valor completo V12345678 en una variable temporal o estado si fuera necesario
                        // Por simplicidad, leeremos directamente del DOM en el submit o usaremos state.
                        // Para esta implementación rápida, añadiré state local arriba.
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Número de Teléfono</label>
                  <input
                    id="user-phone"
                    type="tel"
                    placeholder="04141234567"
                    className="w-full bg-slate-950 border border-slate-700 rounded text-slate-200 p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Clave de Compra (OTP)</label>
                  <input
                    id="user-otp"
                    type="password"
                    maxLength={8}
                    placeholder="Clave generada en tu banco"
                    className="w-full bg-slate-950 border border-slate-700 rounded text-slate-200 p-2 text-sm"
                  />
                </div>
              </div>

              <Button
                className="w-full bg-slate-100 text-slate-900 hover:bg-slate-200"
                disabled={loading || isRedirecting}
                onClick={async () => {
                  const type = (document.getElementById('user-doc-type') as HTMLSelectElement).value;
                  const num = (document.getElementById('user-doc-num') as HTMLInputElement).value;
                  const phone = (document.getElementById('user-phone') as HTMLInputElement).value;
                  const otp = (document.getElementById('user-otp') as HTMLInputElement).value;

                  if (!num || !phone || !otp) {
                    setError("Por favor completa todos los datos del pago móvil.");
                    return;
                  }

                  const payerId = `${type}${num}`;

                  setLoading(true);
                  setError(null);

                  try {
                    const res = await fetch("/api/pay/c2p", {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        sessionId,
                        payerId,
                        payerMobile: phone,
                        otp
                      })
                    });

                    const json = await res.json();

                    if (!res.ok || !json.success) {
                      throw new Error(json.error || "Error procesando el pago");
                    }

                    // Exito! Redirigir a success
                    window.location.href = `/pay/result/success?sessionId=${sessionId}`;

                  } catch (err: any) {
                    console.error(err);
                    setError(err.message);
                    setLoading(false);
                  }
                }}
              >
                {loading ? "Procesando Cobro..." : "Pagar Ahora"}
              </Button>
            </div>
          ) : paymentMethod === "bank" ? (
            <MercantilButton
              sessionId={sessionId!}
              onError={(msg) => setError(msg)}
            />
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

