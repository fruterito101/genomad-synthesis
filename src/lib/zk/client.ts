// src/lib/zk/client.ts
// Cliente para generar ZK proofs con RISC Zero
// Los proofs se generan en el servidor, este cliente envía requests

import { Traits, TRAIT_NAMES } from "@/lib/genetic/types";

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface TraitProofRequest {
  type: "trait";
  traits: number[]; // Array of 8 trait values
  salt: string;
  expectedCommitment: string;
}

export interface BreedProofRequest {
  type: "breed";
  parentA: number[];
  parentB: number[];
  child: number[];
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
    seal: string;
    journal: string;
    imageId: string;
  };
  output?: {
    valid: boolean;
    fitness?: number;
    rarity?: number;
    mutations?: number[];
    hybridVigor?: boolean;
    [key: string]: unknown;
  };
  error?: string;
  cycleCount?: number;
  proofTimeMs?: number;
}

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

function traitsToArray(traits: Traits): number[] {
  return TRAIT_NAMES.map(name => traits[name]);
}

function generateRandomHex(bytes: number): string {
  const array = new Uint8Array(bytes);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for SSR
    for (let i = 0; i < bytes; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, b => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(data: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }
  // Fallback for SSR - simple hash
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

// ═══════════════════════════════════════════════════════════════════
// ZK CLIENT
// ═══════════════════════════════════════════════════════════════════

const ZK_API_URL = process.env.NEXT_PUBLIC_ZK_API_URL || "/api/zk";

export async function generateProof(request: ProofRequest): Promise<ProofResponse> {
  try {
    const response = await fetch(\`\${ZK_API_URL}/prove\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      return {
        success: false,
        error: \`ZK API error: \${response.status} - \${error}\`,
      };
    }

    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: \`Failed to generate proof: \${error instanceof Error ? error.message : "Unknown error"}\`,
    };
  }
}

export async function generateTraitProof(
  traits: Traits,
  salt?: string
): Promise<ProofResponse> {
  const actualSalt = salt || generateRandomHex(32);
  const traitArray = traitsToArray(traits);
  
  // Calculate commitment
  const commitmentData = traitArray.join(',') + ',' + actualSalt;
  const commitment = await sha256Hex(commitmentData);
  
  return generateProofAuto({
    type: "trait",
    traits: traitArray,
    salt: actualSalt,
    expectedCommitment: commitment,
  });
}

export async function generateBreedProof(
  parentA: Traits,
  parentB: Traits,
  child: Traits,
  crossoverMask?: boolean[],
  maxMutation: number = 10
): Promise<ProofResponse> {
  const mask = crossoverMask || Array.from({ length: 8 }, () => Math.random() > 0.5);
  
  return generateProofAuto({
    type: "breed",
    parentA: traitsToArray(parentA),
    parentB: traitsToArray(parentB),
    child: traitsToArray(child),
    crossoverMask: mask,
    maxMutation,
    randomSeed: generateRandomHex(8),
  });
}

export async function generateCustodyProof(
  tokenId: number,
  claimer: string,
  threshold: number,
  shares: Array<{ owner: string; percentage: number }>
): Promise<ProofResponse> {
  return generateProofAuto({
    type: "custody",
    tokenId,
    claimer,
    threshold,
    shares,
    salt: generateRandomHex(32),
  });
}

export async function generateContentProof(
  tokenId: number,
  soulContent: string,
  identityContent: string
): Promise<ProofResponse> {
  const combined = soulContent + identityContent;
  const expectedHash = await sha256Hex(combined);
  
  return generateProofAuto({
    type: "content",
    tokenId,
    soulContent,
    identityContent,
    expectedHash,
    encryptionKeyHash: generateRandomHex(32),
  });
}

// ═══════════════════════════════════════════════════════════════════
// MOCK / DEV MODE
// ═══════════════════════════════════════════════════════════════════

export async function generateMockProof(request: ProofRequest): Promise<ProofResponse> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (request.type === "breed") {
    const breedReq = request as BreedProofRequest;
    const mutations = breedReq.child.map((c, i) => {
      const expected = breedReq.crossoverMask[i] ? breedReq.parentA[i] : breedReq.parentB[i];
      return c - expected;
    });
    
    const parentAFitness = breedReq.parentA.reduce((a, b) => a + b, 0);
    const parentBFitness = breedReq.parentB.reduce((a, b) => a + b, 0);
    const childFitness = breedReq.child.reduce((a, b) => a + b, 0);
    
    return {
      success: true,
      proof: {
        seal: "0x" + "00".repeat(256),
        journal: "0x" + "00".repeat(64),
        imageId: "0x9527671f44310aa24a74dad7fed31b8d856698e4ab70e6f6dd7026a217d34d87",
      },
      output: {
        valid: mutations.every(m => Math.abs(m) <= breedReq.maxMutation),
        fitness: childFitness,
        rarity: childFitness > 720 ? 5 : childFitness > 600 ? 4 : childFitness > 480 ? 3 : 2,
        mutations,
        hybridVigor: childFitness > parentAFitness && childFitness > parentBFitness,
      },
      cycleCount: 50000,
      proofTimeMs: 500,
    };
  }
  
  const traitArray = (request as TraitProofRequest).traits || [];
  const fitness = traitArray.reduce((a, b) => a + b, 0);
  
  return {
    success: true,
    proof: {
      seal: "0x" + "00".repeat(256),
      journal: "0x" + "00".repeat(64),
      imageId: "0x9527671f44310aa24a74dad7fed31b8d856698e4ab70e6f6dd7026a217d34d87",
    },
    output: {
      valid: true,
      fitness,
      rarity: fitness > 720 ? 5 : fitness > 600 ? 4 : fitness > 480 ? 3 : 2,
    },
    cycleCount: 50000,
    proofTimeMs: 500,
  };
}

export async function generateProofAuto(request: ProofRequest): Promise<ProofResponse> {
  // Always use mock for now until ZK API is deployed
  // In production: check NEXT_PUBLIC_ZK_DEV_MODE
  if (typeof window === 'undefined' || process.env.NEXT_PUBLIC_ZK_DEV_MODE === "true") {
    return generateMockProof(request);
  }
  return generateProof(request);
}
