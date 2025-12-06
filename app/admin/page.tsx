import Link from "next/link";
import { seedMerchantApps, listMerchants } from "@/lib/merchantAppStore";
import { listSessions } from "@/lib/paymentSessionStore";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  await seedMerchantApps();

  const [merchants, sessions] = await Promise.all([
    listMerchants(),
    listSessions()
  ]);

  const totalAmount = sessions.reduce((sum, s) => sum + s.amount, 0);
  const totalPlatformFee = sessions.reduce(
    (sum, s) => sum + s.platformFeeAmount,
    0
  );
  const totalNet = sessions.reduce(
    (sum, s) => sum + s.merchantNetAmount,
    0
  );

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          Dashboard root
        </h1>
        <p className="text-sm text-slate-400">
          Resumen general de negocios integrados y sesiones de pago en
          trends172 Pay.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Negocios activos
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-50">
            {merchants.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Total cobrado
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-50">
            {totalAmount.toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Comisiones (trends172)
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-50">
            {totalPlatformFee.toFixed(2)}
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <h2 className="text-sm font-semibold text-slate-100">
            Negocios / Integraciones
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Gestiona los negocios que utilizan trends172 Pay, sus API keys,
            dominios permitidos y datos bancarios.
          </p>
          <div className="mt-3">
            <Link
              href="/admin/merchants"
              className="inline-flex items-center rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800"
            >
              Ir a negocios
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <h2 className="text-sm font-semibold text-slate-100">
            Sesiones de pago
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Consulta el historial de sesiones de pago, estados y comisiones por
            negocio.
          </p>
          <div className="mt-3">
            <Link
              href="/admin/sessions"
              className="inline-flex items-center rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800"
            >
              Ver sesiones
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-slate-400">
        <p className="font-medium text-slate-100">
          Próximos pasos del dashboard
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>Detalle por negocio con métricas y últimos pagos.</li>
          <li>Exportación de sesiones a CSV.</li>
          <li>Configuración avanzada de webhooks y llaves.</li>
        </ul>
      </section>
    </div>
  );
}

