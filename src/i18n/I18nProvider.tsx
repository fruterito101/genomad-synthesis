'use client';

import { useEffect, useState } from 'react';
import i18n from './config';
import { I18nextProvider } from 'react-i18next';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [isInitialized, setIsInitialized] = useState(i18n.isInitialized);

  useEffect(() => {
    if (!i18n.isInitialized) {
      i18n.on('initialized', () => {
        setIsInitialized(true);
      });
    }
  }, []);

  // Show children immediately with fallback - no blank screen
  // i18n will update the content once loaded
  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}
