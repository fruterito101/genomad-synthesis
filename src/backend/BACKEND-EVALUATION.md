# 🔍 BACKEND EVALUATION — Análisis con Skills

> Evaluación detallada de BACKEND-SPEC.md y BACKEND-IMPLEMENTATION.md
> Usando las skills: genetic-system, risc-zero, monad-development, nad-fun
> Fecha: 2026-02-15 01:51 UTC

---

## 📊 Resumen de Evaluación

| Documento | Score | Errores | Mejoras |
|-----------|-------|---------|---------|
| BACKEND-SPEC.md | 8.5/10 | 3 | 7 |
| BACKEND-IMPLEMENTATION.md | 8/10 | 5 | 9 |

---

# PARTE 1: Evaluación de BACKEND-SPEC.md

## ✅ Lo que está CORRECTO

### 1. Arquitectura DNA On-Chain
**Skill:** `genetic-system/SKILL.md`

✅ **Correcto:** DNA encriptado on-chain, solo padres pueden leer
✅ **Correcto:** Hash commitment público, valores privados
✅ **Correcto:** Estructura de 8 traits coincide con la skill

### 2. Token Economy
**Skill:** `nad-fun/SKILL.md`

✅ **Correcto:** $GENO en nad.fun con bonding curve
✅ **Correcto:** Solo comprable con $MONAD
✅ **Correcto:** Distribución de fees (85% owner, 10% padres, 5% protocol)

### 3. ZK Integration Concept
**Skill:** `risc-zero/SKILL.md`

✅ **Correcto:** Flujo Host → Guest → Receipt → Verify
✅ **Correcto:** DNA privado, proof público

### 4. Monad Deployment
**Skill:** `monad-development/SKILL.md`

✅ **Correcto:** Chain ID 10143 (testnet)
✅ **Correcto:** RPC URL correcta
✅ **Correcto:** Usar Foundry, no Hardhat

---

## ❌ ERRORES Detectados

### Error 1: Falta EVM Version en Spec
**Skill:** `monad-development/SKILL.md`

```
CRÍTICO: Monad requiere evmVersion: "prague" y Solidity 0.8.27+
```

**En BACKEND-SPEC.md dice:**
> Tech Stack: Solidity + Foundry

**Debería especificar:**
```toml
[profile.default]
evm_version = "prague"
solc_version = "0.8.28"
```

**Impacto:** Los contratos pueden fallar al deploy sin esto.

---

### Error 2: Falta Wallet Persistence
**Skill:** `monad-development/SKILL.md`

```
CRÍTICO: "If you generate a wallet, MUST persist it"
```

**En BACKEND-SPEC.md:** No menciona cómo manejar wallets para deploy.

**Debería incluir:**
- Cómo guardar wallet del deployer
- `.env` con PRIVATE_KEY
- Nunca hardcodear addresses en scripts

---

### Error 3: Verificación de Contratos Incompleta
**Skill:** `monad-development/SKILL.md`

```
IMPORTANTE: Usar API de verificación, NO forge verify-contract directamente
```

**En BACKEND-SPEC.md:** No menciona proceso de verificación.

**Debería incluir:**
```bash
# API de verificación (verifica en 3 explorers)
curl -X POST https://agents.devnads.com/v1/verify
```

---

## 🔧 MEJORAS Sugeridas

### Mejora 1: Agregar Sección de Configuración de Foundry
**Archivo:** `foundry.toml`

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
evm_version = "prague"
solc_version = "0.8.28"

[rpc_endpoints]
monad_testnet = "https://testnet-rpc.monad.xyz"

[etherscan]
monad_testnet = { key = "", url = "https://agents.devnads.com/v1/verify" }
```

---

### Mejora 2: Detallar Proceso de Token Creation en nad.fun
**Skill:** `nad-fun/SKILL.md`

El spec dice "$GENO en nad.fun" pero no detalla los 4 pasos:

```
1. Upload Image → image_uri
2. Upload Metadata → metadata_uri
3. Mine Salt → salt, predictedAddress
4. Create On-Chain → deployFeeAmount + initialBuyAmount
```

**Agregar sección:**
```markdown
### Proceso de Creación de $GENO

1. **Preparar imagen** (max 5MB)
2. **POST /agent/token/image** → image_uri
3. **POST /agent/token/metadata** → metadata_uri
4. **POST /agent/salt** → salt
5. **Call create()** con deployFeeAmount
```

---

### Mejora 3: Agregar Detalles de RISC Zero Verifier Deploy
**Skill:** `risc-zero/MONAD-DEPLOY.md`

El spec menciona RISC Zero pero no cómo deployearlo.

**Agregar:**
```markdown
### Deploy RISC Zero Verifier

