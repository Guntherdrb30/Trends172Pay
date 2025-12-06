import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DemoSuccessPage() {
    return (
        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
            <Card className="w-full bg-slate-950 border-slate-800">
                <CardContent className="pt-10 pb-8 px-6 text-center space-y-6">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
                        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-white">¡Pago Exitoso!</h1>
                        <p className="text-slate-400">
                            Así es como tus clientes verán la confirmación de su compra.
                        </p>
                    </div>

                    <div className="py-6 border-t border-b border-slate-900 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Monto Pagado</span>
                            <span className="text-slate-200 font-medium">$125.00 USD</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Referencia</span>
                            <span className="text-slate-200 font-medium">DEMO-123456</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Estado</span>
                            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">Aprobado</span>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Link href="/">
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                                Volver al Inicio <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
