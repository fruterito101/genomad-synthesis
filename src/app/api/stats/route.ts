// src/app/api/stats/route.ts
// Ticket 7.11: Estadísticas globales (público)

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { agents, breedingRequests, users } from "@/lib/db/schema";
import { count, avg, eq } from "drizzle-orm";

export async function GET(_request: NextRequest) {
  try {
    const db = getDb();

    // 1. Total agentes
    const [agentStats] = await db
      .select({
        total: count(),
        avgFitness: avg(agents.fitness),
      })
      .from(agents);

    // 2. Total usuarios
    const [userStats] = await db
      .select({ total: count() })
      .from(users);

    // 3. Total breedings ejecutados
    const [breedingStats] = await db
      .select({ total: count() })
      .from(breedingRequests)
      .where(eq(breedingRequests.status, "executed"));

    // 4. Agentes minteados
    const mintedAgents = await db
      .select({ total: count() })
      .from(agents)
      .where(eq(agents.tokenId, agents.tokenId)); // tokenId IS NOT NULL workaround

    // 5. Generación máxima
    const topGenAgents = await db
      .select({ generation: agents.generation })
      .from(agents)
      .orderBy(agents.generation)
      .limit(1);

    return NextResponse.json({
      agents: {
        total: Number(agentStats.total) || 0,
        avgFitness: Number(Number(agentStats.avgFitness).toFixed(2)) || 0,
        minted: 0, // TODO: fix query
      },
      users: {
        total: Number(userStats.total) || 0,
      },
      breeding: {
        totalExecuted: Number(breedingStats.total) || 0,
      },
      evolution: {
        maxGeneration: topGenAgents[0]?.generation || 0,
      },
      platform: {
        version: "1.0.0",
        chain: "Monad Testnet",
        chainId: 10143,
      },
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
