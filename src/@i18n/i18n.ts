import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { localeResources } from './locales';
import { i18nConfig } from './core/config';

/**
 * Initialize i18n with comprehensive configuration and locale resources.
 * Uses centralized config for consistency and maintainability.
 */
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    ...i18nConfig,
    resources: localeResources, // Override resources with our locale data
  });

export default i18n;
