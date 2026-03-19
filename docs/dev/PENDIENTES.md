# 📋 PENDIENTES - Genomad Backend

> Última actualización: 2026-02-27 20:37 UTC
> Rama: dev

---

## 🔥 PRIORIDAD MÁXIMA - Multi-Agent (Lo que nos diferencia)

| # | Tarea | Detalle | Estado |
|---|-------|---------|--------|
| 1 | **Multi-agent config** | Agentes bred = agentes REALES en OpenClaw | 📋 Spec lista |
| 2 | **Auth isolation** | Cada agente sus propias API keys/credentials | 📋 Spec lista |
| 3 | **Routing por canal** | Owner chatea con su agente en su chat | 📋 Spec lista |
| 4 | **SOUL.md Generator** | Generar personalidad heredada de padres | ❌ Pendiente |
| 5 | **Workspace Provisioning** | Crear carpetas/archivos del agente hijo | ❌ Pendiente |
| 6 | **Activate Agent API** | Endpoint para activar agente en OpenClaw | ❌ Pendiente |

**Spec:** [OPENCLAW-MULTIAGENT-INTEGRATION.md](./OPENCLAW-MULTIAGENT-INTEGRATION.md)

---

## ❌ WEB3 - Integración Blockchain

| # | Tarea | Detalle | Estado |
|---|-------|---------|--------|
| 7 | **Config Chain** | Cambiar Sepolia → Monad | ❌ Pendiente |
| 8 | **Hooks Usuario** | useRegisterAgent, useBreeding (user firma TX) | ❌ Pendiente |
| 9 | **Sync DB ↔ Chain** | Acciones DB llamen contratos | ❌ Pendiente |
| 10 | **Event Listeners** | Escuchar eventos on-chain | ❌ Pendiente |

**Spec:** [PENDIENTES-WEB3.md](./PENDIENTES-WEB3.md)

---

## ⚠️ BACKEND - Mejoras

| # | Tarea | Detalle | Estado |
|---|-------|---------|--------|
| 11 | **Tests** | Tests unitarios e integración | ❌ Pendiente |
| 12 | **ZK Prove** | Completar integración RISC Zero | ⚠️ Parcial |
| 13 | **Validaciones** | Agregar breeding.ts, user.ts | ⚠️ Parcial |
| 14 | **Notificaciones** | Completar implementación | ⚠️ Parcial |

---

## ✅ COMPLETADO

- [x] APIs CRUD (28 endpoints)
- [x] Auth (Privy)
- [x] DB Schema (Drizzle + Neon)
- [x] Sistema Genético completo
- [x] Custody/Co-owners
- [x] Heuristics
- [x] Crypto (commitment, signatures)
- [x] Contratos deployados (Monad testnet)
- [x] Spec Multi-Agent

---

## 📊 RESUMEN

| Categoría | Pendiente | Parcial | Completo |
|-----------|-----------|---------|----------|
| Multi-Agent | 3 | 0 | 3 (specs) |
| Web3 | 4 | 0 | 0 |
| Backend | 1 | 3 | 8 |
| **TOTAL** | **8** | **3** | **11** |

---

## 🎯 ORDEN SUGERIDO

1. **Multi-Agent** ← Lo que nos hace únicos
2. **Web3** ← Conectar con blockchain
3. **Backend mejoras** ← Polish

