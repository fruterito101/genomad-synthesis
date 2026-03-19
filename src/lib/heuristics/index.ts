// src/lib/heuristics/index.ts

// Types
export * from "./types";

// Individual analyzers
export { analyzeTechnical } from "./technical";
export { analyzeCreativity } from "./creativity";
export { analyzeSocial } from "./social";
export { analyzeAnalysis } from "./analysis";
export { analyzeEmpathy } from "./empathy";
export { analyzeTrading } from "./trading";
export { analyzeTeaching } from "./teaching";
export { analyzeLeadership } from "./leadership";

// DNA Hash utilities
export { 
  calculateTraitsHash, 
  shortHash, 
  generateDNAHash, 
  verifyTraitsMatch 
} from "./dna-hash";

// Main engine
export { HeuristicsEngine, heuristicsEngine } from "./engine";
export type { HeuristicsResultWithHash } from "./engine";
