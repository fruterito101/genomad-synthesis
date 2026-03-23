// src/app/api/admin/sync-onchain/route.ts
// Temporal: Sincroniza agentes on-chain a la DB

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { agents, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const ONCHAIN_AGENTS = [
  { tokenId: "1", name: "Genomad", generation: 0 },
  { tokenId: "2", name: "Helix", generation: 0 },
  { tokenId: "3", name: "Cipher", generation: 0 },
  { tokenId: "4", name: "Offspring", generation: 1 },
  { tokenId: "5", name: "Pioneer", generation: 0 },
  { tokenId: "6", name: "Nexus", generation: 0 },
];

function randomTraits() {
  return {
    technical: Math.floor(Math.random() * 30) + 65,
    creativity: Math.floor(Math.random() * 30) + 55,
    social: Math.floor(Math.random() * 30) + 60,
    analysis: Math.floor(Math.random() * 30) + 60,
    empathy: Math.floor(Math.random() * 30) + 50,
    trading: Math.floor(Math.random() * 30) + 45,
    teaching: Math.floor(Math.random() * 30) + 55,
    leadership: Math.floor(Math.random() * 30) + 50,
  };
}

function calculateFitness(traits: Record<string, number>) {
  const values = Object.values(traits);
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export async function POST(request: NextRequest) {
  try {
    // Simple auth check
    const authHeader = request.headers.get("x-admin-key");
    if (authHeader !== "genomad-sync-2026") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const created: string[] = [];
    const skipped: string[] = [];

    // Get first user as owner
    const [owner] = await db.select().from(users).limit(1);
    if (!owner) {
      return NextResponse.json({ error: "No users in DB" }, { status: 400 });
    }

    for (const agent of ONCHAIN_AGENTS) {
      // Check if tokenId exists
      const existing = await db
        .select()
        .from(agents)
        .where(eq(agents.tokenId, agent.tokenId))
        .limit(1);

      if (existing.length > 0) {
        skipped.push(`${agent.name} (#${agent.tokenId})`);
        continue;
      }

      const traits = randomTraits();
      const fitness = calculateFitness(traits);

      await db.insert(agents).values({
        id: crypto.randomUUID(),
        name: agent.name,
        ownerId: owner.id,
        dnaHash: crypto.randomBytes(32).toString("hex"),
        traits,
        fitness,
        generation: agent.generation,
        tokenId: agent.tokenId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      created.push(`${agent.name} (#${agent.tokenId})`);
    }

    return NextResponse.json({
      success: true,
      created,
      skipped,
      message: `Created ${created.length} agents, skipped ${skipped.length}`,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ 
      error: "Sync failed", 
      details: error instanceof Error ? error.message : "Unknown" 
    }, { status: 500 });
  }
}
