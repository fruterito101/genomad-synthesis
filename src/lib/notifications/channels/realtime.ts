// src/lib/notifications/channels/realtime.ts
// Canal de notificaciones en tiempo real via Server-Sent Events (SSE)
// Vercel-compatible (no WebSocket persistente)

import type { Notification, SSENotificationEvent } from "../types";

/**
 * In-memory store para SSE connections
 * En producción con múltiples instancias, usar Redis pub/sub
 */
interface SSEConnection {
  userId: string;
  controller: ReadableStreamDefaultController;
  lastPing: number;
}

// Map de userId -> array de conexiones (un user puede tener múltiples tabs)
const connections = new Map<string, SSEConnection[]>();

/**
 * Crear stream SSE para un usuario
 */
export function createSSEStream(userId: string): ReadableStream {
  return new ReadableStream({
    start(controller) {
      // Registrar conexión
      const connection: SSEConnection = {
        userId,
        controller,
        lastPing: Date.now(),
      };

      const userConnections = connections.get(userId) || [];
      userConnections.push(connection);
      connections.set(userId, userConnections);

      // Enviar evento de conexión
      const connectEvent = `event: connected\ndata: ${JSON.stringify({ userId, timestamp: Date.now() })}\n\n`;
      controller.enqueue(new TextEncoder().encode(connectEvent));

      // Heartbeat cada 30s para mantener conexión viva
      const heartbeatInterval = setInterval(() => {
        try {
          const ping = `event: ping\ndata: ${Date.now()}\n\n`;
          controller.enqueue(new TextEncoder().encode(ping));
          connection.lastPing = Date.now();
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 30000);

      // Cleanup cuando se cierre
      return () => {
        clearInterval(heartbeatInterval);
        removeConnection(userId, controller);
      };
    },
    cancel() {
      // El cliente cerró la conexión
    },
  });
}

/**
 * Remover conexión del store
 */
function removeConnection(
  userId: string,
  controller: ReadableStreamDefaultController
): void {
  const userConnections = connections.get(userId);
  if (!userConnections) return;

  const filtered = userConnections.filter((c) => c.controller !== controller);
  if (filtered.length === 0) {
    connections.delete(userId);
  } else {
    connections.set(userId, filtered);
  }
}

/**
 * Enviar notificación a un usuario via SSE
 */
export function sendSSENotification(
  userId: string,
  notification: Notification
): boolean {
  const userConnections = connections.get(userId);
  if (!userConnections || userConnections.length === 0) {
    return false; // No hay conexiones activas
  }

  const event: SSENotificationEvent = {
    type: "notification",
    data: notification,
  };

  const sseMessage = `event: notification\ndata: ${JSON.stringify(event)}\n\n`;
  const encoded = new TextEncoder().encode(sseMessage);

  let delivered = false;
  for (const connection of userConnections) {
    try {
      connection.controller.enqueue(encoded);
      delivered = true;
    } catch {
      // Conexión muerta, será limpiada en el próximo heartbeat
    }
  }

  return delivered;
}

/**
 * Broadcast a todos los usuarios conectados
 */
export function broadcastSSE(
  notification: Notification,
  userIds?: string[]
): number {
  let deliveredCount = 0;

  const targetUsers = userIds || Array.from(connections.keys());

  for (const userId of targetUsers) {
    if (sendSSENotification(userId, notification)) {
      deliveredCount++;
    }
  }

  return deliveredCount;
}

/**
 * Verificar si un usuario tiene conexiones activas
 */
export function isUserConnected(userId: string): boolean {
  const userConnections = connections.get(userId);
  return userConnections !== undefined && userConnections.length > 0;
}

/**
 * Obtener estadísticas de conexiones
 */
export function getConnectionStats(): {
  totalUsers: number;
  totalConnections: number;
  users: string[];
} {
  let totalConnections = 0;
  const users: string[] = [];

  for (const [userId, conns] of connections.entries()) {
    users.push(userId);
    totalConnections += conns.length;
  }

  return {
    totalUsers: users.length,
    totalConnections,
    users,
  };
}

/**
 * Limpiar conexiones inactivas (llamar periódicamente)
 */
export function cleanupStaleConnections(maxAgeMs: number = 120000): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [userId, userConnections] of connections.entries()) {
    const active = userConnections.filter((c) => {
      if (now - c.lastPing > maxAgeMs) {
        try {
          c.controller.close();
        } catch {
          // Ya cerrado
        }
        cleaned++;
        return false;
      }
      return true;
    });

    if (active.length === 0) {
      connections.delete(userId);
    } else {
      connections.set(userId, active);
    }
  }

  return cleaned;
}
