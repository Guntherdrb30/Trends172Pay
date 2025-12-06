import Link from "next/link";
import { listMerchants, seedMerchantApps } from "@/lib/merchantAppStore";

export const dynamic = "force-dynamic";

export default async function AdminMerchantsPage() {
  await seedMerchantApps();
  const merchants = await listMerchants();

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
            Negocios / Integraciones
          </h1>
          <p className="text-sm text-slate-400">
            Gestiona los negocios que utilizan trends172 Pay como pasarela de
            pagos.
          </p>
        </div>
        <Link
          href="/admin/merchants/new"
          className="inline-flex h-9 items-center rounded-md border border-slate-700 bg-slate-900 px-3 text-xs font-medium text-slate-100 hover:bg-slate-800"
        >
          Nuevo negocio
        </Link>
      </header>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-3 py-2 text-left">businessCode</th>
              <th className="px-3 py-2 text-left">displayName</th>
              <th className="px-3 py-2 text-left">contactEmail</th>
              <th className="px-3 py-2 text-right">commissionPercent</th>
              <th className="px-3 py-2 text-center">webhook</th>
              <th className="px-3 py-2 text-right" />
            </tr>
          </thead>
          <tbody>
            {merchants.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-4 text-center text-xs text-slate-500"
                >
                  Todavía no hay negocios configurados.
                </td>
              </tr>
            ) : (
              merchants.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-slate-900/60 hover:bg-slate-900/60"
                >
                  <td className="px-3 py-2 align-top text-xs text-slate-200">
                    {m.businessCode}
                  </td>
                  <td className="px-3 py-2 align-top text-xs text-slate-200">
                    {m.displayName}
                  </td>
                  <td className="px-3 py-2 align-top text-xs text-slate-300">
                    {m.contactEmail ?? "—"}
                  </td>
                  <td className="px-3 py-2 align-top text-right text-xs text-slate-100">
                    {m.commissionPercent.toFixed(2)}%
                  </td>
                  <td className="px-3 py-2 align-top text-center text-xs">
                    {m.webhookUrl ? (
                      <span className="rounded-full bg-emerald-900/40 px-2 py-0.5 text-[10px] font-medium text-emerald-200">
                        configurado
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                        no configurado
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top text-right text-xs">
                    <Link
                      href={`/admin/merchants/${m.id}`}
                      className="inline-flex items-center rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] font-medium text-slate-100 hover:bg-slate-800"
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

