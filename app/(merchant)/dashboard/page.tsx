import { cookies } from "next/headers";
import Link from "next/link";
import { getMerchantById } from "@/lib/merchantAppStore";
import { getMerchantBalance } from "@/lib/paymentSessionStore";
import { MetricsCards } from "./components/MetricsCards";
import { SalesChart } from "./components/SalesChart";
import { RecentTransactions } from "./components/RecentTransactions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  PlusCircle
} from "lucide-react";

export const dynamic = "force-dynamic";

function onlyDigits(value: string): string {
  return value.replace(/[^\d]/g, "");
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const merchantId = cookieStore.get("merchant_session")?.value;

  if (!merchantId) return null;

  const merchant = await getMerchantById(merchantId);
  const balance = await getMerchantBalance(merchantId);

  if (!merchant) return <div>Error: Merchant no encontrado.</div>;

  const salesEmail = (process.env.NEXT_PUBLIC_SALES_EMAIL ?? "").trim();
  const whatsappNumber = onlyDigits(process.env.NEXT_PUBLIC_SALES_WHATSAPP ?? "");
  const whatsappPrefill = encodeURIComponent(
    process.env.NEXT_PUBLIC_SALES_WHATSAPP_MESSAGE ??
      `Hola, ya cree mi usuario en trends172 Pay y quiero activar mi boton de pago para ${merchant.displayName}.`
  );
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${whatsappPrefill}`
    : "";

  const hasWhatsApp = Boolean(whatsappNumber);
  const hasSalesEmail = Boolean(salesEmail);

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hola, {merchant.displayName}</h1>
          <p className="text-muted-foreground">Aqui esta lo que sucede con tu negocio hoy.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/integration">
              <ExternalLink className="mr-2 h-4 w-4" />
              Ver Integracion
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/integration">
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Link de Pago
            </Link>
          </Button>
          {hasWhatsApp ? (
            <Button
              asChild
              className="bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700"
            >
              <a href={whatsappHref} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" />
                Contratar por WhatsApp
              </a>
            </Button>
          ) : hasSalesEmail ? (
            <Button asChild>
              <a href={`mailto:${salesEmail}?subject=Activacion%20de%20boton%20de%20pago`}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Contratar por Correo
              </a>
            </Button>
          ) : null}
        </div>
      </div>

      <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-900/30 via-slate-900 to-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            Contratacion y activacion guiada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-200">
            Ya tienes cuenta. El siguiente flujo es simple: completa tu perfil, prueba el boton
            y luego contacta asesoria para activacion final.
          </p>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-sm text-slate-200">
              <p className="font-semibold text-white">1. Completa datos del negocio</p>
              <p className="mt-1 text-slate-400">Banco, cuenta y contacto para liquidaciones.</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-sm text-slate-200">
              <p className="font-semibold text-white">2. Integra y prueba checkout</p>
              <p className="mt-1 text-slate-400">Usa tu API key y ejecuta un pago de prueba.</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-sm text-slate-200">
              <p className="font-semibold text-white">3. Solicita activacion</p>
              <p className="mt-1 text-slate-400">
                Un asesor valida tu cuenta y habilita salida a produccion.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/profile">Completar Perfil</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/integration">Ir a Integracion</Link>
            </Button>
            {hasWhatsApp ? (
              <Button
                asChild
                className="bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700"
              >
                <a href={whatsappHref} target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Hablar con Asesoria
                </a>
              </Button>
            ) : null}
          </div>

          {hasSalesEmail ? (
            <p className="text-xs text-slate-400">
              Si prefieres correo:{" "}
              <a
                className="text-cyan-300 hover:text-cyan-200"
                href={`mailto:${salesEmail}?subject=Activacion%20de%20boton%20de%20pago`}
              >
                {salesEmail}
              </a>
            </p>
          ) : null}
        </CardContent>
      </Card>

      <MetricsCards balance={balance} currency={merchant.balanceCurrency ?? "USD"} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        <SalesChart />
        <div className="lg:col-span-3">
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
}
