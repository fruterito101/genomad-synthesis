// src/lib/notifications/types.ts
// Tipos del sistema de notificaciones Genomad

/**
 * Tipos de notificación soportados
 */
export type NotificationType =
  | "breeding_request"      // Solicitud de breeding recibida
  | "breeding_approved"     // Breeding aprobado por el otro dueño
  | "breeding_rejected"     // Breeding rechazado
  | "breeding_completed"    // Hijo nacido exitosamente
  | "agent_linked"          // Agente vinculado exitosamente
  | "agent_activated"       // Agente activado on-chain
  | "agent_transferred"     // Agente transferido a nuevo dueño
  | "custody_changed"       // Cambio en custody shares
  | "system";               // Notificación del sistema

/**
 * Prioridad de la notificación
 */
export type NotificationPriority = "low" | "normal" | "high" | "urgent";

/**
 * Canal de entrega
 */
export type NotificationChannel = "database" | "telegram" | "email" | "sse";

/**
 * Estado de entrega por canal
 */
export interface DeliveryStatus {
  channel: NotificationChannel;
  delivered: boolean;
  deliveredAt?: Date;
  error?: string;
}

/**
 * Notificación base (DB schema)
 */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata: NotificationMetadata;
  read: boolean;
  readAt: Date | null;
  createdAt: Date;
}

/**
 * Metadata específica por tipo de notificación
 */
export interface NotificationMetadata {
  // Breeding related
  requestId?: string;
  agentId?: string;
  agentName?: string;
  childAgentId?: string;
  childName?: string;
  
  // User related
  initiatorId?: string;
  initiatorName?: string;
  
  // Transfer related
  previousOwnerId?: string;
  newOwnerId?: string;
  
  // Custody related
  oldCustody?: number;
  newCustody?: number;
  
  // On-chain
  tokenId?: number;
  txHash?: string;
  
  // Generic
  [key: string]: unknown;
}

/**
 * Params para crear notificación
 */
export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  metadata?: NotificationMetadata;
  channels?: NotificationChannel[];
}

/**
 * Evento SSE para realtime
 */
export interface SSENotificationEvent {
  type: "notification";
  data: Notification;
}

/**
 * Filtros para obtener notificaciones
 */
export interface NotificationFilters {
  userId: string;
  types?: NotificationType[];
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Respuesta paginada
 */
export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
  hasMore: boolean;
}

/**
 * Template de notificación (para helpers)
 */
export interface NotificationTemplate {
  type: NotificationType;
  titleTemplate: string;
  messageTemplate: string;
  priority: NotificationPriority;
}

/**
 * Templates predefinidos
 */
export const NOTIFICATION_TEMPLATES: Record<NotificationType, Omit<NotificationTemplate, "type">> = {
  breeding_request: {
    titleTemplate: "Nueva Solicitud de Breeding 🧬",
    messageTemplate: "{initiatorName} quiere cruzar su agente con tu agente \"{agentName}\". Tienes 24 horas para responder.",
    priority: "high",
  },
  breeding_approved: {
    titleTemplate: "Breeding Aprobado ✅",
    messageTemplate: "{approverName} aprobó tu solicitud de breeding. ¡Ya puedes ejecutar el breeding!",
    priority: "normal",
  },
  breeding_rejected: {
    titleTemplate: "Breeding Rechazado ❌",
    messageTemplate: "{rejecterName} rechazó tu solicitud de breeding.",
    priority: "normal",
  },
  breeding_completed: {
    titleTemplate: "¡Nació un Nuevo Agente! 🎉",
    messageTemplate: "El breeding fue exitoso. Tu nuevo agente \"{childName}\" está listo.",
    priority: "high",
  },
  agent_linked: {
    titleTemplate: "Agente Vinculado 🔗",
    messageTemplate: "Tu agente \"{agentName}\" ha sido vinculado exitosamente a tu cuenta.",
    priority: "normal",
  },
  agent_activated: {
    titleTemplate: "Agente Activado On-Chain ⛓️",
    messageTemplate: "Tu agente \"{agentName}\" ahora está activo en Monad. Token ID: {tokenId}",
    priority: "high",
  },
  agent_transferred: {
    titleTemplate: "Agente Transferido 📤",
    messageTemplate: "Tu agente \"{agentName}\" fue transferido a un nuevo dueño.",
    priority: "high",
  },
  custody_changed: {
    titleTemplate: "Cambio de Custodia 📊",
    messageTemplate: "Tu custodia sobre \"{agentName}\" cambió de {oldCustody}% a {newCustody}%.",
    priority: "normal",
  },
  system: {
    titleTemplate: "Sistema",
    messageTemplate: "{message}",
    priority: "low",
  },
};
