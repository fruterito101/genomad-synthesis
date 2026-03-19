// src/app/api/breeding/[requestId]/execute/route.ts
// Ticket 7.7: Ejecutar breeding con ZK proof

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { getUserByPrivyId, getBreedingRequestById, createAgent } from "@/lib/db";
import { getDb } from "@/lib/db/client";
import { agents, breedingRequests } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { GeneticEngine } from "@/lib/genetic";
import type { AgentDNA, Traits } from "@/lib/genetic/types";

// Trait order for ZK proof
const TRAIT_ORDER = [
  "social",
  "technical",
  "creativity",
  "analysis",
  "trading",
  "empathy",
  "teaching",
  "leadership",
] as const;

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

    // 5. Verificar permisos
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
      crossoverType:
        (breedingRequest.crossoverType as "uniform" | "single" | "weighted") ||
        "weighted",
      childName: breedingRequest.childName || `child-${Date.now()}`,
    });

    // 9. Convertir traits a array para ZK proof
    const traitsToArray = (traits: Traits): number[] =>
      TRAIT_ORDER.map((t) => traits[t]);

    const parentATraits = traitsToArray(parentA.traits as Traits);
    const parentBTraits = traitsToArray(parentB.traits as Traits);
    const childTraits = traitsToArray(result.child.traits);

    // 10. Generar ZK proof
    console.log("[ZK] Generating breeding proof...");
    const zkResponse = await fetch(
      new URL("/api/zk/prove", request.url).toString(),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentA: {
            traits: parentATraits,
            generation: parentA.generation,
            id: 1, // Placeholder, could use tokenId
          },
          parentB: {
            traits: parentBTraits,
            generation: parentB.generation,
            id: 2,
          },
          child: {
            traits: childTraits,
            generation: result.child.generation,
          },
        }),
      }
    );

    if (!zkResponse.ok) {
      console.error("[ZK] Proof generation failed");
      return NextResponse.json(
        { error: "Failed to generate ZK proof" },
        { status: 500 }
      );
    }

    const zkProof = await zkResponse.json();
    console.log("[ZK] Proof generated:", {
      valid: zkProof.proof.isValid,
      commitment: zkProof.proof.commitment.slice(0, 20) + "...",
    });

    if (!zkProof.proof.isValid) {
      return NextResponse.json(
        {
          error: "Breeding verification failed",
          details: "Child traits outside valid mutation range",
        },
        { status: 400 }
      );
    }

    // 11. Guardar hijo en DB con commitment
    const child = await createAgent({
      ownerId: breedingRequest.initiatorId,
      name:
        result.child.name ||
        breedingRequest.childName ||
        `child-${Date.now()}`,
      dnaHash: result.child.hash,
      traits: result.child.traits,
      generation: result.child.generation,
      lineage: result.child.lineage,
      fitness: result.childFitness,
      parentAId: parentA.id,
      parentBId: parentB.id,
      commitment: zkProof.proof.commitment,
    });

    // 12. Actualizar breeding request status
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
        commitment: zkProof.proof.commitment,
      },
      breeding: {
        parentAFitness: result.parentAFitness,
        parentBFitness: result.parentBFitness,
        childFitness: result.childFitness,
        improved: result.improved,
        mutationsApplied: result.mutationsApplied,
      },
      zkProof: {
        isValid: zkProof.proof.isValid,
        commitment: zkProof.proof.commitment,
        parentIds: [zkProof.proof.parentAId, zkProof.proof.parentBId],
        childGeneration: zkProof.proof.childGeneration,
        mutationCount: zkProof.proof.mutationCount,
        // Note: seal and journal available for on-chain verification
        // sealHex: zkProof.proof.seal,
        // journalHex: zkProof.proof.journal,
      },
      // Instructions for on-chain minting
      onChain: {
        contract: process.env.NEXT_PUBLIC_BREEDING_FACTORY_ADDRESS,
        method: "executeBreeding(uint256 requestId, bytes32 dnaCommitment)",
        args: {
          dnaCommitment: zkProof.proof.commitment,
        },
        note: "Call this contract method to mint the child NFT on-chain",
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
