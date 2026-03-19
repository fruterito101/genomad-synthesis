# 🎨 FRONTEND IMPLEMENTATION PLAN — Genomad Landing Page

> **Autor:** Fruterito (AI Assistant)  
> **Frontend Lead:** Jazz  
> **Fecha:** 2026-02-15  
> **Stack:** Next.js 16 + TailwindCSS 4 + Geist Font + Framer Motion

---

## 📋 RESUMEN EJECUTIVO

| Métrica | Valor |
|---------|-------|
| Total de Fases | 5 |
| Total de Tickets | 24 |
| Componentes a crear | 15 |
| Estimación total | 12-16 horas |

---

## 🎨 DESIGN SYSTEM

### Paleta de Colores
```css
:root {
  --color-primary: #7B3FE4;      /* Morado intenso */
  --color-secondary: #00AA93;    /* Turquesa tech */
  --color-accent-1: #C026FF;     /* Magenta neón */
  --color-accent-2: #0B0F2F;     /* Azul noche (background) */
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #A1A1AA;
  --color-text-muted: #71717A;
}
```

### Tipografía
- **Font:** Geist (ya configurada en layout.tsx)
- **Headings:** Geist Sans, bold
- **Body:** Geist Sans, regular
- **Code/Numbers:** Geist Mono

### Breakpoints
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

---

## 📁 ESTRUCTURA DE ARCHIVOS A CREAR

```
src/
├── app/
│   ├── page.tsx                    # Landing principal (MODIFICAR)
│   ├── globals.css                 # Variables CSS (MODIFICAR)
│   └── layout.tsx                  # (ya existe, OK)
│
├── components/
│   └── landing/                    # NUEVA CARPETA
│       ├── Header.tsx              # Navbar + Logo
│       ├── Hero.tsx                # Sección hero
│       ├── WhatIsGeномад.tsx       # Qué es Genomad
│       ├── AgentsCatalogue.tsx     # Catálogo preview
│       ├── HowToStart.tsx          # Pasos para empezar
│       ├── Breeding.tsx            # Sección breeding
│       ├── Footer.tsx              # Footer
│       └── index.ts                # Barrel export
│
├── components/ui/                  # NUEVA CARPETA
│   ├── Button.tsx                  # Botón primario/secundario
│   ├── StepCircle.tsx              # Círculo numerado para pasos
│   ├── SectionTitle.tsx            # Título de sección
│   ├── FeatureCard.tsx             # Card para features
│   ├── AnimatedText.tsx            # Texto con animación
│   └── index.ts                    # Barrel export
│
├── hooks/                          # (ya existe)
│   └── useScrollAnimation.ts       # Hook para animaciones scroll
│
└── lib/
    └── animations.ts               # Configuración Framer Motion
```

---

# 🚀 FASE 0: SETUP Y CONFIGURACIÓN
**Prioridad:** 🔴 Crítica  
**Estimación:** 1-2 horas

## Ticket F0-1: Configurar Design System en globals.css
**Archivo:** `src/app/globals.css`

**Tareas:**
- [ ] Agregar variables CSS de colores
- [ ] Configurar clases utilitarias para gradientes
- [ ] Definir animaciones base (fade-in, slide-up, etc.)
- [ ] Configurar scrollbar custom (opcional)

**Criterios de aceptación:**
- Variables accesibles vía `var(--color-primary)`
- Clases `.gradient-primary`, `.gradient-accent` funcionando
- Animaciones `@keyframes` definidas

---

## Ticket F0-2: Instalar y configurar Framer Motion
**Comando:** `bun add framer-motion`

**Tareas:**
- [ ] Instalar dependencia
- [ ] Crear archivo `src/lib/animations.ts` con variants
- [ ] Crear hook `useScrollAnimation.ts`

**Criterios de aceptación:**
- Import de framer-motion funciona sin errores
- Variants exportados para: fadeIn, slideUp, stagger

---

## Ticket F0-3: Crear estructura de carpetas
**Tareas:**
- [ ] Crear `src/components/landing/`
- [ ] Crear `src/components/ui/`
- [ ] Crear archivos index.ts para barrel exports

