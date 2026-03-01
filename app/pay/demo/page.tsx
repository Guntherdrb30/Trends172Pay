import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutDemo } from "@/components/CheckoutDemo";

export default function DemoPage() {
  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="mb-4 w-full max-w-md">
        <Link href="/">
          <Button variant="ghost" className="pl-0 text-slate-400 hover:text-white">
            <ChevronLeft className="mr-1 h-4 w-4" /> Cancelar y volver
          </Button>
        </Link>
      </div>

      <div className="mb-8 text-center">
        <span className="mb-4 inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
          Modo Prueba Real
        </span>
        <h1 className="text-3xl font-bold text-slate-100">Checkout de Prueba</h1>
        <p className="mt-2 text-slate-400">
          Este recorrido usa el mismo checkout real de produccion.
        </p>
      </div>

      <CheckoutDemo />
    </div>
  );
}
