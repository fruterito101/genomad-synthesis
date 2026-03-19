// src/app/api/breeding/check/route.ts
// Verificar si existe una solicitud de breeding aprobada entre dos agentes

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { getUserByPrivyId } from "@/lib/db";
import { getDb } from "@/lib/db/client";
import { breedingRequests } from "@/lib/db/schema";
import { eq, and, or, gt } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const user = auth.privyId ? await getUserByPrivyId(auth.privyId) : null;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const parentAId = searchParams.get("parentAId");
    const parentBId = searchParams.get("parentBId");

    if (!parentAId || !parentBId) {
      return NextResponse.json(
        { error: "parentAId and parentBId required" },
        { status: 400 }
      );
    }

    const db = getDb();
    
    // Buscar solicitud existente entre estos dos padres (en cualquier orden)
    const [existingRequest] = await db
      .select()
      .from(breedingRequests)
      .where(
        and(
          or(
            and(
              eq(breedingRequests.parentAId, parentAId),
              eq(breedingRequests.parentBId, parentBId)
            ),
            and(
              eq(breedingRequests.parentAId, parentBId),
              eq(breedingRequests.parentBId, parentAId)
            )
          ),
          // Solo solicitudes no expiradas
          gt(breedingRequests.expiresAt, new Date()),
          or(
            eq(breedingRequests.status, "pending"),
            eq(breedingRequests.status, "approved")
          )
        )
      )
      .limit(1);

    if (!existingRequest) {
      return NextResponse.json({
        exists: false,
        canBreed: false,
        needsRequest: true,
      });
    }

    const fullyApproved = existingRequest.parentAApproved && existingRequest.parentBApproved;

    return NextResponse.json({
      exists: true,
      requestId: existingRequest.id,
      status: existingRequest.status,
      parentAApproved: existingRequest.parentAApproved,
      parentBApproved: existingRequest.parentBApproved,
      fullyApproved,
      canBreed: fullyApproved,
      needsRequest: false,
      expiresAt: existingRequest.expiresAt,
    });
  } catch (error) {
    console.error("Check breeding error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
