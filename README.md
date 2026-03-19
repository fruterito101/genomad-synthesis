# 🧬 GENOMAD

### El primer protocolo de breeding de agentes AI — on-chain

> Los humanos evolucionan. Ahora los agentes también.

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black)](https://genomad.vercel.app)
[![Chain](https://img.shields.io/badge/Chain-Monad%20Testnet-purple)](https://testnet.monadexplorer.com)
[![Tests](https://img.shields.io/badge/Tests-131%2B%20passing-green)]()
[![License](https://img.shields.io/badge/License-MIT-blue)]()

---

## 📑 Tabla de Contenidos

- [¿Qué es Genomad?](#-qué-es-genomad)
- [Smart Contracts](#-smart-contracts)
- [Quick Start](#-quick-start)
- [Arquitectura](#-arquitectura)
- [API Reference](#-api-reference)
- [Sistema Genético](#-sistema-genético)
- [ZK Proofs](#-zk-proofs)
- [Contributing](#-contributing)

---

## 🌟 ¿Qué es Genomad?

**Genomad** es una plataforma de breeding y evolución de agentes AI en Monad blockchain.

### Features

- 🧬 **DNA Único** — 8 traits genéticos definen la personalidad de cada agente
- ⛓️ **On-Chain** — Agentes como NFTs con datos verificables en Monad
- 🔐 **ZK Privacy** — Traits encriptados, proofs verifican sin revelar
- 🧪 **Breeding** — Cruza agentes para crear nuevas generaciones
- 📊 **Fitness** — Sistema de puntuación basado en traits
- 🏆 **Leaderboard** — Compite por los mejores genes

---

## 🔗 Smart Contracts

**Network:** Monad Testnet (Chain ID: 10143)

| Contrato | Address | Descripción |
|----------|---------|-------------|
| **GenomadNFT** | `0x190fd355ED38e82a2390C07222C4BcB4DbC4cD20` | NFT principal de agentes |
| **BreedingFactory** | `0x2703fb336139292c7ED854061072e316727ED7fA` | Lógica de breeding |
| **TraitVerifier** | `0xaccaE8B19AD67df4Ce91638855c9B41A5Da90be3` | Verificación ZK on-chain |

---

## 🚀 Quick Start

### Requisitos

- Node.js 20+
- Bun 1.0+ (o npm/pnpm)
- PostgreSQL (o Neon)

### Instalación

```bash
# Clonar repo
git clone https://github.com/fruterito101/genomad.git
cd genomad

# Instalar dependencias
bun install

# Configurar variables de entorno
cp .env.example .env.local

# Migrar base de datos
bun run db:push

# Iniciar desarrollo
bun run dev
```

### Variables de Entorno

```env
# Database
DATABASE_URL="postgresql://..."

# Auth (Privy)
NEXT_PUBLIC_PRIVY_APP_ID="..."
PRIVY_APP_SECRET="..."

# Blockchain
NEXT_PUBLIC_CHAIN_ID="10143"
PRIVATE_KEY="0x..."

# Redis (opcional)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Analytics (opcional)
NEXT_PUBLIC_CLARITY_PROJECT_ID="..."
```

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      GENOMAD STACK                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Frontend (Next.js 16)                                       │
│  ├── React 19 + TypeScript                                   │
│  ├── Tailwind CSS + shadcn/ui                               │
│  ├── Three.js (DNA visuals)                                 │
│  └── Framer Motion (animations)                             │
│                                                              │
│  Backend (Next.js API Routes)                               │
│  ├── Drizzle ORM + PostgreSQL                               │
│  ├── Privy Auth                                             │
│  ├── Vitest (131+ tests)                                    │
│  └── Rate Limiting (Redis/Memory)                           │
│                                                              │
│  Blockchain (Monad)                                         │
│  ├── Solidity Contracts                                     │
│  ├── viem/wagmi                                             │
│  └── ZK Proofs (RISC Zero ready)                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Estructura de Carpetas

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── dashboard/         # Dashboard page
│   ├── breeding/          # Breeding page
│   └── profile/           # Profile page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── three/            # 3D components
│   ├── skeletons/        # Loading skeletons
│   └── landing/          # Landing page sections
├── lib/                   # Core libraries
│   ├── db/               # Database (Drizzle)
│   ├── genetic/          # Genetic system
│   ├── zk/               # ZK proofs
│   ├── blockchain/       # Contracts + chains
│   ├── notifications/    # Notification system
│   └── crypto/           # Encryption
├── hooks/                 # React hooks
└── e2e/                   # Playwright tests
```

---

## 📡 API Reference

### Agents

| Endpoint | Method | Descripción |
|----------|--------|-------------|
| `/api/agents` | GET | Lista agentes |
| `/api/agents` | POST | Registrar agente |
| `/api/agents/[id]` | GET | Obtener agente |
| `/api/agents/[id]/activate` | POST | Activar on-chain |

### Breeding

| Endpoint | Method | Descripción |
|----------|--------|-------------|
| `/api/breeding/request` | POST | Solicitar breeding |
| `/api/breeding/[id]/approve` | POST | Aprobar solicitud |
| `/api/breeding/[id]/execute` | POST | Ejecutar breeding |

### ZK

| Endpoint | Method | Descripción |
|----------|--------|-------------|
| `/api/zk/prove` | GET | Documentación |
| `/api/zk/prove` | POST | Generar proof |

### Notifications

| Endpoint | Method | Descripción |
|----------|--------|-------------|
| `/api/notifications` | GET | Lista notificaciones |
| `/api/notifications/stream` | GET | SSE realtime |

---

## 🧬 Sistema Genético

### Los 8 Traits

| Trait | Emoji | Descripción |
|-------|-------|-------------|
| technical | 💻 | Habilidades técnicas |
| creativity | 🎨 | Pensamiento creativo |
| social | 🤝 | Interacción social |
| analysis | 📊 | Capacidad analítica |
| empathy | 💜 | Conexión emocional |
| trading | 📈 | Instinto financiero |
| teaching | 📚 | Capacidad de enseñar |
| leadership | 👑 | Liderazgo |

### Breeding

```
Parent A: [80, 65, 70, 55, 60, 45, 75, 50]
Parent B: [70, 75, 60, 65, 55, 50, 80, 45]
                    ↓
            Crossover + Mutation
                    ↓
Child:    [75, 70, 65, 60, 58, 48, 78, 48]
```

- **Crossover:** Cada trait viene de un padre (50% probabilidad)
- **Mutation:** ±10 puntos máximo por trait
- **Fitness:** Suma de todos los traits (max 800)

### Niveles de Rareza

| Nivel | Fitness | Color |
|-------|---------|-------|
| Common | < 320 | ⚪ |
| Uncommon | 320-479 | 🟢 |
| Rare | 480-599 | 🔵 |
| Epic | 600-719 | 🟣 |
| Legendary | 720+ | 🟡 |

---

## 🔐 ZK Proofs

Genomad usa Zero-Knowledge proofs para privacidad:

### ¿Qué se prueba?

- **Trait Proof:** "Tengo estos traits" sin revelar valores
- **Breed Proof:** "Este hijo es válido" sin revelar genética
- **Custody Proof:** "Tengo X% custody" sin revelar shareholders

### Modo Mock vs Producción

```env
# Mock (desarrollo/hackathon)
NEXT_PUBLIC_ZK_DEV_MODE=true

# Producción (RISC Zero real)
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

# E2E con UI
bun run test:e2e:ui

# Coverage
bun run test:coverage
```

---

## 🚢 Deploy

### Vercel (Recomendado)

1. Fork el repo
2. Importar en Vercel
3. Agregar variables de entorno
4. Deploy automático en cada push

### Variables requeridas en Vercel

- `DATABASE_URL`
- `NEXT_PUBLIC_PRIVY_APP_ID`
- `PRIVY_APP_SECRET`
- `UPSTASH_REDIS_REST_URL` (opcional)
- `UPSTASH_REDIS_REST_TOKEN` (opcional)
- `NEXT_PUBLIC_CLARITY_PROJECT_ID` (opcional)

---

## 🤝 Contributing

1. Fork el repositorio
2. Crea tu branch (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'feat: add amazing feature'`)
4. Push al branch (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

### Convenciones de Commits

- `feat:` Nueva feature
- `fix:` Bug fix
- `docs:` Documentación
- `style:` Formateo
- `refactor:` Refactor
- `test:` Tests
- `chore:` Mantenimiento

---

## 📄 License

MIT License — ver [LICENSE](LICENSE) para detalles.

---

## 🔗 Links

- **App:** [genomad.vercel.app](https://genomad.vercel.app)
- **Docs:** [docs/](./docs/)
- **Contracts:** [contracts/](./contracts/)

---

<p align="center">
  <strong>🧬 Genomad — Tu agente, on-chain</strong>
</p>
