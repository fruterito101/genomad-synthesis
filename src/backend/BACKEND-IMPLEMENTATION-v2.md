# 🚀 BACKEND IMPLEMENTATION PLAN v2

> Plan actualizado con Privy, fixes de skills, y optimizaciones.
> Evaluado con: hackathon-mode, monad-development, nad-fun
> Última actualización: 2026-02-15 02:30 UTC

---

## 📋 Índice de Fases (Actualizado)

| Fase | Nombre | Tickets | Cambios |
|------|--------|---------|---------|
| **0** | Setup & Dependencies | 10 | +2 (Privy, Foundry) |
| **1** | Types & Interfaces | 6 | Sin cambios |
| **2** | Genetic Engine Core | 10 | Fix hash.ts |
| **3** | Heuristics Engine | 8 | Sin cambios |
| **4** | Crypto & Hashing | 6 | Sin cambios |
| **5** | Database Layer | 6 | -1 (Privy maneja wallets) |
| **6** | Authentication (PRIVY) | 8 | ⚡ REESCRITO |
| **7** | API Endpoints | 12 | Sin cambios |
| **8** | Blockchain Integration | 12 | +2 (Faucet, Verify) |
| **9** | ZK Integration | 8 | Sin cambios |
| **10** | Token Integration | 8 | +2 (ABIs, 4-step) |
| **11** | Testing & QA | 8 | Sin cambios |
| **12** | Build & Deploy | 6 | Sin cambios |

**Total: 108 tickets** (+5 desde v1)

---

# FASE 0: Setup & Dependencies (ACTUALIZADO)

## Tickets

### 0.1: Verificar Entorno
```bash
node --version  # 20+
bun --version   # 1.0+
git --version
cd ~/projects/genomad && pwd
```

### 0.2: Limpiar e Inicializar
```bash
rm -rf node_modules .next bun.lockb package-lock.json
```

### 0.3: Instalar Core
```bash
bun install  # Next.js, React, TypeScript ya en package.json
```

### 0.4: Instalar TailwindCSS 4
```bash
bun add tailwindcss @tailwindcss/postcss postcss
```

### 0.5: Instalar Blockchain
```bash
bun add viem wagmi @tanstack/react-query
```

### 0.5b: Crear tsconfig.json ⚡ NUEVO
```bash
cat > tsconfig.json << TSCONFIG
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
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*", "app/**/*", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
TSCONFIG
```

### 0.6: Instalar Crypto
```bash
bun add @noble/hashes @noble/curves
# NO usar crypto-js (deprecated)
```

### 0.7: Instalar Database
```bash
bun add drizzle-orm better-sqlite3
bun add -d drizzle-kit @types/better-sqlite3
```

### 0.8: Instalar Privy ⚡ NUEVO
```bash
bun add @privy-io/react-auth @privy-io/server-auth
```

### 0.9: Crear foundry.toml ⚡ NUEVO
```bash
mkdir -p contracts
cat > contracts/foundry.toml << FOUNDRY
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.28"
evm_version = "prague"
optimizer = true
optimizer_runs = 200
via_ir = false

[rpc_endpoints]
monad_testnet = "https://testnet-rpc.monad.xyz"
monad_mainnet = "https://rpc.monad.xyz"

[etherscan]
monad_testnet = { key = "", url = "https://sourcify-api-monad.blockvision.org/" }
FOUNDRY
```

### 0.10: Verificación Final
```bash
bun run build
npx tsc --noEmit
```

---

## ✅ Checkpoint Fase 0

```
[ ] Node 20+ 
[ ] Bun 1.0+
[ ] Dependencies instaladas
[ ] tsconfig.json con paths
[ ] foundry.toml con evmVersion: prague
[ ] Privy instalado
[ ] bun run build exitoso

Commit: git add -A && git commit -m "phase-0: Setup with Privy + Monad config"
```

---

# FASE 1: Types & Interfaces

Sin cambios. Ver documento original.

---

# FASE 2: Genetic Engine Core (FIX APLICADO)

## Ticket 2.5: hash.ts (CORREGIDO)

**ANTES (❌ NO FUNCIONA EN BROWSER):**
```typescript
import { createHash } from crypto;
```

