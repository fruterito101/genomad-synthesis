# 🔗 FASE 4: Full On-Chain + ZK

> **Objetivo:** Transformar Genomad de un sistema híbrido (DB + blockchain) a un sistema 100% on-chain con privacidad ZK.
> 
> **Duración estimada:** 8 semanas
> **Prioridad:** ALTA — Define la arquitectura final de Genomad

---

## 📋 Resumen Ejecutivo

| Semana | Fase | Tickets | Horas Est. |
|--------|------|---------|------------|
| 1-2 | Contratos | 4.1-4.4 | 20-25h |
| 3-4 | Circuitos ZK | 4.5-4.8 | 25-30h |
| 5-6 | Frontend + Skill | 4.9-4.12 | 20-25h |
| 7-8 | OpenClaw Plugin | 4.13-4.15 | 15-20h |
| **Total** | | **15 tickets** | **80-100h** |

---

## 🏗️ ARQUITECTURA FINAL

```
┌─────────────────────────────────────────────────────────────┐
│                    MONAD BLOCKCHAIN                          │
├─────────────────────────────────────────────────────────────┤
│  GenomadNFT.sol                                              │
│  ├── traits[8] (públicos)                                   │
│  ├── dnaHash (público)                                      │
│  ├── encryptedSoul (privado, solo dueños desencriptan)     │
│  ├── encryptedIdentity (privado)                           │
│  ├── custody mapping (% por address)                       │
│  └── generation, parents                                    │
│                                                              │
│  TraitVerifier.sol                                          │
│  └── verifyProof(proof, publicInputs) → bool               │
│                                                              │
│  BreedingFactory.sol                                        │
│  └── breed(parent1, parent2, childData, zkProof)           │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO (compute)                         │
├─────────────────────────────────────────────────────────────┤
│  1. Genera ZK proof de custodia                             │
│  2. Contrato verifica proof                                 │
│  3. Desencripta soul/identity con wallet                   │
│  4. Corre agente en su OpenClaw                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 SEMANA 1-2: CONTRATOS

### Ticket 4.1: Storage On-Chain para Agentes
**Tiempo:** 5-6h | **Estado:** ⬜

**Descripción:**
Modificar GenomadNFT.sol para almacenar datos encriptados del agente directamente on-chain.

**Cambios:**
```solidity
struct Agent {
    uint8[8] traits;           // 8 traits (0-100)
    bytes32 dnaHash;           // Hash único
    bytes encryptedSoul;       // SOUL.md encriptado
    bytes encryptedIdentity;   // IDENTITY.md encriptado
    uint256 parent1;           // 0 si es gen-0
    uint256 parent2;           // 0 si es gen-0
    uint8 generation;          // 0, 1, 2...
    bytes32 previousVersion;   // Para mejoras (apunta a TX anterior)
}

mapping(uint256 => Agent) public agents;
```

**Criterios de aceptación:**
- [ ] Struct Agent actualizado con nuevos campos
- [ ] Función `getAgent(tokenId)` retorna todos los campos
- [ ] Función `getEncryptedData(tokenId)` retorna solo datos encriptados
- [ ] Gas estimado documentado
- [ ] Tests unitarios

---

### Ticket 4.2: Sistema de Custodia On-Chain
**Tiempo:** 4-5h | **Estado:** ⬜

**Descripción:**
Implementar custodia compartida directamente en el contrato.

**Cambios:**
```solidity
// Custodia: tokenId => owner => porcentaje (en basis points, 10000 = 100%)
mapping(uint256 => mapping(address => uint256)) public custody;

// Total custodia por token (debe sumar 10000)
mapping(uint256 => uint256) public totalCustody;

function getCustody(uint256 tokenId, address owner) public view returns (uint256);
function setCustody(uint256 tokenId, address[] owners, uint256[] shares) internal;
function transferCustody(uint256 tokenId, address to, uint256 amount) external;
```

**Criterios de aceptación:**
- [ ] Custodia se divide automáticamente en breeding (50/50)
- [ ] Solo dueños con custodia pueden transferir su parte
- [ ] Eventos emitidos para cambios de custodia
- [ ] Tests de división en breeding

---

### Ticket 4.3: TraitVerifier.sol (Placeholder)
**Tiempo:** 3-4h | **Estado:** ⬜

**Descripción:**
Crear contrato verificador de ZK proofs. Inicialmente placeholder, se conectará con circuitos en Fase ZK.

**Estructura:**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ITraitVerifier {
    function verifyTraitProof(
        bytes calldata proof,
        uint256[8] calldata traits,
        bytes32 contentHash
    ) external view returns (bool);
    
    function verifyBreedProof(
        bytes calldata proof,
        uint256[8] calldata parentATraits,
        uint256[8] calldata parentBTraits,
        uint256[8] calldata childTraits
    ) external view returns (bool);
    
    function verifyCustodyProof(
        bytes calldata proof,
        uint256 tokenId,
        address claimer,
        uint256 threshold
    ) external view returns (bool);
}

contract TraitVerifier is ITraitVerifier {
    // Placeholder - siempre retorna true
    // Se actualizará cuando los circuitos estén listos
    
    function verifyTraitProof(...) external pure returns (bool) {
        return true; // TODO: Implementar verificación real
    }
}
```

