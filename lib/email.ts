import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_123"); // Fallback to mock if missing for dev

const SENDER = "trends172 Pay <onboarding@resend.dev>"; // Use verified domain in prod

export async function sendWelcomeEmail(email: string, businessName: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY missing. Mocking email send to:", email);
        return;
    }

    try {
        await resend.emails.send({
            from: SENDER,
            to: email,
            subject: `Bienvenido a trends172 Pay, ${businessName}!`,
            html: `
        <h1>Bienvenido a trends172 Pay</h1>
        <p>Hola <strong>${businessName}</strong>,</p>
        <p>Gracias por registrarte en nuestra plataforma. Estamos emocionados de ayudarte a gestionar tus cobros.</p>
        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
        <br/>
        <p>El equipo de trends172 Pay</p>
      `,
        });
    } catch (error) {
        console.error("Error sending welcome email:", error);
    }
}

export async function sendLoginAlert(email: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY missing. Mocking email send to:", email);
        return;
    }

    try {
        await resend.emails.send({
            from: SENDER,
            to: email,
            subject: "Alerta de Nuevo Inicio de Sesión",
            html: `
        <h2>Nuevo Inicio de Sesión Detectado</h2>
        <p>Se ha detectado un nuevo inicio de sesión en tu cuenta de trends172 Pay.</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
        <p>Si no fuiste tú, por favor contacta a soporte inmediatamente.</p>
      `,
        });
    } catch (error) {
        console.error("Error sending login alert:", error);
    }
}