**DESPUÉS (✅ FUNCIONA EN TODOS LADOS):**
```typescript
// src/lib/genetic/hash.ts
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";
import { AgentDNA, TRAIT_NAMES } from "@/types";

export function calculateDNAHash(dna: Omit<AgentDNA, "hash">): string {
  const data = {
    traits: Object.fromEntries(
      TRAIT_NAMES.map((t) => [t, dna.traits[t]])
    ),
    generation: dna.generation,
    lineage: [...dna.lineage].sort(),
  };

  const json = JSON.stringify(data);
  const encoder = new TextEncoder();
  return bytesToHex(sha256(encoder.encode(json)));
}

export function verifyDNAHash(dna: AgentDNA): boolean {
  const { hash, ...rest } = dna;
  return hash === calculateDNAHash(rest);
}

export function shortHash(hash: string, length = 8): string {
  return hash.slice(0, length);
}

export function calculateCommitment(dna: AgentDNA): string {
  const traitsBytes = new Uint8Array(TRAIT_NAMES.map((t) => dna.traits[t]));
  const genByte = new Uint8Array([dna.generation]);
  return bytesToHex(sha256(new Uint8Array([...traitsBytes, ...genByte])));
}
```

---

# FASE 5: Database Layer (SIMPLIFICADO)

## Tickets

### 5.1: Setup Drizzle
```typescript
// src/db/index.ts
import { drizzle } from drizzle-orm/better-sqlite3;
import Database from better-sqlite3;

const sqlite = new Database(genomad.db);
export const db = drizzle(sqlite);
```

### 5.2: Schema - Users
```typescript
// src/db/schema/users.ts
import { sqliteTable, text, integer } from drizzle-orm/sqlite-core;

export const users = sqliteTable(users, {
  id: text(id).primaryKey(),
  
  // Privy identifiers
  privyId: text(privy_id).unique(),
  
  // Telegram (from Privy)
  telegramId: integer(telegram_id).unique(),
  telegramUsername: text(telegram_username),
  
  // Wallet (from Privy)
  walletAddress: text(wallet_address),
  
  // Metadata
  createdAt: integer(created_at, { mode: timestamp }),
  lastLoginAt: integer(last_login_at, { mode: timestamp }),
});
```

### 5.3: Schema - Agents
```typescript
// src/db/schema/agents.ts
export const agents = sqliteTable(agents, {
  id: text(id).primaryKey(),
  tokenId: integer(token_id),
  ownerUserId: text(owner_user_id).references(() => users.id),
  
  // Agent info
  name: text(name).notNull(),
  generation: integer(generation).default(0),
  fitness: integer(fitness),
  
  // DNA hash (commitment on-chain)
  dnaHash: text(dna_hash),
  
  // Status
  isActive: integer(is_active, { mode: boolean }).default(false),
  activeHost: text(active_host),
  
  // Timestamps
  createdAt: integer(created_at, { mode: timestamp }),
  syncedAt: integer(synced_at, { mode: timestamp }),
});
```

### 5.4: Schema - Breeding Requests
```typescript
// src/db/schema/breeding.ts
export const breedingRequests = sqliteTable(breeding_requests, {
  id: text(id).primaryKey(),
  initiatorId: text(initiator_id).references(() => users.id),
  
  parentATokenId: integer(parent_a_token_id),
  parentBTokenId: integer(parent_b_token_id),
  
  status: text(status).default(pending), // pending|approved|rejected|executed
  feeAmount: text(fee_amount),
  
  childTokenId: integer(child_token_id),
  
  createdAt: integer(created_at, { mode: timestamp }),
  expiresAt: integer(expires_at, { mode: timestamp }),
});
```

### 5.5: Migrations
```bash
npx drizzle-kit generate:sqlite
npx drizzle-kit push:sqlite
```

### 5.6: Verificación
```bash
bun run build
```

**NOTA:** Wallet persistence NO necesaria - Privy maneja esto.

---

# FASE 6: Authentication con PRIVY ⚡ REESCRITO

## Objetivo
Autenticación unificada: Telegram → Wallet → Identity vinculada

## Tickets

### 6.1: Configurar Privy Provider

