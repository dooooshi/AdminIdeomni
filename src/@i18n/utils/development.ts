/**
 * Development utilities for i18n
 * These utilities should only be used in development mode
 */

import { SUPPORTED_LANGUAGES, LANGUAGE_CODES } from '../core/constants';
import type { SupportedLanguageCode } from '../types';

/**
 * Interface for missing translation report
 */
export interface MissingTranslationReport {
  language: SupportedLanguageCode;
  namespace: string;
  missingKeys: string[];
  totalKeys: number;
  completionPercentage: number;
}

/**
 * Interface for translation coverage report
 */
export interface TranslationCoverageReport {
  totalNamespaces: number;
  languages: Record<SupportedLanguageCode, {
    totalKeys: number;
    translatedKeys: number;
    missingKeys: string[];
    completionPercentage: number;
    namespaces: Record<string, {
      totalKeys: number;
      translatedKeys: number;
      missingKeys: string[];
      completionPercentage: number;
    }>;
  }>;
  overall: {
    bestLanguage: SupportedLanguageCode;
    worstLanguage: SupportedLanguageCode;
    averageCompletion: number;
  };
}

/**
 * Check for missing translations in a namespace
 */
export const checkMissingTranslations = (
  baseTranslations: Record<string, any>,
  targetTranslations: Record<string, any>,
  namespace: string = 'unknown'
): string[] => {
  const missing: string[] = [];

  const checkKeys = (base: Record<string, any>, target: Record<string, any>, prefix = '') => {
    for (const [key, value] of Object.entries(base)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null) {
        if (!target[key] || typeof target[key] !== 'object') {
          missing.push(fullKey);
        } else {
          checkKeys(value, target[key], fullKey);
        }
      } else {
        if (!(key in target) || target[key] === '' || target[key] == null) {
          missing.push(fullKey);
        }
      }
    }
  };

  checkKeys(baseTranslations, targetTranslations);
  return missing;
};

/**
 * Generate a comprehensive translation coverage report
 */
export const generateCoverageReport = (
  allTranslations: Record<SupportedLanguageCode, Record<string, Record<string, any>>>
): TranslationCoverageReport => {
  const baseLanguage: SupportedLanguageCode = 'en-US';
  const baseTranslations = allTranslations[baseLanguage];
  
  if (!baseTranslations) {
    throw new Error(`Base language ${baseLanguage} translations not found`);
  }

  const report: TranslationCoverageReport = {
    totalNamespaces: Object.keys(baseTranslations).length,
    languages: {} as any,
    overall: {
      bestLanguage: baseLanguage,
      worstLanguage: baseLanguage,
      averageCompletion: 0,
    },
  };

  // Analyze each language
  for (const langCode of LANGUAGE_CODES) {
    const langTranslations = allTranslations[langCode] || {};
    
    report.languages[langCode] = {
      totalKeys: 0,
      translatedKeys: 0,
      missingKeys: [],
      completionPercentage: 0,
      namespaces: {},
    };

    // Analyze each namespace
    for (const [namespace, baseNsTranslations] of Object.entries(baseTranslations)) {
      const targetNsTranslations = langTranslations[namespace] || {};
      const missingKeys = checkMissingTranslations(baseNsTranslations, targetNsTranslations, namespace);
      
      const totalKeys = countKeys(baseNsTranslations);
      const translatedKeys = totalKeys - missingKeys.length;
      const completionPercentage = totalKeys > 0 ? (translatedKeys / totalKeys) * 100 : 100;

      report.languages[langCode].namespaces[namespace] = {
        totalKeys,
        translatedKeys,
        missingKeys,
        completionPercentage,
      };

      // Update language totals
      report.languages[langCode].totalKeys += totalKeys;
      report.languages[langCode].translatedKeys += translatedKeys;
      report.languages[langCode].missingKeys.push(...missingKeys);
    }

    // Calculate language completion percentage
    const langData = report.languages[langCode];
    langData.completionPercentage = langData.totalKeys > 0 
      ? (langData.translatedKeys / langData.totalKeys) * 100 
      : 100;
  }

  // Calculate overall statistics
  const completionPercentages = LANGUAGE_CODES.map(lang => report.languages[lang].completionPercentage);
  report.overall.averageCompletion = completionPercentages.reduce((sum, pct) => sum + pct, 0) / completionPercentages.length;
  
  report.overall.bestLanguage = LANGUAGE_CODES.reduce((best, current) => 
    report.languages[current].completionPercentage > report.languages[best].completionPercentage ? current : best
  );
  
  report.overall.worstLanguage = LANGUAGE_CODES.reduce((worst, current) => 
    report.languages[current].completionPercentage < report.languages[worst].completionPercentage ? current : worst
  );

  return report;
};

