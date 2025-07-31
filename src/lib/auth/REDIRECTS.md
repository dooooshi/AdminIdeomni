# Role-Based Redirect System

This system automatically redirects users to their appropriate default pages based on their role and permissions.

## Redirect Rules

### Admin Users (`userType: 'admin'`)
- **Super Admin** (`adminType: 1`) → `/activity-management`
- **Limited Admin** (`adminType: 2`) → `/activity-management`

### Regular Users (`userType: 'user'`)
- **Manager** (`userType: 1`) → `/team-administration`
- **Worker** (`userType: 2`) → `/team-management/dashboard`  
- **Student** (`userType: 3`) → `/team-management/dashboard`

### Unauthenticated Users
- Redirected to → `/sign-in`

## Implementation

### Main Page Redirect
The main page (`/`) uses the `RoleBasedRedirect` component which:
1. Checks authentication status
2. Determines user role and type
3. Redirects to appropriate dashboard
4. Shows loading state during redirect

### Login Redirects
Both admin and user login forms redirect to `/` after successful authentication:
- `AdminSignInForm` → `/` → Role-based redirect
- `UserSignInForm` → `/` → Role-based redirect

### Guest Guard
The `GuestGuard` component redirects already-authenticated users from login pages to `/` which then handles the role-based routing.

### Breadcrumb Navigation
All breadcrumb "Dashboard" links now point to `/` instead of the removed `/dashboards` route.

### Utility Functions
- `getDefaultDashboardPath()` - Returns default path for user role
- `getUserRoleDisplayName()` - Returns human-readable role name
- `canUserAccessPath()` - Checks if user can access specific path

### Usage Example

```tsx
import { RoleBasedRedirect } from '@/components/auth';

function HomePage() {
  return <RoleBasedRedirect fallbackPath="/sign-in" />;
}
```

```tsx
import { getDefaultDashboardPath } from '@/lib/auth';

const redirectPath = getDefaultDashboardPath(userType, user);
router.push(redirectPath);
```

## Path Structure

```
/activity-management          # Admin dashboard
/team-administration         # Manager dashboard  
/team-management/dashboard    # Student/Worker dashboard
/sign-in                     # Authentication page
```

## Navigation Integration

The navigation configuration in `src/configs/navigationConfig.ts` is already set up to show appropriate menu items based on user roles, ensuring users only see navigation items they have access to.