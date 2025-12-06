import { neon } from "@neondatabase/serverless";
import "dotenv/config"; // Ensure dotenv is installed or run with --env-file
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("Error: DATABASE_URL no definida.");
    process.exit(1);
}

const sql = neon(connectionString);

async function testAuth() {
    const email = `test_auth_${Date.now()}@example.com`;
    const password = "Password123!";
    const businessCode = `TEST_${Date.now()}`;

    console.log(`\n1. Creando usuario de prueba: ${email}`);

    // 1. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 2. Insert user (Simulating createMerchant)
    try {
        const rows = await sql`
      INSERT INTO merchant_apps (
        id, business_code, display_name, api_key, commission_percent, payout_currency, 
        email, password_hash, created_at, updated_at
      ) VALUES (
        ${'m_' + Date.now()}, ${businessCode}, 'Test Merchant', ${'key_' + Date.now()}, 
        5.0, 'USD', ${email}, ${hashedPassword}, NOW(), NOW()
      )
      RETURNING *
    `;
        const user = rows[0];
        console.log("✔ Usuario creado con ID:", user.id);

        // 3. Verify Login (Simulating login)
        console.log("\n2. Verificando login...");
        const loginRows = await sql`SELECT * FROM merchant_apps WHERE email = ${email}`;
        const loginUser = loginRows[0];

        if (!loginUser) {
            throw new Error("Usuario no encontrado por email.");
        }

        const isValid = await bcrypt.compare(password, loginUser.password_hash);

        if (isValid) {
            console.log("✔ Contraseña válida. Login exitoso.");
        } else {
            console.error("✘ Contraseña inválida.");
            process.exit(1);
        }

        // Cleaning up
        console.log("\n3. Limpiando...");
        await sql`DELETE FROM merchant_apps WHERE id = ${user.id}`;
        console.log("✔ Usuario de prueba eliminado.");

    } catch (error) {
        console.error("Error en prueba de autenticación:", error);
        process.exit(1);
    }
}

testAuth();
