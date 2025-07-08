# AuthGuard setState During Render Fix

## Problem

The application was encountering a React error:

```
Error: Cannot update a component (`Router`) while rendering a different component (`AuthGuard`). 
To locate the bad setState() call inside `AuthGuard`, follow the stack trace as described in 
https://react.dev/link/setstate-in-render
```

## Root Cause

The error occurred because the `AuthGuard` component was calling `router.push()` directly during the render phase, which triggers a state update in the Next.js router while React is still rendering the component.

### Problematic Code

```typescript
// ❌ BAD: Calling router.push() during render
export function AuthGuard({ children, userType, requireAuth = true }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // This causes the error!
  if (requireAuth && !isAuthenticated) {
    router.push('/sign-in'); // ❌ setState during render
    return <LoadingComponent />;
  }

  return <>{children}</>;
}
```

## Solution

Move the redirect logic to a `useEffect` hook, which runs after the render phase:

### Fixed Code

```typescript
// ✅ GOOD: Using useEffect for side effects
export function AuthGuard({ children, userType, requireAuth = true }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Handle redirects in useEffect to avoid setState during render
  React.useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      const signInPath = userType === 'admin' ? '/sign-in/admin' : '/sign-in';
      router.push(signInPath);
    }
  }, [isLoading, requireAuth, isAuthenticated, userType, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return <LoadingComponent />;
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Return loading component while redirect is happening
    return <LoadingComponent />;
  }

  return <>{children}</>;
}
```

## Changes Made

### 1. AuthGuard Component (`src/lib/auth/auth-guard.tsx`)

**Before:**
- `router.push()` called directly in render logic
- Caused React setState during render error

**After:**
- `router.push()` moved to `useEffect` hook
- Proper dependency array for effect
- Loading state shown while redirect is happening

### 2. GuestGuard Component

**Before:**
```typescript
// ❌ BAD: Direct router.push() during render
if (isAuthenticated) {
  router.push('/dashboards');
  return <LoadingComponent />;
}
```

**After:**
```typescript
// ✅ GOOD: useEffect for redirects
React.useEffect(() => {
  if (!isLoading && isAuthenticated) {
    router.push('/dashboards');
  }
}, [isLoading, isAuthenticated, router]);

if (isAuthenticated) {
  return <LoadingComponent />; // Show loading while redirect happens
}
```

## Key Principles

### 1. Side Effects in useEffect
- **Redirects are side effects** - they change the application state
- **Side effects must run after render** - use `useEffect`
- **Never call state-changing functions during render**

### 2. Proper Dependencies
```typescript
React.useEffect(() => {
  // Effect logic
}, [dependency1, dependency2, dependency3]); // Include all dependencies
```

### 3. Loading States
- Show loading component while redirect is happening
- Prevents flash of unauthorized content
- Provides better user experience

## React Rules Violated

### Rule: Don't Call State-Changing Functions During Render

**Forbidden:**
```typescript
function Component() {
  const router = useRouter();
  
  // ❌ These cause setState during render errors:
  router.push('/path');           // Navigation
  setUser(newUser);              // State update
  dispatch(action);              // Redux dispatch
  localStorage.setItem('key', 'value'); // Sometimes triggers re-renders
  
  return <div>Content</div>;
}
```

**Allowed:**
```typescript
function Component() {
  const router = useRouter();
  
  // ✅ These are safe during render:
  const computed = useMemo(() => calculateValue(), [deps]);
  const isVisible = someCondition && anotherCondition;
  const className = `base-class ${isActive ? 'active' : ''}`;
  
  // ✅ Side effects in useEffect:
  React.useEffect(() => {
    router.push('/path');
    setUser(newUser);
    dispatch(action);
  }, [dependencies]);
  
  return <div className={className}>Content</div>;
}
```

## Testing the Fix

### 1. Manual Testing
1. Start the development server: `pnpm run dev`
2. Navigate to a protected route while unauthenticated
3. Verify redirect happens without React errors
4. Check browser console for no error messages

### 2. Using Test Components
```typescript
import { TestAuthGuard, TestRedirectBehavior, AuthDebugInfo } from '@lib/auth/test-auth-guard';

// Use in your component or test
<TestAuthGuard />
<TestRedirectBehavior />
<AuthDebugInfo />
```

### 3. Browser Console Testing
```javascript
// Test functions available globally
TestAuthGuard();
TestRedirectBehavior();
AuthDebugInfo();
```

## Benefits of the Fix

1. **No More React Errors**: Eliminates setState during render warnings
2. **Better Performance**: Proper React lifecycle management
3. **Predictable Behavior**: Redirects happen at the right time
4. **Improved UX**: Loading states during transitions
5. **Future-Proof**: Follows React best practices

## Related Patterns

### Other Components That May Have Similar Issues

```typescript
// ❌ BAD: These patterns also cause setState during render
function BadComponent() {
  const [data, setData] = useState(null);
  
  // Don't do this during render:
  if (!data) {
    fetchData().then(setData); // ❌ Async state update
  }
  
  if (someCondition) {
    window.location.href = '/redirect'; // ❌ Navigation
  }
  
  return <div>{data}</div>;
}

// ✅ GOOD: Use useEffect for side effects
function GoodComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    if (!data) {
      fetchData().then(setData); // ✅ Side effect in useEffect
    }
  }, [data]);
  
  useEffect(() => {
    if (someCondition) {
      window.location.href = '/redirect'; // ✅ Navigation in useEffect
    }
  }, [someCondition]);
  
  return <div>{data}</div>;
}
```

## Summary

The fix moves all navigation/redirect logic from the render phase to `useEffect` hooks, eliminating the "setState during render" error while maintaining the same functionality. This follows React best practices and ensures predictable, error-free behavior.

The authentication guards now properly handle:
- ✅ Redirects without React errors
- ✅ Loading states during transitions
- ✅ Proper dependency management
- ✅ Clean separation of render and side effects 