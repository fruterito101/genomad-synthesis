/**
 * Genomad Relay Client
 * 
 * Connects to the Genomad relay server and handles communication.
 * Uses HTTP polling (Vercel-compatible) with WebSocket upgrade path.
 */

import {
  RelayConfig,
  RelayState,
  ClientMessage,
  ServerMessage,
  DEFAULT_CONFIG,
  AgentState,
} from './types';

type MessageHandler = (message: ServerMessage) => Promise<void>;

export class RelayClient {
  private config: RelayConfig;
  private state: RelayState;
  private heartbeatInterval?: ReturnType<typeof setInterval>;
  private messageHandler?: MessageHandler;
  private stopping = false;

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
   * Connect to the relay server
   */
  async connect(): Promise<boolean> {
    this.stopping = false;
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
            hostname: process.env.HOSTNAME || 'unknown',
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error('[Relay] Connection failed:', data.error);
        return false;
      }

      this.state.connected = true;
      this.state.connectionId = data.connectionId;
      this.state.connectedAt = new Date();
      this.state.reconnectAttempts = 0;

      console.log('[Relay] Connected! ID:', data.connectionId);

      // Start heartbeat polling
      this.startHeartbeat();

      return true;

    } catch (error) {
      console.error('[Relay] Connection error:', error);
      return false;
    }
  }

  /**
   * Disconnect from the relay server
   */
  async disconnect(): Promise<void> {
    this.stopping = true;
    this.stopHeartbeat();

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
  }

  /**
   * Unregister an agent
   */
  unregisterAgent(agentId: string): void {
    this.state.agents.delete(agentId);
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(
      () => this.doHeartbeat(),
      this.config.heartbeatIntervalMs
    );
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

    this.stopHeartbeat();
    this.state.reconnectAttempts++;

    const delay = Math.min(
      this.config.reconnectDelayMs * Math.pow(2, this.state.reconnectAttempts - 1),
      this.config.maxReconnectDelayMs
    );

    console.log(`[Relay] Reconnecting in ${delay}ms (attempt ${this.state.reconnectAttempts})`);

    setTimeout(async () => {
      if (this.stopping) return;
      const success = await this.connect();
      if (!success) {
        this.scheduleReconnect();
      }
    }, delay);
  }
}

// Singleton instance
let relayClient: RelayClient | null = null;

export function getRelayClient(): RelayClient | null {
  return relayClient;
}

export function createRelayClient(config: Partial<RelayConfig> & { userId: string }): RelayClient {
  relayClient = new RelayClient(config);
  return relayClient;
}