**Criterios de aceptación:**
- [ ] Interface definida correctamente
- [ ] Placeholder implementado
- [ ] Documentación de cómo se conectará con circuitos
- [ ] Tests de integración con GenomadNFT

---

### Ticket 4.4: Mint con Proof y Datos Encriptados
**Tiempo:** 5-6h | **Estado:** ⬜

**Descripción:**
Actualizar función de mint para aceptar datos encriptados y ZK proof.

**Cambios:**
```solidity
function mintWithProof(
    string memory name,
    uint8[8] memory traits,
    bytes32 dnaHash,
    bytes memory encryptedSoul,
    bytes memory encryptedIdentity,
    bytes memory zkProof
) external returns (uint256) {
    // Verificar ZK proof (cuando esté implementado)
    // require(verifier.verifyTraitProof(zkProof, traits, ...), Invalid proof);
    
    uint256 tokenId = _nextTokenId++;
    
    agents[tokenId] = Agent({
        traits: traits,
        dnaHash: dnaHash,
        encryptedSoul: encryptedSoul,
        encryptedIdentity: encryptedIdentity,
        parent1: 0,
        parent2: 0,
        generation: 0,
        previousVersion: bytes32(0)
    });
    
    // Custodia 100% al creador
    custody[tokenId][msg.sender] = 10000;
    totalCustody[tokenId] = 10000;
    
    _mint(msg.sender, tokenId);
    
    return tokenId;
}
```

**Criterios de aceptación:**
- [ ] Función mintWithProof implementada
- [ ] Almacena datos encriptados correctamente
- [ ] Custodia inicial al 100% para creador
- [ ] Evento AgentMinted con todos los datos
- [ ] Tests de mint completo

---

## 🔐 SEMANA 3-4: CIRCUITOS ZK

### Ticket 4.5: Setup Circom/Noir
**Tiempo:** 4-5h | **Estado:** ⬜

**Descripción:**
Configurar ambiente de desarrollo para circuitos ZK. Evaluar Circom vs Noir.

**Tareas:**
- [ ] Evaluar Circom (más maduro) vs Noir (más moderno)
- [ ] Setup de herramientas (snarkjs, circom o nargo)
- [ ] Estructura de carpetas
- [ ] Scripts de compilación y generación de keys

**Estructura:**
```
circuits/
├── README.md
├── package.json
├── scripts/
│   ├── compile.sh
│   ├── setup.sh
│   └── generate-verifier.sh
├── trait-proof/
│   ├── circuit.circom
│   └── input.json
├── breed-proof/
│   └── circuit.circom
└── custody-proof/
    └── circuit.circom
```

---

### Ticket 4.6: TraitProof Circuit
**Tiempo:** 8-10h | **Estado:** ⬜

**Descripción:**
Circuito que prueba que los traits fueron calculados correctamente del contenido.

**Lógica:**
```
Input privado: contenido_soul, contenido_identity
Input público: traits[8], content_hash

1. Verificar hash(contenido) == content_hash
2. Calcular traits desde contenido (versión simplificada del análisis)
3. Verificar traits calculados == traits públicos
4. Output: válido/inválido
```

**Consideraciones:**
- El análisis completo de keywords es muy costoso en ZK
- Opción A: Simplificar análisis (menos preciso pero verificable)
- Opción B: Commit-reveal (hash del contenido, revelar después)
- Opción C: Trusted setup con MPC

**Criterios de aceptación:**
- [ ] Circuito compila sin errores
- [ ] Genera proofs en <30 segundos
- [ ] Verificación on-chain funciona
- [ ] Documentación de limitaciones

---

### Ticket 4.7: BreedProof Circuit
**Tiempo:** 6-8h | **Estado:** ⬜

**Descripción:**
Circuito que prueba que los traits del hijo son un crossover válido de los padres.

**Lógica:**
```
Input privado: random_seed
Input público: parent_a_traits[8], parent_b_traits[8], child_traits[8]

Para cada trait i:
  1. Calcular punto de crossover desde seed
  2. child[i] debe ser parent_a[i] o parent_b[i] (según crossover)
  3. Aplicar mutación (±5% máximo)
  4. Verificar resultado está en rango

Output: válido/inválido
```

