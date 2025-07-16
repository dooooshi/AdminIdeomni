# Backend Response Standards for Frontend Development

## 📋 Overview

This document provides frontend developers with comprehensive information about the backend API response standards, error handling, authentication patterns, and integration guidelines for the New Continents Platform.

## 🌐 Base Configuration

### API Base URL
```
Development: http://localhost:2999/api
Production: https://your-domain.com/api
```

### Interactive Documentation
```
Swagger UI: http://localhost:2999/docs
```

## 📊 Standard Response Format

### Success Response Structure

All successful API responses follow this standardized format:

```typescript
interface ApiResponse<T> {
  /** Boolean indicator of operation success */
  success: boolean;
  
  /** The actual data returned by the API */
  data: T;
  
  /** Human-readable success message */
  message: string;
  
  /** Business status code (0 = success) */
  businessCode: number;
  
  /** ISO timestamp of when the response was generated */
  timestamp: string;
  
  /** The API endpoint path that was requested */
  path: string;
  
  /** Additional metadata */
  extra?: {
    version: string;
    [key: string]: any;
  };
}
```

### Example Success Response

```json
{
  "success": true,
  "data": {
    "id": "cmbg8b4m60000fydxl4jm9w6v",
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "message": "success",
  "businessCode": 0,
  "timestamp": "2024-07-16T10:30:00.000Z",
  "path": "/api/user/profile",
  "extra": {
    "version": "1.0.0"
  }
}
```

## ❌ Error Response Format

### Error Response Structure

All error responses follow this consistent format:

```typescript
interface ErrorResponse {
  /** Always false for errors */
  success: false;
  
  /** Always null for errors */
  data: null;
  
  /** Translated error message */
  message: string;
  
  /** Specific error code (see Error Codes section) */
  businessCode: number;
  
  /** ISO timestamp of when the error occurred */
  timestamp: string;
  
  /** The API endpoint path that was requested */
  path: string;
  
  /** Additional error context (optional) */
  details?: {
    field?: string;
    validationErrors?: string[];
    [key: string]: any;
  };
}
```

### Example Error Response

```json
{
  "success": false,
  "data": null,
  "message": "Invalid admin username/email or password",
  "businessCode": 2010,
  "timestamp": "2024-07-16T10:30:00.000Z",
  "path": "/api/admin/login",
  "details": {
    "field": "password"
  }
}
```

## 🔢 Error Code System

### Error Code Categories

| Range | Category | Description | Typical HTTP Status |
|-------|----------|-------------|-------------------|
| **1000-1999** | System Errors | Database, external services, infrastructure | 500 |
| **2000-2999** | Authentication/Authorization | Login, permissions, tokens | 200*, 401, 403 |
| **3000-3999** | Validation Errors | Input validation, format errors | 400 |
| **4000-4999** | Business Logic | Resource not found, operation conflicts | 200*, 404, 409 |
| **5000-5999** | API Errors | Rate limiting, versioning | 429, 400 |

*Note: Many business and auth errors return HTTP 200 with error details in body

### Common Error Codes

#### Authentication Errors (2000-2099)
```typescript
const AUTH_ERRORS = {
  // Generic Authentication
  2000: 'UNAUTHORIZED',
  2001: 'ACCESS_FORBIDDEN',
  2002: 'INVALID_TOKEN',
  2003: 'TOKEN_EXPIRED',
  2004: 'INVALID_CREDENTIALS',
  
  // Admin Authentication
  2010: 'ADMIN_INVALID_CREDENTIALS',
  2011: 'ADMIN_TOKEN_INVALID',
  2012: 'ADMIN_TOKEN_REQUIRED',
  2013: 'ADMIN_TOKEN_EXPIRED',
  2014: 'ADMIN_REFRESH_TOKEN_INVALID',
  2015: 'ADMIN_ACCOUNT_INACTIVE',
  2016: 'ADMIN_INSUFFICIENT_PERMISSIONS',
  2017: 'ADMIN_NOT_FOUND',
  2018: 'ADMIN_USERNAME_OR_EMAIL_EXISTS',
  2021: 'ADMIN_CANNOT_DELETE_SELF',
  2022: 'ADMIN_CANNOT_MANAGE_SUPERIOR',
  
  // User Authentication
  2100: 'USER_INVALID_CREDENTIALS',
  2101: 'USER_TOKEN_INVALID',
  2102: 'USER_TOKEN_REQUIRED',
  2107: 'USER_NOT_FOUND',
  2108: 'USER_USERNAME_OR_EMAIL_EXISTS',
  // ... more user codes
};
```

