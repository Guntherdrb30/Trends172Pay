import Link from "next/link";
import { ArrowLeft, Code2, Zap, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IntegrationPage() {
    return (
        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
            <div className="w-full max-w-4xl space-y-12">
                {/* Header */}
                <div className="space-y-4 text-center">
                    <div className="mx-auto h-16 w-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6">
                        <Zap className="h-8 w-8 text-indigo-400" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
                        Integración <span className="text-indigo-400">Relámpago</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Diseñamos nuestra API pensando en los desarrolladores. Conéctate y empieza a cobrar en menos de 10 líneas de código.
                    </p>
                </div>

                {/* Code Preview Section */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
                    <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900 px-4 py-2">
                        <div className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="h-3 w-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                        <div className="h-3 w-3 rounded-full bg-green-500/20 border border-green-500/50" />
                        <span className="ml-2 text-xs font-mono text-slate-500">checkout.js</span>
                    </div>
                    <div className="p-6 overflow-x-auto">
                        <pre className="text-sm font-mono leading-relaxed">
                            <code className="text-slate-300">
                                <span className="text-purple-400">const</span> session = <span className="text-purple-400">await</span> trends172.<span className="text-blue-400">checkout</span>.create({`{`}
                                {"\n  "}amount: <span className="text-orange-400">125.00</span>,
                                {"\n  "}currency: <span className="text-green-400">'USD'</span>,
                                {"\n  "}description: <span className="text-green-400">'Plan Premium'</span>,
                                {"\n  "}complete_url: <span className="text-green-400">'https://misi.tio/exito'</span>
                                {`}`});
                            </code>
                        </pre>
                    </div>
                </div>

                {/* Benefits Grid */}
                <div className="grid gap-8 md:grid-cols-3">
                    <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 hover:border-indigo-500/30 transition-colors">
                        <Terminal className="h-8 w-8 text-indigo-400 mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">SDKs Modernos</h3>
                        <p className="text-slate-400 text-sm">Librerías oficiales para React, Node.js y Python mantenidas por nuestro equipo.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 hover:border-indigo-500/30 transition-colors">
                        <Code2 className="h-8 w-8 text-indigo-400 mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">API RESTful</h3>
                        <p className="text-slate-400 text-sm">Endpoints predecibles, respuestas JSON estándar y códigos de error claros.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 hover:border-indigo-500/30 transition-colors">
                        <Zap className="h-8 w-8 text-indigo-400 mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">Webhooks</h3>
                        <p className="text-slate-400 text-sm">Recibe notificaciones en tiempo real sobre el estado de cada transacción.</p>
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
