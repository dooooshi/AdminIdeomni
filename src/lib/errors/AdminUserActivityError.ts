/**
 * Custom Error Classes for Admin User-Activity Management
 * Provides structured error handling with proper categorization and user-friendly messages
 */

export enum ErrorType {
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  PERMISSION = 'PERMISSION',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT'
}

export enum ErrorCode {
  // Validation errors (1000-1099)
  INVALID_USER_ID = 1000,
  INVALID_ACTIVITY_ID = 1001,
  INVALID_TEAM_ID = 1002,
  INVALID_EMAIL_FORMAT = 1003,
  INVALID_DATE_RANGE = 1004,
  MISSING_REQUIRED_FIELD = 1005,
  INVALID_USER_TYPE = 1006,
  INVALID_STATUS = 1007,
  INVALID_EXPORT_FORMAT = 1008,
  INVALID_PAGE_SIZE = 1009,
  INVALID_SORT_FIELD = 1010,

  // Permission errors (2000-2099)
  INSUFFICIENT_PERMISSIONS = 2000,
  SUPER_ADMIN_REQUIRED = 2001,
  CANNOT_MODIFY_OWN_ACCOUNT = 2002,
  RESOURCE_ACCESS_DENIED = 2003,

  // Business logic errors (3000-3099)
  USER_ALREADY_ASSIGNED = 3000,
  ACTIVITY_CAPACITY_EXCEEDED = 3001,
  ACTIVITY_NOT_ACTIVE = 3002,
  ACTIVITY_ENDED = 3003,
  TEAM_FULL = 3004,
  TEAM_DISBANDED = 3005,
  CANNOT_REMOVE_TEAM_LEADER = 3006,
  ONE_ACTIVITY_CONSTRAINT_VIOLATION = 3007,
  ASSIGNMENT_DEADLINE_PASSED = 3008,

  // Not found errors (4000-4099)
  USER_NOT_FOUND = 4000,
  ACTIVITY_NOT_FOUND = 4001,
  TEAM_NOT_FOUND = 4002,
  ASSIGNMENT_NOT_FOUND = 4003,
  EXPORT_NOT_FOUND = 4004,

  // Conflict errors (5000-5099)
  DUPLICATE_ASSIGNMENT = 5000,
  DUPLICATE_TEAM_NAME = 5001,
  USER_STATUS_CONFLICT = 5002,
  CONCURRENT_MODIFICATION = 5003,

  // Network/Server errors (6000-6099)
  NETWORK_ERROR = 6000,
  SERVER_TIMEOUT = 6001,
  SERVICE_UNAVAILABLE = 6002,
  RATE_LIMIT_EXCEEDED = 6003,
  DATABASE_ERROR = 6004,
  EXTERNAL_SERVICE_ERROR = 6005
}

/**
 * Base error class for admin user-activity management
 */
export class AdminUserActivityError extends Error {
  public readonly type: ErrorType;
  public readonly code: ErrorCode;
  public readonly userMessage: string;
  public readonly details?: Record<string, any>;
  public readonly timestamp: Date;
  
