import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    "DATABASE_URL no está configurada. Define la cadena de conexión de Neon/Postgres antes de ejecutar la migración."
  );
  process.exit(1);
}

const sql = neon(connectionString);

async function runMigrations() {
  const migrationsDir = path.join(__dirname, "..", "db", "migrations");
  const entries = fs.readdirSync(migrationsDir).filter((file) =>
    file.endsWith(".sql")
  );
  const files = entries.sort();

  console.log(`Encontradas ${files.length} migraciones...`);

  for (const file of files) {
    const fullPath = path.join(migrationsDir, file);
    const content = fs.readFileSync(fullPath, "utf8");

    console.log(`\nAplicando migración: ${file}`);
    await sql(content);
    console.log(`✔ Migración ${file} aplicada`);
  }

  console.log("\nTodas las migraciones se aplicaron correctamente.");
}

runMigrations().catch((error) => {
  console.error("Error al ejecutar migraciones:", error);
  process.exit(1);
});

