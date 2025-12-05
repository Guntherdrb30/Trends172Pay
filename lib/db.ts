import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL no está configurada. Define esta variable en tu entorno (Neon / Vercel) para usar la base de datos."
  );
}

export const db = neon(connectionString);