  constructor(
    type: ErrorType,
    code: ErrorCode,
    message: string,
    userMessage?: string,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AdminUserActivityError';
    this.type = type;
    this.code = code;
    this.userMessage = userMessage || this.getDefaultUserMessage();
    this.details = details;
    this.timestamp = new Date();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AdminUserActivityError);
    }
  }

  private getDefaultUserMessage(): string {
    switch (this.type) {
      case ErrorType.VALIDATION:
        return 'Please check the information you provided and try again.';
      case ErrorType.NETWORK:
        return 'Network connection error. Please check your internet connection and try again.';
      case ErrorType.PERMISSION:
        return 'You do not have permission to perform this action.';
      case ErrorType.BUSINESS_LOGIC:
        return 'This action cannot be completed due to business rules.';
      case ErrorType.NOT_FOUND:
        return 'The requested resource was not found.';
      case ErrorType.CONFLICT:
        return 'This action conflicts with existing data.';
      case ErrorType.SERVER_ERROR:
        return 'A server error occurred. Please try again later.';
      case ErrorType.TIMEOUT:
        return 'The request took too long to complete. Please try again.';
      case ErrorType.RATE_LIMIT:
        return 'Too many requests. Please wait a moment and try again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Convert error to plain object for logging/reporting
   */
  toJSON() {
    return {
      name: this.name,
      type: this.type,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack
    };
  }

  /**
   * Check if error is of a specific type
   */
  isType(type: ErrorType): boolean {
    return this.type === type;
  }

  /**
   * Check if error has a specific code
   */
  hasCode(code: ErrorCode): boolean {
    return this.code === code;
  }
}

/**
 * Validation error class
 */
export class ValidationError extends AdminUserActivityError {
  constructor(
    code: ErrorCode,
    message: string,
    userMessage?: string,
    details?: Record<string, any>
  ) {
    super(ErrorType.VALIDATION, code, message, userMessage, details);
    this.name = 'ValidationError';
  }
}

/**
 * Permission error class
 */
export class PermissionError extends AdminUserActivityError {
  constructor(
    code: ErrorCode,
    message: string,
    userMessage?: string,
    details?: Record<string, any>
  ) {
    super(ErrorType.PERMISSION, code, message, userMessage, details);
    this.name = 'PermissionError';
  }
}

/**
 * Business logic error class
 */
export class BusinessLogicError extends AdminUserActivityError {
  constructor(
    code: ErrorCode,
    message: string,
    userMessage?: string,
    details?: Record<string, any>
  ) {
    super(ErrorType.BUSINESS_LOGIC, code, message, userMessage, details);
    this.name = 'BusinessLogicError';
  }
}

/**
 * Network error class
 */
export class NetworkError extends AdminUserActivityError {
  constructor(
    code: ErrorCode,
    message: string,
    userMessage?: string,
    details?: Record<string, any>
  ) {
    super(ErrorType.NETWORK, code, message, userMessage, details);
    this.name = 'NetworkError';
  }
}

/**
 * Error factory for creating appropriate error instances
 */
export class ErrorFactory {
  /**
   * Create error from HTTP response with language support
   */
  static fromHttpError(error: any, endpoint?: string, language?: string): AdminUserActivityError {
    const response = error.response;
    const status = response?.status;
    const data = response?.data;

    // Extract business code from API response if available
    const businessCode = data?.businessCode;
    const serverMessage = data?.message || error.message;

    let errorType: ErrorType;
    let errorCode: ErrorCode;
    let userMessage: string;

    // Determine error type based on HTTP status code
    switch (status) {
      case 400:
        errorType = ErrorType.VALIDATION;
        errorCode = ErrorCode.INVALID_USER_ID; // Default, can be overridden
        userMessage = 'Invalid request. Please check your input and try again.';
        break;
      case 401:
        errorType = ErrorType.PERMISSION;
        errorCode = ErrorCode.INSUFFICIENT_PERMISSIONS;
        userMessage = 'You are not authenticated. Please log in and try again.';
        break;
      case 403:
        errorType = ErrorType.PERMISSION;
        errorCode = ErrorCode.INSUFFICIENT_PERMISSIONS;
        userMessage = 'You do not have permission to perform this action.';
        break;
      case 404:
        errorType = ErrorType.NOT_FOUND;
        errorCode = ErrorCode.USER_NOT_FOUND; // Default, can be overridden
        userMessage = 'The requested resource was not found.';
        break;
      case 409:
        errorType = ErrorType.CONFLICT;
        errorCode = ErrorCode.DUPLICATE_ASSIGNMENT;
        userMessage = 'This action conflicts with existing data.';
        break;
      case 429:
        errorType = ErrorType.RATE_LIMIT;
        errorCode = ErrorCode.RATE_LIMIT_EXCEEDED;
        userMessage = 'Too many requests. Please wait and try again.';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        errorType = ErrorType.SERVER_ERROR;
        errorCode = ErrorCode.SERVICE_UNAVAILABLE;
        userMessage = 'Server error. Please try again later.';
        break;
      default:
        if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
          errorType = ErrorType.NETWORK;
          errorCode = ErrorCode.NETWORK_ERROR;
          userMessage = 'Network connection error. Please check your connection and try again.';
        } else {
          errorType = ErrorType.SERVER_ERROR;
          errorCode = ErrorCode.SERVICE_UNAVAILABLE;
          userMessage = 'An unexpected error occurred. Please try again.';
        }
    }

    // Override with specific business logic errors if available
    if (businessCode) {
      switch (businessCode) {
        case 1001:
          errorType = ErrorType.BUSINESS_LOGIC;
          errorCode = ErrorCode.USER_ALREADY_ASSIGNED;
          userMessage = language 
            ? LocalizedErrorMessages.getLocalizedMessage(ErrorCode.USER_ALREADY_ASSIGNED, language)
            : 'This user is already assigned to an activity.';
          break;
        case 1002:
          errorType = ErrorType.BUSINESS_LOGIC;
          errorCode = ErrorCode.ACTIVITY_CAPACITY_EXCEEDED;
          userMessage = language 
            ? LocalizedErrorMessages.getLocalizedMessage(ErrorCode.ACTIVITY_CAPACITY_EXCEEDED, language)
            : 'The activity has reached its maximum capacity.';
          break;
        case 1003:
          errorType = ErrorType.BUSINESS_LOGIC;
          errorCode = ErrorCode.ONE_ACTIVITY_CONSTRAINT_VIOLATION;
          userMessage = language 
            ? LocalizedErrorMessages.getLocalizedMessage(ErrorCode.ONE_ACTIVITY_CONSTRAINT_VIOLATION, language)
            : 'Users can only be assigned to one activity at a time.';
          break;
        case 3000:
          errorType = ErrorType.VALIDATION;
          errorCode = ErrorCode.INVALID_USER_ID;
          userMessage = language 
            ? LocalizedErrorMessages.getLocalizedMessage(ErrorCode.INVALID_USER_ID, language)
            : 'Input validation failed. Please check your data and try again.';
          break;
        case 3001:
          errorType = ErrorType.BUSINESS_LOGIC;
          errorCode = ErrorCode.TEAM_FULL;
          userMessage = language 
            ? LocalizedErrorMessages.getLocalizedMessage(ErrorCode.TEAM_FULL, language)
            : 'The team is full and cannot accept more members.';
          break;
        case 3002:
          errorType = ErrorType.BUSINESS_LOGIC;
          errorCode = ErrorCode.ACTIVITY_NOT_ACTIVE;
          userMessage = language 
            ? LocalizedErrorMessages.getLocalizedMessage(ErrorCode.ACTIVITY_NOT_ACTIVE, language)
            : 'This activity is not currently active.';
          break;
        case 3003:
          errorType = ErrorType.BUSINESS_LOGIC;
          errorCode = ErrorCode.ACTIVITY_ENDED;
          userMessage = language 
            ? LocalizedErrorMessages.getLocalizedMessage(ErrorCode.ACTIVITY_ENDED, language)
            : 'This activity has already ended.';
          break;
        case 4001:
          errorType = ErrorType.NOT_FOUND;
          errorCode = ErrorCode.USER_NOT_FOUND;
          userMessage = language 
            ? LocalizedErrorMessages.getLocalizedMessage(ErrorCode.USER_NOT_FOUND, language)
            : 'The specified user was not found.';
          break;
        case 4002:
          errorType = ErrorType.NOT_FOUND;
          errorCode = ErrorCode.ACTIVITY_NOT_FOUND;
          userMessage = language 
            ? LocalizedErrorMessages.getLocalizedMessage(ErrorCode.ACTIVITY_NOT_FOUND, language)
            : 'The specified activity was not found.';
          break;
        case 4003:
          errorType = ErrorType.NOT_FOUND;
          errorCode = ErrorCode.TEAM_NOT_FOUND;
          userMessage = language 
            ? LocalizedErrorMessages.getLocalizedMessage(ErrorCode.TEAM_NOT_FOUND, language)
            : 'The specified team was not found.';
          break;
        // Add more business code mappings as needed
      }
    }

    const details: Record<string, any> = {
      httpStatus: status,
      endpoint,
      businessCode,
      serverResponse: data,
      originalError: error.message
    };

    return new AdminUserActivityError(errorType, errorCode, serverMessage, userMessage, details);
  }

  /**
   * Create validation error
   */
  static createValidationError(
    code: ErrorCode,
    message: string,
    userMessage?: string,
    details?: Record<string, any>
  ): ValidationError {
    return new ValidationError(code, message, userMessage, details);
  }

  /**
   * Create business logic error
   */
  static createBusinessLogicError(
    code: ErrorCode,
    message: string,
    userMessage?: string,
    details?: Record<string, any>
  ): BusinessLogicError {
    return new BusinessLogicError(code, message, userMessage, details);
  }
}

