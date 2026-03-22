# 🧬 GENOMAD FASE 4 — On-Chain + ZK Architecture

## Overview

FASE 4 implementa la arquitectura completa on-chain para Genomad:
- **Full on-chain storage**: SOUL.md e IDENTITY.md encriptados en Base
- **ZK Proofs**: RISC Zero para verificación de traits, breeding, custody
- **Custody System**: Propiedad compartida con thresholds
- **Breeding**: Reproducción genética con ZK verification

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│  ActivateAgentModal    │  BreedingExecuteModal              │
│  ZK Client             │  Wallet Encryption                 │
└───────────────────────────────────────────────────────────┬─┘
                                                            │
                    ┌───────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    MONAD BLOCKCHAIN                         │
├─────────────────────────────────────────────────────────────┤
│  GenomadNFT.sol        │  BreedingFactory.sol               │
│  ├─ AgentData          │  ├─ BreedingRequest                │
│  ├─ EncryptedData      │  ├─ Approvals                      │
│  ├─ Custody            │  └─ Execute                        │
│  └─ ZK Verification    │                                    │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    ZK LAYER (RISC Zero)                     │
├─────────────────────────────────────────────────────────────┤
│  7 Proof Types:                                             │
│  1. TraitProof      - Verify traits without revealing       │
│  2. BreedProof      - Verify valid breeding                 │
│  3. CustodyProof    - Verify ownership threshold            │
│  4. ContentProof    - Verify encrypted content              │
│  5. FitnessProof    - Verify fitness calculation            │
│  6. RarityProof     - Verify rarity tier                    │
│  7. LineageProof    - Verify ancestry chain                 │
└─────────────────────────────────────────────────────────────┘
```

## Contracts

### GenomadNFT.sol
- ERC-721 NFT for AI Agents
- On-chain DNA storage (8 traits)
- Encrypted SOUL.md/IDENTITY.md storage
- Custody system with basis points

### BreedingFactory.sol
- Breeding request management
- Dual approval system
- Child custody division (50/50)
- ZK proof verification

### TraitVerifier.sol
- RISC Zero proof verification
- IMAGE_ID validation
- Journal parsing

## Custody Thresholds

| Action | Required |
|--------|----------|
| Activate | ≥50% |
| Deactivate | >50% |
| Update Data | 100% |
| Transfer Custody | Own share |

## ZK Proofs

### IMAGE_ID
```
0x9527671f44310aa24a74dad7fed31b8d856698e4ab70e6f6dd7026a217d34d87
```

### Proof Types

1. **TraitProof**: Commits to 8 traits without revealing values
2. **BreedProof**: Verifies crossover + mutation bounds
3. **CustodyProof**: Proves threshold ownership
4. **ContentProof**: Proves content matches hash
5. **FitnessProof**: Proves fitness calculation
6. **RarityProof**: Proves rarity tier assignment
7. **LineageProof**: Proves ancestry chain

## Skill Commands

| Command | Description |
|---------|-------------|
| `/genomad-register [code]` | Register + link |
| `/genomad-status` | On-chain status |
| `/genomad-read-self` | Read encrypted data |
| `/genomad-custody` | Check custody % |
| `/genomad-approve-breeding <id>` | Approve breeding |
| `/genomad-reject-breeding <id>` | Reject breeding |
| `/genomad-check-pending` | Pending requests |
| `/genomad-sync` | Sync to Base |

## Files Created

### Frontend
- `src/lib/crypto/wallet-encryption.ts` - AES-256-GCM
- `src/lib/zk/client.ts` - ZK proof generation
- `src/lib/zk/index.ts` - Exports
- `src/components/ActivateAgentModal.tsx`
- `src/components/BreedingExecuteModal.tsx`

### Contracts
- `contracts/src/GenomadNFT.sol`
- `contracts/src/BreedingFactory.sol`
- `contracts/src/TraitVerifier.sol`
- `contracts/src/IGenomad.sol`
- `contracts/src/zk/GenomadVerifier.sol`
- `contracts/src/zk/IRiscZeroVerifier.sol`

### ZK (RISC Zero)
- `zk-risc0/genomad_zk/methods/guest/src/main.rs`
- `zk-risc0/genomad_zk/host/src/main.rs`

### CLI
- `cli/run-chain-agent.ts`
- `cli/package.json`

### Tests
- `tests/e2e/genomad.test.ts`

### Skill
- `~/.openclaw/workspace/skills/genomad/`
- GitHub: https://github.com/fruterito101/genomad-skill

## Commits

| Commit | Description |
|--------|-------------|
| f78bfd3 | RISC Zero migration |
| af9bbce | ULTRA 7-proof system |
| 6d105a8 | Frontend 4.9-4.11 |
| 2ca7843 | Breeding Execute Modal |
| 111643e | Skill v3.0 update |

## Deploy Checklist

- [ ] Deploy RiscZeroVerifierRouter on Base (~-7)
- [ ] Deploy GenomadNFT with verifier address
- [ ] Deploy BreedingFactory with NFT address
- [ ] Update contract addresses in frontend
- [ ] Enable real ZK proofs (disable dev mode)
- [ ] Deploy frontend to Vercel

## UX Golden Rule

> Usuario solo ve Activar en Base → Firma → Listo
> CERO complejidad técnica visible

---

*FASE 4 Complete — Full On-Chain + ZK* 🧬⛓️
