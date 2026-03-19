// src/app/api/leaderboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { agents, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

// Disable static caching for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") || "20"), 100);

    // Get all agents with owner info
    const allAgents = await db
      .select({
        id: agents.id,
        name: agents.name,
        botUsername: agents.botUsername,
        fitness: agents.fitness,
        generation: agents.generation,
        isActive: agents.isActive,
        traits: agents.traits,
        dnaHash: agents.dnaHash,
        tokenId: agents.tokenId,
        ownerId: agents.ownerId,
      })
      .from(agents)
      .orderBy(desc(agents.fitness))
      .limit(limit);

    // Get owner wallets
    const ownerIds = [...new Set(allAgents.map(a => a.ownerId))];
    const owners = ownerIds.length > 0 
      ? await db.select({ id: users.id, wallet: users.walletAddress }).from(users)
      : [];
    
    const ownerMap = new Map(owners.map(o => [o.id, o.wallet]));

    const agentsWithOwners = allAgents.map(agent => ({
      id: agent.id,
      name: agent.name,
      botUsername: agent.botUsername,
      fitness: agent.fitness,
      generation: agent.generation,
      isActive: agent.isActive,
      traits: agent.traits || {
        technical: 50, creativity: 50, social: 50, analysis: 50,
        empathy: 50, trading: 50, teaching: 50, leadership: 50,
      },
      tokenId: agent.tokenId,
      owner: agent.ownerId ? { wallet: ownerMap.get(agent.ownerId) || null } : null,
    }));

    const response = NextResponse.json({
      agents: agentsWithOwners,
      total: agentsWithOwners.length,
      updatedAt: new Date().toISOString(),
    });
    
    // Prevent caching
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    
    return response;
  } catch (error) {
    console.error("Leaderboard error:", error);
    const response = NextResponse.json({ agents: [], total: 0, updatedAt: new Date().toISOString() });
    response.headers.set("Cache-Control", "no-store");
    return response;
  }
}
