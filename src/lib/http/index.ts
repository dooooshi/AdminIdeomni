// Export the configured axios instance
export { default as axiosInstance } from './axios-config';
export { tokenManager } from './axios-config';
export type { TokenManager } from './axios-config';

// Export the API client
export { default as apiClient } from './api-client';
export { ApiClient } from './api-client';
export type { ApiResponse } from './api-client';

// Export language utilities
export { 
  getCurrentLanguage, 
  getAcceptLanguageHeader, 
  createLanguageHeaders 
} from './language-utils';

// Re-export axios types for convenience
export type {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  AxiosInstance,
} from 'axios';

// Note: Test functions can be imported directly from individual files:
// import { testCorsProxy } from '@/lib/http/test-cors';
// import { testLanguageDetection } from '@/lib/http/test-language-headers'; 