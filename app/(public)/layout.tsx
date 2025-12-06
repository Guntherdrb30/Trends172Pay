export default function PublicLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                    <span className="text-lg font-bold tracking-tight text-slate-100">
                        trends172 <span className="text-indigo-400">Pay</span>
                    </span>
                    <nav className="flex items-center gap-4">
                        <a href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                            Iniciar Sesión
                        </a>
                        <a href="/signup" className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors">
                            Registrarse
                        </a>
                    </nav>
                </div>
            </header>

            <main className="mx-auto flex w-full max-w-5xl flex-1 px-4 py-10">
                {children}
            </main>

            <footer className="border-t border-slate-800 bg-slate-950/80">
                <div className="mx-auto max-w-5xl px-4 py-3 text-xs text-slate-500">
                    © {new Date().getFullYear()} trends172 Pay
                </div>
            </footer>
        </div>
    );
}
