import Link from "next/link";
import { ArrowLeft, CreditCard, Smartphone, Banknote, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MethodsPage() {
    return (
        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
            <div className="w-full max-w-4xl space-y-12">
                {/* Header */}
                <div className="space-y-4 text-center">
                    <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6">
                        <CreditCard className="h-8 w-8 text-emerald-400" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
                        Múltiples <span className="text-emerald-400">Métodos</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        No pierdas ni una venta. Ofrece a tus clientes la libertad de pagar como prefieran, en una sola integración.
                    </p>
                </div>
                {/* Card 2: Pago Móvil */}
                <div className="group relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 hover:border-emerald-500/50 transition-all duration-300">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl group-hover:bg-blue-500/20 transition-all"></div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-8">
                        <div className="flex-1 space-y-4">
                            <div className="inline-flex p-3 rounded-xl bg-blue-500/10 text-blue-400">
                                <Smartphone className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Pago Móvil C2P</h3>
                            <p className="text-slate-400 leading-relaxed">
                                La forma más popular de pagar en Venezuela. Cobro directo interbancario sin necesidad de comprobantes ni validaciones manuales.
                            </p>
                            <ul className="space-y-2 pt-2">
                                {["Confirmación Inmediata (Real-time)", "Sin riesgo de contracargos", "Experiencia 100% móvil"].map(item => (
                                    <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex-1 bg-slate-950/50 rounded-2xl border border-slate-800 p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Comisión</p>
                                    <p className="text-xl font-bold text-white mt-1">1.5% <span className="text-sm text-slate-400 font-normal">flat</span></p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Liquidación</p>
                                    <p className="text-xl font-bold text-white mt-1">Inmediata</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Límite por Tx</p>
                                    <p className="text-lg font-medium text-slate-200 mt-1">Sujeto al Banco</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Moneda Base</p>
                                    <p className="text-lg font-medium text-slate-200 mt-1">VES (Bolívares)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 3: Transferencias & Cripto */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 hover:border-emerald-500/30 transition-all">
                        <div className="inline-flex p-3 rounded-xl bg-purple-500/10 text-purple-400 mb-6">
                            <Banknote className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Transferencias Bancarias</h3>
                        <p className="text-slate-400 text-sm mb-6">
                            Cuenta recaudadora única. Ideal para montos altos B2B. Conciliación automática vía API bancaria.
                        </p>
                        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold">Comisión</p>
                                <p className="font-bold text-white">0.5% - 1%</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500 uppercase font-semibold">Liquidación</p>
                                <p className="font-bold text-white">T+1 Día</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 hover:border-emerald-500/30 transition-all relative overflow-hidden">
                        <div className="absolute top-2 right-2 px-3 py-1 bg-emerald-500 text-black text-xs font-bold rounded-full">BETA</div>
                        <div className="inline-flex p-3 rounded-xl bg-yellow-500/10 text-yellow-400 mb-6">
                            <Globe className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Criptomonedas (USDT)</h3>
                        <p className="text-slate-400 text-sm mb-6">
                            Recibe pagos en stablecoins (USDT/USDC) a través de redes TRC20 y BEP20. Sin volatilidad.
                        </p>
                        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold">Comisión</p>
                                <p className="font-bold text-white">1% Flat</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500 uppercase font-semibold">Liquidación</p>
                                <p className="font-bold text-white">Inmediata</p>
                            </div>
                        </div>
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
        </div >
    );
}