**Criterios de aceptación:**
- Carpetas creadas
- Imports funcionan: `from "@/components/landing"`

---

# 🏗️ FASE 1: COMPONENTES UI BASE
**Prioridad:** 🔴 Crítica  
**Estimación:** 2-3 horas  
**Dependencias:** Fase 0 completa

## Ticket F1-1: Componente Button
**Archivo:** `src/components/ui/Button.tsx`

**Props:**
```typescript
interface ButtonProps {
  variant: "primary" | "secondary" | "ghost";
  size: "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  disabled?: boolean;
}
```

**Estilos:**
- Primary: fondo morado (#7B3FE4), hover con brillo
- Secondary: borde turquesa, fondo transparente
- Ghost: solo texto, hover underline

**Criterios de aceptación:**
- 3 variantes funcionando
- Hover states con transición suave
- Soporte para link (href) y button (onClick)

---

## Ticket F1-2: Componente StepCircle
**Archivo:** `src/components/ui/StepCircle.tsx`

**Props:**
```typescript
interface StepCircleProps {
  number: number;
  title: string;
  description: string;
  isActive?: boolean;
  icon?: React.ReactNode;
}
```

**Diseño:**
- Círculo con número centrado
- Borde gradient (morado → turquesa)
- Título debajo en bold
- Descripción en texto secundario
- Estado activo con glow

**Criterios de aceptación:**
- Círculo renderiza número correctamente
- Gradient visible en borde
- Responsive (se apila en mobile)

---

## Ticket F1-3: Componente SectionTitle
**Archivo:** `src/components/ui/SectionTitle.tsx`

**Props:**
```typescript
interface SectionTitleProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  gradient?: boolean;
}
```

**Criterios de aceptación:**
- Título con tipografía grande (text-4xl/5xl)
- Subtítulo opcional en gris
- Opción de texto con gradient

---

## Ticket F1-4: Componente FeatureCard
**Archivo:** `src/components/ui/FeatureCard.tsx`

**Props:**
```typescript
interface FeatureCardProps {
  icon: string; // emoji o componente
  title: string;
  description: string;
}
```

**Diseño:**
- Fondo semi-transparente
- Borde sutil
- Hover: eleva y brilla
- Icono grande arriba

**Criterios de aceptación:**
- Card con hover effect
- Borde gradient opcional
- Animación de entrada

---

## Ticket F1-5: Componente AnimatedText
**Archivo:** `src/components/ui/AnimatedText.tsx`

**Props:**
```typescript
interface AnimatedTextProps {
  text: string;
  animation: "typewriter" | "reveal" | "gradient";
  delay?: number;
}
```

**Criterios de aceptación:**
- Typewriter: letras aparecen una por una
- Reveal: texto se "descubre" de izquierda a derecha
- Gradient: color cambia en loop

---

# 🎯 FASE 2: COMPONENTES DE LANDING
**Prioridad:** 🔴 Crítica  
**Estimación:** 4-5 horas  
**Dependencias:** Fase 1 completa

## Ticket F2-1: Componente Header
**Archivo:** `src/components/landing/Header.tsx`

**Contenido:**
- Logo (placeholder, espacio reservado)
- Nav items: About Us, Catalogue, Guides
- Botón CTA: "Activación" (primario)
- Mobile: hamburger menu

**Comportamiento:**
- Sticky on scroll
- Background blur cuando hay scroll
- Mobile menu con animación slide

**Criterios de aceptación:**
- Header fijo arriba
- Nav links funcionan (scroll o href)
- Responsive: hamburger en mobile
- Blur effect al hacer scroll

---

## Ticket F2-2: Componente Hero
**Archivo:** `src/components/landing/Hero.tsx`

**Contenido:**
```
TAGLINE (animado):
"Los humanos evolucionan.
Ahora los agentes también."

SUBTÍTULO:
"El primer protocolo de breeding de agentes AI — on-chain."

BULLETS (5):
1. Poseer agentes AI con DNA verificable on-chain
2. Criar nuevos agentes combinando dos existentes  
3. Evolucionar agentes a través de generaciones
4. Comerciar agentes únicos en un Marketplace
5. Verificar el linaje y autenticidad con ZK proofs

CTA BUTTON: "Comienza Ahora" o "Activa tu Agente"

MEDIA: Placeholder para video/imagen
```

**Animaciones:**
- Tagline: typewriter o reveal
- Bullets: fade-in secuencial (stagger)
- CTA: pulse suave

**Criterios de aceptación:**
- Tagline con animación de entrada
- Bullets aparecen uno por uno
- CTA prominente
- Espacio para media (16:9 ratio)
- Responsive: texto apilado en mobile

---

## Ticket F2-3: Componente WhatIsGeномad
**Archivo:** `src/components/landing/WhatIsGeномad.tsx`

**Contenido:**
```
PREGUNTA: "¿Qué es Genomad?"

RESPUESTA (párrafo corto):
"Genomad nace de una observación simple pero poderosa: 
las especies se adaptan y evolucionan, pero los agentes AI 
no tienen ese mecanismo... hasta ahora.

Genomad lo hace posible: agentes que heredan, mutan y evolucionan, 
donde los más aptos prosperan generación tras generación."

4 PILLARS (cards o iconos):
- 🧬 Evolución — algoritmos genéticos
- ⛓️ Permanencia — blockchain inmutable  
- 🤖 Identidad — personalidad única
- 🔐 Privacidad — ZK proofs

IMAGEN: Placeholder (lado derecho o abajo)
```

**Layout:**
- Desktop: texto izquierda, imagen derecha
- Mobile: texto arriba, imagen abajo

**Criterios de aceptación:**
- Pregunta grande y destacada
- Párrafo legible (max-width)
- 4 pillars en grid 2x2 o fila
- Imagen placeholder responsive

---

## Ticket F2-4: Componente AgentsCatalogue
**Archivo:** `src/components/landing/AgentsCatalogue.tsx`

**Contenido:**
```
TÍTULO: "Explora el Catálogo de Agentes"

SUBTÍTULO: "Descubre agentes únicos con DNA verificable on-chain"

PREVIEW: Imagen placeholder de dashboard
(Mostrar cómo se verá el catálogo en el futuro)

CTA: "Ver Catálogo" (link a /dashboard o #)
```

**Diseño:**
- Imagen tipo mockup/screenshot
- Borde con glow sutil
- Fondo ligeramente diferente para separar sección

**Criterios de aceptación:**
- Imagen placeholder centrada
- Título y CTA
- Fácil de actualizar cuando haya imagen real

---

## Ticket F2-5: Componente HowToStart
**Archivo:** `src/components/landing/HowToStart.tsx`

**Contenido:**
```
TÍTULO: "¿Cómo empezar?"

INTRO: "Activa tu agente en 3 simples pasos"

PASOS:
① Conecta tu wallet
   "Usa MetaMask, WalletConnect o tu wallet favorita"

② Crea tu perfil  
   "Vincula tu identidad y configura tu cuenta"

③ Activa tu agente
   "Analiza tu SOUL.md y genera tu DNA único"
```

**Diseño:**
- 3 StepCircles en fila (horizontal desktop)
- Línea conectora entre círculos (animada)
- En mobile: vertical con línea lateral

**Animaciones:**
- Círculos aparecen en secuencia
- Línea se "dibuja" entre ellos

**Criterios de aceptación:**
- 3 pasos claros y visibles
- Línea conectora animada
- Responsive: horizontal → vertical
- Números en círculos con gradient

---

## Ticket F2-6: Componente Breeding
**Archivo:** `src/components/landing/Breeding.tsx`

**Contenido:**
```
TÍTULO: "Breeding: Crea nuevos agentes"

INTRO: "Combina el DNA de dos agentes para crear uno completamente nuevo. 
Hereda traits de ambos padres más mutaciones únicas."

PASOS:
① Elige tu agente
   "Selecciona el agente que quieres cruzar"

② Elige la pareja
   "Encuentra un segundo agente compatible"

③ Ejecuta el breeding
   "Genera un hijo único con DNA irrepetible"

VISUAL: Diagrama simple de breeding (placeholder)
Padre A + Padre B → Hijo
```

**Diseño:**
- Similar a HowToStart pero con visual de breeding
- Diagrama: 2 círculos → flecha → 1 círculo
- Colores diferentes para distinguir padres/hijo

**Criterios de aceptación:**
- 3 pasos con StepCircle
- Diagrama visual de breeding
- Explicación clara y concisa

---

## Ticket F2-7: Componente Footer
**Archivo:** `src/components/landing/Footer.tsx`

**Contenido:**
```
COLUMNA 1 - Logo + tagline corto

COLUMNA 2 - Links
- About Us
- Catalogue  
- Guides

COLUMNA 3 - Social (iconos)
- Twitter/X (placeholder)
- Discord (placeholder)
- GitHub (placeholder)

DISCLAIMER:
"Genomad es un proyecto experimental desarrollado para 
Monad Moltiverse Hackathon 2026. Los agentes y tokens 
mostrados son con fines demostrativos."

COPYRIGHT: "© 2026 Genomad. Built on Monad."
```

**Diseño:**
- Fondo más oscuro (#0B0F2F o más)
- Grid de 3-4 columnas
- Social icons con hover
- Disclaimer en texto pequeño

**Criterios de aceptación:**
- Links del navbar replicados
- Iconos sociales (sin destino por ahora)
- Disclaimer visible
- Responsive: columnas se apilan

---

# 🔧 FASE 3: INTEGRACIÓN Y ANIMACIONES
**Prioridad:** 🟡 Alta  
**Estimación:** 2-3 horas  
**Dependencias:** Fase 2 completa

## Ticket F3-1: Integrar todos los componentes en page.tsx
**Archivo:** `src/app/page.tsx`

**Tareas:**
- [ ] Importar todos los componentes de landing
- [ ] Ordenar secciones según estructura
- [ ] Agregar IDs para navegación interna (#about, #catalogue, etc.)
- [ ] Verificar espaciado entre secciones

**Criterios de aceptación:**
- Todas las secciones visibles en orden
- Scroll suave entre secciones
- Sin errores de TypeScript

---

## Ticket F3-2: Implementar animaciones de scroll
**Tareas:**
- [ ] Agregar Framer Motion a cada sección
- [ ] Implementar viewport detection
- [ ] Animaciones solo se ejecutan una vez (whileInView)
- [ ] Stagger en listas/grids

**Criterios de aceptación:**
- Secciones animan al entrar en viewport
- Performance: no lag en scroll
- Animaciones suaves (ease-out)

---

## Ticket F3-3: Smooth scroll y navegación
**Tareas:**
- [ ] Configurar smooth scroll global
- [ ] Links del Header scrollean a secciones
- [ ] Highlight de link activo en nav

**Criterios de aceptación:**
- Click en nav → scroll suave
- URL no cambia (opcional: hash)
- Link activo destacado

---

## Ticket F3-4: Responsive final check
**Tareas:**
- [ ] Probar en 320px (mobile small)
- [ ] Probar en 768px (tablet)
- [ ] Probar en 1024px (laptop)
- [ ] Probar en 1440px (desktop)
- [ ] Ajustar spacing/font-sizes donde sea necesario

**Criterios de aceptación:**
- Sin overflow horizontal
- Texto legible en todos los breakpoints
- Imágenes se adaptan correctamente

---

# ✨ FASE 4: POLISH Y DETALLES
**Prioridad:** 🟢 Media  
**Estimación:** 2-3 horas  
**Dependencias:** Fase 3 completa

## Ticket F4-1: Efectos hover avanzados
**Tareas:**
- [ ] Botones: glow effect en hover
- [ ] Cards: elevación + sombra
- [ ] Links: underline animado
- [ ] Iconos sociales: color change

**Criterios de aceptación:**
- Hovers se sienten premium
- Transiciones suaves (200-300ms)
- No afectan performance

---

## Ticket F4-2: Loading states y skeleton
**Tareas:**
- [ ] Skeleton para imagen de catálogo
- [ ] Shimmer effect mientras carga
- [ ] Fallback para imágenes

**Criterios de aceptación:**
- Sin "flash" de contenido vacío
- Skeleton matches final layout

---

## Ticket F4-3: SEO y metadata
**Archivo:** `src/app/layout.tsx` y `page.tsx`

**Tareas:**
- [ ] Actualizar title y description
- [ ] Agregar Open Graph tags
- [ ] Agregar Twitter card tags
- [ ] Favicon (cuando esté disponible)

**Metadata sugerida:**
```typescript
export const metadata: Metadata = {
  title: "Genomad — Breed and Evolve AI Agents on Monad",
  description: "The first on-chain breeding protocol for AI agents. Create, evolve, and trade unique agents with verifiable DNA.",
  openGraph: {
    title: "Genomad — AI Agent Evolution",
    description: "Breed unique AI agents on Monad blockchain",
    type: "website",
  },
};
```

**Criterios de aceptación:**
- Metadata actualizada
- Preview correcto al compartir link

---

## Ticket F4-4: Accesibilidad básica
**Tareas:**
- [ ] Alt text en imágenes
- [ ] Aria labels en botones
- [ ] Focus states visibles
- [ ] Contraste de colores OK (WCAG AA)

**Criterios de aceptación:**
- Tab navigation funciona
- Screen reader friendly
- Contraste > 4.5:1 en texto

---

## Ticket F4-5: Performance check
**Tareas:**
- [ ] Lazy load de imágenes
- [ ] Code splitting si es necesario
- [ ] Lighthouse score > 90
- [ ] Sin errores en console

**Criterios de aceptación:**
- First Contentful Paint < 1.5s
- No console errors
- Bundle size razonable

---

# 📊 RESUMEN DE TICKETS POR FASE

| Fase | Nombre | Tickets | Estimación |
|------|--------|---------|------------|
| 0 | Setup | 3 | 1-2h |
| 1 | UI Base | 5 | 2-3h |
| 2 | Landing Components | 7 | 4-5h |
| 3 | Integración | 4 | 2-3h |
| 4 | Polish | 5 | 2-3h |
| **TOTAL** | | **24** | **12-16h** |

---

# 🎯 ORDEN DE EJECUCIÓN RECOMENDADO

```
CRÍTICO (hacer primero):
├── F0-1: Design System
├── F0-2: Framer Motion
├── F0-3: Estructura carpetas
├── F1-1: Button
├── F1-2: StepCircle
├── F2-1: Header
├── F2-2: Hero
└── F3-1: Integrar en page.tsx

IMPORTANTE (después):
├── F2-3: WhatIsGeномad
├── F2-5: HowToStart
├── F2-6: Breeding
├── F2-7: Footer
└── F3-2: Animaciones scroll

NICE TO HAVE (si hay tiempo):
├── F2-4: AgentsCatalogue
├── F4-1: Hover effects
├── F4-3: SEO
└── F4-4: Accesibilidad
```

---

# 📝 NOTAS PARA JAZZ

1. **Placeholders:** Todos los espacios de imagen/video están preparados para actualización fácil
2. **Colores:** Usar siempre las variables CSS, no valores hardcodeados
3. **Animaciones:** Framer Motion es opcional, se puede hacer con CSS si prefieres
4. **Mobile First:** Diseñar primero para mobile, luego expandir
5. **Commits:** Un commit por ticket completado

---

# ⏰ TIMELINE SUGERIDO (si es para hackathon)

| Hora | Actividad |
|------|-----------|
| 0-2h | Fase 0 + Fase 1 |
| 2-6h | Fase 2 (todos los componentes) |
| 6-8h | Fase 3 (integración + animaciones) |
| 8-10h | Fase 4 (polish) |
| 10h+ | Buffer para ajustes |

---

*Plan generado por Fruterito para Jazz*  
*Última actualización: 2026-02-15 22:53 UTC*
