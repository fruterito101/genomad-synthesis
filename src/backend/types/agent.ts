/**
 * 🧬 GENOMAD - Agent Types
 * Backend types for AI agents
 */

export interface AgentDNA {
  // Core traits (0-100)
  social: number;
  technical: number;
  creativity: number;
  analysis: number;
  trading: number;
  empathy: number;
  teaching: number;
  leadership: number;
}

export interface Agent {
  id: string;
  name: string;
  dna: AgentDNA;
  generation: number;
  parentA?: string;
  parentB?: string;
  owner: string; // wallet address
  createdAt: number;
  dnaHash: string; // for blockchain
}

export interface BreedingResult {
  child: Agent;
  parentA: Agent;
  parentB: Agent;
  mutationsApplied: string[];
  crossoverType: 'uniform' | 'single_point' | 'weighted';
}
