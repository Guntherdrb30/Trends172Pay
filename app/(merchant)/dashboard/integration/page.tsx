import { cookies } from "next/headers";
import Link from "next/link";
import { getMerchantById } from "@/lib/merchantAppStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

export default async function IntegrationPage() {
  const cookieStore = await cookies();
  const merchantId = cookieStore.get("merchant_session")?.value;
  if (!merchantId) return null;

  const merchant = await getMerchantById(merchantId);
  if (!merchant) return <div>Error: Merchant no encontrado.</div>;

  const demoButtonCode = `
<a href="https://trends172-pay.vercel.app/pay?sessionId=TU_SESSION_ID"
   target="_blank"
   rel="noreferrer"
   style="background-color:#0f172a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-family:sans-serif;">
  Pagar con trends172 Pay
</a>
`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integracion</h1>
        <p className="text-slate-400">Credenciales y herramientas para conectar tu negocio.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Credenciales API</CardTitle>
            <CardDescription>
              Usa estas llaves para autenticar peticiones a la API v1.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Business Code</label>
              <div className="rounded-md bg-slate-900 p-3 font-mono text-sm text-slate-300">
                {merchant.businessCode}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">API Key</label>
              <div className="rounded-md bg-slate-900 p-3 font-mono text-sm text-slate-300 break-all">
                {merchant.apiKey}
              </div>
              <p className="text-xs text-yellow-400">
                Esta llave debe quedarse en backend. Nunca la expongas en frontend.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Boton de Pago (Demo)</CardTitle>
            <CardDescription>
              Primero crea una sesion de pago via API y luego usa la checkoutUrl real.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap rounded-md bg-slate-900 p-4 font-mono text-xs text-slate-300">
              {demoButtonCode}
            </div>
          </CardContent>
        </Card>

        <Card className="border-cyan-400/30 bg-gradient-to-r from-cyan-900/15 to-slate-900">
          <CardHeader>
            <CardTitle>Primera instalacion guiada</CardTitle>
            <CardDescription>
              Abre una web de prueba, genera checkout y valida tu boton de pago en minutos.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/instalacion-prueba">Abrir Instalacion de Prueba</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Volver al Resumen</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
