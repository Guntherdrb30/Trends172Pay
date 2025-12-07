"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface GlobalSettings {
    bcvRate: number;
    feeCardPercent: number;
    feeCardFixed: number;
    feeC2pPercent: number;
    feeTransferPercent: number;
}

export async function getGlobalSettings(): Promise<GlobalSettings> {
    try {
        const result = await query('SELECT key, value FROM global_settings');

        // Default fallback values
        const defaults: any = {
            bcv_rate: '55.42',
            fee_card_percent: '2.9',
            fee_card_fixed: '0.30',
            fee_c2p_percent: '1.5',
            fee_transfer_percent: '1.0'
        };

        // Map DB rows to object
        const settingsMap: any = { ...defaults };
        result.rows.forEach((row: any) => {
            settingsMap[row.key] = row.value;
        });

        return {
            bcvRate: parseFloat(settingsMap.bcv_rate),
            feeCardPercent: parseFloat(settingsMap.fee_card_percent),
            feeCardFixed: parseFloat(settingsMap.fee_card_fixed),
            feeC2pPercent: parseFloat(settingsMap.fee_c2p_percent),
            feeTransferPercent: parseFloat(settingsMap.fee_transfer_percent)
        };
    } catch (error) {
        console.error("Error fetching global settings:", error);
        // Return safe defaults on error
        return {
            bcvRate: 55.42,
            feeCardPercent: 2.9,
            feeCardFixed: 0.30,
            feeC2pPercent: 1.5,
            feeTransferPercent: 1.0
        };
    }
}

export async function updateGlobalSetting(key: string, value: string) {
    try {
        // Basic validation
        if (!key || !value) throw new Error("Invalid input");

        // Whitelist allowed keys for security
        const allowedKeys = [
            'bcv_rate',
            'fee_card_percent',
            'fee_card_fixed',
            'fee_c2p_percent',
            'fee_transfer_percent'
        ];

        if (!allowedKeys.includes(key)) {
            throw new Error("Invalid setting key");
        }

        await query(
            'INSERT INTO global_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP',
            [key, value]
        );

        revalidatePath('/pay');
        revalidatePath('/admin/settings');

        return { success: true };
    } catch (error) {
        console.error("Error updating setting:", error);
        return { success: false, error: "Failed to update setting" };
    }
}