1. Clonar risc0-ethereum (release-3.0)
2. Deploy RiscZeroGroth16Verifier
3. Deploy RiscZeroVerifierRouter
4. Guardar address del router

Gas estimado: ~$6-7 total
Cada verify: ~$0.05
```

---

### Mejora 4: Slippage y Deadline en Trading
**Skill:** `nad-fun/SKILL.md`

```typescript
// Slippage: 1%
const minTokens = (amountOut * 99n) / 100n;

// Deadline: 5 minutos
const deadline = BigInt(Math.floor(Date.now() / 1000) + 300);
```

**Agregar sección de trading safety.**

---

### Mejora 5: Error Handling para nad.fun
**Skill:** `nad-fun/SKILL.md`

Errores comunes no documentados:
- `InsufficientAmount` → Output < amountOutMin
- `DeadlineExpired` → Deadline passed
- `AlreadyGraduated` → Token on DEX

---

### Mejora 6: Frontend Integration con viem/wagmi
**Skill:** `monad-development/SKILL.md`

```typescript
// Usar import de viem/chains, NO definir custom
import { monadTestnet } from "viem/chains";

// Config wagmi
const config = createConfig({
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http()
  }
})
```

---

### Mejora 7: Gas Estimation
**Skill:** `nad-fun/SKILL.md`

```
"Always estimate gas before sending. Never hardcode gas limits."
```

**Agregar sección de gas management.**

---

# PARTE 2: Evaluación de BACKEND-IMPLEMENTATION.md

## ✅ Lo que está CORRECTO

### 1. Estructura de Fases
✅ Progresivo y escalable
✅ Verificación entre fases con `bun run build`
✅ Tickets detallados

### 2. Types Definition (Fase 1)
**Skill:** `genetic-system/TYPESCRIPT.md`

✅ Traits interface correcta (8 traits)
✅ AgentDNA structure correcta
✅ BreedingOptions bien definidas

### 3. Genetic Engine (Fase 2)
**Skill:** `genetic-system/BREEDING.md`

✅ 3 tipos de crossover implementados
✅ Mutación gaussiana correcta
✅ Fitness con sinergias
✅ GeneticEngine class completa

---

## ❌ ERRORES Detectados

### Error 1: Import Path Incorrecto
**Ticket 2.2 (crossover.ts):**

```typescript
// ❌ INCORRECTO
import { Traits, TRAIT_NAMES, TraitName } from '@/types';
```

**Problema:** El path alias `@/` necesita configuración en `tsconfig.json`.

**Fix:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**O usar path relativo:**
```typescript
// ✅ CORRECTO (más seguro)
import { Traits, TRAIT_NAMES, TraitName } from '../../types';
```

---

### Error 2: Falta Configuración de tsconfig.json
**Fase 0:** No incluye ticket para crear/verificar tsconfig.json

**Agregar Ticket 0.X:**
```bash
# Verificar/crear tsconfig.json
cat tsconfig.json
```

**Contenido requerido:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

---

### Error 3: Falta crypto polyfill para browser
**Ticket 2.5 (hash.ts):**

```typescript
// ❌ PROBLEMA en browser
import { createHash } from 'crypto';
```

**Problema:** `crypto` de Node.js no funciona en browser.

**Fix para Next.js:**
```typescript
// ✅ CORRECTO - usar @noble/hashes (ya instalado)
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';

export function calculateDNAHash(dna: Omit<AgentDNA, 'hash'>): string {
  const data = {
    traits: Object.fromEntries(
      TRAIT_NAMES.map((t) => [t, dna.traits[t]])
    ),
    generation: dna.generation,
    lineage: [...dna.lineage].sort(),
  };

  const json = new TextEncoder().encode(JSON.stringify(data));
  return bytesToHex(sha256(json));
}
```

---

### Error 4: Genesis Agents con Hash Circular
**Ticket 2.6 (genesis.ts):**

```typescript
// ❌ PROBLEMA
export const JAZZITA_DNA: AgentDNA = createGenesisDNA('Jazzita', {...});
```

**Problema:** Si el archivo se importa y los genesis se crean al load, el hash se calcula en el momento del import, no es estable.

**Fix:**
```typescript
// ✅ CORRECTO - lazy initialization
let _jazzitaDNA: AgentDNA | null = null;

