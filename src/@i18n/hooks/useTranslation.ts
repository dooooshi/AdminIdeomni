import { useTranslation as useReactI18nextTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

/**
 * Enhanced useTranslation hook with namespace support
 */
export const useTranslation = (ns?: string | string[]) => {
  return useReactI18nextTranslation(ns);
};

/**
 * Common translation hook for shared strings
 */
export const useCommonTranslation = () => {
  return useReactI18nextTranslation('common');
};

/**
 * Auth-specific translation hook
 */
export const useAuthTranslation = () => {
  return useReactI18nextTranslation('auth');
};

/**
 * Navigation-specific translation hook
 */
export const useNavigationTranslation = () => {
  return useReactI18nextTranslation('navigation');
};

/**
 * Map-specific translation hook
 */
export const useMapTranslation = () => {
  return useReactI18nextTranslation('map');
};

/**
 * Hook for using multiple translation namespaces
 */
export const useMultipleTranslations = (namespaces: string[]) => {
  return useReactI18nextTranslation(namespaces);
};

/**
 * Simple translate function for components that don't need the full hook
 */
export const translate = (key: string, ns?: string): string => {
  const { t } = useReactI18nextTranslation(ns);
  return t(key);
};