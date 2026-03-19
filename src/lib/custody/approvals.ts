// src/lib/custody/approvals.ts
// Sistema de aprobaciones para acciones que requieren consenso

import { getDb } from "@/lib/db/client";
import { actionApprovals, custodyShares } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { getAgentCustody, getUserCustodyShare } from "./index";

export type ActionType = "breed" | "rename" | "transfer" | "deactivate" | "delete";

export interface ActionApproval {
  id: string;
  agentId: string;
  actionType: ActionType;
  proposedBy: string;
  actionData: Record<string, any>;
  status: "pending" | "approved" | "rejected" | "expired";
  approvedBy: string[];
  rejectedBy: string[];
  requiredShare: number;
  currentApprovalShare: number;
  expiresAt: Date;
  createdAt: Date;
}

// Qué porcentaje se necesita para cada acción
const REQUIRED_SHARES: Record<ActionType, number> = {
  breed: 100,      // Todos deben aprobar
  rename: 100,     // Todos deben aprobar
  transfer: 100,   // Todos deben aprobar
  deactivate: 51,  // Mayoría simple
  delete: 100,     // Todos (pero no permitido si hay co-owners)
};

/**
 * Verifica si una acción necesita aprobación
 */
export async function needsApproval(
  agentId: string,
  actionType: ActionType,
  userId: string
): Promise<boolean> {
  const custody = await getAgentCustody(agentId);
  
  // Si no hay custody shares o solo hay uno con 100%, no necesita aprobación
  if (custody.length <= 1) {
    const userShare = await getUserCustodyShare(agentId, userId);
    return userShare < 100;
  }
  
  // Hay múltiples co-owners, necesita aprobación
  return true;
}

/**
 * Crea una solicitud de aprobación
 */
export async function createApprovalRequest(
  agentId: string,
  actionType: ActionType,
  proposedBy: string,
  actionData: Record<string, any> = {},
  expiresInHours: number = 48
): Promise<ActionApproval> {
  const db = getDb();
  
  // Verificar que el usuario es co-owner
  const userShare = await getUserCustodyShare(agentId, proposedBy);
  if (userShare <= 0) {
    throw new Error("Only co-owners can propose actions");
  }
  
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
  
  const [approval] = await db.insert(actionApprovals).values({
    agentId,
    actionType,
    proposedBy,
    actionData,
    status: "pending",
    approvedBy: [proposedBy], // El que propone auto-aprueba
    rejectedBy: [],
    requiredShare: REQUIRED_SHARES[actionType],
    expiresAt,
  }).returning();
  
  // Calcular aprobación actual
  const currentApprovalShare = userShare;
  
  return {
    ...approval,
    actionType: approval.actionType as ActionType,
    status: approval.status as ActionApproval["status"],
    approvedBy: approval.approvedBy as string[],
    rejectedBy: approval.rejectedBy as string[],
    actionData: approval.actionData as Record<string, any>,
    currentApprovalShare,
  };
}

/**
 * Aprobar una solicitud
 */
export async function approveAction(
  approvalId: string,
  userId: string
): Promise<{ success: boolean; approved: boolean; message: string }> {
  const db = getDb();
  
  // Obtener la solicitud
  const [approval] = await db
    .select()
    .from(actionApprovals)
    .where(eq(actionApprovals.id, approvalId))
    .limit(1);
  
  if (!approval) {
    return { success: false, approved: false, message: "Approval request not found" };
  }
  
  if (approval.status !== "pending") {
    return { success: false, approved: false, message: "Request already resolved" };
  }
  
  if (new Date() > approval.expiresAt) {
    await db.update(actionApprovals)
      .set({ status: "expired" })
      .where(eq(actionApprovals.id, approvalId));
    return { success: false, approved: false, message: "Request expired" };
  }
  
  // Verificar que es co-owner
  const userShare = await getUserCustodyShare(approval.agentId, userId);
  if (userShare <= 0) {
    return { success: false, approved: false, message: "Only co-owners can approve" };
  }
  
  const approvedBy = approval.approvedBy as string[];
  if (approvedBy.includes(userId)) {
    return { success: false, approved: false, message: "Already approved" };
  }
  
  // Agregar aprobación
  const newApprovedBy = [...approvedBy, userId];
  
  // Calcular porcentaje total aprobado
  let totalApproved = 0;
  for (const ownerId of newApprovedBy) {
    const share = await getUserCustodyShare(approval.agentId, ownerId);
    totalApproved += share;
  }
  
  // Verificar si alcanza el umbral
  const isApproved = totalApproved >= approval.requiredShare;
  
  await db.update(actionApprovals)
    .set({
      approvedBy: newApprovedBy,
      status: isApproved ? "approved" : "pending",
      resolvedAt: isApproved ? new Date() : null,
    })
    .where(eq(actionApprovals.id, approvalId));
  
  return {
    success: true,
    approved: isApproved,
    message: isApproved 
      ? "Action approved! Ready to execute." 
      : `Approved (${totalApproved.toFixed(1)}% of ${approval.requiredShare}% required)`,
  };
}

