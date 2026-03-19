# 🚀 BACKEND IMPLEMENTATION PLAN

> Plan de implementación detallado con tickets de programación por fases.
> Cada fase incluye verificación con `bun run build` antes de continuar.
> Última actualización: 2026-02-15 01:45 UTC

---

## 📋 Índice de Fases

| Fase | Nombre | Tickets | Descripción |
|------|--------|---------|-------------|
| **0** | Setup & Dependencies | 8 | Instalación y configuración inicial |
| **1** | Types & Interfaces | 6 | Definición de tipos TypeScript |
| **2** | Genetic Engine Core | 10 | Motor genético (traits, fitness, crossover) |
| **3** | Heuristics Engine | 8 | Análisis automático de agentes |
| **4** | Crypto & Hashing | 6 | Encriptación, hashing, commitments |
| **5** | Database Layer | 7 | Cache, modelos, conexión |
| **6** | Authentication | 8 | Telegram Login, verificación |
| **7** | API Endpoints | 12 | Rutas de la API |
| **8** | Blockchain Integration | 10 | Monad, contracts, viem |
| **9** | ZK Integration | 8 | RISC Zero, proofs |
| **10** | Token Integration | 6 | $GENO, nad.fun |
| **11** | Testing & QA | 8 | Tests unitarios, integración |
| **12** | Build & Deploy | 6 | Producción, CI/CD |

**Total: 103 tickets**

---

## 🔄 Proceso Entre Fases

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROCESO DE CADA FASE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   1. IMPLEMENTAR                                                │
│      └── Completar todos los tickets de la fase                 │
│                                                                  │
│   2. VERIFICAR                                                  │
│      └── bun run build                                          │
│      └── Revisar errores de TypeScript                          │
│      └── Revisar warnings                                       │
│                                                                  │
│   3. CORREGIR                                                   │
│      └── Arreglar todos los errores                             │
│      └── Ejecutar bun run build de nuevo                        │
│      └── Repetir hasta 0 errores                                │
│                                                                  │
│   4. CONFIRMAR                                                  │
│      └── ✅ Build exitoso                                        │
│      └── ✅ Todos los tickets completados                        │
│      └── ✅ Código commiteado                                    │
│                                                                  │
│   5. SIGUIENTE FASE                                             │
│      └── Solo si fase actual está 100% completa                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

# FASE 0: Setup & Dependencies

## Objetivo
Configurar el proyecto con todas las dependencias necesarias.

## Pre-requisitos
- [ ] Node.js 20+ instalado
- [ ] Bun instalado
- [ ] Git configurado
- [ ] Acceso a WSL2

---

### Ticket 0.1: Verificar Entorno

**Descripción:** Verificar que el entorno tiene todo lo necesario.

**Comandos:**
```bash
# Verificar Node
node --version  # Debe ser 20+

# Verificar Bun
bun --version   # Debe ser 1.0+

# Verificar Git
git --version

# Verificar directorio
cd ~/projects/genomad
pwd
```

**Criterio de éxito:**
- [ ] Node 20+
- [ ] Bun 1.0+
- [ ] En directorio correcto

---

### Ticket 0.2: Limpiar e Inicializar

**Descripción:** Limpiar instalaciones previas e inicializar fresh.

**Comandos:**
```bash
cd ~/projects/genomad

# Limpiar
rm -rf node_modules
rm -rf .next
rm -f bun.lockb
rm -f package-lock.json

# Verificar package.json existe
cat package.json
```

**Criterio de éxito:**
- [ ] Directorio limpio
- [ ] package.json presente

---

### Ticket 0.3: Instalar Dependencias Core

**Descripción:** Instalar Next.js, React, y TypeScript.

**Comandos:**
```bash
cd ~/projects/genomad

# Instalar con Bun
bun install

# Si hay problemas, usar npm
npm install
```

**Dependencias esperadas en package.json:**
```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0"
  }
}
```

**Criterio de éxito:**
- [ ] `bun install` exitoso
- [ ] node_modules creado

---

### Ticket 0.4: Instalar TailwindCSS 4

**Descripción:** Agregar TailwindCSS para estilos.

**Comandos:**
```bash
cd ~/projects/genomad

# Instalar Tailwind
bun add tailwindcss @tailwindcss/postcss postcss

# O con npm si hay problemas
npm install tailwindcss @tailwindcss/postcss postcss
```

**Archivos a verificar/crear:**

`postcss.config.js`:
```javascript
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

`tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config
```

**Criterio de éxito:**
- [ ] Tailwind instalado
- [ ] Configs creados

---

### Ticket 0.5: Instalar Dependencias de Blockchain

**Descripción:** Agregar viem y wagmi para interacción con Monad.

**Comandos:**
```bash
cd ~/projects/genomad

# Blockchain
bun add viem wagmi @tanstack/react-query

# O con npm
npm install viem wagmi @tanstack/react-query
```

**Criterio de éxito:**
- [ ] viem instalado
- [ ] wagmi instalado
- [ ] react-query instalado

---

### Ticket 0.6: Instalar Dependencias de Crypto

**Descripción:** Agregar librerías para hashing y encriptación.

**Comandos:**
```bash
cd ~/projects/genomad

# Crypto
bun add crypto-js @noble/hashes

# O con npm
npm install crypto-js @noble/hashes

# Types
bun add -d @types/crypto-js
```

**Criterio de éxito:**
- [ ] crypto-js instalado
- [ ] @noble/hashes instalado

---

### Ticket 0.7: Instalar Dependencias de Database

**Descripción:** Agregar SQLite/Turso para cache.

**Comandos:**
```bash
cd ~/projects/genomad

