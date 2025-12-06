import Link from "next/link";
import { ArrowRight, CheckCircle2, Zap, Lock, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function HomePage() {
    return (
        <div className="flex flex-col gap-20 py-10">
            {/* Hero Section */}
            <section className="text-center space-y-6">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent pb-2">
                    La forma más simple de <br /> cobrar online en Venezuela
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-slate-400">
                    trends172 Pay ofrece una pasarela robusta para tu negocio.
                    Acepta tarjetas y pagos móviles en minutos con nuestra API fácil de integrar.
                    Sin burocracia, sin complicaciones.
                </p>
                <div className="flex justify-center gap-4 pt-4">
                    <Link href="/signup">
                        <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 font-semibold px-8">
                            Crear Cuenta Gratis
                        </Button>
                    </Link>
                    <Link href="/pay/demo">
                        <Button variant="secondary" size="lg" className="bg-white text-slate-900 hover:bg-slate-200 font-semibold px-8">
                            Probar Demo
                        </Button>
                    </Link>
                    <Link href="#features">
                        <Button variant="outline" size="lg" className="text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white">
                            Saber más
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <Link href="/features/integration" className="block group">
                    <div className="h-full rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-3 transition-all group-hover:border-indigo-500/50 group-hover:bg-slate-900">
                        <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                            <Zap className="h-6 w-6 text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-100">Integración Relámpago</h3>
                        <p className="text-slate-400 text-sm">
                            Copia y pega nuestro botón de pago o usa nuestra API REST completa. Documentación clara y en español.
                        </p>
                    </div>
                </Link>

                <Link href="/features/methods" className="block group">
                    <div className="h-full rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-3 transition-all group-hover:border-emerald-500/50 group-hover:bg-slate-900">
                        <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <CreditCard className="h-6 w-6 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-100">Múltiples Métodos</h3>
                        <p className="text-slate-400 text-sm">
                            Tus clientes eligen cómo pagar: Tarjeta de Crédito, Débito, Pago Móvil y más. Todo centralizado.
                        </p>
                    </div>
                </Link>

                <Link href="/features/security" className="block group">
                    <div className="h-full rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-3 transition-all group-hover:border-sky-500/50 group-hover:bg-slate-900">
                        <div className="h-10 w-10 rounded-lg bg-sky-500/10 flex items-center justify-center">
                            <Lock className="h-6 w-6 text-sky-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-100">Seguridad Total</h3>
                        <p className="text-slate-400 text-sm">
                            Datos encriptados y monitoreo constante. Protegemos cada transacción de tu negocio.
                        </p>
                    </div>
                </Link>
            </section>

            {/* Social Proof / Stats */}
            <section className="rounded-3xl bg-indigo-950/20 border border-indigo-500/10 p-8 sm:p-12 text-center">
                <h2 className="text-2xl font-bold text-slate-100 mb-8">
                    Diseñado para crecer contigo
                </h2>
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    <div className="space-y-1">
                        <p className="text-3xl font-extrabold text-white">99.9%</p>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Uptime</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-3xl font-extrabold text-white">+200</p>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Negocios</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-3xl font-extrabold text-white">1.5s</p>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Latencia</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-3xl font-extrabold text-white">24/7</p>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Soporte</p>
                    </div>
                </div>
            </section>

            {/* CTA Bottom */}
            <section className="flex flex-col items-center justify-center space-y-6 pt-10 border-t border-slate-800">
                <h2 className="text-3xl font-bold text-center text-slate-50">
                    ¿Listo para automatizar tus cobros?
                </h2>
                <p className="text-slate-400 max-w-lg text-center">
                    Únete a los comercios que ya confían en trends172 Pay para gestionar sus ingresos.
                </p>
                <Link href="/signup">
                    <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-200 px-10 py-6 text-lg font-bold">
                        Empezar Ahora <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </Link>
            </section>
        </div>
    );
}
