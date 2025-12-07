"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight, Printer } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";

function SuccessContent() {
    const searchParams = useSearchParams();

    // Params with VES logic
    const amountUsd = searchParams.get("amount") || "100.00";
    const taxUsd = searchParams.get("tax") || "16.00";
    const feeUsd = searchParams.get("fee") || "1.46";
    const totalUsd = searchParams.get("totalUsd") || "117.46";
    const totalBs = searchParams.get("totalBs") || "6509.63";
    const rate = searchParams.get("rate") || "55.42";
    const methodStr = searchParams.get("method") ? decodeURIComponent(searchParams.get("method")!) : "Tarjeta de Crédito";

    const handlePrint = () => {
        window.print();
    };

    const currentDate = new Date().toLocaleDateString("es-VE", {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto animate-in fade-in zoom-in duration-500 py-10">
            <Card className="w-full bg-slate-950 border-slate-800 shadow-2xl overflow-hidden print:shadow-none print:border-none">
                {/* Status Header */}
                <div className="bg-emerald-500/10 p-6 flex flex-col items-center justify-center border-b border-emerald-500/20 print:bg-transparent print:border-b-black">
                    <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/20">
                        <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-emerald-400 print:text-black">Pago Exitoso</h2>
                    <p className="text-emerald-500/80 text-sm print:text-black">Su transacción ha sido procesada</p>
                </div>

                <CardContent className="p-8 space-y-6 bg-slate-950/50 print:bg-white print:text-black">
                    {/* Header Info */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-slate-100 text-lg print:text-black">Demo Store Inc.</h3>
                            <p className="text-xs text-slate-400 print:text-gray-600">RIF: J-12345678-9</p>
                            <p className="text-xs text-slate-400 print:text-gray-600">Caracas, Venezuela</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500 uppercase tracking-widest print:text-gray-500">Recibo</p>
                            <p className="font-mono text-slate-200 print:text-black">#TRX-8923</p>
                        </div>
                    </div>

                    <Separator className="bg-slate-800 print:bg-gray-300" />

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                            <p className="text-slate-500 text-xs uppercase print:text-gray-500">Fecha de Pago</p>
                            <p className="text-slate-200 font-medium print:text-black">{currentDate}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-slate-500 text-xs uppercase print:text-gray-500">Método de Pago</p>
                            <p className="text-slate-200 font-medium print:text-black">{methodStr}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-slate-500 text-xs uppercase print:text-gray-500">Ref. Bancaria</p>
                            <p className="text-slate-200 font-medium print:text-black">0011223344</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-slate-500 text-xs uppercase print:text-gray-500">Tasa BCV</p>
                            <p className="text-emerald-400 font-medium print:text-black">{rate} Bs/$</p>
                        </div>
                    </div>

                    <Separator className="bg-slate-800 print:bg-gray-300" />

                    {/* Line Items */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-300 print:text-black">Precio Base</span>
                            <span className="text-slate-200 font-medium print:text-black">${amountUsd}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-300 print:text-black">IVA (16%)</span>
                            <span className="text-slate-200 font-medium print:text-black">${taxUsd}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-300 print:text-black">Comisión Pasarela</span>
                            <span className="text-slate-200 font-medium print:text-black">${feeUsd}</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-slate-800">
                            <span className="text-slate-400 font-medium print:text-black">Total USD</span>
                            <span className="text-slate-200 font-bold print:text-black">${totalUsd}</span>
                        </div>

                        {/* Final VES Total */}
                        <div className="bg-emerald-950/30 p-4 mt-2 rounded-lg border border-emerald-900/50 print:bg-gray-100 print:border-gray-300">
                            <div className="flex justify-between items-end">
                                <span className="text-emerald-500 font-bold mb-1 print:text-black">Monto Pagado</span>
                                <span className="text-2xl font-bold text-white print:text-black">Bs {totalBs}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>

                {/* Actions Footer - Hidden on Print */}
                <CardFooter className="bg-slate-900 p-6 flex flex-col gap-3 print:hidden">
                    <Button
                        onClick={handlePrint}
                        variant="outline"
                        className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                        <Printer className="mr-2 h-4 w-4" /> Descargar Comprobante
                    </Button>
                    <Link href="/" className="w-full">
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                            Volver al Inicio <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                </CardFooter>
            </Card>

            <p className="mt-8 text-xs text-slate-500 text-center max-w-xs print:hidden">
                Este es un comprobante de demostración generado automáticamente por trends172 Pay.
            </p>
        </div>
    );
}

export default function DemoSuccessPage() {
    return (
        <Suspense fallback={<div className="text-center p-12 text-slate-500">Cargando recibo...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
