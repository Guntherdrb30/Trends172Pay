"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, Save, Loader2 } from "lucide-react";
import { getGlobalSettings, updateGlobalSetting, GlobalSettings } from "@/app/actions/settings";

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [settings, setSettings] = useState<GlobalSettings | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        setLoading(true);
        const data = await getGlobalSettings();
        setSettings(data);
        setLoading(false);
    }

    async function handleSave() {
        if (!settings) return;
        setSaving(true);

        const updates = [
            updateGlobalSetting("bcv_rate", settings.bcvRate.toString()),
            updateGlobalSetting("fee_card_percent", settings.feeCardPercent.toString()),
            updateGlobalSetting("fee_card_fixed", settings.feeCardFixed.toString()),
            updateGlobalSetting("fee_c2p_percent", settings.feeC2pPercent.toString()),
            updateGlobalSetting("fee_transfer_percent", settings.feeTransferPercent.toString()),
            updateGlobalSetting("bank_fee_percent", settings.bankFeePercent.toString()),
        ];

        await Promise.all(updates);
        setSaving(false);
        alert("Configuración actualizada correctamente");
    }

    async function handleSync() {
        setSyncing(true);
        try {
            const res = await fetch('/api/cron/bcv-sync');
            if (!res.ok) throw new Error('Failed to sync');

            const data = await res.json();
            alert(`Sincronización exitosa: Tasa actualizada a ${data.rate} VES/USD`);
            await loadSettings(); // Reload to show new rate
        } catch (error) {
            console.error(error);
            alert("Error al sincronizar con BCV");
        } finally {
            setSyncing(false);
        }
    }

    const handleChange = (field: keyof GlobalSettings, value: string) => {
        if (!settings) return;
        setSettings({ ...settings, [field]: parseFloat(value) || 0 });
    };

    if (loading) return <div className="p-8 text-white">Cargando configuración...</div>;
    if (!settings) return <div className="p-8 text-red-400">Error al cargar configuración</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
            <h1 className="text-3xl font-bold text-white">Configuración Global</h1>

            {/* BCV Rate Settings */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white">Tasa de Cambio (BCV)</CardTitle>
                    <CardDescription className="text-slate-400">Controla la tasa de cambio utilizada para conversiones VES/USD en todo el sistema.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-end gap-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="bcv-rate" className="text-slate-200">Tasa Actual (VES/USD)</Label>
                            <Input
                                type="number"
                                id="bcv-rate"
                                value={settings.bcvRate}
                                onChange={(e) => handleChange("bcvRate", e.target.value)}
                                className="bg-slate-950 border-slate-700 text-white"
                            />
                        </div>
                        <Button
                            variant="outline"
                            className="border-slate-700 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500/50"
                            onClick={handleSync}
                            disabled={syncing}
                        >
                            {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                            {syncing ? "Sincronizando..." : "Sincronizar con BCV"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Global Fees Settings */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white">Comisiones Base del Sistema</CardTitle>
                    <CardDescription className="text-slate-400">Estas comisiones se aplicarán por defecto a los nuevos comercios.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-slate-200">Tarjetas (Nacionales/Intl)</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={settings.feeCardPercent}
                                    onChange={(e) => handleChange("feeCardPercent", e.target.value)}
                                    className="bg-slate-950 border-slate-700 text-white"
                                />
                                <span className="text-slate-400 text-sm">%</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-200">Fijo por Transacción (Tarjetas)</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={settings.feeCardFixed}
                                    onChange={(e) => handleChange("feeCardFixed", e.target.value)}
                                    className="bg-slate-950 border-slate-700 text-white"
                                />
                                <span className="text-slate-400 text-sm">USD</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-200">Pago Móvil C2P</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={settings.feeC2pPercent}
                                    onChange={(e) => handleChange("feeC2pPercent", e.target.value)}
                                    className="bg-slate-950 border-slate-700 text-white"
                                />
                                <span className="text-slate-400 text-sm">%</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-200">Transferencias</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={settings.feeTransferPercent}
                                    onChange={(e) => handleChange("feeTransferPercent", e.target.value)}
                                    className="bg-slate-950 border-slate-700 text-white"
                                />
                                <span className="text-slate-400 text-sm">%</span>
                            </div>
                        </div>

                        {/* New Bank Fee Section */}
                        <div className="space-y-2 pt-4 border-t border-slate-800 md:col-span-2">
                            <div className="flex items-center gap-2 mb-2">
                                <Label className="text-emerald-400 font-bold">Costo Bancario Interno</Label>
                                <span className="text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">No visible al cliente</span>
                            </div>
                            <div className="flex items-center gap-2 max-w-[200px]">
                                <Input
                                    type="number"
                                    value={settings.bankFeePercent}
                                    onChange={(e) => handleChange("bankFeePercent", e.target.value)}
                                    className="bg-slate-950 border-emerald-900/50 text-emerald-100"
                                />
                                <span className="text-slate-400 text-sm">%</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Este porcentaje es retenido por el banco y se descontará de la liquidación del comercio.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                >
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {saving ? "Guardando..." : "Guardar Cambios"}
                </Button>
            </div>
        </div>
    );
}
