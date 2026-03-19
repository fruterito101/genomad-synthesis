// src/lib/genetic/engine.ts

import { 
  AgentDNA, 
  BreedingOptions, 
  BreedingResult, 
  FitnessWeights,
  PopulationOptions,
  Traits
} from "./types";
import { crossover } from "./crossover";
import { applyMutation, countMutations } from "./mutation";
import { calculateTotalFitness } from "./fitness";
import { calculateDNAHash } from "./hash";

export class GeneticEngine {
  private mutationRate: number = 0.25;
  private history: BreedingResult[] = [];
  
  breed(
    parentA: AgentDNA,
    parentB: AgentDNA,
    options: BreedingOptions = { crossoverType: "weighted" }
  ): BreedingResult {
    if (options.validateParents) {
      this.validateParents(parentA, parentB);
    }
    
    let childTraits = crossover(
      parentA.traits,
      parentB.traits,
      options.crossoverType
    );
    
    const { traits: mutatedTraits, mutationsApplied } = applyMutation(
      childTraits,
      options.mutationRate ?? this.mutationRate,
      options.mutationRange ?? 15
    );
    childTraits = mutatedTraits;
    
    const childBase: Omit<AgentDNA, "hash"> = {
      traits: childTraits,
      generation: Math.max(parentA.generation, parentB.generation) + 1,
      lineage: this.mergeLineage(parentA, parentB),
      mutations: countMutations(parentA.traits, parentB.traits, childTraits),
      createdAt: new Date()
    };
    
    const child: AgentDNA = {
      ...childBase,
      hash: calculateDNAHash(childBase)
    };
    
    const parentAFitness = calculateTotalFitness(parentA.traits);
    const parentBFitness = calculateTotalFitness(parentB.traits);
    const childFitness = calculateTotalFitness(child.traits);
    
    const result: BreedingResult = {
      child,
      parentAFitness,
      parentBFitness,
      childFitness,
      improved: childFitness > Math.max(parentAFitness, parentBFitness),
      mutationsApplied
    };
    
    this.history.push(result);
    
    if (this.history.length % 5 === 0) {
      this.adjustMutationRate();
    }
    
    return result;
  }
  
  breedPopulation(
    founders: AgentDNA[],
    options: PopulationOptions
  ): AgentDNA[] {
    let population = [...founders];
    
    for (let gen = 0; gen < options.generations; gen++) {
      const nextGen: AgentDNA[] = [];
      
      const eliteCount = options.elitism ?? 1;
      const sorted = [...population].sort(
        (a, b) => calculateTotalFitness(b.traits) - calculateTotalFitness(a.traits)
      );
      nextGen.push(...sorted.slice(0, eliteCount));
      
      while (nextGen.length < options.populationSize) {
        const [parentA, parentB] = this.selectParents(
          population,
          options.selectionPressure ?? 1.5
        );
        
        const result = this.breed(parentA, parentB, {
          crossoverType: options.crossoverType ?? "weighted"
        });
        
        nextGen.push(result.child);
      }
      
      population = nextGen;
    }
    
    return population;
  }
  
  calculateFitness(dna: AgentDNA, weights?: FitnessWeights): number {
    return calculateTotalFitness(dna.traits, weights);
  }
  
  getHistory(): BreedingResult[] {
    return [...this.history];
  }
  
  getMutationRate(): number {
    return this.mutationRate;
  }
  
  private validateParents(a: AgentDNA, b: AgentDNA): void {
    if (a.hash === b.hash) {
      throw new Error("Cannot breed with self");
    }
    
    if (a.lineage.includes(b.hash) || b.lineage.includes(a.hash)) {
      throw new Error("Cannot breed with direct ancestor");
    }
    
    if (Math.abs(a.generation - b.generation) > 10) {
      throw new Error("Generation gap too large (max 10)");
    }
  }
  
  private mergeLineage(a: AgentDNA, b: AgentDNA): string[] {
    const merged = new Set([...a.lineage, ...b.lineage, a.hash, b.hash]);
    return Array.from(merged);
  }
  
  private selectParents(
    population: AgentDNA[],
    pressure: number
  ): [AgentDNA, AgentDNA] {
    const tournamentSize = Math.max(2, Math.floor(population.length * 0.3));
    
    const selectOne = (): AgentDNA => {
      const tournament = Array.from({ length: tournamentSize }, () =>
        population[Math.floor(Math.random() * population.length)]
      );
      
      tournament.sort(
        (a, b) => calculateTotalFitness(b.traits) - calculateTotalFitness(a.traits)
      );
      
      const idx = Math.floor(Math.pow(Math.random(), pressure) * tournament.length);
      return tournament[idx];
    };
    
    const parentA = selectOne();
    let parentB = selectOne();
    
    let attempts = 0;
    while (parentB.hash === parentA.hash && attempts < 10) {
      parentB = selectOne();
      attempts++;
    }
    
    return [parentA, parentB];
  }
  
  private adjustMutationRate(): void {
    const recent = this.history.slice(-5);
    const improvementRate = recent.filter(r => r.improved).length / recent.length;
    
    if (improvementRate < 0.3) {
      this.mutationRate = Math.min(0.4, this.mutationRate + 0.05);
    } else if (improvementRate > 0.7) {
      this.mutationRate = Math.max(0.1, this.mutationRate - 0.05);
    }
  }
}
