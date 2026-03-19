// src/types/traits.ts

/**
 * Nombres de los 8 traits fundamentales
 */
export const TRAIT_NAMES = [
  "social",
  "technical", 
  "creativity",
  "analysis",
  "trading",
  "empathy",
  "teaching",
  "leadership",
] as const;

export type TraitName = (typeof TRAIT_NAMES)[number];

/**
 * Estructura de traits (8 dimensiones, 0-100 cada uno)
 */
export interface Traits {
  social: number;
  technical: number;
  creativity: number;
  analysis: number;
  trading: number;
  empathy: number;
  teaching: number;
  leadership: number;
}

/**
 * Pesos para cálculo de fitness
 */
export interface FitnessWeights {
  social?: number;
  technical?: number;
  creativity?: number;
  analysis?: number;
  trading?: number;
  empathy?: number;
  teaching?: number;
  leadership?: number;
}

/**
 * Presets de fitness para especializaciones
 */
export type FitnessPreset = 
  | "balanced" 
  | "trader" 
  | "teacher" 
  | "creative" 
  | "leader" 
  | "technical";

/**
 * Validar que un valor de trait está en rango
 */
export function isValidTraitValue(value: number): boolean {
  return value >= 0 && value <= 100 && Number.isInteger(value);
}

/**
 * Validar objeto de traits completo
 */
export function isValidTraits(traits: Partial<Traits>): traits is Traits {
  return TRAIT_NAMES.every(
    (name) => name in traits && isValidTraitValue(traits[name] as number)
  );
}

/**
 * Crear traits por defecto (balanceados)
 */
export function createDefaultTraits(): Traits {
  return {
    social: 50,
    technical: 50,
    creativity: 50,
    analysis: 50,
    trading: 50,
    empathy: 50,
    teaching: 50,
    leadership: 50,
  };
}
