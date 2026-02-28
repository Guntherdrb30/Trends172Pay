import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { logout } from "@/app/actions/auth";

function onlyDigits(value: string): string {
  return value.replace(/[^\d]/g, "");
}

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const salesEmail = (process.env.NEXT_PUBLIC_SALES_EMAIL ?? "").trim();
  const whatsappNumber = onlyDigits(process.env.NEXT_PUBLIC_SALES_WHATSAPP ?? "");
  const whatsappPrefill = encodeURIComponent(
    process.env.NEXT_PUBLIC_SALES_WHATSAPP_MESSAGE ??
      "Hola, necesito asesoria para activar mi boton de pago."
  );
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${whatsappPrefill}`
    : "";

  return (
    <div className="flex h-screen w-full flex-col md:flex-row">
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
            Integracion
          </Link>
          <Link
            href="/dashboard/profile"
            className="block rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
          >
            Perfil de Negocio
          </Link>

          {whatsappNumber ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-950/30 hover:text-emerald-200"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Soporte por WhatsApp
            </a>
          ) : salesEmail ? (
            <a
              href={`mailto:${salesEmail}?subject=Soporte%20trends172%20Pay`}
              className="block rounded-md px-3 py-2 text-sm font-medium text-cyan-300 hover:bg-cyan-950/20 hover:text-cyan-200"
            >
              Soporte por Correo
            </a>
          ) : null}

          <form action={logout} className="mt-8 border-t border-slate-900 pt-4">
            <button
              type="submit"
              className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-red-400 hover:bg-red-950/20"
            >
              Cerrar Sesion
            </button>
          </form>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto bg-slate-950 text-slate-50">
        <div className="p-8 pb-32">{children}</div>
      </main>
    </div>
  );
}
