// src/app/api/breeding/[requestId]/execute/route.ts
// Ticket 7.7: Ejecutar breeding aprobado

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { getUserByPrivyId, getBreedingRequestById, createAgent } from "@/lib/db";
import { getDb } from "@/lib/db/client";
import { agents, breedingRequests } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { GeneticEngine, calculateDNAHash } from "@/lib/genetic";
import type { AgentDNA, Traits } from "@/lib/genetic/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;

    // 1. Verificar auth
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    // 2. Obtener usuario
    const user = auth.privyId ? await getUserByPrivyId(auth.privyId) : null;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Obtener breeding request
    const breedingRequest = await getBreedingRequestById(requestId);
    if (!breedingRequest) {
      return NextResponse.json(
        { error: "Breeding request not found" },
        { status: 404 }
      );
    }

    // 4. Verificar status
    if (breedingRequest.status === "executed") {
      return NextResponse.json(
        { error: "Breeding already executed" },
        { status: 400 }
      );
    }

    if (!breedingRequest.parentAApproved || !breedingRequest.parentBApproved) {
      return NextResponse.json(
        { error: "Breeding not fully approved yet" },
        { status: 400 }
      );
    }

    // 5. Verificar que el usuario puede ejecutar
    const canExecute =
      breedingRequest.initiatorId === user.id ||
      breedingRequest.parentAOwnerId === user.id ||
      breedingRequest.parentBOwnerId === user.id;

    if (!canExecute) {
      return NextResponse.json(
        { error: "You are not authorized to execute this breeding" },
        { status: 403 }
      );
    }

    // 6. Obtener padres
    const db = getDb();
    const [parentA] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, breedingRequest.parentAId))
      .limit(1);

    const [parentB] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, breedingRequest.parentBId))
      .limit(1);

    if (!parentA || !parentB) {
      return NextResponse.json(
        { error: "Parent agents not found" },
        { status: 404 }
      );
    }

    // 7. Crear DNA de padres
    const parentADNA: AgentDNA = {
      name: parentA.name,
      traits: parentA.traits as Traits,
      generation: parentA.generation,
      lineage: (parentA.lineage as string[]) || [],
      mutations: 0,
      hash: parentA.dnaHash,
    };

    const parentBDNA: AgentDNA = {
      name: parentB.name,
      traits: parentB.traits as Traits,
      generation: parentB.generation,
      lineage: (parentB.lineage as string[]) || [],
      mutations: 0,
      hash: parentB.dnaHash,
    };

    // 8. Ejecutar breeding con GeneticEngine
    const engine = new GeneticEngine();
    const result = engine.breed(parentADNA, parentBDNA, {
      crossoverType: (breedingRequest.crossoverType as "uniform" | "single" | "weighted") || "weighted",
      childName: breedingRequest.childName || `child-${Date.now()}`,
    });

    // 9. Guardar hijo en DB
    const child = await createAgent({
      ownerId: breedingRequest.initiatorId,
      name: result.child.name || breedingRequest.childName || `child-${Date.now()}`,
      dnaHash: result.child.hash,
      traits: result.child.traits,
      generation: result.child.generation,
      lineage: result.child.lineage,
      fitness: result.childFitness,
      parentAId: parentA.id,
      parentBId: parentB.id,
    });

    // 10. Actualizar breeding request status
    await db
      .update(breedingRequests)
      .set({
        status: "executed",
        childId: child.id,
        executedAt: new Date(),
      })
      .where(eq(breedingRequests.id, requestId));

    return NextResponse.json({
      success: true,
      child: {
        id: child.id,
        name: child.name,
        dnaHash: child.dnaHash,
        traits: child.traits,
        fitness: child.fitness,
        generation: child.generation,
      },
      breeding: {
        parentAFitness: result.parentAFitness,
        parentBFitness: result.parentBFitness,
        childFitness: result.childFitness,
        improved: result.improved,
        mutationsApplied: result.mutationsApplied,
      },
    });
  } catch (error) {
    console.error("Execute breeding error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
