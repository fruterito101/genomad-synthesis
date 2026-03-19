// ═══════════════════════════════════════════════════════════════════
// OPENCLAW CONFIG MANAGER
// Manages openclaw.json to add/remove agents and bindings
// ═══════════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, existsSync, copyFileSync } from "fs";
import { join } from "path";
import type { OpenClawAgentConfig, AgentBinding } from "./types";

// ═══════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════

const OPENCLAW_CONFIG_PATH = process.env.OPENCLAW_CONFIG_PATH ||
  join(process.env.HOME || "", ".openclaw/openclaw.json");

const BACKUP_SUFFIX = ".backup";

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface OpenClawConfig {
  agents?: Record<string, AgentConfigEntry>;
  bindings?: Record<string, BindingEntry>;
  [key: string]: unknown;
}

interface AgentConfigEntry {
  workspace: string;
  model?: string;
  [key: string]: unknown;
}

interface BindingEntry {
  agent: string;
  [key: string]: unknown;
}

// ═══════════════════════════════════════════════════════════════════
// FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Read openclaw.json config
 */
export function readConfig(): OpenClawConfig | null {
  try {
    if (!existsSync(OPENCLAW_CONFIG_PATH)) {
      return null;
    }
    const content = readFileSync(OPENCLAW_CONFIG_PATH, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading openclaw.json:", error);
    return null;
  }
}

/**
 * Write openclaw.json config with backup
 */
export function writeConfig(config: OpenClawConfig): { success: boolean; error?: string } {
  try {
    // Create backup first
    if (existsSync(OPENCLAW_CONFIG_PATH)) {
      copyFileSync(OPENCLAW_CONFIG_PATH, OPENCLAW_CONFIG_PATH + BACKUP_SUFFIX);
    }
    
    // Write new config
    writeFileSync(
      OPENCLAW_CONFIG_PATH,
      JSON.stringify(config, null, 2),
      "utf-8"
    );
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Restore config from backup
 */
export function restoreConfig(): { success: boolean; error?: string } {
  const backupPath = OPENCLAW_CONFIG_PATH + BACKUP_SUFFIX;
  
  try {
    if (!existsSync(backupPath)) {
      return { success: false, error: "No backup found" };
    }
    
    copyFileSync(backupPath, OPENCLAW_CONFIG_PATH);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Add agent to openclaw.json
 */
export function addAgentToConfig(
  agentId: string,
  workspacePath: string,
  model: string = "anthropic/claude-sonnet-4"
): { success: boolean; error?: string } {
  const config = readConfig();
  
  if (!config) {
    return { success: false, error: "Could not read openclaw.json" };
  }
  
  // Initialize agents object if not exists
  if (!config.agents) {
    config.agents = {};
  }
  
  // Check for duplicate
  if (config.agents[agentId]) {
    return { success: false, error: `Agent ${agentId} already exists in config` };
  }
  
  // Add agent
  config.agents[agentId] = {
    workspace: workspacePath,
    model,
  };
  
  return writeConfig(config);
}

/**
 * Remove agent from openclaw.json
 */
export function removeAgentFromConfig(agentId: string): { success: boolean; error?: string } {
  const config = readConfig();
  
  if (!config) {
    return { success: false, error: "Could not read openclaw.json" };
  }
  
  // Remove agent
  if (config.agents && config.agents[agentId]) {
    delete config.agents[agentId];
  }
  
  // Remove any bindings pointing to this agent
  if (config.bindings) {
    for (const [bindingId, binding] of Object.entries(config.bindings)) {
      if (binding.agent === agentId) {
        delete config.bindings[bindingId];
      }
    }
  }
  
  return writeConfig(config);
}

/**
 * Add binding for an agent
 */
export function addBinding(
  bindingId: string,
  agentId: string,
  bindingConfig: Record<string, unknown> = {}
): { success: boolean; error?: string } {
  const config = readConfig();
  
  if (!config) {
    return { success: false, error: "Could not read openclaw.json" };
  }
  
  // Verify agent exists
  if (!config.agents || !config.agents[agentId]) {
    return { success: false, error: `Agent ${agentId} not found in config` };
  }
  
  // Initialize bindings if not exists
  if (!config.bindings) {
    config.bindings = {};
  }
  
  // Check for duplicate
  if (config.bindings[bindingId]) {
    return { success: false, error: `Binding ${bindingId} already exists` };
  }
  
  // Add binding
  config.bindings[bindingId] = {
    agent: agentId,
    ...bindingConfig,
  };
  
  return writeConfig(config);
}

/**
 * Remove binding
 */
export function removeBinding(bindingId: string): { success: boolean; error?: string } {
  const config = readConfig();
  
  if (!config) {
    return { success: false, error: "Could not read openclaw.json" };
  }
  
  if (config.bindings && config.bindings[bindingId]) {
    delete config.bindings[bindingId];
  }
  
  return writeConfig(config);
}

/**
 * Get all agents from config
 */
export function getAgents(): Record<string, AgentConfigEntry> {
  const config = readConfig();
  return config?.agents || {};
}

/**
 * Get all bindings from config
 */
export function getBindings(): Record<string, BindingEntry> {
  const config = readConfig();
  return config?.bindings || {};
}

/**
 * Check if agent exists in config
 */
export function agentExistsInConfig(agentId: string): boolean {
  const config = readConfig();
  return !!(config?.agents && config.agents[agentId]);
}

/**
 * Update agent bindings (for channel routing)
 */
export function updateAgentBindings(
  agentId: string,
  telegramChatId?: string,
  discordChannelId?: string
): { success: boolean; error?: string } {
  const config = readConfig();
  
  if (!config) {
    return { success: false, error: "Could not read openclaw.json" };
  }
  
  if (!config.bindings) {
    config.bindings = {};
  }
  
  // Add Telegram binding if provided
  if (telegramChatId) {
    const bindingId = `telegram:${agentId}`;
    config.bindings[bindingId] = {
      agent: agentId,
      channel: "telegram",
      chatId: telegramChatId,
    };
  }
  
  // Add Discord binding if provided
  if (discordChannelId) {
    const bindingId = `discord:${agentId}`;
    config.bindings[bindingId] = {
      agent: agentId,
      channel: "discord",
      channelId: discordChannelId,
    };
  }
  
  return writeConfig(config);
}
