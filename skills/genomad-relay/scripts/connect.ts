#!/usr/bin/env npx tsx
/**
 * Connect to Genomad Relay - v2 with Persistence
 * 
 * Usage: npx tsx scripts/connect.ts
 * 
 * Features:
 * - Auto-reconnect on disconnect
 * - Persists state across restarts
 * - Restores agents on reconnect
 */

import { 
  autoConnect, 
  getRelayClient, 
  loadConfig,
  saveConfig,
} from '../lib/relay-client';
import { 
  provisionAgent, 
  deprovisionAgent,
  initializeAgentManager,
  getAgentCount,
} from '../lib/agent-manager';
import { ServerMessage } from '../lib/types';
import { join } from 'path';

const CONFIG_DIR = join(process.env.HOME || '~', '.genomad');

async function handleMessage(message: ServerMessage): Promise<void> {
  const client = getRelayClient();
  if (!client) return;

  switch (message.type) {
    case 'provision-agent':
      console.log(`\n🧬 Provisioning agent: ${message.name}`);
      try {
        const agent = await provisionAgent(message);
        client.registerAgent(agent);
        await client.reportAgentReady(message.agentId, true);
        
        const count = await getAgentCount();
        console.log(`✅ Agent ${message.name} is now online!`);
        console.log(`   Workspace: ${agent.workspacePath}`);
        console.log(`   Agents: ${count.online}/${count.total} (max ${count.max})`);
      } catch (error: any) {
        console.error(`❌ Failed to provision ${message.name}:`, error.message);
        await client.reportAgentReady(message.agentId, false, error.message);
      }
      break;

    case 'deprovision-agent':
      console.log(`\n🗑️ Deprovisioning agent: ${message.agentId}`);
      try {
        await deprovisionAgent(message.agentId);
        client.unregisterAgent(message.agentId);
        console.log(`✅ Agent ${message.agentId} removed`);
      } catch (error: any) {
        console.error(`❌ Failed to deprovision:`, error.message);
      }
      break;

    case 'ping':
      // Silent ping acknowledgment
      break;

    case 'error':
      console.error(`❌ Server error: ${message.message}`);
      break;

    default:
      console.log('📨 Received:', message);
  }
}

function printStatus(status: 'connected' | 'disconnected' | 'reconnecting' | 'error', message?: string): void {
  const icons = {
    connected: '✅',
    disconnected: '❌',
    reconnecting: '🔄',
    error: '⚠️',
  };
  
  const colors = {
    connected: '\x1b[32m',
    disconnected: '\x1b[31m',
    reconnecting: '\x1b[33m',
    error: '\x1b[31m',
  };
  
  const reset = '\x1b[0m';
  
  console.log(`${colors[status]}${icons[status]} ${status.toUpperCase()}${message ? `: ${message}` : ''}${reset}`);
}

async function setup(): Promise<boolean> {
  console.log('\n📋 Setup Genomad Relay\n');
  
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (q: string): Promise<string> => 
    new Promise(resolve => rl.question(q, resolve));

  try {
    console.log('To find your User ID:');
    console.log('1. Go to genomad.vercel.app');
    console.log('2. Connect your wallet');
    console.log('3. Open browser console (F12)');
    console.log('4. Type: localStorage.getItem("privy:user")');
    console.log('5. Copy the "id" field\n');

    const userId = await question('Enter your User ID: ');
    
    if (!userId.trim()) {
      console.log('❌ User ID is required');
      rl.close();
      return false;
    }

    const serverUrl = await question('Server URL (press Enter for default): ');

    const config: { userId: string; serverUrl?: string } = {
      userId: userId.trim(),
    };

    if (serverUrl.trim()) {
      config.serverUrl = serverUrl.trim();
    }

    await saveConfig(config);
    console.log(`\n✅ Config saved to ${CONFIG_DIR}/config.json`);
    
    rl.close();
    return true;

  } catch (error) {
    console.error('Setup error:', error);
    rl.close();
    return false;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║     🧬 Genomad Relay Client v2.0       ║');
  console.log('╚════════════════════════════════════════╝\n');

  // Check if config exists
  let config = await loadConfig();
  
  if (!config) {
    const setupSuccess = await setup();
    if (!setupSuccess) {
      process.exit(1);
    }
    config = await loadConfig();
    if (!config) {
      process.exit(1);
    }
  }

  console.log(`📋 User: ${config.userId}`);
  console.log(`🔗 Server: ${config.serverUrl || 'https://genomad.vercel.app/api/relay'}`);

  // Initialize agent manager
  console.log('\n📂 Initializing agent manager...');
  await initializeAgentManager();
  const count = await getAgentCount();
  console.log(`   Found ${count.total} agent(s)`);

  // Auto-connect with persistence
  console.log('\n🔄 Connecting to relay...');
  const client = await autoConnect();

  if (!client) {
    console.error('❌ Failed to initialize client');
    process.exit(1);
  }

  // Set handlers
  client.onMessage(handleMessage);
  client.onStatusChange(printStatus);

  if (client.isConnected()) {
    console.log('\n✅ Connected! Listening for commands...');
    console.log('   Press Ctrl+C to disconnect\n');
    
    // Show current agents
    const agents = client.getAgents();
    if (agents.length > 0) {
      console.log('📋 Registered agents:');
      for (const agent of agents) {
        const statusIcon = agent.status === 'online' ? '🟢' : '⚪';
        console.log(`   ${statusIcon} ${agent.name} (${agent.id.slice(0, 8)}...)`);
      }
      console.log('');
    }
  } else {
    console.log('\n⚠️ Connection failed. Will keep retrying in background...');
  }

  // Handle graceful shutdown
  const shutdown = async () => {
    console.log('\n\n👋 Disconnecting...');
    await client.disconnect();
    console.log('Goodbye!');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Keep process alive and show periodic status
  const statusInterval = setInterval(() => {
    if (!client.isConnected()) return;
    
    const state = client.getState();
    const agents = client.getAgents();
    const onlineCount = agents.filter(a => a.status === 'online').length;
    
    // Only log if we have agents
    if (agents.length > 0) {
      const uptime = state.connectedAt 
        ? Math.floor((Date.now() - state.connectedAt.getTime()) / 60000)
        : 0;
      console.log(`\r💚 Connected | ${onlineCount}/${agents.length} agents online | Uptime: ${uptime}m    `);
    }
  }, 60000);

  // Cleanup on exit
  process.on('exit', () => {
    clearInterval(statusInterval);
  });
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
