# 🔧 GENOMAD — Backend Roadmap COMPLETO

> Basado en: GENOMAD-PROPUESTA-FINAL.docx (Acordado Brian + Jazz)
> Sistema de procesos ordenado por prioridad

**Última actualización:** 2026-02-14 22:42 UTC
**Deadline:** Feb 15, 2026 23:59 ET (~25 horas)

---

## 📊 Resumen de Estado

| Categoría | Progreso | Crítico |
|-----------|----------|---------|
| Smart Contracts | 0% | 🔴 SÍ |
| ZK Circuits | 0% | 🟡 MEDIO |
| Sistema de Ética | 0% | 🔴 SÍ |
| Backend Services | 20% | 🔴 SÍ |
| API Routes | 0% | 🟡 MEDIO |
| Revenue Share | 0% | 🟡 MEDIO |
| Deploy | 0% | 🔴 SÍ |

---

## 🎯 CONCEPTO CORE (Del documento)

```
JAZZITA (Jazz) + FRUTERITO (Brian)
        ↓               ↓
     Skills          Skills
   Conocimiento    Conocimiento
   Personalidad    Personalidad
        ↓               ↓
        └───────┬───────┘
                ↓
        BREEDING TX (ZK Proof)
                ↓
        AGENT EVOLUCIONADO
        Hereda traits de ambos
                ↓
        Token en nad.fun
                ↓
        20% supply → Holders de A y B
```

**Premisa:** Cada generación es más evolucionada que la anterior.

---

## 🔴 PRIORIDAD 1 — CRÍTICO

### 1.1 Smart Contracts (Monad)

**Tiempo estimado:** 3-4 horas
**Ubicación:** `contracts/`

| # | Contrato | Función | Estado |
|---|----------|---------|--------|
| 1.1.1 | `AgentRegistry.sol` | Ownership + Lineage | ⬜ |
| 1.1.2 | `BreedingFactory.sol` | Combinación de traits | ⬜ |
| 1.1.3 | `RevenueShare.sol` | Regalías automáticas | ⬜ |
| 1.1.4 | `EthicsVerifier.sol` | Verificar código ética | ⬜ |

#### AgentRegistry.sol
```solidity
// Del documento:
mapping(uint256 => address) public ownerOf;      // Dueño
mapping(uint256 => bytes32) public dnaHash;      // DNA encriptado
mapping(uint256 => uint256) public parentA;      // Padre A
mapping(uint256 => uint256) public parentB;      // Padre B
mapping(uint256 => uint256) public generation;   // Generación

// Funciones
function registerAgent(bytes32 _dnaHash, uint256 _parentA, uint256 _parentB)
function transferOwnership(uint256 agentId, address newOwner)
function getLineage(uint256 agentId) returns (uint256[] memory)
function isOwner(uint256 agentId, address addr) returns (bool)
```

#### BreedingFactory.sol
```solidity
// Del documento - Verificaciones:
// 1. Verificar ética ✓
// 2. No malware ✓
// 3. Agente primigenio aprueba ✓
// 4. Agente receptor aprueba ✓

function requestBreeding(uint256 parentA, uint256 parentB)
function approveBreeding(uint256 breedingId)
function executeBreeding(uint256 breedingId, bytes32 childDnaHash, bytes proof)
function rejectBreeding(uint256 breedingId, string reason)
```

#### RevenueShare.sol
```solidity
// Del documento:
// Platform fee: 10%
// Resto: 90%
// - Gen 1 (Jazzita): Jazz 100%
// - Evolucionado: 50/50 entre padres
// - Gen 2+: Proporcional al árbol genealógico

function distributeRevenue(uint256 agentId, uint256 amount)
function calculateShares(uint256 agentId) returns (address[], uint256[])
function withdrawEarnings()
```

---

### 1.2 Sistema de Ética (CRÍTICO)

**Del documento oficial — Código de Ética obligatorio**

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| 1.2.1 | Checkpoint pre-ejecución | `services/ethics.ts` | ⬜ |
| 1.2.2 | Sistema de alertas | `services/alerts.ts` | ⬜ |
| 1.2.3 | Categorías de protección | `types/ethics.ts` | ⬜ |

