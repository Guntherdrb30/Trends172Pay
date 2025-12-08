import { NextResponse } from 'next/server';
import { syncBCVRate } from '@/lib/bcv-service';

export const dynamic = 'force-dynamic'; // Asegurar que no se cachee estáticamente

export async function GET(request: Request) {
    // Verificar autorización básica para evitar abuso público si fuera necesario, 
    // pero Vercel Cron usa header específico. Por simplicidad validamos execution.

    const authHeader = request.headers.get('authorization');
    // En Vercel Cron, la request viene de una IP interna, pero es buena práctica 
    // verificar un CRON_SECRET si se configura. Por ahora lo dejamos abierto 
    // o verificamos que sea una llamada interna si es posible.
    // Para este MVP, lo dejamos abierto y confiamos en la configuración de Vercel.

    console.log('[BCV Cron] Starting sync...');
    const result = await syncBCVRate();

    if (result.success) {
        return NextResponse.json({ message: 'BCV rate synced', rate: result.rate }, { status: 200 });
    } else {
        return NextResponse.json({ message: 'Failed to sync BCV rate', error: result.error }, { status: 500 });
    }
}
