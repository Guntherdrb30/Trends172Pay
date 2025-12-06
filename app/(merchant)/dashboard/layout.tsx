import Link from "next/link";
import { logout } from "@/app/actions/auth";

export default function DashboardLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen w-full flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full border-b border-slate-800 bg-slate-950 p-4 md:h-full md:w-64 md:border-b-0 md:border-r">
                <div className="mb-6 flex items-center justify-between">
                    <Link href="/dashboard" className="text-xl font-bold text-slate-50">
                        trends172 Pay
                    </Link>
                </div>
                <nav className="space-y-1">
                    <Link
                        href="/dashboard"
                        className="block rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
                    >
                        Resumen
                    </Link>
                    <Link
                        href="/dashboard/integration"
                        className="block rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
                    >
                        Integración
                    </Link>
                    <form action={logout} className="mt-8 pt-4 border-t border-slate-900">
                        <button
                            type="submit"
                            className="w-full text-left rounded-md px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-950/20"
                        >
                            Cerrar Sesión
                        </button>
                    </form>
                </nav>
            </aside>

            {/* Content */}
            <main className="flex-1 overflow-auto bg-slate-950 text-slate-50">
                <div className="p-8 pb-32">
                    {children}
                </div>
            </main>
        </div>
    );
}
