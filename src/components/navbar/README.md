# Role-Based Navigation System

This directory contains the role-based navigation components that provide different navigation experiences for admin and user roles.

## Overview

The navigation system automatically displays appropriate menu items based on the user's role and admin type:

- **Super Admin (adminType: 1)**: Full access to all features including Map, Dashboards (Project, Analytics, Finance, Crypto), E-commerce, Help Center, Notifications, Activities, and exclusive Admin Management features (Admin Users, System Logs, System Settings)
- **Limited Admin (adminType: 2)**: Restricted access to Map, Notifications, and Activities only - excluding all Dashboards, E-commerce, Help Center, Finance, Crypto, and Admin Management features
- **Regular users**: Limited access to only the Project dashboard

## Components

### AdminNavbar
- **File**: `AdminNavbar.tsx`
- **Purpose**: Navigation component for admin users with role-based feature access
- **Features**: Dynamically renders navigation based on adminType:
  - **Super Admin (adminType: 1)**: Complete navigation tree with all application sections including Admin Management
  - **Limited Admin (adminType: 2)**: Restricted navigation with no dashboard access and limited app access

### UserNavbar
- **File**: `UserNavbar.tsx`
- **Purpose**: Navigation component for regular users with limited access
- **Features**: Only displays Project dashboard access

### RoleBasedNavbar
- **File**: `RoleBasedNavbar.tsx`
- **Purpose**: Smart component that automatically selects the appropriate navbar based on user role
- **Usage**: Drop-in replacement for the standard Navigation component

## Configuration

Navigation configurations are defined in `src/configs/navigationConfig.ts`:

- `superAdminNavigationConfig`: Full navigation tree for super admin users (adminType: 1)
- `limitedAdminNavigationConfig`: Restricted navigation tree for limited admin users (adminType: 2)
- `adminNavigationConfig`: Legacy config, defaults to super admin config for backward compatibility
- `userNavigationConfig`: Limited navigation tree for regular users
- `getNavigationConfig(userType, adminType?)`: Function to get the appropriate config based on user type and admin type
- `getAdminNavigationConfig(adminType)`: Specific function to get admin navigation based on admin type

## Authentication Integration

The system integrates with the authentication system through:

- User type detection: `'admin'` | `'user'`
- Admin type detection: `1` (Super Admin) | `2` (Limited Admin)
- Permission checking: Each navigation item has `auth: ['admin']` or `auth: ['user']`
- Automatic role-based filtering: Items are only shown if the user has the required permissions
- Dynamic navigation selection: AdminNavbar automatically selects the appropriate navigation config based on the authenticated user's adminType

## Usage

### Automatic Role Detection (Recommended)

The existing Navigation component in the theme layouts automatically uses role-based navigation through the updated `useNavigation` hook:

```tsx
import Navigation from 'src/components/theme-layouts/components/navigation/Navigation';

// This automatically shows the correct navigation based on user role
<Navigation layout="vertical" />
```

### Manual Role-Based Component

For custom implementations, you can use the specific navbar components:

```tsx
import { AdminNavbar, UserNavbar, RoleBasedNavbar } from 'src/components/navbar';

// Automatic role detection
<RoleBasedNavbar layout="vertical" />

// Manual admin navbar
<AdminNavbar layout="vertical" />

// Manual user navbar
<UserNavbar layout="vertical" />
```

## User Types

### Admin Users

#### Super Admin (adminType: 1)
- **Role**: `'admin'` with `adminType: 1`
- **Access**: Complete application access including admin management features
- **Navigation**: All features including advanced tools, management panels, admin user management, system logs, and system settings

#### Limited Admin (adminType: 2)
- **Role**: `'admin'` with `adminType: 2`
- **Access**: Restricted application access with no dashboard access
- **Navigation**: Map, Notifications, and Activities only

### Regular Users
- **Role**: `'user'`
- **Access**: Limited to essential project management
- **Navigation**: Only Project dashboard access

## Implementation Details

### Permission System
- Each navigation item includes an `auth` property specifying required roles
- The `hasPermission` function checks user role against required permissions
- Items without proper permissions are automatically hidden

### Translation Support
- All navigation items support internationalization
- Translation keys are defined in `src/@i18n/locales/*/navigation.ts`
- Automatic translation occurs through the `translate` property

### Mobile Support
- Responsive design with mobile-specific behaviors
- Mobile navigation automatically closes after item selection
- Touch-friendly interface optimizations

## Extending the System

### Adding New User Roles
1. Update the auth system types in `src/lib/auth/types.ts`
2. Create new navigation configuration in `navigationConfig.ts`
3. Update the `getNavigationConfig` function
4. Add new navbar component if needed

### Adding New Navigation Items
1. Add item to appropriate navigation config (admin/user)
2. Include proper `auth` property
3. Add translation keys to i18n files
4. Test permission checking

### Customizing Permissions
- Modify the `auth` arrays in navigation items
- Update permission checking logic in `useNavigation` hook
- Consider role hierarchy and inheritance

## Best Practices

1. **Security**: Always verify permissions on the backend - frontend navigation is for UX only
2. **Consistency**: Use the same role names throughout the application
3. **Testing**: Test navigation with different user roles and permissions
4. **Performance**: Role-based configs are more efficient than runtime filtering
5. **Maintenance**: Keep navigation configs in sync with actual application features 