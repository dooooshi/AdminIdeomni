/**
 * Utility functions for safely formatting numeric values in map components
 */

/**
 * Safely format a number to a fixed decimal places
 * @param value - The value to format (could be number, string, null, undefined)
 * @param decimals - Number of decimal places (default: 2)
 * @param fallback - Fallback string if value is not a valid number (default: 'N/A')
 * @returns Formatted string
 */
export const safeToFixed = (
  value: any, 
  decimals: number = 2, 
  fallback: string = 'N/A'
): string => {
  if (value === null || value === undefined) {
    return fallback;
  }
  
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return fallback;
  }
  
  return numValue.toFixed(decimals);
};

/**
 * Safely format a number with locale-specific formatting
 * @param value - The value to format (could be number, string, null, undefined)
 * @param fallback - Fallback string if value is not a valid number (default: 'N/A')
 * @returns Formatted string
 */
export const safeToLocaleString = (
  value: any, 
  fallback: string = 'N/A'
): string => {
  if (value === null || value === undefined) {
    return fallback;
  }
  
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return fallback;
  }
  
  return numValue.toLocaleString();
};

/**
 * Safely format a currency value
 * @param value - The value to format (could be number, string, null, undefined)
 * @param currency - Currency symbol (default: '$')
 * @param decimals - Number of decimal places (default: 2)
 * @param fallback - Fallback string if value is not a valid number (default: 'N/A')
 * @returns Formatted currency string
 */
export const safeCurrencyFormat = (
  value: any, 
  currency: string = '$', 
  decimals: number = 2, 
  fallback: string = 'N/A'
): string => {
  const formatted = safeToFixed(value, decimals, fallback);
  if (formatted === fallback) {
    return fallback;
  }
  return `${currency}${formatted}`;
};

/**
 * Check if a value is a valid number for formatting
 * @param value - The value to check
 * @returns boolean
 */
export const isValidNumber = (value: any): boolean => {
  if (value === null || value === undefined) {
    return false;
  }
  
  const numValue = Number(value);
  return !isNaN(numValue);
};