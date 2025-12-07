"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { adminLogin } from "@/app/actions/admin-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { ShieldAlert, Lock } from "lucide-react";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold"
            disabled={pending}
        >
            {pending ? "Verificando..." : "Acceder al Panel"}
        </Button>
    );
}

export default function AdminLoginPage() {
    const [errorMessage, setErrorMessage] = useState("");

    async function handleSubmit(formData: FormData) {
        const result = await adminLogin(formData);
        if (result?.error) {
            setErrorMessage(result.error);
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-slate-900 border-slate-800 shadow-2xl">
                <CardHeader className="text-center space-y-4 pb-8">
                    <div className="mx-auto h-16 w-16 rounded-full bg-rose-500/10 flex items-center justify-center ring-1 ring-rose-500/20">
                        <ShieldAlert className="h-8 w-8 text-rose-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Super Admin</h1>
                        <p className="text-slate-400 text-sm mt-1">Acceso Restringido - Nivel Root</p>
                    </div>
                </CardHeader>

                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                                Credencial Maestra
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder="••••••••••••••••"
                                    className="pl-9 bg-slate-950 border-slate-800 text-white focus:ring-rose-500 focus:border-rose-500"
                                    required
                                />
                            </div>
                        </div>

                        {errorMessage && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                {errorMessage}
                            </div>
                        )}

                        <div className="pt-4">
                            <SubmitButton />
                        </div>
                    </form>
                </CardContent>

                <CardFooter className="justify-center border-t border-slate-800/50 pt-6">
                    <p className="text-xs text-slate-600">
                        IP Registrada. Todos los accesos son monitoreados.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
