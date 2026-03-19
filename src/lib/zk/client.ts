// src/lib/zk/client.ts
// Cliente para generar ZK proofs con RISC Zero
// Los proofs se generan en el servidor, este cliente envía requests

import { Traits } from "@/lib/genetic/types";

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface TraitProofRequest {
  type: "trait";
  traits: Traits;
  salt: string;
  expectedCommitment: string;
}

export interface BreedProofRequest {
  type: "breed";
  parentA: Traits;
  parentB: Traits;
  child: Traits;
  crossoverMask: boolean[];
  maxMutation: number;
  randomSeed: string;
}

export interface CustodyProofRequest {
  type: "custody";
  tokenId: number;
  claimer: string;
  threshold: number;
  shares: Array<{ owner: string; percentage: number }>;
  salt: string;
}

export interface ContentProofRequest {
  type: "content";
  tokenId: number;
  soulContent: string;
  identityContent: string;
  expectedHash: string;
  encryptionKeyHash: string;
}

export type ProofRequest = 
  | TraitProofRequest 
  | BreedProofRequest 
  | CustodyProofRequest
  | ContentProofRequest;

export interface ProofResponse {
  success: boolean;
  proof?: {
    seal: string;      // The ZK proof seal (for on-chain verification)
    journal: string;   // Public outputs
    imageId: string;   // RISC Zero image ID
  };
  output?: {
    valid: boolean;
    fitness?: number;
    rarity?: number;
    [key: string]: unknown;
  };
  error?: string;
  cycleCount?: number;
  proofTimeMs?: number;
}

// ═══════════════════════════════════════════════════════════════════
// ZK CLIENT
// ═══════════════════════════════════════════════════════════════════

const ZK_API_URL = process.env.NEXT_PUBLIC_ZK_API_URL || "/api/zk";

/**
 * Genera un ZK proof llamando al servidor
 * El servidor ejecuta RISC Zero y retorna el proof
 */
export async function generateProof(request: ProofRequest): Promise<ProofResponse> {
  try {
    const response = await fetch(`${ZK_API_URL}/prove`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      return {
        success: false,
        error: `ZK API error: ${response.status} - ${error}`,
      };
    }

    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: `Failed to generate proof: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Genera TraitProof para activación de agente
 */
export async function generateTraitProof(
  traits: Traits,
  salt?: string
): Promise<ProofResponse> {
  // Generar salt si no se provee
  const actualSalt = salt || generateRandomHex(32);
  
  // Calcular commitment
  const commitment = await calculateTraitCommitment(traits, actualSalt);
  
  return generateProof({
    type: "trait",
    traits,
    salt: actualSalt,
    expectedCommitment: commitment,
  });
}

/**
 * Genera BreedProof para breeding
 */
export async function generateBreedProof(
  parentA: Traits,
  parentB: Traits,
  child: Traits,
  crossoverMask: boolean[],
  maxMutation: number = 10
): Promise<ProofResponse> {
  return generateProof({
    type: "breed",
    parentA,
    parentB,
    child,
    crossoverMask,
    maxMutation,
    randomSeed: generateRandomHex(8),
  });
}

/**
 * Genera CustodyProof para verificar threshold
 */
export async function generateCustodyProof(
  tokenId: number,
  claimer: string,
  threshold: number,
  shares: Array<{ owner: string; percentage: number }>
): Promise<ProofResponse> {
  return generateProof({
    type: "custody",
    tokenId,
    claimer,
    threshold,
    shares,
    salt: generateRandomHex(32),
  });
}

/**
 * Genera ContentProof para verificar SOUL/IDENTITY
 */
export async function generateContentProof(
  tokenId: number,
  soulContent: string,
  identityContent: string
): Promise<ProofResponse> {
  const combined = soulContent + identityContent;
  const expectedHash = await sha256Hex(combined);
  
  return generateProof({
    type: "content",
    tokenId,
    soulContent,
    identityContent,
    expectedHash,
    encryptionKeyHash: generateRandomHex(32), // Placeholder
  });
}

// ═══════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════

function generateRandomHex(bytes: number): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function calculateTraitCommitment(traits: Traits, salt: string): Promise<string> {
  const traitArray = [
    traits.intelligence,
    traits.creativity,
    traits.empathy,
    traits.resilience,
    traits.curiosity,
    traits.humor,
    traits.wisdom,
    traits.charisma,
  ];
  
  const data = new Uint8Array([...traitArray, ...hexToBytes(salt)]);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return bytes;
}

// ═══════════════════════════════════════════════════════════════════
// DEV MODE
// ═══════════════════════════════════════════════════════════════════

/**
 * Mock proof para desarrollo (no requiere servidor ZK)
 */
export async function generateMockProof(request: ProofRequest): Promise<ProofResponse> {
  // Simular delay de generación
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    proof: {
      seal: "0x" + "00".repeat(256), // Mock seal
      journal: "0x" + "00".repeat(64),
      imageId: "0x9527671f44310aa24a74dad7fed31b8d856698e4ab70e6f6dd7026a217d34d87",
    },
    output: {
      valid: true,
      fitness: 650,
      rarity: 4,
    },
    cycleCount: 50000,
    proofTimeMs: 500,
  };
}

/**
 * Usa mock en dev, real en prod
 */
export async function generateProofAuto(request: ProofRequest): Promise<ProofResponse> {
  if (process.env.NEXT_PUBLIC_ZK_DEV_MODE === "true") {
    return generateMockProof(request);
  }
  return generateProof(request);
}