#### Validation Errors (3000-3999)
```typescript
const VALIDATION_ERRORS = {
  3000: 'VALIDATION_ERROR',
  3001: 'INVALID_INPUT',
  3002: 'MISSING_REQUIRED_FIELD',
  3003: 'INVALID_FORMAT'
};
```

#### Business Logic Errors (4000-4999)
```typescript
const BUSINESS_ERRORS = {
  4000: 'BUSINESS_ERROR',
  4001: 'RESOURCE_NOT_FOUND',
  4002: 'RESOURCE_ALREADY_EXISTS',
  4003: 'OPERATION_FAILED',
  4004: 'OPERATION_TIMEOUT'
};
```

## 🔐 Authentication Patterns

### Authentication Types

The API supports multiple authentication methods:

1. **Public Access**: No authentication required
2. **User JWT**: Requires valid user Bearer token
3. **Admin JWT**: Requires valid admin Bearer token  
4. **API Key**: Requires valid API key in header
5. **Super Admin Only**: Restricted to Super Admin (Type 1)

### Authentication Headers

```typescript
// JWT Authentication (User/Admin)
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
};

// API Key Authentication
const headers = {
  'X-API-Key': 'your-api-key',
  'Content-Type': 'application/json'
};

// Language Preference (optional)
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'Accept-Language': 'en', // or 'zh'
  'X-Lang': 'zh' // Alternative language header
};
```

### Login Response Format

#### Admin Login Response
```typescript
interface AdminLoginResponse {
  accessToken: string;  // 15-minute expiry
  refreshToken: string; // 7-day expiry
  admin: {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    adminType: 1 | 2; // 1=Super Admin, 2=Limited Admin
    lastLoginAt: string; // ISO timestamp
  };
}
```

#### User Login Response
```typescript
interface UserLoginResponse {
  accessToken: string;  // 15-minute expiry
  refreshToken: string; // 7-day expiry
  user: {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    userType: 1 | 2 | 3; // 1=Manager, 2=Worker, 3=Student
    lastLoginAt: string; // ISO timestamp
  };
}
```

### Token Refresh Pattern

```typescript
// Refresh token request
const refreshResponse = await fetch('/api/admin/refresh-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken })
});

// Response format
interface RefreshResponse {
  accessToken: string; // New access token
}
```

## 🌐 Internationalization (i18n)

### Language Support

The API supports multiple languages with automatic translation:
- **Supported Languages**: English (`en`), Chinese (`zh`)
- **Default Language**: Chinese (`zh`)

### Language Resolution Order

1. **Query Parameter**: `?lang=en`
2. **Accept-Language Header**: `Accept-Language: en`
3. **Custom Header**: `X-Lang: zh`
4. **Browser Default**: From browser settings
5. **Fallback**: Chinese (`zh`)

### Implementation Example

```javascript
// Set language preference
const fetchWithLanguage = async (url, options = {}, language = 'en') => {
  const headers = {
    ...options.headers,
    'Accept-Language': language,
    'X-Lang': language
  };
  
  return fetch(url, { ...options, headers });
};

// Usage
const response = await fetchWithLanguage('/api/user/profile', {
  method: 'GET',
  headers: { 'Authorization': `Bearer ${token}` }
}, 'en');
```

## 🛠️ Frontend Integration Patterns

### Generic API Client Example

