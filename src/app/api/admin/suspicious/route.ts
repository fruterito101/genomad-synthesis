// src/app/api/admin/suspicious/route.ts
// Administración de agentes sospechosos

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { agents, users, agentAuditLog } from "@/lib/db/schema";
import { eq, desc, sql, and, isNull } from "drizzle-orm";

// GET - Listar agentes sospechosos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // pending | reviewed | all
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    
    const db = getDb();
    
    let conditions = [eq(agents.isSuspicious, true)];
    
    if (status === "pending") {
      conditions.push(isNull(agents.reviewedAt));
    } else if (status === "reviewed") {
      conditions.push(sql`${agents.reviewedAt} IS NOT NULL`);
    }
    
    const suspiciousAgents = await db
      .select({
        id: agents.id,
        name: agents.name,
        fitness: agents.fitness,
        traits: agents.traits,
        suspiciousReason: agents.suspiciousReason,
        flaggedAt: agents.flaggedAt,
        reviewedAt: agents.reviewedAt,
        reviewedBy: agents.reviewedBy,
        createdAt: agents.createdAt,
        ownerId: agents.ownerId,
      })
      .from(agents)
      .where(and(...conditions))
      .orderBy(desc(agents.flaggedAt))
      .limit(limit);
    
    // Obtener info de owners
    const ownerIds = [...new Set(suspiciousAgents.map(a => a.ownerId))];
    let ownersMap: Record<string, any> = {};
    
    if (ownerIds.length > 0) {
      const owners = await db
        .select({
          id: users.id,
          telegramUsername: users.telegramUsername,
          walletAddress: users.walletAddress,
        })
        .from(users)
        .where(sql`${users.id} IN (${sql.join(ownerIds.map(id => sql`${id}`), sql`, `)})`);
      
      for (const o of owners) {
        ownersMap[o.id] = o;
      }
    }
    
    const result = suspiciousAgents.map(a => ({
      ...a,
      owner: ownersMap[a.ownerId] || null,
    }));
    
    // Stats
    const [stats] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        pending: sql<number>`COUNT(*) FILTER (WHERE reviewed_at IS NULL)`,
        reviewed: sql<number>`COUNT(*) FILTER (WHERE reviewed_at IS NOT NULL)`,
      })
      .from(agents)
      .where(eq(agents.isSuspicious, true));
    
    return NextResponse.json({
      agents: result,
      stats: {
        total: Number(stats?.total || 0),
        pending: Number(stats?.pending || 0),
        reviewed: Number(stats?.reviewed || 0),
      },
    });
    
  } catch (error) {
    console.error("List suspicious error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// POST - Revisar un agente sospechoso
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, action, reviewerId, notes } = body;
    
    if (!agentId || !action) {
      return NextResponse.json({ 
        error: "agentId and action required" 
      }, { status: 400 });
    }
    
    if (!['approve', 'reject', 'delete'].includes(action)) {
      return NextResponse.json({ 
        error: "action must be: approve, reject, or delete" 
      }, { status: 400 });
    }
    
    const db = getDb();
    
    // Verificar que el agente existe
    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, agentId))
      .limit(1);
    
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }
    
    if (action === "delete") {
      // Eliminar agente
      await db.delete(agents).where(eq(agents.id, agentId));
      
      // Log
      await db.insert(agentAuditLog).values({
        agentId,
        action: "DELETE",
        oldData: agent,
        changedBy: reviewerId || null,
        reason: `Deleted: ${notes || "Suspicious agent removed"}`,
      });
      
      return NextResponse.json({ 
        success: true, 
        message: "Agent deleted",
        action: "deleted",
      });
    }
    
    // Approve o Reject
    const approved = action === "approve";
    
    await db
      .update(agents)
      .set({
        isSuspicious: !approved, // Si aprueba, ya no es sospechoso
        reviewedAt: new Date(),
        reviewedBy: reviewerId || null,
        suspiciousReason: approved 
          ? null 
          : (agent.suspiciousReason || "") + ` | Reviewed: ${notes || "Rejected"}`,
      })
      .where(eq(agents.id, agentId));
    
    // Log
    await db.insert(agentAuditLog).values({
      agentId,
      action: "REVIEW",
      oldData: { isSuspicious: agent.isSuspicious },
      newData: { isSuspicious: !approved, reviewedAt: new Date() },
      changedBy: reviewerId || null,
      reason: `${approved ? "APPROVED" : "REJECTED"}: ${notes || ""}`,
    });
    
    return NextResponse.json({ 
      success: true, 
      message: approved ? "Agent approved" : "Agent rejected",
      action: approved ? "approved" : "rejected",
    });
    
  } catch (error) {
    console.error("Review suspicious error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
