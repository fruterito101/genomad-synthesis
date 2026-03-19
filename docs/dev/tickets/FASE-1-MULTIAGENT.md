# 🔥 FASE 1: Multi-Agent System

> Prioridad: MÁXIMA
> Estimación total: 15-20 horas
> Esto es lo que hace único a Genomad

---

## Objetivo de la Fase

Cuando un usuario hace breeding y nace un nuevo agente:
1. Se crea en la base de datos ✅ (ya existe)
2. Se mintea como NFT on-chain (Fase 2)
3. **Se crea un agente REAL en OpenClaw que puede responder mensajes** ← ESTA FASE

---

## Tickets

### Ticket 1.1: Soul Generator Service

**Branch:** `feat/phase-1-soul-generator`
**Prioridad:** P0 (Crítico)
**Tiempo estimado:** 3-4 horas
**Dependencias:** Ninguna

#### Descripción
Crear servicio que genera el archivo SOUL.md para un agente hijo basándose en los traits heredados de sus padres.

#### Archivos a crear
```
src/lib/multiagent/
├── index.ts
├── soul-generator.ts      ← ESTE TICKET
├── types.ts
└── templates/
    └── SOUL.template.md
```

#### Criterios de Aceptación
- [ ] Función `generateSoul()` recibe datos del hijo y padres
- [ ] Genera SOUL.md con personalidad basada en traits
- [ ] Incluye linaje y origen
- [ ] Incluye instrucciones basadas en trait dominante
- [ ] Template es extensible

---

### Ticket 1.2: Workspace Provisioner

**Branch:** `feat/phase-1-workspace-provisioner`
**Prioridad:** P0 (Crítico)
**Tiempo estimado:** 4-5 horas
**Dependencias:** Ticket 1.1

#### Descripción
Crear servicio que provisiona el workspace completo para un nuevo agente en el filesystem.

#### Estructura del workspace generado
```
~/.openclaw/agents/{agentId}/
├── workspace/
│   ├── AGENTS.md
│   ├── SOUL.md          ← Generado por Ticket 1.1
│   ├── IDENTITY.md
│   ├── USER.md
│   ├── MEMORY.md
│   └── memory/
└── agent/
    └── auth-profiles.json
```

#### Criterios de Aceptación
- [ ] Crea estructura completa de directorios
- [ ] Genera todos los archivos .md con contenido correcto
- [ ] SOUL.md usa el generador del Ticket 1.1
- [ ] auth-profiles.json creado vacío
- [ ] Función de deprovision funciona

---

### Ticket 1.3: OpenClaw Config Manager

**Branch:** `feat/phase-1-config-manager`
**Prioridad:** P0 (Crítico)
**Tiempo estimado:** 3-4 horas
**Dependencias:** Ticket 1.2

#### Descripción
Crear servicio que modifica openclaw.json para agregar/remover agentes y sus bindings.

#### Funciones principales
- `readConfig()` - Lee openclaw.json
- `writeConfig()` - Escribe con backup
- `addAgentToConfig()` - Agrega agente + bindings
- `removeAgentFromConfig()` - Remueve agente + bindings
- `updateAgentBindings()` - Actualiza routing

#### Criterios de Aceptación
- [ ] Lee y escribe openclaw.json correctamente
- [ ] Hace backup antes de escribir
- [ ] Agrega agentes con sus bindings
- [ ] Remueve agentes y sus bindings
- [ ] Validación de duplicados

---

### Ticket 1.4: Activate Agent API

**Branch:** `feat/phase-1-activate-api`
**Prioridad:** P0 (Crítico)
**Tiempo estimado:** 3-4 horas
**Dependencias:** Tickets 1.1, 1.2, 1.3

#### Descripción
Crear endpoint API que orquesta la activación completa de un agente.

#### Endpoints
- `POST /api/agents/{id}/activate` - Activa agente
- `DELETE /api/agents/{id}/activate` - Desactiva agente

#### Flujo de activación
1. Obtener datos del agente y padres de DB
2. Provisionar workspace (Ticket 1.2)
3. Agregar a openclaw.json (Ticket 1.3)
4. Actualizar estado en DB
5. (Opcional) Reload gateway

#### Criterios de Aceptación
- [ ] POST activa correctamente
- [ ] DELETE desactiva correctamente
- [ ] Verificación de ownership
- [ ] Rollback si falla algún paso
- [ ] Respuesta incluye pasos ejecutados

---

### Ticket 1.5: Gateway Reload Integration

**Branch:** `feat/phase-1-gateway-reload`
**Prioridad:** P1 (Alto)
**Tiempo estimado:** 2 horas
**Dependencias:** Ticket 1.4

#### Descripción
Integrar con el gateway de OpenClaw para hacer reload después de cambios.

#### Funciones
- `reloadGateway()` - Solicita reload
- `getGatewayStatus()` - Verifica estado

---

### Ticket 1.6: Tests Multi-Agent

**Branch:** `feat/phase-1-multiagent-tests`
**Prioridad:** P1 (Alto)
**Tiempo estimado:** 3 horas
**Dependencias:** Tickets 1.1-1.5

#### Archivos de test
```
src/lib/multiagent/__tests__/
├── soul-generator.test.ts
├── workspace-provisioner.test.ts
├── config-manager.test.ts
└── orchestrator.test.ts
```

---

## Resumen

| Ticket | Nombre | Tiempo | Deps |
|--------|--------|--------|------|
| 1.1 | Soul Generator | 3-4h | - |
| 1.2 | Workspace Provisioner | 4-5h | 1.1 |
| 1.3 | Config Manager | 3-4h | 1.2 |
| 1.4 | Activate API | 3-4h | 1.1-1.3 |
| 1.5 | Gateway Reload | 2h | 1.4 |
| 1.6 | Tests | 3h | 1.1-1.5 |

**Total: 18-22 horas**

## Diagrama de Dependencias

```
1.1 ──► 1.2 ──► 1.3 ──► 1.4 ──► 1.5 ──► 1.6
```
