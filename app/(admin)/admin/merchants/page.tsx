import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, MoreHorizontal, Ban } from "lucide-react";

// Mock Data
const merchants = [
    { id: "1", name: "Carpintería Moderna", email: "contacto@carpihogar.com", status: "active", plan: "Pro", volume: "$12,400" },
    { id: "2", name: "TechStore VE", email: "admin@techstore.ve", status: "active", plan: "Basic", volume: "$5,300" },
    { id: "3", name: "Inversiones Beta", email: "fbeta@gmail.com", status: "inactive", plan: "Basic", volume: "$0" },
];

export default function AdminMerchantsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Gestión de Clientes</h1>
                <Button className="bg-indigo-600 hover:bg-indigo-700">Nuevo Cliente</Button>
            </div>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white">Listado de Comercios</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-800 hover:bg-transparent">
                                <TableHead className="text-slate-400">Cliente / Negocio</TableHead>
                                <TableHead className="text-slate-400">Estado</TableHead>
                                <TableHead className="text-slate-400">Plan</TableHead>
                                <TableHead className="text-slate-400">Volumen Total</TableHead>
                                <TableHead className="text-right text-slate-400">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {merchants.map((merchant) => (
                                <TableRow key={merchant.id} className="border-slate-800 hover:bg-slate-800/50">
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-white">{merchant.name}</p>
                                            <p className="text-xs text-slate-500">{merchant.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={merchant.status === 'active' ? "default" : "destructive"} className={merchant.status === 'active' ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30" : ""}>
                                            {merchant.status === 'active' ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-slate-300 bg-slate-800 px-2 py-1 rounded text-xs">{merchant.plan}</span>
                                    </TableCell>
                                    <TableCell className="text-slate-200 font-mono">
                                        {merchant.volume}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-400">
                                                <Ban className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
