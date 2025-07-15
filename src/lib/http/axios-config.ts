import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthTokens, AuthUserType } from '../auth/types';

// Constants
const API_BASE_URL = (() => {
  // In development, use the Next.js proxy to avoid CORS issues
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    return '/api/proxy';
  }
  // In production or server-side, use the direct API URL
  return process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:2999/api';
})();
const ACCESS_TOKEN_KEY = 'ideomni_access_token';
const REFRESH_TOKEN_KEY = 'ideomni_refresh_token';
const USER_TYPE_KEY = 'ideomni_user_type';
const REMEMBER_ME_KEY = 'ideomni_remember_me';

// Token management interface
interface TokenManager {
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  getUserType(): AuthUserType | null;
  setTokens(tokens: AuthTokens, userType: AuthUserType): void;
  clearTokens(): void;
  refreshToken(): Promise<void>;
}

// Token manager implementation
class TokenManagerImpl implements TokenManager {
  private getStorage(): Storage {
    if (typeof window !== 'undefined') {
      return sessionStorage;
    }
    return sessionStorage; // Fallback
  }

  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return null;
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  }

  getUserType(): AuthUserType | null {
    if (typeof window !== 'undefined') {
      const userType = sessionStorage.getItem(USER_TYPE_KEY);
      return userType as AuthUserType;
    }
    return null;
  }

  setTokens(tokens: AuthTokens, userType: AuthUserType): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
      sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
      sessionStorage.setItem(USER_TYPE_KEY, userType);
    }
  }

  clearTokens(): void {
    if (typeof window !== 'undefined') {
      // Clear from sessionStorage
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(USER_TYPE_KEY);
      
      // Also clear from localStorage for backwards compatibility
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_TYPE_KEY);
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
  }

  async refreshToken(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    const userType = this.getUserType();

    if (!refreshToken || !userType) {
      throw new Error('No refresh token available');
    }

    try {
      const endpoint = userType === 'admin' ? '/admin/refresh-token' : '/user/refresh-token';
      
      // Use the same base URL logic as the main configuration
      const baseUrl = (() => {
        if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
          return '/api/proxy';
        }
        return process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:2999/api';
      })();
      
      const response = await axios.post(`${baseUrl}${endpoint}`, {
        refreshToken,
      }, {
        headers: {
          'Accept-Language': getAcceptLanguageHeader(),
          'Content-Type': 'application/json',
        },
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      this.setTokens({ accessToken, refreshToken: newRefreshToken }, userType);
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }
}

// Create token manager instance
const tokenManager = new TokenManagerImpl();

// Import language utilities
import { getAcceptLanguageHeader } from './language-utils';

// Create Axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token and language headers
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add authentication token
    const accessToken = tokenManager.getAccessToken();
    if (accessToken) {
      config.headers.set('Authorization', `Bearer ${accessToken}`);
    }

    // Add language header
    const language = getAcceptLanguageHeader();
    if (language) {
      config.headers.set('Accept-Language', language);
    }

    // Add user type header for backend routing
    const userType = tokenManager.getUserType();
    if (userType) {
      config.headers.set('X-User-Type', userType);
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullUrl: `${config.baseURL}${config.url}`,
        headers: config.headers,
        data: config.data,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh and errors
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle token expiration
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await tokenManager.refreshToken();
        
        // Retry the original request with new token
        const accessToken = tokenManager.getAccessToken();
        if (accessToken && originalRequest.headers) {
          originalRequest.headers.set('Authorization', `Bearer ${accessToken}`);
        }

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        tokenManager.clearTokens();
        
        // Redirect to appropriate login page
        if (typeof window !== 'undefined') {
          const userType = tokenManager.getUserType();
          const loginPath = userType === 'admin' ? '/sign-in/admin' : '/sign-in';
          window.location.href = loginPath;
        }
        
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    console.error('❌ API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
    });

    return Promise.reject(error);
  }
);

// Export the configured axios instance
export default axiosInstance;

// Export token manager for external use
export { tokenManager };

// Export types for TypeScript
export type { TokenManager }; 