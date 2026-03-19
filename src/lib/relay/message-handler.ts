/**
 * Message Handler
 * 
 * Processes incoming messages from OpenClaw clients
 * and generates appropriate responses.
 */

import { db } from '@/lib/db';
import { agents } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateSoul, generateIdentity } from '@/lib/multiagent';
import type { Traits, AgentChild, AgentParent, SoulConfig } from '@/lib/multiagent';
import {
  ClientMessage,
  ServerMessage,
  ClientAuthMessage,
  ClientHeartbeatMessage,
  ClientAgentReadyMessage,
  ClientAgentStatusMessage,
} from './types';
import {
  registerConnection,
  removeConnection,
  updateHeartbeat,
  registerAgent,
  unregisterAgent,
  getConnection,
} from './connection-manager';

// Trait names in order (matches database array order)
const TRAIT_NAMES: (keyof Traits)[] = [
  'technical',
  'creativity', 
  'social',
  'analysis',
  'empathy',
  'trading',
  'teaching',
  'leadership',
];

/**
 * Convert traits array to Traits object
 */
function traitsArrayToObject(arr: number[]): Traits {
  const traits: Partial<Traits> = {};
  TRAIT_NAMES.forEach((name, i) => {
    traits[name] = arr[i] ?? 50;
  });
  return traits as Traits;
}

// Message sender function type (injected by transport layer)
type SendMessage = (connectionId: string, message: ServerMessage) => Promise<void>;

let sendMessage: SendMessage | null = null;

/**
 * Set the message sender function (called by transport layer)
 */
export function setMessageSender(sender: SendMessage): void {
  sendMessage = sender;
}

/**
 * Handle incoming client message
 */
export async function handleClientMessage(
  connectionId: string,
  message: ClientMessage
): Promise<ServerMessage | null> {
  console.log(`[Relay] Received ${message.type} from ${connectionId}`);

  switch (message.type) {
    case 'auth':
      return handleAuth(connectionId, message);

    case 'heartbeat':
      return handleHeartbeat(connectionId, message);

    case 'agent-ready':
      return handleAgentReady(connectionId, message);

    case 'agent-status':
      return handleAgentStatus(connectionId, message);

    case 'error':
      console.error(`[Relay] Client error from ${connectionId}:`, message);
      return null;

    default:
      console.warn(`[Relay] Unknown message type:`, message);
      return { type: 'error', code: 'UNKNOWN_MESSAGE', message: 'Unknown message type' };
  }
}

/**
 * Handle authentication
 */
async function handleAuth(
  connectionId: string,
  message: ClientAuthMessage
): Promise<ServerMessage> {
  try {
    // TODO: Validate Privy token
    // For now, we trust the userId (MVP)
    const { userId, metadata } = message;

    if (!userId) {
      return { type: 'auth-fail', message: 'Missing userId' };
    }

    // Register connection
    const connection = registerConnection(connectionId, userId, metadata);
    if (!connection) {
      return { type: 'auth-fail', message: 'Max connections reached' };
    }

    console.log(`[Relay] User ${userId} authenticated on ${connectionId}`);
    return { type: 'auth-ok', connectionId };

  } catch (error) {
    console.error('[Relay] Auth error:', error);
    return { type: 'auth-fail', message: 'Authentication failed' };
  }
}

/**
 * Handle heartbeat
 */
async function handleHeartbeat(
  connectionId: string,
  message: ClientHeartbeatMessage
): Promise<ServerMessage> {
  const success = updateHeartbeat(connectionId, message.agents);
  
  if (!success) {
    return { type: 'error', code: 'UNKNOWN_CONNECTION', message: 'Connection not found' };
  }

  return { type: 'ping', timestamp: Date.now() };
}

/**
 * Handle agent ready notification
 */
async function handleAgentReady(
  connectionId: string,
  message: ClientAgentReadyMessage
): Promise<ServerMessage | null> {
  const { agentId, success, error } = message;

  if (success) {
    registerAgent(connectionId, agentId);
    
    // Update agent status in database
    try {
      await db.update(agents)
        .set({ 
          activatedAt: new Date(),
        })
        .where(eq(agents.id, agentId));
      
      console.log(`[Relay] Agent ${agentId} is now online`);
    } catch (dbError) {
      console.error('[Relay] Failed to update agent status:', dbError);
    }
  } else {
    console.error(`[Relay] Agent ${agentId} failed to provision:`, error);
  }

  return null; // No response needed
}

/**
 * Handle agent status update
 */
