/**
 * Genomad Relay Client - v2 with Persistence
 * 
 * Connects to the Genomad relay server with:
 * - Auto-reconnect with exponential backoff
 * - State persistence across restarts
 * - Robust error handling
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import {
  RelayConfig,
  RelayState,
  ClientMessage,
  ServerMessage,
  DEFAULT_CONFIG,
  AgentState,
  RELAY_CONFIG,
} from './types';

const CONFIG_DIR = join(process.env.HOME || '~', '.genomad');
const STATE_FILE = join(CONFIG_DIR, 'relay-state.json');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

type MessageHandler = (message: ServerMessage) => Promise<void>;
type StatusHandler = (status: 'connected' | 'disconnected' | 'reconnecting' | 'error', message?: string) => void;

interface PersistedState {
  connectionId?: string;
  connectedAt?: string;
  agents: Array<{
    id: string;
    name: string;
    status: string;
    workspacePath: string;
  }>;
  lastHeartbeat?: string;
  savedAt: string;
}

export class RelayClient {
  private config: RelayConfig;
  private state: RelayState;
  private heartbeatInterval?: ReturnType<typeof setInterval>;
  private messageHandler?: MessageHandler;
  private statusHandler?: StatusHandler;
  private stopping = false;
  private reconnectTimeout?: ReturnType<typeof setTimeout>;

  constructor(config: Partial<RelayConfig> & { userId: string }) {
    this.config = {
      ...DEFAULT_CONFIG,
      agentsDir: `${process.env.HOME}/.openclaw/agents`,
      ...config,
    } as RelayConfig;

    this.state = {
      connected: false,
      agents: new Map(),
      reconnectAttempts: 0,
    };
  }

  /**
   * Set message handler for incoming server messages
   */
  onMessage(handler: MessageHandler): void {
    this.messageHandler = handler;
  }

  /**
   * Set status change handler
   */
  onStatusChange(handler: StatusHandler): void {
    this.statusHandler = handler;
  }

  /**
   * Load persisted state and connect
   */
  async connectWithPersistence(): Promise<boolean> {
    // Load previous state
    await this.loadState();
    
    // Try to connect
    const success = await this.connect();
    
    if (success) {
      // Restore agents from previous session
      await this.restoreAgents();
    }
    
    return success;
  }

  /**
   * Connect to the relay server
   */
  async connect(): Promise<boolean> {
    this.stopping = false;
    this.emitStatus('reconnecting');
    console.log('[Relay] Connecting to', this.config.serverUrl);

    try {
      const response = await fetch(this.config.serverUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'connect',
          userId: this.config.userId,
          token: this.config.token,
          metadata: {
            openclawVersion: process.env.OPENCLAW_VERSION || 'unknown',
            platform: process.platform,
            hostname: process.env.HOSTNAME || require('os').hostname(),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error('[Relay] Connection failed:', data.error);
        this.emitStatus('error', data.error);
        this.scheduleReconnect();
        return false;
      }

      this.state.connected = true;
      this.state.connectionId = data.connectionId;
      this.state.connectedAt = new Date();
      this.state.reconnectAttempts = 0;

      console.log('[Relay] Connected! ID:', data.connectionId);
      this.emitStatus('connected');

      // Start heartbeat polling
      this.startHeartbeat();
      
      // Save state
      await this.saveState();

      return true;

    } catch (error) {
      console.error('[Relay] Connection error:', error);
      this.emitStatus('error', String(error));
      this.scheduleReconnect();
      return false;
    }
  }

  /**
   * Disconnect from the relay server
   */
  async disconnect(): Promise<void> {
    this.stopping = true;
    this.stopHeartbeat();
    this.cancelReconnect();

    if (!this.state.connectionId) return;

    try {
      await fetch(this.config.serverUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'disconnect',
          connectionId: this.state.connectionId,
        }),
      });
    } catch (error) {
      console.warn('[Relay] Disconnect error:', error);
    }

    this.state.connected = false;
    this.state.connectionId = undefined;
    this.emitStatus('disconnected');
    
    // Clear persisted state
    await this.clearState();
    
    console.log('[Relay] Disconnected');
  }

  /**
   * Send a message to the server
   */
  async sendMessage(message: ClientMessage): Promise<ServerMessage | null> {
    if (!this.state.connectionId) {
      console.error('[Relay] Not connected');
      return null;
    }

    try {
      const response = await fetch(this.config.serverUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'message',
          connectionId: this.state.connectionId,
          message,
        }),
      });

      const data = await response.json();
      return data.response || null;

    } catch (error) {
      console.error('[Relay] Send error:', error);
      return null;
    }
  }

  /**
   * Report agent ready
   */
  async reportAgentReady(agentId: string, success: boolean, error?: string): Promise<void> {
    await this.sendMessage({
      type: 'agent-ready',
      agentId,
      success,
      error,
    });

    if (success) {
      const agent = this.state.agents.get(agentId);
      if (agent) {
        agent.status = 'online';
        await this.saveState();
      }
    }
  }

  /**
   * Report agent status change
   */
  async reportAgentStatus(agentId: string, status: 'online' | 'offline' | 'error', error?: string): Promise<void> {
    await this.sendMessage({
      type: 'agent-status',
      agentId,
      status,
      error,
    });

    const agent = this.state.agents.get(agentId);
    if (agent) {
      agent.status = status;
      agent.error = error;
      await this.saveState();
    }
  }

  /**
   * Get current state
   */
  getState(): RelayState {
    return { ...this.state };
  }

  /**
   * Get list of running agents
   */
  getAgents(): AgentState[] {
    return Array.from(this.state.agents.values());
  }

  /**
   * Register an agent as running
   */
  registerAgent(agent: AgentState): void {
    this.state.agents.set(agent.id, agent);
    this.saveState().catch(console.error);
  }

  /**
   * Unregister an agent
   */
  unregisterAgent(agentId: string): void {
    this.state.agents.delete(agentId);
    this.saveState().catch(console.error);
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.state.connected;
  }

  // ============================================================================
  // Persistence
  // ============================================================================

  private async loadState(): Promise<void> {
    try {
      const content = await readFile(STATE_FILE, 'utf-8');
      const persisted: PersistedState = JSON.parse(content);
      
      // Restore agents
      this.state.agents.clear();
      for (const agent of persisted.agents || []) {
        this.state.agents.set(agent.id, {
          id: agent.id,
          name: agent.name,
          status: 'offline', // Will be updated on connect
          workspacePath: agent.workspacePath,
        });
      }
      
      console.log(`[Relay] Loaded state: ${this.state.agents.size} agents`);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        console.error('[Relay] Failed to load state:', error);
      }
    }
  }

  private async saveState(): Promise<void> {
    try {
      await mkdir(CONFIG_DIR, { recursive: true });
      
      const persisted: PersistedState = {
        connectionId: this.state.connectionId,
        connectedAt: this.state.connectedAt?.toISOString(),
        agents: Array.from(this.state.agents.values()).map(a => ({
          id: a.id,
          name: a.name,
          status: a.status,
          workspacePath: a.workspacePath,
        })),
        lastHeartbeat: this.state.lastHeartbeat?.toISOString(),
        savedAt: new Date().toISOString(),
      };
      
      await writeFile(STATE_FILE, JSON.stringify(persisted, null, 2));
    } catch (error) {
      console.error('[Relay] Failed to save state:', error);
    }
  }

  private async clearState(): Promise<void> {
    try {
      const { rm } = await import('fs/promises');
      await rm(STATE_FILE, { force: true });
    } catch (error) {
      console.error('[Relay] Failed to clear state:', error);
    }
  }

  private async restoreAgents(): Promise<void> {
    // Report all previously registered agents as online
    for (const [agentId, agent] of this.state.agents) {
      try {
        // Verify agent still exists on disk
        const { access } = await import('fs/promises');
        await access(join(agent.workspacePath, 'SOUL.md'));
        
        // Report as online
        await this.reportAgentStatus(agentId, 'online');
        agent.status = 'online';
        console.log(`[Relay] Restored agent: ${agent.name}`);
      } catch {
        // Agent no longer exists
        this.state.agents.delete(agentId);
        console.log(`[Relay] Agent ${agentId} no longer exists, removing`);
      }
    }
    
    await this.saveState();
  }

  // ============================================================================
  // Heartbeat & Reconnection
  // ============================================================================

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(
      () => this.doHeartbeat(),
      this.config.heartbeatIntervalMs
    );
    // Do immediate heartbeat
    this.doHeartbeat();
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }

  private async doHeartbeat(): Promise<void> {
    if (!this.state.connectionId || this.stopping) return;

    try {
      const response = await fetch(this.config.serverUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'heartbeat',
          connectionId: this.state.connectionId,
          agents: Array.from(this.state.agents.keys()),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'UNKNOWN_CONNECTION') {
          console.warn('[Relay] Connection lost, reconnecting...');
          this.state.connected = false;
          this.emitStatus('disconnected');
          this.scheduleReconnect();
          return;
        }
        console.error('[Relay] Heartbeat error:', data.error);
        return;
      }

      this.state.lastHeartbeat = new Date();

      // Process pending messages
      if (data.messages && data.messages.length > 0) {
        for (const message of data.messages) {
          await this.handleMessage(message);
        }
      }

    } catch (error) {
      console.error('[Relay] Heartbeat failed:', error);
      this.state.connected = false;
      this.emitStatus('error', 'Heartbeat failed');
      this.scheduleReconnect();
    }
  }

  private async handleMessage(message: ServerMessage): Promise<void> {
    console.log('[Relay] Received:', message.type);

    if (this.messageHandler) {
      try {
        await this.messageHandler(message);
      } catch (error) {
        console.error('[Relay] Message handler error:', error);
      }
    }
  }

  private scheduleReconnect(): void {
    if (this.stopping) return;
    this.cancelReconnect();

    this.stopHeartbeat();
    this.state.reconnectAttempts++;

    const delay = Math.min(
      this.config.reconnectDelayMs * Math.pow(2, this.state.reconnectAttempts - 1),
      this.config.maxReconnectDelayMs
    );

    console.log(`[Relay] Reconnecting in ${delay}ms (attempt ${this.state.reconnectAttempts})`);
    this.emitStatus('reconnecting', `Attempt ${this.state.reconnectAttempts}`);

    this.reconnectTimeout = setTimeout(async () => {
      if (this.stopping) return;
      const success = await this.connect();
      if (success) {
        await this.restoreAgents();
      }
    }, delay);
  }

  private cancelReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = undefined;
    }
  }

  private emitStatus(status: 'connected' | 'disconnected' | 'reconnecting' | 'error', message?: string): void {
    if (this.statusHandler) {
      try {
        this.statusHandler(status, message);
      } catch (error) {
        console.error('[Relay] Status handler error:', error);
      }
    }
  }
}

// ============================================================================
// Singleton & Config Loading
// ============================================================================

let relayClient: RelayClient | null = null;

export function getRelayClient(): RelayClient | null {
  return relayClient;
}

export function createRelayClient(config: Partial<RelayConfig> & { userId: string }): RelayClient {
  relayClient = new RelayClient(config);
  return relayClient;
}

/**
 * Load config from ~/.genomad/config.json
 */
export async function loadConfig(): Promise<{ userId: string; token?: string; serverUrl?: string } | null> {
  try {
    const content = await readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.error('❌ Config not found. Create ~/.genomad/config.json with {"userId":"..."}');
      return null;
    }
    throw error;
  }
}

/**
 * Save config to ~/.genomad/config.json
 */
export async function saveConfig(config: { userId: string; token?: string; serverUrl?: string }): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true });
  await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

/**
 * Auto-connect using saved config
 */
export async function autoConnect(): Promise<RelayClient | null> {
  const config = await loadConfig();
  if (!config) return null;

  const client = createRelayClient(config);
  const success = await client.connectWithPersistence();
  
  if (!success) {
    console.error('❌ Failed to connect. Will keep retrying...');
  }
  
  return client;
}
