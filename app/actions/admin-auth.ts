"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE_NAME = "admin_session_token";
// Fallback to a hardcoded token if env is missing (for dev safety, though env is preferred)
const ROOT_TOKEN = process.env.ROOT_DASHBOARD_TOKEN || "carpihogar172.";

export async function adminLogin(formData: FormData) {
    const password = formData.get("password") as string;

    // Simple check against the root token
    if (password === ROOT_TOKEN) {
        // Set HTTP-only cookie
        const cookieStore = await cookies();
        cookieStore.set(ADMIN_COOKIE_NAME, "true", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24, // 24 hours
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
    const hasSession = cookieStore.get(ADMIN_COOKIE_NAME);
    return !!hasSession;
}
