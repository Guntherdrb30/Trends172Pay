import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Eye, Server } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SecurityPage() {
    return (
        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
            <div className="w-full max-w-4xl space-y-12">
                {/* Header */}
                <div className="space-y-4 text-center">
                    <div className="mx-auto h-16 w-16 rounded-2xl bg-sky-500/20 flex items-center justify-center mb-6">
                        <ShieldCheck className="h-8 w-8 text-sky-400" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
                        Seguridad <span className="text-sky-400">Total</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Tu tranquilidad y la de tus clientes es nuestra prioridad. Infraestructura blindada para cada transacción.
                    </p>
                </div>

                {/* Security Features List */}
                <div className="space-y-6">
                    <div className="flex gap-6 p-6 rounded-2xl bg-slate-900 border border-slate-800">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-sky-900/30 flex items-center justify-center">
                            <Lock className="h-6 w-6 text-sky-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Encriptación de Extremo a Extremo</h3>
                            <p className="text-slate-400 mt-2">
                                Todos los datos sensibles viajan encriptados bajo protocolos TLS 1.3 de última generación.
                                Nunca almacenamos números de tarjeta completos en nuestros servidores.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-6 p-6 rounded-2xl bg-slate-900 border border-slate-800">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-sky-900/30 flex items-center justify-center">
                            <Eye className="h-6 w-6 text-sky-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Monitoreo Antifraude 24/7</h3>
                            <p className="text-slate-400 mt-2">
                                Nuestros algoritmos de inteligencia artificial analizan patrones de comportamiento en tiempo real
                                para detectar y bloquear transacciones sospechosas antes de que ocurran.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-6 p-6 rounded-2xl bg-slate-900 border border-slate-800">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-sky-900/30 flex items-center justify-center">
                            <Server className="h-6 w-6 text-sky-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Infraestructura Redundante</h3>
                            <p className="text-slate-400 mt-2">
                                Servidores distribuidos globalmente aseguran que tu pasarela esté siempre activa,
                                incluso ante picos de tráfico inesperados o fallos regionales.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="flex justify-center pt-8">
                    <Link href="/">
                        <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Inicio
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
