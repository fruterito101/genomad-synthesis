// src/types/traits.ts
// Re-export from source of truth
export {
  TRAIT_NAMES,
  type TraitName,
  type Traits,
  type FitnessWeights,
  isValidTraitValue,
  isValidTraits,
  createDefaultTraits,
} from "@/lib/genetic/types";

export type FitnessPreset = 
  | "balanced" 
  | "trader" 
  | "teacher" 
  | "creative" 
  | "leader" 
  | "technical";
