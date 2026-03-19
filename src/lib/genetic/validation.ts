// src/lib/genetic/validation.ts

import { AgentDNA, Traits, TRAIT_NAMES } from "./types";

export function validateTrait(value: number): boolean {
  return value >= 0 && value <= 100 && Number.isInteger(value);
}

export function validateTraits(traits: Traits): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const trait of TRAIT_NAMES) {
    if (!(trait in traits)) {
      errors.push(`Missing trait: ${trait}`);
    } else if (!validateTrait(traits[trait])) {
      errors.push(`Invalid ${trait}: ${traits[trait]} (must be 0-100 integer)`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}

export function validateDNA(dna: AgentDNA): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate traits
  const traitsResult = validateTraits(dna.traits);
  errors.push(...traitsResult.errors);
  
  // Validate generation
  if (dna.generation < 0) {
    errors.push("Generation cannot be negative");
  }
  
  // Validate hash
  if (!dna.hash || dna.hash.length !== 64) {
    errors.push("Invalid hash (must be 64 char hex)");
  }
  
  // Validate lineage
  if (!Array.isArray(dna.lineage)) {
    errors.push("Lineage must be an array");
  }
  
  return { valid: errors.length === 0, errors };
}

export function validateBreedingPair(
  parentA: AgentDNA,
  parentB: AgentDNA
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Cannot breed with self
  if (parentA.hash === parentB.hash) {
    errors.push("Cannot breed with self");
  }
  
  // Cannot breed with direct ancestor
  if (parentA.lineage.includes(parentB.hash)) {
    errors.push("Cannot breed with descendant");
  }
  if (parentB.lineage.includes(parentA.hash)) {
    errors.push("Cannot breed with ancestor");
  }
  
  // Generation gap check
  const genGap = Math.abs(parentA.generation - parentB.generation);
  if (genGap > 10) {
    errors.push(`Generation gap too large: ${genGap} (max 10)`);
  }
  
  return { valid: errors.length === 0, errors };
}
