import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';

// Helper to access flat-keyed translations
const getNestedTranslation = (translations: Record<string, any>, key: string): string | undefined => {
  return translations[key];
};


export const useLocalization = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LanguageProvider');
  }

  const t = (key: string, replacements: Record<string, string | number> = {}): string => {
    let translation = getNestedTranslation(context.translations, key);

    if (translation === undefined) {
      console.warn(`Translation key not found: ${key}`);
      translation = key;
    }

    Object.keys(replacements).forEach(placeholder => {
      const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
      translation = (translation as string).replace(regex, String(replacements[placeholder]));
    });

    return translation;
  };

  return { t, setLocale: context.setLocale, locale: context.locale };
};