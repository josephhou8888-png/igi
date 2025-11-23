import React, { createContext, useState, ReactNode, useMemo } from 'react';
import { locales } from '../locales';

type Locale = keyof typeof locales;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: string) => void;
  translations: Record<string, any>;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>('en');

  const value = useMemo(() => ({
    locale,
    setLocale: (newLocale: string) => {
        if (Object.keys(locales).includes(newLocale)) {
            setLocale(newLocale as Locale);
        }
    },
    translations: locales[locale].translations,
  }), [locale]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
