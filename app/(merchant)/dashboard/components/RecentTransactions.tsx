"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getGlobalSettings, GlobalSettings } from "@/app/actions/settings";
import { Loader2 } from "lucide-react";

// Initial mock data simulating GATEWAY TOTALS (what user paid - fees are included or removed from here?)
// Assumption: The 'amount' here is what the user Paid (Base + Gateway Fee + Tax). 
// But usually merchant sees the BASE SALE amount.
// Let's assume 'amount' here is the BASE SALE amount for simplicity in this demo.
const recentTransactions = [
    {
        id: "TRX-9821",
        customer: "Maria Gonzalez",
        amount: 45.00,
        status: "success",
        date: "Hace 5 minutos",
        method: "Tarjeta",
    },
    {
        id: "TRX-9820",
        customer: "Juan Perez",
        amount: 120.50,
        status: "pending",
        date: "Hace 15 minutos",
        method: "Pago Móvil",
    },
    {
        id: "TRX-9819",
        customer: "Ana Rodriguez",
        amount: 15.00,
        status: "failed",
        date: "Hace 1 hora",
        method: "Tarjeta",
    },
    {
        id: "TRX-9818",
        customer: "Carlos Sanchez",
        amount: 250.00,
        status: "success",
        date: "Hace 2 horas",
        method: "Zelle",
    },
    {
        id: "TRX-9817",
        customer: "Luisa Mendoza",
        amount: 32.00,
        status: "success",
        date: "Hace 3 horas",
        method: "Tarjeta",
    },
];

export function RecentTransactions() {
    const [settings, setSettings] = useState<GlobalSettings | null>(null);

    useEffect(() => {
        getGlobalSettings().then(setSettings);
    }, []);

    if (!settings) {
        return <div className="flex gap-2 text-muted-foreground"><Loader2 className="animate-spin h-4 w-4" /> Cargando datos...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">Transacciones Recientes y Liquidación</h2>
                    <p className="text-xs text-muted-foreground">Costo Bancario Aplicado: {settings.bankFeePercent}%</p>
                </div>
                <p className="text-sm text-emerald-400 hover:underline cursor-pointer">Exportar Excel</p>
            </div>
            <div className="rounded-md border border-slate-800 bg-slate-900/50">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-800 hover:bg-slate-900">
                            <TableHead className="text-slate-400">ID / Método</TableHead>
                            <TableHead className="text-slate-400">Estado</TableHead>
                            <TableHead className="text-right text-slate-400">Monto Base</TableHead>
                            <TableHead className="text-right text-slate-400">Comisión Banco</TableHead>
                            <TableHead className="text-right text-emerald-400 font-bold">Neto (A Recibir)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentTransactions.map((transaction) => {
                            // Calculation logic
                            const bankFee = transaction.amount * (settings.bankFeePercent / 100);
                            const netTotal = transaction.amount - bankFee;

                            return (
                                <TableRow key={transaction.id} className="border-slate-800 hover:bg-slate-800/50">
                                    <TableCell>
                                        <div className="font-medium text-slate-200">{transaction.id}</div>
                                        <div className="text-xs text-slate-500">{transaction.method} • {transaction.customer}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                transaction.status === "success"
                                                    ? "default"
                                                    : transaction.status === "pending"
                                                        ? "secondary"
                                                        : "destructive"
                                            }
                                            className={
                                                transaction.status === "success" ? "bg-emerald-500 hover:bg-emerald-600" : ""
                                            }
                                        >
                                            {transaction.status === "success"
                                                ? "Pagado"
                                                : transaction.status === "pending"
                                                    ? "Pendiente"
                                                    : "Fallido"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-slate-200">${transaction.amount.toFixed(2)}</TableCell>
                                    <TableCell className="text-right text-red-400">-${bankFee.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-bold text-emerald-400">${netTotal.toFixed(2)}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
