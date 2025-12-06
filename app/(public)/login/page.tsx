"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
    const [state, action, pending] = useActionState(login, null);

    return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-950 px-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
                    <CardDescription>
                        Accede a tu panel de trends172 Pay.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={action} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none text-slate-200">
                                Correo Electrónico
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                                placeholder="hola@mi-tienda.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium leading-none text-slate-200">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                            />
                        </div>

                        {state?.error && (
                            <div className="text-sm text-red-500">{state.error}</div>
                        )}

                        <Button type="submit" className="w-full" disabled={pending}>
                            {pending ? "Iniciando..." : "Entrar"}
                        </Button>

                        <div className="mt-4 text-center text-sm">
                            ¿No tienes cuenta?{" "}
                            <Link href="/signup" className="underline hover:text-slate-400">
                                Regístrate aquí
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
