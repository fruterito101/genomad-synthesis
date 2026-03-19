// src/app/api/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { agents, breedingRequests, users } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";

export async function GET(_request: NextRequest) {
  try {
    const db = getDb();

    // Total agents
    const [agentStats] = await db.select({ total: count() }).from(agents);

    // Active agents (isActive = true)
    const [activeStats] = await db.select({ total: count() }).from(agents).where(eq(agents.isActive, true));

    // Total breedings
    const [breedingStats] = await db.select({ total: count() }).from(breedingRequests).where(eq(breedingRequests.status, "executed"));

    // Total users
    const [userStats] = await db.select({ total: count() }).from(users);

    return NextResponse.json({
      totalAgents: Number(agentStats.total) || 0,
      activeAgents: Number(activeStats.total) || 0,
      totalBreedings: Number(breedingStats.total) || 0,
      totalUsers: Number(userStats.total) || 0,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({
      totalAgents: 0,
      activeAgents: 0,
      totalBreedings: 0,
      totalUsers: 0,
      updatedAt: new Date().toISOString(),
    });
  }
}
