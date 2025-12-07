"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Save } from "lucide-react";

export default function AdminSettingsPage() {
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
                            <Input type="number" id="bcv-rate" placeholder="36.54" className="bg-slate-950 border-slate-700 text-white" defaultValue="36.54" />
                        </div>
                        <Button variant="outline" className="border-slate-700 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500/50">
                            <RefreshCw className="mr-2 h-4 w-4" /> Sincronizar con BCV
                        </Button>
                    </div>
                    <p className="text-xs text-slate-500">Última sincronización automática: Hoy 9:00 AM</p>
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
                                <Input type="number" className="bg-slate-950 border-slate-700 text-white" defaultValue="2.90" />
                                <span className="text-slate-400 text-sm">%</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-200">Fijo por Transacción (Tarjetas)</Label>
                            <div className="flex items-center gap-2">
                                <Input type="number" className="bg-slate-950 border-slate-700 text-white" defaultValue="0.30" />
                                <span className="text-slate-400 text-sm">USD</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-200">Pago Móvil C2P</Label>
                            <div className="flex items-center gap-2">
                                <Input type="number" className="bg-slate-950 border-slate-700 text-white" defaultValue="1.50" />
                                <span className="text-slate-400 text-sm">%</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-200">Transferencias</Label>
                            <div className="flex items-center gap-2">
                                <Input type="number" className="bg-slate-950 border-slate-700 text-white" defaultValue="1.00" />
                                <span className="text-slate-400 text-sm">%</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto">
                    <Save className="mr-2 h-4 w-4" /> Guardar Cambios
                </Button>
            </div>
        </div>
    );
}
