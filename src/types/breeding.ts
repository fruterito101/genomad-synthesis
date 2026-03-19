// src/types/breeding.ts

import { AgentDNA } from "./agent";
import { Traits, TraitName } from "./traits";

/**
 * Tipos de crossover disponibles
 */
export type CrossoverType = "uniform" | "single" | "weighted";

/**
 * Opciones para breeding
 */
export interface BreedingOptions {
  /** Tipo de crossover */
  crossoverType: CrossoverType;
  
  /** Tasa de mutación (0-1, default 0.25) */
  mutationRate?: number;
  
  /** Rango de mutación (default 15) */
  mutationRange?: number;
  
  /** Validar compatibilidad de padres */
  validateParents?: boolean;
  
  /** Nombre para el hijo (opcional) */
  childName?: string;
}

/**
 * Resultado de un breeding
 */
export interface BreedingResult {
  /** DNA del hijo generado */
  child: AgentDNA;
  
  /** Fitness del parent A */
  parentAFitness: number;
  
  /** Fitness del parent B */
  parentBFitness: number;
  
  /** Fitness del hijo */
  childFitness: number;
  
  /** ¿El hijo mejoró respecto a los padres? */
  improved: boolean;
  
  /** Cantidad de mutaciones aplicadas */
  mutationsApplied: number;
  
  /** Traits que mutaron */
  mutatedTraits: TraitName[];
}

/**
 * Estado de una solicitud de breeding
 */
export type BreedingRequestStatus = 
  | "pending" 
  | "approved" 
  | "rejected" 
  | "executed" 
  | "expired"
  | "cancelled";

/**
 * Solicitud de breeding (pendiente de aprobación)
 */
export interface BreedingRequest {
  id: string;
  
  /** Quien inició el request */
  initiatorId: string;
  
  /** Token ID del parent A */
  parentATokenId: string;
  
  /** Token ID del parent B */
  parentBTokenId: string;
  
  /** Estado del request */
  status: BreedingRequestStatus;
  
  /** Opciones de breeding */
  options: BreedingOptions;
  
  /** Fee en $GENO */
  feeAmount: string;
  
  /** Token ID del hijo (después de executed) */
  childTokenId?: string;
  
  /** TX hash del breeding */
  txHash?: string;
  
  /** Timestamp de creación */
  createdAt: Date;
  
  /** Timestamp de expiración */
  expiresAt: Date;
  
  /** Timestamp de ejecución */
  executedAt?: Date;
}

/**
 * Opciones para evolución de población
 */
export interface PopulationOptions {
  /** Tamaño de población */
  populationSize: number;
  
  /** Número de generaciones */
  generations: number;
  
  /** Presión de selección (default 1.5) */
  selectionPressure?: number;
  
  /** Elitismo: cuántos mejores preservar */
  elitism?: number;
  
  /** Tipo de crossover */
  crossoverType?: CrossoverType;
}

/**
 * Estadísticas de breeding
 */
export interface BreedingStats {
  totalBreedings: number;
  successfulBreedings: number;
  averageFitnessImprovement: number;
  mostCommonMutation: TraitName;
  generationDistribution: Record<number, number>;
}
