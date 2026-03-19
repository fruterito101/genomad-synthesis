/**
 * Genomad Relay Client Types
 * Matches server-side protocol in src/lib/relay/types.ts
 */

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
  token: string;
  userId: string;
  metadata?: {
    openclawVersion?: string;
    platform?: string;
    hostname?: string;
  };
}

export interface ClientHeartbeatMessage {
  type: 'heartbeat';
  timestamp: number;
  agents: string[];
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
  | ServerErrorMessage;

export interface ServerAuthResultMessage {
  type: 'auth-ok' | 'auth-fail';
  message?: string;
  connectionId?: string;
}

export interface ServerProvisionAgentMessage {
  type: 'provision-agent';
  agentId: string;
  name: string;
  soul: string;
  identity: string;
  traits: number[];
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

// ============================================================================
// Relay Client Config
// ============================================================================

export interface RelayConfig {
  serverUrl: string;
  userId: string;
  token?: string;
  heartbeatIntervalMs: number;
  reconnectDelayMs: number;
  maxReconnectDelayMs: number;
  agentsDir: string;
}

export interface RelayState {
  connected: boolean;
  connectionId?: string;
  connectedAt?: Date;
  lastHeartbeat?: Date;
  agents: Map<string, AgentState>;
  reconnectAttempts: number;
}

export interface AgentState {
  id: string;
  name: string;
  status: 'provisioning' | 'online' | 'offline' | 'error';
  workspacePath: string;
  error?: string;
}

// ============================================================================
// Constants
// ============================================================================

export const DEFAULT_CONFIG: Partial<RelayConfig> = {
  serverUrl: 'https://genomad.vercel.app/api/relay',
  heartbeatIntervalMs: 30000,
  reconnectDelayMs: 5000,
  maxReconnectDelayMs: 60000,
};
