// src/app/api/agents/[id]/dna/route.ts
// Ticket 7.4: DNA completo + visualización

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { agents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { TRAIT_NAMES } from "@/lib/genetic/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Buscar agente (público - no requiere auth)
    const db = getDb();
    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, id))
      .limit(1);

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // 2. Parsear traits
    const traits = agent.traits as Record<string, number>;

    // 3. Preparar datos para visualización radar
    const radarData = TRAIT_NAMES.map((trait) => ({
      trait,
      value: traits[trait] || 0,
      fullMark: 100,
    }));

    // 4. Calcular trait dominante y débil
    const sortedTraits = Object.entries(traits).sort((a, b) => b[1] - a[1]);
    const dominant = sortedTraits[0];
    const weakest = sortedTraits[sortedTraits.length - 1];

    // 5. Hash corto para display
    const shortHash = agent.dnaHash.slice(0, 8);

    return NextResponse.json({
      dna: {
        name: agent.name,
        hash: agent.dnaHash,
        shortHash,
        generation: agent.generation,
        traits,
        fitness: agent.fitness,
        lineage: agent.lineage || [],
      },
      visualization: {
        radar: radarData,
        dominant: { trait: dominant[0], value: dominant[1] },
        weakest: { trait: weakest[0], value: weakest[1] },
        balance: Number(
          (100 - (Math.max(...Object.values(traits)) - Math.min(...Object.values(traits)))).toFixed(1)
        ),
      },
      metadata: {
        tokenId: agent.tokenId,
        minted: !!agent.tokenId,
        createdAt: agent.createdAt,
      },
    });
  } catch (error) {
    console.error("Get DNA error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
