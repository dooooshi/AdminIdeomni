/**
 * Test utilities for verifying Accept-Language headers are properly added to requests
 */

import apiClient from './api-client';
import { getCurrentLanguage, getAcceptLanguageHeader, createLanguageHeaders } from './language-utils';

/**
 * Test that language headers are correctly detected and formatted
 */
export function testLanguageDetection() {
  console.log('🧪 Testing Language Detection...');
  
  const currentLang = getCurrentLanguage();
  const acceptLangHeader = getAcceptLanguageHeader();
  
  // Safely get i18n instance
  let i18nLang = 'N/A';
  try {
    const i18n = require('../i18n').default;
    i18nLang = i18n.language || 'N/A';
  } catch (error) {
    i18nLang = 'Not available';
  }
  
  const storedLang = localStorage.getItem('i18nextLng');
  
  console.log('📋 Language Detection Results:', {
    'Current Language': currentLang,
    'Accept-Language Header': acceptLangHeader,
    'i18n Language': i18nLang,
    'Stored Language (localStorage)': storedLang,
    'Browser Language': navigator.language,
  });
  
  return {
    currentLang,
    acceptLangHeader,
    i18nLang,
    storedLang,
    browserLang: navigator.language,
  };
}

/**
 * Test that language headers are properly created
 */
export function testLanguageHeaders() {
  console.log('🧪 Testing Language Headers Creation...');
  
  const basicHeaders = createLanguageHeaders();
  const customHeaders = createLanguageHeaders({
    'Content-Type': 'application/json',
    'Custom-Header': 'test-value',
  });
  
  console.log('📋 Language Headers Results:', {
    'Basic Headers': basicHeaders,
    'Custom Headers': customHeaders,
  });
  
  return {
    basicHeaders,
    customHeaders,
  };
}

/**
 * Test that API requests include Accept-Language header
 * This makes a real request, so use carefully
 */
export async function testApiRequestLanguageHeader() {
  console.log('🧪 Testing API Request Language Header...');
  
  try {
    // Create a mock request to capture headers
    const originalRequest = apiClient.request;
    let capturedHeaders: any = null;
    
    // Temporarily override the request method to capture headers
    (apiClient as any).request = async (config: any) => {
      capturedHeaders = config.headers;
      // Don't actually make the request, just capture headers
      throw new Error('TEST_CANCELLED'); 
    };
    
    try {
      await apiClient.get('/test-endpoint');
    } catch (error: any) {
      if (error.message !== 'TEST_CANCELLED') {
        throw error;
      }
    }
    
    // Restore original method
    (apiClient as any).request = originalRequest;
    
    console.log('📋 Captured Request Headers:', capturedHeaders);
    
    const hasAcceptLanguage = capturedHeaders && capturedHeaders['Accept-Language'];
    const acceptLanguageValue = hasAcceptLanguage ? capturedHeaders['Accept-Language'] : null;
    
    console.log('✅ Accept-Language Header Test:', {
      'Has Accept-Language': !!hasAcceptLanguage,
      'Accept-Language Value': acceptLanguageValue,
      'Expected Value': getAcceptLanguageHeader(),
      'Matches Expected': acceptLanguageValue === getAcceptLanguageHeader(),
    });
    
    return {
      hasAcceptLanguage: !!hasAcceptLanguage,
      acceptLanguageValue,
      expectedValue: getAcceptLanguageHeader(),
      matches: acceptLanguageValue === getAcceptLanguageHeader(),
    };
    
  } catch (error) {
    console.error('❌ API Request Language Header Test Error:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test language change and header update
 */
export async function testLanguageChange(newLanguage: string) {
  console.log(`🧪 Testing Language Change to: ${newLanguage}`);
  
  const beforeLang = getCurrentLanguage();
  const beforeHeader = getAcceptLanguageHeader();
  
  console.log('📋 Before Language Change:', {
    'Current Language': beforeLang,
    'Accept-Language Header': beforeHeader,
  });
  
  try {
    // Change language using i18n
    const i18n = require('../i18n').default;
    await i18n.changeLanguage(newLanguage);
  } catch (error) {
    console.error('Could not change language - i18n not available:', error);
    return {
      error: 'i18n not available for language change test',
    };
  }
  
  // Small delay to ensure change is processed
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const afterLang = getCurrentLanguage();
  const afterHeader = getAcceptLanguageHeader();
  
  console.log('📋 After Language Change:', {
    'Current Language': afterLang,
    'Accept-Language Header': afterHeader,
    'Language Changed': afterLang !== beforeLang,
    'Header Changed': afterHeader !== beforeHeader,
  });
  
  return {
    before: { lang: beforeLang, header: beforeHeader },
    after: { lang: afterLang, header: afterHeader },
    changed: {
      language: afterLang !== beforeLang,
      header: afterHeader !== beforeHeader,
    },
  };
}

/**
 * Run all language header tests
 */
export async function runAllLanguageTests() {
  console.log('🚀 Running All Language Header Tests...');
  
  const results = {
    detection: testLanguageDetection(),
    headers: testLanguageHeaders(),
    apiRequest: await testApiRequestLanguageHeader(),
  };
  
  console.log('✅ All Language Tests Complete:', results);
  return results;
}

/**
 * Utility to log current language status
 */
export function logLanguageStatus() {
  // Safely get i18n instance
  let i18nLang = 'N/A';
  try {
    const i18n = require('../i18n').default;
    i18nLang = i18n.language || 'N/A';
  } catch (error) {
    i18nLang = 'Not available';
  }
  
  console.log('📊 Current Language Status:', {
    'i18n Language': i18nLang,
    'Detected Language': getCurrentLanguage(),
    'Accept-Language Header': getAcceptLanguageHeader(),
    'localStorage': localStorage.getItem('i18nextLng'),
    'Browser Language': navigator.language,
  });
} 