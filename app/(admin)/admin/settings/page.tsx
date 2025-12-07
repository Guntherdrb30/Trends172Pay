"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, Save, Loader2 } from "lucide-react";
import { getGlobalSettings, updateGlobalSetting, GlobalSettings } from "@/app/actions/settings";
import { useToast } from "@/components/ui/use-toast"; // Assuming you have a toast component, else alert

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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
        ];

        await Promise.all(updates);
        setSaving(false);
        alert("Configuración actualizada correctamente"); // Simple feedback
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
                        <Button variant="outline" className="border-slate-700 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500/50">
                            <RefreshCw className="mr-2 h-4 w-4" /> Sincronizar con BCV
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
