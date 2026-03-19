# 🎯 TICKETS DE DESARROLLO - Genomad

> Última actualización: 2026-02-27
> Total estimado: 45-55 horas

---

## Resumen Ejecutivo

| Fase | Descripción | Tickets | Horas |
|------|-------------|---------|-------|
| **1** | Multi-Agent System | 6 | 18-22h |
| **2** | Web3 Integration | 6 | 15-20h |
| **3** | Backend Improvements | 6 | 15-21h |
| **Total** | | **18** | **48-63h** |

---

## 🔥 FASE 1: Multi-Agent System (PRIORIDAD MÁXIMA)

Lo que hace único a Genomad: agentes bred = agentes REALES.

| # | Ticket | Tiempo | Estado |
|---|--------|--------|--------|
| 1.1 | Soul Generator Service | 3-4h | ⬜ |
| 1.2 | Workspace Provisioner | 4-5h | ⬜ |
| 1.3 | OpenClaw Config Manager | 3-4h | ⬜ |
| 1.4 | Activate Agent API | 3-4h | ⬜ |
| 1.5 | Gateway Reload Integration | 2h | ⬜ |
| 1.6 | Tests Multi-Agent | 3h | ⬜ |

**Archivo:** [FASE-1-MULTIAGENT.md](./FASE-1-MULTIAGENT.md)

---

## 🔗 FASE 2: Web3 Integration

Conectar con blockchain (Monad).

| # | Ticket | Tiempo | Estado |
|---|--------|--------|--------|
| 2.1 | Fix Chain Configuration | 1-2h | ⬜ |
| 2.2 | User Wallet Hooks | 3-4h | ⬜ |
| 2.3 | Sync API Actions with Chain | 4-5h | ⬜ |
| 2.4 | Event Listeners | 3-4h | ⬜ |
| 2.5 | Read Hooks | 2h | ⬜ |
| 2.6 | Tests Web3 | 2-3h | ⬜ |

**Archivo:** [FASE-2-WEB3.md](./FASE-2-WEB3.md)

---

## ⚙️ FASE 3: Backend Improvements

Polish y calidad.

| # | Ticket | Tiempo | Estado |
|---|--------|--------|--------|
| 3.1 | Unit Tests Core | 4-5h | ⬜ |
| 3.2 | API Integration Tests | 3-4h | ⬜ |
| 3.3 | Validation Schemas | 2-3h | ⬜ |
| 3.4 | ZK Integration Complete | 3-4h | ⬜ |
| 3.5 | Notification System | 2-3h | ⬜ |
| 3.6 | Rate Limit Redis | 1-2h | ⬜ |

**Archivo:** [FASE-3-BACKEND.md](./FASE-3-BACKEND.md)

---

## Orden de Ejecución Sugerido

```
SEMANA 1:
├── 1.1 Soul Generator
├── 1.2 Workspace Provisioner
├── 1.3 Config Manager
└── 1.4 Activate API

SEMANA 2:
├── 1.5 Gateway Reload
├── 1.6 Tests Multi-Agent
├── 2.1 Chain Config
└── 2.2 Wallet Hooks

SEMANA 3:
├── 2.3 Sync APIs
├── 2.4 Event Listeners
├── 2.5 Read Hooks
└── 2.6 Tests Web3

SEMANA 4:
├── 3.1 Tests Core
├── 3.2 Tests API
├── 3.3 Validations
└── 3.4-3.6 (paralelo)
```

---

## Cómo Usar Este Documento

1. **Seleccionar ticket** del índice
2. **Abrir archivo de fase** correspondiente
3. **Crear branch** según formato: `feat/phase-X-nombre`
4. **Implementar** según criterios de aceptación
5. **Verificar** con comandos indicados
6. **PR a dev** (nunca a main)
7. **Actualizar estado** en este índice

---

## Leyenda

| Estado | Significado |
|--------|-------------|
| ⬜ | Pendiente |
| 🔨 | En progreso |
| ✅ | Completado |
| ❌ | Bloqueado |

---

## Archivos de la Carpeta

```
docs/dev/tickets/
├── TICKETS-INDEX.md        ← Este archivo
├── FASE-1-MULTIAGENT.md    ← Tickets 1.1-1.6
├── FASE-2-WEB3.md          ← Tickets 2.1-2.6
└── FASE-3-BACKEND.md       ← Tickets 3.1-3.6
```
