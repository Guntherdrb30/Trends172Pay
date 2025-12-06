
import { neon } from "@neondatabase/serverless";

async function checkUsers() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("DATABASE_URL no configurada.");
        process.exit(1);
    }

    const sql = neon(connectionString);

    try {
        console.log("Consultando merchant_apps...");

        // Contar
        const countRes = await sql`SELECT COUNT(*) FROM merchant_apps`;
        const count = countRes[0].count;
        console.log(`\nTotal de usuarios (comercios): ${count}`);

        // Listar
        const rows = await sql`SELECT id, business_code, email, display_name, created_at FROM merchant_apps ORDER BY created_at DESC LIMIT 10`;

        if (rows.length > 0) {
            console.log("\n--- Últimos Usuarios ---");
            rows.forEach(row => {
                console.log(`[${row.business_code}] ${row.display_name} (${row.email || 'Sin email'}) - ${row.created_at}`);
            });
        } else {
            console.log("No se encontraron registros.");
        }

    } catch (err) {
        console.error("Error:", err);
    }
}

checkUsers();