/**
 * Rechazar una solicitud
 */
export async function rejectAction(
  approvalId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  const db = getDb();
  
  const [approval] = await db
    .select()
    .from(actionApprovals)
    .where(eq(actionApprovals.id, approvalId))
    .limit(1);
  
  if (!approval) {
    return { success: false, message: "Approval request not found" };
  }
  
  if (approval.status !== "pending") {
    return { success: false, message: "Request already resolved" };
  }
  
  // Verificar que es co-owner
  const userShare = await getUserCustodyShare(approval.agentId, userId);
  if (userShare <= 0) {
    return { success: false, message: "Only co-owners can reject" };
  }
  
  const rejectedBy = approval.rejectedBy as string[];
  
  // Un solo rechazo de cualquier co-owner cancela acciones que requieren 100%
  const shouldReject = approval.requiredShare === 100;
  
  await db.update(actionApprovals)
    .set({
      rejectedBy: [...rejectedBy, userId],
      status: shouldReject ? "rejected" : "pending",
      resolvedAt: shouldReject ? new Date() : null,
    })
    .where(eq(actionApprovals.id, approvalId));
  
  return {
    success: true,
    message: shouldReject 
      ? "Action rejected." 
      : "Rejection recorded.",
  };
}

/**
 * Obtener solicitudes pendientes para un usuario
 */
export async function getPendingApprovals(userId: string): Promise<ActionApproval[]> {
  const db = getDb();
  
  // Obtener agentes donde el usuario es co-owner
  const userCustody = await db
    .select({ agentId: custodyShares.agentId })
    .from(custodyShares)
    .where(eq(custodyShares.ownerId, userId));
  
  const agentIds = userCustody.map(c => c.agentId);
  
  if (agentIds.length === 0) return [];
  
  // Obtener aprobaciones pendientes para esos agentes
  const pendingApprovals = await db
    .select()
    .from(actionApprovals)
    .where(
      and(
        eq(actionApprovals.status, "pending"),
        gt(actionApprovals.expiresAt, new Date())
      )
    );
  
  // Filtrar por agentes del usuario y calcular share actual
  const filtered: ActionApproval[] = [];
  for (const approval of pendingApprovals) {
    if (!agentIds.includes(approval.agentId)) continue;
    
    const approvedBy = approval.approvedBy as string[];
    let currentApprovalShare = 0;
    for (const ownerId of approvedBy) {
      currentApprovalShare += await getUserCustodyShare(approval.agentId, ownerId);
    }
    
    filtered.push({
      ...approval,
      actionType: approval.actionType as ActionType,
      status: approval.status as ActionApproval["status"],
      approvedBy: approvedBy,
      rejectedBy: approval.rejectedBy as string[],
      actionData: approval.actionData as Record<string, any>,
      currentApprovalShare,
    });
  }
  
  return filtered;
}

/**
 * Obtener una solicitud por ID
 */
export async function getApprovalById(approvalId: string): Promise<ActionApproval | null> {
  const db = getDb();
  
  const [approval] = await db
    .select()
    .from(actionApprovals)
    .where(eq(actionApprovals.id, approvalId))
    .limit(1);
  
  if (!approval) return null;
  
  const approvedBy = approval.approvedBy as string[];
  let currentApprovalShare = 0;
  for (const ownerId of approvedBy) {
    currentApprovalShare += await getUserCustodyShare(approval.agentId, ownerId);
  }
  
  return {
    ...approval,
    actionType: approval.actionType as ActionType,
    status: approval.status as ActionApproval["status"],
    approvedBy,
    rejectedBy: approval.rejectedBy as string[],
    actionData: approval.actionData as Record<string, any>,
    currentApprovalShare,
  };
}
