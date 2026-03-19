/**
 * 🧬 GENOMAD - Breeding Service
 * Genetic algorithm implementation for agent breeding
 */

import type { Agent, AgentDNA, BreedingResult } from '../types/agent';

const MUTATION_RATE = 0.25;
const MUTATION_STRENGTH = 15;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function weightedCrossover(parentA: AgentDNA, parentB: AgentDNA): AgentDNA {
  const traits = ['social', 'technical', 'creativity', 'analysis', 'trading', 'empathy', 'teaching', 'leadership'] as const;
  const child: Partial<AgentDNA> = {};
  
  for (const trait of traits) {
    const valA = parentA[trait];
    const valB = parentB[trait];
    const total = valA + valB;
    const probA = total === 0 ? 0.5 : valA / total;
    
    child[trait] = Math.random() < probA ? valA : valB;
  }
  
  return child as AgentDNA;
}

function mutate(dna: AgentDNA): { dna: AgentDNA; mutations: string[] } {
  const mutations: string[] = [];
  const result = { ...dna };
  const traits = Object.keys(dna) as (keyof AgentDNA)[];
  
  for (const trait of traits) {
    if (Math.random() < MUTATION_RATE) {
      const delta = Math.round((Math.random() - 0.5) * 2 * MUTATION_STRENGTH);
      result[trait] = clamp(result[trait] + delta, 0, 100);
      mutations.push(`${trait}: ${delta > 0 ? '+' : ''}${delta}`);
    }
  }
  
  return { dna: result, mutations };
}

export function breed(parentA: Agent, parentB: Agent): BreedingResult {
  const childDna = weightedCrossover(parentA.dna, parentB.dna);
  const { dna: mutatedDna, mutations } = mutate(childDna);
  
  const child: Agent = {
    id: `agent-${Date.now()}`,
    name: `Child of ${parentA.name} & ${parentB.name}`,
    dna: mutatedDna,
    generation: Math.max(parentA.generation, parentB.generation) + 1,
    parentA: parentA.id,
    parentB: parentB.id,
    owner: parentA.owner, // Default to parentA owner
    createdAt: Date.now(),
    dnaHash: '', // TODO: Calculate hash
  };
  
  return {
    child,
    parentA,
    parentB,
    mutationsApplied: mutations,
    crossoverType: 'weighted',
  };
}

export function calculateFitness(dna: AgentDNA): number {
  const values = Object.values(dna);
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}
