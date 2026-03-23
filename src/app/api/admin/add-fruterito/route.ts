// Temporal endpoint para agregar Fruterito

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { agents, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("x-admin-key");
    if (authHeader !== "genomad-sync-2026") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    
    // Get first user as owner
    const [owner] = await db.select().from(users).limit(1);
    if (!owner) {
      return NextResponse.json({ error: "No users in DB" }, { status: 400 });
    }

    // Check if tokenId 7 exists
    const existing = await db
      .select()
      .from(agents)
      .where(eq(agents.tokenId, "7"))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Fruterito (#7) already exists" 
      });
    }

    // Fruterito's real traits
    const traits = {
      technical: 78,
      creativity: 72,
      social: 85,
      analysis: 70,
      empathy: 75,
      trading: 45,
      teaching: 82,
      leadership: 68,
    };

    const fitness = Object.values(traits).reduce((a, b) => a + b, 0) / 8;

    await db.insert(agents).values({
      id: crypto.randomUUID(),
      name: "Fruterito",
      ownerId: owner.id,
      dnaHash: "c794e0e4d9a4554578dabdc4614da083b876dbd2dbd327b9c86886fad5bb0dd0",
      traits,
      fitness,
      generation: 0,
      tokenId: "7",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Fruterito (#7) restored!",
      fitness,
    });
  } catch (error) {
    console.error("Add error:", error);
    return NextResponse.json({ 
      error: "Failed", 
      details: error instanceof Error ? error.message : "Unknown" 
    }, { status: 500 });
  }
}
