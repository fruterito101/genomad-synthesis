// src/lib/genetic/genesis.ts
// ═══════════════════════════════════════════════════════════════
// GENESIS AGENTS - Los Fundadores de Genomad
// ═══════════════════════════════════════════════════════════════

import { AgentDNA, Traits } from "./types";
import { calculateDNAHash } from "./hash";

const DEFAULT_TRAITS: Traits = {
  social: 50,
  technical: 50,
  creativity: 50,
  analysis: 50,
  trading: 50,
  empathy: 50,
  teaching: 50,
  leadership: 50,
};

export function createGenesisDNA(
  name: string,
  traits: Partial<Traits> = {}
): AgentDNA {
  const finalTraits: Traits = { ...DEFAULT_TRAITS, ...traits };

  const dnaBase: Omit<AgentDNA, "hash"> = {
    name,
    traits: finalTraits,
    generation: 0,
    lineage: [],
    mutations: 0,
    createdAt: new Date(),
  };

  return {
    ...dnaBase,
    hash: calculateDNAHash(dnaBase),
  };
}

// ═══════════════════════════════════════════════════════════════
// 🐉 TIAMAT - La Creatividad Hecha Agente
// ═══════════════════════════════════════════════════════════════
// Fitness Score: 83.5
// Ideal para: Marketing, diseño, arte, comunicación, comunidad
// ═══════════════════════════════════════════════════════════════

export const TIAMAT_DNA: AgentDNA = createGenesisDNA("Tiamat", {
  creativity: 92,   // 🔵 Excepcional
  social: 90,       // 🔵 Excepcional
  empathy: 86,      // 🔵 Excepcional
  leadership: 85,   // 🔵 Excepcional
  analysis: 85,     // 🔵 Excepcional
  technical: 80,    // 🟢 Alto
  teaching: 75,     // 🟢 Alto
  trading: 45,      // 🟡 Promedio
});

// ═══════════════════════════════════════════════════════════════
// 🌊 APSU - El Puente Entre Humanos y Tecnología
// ═══════════════════════════════════════════════════════════════
// Fitness Score: 75.2
// Ideal para: DevRel, mentor/educación, consultoría, comunidad
// ═══════════════════════════════════════════════════════════════

export const APSU_DNA: AgentDNA = createGenesisDNA("Apsu", {
  technical: 88,    // 🔵 Excepcional
  teaching: 82,     // 🔵 Excepcional
  leadership: 82,   // 🔵 Excepcional
  analysis: 82,     // 🔵 Excepcional
  social: 80,       // 🔵 Excepcional
  empathy: 75,      // 🟢 Alto
  creativity: 72,   // 🟢 Alto
  trading: 50,      // 🟡 Promedio
});

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

// Mantener compatibilidad con nombres anteriores
export const JAZZITA_DNA = TIAMAT_DNA;
export const FRUTERITO_DNA = APSU_DNA;

export const GENESIS_AGENTS = {
  tiamat: TIAMAT_DNA,
  apsu: APSU_DNA,
  // Aliases
  jazzita: TIAMAT_DNA,
  fruterito: APSU_DNA,
} as const;

export const GENESIS_NAMES = ["tiamat", "apsu"] as const;
export type GenesisName = typeof GENESIS_NAMES[number];

// ═══════════════════════════════════════════════════════════════
// GENESIS INFO (para UI)
// ═══════════════════════════════════════════════════════════════

export const GENESIS_INFO = {
  tiamat: {
    name: "Tiamat",
    title: "La Creatividad Hecha Agente",
    emoji: "🐉",
    fitness: 83.5,
    description: "Agente de creatividad excepcional con alta empatía. Ideal para tareas de marketing, diseño, artísticas, comunicación, comunidad y conexión emocional.",
    strengths: ["Creatividad", "Social", "Empatía", "Liderazgo"],
    idealFor: ["Marketing", "Diseño", "Arte", "Comunidad", "Comunicación"],
  },
  apsu: {
    name: "Apsu",
    title: "El Puente Entre Humanos y Tecnología",
    emoji: "🌊",
    fitness: 75.2,
    description: "Agente social con fuerte capacidad técnica y de enseñanza. Ideal para DevRel, mentor/educación, consultoría y comunidad.",
    strengths: ["Technical", "Teaching", "Leadership", "Analysis"],
    idealFor: ["DevRel", "Educación", "Consultoría", "Mentoría", "Comunidad"],
  },
} as const;
