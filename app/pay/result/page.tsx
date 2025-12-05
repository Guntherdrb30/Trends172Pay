import { Suspense } from "react";
import ResultClient from "./ResultClient";

export const dynamic = "force-dynamic";

export default function PayResultPage() {
  return (
    <div className="flex w-full items-center justify-center">
      <Suspense fallback={<p className="text-sm text-slate-300">Verificando tu pago...</p>}>
        <ResultClient />
      </Suspense>
    </div>
  );
}

