import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Users, Settings, LogOut, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkAdminSession, adminLogout } from "@/app/actions/admin-auth";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const isAuth = await checkAdminSession();

    if (!isAuth) {
        redirect("/admin-login");
    }

    return (
        <div className="min-h-screen bg-slate-950 flex font-sans">
            {/* Admin Sidebar */}
            <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col fixed h-full z-20">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-rose-500">
                        <ShieldAlert className="h-6 w-6" />
                        <span className="font-bold text-lg tracking-tight text-white">Super Admin</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin/dashboard">
                        <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-900">
                            <LayoutDashboard className="mr-3 h-5 w-5" /> Dashboard
                        </Button>
                    </Link>
                    <Link href="/admin/merchants">
                        <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-900">
                            <Users className="mr-3 h-5 w-5" /> Clientes (Merchants)
                        </Button>
                    </Link>
                    <Link href="/admin/settings">
                        <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-900">
                            <Settings className="mr-3 h-5 w-5" /> Configuración Global
                        </Button>
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <form action={adminLogout}>
                        <Button variant="outline" className="w-full border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900">
                            <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
