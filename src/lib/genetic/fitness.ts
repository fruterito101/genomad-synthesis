// src/lib/genetic/fitness.ts

import { Traits, FitnessWeights, TRAIT_NAMES } from "./types";

const DEFAULT_WEIGHTS: Required<FitnessWeights> = {
  social: 0.9,
  technical: 1.2,
  creativity: 1.1,
  analysis: 1.1,
  trading: 1.0,
  empathy: 0.9,
  teaching: 0.8,
  leadership: 0.8
};

export function calculateFitness(
  traits: Traits,
  weights: FitnessWeights = {}
): number {
  const w = { ...DEFAULT_WEIGHTS, ...weights };
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  for (const trait of TRAIT_NAMES) {
    const value = traits[trait];
    const weight = w[trait]!;
    
    weightedSum += value * weight;
    totalWeight += 100 * weight;
  }
  
  return (weightedSum / totalWeight) * 100;
}

export function calculateSynergyBonus(traits: Traits): number {
  const synergies: [keyof Traits, keyof Traits, number][] = [
    ["technical", "analysis", 0.05],
    ["creativity", "empathy", 0.05],
    ["teaching", "empathy", 0.05],
    ["social", "trading", 0.03],
    ["leadership", "social", 0.03],
    ["creativity", "technical", 0.04],
  ];
  
  let bonus = 0;
  
  for (const [t1, t2, mult] of synergies) {
    const avg = (traits[t1] + traits[t2]) / 2;
    if (avg >= 70) {
      bonus += mult * avg;
    }
  }
  
  return bonus;
}

export function calculateTotalFitness(
  traits: Traits,
  weights?: FitnessWeights
): number {
  const base = calculateFitness(traits, weights);
  const synergy = calculateSynergyBonus(traits);
  return Math.min(100, base + synergy);
}

export const FITNESS_PRESETS = {
  trader: {
    trading: 2.0,
    analysis: 1.5,
    technical: 1.2,
    social: 0.5,
    empathy: 0.3,
    teaching: 0.3,
    leadership: 0.5,
    creativity: 0.8
  },
  teacher: {
    teaching: 2.0,
    empathy: 1.5,
    social: 1.3,
    creativity: 1.0,
    analysis: 0.8,
    technical: 0.7,
    trading: 0.3,
    leadership: 0.8
  },
  creative: {
    creativity: 2.0,
    empathy: 1.2,
    social: 1.0,
    technical: 0.8,
    analysis: 0.7,
    teaching: 0.6,
    trading: 0.3,
    leadership: 0.5
  },
  leader: {
    leadership: 2.0,
    social: 1.5,
    empathy: 1.2,
    analysis: 1.0,
    technical: 0.8,
    creativity: 0.8,
    teaching: 1.0,
    trading: 0.5
  }
} as const;