**Criterios de aceptación:**
- [ ] Crossover point determinístico desde seed
- [ ] Mutación limitada y verificable
- [ ] Tests con múltiples combinaciones de padres

---

### Ticket 4.8: CustodyProof Circuit
**Tiempo:** 4-5h | **Estado:** ⬜

**Descripción:**
Circuito que prueba que tienes suficiente custodia sin revelar el porcentaje exacto.

**Lógica:**
```
Input privado: mi_porcentaje
Input público: threshold (ej: 5000 = 50%), tokenId, my_address

1. Verificar mi_porcentaje >= threshold
2. Verificar firma/ownership (opcional, puede ser on-chain)

Output: válido/inválido
```

**Nota:** Este circuito es más simple porque la custodia ya está on-chain. El ZK solo oculta el % exacto.

**Criterios de aceptación:**
- [ ] Prueba funciona para diferentes thresholds
- [ ] No revela porcentaje exacto
- [ ] Integración con contrato de custodia

---

## 🎨 SEMANA 5-6: FRONTEND + SKILL

### Ticket 4.9: Encriptación con Wallet
**Tiempo:** 4-5h | **Estado:** ⬜

**Descripción:**
Implementar encriptación/desencriptación de datos usando la wallet del usuario.

**Tecnología:** 
- `eth-sig-util` para encriptación con public key
- O `lit-protocol` para access control descentralizado

**Funciones:**
```typescript
// Encriptar para múltiples dueños
async function encryptForOwners(
  content: string, 
  ownerAddresses: string[]
): Promise<EncryptedData>

// Desencriptar con tu wallet
async function decryptWithWallet(
  encryptedData: EncryptedData,
  wallet: WalletClient
): Promise<string>
```

**Criterios de aceptación:**
- [ ] Encriptar para una wallet funciona
- [ ] Encriptar para múltiples wallets (co-custodia)
- [ ] Desencriptar requiere firma
- [ ] Tests e2e

---

### Ticket 4.10: Actualizar genomad-verify para ZK
**Tiempo:** 6-8h | **Estado:** ⬜

**Descripción:**
Modificar el skill genomad-verify para generar ZK proofs localmente antes del mint.

**Nuevo flujo:**
```
1. Leer archivos (igual que antes)
2. Calcular traits (igual que antes)
3. NUEVO: Generar ZK proof de traits
4. NUEVO: Encriptar contenido con wallet
5. Enviar: traits + proof + encryptedData
```

**Cambios en verify.ts:**
```typescript
import { generateTraitProof } from './zk/trait-proof';
import { encryptContent } from './crypto/encrypt';

// Después de calcular traits...
const proof = await generateTraitProof(files, traits);
const encryptedSoul = await encryptContent(files.soul, walletAddress);
const encryptedIdentity = await encryptContent(files.identity, walletAddress);

// Enviar todo junto
await mintOnChain(traits, proof, encryptedSoul, encryptedIdentity);
```

**Criterios de aceptación:**
- [ ] Genera proof localmente
- [ ] Encripta antes de enviar
- [ ] Funciona con wallet conectada
- [ ] Fallback si ZK no disponible (testnet)

---

### Ticket 4.11: UI Mint con Encriptación
**Tiempo:** 5-6h | **Estado:** ⬜

**Descripción:**
Actualizar UI de activación para el nuevo flujo on-chain.

**Componentes:**
- `ActivateAgentModal.tsx` - Modal de activación
- `EncryptionStatus.tsx` - Muestra estado de encriptación
- `ProofGeneration.tsx` - Muestra generación de proof

**Flujo UI:**
```
1. Click Activar Agente
2. Modal: Generando proof ZK... (loading)
3. Modal: Encriptando datos... (loading)
4. Modal: Firma la transacción (wallet popup)
5. Modal: ¡Agente activado on-chain! (success)
```

**Criterios de aceptación:**
- [ ] Loading states claros
- [ ] Manejo de errores
- [ ] Gas estimation visible
- [ ] Confirmación de TX

---

### Ticket 4.12: UI Breeding con ZK
**Tiempo:** 5-6h | **Estado:** ⬜

**Descripción:**
Actualizar flujo de breeding para usar ZK proofs.

**Nuevo flujo:**
```
1. Seleccionar padres
2. Ambos dueños aprueban (firmas)
3. Generar BreedProof
4. Generar SOUL del hijo (off-chain, luego encriptar)
5. Mint hijo con proof + datos encriptados
6. Custodia automática 50/50
```

**Criterios de aceptación:**
- [ ] Requiere aprobación de ambos dueños
- [ ] Genera proof de breeding válido
- [ ] Hijo tiene custodia dividida
- [ ] Tests de flujo completo

---

## 🤖 SEMANA 7-8: OPENCLAW PLUGIN

