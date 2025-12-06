import { cookies } from "next/headers";
import { getMerchantById } from "@/lib/merchantAppStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

export default async function IntegrationPage() {
    const cookieStore = await cookies();
    const merchantId = cookieStore.get("merchant_session")?.value;
    if (!merchantId) return null;

    const merchant = await getMerchantById(merchantId);
    if (!merchant) return <div>Error: Merchant no encontrado.</div>;

    const demoButtonCode = `
<a href="https://trends172-pay.vercel.app/pay?sessionId=TU_SESSION_ID" 
   target="_blank" 
   style="background-color: #0f172a; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-family: sans-serif;">
   Pagar con trends172 Pay
</a>
`;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Integración</h1>
                <p className="text-slate-400">Credenciales y herramientas para conectar tu negocio.</p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Credenciales de API</CardTitle>
                        <CardDescription>
                            Usa estas llaves para autenticar tus peticiones a la API v1.
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
                            <div className="flex items-center gap-2">
                                <div className="flex-1 rounded-md bg-slate-900 p-3 font-mono text-sm text-slate-300 break-all">
                                    {merchant.apiKey}
                                </div>
                            </div>
                            <p className="text-xs text-yellow-500">
                                Mantén esta llave secreta. No la compartas en el frontend.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Botón de Pago (Demo)</CardTitle>
                        <CardDescription>
                            Ejemplo de cómo enlazar el checkout. Recuerda que primero debes crear una sesión de pago vía API para obtener el ID real.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md bg-slate-900 p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap">
                            {demoButtonCode}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
