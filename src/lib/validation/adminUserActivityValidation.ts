/**
 * Validation utilities for Admin User-Activity Management
 * Provides comprehensive input validation with detailed error messages
 */

import { 
  ValidationError, 
  ErrorCode
} from '../errors/AdminUserActivityError';
import { 
  AdminUserActivitySearchParams,
  AssignUserToActivityRequest,
  TransferUserActivityRequest,
  BulkAssignUsersRequest,
  TeamSearchParams,
  ExportParams,
  USER_TYPES,
  UserActivityStatus,
  ActivityType
} from '../services/adminUserActivityService';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: string[];
}

/**
 * Field validation rules
 */
export interface FieldValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => boolean;
  errorMessage?: string;
}

/**
 * Common validation patterns
 */
export const ValidationPatterns = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  USERNAME: /^[a-zA-Z0-9_-]{3,50}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9\s]+$/,
  NUMERIC: /^\d+$/,
  POSITIVE_INTEGER: /^[1-9]\d*$/,
  ISO_DATE: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/
} as const;

/**
 * Base validator class
 */
export class BaseValidator {
  /**
   * Validate a single field
   */
  static validateField(
    value: any, 
    fieldName: string, 
    rules: FieldValidationRule
  ): ValidationError | null {
    // Check required fields
    if (rules.required && (value === undefined || value === null || value === '')) {
      return new ValidationError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        `${fieldName} is required`,
        rules.errorMessage || `${fieldName} is required`,
        { field: fieldName, value }
      );
    }

    // Skip other validations for empty optional fields
    if (!rules.required && (value === undefined || value === null || value === '')) {
      return null;
    }

