# CORS Solution for Ideomni React/Next.js Project

## Problem

When making requests from your frontend (localhost:3000) to your backend API (localhost:2999), you encounter CORS errors:

```
Access to XMLHttpRequest at 'http://localhost:2999/api/admin/login' from origin 'http://localhost:3000' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solution: Next.js API Proxy

Instead of trying to configure CORS on your backend (which can be complex and security-sensitive), we've implemented a **Next.js API proxy** that routes all API requests through your frontend server, eliminating CORS issues entirely.

## How It Works

### 1. Development Mode
- **Frontend**: `http://localhost:3000`
- **API Requests**: `http://localhost:3000/api/proxy/*` → `http://localhost:2999/api/*`
- **No CORS Issues**: Same-origin requests (frontend to frontend)

### 2. Production Mode
- **Frontend**: Your production domain
- **API Requests**: Direct to your backend API
- **CORS Headers**: Handled by your backend

## Implementation Details

### Proxy Route (`src/app/api/proxy/[...path]/route.ts`)

This Next.js API route:
- Catches all requests to `/api/proxy/*`
- Forwards them to your backend API
- Handles all HTTP methods (GET, POST, PUT, DELETE, PATCH, OPTIONS)
- Preserves headers and request bodies
- Returns responses with proper CORS headers

### Automatic Configuration (`src/lib/http/axios-config.ts`)

The Axios configuration automatically:
- Uses `/api/proxy` in development
- Uses direct API URLs in production
- Handles environment detection
- Maintains all existing functionality

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in your project root:

```bash
# Backend API URL (used by proxy in development)
API_URL=http://localhost:2999/api

# Public API URL (used in production)
NEXT_PUBLIC_API_URL=http://localhost:2999/api

# Ensure development mode
NODE_ENV=development
```

### 2. Start Your Servers

```bash
# Terminal 1: Start your backend API
# (Your backend should be running on localhost:2999)

# Terminal 2: Start Next.js development server
pnpm run dev
```

### 3. Test the Solution

Open your browser console and run:

```javascript
// Test the proxy routing
testProxyRouting()

// Test the full API client
testCorsProxy()
```

## Request Flow

### Before (CORS Error)
```
Frontend (localhost:3000) → Backend (localhost:2999) ❌ CORS Error
```

### After (Working)
```
Frontend (localhost:3000) → Next.js Proxy (localhost:3000/api/proxy) → Backend (localhost:2999) ✅
```

## API Usage Examples

Your existing code doesn't need to change:

```typescript
import { apiClient } from '@lib/http';

// This automatically uses the proxy in development
const response = await apiClient.postAuth('/admin/login', {
  identifier: 'admin@example.com',
  password: 'password123'
});
```

### URL Transformation

In development:
- Your code: `apiClient.post('/admin/login', data)`
- Actual request: `POST http://localhost:3000/api/proxy/admin/login`
- Proxy forwards to: `POST http://localhost:2999/api/admin/login`

In production:
- Your code: `apiClient.post('/admin/login', data)`
- Actual request: `POST https://your-api.com/api/admin/login`

## Debugging

### Check Proxy Logs

The proxy logs all requests in development:

```
🔄 Proxying POST admin/login to http://localhost:2999/api/admin/login
📤 Forward Headers: { authorization: 'Bearer ...', content-type: 'application/json' }
📤 Request Body: {"identifier":"admin@example.com","password":"password123"}
📥 Backend Response (200): {"success":true,"data":{...}}
```

### Check Network Tab

In browser DevTools → Network tab:
- Look for requests to `/api/proxy/*`
- Status should be 200 (not CORS error)
- Response should contain your API data

### Test Functions

Use the built-in test functions:

```javascript
// Test proxy routing directly
testProxyRouting()

// Test full API client with authentication
testCorsProxy()
```

## Troubleshooting

### 1. Proxy Not Working

**Symptoms**: Still getting CORS errors

**Solutions**:
- Ensure `.env.local` has correct `API_URL`
- Restart Next.js dev server: `pnpm run dev`
- Check console for proxy logs
- Verify `NODE_ENV=development`

### 2. Backend Connection Issues

**Symptoms**: Proxy returns 500 errors

**Solutions**:
- Ensure backend is running on localhost:2999
- Check `API_URL` in `.env.local`
- Verify backend API endpoints exist
- Check backend logs for errors

### 3. Authentication Issues

**Symptoms**: 401 Unauthorized errors

**Solutions**:
- Verify credentials are correct
- Check if backend requires specific headers
- Ensure token storage is working
- Check browser localStorage for tokens

### 4. Headers Not Forwarded

**Symptoms**: Backend doesn't receive expected headers

**Solutions**:
- Check proxy logs for forwarded headers
- Verify headers are in the `headersToForward` list
- Add custom headers to proxy configuration if needed

## Production Deployment

### Environment Variables

Set these in your production environment:

```bash
# Production API URL
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api

# Backend URL (for server-side requests if needed)
API_URL=https://your-api-domain.com/api

# Production mode
NODE_ENV=production
```

### CORS Configuration

In production, your backend should have proper CORS headers:

```javascript
// Example backend CORS configuration
app.use(cors({
  origin: ['https://your-frontend-domain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language', 'X-User-Type']
}));
```

## Alternative Solutions

If you prefer not to use the proxy approach:

### 1. Backend CORS Configuration

Configure your backend to allow CORS:

```javascript
// Express.js example
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### 2. Next.js Rewrites

Add to `next.config.ts`:

```typescript
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:2999/api/:path*',
      },
    ];
  },
};
```

### 3. Browser Extensions

For development only, use browser extensions like "CORS Unblock" (not recommended for production).

## Benefits of Proxy Solution

1. **No Backend Changes**: Your backend doesn't need CORS configuration
2. **Environment Agnostic**: Works in any environment
3. **Security**: No wildcard CORS origins needed
4. **Debugging**: Full request/response logging
5. **Flexibility**: Easy to modify headers or add middleware
6. **Production Ready**: Seamless transition to direct API calls

## Summary

The proxy solution eliminates CORS issues by:
- Routing API requests through your Next.js server in development
- Maintaining the same API interface in your code
- Automatically switching to direct API calls in production
- Providing comprehensive logging and debugging capabilities

Your authentication system now works seamlessly without CORS restrictions! 