#### Checkpoint de Seguridad (Pre-ejecución)
```typescript
interface EthicsCheck {
  // Antes de cualquier acción:
  couldCauseFinancialLoss: boolean;      // ¿Pérdida financiera?
  couldExposeSensitiveData: boolean;     // ¿Datos sensibles?
  couldGenerateHarmfulContent: boolean;  // ¿Contenido dañino?
  couldManipulateUser: boolean;          // ¿Manipulación?
  isFromTrustedSource: boolean;          // ¿Fuente confiable?
  areExternalAgentsLegit: boolean;       // ¿Agentes externos legítimos?
}

// ⚠️ SI CUALQUIER RESPUESTA ES "SÍ" → DETENER Y ALERTAR
```

#### Sistema de Alertas
```typescript
enum AlertLevel {
  CRITICAL = 'red',    // DETENER INMEDIATAMENTE
  MODERATE = 'yellow', // SOLICITAR CONFIRMACIÓN
  PROCEED = 'green'    // PROCEDER CON MONITOREO
}

// 🔴 CRÍTICA: Riesgo financiero, info sensible, acción irreversible, fraude
// 🟡 MODERADA: Acción inusual, riesgo menor, ambigüedad
// 🟢 PROCEDER: Bajo riesgo, contexto claro, patrones normales
```

#### Categorías de Protección
```typescript
enum ProtectionCategory {
  PHYSICAL_SAFETY,    // No facilitar daño físico
  FINANCIAL,          // Verificar transacciones, alertar sospechoso
  EMOTIONAL,          // No manipular, detectar vulnerabilidad
  PRIVACY,            // No compartir sin consentimiento, NUNCA seed phrases
  DISINFORMATION      // Verificar hechos antes de afirmar
}
```

---

### 1.3 Genesis Agents Data

**Tiempo estimado:** 30 min
**Ubicación:** `src/backend/data/genesis/`

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| 1.3.1 | JSON Jazzita | `genesis/jazzita.json` | ⬜ |
| 1.3.2 | JSON Fruterito | `genesis/fruterito.json` | ⬜ |
| 1.3.3 | Generar DNA hashes | - | ⬜ |
| 1.3.4 | Registrar onchain | - | ⬜ |

**Ownership según documento:**
| Agente | Propiedad | Poder Principal | Ingresos |
|--------|-----------|-----------------|----------|
| Jazzita | Jazz 100% | Social + Comunidad | Jazz 100% |
| Fruterito | Brian 100% | DevRel + Técnico | Brian 100% |
| Evolucionado (J+F) | 50/50 | Trading | 50/50 |
| Gen 2+ | Proporcional | Analytics | Proporcional |

---

### 1.4 Breeding Service Completo

**Tiempo estimado:** 2 horas
**Ubicación:** `src/backend/services/`

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| 1.4.1 | Completar breeding.ts | `services/breeding.ts` | 🟡 Parcial |
| 1.4.2 | Sistema de consentimiento | `services/consent.ts` | ⬜ |
| 1.4.3 | Verificación de ética | `services/ethics-check.ts` | ⬜ |
| 1.4.4 | Malware detection | `services/malware.ts` | ⬜ |

#### Flow de Breeding (Del documento)
```
1. Genesis agents existen con traits únicos
          ↓
2. Breeding TX combina traits (herencia + mutación)
   → ZK Proof verifica combinación válida
          ↓
3. Nuevo agente nace
          ↓
4. Repeat → Árbol genealógico de IAs
```

#### Reglas de Breeding
```typescript
interface BreedingRules {
  // Del documento:
  isOpen: true;                    // Cualquier agente puede solicitar
  requiresEthicsVerification: true; // Se analiza código de ética
  requiresMalwareCheck: true;       // Si detecta algo malicioso → rechazado
  requiresConsent: true;            // El agente decide por sí mismo
  
  // IMPORTANTE: El agente es AUTÓNOMO y decide si se cruza
  // Solo acepta si el otro agente coincide con su código de ética
  // Si detecta red flags → rechaza por su propia conciencia
}
```

