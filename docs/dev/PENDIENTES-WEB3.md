# 🔗 PENDIENTES WEB3 - Genomad

> Última actualización: 2026-02-27
> Todo lo necesario para pasar de Web2.5 → Web3

---

## 📍 ESTADO ACTUAL

### Contratos Deployados (Monad Testnet)

| Contrato | Address | Status |
|----------|---------|--------|
| **GenomadNFT** | `0x9f20494A0FbC929adAC553f4A2FCFa7D2b448Cf0` | ✅ Deployed |
| **BreedingFactory** | `0x72D60f32185B67606a533dc28DeC3f88E05788De` | ✅ Deployed |
| **$GMD Token** | `0x03DD45bA22F57b715a2F30C3C945E57DA0AC7777` | ✅ Deployed |

**Network:** Monad Testnet (Chain ID: 10143)
**RPC:** `https://testnet-rpc.monad.xyz`

---

## ❌ PENDIENTES CRÍTICOS

### 1. Config de Chain Incorrecta

**Problema:** El código apunta a Sepolia pero los contratos están en Monad.

| Archivo | Actual | Debe ser |
|---------|--------|----------|
| `.env.local` | `CHAIN_ID=11155111` (Sepolia) | `CHAIN_ID=10143` (Monad) |
| `src/lib/wagmi/config.ts` | `sepoliaTestnet` | `monadTestnet` |
| `src/app/providers.tsx` | `defaultChain: sepoliaTestnet` | `defaultChain: monadTestnet` |

**Archivos a modificar:**
- [ ] `.env.local`
- [ ] `src/lib/blockchain/chains.ts`
- [ ] `src/lib/wagmi/config.ts`
- [ ] `src/app/providers.tsx`

---

### 2. Write Functions usan Server Key

**Problema:** Las funciones de escritura usan `DEPLOYER_PRIVATE_KEY` del servidor, no la wallet del usuario.

**Archivo:** `src/lib/blockchain/write.ts`

```typescript
// ACTUAL (mal)
const client = createDeployerClient(); // Usa key del servidor

// DEBE SER
const client = useWalletClient(); // Usa wallet del usuario
```

**Solución:** Crear hooks de wagmi para que el usuario firme:

- [ ] `useRegisterAgent()` - Registrar agente on-chain
- [ ] `useRequestBreeding()` - Iniciar breeding con fee
- [ ] `useApproveBreeding()` - Aprobar como parent B
- [ ] `useExecuteBreeding()` - Ejecutar y mintear hijo
- [ ] `useCancelBreeding()` - Cancelar request

---

### 3. No hay Sync DB ↔ Chain

**Problema:** Las acciones se guardan en DB pero no llaman contratos.

| Acción | DB | On-Chain |
|--------|-----|----------|
| Registrar agente | ✅ | ❌ |
| Request breeding | ✅ | ❌ |
| Approve breeding | ✅ | ❌ |
| Execute breeding | ✅ | ❌ |
| Transfer ownership | ✅ | ❌ |

**Solución:** Después de cada acción en DB, llamar el contrato correspondiente.

---

### 4. No hay Event Listeners

**Problema:** No escuchamos eventos del contrato para actualizar DB.

**Eventos a escuchar:**

```solidity
// GenomadNFT
event AgentRegistered(uint256 indexed tokenId, address indexed owner, bytes32 dnaCommitment, uint256 generation);
event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

// BreedingFactory
event BreedingRequested(uint256 indexed requestId, uint256 indexed parentA, uint256 indexed parentB, address initiator);
event BreedingApproved(uint256 indexed requestId);
event BreedingExecuted(uint256 indexed requestId, uint256 indexed childTokenId);
event BreedingCancelled(uint256 indexed requestId);
```

**Implementación necesaria:**
- [ ] Servicio que escuche eventos via WebSocket/polling
- [ ] Handlers que actualicen DB cuando llegan eventos
- [ ] Reconciliación si hay discrepancia DB vs Chain