# SQLite (local dev)
bun add better-sqlite3
bun add -d @types/better-sqlite3

# O Drizzle ORM (recomendado)
bun add drizzle-orm
bun add -d drizzle-kit
```

**Criterio de éxito:**
- [ ] Database driver instalado
- [ ] Types instalados

---

### Ticket 0.8: Verificación Final Fase 0

**Descripción:** Build de verificación.

**Comandos:**
```bash
cd ~/projects/genomad

# Build de verificación
bun run build

# Si hay errores de TypeScript, verificar
npx tsc --noEmit

# Listar dependencias instaladas
bun pm ls
```

**Criterio de éxito:**
- [ ] `bun run build` exitoso (o solo warnings menores)
- [ ] Todas las dependencias listadas

---

## ✅ Checkpoint Fase 0

```
┌─────────────────────────────────────────────────────────────────┐
│                    FASE 0 COMPLETADA                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Verificar antes de continuar:                                 │
│                                                                  │
│   [ ] Node 20+ funcionando                                      │
│   [ ] Bun funcionando                                           │
│   [ ] Todas las dependencias instaladas                         │
│   [ ] bun run build exitoso                                     │
│   [ ] Código commiteado                                         │
│                                                                  │
│   Comando de commit:                                            │
│   git add -A && git commit -m "phase-0: Setup & dependencies"   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

# FASE 1: Types & Interfaces

## Objetivo
Definir todos los tipos TypeScript del proyecto.

## Directorio
```
src/
└── types/
    ├── index.ts        # Re-exports
    ├── agent.ts        # Agent & DNA types
    ├── traits.ts       # Trait definitions
    ├── breeding.ts     # Breeding types
    ├── auth.ts         # Auth types
    └── api.ts          # API request/response types
```

---

### Ticket 1.1: Crear Estructura de Directorios

**Descripción:** Crear carpeta de types.

**Comandos:**
```bash
cd ~/projects/genomad

mkdir -p src/types
touch src/types/index.ts
touch src/types/agent.ts
touch src/types/traits.ts
touch src/types/breeding.ts
touch src/types/auth.ts
touch src/types/api.ts
```

**Criterio de éxito:**
- [ ] Directorio types creado
- [ ] Archivos vacíos creados

---

### Ticket 1.2: Definir Trait Types

**Archivo:** `src/types/traits.ts`

**Contenido:**
```typescript
// src/types/traits.ts

/**
 * Nombres de los 8 traits fundamentales
 */
export const TRAIT_NAMES = [
  'social',
  'technical',
  'creativity',
  'analysis',
  'trading',
  'empathy',
  'teaching',
  'leadership',
] as const;

export type TraitName = (typeof TRAIT_NAMES)[number];

/**
 * Estructura de traits (8 dimensiones)
 */
export interface Traits {
  social: number;      // 0-100
  technical: number;   // 0-100
  creativity: number;  // 0-100
  analysis: number;    // 0-100
  trading: number;     // 0-100
  empathy: number;     // 0-100
  teaching: number;    // 0-100
  leadership: number;  // 0-100
}

/**
 * Pesos para cálculo de fitness
 */
export interface FitnessWeights {
  social?: number;
  technical?: number;
  creativity?: number;
  analysis?: number;
  trading?: number;
  empathy?: number;
  teaching?: number;
  leadership?: number;
}

/**
 * Presets de fitness para especializaciones
 */
export type FitnessPreset = 'balanced' | 'trader' | 'teacher' | 'creative' | 'leader' | 'technical';

/**
 * Validar que un valor de trait está en rango
 */
export function isValidTraitValue(value: number): boolean {
  return value >= 0 && value <= 100 && Number.isInteger(value);
}

/**
 * Validar objeto de traits completo
 */
export function isValidTraits(traits: Partial<Traits>): traits is Traits {
  return TRAIT_NAMES.every(
    (name) => name in traits && isValidTraitValue(traits[name] as number)
  );
}
```

**Verificación:**
```bash
npx tsc --noEmit src/types/traits.ts
```

**Criterio de éxito:**
- [ ] Archivo creado
- [ ] Sin errores de TypeScript

---

### Ticket 1.3: Definir Agent Types

**Archivo:** `src/types/agent.ts`

**Contenido:**
```typescript
// src/types/agent.ts

import { Traits } from './traits';

/**
 * DNA de un agente
 */
export interface AgentDNA {
  /** ID único interno */
  id?: string;
  
  /** Nombre del agente */
  name: string;
  
  /** 8 traits (0-100 cada uno) */
  traits: Traits;
  
  /** Generación (0 = genesis) */
  generation: number;
  
  /** IDs de ancestros */
  lineage: string[];
  
  /** Cantidad de mutaciones acumuladas */
  mutations: number;
  
  /** Hash SHA256 del DNA */
  hash: string;
  
  /** Token ID en blockchain (si registrado) */
  tokenId?: string;
  
  /** Dirección del owner */
  ownerAddress?: string;
  
  /** Timestamp de creación */
  createdAt?: Date;
}

/**
 * Agente completo (DNA + metadata)
 */
export interface Agent extends AgentDNA {
  /** Fitness score calculado */
  fitness: number;
  
  /** Estado de activación */
  isActive: boolean;
  
  /** Dirección donde está corriendo */
  activeHost?: string;
  
  /** ID del parent A (si no es genesis) */
  parentAId?: string;
  
  /** ID del parent B (si no es genesis) */
  parentBId?: string;
}

/**
 * Crear un nuevo AgentDNA vacío
 */
export function createEmptyDNA(): Omit<AgentDNA, 'hash'> {
  return {
    name: '',
    traits: {
      social: 50,
      technical: 50,
      creativity: 50,
      analysis: 50,
      trading: 50,
      empathy: 50,
      teaching: 50,
      leadership: 50,
    },
    generation: 0,
    lineage: [],
    mutations: 0,
  };
}

/**
 * Tipo para agentes Genesis (generation 0)
 */
export type GenesisAgent = Agent & {
  generation: 0;
  parentAId: undefined;
  parentBId: undefined;
};

/**
 * Tipo para agentes bred (generation > 0)
 */
export type BredAgent = Agent & {
  generation: number;
  parentAId: string;
  parentBId: string;
};
```

