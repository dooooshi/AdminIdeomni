# Admin Management Module

A comprehensive administrator management system built for the Ideomni platform, providing full CRUD operations and operation logging for admin accounts.

## Overview

This module implements a complete admin management solution based on the API specifications in `docs/api/superadmin-manage-admin/`. It provides a clean, modern interface for super administrators to manage admin accounts and monitor operations.

## Structure

```
src/components/admin-management/
├── AdminList.tsx           # Admin accounts table with filtering and actions
├── AdminForm.tsx          # Create/edit admin form with validation
├── OperationLogs.tsx      # Operation logs viewer with advanced filtering
├── index.ts              # Component exports
└── README.md             # This documentation
```

## Features

### 1. Admin Account Management
- **Create Admins**: Full form with validation for creating new admin accounts
- **Edit Admins**: Update existing admin information and permissions
- **Delete Admins**: Soft delete with confirmation dialog
- **List Admins**: Paginated table with search and filtering
- **Status Management**: Activate/deactivate admin accounts

### 2. Operation Logging
- **Individual Logs**: View logs for specific admin accounts
- **System Logs**: Monitor system-wide admin operations
- **Advanced Filtering**: Filter by action, date range, success status, and more
- **Detailed Metadata**: Expand logs to view complete operation details
- **Real-time Updates**: Support for live log monitoring



### 3. Security Features
- **Permission-based Access**: Different features based on admin type
- **Input Validation**: Comprehensive form validation with Yup schemas
- **Error Handling**: Graceful error handling with user-friendly messages
- **Audit Trail**: Complete operation logging for compliance

## Components

### AdminList

Main component for displaying and managing admin accounts.

```tsx
import { AdminList } from '@/components/admin-management';

<AdminList
  onCreateAdmin={() => void}
  onEditAdmin={(admin: Admin) => void}
  onViewLogs={(admin: Admin) => void}
/>
```

**Features:**
- Paginated data table with sorting
- Search across username, email, and names
- Filter by admin type and status
- Bulk statistics display
- Action buttons for each admin
- Real-time data updates

### AdminForm

Modal form for creating and editing admin accounts.

```tsx
import { AdminForm } from '@/components/admin-management';

<AdminForm
  open={boolean}
  onClose={() => void}
  admin={Admin | null}          // null for create, Admin object for edit
  onSuccess={(admin: Admin) => void}
/>
```

**Features:**
- Create and edit modes
- Form validation with Yup
- Password visibility toggle
- Admin type selection with descriptions
- Status management for edit mode
- Security warnings for super admin creation

### OperationLogs

Comprehensive log viewer with advanced filtering capabilities.

```tsx
import { OperationLogs } from '@/components/admin-management';

<OperationLogs
  open={boolean}
  onClose={() => void}
  admin={Admin | null}          // null for system logs, Admin for specific logs
  title={string}                // Optional custom title
/>
```

**Features:**
- Individual and system-wide log viewing
- Advanced filtering (date range, action type, success status)
- Expandable log details with metadata
- Export capabilities
- Real-time log updates
- Performance metrics



## API Integration

All components use the `AdminService` class which implements the complete API specification:

```typescript
import AdminService from '@/lib/services/adminService';

// Admin management
const admins = await AdminService.getAdminList();
const newAdmin = await AdminService.createAdmin(adminData);
const updatedAdmin = await AdminService.updateAdmin(id, updateData);
await AdminService.deleteAdmin(id);

// Operation logs
const logs = await AdminService.getAdminLogs(adminId, params);
const systemLogs = await AdminService.getSystemLogs(params);
```

## Data Models

### Admin
```typescript
interface Admin {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  adminType: 1 | 2;             // 1: Super Admin, 2: Limited Admin
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  creator?: string;
}
```

### AdminOperationLog
```typescript
interface AdminOperationLog {
  id: string;
  adminId: string;
  action: string;
  resource?: string;
  resourceId?: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata: {
    duration: number;
    success: boolean;
    responseSize?: number;
    error?: string;
    changes?: object;
    [key: string]: any;
  };
  createdAt: string;
}
```

## Usage Example

Here's how to implement the admin management page:

