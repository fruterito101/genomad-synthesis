// src/app/api/breeding/requests/route.ts
// Ticket 7.8: Lista breeding requests del usuario

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { getUserByPrivyId } from "@/lib/db";
import { getDb } from "@/lib/db/client";
import { breedingRequests, agents } from "@/lib/db/schema";
import { eq, or, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // 1. Verificar auth
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    // 2. Obtener usuario
    const user = auth.privyId ? await getUserByPrivyId(auth.privyId) : null;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Obtener requests donde el usuario está involucrado
    const db = getDb();
    const requests = await db
      .select()
      .from(breedingRequests)
      .where(
        or(
          eq(breedingRequests.initiatorId, user.id),
          eq(breedingRequests.parentAOwnerId, user.id),
          eq(breedingRequests.parentBOwnerId, user.id)
        )
      )
      .orderBy(desc(breedingRequests.createdAt));

    // 4. Enriquecer con info de agentes
    const enrichedRequests = await Promise.all(
      requests.map(async (req) => {
        const [parentA] = await db
          .select({ id: agents.id, name: agents.name })
          .from(agents)
          .where(eq(agents.id, req.parentAId))
          .limit(1);

        const [parentB] = await db
          .select({ id: agents.id, name: agents.name })
          .from(agents)
          .where(eq(agents.id, req.parentBId))
          .limit(1);

        return {
          id: req.id,
          status: req.status,
          parentA: parentA ? { ...parentA, approved: req.parentAApproved } : null,
          parentB: parentB ? { ...parentB, approved: req.parentBApproved } : null,
          childName: req.childName,
          childId: req.childId,
          isInitiator: req.initiatorId === user.id,
          needsMyApproval:
            (req.parentAOwnerId === user.id && !req.parentAApproved) ||
            (req.parentBOwnerId === user.id && !req.parentBApproved),
          createdAt: req.createdAt,
          expiresAt: req.expiresAt,
          expired: req.expiresAt < new Date(),
        };
      })
    );

    // 5. Agrupar por status
    const pending = enrichedRequests.filter(
      (r) => r.status === "pending" && !r.expired
    );
    const approved = enrichedRequests.filter((r) => r.status === "approved");
    const executed = enrichedRequests.filter((r) => r.status === "executed");
    const expired = enrichedRequests.filter(
      (r) => r.expired && r.status === "pending"
    );

    return NextResponse.json({
      pending,
      approved,
      executed,
      expired,
      stats: {
        total: enrichedRequests.length,
        pending: pending.length,
        approved: approved.length,
        executed: executed.length,
        needsAction: pending.filter((r) => r.needsMyApproval).length,
      },
    });
  } catch (error) {
    console.error("Get breeding requests error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
