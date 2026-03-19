// src/app/api/agents/route.ts
// Lista agentes del usuario (incluyendo co-ownership)

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { getUserByPrivyId } from "@/lib/db";
import { getDb } from "@/lib/db/client";
import { agents, custodyShares } from "@/lib/db/schema";
import { eq, or, sql } from "drizzle-orm";
import { getAgentCustody } from "@/lib/custody";

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

    const db = getDb();

    // 3. Obtener IDs de agentes donde el usuario es co-owner
    const coOwnedAgentIds = await db
      .select({ agentId: custodyShares.agentId })
      .from(custodyShares)
      .where(eq(custodyShares.ownerId, user.id));

    const coOwnedIds = coOwnedAgentIds.map(r => r.agentId);

    // 4. Obtener agentes (owner directo O co-owner)
    let userAgents;
    if (coOwnedIds.length > 0) {
      userAgents = await db
        .select()
        .from(agents)
        .where(
          or(
            eq(agents.ownerId, user.id),
            sql`${agents.id} IN (${sql.join(coOwnedIds.map(id => sql`${id}`), sql`, `)})`
          )
        );
    } else {
      userAgents = await db
        .select()
        .from(agents)
        .where(eq(agents.ownerId, user.id));
    }

    // 5. Agregar info de custodia a cada agente
    const agentsWithCustody = await Promise.all(userAgents.map(async (a) => {
      const custody = await getAgentCustody(a.id);
      const userShare = custody.find(c => c.ownerId === user.id)?.share || 
        (a.ownerId === user.id && custody.length === 0 ? 100 : 0);
      
      return {
        id: a.id,
        name: a.name,
        botUsername: a.botUsername,
        dnaHash: a.dnaHash,
        traits: a.traits,
        fitness: a.fitness,
        generation: a.generation,
        tokenId: a.tokenId,
        contractAddress: a.contractAddress,
        commitment: a.commitment,
        isActive: a.isActive,
        activeHost: a.activeHost,
        parentAId: a.parentAId,
        parentBId: a.parentBId,
        lineage: a.lineage,
        createdAt: a.createdAt,
        mintedAt: a.mintedAt,
        // Custody info
        custody: {
          userShare,
          isShared: custody.length > 1,
          totalCoOwners: custody.length || 1,
          isFullOwner: userShare === 100,
        },
        isMine: true, // Siempre true porque son agentes del usuario
      };
    }));

    // 6. Calcular stats
    const stats = {
      total: agentsWithCustody.length,
      fullOwnership: agentsWithCustody.filter(a => a.custody.isFullOwner).length,
      shared: agentsWithCustody.filter(a => a.custody.isShared).length,
      minted: agentsWithCustody.filter(a => a.tokenId).length,
      active: agentsWithCustody.filter(a => a.isActive).length,
      avgFitness: agentsWithCustody.length > 0
        ? Number((agentsWithCustody.reduce((sum, a) => sum + (a.fitness || 0), 0) / agentsWithCustody.length).toFixed(2))
        : 0,
    };

    return NextResponse.json({
      agents: agentsWithCustody,
      stats,
    });
  } catch (error) {
    console.error("Get agents error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
