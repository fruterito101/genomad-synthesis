import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations directly for synchronous loading
import esTranslation from '../locales/es/translation.json';
import enTranslation from '../locales/en/translation.json';

const resources = {
  es: { translation: esTranslation },
  en: { translation: enTranslation },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es', // Always start with Spanish - language detection happens in I18nProvider
    supportedLngs: ['en', 'es'],
    fallbackLng: 'es',
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
