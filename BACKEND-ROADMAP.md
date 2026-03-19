# 🔧 GENOMAD — Backend Roadmap

> Sistema de procesos ordenado por prioridad
> Todo lo necesario para que el proyecto quede al 100%

**Última actualización:** 2026-02-14 22:36 UTC
**Deadline:** Feb 15, 2026 23:59 ET (~25 horas)

---

## 📊 Resumen de Estado

| Categoría | Progreso | Crítico |
|-----------|----------|---------|
| Smart Contracts | 0% | 🔴 SÍ |
| ZK Circuits | 0% | 🟡 MEDIO |
| Backend Services | 20% | 🔴 SÍ |
| API Routes | 0% | 🟡 MEDIO |
| Database/State | 0% | 🟡 MEDIO |
| Testing | 0% | 🟢 BAJO |
| Deploy | 0% | 🔴 SÍ |

---

## 🔴 PRIORIDAD 1 — CRÍTICO (Hacer primero)

### 1.1 Smart Contracts Base

**Tiempo estimado:** 2-3 horas
**Ubicación:** `contracts/`

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| 1.1.1 | Crear `AgentRegistry.sol` | `contracts/AgentRegistry.sol` | ⬜ |
| 1.1.2 | Crear `BreedingFactory.sol` | `contracts/BreedingFactory.sol` | ⬜ |
| 1.1.3 | Crear `DNAVerifier.sol` | `contracts/DNAVerifier.sol` | ⬜ |
| 1.1.4 | Crear interfaces | `contracts/interfaces/` | ⬜ |
| 1.1.5 | Deploy a Monad Testnet | - | ⬜ |
| 1.1.6 | Verificar contratos | - | ⬜ |

**AgentRegistry.sol debe incluir:**
```solidity
- registerAgent(dnaHash, generation, parentA, parentB)
- getAgent(agentId)
- transferOwnership(agentId, newOwner)
- getLineage(agentId)
- isOwner(agentId, address)
```

**BreedingFactory.sol debe incluir:**
```solidity
- breed(parentAId, parentBId, childDnaHash)
- validateBreeding(parentA, parentB)
- getChildren(agentId)
- getBreedingHistory(agentId)
```

---

### 1.2 Genesis Agents Data

**Tiempo estimado:** 30 min
**Ubicación:** `src/backend/data/`

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| 1.2.1 | Definir DNA de Jazzita | `genesis/jazzita.json` | ⬜ |
| 1.2.2 | Definir DNA de Fruterito | `genesis/fruterito.json` | ⬜ |
| 1.2.3 | Generar DNA hashes | - | ⬜ |
| 1.2.4 | Registrar en contrato | - | ⬜ |

**Jazzita DNA (de documento oficial):**
```json
{
  "creativity": 92,
  "analysis": 85,
  "communication": 88,
  "execution": 87,
  "ethics": 94,
  "social": 85,
  "technical": 70,
  "leadership": 80
}
```

---

### 1.3 Breeding Service Completo

**Tiempo estimado:** 1-2 horas
**Ubicación:** `src/backend/services/`

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| 1.3.1 | Completar breeding.ts | `services/breeding.ts` | 🟡 Parcial |
| 1.3.2 | Agregar DNA hashing | `services/dna.ts` | ⬜ |
| 1.3.3 | Conectar con blockchain | `services/blockchain.ts` | ⬜ |
| 1.3.4 | Agregar validaciones | `services/validation.ts` | ⬜ |

---

## 🟠 PRIORIDAD 2 — IMPORTANTE (Después de P1)

### 2.1 API Routes

**Tiempo estimado:** 1-2 horas
**Ubicación:** `src/app/api/`

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| 2.1.1 | GET /api/agents | `api/agents/route.ts` | ⬜ |
| 2.1.2 | GET /api/agents/[id] | `api/agents/[id]/route.ts` | ⬜ |
| 2.1.3 | POST /api/breed | `api/breed/route.ts` | ⬜ |
| 2.1.4 | GET /api/lineage/[id] | `api/lineage/[id]/route.ts` | ⬜ |
| 2.1.5 | POST /api/verify | `api/verify/route.ts` | ⬜ |

**Endpoints necesarios:**
```
GET  /api/agents           → Lista todos los agentes
GET  /api/agents/:id       → Detalle de un agente
POST /api/breed            → { parentA, parentB } → child
GET  /api/lineage/:id      → Árbol genealógico
POST /api/verify           → Verificar ZK proof
GET  /api/stats            → Estadísticas del ecosistema
```

---

### 2.2 Wallet Integration

**Tiempo estimado:** 1 hora
**Ubicación:** `src/backend/lib/`

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| 2.2.1 | Setup Viem/Wagmi | `lib/wallet.ts` | ⬜ |
| 2.2.2 | Monad chain config | `lib/chains.ts` | ⬜ |
| 2.2.3 | Contract ABIs | `lib/abis/` | ⬜ |
| 2.2.4 | Contract instances | `lib/contracts.ts` | ⬜ |

