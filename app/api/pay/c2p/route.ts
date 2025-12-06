
import { NextResponse } from "next/server";
import { getPaymentSession, updateSession } from "@/lib/paymentSessionStore";
import { processC2PPayment } from "@/lib/mercantil/c2p";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sessionId, payerId, payerMobile, otp } = body;

        if (!sessionId || !payerId || !payerMobile || !otp) {
            return NextResponse.json(
                { error: "Faltan datos requeridos (sessionId, cédula, teléfono, clave)." },
                { status: 400 }
            );
        }

        // 1. Validar sesión
        const session = await getPaymentSession(sessionId);
        if (!session) {
            return NextResponse.json(
                { error: "Sesión inválida." },
                { status: 404 }
            );
        }

        if (session.status === 'paid') {
            return NextResponse.json({ error: "Esta sesión ya está pagada." }, { status: 400 });
        }

        // 2. Procesar con Mercantil
        // IP simulada, en prod extraer headers 'x-forwarded-for'
        const ipAddress = request.headers.get("x-forwarded-for")?.split(',')[0] || "127.0.0.1";

        // El destinationMobileNumber idealmente vendría de la config del merchant, 
        // pero para C2P el MerchantId suele ser suficiente. 
        // Pasaremos el del payer duplicado o uno dummy si la interfaz lo requiere, 
        // pero processC2PPayment usa process.env.

        const result = await processC2PPayment({
            destinationMobileNumber: "", // Se toma del env MERCH_ID indirectamente
            payerMobileNumber: payerMobile,
            payerId: payerId,
            amount: session.amount,
            currency: session.currency, // VES
            otp: otp,
            ipAddress: ipAddress
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || "El banco rechazó la transacción." },
                { status: 400 }
            );
        }

        // 3. Actualizar sesión a PAGADO
        await updateSession(session.id, {
            status: "paid",
            bankPaymentId: result.reference || "c2p-ref",
            externalOrderId: result.reference
        });

        return NextResponse.json({ success: true, reference: result.reference });

    } catch (error: any) {
        console.error("Error en endpoint C2P:", error);
        return NextResponse.json(
            { error: "Error interno del servidor." },
            { status: 500 }
        );
    }
}