```typescript
// app/providers.tsx
use client;

import { PrivyProvider } from @privy-io/react-auth;
import { monadTestnet } from viem/chains;

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: [telegram, wallet],
        appearance: {
          theme: dark,
          accentColor: #10B981, // Genomad green
          logo: /logo.png,
        },
        embeddedWallets: {
          createOnLogin: users-without-wallets,
        },
        defaultChain: monadTestnet,
        supportedChains: [monadTestnet],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
```

### 6.2: Layout con Providers

```typescript
// app/layout.tsx
import { Providers } from ./providers;

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 6.3: Hook de Autenticación

```typescript
// src/hooks/useAuth.ts
import { usePrivy, useWallets } from @privy-io/react-auth;

export function useAuth() {
  const { 
    login, 
    logout, 
    authenticated, 
    user, 
    ready 
  } = usePrivy();
  
  const { wallets } = useWallets();

  // Extraer datos de Telegram
  const telegram = user?.telegram;
  const telegramId = telegram?.telegramUserId;
  const telegramUsername = telegram?.username;

  // Extraer wallet
  const wallet = wallets[0];
  const walletAddress = wallet?.address;

  // Estado de completitud
  const hasTelegram = !!telegramId;
  const hasWallet = !!walletAddress;
  const isComplete = hasTelegram && hasWallet;

  return {
    // Auth methods
    login,
    logout,
    
    // State
    authenticated,
    ready,
    isComplete,
    
    // Telegram
    telegramId,
    telegramUsername,
    hasTelegram,
    
    // Wallet
    wallet,
    walletAddress,
    hasWallet,
    
    // Raw user
    user,
  };
}
```

### 6.4: Componente de Login

```typescript
// src/components/LoginButton.tsx
use client;

import { useAuth } from @/hooks/useAuth;

export function LoginButton() {
  const { login, authenticated, isComplete, telegramUsername, walletAddress } = useAuth();

  if (!authenticated) {
    return (
      <button onClick={login} className="btn-primary">
        🔐 Login con Telegram
      </button>
    );
  }

  if (!isComplete) {
    return (
      <div className="flex flex-col gap-2">
        <p>✅ Telegram: @{telegramUsername}</p>
        <button onClick={login} className="btn-secondary">
          🔗 Conectar Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <p>✅ @{telegramUsername}</p>
      <p>✅ {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}</p>
    </div>
  );
}
```

### 6.5: Server-side Verification

```typescript
// src/lib/auth/verify.ts
import { PrivyClient } from @privy-io/server-auth;

const privy = new PrivyClient(
  process.env.PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

export async function verifyToken(authToken: string) {
  try {
    const claims = await privy.verifyAuthToken(authToken);
    return { 
      valid: true, 
      userId: claims.userId,
      claims 
    };
  } catch (error) {
    return { valid: false, userId: null, claims: null };
  }
}

export async function getUser(privyId: string) {
  return await privy.getUser(privyId);
}
```

### 6.6: API Middleware

```typescript
// src/middleware/auth.ts
import { NextRequest, NextResponse } from next/server;
import { verifyToken } from @/lib/auth/verify;

export async function authMiddleware(req: NextRequest) {
  const authHeader = req.headers.get(authorization);
  
  if (!authHeader?.startsWith(Bearer )) {
    return NextResponse.json({ error: Unauthorized }, { status: 401 });
  }

  const token = authHeader.split( )[1];
  const { valid, userId } = await verifyToken(token);

  if (!valid) {
    return NextResponse.json({ error: Invalid token }, { status: 401 });
  }

  // Attach userId to request
  return { userId };
}
```

### 6.7: Sync User to Database

```typescript
// src/lib/auth/sync.ts
import { db } from @/db;
import { users } from @/db/schema;
import { eq } from drizzle-orm;

export async function syncUserFromPrivy(privyUser: any) {
  const telegram = privyUser.telegram;
  const wallet = privyUser.wallet;

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.privyId, privyUser.id))
    .get();

  if (existingUser) {
    // Update
    await db
      .update(users)
      .set({
        telegramUsername: telegram?.username,
        walletAddress: wallet?.address,
        lastLoginAt: new Date(),
      })
      .where(eq(users.privyId, privyUser.id));
    
    return existingUser;
  }

  // Create new
  const newUser = {
    id: crypto.randomUUID(),
    privyId: privyUser.id,
    telegramId: telegram?.telegramUserId,
    telegramUsername: telegram?.username,
    walletAddress: wallet?.address,
    createdAt: new Date(),
    lastLoginAt: new Date(),
  };

  await db.insert(users).values(newUser);
  return newUser;
}
```

### 6.8: Verificación Final

```bash
bun run build
# Test login flow manually
```

---

## ✅ Checkpoint Fase 6

```
[ ] Privy Provider configurado
[ ] Login con Telegram funciona
[ ] Wallet connection funciona
[ ] Hook useAuth funciona
[ ] Server verification funciona
[ ] User sync to DB funciona

