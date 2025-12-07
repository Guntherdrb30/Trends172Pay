"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Check, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

function ReviewContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const amount = parseFloat(searchParams.get("amount") || "0");
    const method = searchParams.get("method") || "Desconocido";
    const description = searchParams.get("description") || "Compra";

    const [commission, setCommission] = useState(0);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Simular cálculo de comisión según método
        let fee = 0;
        if (method.toLowerCase().includes("tarjeta")) {
            fee = amount * 0.029 + 0.30; // 2.9% + $0.30
        } else if (method.toLowerCase().includes("móvil") || method.toLowerCase().includes("movil")) {
            fee = amount * 0.015; // 1.5%
        } else {
            fee = amount * 0.01; // 1% default
        }

        setCommission(fee);
        setTotal(amount + fee);
    }, [amount, method]);

    const handleConfirm = () => {
        setLoading(true);
        // Simular procesamiento
        setTimeout(() => {
            router.push(
                `/pay/demo/result/success?amount=${amount}&method=${encodeURIComponent(method)}&total=${total.toFixed(2)}&commission=${commission.toFixed(2)}`
            );
        }, 1500);
    };

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
                        <span className="text-slate-400">Método de Pago</span>
                        <span className="text-slate-200 font-medium">{method}</span>
                    </div>

                    <Separator className="bg-slate-800" />

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Subtotal</span>
                            <span className="text-slate-200">Bs {amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Comisión Pasarela</span>
                            <span className="text-slate-200">Bs {commission.toFixed(2)}</span>
                        </div>
                        <div className="pt-2 flex justify-between text-base font-bold">
                            <span className="text-indigo-400">Total a Pagar</span>
                            <span className="text-white">Bs {total.toFixed(2)}</span>
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
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
                        disabled={loading}
                    >
                        {loading ? "Procesando..." : `Pagar Bs ${total.toFixed(2)}`}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="w-full text-slate-400 hover:text-white"
                        disabled={loading}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
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
