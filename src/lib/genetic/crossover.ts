// src/lib/genetic/crossover.ts

import { Traits, TRAIT_NAMES, TraitName } from "./types";

export function uniformCrossover(parentA: Traits, parentB: Traits): Traits {
  const child = {} as Traits;
  
  for (const trait of TRAIT_NAMES) {
    child[trait] = Math.random() < 0.5 ? parentA[trait] : parentB[trait];
  }
  
  return child;
}

export function singlePointCrossover(parentA: Traits, parentB: Traits): Traits {
  const cutPoint = Math.floor(Math.random() * TRAIT_NAMES.length);
  const child = {} as Traits;
  
  for (let i = 0; i < TRAIT_NAMES.length; i++) {
    const trait = TRAIT_NAMES[i];
    child[trait] = i < cutPoint ? parentA[trait] : parentB[trait];
  }
  
  return child;
}

export function weightedCrossover(parentA: Traits, parentB: Traits): Traits {
  const dominance: Record<TraitName, number> = {
    social: 0.7,
    technical: 0.5,
    creativity: 0.7,
    analysis: 0.5,
    trading: 0.5,
    empathy: 0.4,
    teaching: 0.5,
    leadership: 0.6
  };
  
  const child = {} as Traits;
  
  for (const trait of TRAIT_NAMES) {
    const weightA = dominance[trait];
    const weightB = 1 - weightA;
    child[trait] = Math.round(parentA[trait] * weightA + parentB[trait] * weightB);
  }
  
  return child;
}

export function crossover(
  parentA: Traits,
  parentB: Traits,
  type: "uniform" | "single" | "weighted"
): Traits {
  switch (type) {
    case "uniform":
      return uniformCrossover(parentA, parentB);
    case "single":
      return singlePointCrossover(parentA, parentB);
    case "weighted":
      return weightedCrossover(parentA, parentB);
  }
}
