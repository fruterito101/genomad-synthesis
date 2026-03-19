# i18n Implementation Guide for Lovable React Projects

**Version:** 1.0
**Last Updated:** 2026-01-24
**Stack:** Vite + React 18 + TypeScript + react-i18next
**Adapted for:** Next.js (Genomad)

This guide documents the complete implementation of multi-language support in a Lovable-built landing page, including all decisions, patterns, issues encountered, and solutions. Use this as a blueprint for adding i18n to similar projects.

---

## ⚠️ CRITICAL WARNING: Framer Motion + i18n Compatibility

**If you're using Framer Motion's `whileInView` animations with i18n, you WILL encounter a critical rendering bug.**

**Symptom:** After toggling language, only the Hero section and top of the second section are visible. All other content disappears.

**Required Fix:** Add `animationKey={i18n.language}` to ALL ScrollReveal/animated components. See [Critical Issue 1](#️-critical-issue-1-page-content-disappears-after-language-toggle) for complete details and solution.

**This took 3 attempts and ~20 minutes to debug.** Save yourself the time and apply the fix from the start.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Implementation Phases](#implementation-phases)
4. [Key Patterns & Decisions](#key-patterns--decisions)
5. [Issues & Solutions](#issues--solutions)
6. [Code Examples](#code-examples)
7. [Validation & Testing](#validation--testing)
8. [Production Checklist](#production-checklist)

---

## Architecture Overview

### Stack Components
- **Framework:** Vite + React 18 + TypeScript (or Next.js)
- **UI Library:** shadcn/ui + Radix UI primitives
- **Animations:** Framer Motion
- **i18n Core:** i18next v25.8.0
- **React Integration:** react-i18next v16.5.3
- **Detection:** i18next-browser-languagedetector v8.2.0
- **Loading:** i18next-resources-to-backend v1.2.1

### Design Principles
1. **Spanish-first UX** — Primary audience is Spanish-speaking, English is opt-in
2. **Bundled translations** — No HTTP requests, no FOUC (Flash of Untranslated Content)
3. **Synchronous initialization** — i18n loads before React renders
4. **Hierarchical keys** — `component.element.variant` pattern for maintainability
5. **TypeScript safety** — Translation key autocomplete via type augmentation
6. **Validation-first** — Pre-commit hooks prevent translation drift

### File Structure
```
src/
├── i18n/
│   └── config.ts              # i18next configuration
├── locales/
│   ├── en/
│   │   └── translation.json   # English translations
│   └── es/
│       └── translation.json   # Spanish translations
├── types/
│   └── i18next.d.ts           # TypeScript type augmentation
└── components/
    └── LanguageSwitcher.tsx   # EN/ES toggle component

scripts/
└── validate-translations.cjs  # Key parity validation (CommonJS)
```

---

## Prerequisites

### Required Packages
```bash
npm install i18next react-i18next i18next-browser-languagedetector i18next-resources-to-backend
```

---

## Key Patterns & Decisions

### Translation Key Structure

**✅ DO: Hierarchical by component**
```json
{
  navbar: {
    links: { home: Home }
  },
  hero: {
    title: Title,
    subtitle: Subtitle
  }
}
```

**❌ DON'T: Flat keys**
```json
{
  navbar_links_home: Home,
  hero_title: Title
}
```

### Array Handling

**✅ DO: Index-based keys**
```json
{
  items: {
    0: { title: First },
    1: { title: Second }
  }
}
```

**Component:**
```tsx
{Array.from({ length: 2 }).map((_, i) => (
  <div key={i}>{t(`items.${i}.title`)}</div>
))}
```

### Animation Re-triggering

**✅ DO: Use language-aware keys with animationKey prop**
```tsx
const { t, i18n } = useTranslation();

// For scroll-triggered animations (whileInView)
<ScrollReveal animationKey={i18n.language}>
  <h2>{t('title')}</h2>
</ScrollReveal>

// For regular motion elements
<motion.div key={`element-${i18n.language}`}>
  {t('content')}
</motion.div>
```

### Accordion State Preservation

**✅ DO: Key on content only**
```tsx
<div>  {/* No key - state persists */}
  <button onClick={toggle}>Toggle</button>
  <AnimatePresence>
    {isOpen && (
      <motion.div key={`content-${i18n.language}`}>
        {t('content')}
      </motion.div>
    )}
  </AnimatePresence>
</div>
```

### Multiline Content

**✅ DO: Use `\n` + CSS**
```json
{ text: Line 1\nLine 2 }
```
```tsx
<p className=whitespace-pre-line>{t('text')}</p>
```

---

## Critical Issue 1: Page Content Disappears After Language Toggle

**Problem:** After implementing language switcher and toggling between languages, only the Hero section and the top portion of the second section were visible.

**Root Cause:** Framer Motion's `whileInView` viewport animations were not re-triggering after language change.

**Solution:**

**Step 1:** Enhanced ScrollReveal to accept `animationKey` prop
```tsx
interface ScrollRevealProps {
  children: React.ReactNode;
  animationKey?: string;
}

export function ScrollReveal({ children, animationKey, ...props }: ScrollRevealProps) {
  return (
    <motion.div
      key={animationKey}
      initial=hidden
      whileInView=visible
      viewport={{ once: true, margin: -100px }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
```

**Step 2:** Pass `i18n.language` as animationKey in ALL section components
```tsx
export function Section() {
  const { t, i18n } = useTranslation();
  return (
    <ScrollReveal animationKey={i18n.language}>
      <h2>{t('section.title')}</h2>
    </ScrollReveal>
  );
}
```

---

## i18n Config (Next.js Adapted)

**`src/i18n/config.ts`**
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';

i18n
  .use(resourcesToBackend((language: string, namespace: string) =>
    import(`../locales/${language}/${namespace}.json`)
  ))
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ['en', 'es'],
    fallbackLng: (code) => {
      if (code && code.toLowerCase().startsWith('en')) {
        return ['en'];
      }
      return ['es']; // Spanish-first
    },
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
```

---

## LanguageSwitcher Component

```tsx
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className=px-3 py-1 rounded-lg bg-secondary/50 text-sm
    >
      {i18n.language === 'en' ? 'ES' : 'EN'}
    </button>
  );
}
```

---

## Validation Script

**`scripts/validate-translations.cjs`**
```javascript
const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/locales');
const LANGUAGES = ['es', 'en'];

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      keys = keys.concat(getKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

function validateTranslations() {
  console.log('Validating translation files...');
  
  const translations = LANGUAGES.map(lang => {
    const filePath = path.join(LOCALES_DIR, lang, 'translation.json');
    const content = fs.readFileSync(filePath, 'utf-8');
    return { lang, keys: getKeys(JSON.parse(content)) };
  });

  const [source, ...targets] = translations;
  let hasError = false;

  targets.forEach(target => {
    const missingInTarget = source.keys.filter(k => !target.keys.includes(k));
    const extraInTarget = target.keys.filter(k => !source.keys.includes(k));

    if (missingInTarget.length > 0 || extraInTarget.length > 0) {
      hasError = true;
      console.error(`Missing/extra keys in ${target.lang}`);
    }
  });

  if (hasError) process.exit(1);
  console.log('Validation PASSED');
}

validateTranslations();
```

---

## Production Checklist

- [ ] All translation keys validated
- [ ] Pre-commit hook installed
- [ ] All components migrated
- [ ] TypeScript builds without errors
- [ ] Spanish and English tested
- [ ] Language switcher functional
- [ ] Layouts validated on mobile/desktop
- [ ] Animations re-trigger on language change
- [ ] localStorage persistence working

---

**Implementation time estimate:** ~30-45 minutes for complete landing page
