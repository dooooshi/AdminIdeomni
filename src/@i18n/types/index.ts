import type { TFunction } from 'i18next';
import type { LanguageDirection } from '../core/constants';

/**
 * Language information interface
 */
export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
}

/**
 * Translation function type
 */
export type TranslationFunction = TFunction;

// LanguageDirection is now imported from constants

/**
 * Supported language codes
 */
export type SupportedLanguageCode = 'en-US' | 'zh-CN';

/**
 * Translation namespace type
 */
export type TranslationNamespace = 
  | 'common'
  | 'auth'
  | 'navigation'
  | 'landManagement'
  | 'facilityManagement'
  | 'teamManagement'
  | 'userManagement'
  | 'adminManagement'
  | 'map'
  | 'activity'
  | 'activityManagement'
  | 'teamAccounts'
  | 'teamAdministration';

/**
 * Translation key type for better type safety
 */
export type TranslationKey<T extends string = string> = T;

/**
 * I18n hook return type
 */
export interface UseI18nReturn {
  t: TranslationFunction;
  i18n: any;
  currentLanguage: string;
  changeLanguage: (lng: string) => Promise<void>;
  isReady: boolean;
  hasTranslation: (key: string) => boolean;
}

/**
 * Language management hook return type  
 */
export interface UseLanguageReturn {
  currentLanguage: string;
  availableLanguages: string[];
  changeLanguage: (language: string) => Promise<void>;
  isReady: boolean;
}

/**
 * Language direction hook return type
 */
export interface UseLanguageDirectionReturn {
  direction: LanguageDirection;
  isRtl: boolean;
  isLtr: boolean;
}

/**
 * Language switcher hook return type
 */
export interface UseLanguageSwitcherReturn {
  currentLanguage: string;
  switchLanguage: () => Promise<void>;
  canSwitch: boolean;
}