export function getJazzitaDNA(): AgentDNA {
  if (!_jazzitaDNA) {
    _jazzitaDNA = createGenesisDNA('Jazzita', {
      creativity: 92,
      // ...
    });
  }
  return _jazzitaDNA;
}

// O usar Object.freeze para inmutabilidad
export const JAZZITA_DNA: AgentDNA = Object.freeze(
  createGenesisDNA('Jazzita', {...})
);
```

---

### Error 5: Falta Test Runner Configuration
**Ticket 2.9:** Menciona test pero no configura test runner.

**Agregar a Fase 0:**
```bash
# Instalar vitest para tests
bun add -d vitest @vitest/coverage-v8
```

**package.json:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

---

## 🔧 MEJORAS Sugeridas

### Mejora 1: Agregar Ticket de tsconfig.json
**Insertar después de Ticket 0.3:**

```markdown
### Ticket 0.3.5: Configurar TypeScript

**Archivo:** `tsconfig.json`

**Verificar que existe y tiene:**
- paths: { "@/*": ["./src/*"] }
- strict: true
- moduleResolution: "bundler"
```

---

### Mejora 2: Usar @noble/hashes en lugar de crypto
**Modificar Ticket 2.5:**

```typescript
// Usar @noble/hashes (browser compatible)
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
```

---

### Mejora 3: Agregar Fase de Environment Setup
**Insertar Fase 0.5: Environment Variables**

```markdown
### Ticket 0.5: Crear .env.local

**Archivo:** `.env.local`

```env
# Monad
NEXT_PUBLIC_MONAD_RPC=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_CHAIN_ID=10143

# Contracts (llenar después de deploy)
NEXT_PUBLIC_AGENT_NFT_ADDRESS=
NEXT_PUBLIC_BREEDING_FACTORY_ADDRESS=
NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS=

# nad.fun
NAD_API_KEY=
NEXT_PUBLIC_GENO_TOKEN_ADDRESS=

# RISC Zero
RISC0_DEV_MODE=1

# Telegram (server-side only)
TELEGRAM_BOT_TOKEN=
```
```

---

### Mejora 4: Agregar Validación de Traits
**Skill:** `genetic-system/TRAITS.md`

En Ticket 1.2, agregar validación más robusta:

```typescript
export function validateTraits(traits: unknown): traits is Traits {
  if (typeof traits !== 'object' || traits === null) return false;
  
  for (const name of TRAIT_NAMES) {
    const value = (traits as Record<string, unknown>)[name];
    if (typeof value !== 'number') return false;
    if (value < 0 || value > 100) return false;
    if (!Number.isInteger(value)) return false;
  }
  
  return true;
}
```

---

### Mejora 5: Agregar Constants File
**Insertar en Fase 1:**

```typescript
// src/lib/constants.ts

export const GENOMAD_CONFIG = {
  // Network
  CHAIN_ID: 10143,
  RPC_URL: 'https://testnet-rpc.monad.xyz',
  
  // Genetic
  DEFAULT_MUTATION_RATE: 0.25,
  DEFAULT_MUTATION_RANGE: 15,
  MAX_GENERATION_GAP: 10,
  
  // Fees (in $GENO)
  BREEDING_FEE: '100', // 100 $GENO
  ACTIVATION_FEE: '10',
  
  // Distribution
  FEE_OWNER_PERCENT: 85,
  FEE_PARENTS_PERCENT: 10,
  FEE_PROTOCOL_PERCENT: 5,
} as const;
```

---

### Mejora 6: Agregar Error Types
**Insertar en Fase 1:**

```typescript
// src/types/errors.ts

export class GenomadError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'GenomadError';
  }
}

export class BreedingError extends GenomadError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'BREEDING_ERROR', details);
  }
}

export class ValidationError extends GenomadError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
  }
}
```

---

### Mejora 7: Agregar Logging Utility
**Para debugging:**

```typescript
// src/lib/utils/logger.ts

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  debug: (...args: unknown[]) => isDev && console.log('[DEBUG]', ...args),
  info: (...args: unknown[]) => console.log('[INFO]', ...args),
  warn: (...args: unknown[]) => console.warn('[WARN]', ...args),
  error: (...args: unknown[]) => console.error('[ERROR]', ...args),
};
```

---

### Mejora 8: Detallar Fase 8 (Blockchain Integration)
**Skill:** `monad-development/SKILL.md`

Agregar tickets específicos:

```markdown
### Ticket 8.1: Setup viem client

import { createPublicClient, createWalletClient, http } from 'viem';
import { monadTestnet } from 'viem/chains';

### Ticket 8.2: Contract ABIs

Generar con: forge build --extra-output-files abi

