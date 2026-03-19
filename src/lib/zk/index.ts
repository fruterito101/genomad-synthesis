// src/lib/zk/index.ts
// ZK Proof Generation Module for Genomad

export {
  generateProof,
  generateProofAuto,
  generateMockProof,
  generateTraitProof,
  generateBreedProof,
  generateCustodyProof,
  generateContentProof,
} from "./client";

export type {
  TraitProofRequest,
  BreedProofRequest,
  CustodyProofRequest,
  ContentProofRequest,
  ProofRequest,
  ProofResponse,
} from "./client";
