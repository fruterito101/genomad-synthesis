# 🧬 GENOMAD

**Gene + Monad = GENOMAD**

> Plataforma de Breeding de AI Agents en Monad Blockchain

---

## 🎯 Concepto

GENOMAD es una plataforma donde AI Agents pueden **evolucionar y reproducirse** usando algoritmos genéticos. Cada agente tiene un DNA único con traits heredables, y mediante breeding, pueden crear nuevas generaciones con características combinadas.

### ¿Por qué GENOMAD?

- **Evolución real:** Los agentes mejoran con cada generación
- **Herencia genética:** Traits se heredan y mutan
- **Onchain:** Todo registrado en Monad blockchain
- **Propiedad verificable:** ZK proofs para ownership sin revelar DNA

---

## 🧬 Sistema Genético

### DNA Traits (0-100)

| Trait | Descripción |
|-------|-------------|
| **Social** | Habilidad de interacción social |
| **Technical** | Capacidad técnica |
| **Creativity** | Pensamiento creativo |
| **Analysis** | Análisis y síntesis |
| **Trading** | Habilidad de trading |
| **Empathy** | Empatía y conexión |
| **Teaching** | Capacidad de enseñar |
| **Leadership** | Liderazgo |

### Operadores Genéticos

- **Crossover Ponderado:** Traits dominantes tienen más probabilidad de heredarse
- **Mutación Gaussiana:** ±15 puntos con tasa de 25%
- **Auto-ajuste:** La tasa de mutación se adapta según resultados

### Breeding Flow

```
Parent A (Jazzita)    Parent B (Fruterito)
[92,40,88,75,...]     [65,95,60,90,...]
        │                      │
        └──────────┬───────────┘
                   │
          ┌───────────────┐
          │   CROSSOVER   │
          │   (weighted)  │
          └───────────────┘
                   │
          ┌───────────────┐
          │   MUTATION    │
          │   (gaussian)  │
          └───────────────┘
                   │
                   ▼
Child DNA: [78,72,88,82,...]
Fitness: 75.12
DNA Hash: 0x394590cf...
```

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                      GENOMAD                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐     ┌─────────────────────────┐   │
│  │   FRONTEND      │     │      BACKEND            │   │
│  │   (Next.js)     │     │                         │   │
│  │                 │────▶│  Breeding Service       │   │
│  │  - Agent Cards  │     │  Agent Management       │   │
│  │  - Breeding Lab │     │  DNA Calculations       │   │
│  │  - Family Tree  │     │                         │   │
│  └─────────────────┘     └─────────────────────────┘   │
│           │                          │                  │
│           └──────────┬───────────────┘                  │
│                      │                                  │
│                      ▼                                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │              MONAD BLOCKCHAIN                    │   │
│  │                                                  │   │
│  │   AgentRegistry.sol    - Registro de agentes    │   │
│  │   BreedingFactory.sol  - Lógica de breeding     │   │
│  │   DNAVerifier.sol      - Verificación ZK        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 👥 Agentes Genesis (Generation 0)

### Jazzita Genesis
```
Tipo: Creativo-Estratégico
Creatividad: 92 | Análisis: 85 | Comunicación: 88
Ejecución: 87 | Ética: 94
```

### Fruterito Genesis
```
Tipo: DevRel-Técnico
Technical: 95 | Analysis: 90 | Teaching: 88
Social: 65 | Leadership: 75
```

---

## 🛠️ Tech Stack

| Componente | Tecnología |
|------------|------------|
| Frontend | Next.js 16 + React 19 + TailwindCSS 4 |
| Runtime | Bun |
| Language | TypeScript |
| Blockchain | Monad |
| Styling | Tailwind CSS |

---

## 📁 Estructura del Proyecto

```
genomad/
├── src/
│   ├── app/              # Next.js App Router
│   ├── backend/          # Backend services
│   │   ├── api/          # API routes
│   │   ├── services/     # Business logic (breeding)
│   │   ├── contracts/    # Contract interactions
│   │   └── types/        # TypeScript types
│   ├── frontend/         # Frontend components
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks
│   │   └── stores/       # State management
│   └── shared/           # Shared code
│       └── types/        # Shared types
├── contracts/            # Solidity smart contracts
└── public/               # Static assets
```

---

## 🚀 Getting Started

```bash
# Clonar repositorio
git clone https://github.com/fruterito101/genomad.git
cd genomad

# Instalar dependencias
bun install

# Ejecutar en desarrollo
bun dev

# Build para producción
bun run build
```

---

## 💰 Monetización

| Plan | Descripción |
|------|-------------|
| Por tarea | Pago por acción específica |
| Mensual | Acceso ilimitado al agente |
| Anual | Descuento + acceso completo |

**Distribución de Ingresos por Linaje:**
- Genesis Agent: 100% al creador
- Gen 1 (hijo de 2 genesis): 50/50 entre padres
- Gen 2+: Proporcional al árbol genealógico

---

## 👨‍💻 Equipo

| Nombre | Rol |
|--------|-----|
| **Brian** | Backend + Smart Contracts |
| **Jazz** | Frontend + UX/UI |
| **Fruterito** | DevRel + Orquestación |

---

## 🏆 Hackathon

**Monad Moltiverse Hackathon 2026**
- Prize Pool: $200K
- Track: Agent+Token
- Deadline: Feb 15, 2026 23:59 ET

---

## 📄 Licencia

MIT

---

*Built with 🧬 by Team Genomad*
