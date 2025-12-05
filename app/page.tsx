import Link from "next/link";
import { ArrowRight, ShieldCheck, LineChart, Layers3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <section className="flex w-full flex-col gap-10 py-6 sm:py-10">
      <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-[11px] font-medium text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Alpha interna · trends172 Pay</span>
          </div>

          <div className="space-y-3">
            <h1 className="bg-gradient-to-r from-slate-50 via-indigo-200 to-sky-300 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl lg:text-5xl">
              Pasarela de pagos multi‑negocio, pensada para orquestar todo desde
              un solo dashboard.
            </h1>
            <p className="max-w-xl text-sm text-slate-300 sm:text-base">
              Centraliza cobros, comisiones y liquidaciones de múltiples
              negocios sin exponer la complejidad bancaria. trends172 Pay
              funciona como una capa única de pagos para tus e‑commerce,
              academias, SaaS y cualquier app conectada.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/admin/login">
                Entrar al dashboard root
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link
                href="https://github.com/Guntherdrb30/Trends172Pay/blob/main/README.md"
                target="_blank"
                rel="noreferrer"
              >
                Ver guía rápida de API v1
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap gap-6 text-xs text-slate-400 sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/80 ring-1 ring-slate-700">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
              </span>
              <span>Multi‑tenant aislado por negocio.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/80 ring-1 ring-slate-700">
                <Layers3 className="h-3.5 w-3.5 text-indigo-300" />
              </span>
              <span>Capas separadas: dashboard, API v1 y banco.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/80 ring-1 ring-slate-700">
                <LineChart className="h-3.5 w-3.5 text-sky-300" />
              </span>
              <span>Sesiones de pago y comisiones en tiempo real.</span>
            </div>
          </div>
        </div>

        <Card className="relative overflow-hidden border-slate-700/80 bg-gradient-to-br from-slate-900/80 via-slate-950 to-slate-900/80">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl" />
          <CardHeader className="relative space-y-2">
            <CardTitle className="flex items-center justify-between text-base">
              <span>Resumen de plataforma</span>
              <span className="rounded-full bg-emerald-900/40 px-2 py-0.5 text-[11px] font-medium text-emerald-200">
                Entorno interno
              </span>
            </CardTitle>
            <CardDescription>
              Métricas simuladas para validar el flujo de dashboard,
              multi‑negocio y sesiones de pago antes de conectar el banco real.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <div className="grid grid-cols-3 gap-3 text-xs sm:text-sm">
              <div className="space-y-1 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">
                  Negocios activos
                </p>
                <p className="text-lg font-semibold text-slate-50">2</p>
                <p className="text-[11px] text-slate-500">
                  Semilla de desarrollo
                </p>
              </div>
              <div className="space-y-1 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">
                  API v1
                </p>
                <p className="text-lg font-semibold text-slate-50">
                  /api/v1/payment-sessions
                </p>
                <p className="text-[11px] text-slate-500">
                  Crea y consulta sesiones por negocio
                </p>
              </div>
              <div className="space-y-1 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">
                  Checkout alojado
                </p>
                <p className="text-lg font-semibold text-slate-50">/pay</p>
                <p className="text-[11px] text-slate-500">
                  Orquestado desde trends172 Pay
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-[11px] text-slate-400 sm:text-xs">
              <p className="font-medium text-slate-200">
                ¿Cómo se integra un cliente?
              </p>
              <p className="mt-1">
                1) El negocio obtiene su <span className="font-mono">apiKey</span> desde
                el dashboard. 2) Llama a{" "}
                <span className="font-mono">POST /api/v1/payment-sessions</span> con el
                pedido. 3) Redirige al usuario a la{" "}
                <span className="font-mono">checkoutUrl</span> generada.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

