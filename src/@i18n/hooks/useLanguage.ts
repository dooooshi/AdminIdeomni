import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

/**
 * Hook for language management
 */
export const useLanguage = () => {
  const { i18n } = useTranslation();
  
  const changeLanguage = useCallback((language: string) => {
    return i18n.changeLanguage(language);
  }, [i18n]);
  
  return {
    currentLanguage: i18n.language,
    availableLanguages: ['en-US', 'zh-CN'],
    changeLanguage,
    isReady: i18n.isInitialized,
  };
};

/**
 * Hook for language direction (RTL/LTR)
 */
export const useLanguageDirection = () => {
  const { i18n } = useTranslation();
  
  // Most languages are LTR, add RTL languages as needed
  const rtlLanguages = ['ar', 'he', 'fa'];
  const isRtl = rtlLanguages.includes(i18n.language);
  
  return {
    direction: isRtl ? 'rtl' : 'ltr',
    isRtl,
    isLtr: !isRtl,
  };
};

/**
 * Hook to get the current language code
 */
export const useLanguageCode = () => {
  const { i18n } = useTranslation();
  return i18n.language;
};

/**
 * Hook for language switching functionality
 */
export const useLanguageSwitcher = () => {
  const { i18n } = useTranslation();
  
  const switchLanguage = useCallback(() => {
    const currentLang = i18n.language;
    const newLang = currentLang === 'en-US' ? 'zh-CN' : 'en-US';
    return i18n.changeLanguage(newLang);
  }, [i18n]);
  
  return {
    currentLanguage: i18n.language,
    switchLanguage,
    canSwitch: true,
  };
};