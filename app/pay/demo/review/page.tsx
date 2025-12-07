"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getGlobalSettings, GlobalSettings } from "@/app/actions/settings";

function ReviewContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // 1. Base Price in USD
    const baseAmountUsd = parseFloat(searchParams.get("amount") || "100");
    const method = searchParams.get("method") || "Desconocido";
    const description = searchParams.get("description") || "Compra en Tienda";

    // Constants (Default fallbacks, will be overwritten by DB)
    const IVA_RATE = 0.16;

    // State
    const [settings, setSettings] = useState<GlobalSettings | null>(null);
    const [calculations, setCalculations] = useState({
        taxUsd: 0,
        feeUsd: 0,
        subtotalUsd: 0,
        totalUsd: 0,
        totalBs: 0,
        bcvRate: 0 // Track rate used
    });
    const [loading, setLoading] = useState(true);

    // Fetch Settings
    useEffect(() => {
        async function init() {
            setLoading(true);
            try {
                const data = await getGlobalSettings();
                setSettings(data);
            } catch (error) {
                console.error("Failed to load settings", error);
            }
            // Don't set loading false yet, wait for calc
        }
        init();
    }, []);

    // Calculate when settings or params change
    useEffect(() => {
        if (!settings) return;

        // 2. Calculate IVA
        const tax = baseAmountUsd * IVA_RATE;
        const subtotal = baseAmountUsd + tax;

        // 3. Calculate Platform Commission
        let feePercent = settings.feeCardPercent;
        let feeFixed = settings.feeCardFixed;

        if (method.toLowerCase().includes("móvil") || method.toLowerCase().includes("movil")) {
            feePercent = settings.feeC2pPercent;
            feeFixed = 0; // Usually no fixed fee for C2P, but adaptable
        } else if (method.toLowerCase().includes("transfer")) {
            feePercent = settings.feeTransferPercent;
            feeFixed = 0;
        }

        // Convert percent to decimal (e.g. 2.9 -> 0.029)
        const fee = (subtotal * (feePercent / 100)) + feeFixed;

        // 4. Total USD
        const finalTotalUsd = subtotal + fee;

        // 5. Total VES (Bs)
        const finalTotalBs = finalTotalUsd * settings.bcvRate;

        setCalculations({
            taxUsd: tax,
            subtotalUsd: subtotal,
            feeUsd: fee,
            totalUsd: finalTotalUsd,
            totalBs: finalTotalBs,
            bcvRate: settings.bcvRate
        });
        setLoading(false);

    }, [baseAmountUsd, method, settings]);

    const handleConfirm = () => {
        setLoading(true);
        // Simular procesamiento
        setTimeout(() => {
            const params = new URLSearchParams({
                amount: baseAmountUsd.toFixed(2),
                tax: calculations.taxUsd.toFixed(2),
                fee: calculations.feeUsd.toFixed(2),
                totalUsd: calculations.totalUsd.toFixed(2),
                totalBs: calculations.totalBs.toFixed(2),
                rate: calculations.bcvRate.toFixed(2),
                method: method
            });
            router.push(`/pay/demo/result/success?${params.toString()}`);
        }, 1500);
    };

    if (loading && !calculations.bcvRate) {
        return <div className="flex justify-center p-12"><div className="text-slate-400 animate-pulse">Cargando cotización...</div></div>;
    }

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto animate-in fade-in duration-500">
            <h1 className="text-2xl font-bold text-slate-100 mb-6">Revisar Pago</h1>

            <Card className="w-full bg-slate-950 border-slate-800 shadow-xl">
                <CardHeader>
                    <CardTitle className="text-lg text-slate-200">Resumen de la Transacción</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Concepto</span>
                        <span className="text-slate-200 font-medium text-right">{description}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Método</span>
                        <span className="text-slate-200 font-medium">{method}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Tasa BCV</span>
                        <span className="text-emerald-400 font-medium">{calculations.bcvRate.toFixed(2)} Bs/$</span>
                    </div>

                    <Separator className="bg-slate-800" />

                    {/* USD Breakdown */}
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Precio Base</span>
                            <span className="text-slate-200">${baseAmountUsd.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">IVA (16%)</span>
                            <span className="text-slate-200">${calculations.taxUsd.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Comisión Pasarela</span>
                            <span className="text-slate-200">${calculations.feeUsd.toFixed(2)}</span>
                        </div>
                        <div className="pt-2 flex justify-between text-base font-medium border-t border-slate-800/50 mt-2">
                            <span className="text-slate-300">Total USD</span>
                            <span className="text-slate-200">${calculations.totalUsd.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Final Conversion */}
                    <div className="bg-emerald-950/20 rounded-lg p-4 mt-4 border border-emerald-900/50">
                        <div className="flex justify-between items-center">
                            <span className="text-emerald-500 font-medium">Total a Pagar</span>
                            <div className="text-right">
                                <span className="block text-2xl font-bold text-white">Bs {calculations.totalBs.toFixed(2)}</span>
                                <span className="text-xs text-emerald-500/80">Ref: ${calculations.totalUsd.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <Alert className="bg-indigo-950/30 border-indigo-500/20 text-indigo-200 mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                            Al confirmar, aceptas el cargo total incluyendo la comisión por servicio en Bolívares.
                        </AlertDescription>
                    </Alert>

                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <Button
                        onClick={handleConfirm}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 text-lg"
                        disabled={loading}
                    >
                        {loading && !calculations.bcvRate ? "Calculando..." : `Pagar Bs ${calculations.totalBs.toFixed(2)}`}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="w-full text-slate-400 hover:text-white"
                        disabled={loading && !calculations.bcvRate}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Cancelar
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function ReviewPage() {
    return (
        <Suspense fallback={<div className="text-center p-12 text-slate-500">Cargando detalles...</div>}>
            <ReviewContent />
        </Suspense>
    );
}
