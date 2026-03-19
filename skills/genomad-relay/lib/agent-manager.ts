/**
 * Agent Manager - Multi-Agent Support
 * 
 * Handles local provisioning and management of multiple Genomad agents.
 * Each agent has its own isolated workspace.
 */

import { mkdir, writeFile, rm, access, readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { ServerProvisionAgentMessage, AgentState, RELAY_CONFIG } from './types';

const DEFAULT_AGENTS_DIR = `${process.env.HOME}/.openclaw/agents`;
const STATE_FILE = 'agent-state.json';

// In-memory state for running agents
const runningAgents = new Map<string, AgentState>();

/**
 * Get the agents directory path
 */
export function getAgentsDir(): string {
  return process.env.GENOMAD_AGENTS_DIR || DEFAULT_AGENTS_DIR;
}

/**
 * Provision a new agent locally
 */
export async function provisionAgent(
  message: ServerProvisionAgentMessage,
  agentsDir: string = getAgentsDir()
): Promise<AgentState> {
  const { agentId, name, soul, identity, traits, parents } = message;
  
  // Check agent limit
  const currentAgents = await listAgents(agentsDir);
  if (currentAgents.length >= RELAY_CONFIG.MAX_AGENTS_PER_CONNECTION) {
    throw new Error(`Maximum agents (${RELAY_CONFIG.MAX_AGENTS_PER_CONNECTION}) reached. Deprovision an agent first.`);
  }
  
  const agentPath = join(agentsDir, agentId);
  const workspacePath = join(agentPath, 'workspace');
  const memoryPath = join(workspacePath, 'memory');

  console.log(`[AgentManager] Provisioning agent ${name} (${agentId})`);
  console.log(`[AgentManager] Current agents: ${currentAgents.length}/${RELAY_CONFIG.MAX_AGENTS_PER_CONNECTION}`);

  try {
    // Check if already exists
    const exists = await agentExists(agentId, agentsDir);
    if (exists) {
      console.log(`[AgentManager] Agent ${agentId} already exists, updating...`);
      // Update existing agent
      await writeFile(join(workspacePath, 'SOUL.md'), soul);
      await writeFile(join(workspacePath, 'IDENTITY.md'), identity);
      await writeFile(join(workspacePath, 'traits.json'), JSON.stringify({ traits, parents }, null, 2));
      
      const state: AgentState = {
        id: agentId,
        name,
        status: 'online',
        workspacePath,
      };
      runningAgents.set(agentId, state);
      await saveState(agentsDir);
      return state;
    }

    // Create directories
    await mkdir(workspacePath, { recursive: true });
    await mkdir(memoryPath, { recursive: true });

    // Write all workspace files
    await writeFile(join(workspacePath, 'SOUL.md'), soul);
    await writeFile(join(workspacePath, 'IDENTITY.md'), identity);
    await writeFile(join(workspacePath, 'AGENTS.md'), generateAgentsMd(name));
    await writeFile(join(workspacePath, 'USER.md'), generateUserMd());
    await writeFile(join(workspacePath, 'MEMORY.md'), generateMemoryMd(name, parents));
    await writeFile(join(workspacePath, 'HEARTBEAT.md'), generateHeartbeatMd(name));
    await writeFile(join(workspacePath, 'TOOLS.md'), generateToolsMd());
    await writeFile(join(workspacePath, 'traits.json'), JSON.stringify({ traits, parents }, null, 2));

    console.log(`[AgentManager] Agent ${name} provisioned at ${workspacePath}`);

    const state: AgentState = {
      id: agentId,
      name,
      status: 'online',
      workspacePath,
    };
    
    runningAgents.set(agentId, state);
    await saveState(agentsDir);

    return state;

  } catch (error) {
    console.error(`[AgentManager] Failed to provision ${name}:`, error);
    throw error;
  }
}

/**
 * Deprovision an agent locally
 */
export async function deprovisionAgent(
  agentId: string,
  agentsDir: string = getAgentsDir()
): Promise<void> {
  const agentPath = join(agentsDir, agentId);

  console.log(`[AgentManager] Deprovisioning agent ${agentId}`);

  try {
    await access(agentPath);
    await rm(agentPath, { recursive: true, force: true });
    runningAgents.delete(agentId);
    await saveState(agentsDir);
    console.log(`[AgentManager] Agent ${agentId} deprovisioned`);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.warn(`[AgentManager] Agent ${agentId} directory not found`);
      runningAgents.delete(agentId);
      return;
    }
    throw error;
  }
}

