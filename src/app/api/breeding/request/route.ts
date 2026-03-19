// src/app/api/breeding/request/route.ts
// Ticket 7.5: Crear solicitud de breeding

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { getUserByPrivyId, createBreedingRequest } from "@/lib/db";
import { getDb } from "@/lib/db/client";
import { agents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar auth
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    // 2. Obtener usuario
    const user = auth.privyId ? await getUserByPrivyId(auth.privyId) : null;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Parsear body
    const body = await request.json();
    const { parentAId, parentBId, childName, crossoverType } = body as {
      parentAId: string;
      parentBId: string;
      childName?: string;
      crossoverType?: "uniform" | "single" | "weighted";
    };

    if (!parentAId || !parentBId) {
      return NextResponse.json(
        { error: "Both parentAId and parentBId are required" },
        { status: 400 }
      );
    }

    if (parentAId === parentBId) {
      return NextResponse.json(
        { error: "Cannot breed agent with itself" },
        { status: 400 }
      );
    }

    // 4. Verificar que ambos agentes existen
    const db = getDb();
    const [parentA] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, parentAId))
      .limit(1);

    const [parentB] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, parentBId))
      .limit(1);

    if (!parentA || !parentB) {
      return NextResponse.json(
        { error: "One or both parents not found" },
        { status: 404 }
      );
    }

    // 5. Verificar ownership de al menos uno
    const ownsA = parentA.ownerId === user.id;
    const ownsB = parentB.ownerId === user.id;

    if (!ownsA && !ownsB) {
      return NextResponse.json(
        { error: "You must own at least one of the parents" },
        { status: 403 }
      );
    }

    // 6. Crear request
    const breedingRequest = await createBreedingRequest({
      initiatorId: user.id,
      parentAId,
      parentBId,
      parentAOwnerId: parentA.ownerId,
      parentBOwnerId: parentB.ownerId,
      childName: childName || `child-${Date.now()}`,
      crossoverType: crossoverType || "weighted",
      status: "pending",
      // Auto-aprobar el lado del iniciador
      parentAApproved: ownsA,
      parentAApprovedAt: ownsA ? new Date() : null,
      parentBApproved: ownsB,
      parentBApprovedAt: ownsB ? new Date() : null,
      expiresInHours: 24,
    });

    // Si ambos padres son del mismo owner, auto-aprobar
    const autoApproved = ownsA && ownsB;

    return NextResponse.json({
      success: true,
      request: {
        id: breedingRequest.id,
        status: autoApproved ? "approved" : "pending",
        parentA: { id: parentA.id, name: parentA.name, approved: ownsA },
        parentB: { id: parentB.id, name: parentB.name, approved: ownsB },
        childName: breedingRequest.childName,
        expiresAt: breedingRequest.expiresAt,
      },
      autoApproved,
      message: autoApproved
        ? "Both parents are yours. Ready to execute breeding."
        : "Waiting for other parent owner approval.",
    });
  } catch (error) {
    console.error("Create breeding request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
