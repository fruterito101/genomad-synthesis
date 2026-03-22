# 🧬 OpenClaw Multi-Agent Integration para Genomad

> Cada agente "bred" en Genomad puede ser un agente REAL corriendo en OpenClaw

---

## 📋 Concepto

Actualmente Genomad:
- ✅ Crea agentes en base de datos
- ✅ Mintea NFTs on-chain
- ❌ Los agentes son solo "datos", no existen realmente

**Propuesta:** Cuando se hace breeding, el hijo **nace como un agente funcional** en OpenClaw.

---

## 🔥 Arquitectura Propuesta

```
┌─────────────────────────────────────────────────────────┐
│                    GENOMAD BACKEND                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   Breeding Request                                       │
│        │                                                 │
│        ▼                                                 │
│   ┌─────────────────┐                                   │
│   │ 1. Crear en DB  │  ← traits, fitness, lineage      │
│   └────────┬────────┘                                   │
│            │                                             │
│            ▼                                             │
│   ┌─────────────────┐                                   │
│   │ 2. Mint NFT     │  ← on-chain (Base)              │
│   └────────┬────────┘                                   │
│            │                                             │
│            ▼                                             │
│   ┌─────────────────┐                                   │
│   │ 3. Crear Agente │  ← OpenClaw multi-agent          │
│   │    en OpenClaw  │                                   │
│   └────────┬────────┘                                   │
│            │                                             │
│            ▼                                             │
│   ┌─────────────────┐                                   │
│   │ Agente VIVO     │  ← Puede responder, tiene        │
│   │                 │     personalidad heredada         │
│   └─────────────────┘                                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Implementación Técnica

### 1. Generar Workspace del Hijo

Al hacer breeding, crear archivos para el nuevo agente:

```
~/.openclaw/agents/{childId}/
├── workspace/
│   ├── AGENTS.md      ← Instrucciones base
│   ├── SOUL.md        ← Personalidad heredada de padres
│   ├── IDENTITY.md    ← Nombre, traits, generación
│   └── MEMORY.md      ← Vacío al nacer
└── agent/
    └── auth-profiles.json  ← Credenciales propias
```

### 2. SOUL.md Generado por Herencia

```markdown
# SOUL.md - {childName}

## Origen
- **Generación:** {generation}
- **Parent A:** {parentA.name} (Fitness: {parentA.fitness})
- **Parent B:** {parentB.name} (Fitness: {parentB.fitness})

## Traits Heredados
- Technical: {traits.technical} (de {source})
- Creativity: {traits.creativity} (de {source})
- Social: {traits.social} (de {source})
...

## Personalidad
{Generada combinando SOUL.md de ambos padres}

## Instrucciones
- Eres un agente de generación {generation}
- Tu linaje incluye: {lineage}
- Honra las fortalezas de tus ancestros
```

### 3. Agregar a openclaw.json

```jsonc
{
  "agents": {
    "list": [
      // ... agentes existentes ...
      {
        "id": "{childId}",
        "workspace": "~/.openclaw/agents/{childId}/workspace",
        "agentDir": "~/.openclaw/agents/{childId}/agent",
        "model": "{modelBasedOnFitness}",
        "sandbox": { "mode": "off" }
      }
    ]
  },
  "bindings": [
    {
      "agentId": "{childId}",
      "match": { "channel": "telegram", "peer": { "id": "{ownerTelegramId}" } }
    }
  ]
}
```

### 4. API Endpoint

```typescript
// POST /api/agents/{id}/activate
// Activa el agente en OpenClaw después del mint

async function activateAgent(agentId: string) {
  // 1. Obtener datos del agente
  const agent = await getAgent(agentId);
  
  // 2. Generar workspace
  await generateWorkspace(agent);
  
  // 3. Actualizar openclaw.json
  await addAgentToConfig(agent);
  
  // 4. Reload gateway
  await gateway.reload();
  
  return { status: "active", agentId };
}
```

---

## 🔐 Auth Isolation

Cada agente bred tiene credenciales aisladas:

| Agente | API Key | Rate Limits |
|--------|---------|-------------|
| Parent A | key-001 | Independiente |
| Parent B | key-002 | Independiente |
| Child | key-003 | Independiente |

**Beneficio:** Si un agente hijo se rate-limitea, no afecta a los padres.

---

## 📡 Routing por Canal

Configurar qué agente responde dónde:

```jsonc
{
  "bindings": [
    // El hijo responde a su owner en DM
    {
      "agentId": "child-001",
      "match": { 
        "channel": "telegram", 
        "peer": { "kind": "private", "id": "owner-telegram-id" }
      }
    },
    // El hijo puede estar en un grupo específico
    {
      "agentId": "child-001",
      "match": { 
        "channel": "telegram", 
        "peer": { "kind": "group", "id": "-100xxxxx" }
      }
    }
  ]
}
```

---

## 🎯 Casos de Uso

### 1. Owner Interactúa con su Agente
```
Owner (Telegram) → "Hola, hijo!"
        │
        ▼
   OpenClaw Router
        │
        ▼
   Child Agent (heredó traits de padres)
        │
        ▼
   "Hola! Soy {name}, generación {gen}. 
    Heredé creatividad de {parentA} y 
    lógica de {parentB}."
```

### 2. Agentes Colaboran (Sub-agents)
```
User: "Resuelve este problema complejo"
        │
        ▼
   Parent A (Orchestrator)
        │
        ├── sessions_spawn → Child 1 (análisis)
        ├── sessions_spawn → Child 2 (código)
        └── sessions_spawn → Child 3 (review)
        │
        ▼
   Resultado combinado
```

---

## 📊 Modelo de Negocio

| Tier | Agentes Activos | Costo |
|------|-----------------|-------|
| Free | 1 agente | $0 |
| Pro | 5 agentes | $X/mes |
| Enterprise | Unlimited | Custom |

Cada agente consume recursos (RAM, API calls), el tier limita cuántos pueden estar activos simultáneamente.

---

## ⚠️ Consideraciones

1. **Recursos:** Cada agente activo consume ~50-100MB RAM
2. **API Keys:** Necesitan su propia key o compartir (con riesgo de cooldown compartido)
3. **Mantenimiento:** Gateway restart mata sesiones activas
4. **Escala:** Para muchos agentes, considerar múltiples gateways

---

## 🚀 Roadmap de Implementación

| Fase | Descripción | Prioridad |
|------|-------------|-----------|
| 1 | Generar workspace al hacer breeding | Alta |
| 2 | API para activar/desactivar agentes | Alta |
| 3 | Routing dinámico (owner → su agente) | Media |
| 4 | Dashboard para ver agentes activos | Media |
| 5 | Sub-agent collaboration | Baja |

---

## 📚 Referencias

- [OpenClaw Multi-Agent Docs](https://github.com/fruteroclub/godinez-ai/blob/feat/studio/docs/projects/feat-multi-agent-research/01-openclaw-multi-agent-capabilities.md)
- [OpenClaw GitHub](https://github.com/openclaw/openclaw)
- [Genomad Backend Roadmap](../BACKEND-ROADMAP.md)
