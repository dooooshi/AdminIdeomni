# User Management Module

A comprehensive user management system built for the Ideomni platform, providing full CRUD operations, analytics, and advanced user administration features based on the Admin User Management API.

## Overview

This module implements a complete superadmin user management solution with advanced filtering, bulk operations, analytics, and export capabilities. It follows the established patterns from the existing admin management system while providing enhanced functionality for user administration.

## Structure

```
src/components/user-management/
├── UserList.tsx              # User accounts table with advanced filtering
├── UserForm.tsx              # Create/edit user form with multi-step wizard
├── UserStatistics.tsx        # Analytics dashboard with growth metrics
├── index.ts                  # Component exports
└── README.md                 # This documentation
```

## Features

### 1. User Account Management
- **Create Users**: Multi-step wizard form with validation for creating new user accounts
- **Edit Users**: Update existing user information, permissions, and status
- **Delete Users**: Soft delete with confirmation dialog and audit trail
- **View Users**: Detailed user information with activity statistics
- **Password Reset**: Administrative password reset with configurable options

### 2. Advanced Search and Filtering
- **Text Search**: Search across username, email, first name, and last name
- **User Type Filter**: Filter by Manager (1), Worker (2), or Student (3)
- **Status Filter**: Filter by active/inactive status
- **Activity Filter**: Filter users with/without activity participation
- **Date Range Filters**: Filter by creation date and last login date
- **Role-based Filtering**: Filter by assigned user roles
- **Sort Capabilities**: Sort by username, email, creation date, last login

### 3. Analytics and Statistics
- **User Distribution**: Visual breakdown by user types and status
- **Growth Analytics**: Registration trends and percentage changes
- **Activity Metrics**: User participation and engagement statistics
- **Recent Registrations**: Today, this week, this month counters
- **Real-time Updates**: Live data refresh capabilities

### 4. Bulk Operations
- **Bulk Selection**: Multi-select users for batch operations
- **Bulk Updates**: Update multiple users simultaneously
- **Bulk Status Changes**: Activate/deactivate multiple users
- **Export Selection**: Export selected users data

### 5. Security Features
- **Permission-based Access**: Different features based on admin permissions
- **Input Validation**: Comprehensive form validation with error messages
- **Audit Logging**: Complete operation logging for compliance
- **Secure Defaults**: Forms default to secure/restricted options
- **Password Management**: Secure password reset with configurable policies

## Components

### UserList

Main component for displaying and managing user accounts with advanced features.

```tsx
import { UserList } from '@/components/user-management';

<UserList
  onCreateUser={() => void}
  onEditUser={(user: AdminUserDetailsDto) => void}
  onViewUser={(user: AdminUserDetailsDto) => void}
  onResetPassword={(user: AdminUserDetailsDto) => void}
  refreshTrigger={number}
/>
```

**Features:**
- Paginated data table with sorting capabilities
- Advanced search with debounced input
- Multi-level filtering system
- Bulk selection and operations
- Real-time data updates
- Responsive design for mobile/desktop

### UserForm

Multi-step modal form for creating and editing user accounts.

```tsx
import { UserForm } from '@/components/user-management';

<UserForm
  open={boolean}
  onClose={() => void}
  user={AdminUserDetailsDto | null}    // null for create, user object for edit
  onSuccess={(user: AdminUserDetailsDto) => void}
/>
```

**Features:**
- Three-step wizard interface (Basic Info, Password, Permissions)
- Form validation with Yup schemas
- Password visibility toggles
- User type selection with descriptions
- Role assignment with autocomplete
- Status and welcome email management

### UserStatistics

Comprehensive analytics dashboard with visual metrics.

```tsx
import { UserStatistics } from '@/components/user-management';

<UserStatistics
  refreshTrigger={number}
  onRefresh={() => void}
/>
```

**Features:**
- Visual statistics cards with trend indicators
- User distribution charts
- Growth analytics with percentage changes
- Recent registration counters
- Animated transitions and hover effects
- Responsive grid layout

