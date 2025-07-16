# Authentication Module

This module provides comprehensive authentication functionality for the Ideomni application, supporting both admin and regular user authentication.

## Features

- **Dual Authentication Types**: Supports both admin and regular user authentication
- **Token Management**: Automatic access and refresh token handling
- **Context-based State Management**: React context for global authentication state
- **Error Handling**: Standardized error handling with user-friendly notifications
- **Type Safety**: Full TypeScript support with comprehensive type definitions

## Backend Response Format

The authentication module is designed to handle backend responses in the following format:

```typescript
{
  success: boolean;
  businessCode: number;
  message: string;
  data: any;
  timestamp: string;
  path: string;
  details?: {
    errorCode: number;
    messageKey: string;
  };
}
```

### Error Handling

When `success: false`, the system:
1. **Checks the `success` field first** - if `false`, uses the `message` field
2. **Shows error notifications** using the `IdeomniMessage` system
3. **Displays inline alerts** in forms for immediate feedback
4. **Extracts additional context** from `businessCode` and `details` when available

Example error response:
```json
{
  "success": false,
  "businessCode": 2000,
  "message": "需要身份验证",
  "data": null,
  "timestamp": "2025-07-16T01:59:32.049Z",
  "path": "/api/user/login",
  "details": {
    "errorCode": 2100,
    "messageKey": "INVALID_CREDENTIALS"
  }
}
```

## Usage

### Basic Authentication

```typescript
import { useAuth } from 'src/lib/auth/hooks';

function LoginComponent() {
  const { login, isLoading, error } = useAuth();
  
  const handleLogin = async () => {
    try {
      await login(credentials, 'user');
      // Success notification shown automatically
    } catch (error) {
      // Error notification shown automatically
      // Error also available in component state
    }
  };
}
```

### Error Utilities

```typescript
import { extractErrorMessage, extractBusinessCode, extractErrorDetails } from 'src/lib/auth/utils';

try {
  await someAuthOperation();
} catch (error) {
  const message = extractErrorMessage(error, 'Operation failed');
  const businessCode = extractBusinessCode(error);
  const details = extractErrorDetails(error);
  
  // Handle error based on business code or details
}
```

## Components

### Forms
- `UserSignInForm` - User authentication form
- `AdminSignInForm` - Admin authentication form

### Context
- `AuthProvider` - Global authentication context provider
- `AuthGuard` - Route protection component

### Hooks
- `useAuth()` - Main authentication hook
- `useLogin()` - Login functionality
- `useAuthError()` - Error state management

## Files Structure

```
src/lib/auth/
├── auth-context.tsx     # React context for auth state
├── auth-service.ts      # API service layer
├── auth-guard.tsx       # Route protection
├── hooks.ts             # Custom hooks
├── types.ts             # TypeScript definitions
├── utils.ts             # Error handling utilities
└── forms/               # Authentication forms
    ├── UserSignInForm.tsx
    └── AdminSignInForm.tsx
```

## Error Codes

### Admin Error Codes (2010-2023)
- `2010` - Invalid credentials
- `2011` - Invalid token
- `2012` - Token required
- `2013` - Token expired
- `2014` - Invalid refresh token
- `2015` - Account inactive
- `2016` - Insufficient permissions

### User Error Codes (2100-2114)
- `2100` - Invalid credentials
- `2101` - Invalid token
- `2102` - Token required
- `2103` - Token expired
- `2104` - Invalid refresh token
- `2105` - Account inactive
- `2106` - Insufficient permissions

## Best Practices

1. **Always check `success` field first** in error responses
2. **Use `extractErrorMessage()` utility** for consistent error handling
3. **Show both notifications and inline errors** for optimal UX
4. **Handle business codes** for specific error scenarios
5. **Provide fallback messages** for unexpected errors

## Security Features

- Automatic token refresh
- Session expiration handling
- Secure token storage
- Route-based access control
- Role and permission checking 