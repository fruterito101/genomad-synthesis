// src/app/api/agents/available/route.ts
// Obtener todos los agentes disponibles para breeding (propios + de otros)

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { getUserByPrivyId } from "@/lib/db";
import { getDb } from "@/lib/db/client";
import { agents, users } from "@/lib/db/schema";
import { eq, isNotNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const user = auth.privyId ? await getUserByPrivyId(auth.privyId) : null;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const db = getDb();

    // Obtener TODOS los agentes activos o registrados
    const allAgents = await db
      .select({
        id: agents.id,
        name: agents.name,
        botUsername: agents.botUsername,
        traits: agents.traits,
        fitness: agents.fitness,
        generation: agents.generation,
        isActive: agents.isActive,
        ownerId: agents.ownerId,
        ownerWallet: users.walletAddress,
        ownerUsername: users.telegramUsername,
      })
      .from(agents)
      .leftJoin(users, eq(agents.ownerId, users.id))
      .where(isNotNull(agents.ownerId));

    // Marcar cuáles son del usuario actual
    const agentsWithOwnership = allAgents.map(agent => ({
      ...agent,
      traits: typeof agent.traits === "string" ? JSON.parse(agent.traits) : agent.traits,
      isMine: agent.ownerId === user.id,
      ownerDisplay: agent.ownerId === user.id 
        ? "Tú" 
        : agent.ownerUsername 
          || (agent.ownerWallet ? `${agent.ownerWallet.slice(0,6)}...${agent.ownerWallet.slice(-4)}` : "Unknown"),
    }));

    // Separar en míos y de otros
    const myAgents = agentsWithOwnership.filter(a => a.isMine);
    const otherAgents = agentsWithOwnership.filter(a => !a.isMine);

    return NextResponse.json({
      myAgents,
      otherAgents,
      allAgents: agentsWithOwnership,
      totalMine: myAgents.length,
      totalOthers: otherAgents.length,
    });
  } catch (error) {
    console.error("Get available agents error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