    // Check string length
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        return new ValidationError(
          ErrorCode.MISSING_REQUIRED_FIELD,
          `${fieldName} must be at least ${rules.minLength} characters`,
          rules.errorMessage || `${fieldName} must be at least ${rules.minLength} characters`,
          { field: fieldName, value, minLength: rules.minLength }
        );
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        return new ValidationError(
          ErrorCode.MISSING_REQUIRED_FIELD,
          `${fieldName} must not exceed ${rules.maxLength} characters`,
          rules.errorMessage || `${fieldName} must not exceed ${rules.maxLength} characters`,
          { field: fieldName, value, maxLength: rules.maxLength }
        );
      }
    }

    // Check pattern
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      return new ValidationError(
        ErrorCode.INVALID_EMAIL_FORMAT,
        `${fieldName} format is invalid`,
        rules.errorMessage || `${fieldName} format is invalid`,
        { field: fieldName, value, pattern: rules.pattern.source }
      );
    }

    // Check custom validator
    if (rules.customValidator && !rules.customValidator(value)) {
      return new ValidationError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        `${fieldName} validation failed`,
        rules.errorMessage || `${fieldName} is invalid`,
        { field: fieldName, value }
      );
    }

    return null;
  }

  /**
   * Validate multiple fields
   */
  static validateFields(
    data: Record<string, any>, 
    rules: Record<string, FieldValidationRule>
  ): ValidationResult {
    const errors: ValidationError[] = [];

    for (const [fieldName, fieldRules] of Object.entries(rules)) {
      const error = this.validateField(data[fieldName], fieldName, fieldRules);
      if (error) {
        errors.push(error);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate UUID format
   */
  static validateUUID(value: string, fieldName: string): ValidationError | null {
    if (!ValidationPatterns.UUID.test(value)) {
      return new ValidationError(
        ErrorCode.INVALID_USER_ID,
        `${fieldName} must be a valid UUID`,
        `${fieldName} format is invalid`,
        { field: fieldName, value }
      );
    }
    return null;
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): ValidationError | null {
    if (!ValidationPatterns.EMAIL.test(email)) {
      return new ValidationError(
        ErrorCode.INVALID_EMAIL_FORMAT,
        'Email format is invalid',
        'Please enter a valid email address',
        { field: 'email', value: email }
      );
    }
    return null;
  }

  /**
   * Validate date range
   */
  static validateDateRange(startDate: string, endDate: string): ValidationError | null {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return new ValidationError(
        ErrorCode.INVALID_DATE_RANGE,
        'Invalid date format',
        'Please provide valid dates',
        { startDate, endDate }
      );
    }

    if (start >= end) {
      return new ValidationError(
        ErrorCode.INVALID_DATE_RANGE,
        'End date must be after start date',
        'End date must be after start date',
        { startDate, endDate }
      );
    }

    return null;
  }

  /**
   * Validate user type
   */
  static validateUserType(userType: number): ValidationError | null {
    const validTypes = Object.values(USER_TYPES);
    if (!validTypes.includes(userType as any)) {
      return new ValidationError(
        ErrorCode.INVALID_USER_TYPE,
        'Invalid user type',
        'Please select a valid user type',
        { userType, validTypes }
      );
    }
    return null;
  }

  /**
   * Validate activity status
   */
  static validateActivityStatus(status: string): ValidationError | null {
    const validStatuses = Object.values(UserActivityStatus);
    if (!validStatuses.includes(status as UserActivityStatus)) {
      return new ValidationError(
        ErrorCode.INVALID_STATUS,
        'Invalid activity status',
        'Please select a valid activity status',
        { status, validStatuses }
      );
    }
    return null;
  }

  /**
   * Validate pagination parameters
   */
  static validatePagination(page?: number, pageSize?: number): ValidationResult {
    const errors: ValidationError[] = [];

    if (page !== undefined) {
      if (!Number.isInteger(page) || page < 1) {
        errors.push(new ValidationError(
          ErrorCode.INVALID_PAGE_SIZE,
          'Page must be a positive integer',
          'Page number must be a positive integer',
          { page }
        ));
      }
    }

    if (pageSize !== undefined) {
      if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
        errors.push(new ValidationError(
          ErrorCode.INVALID_PAGE_SIZE,
          'Page size must be between 1 and 100',
          'Page size must be between 1 and 100',
          { pageSize }
        ));
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Search parameters validator
 */
export class SearchParamsValidator extends BaseValidator {
  /**
   * Validate user search parameters
   */
  static validateUserSearchParams(params: AdminUserActivitySearchParams): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate pagination
    const paginationResult = this.validatePagination(params.page, params.pageSize);
    errors.push(...paginationResult.errors);

    // Validate user type
    if (params.userType !== undefined) {
      const userTypeError = this.validateUserType(params.userType);
      if (userTypeError) errors.push(userTypeError);
    }

    // Validate activity status
    if (params.activityStatus && !['assigned', 'unassigned', 'all'].includes(params.activityStatus)) {
      errors.push(new ValidationError(
        ErrorCode.INVALID_STATUS,
        'Invalid activity status filter',
        'Please select a valid activity status filter',
        { activityStatus: params.activityStatus }
      ));
    }

    // Validate enrollment status
    if (params.enrollmentStatus) {
      const statusError = this.validateActivityStatus(params.enrollmentStatus);
      if (statusError) errors.push(statusError);
    }

    // Validate activity ID
    if (params.activityId && !ValidationPatterns.UUID.test(params.activityId)) {
      const uuidError = this.validateUUID(params.activityId, 'activityId');
      if (uuidError) errors.push(uuidError);
    }

    // Validate sort fields
    const validSortFields = ['username', 'email', 'createdAt', 'enrolledAt', 'firstName', 'lastName'];
    if (params.sortBy && !validSortFields.includes(params.sortBy)) {
      errors.push(new ValidationError(
        ErrorCode.INVALID_SORT_FIELD,
        'Invalid sort field',
        'Please select a valid sort field',
        { sortBy: params.sortBy, validFields: validSortFields }
      ));
    }

    // Validate sort order
    if (params.sortOrder && !['asc', 'desc'].includes(params.sortOrder)) {
      errors.push(new ValidationError(
        ErrorCode.INVALID_SORT_FIELD,
        'Invalid sort order',
        'Sort order must be either "asc" or "desc"',
        { sortOrder: params.sortOrder }
      ));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate team search parameters
   */
  static validateTeamSearchParams(params: TeamSearchParams): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate pagination
    const paginationResult = this.validatePagination(params.page, params.pageSize);
    errors.push(...paginationResult.errors);

    // Validate activity ID
    if (params.activityId && !ValidationPatterns.UUID.test(params.activityId)) {
      const uuidError = this.validateUUID(params.activityId, 'activityId');
      if (uuidError) errors.push(uuidError);
    }

    // Validate sort fields
    const validSortFields = ['name', 'createdAt', 'memberCount'];
    if (params.sortBy && !validSortFields.includes(params.sortBy)) {
      errors.push(new ValidationError(
        ErrorCode.INVALID_SORT_FIELD,
        'Invalid sort field',
        'Please select a valid sort field',
        { sortBy: params.sortBy, validFields: validSortFields }
      ));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Assignment request validator
 */
export class AssignmentValidator extends BaseValidator {
  /**
   * Validate user assignment request
   */
  static validateAssignUserRequest(request: AssignUserToActivityRequest): ValidationResult {
    const rules = {
      userId: {
        required: true,
        customValidator: (value: string) => {
          if (typeof value !== 'string' || value.trim() === '') return false;
          return value.length > 0 && value.length <= 255;
        },
        errorMessage: 'User ID is required and must be a valid identifier'
      },
      activityId: {
        required: true,
        customValidator: (value: string) => {
          if (typeof value !== 'string' || value.trim() === '') return false;
          return ValidationPatterns.UUID.test(value) || (value.length > 0 && value.length <= 255);
        },
        errorMessage: 'Activity ID is required and must be a valid identifier'
      },
      reason: {
        required: false,
        maxLength: 500,
        errorMessage: 'Reason must not exceed 500 characters'
      }
    };

    return this.validateFields(request, rules);
  }

  /**
   * Validate user transfer request
   */
  static validateTransferUserRequest(request: TransferUserActivityRequest): ValidationResult {
    const rules = {
      userId: {
        required: true,
        customValidator: (value: string) => {
          if (typeof value !== 'string' || value.trim() === '') return false;
          return value.length > 0 && value.length <= 255;
        },
        errorMessage: 'User ID is required and must be a valid identifier'
      },
      newActivityId: {
        required: true,
        customValidator: (value: string) => {
          if (typeof value !== 'string' || value.trim() === '') return false;
          return ValidationPatterns.UUID.test(value) || (value.length > 0 && value.length <= 255);
        },
        errorMessage: 'New activity ID is required and must be a valid identifier'
      },
      reason: {
        required: false,
        maxLength: 500,
        errorMessage: 'Reason must not exceed 500 characters'
      }
    };

    return this.validateFields(request, rules);
  }

  /**
   * Validate bulk assignment request
   */
  static validateBulkAssignRequest(request: BulkAssignUsersRequest): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate user IDs array
    if (!request.userIds || !Array.isArray(request.userIds) || request.userIds.length === 0) {
      errors.push(new ValidationError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        'User IDs array is required and must not be empty',
        'Please select at least one user to assign',
        { userIds: request.userIds }
      ));
    } else {
      // Validate each user ID
      if (request.userIds.length > 100) {
        errors.push(new ValidationError(
          ErrorCode.INVALID_USER_ID,
          'Cannot assign more than 100 users at once',
          'Please select no more than 100 users for bulk assignment',
          { userIdCount: request.userIds.length }
        ));
      }

      request.userIds.forEach((userId, index) => {
        if (typeof userId !== 'string' || userId.trim() === '' || userId.length > 255) {
          errors.push(new ValidationError(
            ErrorCode.INVALID_USER_ID,
            `User ID at index ${index} is not a valid identifier`,
            'One or more user IDs are invalid',
            { userId, index }
          ));
        }
      });
    }

    // Validate activity ID
    if (!request.activityId || typeof request.activityId !== 'string' || request.activityId.trim() === '' || request.activityId.length > 255) {
      errors.push(new ValidationError(
        ErrorCode.INVALID_ACTIVITY_ID,
        'Activity ID must be a valid identifier',
        'Please select a valid activity',
        { activityId: request.activityId }
      ));
    }

    // Validate reason length
    if (request.reason && request.reason.length > 500) {
      errors.push(new ValidationError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        'Reason must not exceed 500 characters',
        'Reason must not exceed 500 characters',
        { reason: request.reason, length: request.reason.length }
      ));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Export parameters validator
 */
export class ExportValidator extends BaseValidator {
  /**
   * Validate export parameters
   */
  static validateExportParams(params: ExportParams): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate export format
    const validFormats = ['csv', 'excel', 'json'];
    if (params.format && !validFormats.includes(params.format)) {
      errors.push(new ValidationError(
        ErrorCode.INVALID_EXPORT_FORMAT,
        'Invalid export format',
        'Please select a valid export format (CSV, Excel, or JSON)',
        { format: params.format, validFormats }
      ));
    }

    // Validate user type
    if (params.userType !== undefined) {
      const userTypeError = this.validateUserType(params.userType);
      if (userTypeError) errors.push(userTypeError);
    }

    // Validate activity ID
    if (params.activityId && !ValidationPatterns.UUID.test(params.activityId)) {
      const uuidError = this.validateUUID(params.activityId, 'activityId');
      if (uuidError) errors.push(uuidError);
    }

    // Validate fields array
    if (params.fields) {
      const validFields = [
        'username', 'email', 'firstName', 'lastName', 'userType', 
        'isActive', 'currentActivity', 'activityStatus', 'enrolledAt', 
        'currentTeam', 'teamRole', 'createdAt'
      ];

      params.fields.forEach(field => {
        if (!validFields.includes(field)) {
          errors.push(new ValidationError(
            ErrorCode.MISSING_REQUIRED_FIELD,
            `Invalid export field: ${field}`,
            'One or more selected fields are invalid',
            { field, validFields }
          ));
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Main validation service
 */
export class AdminUserActivityValidationService {
  /**
   * Validate any admin user-activity operation
   */
  static validate(operation: string, data: any): ValidationResult {
    switch (operation) {
      case 'searchUsers':
        return SearchParamsValidator.validateUserSearchParams(data);
      case 'searchTeams':
        return SearchParamsValidator.validateTeamSearchParams(data);
      case 'assignUser':
        return AssignmentValidator.validateAssignUserRequest(data);
      case 'transferUser':
        return AssignmentValidator.validateTransferUserRequest(data);
      case 'bulkAssign':
        return AssignmentValidator.validateBulkAssignRequest(data);
      case 'export':
        return ExportValidator.validateExportParams(data);
      default:
        return {
          isValid: false,
          errors: [new ValidationError(
            ErrorCode.MISSING_REQUIRED_FIELD,
            `Unknown validation operation: ${operation}`,
            'Invalid operation',
            { operation }
          )]
        };
    }
  }

  /**
   * Quick validation helpers
   */
  static isValidUUID(value: string): boolean {
    return ValidationPatterns.UUID.test(value);
  }

  static isValidEmail(value: string): boolean {
    return ValidationPatterns.EMAIL.test(value);
  }

  static isValidUserType(value: number): boolean {
    return Object.values(USER_TYPES).includes(value as any);
  }

  static isValidUserActivityStatus(value: string): boolean {
    return Object.values(UserActivityStatus).includes(value as UserActivityStatus);
  }
}