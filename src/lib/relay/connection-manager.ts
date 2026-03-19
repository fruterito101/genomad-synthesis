/**
 * Connection Manager
 * 
 * Tracks all connected OpenClaw instances and their agents.
 * Works with any transport (WebSocket, Pusher, polling).
 */

import { RelayConnection, RELAY_CONFIG, RelayEvent } from './types';

// In-memory store (consider Redis for production scaling)
const connections = new Map<string, RelayConnection>();
const userConnections = new Map<string, Set<string>>(); // userId -> connectionIds
const agentConnections = new Map<string, string>(); // agentId -> connectionId

// Event listeners
type EventListener = (event: RelayEvent) => void;
const eventListeners: EventListener[] = [];

/**
 * Register a new connection
 */
export function registerConnection(
  connectionId: string,
  userId: string,
  metadata?: RelayConnection['metadata']
): RelayConnection | null {
  // Check user connection limit
  const userConns = userConnections.get(userId) || new Set();
  if (userConns.size >= RELAY_CONFIG.MAX_CONNECTIONS_PER_USER) {
    console.warn(`[Relay] User ${userId} exceeded max connections`);
    return null;
  }

  const connection: RelayConnection = {
    id: connectionId,
    userId,
    connectedAt: new Date(),
    lastHeartbeat: new Date(),
    agents: [],
    metadata,
  };

  connections.set(connectionId, connection);
  userConns.add(connectionId);
  userConnections.set(userId, userConns);

  emitEvent({ event: 'connection', connection });
  console.log(`[Relay] Connection registered: ${connectionId} for user ${userId}`);

  return connection;
}

/**
 * Remove a connection
 */
export function removeConnection(connectionId: string): void {
  const connection = connections.get(connectionId);
  if (!connection) return;

  // Remove agent mappings
  for (const agentId of connection.agents) {
    agentConnections.delete(agentId);
    emitEvent({ event: 'agent-offline', agentId, userId: connection.userId });
  }

  // Remove from user connections
  const userConns = userConnections.get(connection.userId);
  if (userConns) {
    userConns.delete(connectionId);
    if (userConns.size === 0) {
      userConnections.delete(connection.userId);
    }
  }

  connections.delete(connectionId);
  emitEvent({ event: 'disconnection', connectionId, userId: connection.userId });
  console.log(`[Relay] Connection removed: ${connectionId}`);
}

/**
 * Update heartbeat for a connection
 */
export function updateHeartbeat(connectionId: string, agents?: string[]): boolean {
  const connection = connections.get(connectionId);
  if (!connection) return false;

  connection.lastHeartbeat = new Date();
  
  if (agents) {
    // Update agent list
    const oldAgents = new Set(connection.agents);
    const newAgents = new Set(agents);

    // Find new agents
    for (const agentId of newAgents) {
      if (!oldAgents.has(agentId)) {
        agentConnections.set(agentId, connectionId);
        emitEvent({ event: 'agent-online', agentId, userId: connection.userId });
      }
    }

    // Find removed agents
    for (const agentId of oldAgents) {
      if (!newAgents.has(agentId)) {
        agentConnections.delete(agentId);
        emitEvent({ event: 'agent-offline', agentId, userId: connection.userId });
      }
    }

    connection.agents = agents;
  }

  return true;
}

/**
 * Register an agent as running on a connection
 */
export function registerAgent(connectionId: string, agentId: string): boolean {
  const connection = connections.get(connectionId);
  if (!connection) return false;

  if (connection.agents.length >= RELAY_CONFIG.MAX_AGENTS_PER_CONNECTION) {
    console.warn(`[Relay] Connection ${connectionId} exceeded max agents`);
    return false;
  }

  if (!connection.agents.includes(agentId)) {
    connection.agents.push(agentId);
    agentConnections.set(agentId, connectionId);
    emitEvent({ event: 'agent-online', agentId, userId: connection.userId });
  }

  return true;
}

/**
 * Unregister an agent from a connection
 */
export function unregisterAgent(connectionId: string, agentId: string): boolean {
  const connection = connections.get(connectionId);
  if (!connection) return false;

  const index = connection.agents.indexOf(agentId);
  if (index > -1) {
    connection.agents.splice(index, 1);
    agentConnections.delete(agentId);
    emitEvent({ event: 'agent-offline', agentId, userId: connection.userId });
  }

  return true;
}

/**
 * Get connection by ID
 */
export function getConnection(connectionId: string): RelayConnection | undefined {
  return connections.get(connectionId);
}

/**
 * Get all connections for a user
 */
export function getUserConnections(userId: string): RelayConnection[] {
  const connIds = userConnections.get(userId);
  if (!connIds) return [];

  return Array.from(connIds)
    .map(id => connections.get(id))
    .filter((c): c is RelayConnection => c !== undefined);
}

/**
 * Get connection ID for an agent
 */
export function getAgentConnection(agentId: string): string | undefined {
  return agentConnections.get(agentId);
}

/**
 * Check if a user has any active connections
 */
export function isUserConnected(userId: string): boolean {
  const conns = userConnections.get(userId);
  return conns !== undefined && conns.size > 0;
}

/**
 * Check if an agent is online
 */
export function isAgentOnline(agentId: string): boolean {
  return agentConnections.has(agentId);
}

/**
 * Get relay status
 */
export function getRelayStatus() {
  return {
    online: true,
    connections: connections.size,
    agents: agentConnections.size,
    users: userConnections.size,
  };
}

/**
 * Clean up stale connections (call periodically)
 */
export function cleanupStaleConnections(): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [connectionId, connection] of connections) {
    const lastHeartbeat = connection.lastHeartbeat.getTime();
    if (now - lastHeartbeat > RELAY_CONFIG.HEARTBEAT_TIMEOUT_MS) {
      console.log(`[Relay] Cleaning stale connection: ${connectionId}`);
      removeConnection(connectionId);
      cleaned++;
    }
  }

  return cleaned;
}

/**
 * Subscribe to relay events
 */
export function onRelayEvent(listener: EventListener): () => void {
  eventListeners.push(listener);
  return () => {
    const index = eventListeners.indexOf(listener);
    if (index > -1) eventListeners.splice(index, 1);
  };
}

function emitEvent(event: RelayEvent): void {
  for (const listener of eventListeners) {
    try {
      listener(event);
    } catch (error) {
      console.error('[Relay] Event listener error:', error);
    }
  }
}

// Start cleanup interval
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const cleaned = cleanupStaleConnections();
    if (cleaned > 0) {
      console.log(`[Relay] Cleaned ${cleaned} stale connections`);
    }
  }, RELAY_CONFIG.HEARTBEAT_INTERVAL_MS);
}
