/**
 * 🛡️ Run Security Migration (ESM version)
 * 
 * Aplica constraints y triggers de seguridad a la DB
 * 
 * Uso: node scripts/run-security-migration.mjs
 */

import pg from "pg";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not set. Run: source .env.local && export DATABASE_URL");
  process.exit(1);
}

async function runMigration() {
  console.log("🛡️ Running Security Migration...\n");
  
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  
  try {
    // Leer el archivo SQL
    const migrationPath = join(__dirname, "../src/lib/db/migrations/add-security-constraints.sql");
    const migrationSQL = readFileSync(migrationPath, "utf-8");
    
    console.log("📄 Running migration...\n");
    
    // Ejecutar todo el SQL de una vez (PostgreSQL maneja las transacciones)
    await client.query(migrationSQL);
    
    console.log("✅ All security constraints applied successfully!");
    
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    
    if (error.message.includes("already exists")) {
      console.log("\n⚠️ Some constraints already exist. This is normal on re-runs.");
    }
  } finally {
    await client.end();
  }
}

runMigration();
