// Export the configured axios instance
export { default as axiosInstance } from './axios-config';
export { tokenManager } from './axios-config';
export type { TokenManager } from './axios-config';

// Export the API client
export { default as apiClient } from './api-client';
export { ApiClient } from './api-client';
export type { ApiResponse } from './api-client';

// Re-export axios types for convenience
export type {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  AxiosInstance,
} from 'axios';

// Export test functions for development
export { testCorsProxy, testProxyRouting } from './test-cors'; 