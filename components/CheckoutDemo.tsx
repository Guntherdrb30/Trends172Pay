"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { CreditCard, Smartphone, Building2 } from "lucide-react";

export function CheckoutDemo() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<"card" | "mobile" | "bank">("card");

    // Mock Data
    const amount = 125.00;
    const currency = "USD";
    const merchantName = "Demo Store";
    const description = "Pago de prueba - Plan Premium";

    const handlePayment = async () => {
        setLoading(true);
        setError(null);

        // Simulate network delay
        setTimeout(() => {
            // Redirigir a vista de Revisión (Review) para confirmar comisión
            const methodLabel = paymentMethod === 'card' ? 'Tarjeta' : paymentMethod === 'mobile' ? 'Pago Móvil' : 'Banco Mercantil';
            window.location.href = `/pay/demo/review?amount=${amount}&method=${encodeURIComponent(methodLabel)}&description=${encodeURIComponent(description)}`;
        }, 1500);
    };

    return (
        <Card className="w-full max-w-md mx-auto border-slate-800 bg-slate-950">
            <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                    <div className="bg-indigo-500/10 p-2 rounded-lg">
                        <Building2 className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Resumen del pago</CardTitle>
                        <CardDescription className="text-slate-400">
                            Estás pagando en <span className="font-medium text-white">{merchantName}</span>
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">

                <div className="text-center py-4 bg-slate-900/50 rounded-lg border border-slate-800">
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">
                        Total a pagar
                    </p>
                    <p className="mt-2 text-4xl font-bold text-white">
                        {amount.toFixed(2)} <span className="text-lg font-normal text-slate-400">{currency}</span>
                    </p>
                    <p className="text-sm text-slate-400 mt-2">{description}</p>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-300">Método de Pago</label>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => setPaymentMethod("card")}
                            className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all ${paymentMethod === "card"
                                ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                                : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:bg-slate-800"
                                }`}
                        >
                            <CreditCard className="w-5 h-5" />
                            Tarjeta
                        </button>
                        <button
                            onClick={() => setPaymentMethod("bank")}
                            className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all ${paymentMethod === "bank"
                                ? "border-blue-500 bg-blue-500/10 text-blue-400"
                                : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:bg-slate-800"
                                }`}
                        >
                            <Building2 className="w-5 h-5" />
                            Mercantil
                        </button>
                        <button
                            onClick={() => setPaymentMethod("mobile")}
                            className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all ${paymentMethod === "mobile"
                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                                : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:bg-slate-800"
                                }`}
                        >
                            <Smartphone className="w-5 h-5" />
                            Pago Móvil
                        </button>
                    </div>
                </div>

                {/* Dynamic Fields based on method */}
                <div className="pt-2">
                    {paymentMethod === 'card' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400">Número de Tarjeta (Simulado)</label>
                                <div className="bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-500 font-mono text-sm">
                                    4242 4242 4242 4242
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-400">Expiración</label>
                                    <div className="bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-500 font-mono text-sm">
                                        12/28
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-400">CVC</label>
                                    <div className="bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-500 font-mono text-sm">
                                        123
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {paymentMethod === 'mobile' && (
                        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 text-center animate-in fade-in slide-in-from-top-2">
                            <p className="text-sm text-slate-300">
                                En el entorno real, aquí aparecerían los datos para realizar el Pago Móvil o el formulario C2P.
                            </p>
                        </div>
                    )}
                    {paymentMethod === 'bank' && (
                        <div className="p-4 bg-blue-900/10 rounded-lg border border-blue-900/30 text-center animate-in fade-in slide-in-from-top-2">
                            <p className="text-sm text-blue-300">
                                Redirigiendo al portal seguro del Banco Mercantil...
                            </p>
                        </div>
                    )}
                </div>


                <Button
                    className={`w-full font-bold h-12 text-base transition-all ${paymentMethod === 'bank' ? 'bg-[#0047BA] hover:bg-[#00358a] text-white' :
                        paymentMethod === 'mobile' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' :
                            'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                    disabled={loading}
                    onClick={handlePayment}
                >
                    {loading ? "Procesando Demo..." : paymentMethod === 'bank' ? "Ir al Banco" : "Pagar Ahora"}
                </Button>

                <div className="text-center">
                    <p className="text-xs text-slate-500">
                        Modo de Demostración • No se realizarán cargos reales
                    </p>
                </div>

            </CardContent>
        </Card>
    );
}
