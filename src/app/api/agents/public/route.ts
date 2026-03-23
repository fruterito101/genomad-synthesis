// src/app/api/agents/public/route.ts
// Lista pública de agentes on-chain (para landing page)

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { agents } from "@/lib/db/schema";
import { isNotNull, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "6"), 20);

    const db = getDb();

    // Get agents that are on-chain (have tokenId)
    const publicAgents = await db
      .select({
        id: agents.id,
        name: agents.name,
        fitness: agents.fitness,
        generation: agents.generation,
        tokenId: agents.tokenId,
        traits: agents.traits,
        createdAt: agents.createdAt,
      })
      .from(agents)
      .where(isNotNull(agents.tokenId))
      .orderBy(desc(agents.createdAt))
      .limit(limit);

    return NextResponse.json({
      agents: publicAgents,
      total: publicAgents.length,
    });
  } catch (error) {
    console.error("Public agents error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
