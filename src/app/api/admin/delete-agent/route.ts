// src/app/api/admin/delete-agent/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { agents, custodyShares, breedingRequests } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("x-admin-key");
    if (authHeader !== "genomad-sync-2026") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, id, tokenId } = await request.json();
    const db = getDb();

    // Find agent
    let agentId = id;
    if (!agentId && name) {
      const [agent] = await db.select().from(agents).where(eq(agents.name, name)).limit(1);
      if (agent) agentId = agent.id;
    }
    if (!agentId && tokenId) {
      const [agent] = await db.select().from(agents).where(eq(agents.tokenId, tokenId)).limit(1);
      if (agent) agentId = agent.id;
    }

    if (!agentId) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Delete related records first
    await db.delete(custodyShares).where(eq(custodyShares.agentId, agentId));
    await db.delete(breedingRequests).where(
      or(
        eq(breedingRequests.parentAId, agentId),
        eq(breedingRequests.parentBId, agentId),
        eq(breedingRequests.childId, agentId)
      )
    );
    await db.delete(agents).where(eq(agents.id, agentId));

    return NextResponse.json({ success: true, deleted: agentId });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
