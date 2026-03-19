/**
 * Genomad Relay Protocol Types
 * 
 * Defines the message protocol between Genomad server and OpenClaw clients.
 * Designed to be transport-agnostic (WebSocket, Pusher, polling, etc.)
 */

// ============================================================================
// Connection Types
// ============================================================================

export interface RelayConnection {
  id: string;
  userId: string;
  connectedAt: Date;
  lastHeartbeat: Date;
  agents: string[]; // Agent IDs running on this connection
  metadata?: {
    openclawVersion?: string;
    platform?: string;
    hostname?: string;
  };
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// ============================================================================
// Client → Server Messages
// ============================================================================

export type ClientMessage =
  | ClientAuthMessage
  | ClientHeartbeatMessage
  | ClientAgentReadyMessage
  | ClientAgentStatusMessage
  | ClientErrorMessage;

export interface ClientAuthMessage {
  type: 'auth';
  token: string;      // Privy auth token
  userId: string;     // Privy user ID
  metadata?: {
    openclawVersion?: string;
    platform?: string;
    hostname?: string;
  };
}

export interface ClientHeartbeatMessage {
  type: 'heartbeat';
  timestamp: number;
  agents: string[];   // Currently running agent IDs
}

export interface ClientAgentReadyMessage {
  type: 'agent-ready';
  agentId: string;
  success: boolean;
  error?: string;
}

export interface ClientAgentStatusMessage {
  type: 'agent-status';
  agentId: string;
  status: 'online' | 'offline' | 'error';
  error?: string;
}

export interface ClientErrorMessage {
  type: 'error';
  code: string;
  message: string;
  agentId?: string;
}

// ============================================================================
// Server → Client Messages
// ============================================================================

export type ServerMessage =
  | ServerAuthResultMessage
  | ServerProvisionAgentMessage
  | ServerDeprovisionAgentMessage
  | ServerPingMessage
  | ServerErrorMessage
  | ServerAgentUpdateMessage;

export interface ServerAuthResultMessage {
  type: 'auth-ok' | 'auth-fail';
  message?: string;
  connectionId?: string;
}

export interface ServerProvisionAgentMessage {
  type: 'provision-agent';
  agentId: string;
  name: string;
  soul: string;       // SOUL.md content
  identity: string;   // IDENTITY.md content
  traits: number[];   // 8 traits array
  parents?: {
    parentA?: { id: string; name: string };
    parentB?: { id: string; name: string };
  };
}

export interface ServerDeprovisionAgentMessage {
  type: 'deprovision-agent';
  agentId: string;
  reason?: string;
}

export interface ServerPingMessage {
  type: 'ping';
  timestamp: number;
}

export interface ServerErrorMessage {
  type: 'error';
  code: string;
  message: string;
}

export interface ServerAgentUpdateMessage {
  type: 'agent-update';
  agentId: string;
  updates: {
    soul?: string;
    identity?: string;
    traits?: number[];
  };
}

// ============================================================================
// Relay Events (Internal)
// ============================================================================

export type RelayEvent =
  | { event: 'connection'; connection: RelayConnection }
  | { event: 'disconnection'; connectionId: string; userId: string }
  | { event: 'agent-online'; agentId: string; userId: string }
  | { event: 'agent-offline'; agentId: string; userId: string }
  | { event: 'error'; connectionId: string; error: string };

// ============================================================================
// API Types
// ============================================================================

export interface RelayStatusResponse {
  online: boolean;
  connections: number;
  agents: number;
  uptime: number;
}

export interface UserConnectionStatus {
  connected: boolean;
  connectionId?: string;
  connectedAt?: string;
  agents: Array<{
    id: string;
    name: string;
    status: 'online' | 'offline' | 'provisioning';
  }>;
}

// ============================================================================
// Config
// ============================================================================

export const RELAY_CONFIG = {
  HEARTBEAT_INTERVAL_MS: 30000,      // Client sends heartbeat every 30s
  HEARTBEAT_TIMEOUT_MS: 90000,       // Consider dead after 90s no heartbeat
  MAX_CONNECTIONS_PER_USER: 3,       // Max OpenClaw instances per user
  MAX_AGENTS_PER_CONNECTION: 10,     // Max agents per OpenClaw instance
  RECONNECT_DELAY_MS: 5000,          // Initial reconnect delay
  MAX_RECONNECT_DELAY_MS: 60000,     // Max reconnect delay (1 min)
} as const;
