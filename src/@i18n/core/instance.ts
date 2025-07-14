import i18n from '../i18n';

// Re-export the configured i18n instance as default
export default i18n;

// Export individual methods for easier access
export const changeLanguage = (lng: string) => i18n.changeLanguage(lng);
export const loadNamespace = (ns: string | string[]) => i18n.loadNamespaces(ns);
export const hasTranslation = (key: string, options?: any) => i18n.exists(key, options);
export const getLoadedNamespaces = () => i18n.reportNamespaces.getUsedNamespaces();
export const getCurrentLanguageInfo = () => ({
  language: i18n.language,
  languages: i18n.languages,
  resolvedLanguage: i18n.resolvedLanguage
});
export const isLanguageSupported = (lng: string) => i18n.hasResourceBundle(lng, 'translation');
export const getSupportedLanguages = () => Object.keys(i18n.store.data);
export const addEventListener = (event: string, callback: (...args: any[]) => void) => i18n.on(event, callback);
export const removeEventListener = (event: string, callback: (...args: any[]) => void) => i18n.off(event, callback);
export const getTranslation = (key: string, options?: any) => i18n.t(key, options); 