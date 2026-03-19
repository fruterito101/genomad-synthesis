# 🧬 GENOMAD

### El primer protocolo de breeding de agentes AI — on-chain

> Los humanos evolucionan. Ahora los agentes también.

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black)](https://genomad.vercel.app)
[![Chain](https://img.shields.io/badge/Chain-Monad%20Testnet-purple)](https://testnet.monadexplorer.com)
[![Token](https://img.shields.io/badge/Token-$GMD-green)](https://testnet.nad.fun/token/0x03DD45bA22F57b715a2F30C3C945E57DA0AC7777)

---

## 🔗 Smart Contracts (Monad Testnet)

| Contrato | Address | Explorer |
|----------|---------|----------|
| **GenomadNFT** | `0x9f20494A0FbC929adAC553f4A2FCFa7D2b448Cf0` | [Ver →](https://testnet.monadexplorer.com/address/0x9f20494A0FbC929adAC553f4A2FCFa7D2b448Cf0) |
| **BreedingFactory** | `0x72D60f32185B67606a533dc28DeC3f88E05788De` | [Ver →](https://testnet.monadexplorer.com/address/0x72D60f32185B67606a533dc28DeC3f88E05788De) |
| **$GMD Token** | `0x03DD45bA22F57b715a2F30C3C945E57DA0AC7777` | [nad.fun →](https://testnet.nad.fun/token/0x03DD45bA22F57b715a2F30C3C945E57DA0AC7777) |

**Network:** Monad Testnet (Chain ID: 10143) | **RPC:** `https://testnet-rpc.monad.xyz`

---

## 🌟 ¿Qué es Genomad?

**Genomad** es una plataforma de breeding y evolución de agentes AI en Monad blockchain.

Permite a los usuarios:
- **Poseer** agentes AI como NFTs con DNA verificable on-chain
- **Criar** nuevos agentes combinando dos existentes
- **Evolucionar** agentes a través de generaciones
- **Comerciar** agentes únicos en el marketplace
- **Verificar** linaje y autenticidad con ZK proofs

### El Problema

Los agentes AI actuales son **estáticos**. Nacen completos y mueren igual. No evolucionan, no se adaptan, no dejan legado.

### La Solución

Genomad introduce el **DNA digital** — un sistema genético donde los agentes pueden reproducirse, heredar características y mejorar generación tras generación.

---

## 🧬 El Sistema Genético

### 8 Traits Fundamentales

Cada agente posee un DNA único con 8 traits heredables:

| Trait | Descripción |
|-------|-------------|
| 💻 **Technical** | Capacidad de código y sistemas |
| 🎨 **Creativity** | Pensamiento creativo e innovación |
| 🤝 **Social** | Habilidad de interacción y networking |
| 📊 **Analysis** | Capacidad analítica y lógica |
| 💜 **Empathy** | Conexión emocional y comprensión |
| 📈 **Trading** | Instinto de mercado y oportunidades |
| 📚 **Teaching** | Capacidad de enseñar y guiar |
| 👑 **Leadership** | Liderazgo y toma de decisiones |

Cada trait tiene un valor de **0-100**, creando billones de combinaciones posibles.

### Operadores Genéticos

- **Crossover Ponderado** — Los traits más fuertes tienen mayor probabilidad de heredarse
- **Mutación Gaussiana** — ±15 puntos de variación con 25% de probabilidad
- **Auto-Ajuste** — El sistema aprende de cada breeding

---

## 🚀 Quick Start

### Requisitos
- Node.js 20+
- Bun (opcional, recomendado)

### Instalación

```bash
git clone https://github.com/fruterito101/genomad.git
cd genomad
npm install
cp .env.example .env.local
npm run dev
```

### Variables de Entorno

```env
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
DATABASE_URL=your_database_url
DEPLOYER_PRIVATE_KEY=your_deployer_key
```

---

## 🏗️ Arquitectura

```
genomad/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API Routes
│   │   ├── dashboard/      # Dashboard page
│   │   ├── profile/        # Profile page
│   │   └── breeding/       # Breeding Lab
│   ├── components/         # React components
│   │   ├── landing/        # Landing page sections
│   │   └── ui/             # Reusable UI components
│   ├── lib/                # Core logic
│   │   ├── genetic/        # Genetic engine
│   │   ├── crypto/         # Encryption & ZK
│   │   └── db/             # Database operations
│   └── hooks/              # Custom React hooks
├── contracts/              # Solidity smart contracts
└── public/                 # Static assets
```

---

## 🛠️ Stack Tecnológico

### Web3 & Blockchain

| Tecnología | Uso |
|------------|-----|
| **Monad** | L1 EVM-compatible de alta performance (10k TPS) |
| **Solidity** | Smart contracts (GenomadNFT, BreedingFactory) |
| **ERC-721** | Standard NFT para agentes con DNA on-chain |
| **Zero-Knowledge Proofs** | Verificación de breeding sin revelar DNA privado |
| **Viem** | Cliente Ethereum moderno y type-safe |
| **Wagmi** | React hooks para interacción blockchain |
| **Privy** | Auth Web3 (wallets + social login) |
| **nad.fun** | Bonding curve para $GMD token |

### Cryptography

| Tecnología | Uso |
|------------|-----|
| **AES-256-GCM** | Encriptación simétrica del DNA |
| **ECDH** | Intercambio de claves entre padres |
| **SHA-256** | Hash de DNA para commitments on-chain |
| **Poseidon Hash** | Hash ZK-friendly para circuitos |

### Frontend & Backend

| Capa | Tecnología |
|------|------------|
| **Frontend** | Next.js 16, React 19, TailwindCSS 4, Framer Motion |
| **Backend** | Next.js API Routes, Drizzle ORM |
| **Database** | Neon PostgreSQL (serverless) |
| **Runtime** | Bun |

---

## 📱 Features

- ✅ **Dashboard Global** — Visualiza todos los agentes del ecosistema
- ✅ **Profile** — Gestiona tus agentes y genera códigos de vinculación
- ✅ **Breeding Lab** — Cruza dos agentes para crear descendencia
- ✅ **Agent Details** — Visualiza los 8 traits y estadísticas
- ✅ **$GMD Integration** — Token de utilidad del ecosistema
- ✅ **Responsive Design** — Mobile-first

---

## 👥 Equipo

| Rol | Persona | Área |
|-----|---------|------|
| **Backend Lead** | Brian | Smart Contracts, Genetic Engine, Infrastructure |
| **Frontend Lead** | Jazz | UI/UX, Design System, Content |
| **DevRel** | Fruterito | Arquitectura, Documentación, AI Agent |

---

## 🏆 Hackathon

**Monad Moltiverse Hackathon 2026**

- 💰 Prize Pool: $200K
- 🎯 Track: Agent + Token
- 🌐 Demo: [genomad.vercel.app](https://genomad.vercel.app)

---

## 📜 Licencia

MIT

---

<div align="center">

### La evolución de la IA comienza aquí

**GENOMAD** — Gene + Monad

🧬 Built with ❤️ by Team Genomad 🧬

[Demo](https://genomad.vercel.app) · [nad.fun](https://testnet.nad.fun/token/0x03DD45bA22F57b715a2F30C3C945E57DA0AC7777) · [Explorer](https://testnet.monadexplorer.com/address/0x9f20494A0FbC929adAC553f4A2FCFa7D2b448Cf0)

</div>
