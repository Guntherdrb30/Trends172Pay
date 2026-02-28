import Link from "next/link";

export default function PublicLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_15%,rgba(125,211,252,0.14),transparent_35%),radial-gradient(circle_at_85%_5%,rgba(253,224,71,0.12),transparent_28%),linear-gradient(180deg,#02050b_0%,#07111f_44%,#02050b_100%)]" />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="rounded-md bg-cyan-300 px-2 py-1 text-xs font-black uppercase tracking-wider text-slate-950">
              172
            </span>
            <span className="text-base font-extrabold tracking-tight text-slate-100 sm:text-lg">
              trends172 Pay
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="#recorrido" className="transition-colors hover:text-white">
              Recorrido
            </a>
            <a href="/pay/demo" className="transition-colors hover:text-white">
              Demo
            </a>
            <a href="/instalacion-prueba" className="transition-colors hover:text-white">
              Instalacion
            </a>
            <a href="#contratar" className="transition-colors hover:text-white">
              Contratar
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-md border border-white/15 px-3 py-1.5 text-sm font-semibold text-slate-200 transition hover:border-white/40 hover:text-white"
            >
              Entrar
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-cyan-300 px-3 py-1.5 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
            >
              Empezar
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </main>

      <footer className="border-t border-white/10 bg-slate-950/80">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-5 text-xs text-slate-400 sm:px-6">
          <p>© {new Date().getFullYear()} trends172 Pay</p>
          <p>Onboarding inteligente para activar tu botón de pago.</p>
        </div>
      </footer>
    </div>
  );
}
