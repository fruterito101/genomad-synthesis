// src/lib/db/users.ts
// Operaciones CRUD para usuarios

import { eq } from "drizzle-orm";
import { getDb } from "./client";
import { users } from "./schema";

// Types inferidos del schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

/**
 * Crear nuevo usuario
 */
export async function createUser(data: NewUser): Promise<User> {
  const db = getDb();
  const [user] = await db.insert(users).values(data).returning();
  return user;
}

/**
 * Buscar usuario por ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return user || null;
}

/**
 * Buscar usuario por Privy ID
 */
export async function getUserByPrivyId(privyId: string): Promise<User | null> {
  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.privyId, privyId))
    .limit(1);
  return user || null;
}

/**
 * Buscar usuario por Telegram ID
 */
export async function getUserByTelegramId(telegramId: string): Promise<User | null> {
  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.telegramId, telegramId))
    .limit(1);
  return user || null;
}

/**
 * Buscar usuario por wallet address
 */
export async function getUserByWallet(wallet: string): Promise<User | null> {
  const db = getDb();
  const normalizedWallet = wallet.toLowerCase();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.walletAddress, normalizedWallet))
    .limit(1);
  return user || null;
}

/**
 * Actualizar usuario
 */
export async function updateUser(
  id: string, 
  data: Partial<Omit<NewUser, "id" | "createdAt">>
): Promise<User | null> {
  const db = getDb();
  const [user] = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return user || null;
}

/**
 * Upsert: crear o actualizar usuario por Privy ID
 */
export async function upsertUserByPrivyId(data: NewUser): Promise<User> {
  const existing = await getUserByPrivyId(data.privyId);
  
  if (existing) {
    const { privyId, ...updateData } = data;
    const updated = await updateUser(existing.id, updateData);
    return updated!;
  }
  
  return createUser(data);
}

/**
 * Actualizar último login
 */
export async function updateLastLogin(id: string): Promise<User | null> {
  return updateUser(id, { lastLoginAt: new Date() });
}

/**
 * Vincular wallet a usuario
 */
export async function linkWallet(
  id: string, 
  walletAddress: string
): Promise<User | null> {
  return updateUser(id, { 
    walletAddress: walletAddress.toLowerCase() 
  });
}

/**
 * Vincular Telegram a usuario
 */
export async function linkTelegram(
  id: string,
  telegramId: string,
  telegramUsername?: string
): Promise<User | null> {
  return updateUser(id, { 
    telegramId, 
    telegramUsername 
  });
}

/**
 * Desactivar usuario
 */
export async function deactivateUser(id: string): Promise<User | null> {
  return updateUser(id, { isActive: false });
}

/**
 * Verificar si existe usuario
 */
export async function userExists(privyId: string): Promise<boolean> {
  const user = await getUserByPrivyId(privyId);
  return user !== null;
}
