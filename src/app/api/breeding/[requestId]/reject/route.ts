// src/app/api/breeding/[requestId]/reject/route.ts
// Rechazar breeding request

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { getUserByPrivyId, getBreedingRequestById } from "@/lib/db";
import { getDb } from "@/lib/db/client";
import { breedingRequests } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notifyBreedingRejected } from "@/lib/notifications";

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

    // 4. Verificar que el usuario es owner de algún padre
    const isParentAOwner = breedingRequest.parentAOwnerId === user.id;
    const isParentBOwner = breedingRequest.parentBOwnerId === user.id;

    if (!isParentAOwner && !isParentBOwner) {
      return NextResponse.json(
        { error: "You are not an owner of any parent in this request" },
        { status: 403 }
      );
    }

    // 5. Actualizar status a rejected
    const db = getDb();
    await db
      .update(breedingRequests)
      .set({ status: "rejected" })
      .where(eq(breedingRequests.id, requestId));

    // 6. Notificar al iniciador
    const rejecterName = user.displayName || user.telegramUsername || "Un usuario";
    await notifyBreedingRejected(
      breedingRequest.initiatorId,
      rejecterName,
      requestId
    );

    return NextResponse.json({
      success: true,
      message: "Breeding request rejected",
    });
  } catch (error) {
    console.error("Reject breeding error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
