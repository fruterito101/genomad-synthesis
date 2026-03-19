// src/lib/db/breeding.ts
// Operaciones para breeding requests y verification codes

import { eq, and, lt, gt, desc } from "drizzle-orm";
import { getDb } from "./client";
import { breedingRequests, verificationCodes } from "./schema";
import { randomBytes } from "crypto";

// Types
export type BreedingRequest = typeof breedingRequests.$inferSelect;
export type NewBreedingRequest = typeof breedingRequests.$inferInsert;
export type VerificationCode = typeof verificationCodes.$inferSelect;
export type NewVerificationCode = typeof verificationCodes.$inferInsert;

// ============================================
// BREEDING REQUESTS
// ============================================

/**
 * Crear solicitud de breeding
 */
export async function createBreedingRequest(
  data: Omit<NewBreedingRequest, "expiresAt"> & { expiresInHours?: number }
): Promise<BreedingRequest> {
  const db = getDb();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + (data.expiresInHours || 24));
  
  const { expiresInHours, ...insertData } = data;
  
  const [request] = await db
    .insert(breedingRequests)
    .values({ ...insertData, expiresAt })
    .returning();
  return request;
}

/**
 * Obtener breeding request por ID
 */
export async function getBreedingRequestById(id: string): Promise<BreedingRequest | null> {
  const db = getDb();
  const [request] = await db
    .select()
    .from(breedingRequests)
    .where(eq(breedingRequests.id, id))
    .limit(1);
  return request || null;
}

/**
 * Obtener requests pendientes de un usuario
 */
export async function getPendingRequestsForUser(userId: string): Promise<BreedingRequest[]> {
  const db = getDb();
  return db
    .select()
    .from(breedingRequests)
    .where(
      and(
        eq(breedingRequests.status, "pending"),
        gt(breedingRequests.expiresAt, new Date()),
        // Usuario es owner de alguno de los padres
        eq(breedingRequests.parentAOwnerId, userId)
      )
    )
    .orderBy(desc(breedingRequests.createdAt));
}

/**
 * Aprobar breeding request (como owner de un padre)
 */
export async function approveBreedingRequest(
  requestId: string,
  asParent: "A" | "B"
): Promise<BreedingRequest | null> {
  const db = getDb();
  
  const updateData = asParent === "A"
    ? { parentAApproved: true, parentAApprovedAt: new Date() }
    : { parentBApproved: true, parentBApprovedAt: new Date() };
  
  const [request] = await db
    .update(breedingRequests)
    .set(updateData)
    .where(eq(breedingRequests.id, requestId))
    .returning();
  
  // Si ambos aprobaron, cambiar status
  if (request && request.parentAApproved && request.parentBApproved) {
    const [updated] = await db
      .update(breedingRequests)
      .set({ status: "approved" })
      .where(eq(breedingRequests.id, requestId))
      .returning();
    return updated;
  }
  
  return request || null;
}

/**
 * Rechazar breeding request
 */
export async function rejectBreedingRequest(requestId: string): Promise<BreedingRequest | null> {
  const db = getDb();
  const [request] = await db
    .update(breedingRequests)
    .set({ status: "rejected" })
    .where(eq(breedingRequests.id, requestId))
    .returning();
  return request || null;
}

/**
 * Marcar breeding como ejecutado
 */
export async function markBreedingExecuted(
  requestId: string,
  childId: string,
  txHash?: string
): Promise<BreedingRequest | null> {
  const db = getDb();
  const [request] = await db
    .update(breedingRequests)
    .set({
      status: "executed",
      childId,
      txHash,
      executedAt: new Date(),
    })
    .where(eq(breedingRequests.id, requestId))
    .returning();
  return request || null;
}

/**
 * Expirar requests viejos
 */
export async function expireOldRequests(): Promise<number> {
  const db = getDb();
  const result = await db
    .update(breedingRequests)
    .set({ status: "expired" })
    .where(
      and(
        eq(breedingRequests.status, "pending"),
        lt(breedingRequests.expiresAt, new Date())
      )
    );
  return 0; // Drizzle doesn't return count easily
}

// ============================================
// VERIFICATION CODES
// ============================================

/**
 * Genera código de verificación único
 */
function generateCode(): string {
  // 6 caracteres alfanuméricos uppercase
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Sin I, O, 0, 1 para evitar confusión
  let code = "";
  const bytes = randomBytes(6);
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

/**
 * Crear código de verificación
 */
export async function createVerificationCode(
  userId: string,
  expiresInMinutes: number = 30
): Promise<VerificationCode> {
  const db = getDb();
  const code = generateCode();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);
  
  const [verification] = await db
    .insert(verificationCodes)
    .values({
      code,
      userId,
      expiresAt,
    })
    .returning();
  return verification;
}

/**
 * Obtener código de verificación
 */
export async function getVerificationCode(code: string): Promise<VerificationCode | null> {
  const db = getDb();
  const [verification] = await db
    .select()
    .from(verificationCodes)
    .where(eq(verificationCodes.code, code.toUpperCase()))
    .limit(1);
  return verification || null;
}

/**
 * Validar y obtener código (no expirado, no usado)
 */
export async function validateVerificationCode(code: string): Promise<{
  valid: boolean;
  verification?: VerificationCode;
  error?: string;
}> {
  const verification = await getVerificationCode(code);
  
  if (!verification) {
    return { valid: false, error: "Code not found" };
  }
  
  if (verification.used) {
    return { valid: false, error: "Code already used" };
  }
  
  if (verification.expiresAt < new Date()) {
    return { valid: false, error: "Code expired" };
  }
  
  return { valid: true, verification };
}

/**
 * Marcar código como usado
 */
export async function useVerificationCode(
  code: string,
  agentId: string
): Promise<VerificationCode | null> {
  const db = getDb();
  const [verification] = await db
    .update(verificationCodes)
    .set({
      used: true,
      usedAt: new Date(),
      agentId,
    })
    .where(eq(verificationCodes.code, code.toUpperCase()))
    .returning();
  return verification || null;
}

/**
 * Obtener código activo de un usuario
 */
export async function getActiveCodeForUser(userId: string): Promise<VerificationCode | null> {
  const db = getDb();
  const [verification] = await db
    .select()
    .from(verificationCodes)
    .where(
      and(
        eq(verificationCodes.userId, userId),
        eq(verificationCodes.used, false),
        gt(verificationCodes.expiresAt, new Date())
      )
    )
    .orderBy(desc(verificationCodes.createdAt))
    .limit(1);
  return verification || null;
}

/**
 * Limpiar códigos expirados
 */
export async function cleanupExpiredCodes(): Promise<void> {
  const db = getDb();
  await db
    .delete(verificationCodes)
    .where(
      and(
        lt(verificationCodes.expiresAt, new Date()),
        eq(verificationCodes.used, false)
      )
    );
}
