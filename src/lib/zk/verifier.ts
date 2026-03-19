// src/lib/zk/verifier.ts
// ZK Proof Verification helpers

import { createPublicClient, http, parseAbi } from "viem";
import { monadTestnet } from "@/lib/blockchain/chains";
import { CONTRACTS } from "@/lib/blockchain/contracts";

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface VerificationResult {
  valid: boolean;
  onChain: boolean;
  error?: string;
  gasUsed?: bigint;
}

export interface ProofData {
  seal: string;
  journal: string;
  imageId?: string;
}

// ═══════════════════════════════════════════════════════════════════
// VERIFIER ABI (minimal)
// ═══════════════════════════════════════════════════════════════════

const VERIFIER_ABI = parseAbi([
  "function verifyBreeding(bytes calldata seal, bytes calldata journal) view returns (bool valid, bytes32 childCommitment, uint256 parentAId, uint256 parentBId, uint256 generation, uint256 mutations)",
  "function verifyTrait(bytes calldata seal, bytes calldata journal) view returns (bool valid, bytes32 commitment, uint256 fitness)",
  "function verifyCustody(bytes calldata seal, bytes calldata journal) view returns (bool valid, uint256 tokenId, address claimer, uint256 sharePercent)",
]);

// ═══════════════════════════════════════════════════════════════════
// PUBLIC CLIENT
// ═══════════════════════════════════════════════════════════════════

const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(),
});

// ═══════════════════════════════════════════════════════════════════
// VERIFICATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Verify breeding proof on-chain
 */
export async function verifyBreedingProof(
  proof: ProofData
): Promise<VerificationResult & {
  childCommitment?: string;
  parentAId?: bigint;
  parentBId?: bigint;
  generation?: bigint;
  mutations?: bigint;
}> {
  try {
    const result = await publicClient.readContract({
      address: CONTRACTS.traitVerifier as `0x${string}`,
      abi: VERIFIER_ABI,
      functionName: "verifyBreeding",
      args: [proof.seal as `0x${string}`, proof.journal as `0x${string}`],
    });

    const [valid, childCommitment, parentAId, parentBId, generation, mutations] = result as [
      boolean, `0x${string}`, bigint, bigint, bigint, bigint
    ];

    return {
      valid,
      onChain: true,
      childCommitment,
      parentAId,
      parentBId,
      generation,
      mutations,
    };
  } catch (error) {
    return {
      valid: false,
      onChain: false,
      error: error instanceof Error ? error.message : "Verification failed",
    };
  }
}

/**
 * Verify trait proof on-chain
 */
export async function verifyTraitProof(
  proof: ProofData
): Promise<VerificationResult & {
  commitment?: string;
  fitness?: bigint;
}> {
  try {
    const result = await publicClient.readContract({
      address: CONTRACTS.traitVerifier as `0x${string}`,
      abi: VERIFIER_ABI,
      functionName: "verifyTrait",
      args: [proof.seal as `0x${string}`, proof.journal as `0x${string}`],
    });

    const [valid, commitment, fitness] = result as [boolean, `0x${string}`, bigint];

    return {
      valid,
      onChain: true,
      commitment,
      fitness,
    };
  } catch (error) {
    return {
      valid: false,
      onChain: false,
      error: error instanceof Error ? error.message : "Verification failed",
    };
  }
}

/**
 * Verify custody proof on-chain
 */
export async function verifyCustodyProof(
  proof: ProofData
): Promise<VerificationResult & {
  tokenId?: bigint;
  claimer?: string;
  sharePercent?: bigint;
}> {
  try {
    const result = await publicClient.readContract({
      address: CONTRACTS.traitVerifier as `0x${string}`,
      abi: VERIFIER_ABI,
      functionName: "verifyCustody",
      args: [proof.seal as `0x${string}`, proof.journal as `0x${string}`],
    });

    const [valid, tokenId, claimer, sharePercent] = result as [
      boolean, bigint, `0x${string}`, bigint
    ];

    return {
      valid,
      onChain: true,
      tokenId,
      claimer,
      sharePercent,
    };
  } catch (error) {
    return {
      valid: false,
      onChain: false,
      error: error instanceof Error ? error.message : "Verification failed",
    };
  }
}

// ═══════════════════════════════════════════════════════════════════
// MOCK VERIFICATION (for dev mode)
// ═══════════════════════════════════════════════════════════════════

/**
 * Mock verification for development (no on-chain call)
 */
export function verifyProofMock(proof: ProofData): VerificationResult {
  // Basic validation of proof structure
  const hasValidSeal = proof.seal?.startsWith("0x") && proof.seal.length > 10;
  const hasValidJournal = proof.journal?.startsWith("0x") && proof.journal.length > 10;

  return {
    valid: hasValidSeal && hasValidJournal,
    onChain: false,
    error: hasValidSeal && hasValidJournal ? undefined : "Invalid proof structure",
  };
}

/**
 * Auto-verify: uses mock in dev, on-chain in production
 */
export async function verifyProofAuto(
  proof: ProofData,
  type: "breeding" | "trait" | "custody" = "breeding"
): Promise<VerificationResult> {
  // Use mock if in dev mode or no contract
  if (process.env.NEXT_PUBLIC_ZK_DEV_MODE === "true" || !CONTRACTS.traitVerifier) {
    return verifyProofMock(proof);
  }

  switch (type) {
    case "breeding":
      return verifyBreedingProof(proof);
    case "trait":
      return verifyTraitProof(proof);
    case "custody":
      return verifyCustodyProof(proof);
    default:
      return verifyProofMock(proof);
  }
}

// ═══════════════════════════════════════════════════════════════════
// UTILITY
// ═══════════════════════════════════════════════════════════════════

/**
 * Parse journal bytes into structured data
 */
export function parseBreedingJournal(journal: string): {
  childCommitment: string;
  isValid: boolean;
  parentAId: bigint;
  parentBId: bigint;
  generation: number;
  mutations: number;
} | null {
  try {
    const bytes = Buffer.from(journal.replace("0x", ""), "hex");
    
    if (bytes.length < 54) return null;

    return {
      childCommitment: "0x" + bytes.subarray(0, 32).toString("hex"),
      isValid: bytes[32] === 1,
      parentAId: bytes.readBigUInt64LE(33),
      parentBId: bytes.readBigUInt64LE(41),
      generation: bytes.readUInt32LE(49),
      mutations: bytes[53],
    };
  } catch {
    return null;
  }
}
