// src/app/api/approvals/route.ts
// Listar y crear solicitudes de aprobación

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { getUserByPrivyId } from "@/lib/db";
import { getDb } from "@/lib/db/client";
import { agents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { 
  getPendingApprovals, 
  createApprovalRequest, 
  needsApproval,
  ActionType 
} from "@/lib/custody/approvals";

// GET - Obtener solicitudes pendientes
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const user = auth.privyId ? await getUserByPrivyId(auth.privyId) : null;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const pending = await getPendingApprovals(user.id);

    // Enriquecer con info del agente
    const db = getDb();
    const enriched = await Promise.all(pending.map(async (p) => {
      const [agent] = await db.select().from(agents).where(eq(agents.id, p.agentId)).limit(1);
      return {
        ...p,
        agent: agent ? {
          id: agent.id,
          name: agent.name,
          fitness: agent.fitness,
          generation: agent.generation,
        } : null,
        userHasApproved: p.approvedBy.includes(user.id),
        userHasRejected: p.rejectedBy.includes(user.id),
      };
    }));

    return NextResponse.json({
      pending: enriched,
      count: enriched.length,
    });
  } catch (error) {
    console.error("Get approvals error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Crear solicitud de aprobación
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const user = auth.privyId ? await getUserByPrivyId(auth.privyId) : null;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { agentId, actionType, actionData } = body as {
      agentId: string;
      actionType: ActionType;
      actionData?: Record<string, any>;
    };

    if (!agentId || !actionType) {
      return NextResponse.json(
        { error: "agentId and actionType are required" },
        { status: 400 }
      );
    }

    // Verificar si necesita aprobación
    const needs = await needsApproval(agentId, actionType, user.id);
    if (!needs) {
      return NextResponse.json({
        needsApproval: false,
        message: "You have full ownership. No approval needed.",
      });
    }

    // Crear solicitud
    const approval = await createApprovalRequest(
      agentId,
      actionType,
      user.id,
      actionData || {}
    );

    return NextResponse.json({
      success: true,
      needsApproval: true,
      approval,
      message: "Approval request created. Waiting for co-owners.",
    });
  } catch (error: any) {
    console.error("Create approval error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
