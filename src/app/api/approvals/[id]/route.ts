// src/app/api/approvals/[id]/route.ts
// Aprobar o rechazar una solicitud

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { getUserByPrivyId } from "@/lib/db";
import { approveAction, rejectAction, getApprovalById } from "@/lib/custody/approvals";

// GET - Obtener detalle de una solicitud
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const approval = await getApprovalById(id);
    if (!approval) {
      return NextResponse.json({ error: "Approval not found" }, { status: 404 });
    }

    return NextResponse.json({ approval });
  } catch (error) {
    console.error("Get approval error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Aprobar o rechazar
export async function POST(
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

    const body = await request.json();
    const { action } = body as { action: "approve" | "reject" };

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "action must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    let result;
    if (action === "approve") {
      result = await approveAction(id, user.id);
    } else {
      result = await rejectAction(id, user.id);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Approval action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
