// src/app/api/leaderboard/route.ts
// Ticket 7.10: Top agentes por fitness (público)

import { NextRequest, NextResponse } from "next/server";
import { getTopAgentsByFitness } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // 1. Obtener limit del query (default 50)
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50");
    const safeLimit = Math.min(Math.max(1, limit), 100);

    // 2. Query top agentes
    const topAgents = await getTopAgentsByFitness(safeLimit);

    // 3. Formatear respuesta
    const leaderboard = topAgents.map((agent, index) => ({
      rank: index + 1,
      id: agent.id,
      name: agent.name,
      fitness: agent.fitness,
      generation: agent.generation,
      dnaHashShort: agent.dnaHash.slice(0, 8),
      minted: !!agent.tokenId,
    }));

    return NextResponse.json({
      leaderboard,
      total: leaderboard.length,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
