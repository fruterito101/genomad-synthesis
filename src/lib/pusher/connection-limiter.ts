/**
 * Connection Limiter
 * 
 * Manages Pusher connection limits:
 * - Max 99 connections (leave 1 buffer)
 * - Auto-disconnect after 30min inactivity
 * - Tracks active connections
 */

// Config
export const CONNECTION_CONFIG = {
  MAX_CONNECTIONS: 99,          // Leave 1 buffer from Pusher's 100 limit
  INACTIVITY_TIMEOUT_MS: 30 * 60 * 1000,  // 30 minutes
  CLEANUP_INTERVAL_MS: 5 * 60 * 1000,     // Check every 5 minutes
} as const;

// In-memory tracking
interface ActiveConnection {
  odId: string;
  socketId: string;
  connectedAt: Date;
  lastActivity: Date;
}

const activeConnections = new Map<string, ActiveConnection>();

/**
 * Check if a new connection can be accepted
 */
export async function canAcceptConnection(): Promise<{
  allowed: boolean;
  currentCount: number;
  message?: string;
}> {
  await cleanupStaleConnections();
  
  const currentCount = activeConnections.size;
  
  if (currentCount >= CONNECTION_CONFIG.MAX_CONNECTIONS) {
    return {
      allowed: false,
      currentCount,
      message: 'Hay muchos usuarios usando la plataforma en este momento. Por favor espera unos minutos e intenta de nuevo.',
    };
  }
  
  return {
    allowed: true,
    currentCount,
  };
}

/**
 * Register a new connection
 */
export function registerConnection(userId: string, socketId: string): boolean {
  // Check if already connected (reconnect case)
  if (activeConnections.has(userId)) {
    // Update existing connection
    const conn = activeConnections.get(userId)!;
    conn.socketId = socketId;
    conn.lastActivity = new Date();
    console.log(`[Limiter] Updated connection for ${userId}`);
    return true;
  }
  
  // Check limit
  if (activeConnections.size >= CONNECTION_CONFIG.MAX_CONNECTIONS) {
    console.warn(`[Limiter] Rejected connection for ${userId} - at capacity`);
    return false;
  }
  
  // Register new connection
  activeConnections.set(userId, {
    odId: userId,
    socketId,
    connectedAt: new Date(),
    lastActivity: new Date(),
  });
  
  console.log(`[Limiter] Registered connection for ${userId} (${activeConnections.size}/${CONNECTION_CONFIG.MAX_CONNECTIONS})`);
  return true;
}

/**
 * Update last activity time (call on user actions)
 */
export function updateActivity(userId: string): void {
  const conn = activeConnections.get(userId);
  if (conn) {
    conn.lastActivity = new Date();
  }
}

/**
 * Remove a connection (on disconnect or tab close)
 */
export function removeConnection(userId: string): void {
  if (activeConnections.delete(userId)) {
    console.log(`[Limiter] Removed connection for ${userId} (${activeConnections.size}/${CONNECTION_CONFIG.MAX_CONNECTIONS})`);
  }
}

/**
 * Get connection info
 */
export function getConnectionInfo(userId: string): ActiveConnection | undefined {
  return activeConnections.get(userId);
}

/**
 * Get current stats
 */
export function getConnectionStats(): {
  current: number;
  max: number;
  available: number;
  connections: Array<{ odId: string; connectedAt: Date; lastActivity: Date }>;
} {
  const connections = Array.from(activeConnections.values()).map(c => ({
    odId: c.odId,
    connectedAt: c.connectedAt,
    lastActivity: c.lastActivity,
  }));
  
  return {
    current: activeConnections.size,
    max: CONNECTION_CONFIG.MAX_CONNECTIONS,
    available: CONNECTION_CONFIG.MAX_CONNECTIONS - activeConnections.size,
    connections,
  };
}

/**
 * Check for inactive connections and remove them
 */
export async function cleanupStaleConnections(): Promise<number> {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [odId, conn] of activeConnections) {
    const inactiveMs = now - conn.lastActivity.getTime();
    
    if (inactiveMs > CONNECTION_CONFIG.INACTIVITY_TIMEOUT_MS) {
      activeConnections.delete(odId);
      cleaned++;
      console.log(`[Limiter] Removed inactive connection: ${odId} (inactive ${Math.floor(inactiveMs / 60000)}min)`);
    }
  }
  
  if (cleaned > 0) {
    console.log(`[Limiter] Cleaned ${cleaned} inactive connections`);
  }
  
  return cleaned;
}

/**
 * Get users that should be disconnected due to inactivity
 */
export function getInactiveUsers(): string[] {
  const now = Date.now();
  const inactive: string[] = [];
  
  for (const [odId, conn] of activeConnections) {
    const inactiveMs = now - conn.lastActivity.getTime();
    if (inactiveMs > CONNECTION_CONFIG.INACTIVITY_TIMEOUT_MS) {
      inactive.push(odId);
    }
  }
  
  return inactive;
}

// Start cleanup interval
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cleanupStaleConnections().catch(console.error);
  }, CONNECTION_CONFIG.CLEANUP_INTERVAL_MS);
}
