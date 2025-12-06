"use client";

import { useActionState } from "react";
import { MerchantApp } from "@/types/payment";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateMerchantProfile } from "@/app/actions/merchant";

interface ProfileFormProps {
    merchant: MerchantApp;
}

// Simple Avatar component locally if not exists
function SimpleAvatar({ name, url }: { name: string, url?: string }) {
    return (
        <div className="h-20 w-20 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-slate-700">
            {url ? (
                <img src={url} alt={name} className="h-full w-full object-cover" />
            ) : (
                <span className="text-2xl font-bold text-slate-400">{name.substring(0, 2).toUpperCase()}</span>
            )}
        </div>
    );
}

export function ProfileForm({ merchant }: ProfileFormProps) {
    const updateProfileWithId = updateMerchantProfile.bind(null, merchant.id);
    const [state, formAction, isPending] = useActionState(updateProfileWithId, null);

    return (
        <form action={formAction} className="space-y-6">
            {state?.success && (
                <div className="bg-green-900/30 border border-green-900 text-green-300 p-3 rounded-md text-sm">
                    {state.message}
                </div>
            )}
            {state?.error && (
                <div className="bg-red-900/30 border border-red-900 text-red-300 p-3 rounded-md text-sm">
                    {state.error}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Identidad del Negocio</CardTitle>
                    <CardDescription>Información pública que verán tus clientes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-6">
                        <SimpleAvatar name={merchant.displayName} url={merchant.logoUrl} />
                        <Button variant="outline" size="sm" type="button">Cambiar Logo</Button>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="displayName">Nombre del Comercio</Label>
                        <Input name="displayName" id="displayName" defaultValue={merchant.displayName} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Datos Bancarios (Liquidación)</CardTitle>
                    <CardDescription>Cuenta donde recibirás los fondos recaudados.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="bankName">Banco</Label>
                            <Input name="payoutBankName" id="bankName" defaultValue={merchant.payoutBankName || ""} placeholder="Ej. Banco Mercantil" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="currency">Moneda de Liquidación</Label>
                            <Input id="currency" defaultValue={merchant.payoutCurrency} disabled />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="accountNumber">Número de Cuenta / Teléfono</Label>
                        <Input name="payoutAccountNumber" id="accountNumber" defaultValue={merchant.payoutAccountNumber || ""} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="accountHolder">Titular de la Cuenta</Label>
                        <Input name="payoutAccountHolder" id="accountHolder" defaultValue={merchant.payoutAccountHolder || ""} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Contacto Administrativo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="contactName">Nombre de Contacto</Label>
                        <Input name="contactName" id="contactName" defaultValue={merchant.contactName || ""} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contactEmail">Email de Contacto</Label>
                        <Input name="contactEmail" id="contactEmail" defaultValue={merchant.contactEmail || ""} />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button variant="outline" type="button">Cancelar</Button>
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Guardando..." : "Guardar Cambios"}
                </Button>
            </div>
        </form>
    );
}