---

### 2.3 State Management

**Tiempo estimado:** 1 hora
**Ubicación:** `src/backend/state/`

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| 2.3.1 | Agent store | `state/agents.ts` | ⬜ |
| 2.3.2 | Breeding history | `state/breeding.ts` | ⬜ |
| 2.3.3 | Cache layer | `state/cache.ts` | ⬜ |

---

## 🟡 PRIORIDAD 3 — NICE TO HAVE (Si hay tiempo)

### 3.1 ZK Circuits (RISC Zero)

**Tiempo estimado:** 3-4 horas
**Ubicación:** `zk/` (nuevo directorio)

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| 3.1.1 | Setup RISC Zero project | `zk/Cargo.toml` | ⬜ |
| 3.1.2 | Ownership proof | `zk/methods/guest/src/ownership.rs` | ⬜ |
| 3.1.3 | Breeding proof | `zk/methods/guest/src/breeding.rs` | ⬜ |
| 3.1.4 | Trait verification | `zk/methods/guest/src/trait_verify.rs` | ⬜ |
| 3.1.5 | Host code | `zk/host/src/main.rs` | ⬜ |
| 3.1.6 | Generate proofs | - | ⬜ |
| 3.1.7 | Verify onchain | - | ⬜ |

> **Nota:** ZK es impresionante pero complejo. Si no hay tiempo, podemos simular la verificación y agregarlo post-hackathon.

---

### 3.2 Revenue Share System

**Tiempo estimado:** 1-2 horas
**Ubicación:** `contracts/`

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| 3.2.1 | RevenueShare.sol | `contracts/RevenueShare.sol` | ⬜ |
| 3.2.2 | Calcular distribución | - | ⬜ |
| 3.2.3 | Integrar con breeding | - | ⬜ |

---

### 3.3 Testing

**Tiempo estimado:** 1-2 horas

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| 3.3.1 | Tests de breeding | `tests/breeding.test.ts` | ⬜ |
| 3.3.2 | Tests de contratos | `tests/contracts.test.ts` | ⬜ |
| 3.3.3 | Tests de API | `tests/api.test.ts` | ⬜ |

---

## 📋 CHECKLIST RÁPIDO — MVP

Lo **mínimo** para el hackathon:

```
⬜ 1. AgentRegistry.sol deployado
⬜ 2. BreedingFactory.sol deployado  
⬜ 3. 2 Genesis Agents registrados (Jazzita + Fruterito)
⬜ 4. 1 Breeding funcional demostrable
⬜ 5. API /api/agents funcionando
⬜ 6. API /api/breed funcionando
⬜ 7. Conexión wallet (Privy o similar)
```

---

## 🕐 Timeline Sugerido

### Hora 1-3: Smart Contracts
```
- AgentRegistry.sol
- BreedingFactory.sol
- Deploy Monad testnet
```

### Hora 4-5: Genesis Agents
```
- JSON de Jazzita y Fruterito
- Registrar onchain
- Verificar
```

### Hora 6-8: Backend Services
```
- Completar breeding.ts
- Crear blockchain.ts
- API routes básicas
```

### Hora 9-10: Integración
```
- Conectar frontend con backend
- Probar breeding completo
- Fix bugs
```

### Hora 11-12: Demo
```
- Preparar demo
- Video si es necesario
- Submit
```

---

## 📁 Estructura Final Backend

```
src/
├── backend/
│   ├── services/
│   │   ├── breeding.ts      ← Motor genético
│   │   ├── agents.ts        ← Gestión de agentes
│   │   ├── blockchain.ts    ← Interacción Monad
│   │   ├── dna.ts           ← Hashing y validación
│   │   └── validation.ts    ← Validaciones
│   ├── lib/
│   │   ├── wallet.ts        ← Viem/Wagmi setup
│   │   ├── chains.ts        ← Monad config
│   │   ├── contracts.ts     ← Contract instances
│   │   └── abis/            ← Contract ABIs
│   ├── data/
│   │   └── genesis/         ← Genesis agents JSON
│   ├── state/
│   │   ├── agents.ts        ← Agent store
│   │   └── breeding.ts      ← Breeding history
│   └── types/
│       └── agent.ts         ← TypeScript types
├── app/
│   └── api/
│       ├── agents/
│       ├── breed/
│       ├── lineage/
│       └── verify/
contracts/
├── AgentRegistry.sol
├── BreedingFactory.sol
├── DNAVerifier.sol
└── interfaces/
zk/ (si hay tiempo)
├── methods/
│   └── guest/
│       └── src/
└── host/
```

---

## ✅ Cómo Marcar Progreso

Actualiza este archivo cambiando:
- `⬜` → `🟡` (en progreso)
- `🟡` → `✅` (completado)

---

*Documento de trabajo — Brian + Fruterito*
*GENOMAD Backend Team*
