"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const recentTransactions = [
    {
        id: "TRX-9821",
        customer: "Maria Gonzalez",
        amount: "45.00",
        status: "success",
        date: "Hace 5 minutos",
        method: "Tarjeta",
    },
    {
        id: "TRX-9820",
        customer: "Juan Perez",
        amount: "120.50",
        status: "pending",
        date: "Hace 15 minutos",
        method: "Pago Móvil",
    },
    {
        id: "TRX-9819",
        customer: "Ana Rodriguez",
        amount: "15.00",
        status: "failed",
        date: "Hace 1 hora",
        method: "Tarjeta",
    },
    {
        id: "TRX-9818",
        customer: "Carlos Sanchez",
        amount: "250.00",
        status: "success",
        date: "Hace 2 horas",
        method: "Zelle",
    },
    {
        id: "TRX-9817",
        customer: "Luisa Mendoza",
        amount: "32.00",
        status: "success",
        date: "Hace 3 horas",
        method: "Tarjeta",
    },
];

export function RecentTransactions() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">Transacciones Recientes</h2>
                <p className="text-sm text-muted-foreground hover:underline cursor-pointer">Ver todas</p>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Método</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentTransactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                                <TableCell className="font-medium">{transaction.id}</TableCell>
                                <TableCell>{transaction.customer}</TableCell>
                                <TableCell>{transaction.method}</TableCell>
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
                                            transaction.status === "success" ? "bg-green-500 hover:bg-green-600" : ""
                                        }
                                    >
                                        {transaction.status === "success"
                                            ? "Exitoso"
                                            : transaction.status === "pending"
                                                ? "Pendiente"
                                                : "Fallido"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">${transaction.amount}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
