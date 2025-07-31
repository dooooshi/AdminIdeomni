/**
 * Supported languages
 */
export const SUPPORTED_LANGUAGES = {
  'en-US': {
    code: 'en-US',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr' as const,
  },
  'zh-CN': {
    code: 'zh-CN',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    flag: '🇨🇳',
    direction: 'ltr' as const,
  },
} as const;

/**
 * Default language
 */
export const DEFAULT_LANGUAGE = 'zh-CN';

/**
 * Fallback language
 */
export const FALLBACK_LANGUAGE = 'en-US';

/**
 * Available language codes
 */
export const LANGUAGE_CODES = Object.keys(SUPPORTED_LANGUAGES) as Array<keyof typeof SUPPORTED_LANGUAGES>;

/**
 * Translation namespaces
 */
export const NAMESPACES = {
  COMMON: 'common',
  AUTH: 'auth',
  NAVIGATION: 'navigation',
  LAND_MANAGEMENT: 'landManagement',
  FACILITY_MANAGEMENT: 'facilityManagement',
  TEAM_MANAGEMENT: 'teamManagement',
  USER_MANAGEMENT: 'userManagement',
  ADMIN_MANAGEMENT: 'adminManagement',
  MAP: 'map',
  ACTIVITY: 'activity',
  ACTIVITY_MANAGEMENT: 'activityManagement',
  TEAM_ACCOUNTS: 'teamAccounts',
  TEAM_ADMINISTRATION: 'teamAdministration',
} as const;

/**
 * Common translation keys
 */
export const COMMON_KEYS = {
  // Actions
  SAVE: 'SAVE',
  CANCEL: 'CANCEL',
  DELETE: 'DELETE',
  EDIT: 'EDIT',
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  SUBMIT: 'SUBMIT',
  RESET: 'RESET',
  SEARCH: 'SEARCH',
  FILTER: 'FILTER',
  SORT: 'SORT',
  REFRESH: 'REFRESH',
  RETRY: 'RETRY',
  
  // Status
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  WARNING: 'WARNING',
  INFO: 'INFO',
  
  // Navigation
  BACK: 'BACK',
  NEXT: 'NEXT',
  PREVIOUS: 'PREVIOUS',
  HOME: 'HOME',
  
  // Common labels
  NAME: 'NAME',
  DESCRIPTION: 'DESCRIPTION',
  DATE: 'DATE',
  TIME: 'TIME',
  STATUS: 'STATUS',
  TYPE: 'TYPE',
  CATEGORY: 'CATEGORY',
  AMOUNT: 'AMOUNT',
  TOTAL: 'TOTAL',
  
  // Boolean values
  YES: 'YES',
  NO: 'NO',
  TRUE: 'TRUE',
  FALSE: 'FALSE',
  ENABLED: 'ENABLED',
  DISABLED: 'DISABLED',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;