
import { cookies } from "next/headers";
import { getMerchantById } from "@/lib/merchantAppStore";
import { ProfileForm } from "./components/ProfileForm";

export default async function ProfilePage() {
    const cookieStore = await cookies();
    const merchantId = cookieStore.get("merchant_session")?.value;

    if (!merchantId) return <div>No autorizado</div>;

    const merchant = await getMerchantById(merchantId);
    if (!merchant) return <div>Merchant no encontrado</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-50">Perfil de Comercio</h1>
                <p className="text-slate-400">Gestiona la información de tu negocio y datos bancarios.</p>
            </div>

            <ProfileForm merchant={merchant} />
        </div>
    );
}
