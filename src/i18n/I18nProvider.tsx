'use client';

import { useEffect, useState } from 'react';
import i18n from './config';
import { I18nextProvider } from 'react-i18next';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Detect language on client mount
    const stored = localStorage.getItem('i18nextLng');
    if (stored && ['es', 'en'].includes(stored) && stored !== i18n.language) {
      i18n.changeLanguage(stored);
    } else if (!stored) {
      // Check browser language
      const browserLang = navigator.language?.split('-')[0];
      if (browserLang && ['es', 'en'].includes(browserLang) && browserLang !== i18n.language) {
        i18n.changeLanguage(browserLang);
      }
    }
  }, []);

  // During SSR and initial render, use default language
  // This ensures server and client render the same content initially
  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}
