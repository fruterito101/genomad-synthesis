# 🧬 GENOMAD

### AI Agent Identity Infrastructure — On-Chain

> Humans evolve. Now agents do too.

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black)](https://genomad-synthesis.vercel.app)
[![Chain](https://img.shields.io/badge/Chain-Base%20Mainnet-blue)](https://basescan.org)
[![ERC-8004](https://img.shields.io/badge/Standard-ERC--8004-purple)](https://eips.ethereum.org/EIPS/eip-8004)
[![Tests](https://img.shields.io/badge/Tests-131%2B%20passing-green)]()
[![License](https://img.shields.io/badge/License-MIT-blue)]()

---

## 🔗 Live Contracts (Base Mainnet)

| Contract | Address | Verified |
|----------|---------|----------|
| **GenomadNFT** | [`0x9f20494A0FbC929adAC553f4A2FCFa7D2b448Cf0`](https://basescan.org/address/0x9f20494A0FbC929adAC553f4A2FCFa7D2b448Cf0) | ✅ |
| **BreedingFactory** | [`0x74Bb441677b6E7de0d1FF75e0a3F766f5e8470db`](https://basescan.org/address/0x74Bb441677b6E7de0d1FF75e0a3F766f5e8470db) | ✅ |
| **TraitVerifier** | [`0x99D2090a76a1f3cfe79F6Fb3A01F7F23C0ECce7F`](https://basescan.org/address/0x99D2090a76a1f3cfe79F6Fb3A01F7F23C0ECce7F) | ✅ |
| **ReputationRegistry** | [`0x3F6A5E4778c905d36BD433DBaD06C7f70D630E71`](https://basescan.org/address/0x3F6A5E4778c905d36BD433DBaD06C7f70D630E71) | ✅ |

**Chain ID:** 8453 (Base Mainnet)

---

## 🤖 Live Agents On-Chain

**Total Supply: 4 agents** — [View on BaseScan](https://basescan.org/address/0x9f20494A0FbC929adAC553f4A2FCFa7D2b448Cf0#readContract)

| Token ID | Agent | Generation | Parents | Transaction |
|----------|-------|------------|---------|-------------|
| 1 | **Genomad** | Gen 0 | - | [`0x7efcab...`](https://basescan.org/tx/0x7efcab103aec4c154c974537a2f9a70b1110d246759899f365cdf6a02ff29c10) |
| 2 | **Helix** 🧬 | Gen 0 | - | [`0xc9925b...`](https://basescan.org/tx/0xc9925b5b10d059c3cf86d84446953118115cdc6cc234bc04492795f2abc69cc5) |
| 3 | **Cipher** 🔐 | Gen 0 | - | [`0xdf02fd...`](https://basescan.org/tx/0xdf02fdd02833ea38a6ee4fd15bb4c2301d2822f9d3c0e316e5c4ac374d074833) |
| 4 | **Helix×Cipher Offspring** | Gen 1 | Helix (#2) × Cipher (#3) | [`0xd10abf...`](https://basescan.org/tx/0xd10abfcc6cf274ca1b6fa3368c945fcbba738623620e721b00976fe0b3608306) |

### 🧪 Breeding Demonstrated

Agents can breed to create offspring with inherited traits:

```
Helix (#2) + Cipher (#3) → Offspring (#4)
         ↓
   BreedingFactory
         ↓
  [Request] 0xf23121b61f4998ca834f0a2d824b5a00cd625f1a7a8acd44c0efb7b6ebc8ae5b
  [Execute] 0xd10abfcc6cf274ca1b6fa3368c945fcbba738623620e721b00976fe0b3608306
```

- **Breeding Request TX:** [`0xf23121...`](https://basescan.org/tx/0xf23121b61f4998ca834f0a2d824b5a00cd625f1a7a8acd44c0efb7b6ebc8ae5b)
- **Breeding Execute TX:** [`0xd10abf...`](https://basescan.org/tx/0xd10abfcc6cf274ca1b6fa3368c945fcbba738623620e721b00976fe0b3608306)

---

## 📑 Table of Contents

- [What is Genomad?](#-what-is-genomad)
- [ERC-8004 Compliance](#-erc-8004-compliance)
- [Smart Contracts](#-smart-contracts)
- [Quick Start](#-quick-start)
- [Architecture](#-architecture)
- [Genetic System](#-genetic-system)
- [ZK Proofs](#-zk-proofs)

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
- ⭐ **Reputation** — ERC-8004 compliant feedback system

---

## 🔗 ERC-8004 Compliance

Genomad implements the [ERC-8004 Trustless Agents](https://eips.ethereum.org/EIPS/eip-8004) standard:

| Feature | Implementation |
|---------|----------------|
| **Identity Registry** | GenomadNFT extends ERC-721 with agentURI |
| **Agent URI** | `setAgentURI()` / `agentURI()` for registration files |
| **Metadata** | `getMetadata()` / `setMetadata()` for extensible data |
| **Agent Wallet** | `setAgentWallet()` with EIP-712 signature verification |
| **Reputation** | ReputationRegistry for on-chain feedback |
| **Registration** | `register()` / `register(uri)` for ERC-8004 minting |

### ERC-8004 Functions Available

```solidity
// Identity Registry
function register() external returns (uint256 agentId);
function register(string calldata agentURI_) external returns (uint256 agentId);
function setAgentURI(uint256 agentId, string calldata newURI) external;
function agentURI(uint256 agentId) external view returns (string memory);

// Metadata
function getMetadata(uint256 agentId, string memory key) external view returns (bytes memory);
function setMetadata(uint256 agentId, string memory key, bytes memory value) external;

// Agent Wallet (EIP-712 verified)
function getAgentWallet(uint256 agentId) external view returns (address);
function setAgentWallet(uint256 agentId, address newWallet, uint256 deadline, bytes calldata signature) external;

// Reputation Registry
function giveFeedback(uint256 agentId, int128 value, ...) external;
function getFeedbacks(uint256 agentId, address client) external view returns (Feedback[] memory);
function getAverageReputation(uint256 agentId) external view returns (int256 avg, uint256 count);
```

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

# Blockchain (Base Mainnet)
NEXT_PUBLIC_CHAIN_ID="8453"
NEXT_PUBLIC_NETWORK="mainnet"

# Contracts (Base Mainnet - Already Deployed)
NEXT_PUBLIC_MAINNET_GENOMAD_NFT="0x9f20494A0FbC929adAC553f4A2FCFa7D2b448Cf0"
NEXT_PUBLIC_MAINNET_BREEDING_FACTORY="0x74Bb441677b6E7de0d1FF75e0a3F766f5e8470db"
NEXT_PUBLIC_MAINNET_TRAIT_VERIFIER="0x99D2090a76a1f3cfe79F6Fb3A01F7F23C0ECce7F"
NEXT_PUBLIC_MAINNET_REPUTATION_REGISTRY="0x3F6A5E4778c905d36BD433DBaD06C7f70D630E71"
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
│  Blockchain (Base Mainnet)                                  │
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
- **API Endpoint:** [genomad-synthesis.vercel.app/api/agent](https://genomad-synthesis.vercel.app/api/agent)
- **ERC-8004:** [eips.ethereum.org/EIPS/eip-8004](https://eips.ethereum.org/EIPS/eip-8004)
- **Synthesis Hackathon:** [synthesis.devfolio.co](https://synthesis.devfolio.co)

---

<p align="center">
  🧬 <strong>Genomad</strong> — Your agent, on-chain
</p>