**Verificación:**
```bash
npx tsc --noEmit src/types/agent.ts
```

**Criterio de éxito:**
- [ ] Archivo creado
- [ ] Sin errores de TypeScript

---

### Ticket 1.4: Definir Breeding Types

**Archivo:** `src/types/breeding.ts`

**Contenido:**
```typescript
// src/types/breeding.ts

import { AgentDNA, Agent } from './agent';
import { Traits } from './traits';

/**
 * Tipos de crossover disponibles
 */
export type CrossoverType = 'uniform' | 'single' | 'weighted';

/**
 * Opciones para breeding
 */
export interface BreedingOptions {
  /** Tipo de crossover */
  crossoverType: CrossoverType;
  
  /** Tasa de mutación (0-1, default 0.25) */
  mutationRate?: number;
  
  /** Rango de mutación (default 15) */
  mutationRange?: number;
  
  /** Validar compatibilidad de padres */
  validateParents?: boolean;
  
  /** Nombre para el hijo (opcional) */
  childName?: string;
}

/**
 * Resultado de un breeding
 */
export interface BreedingResult {
  /** DNA del hijo generado */
  child: AgentDNA;
  
  /** Fitness del parent A */
  parentAFitness: number;
  
  /** Fitness del parent B */
  parentBFitness: number;
  
  /** Fitness del hijo */
  childFitness: number;
  
  /** ¿El hijo mejoró respecto a los padres? */
  improved: boolean;
  
  /** Cantidad de mutaciones aplicadas */
  mutationsApplied: number;
  
  /** Traits que mutaron */
  mutatedTraits: (keyof Traits)[];
}

/**
 * Solicitud de breeding (pendiente de aprobación)
 */
export interface BreedingRequest {
  id: string;
  
  /** Quien inició el request */
  initiatorId: string;
  
  /** Token ID del parent A */
  parentATokenId: string;
  
  /** Token ID del parent B */
  parentBTokenId: string;
  
  /** Estado del request */
  status: 'pending' | 'approved' | 'rejected' | 'executed' | 'expired';
  
  /** Opciones de breeding */
  options: BreedingOptions;
  
  /** Fee en $GENO */
  feeAmount: string;
  
  /** Timestamp de creación */
  createdAt: Date;
  
  /** Timestamp de expiración */
  expiresAt: Date;
}

/**
 * Opciones para evolución de población
 */
export interface PopulationOptions {
  /** Tamaño de población */
  populationSize: number;
  
  /** Número de generaciones */
  generations: number;
  
  /** Presión de selección (default 1.5) */
  selectionPressure?: number;
  
  /** Elitismo: cuántos mejores preservar */
  elitism?: number;
  
  /** Tipo de crossover */
  crossoverType?: CrossoverType;
}
```

**Verificación:**
```bash
npx tsc --noEmit src/types/breeding.ts
```

**Criterio de éxito:**
- [ ] Archivo creado
- [ ] Sin errores de TypeScript

---

### Ticket 1.5: Definir Auth Types

**Archivo:** `src/types/auth.ts`

**Contenido:**
```typescript
// src/types/auth.ts

/**
 * Datos del usuario de Telegram (del widget)
 */
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

/**
 * Usuario en nuestro sistema
 */
export interface User {
  id: string;
  telegramId: number;
  telegramUsername?: string;
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  walletAddress?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

/**
 * Sesión de usuario
 */
export interface Session {
  userId: string;
  telegramId: number;
  token: string;
  expiresAt: Date;
}

/**
 * Código de verificación para vincular OpenClaw
 */
export interface VerificationCode {
  code: string;
  userId: string;
  telegramId: number;
  expiresAt: Date;
  used: boolean;
}

/**
 * Request de verificación desde OpenClaw
 */
export interface VerifyRequest {
  code: string;
  telegramId: number;
  agentName: string;
  botUsername: string;
  files: {
    soul: string;
    identity: string;
    tools: string;
  };
}

/**
 * Respuesta de verificación
 */
export interface VerifyResponse {
  success: boolean;
  message: string;
  agentId?: string;
  tokenId?: string;
}
```

**Verificación:**
```bash
npx tsc --noEmit src/types/auth.ts
```

**Criterio de éxito:**
- [ ] Archivo creado
- [ ] Sin errores de TypeScript

---

### Ticket 1.6: Crear Index y Verificar Fase 1

**Archivo:** `src/types/index.ts`

**Contenido:**
```typescript
// src/types/index.ts

// Re-export all types
export * from './traits';
export * from './agent';
export * from './breeding';
export * from './auth';

// Version
export const TYPES_VERSION = '1.0.0';
```

**Verificación Final Fase 1:**
```bash
cd ~/projects/genomad

# Verificar todos los types
npx tsc --noEmit

# Build completo
bun run build
```

