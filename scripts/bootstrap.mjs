import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import { neon } from "@neondatabase/serverless";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    "DATABASE_URL no está configurada. Define la cadena de conexión de Neon/Postgres antes de ejecutar el bootstrap."
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

    // Split content by semicolon to handle multiple statements with Neon driver
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

function generateId() {
  return `m_${crypto.randomUUID()}`;
}

function generateApiKey() {
  return `trends172_${crypto.randomBytes(32).toString("hex")}`;
}

async function seedMerchantApps() {
  const rows = await sql`SELECT COUNT(*)::int AS count FROM merchant_apps`;
  const count = rows[0]?.count ?? 0;

  if (count > 0) {
    console.log(
      `Semilla de merchant_apps omitida: ya existen ${count} registros.`
    );
    return;
  }

  console.log("Insertando merchants de ejemplo en merchant_apps...");

  const now = new Date().toISOString();

  const carpiHogarId = generateId();
  const academiaXId = generateId();

  await sql`
    INSERT INTO merchant_apps (
      id,
      business_code,
      display_name,
      api_key,
      logo_url,
      allowed_domains,
      webhook_url,
      webhook_secret,
      tech_stack_hint,
      commission_percent,
      payout_currency,
      payout_bank_name,
      payout_account_number,
      payout_account_holder,
      contact_name,
      contact_email,
      notes,
      created_at,
      updated_at
    )
    VALUES
      (${carpiHogarId},
       'CARPIHOGAR',
       'Carpi Hogar',
       ${generateApiKey()},
       NULL,
       ARRAY['https://carpihogar.com'],
       '',
       '',
       'Laravel',
       3.5,
       'VES',
       'Banco de Ejemplo VES',
       '0102-0000-0000-00000000',
       'Carpi Hogar C.A.',
       'Equipo Carpi Hogar',
       'soporte@carpihogar.com',
       'Instalación principal de e-commerce.',
       ${now}::timestamptz,
       ${now}::timestamptz
      ),
      (${academiaXId},
       'ACADEMIA_X',
       'Academia X Online',
       ${generateApiKey()},
       NULL,
       ARRAY['https://academiax.com'],
       '',
       '',
       'WordPress',
       5.0,
       'USD',
       'Banco de Ejemplo USD',
       '0001-0000-0000-00000000',
       'Academia X LLC',
       'Soporte Academia X',
       'pagos@academiax.com',
       'Venta de cursos online.',
       ${now}::timestamptz,
       ${now}::timestamptz
      )
  `;

  console.log("Merchants de ejemplo insertados correctamente.");
}

async function main() {
  console.log("== Bootstrap de base de datos ==");
  await runMigrations();
  await seedMerchantApps();
  console.log("\nBootstrap completado.");
}

main().catch((error) => {
  console.error("Error durante el bootstrap de la base de datos:", error);
  process.exit(1);
});