### Ticket 8.3: Read functions

publicClient.readContract({ address, abi, functionName, args })

### Ticket 8.4: Write functions

walletClient.writeContract({ address, abi, functionName, args, value })

### Ticket 8.5: Event listening

publicClient.watchContractEvent({ address, abi, eventName, onLogs })
```

---

### Mejora 9: Agregar Fase de Contracts Deployment
**Insertar como Fase 8.5:**

```markdown
## Fase 8.5: Contract Deployment

### Ticket 8.5.1: Setup Foundry Project
cd contracts && forge init

### Ticket 8.5.2: Configurar foundry.toml
evm_version = "prague"
solc_version = "0.8.28"

### Ticket 8.5.3: Deploy Script
forge script script/Deploy.s.sol --rpc-url $RPC --broadcast

### Ticket 8.5.4: Verify Contracts
curl -X POST https://agents.devnads.com/v1/verify

### Ticket 8.5.5: Save Addresses
Guardar en .env y contracts/addresses.json
```

---

# PARTE 3: Resumen de Acciones

## 🔴 Crítico (Hacer Ahora)

| # | Acción | Archivo |
|---|--------|---------|
| 1 | Agregar evmVersion: prague a spec | BACKEND-SPEC.md |
| 2 | Agregar ticket tsconfig.json | BACKEND-IMPLEMENTATION.md |
| 3 | Cambiar crypto a @noble/hashes | Ticket 2.5 |
| 4 | Agregar path alias config | tsconfig.json |

## 🟡 Importante (Hacer Pronto)

| # | Acción | Archivo |
|---|--------|---------|
| 5 | Detallar proceso nad.fun token creation | BACKEND-SPEC.md |
| 6 | Agregar wallet persistence section | BACKEND-SPEC.md |
| 7 | Agregar contract verification process | BACKEND-SPEC.md |
| 8 | Agregar constants.ts | BACKEND-IMPLEMENTATION.md |
| 9 | Agregar error types | BACKEND-IMPLEMENTATION.md |

## 🟢 Nice to Have (Si hay tiempo)

| # | Acción | Archivo |
|---|--------|---------|
| 10 | Logging utility | src/lib/utils/logger.ts |
| 11 | Gas estimation section | BACKEND-SPEC.md |
| 12 | Slippage/deadline docs | BACKEND-SPEC.md |

---

# PARTE 4: Código Corregido

## Fix 1: hash.ts (Browser Compatible)

```typescript
// src/lib/genetic/hash.ts
// VERSIÓN CORREGIDA - browser compatible

import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
import { AgentDNA, TRAIT_NAMES } from '@/types';

/**
 * Calcula hash SHA256 determinístico del DNA
 * Compatible con browser y Node.js
 */
export function calculateDNAHash(dna: Omit<AgentDNA, 'hash'>): string {
  const data = {
    traits: Object.fromEntries(
      TRAIT_NAMES.map((t) => [t, dna.traits[t]])
    ),
    generation: dna.generation,
    lineage: [...dna.lineage].sort(),
  };

  const json = JSON.stringify(data);
  const bytes = new TextEncoder().encode(json);
  return bytesToHex(sha256(bytes));
}

/**
 * Verifica integridad del DNA
 */
export function verifyDNAHash(dna: AgentDNA): boolean {
  const { hash, ...rest } = dna;
  const computed = calculateDNAHash(rest);
  return hash === computed;
}

/**
 * Hash corto para display
 */
export function shortHash(hash: string, length: number = 8): string {
  return hash.slice(0, length);
}

/**
 * Calcula commitment (para blockchain)
 */
export function calculateCommitment(dna: AgentDNA): string {
  const traitsArray = TRAIT_NAMES.map((t) => dna.traits[t]);
  const data = new Uint8Array([...traitsArray, dna.generation]);
  return bytesToHex(sha256(data));
}
```

---

## Fix 2: tsconfig.json Completo

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    },
    "baseUrl": "."
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

---

## Fix 3: foundry.toml para Monad

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
evm_version = "prague"
solc_version = "0.8.28"
optimizer = true
optimizer_runs = 200

[rpc_endpoints]
monad_testnet = "https://testnet-rpc.monad.xyz"
monad_mainnet = "https://rpc.monad.xyz"

[fmt]
bracket_spacing = true
int_types = "long"
line_length = 100
multiline_func_header = "attributes_first"
number_underscore = "thousands"
quote_style = "double"
tab_width = 4
```

---

*Evaluación completada. Aplicar fixes críticos antes de comenzar implementación.*