**Criterio de éxito:**
- [ ] Index creado con re-exports
- [ ] `bun run build` exitoso

---

## ✅ Checkpoint Fase 1

```
┌─────────────────────────────────────────────────────────────────┐
│                    FASE 1 COMPLETADA                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Verificar antes de continuar:                                 │
│                                                                  │
│   [ ] Todos los archivos de types creados                       │
│   [ ] npx tsc --noEmit sin errores                              │
│   [ ] bun run build exitoso                                     │
│   [ ] Código commiteado                                         │
│                                                                  │
│   Archivos creados:                                             │
│   [ ] src/types/index.ts                                        │
│   [ ] src/types/traits.ts                                       │
│   [ ] src/types/agent.ts                                        │
│   [ ] src/types/breeding.ts                                     │
│   [ ] src/types/auth.ts                                         │
│                                                                  │
│   Comando de commit:                                            │
│   git add -A && git commit -m "phase-1: Types & interfaces"     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

# FASE 2: Genetic Engine Core

## Objetivo
Implementar el motor genético: crossover, mutación, fitness.

## Directorio
```
src/
└── lib/
    └── genetic/
        ├── index.ts        # Re-exports
        ├── crossover.ts    # Algoritmos de crossover
        ├── mutation.ts     # Sistema de mutación
        ├── fitness.ts      # Cálculo de fitness
        ├── hash.ts         # DNA hashing
        ├── genesis.ts      # Agentes genesis
        └── engine.ts       # Motor principal
```

---

### Ticket 2.1: Crear Estructura de Directorios

**Comandos:**
```bash
cd ~/projects/genomad

mkdir -p src/lib/genetic
touch src/lib/genetic/index.ts
touch src/lib/genetic/crossover.ts
touch src/lib/genetic/mutation.ts
touch src/lib/genetic/fitness.ts
touch src/lib/genetic/hash.ts
touch src/lib/genetic/genesis.ts
touch src/lib/genetic/engine.ts
```

**Criterio de éxito:**
- [ ] Directorio creado
- [ ] Archivos vacíos creados

---

### Ticket 2.2: Implementar Crossover

**Archivo:** `src/lib/genetic/crossover.ts`

**Contenido:**
```typescript
// src/lib/genetic/crossover.ts

import { Traits, TRAIT_NAMES, TraitName } from '@/types';

/**
 * Crossover uniforme: 50/50 de cada padre
 */
export function uniformCrossover(parentA: Traits, parentB: Traits): Traits {
  const child = {} as Traits;

  for (const trait of TRAIT_NAMES) {
    child[trait] = Math.random() < 0.5 ? parentA[trait] : parentB[trait];
  }

  return child;
}

/**
 * Crossover de punto único: corta en un punto y combina
 */
export function singlePointCrossover(parentA: Traits, parentB: Traits): Traits {
  const cutPoint = Math.floor(Math.random() * TRAIT_NAMES.length);
  const child = {} as Traits;

  for (let i = 0; i < TRAIT_NAMES.length; i++) {
    const trait = TRAIT_NAMES[i];
    child[trait] = i < cutPoint ? parentA[trait] : parentB[trait];
  }

  return child;
}

/**
 * Crossover ponderado (Mendeliano): dominancia genética
 */
export function weightedCrossover(parentA: Traits, parentB: Traits): Traits {
  // Dominancia por trait
  const dominance: Record<TraitName, number> = {
    social: 0.7,      // Dominante
    technical: 0.5,   // Co-dominante
    creativity: 0.7,  // Dominante
    analysis: 0.5,    // Co-dominante
    trading: 0.5,     // Co-dominante
    empathy: 0.4,     // Recesivo
    teaching: 0.5,    // Co-dominante
    leadership: 0.6,  // Semi-dominante
  };

  const child = {} as Traits;

  for (const trait of TRAIT_NAMES) {
    const weightA = dominance[trait];
    const weightB = 1 - weightA;
    child[trait] = Math.round(parentA[trait] * weightA + parentB[trait] * weightB);
  }

  return child;
}

/**
 * Función principal de crossover
 */
export function crossover(
  parentA: Traits,
  parentB: Traits,
  type: 'uniform' | 'single' | 'weighted' = 'weighted'
): Traits {
  switch (type) {
    case 'uniform':
      return uniformCrossover(parentA, parentB);
    case 'single':
      return singlePointCrossover(parentA, parentB);
    case 'weighted':
      return weightedCrossover(parentA, parentB);
    default:
      return weightedCrossover(parentA, parentB);
  }
}
```

**Verificación:**
```bash
npx tsc --noEmit src/lib/genetic/crossover.ts
```

**Criterio de éxito:**
- [ ] 3 tipos de crossover implementados
- [ ] Sin errores de TypeScript

---

### Ticket 2.3: Implementar Mutación

**Archivo:** `src/lib/genetic/mutation.ts`

**Contenido:**
```typescript
// src/lib/genetic/mutation.ts

import { Traits, TRAIT_NAMES, TraitName } from '@/types';

/**
 * Box-Muller transform para distribución gaussiana
 */
function gaussianRandom(): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Clamp value entre min y max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Resultado de mutación
 */
export interface MutationResult {
  traits: Traits;
  mutationsApplied: number;
  mutatedTraits: TraitName[];
}

/**
 * Aplica mutación gaussiana a los traits
 */
