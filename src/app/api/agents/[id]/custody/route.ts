// src/app/api/agents/[id]/custody/route.ts
// Obtener información de custodia de un agente

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { getUserByPrivyId } from "@/lib/db";
import { getDb } from "@/lib/db/client";
import { agents, users, custodyShares } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAgentCustody, getUserCustodyShare } from "@/lib/custody";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Auth opcional - para saber si el usuario es co-owner
    let currentUserId: string | null = null;
    try {
      const auth = await requireAuth(request);
      if (!(auth instanceof NextResponse) && auth.privyId) {
        const user = await getUserByPrivyId(auth.privyId);
        if (user) currentUserId = user.id;
      }
    } catch {}

    const db = getDb();
    
    // Verificar que el agente existe
    const [agent] = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Obtener custody shares
    const shares = await getAgentCustody(id);
    
    // Si no hay shares, es 100% del owner original
    if (shares.length === 0) {
      const [owner] = await db.select().from(users).where(eq(users.id, agent.ownerId)).limit(1);
      
      return NextResponse.json({
        agentId: id,
        agentName: agent.name,
        isShared: false,
        shares: [{
          ownerId: agent.ownerId,
          ownerName: owner?.displayName || owner?.telegramUsername || "Unknown",
          share: 100,
          source: "original",
        }],
        currentUserShare: currentUserId === agent.ownerId ? 100 : 0,
        isCurrentUserCoOwner: currentUserId === agent.ownerId,
      });
    }

    // Obtener info de cada co-owner
    const sharesWithInfo = await Promise.all(shares.map(async (s) => {
      const [owner] = await db.select().from(users).where(eq(users.id, s.ownerId)).limit(1);
      return {
        ownerId: s.ownerId,
        ownerName: owner?.displayName || owner?.telegramUsername || "Unknown",
        ownerWallet: owner?.walletAddress ? `${owner.walletAddress.slice(0,6)}...${owner.walletAddress.slice(-4)}` : null,
        share: s.share,
        source: s.source,
      };
    }));

    const currentUserShare = currentUserId 
      ? await getUserCustodyShare(id, currentUserId)
      : 0;

    return NextResponse.json({
      agentId: id,
      agentName: agent.name,
      isShared: shares.length > 1,
      totalCoOwners: shares.length,
      shares: sharesWithInfo,
      currentUserShare,
      isCurrentUserCoOwner: currentUserShare > 0,
    });
  } catch (error) {
    console.error("Get custody error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