## API Integration

All components use the `UserService` class which implements the complete Admin User Management API:

```typescript
import UserService from '@/lib/services/userService';

// User management
const users = await UserService.searchUsers(searchParams);
const newUser = await UserService.createUser(userData);
const updatedUser = await UserService.updateUser(id, updateData);
await UserService.deleteUser(id);

// Password management
await UserService.resetUserPassword(id, resetOptions);

// Analytics
const statistics = await UserService.getUserStatistics();
const growth = await UserService.getUserGrowthAnalytics('month');

// Export
const exportData = await UserService.exportUsers(exportOptions);
```

## Data Models

### AdminUserDetailsDto
```typescript
interface AdminUserDetailsDto {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userType: number;           // 1=Manager, 2=Worker, 3=Student
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  roles?: string[];
  statistics?: {
    activitiesParticipated: number;
    activitiesCompleted: number;
    totalLoginCount: number;
  };
  createdBy?: {
    id: string;
    username: string;
  };
}
```

### UserStatisticsDto
```typescript
interface UserStatisticsDto {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  byUserType: {
    managers: number;
    workers: number;
    students: number;
  };
  recentRegistrations: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}
```

## Usage Example

Complete implementation of the user management page:

```tsx
'use client';

import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import {
  UserList,
  UserForm,
  UserStatistics,
  AdminUserDetailsDto
} from '@/components/user-management';

const UserManagementPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserDetailsDto | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateUser = () => {
    setEditingUser(null);
    setUserFormOpen(true);
  };

  const handleEditUser = (user: AdminUserDetailsDto) => {
    setEditingUser(user);
    setUserFormOpen(true);
  };

  const handleUserFormSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setUserFormOpen(false);
  };

  return (
    <Box>
      <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
        <Tab label="Users" />
        <Tab label="Analytics" />
      </Tabs>

      {tabValue === 0 && (
        <UserList
          onCreateUser={handleCreateUser}
          onEditUser={handleEditUser}
          onViewUser={handleViewUser}
          onResetPassword={handleResetPassword}
          refreshTrigger={refreshTrigger}
        />
      )}

      {tabValue === 1 && (
        <UserStatistics
          refreshTrigger={refreshTrigger}
          onRefresh={() => setRefreshTrigger(prev => prev + 1)}
        />
      )}

      <UserForm
        open={userFormOpen}
        onClose={() => setUserFormOpen(false)}
        user={editingUser}
        onSuccess={handleUserFormSuccess}
      />
    </Box>
  );
};

export default UserManagementPage;
```

## Dependencies

### Required Packages
- `@mui/material` - UI components and theming
- `@mui/icons-material` - Material Design icons
- `@mui/x-date-pickers` - Date selection components
- `formik` - Form handling and validation
- `yup` - Schema validation
- `react-i18next` - Internationalization

### Internal Dependencies
- `@/lib/services/userService` - API service layer
- `@/lib/http/api-client` - HTTP client configuration
- `@ideomni/core/IdeomniPageSimple` - Page layout component

## Configuration

### Environment Variables
The module uses the configured API client from `@/lib/http/api-client`, which should be configured with:
- API base URL pointing to admin user management endpoints
- Authentication headers for admin access
- Request/response interceptors for error handling

### Permissions
Features are available based on admin permissions:
- **Super Admin**: Full access to all user management features
- **Limited Admin**: Restricted access based on role configuration

## Internationalization

The module supports multiple languages through react-i18next:

### English (en-US)
```typescript
// Comprehensive translations covering all UI elements
USER_MANAGEMENT: 'User Management',
CREATE_USER: 'Create User',
EDIT_USER: 'Edit User',
// ... (300+ translation keys)
```

### Chinese (zh-CN)
```typescript
// Complete Chinese translations
USER_MANAGEMENT: '用户管理',
CREATE_USER: '创建用户',
EDIT_USER: '编辑用户',
// ... (300+ translation keys)
```

