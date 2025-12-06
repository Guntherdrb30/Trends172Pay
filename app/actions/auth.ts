"use server";

import { createMerchant, getMerchantByEmail } from "@/lib/merchantAppStore";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sendWelcomeEmail, sendLoginAlert } from "@/lib/email";

// Duración de la sesión: 7 días
const SESSION_DURATION = 60 * 60 * 24 * 7;

export async function signup(prevState: any, formData: FormData) {
    const businessName = formData.get("businessName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!businessName || !email || !password) {
        return { error: "Todos los campos son obligatorios." };
    }

    // Validar si ya existe
    const existing = await getMerchantByEmail(email);
    if (existing) {
        return { error: "El correo ya está registrado." };
    }

    try {
        const hashedPassword = await hashPassword(password);

        // Generar businessCode a partir del nombre (simplificado)
        const businessCode = businessName
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "")
            .slice(0, 10) + Math.floor(Math.random() * 1000);

        const merchant = await createMerchant({
            businessCode,
            displayName: businessName,
            commissionPercent: 5.0, // Default
            payoutCurrency: "USD",
            email,
            passwordHash: hashedPassword,
        });

        // Crear sesión
        const cookieStore = await cookies();
        cookieStore.set("merchant_session", merchant.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: SESSION_DURATION,
            path: "/",
        });

        // Enviar email de bienvenida (async, no bloquear)
        sendWelcomeEmail(email, businessName).catch(e => console.error("Email error not blocking flow:", e));

    } catch (error: any) {
        console.error("Signup error:", error);
        return { error: error.message || "Error al crear la cuenta." };
    }

    redirect("/dashboard");
}

export async function login(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Correo y contraseña requeridos." };
    }

    try {
        const merchant = await getMerchantByEmail(email);
        if (!merchant || !merchant.passwordHash) {
            return { error: "Credenciales inválidas." };
        }

        const isValid = await verifyPassword(password, merchant.passwordHash);
        if (!isValid) {
            return { error: "Credenciales inválidas." };
        }

        // Crear sesión
        const cookieStore = await cookies();
        cookieStore.set("merchant_session", merchant.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: SESSION_DURATION,
            path: "/",
        });

        // Enviar alerta de inicio de sesión (async)
        sendLoginAlert(email).catch(e => console.error("Email error not blocking flow:", e));

    } catch (error) {
        console.error("Login error:", error);
        return { error: "Error al iniciar sesión." };
    }

    redirect("/dashboard");
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete("merchant_session");
    redirect("/login");
}
