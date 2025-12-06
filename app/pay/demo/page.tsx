import { CheckoutDemo } from "@/components/CheckoutDemo";

export default function DemoPage() {
    return (
        <div className="flex flex-col items-center justify-center w-full">
            <div className="mb-8 text-center">
                <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400 mb-4 ring-1 ring-inset ring-indigo-500/20">
                    Ambiente de Prueba
                </span>
                <h1 className="text-3xl font-bold text-slate-100">Simulación de Pago</h1>
                <p className="text-slate-400 mt-2">Experimenta el flujo de compra tal como lo verían tus clientes.</p>
            </div>
            <CheckoutDemo />
        </div>
    );
}
