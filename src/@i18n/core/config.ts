import type { InitOptions } from 'i18next';

/**
 * i18n configuration options
 */
export const i18nConfig: InitOptions = {
  // Default language
  lng: 'zh-CN',
  
  // Fallback language
  fallbackLng: 'en-US',
  
  // Debug mode (disable in production)
  debug: process.env.NODE_ENV === 'development',
  
  // Interpolation options
  interpolation: {
    escapeValue: false, // React already does escaping
  },
  
  // Key separator (disabled to support keys like 'button.save')
  keySeparator: false,
  
  // Namespace separator
  nsSeparator: ':',
  
  // Default namespace
  defaultNS: 'common',
  
  // Available namespaces
  ns: [
    'common',
    'auth',
    'navigation',
    'landManagement',
    'facilityManagement',
    'teamManagement',
    'userManagement',
    'adminManagement',
    'map',
    'activity',
    'activityManagement',
    'teamAccounts',
    'teamAdministration',
  ],
  
  // Backend options (if using i18next-http-backend)
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
  },
  
  // Detection options (if using i18next-browser-languagedetector)
  detection: {
    order: ['localStorage', 'navigator', 'htmlTag'],
    caches: ['localStorage'],
    lookupLocalStorage: 'i18nextLng',
  },
  
  // React options
  react: {
    useSuspense: false,
  },
};