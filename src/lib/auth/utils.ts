/**
 * Utility functions for authentication
 */

/**
 * Extracts error message from backend response following the standard format:
 * { success: false, message: '...', businessCode: ..., details: { ... } }
 * 
 * @param error - The error object from API call
 * @param defaultMessage - Default message if no specific error message found
 * @returns The extracted error message
 */
export function extractErrorMessage(error: any, defaultMessage: string = 'An unexpected error occurred'): string {
  // Check backend response format first: { success: false, message: '...' }
  if (error?.response?.data) {
    const responseData = error.response.data;
    
    // If response has success field and it's false, use the message
    if (responseData.success === false && responseData.message) {
      return responseData.message;
    }
    // Fallback to direct message field
    else if (responseData.message) {
      return responseData.message;
    }
  }
  // Check if error itself has the backend response format (for service-level errors)
  else if (error?.success === false && error?.message) {
    return error.message;
  }
  // Fallback to error message if no response data
  else if (error?.message) {
    return error.message;
  }
  
  return defaultMessage;
}

/**
 * Type guard to check if a response indicates failure
 */
export function isFailureResponse(response: any): boolean {
  return response?.success === false;
}

/**
 * Extracts business code from backend response if available
 */
export function extractBusinessCode(error: any): number | null {
  if (error?.response?.data?.businessCode) {
    return error.response.data.businessCode;
  }
  return null;
}

/**
 * Extracts error details from backend response if available
 */
export function extractErrorDetails(error: any): any | null {
  if (error?.response?.data?.details) {
    return error.response.data.details;
  }
  return null;
} 