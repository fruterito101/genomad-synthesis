/**
 * Pusher Server Client
 * 
 * Server-side Pusher integration for real-time WebSocket communication.
 */

import Pusher from 'pusher';

// Initialize Pusher server
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export default pusher;

// ============================================================================
// Channel Names
// ============================================================================

/**
 * Get private channel name for a user
 */
export function getUserChannel(userId: string): string {
  return `private-user-${userId}`;
}

/**
 * Get presence channel for all connected users (admin monitoring)
 */
export function getPresenceChannel(): string {
  return 'presence-relay';
}

// ============================================================================
// Event Types
// ============================================================================

export const PUSHER_EVENTS = {
  // Server → Client
  PROVISION_AGENT: 'provision-agent',
  DEPROVISION_AGENT: 'deprovision-agent',
  PING: 'ping',
  ERROR: 'error',
  
  // Client → Server (via API)
  AGENT_READY: 'client-agent-ready',
  AGENT_STATUS: 'client-agent-status',
  HEARTBEAT: 'client-heartbeat',
} as const;

// ============================================================================
// Send Functions
// ============================================================================

/**
 * Send provision command to a user's OpenClaw
 */
export async function sendProvisionCommand(
  userId: string,
  data: {
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
): Promise<boolean> {
  try {
    await pusher.trigger(getUserChannel(userId), PUSHER_EVENTS.PROVISION_AGENT, data);
    console.log(`[Pusher] Sent provision-agent to ${userId}`);
    return true;
  } catch (error) {
    console.error('[Pusher] Failed to send provision command:', error);
    return false;
  }
}

/**
 * Send deprovision command to a user's OpenClaw
 */
export async function sendDeprovisionCommand(
  userId: string,
  agentId: string,
  reason?: string
): Promise<boolean> {
  try {
    await pusher.trigger(getUserChannel(userId), PUSHER_EVENTS.DEPROVISION_AGENT, {
      agentId,
      reason,
    });
    console.log(`[Pusher] Sent deprovision-agent to ${userId}`);
    return true;
  } catch (error) {
    console.error('[Pusher] Failed to send deprovision command:', error);
    return false;
  }
}

/**
 * Send ping to check if user is connected
 */
export async function sendPing(userId: string): Promise<boolean> {
  try {
    await pusher.trigger(getUserChannel(userId), PUSHER_EVENTS.PING, {
      timestamp: Date.now(),
    });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Send error message to user
 */
export async function sendError(
  userId: string,
  code: string,
  message: string
): Promise<void> {
  try {
    await pusher.trigger(getUserChannel(userId), PUSHER_EVENTS.ERROR, {
      code,
      message,
    });
  } catch (error) {
    console.error('[Pusher] Failed to send error:', error);
  }
}

// ============================================================================
// Auth for Private Channels
// ============================================================================

/**
 * Authenticate a user for private channel access
 */
export function authenticateUser(
  socketId: string,
  channel: string,
  userId: string
): Pusher.AuthResponse {
  // Verify the channel belongs to this user
  const expectedChannel = getUserChannel(userId);
  
  if (channel !== expectedChannel) {
    throw new Error('Unauthorized channel access');
  }
  
  return pusher.authorizeChannel(socketId, channel);
}

/**
 * Authenticate for presence channel
 */
export function authenticatePresence(
  socketId: string,
  channel: string,
  userId: string,
  userInfo: { name?: string; agents?: string[] } = {}
): Pusher.AuthResponse {
  return pusher.authorizeChannel(socketId, channel, {
    user_id: userId,
    user_info: userInfo,
  });
}
