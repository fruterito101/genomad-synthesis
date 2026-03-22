# 🎫 Genomad i18n Implementation Tickets

> **Objetivo:** Traducir TODA la aplicación ES ↔ EN
> **Estimación total:** ~2-3 horas
> **Prioridad:** 🔴 Alta (Hackathon)

---

## 📊 Resumen de Componentes

| Categoría | Componentes | Keys estimados |
|-----------|-------------|----------------|
| Landing Page | 7 | ~120 |
| App Pages | 4 | ~80 |
| Shared Components | 5 | ~40 |
| UI Components | 4 | ~20 |
| **TOTAL** | **20** | **~260 keys** |

---

## 🏗️ FASE 0: Infraestructura (15 min)

### Ticket #0.1: Instalar dependencias i18n
**Prioridad:** 🔴 Crítica | **Estimación:** 2 min

```bash
npm install i18next react-i18next i18next-browser-languagedetector i18next-resources-to-backend
```

---

### Ticket #0.2: Crear configuración i18n
**Prioridad:** 🔴 Crítica | **Estimación:** 5 min
**Archivo:** `src/i18n/config.ts`

---

### Ticket #0.3: Crear estructura de locales
**Prioridad:** 🔴 Crítica | **Estimación:** 3 min

```
src/locales/es/translation.json
src/locales/en/translation.json
```

---

### Ticket #0.4: Integrar en layout.tsx
**Prioridad:** 🔴 Crítica | **Estimación:** 2 min

---

### Ticket #0.5: Script de validación
**Prioridad:** 🟡 Media | **Estimación:** 3 min
**Archivo:** `scripts/validate-translations.cjs`

---

## 🏠 FASE 1: Landing Page (45 min)

### Ticket #1.1: Hero.tsx
**Keys:** title, subtitle, features[5], cta, stats
**⚠️ CRÍTICO:** Agregar `animationKey={i18n.language}` a motion elements

### Ticket #1.2: Header.tsx
**Keys:** nav items, cta, aria labels

### Ticket #1.3: WhatIsGenomad.tsx
**Keys:** title, description, pillars[4]

### Ticket #1.4: HowToStart.tsx
**Keys:** title, subtitle, steps[3]

### Ticket #1.5: Breeding.tsx
**Keys:** title, subtitle, features[4], cta

### Ticket #1.6: AgentsCatalogue.tsx
**Keys:** title, subtitle, cta

### Ticket #1.7: Footer.tsx
**Keys:** tagline, sections, copyright, legal

---

## 📱 FASE 2: App Pages (40 min)

### Ticket #2.1: Dashboard Page
**Keys:** welcome, features[4], stats, traits[8], rarity[5], cta

### Ticket #2.2: AgentDetailModal.tsx
**Keys:** labels, actions, traits

### Ticket #2.3: AppHeader.tsx
**Keys:** nav items, wallet buttons

### Ticket #2.4: Profile Page
**Keys:** title, stats, empty state, cta

---

## 🎛️ FASE 3: Language Switcher (15 min)

### Ticket #3.1: Crear LanguageSwitcher.tsx
### Ticket #3.2: Integrar en Headers

---

## ✅ FASE 4: Validación (15 min)

### Ticket #4.1: Consolidar JSONs
### Ticket #4.2: Testing Manual

---

## 📋 Orden de Ejecución

```
FASE 0 (infraestructura)
    ↓
FASE 1 (landing - 7 componentes)
    ↓
FASE 2 (app pages - 4 componentes)
    ↓
FASE 3 (switcher)
    ↓
FASE 4 (validación)
    ↓
✅ DONE
```

---

**Creado:**  | **Autor:** Fruterito 🍓
