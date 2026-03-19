// src/lib/genetic/compatibility.ts

import { AgentDNA, Traits, TRAIT_NAMES } from "./types";

export function calculateTraitDiversity(traitsA: Traits, traitsB: Traits): number {
  let totalDiff = 0;
  
  for (const trait of TRAIT_NAMES) {
    totalDiff += Math.abs(traitsA[trait] - traitsB[trait]);
  }
  
  // Normalize to 0-100 (max diff per trait is 100, 8 traits)
  return (totalDiff / (100 * TRAIT_NAMES.length)) * 100;
}

export function calculateCompatibility(parentA: AgentDNA, parentB: AgentDNA): number {
  // Cannot breed with self
  if (parentA.hash === parentB.hash) {
    return 0;
  }
  
  // Cannot breed with direct ancestor/descendant
  if (parentA.lineage.includes(parentB.hash) || parentB.lineage.includes(parentA.hash)) {
    return 0;
  }
  
  // Factor 1: Generation difference (less = better, max 10)
  const genDiff = Math.abs(parentA.generation - parentB.generation);
  if (genDiff > 10) {
    return 0;
  }
  const genScore = ((10 - genDiff) / 10) * 30; // Max 30 points
  
  // Factor 2: Genetic diversity (more different = better offspring variety)
  const diversity = calculateTraitDiversity(parentA.traits, parentB.traits);
  const diversityScore = diversity * 0.5; // Max 50 points
  
  // Factor 3: Both parents have decent fitness
  const avgFitness = (calculateSimpleFitness(parentA.traits) + calculateSimpleFitness(parentB.traits)) / 2;
  const fitnessScore = avgFitness * 0.2; // Max 20 points
  
  return Math.min(100, genScore + diversityScore + fitnessScore);
}

function calculateSimpleFitness(traits: Traits): number {
  let sum = 0;
  for (const trait of TRAIT_NAMES) {
    sum += traits[trait];
  }
  return sum / TRAIT_NAMES.length;
}

export function getCompatibilityLabel(score: number): string {
  if (score === 0) return "Incompatible";
  if (score < 30) return "Low";
  if (score < 50) return "Moderate";
  if (score < 70) return "Good";
  if (score < 90) return "Excellent";
  return "Perfect";
}
