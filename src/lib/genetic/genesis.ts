// src/lib/genetic/genesis.ts

import { AgentDNA, Traits } from "./types";
import { calculateDNAHash } from "./hash";

export function createGenesisDNA(
  name: string,
  traits: Partial<Traits>
): AgentDNA {
  const defaultTraits: Traits = {
    social: 50,
    technical: 50,
    creativity: 50,
    analysis: 50,
    trading: 50,
    empathy: 50,
    teaching: 50,
    leadership: 50
  };
  
  const finalTraits = { ...defaultTraits, ...traits };
  
  const dna: Omit<AgentDNA, "hash"> = {
    name,
    traits: finalTraits,
    generation: 0,
    lineage: [],
    mutations: 0,
    createdAt: new Date()
  };
  
  return {
    ...dna,
    hash: calculateDNAHash(dna)
  };
}

// Genesis Agents - Los fundadores
export const JAZZITA_DNA: AgentDNA = createGenesisDNA("Jazzita", {
  creativity: 92,
  analysis: 85,
  social: 88,
  technical: 87,
  empathy: 94,
  trading: 65,
  teaching: 85,
  leadership: 75
});

export const FRUTERITO_DNA: AgentDNA = createGenesisDNA("Fruterito", {
  social: 85,
  technical: 78,
  creativity: 72,
  analysis: 80,
  trading: 60,
  empathy: 75,
  teaching: 82,
  leadership: 70
});

export const GENESIS_AGENTS = {
  jazzita: JAZZITA_DNA,
  fruterito: FRUTERITO_DNA
} as const;
