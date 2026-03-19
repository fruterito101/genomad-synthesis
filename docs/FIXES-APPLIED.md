# 🔧 FIXES APLICADOS — 2026-02-15 02:00 UTC

## ✅ Errores Críticos Corregidos

### 1. evmVersion: prague
**Archivo:** BACKEND-SPEC.md (Sección 16)
- Agregado foundry.toml completo con evmVersion: "prague"
- Solidity 0.8.27+ requerido

### 2. Import Paths
**Archivo:** BACKEND-SPEC.md (Sección 16)
- Documentado que @/* requiere tsconfig.json con paths

### 3. Wallet Persistence
**Archivo:** BACKEND-SPEC.md (Sección 16)
- Agregado código ejemplo de persistencia
- Nota sobre .gitignore

### 4. nad.fun Token Creation (4 pasos)
**Archivo:** BACKEND-SPEC.md (Sección 17)
- Paso 1: Metadata
- Paso 2: createToken
- Paso 3: Slippage/deadline
- Paso 4: Integración

### 5. Gas Estimation
**Archivo:** BACKEND-SPEC.md (Sección 18)
- Código ejemplo con buffer 20%

---

## 📝 Ticket Nuevo: 0.5b tsconfig.json

Agregar ANTES de Ticket 0.6:

```bash
# Crear tsconfig.json con paths
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
  "include": ["src/**/*", "app/**/*"],
  "exclude": ["node_modules"]
}
TSCONFIG
```

---

## 📝 Ticket 2.5 CORREGIDO: hash.ts

Usar @noble/hashes en lugar de crypto de Node:

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

*Fixes aplicados por Fruterito - 2026-02-15*