```tsx
'use client';

import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import {
  AdminList,
  AdminForm,
  OperationLogs,
  Admin
} from '@/components/admin-management';

const AdminManagementPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [adminFormOpen, setAdminFormOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [logsDialogOpen, setLogsDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

  const handleCreateAdmin = () => {
    setEditingAdmin(null);
    setAdminFormOpen(true);
  };

  const handleEditAdmin = (admin: Admin) => {
    setEditingAdmin(admin);
    setAdminFormOpen(true);
  };

  const handleViewLogs = (admin: Admin) => {
    setSelectedAdmin(admin);
    setLogsDialogOpen(true);
  };

  return (
    <Box>
      <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
        <Tab label="Admin Accounts" />
        <Tab label="System Logs" />
      </Tabs>

      {tabValue === 0 && (
        <AdminList
          onCreateAdmin={handleCreateAdmin}
          onEditAdmin={handleEditAdmin}
          onViewLogs={handleViewLogs}
        />
      )}

      {tabValue === 1 && (
        <OperationLogs
          open={logsDialogOpen}
          onClose={() => setLogsDialogOpen(false)}
          admin={null} // System logs
        />
      )}

      <AdminForm
        open={adminFormOpen}
        onClose={() => setAdminFormOpen(false)}
        admin={editingAdmin}
        onSuccess={(admin) => {
          // Handle success
          setAdminFormOpen(false);
        }}
      />

      <OperationLogs
        open={logsDialogOpen}
        onClose={() => setLogsDialogOpen(false)}
        admin={selectedAdmin}
      />
    </Box>
  );
};

export default AdminManagementPage;
```

## Dependencies

### Required Packages
- `@mui/material` - UI components
- `@mui/icons-material` - Icons
- `@mui/x-date-pickers` - Date selection
- `formik` - Form handling
- `yup` - Form validation
- `date-fns` - Date manipulation

### Internal Dependencies
- `@/lib/services/adminService` - API service layer
- `@/lib/http/api-client` - HTTP client
- `@ideomni/core/IdeomniPageSimple` - Page layout

## Configuration

### Environment Variables
The module uses the configured API client from `@/lib/http/api-client`, which should be configured with:
- API base URL
- Authentication headers
- Request/response interceptors

### Permissions
Different features are available based on admin type:
- **Super Admin (Type 1)**: Full access to all features
- **Limited Admin (Type 2)**: Restricted access, can only view own logs and limited admin management

## Error Handling

The module implements comprehensive error handling:

1. **Network Errors**: Graceful handling of API failures
2. **Validation Errors**: Form validation with user-friendly messages
3. **Permission Errors**: Clear messaging for insufficient permissions
4. **Loading States**: Consistent loading indicators across components
5. **Retry Logic**: Built into the API client for transient failures

## Performance Considerations

1. **Pagination**: All lists use pagination to handle large datasets
2. **Lazy Loading**: Components load data only when needed
3. **Memoization**: Expensive calculations are memoized
4. **Debouncing**: Search inputs are debounced to reduce API calls
5. **Caching**: API responses are cached where appropriate

## Security Features

1. **Input Sanitization**: All form inputs are validated and sanitized
2. **Permission Checks**: Features are hidden/disabled based on permissions
3. **Audit Logging**: All admin actions are automatically logged
4. **Secure Defaults**: Forms default to least privileged options
5. **Session Management**: Proper handling of authentication states

## Testing

To test the admin management components:

1. **Unit Tests**: Test individual component logic
2. **Integration Tests**: Test API service integration
3. **E2E Tests**: Test complete user workflows
4. **Permission Tests**: Verify access control works correctly

## Future Enhancements

1. **Bulk Operations**: Select and manage multiple admins at once
2. **Advanced Reporting**: Export capabilities for compliance
3. **Real-time Notifications**: Live updates for critical operations
4. **Advanced Analytics**: More detailed charts and insights
5. **Mobile Optimization**: Responsive design improvements

## Support

For questions or issues with the admin management module:

1. Check the API documentation in `docs/api/superadmin-manage-admin/`
2. Review the component source code for implementation details
3. Refer to the project's main documentation for general guidelines
4. Contact the development team for specific issues

---

*Last Updated: January 2024*  
*Module Version: 1.0* 