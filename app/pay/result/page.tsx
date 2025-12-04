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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";

type TransferSearchResponse = {
  status: "pending" | "processing" | "paid" | "failed";
  businessCode: string;
  originSystem: string;
  rawResponse: unknown;
};

export default function PayResultPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TransferSearchResponse | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("Falta el parámetro sessionId en la URL.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function verifyPayment() {
      try {
        setLoading(true);

        // 1. Verificar el pago en el banco (stub de Mercantil).
        const res = await fetch("/api/mercantil/transfer-search", {
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
            "No se pudo verificar el estado del pago en el banco.";
          if (!cancelled) {
            setError(message);
          }
          return;
        }

        const json = (await res.json()) as TransferSearchResponse;
        if (cancelled) return;
        setResult(json);

        // 2. Obtener la PaymentSession actualizada para conocer las URLs
        //    de éxito y cancelación configuradas por el MerchantApp.
        const sessionRes = await fetch(`/api/payment-sessions/${sessionId}`, {
          cache: "no-store"
        });
        if (!sessionRes.ok) {
          const payload = await sessionRes.json().catch(() => null);
          const message =
            payload?.error ??
            "No se pudo obtener la sesión de pago actualizada.";
          if (!cancelled) {
            setError(message);
          }
          return;
        }

        const sessionJson = (await sessionRes.json()) as {
          session: PaymentSession;
        };
        const session = sessionJson.session;

        // 3. Redirigir al frontend del cliente según el estado del pago,
        //    agregando parámetros de tracking a la URL.
        let targetUrl: string | null = null;

        if (json.status === "paid") {
          try {
            const url = new URL(session.successUrl);
            url.searchParams.set("sessionId", session.id);
            url.searchParams.set("status", "success");
            targetUrl = url.toString();
          } catch {
            // Si la URL de éxito no es válida, mostramos error en lugar de redirigir.
            setError(
              "La URL de éxito configurada para este pago no es válida."
            );
            return;
          }
        } else if (json.status === "failed") {
          try {
            const url = new URL(session.cancelUrl);
            url.searchParams.set("sessionId", session.id);
            url.searchParams.set("status", "failed");
            targetUrl = url.toString();
          } catch {
            setError(
              "La URL de cancelación configurada para este pago no es válida."
            );
            return;
          }
        }

        if (targetUrl) {
          window.location.href = targetUrl;
        }
      } catch (e) {
        console.error("Error al verificar el pago:", e);
        if (!cancelled) {
          setError("Error inesperado al verificar el estado del pago.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <div className="flex w-full items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verificando tu pago</CardTitle>
          <CardDescription>
            Estamos confirmando el resultado de tu operación con el banco.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && !error ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-4 w-2/5" />
            </div>
          ) : null}

          {error ? <Alert>{error}</Alert> : null}

          {!loading && !error && result ? (
            <p className="text-sm text-slate-300">
              Estado reportado:{" "}
              <span className="font-semibold text-slate-50">
                {result.status}
              </span>
              . Serás redirigido automáticamente al sitio del comercio si la
              configuración del pago es correcta.
            </p>
          ) : null}

          {!loading && !error && !result ? (
            <p className="text-sm text-slate-300">
              No se pudo determinar el estado del pago. Por favor, contacta al
              soporte del comercio si el cargo se realizó.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

