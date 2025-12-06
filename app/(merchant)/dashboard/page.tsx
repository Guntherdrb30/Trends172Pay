import { cookies } from "next/headers";
import { getMerchantById } from "@/lib/merchantAppStore";
import { getMerchantBalance } from "@/lib/paymentSessionStore";
import { MetricsCards } from "./components/MetricsCards";
import { SalesChart } from "./components/SalesChart";
import { RecentTransactions } from "./components/RecentTransactions";
import { Button } from "@/components/ui/button";
import { PlusCircle, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const merchantId = cookieStore.get("merchant_session")?.value;

    if (!merchantId) return null;

    const merchant = await getMerchantById(merchantId);
    const balance = await getMerchantBalance(merchantId);

    if (!merchant) return <div>Error: Merchant no encontrado.</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Hola, {merchant.displayName}</h1>
                    <p className="text-muted-foreground">Aquí está lo que sucede con tu negocio hoy.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver Comercio
                    </Button>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Crear Link de Pago
                    </Button>
                </div>
            </div>

            <MetricsCards balance={balance} currency={merchant.balanceCurrency ?? "USD"} />

            <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                <SalesChart />
                <div className="lg:col-span-3">
                    <RecentTransactions />
                </div>
            </div>
        </div>
    );
}