### Ticket 4.13: Plugin genomad-chain-agent
**Tiempo:** 6-8h | **Estado:** ⬜

**Descripción:**
Crear plugin de OpenClaw que lee agentes desde Base en lugar de archivos locales.

**Estructura:**
```
extensions/
└── genomad-chain-agent/
    ├── package.json
    ├── index.ts
    ├── chain-reader.ts
    ├── decryption.ts
    └── agent-loader.ts
```

**Funcionalidad:**
```typescript
// agent-loader.ts
export async function loadAgentFromChain(
  tokenId: number,
  wallet: WalletClient,
  rpcUrl: string
): Promise<AgentConfig> {
  // 1. Leer datos del contrato
  const agent = await contract.getAgent(tokenId);
  
  // 2. Verificar custodia
  const myCustody = await contract.getCustody(tokenId, wallet.address);
  if (myCustody < 5000) throw new Error(Custodia insuficiente);
  
  // 3. Desencriptar
  const soul = await decryptWithWallet(agent.encryptedSoul, wallet);
  const identity = await decryptWithWallet(agent.encryptedIdentity, wallet);
  
  // 4. Retornar config para OpenClaw
  return {
    soul,
    identity,
    traits: agent.traits,
    tokenId,
    generation: agent.generation
  };
}
```

**Criterios de aceptación:**
- [ ] Lee datos de Base correctamente
- [ ] Verifica custodia antes de desencriptar
- [ ] Desencripta con wallet del usuario
- [ ] Configura OpenClaw en memoria (no archivos)

---

### Ticket 4.14: CLI para Correr Agente On-Chain
**Tiempo:** 4-5h | **Estado:** ⬜

**Descripción:**
Comando CLI para correr un agente desde la blockchain.

**Uso:**
```bash
# Correr agente #123 usando tu wallet
openclaw run-chain-agent --token-id 123 --wallet ~/.wallet.json

# O con variable de ambiente
GENOMAD_TOKEN_ID=123 openclaw run-chain-agent
```

**Criterios de aceptación:**
- [ ] Comando funciona desde terminal
- [ ] Pide firma de wallet para desencriptar
- [ ] Muestra información del agente antes de correr
- [ ] Maneja errores de custodia

---

### Ticket 4.15: Tests E2E Full Flow
**Tiempo:** 5-6h | **Estado:** ⬜

**Descripción:**
Tests end-to-end del flujo completo.

**Escenarios:**
1. Registro → Mint on-chain → Correr agente
2. Dos agentes → Breeding → Hijo on-chain → Ambos dueños corren
3. Transferencia de custodia → Nuevo dueño corre
4. Mejora de agente → Nueva TX → Verificar historial

**Criterios de aceptación:**
- [ ] Todos los escenarios pasan
- [ ] Tests corren en CI
- [ ] Documentación de cómo correr tests

---

## 📚 DOCUMENTACIÓN ADICIONAL

### Ticket 4.16: Documentación de Arquitectura
**Tiempo:** 3-4h | **Estado:** ⬜

**Contenido:**
- Diagrama de arquitectura completo
- Flujo de datos
- Consideraciones de gas
- Guía de seguridad
- FAQ técnico

---

## 🔧 DEPENDENCIAS

```
4.1 (Storage) ─────┐
4.2 (Custodia) ────┼──► 4.4 (Mint) ──► 4.11 (UI Mint)
4.3 (Verifier) ────┘                        │
                                            ▼
4.5 (Setup ZK) ──► 4.6 (TraitProof) ──► 4.10 (Skill) 
              └──► 4.7 (BreedProof) ──► 4.12 (UI Breed)
              └──► 4.8 (CustodyProof) ──► 4.13 (Plugin)
                                              │
                                              ▼
                                         4.14 (CLI)
                                              │
                                              ▼
                                         4.15 (Tests E2E)
```

---

## ✅ LEYENDA

| Estado | Significado |
|--------|-------------|
| ⬜ | Pendiente |
| 🔨 | En progreso |
| ✅ | Completado |
| ❌ | Bloqueado |
| 🔬 | En revisión |

---

## 📝 NOTAS

1. **Gas costs:** Almacenar strings largos on-chain es caro. Considerar:
   - Compresión de datos antes de encriptar
   - Límites de tamaño para SOUL/IDENTITY
   - Usar `calldata` cuando sea posible

2. **ZK tradeoffs:**
   - Circom: Más maduro, mejor tooling, pero circuitos grandes
   - Noir: Más moderno, mejor DX, pero menos probado

3. **Encriptación:**
   - Para custodia compartida, encriptar con cada wallet
   - O usar threshold encryption (más complejo)

4. **Fallback:**
   - Mantener sistema actual como fallback
   - Migración gradual, no big bang

---

*Última actualización: *
*Autor: Fruterito + Brian*