async function handleAgentStatus(
  connectionId: string,
  message: ClientAgentStatusMessage
): Promise<ServerMessage | null> {
  const { agentId, status, error } = message;

  if (status === 'online') {
    registerAgent(connectionId, agentId);
  } else if (status === 'offline') {
    unregisterAgent(connectionId, agentId);
  }

  if (error) {
    console.error(`[Relay] Agent ${agentId} error:`, error);
  }

  return null;
}

/**
 * Build AgentParent from database agent
 */
function buildAgentParent(agent: any): AgentParent {
  return {
    id: agent.id,
    name: agent.name,
    traits: traitsArrayToObject(agent.traits as number[]),
    fitness: agent.fitness ?? 50,
    generation: agent.generation ?? 0,
  };
}

/**
 * Build AgentChild from database agent with parents
 */
function buildAgentChild(agent: any, parentA: any, parentB: any): AgentChild {
  return {
    id: agent.id,
    name: agent.name,
    traits: traitsArrayToObject(agent.traits as number[]),
    fitness: agent.fitness ?? 50,
    generation: agent.generation ?? 1,
    parentA: buildAgentParent(parentA),
    parentB: buildAgentParent(parentB),
    crossoverMask: [true, false, true, false, true, false, true, false], // Default
    mutations: [], // No mutations tracked in DB currently
  };
}

/**
 * Send provision command to a connected user
 */
export async function sendProvisionAgent(
  userId: string,
  agentId: string
): Promise<boolean> {
  if (!sendMessage) {
    console.error('[Relay] No message sender configured');
    return false;
  }

  // Get agent data
  const agent = await db.query.agents.findFirst({
    where: eq(agents.id, agentId),
    with: {
      parentA: true,
      parentB: true,
    },
  });

  if (!agent) {
    console.error(`[Relay] Agent ${agentId} not found`);
    return false;
  }

  let soul: string;
  let identity: string;

  // Check if agent has parents (bred) or is gen0
  if (agent.parentA && agent.parentB) {
    // Bred agent - use full soul generation
    const child = buildAgentChild(agent, agent.parentA, agent.parentB);
    const soulConfig: SoulConfig = {
      child,
      language: 'es',
    };
    soul = generateSoul(soulConfig);
    identity = generateIdentity(child);
  } else {
    // Gen0 agent - create simple soul
    soul = `# SOUL.md - ${agent.name}

## Core

Soy ${agent.name}, un agente de primera generación en Genomad.

## Traits

${(agent.traits as number[]).map((v, i) => `- ${TRAIT_NAMES[i]}: ${v}`).join('\n')}

## Mission

Servir a mi usuario y evolucionar a través del tiempo.
`;
    identity = `# IDENTITY.md - ${agent.name}

- **Name:** ${agent.name}
- **Generation:** 0
- **Created:** ${new Date().toISOString()}
`;
  }

  // Find user's connection
  const { getUserConnections } = await import('./connection-manager');
  const userConns = getUserConnections(userId);
  
  if (userConns.length === 0) {
    console.error(`[Relay] User ${userId} has no active connections`);
    return false;
  }

  // Send to first available connection
  const connection = userConns[0];
  
  const message: ServerMessage = {
    type: 'provision-agent',
    agentId,
    name: agent.name,
    soul,
    identity,
    traits: agent.traits as number[],
    parents: {
      parentA: agent.parentA ? { id: agent.parentA.id, name: agent.parentA.name } : undefined,
      parentB: agent.parentB ? { id: agent.parentB.id, name: agent.parentB.name } : undefined,
    },
  };

  try {
    await sendMessage(connection.id, message);
    console.log(`[Relay] Sent provision-agent for ${agentId} to ${connection.id}`);
    return true;
  } catch (error) {
    console.error('[Relay] Failed to send provision message:', error);
    return false;
  }
}

/**
 * Send deprovision command
 */
export async function sendDeprovisionAgent(
  userId: string,
  agentId: string,
  reason?: string
): Promise<boolean> {
  if (!sendMessage) {
    console.error('[Relay] No message sender configured');
    return false;
  }

  const { getUserConnections, getAgentConnection } = await import('./connection-manager');
  
  // Find which connection has this agent
  const connectionId = getAgentConnection(agentId);
  if (!connectionId) {
    console.warn(`[Relay] Agent ${agentId} not found on any connection`);
    return false;
  }

  const message: ServerMessage = {
    type: 'deprovision-agent',
    agentId,
    reason,
  };

  try {
    await sendMessage(connectionId, message);
    console.log(`[Relay] Sent deprovision-agent for ${agentId}`);
    return true;
  } catch (error) {
    console.error('[Relay] Failed to send deprovision message:', error);
    return false;
  }
}

/**
 * Handle connection close
 */
export function handleConnectionClose(connectionId: string): void {
  removeConnection(connectionId);
  console.log(`[Relay] Connection ${connectionId} closed`);
}
