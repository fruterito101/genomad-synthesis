// src/app/api/agents/[id]/route.ts
// Ticket 7.3: Detalles de un agente

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { getUserByPrivyId } from "@/lib/db";
import { getDb } from "@/lib/db/client";
import { agents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Verificar auth
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    // 2. Obtener usuario
    const user = auth.privyId ? await getUserByPrivyId(auth.privyId) : null;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Buscar agente
    const db = getDb();
    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, id))
      .limit(1);

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // 4. Verificar ownership (o si es público)
    const isOwner = agent.ownerId === user.id;

    // 5. Buscar padres si existen
    let parents: { parentA?: typeof agent; parentB?: typeof agent } = {};
    if (agent.parentAId) {
      const [parentA] = await db
        .select()
        .from(agents)
        .where(eq(agents.id, agent.parentAId))
        .limit(1);
      if (parentA) parents.parentA = parentA;
    }
    if (agent.parentBId) {
      const [parentB] = await db
        .select()
        .from(agents)
        .where(eq(agents.id, agent.parentBId))
        .limit(1);
      if (parentB) parents.parentB = parentB;
    }

    // 6. Buscar hijos
    const children = await db
      .select()
      .from(agents)
      .where(eq(agents.parentAId, id));

    return NextResponse.json({
      agent: {
        id: agent.id,
        name: agent.name,
        dnaHash: agent.dnaHash,
        traits: agent.traits,
        fitness: agent.fitness,
        generation: agent.generation,
        tokenId: agent.tokenId,
        isActive: agent.isActive,
        createdAt: agent.createdAt,
        isOwner,
      },
      parents: {
        parentA: parents.parentA ? {
          id: parents.parentA.id,
          name: parents.parentA.name,
          dnaHash: parents.parentA.dnaHash,
          fitness: parents.parentA.fitness,
        } : null,
        parentB: parents.parentB ? {
          id: parents.parentB.id,
          name: parents.parentB.name,
          dnaHash: parents.parentB.dnaHash,
          fitness: parents.parentB.fitness,
        } : null,
      },
      children: children.map((c) => ({
        id: c.id,
        name: c.name,
        dnaHash: c.dnaHash,
        fitness: c.fitness,
        generation: c.generation,
      })),
    });
  } catch (error) {
    console.error("Get agent error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