/**
 * Localized error message provider
 */
export class LocalizedErrorMessages {
  /**
   * Get localized error message based on error code and language
   */
  static getLocalizedMessage(
    errorCode: ErrorCode,
    language: string = 'en-US',
    fallbackMessage?: string
  ): string {
    // This would typically integrate with your i18n system
    // For now, we'll provide a mapping for common error codes
    
    const messages: Record<string, Record<ErrorCode, string>> = {
      'en-US': {
        [ErrorCode.USER_ALREADY_ASSIGNED]: 'This user is already assigned to an activity',
        [ErrorCode.ACTIVITY_CAPACITY_EXCEEDED]: 'The activity has reached its maximum capacity',
        [ErrorCode.ONE_ACTIVITY_CONSTRAINT_VIOLATION]: 'Users can only be assigned to one activity at a time',
        [ErrorCode.TEAM_FULL]: 'The team is full and cannot accept more members',
        [ErrorCode.ACTIVITY_NOT_ACTIVE]: 'This activity is not currently active',
        [ErrorCode.ACTIVITY_ENDED]: 'This activity has already ended',
        [ErrorCode.USER_NOT_FOUND]: 'The specified user was not found',
        [ErrorCode.ACTIVITY_NOT_FOUND]: 'The specified activity was not found',
        [ErrorCode.TEAM_NOT_FOUND]: 'The specified team was not found',
        [ErrorCode.INVALID_USER_ID]: 'Input validation failed. Please check your data and try again',
        [ErrorCode.NETWORK_ERROR]: 'Network connection error. Please check your connection and try again',
        [ErrorCode.SERVER_TIMEOUT]: 'Request timed out. Please try again',
        [ErrorCode.SERVICE_UNAVAILABLE]: 'Service is temporarily unavailable. Please try again later',
        [ErrorCode.INSUFFICIENT_PERMISSIONS]: 'You do not have permission to perform this action',
        [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please wait and try again',
      },
      'zh-CN': {
        [ErrorCode.USER_ALREADY_ASSIGNED]: '此用户已分配到活动',
        [ErrorCode.ACTIVITY_CAPACITY_EXCEEDED]: '活动已达到最大容量',
        [ErrorCode.ONE_ACTIVITY_CONSTRAINT_VIOLATION]: '用户一次只能分配到一个活动',
        [ErrorCode.TEAM_FULL]: '此团队已满',
        [ErrorCode.ACTIVITY_NOT_ACTIVE]: '此活动当前不活跃',
        [ErrorCode.ACTIVITY_ENDED]: '此活动已结束',
        [ErrorCode.USER_NOT_FOUND]: '未找到指定用户',
        [ErrorCode.ACTIVITY_NOT_FOUND]: '未找到指定活动',
        [ErrorCode.TEAM_NOT_FOUND]: '未找到指定团队',
        [ErrorCode.INVALID_USER_ID]: '输入验证失败。请检查您的数据并重试',
        [ErrorCode.NETWORK_ERROR]: '网络连接错误。请检查您的连接并重试',
        [ErrorCode.SERVER_TIMEOUT]: '请求超时。请重试',
        [ErrorCode.SERVICE_UNAVAILABLE]: '服务暂时不可用。请稍后重试',
        [ErrorCode.INSUFFICIENT_PERMISSIONS]: '您没有执行此操作的权限',
        [ErrorCode.RATE_LIMIT_EXCEEDED]: '请求过多。请等待后重试',
      }
    };

    const languageMessages = messages[language] || messages['en-US'];
    return languageMessages[errorCode] || fallbackMessage || 'An unexpected error occurred';
  }

  /**
   * Get error type display name in specified language
   */
  static getErrorTypeDisplayName(errorType: ErrorType, language: string = 'en-US'): string {
    const typeNames: Record<string, Record<ErrorType, string>> = {
      'en-US': {
        [ErrorType.VALIDATION]: 'Input Validation Error',
        [ErrorType.PERMISSION]: 'Permission Denied',
        [ErrorType.BUSINESS_LOGIC]: 'Operation Not Allowed',
        [ErrorType.NOT_FOUND]: 'Resource Not Found',
        [ErrorType.NETWORK]: 'Network Error',
        [ErrorType.SERVER_ERROR]: 'Server Error',
        [ErrorType.TIMEOUT]: 'Request Timeout',
        [ErrorType.RATE_LIMIT]: 'Rate Limit Exceeded',
        [ErrorType.CONFLICT]: 'Data Conflict',
      },
      'zh-CN': {
        [ErrorType.VALIDATION]: '输入验证错误',
        [ErrorType.PERMISSION]: '权限不足',
        [ErrorType.BUSINESS_LOGIC]: '操作不被允许',
        [ErrorType.NOT_FOUND]: '资源未找到',
        [ErrorType.NETWORK]: '网络错误',
        [ErrorType.SERVER_ERROR]: '服务器错误',
        [ErrorType.TIMEOUT]: '请求超时',
        [ErrorType.RATE_LIMIT]: '请求频率超限',
        [ErrorType.CONFLICT]: '数据冲突',
      }
    };

    const languageNames = typeNames[language] || typeNames['en-US'];
    return languageNames[errorType] || errorType.toString();
  }
}

/**
 * Error handler utility for consistent error processing
 */
export class ErrorHandler {
  /**
   * Process and standardize errors with language support
   */
  static processError(error: any, context?: string, language?: string): AdminUserActivityError {
    // If it's already our custom error, return it
    if (error instanceof AdminUserActivityError) {
      return error;
    }

    // If it's an HTTP error, convert it
    if (error.response || error.request) {
      return ErrorFactory.fromHttpError(error, context, language);
    }

    // For other types of errors, create a generic error
    const localizedMessage = language 
      ? LocalizedErrorMessages.getLocalizedMessage(ErrorCode.SERVICE_UNAVAILABLE, language)
      : 'An unexpected error occurred. Please try again.';

    return new AdminUserActivityError(
      ErrorType.SERVER_ERROR,
      ErrorCode.SERVICE_UNAVAILABLE,
      error.message || 'Unknown error occurred',
      localizedMessage,
      { originalError: error, context }
    );
  }

  /**
   * Log error for monitoring/debugging
   */
  static logError(error: AdminUserActivityError, context?: string): void {
    const logData = {
      ...error.toJSON(),
      context,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    };

    console.error('[AdminUserActivity Error]', logData);

    // In a real application, you would send this to your logging service
    // Example: LoggingService.error(logData);
  }

  /**
   * Get user-friendly error message for display
   */
  static getUserMessage(error: any): string {
    if (error instanceof AdminUserActivityError) {
      return error.userMessage;
    }
    
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Check if error should trigger a retry
   */
  static shouldRetry(error: AdminUserActivityError): boolean {
    return error.isType(ErrorType.NETWORK) || 
           error.isType(ErrorType.TIMEOUT) ||
           (error.isType(ErrorType.SERVER_ERROR) && error.hasCode(ErrorCode.SERVICE_UNAVAILABLE));
  }
}