Commit: git add -A && git commit -m "phase-6: Privy authentication"
```

---

# FASE 8: Blockchain Integration (ACTUALIZADO)

## Tickets Nuevos

### 8.11: Faucet Integration ⚡ NUEVO

```typescript
// src/lib/blockchain/faucet.ts
const FAUCET_API = https://agents.devnads.com/v1/faucet;

export async function requestTestnetFunds(address: string) {
  const response = await fetch(FAUCET_API, {
    method: POST,
    headers: { Content-Type: application/json },
    body: JSON.stringify({
      chainId: 10143,
      address,
    }),
  });

  if (!response.ok) {
    throw new Error(Faucet request failed);
  }

  const data = await response.json();
  return {
    txHash: data.txHash,
    amount: data.amount,
  };
}
```

### 8.12: Contract Verification ⚡ NUEVO

```typescript
// src/lib/blockchain/verify.ts
const VERIFY_API = https://agents.devnads.com/v1/verify;

export async function verifyContract({
  contractAddress,
  contractName,
  compilerVersion,
  standardJsonInput,
  constructorArgs,
}: {
  contractAddress: string;
  contractName: string;
  compilerVersion: string;
  standardJsonInput: object;
  constructorArgs?: string;
}) {
  const body: any = {
    chainId: 10143,
    contractAddress,
    contractName,
    compilerVersion: `v${compilerVersion}`,
    standardJsonInput,
  };

  if (constructorArgs) {
    body.constructorArgs = constructorArgs.replace(0x, );
  }

  const response = await fetch(VERIFY_API, {
    method: POST,
    headers: { Content-Type: application/json },
    body: JSON.stringify(body),
  });

  return response.json();
}
```

---

# FASE 10: Token Integration (ACTUALIZADO)

## Tickets Nuevos

### 10.7: nad.fun ABIs ⚡ NUEVO

```typescript
// src/lib/nadfun/abis.ts

export const curveAbi = [
  {
    name: feeConfig,
    type: function,
    stateMutability: view,
    inputs: [],
    outputs: [
      { name: deployFee, type: uint256 },
      { name: tradeFee, type: uint256 },
    ],
  },
] as const;

export const lensAbi = [
  {
    name: getInitialBuyAmountOut,
    type: function,
    stateMutability: view,
    inputs: [{ name: amountIn, type: uint256 }],
    outputs: [{ name: amountOut, type: uint256 }],
  },
  {
    name: getBuyAmountOut,
    type: function,
    stateMutability: view,
    inputs: [
      { name: token, type: address },
      { name: amountIn, type: uint256 },
    ],
    outputs: [{ name: amountOut, type: uint256 }],
  },
] as const;

export const bondingCurveRouterAbi = [
  {
    name: create,
    type: function,
    stateMutability: payable,
    inputs: [
      {
        name: params,
        type: tuple,
        components: [
          { name: name, type: string },
          { name: symbol, type: string },
          { name: tokenURI, type: string },
          { name: amountOut, type: uint256 },
          { name: salt, type: bytes32 },
          { name: actionId, type: uint8 },
        ],
      },
    ],
    outputs: [{ name: token, type: address }],
  },
] as const;
```

### 10.8: 4-Step Token Creation ⚡ NUEVO

```typescript
// src/lib/nadfun/create-token.ts
import { parseEther } from viem;
import { curveAbi, lensAbi, bondingCurveRouterAbi } from ./abis;

