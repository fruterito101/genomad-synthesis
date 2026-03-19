// src/lib/zk/index.ts
// ZK Proof Generation and Verification Module for Genomad

// Client (proof generation)
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

// Verifier (proof verification)
export {
  verifyBreedingProof,
  verifyTraitProof,
  verifyCustodyProof,
  verifyProofMock,
  verifyProofAuto,
  parseBreedingJournal,
} from "./verifier";

export type {
  VerificationResult,
  ProofData,
} from "./verifier";
