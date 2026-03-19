// src/types/agent.ts

import { Traits } from "./traits";

/**
 * DNA de un agente (datos core on-chain)
 */
export interface AgentDNA {
  /** ID único interno */
  id?: string;
  
  /** Nombre del agente */
  name: string;
  
  /** 8 traits (0-100 cada uno) */
  traits: Traits;
  
  /** Generación (0 = genesis) */
  generation: number;
  
  /** Hashes de ancestros */
  lineage: string[];
  
  /** Cantidad de mutaciones acumuladas */
  mutations: number;
  
  /** Hash SHA256 del DNA */
  hash: string;
  
  /** Token ID en blockchain (si registrado) */
  tokenId?: string;
  
  /** Dirección del owner */
  ownerAddress?: string;
  
  /** Timestamp de creación */
  createdAt?: Date;
}

/**
 * Agente completo (DNA + metadata)
 */
export interface Agent extends AgentDNA {
  /** Fitness score calculado */
  fitness: number;
  
  /** Estado de activación */
  isActive: boolean;
  
  /** Dirección donde está corriendo */
  activeHost?: string;
  
  /** ID del parent A (si no es genesis) */
  parentAId?: string;
  
  /** ID del parent B (si no es genesis) */
  parentBId?: string;
}

/**
 * Crear un nuevo AgentDNA vacío
 */
export function createEmptyDNA(): Omit<AgentDNA, "hash"> {
  return {
    name: "",
    traits: {
      social: 50,
      technical: 50,
      creativity: 50,
      analysis: 50,
      trading: 50,
      empathy: 50,
      teaching: 50,
      leadership: 50,
    },
    generation: 0,
    lineage: [],
    mutations: 0,
  };
}

/**
 * Tipo para agentes Genesis (generation 0)
 */
export type GenesisAgent = Agent & {
  generation: 0;
  parentAId: undefined;
  parentBId: undefined;
};

/**
 * Tipo para agentes bred (generation > 0)
 */
export type BredAgent = Agent & {
  generation: number;
  parentAId: string;
  parentBId: string;
};

/**
 * Estado de un agente
 */
export type AgentStatus = "dormant" | "active" | "rented" | "breeding";

/**
 * Agente con estado extendido
 */
export interface AgentWithStatus extends Agent {
  status: AgentStatus;
  rentedTo?: string;
  rentExpiresAt?: Date;
}