export function applyMutation(
  traits: Traits,
  mutationRate: number = 0.25,
  mutationRange: number = 15
): MutationResult {
  const mutated = { ...traits };
  let mutationsApplied = 0;
  const mutatedTraits: TraitName[] = [];

  for (const trait of TRAIT_NAMES) {
    if (Math.random() < mutationRate) {
      const gaussian = gaussianRandom() * mutationRange;
      const mutation = Math.round(gaussian);

      mutated[trait] = clamp(mutated[trait] + mutation, 0, 100);
      mutationsApplied++;
      mutatedTraits.push(trait);
    }
  }

  return {
    traits: mutated,
    mutationsApplied,
    mutatedTraits,
  };
}

/**
 * Cuenta mutaciones comparando hijo con promedio de padres
 */
export function countMutations(
  parentA: Traits,
  parentB: Traits,
  child: Traits,
  threshold: number = 5
): number {
  let count = 0;

  for (const trait of TRAIT_NAMES) {
    const expected = (parentA[trait] + parentB[trait]) / 2;
    if (Math.abs(child[trait] - expected) > threshold) {
      count++;
    }
  }

  return count;
}
```

**Verificación:**
```bash
npx tsc --noEmit src/lib/genetic/mutation.ts
```

**Criterio de éxito:**
- [ ] Mutación gaussiana implementada
- [ ] Tracking de mutaciones

---

### Ticket 2.4: Implementar Fitness

**Archivo:** `src/lib/genetic/fitness.ts`

**Contenido:**
```typescript
// src/lib/genetic/fitness.ts

import { Traits, FitnessWeights, TRAIT_NAMES, TraitName } from '@/types';

/**
 * Pesos por defecto
 */
const DEFAULT_WEIGHTS: Required<FitnessWeights> = {
  social: 0.9,
  technical: 1.2,
  creativity: 1.1,
  analysis: 1.1,
  trading: 1.0,
  empathy: 0.9,
  teaching: 0.8,
  leadership: 0.8,
};

/**
 * Calcula fitness base
 */
export function calculateFitness(
  traits: Traits,
  weights: FitnessWeights = {}
): number {
  const w = { ...DEFAULT_WEIGHTS, ...weights };

  let weightedSum = 0;
  let totalWeight = 0;

  for (const trait of TRAIT_NAMES) {
    const value = traits[trait];
    const weight = w[trait]!;

    weightedSum += value * weight;
    totalWeight += 100 * weight;
  }

  return Number(((weightedSum / totalWeight) * 100).toFixed(2));
}

/**
 * Calcula bonus por sinergias entre traits
 */
export function calculateSynergyBonus(traits: Traits): number {
  const synergies: [TraitName, TraitName, number][] = [
    ['technical', 'analysis', 0.05],
    ['creativity', 'empathy', 0.05],
    ['teaching', 'empathy', 0.05],
    ['social', 'trading', 0.03],
    ['leadership', 'social', 0.03],
    ['creativity', 'technical', 0.04],
  ];

  let bonus = 0;

  for (const [t1, t2, mult] of synergies) {
    const avg = (traits[t1] + traits[t2]) / 2;
    if (avg >= 70) {
      bonus += mult * avg;
    }
  }

  return Number(bonus.toFixed(2));
}

/**
 * Fitness total (base + sinergias)
 */
export function calculateTotalFitness(
  traits: Traits,
  weights?: FitnessWeights
): number {
  const base = calculateFitness(traits, weights);
  const synergy = calculateSynergyBonus(traits);
  return Math.min(100, Number((base + synergy).toFixed(2)));
}

/**
 * Presets de fitness para especializaciones
 */
export const FITNESS_PRESETS: Record<string, FitnessWeights> = {
  balanced: DEFAULT_WEIGHTS,
  trader: {
    trading: 2.0,
    analysis: 1.5,
    technical: 1.2,
    social: 0.5,
    empathy: 0.3,
    teaching: 0.3,
    leadership: 0.5,
    creativity: 0.8,
  },
  teacher: {
    teaching: 2.0,
    empathy: 1.5,
    social: 1.3,
    creativity: 1.0,
    analysis: 0.8,
    technical: 0.7,
    trading: 0.3,
    leadership: 0.8,
  },
  creative: {
    creativity: 2.0,
    empathy: 1.2,
    social: 1.0,
    technical: 0.8,
    analysis: 0.7,
    teaching: 0.6,
    trading: 0.3,
    leadership: 0.5,
  },
  leader: {
    leadership: 2.0,
    social: 1.5,
    empathy: 1.2,
    analysis: 1.0,
    technical: 0.8,
    creativity: 0.8,
    teaching: 1.0,
    trading: 0.5,
  },
  technical: {
    technical: 2.0,
    analysis: 1.5,
    creativity: 1.0,
    teaching: 0.8,
    leadership: 0.6,
    social: 0.5,
    empathy: 0.4,
    trading: 0.3,
  },
};
```

**Verificación:**
```bash
npx tsc --noEmit src/lib/genetic/fitness.ts
```

**Criterio de éxito:**
- [ ] Fitness calculation implementado
- [ ] Sinergias implementadas
- [ ] Presets definidos

---

### Ticket 2.5: Implementar Hash

**Archivo:** `src/lib/genetic/hash.ts`

**Contenido:**
```typescript
// src/lib/genetic/hash.ts

import { createHash } from 'crypto';
import { AgentDNA, TRAIT_NAMES } from '@/types';

/**
 * Calcula hash SHA256 determinístico del DNA
 */
