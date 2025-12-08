import { updateGlobalSetting } from "@/app/actions/settings";

export async function syncBCVRate() {
    try {
        // Usar API pública de DolarVZLA (cache: no-store para evitar datos viejos)
        const res = await fetch('https://api.dolarvzla.com/public/exchange-rate', {
            cache: 'no-store',
            headers: {
                'User-Agent': 'MultiPasarela-Cron/1.0'
            }
        });

        if (!res.ok) {
            throw new Error(`Error fetching BCV rate: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        // La estructura esperada es { current: { usd: NUMBER, ... } }
        // DolarVZLA retorna números, updateGlobalSetting espera string
        const bcvRate = data?.current?.usd;

        if (!bcvRate) {
            throw new Error("Invalid data format from BCV API");
        }

        const rateString = String(bcvRate);
        console.log(`[BCV Sync] updating rate to ${rateString}`);

        const result = await updateGlobalSetting('bcv_rate', rateString);

        if (!result.success) {
            throw new Error("Failed to update global settings db");
        }

        return { success: true, rate: rateString };
    } catch (error) {
        console.error("[BCV Sync] Error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
