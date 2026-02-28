import { NextResponse } from "next/server";
import { syncBCVRate } from "@/lib/bcv-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const expectedSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const cronHeader = request.headers.get("x-cron-secret");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : null;

  if (!expectedSecret && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { message: "CRON_SECRET no está configurado en el entorno." },
      { status: 500 }
    );
  }

  if (
    expectedSecret &&
    bearerToken !== expectedSecret &&
    cronHeader !== expectedSecret
  ) {
    return NextResponse.json(
      { message: "No autorizado para ejecutar la tarea de cron." },
      { status: 401 }
    );
  }

  console.log("[BCV Cron] Starting sync...");
  const result = await syncBCVRate();

  if (result.success) {
    return NextResponse.json(
      { message: "BCV rate synced", rate: result.rate },
      { status: 200 }
    );
  }

  return NextResponse.json(
    { message: "Failed to sync BCV rate", error: result.error },
    { status: 500 }
  );
}
