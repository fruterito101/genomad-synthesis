# 🔗 FASE 2: Web3 Integration

> Prioridad: Alta
> Estimación total: 12-16 horas
> Conectar la plataforma con blockchain (Base)

---

## Objetivo de la Fase

Actualmente las acciones se guardan solo en DB. Esta fase conecta con los smart contracts para que todo quede registrado on-chain.

---

## Tickets

### Ticket 2.1: Fix Chain Configuration

**Branch:** `feat/phase-2-chain-config`
**Prioridad:** P0 (Crítico)
**Tiempo estimado:** 1-2 horas
**Dependencias:** Ninguna

#### Descripción
Corregir la configuración de chain: actualmente apunta a Sepolia pero los contratos están en Base.

#### Archivos a modificar
```
.env.local
src/lib/blockchain/chains.ts
src/lib/wagmi/config.ts
src/app/providers.tsx
```

#### Cambios específicos

**.env.local:**
```diff
- NEXT_PUBLIC_CHAIN_RPC=https://rpc.sepolia.org
- NEXT_PUBLIC_CHAIN_ID=11155111
- NEXT_PUBLIC_CHAIN_NAME=Sepolia
+ NEXT_PUBLIC_CHAIN_RPC=https://testnet-rpc.monad.xyz
+ NEXT_PUBLIC_CHAIN_ID=8453
+ NEXT_PUBLIC_CHAIN_NAME=Base
```

**src/lib/wagmi/config.ts:**
```diff
- import { sepoliaTestnet } from "@/lib/blockchain/chains";
+ import { monadTestnet } from "@/lib/blockchain/chains";

export const wagmiConfig = createConfig({
-  chains: [sepoliaTestnet],
+  chains: [monadTestnet],
  transports: {
-    [sepoliaTestnet.id]: http(...),
+    [monadTestnet.id]: http(...),
  },
});
```

**src/app/providers.tsx:**
```diff
- import { sepoliaTestnet } from "@/lib/blockchain/chains";
+ import { monadTestnet } from "@/lib/blockchain/chains";

<PrivyProvider config={{
-  defaultChain: sepoliaTestnet,
-  supportedChains: [sepoliaTestnet],
+  defaultChain: monadTestnet,
+  supportedChains: [monadTestnet],
}}>
```

#### Criterios de Aceptación
- [ ] .env.local apunta a Base
- [ ] wagmi config usa monadTestnet
- [ ] Privy config usa monadTestnet
- [ ] Conexión a RPC funciona
- [ ] Build pasa

---

### Ticket 2.2: User Wallet Hooks

**Branch:** `feat/phase-2-wallet-hooks`
**Prioridad:** P0 (Crítico)
**Tiempo estimado:** 3-4 horas
**Dependencias:** Ticket 2.1

#### Descripción
Crear hooks de React para que el usuario firme transacciones con su propia wallet (no server-side).

#### Archivos a crear
```
src/hooks/
├── useGenomadNFT.ts       ← CREAR
├── useBreedingFactory.ts  ← CREAR
└── useContractWrite.ts    ← CREAR (helper)
```

#### Funciones a implementar

**useGenomadNFT.ts:**
- `useRegisterAgent(dnaCommitment)` - Registrar agente
- `useActivateAgent(tokenId)` - Activar
- `useDeactivateAgent(tokenId)` - Desactivar
- `useTransferAgent(tokenId, to)` - Transferir

**useBreedingFactory.ts:**
- `useRequestBreeding(parentA, parentB)` - Request con fee
- `useApproveBreeding(requestId)` - Aprobar como parent B
- `useExecuteBreeding(requestId, dnaCommitment)` - Ejecutar
- `useCancelBreeding(requestId)` - Cancelar

#### Ejemplo de implementación

```typescript
// src/hooks/useGenomadNFT.ts
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS, GENOMAD_NFT_ABI } from "@/lib/blockchain/contracts";

export function useRegisterAgent() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  
  const register = async (dnaCommitment: `0x${string}`) => {
    writeContract({
      address: CONTRACTS.genomadNFT as `0x${string}`,
      abi: GENOMAD_NFT_ABI,
      functionName: "registerAgent",
      args: [dnaCommitment],
    });
  };
  
  return {
    register,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}
```

#### Criterios de Aceptación
- [ ] Hooks usan wallet del usuario
- [ ] Manejan estados: pending, confirming, success, error
- [ ] Retornan hash de transacción
- [ ] Integran con wagmi correctamente

---