const CONFIG = {
  apiUrl: https://dev-api.nad.fun, // testnet
  BONDING_CURVE_ROUTER: 0x865054F0F6A288adaAc30261731361EA7E908003,
  LENS: 0xB056d79CA3B1b2dB86B9cFE48a5316800F5fb1,
  CURVE: 0x1228b0dc9481C11D3071E7A924B794CfB038994e,
};

export async function createGenoToken({
  publicClient,
  walletClient,
  account,
  imageBuffer,
  initialBuyMON = 0.1,
}: {
  publicClient: any;
  walletClient: any;
  account: any;
  imageBuffer: Buffer;
  initialBuyMON?: string;
}) {
  // Step 1: Upload Image
  const { image_uri } = await fetch(`${CONFIG.apiUrl}/agent/token/image`, {
    method: POST,
    headers: { Content-Type: image/png },
    body: imageBuffer,
  }).then(r => r.json());

  // Step 2: Upload Metadata
  const { metadata_uri } = await fetch(`${CONFIG.apiUrl}/agent/token/metadata`, {
    method: POST,
    headers: { Content-Type: application/json },
    body: JSON.stringify({
      image_uri,
      name: Genomad Token,
      symbol: GENO,
      description: Token del ecosistema Genomad - Breeding de AI Agents,
      website: https://genomad.app,
      twitter: https://x.com/genomad,
    }),
  }).then(r => r.json());

  // Step 3: Mine Salt
  const { salt, address: predictedAddress } = await fetch(`${CONFIG.apiUrl}/agent/salt`, {
    method: POST,
    headers: { Content-Type: application/json },
    body: JSON.stringify({
      creator: account.address,
      name: Genomad Token,
      symbol: GENO,
      metadata_uri,
    }),
  }).then(r => r.json());

  // Step 4: Create On-Chain
  const feeConfig = await publicClient.readContract({
    address: CONFIG.CURVE,
    abi: curveAbi,
    functionName: feeConfig,
  });
  const deployFee = feeConfig[0];

  const initialBuy = parseEther(initialBuyMON);
  let minTokens = 0n;
  
  if (initialBuy > 0n) {
    minTokens = await publicClient.readContract({
      address: CONFIG.LENS,
      abi: lensAbi,
      functionName: getInitialBuyAmountOut,
      args: [initialBuy],
    });
    // Apply 1% slippage
    minTokens = (minTokens * 99n) / 100n;
  }

  const hash = await walletClient.writeContract({
    address: CONFIG.BONDING_CURVE_ROUTER,
    abi: bondingCurveRouterAbi,
    functionName: create,
    args: [{
      name: Genomad Token,
      symbol: GENO,
      tokenURI: metadata_uri,
      amountOut: minTokens,
      salt: salt as `0x${string}`,
      actionId: 1,
    }],
    value: deployFee + initialBuy,
  });

  return {
    txHash: hash,
    predictedAddress,
    metadata_uri,
  };
}
```

---

# 📊 RESUMEN DE CAMBIOS

| Área | Antes | Después |
|------|-------|---------|
| Auth | Telegram Widget custom | Privy (unified) |
| Wallet | Manual persistence | Privy embedded |
| Hash | Node crypto | @noble/hashes |
| Monad config | Missing | foundry.toml |
| Token creation | Sin detalle | 4-step nad.fun |
| Faucet | No incluido | API integrado |
| Verification | No incluido | API integrado |

---

# ⏰ TIMELINE ESTIMADO

| Fase | Tiempo | Acumulado |
|------|--------|-----------|
| 0 | 1h | 1h |
| 1 | 1h | 2h |
| 2 | 2h | 4h |
| 3 | 2h | 6h |
| 4 | 1h | 7h |
| 5 | 1h | 8h |
| 6 | 2h | 10h |
| 7 | 3h | 13h |
| 8 | 2h | 15h |
| 9 | 3h | 18h |
| 10 | 2h | 20h |
| 11 | 1h | 21h |
| 12 | 1h | **22h** |

**⚠️ Justo en el deadline!**

---

*Documento generado para Monad Moltiverse Hackathon 2026*
*Evaluado con skills: hackathon-mode, monad-development, nad-fun*
*Genomad — Gene + Monad*
