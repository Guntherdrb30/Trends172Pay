import Link from "next/link";

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full gap-6">
      <aside className="w-56 shrink-0 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
        <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
          trends172 Pay
        </div>
        <nav className="space-y-1 text-sm">
          <Link
            href="/admin/merchants"
            className="block rounded-md px-3 py-2 text-slate-200 hover:bg-slate-900/80 hover:text-slate-50"
          >
            Negocios / Integraciones
          </Link>
          <Link
            href="/admin/sessions"
            className="block rounded-md px-3 py-2 text-slate-200 hover:bg-slate-900/80 hover:text-slate-50"
          >
            Sesiones de pago
          </Link>
        </nav>
      </aside>
      <section className="flex-1">
        {children}
      </section>
    </div>
  );
}

