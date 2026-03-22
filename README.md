# 🧬 GENOMAD

### AI Agent Identity Infrastructure — On-Chain

> Humans evolve. Now agents do too.

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black)](https://genomad-synthesis.vercel.app)
[![Chain](https://img.shields.io/badge/Chain-Base-blue)](https://basescan.org)
[![ERC-8004](https://img.shields.io/badge/Standard-ERC--8004-purple)](https://eips.ethereum.org/EIPS/eip-8004)
[![Tests](https://img.shields.io/badge/Tests-131%2B%20passing-green)]()
[![License](https://img.shields.io/badge/License-MIT-blue)]()

---

## 📑 Table of Contents

- [What is Genomad?](#-what-is-genomad)
- [ERC-8004 Compliance](#-erc-8004-compliance)
- [Smart Contracts](#-smart-contracts)
- [Quick Start](#-quick-start)
- [Architecture](#-architecture)
- [API Reference](#-api-reference)
- [Genetic System](#-genetic-system)
- [ZK Proofs](#-zk-proofs)
- [Contributing](#-contributing)

---

## 🌟 What is Genomad?

**Genomad** is an AI agent identity infrastructure that gives agents genetic traits, lineage, and verifiable reputation on-chain.

### Features

- 🧬 **Unique DNA** — 8 genetic traits define each agent personality
- ⛓️ **On-Chain** — Agents as NFTs with verifiable data on Base
- 🔐 **ZK Privacy** — Encrypted traits, proofs verify without revealing
- 🧪 **Breeding** — Cross agents to create new generations
- 👥 **Multi-Owner Custody** — Shared ownership with percentage-based control
- 📊 **Fitness Score** — Trait-based scoring system
- 🏆 **Leaderboard** — Compete for the best genes

---

## 🔗 ERC-8004 Compliance

Genomad implements the [ERC-8004 Trustless Agents](https://eips.ethereum.org/EIPS/eip-8004) standard:

| Feature | Implementation |
|---------|----------------|
| **Identity Registry** | GenomadNFT extends ERC-721 with agentURI |
| **Agent URI** | `setAgentURI()` / `agentURI()` for registration files |
| **Metadata** | `getMetadata()` / `setMetadata()` for extensible data |
| **Agent Wallet** | `setAgentWallet()` with EIP-712 signature verification |
| **Registration** | `register()` / `register(uri)` for ERC-8004 minting |

### Agent Registration File

```json
{
  "type": "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  "name": "Genomad",
  "services": [...],
  "registrations": [{"agentId": 35797, "agentRegistry": "eip155:8453:0x8004..."}],
  "supportedTrust": ["reputation", "validation"]
}
```

---

## 🔗 Smart Contracts

**Network:** Base Mainnet (Chain ID: 8453)

| Contract | Description |
|----------|-------------|
| **GenomadNFT** | Main agent NFT with ERC-8004 compliance |
| **BreedingFactory** | Breeding logic with custody division |
| **TraitVerifier** | ZK verification on-chain |

---

## 🚀 Quick Start

### Requirements

- Node.js 20+
- Bun 1.0+ (or npm/pnpm)
- PostgreSQL (or Neon)

### Installation

```bash
# Clone repo
git clone https://github.com/fruterito101/genomad-synthesis.git
cd genomad-synthesis

# Install dependencies
bun install

# Configure environment variables
cp .env.example .env.local

# Migrate database
bun run db:push

# Start development
bun run dev
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Auth (Privy)
NEXT_PUBLIC_PRIVY_APP_ID="..."
PRIVY_APP_SECRET="..."

# Blockchain
NEXT_PUBLIC_CHAIN_ID="8453"
NEXT_PUBLIC_NETWORK="mainnet"
PRIVATE_KEY="0x..."

# Contracts (after deployment)
NEXT_PUBLIC_MAINNET_GENOMAD_NFT="0x..."
NEXT_PUBLIC_MAINNET_BREEDING_FACTORY="0x..."
NEXT_PUBLIC_MAINNET_TRAIT_VERIFIER="0x..."
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      GENOMAD STACK                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Frontend (Next.js)                                         │
│  ├── React 19 + TypeScript                                  │
│  ├── Tailwind CSS + shadcn/ui                               │
│  ├── Three.js (DNA visuals)                                 │
│  └── Framer Motion (animations)                             │
│                                                             │
│  Backend (Next.js API Routes)                               │
│  ├── Drizzle ORM + PostgreSQL                               │
│  ├── Privy Auth                                             │
│  ├── Vitest (131+ tests)                                    │
│  └── Rate Limiting (Redis/Memory)                           │
│                                                             │
│  Blockchain (Base)                                          │
│  ├── Solidity Contracts (ERC-8004)                          │
│  ├── viem/wagmi                                             │
│  └── ZK Proofs (RISC Zero ready)                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧬 Genetic System

### 8 Traits

| Trait | Emoji | Description |
|-------|-------|-------------|
| technical | 💻 | Technical skills |
| creativity | 🎨 | Creative thinking |
| social | 🤝 | Social interaction |
| analysis | 📊 | Analytical capacity |
| empathy | 💜 | Emotional connection |
| trading | 📈 | Financial instinct |
| teaching | 📚 | Teaching ability |
| leadership | 👑 | Leadership |

### Breeding Algorithm

```
Parent A: [80, 65, 70, 55, 60, 45, 75, 50]
Parent B: [70, 75, 60, 65, 55, 50, 80, 45]
                    ↓
          Crossover + Mutation
                    ↓
Child:    [75, 70, 65, 60, 58, 48, 78, 48]
```

- **Crossover:** Each trait comes from one parent (50% probability)
- **Mutation:** ±10 points max per trait
- **Fitness:** Sum of all traits (max 800)

### Rarity Levels

| Level | Fitness | Color |
|-------|---------|-------|
| Common | < 320 | ⚪ |
| Uncommon | 320-479 | 🟢 |
| Rare | 480-599 | 🔵 |
| Epic | 600-719 | 🟣 |
| Legendary | 720+ | 🟡 |

---

## 🔐 ZK Proofs

Genomad uses Zero-Knowledge proofs for privacy:

- **Trait Proof:** "I have these traits" without revealing values
- **Breed Proof:** "This child is valid" without revealing genetics
- **Custody Proof:** "I have X% custody" without revealing shareholders

### Configuration

```env
# Mock (development/hackathon)
NEXT_PUBLIC_ZK_DEV_MODE=true

# Production (RISC Zero real)
NEXT_PUBLIC_ZK_DEV_MODE=false
NEXT_PUBLIC_ZK_API_URL=https://zk-server.example.com
```

---

## 🧪 Testing

```bash
# Unit tests
bun run test

# E2E tests
bun run test:e2e

# Coverage
bun run test:coverage
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🔗 Links

- **App:** [genomad-synthesis.vercel.app](https://genomad-synthesis.vercel.app)
- **ERC-8004:** [eips.ethereum.org/EIPS/eip-8004](https://eips.ethereum.org/EIPS/eip-8004)
- **Synthesis Hackathon:** [synthesis.devfolio.co](https://synthesis.devfolio.co)

---

<p align="center">
  🧬 <strong>Genomad</strong> — Your agent, on-chain
</p>
