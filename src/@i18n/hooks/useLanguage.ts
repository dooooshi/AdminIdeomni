import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { LANGUAGE_CODES, SUPPORTED_LANGUAGES, LanguageDirection } from '../core/constants';

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
    availableLanguages: LANGUAGE_CODES,
    changeLanguage,
    isReady: i18n.isInitialized,
  };
};

/**
 * Hook for language direction (RTL/LTR)
 */
export const useLanguageDirection = () => {
  const { i18n } = useTranslation();
  
  // Check if current language is RTL based on constants
  const currentLangInfo = SUPPORTED_LANGUAGES[i18n.language as keyof typeof SUPPORTED_LANGUAGES];
  const direction: LanguageDirection = currentLangInfo?.direction || 'ltr';
  const isRtl = direction === 'rtl';
  
  return {
    direction,
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
    const currentIndex = LANGUAGE_CODES.indexOf(currentLang as any);
    const nextIndex = (currentIndex + 1) % LANGUAGE_CODES.length;
    const newLang = LANGUAGE_CODES[nextIndex];
    return i18n.changeLanguage(newLang);
  }, [i18n]);
  
  return {
    currentLanguage: i18n.language,
    switchLanguage,
    canSwitch: true,
  };
};