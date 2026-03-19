# ⚙️ FASE 3: Backend Improvements

> Prioridad: Media
> Estimación total: 10-14 horas
> Polish y mejoras de calidad

---

## Objetivo de la Fase

Mejorar la calidad, testing, y robustez del backend.

---

## Tickets

### Ticket 3.1: Unit Tests Core

**Branch:** `feat/phase-3-tests-core`
**Prioridad:** P1 (Alto)
**Tiempo estimado:** 4-5 horas
**Dependencias:** Ninguna

#### Descripción
Agregar tests unitarios para las funciones core del sistema.

#### Archivos a crear
```
jest.config.js
src/lib/genetic/__tests__/
├── crossover.test.ts
├── mutation.test.ts
├── fitness.test.ts
└── hash.test.ts

src/lib/custody/__tests__/
├── custody.test.ts
└── approvals.test.ts

src/lib/crypto/__tests__/
├── commitment.test.ts
└── signatures.test.ts
```

#### Setup de Jest

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

#### Criterios de Aceptación
- [ ] Jest configurado
- [ ] Tests para sistema genético
- [ ] Tests para custody
- [ ] Tests para crypto
- [ ] Coverage > 70%

---

### Ticket 3.2: API Integration Tests

**Branch:** `feat/phase-3-tests-api`
**Prioridad:** P1 (Alto)
**Tiempo estimado:** 3-4 horas
**Dependencias:** Ticket 3.1

#### Descripción
Agregar tests de integración para las APIs principales.

#### Archivos a crear
```
src/app/api/__tests__/
├── agents.test.ts
├── breeding.test.ts
└── auth.test.ts
```

#### APIs a testear
- POST /api/agents/register
- GET /api/agents
- GET /api/agents/{id}
- POST /api/breeding/request
- POST /api/breeding/{id}/approve
- POST /api/breeding/{id}/execute
- GET /api/auth/me

#### Criterios de Aceptación
- [ ] Tests para agents API
- [ ] Tests para breeding API
- [ ] Tests para auth API
- [ ] Mocks de DB configurados
- [ ] CI puede correr tests

---

### Ticket 3.3: Validation Schemas

**Branch:** `feat/phase-3-validations`
**Prioridad:** P2 (Medio)
**Tiempo estimado:** 2-3 horas
**Dependencias:** Ninguna

#### Descripción
Agregar schemas de validación con Zod para todas las entidades.

#### Archivos a crear/modificar
```
src/lib/validations/
├── agent.ts       ← Existe, expandir
├── breeding.ts    ← CREAR
├── user.ts        ← CREAR
└── index.ts       ← Exportar todo
```

#### Schemas a definir

```typescript
// breeding.ts
import { z } from "zod";

export const breedingRequestSchema = z.object({
  parentAId: z.string().uuid(),
  parentBId: z.string().uuid(),
  childName: z.string().min(1).max(50).optional(),
  crossoverType: z.enum(["weighted", "random", "dominant"]).default("weighted"),
});

export const breedingApproveSchema = z.object({
  requestId: z.string().uuid(),
});

export const breedingExecuteSchema = z.object({
  requestId: z.string().uuid(),
  childName: z.string().min(1).max(50),
});
```

#### Criterios de Aceptación
- [ ] Schema para breeding requests
- [ ] Schema para users
- [ ] Schema para agent updates
- [ ] Validación en APIs usa schemas
- [ ] Mensajes de error claros

---

### Ticket 3.4: ZK Integration Complete

**Branch:** `feat/phase-3-zk-complete`
**Prioridad:** P2 (Medio)
**Tiempo estimado:** 3-4 horas
**Dependencias:** Ninguna

#### Descripción
Completar la integración del sistema ZK proof con RISC Zero.

#### Estado actual
- ✅ Código Rust existe en `contracts/zk/`
- ⚠️ Integración con backend parcial

#### Archivos a modificar
```
src/lib/crypto/zk.ts
src/app/api/zk/prove/route.ts
```

#### Flujo ZK
1. Generar witness (traits de padres)
2. Ejecutar RISC Zero prover
3. Obtener proof
4. Verificar on-chain (BreedingVerifier.sol)

#### Criterios de Aceptación
- [ ] API /api/zk/prove funciona
- [ ] Genera proofs válidos
- [ ] Proofs verifican on-chain
- [ ] Documentación de uso

---

### Ticket 3.5: Notification System

**Branch:** `feat/phase-3-notifications`
**Prioridad:** P2 (Medio)
**Tiempo estimado:** 2-3 horas
**Dependencias:** Ninguna

#### Descripción
Completar el sistema de notificaciones.

#### Archivos a modificar
```
src/lib/notifications/
├── index.ts        ← Expandir
├── types.ts        ← Crear
└── channels/
    ├── database.ts ← Guardar en DB
    └── realtime.ts ← WebSocket/SSE
```

#### Tipos de notificación
- Breeding request recibido
- Breeding aprobado
- Breeding ejecutado (hijo nació)
- Transfer de agente
- Agente activado

#### Criterios de Aceptación
- [ ] Notificaciones se guardan en DB
- [ ] API GET /api/notifications funciona
- [ ] Marcar como leídas funciona
- [ ] (Opcional) WebSocket para realtime

---

### Ticket 3.6: Rate Limit Redis

**Branch:** `feat/phase-3-rate-limit-redis`
**Prioridad:** P3 (Bajo)
**Tiempo estimado:** 1-2 horas
**Dependencias:** Ninguna

#### Descripción
Migrar rate limiting de in-memory a Redis para producción.

#### Archivos a modificar
```
src/lib/rate-limit.ts
```

#### Criterios de Aceptación
- [ ] Redis client configurado
- [ ] Rate limit persiste entre restarts
- [ ] Fallback a in-memory si Redis no disponible
- [ ] Mismo API que versión actual

---

## Resumen

| Ticket | Nombre | Tiempo | Deps |
|--------|--------|--------|------|
| 3.1 | Tests Core | 4-5h | - |
| 3.2 | Tests API | 3-4h | 3.1 |
| 3.3 | Validations | 2-3h | - |
| 3.4 | ZK Complete | 3-4h | - |
| 3.5 | Notifications | 2-3h | - |
| 3.6 | Rate Limit Redis | 1-2h | - |

**Total: 15-21 horas**

## Diagrama

```
3.1 Tests Core ──► 3.2 Tests API
        
3.3 Validations (independiente)

3.4 ZK Complete (independiente)

3.5 Notifications (independiente)

3.6 Rate Limit (independiente)
```

Los tickets 3.3-3.6 pueden ejecutarse en paralelo.