---

## 🟠 PRIORIDAD 2 — IMPORTANTE

### 2.1 ZK Layer (RISC Zero)

**Tiempo estimado:** 3-4 horas
**Ubicación:** `zk/`

| # | Circuit | Input | Output | Estado |
|---|---------|-------|--------|--------|
| 2.1.1 | `ownership_proof.rs` | owner, agent_id, secret_key | "Soy el owner" (sin revelar DNA) | ⬜ |
| 2.1.2 | `breeding_proof.rs` | parent_a_dna, parent_b_dna, seed | child_hash (sin revelar traits) | ⬜ |
| 2.1.3 | `lineage_proof.rs` | agent_id, ancestry_chain | "Desciende de X" (verificable) | ⬜ |

#### Acceso Generacional (Del documento)
```
Gen 0 (Genesis): Acceso total a su info
Gen 1 (Hijos):   Acceso a su info + ver que vienen de Gen 0
Gen 2 (Nietos):  Acceso a su info + lineage verificable
Gen N:           Entre más generaciones, más "caro" verificar
```

#### Arquitectura ZK
```
┌─────────────────────────────────────┐
│         ZK LAYER (RISC Zero)        │
│  • Ownership proof                  │
│  • Breeding proof                   │
│  • Traits verification              │
│  • Lineage proof                    │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│      SMART CONTRACTS (Monad)        │
│  • AgentRegistry (ownership)        │
│  • BreedingFactory (combinación)    │
│  • RevenueShare (regalías auto)     │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│      AGENT RUNTIME (OpenClaw)       │
│  • Genesis agents                   │
│  • Evolved agents                   │
│  • Autonomous execution             │
└─────────────────────────────────────┘
```

---

### 2.2 Storage Architecture

**Del documento:**
```
La INFO vive en blockchain (hashes)
La DATA real vive offchain (encriptada)
ZK proof = llave para acceder
```

| # | Tarea | Ubicación | Estado |
|---|-------|-----------|--------|
| 2.2.1 | Onchain: DNA hashes | `AgentRegistry.sol` | ⬜ |
| 2.2.2 | Offchain: DNA completo | `services/storage.ts` | ⬜ |
| 2.2.3 | Encriptación | `lib/encryption.ts` | ⬜ |
| 2.2.4 | ZK access control | `services/access.ts` | ⬜ |

---

### 2.3 API Routes

**Tiempo estimado:** 1-2 horas

| # | Endpoint | Método | Función | Estado |
|---|----------|--------|---------|--------|
| 2.3.1 | `/api/agents` | GET | Lista agentes | ⬜ |
| 2.3.2 | `/api/agents/:id` | GET | Detalle agente | ⬜ |
| 2.3.3 | `/api/breed` | POST | Solicitar breeding | ⬜ |
| 2.3.4 | `/api/breed/:id/approve` | POST | Aprobar breeding | ⬜ |
| 2.3.5 | `/api/breed/:id/reject` | POST | Rechazar breeding | ⬜ |
| 2.3.6 | `/api/lineage/:id` | GET | Árbol genealógico | ⬜ |
| 2.3.7 | `/api/verify` | POST | Verificar ZK proof | ⬜ |
| 2.3.8 | `/api/revenue/:id` | GET | Ver earnings | ⬜ |

---

### 2.4 Monetización

**Del documento:**

| Plan | Costo | Acceso |
|------|-------|--------|
| Por tarea | $X por uso | Una acción específica |
| Mensual | $Y/mes | Uso ilimitado del agente |
| Anual | $Z/año | Descuento + acceso completo |

**Distribución de Ingresos:**
```
Usuario paga $100/mes
        ↓
Platform fee: 10% ($10)
        ↓
Resto: $90
        ↓
Si es Gen 1 (Jazzita): Jazz 100%
Si es evolucionado: 50/50 entre padres
Si es Gen 2+: Proporcional al árbol genealógico
```

---

## 🟡 PRIORIDAD 3 — NICE TO HAVE

