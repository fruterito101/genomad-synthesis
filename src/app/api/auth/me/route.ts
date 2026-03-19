// src/app/api/auth/me/route.ts

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { getUserByPrivyId, getAgentsByOwner } from "@/lib/db";

/**
 * GET /api/auth/me
 * 
 * Obtiene datos del usuario actual + sus agentes
 */
export async function GET(request: NextRequest) {
  // Verificar autenticación
  const auth = await requireAuth(request);
  
  if (auth instanceof NextResponse) {
    return auth; // Error response
  }

  // Obtener usuario completo
  const user = auth.privyId ? await getUserByPrivyId(auth.privyId) : null;

  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  // Obtener agentes del usuario
  const agents = await getAgentsByOwner(user.id);

  return NextResponse.json({
    user: {
      id: user.id,
      privyId: user.privyId,
      telegramId: user.telegramId,
      telegramUsername: user.telegramUsername,
      walletAddress: user.walletAddress,
      createdAt: user.createdAt,
    },
    agents: agents.map((a) => ({
      id: a.id,
      name: a.name,
      dnaHash: a.dnaHash,
      traits: a.traits,
      generation: a.generation,
      fitness: a.fitness,
      tokenId: a.tokenId,
      isActive: a.isActive,
    })),
    stats: {
      totalAgents: agents.length,
      mintedAgents: agents.filter((a) => a.tokenId).length,
      activeAgents: agents.filter((a) => a.isActive).length,
    },
  });
}
