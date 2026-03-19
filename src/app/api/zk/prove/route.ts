// src/app/api/zk/prove/route.ts
// Based on: skills/risc-zero/GENESIS-TEMPLATE.md

import { NextRequest, NextResponse } from "next/server";

/**
 * Genomad Breeding Proof API
 * 
 * Generates ZK proofs for breeding verification.
 * Uses RISC Zero for production, mock for MVP demo.
 * 
 * POST /api/zk/prove
 * Body: {
 *   parentA: { traits: number[8], generation: number, id: number },
 *   parentB: { traits: number[8], generation: number, id: number },
 *   child: { traits: number[8], generation: number }
 * }
 */

interface AgentInput {
  traits: number[];
  generation: number;
  id?: number;
}

interface ProveRequest {
  parentA: AgentInput;
  parentB: AgentInput;
  child: AgentInput;
}

interface BreedingProof {
  seal: string;
  journal: string;
  commitment: string;
  isValid: boolean;
  parentAId: number;
  parentBId: number;
  childGeneration: number;
  mutationCount: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: ProveRequest = await request.json();
    const { parentA, parentB, child } = body;

    // Validate inputs
    if (!validateAgent(parentA) || !validateAgent(parentB) || !validateAgent(child)) {
      return NextResponse.json(
        { 
          error: "Invalid input format",
          expected: {
            parentA: { traits: "number[8] (0-100)", generation: "number", id: "number" },
            parentB: { traits: "number[8] (0-100)", generation: "number", id: "number" },
            child: { traits: "number[8] (0-100)", generation: "number" }
          }
        },
        { status: 400 }
      );
    }

    // Generate proof (mock for MVP, real RISC Zero in production)
    const proof = await generateBreedingProof(parentA, parentB, child);

    return NextResponse.json({
      success: true,
      proof: {
        seal: proof.seal,
        journal: proof.journal,
        commitment: proof.commitment,
        isValid: proof.isValid,
        parentAId: proof.parentAId,
        parentBId: proof.parentBId,
        childGeneration: proof.childGeneration,
        mutationCount: proof.mutationCount,
      },
      // What the proof proves (public)
      publicOutputs: {
        childCommitment: proof.commitment,
        parentIds: [proof.parentAId, proof.parentBId],
        generation: proof.childGeneration,
        breedingValid: proof.isValid,
      },
      // What remains private
      privateInputs: [
        "Exact trait values of Parent A",
        "Exact trait values of Parent B",
        "Exact trait values of Child",
        "Which parent contributed which traits",
      ],
    });
  } catch (error) {
    console.error("Error generating proof:", error);
    return NextResponse.json(
      { error: "Failed to generate proof", details: String(error) },
      { status: 500 }
    );
  }
}

function validateAgent(agent: unknown): agent is AgentInput {
  if (!agent || typeof agent !== "object") return false;
  const a = agent as AgentInput;
  
  if (!Array.isArray(a.traits) || a.traits.length !== 8) return false;
  if (!a.traits.every((t) => typeof t === "number" && t >= 0 && t <= 100)) return false;
  if (typeof a.generation !== "number" || a.generation < 0) return false;
  
  return true;
}

/**
 * Generate breeding proof
 * MVP: Mock implementation matching RISC Zero journal layout
 * Production: Call actual RISC Zero host program
 */
async function generateBreedingProof(
  parentA: AgentInput,
  parentB: AgentInput,
  child: AgentInput
): Promise<BreedingProof> {
  const MAX_MUTATION = 15;
  
  // Verify breeding validity
  let isValid = true;
  let mutationCount = 0;
  
  for (let i = 0; i < 8; i++) {
    const avg = (parentA.traits[i] + parentB.traits[i]) / 2;
    const minExpected = Math.max(0, avg - MAX_MUTATION);
    const maxExpected = Math.min(100, avg + MAX_MUTATION);
    
    if (child.traits[i] < minExpected || child.traits[i] > maxExpected) {
      isValid = false;
    }
    
    // Count significant mutations
    if (Math.abs(child.traits[i] - avg) > 5) {
      mutationCount++;
    }
  }
  
  // Verify generation
  const expectedGen = Math.max(parentA.generation, parentB.generation) + 1;
  if (child.generation !== expectedGen) {
    isValid = false;
  }
  
  // Generate commitment (matches guest calculation)
  const commitment = calculateCommitment(child.traits, child.generation);
  
  const parentAId = parentA.id || 1;
  const parentBId = parentB.id || 2;
  
  // Build journal (54 bytes, matching Solidity decoder)
  const journal = buildJournal(
    commitment,
    isValid,
    parentAId,
    parentBId,
    child.generation,
    mutationCount
  );
  
  // Mock seal (in production, this is the Groth16 proof)
  const seal = buildMockSeal(parentAId, parentBId, commitment);
  
  return {
    seal,
    journal,
    commitment,
    isValid,
    parentAId,
    parentBId,
    childGeneration: child.generation,
    mutationCount,
  };
}

function calculateCommitment(traits: number[], generation: number): string {
  const buffer = new Uint8Array(32);
  
  for (let i = 0; i < 8; i++) {
    buffer[i] = traits[i];
    buffer[i + 8] = (traits[i] + i * 13) % 256;
    buffer[i + 16] = (traits[i] * (i + 7)) % 256;
    buffer[i + 24] = traits[i] ^ ((generation >> (i * 4)) & 0xFF);
  }
  
  return "0x" + Buffer.from(buffer).toString("hex");
}

function buildJournal(
  commitment: string,
  isValid: boolean,
  parentAId: number,
  parentBId: number,
  generation: number,
  mutations: number
): string {
  // Layout: commitment(32) + isValid(1) + parentAId(8) + parentBId(8) + generation(4) + mutations(1)
  const buffer = Buffer.alloc(54);
  
  // Commitment (32 bytes)
  Buffer.from(commitment.replace("0x", ""), "hex").copy(buffer, 0);
  
  // Is valid (1 byte)
  buffer[32] = isValid ? 1 : 0;
  
  // Parent A ID (8 bytes, little endian)
  buffer.writeBigUInt64LE(BigInt(parentAId), 33);
  
  // Parent B ID (8 bytes, little endian)
  buffer.writeBigUInt64LE(BigInt(parentBId), 41);
  
  // Generation (4 bytes, little endian)
  buffer.writeUInt32LE(generation, 49);
  
  // Mutation count (1 byte)
  buffer[53] = mutations;
  
  return "0x" + buffer.toString("hex");
}

function buildMockSeal(parentAId: number, parentBId: number, commitment: string): string {
  // Mock seal structure for demo
  // In production, this is the actual Groth16 proof
  const mockProof = {
    type: "groth16-mock",
    version: "3.0.5",
    imageId: "genomad-breeding-verifier",
    parentAId,
    parentBId,
    commitment,
    timestamp: Date.now(),
    note: "This is a mock proof for hackathon demo. Production uses real RISC Zero proofs.",
  };
  
  return "0x" + Buffer.from(JSON.stringify(mockProof)).toString("hex");
}
