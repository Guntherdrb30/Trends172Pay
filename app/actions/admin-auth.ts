"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE_NAME = "admin_session";

export async function adminLogin(formData: FormData) {
    const password = formData.get("password") as string;
    const expectedToken = process.env.ROOT_DASHBOARD_TOKEN;

    if (!expectedToken) {
        return { error: "ROOT_DASHBOARD_TOKEN no está configurado en el entorno." };
    }

    // Simple check against the root token
    if (password === expectedToken) {
        // Set HTTP-only cookie
        const cookieStore = await cookies();
        cookieStore.set(ADMIN_COOKIE_NAME, "active", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 8, // 8 hours
        });

        redirect("/admin/dashboard");
    } else {
        return { error: "Credenciales inválidas" };
    }
}

export async function adminLogout() {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_COOKIE_NAME);
    redirect("/admin-login");
}

export async function checkAdminSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    return session === "active";
}