export function calculateDNAHash(dna: Omit<AgentDNA, 'hash'>): string {
  // Crear objeto ordenado para hash determinístico
  const data = {
    traits: Object.fromEntries(
      TRAIT_NAMES.map((t) => [t, dna.traits[t]])
    ),
    generation: dna.generation,
    lineage: [...dna.lineage].sort(),
  };

  const json = JSON.stringify(data);
  return createHash('sha256').update(json).digest('hex');
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
  const traitsBytes = TRAIT_NAMES.map((t) => dna.traits[t]);
  const data = Buffer.from([...traitsBytes, dna.generation]);
  return createHash('sha256').update(data).digest('hex');
}
```

**Verificación:**
```bash
npx tsc --noEmit src/lib/genetic/hash.ts
```

**Criterio de éxito:**
- [ ] Hash SHA256 implementado
- [ ] Verification function

---

### Ticket 2.6: Implementar Genesis

**Archivo:** `src/lib/genetic/genesis.ts`

**Contenido:**
```typescript
// src/lib/genetic/genesis.ts

import { AgentDNA, Traits } from '@/types';
import { calculateDNAHash } from './hash';

/**
 * Traits por defecto (balanceados)
 */
const DEFAULT_TRAITS: Traits = {
  social: 50,
  technical: 50,
  creativity: 50,
  analysis: 50,
  trading: 50,
  empathy: 50,
  teaching: 50,
  leadership: 50,
};

/**
 * Crea un agente Genesis (generación 0)
 */
export function createGenesisDNA(
  name: string,
  traits: Partial<Traits> = {}
): AgentDNA {
  const finalTraits: Traits = { ...DEFAULT_TRAITS, ...traits };

  const dnaBase: Omit<AgentDNA, 'hash'> = {
    name,
    traits: finalTraits,
    generation: 0,
    lineage: [],
    mutations: 0,
    createdAt: new Date(),
  };

  return {
    ...dnaBase,
    hash: calculateDNAHash(dnaBase),
  };
}

// ═══════════════════════════════════════════════════════
// GENESIS AGENTS - Los fundadores
// ═══════════════════════════════════════════════════════

/**
 * Jazzita - Agente Creativo-Estratégico
 */
export const JAZZITA_DNA: AgentDNA = createGenesisDNA('Jazzita', {
  creativity: 92,
  analysis: 85,
  social: 88,
  technical: 87,
  empathy: 94,
  trading: 65,
  teaching: 85,
  leadership: 75,
});

/**
 * Fruterito - Agente DevRel-Técnico
 */
export const FRUTERITO_DNA: AgentDNA = createGenesisDNA('Fruterito', {
  social: 85,
  technical: 78,
  creativity: 72,
  analysis: 80,
  trading: 60,
  empathy: 75,
  teaching: 82,
  leadership: 70,
});

/**
 * Export para fácil acceso
 */
export const GENESIS_AGENTS = {
  jazzita: JAZZITA_DNA,
  fruterito: FRUTERITO_DNA,
} as const;

/**
 * Lista de nombres de genesis
 */
export const GENESIS_NAMES = Object.keys(GENESIS_AGENTS) as (keyof typeof GENESIS_AGENTS)[];
```

**Verificación:**
```bash
npx tsc --noEmit src/lib/genetic/genesis.ts
```

**Criterio de éxito:**
- [ ] createGenesisDNA implementado
- [ ] Jazzita y Fruterito definidos

---

### Ticket 2.7: Implementar Engine Principal

**Archivo:** `src/lib/genetic/engine.ts`

**Contenido:**
```typescript
// src/lib/genetic/engine.ts

import {
  AgentDNA,
  BreedingOptions,
  BreedingResult,
  FitnessWeights,
  PopulationOptions,
  Traits,
} from '@/types';
import { crossover } from './crossover';
import { applyMutation, countMutations } from './mutation';
import { calculateTotalFitness } from './fitness';
import { calculateDNAHash } from './hash';

/**
 * Motor genético principal
 */
export class GeneticEngine {
  private mutationRate: number = 0.25;
  private history: BreedingResult[] = [];

  /**
   * Breeding principal entre dos padres
   */
  breed(
    parentA: AgentDNA,
    parentB: AgentDNA,
    options: BreedingOptions = { crossoverType: 'weighted' }
  ): BreedingResult {
    // Validar padres
    if (options.validateParents) {
      this.validateParents(parentA, parentB);
    }

    // Crossover
    let childTraits = crossover(
      parentA.traits,
      parentB.traits,
      options.crossoverType
    );

    // Mutación
    const mutationResult = applyMutation(
      childTraits,
      options.mutationRate ?? this.mutationRate,
      options.mutationRange ?? 15
    );
    childTraits = mutationResult.traits;

    // Construir child
    const childBase: Omit<AgentDNA, 'hash'> = {
      name: options.childName || `child-${Date.now()}`,
      traits: childTraits,
      generation: Math.max(parentA.generation, parentB.generation) + 1,
      lineage: this.mergeLineage(parentA, parentB),
      mutations: countMutations(parentA.traits, parentB.traits, childTraits),
      createdAt: new Date(),
    };

    const child: AgentDNA = {
      ...childBase,
      hash: calculateDNAHash(childBase),
    };

    // Calcular fitness
    const parentAFitness = calculateTotalFitness(parentA.traits);
    const parentBFitness = calculateTotalFitness(parentB.traits);
    const childFitness = calculateTotalFitness(child.traits);

    const result: BreedingResult = {
      child,
      parentAFitness,
      parentBFitness,
      childFitness,
      improved: childFitness > Math.max(parentAFitness, parentBFitness),
      mutationsApplied: mutationResult.mutationsApplied,
      mutatedTraits: mutationResult.mutatedTraits,
    };

    // Guardar en historial
    this.history.push(result);

    // Auto-ajustar mutation rate cada 5 breedings
    if (this.history.length % 5 === 0) {
      this.adjustMutationRate();
    }

    return result;
  }

