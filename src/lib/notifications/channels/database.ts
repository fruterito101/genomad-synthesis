// src/lib/notifications/channels/database.ts
// Canal de persistencia en base de datos

import { getDb } from "@/lib/db/client";
import { notifications } from "@/lib/db/schema";
import { eq, desc, and, inArray, sql } from "drizzle-orm";
import type {
  Notification,
  NotificationFilters,
  NotificationResponse,
  CreateNotificationParams,
} from "../types";

/**
 * Guardar notificación en DB
 */
export async function saveNotification(
  params: CreateNotificationParams
): Promise<Notification> {
  const db = getDb();

  const [notification] = await db
    .insert(notifications)
    .values({
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      metadata: params.metadata || {},
    })
    .returning();

  return notification as Notification;
}

/**
 * Obtener notificaciones con filtros
 */
export async function getNotifications(
  filters: NotificationFilters
): Promise<NotificationResponse> {
  const db = getDb();
  const { userId, types, unreadOnly, limit = 20, offset = 0 } = filters;

  // Build conditions
  const conditions = [eq(notifications.userId, userId)];

  if (unreadOnly) {
    conditions.push(eq(notifications.read, false));
  }

  if (types && types.length > 0) {
    conditions.push(inArray(notifications.type, types));
  }

  // Get notifications
  const notificationsList = await db
    .select()
    .from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);

  // Get total count
  const [{ count: total }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notifications)
    .where(and(...conditions));

  // Get unread count (always for userId)
  const [{ count: unreadCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));

  return {
    notifications: notificationsList as Notification[],
    unreadCount,
    total,
    hasMore: offset + limit < total,
  };
}

/**
 * Obtener una notificación por ID
 */
export async function getNotificationById(
  notificationId: string,
  userId: string
): Promise<Notification | null> {
  const db = getDb();

  const [notification] = await db
    .select()
    .from(notifications)
    .where(
      and(eq(notifications.id, notificationId), eq(notifications.userId, userId))
    )
    .limit(1);

  return (notification as Notification) || null;
}

/**
 * Marcar notificación como leída
 */
export async function markAsRead(
  notificationId: string,
  userId: string
): Promise<boolean> {
  const db = getDb();

  const result = await db
    .update(notifications)
    .set({ read: true, readAt: new Date() })
    .where(
      and(eq(notifications.id, notificationId), eq(notifications.userId, userId))
    )
    .returning({ id: notifications.id });

  return result.length > 0;
}

/**
 * Marcar todas como leídas
 */
export async function markAllAsRead(userId: string): Promise<number> {
  const db = getDb();

  const result = await db
    .update(notifications)
    .set({ read: true, readAt: new Date() })
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))
    .returning({ id: notifications.id });

  return result.length;
}

/**
 * Eliminar notificaciones antiguas (cleanup)
 */
export async function deleteOldNotifications(
  userId: string,
  olderThanDays: number = 30
): Promise<number> {
  const db = getDb();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const result = await db
    .delete(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.read, true),
        sql`${notifications.createdAt} < ${cutoffDate}`
      )
    )
    .returning({ id: notifications.id });

  return result.length;
}

/**
 * Contar notificaciones por tipo
 */
export async function countByType(
  userId: string
): Promise<Record<string, number>> {
  const db = getDb();

  const counts = await db
    .select({
      type: notifications.type,
      count: sql<number>`count(*)::int`,
    })
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .groupBy(notifications.type);

  return counts.reduce(
    (acc, { type, count }) => {
      acc[type] = count;
      return acc;
    },
    {} as Record<string, number>
  );
}
