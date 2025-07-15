# HTTP Client Implementation

This module provides a comprehensive HTTP client implementation using Axios with automatic authentication, language headers, and error handling.

## Features

- **Global Axios Configuration**: Pre-configured Axios instance with interceptors
- **Automatic Authentication**: JWT tokens automatically added to requests
- **Language Support**: Accept-Language header based on i18n settings
- **Token Refresh**: Automatic token refresh on expiration
- **Error Handling**: Comprehensive error logging and handling
- **TypeScript Support**: Fully typed API client with generic methods

## Components

### 1. Axios Configuration (`axios-config.ts`)

Pre-configured Axios instance with:
- Base URL from environment variables
- Request/response interceptors
- Automatic token management
- Language header injection
- Error handling and retry logic

### 2. API Client (`api-client.ts`)

High-level API client with typed methods:
- Generic HTTP methods (GET, POST, PUT, PATCH, DELETE)
- File upload/download support
- Auth-specific methods for authentication endpoints
- Response wrapping and error handling

### 3. Token Manager

Handles JWT token storage and refresh:
- localStorage persistence
- Automatic token refresh
- User type tracking
- Cross-tab synchronization

## Usage Examples

### Basic API Calls

```typescript
import { apiClient } from '@lib/http';

// GET request
const users = await apiClient.get<User[]>('/users');

// POST request
const newUser = await apiClient.post<User>('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// PUT request
const updatedUser = await apiClient.put<User>(`/users/${id}`, userData);

// DELETE request
await apiClient.delete(`/users/${id}`);
```

### Authentication Endpoints

```typescript
import { apiClient } from '@lib/http';

// Login (automatically handles token storage)
const loginResponse = await apiClient.postAuth<LoginResponse>('/admin/login', {
  identifier: 'admin@example.com',
  password: 'password'
});

// Get profile (automatically includes auth headers)
const profile = await apiClient.getAuth<AdminUser>('/admin/profile');

// Update profile
const updatedProfile = await apiClient.putAuth<AdminUser>('/admin/profile', {
  firstName: 'John',
  lastName: 'Doe'
});
```

### File Operations

```typescript
import { apiClient } from '@lib/http';

// Upload file
const formData = new FormData();
formData.append('file', file);
const uploadResult = await apiClient.upload<UploadResponse>('/upload', formData);

// Download file
const fileBlob = await apiClient.download('/files/document.pdf');
```

### Custom Requests

```typescript
import { axiosInstance } from '@lib/http';

// Direct Axios usage with all interceptors
const response = await axiosInstance.request({
  method: 'GET',
  url: '/custom-endpoint',
  params: { page: 1, limit: 10 },
  timeout: 5000
});
```

### Token Management

```typescript
import { tokenManager } from '@lib/http';

// Check authentication status
const isAuthenticated = !!tokenManager.getAccessToken();

// Get current user type
const userType = tokenManager.getUserType(); // 'admin' | 'user' | null

// Manual token refresh
await tokenManager.refreshToken();

// Clear tokens (logout)
tokenManager.clearTokens();
```

### Language Headers

```typescript
import { getCurrentLanguage, getAcceptLanguageHeader, createLanguageHeaders } from '@lib/http';

// Get current language code
const currentLang = getCurrentLanguage(); // 'en-US', 'zh-CN', etc.

// Get properly formatted Accept-Language header value
const acceptLang = getAcceptLanguageHeader(); // 'en-US', 'zh-CN', etc.

// Create headers object with Accept-Language
const headers = createLanguageHeaders({
  'Custom-Header': 'custom-value'
});
// Result: { 'Accept-Language': 'en-US', 'Custom-Header': 'custom-value' }

// Use with custom fetch calls
const response = await fetch('/api/endpoint', {
  headers: createLanguageHeaders({
    'Content-Type': 'application/json'
  })
});
```

## Configuration

### Environment Variables

Set the API base URL in your environment:

```bash
# Backend API URL (server-side)
API_URL=http://localhost:2999/api

# Public API URL (client-side, production)
NEXT_PUBLIC_API_URL=http://localhost:2999/api
```

### CORS Solution

The implementation automatically handles CORS issues in development by using a Next.js API proxy:

- **Development**: Routes through `/api/proxy/` to avoid CORS
- **Production**: Uses direct API URLs with proper CORS headers from backend

Create a `.env.local` file in your project root:

```bash
# .env.local
API_URL=http://localhost:2999/api
NEXT_PUBLIC_API_URL=http://localhost:2999/api
NODE_ENV=development
```

### TypeScript Paths

The module is configured with TypeScript path mapping:

```json
{
  "compilerOptions": {
    "paths": {
      "@lib/http/*": ["./src/lib/http/*"]
    }
  }
}
```

## Headers Automatically Added

### Authentication Headers
- `Authorization: Bearer <token>` - JWT access token
- `X-User-Type: admin|user` - User type for backend routing

### Language Headers
- `Accept-Language: en-US|zh-CN|...` - Based on i18n settings
  - Automatically detects current language from i18n instance
  - Falls back to localStorage (`i18nextLng`) if i18n not available
  - Finally falls back to browser language or 'en'
  - Supports proper locale formatting (e.g., 'en' becomes 'en-US')

### Content Headers
- `Content-Type: application/json` - For JSON requests
- `Content-Type: multipart/form-data` - For file uploads

## Error Handling

### Automatic Token Refresh
- Detects 401 responses
- Automatically refreshes expired tokens
- Retries original request with new token
- Redirects to login on refresh failure

### Error Logging
- Development: Detailed console logging
- Production: Error tracking and reporting
- Request/response debugging information

### Error Types
```typescript
try {
  const data = await apiClient.get('/protected-endpoint');
} catch (error) {
  if (error.response?.status === 401) {
    // Unauthorized - redirect to login
  } else if (error.response?.status === 403) {
    // Forbidden - insufficient permissions
  } else if (error.response?.status >= 500) {
    // Server error - show error message
  }
}
```

## Integration with Authentication System

The HTTP client is fully integrated with the authentication system:

```typescript
import { useAuth } from '@lib/auth';
import { apiClient } from '@lib/http';

function MyComponent() {
  const { user, logout } = useAuth();

  const handleApiCall = async () => {
    try {
      // API call automatically includes auth headers
      const data = await apiClient.get('/protected-data');
      // Handle success
    } catch (error) {
      if (error.response?.status === 401) {
        // Token expired, user will be redirected to login
        logout();
      }
    }
  };

  return <button onClick={handleApiCall}>Make API Call</button>;
}
```

## Best Practices

1. **Use the API Client**: Prefer `apiClient` over direct `axiosInstance` usage
2. **Type Your Responses**: Always provide type parameters for better TypeScript support
3. **Handle Errors**: Implement proper error handling for different status codes
4. **Use Auth Methods**: Use `postAuth`, `getAuth`, etc. for authentication endpoints
5. **Environment Configuration**: Set proper API URLs for different environments

## Migration from Fetch

If migrating from fetch-based code:

```typescript
// Old fetch-based code
const response = await fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(userData)
});
const data = await response.json();

// New Axios-based code
const response = await apiClient.post<User>('/users', userData);
const data = response.data;
```

The new implementation automatically handles:
- Content-Type headers
- Authorization headers
- JSON parsing
- Error handling
- Token refresh
- Language headers 