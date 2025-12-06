"use server";

import { updateMerchant } from "@/lib/merchantAppStore";
import { revalidatePath } from "next/cache";

export async function updateMerchantProfile(
    merchantId: string,
    prevState: any,
    formData: FormData
) {
    try {
        const changes: any = {};

        // Extraer campos del formulario
        const displayName = formData.get("displayName") as string;
        const payoutBankName = formData.get("payoutBankName") as string;
        const payoutAccountNumber = formData.get("payoutAccountNumber") as string;
        const payoutAccountHolder = formData.get("payoutAccountHolder") as string;
        const contactName = formData.get("contactName") as string;
        const contactEmail = formData.get("contactEmail") as string;

        if (displayName) changes.displayName = displayName;
        if (payoutBankName) changes.payoutBankName = payoutBankName;
        if (payoutAccountNumber) changes.payoutAccountNumber = payoutAccountNumber;
        if (payoutAccountHolder) changes.payoutAccountHolder = payoutAccountHolder;
        if (contactName) changes.contactName = contactName;
        if (contactEmail) changes.contactEmail = contactEmail;

        if (Object.keys(changes).length === 0) {
            return { message: "No hubo cambios para guardar." };
        }

        await updateMerchant(merchantId, changes);
        revalidatePath("/dashboard/profile");

        return { message: "Perfil actualizado correctamente.", success: true };
    } catch (err: any) {
        console.error("Error updating profile:", err);
        return { error: err.message || "Error al actualizar perfil." };
    }
}
