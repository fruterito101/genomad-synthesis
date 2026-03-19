# 📋 PENDIENTES - Genomad Backend

> Última actualización: 2026-02-27
> Rama: dev

---

## ❌ FALTANTES CRÍTICOS

| # | Área | Estado | Detalle | Prioridad |
|---|------|--------|---------|-----------|
| 1 | **Tests** | ❌ | No hay tests unitarios ni de integración | Alta |
| 2 | **Sync Chain** | ❌ | DB funciona sola, no sincroniza con contratos | Alta |
| 3 | **Config Chain** | ❌ | Apunta a Sepolia, contratos en Monad | Alta |
| 4 | **Event Listeners** | ❌ | No escucha eventos on-chain | Media |

---

## ⚠️ PARCIALMENTE IMPLEMENTADO

| # | Área | Estado | Detalle | Prioridad |
|---|------|--------|---------|-----------|
| 5 | **ZK Prove** | ⚠️ | Código Rust existe, integración parcial | Media |
| 6 | **Validaciones** | ⚠️ | Solo agent.ts, faltan breeding, user | Media |
| 7 | **Rate Limit** | ⚠️ | In-memory (OK para dev, Redis para prod) | Baja |
| 8 | **Notificaciones** | ⚠️ | Estructura existe, implementación básica | Baja |

---

## 🔥 FEATURES NUEVAS (OpenClaw Multi-Agent)

| # | Feature | Descripción | Prioridad |
|---|---------|-------------|-----------|
| 9 | **Multi-agent config** | Cada agente "bred" puede ser un agente REAL en OpenClaw | 🔥 Alta |
| 10 | **Auth isolation** | Cada agente con sus propias credenciales (API keys, rate limits) | Alta |
| 11 | **Routing por canal** | Diferentes agentes responden en diferentes chats/canales | Media |

Ver spec completa: [OPENCLAW-MULTIAGENT-INTEGRATION.md](./OPENCLAW-MULTIAGENT-INTEGRATION.md)

---

## ✅ COMPLETADO

- [x] APIs CRUD (28 endpoints)
- [x] Auth (Privy)
- [x] DB Schema (Drizzle + Neon)
- [x] Sistema Genético (crossover, mutación, fitness)
- [x] Custody/Co-owners
- [x] Heuristics (análisis de traits)
- [x] Crypto (commitment, signatures)
- [x] Contratos deployados (Monad testnet)

---

## 📊 RESUMEN

| Categoría | Total | Completado | Pendiente |
|-----------|-------|------------|-----------|
| Backend Core | 8 | 8 | 0 |
| Web3 Integration | 4 | 0 | 4 |
| Mejoras | 4 | 0 | 4 |
| Features Nuevas | 3 | 0 | 3 |

**Total pendiente: 11 items**

---

## 🎯 PRÓXIMOS PASOS SUGERIDOS

1. [ ] Corregir config chain (Sepolia → Monad)
2. [ ] Sync DB ↔ Contratos
3. [ ] Tests básicos para APIs críticas
4. [ ] Implementar multi-agent breeding

---

## 📝 NOTAS

*Agregar notas aquí durante el desarrollo...*

