"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface GlobalSettings {
    bcvRate: number;
    feeCardPercent: number;
    feeCardFixed: number;
    feeC2pPercent: number;
    feeTransferPercent: number;
    bankFeePercent: number;
}

export async function getGlobalSettings(): Promise<GlobalSettings> {
    try {
        const result = await db('SELECT key, value FROM global_settings');

        const defaults: any = {
            bcv_rate: '55.42',
            fee_card_percent: '2.9',
            fee_card_fixed: '0.30',
            fee_c2p_percent: '1.5',
            fee_transfer_percent: '1.0',
            bank_fee_percent: '0.5'
        };

        const settingsMap: any = { ...defaults };
        if (Array.isArray(result)) {
            result.forEach((row: any) => {
                settingsMap[row.key] = row.value;
            });
        }

        return {
            bcvRate: parseFloat(settingsMap.bcv_rate),
            feeCardPercent: parseFloat(settingsMap.fee_card_percent),
            feeCardFixed: parseFloat(settingsMap.fee_card_fixed),
            feeC2pPercent: parseFloat(settingsMap.fee_c2p_percent),
            feeTransferPercent: parseFloat(settingsMap.fee_transfer_percent),
            bankFeePercent: parseFloat(settingsMap.bank_fee_percent)
        };
    } catch (error) {
        console.error("Error fetching global settings:", error);
        return {
            bcvRate: 55.42,
            feeCardPercent: 2.9,
            feeCardFixed: 0.30,
            feeC2pPercent: 1.5,
            feeTransferPercent: 1.0,
            bankFeePercent: 0.5
        };
    }
}

export async function updateGlobalSetting(key: string, value: string) {
    try {
        if (!key || !value) throw new Error("Invalid input");

        const allowedKeys = [
            'bcv_rate',
            'fee_card_percent',
            'fee_card_fixed',
            'fee_c2p_percent',
            'fee_transfer_percent',
            'bank_fee_percent'
        ];

        if (!allowedKeys.includes(key)) {
            throw new Error("Invalid setting key");
        }

        await db(
            'INSERT INTO global_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP',
            [key, value]
        );

        revalidatePath('/pay');
        revalidatePath('/admin/settings');
        revalidatePath('/dashboard');

        return { success: true };
    } catch (error) {
        console.error("Error updating setting:", error);
        return { success: false, error: "Failed to update setting" };
    }
}
