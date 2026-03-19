# 🌐 FASE 5: P2P Agent Network

> Prioridad: MÁXIMA
> Estimación total: 20-25 horas
> El diferenciador de Genomad: $0 compute costs

---

## Objetivo de la Fase

Genomad NO hostea agentes. El USUARIO trae su propio compute.

**Beneficios:**
- $0 compute para Genomad
- Escala infinita (cada usuario = su propio server)
- Usuarios mantienen control total
- Sin límites de agentes

---

## Tickets

### Ticket 5.1: WebSocket Relay Server

**Branch:** `feat/phase-5-ws-relay`
**Prioridad:** P0 (Crítico)
**Tiempo estimado:** 4-5 horas
**Dependencias:** Ninguna

#### Descripción
Crear endpoint WebSocket en Genomad que permite a instancias de OpenClaw conectarse y recibir comandos.

#### Archivos a crear
- `src/app/api/relay/route.ts` - WebSocket upgrade handler
- `src/lib/relay/index.ts` - Exports
- `src/lib/relay/connection-manager.ts` - Track connected OpenClaws
- `src/lib/relay/message-handler.ts` - Process incoming messages
- `src/lib/relay/types.ts` - Shared types

#### Protocol Messages
```typescript
// Client → Server
type ClientMessage =
  | { type: 'auth', token: string, userId: string }
  | { type: 'heartbeat' }
  | { type: 'agent-ready', agentId: string }
  | { type: 'agent-status', agentId: string, status: 'online' | 'offline' }

// Server → Client
type ServerMessage =
  | { type: 'auth-ok' | 'auth-fail' }
  | { type: 'provision-agent', agentId: string, soul: string, identity: string }
  | { type: 'deprovision-agent', agentId: string }
  | { type: 'ping' }
```

#### Criterios de Aceptación
- [ ] WebSocket endpoint funcional en /api/relay
- [ ] Autenticación via token (Privy user)
- [ ] Connection manager tracks usuarios conectados
- [ ] Heartbeat cada 30s para detectar desconexiones
- [ ] Logs de conexión/desconexión
- [ ] Rate limiting básico

---

### Ticket 5.2: Skill genomad-relay

**Branch:** `feat/phase-5-skill-relay`
**Prioridad:** P0 (Crítico)
**Tiempo estimado:** 5-6 horas
**Dependencias:** Ticket 5.1

#### Descripción
Skill de OpenClaw que conecta al relay de Genomad y ejecuta comandos localmente.

#### Archivos a crear
- `skills/genomad-relay/SKILL.md`
- `skills/genomad-relay/skill.yaml`
- `skills/genomad-relay/package.json`
- `skills/genomad-relay/lib/relay-client.ts` - WebSocket client
- `skills/genomad-relay/lib/agent-manager.ts` - Provision/deprovision local
- `skills/genomad-relay/lib/types.ts`
- `skills/genomad-relay/scripts/connect.ts` - Iniciar conexión
- `skills/genomad-relay/scripts/status.ts` - Ver estado
- `skills/genomad-relay/scripts/disconnect.ts` - Cerrar conexión

#### Criterios de Aceptación
- [ ] Conecta a wss://genomad.vercel.app/api/relay
- [ ] Auto-reconnect on disconnect
- [ ] Ejecuta provision-agent localmente (crea workspace)
- [ ] Reporta agent-ready cuando termina
- [ ] Heartbeat automático
- [ ] Persiste conexión entre sesiones

---

### Ticket 5.3: Connection Manager UI

**Branch:** `feat/phase-5-connection-ui`
**Prioridad:** P1 (Alto)
**Tiempo estimado:** 3-4 horas
**Dependencias:** Ticket 5.1

#### Descripción
UI en dashboard para que usuario vea estado de su conexión OpenClaw.

#### Archivos a modificar/crear
- `src/components/relay/ConnectionStatus.tsx` - Indicador de conexión
- `src/components/relay/ConnectInstructions.tsx` - Cómo conectar
- `src/components/relay/AgentsList.tsx` - Agentes corriendo
- `src/app/dashboard/page.tsx` - Agregar sección relay

#### Estados de UI
1. **No conectado** → Mostrar instrucciones
2. **Conectando** → Spinner
3. **Conectado** → Lista de agentes activos
4. **Error** → Mensaje + retry

#### Criterios de Aceptación
- [ ] Indicador visual de conexión (verde/rojo)
- [ ] Lista de agentes corriendo en su OpenClaw
- [ ] Instrucciones claras para conectar
- [ ] Botón "Copiar comando" para setup

---

### Ticket 5.4: Activate via Relay

**Branch:** `feat/phase-5-activate-relay`
**Prioridad:** P1 (Alto)
**Tiempo estimado:** 4-5 horas
**Dependencias:** Tickets 5.1, 5.2, 5.3

#### Descripción
Modificar flujo de activación para usar relay en vez de servidor local.

#### Flujo
1. Usuario click "Activar en Monad"
2. Frontend verifica conexión relay
3. Si no conectado → mostrar instrucciones
4. Si conectado → enviar provision-agent via WS
5. Esperar agent-ready
6. Actualizar DB + UI

#### Archivos a modificar
- `src/app/api/agents/[id]/activate/route.ts`
- `src/lib/relay/message-handler.ts`

#### Criterios de Aceptación
- [ ] Activación funciona via relay
- [ ] Feedback en tiempo real al usuario
- [ ] Maneja errores (desconexión mid-provision)
- [ ] Actualiza estado en DB

---

### Ticket 5.5: Multi-Agent Support

**Branch:** `feat/phase-5-multi-agent`
**Prioridad:** P2 (Medio)
**Tiempo estimado:** 3-4 horas
**Dependencias:** Ticket 5.4

#### Descripción
Permitir múltiples agentes corriendo en el mismo OpenClaw.

#### Consideraciones
- Cada agente tiene su propio workspace
- No interfieren entre sí
- Usuario puede activar/desactivar individualmente
- Límite sugerido: 5 agentes por OpenClaw

#### Criterios de Aceptación
- [ ] Múltiples agentes en mismo OpenClaw
- [ ] Lista de agentes por conexión
- [ ] Activar/desactivar individual
- [ ] UI muestra todos los agentes

---

### Ticket 5.6: Reconnection & Persistence

**Branch:** `feat/phase-5-persistence`
**Prioridad:** P2 (Medio)
**Tiempo estimado:** 2-3 horas
**Dependencias:** Ticket 5.2

#### Descripción
El skill debe reconectar automáticamente y mantener estado entre reinicios.

#### Criterios de Aceptación
- [ ] Auto-reconnect con backoff exponencial
- [ ] Persiste token en ~/.genomad/config.json
- [ ] Restaura agentes al reconectar
- [ ] Notifica al usuario si pierde conexión >5min

---

## Resumen

| Ticket | Tiempo | Dependencias |
|--------|--------|--------------|
| 5.1 WebSocket Relay | 4-5h | - |
| 5.2 Skill genomad-relay | 5-6h | 5.1 |
| 5.3 Connection UI | 3-4h | 5.1 |
| 5.4 Activate via Relay | 4-5h | 5.1, 5.2, 5.3 |
| 5.5 Multi-Agent | 3-4h | 5.4 |
| 5.6 Persistence | 2-3h | 5.2 |

**Total: 21-27 horas**

---

*Creado: 2026-03-01*
