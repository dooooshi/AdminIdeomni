/**
 * Enhanced i18n initialization with development features
 */

import i18n from '../i18n';
import { localeResources } from '../locales';
import { validateAllTranslations } from '../utils/development';
import { SUPPORTED_LANGUAGES } from './constants';
import type { SupportedLanguageCode } from '../types';

/**
 * Initialize i18n with enhanced development features
 */
export const initializeI18n = async (options?: {
  enableValidation?: boolean;
  enableDebugging?: boolean;
  defaultLanguage?: SupportedLanguageCode;
}): Promise<void> => {
  const {
    enableValidation = process.env.NODE_ENV === 'development',
    enableDebugging = process.env.NODE_ENV === 'development',
    defaultLanguage,
  } = options || {};

  try {
    // Set default language if provided
    if (defaultLanguage && defaultLanguage !== i18n.language) {
      await i18n.changeLanguage(defaultLanguage);
    }

    // Development-only validation
    if (enableValidation) {
      console.log('🌍 Validating i18n setup...');
      
      // Validate translation completeness
      validateAllTranslations(localeResources as any);
      
      // Log supported languages
      console.group('🌐 Supported Languages');
      Object.entries(SUPPORTED_LANGUAGES).forEach(([code, info]) => {
        console.log(`${info.flag} ${code}: ${info.nativeName} (${info.name})`);
      });
      console.groupEnd();
    }

    // Development debugging
    if (enableDebugging) {
      // Log missing translation keys
      i18n.on('missingKey', (lng, namespace, key, res) => {
        console.warn(`🔍 Missing translation: ${lng}.${namespace}.${key}`);
      });

      // Log language changes
      i18n.on('languageChanged', (lng) => {
        console.log(`🌍 Language changed to: ${lng}`);
      });

      // Log resource loading
      i18n.on('loaded', (loaded) => {
        console.log('📦 i18n resources loaded:', Object.keys(loaded));
      });
    }

    console.log(`✅ i18n initialized successfully with language: ${i18n.language}`);
    
  } catch (error) {
    console.error('❌ Failed to initialize i18n:', error);
    throw error;
  }
};

/**
 * Get current i18n status
 */
export const getI18nStatus = () => {
  return {
    isInitialized: i18n.isInitialized,
    currentLanguage: i18n.language,
    resolvedLanguage: i18n.resolvedLanguage,
    loadedNamespaces: i18n.reportNamespaces?.getUsedNamespaces() || [],
    loadedLanguages: Object.keys(i18n.store.data),
    hasResourceBundle: (lng: string, ns?: string) => i18n.hasResourceBundle(lng, ns || 'translation'),
  };
};

/**
 * Preload additional languages
 */
export const preloadLanguages = async (languages: SupportedLanguageCode[]): Promise<void> => {
  const promises = languages.map(lang => i18n.loadLanguages(lang));
  await Promise.all(promises);
  console.log(`📦 Preloaded languages: ${languages.join(', ')}`);
};

/**
 * Preload additional namespaces
 */
export const preloadNamespaces = async (namespaces: string[]): Promise<void> => {
  await i18n.loadNamespaces(namespaces);
  console.log(`📁 Preloaded namespaces: ${namespaces.join(', ')}`);
};

/**
 * Hot reload translations (development only)
 */
export const hotReloadTranslations = async (
  language: SupportedLanguageCode,
  namespace: string,
  translations: Record<string, any>
): Promise<void> => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('Hot reload is only available in development mode');
    return;
  }

  try {
    // Add new resource bundle
    i18n.addResourceBundle(language, namespace, translations, true, true);
    
    console.log(`🔥 Hot reloaded ${language}.${namespace}`);
    
    // Trigger re-render by emitting languageChanged event
    i18n.emit('languageChanged', i18n.language);
    
  } catch (error) {
    console.error(`❌ Failed to hot reload ${language}.${namespace}:`, error);
  }
};

/**
 * Reset i18n to initial state
 */
export const resetI18n = async (): Promise<void> => {
  // Clear all resource bundles
  Object.keys(i18n.store.data).forEach(lang => {
    Object.keys(i18n.store.data[lang]).forEach(ns => {
      i18n.removeResourceBundle(lang, ns);
    });
  });

  // Reinitialize
  await initializeI18n();
  console.log('🔄 i18n reset and reinitialized');
};

/**
 * Export current translations as JSON (development helper)
 */
export const exportTranslations = (
  language: SupportedLanguageCode,
  namespace?: string
): Record<string, any> => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('Export translations is only available in development mode');
    return {};
  }

  try {
    if (namespace) {
      return i18n.getResourceBundle(language, namespace) || {};
    } else {
      return i18n.store.data[language] || {};
    }
  } catch (error) {
    console.error(`❌ Failed to export translations for ${language}:`, error);
    return {};
  }
};

// Auto-initialize if in browser environment
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Delay initialization to ensure all modules are loaded
  setTimeout(() => {
    if (!i18n.isInitialized) {
      initializeI18n().catch(console.error);
    }
  }, 100);
}