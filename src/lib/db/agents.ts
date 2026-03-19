// src/lib/db/agents.ts
// Operaciones CRUD para agentes

import { eq, and, or, desc, sql } from "drizzle-orm";
import { getDb } from "./client";
import { agents } from "./schema";
import type { Traits } from "@/lib/genetic/types";
import type { EncryptedDNA } from "@/lib/crypto/types";

// Types inferidos del schema
export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;

// Type para traits JSON
export interface AgentTraits extends Traits {}

/**
 * Crear nuevo agente
 */
export async function createAgent(data: NewAgent): Promise<Agent> {
  const db = getDb();
  const [agent] = await db.insert(agents).values(data).returning();
  return agent;
}

/**
 * Buscar agente por ID
 */
export async function getAgentById(id: string): Promise<Agent | null> {
  const db = getDb();
  const [agent] = await db
    .select()
    .from(agents)
    .where(eq(agents.id, id))
    .limit(1);
  return agent || null;
}

/**
 * Buscar agente por DNA hash
 */
export async function getAgentByDnaHash(dnaHash: string): Promise<Agent | null> {
  const db = getDb();
  const [agent] = await db
    .select()
    .from(agents)
    .where(eq(agents.dnaHash, dnaHash))
    .limit(1);
  return agent || null;
}

/**
 * Buscar agente por Token ID
 */
export async function getAgentByTokenId(tokenId: string): Promise<Agent | null> {
  const db = getDb();
  const [agent] = await db
    .select()
    .from(agents)
    .where(eq(agents.tokenId, tokenId))
    .limit(1);
  return agent || null;
}

/**
 * Obtener todos los agentes de un usuario
 */
export async function getAgentsByOwner(ownerId: string): Promise<Agent[]> {
  const db = getDb();
  return db
    .select()
    .from(agents)
    .where(eq(agents.ownerId, ownerId))
    .orderBy(desc(agents.createdAt));
}

/**
 * Obtener agentes minteados de un usuario
 */
export async function getMintedAgentsByOwner(ownerId: string): Promise<Agent[]> {
  const db = getDb();
  return db
    .select()
    .from(agents)
    .where(
      and(
        eq(agents.ownerId, ownerId),
        sql`${agents.tokenId} IS NOT NULL`
      )
    )
    .orderBy(desc(agents.mintedAt));
}

/**
 * Obtener hijos de un agente
 */
export async function getChildrenOfAgent(agentId: string): Promise<Agent[]> {
  const db = getDb();
  return db
    .select()
    .from(agents)
    .where(
      or(
        eq(agents.parentAId, agentId),
        eq(agents.parentBId, agentId)
      )
    )
    .orderBy(desc(agents.createdAt));
}

/**
 * Obtener agentes genesis (sin padres)
 */
export async function getGenesisAgents(): Promise<Agent[]> {
  const db = getDb();
  return db
    .select()
    .from(agents)
    .where(eq(agents.generation, 0))
    .orderBy(desc(agents.fitness));
}

/**
 * Actualizar agente
 */
export async function updateAgent(
  id: string,
  data: Partial<Omit<NewAgent, "id" | "createdAt">>
): Promise<Agent | null> {
  const db = getDb();
  const [agent] = await db
    .update(agents)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(agents.id, id))
    .returning();
  return agent || null;
}

/**
 * Marcar agente como minteado
 */
export async function markAgentAsMinted(
  id: string,
  tokenId: string,
  contractAddress: string
): Promise<Agent | null> {
  return updateAgent(id, {
    tokenId,
    contractAddress,
    mintedAt: new Date(),
  });
}

/**
 * Activar agente (está corriendo)
 */
export async function activateAgent(
  id: string,
  host: string
): Promise<Agent | null> {
  return updateAgent(id, {
    isActive: true,
    activeHost: host,
  });
}

/**
 * Desactivar agente
 */
export async function deactivateAgent(id: string): Promise<Agent | null> {
  return updateAgent(id, {
    isActive: false,
    activeHost: null,
  });
}

/**
 * Actualizar DNA encriptado
 */
export async function updateEncryptedDna(
  id: string,
  encryptedDna: EncryptedDNA,
  commitment: string
): Promise<Agent | null> {
  return updateAgent(id, {
    encryptedDna: encryptedDna as any,
    commitment,
  });
}

/**
 * Verificar si existe agente por DNA hash
 */
export async function agentExistsByDnaHash(dnaHash: string): Promise<boolean> {
  const agent = await getAgentByDnaHash(dnaHash);
  return agent !== null;
}

/**
 * Obtener estadísticas de agentes de un usuario
 */
export async function getAgentStats(ownerId: string): Promise<{
  total: number;
  minted: number;
  active: number;
  avgFitness: number;
  generations: number[];
}> {
  const ownerAgents = await getAgentsByOwner(ownerId);
  
  const total = ownerAgents.length;
  const minted = ownerAgents.filter(a => a.tokenId !== null).length;
  const active = ownerAgents.filter(a => a.isActive).length;
  const avgFitness = total > 0
    ? ownerAgents.reduce((sum, a) => sum + (a.fitness || 0), 0) / total
    : 0;
  const generations = [...new Set(ownerAgents.map(a => a.generation))].sort();
  
  return { 
    total, 
    minted, 
    active, 
    avgFitness: Math.round(avgFitness * 100) / 100,
    generations
  };
}

/**
 * Buscar agentes por generación
 */
export async function getAgentsByGeneration(generation: number): Promise<Agent[]> {
  const db = getDb();
  return db
    .select()
    .from(agents)
    .where(eq(agents.generation, generation))
    .orderBy(desc(agents.fitness));
}

/**
 * Obtener top agentes por fitness
 */
export async function getTopAgentsByFitness(limit: number = 10): Promise<Agent[]> {
  const db = getDb();
  return db
    .select()
    .from(agents)
    .orderBy(desc(agents.fitness))
    .limit(limit);
}