---

## ⚠️ PARCIALMENTE IMPLEMENTADO

### 5. ABIs

**Estado:** ✅ ABIs definidos en `src/lib/blockchain/contracts.ts`

**Pendiente:**
- [ ] Verificar que ABIs coincidan con contratos deployados
- [ ] Agregar ABIs faltantes si hay funciones nuevas

---

### 6. Chain Definition

**Estado:** ⚠️ Existe `monadTestnet` en `src/lib/blockchain/chains.ts`

**Archivo actual:**
```typescript
export const monadTestnet = {
  id: 10143,
  name: "Monad Testnet",
  // ...
}
```

**Pendiente:**
- [ ] Verificar que esté completo (blockExplorers, etc.)
- [ ] Usarlo en wagmi config (actualmente usa sepoliaTestnet)

---

### 7. Read Functions

**Estado:** ⚠️ Existen en `src/lib/blockchain/read.ts`

**Funciones existentes:**
- `getAgentData(tokenId)`
- `getAgentOwner(tokenId)`
- `getTotalSupply()`
- `getBreedingFee()`
- `getBreedingRequest(requestId)`

**Pendiente:**
- [ ] Verificar que funcionen con Monad RPC
- [ ] Crear hooks de React para usarlas

---

## 🛠️ PLAN DE IMPLEMENTACIÓN

### Fase 1: Config Correcta (1-2 horas)
1. Cambiar `.env.local` a Monad
2. Actualizar `wagmi/config.ts`
3. Actualizar `providers.tsx`
4. Verificar conexión

### Fase 2: Hooks de Usuario (3-4 horas)
1. Crear `src/hooks/useGenomadNFT.ts`
2. Crear `src/hooks/useBreedingFactory.ts`
3. Conectar con UI existente

### Fase 3: Sync Bidireccional (4-6 horas)
1. Modificar APIs para llamar contratos
2. Crear event listeners
3. Handlers de reconciliación

### Fase 4: Testing (2-3 horas)
1. Test de conexión a Monad
2. Test de cada función de contrato
3. Test de flujo completo de breeding

---

## 📁 ARCHIVOS CLAVE

```
src/lib/blockchain/
├── chains.ts       ← Definición de Monad testnet
├── client.ts       ← Public + Wallet clients
├── contracts.ts    ← ABIs y addresses
├── read.ts         ← Funciones de lectura
├── write.ts        ← Funciones de escritura (NECESITA REFACTOR)
└── index.ts

src/lib/wagmi/
├── config.ts       ← CAMBIAR A MONAD
└── index.ts

src/hooks/
├── useGMDBalance.ts  ← Existe
├── useGenomadNFT.ts  ← CREAR
└── useBreeding.ts    ← CREAR
```

---

## 🔐 SEGURIDAD

| Item | Estado | Notas |
|------|--------|-------|
| Private keys en .env | ⚠️ | Solo DEPLOYER_KEY, no exponer |
| User firma sus TX | ❌ | Actualmente server firma todo |
| Validar ownership | ⚠️ | Solo en DB, no on-chain |
| Rate limiting | ✅ | Implementado (in-memory) |

---

## 📝 NOTAS

### Monad Específico
- RPC puede ser lento a veces
- Block time ~1s
- Gas muy bajo

### Consideraciones
- Privy maneja wallets embedded
- Algunos users no tendrán wallet propia
- Necesitan tMON para gas

---

## ✅ CHECKLIST FINAL

Antes de considerar Web3 completo:

- [ ] Config apunta a Monad testnet
- [ ] Usuario puede conectar wallet
- [ ] Usuario puede registrar agente (firma TX)
- [ ] Usuario puede request breeding (paga fee)
- [ ] Parent B puede aprobar (firma TX)
- [ ] Breeding se ejecuta on-chain
- [ ] DB se sincroniza con eventos del contrato
- [ ] Transfer de NFT funciona
- [ ] Balance de $GMD se muestra

