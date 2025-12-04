import { listSessions } from "@/lib/paymentSessionStore";
import type { PaymentStatus } from "@/types/payment";

const PAYMENT_STATUSES: PaymentStatus[] = [
  "pending",
  "processing",
  "paid",
  "failed"
];

export default async function AdminSessionsPage({
  searchParams
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const businessCodeParam =
    typeof searchParams?.businessCode === "string"
      ? searchParams.businessCode
      : undefined;

  const statusParam =
    typeof searchParams?.status === "string"
      ? (searchParams.status as PaymentStatus)
      : undefined;

  const allSessions = await listSessions();

  const businessCodes = Array.from(
    new Set(allSessions.map((s) => s.businessCode))
  );

  const sessions = await listSessions({
    businessCode: businessCodeParam,
    status: statusParam
  });

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
          Sesiones de pago
        </h1>
        <p className="text-sm text-slate-400">
          Vista consolidada de las sesiones de pago procesadas por trends172
          Pay.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
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
            Total comisiones (trends172)
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-50">
            {totalPlatformFee.toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Total neto para negocios
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-50">
            {totalNet.toFixed(2)}
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <form
          className="flex flex-wrap items-end gap-3 text-sm"
          method="get"
        >
          <div className="flex flex-col gap-1">
            <label
              htmlFor="businessCode"
              className="text-xs font-medium text-slate-400"
            >
              Negocio (businessCode)
            </label>
            <select
              id="businessCode"
              name="businessCode"
              defaultValue={businessCodeParam ?? ""}
              className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todos</option>
              {businessCodes.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="status"
              className="text-xs font-medium text-slate-400"
            >
              Estado
            </label>
            <select
              id="status"
              name="status"
              defaultValue={statusParam ?? ""}
              className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todos</option>
              {PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="h-8 rounded-md border border-slate-700 bg-slate-900 px-3 text-xs font-medium text-slate-100 hover:bg-slate-800"
          >
            Aplicar filtros
          </button>
        </form>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-3 py-2 text-left">businessCode</th>
                <th className="px-3 py-2 text-left">originSystem</th>
                <th className="px-3 py-2 text-right">amount</th>
                <th className="px-3 py-2 text-right">platformFeeAmount</th>
                <th className="px-3 py-2 text-right">merchantNetAmount</th>
                <th className="px-3 py-2 text-left">status</th>
                <th className="px-3 py-2 text-left">createdAt</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-4 text-center text-xs text-slate-500"
                  >
                    No hay sesiones para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                sessions.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-slate-900/60 hover:bg-slate-900/60"
                  >
                    <td className="px-3 py-2 align-top text-xs text-slate-200">
                      {s.businessCode}
                    </td>
                    <td className="px-3 py-2 align-top text-xs text-slate-200">
                      {s.originSystem}
                    </td>
                    <td className="px-3 py-2 align-top text-right text-xs text-slate-100">
                      {s.amount.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 align-top text-right text-xs text-slate-100">
                      {s.platformFeeAmount.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 align-top text-right text-xs text-slate-100">
                      {s.merchantNetAmount.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 align-top text-xs text-slate-200">
                      {s.status}
                    </td>
                    <td className="px-3 py-2 align-top text-xs text-slate-400">
                      {new Date(s.createdAt).toLocaleString("es-ES")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

