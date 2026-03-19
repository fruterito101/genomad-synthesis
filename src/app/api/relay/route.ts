/**
 * Relay API Route
 * 
 * Handles relay connections via HTTP polling (Vercel-compatible).
 * Can be upgraded to WebSocket when using a different host.
 * 
 * Endpoints:
 * - POST /api/relay/connect - Authenticate and get connection ID
 * - POST /api/relay/heartbeat - Send heartbeat and receive pending messages
 * - POST /api/relay/message - Send a message to the relay
 * - GET /api/relay/status - Get relay status
 * - DELETE /api/relay/disconnect - Close connection
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  registerConnection,
  removeConnection,
  updateHeartbeat,
  getConnection,
  getUserConnections,
  getRelayStatus,
  isUserConnected,
} from '@/lib/relay/connection-manager';
import { 
  handleClientMessage,
  setMessageSender,
} from '@/lib/relay/message-handler';
import { 
  ClientMessage, 
  ServerMessage,
  RELAY_CONFIG,
} from '@/lib/relay/types';
import { v4 as uuidv4 } from 'uuid';

// Pending messages per connection (polling-based delivery)
const pendingMessages = new Map<string, ServerMessage[]>();

// Initialize message sender for polling
setMessageSender(async (connectionId: string, message: ServerMessage) => {
  const messages = pendingMessages.get(connectionId) || [];
  messages.push(message);
  pendingMessages.set(connectionId, messages);
});

/**
 * POST /api/relay - Main relay endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'connect':
        return handleConnect(data);
      case 'heartbeat':
        return handleHeartbeat(data);
      case 'message':
        return handleMessage(data);
      case 'disconnect':
        return handleDisconnect(data);
      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[Relay API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/relay - Get relay status
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (userId) {
    // Get user-specific status
    const connections = getUserConnections(userId);
    return NextResponse.json({
      connected: connections.length > 0,
      connections: connections.map(c => ({
        id: c.id,
        connectedAt: c.connectedAt.toISOString(),
        lastHeartbeat: c.lastHeartbeat.toISOString(),
        agents: c.agents,
      })),
    });
  }

  // Get general relay status
  const status = getRelayStatus();
  return NextResponse.json(status);
}

/**
 * DELETE /api/relay - Disconnect
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    return handleDisconnect(body);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

// ============================================================================
// Action Handlers
// ============================================================================

async function handleConnect(data: { userId: string; token?: string; metadata?: object }) {
  const { userId, token, metadata } = data;

  if (!userId) {
    return NextResponse.json(
      { error: 'Missing userId' },
      { status: 400 }
    );
  }

  // TODO: Validate token with Privy
  // For MVP, we trust the userId

  const connectionId = uuidv4();
  const connection = registerConnection(connectionId, userId, metadata as any);

  if (!connection) {
    return NextResponse.json(
      { error: 'Max connections reached', code: 'MAX_CONNECTIONS' },
      { status: 429 }
    );
  }

  // Initialize pending messages queue
  pendingMessages.set(connectionId, []);

  return NextResponse.json({
    success: true,
    connectionId,
    heartbeatIntervalMs: RELAY_CONFIG.HEARTBEAT_INTERVAL_MS,
  });
}

async function handleHeartbeat(data: { connectionId: string; agents?: string[] }) {
  const { connectionId, agents } = data;

  if (!connectionId) {
    return NextResponse.json(
      { error: 'Missing connectionId' },
      { status: 400 }
    );
  }

  const connection = getConnection(connectionId);
  if (!connection) {
    return NextResponse.json(
      { error: 'Connection not found', code: 'UNKNOWN_CONNECTION' },
      { status: 404 }
    );
  }

  // Update heartbeat
  updateHeartbeat(connectionId, agents);

  // Get and clear pending messages
  const messages = pendingMessages.get(connectionId) || [];
  pendingMessages.set(connectionId, []);

  return NextResponse.json({
    success: true,
    timestamp: Date.now(),
    messages,
  });
}

async function handleMessage(data: { connectionId: string; message: ClientMessage }) {
  const { connectionId, message } = data;

  if (!connectionId || !message) {
    return NextResponse.json(
      { error: 'Missing connectionId or message' },
      { status: 400 }
    );
  }

  const connection = getConnection(connectionId);
  if (!connection) {
    return NextResponse.json(
      { error: 'Connection not found', code: 'UNKNOWN_CONNECTION' },
      { status: 404 }
    );
  }

  // Process message
  const response = await handleClientMessage(connectionId, message);

  return NextResponse.json({
    success: true,
    response,
  });
}

async function handleDisconnect(data: { connectionId: string }) {
  const { connectionId } = data;

  if (!connectionId) {
    return NextResponse.json(
      { error: 'Missing connectionId' },
      { status: 400 }
    );
  }

  removeConnection(connectionId);
  pendingMessages.delete(connectionId);

  return NextResponse.json({ success: true });
}
