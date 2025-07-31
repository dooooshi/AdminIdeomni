import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, FALLBACK_LANGUAGE } from '../core/constants';
import type { SupportedLanguageCode, LanguageInfo } from '../types';

/**
 * Check if a language code is supported
 */
export const isLanguageSupported = (languageCode: string): languageCode is SupportedLanguageCode => {
  return languageCode in SUPPORTED_LANGUAGES;
};

/**
 * Get language information by code
 */
export const getLanguageInfo = (languageCode: string): LanguageInfo | null => {
  if (!isLanguageSupported(languageCode)) {
    return null;
  }
  return SUPPORTED_LANGUAGES[languageCode];
};

/**
 * Get all supported languages
 */
export const getSupportedLanguages = (): LanguageInfo[] => {
  return Object.values(SUPPORTED_LANGUAGES);
};

/**
 * Get language codes only
 */
export const getSupportedLanguageCodes = (): SupportedLanguageCode[] => {
  return Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguageCode[];
};

/**
 * Normalize language code (handle variations like en, en-us, en_US)
 */
export const normalizeLanguageCode = (languageCode: string): SupportedLanguageCode => {
  const normalized = languageCode.toLowerCase().replace('_', '-');
  
  // Handle common variations
  if (normalized === 'en' || normalized === 'en-us') {
    return 'en-US';
  }
  if (normalized === 'zh' || normalized === 'zh-cn' || normalized === 'zh-hans') {
    return 'zh-CN';
  }
  
  // If exact match found
  if (isLanguageSupported(languageCode)) {
    return languageCode as SupportedLanguageCode;
  }
  
  // Default fallback
  return DEFAULT_LANGUAGE as SupportedLanguageCode;
};

/**
 * Detect browser language preference
 */
export const detectBrowserLanguage = (): SupportedLanguageCode => {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE as SupportedLanguageCode;
  }
  
  const browserLang = navigator.language || 
                     (navigator as any).userLanguage || 
                     (navigator.languages && navigator.languages[0]);
  
  if (browserLang) {
    return normalizeLanguageCode(browserLang);
  }
  
  return DEFAULT_LANGUAGE as SupportedLanguageCode;
};

/**
 * Get fallback language for a given language
 */
export const getFallbackLanguage = (languageCode: string): SupportedLanguageCode => {
  // If it's already the fallback language, don't change it
  if (languageCode === FALLBACK_LANGUAGE) {
    return FALLBACK_LANGUAGE as SupportedLanguageCode;
  }
  
  return FALLBACK_LANGUAGE as SupportedLanguageCode;
};

/**
 * Check if language uses RTL text direction
 */
export const isRtlLanguage = (languageCode: string): boolean => {
  const langInfo = getLanguageInfo(languageCode);
  return langInfo?.direction === 'rtl';
};

/**
 * Get localized language name
 */
export const getLocalizedLanguageName = (
  languageCode: string, 
  displayLanguage: string = languageCode
): string => {
  const langInfo = getLanguageInfo(languageCode);
  if (!langInfo) {
    return languageCode;
  }
  
  // If displaying in the same language, use native name
  if (languageCode === displayLanguage) {
    return langInfo.nativeName;
  }
  
  // Otherwise use the localized name
  return langInfo.name;
};

/**
 * Build translation key with namespace
 */
export const buildTranslationKey = (namespace: string, key: string): string => {
  return `${namespace}:${key}`;
};

/**
 * Parse translation key to extract namespace and key
 */
export const parseTranslationKey = (fullKey: string): { namespace?: string; key: string } => {
  const parts = fullKey.split(':');
  if (parts.length === 2) {
    return { namespace: parts[0], key: parts[1] };
  }
  return { key: fullKey };
};

/**
 * Check if translation key has namespace
 */
export const hasNamespace = (key: string): boolean => {
  return key.includes(':');
};

/**
 * Pluralize translation key based on count
 */
export const pluralizeKey = (baseKey: string, count: number): string => {
  if (count === 1) {
    return baseKey;
  }
  return `${baseKey}_plural`;
};