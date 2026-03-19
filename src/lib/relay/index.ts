/**
 * Genomad Relay
 * 
 * P2P agent network relay system.
 * Allows OpenClaw instances to connect and receive agent provisioning commands.
 */

export * from './types';
export * from './connection-manager';
export * from './message-handler';

// Re-export commonly used functions
export {
  registerConnection,
  removeConnection,
  getConnection,
  getUserConnections,
  isUserConnected,
  isAgentOnline,
  getRelayStatus,
} from './connection-manager';

export {
  handleClientMessage,
  sendProvisionAgent,
  sendDeprovisionAgent,
  setMessageSender,
} from './message-handler';
