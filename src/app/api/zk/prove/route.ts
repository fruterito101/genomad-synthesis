// src/app/api/zk/prove/route.ts
import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Generate a ZK proof for breeding verification
 * 
 * POST /api/zk/prove
 * Body: {
 *   parentATraits: number[8],
 *   parentBTraits: number[8],
 *   childTraits: number[8]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { parentATraits, parentBTraits, childTraits } = body;

    // Validate inputs
    if (!validateTraits(parentATraits) || !validateTraits(parentBTraits) || !validateTraits(childTraits)) {
      return NextResponse.json(
        { error: "Invalid traits format. Each must be an array of 8 numbers (0-100)" },
        { status: 400 }
      );
    }

    // For hackathon MVP, we simulate the proof generation
    // In production, this would call the actual RISC Zero prover
    const proof = await generateProofMock(parentATraits, parentBTraits, childTraits);

    return NextResponse.json({
      success: true,
      proof: proof.seal,
      journal: proof.journal,
      commitment: proof.commitment,
      isValid: proof.isValid,
    });
  } catch (error) {
    console.error("Error generating proof:", error);
    return NextResponse.json(
      { error: "Failed to generate proof" },
      { status: 500 }
    );
  }
}

function validateTraits(traits: unknown): traits is number[] {
  if (!Array.isArray(traits) || traits.length !== 8) return false;
  return traits.every((t) => typeof t === "number" && t >= 0 && t <= 100);
}

/**
 * Mock proof generation for hackathon MVP
 * In production, this calls the actual RISC Zero host program
 */
async function generateProofMock(
  parentA: number[],
  parentB: number[],
  child: number[]
): Promise<{
  seal: string;
  journal: string;
  commitment: string;
  isValid: boolean;
}> {
  // Verify breeding validity
  const isValid = verifyBreedingValidity(parentA, parentB, child);

  // Generate mock proof data
  const commitment = generateCommitment(child);
  
  // In production, these would be actual cryptographic proofs
  const seal = Buffer.from(JSON.stringify({
    type: "groth16",
    parentAHash: hashTraits(parentA),
    parentBHash: hashTraits(parentB),
    childCommitment: commitment,
    verified: isValid,
    timestamp: Date.now(),
  })).toString("hex");

  const journal = Buffer.from(JSON.stringify({
    commitment,
    isValid,
  })).toString("hex");

  return { seal, journal, commitment, isValid };
}

function verifyBreedingValidity(parentA: number[], parentB: number[], child: number[]): boolean {
  const MAX_MUTATION = 15;

  for (let i = 0; i < 8; i++) {
    const avg = (parentA[i] + parentB[i]) / 2;
    const minExpected = Math.max(0, avg - MAX_MUTATION);
    const maxExpected = Math.min(100, avg + MAX_MUTATION);

    if (child[i] < minExpected || child[i] > maxExpected) {
      return false;
    }
  }

  return true;
}

function generateCommitment(traits: number[]): string {
  // Simple commitment (in production, use proper hash)
  const buffer = Buffer.from(traits);
  let hash = 0;
  for (let i = 0; i < buffer.length; i++) {
    hash = ((hash << 5) - hash) + buffer[i];
    hash = hash & hash;
  }
  return "0x" + Math.abs(hash).toString(16).padStart(64, "0");
}

function hashTraits(traits: number[]): string {
  return generateCommitment(traits);
}
