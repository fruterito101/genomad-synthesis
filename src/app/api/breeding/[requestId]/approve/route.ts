// src/app/api/breeding/[requestId]/approve/route.ts
// Ticket 7.6: Aprobar breeding request

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { getUserByPrivyId, getBreedingRequestById, approveBreedingRequest } from "@/lib/db";

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

    // 4. Verificar que no esté expirado
    if (breedingRequest.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Breeding request has expired" },
        { status: 400 }
      );
    }

    // 5. Verificar que el usuario es owner de algún padre
    const isParentAOwner = breedingRequest.parentAOwnerId === user.id;
    const isParentBOwner = breedingRequest.parentBOwnerId === user.id;

    if (!isParentAOwner && !isParentBOwner) {
      return NextResponse.json(
        { error: "You are not an owner of any parent in this request" },
        { status: 403 }
      );
    }

    // 6. Determinar qué lado aprobar
    const asParent = isParentAOwner ? "A" : "B";

    // 7. Verificar que no esté ya aprobado por este lado
    if (asParent === "A" && breedingRequest.parentAApproved) {
      return NextResponse.json(
        { error: "Parent A already approved" },
        { status: 400 }
      );
    }
    if (asParent === "B" && breedingRequest.parentBApproved) {
      return NextResponse.json(
        { error: "Parent B already approved" },
        { status: 400 }
      );
    }

    // 8. Aprobar
    const updated = await approveBreedingRequest(requestId, asParent);

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to approve" },
        { status: 500 }
      );
    }

    const fullyApproved = updated.parentAApproved && updated.parentBApproved;

    return NextResponse.json({
      success: true,
      request: {
        id: updated.id,
        status: updated.status,
        parentAApproved: updated.parentAApproved,
        parentBApproved: updated.parentBApproved,
      },
      fullyApproved,
      message: fullyApproved
        ? "Both parents approved. Ready to execute breeding."
        : "Approved. Waiting for other parent.",
    });
  } catch (error) {
    console.error("Approve breeding error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
