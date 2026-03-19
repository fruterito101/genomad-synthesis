// src/app/api/agents/register/route.ts
// Ticket 7.1: Registrar agente desde web
// Ticket 2.3: Return commitment for on-chain mint

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { createAgent, getUserByPrivyId } from "@/lib/db";
import { heuristicsEngine } from "@/lib/heuristics";
import { calculateDNAHash, calculateTotalFitness } from "@/lib/genetic";
import { keccak256, toHex } from "viem";
import type { AgentDNA } from "@/lib/genetic/types";

/**
 * Generate DNA commitment for on-chain registration
 * commitment = keccak256(dnaHash)
 */
function generateCommitment(dnaHash: string): `0x${string}` {
  return keccak256(toHex(dnaHash));
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar auth
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    // 2. Obtener usuario
    const user = auth.privyId ? await getUserByPrivyId(auth.privyId) : null;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Parsear body
    const body = await request.json();
    const { name, soul, identity, tools } = body as {
      name: string;
      soul?: string;
      identity?: string;
      tools?: string;
    };

    if (!name) {
      return NextResponse.json(
        { error: "Agent name is required" },
        { status: 400 }
      );
    }

    if (!soul && !identity) {
      return NextResponse.json(
        { error: "At least SOUL.md or IDENTITY.md content required" },
        { status: 400 }
      );
    }

    // 4. Analizar con heurísticas
    const analysisResult = heuristicsEngine.analyze({
      soul: soul || "",
      identity: identity || "",
      tools: tools || "",
    });

    // 5. Calcular fitness
    const fitness = calculateTotalFitness(analysisResult.traits);

    // 6. Crear DNA
    const dnaBase: Omit<AgentDNA, "hash"> = {
      name,
      traits: analysisResult.traits,
      generation: 0,
      lineage: [],
      mutations: 0,
    };

    const dna: AgentDNA = {
      ...dnaBase,
      hash: calculateDNAHash(dnaBase),
    };

    // 7. Generate commitment for on-chain
    const commitment = generateCommitment(dna.hash);

    // 8. Guardar en DB (with commitment)
    const agent = await createAgent({
      ownerId: user.id,
      name,
      dnaHash: dna.hash,
      traits: dna.traits,
      generation: 0,
      lineage: [],
      fitness,
      commitment, // Store commitment for later verification
    });

    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        dnaHash: agent.dnaHash,
        traits: agent.traits,
        fitness: agent.fitness,
        generation: agent.generation,
        // For on-chain registration
        commitment: commitment,
      },
      analysis: {
        confidence: analysisResult.totalConfidence,
        warnings: analysisResult.warnings,
      },
      // Instructions for frontend
      onChain: {
        commitment: commitment,
        contractAddress: process.env.NEXT_PUBLIC_GENOMAD_NFT_ADDRESS || "0x190fd355ED38e82a2390C07222C4BcB4DbC4cD20",
        functionName: "registerAgent",
        args: [commitment],
        syncEndpoint: `/api/agents/${agent.id}/onchain`,
      },
    });
  } catch (error) {
    console.error("Register agent error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
