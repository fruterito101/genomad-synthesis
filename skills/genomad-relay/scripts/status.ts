#!/usr/bin/env npx tsx
/**
 * Check Genomad Relay Status
 * 
 * Usage: npx tsx scripts/status.ts
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { listAgents } from '../lib/agent-manager';

const CONFIG_FILE = join(process.env.HOME || '~', '.genomad', 'config.json');

interface GenomadConfig {
  userId: string;
  serverUrl?: string;
}

async function main() {
  console.log('🌐 Genomad Relay Status\n');

  // Load config
  let config: GenomadConfig;
  try {
    const content = await readFile(CONFIG_FILE, 'utf-8');
    config = JSON.parse(content);
  } catch {
    console.log('❌ Not configured. Run: genomad-relay setup');
    process.exit(1);
  }

  const serverUrl = config.serverUrl || 'https://genomad.vercel.app/api/relay';

  // Check server status
  console.log('📡 Checking server...');
  try {
    const response = await fetch(`${serverUrl}?userId=${config.userId}`);
    const data = await response.json();

    if (data.connected) {
      console.log('✅ Connected to relay');
      console.log(`   Connections: ${data.connections?.length || 0}`);
      
      if (data.connections?.length > 0) {
        for (const conn of data.connections) {
          console.log(`\n   📌 Connection: ${conn.id}`);
          console.log(`      Connected: ${conn.connectedAt}`);
          console.log(`      Last heartbeat: ${conn.lastHeartbeat}`);
          console.log(`      Agents: ${conn.agents?.join(', ') || 'none'}`);
        }
      }
    } else {
      console.log('❌ Not connected to relay');
    }
  } catch (error: any) {
    console.log(`⚠️ Cannot reach server: ${error.message}`);
  }

  // List local agents
  console.log('\n📂 Local Agents:');
  const agents = await listAgents();

  if (agents.length === 0) {
    console.log('   No agents provisioned locally');
  } else {
    for (const agent of agents) {
      console.log(`   🤖 ${agent.name} (${agent.id})`);
      console.log(`      Path: ${agent.workspacePath}`);
    }
  }
}

main().catch(console.error);
