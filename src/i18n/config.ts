import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations directly for synchronous loading
import esTranslation from '../locales/es/translation.json';
import enTranslation from '../locales/en/translation.json';

const resources = {
  es: { translation: esTranslation },
  en: { translation: enTranslation },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: ['en', 'es'],
    fallbackLng: 'es', // Spanish-first (Mexico audience)
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    react: {
      useSuspense: false, // Prevent suspense issues
    },
  });

export default i18n;
