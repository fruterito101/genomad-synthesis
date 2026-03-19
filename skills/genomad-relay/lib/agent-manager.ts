/**
 * Agent Manager
 * 
 * Handles local provisioning and deprovisioning of Genomad agents.
 * Creates workspace directories and configuration files.
 */

import { mkdir, writeFile, rm, access, readdir } from 'fs/promises';
import { join } from 'path';
import { ServerProvisionAgentMessage, AgentState } from './types';

const DEFAULT_AGENTS_DIR = `${process.env.HOME}/.openclaw/agents`;

/**
 * Provision a new agent locally
 */
export async function provisionAgent(
  message: ServerProvisionAgentMessage,
  agentsDir: string = DEFAULT_AGENTS_DIR
): Promise<AgentState> {
  const { agentId, name, soul, identity, traits, parents } = message;
  const workspacePath = join(agentsDir, agentId, 'workspace');
  const memoryPath = join(workspacePath, 'memory');

  console.log(`[AgentManager] Provisioning agent ${name} (${agentId})`);

  try {
    // Create directories
    await mkdir(workspacePath, { recursive: true });
    await mkdir(memoryPath, { recursive: true });

    // Write SOUL.md
    await writeFile(join(workspacePath, 'SOUL.md'), soul);

    // Write IDENTITY.md
    await writeFile(join(workspacePath, 'IDENTITY.md'), identity);

    // Write AGENTS.md
    const agentsMd = generateAgentsMd(name);
    await writeFile(join(workspacePath, 'AGENTS.md'), agentsMd);

    // Write USER.md
    const userMd = generateUserMd();
    await writeFile(join(workspacePath, 'USER.md'), userMd);

    // Write MEMORY.md
    const memoryMd = generateMemoryMd(name, parents);
    await writeFile(join(workspacePath, 'MEMORY.md'), memoryMd);

    // Write HEARTBEAT.md
    const heartbeatMd = generateHeartbeatMd(name);
    await writeFile(join(workspacePath, 'HEARTBEAT.md'), heartbeatMd);

    // Write TOOLS.md
    const toolsMd = generateToolsMd();
    await writeFile(join(workspacePath, 'TOOLS.md'), toolsMd);

    // Write traits.json (for reference)
    await writeFile(
      join(workspacePath, 'traits.json'),
      JSON.stringify({ traits, parents }, null, 2)
    );

    console.log(`[AgentManager] Agent ${name} provisioned at ${workspacePath}`);

    return {
      id: agentId,
      name,
      status: 'online',
      workspacePath,
    };

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
  agentsDir: string = DEFAULT_AGENTS_DIR
): Promise<void> {
  const agentPath = join(agentsDir, agentId);

  console.log(`[AgentManager] Deprovisioning agent ${agentId}`);

  try {
    // Check if directory exists
    await access(agentPath);
    
    // Remove the entire agent directory
    await rm(agentPath, { recursive: true, force: true });
    
    console.log(`[AgentManager] Agent ${agentId} deprovisioned`);

  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.warn(`[AgentManager] Agent ${agentId} directory not found`);
      return;
    }
    throw error;
  }
}

/**
 * List all provisioned agents
 */
export async function listAgents(
  agentsDir: string = DEFAULT_AGENTS_DIR
): Promise<AgentState[]> {
  try {
    await access(agentsDir);
    const entries = await readdir(agentsDir, { withFileTypes: true });
    
    const agents: AgentState[] = [];
    
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      
      const workspacePath = join(agentsDir, entry.name, 'workspace');
      try {
        await access(join(workspacePath, 'SOUL.md'));
        
        // Try to read name from IDENTITY.md
        let name = entry.name;
        try {
          const { readFile } = await import('fs/promises');
          const identity = await readFile(join(workspacePath, 'IDENTITY.md'), 'utf-8');
          const nameMatch = identity.match(/\*\*Name:\*\*\s*(.+)/);
          if (nameMatch) {
            name = nameMatch[1].trim();
          }
        } catch {}
        
        agents.push({
          id: entry.name,
          name,
          status: 'offline', // Status will be updated by relay
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
  agentsDir: string = DEFAULT_AGENTS_DIR
): Promise<boolean> {
  try {
    await access(join(agentsDir, agentId, 'workspace', 'SOUL.md'));
    return true;
  } catch {
    return false;
  }
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

---

*Add tool-specific notes here*
`;
}
