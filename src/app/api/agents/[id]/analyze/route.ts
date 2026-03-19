// src/app/api/agents/[id]/analyze/route.ts
// Ticket 7.12: Re-analizar agente con archivos actualizados

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { getUserByPrivyId } from "@/lib/db";
import { getDb } from "@/lib/db/client";
import { agents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { heuristicsEngine } from "@/lib/heuristics";
import { calculateTotalFitness, calculateDNAHash } from "@/lib/genetic";
import type { Traits, AgentDNA } from "@/lib/genetic/types";

export async function POST(
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

    // 3. Obtener agente
    const db = getDb();
    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, id))
      .limit(1);

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // 4. Verificar ownership
    if (agent.ownerId !== user.id) {
      return NextResponse.json(
        { error: "You do not own this agent" },
        { status: 403 }
      );
    }

    // 5. Parsear nuevos archivos
    const body = await request.json();
    const { soul, identity, tools, apply } = body as {
      soul?: string;
      identity?: string;
      tools?: string;
      apply?: boolean;
    };

    if (!soul && !identity) {
      return NextResponse.json(
        { error: "At least SOUL.md or IDENTITY.md content required" },
        { status: 400 }
      );
    }

    // 6. Analizar nuevos archivos
    const analysisResult = heuristicsEngine.analyze({
      soul: soul || "",
      identity: identity || "",
      tools: tools || "",
    });

    const newTraits = analysisResult.traits;
    const newFitness = calculateTotalFitness(newTraits);

    // 7. Comparar con traits actuales
    const currentTraits = agent.traits as Traits;
    const changes = heuristicsEngine.compareTraits(currentTraits, newTraits);

    // 8. Aplicar cambios si se solicita
    let updated = false;
    if (apply && changes.length > 0) {
      const dnaBase: Omit<AgentDNA, "hash"> = {
        name: agent.name,
        traits: newTraits,
        generation: agent.generation,
        lineage: (agent.lineage as string[]) || [],
        mutations: 0,
      };

      const newHash = calculateDNAHash(dnaBase);

      await db
        .update(agents)
        .set({
          traits: newTraits,
          fitness: newFitness,
          dnaHash: newHash,
          updatedAt: new Date(),
        })
        .where(eq(agents.id, id));

      updated = true;
    }

    return NextResponse.json({
      before: {
        traits: currentTraits,
        fitness: agent.fitness,
      },
      after: {
        traits: newTraits,
        fitness: newFitness,
      },
      changes: changes.map((c) => ({
        trait: c.trait,
        before: c.before,
        after: c.after,
        delta: c.delta,
        direction: c.delta > 0 ? "increased" : "decreased",
      })),
      analysis: {
        confidence: analysisResult.totalConfidence,
        warnings: analysisResult.warnings,
      },
      applied: updated,
      message: updated
        ? "Changes applied to agent"
        : "Preview only. Set apply=true to save changes.",
    });
  } catch (error) {
    console.error("Analyze agent error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