```typescript
class ApiClient {
  private baseURL = 'http://localhost:2999/api';
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  // Set authentication tokens
  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  // Generic request method
  async request<T>(
    endpoint: string, 
    options: RequestInit = {},
    language: string = 'en'
  ): Promise<ApiResponse<T>> {
    const headers = {
      'Content-Type': 'application/json',
      'Accept-Language': language,
      ...options.headers
    };

    // Add authentication if available
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    // Handle token refresh if needed
    if (data.businessCode === 2011 || data.businessCode === 2101) {
      await this.refreshTokens();
      // Retry original request
      headers['Authorization'] = `Bearer ${this.accessToken}`;
      const retryResponse = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers
      });
      return retryResponse.json();
    }

    return data;
  }

  // Refresh token logic
  private async refreshTokens() {
    if (!this.refreshToken) throw new Error('No refresh token available');
    
    const response = await fetch(`${this.baseURL}/admin/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken })
    });

    const data = await response.json();
    if (data.success) {
      this.accessToken = data.data.accessToken;
    } else {
      // Redirect to login
      throw new Error('Token refresh failed');
    }
  }
}
```

### Error Handling Patterns

```typescript
// Error handling utility
class ErrorHandler {
  static handle(error: ErrorResponse): string {
    switch (error.businessCode) {
      // Authentication errors
      case 2010:
      case 2100:
        return 'Invalid username or password';
      
      case 2011:
      case 2101:
        return 'Session expired. Please login again';
      
      case 2016:
      case 2106:
        return 'You do not have permission to perform this action';
      
      // Validation errors
      case 3000:
        return error.details?.validationErrors?.join(', ') || 'Invalid input';
      
      case 3002:
        return `Missing required field: ${error.details?.field || 'unknown'}`;
      
      // Business errors
      case 4001:
        return 'Resource not found';
      
      case 4002:
        return 'Resource already exists';
      
      // System errors
      case 1000:
      case 1002:
        return 'System error. Please try again later';
      
      case 5001:
        return 'Too many requests. Please wait and try again';
      
      default:
        return error.message || 'An unexpected error occurred';
    }
  }

  static isAuthError(businessCode: number): boolean {
    return businessCode >= 2000 && businessCode < 3000;
  }

  static shouldRetry(businessCode: number): boolean {
    // Retry for system errors and timeouts
    return businessCode === 1000 || businessCode === 4004;
  }
}
```

### React Hook Example

```typescript
import { useState, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const apiClient = new ApiClient(); // Your API client instance

  const execute = useCallback(async (
    endpoint: string,
    options?: RequestInit,
    language?: string
  ) => {
    setState({ data: null, loading: true, error: null });

    try {
      const response = await apiClient.request<T>(endpoint, options, language);
      
      if (response.success) {
        setState({ data: response.data, loading: false, error: null });
      } else {
        const errorMessage = ErrorHandler.handle(response);
        setState({ data: null, loading: false, error: errorMessage });
      }
    } catch (err) {
      setState({ 
        data: null, 
        loading: false, 
        error: 'Network error. Please check your connection.' 
      });
    }
  }, [apiClient]);

  return { ...state, execute };
}

