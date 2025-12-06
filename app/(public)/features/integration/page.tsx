import Link from "next/link";
import { ArrowLeft, Code2, Zap, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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

                {/* Detailed Tabs Section */}
                <Tabs defaultValue="quickstart" className="w-full">
                    <div className="flex justify-center mb-8">
                        <TabsList className="bg-slate-900/50 p-1 border border-slate-800 h-12">
                            <TabsTrigger value="quickstart" className="px-6 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:border-indigo-500">Quickstart</TabsTrigger>
                            <TabsTrigger value="sdks" className="px-6 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:border-indigo-500">SDKs & Librerías</TabsTrigger>
                            <TabsTrigger value="webhooks" className="px-6 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:border-indigo-500">Webhooks</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="quickstart" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                        <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
                            <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900 px-4 py-2">
                                <div className="flex gap-1.5">
                                    <div className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                    <div className="h-3 w-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                    <div className="h-3 w-3 rounded-full bg-green-500/20 border border-green-500/50" />
                                </div>
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
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="p-6 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                                <Zap className="h-6 w-6 text-indigo-400 mb-3" />
                                <h3 className="font-bold text-white mb-2">Simplicidad Absoluta</h3>
                                <p className="text-sm text-slate-400">Nuestro 'Drop-in UI' maneja validaciones, diseño responsive y detección de fraude automáticamente.</p>
                            </div>
                            <div className="p-6 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                                <Terminal className="h-6 w-6 text-indigo-400 mb-3" />
                                <h3 className="font-bold text-white mb-2">Ambiente Sandbox</h3>
                                <p className="text-sm text-slate-400">Prueba todas las funcionalidades con tarjetas y datos de prueba antes de pasar a producción.</p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="sdks" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                        <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
                            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2">
                                <span className="text-xs font-mono text-slate-500">Terminal</span>
                            </div>
                            <div className="p-6 font-mono text-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-green-400">➜</span>
                                    <span className="text-slate-300">npm install @trends172/node-sdk</span>
                                </div>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-green-400">➜</span>
                                    <span className="text-slate-300">pip install trends172-python</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-green-400">➜</span>
                                    <span className="text-slate-300">composer require trends172/php-sdk</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid gap-4 text-center">
                            <h3 className="text-slate-200 font-medium">Soportamos tu stack favorito</h3>
                            <div className="flex flex-wrap justify-center gap-3">
                                {["Node.js", "Python", "PHP", "Ruby", "Go", "Java", ".NET"].map((lang) => (
                                    <span key={lang} className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
                                        {lang}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="webhooks" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-white">Eventos en Tiempo Real</h3>
                                <p className="text-slate-400">
                                    Configura endpoints HTTP en tu servidor y te notificaremos instantáneamente cuando ocurran eventos importantes.
                                </p>
                                <ul className="space-y-2">
                                    {["payment.succeeded", "payment.failed", "refund.created", "dispute.opened"].map(event => (
                                        <li key={event} className="flex items-center gap-2 text-sm text-slate-300">
                                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                            {event}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                                <div className="bg-slate-900 px-4 py-2 text-xs font-mono text-slate-500">payload.json</div>
                                <div className="p-4 overflow-x-auto">
                                    <pre className="text-xs font-mono text-slate-300 leading-relaxed">
                                        {`{
  "id": "evt_123456789",
  "object": "event",
  "type": "payment.succeeded",
  "data": {
    "object": {
      "id": "pi_3MtwBwAc",
      "amount": 12500,
      "currency": "ves",
      "status": "succeeded"
    }
  }
}`}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

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
