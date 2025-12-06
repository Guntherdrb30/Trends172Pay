"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Lock } from "lucide-react";

function MockBankContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get("sessionId");
    const amount = searchParams.get("amount");
    const currency = searchParams.get("currency");

    const [loading, setLoading] = useState(false);

    const handleAuthorize = async () => {
        setLoading(true);
        // Simular latencia de red bancaria
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Redirigir al callback de éxito (simulado)
        // Nota: En un flujo real, el banco haría un POST o redirigiría con parámetros cifrados.
        // Aquí simplificamos redirigiendo a nuestra página de resultado.
        router.push(`/pay/result/success?sessionId=${sessionId}`);
    };

    const handleCancel = () => {
        router.push(`/pay?sessionId=${sessionId}`);
    };

    if (!sessionId) return <div className="p-10 text-center">Error: No hay sesión válida.</div>;

    return (
        <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-t-4 border-t-[#0047BA] shadow-lg">
                <CardHeader className="text-center border-b pb-4">
                    <div className="flex justify-center mb-2">
                        {/* Logo simulado */}
                        <div className="bg-[#0047BA] text-white font-bold px-4 py-2 rounded text-xl">
                            Simulador Banco
                        </div>
                    </div>
                    <CardTitle className="text-[#0047BA]">Portal de Pagos Web</CardTitle>
                    <div className="flex items-center justify-center gap-2 text-sm text-green-600 mt-2">
                        <ShieldCheck className="h-4 w-4" />
                        Sitio Seguro
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="bg-blue-50 p-4 rounded-md space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Comercio:</span>
                            <span className="font-semibold">Trends172 Pay</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Monto a Debitar:</span>
                            <span className="font-bold text-lg">{currency} {amount}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Número de Tarjeta de Débito / Cuenta</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="0000 0000 0000 0000"
                                    className="pl-9"
                                    defaultValue="Simulacion - No real"
                                    disabled
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Clave Telefónica / Internet</Label>
                            <Input type="password" placeholder="••••••••" />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 border-t pt-6 bg-gray-50/50">
                    <Button
                        className="w-full bg-[#0047BA] hover:bg-[#003da1]"
                        size="lg"
                        onClick={handleAuthorize}
                        disabled={loading}
                    >
                        {loading ? "Procesando..." : "Autorizar Pago"}
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        Cancelar Operación
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function MockBankPage() {
    return (
        <Suspense fallback={<div>Cargando portal bancario...</div>}>
            <MockBankContent />
        </Suspense>
    );
}
