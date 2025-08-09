import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { SUPPORTED_LANGUAGES, LANGUAGE_CODES } from '../core/constants';

// Language types for compatibility
export type LanguageType = {
  id: string;
  title: string;
  flag: string;
};

// Convert constants to legacy format for backward compatibility
const languages: LanguageType[] = LANGUAGE_CODES.map(code => ({
  id: code,
  title: SUPPORTED_LANGUAGES[code].nativeName,
  flag: SUPPORTED_LANGUAGES[code].flag,
}));

/**
 * Enhanced useI18n hook that provides additional functionality
 * with backward compatibility for legacy components
 */
export const useI18n = () => {
  const { i18n, t } = useTranslation();
  
  // Find current language object for compatibility
  const currentLanguage = languages.find(lang => lang.id === i18n.language) || languages[0];
  
  return {
    // Core functionality
    i18n,
    t,
    
    // Language management
    changeLanguage: (lng: string) => i18n.changeLanguage(lng),
    currentLanguage: i18n.language,
    
    // Legacy compatibility properties
    language: currentLanguage,
    languages,
    languageId: i18n.language,
    langDirection: i18n.dir() as 'ltr' | 'rtl',
    
    // Utility functions
    isReady: i18n.isInitialized,
    hasTranslation: (key: string) => i18n.exists(key),
  };
};

// Legacy useI18nLegacy hook removed - no longer needed


export default useI18n;