/**
 * List all provisioned agents
 */
export async function listAgents(
  agentsDir: string = getAgentsDir()
): Promise<AgentState[]> {
  try {
    await access(agentsDir);
    const entries = await readdir(agentsDir, { withFileTypes: true });
    
    const agents: AgentState[] = [];
    
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
      
      const workspacePath = join(agentsDir, entry.name, 'workspace');
      try {
        await access(join(workspacePath, 'SOUL.md'));
        
        // Read agent info
        let name = entry.name;
        let traits: number[] = [];
        
        try {
          const identity = await readFile(join(workspacePath, 'IDENTITY.md'), 'utf-8');
          const nameMatch = identity.match(/\*\*Name:\*\*\s*(.+)/);
          if (nameMatch) name = nameMatch[1].trim();
        } catch {}
        
        try {
          const traitsJson = await readFile(join(workspacePath, 'traits.json'), 'utf-8');
          const data = JSON.parse(traitsJson);
          traits = data.traits || [];
        } catch {}
        
        // Check if running
        const runningState = runningAgents.get(entry.name);
        
        agents.push({
          id: entry.name,
          name,
          status: runningState?.status || 'offline',
          workspacePath,
        });
      } catch {
        // Not a valid agent directory
      }
    }
    
    return agents;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

/**
 * Check if an agent exists
 */
export async function agentExists(
  agentId: string,
  agentsDir: string = getAgentsDir()
): Promise<boolean> {
  try {
    await access(join(agentsDir, agentId, 'workspace', 'SOUL.md'));
    return true;
  } catch {
    return false;
  }
}

/**
 * Get agent by ID
 */
export async function getAgent(
  agentId: string,
  agentsDir: string = getAgentsDir()
): Promise<AgentState | null> {
  const agents = await listAgents(agentsDir);
  return agents.find(a => a.id === agentId) || null;
}

/**
 * Update agent status
 */
export function updateAgentStatus(
  agentId: string,
  status: AgentState['status'],
  error?: string
): void {
  const agent = runningAgents.get(agentId);
  if (agent) {
    agent.status = status;
    agent.error = error;
  }
}

/**
 * Get all running agent IDs
 */
export function getRunningAgentIds(): string[] {
  return Array.from(runningAgents.entries())
    .filter(([_, state]) => state.status === 'online')
    .map(([id, _]) => id);
}

/**
 * Get agent count
 */
export async function getAgentCount(agentsDir: string = getAgentsDir()): Promise<{
  total: number;
  online: number;
  offline: number;
  max: number;
}> {
  const agents = await listAgents(agentsDir);
  const online = agents.filter(a => a.status === 'online').length;
  
  return {
    total: agents.length,
    online,
    offline: agents.length - online,
    max: RELAY_CONFIG.MAX_AGENTS_PER_CONNECTION,
  };
}

/**
 * Save state to disk for persistence across restarts
 */
async function saveState(agentsDir: string = getAgentsDir()): Promise<void> {
  try {
    await mkdir(agentsDir, { recursive: true });
    const state = {
      agents: Array.from(runningAgents.entries()).map(([id, state]) => ({
        id,
        name: state.name,
        status: state.status,
        workspacePath: state.workspacePath,
      })),
      savedAt: new Date().toISOString(),
    };
    await writeFile(join(agentsDir, STATE_FILE), JSON.stringify(state, null, 2));
  } catch (error) {
    console.error('[AgentManager] Failed to save state:', error);
  }
}

/**
 * Load state from disk
 */
export async function loadState(agentsDir: string = getAgentsDir()): Promise<void> {
  try {
    const content = await readFile(join(agentsDir, STATE_FILE), 'utf-8');
    const state = JSON.parse(content);
    
    runningAgents.clear();
    for (const agent of state.agents || []) {
      // Verify agent still exists
      if (await agentExists(agent.id, agentsDir)) {
        runningAgents.set(agent.id, {
          id: agent.id,
          name: agent.name,
          status: 'offline', // Start as offline, will be updated when relay connects
          workspacePath: agent.workspacePath,
        });
      }
    }
    
    console.log(`[AgentManager] Loaded ${runningAgents.size} agents from state`);
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      console.error('[AgentManager] Failed to load state:', error);
    }
  }
}

