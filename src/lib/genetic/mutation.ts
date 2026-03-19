// src/lib/genetic/mutation.ts

import { Traits, TRAIT_NAMES } from "./types";

function gaussianRandom(): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function applyMutation(
  traits: Traits,
  mutationRate: number = 0.25,
  mutationRange: number = 15
): { traits: Traits; mutationsApplied: number } {
  const mutated = { ...traits };
  let mutationsApplied = 0;
  
  for (const trait of TRAIT_NAMES) {
    if (Math.random() < mutationRate) {
      const gaussian = gaussianRandom() * mutationRange;
      const mutation = Math.round(gaussian);
      
      mutated[trait] = clamp(mutated[trait] + mutation, 0, 100);
      mutationsApplied++;
    }
  }
  
  return { traits: mutated, mutationsApplied };
}

export function countMutations(
  parentA: Traits,
  parentB: Traits,
  child: Traits,
  threshold: number = 5
): number {
  let count = 0;
  
  for (const trait of TRAIT_NAMES) {
    const expected = (parentA[trait] + parentB[trait]) / 2;
    if (Math.abs(child[trait] - expected) > threshold) {
      count++;
    }
  }
  
  return count;
}