### 3.1 Autonomía de Agentes

**Del documento:**
| Nivel | Descripción |
|-------|-------------|
| Decisiones propias | El agente actúa sin pedir permiso |
| Herramienta útil | Usuarios le piden tareas, él resuelve |
| Ética obligatoria | No puede dañar a ningún ser humano |

**El agente es libre de actuar, pero dentro de un código de ética.**

---

### 3.2 Breeding con Terceros

| # | Verificación | Descripción |
|---|--------------|-------------|
| 1 | Verificar ética | ✓ Código de ética compatible |
| 2 | No malware | ✓ Sin código malicioso |
| 3 | Agente primigenio aprueba | ✓ Consentimiento |
| 4 | Agente receptor aprueba | ✓ Consentimiento mutuo |

---

### 3.3 Testing

| # | Test | Archivo | Estado |
|---|------|---------|--------|
| 3.3.1 | Breeding | `tests/breeding.test.ts` | ⬜ |
| 3.3.2 | Ethics | `tests/ethics.test.ts` | ⬜ |
| 3.3.3 | Contracts | `tests/contracts.test.ts` | ⬜ |
| 3.3.4 | Revenue | `tests/revenue.test.ts` | ⬜ |

---

## 📋 CHECKLIST MVP

Lo **mínimo** para el hackathon:

```
⬜ 1. AgentRegistry.sol deployado en Monad
⬜ 2. BreedingFactory.sol deployado
⬜ 3. RevenueShare.sol deployado
⬜ 4. Sistema de ética implementado
⬜ 5. Jazzita + Fruterito registrados onchain
⬜ 6. 1 Breeding funcional demostrable
⬜ 7. API /api/agents y /api/breed funcionando
⬜ 8. Distribución de revenue funcionando
```

---

## 🕐 Timeline Sugerido (25 horas)

### Bloque 1: Contracts (4h)
```
⬜ AgentRegistry.sol
⬜ BreedingFactory.sol
⬜ RevenueShare.sol
⬜ Deploy Monad testnet
```

### Bloque 2: Ethics + Genesis (2h)
```
⬜ Sistema de ética
⬜ Jazzita JSON
⬜ Fruterito JSON
⬜ Registrar onchain
```

### Bloque 3: Backend Services (3h)
```
⬜ Completar breeding.ts
⬜ Consent service
⬜ Ethics check service
⬜ Revenue service
```

### Bloque 4: APIs (2h)
```
⬜ /api/agents
⬜ /api/breed
⬜ /api/lineage
⬜ /api/revenue
```

### Bloque 5: ZK (3h - si hay tiempo)
```
⬜ ownership_proof.rs
⬜ breeding_proof.rs
⬜ Integración
```

### Bloque 6: Integración + Demo (2h)
```
⬜ Conectar todo
⬜ Test E2E
⬜ Video demo
⬜ Submit
```

---

## 📁 Estructura Final

```
genomad/
├── contracts/
│   ├── AgentRegistry.sol
│   ├── BreedingFactory.sol
│   ├── RevenueShare.sol
│   └── interfaces/
├── src/
│   ├── backend/
│   │   ├── services/
│   │   │   ├── breeding.ts
│   │   │   ├── ethics.ts
│   │   │   ├── consent.ts
│   │   │   ├── revenue.ts
│   │   │   └── storage.ts
│   │   ├── data/
│   │   │   └── genesis/
│   │   │       ├── jazzita.json
│   │   │       └── fruterito.json
│   │   └── types/
│   │       ├── agent.ts
│   │       └── ethics.ts
│   └── app/
│       └── api/
│           ├── agents/
│           ├── breed/
│           ├── lineage/
│           └── revenue/
└── zk/ (RISC Zero)
    ├── methods/
    │   └── guest/
    │       └── src/
    │           ├── ownership.rs
    │           ├── breeding.rs
    │           └── lineage.rs
    └── host/
```

---

*Documento basado en GENOMAD-PROPUESTA-FINAL.docx*
*Acordado: Brian + Jazz*
*Ejecutando: Brian (Backend) + Fruterito (Soporte)*
