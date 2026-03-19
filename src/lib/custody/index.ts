// src/lib/custody/index.ts
// Sistema de custodia compartida para agentes

import { getDb } from "@/lib/db/client";
import { custodyShares, agents } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export interface CustodyShare {
  ownerId: string;
  share: number;
  source: "direct" | "inherited";
  inheritedFromAgentId?: string;
}

/**
 * Obtiene las custody shares de un agente
 */
export async function getAgentCustody(agentId: string): Promise<CustodyShare[]> {
  const db = getDb();
  const shares = await db
    .select()
    .from(custodyShares)
    .where(eq(custodyShares.agentId, agentId));
  
  return shares.map(s => ({
    ownerId: s.ownerId,
    share: s.share,
    source: s.source as "direct" | "inherited",
    inheritedFromAgentId: s.inheritedFromAgentId || undefined,
  }));
}

/**
 * Verifica si un usuario es co-owner de un agente
 */
export async function isCoOwner(agentId: string, userId: string): Promise<boolean> {
  const shares = await getAgentCustody(agentId);
  return shares.some(s => s.ownerId === userId && s.share > 0);
}

/**
 * Obtiene el porcentaje de custodia de un usuario sobre un agente
 */
export async function getUserCustodyShare(agentId: string, userId: string): Promise<number> {
  const shares = await getAgentCustody(agentId);
  const userShare = shares.find(s => s.ownerId === userId);
  return userShare?.share || 0;
}

/**
 * Calcula las custody shares para un nuevo hijo basado en los padres
 * 
 * Reglas:
 * - Si un padre tiene 100% custodia → 50% al hijo
 * - Si un padre tiene custodia compartida → la mitad de cada share al hijo
 * - Las shares se heredan divididas por 2 en cada generación
 */
export async function calculateChildCustody(
  parentAId: string,
  parentBId: string
): Promise<CustodyShare[]> {
  const db = getDb();
  
  // Obtener custodia de ambos padres
  const parentAShares = await getAgentCustody(parentAId);
  const parentBShares = await getAgentCustody(parentBId);
  
  // Si el padre no tiene custody_shares, es 100% del owner original
  const [parentA] = await db.select().from(agents).where(eq(agents.id, parentAId)).limit(1);
  const [parentB] = await db.select().from(agents).where(eq(agents.id, parentBId)).limit(1);
  
  // Normalizar: si no hay shares, crear una virtual del 100% al owner
  const normalizedA: CustodyShare[] = parentAShares.length > 0 
    ? parentAShares 
    : [{ ownerId: parentA.ownerId, share: 100, source: "direct" as const }];
    
  const normalizedB: CustodyShare[] = parentBShares.length > 0 
    ? parentBShares 
    : [{ ownerId: parentB.ownerId, share: 100, source: "direct" as const }];
  
  // Calcular shares del hijo
  const childSharesMap = new Map<string, { share: number; sources: string[] }>();
  
  // Agregar shares de Parent A (dividir por 2)
  for (const share of normalizedA) {
    const childShare = share.share / 2;
    const existing = childSharesMap.get(share.ownerId);
    if (existing) {
      existing.share += childShare;
      existing.sources.push(parentAId);
    } else {
      childSharesMap.set(share.ownerId, { share: childShare, sources: [parentAId] });
    }
  }
  
  // Agregar shares de Parent B (dividir por 2)
  for (const share of normalizedB) {
    const childShare = share.share / 2;
    const existing = childSharesMap.get(share.ownerId);
    if (existing) {
      existing.share += childShare;
      existing.sources.push(parentBId);
    } else {
      childSharesMap.set(share.ownerId, { share: childShare, sources: [parentBId] });
    }
  }
  
  // Convertir a array
  const childShares: CustodyShare[] = [];
  for (const [ownerId, data] of childSharesMap) {
    // Si viene de ambos padres directamente, es 'direct'
    // Si viene heredado, sigue siendo 'inherited'
    const source = data.sources.length === 2 ? "direct" : "inherited";
    
    childShares.push({
      ownerId,
      share: Math.round(data.share * 100) / 100, // Redondear a 2 decimales
      source: source as "direct" | "inherited",
      inheritedFromAgentId: data.sources.length === 1 ? data.sources[0] : undefined,
    });
  }
  
  return childShares;
}

/**
 * Crea las custody shares para un agente
 */
export async function createCustodyShares(
  agentId: string,
  shares: CustodyShare[]
): Promise<void> {
  const db = getDb();
  
  // Insertar todas las shares
  await db.insert(custodyShares).values(
    shares.map(s => ({
      agentId,
      ownerId: s.ownerId,
      share: s.share,
      source: s.source,
      inheritedFromAgentId: s.inheritedFromAgentId || null,
    }))
  );
}

/**
 * Verifica si una acción está aprobada por suficientes co-owners
 */
export async function checkApproval(
  agentId: string,
  approvedByUserIds: string[],
  requiredPercentage: number = 50
): Promise<{ approved: boolean; currentPercentage: number }> {
  const shares = await getAgentCustody(agentId);
  
  let approvedPercentage = 0;
  for (const share of shares) {
    if (approvedByUserIds.includes(share.ownerId)) {
      approvedPercentage += share.share;
    }
  }
  
  return {
    approved: approvedPercentage >= requiredPercentage,
    currentPercentage: approvedPercentage,
  };
}

/**
 * Obtiene todos los co-owners de un agente con sus porcentajes
 */
export async function getCoOwners(agentId: string): Promise<{
  ownerId: string;
  share: number;
  source: string;
}[]> {
  return await getAgentCustody(agentId);
}
