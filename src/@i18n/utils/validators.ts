import { isLanguageSupported } from './helpers';
import type { SupportedLanguageCode, TranslationNamespace } from '../types';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate language code
 */
export const validateLanguageCode = (languageCode: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!languageCode) {
    errors.push('Language code is required');
  } else if (typeof languageCode !== 'string') {
    errors.push('Language code must be a string');
  } else if (!isLanguageSupported(languageCode)) {
    errors.push(`Language code '${languageCode}' is not supported`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate translation namespace
 */
export const validateNamespace = (namespace: string): ValidationResult => {
  const errors: string[] = [];
  const validNamespaces: TranslationNamespace[] = [
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
  ];
  
  if (!namespace) {
    errors.push('Namespace is required');
  } else if (typeof namespace !== 'string') {
    errors.push('Namespace must be a string');
  } else if (!validNamespaces.includes(namespace as TranslationNamespace)) {
    errors.push(`Namespace '${namespace}' is not valid`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate translation key
 */
export const validateTranslationKey = (key: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!key) {
    errors.push('Translation key is required');
  } else if (typeof key !== 'string') {
    errors.push('Translation key must be a string');
  } else {
    // Check for invalid characters
    if (key.includes('..')) {
      errors.push('Translation key cannot contain consecutive dots');
    }
    
    // Check key format
    if (!/^[a-zA-Z0-9_:\-.]+$/.test(key)) {
      errors.push('Translation key contains invalid characters');
    }
    
    // Check length
    if (key.length > 200) {
      errors.push('Translation key is too long (max 200 characters)');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate translation value
 */
export const validateTranslationValue = (value: any): ValidationResult => {
  const errors: string[] = [];
  
  if (value === null || value === undefined) {
    errors.push('Translation value cannot be null or undefined');
  } else if (typeof value !== 'string' && typeof value !== 'object') {
    errors.push('Translation value must be a string or object');
  } else if (typeof value === 'string') {
    // Check for empty strings
    if (value.trim().length === 0) {
      errors.push('Translation value cannot be empty');
    }
    
    // Check length
    if (value.length > 5000) {
      errors.push('Translation value is too long (max 5000 characters)');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate interpolation variables in translation string
 */
export const validateInterpolation = (
  template: string,
  variables: Record<string, any> = {}
): ValidationResult => {
  const errors: string[] = [];
  
  // Find all interpolation placeholders
  const placeholderRegex = /\{\{(\w+)\}\}/g;
  const matches = template.match(placeholderRegex);
  
  if (matches) {
    const requiredVars = matches.map(match => match.replace(/[{}]/g, ''));
    const providedVars = Object.keys(variables);
    
    // Check for missing variables
    const missingVars = requiredVars.filter(varName => !providedVars.includes(varName));
    if (missingVars.length > 0) {
      errors.push(`Missing interpolation variables: ${missingVars.join(', ')}`);
    }
    
    // Check for unused variables
    const unusedVars = providedVars.filter(varName => !requiredVars.includes(varName));
    if (unusedVars.length > 0) {
      errors.push(`Unused interpolation variables: ${unusedVars.join(', ')}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate complete translation object structure
 */
export const validateTranslationStructure = (
  translations: Record<string, any>,
  expectedKeys?: string[]
): ValidationResult => {
  const errors: string[] = [];
  
  if (!translations || typeof translations !== 'object') {
    errors.push('Translations must be provided as an object');
    return { isValid: false, errors };
  }
  
  // Check if all expected keys are present
  if (expectedKeys && expectedKeys.length > 0) {
    const missingKeys = expectedKeys.filter(key => !(key in translations));
    if (missingKeys.length > 0) {
      errors.push(`Missing required translation keys: ${missingKeys.join(', ')}`);
    }
  }
  
  // Validate each translation value
  for (const [key, value] of Object.entries(translations)) {
    const keyValidation = validateTranslationKey(key);
    if (!keyValidation.isValid) {
      errors.push(`Invalid key '${key}': ${keyValidation.errors.join(', ')}`);
    }
    
    const valueValidation = validateTranslationValue(value);
    if (!valueValidation.isValid) {
      errors.push(`Invalid value for key '${key}': ${valueValidation.errors.join(', ')}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};