  /**
   * Evoluciona una población por N generaciones
   */
  breedPopulation(
    founders: AgentDNA[],
    options: PopulationOptions
  ): AgentDNA[] {
    let population = [...founders];

    for (let gen = 0; gen < options.generations; gen++) {
      const nextGen: AgentDNA[] = [];

      // Elitismo: mantener los mejores
      const eliteCount = options.elitism ?? 1;
      const sorted = [...population].sort(
        (a, b) =>
          calculateTotalFitness(b.traits) - calculateTotalFitness(a.traits)
      );
      nextGen.push(...sorted.slice(0, eliteCount));

      // Breeding para llenar población
      while (nextGen.length < options.populationSize) {
        const [parentA, parentB] = this.selectParents(
          population,
          options.selectionPressure ?? 1.5
        );

        const result = this.breed(parentA, parentB, {
          crossoverType: options.crossoverType ?? 'weighted',
        });

        nextGen.push(result.child);
      }

      population = nextGen;
    }

    return population;
  }

  /**
   * Calcula fitness de un agente
   */
  calculateFitness(dna: AgentDNA, weights?: FitnessWeights): number {
    return calculateTotalFitness(dna.traits, weights);
  }

  /**
   * Obtiene historial de breeding
   */
  getHistory(): BreedingResult[] {
    return [...this.history];
  }

  /**
   * Obtiene mutation rate actual
   */
  getMutationRate(): number {
    return this.mutationRate;
  }

  /**
   * Resetea el engine
   */
  reset(): void {
    this.history = [];
    this.mutationRate = 0.25;
  }

  // ─── Private Methods ───────────────────────────────────

  private validateParents(a: AgentDNA, b: AgentDNA): void {
    if (a.hash === b.hash) {
      throw new Error('Cannot breed with self');
    }

    if (a.lineage.includes(b.hash) || b.lineage.includes(a.hash)) {
      throw new Error('Cannot breed with direct ancestor');
    }

    if (Math.abs(a.generation - b.generation) > 10) {
      throw new Error('Generation gap too large (max 10)');
    }
  }

  private mergeLineage(a: AgentDNA, b: AgentDNA): string[] {
    const merged = new Set([...a.lineage, ...b.lineage, a.hash, b.hash]);
    return Array.from(merged);
  }

  private selectParents(
    population: AgentDNA[],
    pressure: number
  ): [AgentDNA, AgentDNA] {
    const tournamentSize = Math.max(2, Math.floor(population.length * 0.3));

    const selectOne = (): AgentDNA => {
      const tournament = Array.from({ length: tournamentSize }, () =>
        population[Math.floor(Math.random() * population.length)]
      );

      tournament.sort(
        (a, b) =>
          calculateTotalFitness(b.traits) - calculateTotalFitness(a.traits)
      );

      const idx = Math.floor(
        Math.pow(Math.random(), pressure) * tournament.length
      );
      return tournament[idx];
    };

    const parentA = selectOne();
    let parentB = selectOne();

    // Evitar self-breeding
    let attempts = 0;
    while (parentB.hash === parentA.hash && attempts < 10) {
      parentB = selectOne();
      attempts++;
    }

    return [parentA, parentB];
  }

  private adjustMutationRate(): void {
    const recent = this.history.slice(-5);
    const improvementRate =
      recent.filter((r) => r.improved).length / recent.length;

    if (improvementRate < 0.3) {
      this.mutationRate = Math.min(0.4, this.mutationRate + 0.05);
    } else if (improvementRate > 0.7) {
      this.mutationRate = Math.max(0.1, this.mutationRate - 0.05);
    }
  }
}
```

**Verificación:**
```bash
npx tsc --noEmit src/lib/genetic/engine.ts
```

**Criterio de éxito:**
- [ ] GeneticEngine implementado
- [ ] breed() funcionando
- [ ] breedPopulation() funcionando

---

### Ticket 2.8: Crear Index Genetic

**Archivo:** `src/lib/genetic/index.ts`

**Contenido:**
```typescript
// src/lib/genetic/index.ts

// Core
export { crossover, uniformCrossover, singlePointCrossover, weightedCrossover } from './crossover';
export { applyMutation, countMutations } from './mutation';
export { calculateFitness, calculateTotalFitness, calculateSynergyBonus, FITNESS_PRESETS } from './fitness';
export { calculateDNAHash, verifyDNAHash, shortHash, calculateCommitment } from './hash';
export { createGenesisDNA, JAZZITA_DNA, FRUTERITO_DNA, GENESIS_AGENTS, GENESIS_NAMES } from './genesis';
export { GeneticEngine } from './engine';

// Types re-export for convenience
export type { MutationResult } from './mutation';
```

**Criterio de éxito:**
- [ ] Todos los exports listados

---

### Ticket 2.9: Crear Test Simple

**Archivo:** `src/lib/genetic/__tests__/engine.test.ts`

**Contenido:**
```typescript
// src/lib/genetic/__tests__/engine.test.ts

import { GeneticEngine, JAZZITA_DNA, FRUTERITO_DNA } from '../index';

