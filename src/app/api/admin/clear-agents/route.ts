// src/app/api/admin/clear-agents/route.ts
// Temporal: Limpiar agentes para demo

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { agents, breedingRequests, custodyShares } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("x-admin-key");
    if (authHeader !== "genomad-clear-2026") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    
    // Delete in order (foreign keys)
    await db.delete(custodyShares);
    await db.delete(breedingRequests);
    await db.delete(agents);

    return NextResponse.json({
      success: true,
      message: "All agents cleared for demo",
    });
  } catch (error) {
    console.error("Clear error:", error);
    return NextResponse.json({ 
      error: "Clear failed", 
      details: error instanceof Error ? error.message : "Unknown" 
    }, { status: 500 });
  }
}
