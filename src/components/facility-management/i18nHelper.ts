import { useTranslation } from 'react-i18next';
import { FacilityType, FacilityCategory } from '@/lib/services/facilityService';

/**
 * Comprehensive i18n helper for facility management module
 * Provides type-safe translation functions and formatting utilities
 */
export const useFacilityTranslation = () => {
  const { t, i18n } = useTranslation();

  // Core translation function with facility management namespace
  const translateFacility = (key: string, options?: any) => {
    return t(`facilityManagement.${key}`, options);
  };

  // Facility type translations
  const getFacilityTypeName = (type: FacilityType): string => {
    return translateFacility(`FACILITY_TYPE_${type}`);
  };

  const getFacilityTypeDescription = (type: FacilityType): string => {
    return translateFacility(`FACILITY_TYPE_${type}_DESCRIPTION`);
  };

  // Facility category translations
  const getFacilityCategoryName = (category: FacilityCategory): string => {
    return translateFacility(`FACILITY_CATEGORY_${category}`);
  };

  // Status translations
  const getStatusText = (isActive: boolean, isDeleted?: boolean): string => {
    if (isDeleted) return translateFacility('DELETED');
    return isActive ? translateFacility('ACTIVE') : translateFacility('INACTIVE');
  };

  // Format currency based on locale
  const formatCurrency = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null) {
      return translateFacility('NOT_AVAILABLE');
    }
    
    const locale = i18n.language === 'zh-CN' ? 'zh-CN' : 'en-US';
    const currency = i18n.language === 'zh-CN' ? 'CNY' : 'USD';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format capacity with units
  const formatCapacity = (capacity: number | undefined | null): string => {
    if (capacity === undefined || capacity === null) {
      return translateFacility('NOT_AVAILABLE');
    }
    
    const locale = i18n.language === 'zh-CN' ? 'zh-CN' : 'en-US';
    const formatted = new Intl.NumberFormat(locale).format(capacity);
    const units = translateFacility('UNITS');
    
    return `${formatted} ${units}`;
  };

  // Format date based on locale
  const formatDate = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = i18n.language === 'zh-CN' ? 'zh-CN' : 'en-US';
    
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  };

  // Format date for display (short format)
  const formatDateShort = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = i18n.language === 'zh-CN' ? 'zh-CN' : 'en-US';
    
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
  };

  // Get validation error message
  const getValidationError = (field: string, type: string, options?: any): string => {
    const key = `${field.toUpperCase()}_${type.toUpperCase()}`;
    return translateFacility(key, options);
  };

  // Get success message
  const getSuccessMessage = (action: string, entity: string = 'FACILITY'): string => {
    const key = `${entity}_${action.toUpperCase()}_SUCCESS`;
    return translateFacility(key);
  };

  // Get error message
  const getErrorMessage = (action: string, entity: string = 'FACILITY'): string => {
    const key = `ERROR_${action.toUpperCase()}_${entity}`;
    return translateFacility(key);
  };

  // Get confirmation message
  const getConfirmationMessage = (action: string, entityName: string, entity: string = 'FACILITY'): string => {
    const key = `${action.toUpperCase()}_${entity}_CONFIRMATION_MESSAGE`;
    return translateFacility(key, { name: entityName, type: entityName });
  };

  // Get environmental impact text with color
  const getEnvironmentalImpact = (impact: string): { text: string; color: string } => {
    const text = translateFacility(`ENVIRONMENTAL_IMPACT_${impact.toUpperCase()}`);
    
    const colorMap: Record<string, string> = {
      HIGH: '#f44336', // red
      MEDIUM: '#ff9800', // orange
      LOW: '#4caf50', // green
      POSITIVE: '#2196f3', // blue
      NEUTRAL: '#757575', // gray
    };
    
    return {
      text,
      color: colorMap[impact.toUpperCase()] || colorMap.NEUTRAL,
    };
  };

  // Get all facility types for dropdowns
  const getAllFacilityTypes = (): Array<{ value: FacilityType; label: string }> => {
    return Object.values(FacilityType).map((type) => ({
      value: type,
      label: getFacilityTypeName(type),
    }));
  };

  // Get all facility categories for dropdowns
  const getAllFacilityCategories = (): Array<{ value: FacilityCategory; label: string }> => {
    return Object.values(FacilityCategory).map((category) => ({
      value: category,
      label: getFacilityCategoryName(category),
    }));
  };

  // Get facility types by category
  const getFacilityTypesByCategory = (category: FacilityCategory): Array<{ value: FacilityType; label: string }> => {
    const typeCategoryMap: Record<FacilityCategory, FacilityType[]> = {
      [FacilityCategory.RAW_MATERIAL_PRODUCTION]: [
        FacilityType.MINE,
        FacilityType.QUARRY,
        FacilityType.FOREST,
        FacilityType.FARM,
        FacilityType.RANCH,
        FacilityType.FISHERY,
      ],
      [FacilityCategory.FUNCTIONAL]: [
        FacilityType.FACTORY,
        FacilityType.MALL,
        FacilityType.WAREHOUSE,
      ],
      [FacilityCategory.INFRASTRUCTURE]: [
        FacilityType.WATER_PLANT,
        FacilityType.POWER_PLANT,
        FacilityType.BASE_STATION,
      ],
      [FacilityCategory.OTHER]: [
        FacilityType.FIRE_STATION,
        FacilityType.SCHOOL,
        FacilityType.HOSPITAL,
        FacilityType.PARK,
        FacilityType.CINEMA,
      ],
    };

    const types = typeCategoryMap[category] || [];
    return types.map((type) => ({
      value: type,
      label: getFacilityTypeName(type),
    }));
  };

  // Pluralization helper
  const getPlural = (count: number, singular: string, plural?: string): string => {
    if (count === 1) {
      return translateFacility(singular);
    }
    
    if (plural) {
      return translateFacility(plural);
    }
    
    // Simple English pluralization for facility management
    if (i18n.language === 'en-US') {
      const singularText = translateFacility(singular);
      return `${singularText}s`;
    }
    
    // Chinese doesn't have pluralization
    return translateFacility(singular);
  };

  // Get tooltip text
  const getTooltip = (field: string): string => {
    return translateFacility(`${field.toUpperCase()}_TOOLTIP`);
  };

  // Get placeholder text
  const getPlaceholder = (field: string): string => {
    return translateFacility(`${field.toUpperCase()}_PLACEHOLDER`);
  };

  return {
    // Core translation
    t: translateFacility,
    
    // Facility-specific translations
    getFacilityTypeName,
    getFacilityTypeDescription,
    getFacilityCategoryName,
    getStatusText,
    
    // Formatting utilities
    formatCurrency,
    formatCapacity,
    formatDate,
    formatDateShort,
    
    // Message helpers
    getValidationError,
    getSuccessMessage,
    getErrorMessage,
    getConfirmationMessage,
    
    // UI helpers
    getEnvironmentalImpact,
    getAllFacilityTypes,
    getAllFacilityCategories,
    getFacilityTypesByCategory,
    getPlural,
    getTooltip,
    getPlaceholder,
    
    // Language info
    currentLanguage: i18n.language,
    isChineseLocale: i18n.language === 'zh-CN',
  };
};

// Export types for better TypeScript support
export type FacilityTranslationHelper = ReturnType<typeof useFacilityTranslation>;

export default useFacilityTranslation; 