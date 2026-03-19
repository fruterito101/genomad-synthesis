// src/app/api/agents/route.ts
// Ticket 7.2: Lista agentes del usuario

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { getAgentsByOwner, getUserByPrivyId } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // 1. Verificar auth
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    // 2. Obtener usuario
    const user = auth.privyId ? await getUserByPrivyId(auth.privyId) : null;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Obtener agentes
    const agents = await getAgentsByOwner(user.id);

    // 4. Calcular stats
    const stats = {
      total: agents.length,
      minted: agents.filter((a) => a.tokenId).length,
      active: agents.filter((a) => a.isActive).length,
      avgFitness: agents.length > 0
        ? Number((agents.reduce((sum, a) => sum + (a.fitness || 0), 0) / agents.length).toFixed(2))
        : 0,
    };

    return NextResponse.json({
      agents: agents.map((a) => ({
        id: a.id,
        name: a.name,
        dnaHash: a.dnaHash,
        traits: a.traits,
        fitness: a.fitness,
        generation: a.generation,
        tokenId: a.tokenId,
        isActive: a.isActive,
        createdAt: a.createdAt,
      })),
      stats,
    });
  } catch (error) {
    console.error("Get agents error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
