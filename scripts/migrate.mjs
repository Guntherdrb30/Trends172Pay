import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import { neon } from "@neondatabase/serverless";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple .env loader
if (!process.env.DATABASE_URL) {
  try {
    const envPath = path.join(__dirname, "..", ".env");
    if (fs.existsSync(envPath)) {
      const envConfig = fs.readFileSync(envPath, 'utf8');
      for (const line of envConfig.split('\n')) {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^['"]|['"]$/g, '');
          if (key === 'DATABASE_URL') {
            process.env.DATABASE_URL = value;
          }
        }
      }
    }
  } catch (e) {
    console.warn("Could not load .env file manually:", e);
  }
}

const connectionString = process.env.DATABASE_URL;

console.log("DATABASE_URL encontrada:", !!connectionString); // No imprimir la URL completa por seguridad

if (!connectionString) {
  console.error(
    "DATABASE_URL no está configurada. Define la cadena de conexión de Neon/Postgres antes de ejecutar la migración."
  );
  process.exit(1);
}

console.log("Inicializando cliente Neon (HTTP)...");
const sql = neon(connectionString);
console.log("Cliente inicializado.");

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

    // Split content by semicolon to handle multiple statements with Neon driver
    // This is a basic split and might fail on complex SQL with semicolons in strings
    const statements = content
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      await sql(statement);
    }

    console.log(`✔ Migración ${file} aplicada (${statements.length} sentencias)`);
  }

  console.log("\nTodas las migraciones se aplicaron correctamente.");
}

runMigrations().catch((error) => {
  console.error("Error al ejecutar migraciones:");
  console.error("Mensaje:", error.message);
  if (error.detail) console.error("Detalle:", error.detail);
  if (error.code) console.error("Código:", error.code);
  // console.error("Full Error:", JSON.stringify(error, null, 2)); // Optional
  process.exit(1);
});
