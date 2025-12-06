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

                {/* Methods Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                    <div className="flex items-start gap-4 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 transition-all">
                        <div className="p-3 rounded-lg bg-emerald-500/10">
                            <CreditCard className="h-6 w-6 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Tarjetas Nacionales e Internacionales</h3>
                            <p className="text-slate-400 text-sm mt-1">Visa, Mastercard y Maestro. Procesamiento instantáneo con las comisiones más competitivas del mercado.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 transition-all">
                        <div className="p-3 rounded-lg bg-emerald-500/10">
                            <Smartphone className="h-6 w-6 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Pago Móvil C2P</h3>
                            <p className="text-slate-400 text-sm mt-1">La forma favorita de pagar en Venezuela. Integración directa interbancaria sin capturas de pantalla.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 transition-all">
                        <div className="p-3 rounded-lg bg-emerald-500/10">
                            <Banknote className="h-6 w-6 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Transferencias Inteligentes</h3>
                            <p className="text-slate-400 text-sm mt-1">Conciliación automática de transferencias bancarias. Olvídate de revisar estados de cuenta manualmente.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 transition-all">
                        <div className="p-3 rounded-lg bg-emerald-500/10">
                            <Globe className="h-6 w-6 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Próximamente: Binance & Zelle</h3>
                            <p className="text-slate-400 text-sm mt-1">Estamos trabajando para integrar pagos en criptomonedas y dólares digitales directamente en tu flujo.</p>
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
