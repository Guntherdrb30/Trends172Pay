"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Landmark } from "lucide-react";

interface MercantilButtonProps {
    sessionId: string;
    onError: (msg: string) => void;
}

export function MercantilButton({ sessionId, onError }: MercantilButtonProps) {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/pay/mercantil/init", {
                method: "POST",
                body: JSON.stringify({ sessionId }),
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) throw new Error("Error al comunicarse con el banco");

            const data = await res.json();
            if (data.redirectUrl) {
                window.location.href = data.redirectUrl;
            } else {
                throw new Error("URL de redirección inválida");
            }
        } catch (err: any) {
            onError(err.message || "Error desconocido");
            setLoading(false);
        }
    };

    return (
        <div className="space-y-3">
            <div className="rounded-md border border-blue-900/50 bg-blue-950/30 p-3 text-xs text-blue-200">
                Serás redirigido al portal seguro de <strong>Banco Mercantil</strong> para autorizar el débito directo de tu cuenta.
            </div>
            <Button
                className="w-full bg-[#0047BA] hover:bg-[#003da1] text-white"
                onClick={handlePayment}
                disabled={loading}
            >
                <Landmark className="mr-2 h-4 w-4" />
                {loading ? "Redirigiendo..." : "Pagar con Banco Mercantil"}
            </Button>
        </div>
    );
}
