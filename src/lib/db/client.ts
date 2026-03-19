// src/lib/db/client.ts
// Conexión a Neon PostgreSQL con Drizzle ORM

import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Tipo del cliente Drizzle
type DrizzleClient = NeonHttpDatabase<typeof schema>;

/**
 * Variables para lazy initialization
 */
let _sql: NeonQueryFunction<false, false> | null = null;
let _db: DrizzleClient | null = null;

/**
 * Obtiene el cliente SQL de Neon
 * Lanza error si DATABASE_URL no está configurado
 */
export function getSql(): NeonQueryFunction<false, false> {
  if (_sql) return _sql;
  
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL environment variable is required. " +
      "Set it in .env.local or Vercel environment variables."
    );
  }
  
  _sql = neon(url);
  return _sql;
}

/**
 * Obtiene el cliente Drizzle con schema tipado
 * Lazy initialization - solo se conecta cuando se usa
 */
export function getDb(): DrizzleClient {
  if (_db) return _db;
  
  const sql = getSql();
  _db = drizzle(sql, { schema });
  return _db;
}

/**
 * Verifica si la base de datos está configurada
 */
export function isDatabaseConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}

/**
 * Cliente db para import directo
 * Usa Proxy para lazy initialization
 */
export const db = new Proxy({} as DrizzleClient, {
  get(_, prop: string | symbol) {
    const realDb = getDb();
    const value = (realDb as any)[prop];
    if (typeof value === "function") {
      return value.bind(realDb);
    }
    return value;
  },
});

// Re-export neon para SQL directo si necesario
export { neon };
export type { DrizzleClient };
