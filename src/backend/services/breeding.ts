/**
 * 🧬 GENOMAD - Breeding Service
 * Wraps the genetic engine for backend use
 */

import { GeneticEngine, type AgentDNA, type Agent, type BreedingResult } from "@/lib/genetic";

// Singleton engine instance
const engine = new GeneticEngine();

/**
 * Breed two agents and return the result
 */
export function breed(parentA: Agent, parentB: Agent): BreedingResult {
  return engine.breed(parentA.dna, parentB.dna, {
    crossoverType: "weighted",
    validateParents: true,
  });
}

/**
 * Calculate fitness for a DNA
 */
export function calculateFitness(dna: AgentDNA): number {
  return engine.calculateFitness(dna);
}

/**
 * Get breeding history
 */
export function getBreedingHistory(): BreedingResult[] {
  return engine.getHistory();
}

/**
 * Get current mutation rate
 */
export function getMutationRate(): number {
  return engine.getMutationRate();
}

// Re-export for convenience
export { GeneticEngine } from "@/lib/genetic";
