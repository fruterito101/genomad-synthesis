// src/app/api/breeding/[requestId]/execute/route.ts
// Ejecutar breeding - SIMPLIFIED VERSION (ZK MOCK for hackathon)

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { getUserByPrivyId, getBreedingRequestById, createAgent } from "@/lib/db";
import { getDb } from "@/lib/db/client";
import { agents, breedingRequests } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { GeneticEngine } from "@/lib/genetic";
import type { AgentDNA, Traits } from "@/lib/genetic/types";
import { calculateChildCustody, createCustodyShares } from "@/lib/custody";
import crypto from "crypto";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;

    // Parse optional body
    let txHash: string | undefined;
    let childTokenId: string | undefined;
    try {
      const body = await request.json();
      txHash = body.txHash;
      childTokenId = body.childTokenId;
    } catch {
      // Empty body OK
    }

    // 1. Auth
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    // 2. Get user
    const user = auth.privyId ? await getUserByPrivyId(auth.privyId) : null;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Get breeding request
    const breedingRequest = await getBreedingRequestById(requestId);
    if (!breedingRequest) {
      return NextResponse.json({ error: "Breeding request not found" }, { status: 404 });
    }

    // 4. Check status
    if (breedingRequest.status === "executed") {
      return NextResponse.json({ error: "Breeding already executed" }, { status: 400 });
    }

    if (!breedingRequest.parentAApproved || !breedingRequest.parentBApproved) {
      return NextResponse.json({ error: "Breeding not fully approved yet" }, { status: 400 });
    }

    // 5. Check permissions
    const canExecute =
      breedingRequest.initiatorId === user.id ||
      breedingRequest.parentAOwnerId === user.id ||
      breedingRequest.parentBOwnerId === user.id;

    if (!canExecute) {
      return NextResponse.json({ error: "Not authorized to execute" }, { status: 403 });
    }

    // 6. Get parents
    const db = getDb();
    const [parentA] = await db.select().from(agents).where(eq(agents.id, breedingRequest.parentAId)).limit(1);
    const [parentB] = await db.select().from(agents).where(eq(agents.id, breedingRequest.parentBId)).limit(1);

    if (!parentA || !parentB) {
      return NextResponse.json({ error: "Parent agents not found" }, { status: 404 });
    }

    // 7. Create parent DNA
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

    // 8. Execute breeding
    const engine = new GeneticEngine();
    const result = engine.breed(parentADNA, parentBDNA, {
      crossoverType: (breedingRequest.crossoverType as "uniform" | "single" | "weighted") || "weighted",
      childName: breedingRequest.childName || `child-${Date.now()}`,
    });

    // 9. MOCK ZK - Generate fake commitment (for hackathon)
    const mockCommitment = "0x" + crypto.randomBytes(32).toString("hex");
    console.log("[ZK-MOCK] Generated mock commitment:", mockCommitment);

    // 10. Calculate shared custody
    const childCustody = await calculateChildCustody(parentA.id, parentB.id);
    console.log("[CUSTODY] Calculated shares:", childCustody);

    // 11. Determine primary owner
    const primaryOwner = childCustody.reduce((max, curr) => 
      curr.share > max.share ? curr : max
    , childCustody[0]);

    // 12. Save child to DB
    const child = await createAgent({
      ownerId: primaryOwner.ownerId,
      name: result.child.name || breedingRequest.childName || `child-${Date.now()}`,
      dnaHash: result.child.hash,
      traits: result.child.traits,
      generation: result.child.generation,
      lineage: result.child.lineage,
      fitness: result.childFitness,
      parentAId: parentA.id,
      parentBId: parentB.id,
      commitment: mockCommitment,
      ...(childTokenId && { tokenId: childTokenId }),
    });

    // 13. Create custody shares
    await createCustodyShares(child.id, childCustody);
    console.log("[CUSTODY] Shares created for child:", child.id);

    // 14. Update breeding request
    await db.update(breedingRequests).set({
      status: "executed",
      childId: child.id,
      executedAt: new Date(),
      ...(txHash && { txHash }),
    }).where(eq(breedingRequests.id, requestId));

    // 15. Response
    return NextResponse.json({
      success: true,
      child: {
        id: child.id,
        name: child.name,
        dnaHash: child.dnaHash,
        traits: child.traits,
        fitness: child.fitness,
        generation: child.generation,
        commitment: mockCommitment,
        ...(childTokenId && { tokenId: childTokenId }),
      },
      custody: {
        shares: childCustody.map(s => ({
          ownerId: s.ownerId,
          share: s.share,
          source: s.source,
        })),
        isShared: childCustody.length > 1,
        primaryOwner: primaryOwner.ownerId,
      },
      breeding: {
        parentAFitness: result.parentAFitness,
        parentBFitness: result.parentBFitness,
        childFitness: result.childFitness,
        improved: result.improved,
        mutationsApplied: result.mutationsApplied,
      },
      zkProof: {
        isValid: true,
        commitment: mockCommitment,
        mode: "mock", // Indicates ZK is mocked for hackathon
      },
    });
  } catch (error) {
    console.error("Execute breeding error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
