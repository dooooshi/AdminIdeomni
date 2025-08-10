/**
 * Language utilities for HTTP headers
 * Provides a consistent way to get the current language for Accept-Language headers
 */

// Helper function to get current language for Accept-Language header
export const getCurrentLanguage = (): string => {
  // Always return default for server-side rendering
  if (typeof window === 'undefined') {
    return 'en';
  }
  
  // Client-side only logic
  try {
    // Try to get language from i18next instance first (most accurate)
    // Use dynamic import to avoid SSR issues
    const i18nInstance = (window as any).__i18nInstance;
    if (i18nInstance && i18nInstance.language) {
      return i18nInstance.language;
    }
    
    // If no global instance, try to access it safely
    try {
      const i18n = require('../i18n').default;
      if (i18n && i18n.language) {
        // Store reference for future use
        (window as any).__i18nInstance = i18n;
        return i18n.language;
      }
    } catch (requireError) {
      // Ignore require errors on client side
    }
  } catch (error) {
    // Fallback if i18n is not available (don't log in production to avoid noise)
    if (process.env.NODE_ENV === 'development') {
      console.warn('Could not access i18n instance for language detection:', error);
    }
  }
  
  // Check localStorage as fallback
  const storedLang = localStorage.getItem('i18nextLng');
  if (storedLang) return storedLang;
  
  // Fall back to browser language
  return navigator.language.split('-')[0] || 'en';
};

/**
 * Get Accept-Language header value in the standard format
 * Converts language codes to proper format (e.g., 'zh-CN' stays as 'zh-CN', 'en' becomes 'en-US')
 */
export const getAcceptLanguageHeader = (): string => {
  const currentLang = getCurrentLanguage();
  
  // Map common language codes to full locale codes
  const languageMap: Record<string, string> = {
    'en': 'en-US',
    'zh': 'zh-CN',
    'zh-CN': 'zh-CN',
    'en-US': 'en-US',
  };
  
  return languageMap[currentLang] || currentLang;
};

/**
 * Create headers object with Accept-Language header
 * Useful for fetch calls or other HTTP clients
 */
export const createLanguageHeaders = (additionalHeaders: Record<string, string> = {}): Record<string, string> => {
  return {
    'Accept-Language': getAcceptLanguageHeader(),
    ...additionalHeaders,
  };
}; 