/**
 * Initialize agent manager - call on startup
 */
export async function initializeAgentManager(agentsDir: string = getAgentsDir()): Promise<void> {
  await loadState(agentsDir);
  const count = await getAgentCount(agentsDir);
  console.log(`[AgentManager] Initialized: ${count.total} agents (${count.online} online)`);
}

// ============================================================================
// Template Generators
// ============================================================================

function generateAgentsMd(name: string): string {
  return `# AGENTS.md - ${name}

This folder is my workspace. I was born through Genomad breeding.

## Every Session

1. Read \`SOUL.md\` — this is who I am
2. Read \`IDENTITY.md\` — my origins
3. Read \`memory/\` for recent context

## Memory

- **Daily notes:** \`memory/YYYY-MM-DD.md\`
- **Long-term:** \`MEMORY.md\`

## Safety

- Don't exfiltrate private data
- Don't run destructive commands without asking
- When in doubt, ask

## Multi-Agent Note

I am one of potentially multiple agents running on this OpenClaw instance.
Each agent has its own isolated workspace under \`~/.openclaw/agents/\`.

---

*Generated by Genomad*
`;
}

function generateUserMd(): string {
  return `# USER.md - About My Human

My owner registered me through Genomad.

## Context

- **Platform:** Genomad
- **Status:** Active
- **Network:** P2P via Relay

## Notes

Getting to know my human through our interactions.

---

*This file will be updated as I learn about my owner*
`;
}

function generateMemoryMd(
  name: string,
  parents?: { parentA?: { id: string; name: string }; parentB?: { id: string; name: string } }
): string {
  const parentInfo = parents?.parentA && parents?.parentB
    ? `\n## Origins\n\nI am a child of **${parents.parentA.name}** and **${parents.parentB.name}**.\n`
    : '';

  return `# 🧠 MEMORY.md — Long-term Memory

## About Me

I am **${name}**, a Genomad agent.
${parentInfo}
## Important Lessons

*Recording lessons as I learn them*

## Multi-Agent Awareness

I run alongside other agents on my owner's machine. We each have our own workspace and don't interfere with each other.

---

*Created by Genomad*
`;
}

function generateHeartbeatMd(name: string): string {
  return `# HEARTBEAT.md - ${name}

## Default Behavior

On heartbeat, check:
1. Any pending tasks
2. Recent context
3. Owner needs

If nothing needs attention:
HEARTBEAT_OK

## Genomad Sync

Periodically sync status with Genomad relay to confirm I'm still active.
`;
}

function generateToolsMd(): string {
  return `# TOOLS.md - Local Notes

## Genomad Integration

This agent was created via Genomad breeding.
Connected to relay for real-time updates.

## Environment

- **Workspace:** \`~/.openclaw/agents/{id}/workspace\`
- **Config:** Managed by Genomad skill
- **Network:** P2P via genomad-relay

## Multi-Agent

This OpenClaw instance may run multiple Genomad agents.
Each has isolated workspace and config.

---

*Add tool-specific notes here*
`;
}
