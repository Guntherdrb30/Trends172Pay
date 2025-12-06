import { cookies } from "next/headers";
import { getMerchantById } from "@/lib/merchantAppStore";
import { getMerchantBalance } from "@/lib/paymentSessionStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const merchantId = cookieStore.get("merchant_session")?.value;

    if (!merchantId) return null; // Should be handled by middleware

    const merchant = await getMerchantById(merchantId);
    const balance = await getMerchantBalance(merchantId);

    if (!merchant) return <div>Error: Merchant no encontrado.</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Hola, {merchant.displayName}</h1>
                <p className="text-slate-400">Bienvenido a tu panel de control.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saldo Disponible</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {balance.toFixed(2)} {merchant.balanceCurrency ?? "USD"}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Estado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-400">
                            Activo
                        </div>
                        <p className="text-xs text-slate-400">Tu cuenta está lista para procesar pagos.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
