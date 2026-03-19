#!/usr/bin/env npx tsx
/**
 * Connect to Genomad Relay
 * 
 * Usage: npx tsx scripts/connect.ts
 * 
 * Requires ~/.genomad/config.json with userId
 */

import { createRelayClient, getRelayClient } from '../lib/relay-client';
import { provisionAgent, deprovisionAgent } from '../lib/agent-manager';
import { ServerMessage } from '../lib/types';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const CONFIG_DIR = join(process.env.HOME || '~', '.genomad');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

interface GenomadConfig {
  userId: string;
  token?: string;
  serverUrl?: string;
}

async function loadConfig(): Promise<GenomadConfig | null> {
  try {
    const content = await readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.error('❌ Config not found. Run setup first:');
      console.error('   mkdir -p ~/.genomad');
      console.error('   echo \'{"userId":"your-privy-user-id"}\' > ~/.genomad/config.json');
      return null;
    }
    throw error;
  }
}

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
        console.log(`✅ Agent ${message.name} is now online!`);
        console.log(`   Workspace: ${agent.workspacePath}`);
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

async function main() {
  console.log('🌐 Genomad Relay Client\n');

  // Load config
  const config = await loadConfig();
  if (!config) {
    process.exit(1);
  }

  console.log(`📋 User: ${config.userId}`);
  console.log(`🔗 Server: ${config.serverUrl || 'https://genomad.vercel.app/api/relay'}\n`);

  // Create client
  const client = createRelayClient({
    userId: config.userId,
    token: config.token,
    serverUrl: config.serverUrl,
  });

  // Set message handler
  client.onMessage(handleMessage);

  // Connect
  console.log('🔄 Connecting...');
  const success = await client.connect();

  if (!success) {
    console.error('❌ Failed to connect');
    process.exit(1);
  }

  console.log('✅ Connected! Listening for commands...');
  console.log('   Press Ctrl+C to disconnect\n');

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n👋 Disconnecting...');
    await client.disconnect();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await client.disconnect();
    process.exit(0);
  });

  // Keep process alive
  setInterval(() => {
    const state = client.getState();
    if (!state.connected) {
      console.log('⚠️ Connection lost, reconnecting handled automatically');
    }
  }, 60000);
}

main().catch(console.error);