### Ticket 2.3: Sync API Actions with Chain

**Branch:** `feat/phase-2-sync-chain`
**Prioridad:** P0 (Crítico)
**Tiempo estimado:** 4-5 horas
**Dependencias:** Ticket 2.2

#### Descripción
Modificar las APIs existentes para que después de guardar en DB, también llamen los contratos on-chain.

#### APIs a modificar
```
src/app/api/agents/register/route.ts
src/app/api/breeding/request/route.ts
src/app/api/breeding/[requestId]/approve/route.ts
src/app/api/breeding/[requestId]/execute/route.ts
```

#### Flujo actualizado

**Register Agent:**
```
1. Validar datos
2. Generar DNA commitment
3. Guardar en DB
4. [NUEVO] Usuario firma TX → registrar on-chain
5. Actualizar DB con tokenId
```

**Request Breeding:**
```
1. Validar padres y ownership
2. Guardar request en DB
3. [NUEVO] Usuario firma TX → request on-chain con fee
4. Actualizar DB con requestId on-chain
```

#### Criterios de Aceptación
- [ ] Register crea agente en DB Y on-chain
- [ ] Breeding request guarda Y llama contrato
- [ ] Approve guarda Y llama contrato
- [ ] Execute guarda Y llama contrato
- [ ] Rollback si falla on-chain

---

### Ticket 2.4: Event Listeners

**Branch:** `feat/phase-2-event-listeners`
**Prioridad:** P1 (Alto)
**Tiempo estimado:** 3-4 horas
**Dependencias:** Ticket 2.3

#### Descripción
Crear servicio que escucha eventos on-chain y actualiza la DB para mantener sincronía.

#### Archivos a crear
```
src/lib/blockchain/
├── events/
│   ├── index.ts
│   ├── listener.ts
│   └── handlers.ts
```

#### Eventos a escuchar

| Evento | Acción |
|--------|--------|
| AgentRegistered | Crear/actualizar agente en DB |
| Transfer | Actualizar owner en DB |
| BreedingRequested | Crear request en DB |
| BreedingApproved | Actualizar status |
| BreedingExecuted | Crear hijo, actualizar request |
| BreedingCancelled | Actualizar status |

#### Criterios de Aceptación
- [ ] Listener conecta a Base RPC
- [ ] Procesa eventos correctamente
- [ ] Actualiza DB según evento
- [ ] Maneja reconexiones
- [ ] Logs de eventos procesados

---

### Ticket 2.5: Read Hooks

**Branch:** `feat/phase-2-read-hooks`
**Prioridad:** P1 (Alto)
**Tiempo estimado:** 2 horas
**Dependencias:** Ticket 2.1

#### Descripción
Crear hooks para leer datos on-chain (verificar ownership, balances, etc.)

#### Hooks a crear
```
src/hooks/
├── useAgentData.ts      ← Datos de un agente
├── useAgentOwner.ts     ← Owner de un tokenId
├── useTotalSupply.ts    ← Total de agentes
├── useBreedingFee.ts    ← Fee actual
└── useBreedingRequest.ts ← Datos de un request
```

#### Criterios de Aceptación
- [ ] Hooks leen datos on-chain
- [ ] Caching con React Query
- [ ] Refetch automático

---

### Ticket 2.6: Tests Web3

**Branch:** `feat/phase-2-web3-tests`
**Prioridad:** P1 (Alto)
**Tiempo estimado:** 2-3 horas
**Dependencias:** Tickets 2.1-2.5

#### Archivos de test
```
src/hooks/__tests__/
├── useGenomadNFT.test.ts
└── useBreedingFactory.test.ts

src/lib/blockchain/__tests__/
└── events.test.ts
```

---

## Resumen

| Ticket | Nombre | Tiempo | Deps |
|--------|--------|--------|------|
| 2.1 | Chain Config | 1-2h | - |
| 2.2 | Wallet Hooks | 3-4h | 2.1 |
| 2.3 | Sync APIs | 4-5h | 2.2 |
| 2.4 | Event Listeners | 3-4h | 2.3 |
| 2.5 | Read Hooks | 2h | 2.1 |
| 2.6 | Tests | 2-3h | 2.1-2.5 |

**Total: 15-20 horas**

## Diagrama

```
2.1 Chain Config
    │
    ├──► 2.2 Wallet Hooks ──► 2.3 Sync APIs ──► 2.4 Events
    │
    └──► 2.5 Read Hooks
                                    │
                                    ▼
                               2.6 Tests
```
