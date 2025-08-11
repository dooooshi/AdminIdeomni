import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { enTranslations } from './translations/en';
import { zhTranslations } from './translations/zh';

// Create namespace from translations
const createNamespace = (translations: any, prefix: string) => {
  const keys: any = {};
  Object.keys(translations).forEach(key => {
    if (key.startsWith(`${prefix}.`)) {
      const nsKey = key.replace(`${prefix}.`, '');
      keys[nsKey] = translations[key];
    }
  });
  return keys;
};

// Create all namespaces
const createAllNamespaces = (translations: any) => {
  const namespaces = [
    'navigation',
    'teamManagement', 
    'teamAccounts',
    'teamAdministration',
    'activityManagement',
    'adminManagement',
    'userManagement',
    'facilityManagement',
    'landManagement',
    'auth',
    'activity',
    'map',
    'common'
  ];
  
  const result: any = {};
  namespaces.forEach(ns => {
    result[ns] = createNamespace(translations, ns);
  });
  return result;
};

const resources = {
  'en-US': { 
    translation: enTranslations,
    ...createAllNamespaces(enTranslations)
  },
  'zh-CN': { 
    translation: zhTranslations,
    ...createAllNamespaces(zhTranslations)
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh-CN',
    fallbackLng: 'en-US',
    
    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'language',
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;