import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function AdminLoginPage({
  searchParams
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const cookieStore = cookies();
  const session = cookieStore.get("admin_session")?.value;

  if (session === "active") {
    redirect("/admin/sessions");
  }

  const hasError =
    typeof searchParams?.error === "string" && searchParams.error === "1";

  return (
    <div className="flex w-full items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-base text-slate-100">
            Acceso al dashboard root
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Introduce el token de administración configurado en{" "}
            <span className="font-mono text-[11px] text-slate-300">
              ROOT_DASHBOARD_TOKEN
            </span>{" "}
            para acceder al panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action="/api/admin/login"
            method="POST"
            className="space-y-4 text-xs"
          >
            <div className="flex flex-col gap-1">
              <label
                htmlFor="token"
                className="text-[11px] font-medium text-slate-400"
              >
                Token de administrador
              </label>
              <input
                id="token"
                name="token"
                type="password"
                autoComplete="current-password"
                className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Introduce tu token de administración"
              />
            </div>

            {hasError && (
              <p className="rounded-md border border-red-700/70 bg-red-950/40 px-2 py-1 text-[11px] text-red-100">
                Token incorrecto. Verifica el valor de ROOT_DASHBOARD_TOKEN en
                el entorno del servidor.
              </p>
            )}

            <div className="pt-1">
              <Button type="submit" className="h-8 w-full text-xs">
                Entrar al dashboard
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
