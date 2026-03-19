// src/lib/notifications/index.ts
// Sistema de notificaciones para Genomad

import { getDb } from "@/lib/db/client";
import { notifications, users } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";

export type NotificationType = 
  | "breeding_request"
  | "breeding_approved"
  | "breeding_rejected"
  | "breeding_completed"
  | "agent_linked"
  | "system";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export async function createNotification(params: CreateNotificationParams) {
  const db = getDb();
  
  const [notification] = await db.insert(notifications).values({
    userId: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    metadata: params.metadata || {},
  }).returning();
  
  // Intentar enviar via Telegram si el usuario tiene telegramId
  try {
    await sendTelegramNotification(params.userId, params.title, params.message);
  } catch (e) {
    console.log("Telegram notification failed (optional):", e);
  }
  
  return notification;
}

export async function getNotifications(userId: string, limit = 20) {
  const db = getDb();
  
  return db.select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadCount(userId: string) {
  const db = getDb();
  
  const result = await db.select()
    .from(notifications)
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.read, false)
    ));
  
  return result.length;
}

export async function markAsRead(notificationId: string, userId: string) {
  const db = getDb();
  
  await db.update(notifications)
    .set({ read: true, readAt: new Date() })
    .where(and(
      eq(notifications.id, notificationId),
      eq(notifications.userId, userId)
    ));
}

export async function markAllAsRead(userId: string) {
  const db = getDb();
  
  await db.update(notifications)
    .set({ read: true, readAt: new Date() })
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.read, false)
    ));
}

// Telegram notification (opcional - requiere TELEGRAM_BOT_TOKEN)
async function sendTelegramNotification(userId: string, title: string, message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;
  
  const db = getDb();
  const [user] = await db.select()
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

// Helpers para crear notificaciones específicas
export async function notifyBreedingRequest(
  targetUserId: string,
  initiatorName: string,
  agentName: string,
  requestId: string
) {
  return createNotification({
    userId: targetUserId,
    type: "breeding_request",
    title: "Nueva Solicitud de Breeding",
    message: `${initiatorName} quiere cruzar su agente con tu agente "${agentName}". Tienes 24 horas para responder.`,
    metadata: { requestId, agentName },
  });
}

export async function notifyBreedingApproved(
  targetUserId: string,
  approverName: string,
  requestId: string
) {
  return createNotification({
    userId: targetUserId,
    type: "breeding_approved",
    title: "Breeding Aprobado ✅",
    message: `${approverName} aprobó tu solicitud de breeding. ¡Ya puedes ejecutar el breeding!`,
    metadata: { requestId },
  });
}

export async function notifyBreedingRejected(
  targetUserId: string,
  rejecterName: string,
  requestId: string
) {
  return createNotification({
    userId: targetUserId,
    type: "breeding_rejected",
    title: "Breeding Rechazado ❌",
    message: `${rejecterName} rechazó tu solicitud de breeding.`,
    metadata: { requestId },
  });
}
