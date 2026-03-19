// src/lib/genetic/types.ts
// ═══════════════════════════════════════════════════════════════
// SOURCE OF TRUTH - Todos los demás archivos importan de aquí
// ═══════════════════════════════════════════════════════════════

export const TRAIT_NAMES = [
  "social",
  "technical",
  "creativity",
  "analysis",
  "trading",
  "empathy",
  "teaching",
  "leadership"
] as const;

export type TraitName = typeof TRAIT_NAMES[number];

export interface Traits {
  social: number;
  technical: number;
  creativity: number;
  analysis: number;
  trading: number;
  empathy: number;
  teaching: number;
  leadership: number;
}

export interface AgentDNA {
  id?: string;
  name?: string;
  traits: Traits;
  generation: number;
  lineage: string[];
  mutations: number;
  hash: string;
  tokenId?: string;
  createdAt?: Date;
}

export interface Agent {
  id: string;
  name: string;
  dna: AgentDNA;
  owner: string;
  createdAt: number;
  isActive?: boolean;
  activeHost?: string;
}

export interface BreedingOptions {
  crossoverType: "uniform" | "single" | "weighted";
  mutationRate?: number;
  mutationRange?: number;
  validateParents?: boolean;
  childName?: string;
}

export interface BreedingResult {
  child: AgentDNA;
  parentA: AgentDNA;
  parentB: AgentDNA;
  parentAFitness: number;
  parentBFitness: number;
  childFitness: number;
  improved: boolean;
  mutationsApplied: number;
  crossoverType: "uniform" | "single" | "weighted";
}

export interface FitnessWeights {
  social?: number;
  technical?: number;
  creativity?: number;
  analysis?: number;
  trading?: number;
  empathy?: number;
  teaching?: number;
  leadership?: number;
}

export interface PopulationOptions {
  populationSize: number;
  generations: number;
  selectionPressure?: number;
  elitism?: number;
  crossoverType?: "uniform" | "single" | "weighted";
}

// Utility functions
export function isValidTraitValue(value: number): boolean {
  return value >= 0 && value <= 100 && Number.isInteger(value);
}

export function isValidTraits(traits: Partial<Traits>): traits is Traits {
  return TRAIT_NAMES.every(
    (name) => name in traits && isValidTraitValue(traits[name] as number)
  );
}

export function createDefaultTraits(): Traits {
  return {
    social: 50,
    technical: 50,
    creativity: 50,
    analysis: 50,
    trading: 50,
    empathy: 50,
    teaching: 50,
    leadership: 50,
  };
}
