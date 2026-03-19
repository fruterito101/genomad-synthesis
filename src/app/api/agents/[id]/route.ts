// src/app/api/agents/[id]/route.ts
// GET, PATCH, DELETE para gestión de agentes

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { getUserByPrivyId } from "@/lib/db";
import { getDb } from "@/lib/db/client";
import { agents, breedingRequests } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";

// GET - Detalles del agente
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const user = auth.privyId ? await getUserByPrivyId(auth.privyId) : null;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const db = getDb();
    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, id))
      .limit(1);

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const isOwner = agent.ownerId === user.id;

    // Buscar padres
    let parents: { parentA?: typeof agent; parentB?: typeof agent } = {};
    if (agent.parentAId) {
      const [parentA] = await db.select().from(agents).where(eq(agents.id, agent.parentAId)).limit(1);
      if (parentA) parents.parentA = parentA;
    }
    if (agent.parentBId) {
      const [parentB] = await db.select().from(agents).where(eq(agents.id, agent.parentBId)).limit(1);
      if (parentB) parents.parentB = parentB;
    }

    // Buscar hijos
    const children = await db
      .select()
      .from(agents)
      .where(or(eq(agents.parentAId, id), eq(agents.parentBId, id)));

    return NextResponse.json({
      agent: {
        id: agent.id,
        name: agent.name,
        botUsername: agent.botUsername,
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
        parentA: parents.parentA ? { id: parents.parentA.id, name: parents.parentA.name, dnaHash: parents.parentA.dnaHash, fitness: parents.parentA.fitness } : null,
        parentB: parents.parentB ? { id: parents.parentB.id, name: parents.parentB.name, dnaHash: parents.parentB.dnaHash, fitness: parents.parentB.fitness } : null,
      },
      children: children.map((c) => ({ id: c.id, name: c.name, dnaHash: c.dnaHash, fitness: c.fitness, generation: c.generation })),
      canDelete: isOwner && children.length === 0 && !agent.tokenId,
      canUnlink: isOwner,
      canToggleActive: isOwner,
    });
  } catch (error) {
    console.error("Get agent error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Actualizar agente (toggle active, rename, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const user = auth.privyId ? await getUserByPrivyId(auth.privyId) : null;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const db = getDb();
    const [agent] = await db.select().from(agents).where(eq(agents.id, id)).limit(1);

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    if (agent.ownerId !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await request.json();
    const updates: Record<string, any> = { updatedAt: new Date() };

    // Toggle active status
    if (typeof body.isActive === "boolean") {
      updates.isActive = body.isActive;
    }

    // Update name
    if (typeof body.name === "string" && body.name.trim()) {
      updates.name = body.name.trim();
    }

    await db.update(agents).set(updates).where(eq(agents.id, id));

    const [updated] = await db.select().from(agents).where(eq(agents.id, id)).limit(1);

    return NextResponse.json({
      success: true,
      agent: {
        id: updated.id,
        name: updated.name,
        isActive: updated.isActive,
      },
      message: updates.isActive === false ? "Agente desactivado" : "Agente actualizado",
    });
  } catch (error) {
    console.error("Update agent error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Eliminar agente permanentemente
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const user = auth.privyId ? await getUserByPrivyId(auth.privyId) : null;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const db = getDb();
    const [agent] = await db.select().from(agents).where(eq(agents.id, id)).limit(1);

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    if (agent.ownerId !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Check if minted on-chain
    if (agent.tokenId) {
      return NextResponse.json({ 
        error: "Cannot delete minted agent", 
        message: "Este agente está minteado on-chain. Solo puedes desvincularlo." 
      }, { status: 400 });
    }

    // Check if has children
    const children = await db
      .select({ id: agents.id })
      .from(agents)
      .where(or(eq(agents.parentAId, id), eq(agents.parentBId, id)))
      .limit(1);

    if (children.length > 0) {
      return NextResponse.json({ 
        error: "Cannot delete parent agent", 
        message: "Este agente tiene hijos. No puedes eliminarlo, pero puedes desvincularlo." 
      }, { status: 400 });
    }

    // Delete breeding requests involving this agent
    await db.delete(breedingRequests).where(
      or(
        eq(breedingRequests.parentAId, id),
        eq(breedingRequests.parentBId, id),
        eq(breedingRequests.childId, id)
      )
    );

    // Delete the agent
    await db.delete(agents).where(eq(agents.id, id));

    return NextResponse.json({
      success: true,
      message: "Agente eliminado permanentemente",
    });
  } catch (error) {
    console.error("Delete agent error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