## Error Handling

The module implements comprehensive error handling:

1. **Network Errors**: Graceful handling of API failures with retry options
2. **Validation Errors**: Form validation with user-friendly messages
3. **Permission Errors**: Clear messaging for insufficient permissions
4. **Loading States**: Consistent loading indicators across components
5. **Operation Feedback**: Success/error notifications for user actions

## Performance Considerations

1. **Pagination**: All lists use server-side pagination for large datasets
2. **Debounced Search**: Search inputs are debounced to reduce API calls
3. **Lazy Loading**: Components load data only when needed
4. **Memoization**: Expensive calculations and renders are memoized
5. **Virtual Scrolling**: Efficient rendering for large data lists
6. **Optimistic Updates**: Immediate UI feedback for better UX

## Security Features

1. **Input Sanitization**: All form inputs are validated and sanitized
2. **Permission Checks**: Features are hidden/disabled based on permissions
3. **Audit Logging**: All user management actions are automatically logged
4. **Secure Defaults**: Forms default to most secure/restricted options
5. **Session Management**: Proper handling of authentication states
6. **Data Encryption**: Sensitive data is handled securely

## Testing

### Unit Tests
- Individual component logic testing
- Form validation and submission
- Utility function verification
- State management testing

### Integration Tests
- API service integration testing
- Component interaction workflows
- Error handling scenarios
- Permission-based access control

### E2E Tests
- Complete user management workflows
- Multi-step form completion
- Bulk operations testing
- Analytics dashboard functionality

## API Endpoints

The module integrates with the following Admin User Management API endpoints:

### Core Operations
- `GET /api/admin/users/search` - Advanced user search with filtering
- `POST /api/admin/users` - Create new user account
- `GET /api/admin/users/:id` - Get user details with statistics
- `PUT /api/admin/users/:id` - Update user information
- `DELETE /api/admin/users/:id` - Delete user account

### Bulk Operations
- `POST /api/admin/users/bulk` - Bulk create users
- `PUT /api/admin/users/bulk` - Bulk update users

### Password Management
- `PUT /api/admin/users/:id/reset-password` - Reset user password

### Analytics
- `GET /api/admin/users/statistics` - User statistics dashboard
- `GET /api/admin/users/analytics/growth` - Growth analytics

### Export
- `GET /api/admin/users/export` - Export user data

## Best Practices

1. **Component Design**: Follow single responsibility principle
2. **State Management**: Use local state for UI, lift state for shared data
3. **Error Boundaries**: Implement error boundaries for resilient UX
4. **Accessibility**: Follow WCAG guidelines for inclusive design
5. **Performance**: Optimize renders and API calls
6. **Security**: Validate all inputs and implement proper access controls
7. **Testing**: Maintain comprehensive test coverage
8. **Documentation**: Keep documentation updated with code changes

## Future Enhancements

1. **Advanced Analytics**: More detailed user behavior analytics
2. **Bulk Import**: CSV/Excel file import for bulk user creation
3. **Advanced Filtering**: More granular filtering options
4. **Export Formats**: Additional export formats (PDF, XML)
5. **Real-time Updates**: WebSocket integration for live updates
6. **User Activity Logs**: Detailed user activity tracking
7. **Custom Fields**: Configurable custom user fields
8. **Integration APIs**: Third-party system integrations

## Troubleshooting

### Common Issues

1. **Loading Issues**: Check API connectivity and authentication
2. **Search Not Working**: Verify search parameters and debounce timing
3. **Form Validation**: Check validation schemas and error messages
4. **Permission Errors**: Verify admin permissions and access controls
5. **Performance Issues**: Check pagination settings and data loading

### Debug Mode
Enable debug logging in development:
```typescript
// Enable detailed logging for user service
localStorage.setItem('userManagement:debug', 'true');
```

### Support
For technical support and bug reports, please refer to the project's issue tracking system and development documentation. 