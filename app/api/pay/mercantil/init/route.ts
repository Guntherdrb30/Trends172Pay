import { NextResponse } from "next/server";
import { getPaymentSession } from "@/lib/paymentSessionStore";

export async function POST(request: Request) {
    try {
        const { sessionId } = await request.json();

        if (!sessionId) {
            return NextResponse.json(
                { error: "Se requiere sessionId" },
                { status: 400 }
            );
        }

        // 1. Validar que la sesión existe
        const session = await getPaymentSession(sessionId);
        if (!session) {
            return NextResponse.json(
                { error: "Sesión de pago inválida o expirada" },
                { status: 404 }
            );
        }

        // 2. Aquí iría la lógica de cifrado AES con la llave del banco
        // const encryptedData = encrypt(session, process.env.MERCANTIL_KEY);

        // 3. Generar URL de redirección
        // En producción: https://www3.mercantilbanco.com/...
        // En desarrollo/test: Nuestro simulador interno

        // Usamos el host actual para construir la URL absoluta (necesario para redirecciones correctas)
        const protocol = request.headers.get("x-forwarded-proto") || "http";
        const host = request.headers.get("host");
        const baseUrl = `${protocol}://${host}`;

        const mockBankUrl = `${baseUrl}/mock-bank/login?sessionId=${sessionId}&amount=${session.amount}&currency=${session.currency}`;

        return NextResponse.json({ redirectUrl: mockBankUrl });

    } catch (error) {
        console.error("Error iniciando pago Mercantil:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
