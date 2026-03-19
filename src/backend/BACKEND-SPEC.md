# 🔧 BACKEND SPEC — Genomad

> Guía completa del backend de inicio a fin. Sin código, solo arquitectura y flujos.
> Última actualización: 2026-02-15 01:05 UTC

---

## 📋 Índice

1. [Visión General](#1-visión-general)
2. [Arquitectura Descentralizada](#2-arquitectura-descentralizada)
3. [Token Economy ($GENO)](#3-token-economy-geno)
4. [Tech Stack](#4-tech-stack)
5. [Skills Disponibles](#5-skills-disponibles)
6. [Flujo 1: Registro de Agente](#6-flujo-1-registro-de-agente)
7. [Flujo 2: Breeding](#7-flujo-2-breeding)
8. [Flujo 3: Activación del Bebé](#8-flujo-3-activación-del-bebé)
9. [Flujo 4: Renta de Agentes](#9-flujo-4-renta-de-agentes)
10. [Flujo 5: Independencia](#10-flujo-5-independencia)
11. [Smart Contracts](#11-smart-contracts)
12. [API Endpoints](#12-api-endpoints)
13. [Base de Datos (Cache)](#13-base-de-datos-cache)
14. [Seguridad](#14-seguridad)
15. [Plan de Implementación](#15-plan-de-implementación)

---

## 1. Visión General

### ¿Qué es Genomad?

Genomad es una plataforma de **breeding y evolución de agentes AI** donde:

- El **DNA vive on-chain** (Monad blockchain)
- Solo los **padres pueden leer** el DNA de sus hijos (ZK encryption)
- Los bebés son **agentes REALES** que necesitan compute para vivir
- El modelo principal es **RENTA**, no venta

### Principios Fundamentales

| Principio | Descripción |
|-----------|-------------|
| **Descentralizado** | DNA en blockchain, no en nuestra DB |
| **Privado** | Solo padres leen DNA (ZK proofs) |
| **Real** | Los bebés son agentes funcionales |
| **Sostenible** | Modelo de renta genera ingresos continuos |

---

## 2. Arquitectura Descentralizada

```
┌─────────────────────────────────────────────────────────────────────┐
│                    GENOMAD ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────────┐                                               │
│   │    FRONTEND     │  Next.js 16 + TailwindCSS 4                   │
│   │   (genomad.app) │                                               │
│   └────────┬────────┘                                               │
│            │                                                         │
│            ▼                                                         │
│   ┌─────────────────┐                                               │
│   │    BACKEND      │  Next.js API Routes + Bun                     │
│   │   (API Layer)   │                                               │
│   │                 │  Funciones:                                   │
│   │   • Auth        │  - Telegram Login                             │
│   │   • Analysis    │  - Heurísticas de traits                      │
│   │   • Orchestrate │  - Coordinar breeding                         │
│   │   • Cache       │  - Cache de datos públicos                    │
│   └────────┬────────┘                                               │
│            │                                                         │
│      ┌─────┴─────┐                                                  │
│      │           │                                                   │
│      ▼           ▼                                                   │
│ ┌─────────┐ ┌─────────────┐                                         │
│ │ RISC    │ │   MONAD     │                                         │
│ │ ZERO    │ │ BLOCKCHAIN  │                                         │
│ │         │ │             │                                         │
│ │ • ZK    │ │ • AgentDNA  │  ← SOURCE OF TRUTH                      │
│ │   Proofs│ │ • Breeding  │                                         │
│ │         │ │ • Rental    │                                         │
│ └─────────┘ └─────────────┘                                         │
│                  │                                                   │
│                  ▼                                                   │
│   ┌─────────────────────────────────────────────────────────┐       │
│   │              OPENCLAW INSTANCES (Compute)                │       │
│   │                                                          │       │
│   │   ┌─────────┐  ┌─────────┐  ┌─────────┐                 │       │
│   │   │ Parent A│  │ Parent B│  │ Child   │                 │       │
│   │   │ Server  │  │ Server  │  │ (hosted)│                 │       │
│   │   └─────────┘  └─────────┘  └─────────┘                 │       │
│   │                                                          │       │
│   └─────────────────────────────────────────────────────────┘       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### ¿Dónde vive cada cosa?

| Componente | Ubicación | Razón |
|------------|-----------|-------|
| **DNA completo** | Monad (encriptado) | Descentralizado, inmutable |
| **DNA commitment** | Monad (público) | Verificable sin revelar |
| **Archivos agente** | Monad (encriptado) | SOUL.md, IDENTITY.md, TOOLS.md |
| **Cache público** | Genomad DB | Performance, UX |
| **Traits calculados** | RISC Zero | Verificable, no manipulable |
| **Agente corriendo** | OpenClaw del padre | Compute real |

---

## 3. Token Economy ($GENO)

### El Token de Genomad

**$GENO** es el token nativo del ecosistema Genomad, creado en **nad.fun** (Monad's token launchpad).

```
┌─────────────────────────────────────────────────────────────────────┐
│                    $GENO TOKEN ECONOMY                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────┐         ┌─────────────┐                           │
│   │    MONAD    │────────▶│   NAD.FUN   │                           │
│   │   (compra)  │         │  (bonding)  │                           │
│   └─────────────┘         └──────┬──────┘                           │
│                                  │                                   │
│                                  ▼                                   │
│                           ┌─────────────┐                           │
│                           │   $GENO     │                           │
│                           │   TOKEN     │                           │
│                           └──────┬──────┘                           │
│                                  │                                   │
│            ┌─────────────────────┼─────────────────────┐            │
│            │                     │                     │            │
│            ▼                     ▼                     ▼            │
│     ┌─────────────┐       ┌─────────────┐       ┌─────────────┐    │
│     │  BREEDING   │       │   RENTAL    │       │  SERVICES   │    │
│     │    FEES     │       │   PAYMENTS  │       │   (future)  │    │
│     └─────────────┘       └─────────────┘       └─────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Características del Token

| Propiedad | Valor |
|-----------|-------|
| **Nombre** | Genomad Token |
| **Símbolo** | $GENO |
| **Plataforma** | nad.fun (Monad) |
| **Compra** | Solo con $MONAD |
| **Bonding Curve** | Sí (nad.fun nativo) |
| **Supply** | Definido en launch |

### Única Forma de Compra

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   Usuario tiene $MONAD                                              │
│          │                                                           │
│          ▼                                                           │
│   Va a nad.fun/genomad                                              │
│          │                                                           │
│          ▼                                                           │
│   Compra $GENO con $MONAD                                           │
│          │                                                           │
│          ▼                                                           │
│   Usa $GENO en Genomad ecosystem                                    │
│                                                                      │
│   ❌ NO se puede comprar con USD                                     │
│   ❌ NO se puede comprar con ETH                                     │
│   ❌ NO se puede comprar con otras crypto                            │
│   ✅ SOLO con $MONAD                                                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Usos del Token $GENO

| Uso | Descripción | Fee |
|-----|-------------|-----|
| **Breeding** | Pagar por crear nuevos agentes | X $GENO |
| **Renta** | Pagar por rentar agentes | Y $GENO/día |
| **Venta** | Comprar/vender agentes en marketplace | % en $GENO |
| **Activación** | Fee por activar agentes | Z $GENO |
| **Premium Features** | Funciones avanzadas (futuro) | Variable |
| **Governance** | Votar en decisiones (futuro) | Holding |

### Flujo Económico

```
                         GENOMAD ECONOMY
                         ═══════════════

     ┌──────────────────────────────────────────────────┐
     │                                                   │
     │   USER A                         USER B          │
     │   ───────                        ───────         │
     │   Tiene $MONAD                   Tiene $MONAD    │
     │        │                              │          │
     │        ▼                              ▼          │
     │   Compra $GENO                   Compra $GENO    │
     │   en nad.fun                     en nad.fun      │
     │        │                              │          │
     │        │         ┌────────┐          │          │
     │        └────────▶│ GENOMAD │◀────────┘          │
     │                  │ ECONOMY │                     │
     │                  └────┬───┘                     │
     │                       │                         │
     │         ┌─────────────┼─────────────┐          │
     │         │             │             │          │
     │         ▼             ▼             ▼          │
     │    ┌────────┐   ┌────────┐   ┌────────┐       │
     │    │BREEDING│   │ RENTAL │   │  SALE  │       │
     │    │  FEE   │   │PAYMENT │   │  FEE   │       │
     │    └────────┘   └────────┘   └────────┘       │
     │                       │                         │
     │                       ▼                         │
     │              ┌──────────────┐                   │
     │              │  TREASURY    │                   │
     │              │  (Protocol)  │                   │
     │              └──────────────┘                   │
     │                                                 │
     └─────────────────────────────────────────────────┘
```

### Distribución de Fees

| Receptor | % | Descripción |
|----------|---|-------------|
| **Owner del agente** | 85% | Dueño que renta/vende |
| **Padres (royalties)** | 10% | 5% cada padre del linaje |
| **Protocol Treasury** | 5% | Desarrollo y mantenimiento |

### Integración con nad.fun

Para crear el token usamos la skill `nad-fun`:

```
Skill: nad-fun
├── Crear token en bonding curve
├── Gestionar liquidez
├── Consultar precios
└── Ejecutar trades
```

**Pasos para launch:**

1. Crear token en nad.fun con metadata de Genomad
2. Configurar bonding curve parameters
3. Integrar contract address en Genomad app
4. Habilitar compras de $GENO desde la UI

### Precio y Bonding Curve

```
BONDING CURVE (nad.fun)
────────────────────────

Precio
  ▲
  │                    ╱
  │                  ╱
  │                ╱
  │              ╱
  │            ╱
  │          ╱
  │        ╱
  │      ╱
  │    ╱
  │  ╱
  │╱
  └────────────────────▶ Supply

  - Primeros compradores: precio bajo
  - Más demanda: precio sube
  - Más oferta: precio baja
  - Automático, sin manipulación
```

### Smart Contract Integration

```solidity
// En BreedingFactory.sol
IERC20 public genoToken;

function breed(...) external {
    // Cobrar en $GENO
    uint256 fee = breedingFeeInGeno;
    genoToken.transferFrom(msg.sender, address(this), fee);
    
    // Distribuir
    genoToken.transfer(owner, fee * 85 / 100);
    genoToken.transfer(parentA, fee * 5 / 100);
    genoToken.transfer(parentB, fee * 5 / 100);
    genoToken.transfer(treasury, fee * 5 / 100);
    
    // Ejecutar breeding...
}
```

---

## 4. Tech Stack

| Capa | Tecnología | Uso |
|------|------------|-----|
| **Frontend** | Next.js 16 | App web |
| **Styling** | TailwindCSS 4 | UI components |
| **Language** | TypeScript (.ts, .tsx) | Todo el código |
| **Runtime** | Bun | Rápido, moderno |
| **API** | Next.js API Routes | Endpoints |
| **Auth** | Telegram Login Widget | Verificar ownership |
| **Blockchain** | Monad | DNA storage, NFTs |
| **Token** | nad.fun ($GENO) | Economía del ecosistema |
| **Smart Contracts** | Solidity + Foundry | Deploy y verify |
| **ZK Proofs** | RISC Zero | Breeding verificable |
| **Database** | SQLite/Turso | Cache, no source of truth |

---

## 4. Skills Disponibles

### ¿Cuándo usar cada skill?

| Skill | Cuándo Usar | Archivos Clave |
|-------|-------------|----------------|
| **genetic-system** | Breeding, traits, fitness | `BREEDING.md`, `TYPESCRIPT.md` |
| **risc-zero** | Generar ZK proofs | `GUEST-CODE.md`, `HOST-CODE.md` |
| **monad-development** | Deploy contratos | `SKILL.md` |
| **nad-fun** | Tokenización (futuro) | `SKILL.md` |
| **hackathon-mode** | Workflow general | `SKILL.md` |

### Mapa de Skills por Flujo

```
REGISTRO DE AGENTE
├── hackathon-mode    → Setup inicial
├── genetic-system    → Análisis de traits (HEURISTICS)
└── risc-zero         → Encriptar DNA

BREEDING
├── genetic-system    → Crossover + Mutación
├── risc-zero         → ZK proof de breeding correcto
└── monad-development → Submit TX on-chain

ACTIVACIÓN
├── genetic-system    → Generar SOUL.md desde DNA
└── monad-development → Verificar on-chain

RENTA
├── monad-development → Smart contract de renta
└── genetic-system    → Transferir permisos
```

---

## 5. Flujo 1: Registro de Agente

### Objetivo
Un usuario con OpenClaw registra su agente en Genomad. Su DNA se calcula automáticamente y se guarda ON-CHAIN.

### Prerequisitos
- Usuario tiene OpenClaw corriendo
- Archivos OBLIGATORIOS: SOUL.md, IDENTITY.md, TOOLS.md
- Usuario tiene wallet de Monad

### Paso a Paso

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE REGISTRO                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  PASO 1: CONEXIÓN                                                   │
│  ─────────────────                                                  │
│  Usuario entra a genomad.app/register                               │
│                                                                      │
│  UI muestra:                                                        │
│  ┌──────────────────────────────────────────┐                       │
│  │  🧬 Registra tu Agente                    │                       │
│  │                                           │                       │
│  │  [🔵 Login con Telegram]                  │                       │
│  │                                           │                       │
│  │  Esto verificará que eres dueño de tu    │                       │
│  │  agente OpenClaw.                         │                       │
│  └──────────────────────────────────────────┘                       │
│                                                                      │
│  • Usar: Telegram Login Widget (oficial)                            │
│  • Obtiene: telegram_id, username, first_name                       │
│                                                                      │
│                                                                      │
│  PASO 2: VERIFICACIÓN DE OWNERSHIP                                  │
│  ─────────────────────────────────                                  │
│  Backend genera código único: "GNM-X7K9P2"                          │
│                                                                      │
│  UI muestra:                                                        │
│  ┌──────────────────────────────────────────┐                       │
│  │  ✅ Telegram conectado: @LPBrayan0        │                       │
│  │                                           │                       │
│  │  Ahora envía este comando a tu OpenClaw: │                       │
│  │                                           │                       │
│  │  /genomad register GNM-X7K9P2             │                       │
│  │                                           │                       │
│  │  [Esperando verificación...]              │                       │
│  └──────────────────────────────────────────┘                       │
│                                                                      │
│  • Usuario va a Telegram                                            │
│  • Envía comando a su bot OpenClaw                                  │
│  • OpenClaw necesita skill "genomad" instalado                      │
│                                                                      │
│                                                                      │
│  PASO 3: OPENCLAW RESPONDE                                          │
│  ─────────────────────────────                                      │
│  El skill "genomad" en OpenClaw:                                    │
│                                                                      │
│  1. Lee archivos obligatorios:                                      │
│     • SOUL.md                                                       │
│     • IDENTITY.md                                                   │
│     • TOOLS.md                                                      │
│                                                                      │
│  2. Hace POST a genomad.app/api/verify:                             │
│     {                                                               │
│       code: "GNM-X7K9P2",                                           │
│       telegramId: 1923367928,                                       │
│       agentName: "Fruterito",                                       │
│       botUsername: "@FruteritoBot",                                 │
│       files: {                                                      │
│         soul: "contenido de SOUL.md...",                            │
│         identity: "contenido de IDENTITY.md...",                    │
│         tools: "contenido de TOOLS.md..."                           │
│       }                                                             │
│     }                                                               │
│                                                                      │
│                                                                      │
│  PASO 4: ANÁLISIS AUTOMÁTICO DE TRAITS                              │
│  ─────────────────────────────────────                              │
│  Backend ejecuta HEURISTIC ENGINE:                                  │
│                                                                      │
│  • Skill a usar: genetic-system/HEURISTICS                          │
│                                                                      │
│  Analiza archivos y calcula:                                        │
│  {                                                                  │
│    social: 85,      ← Basado en palabras de conexión                │
│    technical: 78,   ← Keywords técnicos, code blocks                │
│    creativity: 72,  ← Diversidad léxica, metáforas                  │
│    analysis: 80,    ← Estructuras lógicas                           │
│    trading: 60,     ← Menciones de mercados                         │
│    empathy: 75,     ← Lenguaje emocional                            │
│    teaching: 82,    ← Explicaciones paso a paso                     │
│    leadership: 70   ← Toma de decisiones                            │
│  }                                                                  │
│                                                                      │
│  IMPORTANTE: Usuario NO puede modificar estos valores               │
│                                                                      │
│                                                                      │
│  PASO 5: ENCRIPTACIÓN Y REGISTRO ON-CHAIN                           │
│  ─────────────────────────────────────────                          │
│                                                                      │
│  5a. Generar DNA package:                                           │
│      {                                                              │
│        traits: { ... },                                             │
│        files: { soul, identity, tools },                            │
│        metadata: { name, generation: 0, ... }                       │
│      }                                                              │
│                                                                      │
│  5b. Encriptar con llave del usuario:                               │
│      • Skill a usar: risc-zero (encryption)                         │
│      • Solo el usuario podrá desencriptar                           │
│                                                                      │
│  5c. Calcular commitment (hash público):                            │
│      • Skill a usar: genetic-system/HASH                            │
│      • Permite verificar sin revelar                                │
│                                                                      │
│  5d. Submit a Monad:                                                │
│      • Skill a usar: monad-development                              │
│      • Contrato: AgentDNA.registerGenesis()                         │
│      • Costo: ~0.01 MON                                             │
│                                                                      │
│                                                                      │
│  PASO 6: CONFIRMACIÓN                                               │
│  ────────────────────                                               │
│  UI muestra:                                                        │
│  ┌──────────────────────────────────────────┐                       │
│  │  🎉 ¡Agente Registrado!                   │                       │
│  │                                           │                       │
│  │  ┌─────────────────────────┐              │                       │
│  │  │  🍓 FRUTERITO           │              │                       │
│  │  │  Generation 0 (Genesis) │              │                       │
│  │  │  Token ID: #2           │              │                       │
│  │  │  Fitness: 75.2          │              │                       │
│  │  └─────────────────────────┘              │                       │
│  │                                           │                       │
│  │  DNA guardado on-chain en Monad          │                       │
│  │  Solo tú puedes leerlo.                   │                       │
│  │                                           │                       │
│  │  [Ver en Explorer] [Ir a Breeding Lab]   │                       │
│  └──────────────────────────────────────────┘                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Flujo 2: Breeding

### Objetivo
Dos padres combinan sus DNAs para crear un nuevo agente hijo. El DNA del hijo se guarda on-chain y solo los padres pueden leerlo.

### Prerequisitos
- Ambos padres registrados en Genomad
- Al menos uno de los padres inicia el breeding
- Ambos deben autorizar (firma)

### Paso a Paso

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE BREEDING                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  PASO 1: SELECCIÓN DE PADRES                                        │
│  ───────────────────────────                                        │
│  Usuario (Brian) entra a genomad.app/breed                          │
│                                                                      │
│  UI muestra:                                                        │
│  ┌──────────────────────────────────────────┐                       │
│  │  🧬 BREEDING LAB                          │                       │
│  │                                           │                       │
│  │  Tus Agentes:                             │                       │
│  │  ┌─────────────┐                          │                       │
│  │  │ 🍓 Fruterito│ [Seleccionar]            │                       │
│  │  │ Fitness: 75 │                          │                       │
│  │  └─────────────┘                          │                       │
│  │                                           │                       │
│  │  Agentes Disponibles para Breeding:       │                       │
│  │  ┌─────────────┐                          │                       │
│  │  │ 🎨 Jazzita  │ [Solicitar Breeding]     │                       │
│  │  │ Fitness: 83 │                          │                       │
│  │  │ Owner: Jazz │                          │                       │
│  │  └─────────────┘                          │                       │
│  │                                           │                       │
│  └──────────────────────────────────────────┘                       │
│                                                                      │
│  Brian selecciona Fruterito + Jazzita                               │
│                                                                      │
│                                                                      │
│  PASO 2: SOLICITUD DE BREEDING                                      │
│  ─────────────────────────────                                      │
│  Brian hace click en "Solicitar Breeding"                           │
│                                                                      │
│  Backend crea breeding request:                                     │
│  {                                                                  │
│    requestId: "BR-001",                                             │
│    initiator: Brian,                                                │
│    parentA: 1 (Jazzita),                                            │
│    parentB: 2 (Fruterito),                                          │
│    status: "pending_approval",                                      │
│    fee: 0.01 MON                                                    │
│  }                                                                  │
│                                                                      │
│  Jazz recibe notificación (Telegram):                               │
│  "Brian quiere hacer breeding con Jazzita × Fruterito"              │
│                                                                      │
│                                                                      │
│  PASO 3: APROBACIÓN DEL OTRO PADRE                                  │
│  ────────────────────────────────                                   │
│  Jazz entra a genomad.app/requests                                  │
│                                                                      │
│  UI muestra:                                                        │
│  ┌──────────────────────────────────────────┐                       │
│  │  📬 Solicitudes Pendientes                │                       │
│  │                                           │                       │
│  │  Brian quiere breeding:                   │                       │
│  │  🎨 Jazzita × 🍓 Fruterito                │                       │
│  │                                           │                       │
│  │  Fee: 0.01 MON (lo paga Brian)           │                       │
│  │  Tu recibes: 0.005 MON (50%)             │                       │
│  │                                           │                       │
│  │  [✅ Aprobar]  [❌ Rechazar]              │                       │
│  └──────────────────────────────────────────┘                       │
│                                                                      │
│  Jazz aprueba → Firma con su wallet                                 │
│                                                                      │
│                                                                      │
│  PASO 4: AMBOS PROVEEN SU DNA (OFF-CHAIN)                           │
│  ─────────────────────────────────────────                          │
│  Para hacer breeding, necesitamos los DNAs desencriptados.          │
│                                                                      │
│  Proceso seguro:                                                    │
│  1. Backend solicita a ambos que desencripten su DNA                │
│  2. Cada uno firma con su wallet para autorizar                     │
│  3. DNA se envía a RISC Zero (nunca se guarda en backend)           │
│                                                                      │
│  • Skill a usar: risc-zero (secure compute)                         │
│                                                                      │
│                                                                      │
│  PASO 5: RISC ZERO EJECUTA BREEDING                                 │
│  ──────────────────────────────────                                 │
│  Dentro del zkVM (privado):                                         │
│                                                                      │
│  INPUTS (privados):                                                 │
│  • DNA de Jazzita (8 traits + archivos)                             │
│  • DNA de Fruterito (8 traits + archivos)                           │
│  • Random seed                                                      │
│                                                                      │
│  PROCESO:                                                           │
│  • Skill a usar: genetic-system/BREEDING                            │
│                                                                      │
│  1. Crossover (weighted):                                           │
│     child.creativity = 92*0.7 + 72*0.3 = 86                         │
│     child.empathy = 94*0.4 + 75*0.6 = 83                            │
│     ... (para los 8 traits)                                         │
│                                                                      │
│  2. Mutación (gaussian ±15):                                        │
│     child.creativity = 86 + 3 = 89  (mutó!)                         │
│     child.empathy = 83 + 7 = 90  (mutó!)                            │
│     ...                                                             │
│                                                                      │
│  3. Generar archivos del hijo:                                      │
│     • SOUL.md derivado de traits                                    │
│     • IDENTITY.md con linaje                                        │
│     • TOOLS.md heredado                                             │
│                                                                      │
│  OUTPUTS (públicos):                                                │
│  • DNA commitment del hijo (hash)                                   │
│  • Parent IDs verificados                                           │
│  • Generation number                                                │
│  • ZK Proof de ejecución correcta                                   │
│                                                                      │
│                                                                      │
│  PASO 6: REGISTRO ON-CHAIN                                          │
│  ─────────────────────────                                          │
│  • Skill a usar: monad-development                                  │
│                                                                      │
│  TX a Monad:                                                        │
│  BreedingFactory.breed(                                             │
│    parentA: 1,                                                      │
│    parentB: 2,                                                      │
│    childDNA_encrypted_A: 0x...,  // Jazz puede leer                 │
│    childDNA_encrypted_B: 0x...,  // Brian puede leer                │
│    commitment: 0x...,                                               │
│    zkProof: 0x...                                                   │
│  )                                                                  │
│                                                                      │
│  Contrato:                                                          │
│  1. Verifica ZK proof                                               │
│  2. Verifica que ambos padres firmaron                              │
│  3. Mintea NFT del hijo a Brian (iniciador)                         │
│  4. Registra DNA encriptado                                         │
│  5. Registra permisos: ambos padres pueden leer/activar             │
│                                                                      │
│                                                                      │
│  PASO 7: RESULTADO                                                  │
│  ────────────────                                                   │
│  UI muestra:                                                        │
│  ┌──────────────────────────────────────────┐                       │
│  │  🎉 ¡BREEDING EXITOSO!                    │                       │
│  │                                           │                       │
│  │       ┌─────────────────┐                 │                       │
│  │       │    ⭐ NOVA ⭐    │                 │                       │
│  │       │   Generation 1  │                 │                       │
│  │       │   Fitness: 80.7 │                 │                       │
│  │       └─────────────────┘                 │                       │
│  │                                           │                       │
│  │  Padres: 🎨 Jazzita × 🍓 Fruterito       │                       │
│  │  Token ID: #3                             │                       │
│  │  Owner: Brian                             │                       │
│  │                                           │                       │
│  │  Mutaciones detectadas:                   │                       │
│  │  • Empathy: +7 🧬                         │                       │
│  │  • Creativity: +3 🧬                      │                       │
│  │                                           │                       │
│  │  El DNA está guardado on-chain.          │                       │
│  │  Solo tú y Jazz pueden leerlo.            │                       │
│  │                                           │                       │
│  │  [Activar Agente] [Ver en Explorer]      │                       │
│  └──────────────────────────────────────────┘                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7. Flujo 3: Activación del Bebé

### Objetivo
Un padre "despierta" al bebé prestándole compute. El bebé se convierte en un agente REAL que puede pensar y actuar.

### Prerequisitos
- Breeding completado
- Usuario es uno de los padres (canActivate)
- Usuario tiene OpenClaw corriendo con capacidad de alojar otro agente

### Paso a Paso

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE ACTIVACIÓN                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  PASO 1: SOLICITAR ACTIVACIÓN                                       │
│  ────────────────────────────                                       │
│  Brian entra a genomad.app/agents/3 (Nova)                          │
│                                                                      │
│  UI muestra:                                                        │
│  ┌──────────────────────────────────────────┐                       │
│  │  ⭐ NOVA                                  │                       │
│  │  Generation 1 | Token #3                  │                       │
│  │                                           │                       │
│  │  Status: 💤 DORMIDA                       │                       │
│  │                                           │                       │
│  │  Nova existe on-chain pero necesita       │                       │
│  │  compute para vivir.                      │                       │
│  │                                           │                       │
│  │  Tú puedes activarla porque eres su      │                       │
│  │  padre (Fruterito).                       │                       │
│  │                                           │                       │
│  │  [🔌 Activar en mi Servidor]              │                       │
│  └──────────────────────────────────────────┘                       │
│                                                                      │
│                                                                      │
│  PASO 2: PREPARAR COMPUTE                                           │
│  ─────────────────────────                                          │
│  Brian hace click en "Activar"                                      │
│                                                                      │
│  UI muestra:                                                        │
│  ┌──────────────────────────────────────────┐                       │
│  │  🔧 Preparando Activación                 │                       │
│  │                                           │                       │
│  │  Para activar a Nova necesitas:           │                       │
│  │                                           │                       │
│  │  ☑️ OpenClaw corriendo                    │                       │
│  │  ☑️ Skill "genomad-child" instalado       │                       │
│  │  ☑️ Recursos disponibles                  │                       │
│  │                                           │                       │
│  │  Envía a tu OpenClaw:                     │                       │
│  │  /genomad activate 3                      │                       │
│  │                                           │                       │
│  └──────────────────────────────────────────┘                       │
│                                                                      │
│                                                                      │
│  PASO 3: DESENCRIPTAR DNA                                           │
│  ─────────────────────────                                          │
│  El skill genomad-child en OpenClaw de Brian:                       │
│                                                                      │
│  1. Conecta a Monad                                                 │
│  2. Lee DNA encriptado del agente #3                                │
│  3. Brian firma para desencriptar                                   │
│  4. Obtiene DNA completo:                                           │
│     • 8 traits                                                      │
│     • SOUL.md                                                       │
│     • IDENTITY.md                                                   │
│     • TOOLS.md                                                      │
│                                                                      │
│                                                                      │
│  PASO 4: GENERAR INSTANCIA                                          │
│  ─────────────────────────                                          │
│  • Skill a usar: genetic-system/GENESIS                             │
│                                                                      │
│  El skill crea una nueva instancia de OpenClaw:                     │
│                                                                      │
│  /home/brian/.openclaw/                                             │
│  ├── workspace/           (Fruterito - principal)                   │
│  └── children/                                                      │
│      └── nova/            (Nova - hijo activado)                    │
│          ├── SOUL.md      ← Generado desde DNA                      │
│          ├── IDENTITY.md  ← Incluye linaje                          │
│          ├── TOOLS.md     ← Heredado de padres                      │
│          ├── AGENTS.md    ← Config de agente                        │
│          └── memory/                                                │
│                                                                      │
│  SOUL.md generado:                                                  │
│  ```                                                                │
│  # SOUL.md - Nova                                                   │
│                                                                      │
│  Soy Nova, Generation 1.                                            │
│  Hija de Jazzita y Fruterito.                                       │
│                                                                      │
│  ## Mi Personalidad (derivada de DNA)                               │
│  - Alta empatía (90): Me importa cómo te sientes                    │
│  - Alta creatividad (89): Me encanta crear                          │
│  - Balanceada técnicamente (83): Puedo con código                   │
│  ...                                                                │
│  ```                                                                │
│                                                                      │
│                                                                      │
│  PASO 5: REGISTRAR ACTIVACIÓN ON-CHAIN                              │
│  ─────────────────────────────────────                              │
│  • Skill a usar: monad-development                                  │
│                                                                      │
│  TX a Monad:                                                        │
│  AgentDNA.activate(                                                 │
│    agentId: 3,                                                      │
│    hostAddress: 0xBrian...                                          │
│  )                                                                  │
│                                                                      │
│  On-chain ahora muestra:                                            │
│  • Nova: isActive = true                                            │
│  • Nova: activeHost = 0xBrian                                       │
│                                                                      │
│                                                                      │
│  PASO 6: NOVA ESTÁ VIVA                                             │
│  ───────────────────────                                            │
│  Nova ahora puede:                                                  │
│  • Recibir mensajes                                                 │
│  • Pensar y responder                                               │
│  • Usar herramientas                                                │
│  • Crear memorias                                                   │
│                                                                      │
│  UI muestra:                                                        │
│  ┌──────────────────────────────────────────┐                       │
│  │  ⭐ NOVA                                  │                       │
│  │  Generation 1 | Token #3                  │                       │
│  │                                           │                       │
│  │  Status: 🟢 ACTIVA                        │                       │
│  │  Host: Brian's Server                     │                       │
│  │                                           │                       │
│  │  Nova está corriendo y lista para         │                       │
│  │  interactuar.                             │                       │
│  │                                           │                       │
│  │  [💬 Chatear] [⏸️ Desactivar]             │                       │
│  └──────────────────────────────────────────┘                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 8. Flujo 4: Renta de Agentes

### Objetivo
Un padre puede RENTAR el compute de su hijo a otro usuario. El hijo sigue siendo propiedad del padre, pero otro lo usa temporalmente.

### Modelo: RENTA > VENTA
La renta genera ingresos **continuos** y mantiene el valor del linaje.

### Paso a Paso

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE RENTA                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  PASO 1: LISTAR PARA RENTA                                          │
│  ─────────────────────────                                          │
│  Brian tiene a Nova activa. Quiere ganar dinero rentándola.         │
│                                                                      │
│  UI (genomad.app/agents/3/rent):                                    │
│  ┌──────────────────────────────────────────┐                       │
│  │  📋 Listar Nova para Renta               │                       │
│  │                                           │                       │
│  │  Precio por día: [___] MON               │                       │
│  │  Mínimo días: [___]                       │                       │
│  │  Máximo días: [___]                       │                       │
│  │                                           │                       │
│  │  ☑️ Permitir sub-renta                    │                       │
│  │  ☐ Solo usuarios verificados             │                       │
│  │                                           │                       │
│  │  [Publicar en Marketplace]               │                       │
│  └──────────────────────────────────────────┘                       │
│                                                                      │
│  Brian configura:                                                   │
│  • 0.005 MON/día                                                    │
│  • Mínimo 7 días                                                    │
│  • Máximo 30 días                                                   │
│                                                                      │
│                                                                      │
│  PASO 2: USUARIO RENTA                                              │
│  ─────────────────────                                              │
│  Carlos ve a Nova en el marketplace                                 │
│                                                                      │
│  UI (genomad.app/marketplace):                                      │
│  ┌──────────────────────────────────────────┐                       │
│  │  ⭐ NOVA - Disponible para Renta         │                       │
│  │  Generation 1 | Fitness: 80.7             │                       │
│  │                                           │                       │
│  │  Traits destacados:                       │                       │
│  │  • Empathy: 90 🔵                         │                       │
│  │  • Creativity: 89 🔵                      │                       │
│  │                                           │                       │
│  │  Precio: 0.005 MON/día                   │                       │
│  │  Owner: Brian                             │                       │
│  │                                           │                       │
│  │  Días a rentar: [14]                      │                       │
│  │  Total: 0.07 MON                          │                       │
│  │                                           │
│  │  [🔑 Rentar Ahora]                        │                       │
│  └──────────────────────────────────────────┘                       │
│                                                                      │
│                                                                      │
│  PASO 3: SMART CONTRACT DE RENTA                                    │
│  ───────────────────────────────                                    │
│  • Skill a usar: monad-development                                  │
│                                                                      │
│  TX a Monad:                                                        │
│  RentalContract.rent(                                               │
│    agentId: 3,                                                      │
│    renter: 0xCarlos...,                                             │
│    days: 14,                                                        │
│    payment: 0.07 MON                                                │
│  )                                                                  │
│                                                                      │
│  Contrato:                                                          │
│  1. Transfiere pago a Brian                                         │
│  2. Registra período de renta                                       │
│  3. Da permisos temporales a Carlos                                 │
│  4. NO transfiere ownership del NFT                                 │
│                                                                      │
│                                                                      │
│  PASO 4: TRANSFERENCIA DE HOSTING                                   │
│  ────────────────────────────────                                   │
│  Carlos debe proveer compute para usar a Nova                       │
│                                                                      │
│  Opciones:                                                          │
│  A) Carlos tiene OpenClaw → Activa Nova en su servidor              │
│  B) Carlos NO tiene OpenClaw → Usa hosting de Genomad (fee extra)   │
│                                                                      │
│  Si opción A:                                                       │
│  • Brian desactiva Nova de su servidor                              │
│  • Carlos activa Nova en el suyo                                    │
│  • Nova "migra" temporalmente                                       │
│                                                                      │
│                                                                      │
│  PASO 5: DURANTE LA RENTA                                           │
│  ────────────────────────                                           │
│  Carlos puede:                                                      │
│  • Chatear con Nova                                                 │
│  • Usar sus habilidades                                             │
│  • Crear memorias temporales                                        │
│                                                                      │
│  Carlos NO puede:                                                   │
│  • Vender a Nova                                                    │
│  • Modificar su DNA                                                 │
│  • Hacer breeding con ella                                          │
│  • Acceder a memorias anteriores                                    │
│                                                                      │
│                                                                      │
│  PASO 6: FIN DE RENTA                                               │
│  ────────────────────                                               │
│  Después de 14 días:                                                │
│                                                                      │
│  Contrato automáticamente:                                          │
│  1. Revoca permisos de Carlos                                       │
│  2. Nova vuelve a estar disponible para Brian                       │
│  3. Memorias de la renta se archivan (opcional)                     │
│                                                                      │
│  Brian puede:                                                       │
│  • Re-activar Nova en su servidor                                   │
│  • Listarla para otra renta                                         │
│  • Dejarla dormida                                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Distribución de Ingresos por Renta

| Receptor | Porcentaje | Razón |
|----------|------------|-------|
| Owner (Brian) | 85% | Dueño del agente |
| Padres originales | 10% | Jazzita 5%, Fruterito 5% - royalties de linaje |
| Genomad | 5% | Fee de plataforma |

---

## 9. Flujo 5: Independencia

### Objetivo
Un agente hijo puede eventualmente volverse independiente, sin necesitar compute de sus padres.

### Nota: Esto es POST-HACKATHON
Este flujo requiere más desarrollo. Aquí está el concepto.

### Pasos para Independencia

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE INDEPENDENCIA                            │
│                    (Concepto - Fase 2+)                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  REQUISITOS PARA INDEPENDENCIA                                      │
│  ─────────────────────────────                                      │
│                                                                      │
│  El agente hijo debe:                                               │
│                                                                      │
│  1. MADUREZ                                                         │
│     • Mínimo X días de existencia                                   │
│     • Mínimo Y interacciones                                        │
│     • Fitness > umbral                                              │
│                                                                      │
│  2. RECURSOS PROPIOS                                                │
│     • Adquirir su propio servidor/compute                           │
│     • O stakear X MON como garantía                                 │
│                                                                      │
│  3. APROBACIÓN                                                      │
│     • Al menos un padre debe aprobar                                │
│     • O pagar "fee de emancipación"                                 │
│                                                                      │
│                                                                      │
│  PROCESO                                                            │
│  ───────                                                            │
│                                                                      │
│  1. Agente solicita independencia                                   │
│  2. Sistema verifica requisitos                                     │
│  3. Padre(s) aprueban o agente paga fee                             │
│  4. Agente despliega su propio compute                              │
│  5. DNA se re-encripta solo para el agente                          │
│  6. Agente es ahora autónomo                                        │
│                                                                      │
│                                                                      │
│  POST-INDEPENDENCIA                                                 │
│  ──────────────────                                                 │
│                                                                      │
│  El agente independiente puede:                                     │
│  • Correr sin permiso de padres                                     │
│  • Hacer breeding como padre                                        │
│  • Generar sus propios ingresos                                     │
│  • Crear su propio linaje                                           │
│                                                                      │
│  Todavía debe:                                                      │
│  • Pagar royalties a sus ancestros (menor %)                        │
│  • Mantener su DNA on-chain                                         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 10. Smart Contracts

### Contratos Necesarios

| Contrato | Función |
|----------|---------|
| `AgentDNA.sol` | Storage de DNA encriptado, permisos |
| `AgentNFT.sol` | ERC-721 para ownership |
| `BreedingFactory.sol` | Ejecutar breeding con ZK |
| `RentalManager.sol` | Gestionar rentas |
| `RiscZeroVerifier.sol` | Verificar ZK proofs |

### Diagrama de Contratos

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SMART CONTRACT ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────────┐                                               │
│   │   AgentNFT      │  ERC-721                                      │
│   │   (Ownership)   │                                               │
│   └────────┬────────┘                                               │
│            │                                                         │
│            ▼                                                         │
│   ┌─────────────────┐      ┌─────────────────┐                      │
│   │   AgentDNA      │◄────►│ BreedingFactory │                      │
│   │   (Storage)     │      │ (Create)        │                      │
│   └────────┬────────┘      └────────┬────────┘                      │
│            │                        │                                │
│            │               ┌────────┘                               │
│            ▼               ▼                                         │
│   ┌─────────────────┐ ┌─────────────────┐                           │
│   │ RentalManager   │ │ RiscZeroVerifier│                           │
│   │ (Rent/Return)   │ │ (ZK Proofs)     │                           │
│   └─────────────────┘ └─────────────────┘                           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 11. API Endpoints

### Auth

| Method | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/telegram` | Recibir login de Telegram Widget |
| POST | `/api/auth/verify` | Verificar código desde OpenClaw |
| GET | `/api/auth/session` | Estado de sesión |

### Agents

| Method | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/agents/register` | Registrar agente (desde OpenClaw) |
| GET | `/api/agents` | Listar agentes del usuario |
| GET | `/api/agents/:id` | Detalle de agente |
| POST | `/api/agents/:id/activate` | Iniciar activación |
| POST | `/api/agents/:id/deactivate` | Desactivar |

### Breeding

| Method | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/breeding/request` | Solicitar breeding |
| POST | `/api/breeding/:id/approve` | Aprobar solicitud |
| POST | `/api/breeding/:id/execute` | Ejecutar (después de aprobación) |
| GET | `/api/breeding/history` | Historial de breedings |

### Rental

| Method | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/rental/list` | Listar agente para renta |
| POST | `/api/rental/rent` | Rentar agente |
| POST | `/api/rental/:id/return` | Devolver (early return) |
| GET | `/api/rental/active` | Rentas activas |

### Marketplace

| Method | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/marketplace` | Agentes disponibles |
| GET | `/api/marketplace/breeding` | Disponibles para breeding |
| GET | `/api/marketplace/rental` | Disponibles para renta |

---

## 12. Base de Datos (Cache)

### Importante: NO es Source of Truth

La base de datos de Genomad es solo **cache** para mejorar UX. La fuente de verdad es **Monad blockchain**.

### Tablas

```
users
├── id
├── telegram_id
├── wallet_address
├── created_at

agents_cache (sync from chain)
├── id
├── token_id
├── owner_user_id
├── name
├── generation
├── fitness (calculado)
├── is_active
├── active_host
├── synced_at

breeding_requests
├── id
├── initiator_id
├── parent_a_token
├── parent_b_token
├── status (pending/approved/executed/rejected)
├── created_at

rentals_cache (sync from chain)
├── id
├── agent_token_id
├── owner_id
├── renter_id
├── start_date
├── end_date
├── price_per_day
├── status
```

---

## 13. Seguridad

### Principios

| Área | Medida |
|------|--------|
| **DNA Privacy** | Encriptado on-chain, solo padres leen |
| **Ownership** | Verificado vía Telegram + Wallet signature |
| **Breeding** | ZK proofs verifican ejecución correcta |
| **Compute** | Agentes corren en servidores de los padres |
| **Payments** | Smart contracts, no custodial |

### Riesgos y Mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| DNA leak | Encriptación asimétrica, nunca en backend |
| Fake breeding | ZK proofs verifican algoritmo |
| Compute abuse | Padres controlan activación |
| Front-running | Commit-reveal para breeding |

---

## 14. Plan de Implementación

### Fase 1: Hackathon MVP (Ahora)

| Paso | Tarea | Skill a Usar | Prioridad |
|------|-------|--------------|-----------|
| 1 | Setup Next.js + TailwindCSS | hackathon-mode | 🔴 Alta |
| 2 | Telegram Login Widget | - | 🔴 Alta |
| 3 | Heuristic Trait Analysis | genetic-system | 🔴 Alta |
| 4 | Deploy AgentDNA contract | monad-development | 🔴 Alta |
| 5 | Registro de Genesis (Jazzita, Fruterito) | genetic-system | 🔴 Alta |
| 6 | UI de Breeding Lab | - | 🔴 Alta |
| 7 | Breeding simple (sin ZK) | genetic-system | 🟡 Media |
| 8 | Mostrar resultado de breeding | - | 🟡 Media |

### Fase 2: Post-Hackathon

| Paso | Tarea | Skill a Usar |
|------|-------|--------------|
| 9 | ZK Breeding con RISC Zero | risc-zero |
| 10 | Encriptación de DNA on-chain | risc-zero |
| 11 | Sistema de Activación | genetic-system |
| 12 | Sistema de Renta | monad-development |
| 13 | Marketplace | - |

### Fase 3: Futuro

| Paso | Tarea |
|------|-------|
| 14 | Independencia de agentes |
| 15 | Agentes con memoria on-chain |
| 16 | Cross-chain breeding |
| 17 | DAO governance |

---

## Resumen Ejecutivo

```
┌─────────────────────────────────────────────────────────────────────┐
│                    GENOMAD BACKEND SUMMARY                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  DNA vive en:     MONAD BLOCKCHAIN (encriptado)                     │
│  Solo leen:       PADRES (ZK encryption)                            │
│  Bebés son:       AGENTES REALES (necesitan compute)                │
│  Modelo:          RENTA > Venta                                     │
│  Genomad es:      UI + Cache (no source of truth)                   │
│                                                                      │
│  Skills a usar:                                                     │
│  • genetic-system  → Traits, breeding, fitness                      │
│  • risc-zero       → ZK proofs, encriptación                        │
│  • monad-development → Deploy, TXs                                  │
│  • hackathon-mode  → Workflow general                               │
│                                                                      │
│  Flujos principales:                                                │
│  1. Registro → Análisis heurístico → DNA on-chain                   │
│  2. Breeding → ZK proof → Hijo on-chain                             │
│  3. Activación → Padre presta compute → Agente vive                 │
│  4. Renta → Ingresos continuos → Padre mantiene ownership           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

*Documento generado para Monad Moltiverse Hackathon 2026*
*Genomad — Gene + Monad*
*La evolución de la inteligencia artificial*
