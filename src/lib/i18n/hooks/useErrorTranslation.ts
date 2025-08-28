import { useTranslation } from './useTranslation';

export const landErrorCodes: Record<string, string> = {
  'INSUFFICIENT_RESOURCES': 'INSUFFICIENT_RESOURCES',
  'TILE_NOT_AVAILABLE': 'TILE_NOT_AVAILABLE',
  'INVALID_TILE': 'INVALID_TILE',
  'TEAM_NOT_FOUND': 'TEAM_NOT_FOUND',
  'ACTIVITY_NOT_FOUND': 'ACTIVITY_NOT_FOUND',
  'PURCHASE_FAILED': 'PURCHASE_FAILED',
  'VALIDATION_FAILED': 'VALIDATION_FAILED',
  'NETWORK_ERROR': 'NETWORK_ERROR',
  'PERMISSION_DENIED': 'PERMISSION_DENIED',
  'BUSINESS_RULE_VIOLATION': 'BUSINESS_RULE_VIOLATION',
  'UNEXPECTED_ERROR': 'UNEXPECTED_ERROR',
  'UNKNOWN_ERROR': 'UNKNOWN_ERROR',
};

export const translateErrorCode = (errorCode: string, t: (key: string) => string): string => {
  const translationKey = landErrorCodes[errorCode] || 'UNKNOWN_ERROR';
  return t(`errors.${translationKey}`);
};

export const validationErrorCodes: Record<string, string> = {
  'Area must be greater than 0': 'AREA_MUST_BE_POSITIVE',
  'Area must be a whole number (no decimals allowed)': 'AREA_MUST_BE_INTEGER',
  'Minimum area purchase is 1 unit': 'MINIMUM_AREA_PURCHASE',
  'Maximum gold cost cannot be negative': 'MAX_GOLD_COST_NEGATIVE',
  'Maximum carbon cost cannot be negative': 'MAX_CARBON_COST_NEGATIVE',
};

export const translateValidationError = (message: string, t: (key: string) => string): string => {
  const translationKey = validationErrorCodes[message];
  return translationKey ? t(`errors.${translationKey}`) : message;
};