import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

/**
 * Enhanced useI18n hook that provides additional functionality
 */
export const useI18n = () => {
  const { i18n, t } = useTranslation();
  
  return {
    // Core functionality
    i18n,
    t,
    
    // Language management
    changeLanguage: (lng: string) => i18n.changeLanguage(lng),
    currentLanguage: i18n.language,
    
    // Utility functions
    isReady: i18n.isInitialized,
    hasTranslation: (key: string) => i18n.exists(key),
  };
};

/**
 * Legacy useI18n hook for backward compatibility
 */
export const useI18nLegacy = (): { t: TFunction; i18n: typeof import('i18next') } => {
  const { i18n, t } = useTranslation();
  return { t, i18n };
};

export default useI18n;