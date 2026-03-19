# Genomad Relay Skill

Connect your OpenClaw to the Genomad P2P network. When you breed agents on Genomad, they automatically provision on YOUR machine.

## Quick Start

```bash
# 1. Configure your user ID (from Genomad dashboard)
mkdir -p ~/.genomad
echo '{"userId":"your-privy-user-id"}' > ~/.genomad/config.json

# 2. Connect to relay
npx tsx scripts/connect.ts
```

## How It Works

```
GENOMAD (Web)                    YOUR MACHINE
┌──────────────────┐             ┌──────────────────┐
│  genomad.vercel  │◀───────────▶│  OpenClaw        │
│  .app/api/relay  │   polling   │  + this skill    │
│                  │             │                  │
│  "Activate"      │────────────▶│  Provisions      │
│  button click    │             │  agent locally   │
└──────────────────┘             └──────────────────┘
```

1. You connect this skill to Genomad
2. When you click "Activate" on a bred agent
3. Genomad sends provision command via relay
4. Your OpenClaw creates the agent workspace
5. Agent runs on YOUR compute, not Genomad's

## Commands

### Connect to Relay
```bash
npx tsx scripts/connect.ts
```
Keeps running and listens for commands. Press Ctrl+C to disconnect.

### Check Status
```bash
npx tsx scripts/status.ts
```
Shows connection status and local agents.

### List Local Agents
```bash
ls ~/.openclaw/agents/
```

## Configuration

Create `~/.genomad/config.json`:

```json
{
  "userId": "your-privy-user-id",
  "serverUrl": "https://genomad.vercel.app/api/relay"
}
```

### Finding Your User ID

1. Go to genomad.vercel.app
2. Connect your wallet
3. Open browser console
4. Type: `localStorage.getItem('privy:user')`
5. Copy the `id` field

## Agent Workspace Structure

When an agent is provisioned:

```
~/.openclaw/agents/{agentId}/
└── workspace/
    ├── SOUL.md        # Agent personality (generated from traits)
    ├── IDENTITY.md    # Agent metadata
    ├── AGENTS.md      # Workspace instructions
    ├── USER.md        # Owner info
    ├── MEMORY.md      # Long-term memory
    ├── HEARTBEAT.md   # Heartbeat behavior
    ├── TOOLS.md       # Tool notes
    ├── traits.json    # Raw trait values
    └── memory/        # Daily memory files
```

## Running Agents

After provisioning, agents exist as workspaces. To actually run them:

1. **Manual:** Point OpenClaw at the workspace
2. **Binding:** Configure Telegram/Discord bot for the agent
3. **Multi-agent:** Use OpenClaw's agent management

## Troubleshooting

### "Config not found"
Create the config file with your Privy user ID.

### "Failed to connect"
- Check your internet connection
- Verify serverUrl is correct
- Check Genomad server status

### Agent not provisioning
- Ensure you're connected (`scripts/connect.ts` running)
- Check relay status on Genomad dashboard
- Look at console logs for errors

## Architecture

This skill uses HTTP polling (not WebSockets) for Vercel compatibility:

1. Client polls server every 30 seconds
2. Server queues messages for client
3. Client receives messages on next poll
4. ~30s latency for commands (acceptable for provisioning)

Future: Real WebSocket support when using dedicated server.