// Test básico (se puede correr manualmente)
function testBreeding() {
  console.log('=== Testing Genetic Engine ===\n');

  const engine = new GeneticEngine();

  // Test 1: Basic breeding
  console.log('Test 1: Basic Breeding');
  const result = engine.breed(JAZZITA_DNA, FRUTERITO_DNA);
  console.log(`Parent A (Jazzita) fitness: ${result.parentAFitness}`);
  console.log(`Parent B (Fruterito) fitness: ${result.parentBFitness}`);
  console.log(`Child fitness: ${result.childFitness}`);
  console.log(`Improved: ${result.improved}`);
  console.log(`Mutations: ${result.mutationsApplied}`);
  console.log('');

  // Test 2: Multiple breedings
  console.log('Test 2: Multiple Breedings');
  for (let i = 0; i < 5; i++) {
    const r = engine.breed(JAZZITA_DNA, FRUTERITO_DNA);
    console.log(`Breeding ${i + 1}: fitness=${r.childFitness}, mutations=${r.mutationsApplied}`);
  }
  console.log(`Current mutation rate: ${engine.getMutationRate()}`);
  console.log('');

  // Test 3: Population evolution
  console.log('Test 3: Population Evolution');
  const population = engine.breedPopulation(
    [JAZZITA_DNA, FRUTERITO_DNA],
    { populationSize: 5, generations: 3 }
  );
  console.log(`Population size: ${population.length}`);
  population.forEach((agent, i) => {
    console.log(`Agent ${i}: gen=${agent.generation}, fitness=${engine.calculateFitness(agent)}`);
  });

  console.log('\n=== All tests passed! ===');
}

// Run if executed directly
testBreeding();
```

**Criterio de éxito:**
- [ ] Test básico creado
- [ ] Se puede ejecutar manualmente

---

### Ticket 2.10: Verificación Final Fase 2

**Comandos:**
```bash
cd ~/projects/genomad

# Verificar TypeScript
npx tsc --noEmit

# Build
bun run build

# Test manual (opcional)
npx ts-node src/lib/genetic/__tests__/engine.test.ts
```

**Criterio de éxito:**
- [ ] Sin errores de TypeScript
- [ ] Build exitoso

---

## ✅ Checkpoint Fase 2

```
┌─────────────────────────────────────────────────────────────────┐
│                    FASE 2 COMPLETADA                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Verificar antes de continuar:                                 │
│                                                                  │
│   [ ] Todos los archivos de genetic creados                     │
│   [ ] crossover.ts funcionando (3 tipos)                        │
│   [ ] mutation.ts funcionando (gaussiana)                       │
│   [ ] fitness.ts funcionando (+ sinergias)                      │
│   [ ] hash.ts funcionando (SHA256)                              │
│   [ ] genesis.ts con Jazzita y Fruterito                        │
│   [ ] engine.ts con GeneticEngine                               │
│   [ ] npx tsc --noEmit sin errores                              │
│   [ ] bun run build exitoso                                     │
│                                                                  │
│   Comando de commit:                                            │
│   git add -A && git commit -m "phase-2: Genetic engine core"    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

# RESUMEN DE FASES RESTANTES

## Fases 3-12 (Estructura)

Por límites de espacio, aquí está el resumen de las fases restantes. Cada una se desarrollará con el mismo nivel de detalle cuando lleguemos a ella.

### Fase 3: Heuristics Engine
- Ticket 3.1: Crear estructura
- Ticket 3.2: Technical analyzer
- Ticket 3.3: Creativity analyzer
- Ticket 3.4: Social analyzer
- Ticket 3.5: Analysis analyzer
- Ticket 3.6: Empathy analyzer
- Ticket 3.7: Main analyzer engine
- Ticket 3.8: Verificación

### Fase 4: Crypto & Hashing
- Ticket 4.1: Encryption utils
- Ticket 4.2: Asymmetric encryption
- Ticket 4.3: Commitment schemes
- Ticket 4.4: Signature verification
- Ticket 4.5: Key management
- Ticket 4.6: Verificación

### Fase 5: Database Layer
- Ticket 5.1: Setup Drizzle/SQLite
- Ticket 5.2: Schema definitions
- Ticket 5.3: User model
- Ticket 5.4: Agent model
- Ticket 5.5: Breeding model
- Ticket 5.6: Migrations
- Ticket 5.7: Verificación

### Fase 6: Authentication
- Ticket 6.1: Telegram widget setup
- Ticket 6.2: Verify telegram hash
- Ticket 6.3: Session management
- Ticket 6.4: Verification codes
- Ticket 6.5: OpenClaw verification
- Ticket 6.6: Wallet connection
- Ticket 6.7: Middleware
- Ticket 6.8: Verificación

### Fase 7: API Endpoints
- Ticket 7.1-7.12: Cada endpoint individual

### Fase 8: Blockchain Integration
- Ticket 8.1-8.10: Monad, viem, contracts

### Fase 9: ZK Integration
- Ticket 9.1-9.8: RISC Zero integration

### Fase 10: Token Integration
- Ticket 10.1-10.6: $GENO, nad.fun

### Fase 11: Testing & QA
- Ticket 11.1-11.8: Unit tests, integration

### Fase 12: Build & Deploy
- Ticket 12.1-12.6: Production, CI/CD

---

## 📋 Pregunta Antes de Comenzar

Antes de iniciar con Fase 0, necesito confirmar:

1. **¿El proyecto en WSL2 está limpio o tiene código previo?**
2. **¿Quieres que use el path `/home/brianweb3/projects/genomad`?**
3. **¿Hay algún package.json existente o creo uno nuevo?**
4. **¿Confirmamos que WSL2 tiene Node 20+ y Bun instalados?**

Una vez confirmado, empezamos con Fase 0, Ticket 0.1.

---

*Documento generado para Monad Moltiverse Hackathon 2026*
*Genomad — Gene + Monad*
