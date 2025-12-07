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
                </CardFooter >
            </Card >
        </div >
    );
}

export default function ReviewPage() {
    return (
        <Suspense fallback={<div className="text-center p-12 text-slate-500">Cargando detalles...</div>}>
            <ReviewContent />
        </Suspense>
    );
}
