// src/lib/notifications/index.ts
// Sistema de notificaciones para Genomad
// Ticket 3.5: Notification System Complete

import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Re-export types
export * from "./types";

// Re-export channels
export * from "./channels/database";
export * from "./channels/realtime";

import {
  saveNotification,
  getNotifications as dbGetNotifications,
  markAsRead as dbMarkAsRead,
  markAllAsRead as dbMarkAllAsRead,
} from "./channels/database";
import { sendSSENotification, isUserConnected } from "./channels/realtime";
import type {
  CreateNotificationParams,
  Notification,
  NotificationMetadata,
  NOTIFICATION_TEMPLATES,
} from "./types";

/**
 * Crear y distribuir notificación a todos los canales
 */
export async function createNotification(
  params: CreateNotificationParams
): Promise<Notification> {
  // 1. Guardar en DB (siempre)
  const notification = await saveNotification(params);

  // 2. Enviar via SSE si el usuario está conectado
  if (isUserConnected(params.userId)) {
    sendSSENotification(params.userId, notification);
  }

  // 3. Intentar enviar via Telegram (opcional)
  try {
    await sendTelegramNotification(
      params.userId,
      params.title,
      params.message
    );
  } catch (e) {
    // Telegram es opcional, no bloquea
    console.log("Telegram notification skipped:", e);
  }

  return notification;
}

/**
 * Obtener notificaciones del usuario
 */
export async function getNotifications(userId: string, limit = 20) {
  const result = await dbGetNotifications({ userId, limit });
  return result.notifications;
}

/**
 * Obtener conteo de no leídas
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const result = await dbGetNotifications({ userId, unreadOnly: true, limit: 0 });
  return result.unreadCount;
}

/**
 * Marcar como leída
 */
export async function markAsRead(
  notificationId: string,
  userId: string
): Promise<void> {
  await dbMarkAsRead(notificationId, userId);
}

/**
 * Marcar todas como leídas
 */
export async function markAllAsRead(userId: string): Promise<void> {
  await dbMarkAllAsRead(userId);
}

// ============================================
// Telegram Integration (optional)
// ============================================

async function sendTelegramNotification(
  userId: string,
  title: string,
  message: string
): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;

  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user?.telegramId) return;

  const text = `🧬 *${title}*\n\n${message}\n\n[Ver en Genomad](https://genomad.vercel.app/profile)`;

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: user.telegramId,
      text,
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    }),
  });
}

// ============================================
// Helper Functions for Specific Notifications
// ============================================

/**
 * Notificar solicitud de breeding recibida
 */
export async function notifyBreedingRequest(
  targetUserId: string,
  initiatorName: string,
  agentName: string,
  requestId: string
): Promise<Notification> {
  return createNotification({
    userId: targetUserId,
    type: "breeding_request",
    title: "Nueva Solicitud de Breeding 🧬",
    message: `${initiatorName} quiere cruzar su agente con tu agente "${agentName}". Tienes 24 horas para responder.`,
    priority: "high",
    metadata: { requestId, agentName, initiatorName },
  });
}

/**
 * Notificar breeding aprobado
 */
export async function notifyBreedingApproved(
  targetUserId: string,
  approverName: string,
  requestId: string
): Promise<Notification> {
  return createNotification({
    userId: targetUserId,
    type: "breeding_approved",
    title: "Breeding Aprobado ✅",
    message: `${approverName} aprobó tu solicitud de breeding. ¡Ya puedes ejecutar el breeding!`,
    metadata: { requestId, initiatorName: approverName },
  });
}

/**
 * Notificar breeding rechazado
 */
export async function notifyBreedingRejected(
  targetUserId: string,
  rejecterName: string,
  requestId: string
): Promise<Notification> {
  return createNotification({
    userId: targetUserId,
    type: "breeding_rejected",
    title: "Breeding Rechazado ❌",
    message: `${rejecterName} rechazó tu solicitud de breeding.`,
    metadata: { requestId, initiatorName: rejecterName },
  });
}

/**
 * Notificar breeding completado (hijo nacido)
 */
export async function notifyBreedingCompleted(
  targetUserId: string,
  childName: string,
  childAgentId: string,
  requestId: string
): Promise<Notification> {
  return createNotification({
    userId: targetUserId,
    type: "breeding_completed",
    title: "¡Nació un Nuevo Agente! 🎉",
    message: `El breeding fue exitoso. Tu nuevo agente "${childName}" está listo.`,
    priority: "high",
    metadata: { requestId, childName, childAgentId },
  });
}

/**
 * Notificar agente vinculado
 */
export async function notifyAgentLinked(
  targetUserId: string,
  agentName: string,
  agentId: string
): Promise<Notification> {
  return createNotification({
    userId: targetUserId,
    type: "agent_linked",
    title: "Agente Vinculado 🔗",
    message: `Tu agente "${agentName}" ha sido vinculado exitosamente a tu cuenta.`,
    metadata: { agentName, agentId },
  });
}

/**
 * Notificar agente activado on-chain
 */
export async function notifyAgentActivated(
  targetUserId: string,
  agentName: string,
  agentId: string,
  tokenId: number,
  txHash?: string
): Promise<Notification> {
  return createNotification({
    userId: targetUserId,
    type: "agent_activated",
    title: "Agente Activado On-Chain ⛓️",
    message: `Tu agente "${agentName}" ahora está activo en Base. Token ID: ${tokenId}`,
    priority: "high",
    metadata: { agentName, agentId, tokenId, txHash },
  });
}

/**
 * Notificar agente transferido
 */
export async function notifyAgentTransferred(
  previousOwnerId: string,
  newOwnerId: string,
  agentName: string,
  agentId: string
): Promise<void> {
  // Notificar al dueño anterior
  await createNotification({
    userId: previousOwnerId,
    type: "agent_transferred",
    title: "Agente Transferido 📤",
    message: `Tu agente "${agentName}" fue transferido a un nuevo dueño.`,
    priority: "high",
    metadata: { agentName, agentId, newOwnerId },
  });

  // Notificar al nuevo dueño
  await createNotification({
    userId: newOwnerId,
    type: "agent_transferred",
    title: "Nuevo Agente Recibido 📥",
    message: `Has recibido el agente "${agentName}" de un transfer.`,
    priority: "high",
    metadata: { agentName, agentId, previousOwnerId },
  });
}

/**
 * Notificar cambio de custody
 */
export async function notifyCustodyChanged(
  targetUserId: string,
  agentName: string,
  agentId: string,
  oldCustody: number,
  newCustody: number
): Promise<Notification> {
  const direction = newCustody > oldCustody ? "aumentó" : "disminuyó";
  return createNotification({
    userId: targetUserId,
    type: "custody_changed",
    title: "Cambio de Custodia 📊",
    message: `Tu custodia sobre "${agentName}" ${direction} de ${oldCustody}% a ${newCustody}%.`,
    metadata: { agentName, agentId, oldCustody, newCustody },
  });
}

/**
 * Notificación del sistema
 */
export async function notifySystem(
  targetUserId: string,
  title: string,
  message: string,
  metadata?: NotificationMetadata
): Promise<Notification> {
  return createNotification({
    userId: targetUserId,
    type: "system",
    title,
    message,
    priority: "low",
    metadata,
  });
}
