// Core exports
export { default as i18nInstance } from './core/instance';
export { i18nConfig } from './core/config';
export * from './core/constants';

// Type exports
export * from './types';

// Hook exports (Primary i18n hooks)
export { useI18n } from './hooks/useI18n';
export type { LanguageType } from './hooks/useI18n';
export { 
  useTranslation,
  useCommonTranslation,
  useAuthTranslation,
  useNavigationTranslation,
  useMapTranslation,
  useMultipleTranslations,
  translate
} from './hooks/useTranslation';
export { 
  useLanguage,
  useLanguageDirection,
  useLanguageCode,
  useLanguageSwitcher
} from './hooks/useLanguage';

// Component exports
export { 
  TranslationProvider,
  useI18nContext,
  withTranslationProvider
} from './components/TranslationProvider';
export { 
  LanguageSwitcher,
  FlagLanguageSwitcher,
  CompactLanguageSwitcher
} from './components/LanguageSwitcher';

// Utility exports
export * from './utils/formatters';
export * from './utils/validators';
export * from './utils/helpers';

// Development utilities (only available in development)
export * from './utils/development';

// Locale exports
export { localeResources, enUS, zhCN } from './locales';

// Core functionality exports
export {
  changeLanguage,
  loadNamespace,
  hasTranslation,
  getLoadedNamespaces,
  getCurrentLanguageInfo,
  isLanguageSupported,
  getSupportedLanguages,
  addEventListener,
  removeEventListener,
  getTranslation
} from './core/instance';

// Enhanced initialization and development features
export {
  initializeI18n,
  getI18nStatus,
  preloadLanguages,
  preloadNamespaces,
  hotReloadTranslations,
  resetI18n,
  exportTranslations
} from './core/initialization';

// Removed legacy exports - migration completed

// Default export for backward compatibility
export { default } from './core/instance';
