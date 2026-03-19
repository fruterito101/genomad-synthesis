/**
 * 🧬 GENOMAD - Shared Types
 * Types used by both frontend and backend
 */

export interface AgentDNA {
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
  owner: string;
  createdAt: number;
  dnaHash: string;
}

export type TraitName = keyof AgentDNA;
export const TRAIT_NAMES: TraitName[] = [
  'social', 'technical', 'creativity', 'analysis',
  'trading', 'empathy', 'teaching', 'leadership'
];
