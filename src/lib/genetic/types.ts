// src/lib/genetic/types.ts

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

export interface BreedingOptions {
  crossoverType: "uniform" | "single" | "weighted";
  mutationRate?: number;
  mutationRange?: number;
  validateParents?: boolean;
}

export interface BreedingResult {
  child: AgentDNA;
  parentAFitness: number;
  parentBFitness: number;
  childFitness: number;
  improved: boolean;
  mutationsApplied: number;
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