// Usage in component
function UserProfile() {
  const { data: user, loading, error, execute } = useApi<User>();

  useEffect(() => {
    execute('/user/profile');
  }, [execute]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return null;

  return <div>Welcome, {user.firstName}!</div>;
}
```

## 📝 Common API Patterns

### Pagination

```typescript
interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

// Request with pagination
const response = await apiClient.request<PaginatedResponse<User>>(
  '/admin/users?page=1&pageSize=20&search=john'
);
```

### Bulk Operations

```typescript
interface BulkOperationResponse {
  updated: number;
  failed: number;
  details: Array<{
    id: string;
    success: boolean;
    error?: string;
  }>;
}

// Bulk update request
const response = await apiClient.request<BulkOperationResponse>(
  '/admin/activities/bulk-update',
  {
    method: 'PUT',
    body: JSON.stringify({
      ids: ['id1', 'id2', 'id3'],
      updates: { status: 'active' }
    })
  }
);
```

### File Upload

```typescript
// File upload with progress
const uploadFile = async (file: File, onProgress?: (progress: number) => void) => {
  const formData = new FormData();
  formData.append('file', file);

  const xhr = new XMLHttpRequest();
  
  return new Promise<ApiResponse<{url: string}>>((resolve, reject) => {
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress((e.loaded / e.total) * 100);
      }
    };

    xhr.onload = () => {
      resolve(JSON.parse(xhr.responseText));
    };

    xhr.onerror = () => {
      reject(new Error('Upload failed'));
    };

    xhr.open('POST', `${baseURL}/files/upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    xhr.send(formData);
  });
};
```

## 🔍 Debugging and Development

### Request/Response Logging

```typescript
// Enhanced API client with logging
class ApiClientWithLogging extends ApiClient {
  async request<T>(endpoint: string, options: RequestInit = {}, language: string = 'en') {
    // Log request
    console.group(`🌐 API Request: ${options.method || 'GET'} ${endpoint}`);
    console.log('Headers:', options.headers);
    console.log('Body:', options.body);
    console.groupEnd();

    const startTime = Date.now();
    const response = await super.request<T>(endpoint, options, language);
    const duration = Date.now() - startTime;

    // Log response
    console.group(`📨 API Response: ${endpoint} (${duration}ms)`);
    console.log('Success:', response.success);
    console.log('Business Code:', response.businessCode);
    console.log('Data:', response.data);
    if (!response.success) {
      console.error('Error:', response.message);
      console.error('Details:', response.details);
    }
    console.groupEnd();

    return response;
  }
}
```

### Environment Configuration

```typescript
// Environment-based configuration
const config = {
  development: {
    apiBaseUrl: 'http://localhost:2999/api',
    enableLogging: true,
    enableMocking: false
  },
  production: {
    apiBaseUrl: 'https://api.yourcontinents.com/api',
    enableLogging: false,
    enableMocking: false
  }
};

const currentConfig = config[process.env.NODE_ENV || 'development'];
```

## 🚀 Best Practices

### 1. Response Validation

```typescript
// Validate response structure
function isValidApiResponse<T>(response: any): response is ApiResponse<T> {
  return (
    typeof response === 'object' &&
    typeof response.success === 'boolean' &&
    typeof response.businessCode === 'number' &&
    typeof response.message === 'string' &&
    typeof response.timestamp === 'string'
  );
}
```

### 2. Error Boundaries

```typescript
// React error boundary for API errors
class ApiErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log API errors to monitoring service
    console.error('API Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

### 3. Optimistic Updates

```typescript
// Optimistic update pattern
const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  // Optimistically update UI
  setUser(current => ({ ...current, ...updates }));

  try {
    const response = await apiClient.request<User>(
      `/user/${userId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates)
      }
    );

    if (response.success) {
      setUser(response.data);
    } else {
      // Revert optimistic update
      setUser(originalUser);
      throw new Error(response.message);
    }
  } catch (error) {
    // Revert and show error
    setUser(originalUser);
    setError(error.message);
  }
};
```

## 📚 Additional Resources

### Related Documentation
- [API Endpoint Reference](../auth-related/admin-api-endpoints.md)
- [Authentication Flow](../auth-related/admin-auth-flow.md)
- [Security Guidelines](../security/README.md)
- [Exception Handling](../features/exception-handling.md)

### Development Tools
- **Swagger UI**: http://localhost:2999/docs
- **Postman Collection**: Available on request
- **TypeScript Types**: Generated from DTOs

### Support
- **API Documentation**: Complete Swagger documentation available
- **Error Tracking**: All errors include `businessCode` for precise identification
- **Logging**: Request IDs included for tracing (`x-request-id` header)

---

*Last Updated: July 16, 2024*
*API Version: 1.0.0* 