/**
 * Count total keys in a translation object (recursive)
 */
const countKeys = (obj: Record<string, any>): number => {
  let count = 0;
  
  for (const value of Object.values(obj)) {
    if (typeof value === 'object' && value !== null) {
      count += countKeys(value);
    } else {
      count++;
    }
  }
  
  return count;
};

/**
 * Log missing translations to console (development only)
 */
export const logMissingTranslations = (report: TranslationCoverageReport): void => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  console.group('🌍 Translation Coverage Report');
  
  console.log(`📊 Overall completion: ${report.overall.averageCompletion.toFixed(1)}%`);
  console.log(`🥇 Best language: ${report.overall.bestLanguage} (${report.languages[report.overall.bestLanguage].completionPercentage.toFixed(1)}%)`);
  console.log(`🥉 Worst language: ${report.overall.worstLanguage} (${report.languages[report.overall.worstLanguage].completionPercentage.toFixed(1)}%)`);
  
  for (const [langCode, langData] of Object.entries(report.languages)) {
    if (langData.missingKeys.length > 0) {
      console.group(`❌ Missing translations for ${langCode} (${langData.completionPercentage.toFixed(1)}% complete)`);
      console.log(`Missing ${langData.missingKeys.length} out of ${langData.totalKeys} keys:`);
      
      // Group by namespace
      const byNamespace: Record<string, string[]> = {};
      for (const key of langData.missingKeys) {
        const [namespace] = key.split('.');
        if (!byNamespace[namespace]) byNamespace[namespace] = [];
        byNamespace[namespace].push(key);
      }
      
      for (const [namespace, keys] of Object.entries(byNamespace)) {
        console.group(`📁 ${namespace}`);
        keys.forEach(key => console.log(`  • ${key}`));
        console.groupEnd();
      }
      
      console.groupEnd();
    }
  }
  
  console.groupEnd();
};

/**
 * Validate all translations and log issues (development only)
 */
export const validateAllTranslations = (
  allTranslations: Record<SupportedLanguageCode, Record<string, Record<string, any>>>
): void => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  console.group('🔍 Translation Validation');

  try {
    const report = generateCoverageReport(allTranslations);
    logMissingTranslations(report);
    
    // Additional validation checks
    const issues: string[] = [];
    
    // Check for empty translations
    for (const [langCode, langData] of Object.entries(allTranslations)) {
      for (const [namespace, nsData] of Object.entries(langData)) {
        checkForEmptyValues(nsData, `${langCode}.${namespace}`, issues);
      }
    }
    
    if (issues.length > 0) {
      console.group('⚠️ Translation Issues');
      issues.forEach(issue => console.warn(issue));
      console.groupEnd();
    }
    
    console.log('✅ Translation validation complete');
    
  } catch (error) {
    console.error('❌ Translation validation failed:', error);
  }
  
  console.groupEnd();
};

/**
 * Check for empty or invalid translation values
 */
const checkForEmptyValues = (obj: Record<string, any>, path: string, issues: string[]): void => {
  for (const [key, value] of Object.entries(obj)) {
    const fullPath = `${path}.${key}`;
    
    if (typeof value === 'object' && value !== null) {
      checkForEmptyValues(value, fullPath, issues);
    } else if (typeof value === 'string') {
      if (value.trim() === '') {
        issues.push(`Empty translation: ${fullPath}`);
      } else if (value === key) {
        issues.push(`Translation equals key (possibly untranslated): ${fullPath}`);
      }
    } else if (value == null) {
      issues.push(`Null/undefined translation: ${fullPath}`);
    }
  }
};