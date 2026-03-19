// src/app/api/zk/prove/route.ts
// Ticket 3.4: ZK Integration Complete
// Unified ZK proof generation API

import { NextRequest, NextResponse } from "next/server";
import {
  generateProofAuto,
  type ProofRequest,
  type TraitProofRequest,
  type BreedProofRequest,
  type CustodyProofRequest,
  type ContentProofRequest,
} from "@/lib/zk";
import { withRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/zk/prove
 *
 * Generate ZK proofs for various Genomad operations.
 * Uses mock mode by default (NEXT_PUBLIC_ZK_DEV_MODE=true).
 *
 * Request body:
 * {
 *   type: "trait" | "breed" | "custody" | "content",
 *   ...typeSpecificFields
 * }
 *
 * @example Trait proof
 * {
 *   "type": "trait",
 *   "traits": [80, 65, 70, 55, 60, 45, 75, 50],
 *   "salt": "abc123...",
 *   "expectedCommitment": "0x..."
 * }
 *
 * @example Breed proof
 * {
 *   "type": "breed",
 *   "parentA": [80, 65, 70, 55, 60, 45, 75, 50],
 *   "parentB": [70, 75, 60, 65, 55, 50, 80, 45],
 *   "child": [75, 70, 65, 60, 58, 48, 78, 48],
 *   "crossoverMask": [true, false, true, false, true, false, true, false],
 *   "maxMutation": 10,
 *   "randomSeed": "0x..."
 * }
 *
 * @example Custody proof
 * {
 *   "type": "custody",
 *   "tokenId": 1,
 *   "claimer": "0x...",
 *   "threshold": 50,
 *   "shares": [{ "owner": "0x...", "percentage": 60 }],
 *   "salt": "..."
 * }
 */

export async function POST(request: NextRequest) {
  // Rate limit: 10 proofs per minute per IP
  const rateLimit = await withRateLimit(request, "default");
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        retryAfter: rateLimit.headers["Retry-After"],
      },
      {
        status: 429,
        headers: rateLimit.headers,
      }
    );
  }

  try {
    const body = await request.json();

    // Validate request type
    if (!body.type || !isValidProofType(body.type)) {
      return NextResponse.json(
        {
          error: "Invalid or missing proof type",
          validTypes: ["trait", "breed", "custody", "content"],
          documentation: "See API docs for required fields per type",
        },
        { status: 400, headers: rateLimit.headers }
      );
    }

    // Validate type-specific fields
    const validation = validateProofRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Invalid request fields",
          details: validation.errors,
          expectedFormat: getExpectedFormat(body.type),
        },
        { status: 400, headers: rateLimit.headers }
      );
    }

    // Generate proof
    const startTime = Date.now();
    const proofResult = await generateProofAuto(body as ProofRequest);
    const proofTimeMs = Date.now() - startTime;

    if (!proofResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: proofResult.error,
          type: body.type,
        },
        { status: 500, headers: rateLimit.headers }
      );
    }

    // Return proof with metadata
    return NextResponse.json(
      {
        success: true,
        type: body.type,
        proof: proofResult.proof,
        output: proofResult.output,
        metadata: {
          proofTimeMs,
          cycleCount: proofResult.cycleCount,
          mode: process.env.NEXT_PUBLIC_ZK_DEV_MODE === "true" ? "mock" : "risc0",
          version: "3.0.5",
        },
        // Privacy info
        privacy: {
          publicOutputs: getPublicOutputs(body.type, proofResult.output),
          privateInputs: getPrivateInputs(body.type),
        },
      },
      { headers: rateLimit.headers }
    );
  } catch (error) {
    console.error("[zk/prove] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate proof",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════════

function isValidProofType(type: string): type is "trait" | "breed" | "custody" | "content" {
  return ["trait", "breed", "custody", "content"].includes(type);
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function validateProofRequest(body: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  switch (body.type) {
    case "trait":
      if (!isValidTraits(body.traits)) {
        errors.push("traits must be array of 8 numbers (0-100)");
      }
      if (typeof body.salt !== "string") {
        errors.push("salt must be a hex string");
      }
      break;

    case "breed":
      if (!isValidTraits(body.parentA)) {
        errors.push("parentA must be array of 8 numbers (0-100)");
      }
      if (!isValidTraits(body.parentB)) {
        errors.push("parentB must be array of 8 numbers (0-100)");
      }
      if (!isValidTraits(body.child)) {
        errors.push("child must be array of 8 numbers (0-100)");
      }
      if (!isValidCrossoverMask(body.crossoverMask)) {
        errors.push("crossoverMask must be array of 8 booleans");
      }
      break;

    case "custody":
      if (typeof body.tokenId !== "number" || body.tokenId < 0) {
        errors.push("tokenId must be a positive number");
      }
      if (typeof body.claimer !== "string" || !body.claimer.startsWith("0x")) {
        errors.push("claimer must be a valid address");
      }
      if (typeof body.threshold !== "number" || body.threshold < 0 || body.threshold > 100) {
        errors.push("threshold must be 0-100");
      }
      if (!Array.isArray(body.shares)) {
        errors.push("shares must be an array");
      }
      break;

    case "content":
      if (typeof body.tokenId !== "number") {
        errors.push("tokenId must be a number");
      }
      if (typeof body.soulContent !== "string") {
        errors.push("soulContent must be a string");
      }
      if (typeof body.identityContent !== "string") {
        errors.push("identityContent must be a string");
      }
      break;
  }

  return { valid: errors.length === 0, errors };
}

function isValidTraits(traits: unknown): traits is number[] {
  return (
    Array.isArray(traits) &&
    traits.length === 8 &&
    traits.every((t) => typeof t === "number" && t >= 0 && t <= 100)
  );
}

function isValidCrossoverMask(mask: unknown): mask is boolean[] {
  return (
    Array.isArray(mask) &&
    mask.length === 8 &&
    mask.every((m) => typeof m === "boolean")
  );
}

// ═══════════════════════════════════════════════════════════════════
// DOCUMENTATION HELPERS
// ═══════════════════════════════════════════════════════════════════

function getExpectedFormat(type: string): Record<string, string> {
  const formats: Record<string, Record<string, string>> = {
    trait: {
      traits: "number[8] (0-100)",
      salt: "hex string",
      expectedCommitment: "hex string",
    },
    breed: {
      parentA: "number[8] (0-100)",
      parentB: "number[8] (0-100)",
      child: "number[8] (0-100)",
      crossoverMask: "boolean[8]",
      maxMutation: "number (default: 10)",
      randomSeed: "hex string",
    },
    custody: {
      tokenId: "number",
      claimer: "address (0x...)",
      threshold: "number (0-100)",
      shares: "[{ owner: address, percentage: number }]",
      salt: "hex string",
    },
    content: {
      tokenId: "number",
      soulContent: "string",
      identityContent: "string",
      expectedHash: "hex string (optional)",
    },
  };

  return formats[type] || {};
}

function getPublicOutputs(
  type: string,
  output: Record<string, unknown> | undefined
): string[] {
  const publicOutputs: Record<string, string[]> = {
    trait: ["Trait commitment hash", "Fitness score", "Rarity tier"],
    breed: [
      "Child commitment hash",
      "Parent IDs",
      "Generation number",
      "Breeding validity",
      "Hybrid vigor status",
    ],
    custody: ["Token ID", "Claimer address", "Share percentage", "Threshold met"],
    content: ["Content hash", "Token ID", "Encryption key hash"],
  };

  return publicOutputs[type] || [];
}

function getPrivateInputs(type: string): string[] {
  const privateInputs: Record<string, string[]> = {
    trait: ["Exact trait values", "Salt used for commitment"],
    breed: [
      "Exact trait values of Parent A",
      "Exact trait values of Parent B",
      "Exact trait values of Child",
      "Which parent contributed which traits",
      "Mutation values",
    ],
    custody: ["Full share distribution", "Salt"],
    content: ["SOUL.md content", "IDENTITY.md content", "Encryption key"],
  };

  return privateInputs[type] || [];
}

// ═══════════════════════════════════════════════════════════════════
// GET: Documentation endpoint
// ═══════════════════════════════════════════════════════════════════

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/zk/prove",
    method: "POST",
    description: "Generate ZK proofs for Genomad operations",
    mode: process.env.NEXT_PUBLIC_ZK_DEV_MODE === "true" ? "mock" : "risc0",
    version: "3.0.5",
    proofTypes: {
      trait: {
        description: "Prove trait ownership without revealing values",
        fields: getExpectedFormat("trait"),
        publicOutputs: getPublicOutputs("trait", undefined),
        privateInputs: getPrivateInputs("trait"),
      },
      breed: {
        description: "Prove valid breeding between two agents",
        fields: getExpectedFormat("breed"),
        publicOutputs: getPublicOutputs("breed", undefined),
        privateInputs: getPrivateInputs("breed"),
      },
      custody: {
        description: "Prove custody share without revealing all shares",
        fields: getExpectedFormat("custody"),
        publicOutputs: getPublicOutputs("custody", undefined),
        privateInputs: getPrivateInputs("custody"),
      },
      content: {
        description: "Prove content ownership without revealing content",
        fields: getExpectedFormat("content"),
        publicOutputs: getPublicOutputs("content", undefined),
        privateInputs: getPrivateInputs("content"),
      },
    },
    examples: {
      traitProof: {
        type: "trait",
        traits: [80, 65, 70, 55, 60, 45, 75, 50],
        salt: "a1b2c3d4...",
        expectedCommitment: "0x...",
      },
      breedProof: {
        type: "breed",
        parentA: [80, 65, 70, 55, 60, 45, 75, 50],
        parentB: [70, 75, 60, 65, 55, 50, 80, 45],
        child: [75, 70, 65, 60, 58, 48, 78, 48],
        crossoverMask: [true, false, true, false, true, false, true, false],
        maxMutation: 10,
        randomSeed: "0xabc123",
      },
    },
    contracts: {
      traitVerifier: "0xaccaE8B19AD67df4Ce91638855c9B41A5Da90be3",
      note: "On-chain verification available in production mode",
    },
  });
}
