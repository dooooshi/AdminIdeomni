# Admin User Management API Documentation

## Overview

The Admin User Management module provides comprehensive user administration capabilities with advanced pagination, filtering, search, analytics, and export functionality. This API is designed for administrative interfaces and provides full user lifecycle management.

## Base URL

```
/api/admin/users
```

## Authentication

All endpoints require admin authentication via Bearer token.

```
Authorization: Bearer <admin_token>
```

## Endpoints

### 1. User Search and Management

#### Search Users with Advanced Filtering
**GET** `/api/admin/users/search`

**Description:** Search and filter users with comprehensive criteria and pagination support.

**Authentication:** Required (AdminAuth)

**Query Parameters:**
- `q` (optional) - Search query (username, email, first name, last name)
- `userType` (optional) - Filter by user type (1=Manager, 2=Worker, 3=Student)
- `isActive` (optional) - Filter by user status (true/false)
- `createdFrom` (optional) - Users created after this date (ISO string)
- `createdUntil` (optional) - Users created before this date (ISO string)
- `lastLoginFrom` (optional) - Users who logged in after this date (ISO string)
- `roles` (optional) - Filter by user roles (array of strings)
- `hasActivities` (optional) - Users with/without activity participation (true/false)
- `sortBy` (optional) - Sort field (username, email, createdAt, lastLoginAt, firstName, lastName)
- `sortOrder` (optional) - Sort order (asc, desc)
- `page` (optional) - Page number (default: 1, minimum: 1)
- `pageSize` (optional) - Items per page (default: 20, minimum: 1, maximum: 100)

**Example Request:**
```
GET /api/admin/users/search?q=john&userType=3&isActive=true&hasActivities=true&page=1&pageSize=20
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    data: AdminUserDetailsDto[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
```

**Status Codes:**
- `200` - Search successful
- `400` - Invalid query parameters
- `401` - Unauthorized
- `403` - Insufficient admin permissions

#### Create New User
**POST** `/api/admin/users`

**Description:** Create a new user account with admin privileges.

**Authentication:** Required (AdminAuth)

**Request Body:**
```typescript
{
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  userType: number;           // 1, 2, or 3
  isActive?: boolean;         // Default: true
  roles?: string[];           // User roles
  sendWelcomeEmail?: boolean; // Default: false
}
```

**Response:**
```typescript
{
  success: boolean;
  data: AdminUserDetailsDto;
}
```

#### Get User Details by ID
**GET** `/api/admin/users/:id`

**Description:** Get detailed information about a specific user including statistics.

**Authentication:** Required (AdminAuth)

**Path Parameters:**
- `id` - User ID

**Response:**
```typescript
{
  success: boolean;
  data: {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    userType: number;
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
  };
}
```

#### Update User Information
**PUT** `/api/admin/users/:id`

**Description:** Update user information with admin privileges.

**Authentication:** Required (AdminAuth)

**Path Parameters:**
- `id` - User ID

**Request Body:**
```typescript
{
  firstName?: string;
  lastName?: string;
  email?: string;
  userType?: number;
  isActive?: boolean;
  roles?: string[];
}
```

**Response:**
```typescript
{
  success: boolean;
  data: AdminUserDetailsDto;
}
```

#### Delete User Account
**DELETE** `/api/admin/users/:id`

**Description:** Delete a user account (soft delete by default).

**Authentication:** Required (AdminAuth)

**Path Parameters:**
- `id` - User ID

**Query Parameters:**
- `hardDelete` (optional) - Permanent deletion (default: false)

**Response:**
```typescript
{
  success: boolean;
  data: {
    id: string;
    deletedAt: Date;
    hardDeleted: boolean;
  };
}
```

### 2. Bulk Operations

#### Bulk Create Users
**POST** `/api/admin/users/bulk`

**Description:** Create multiple users in a single operation.

**Authentication:** Required (AdminAuth)

**Request Body:**
```typescript
{
  users: Array<{
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    userType: number;
    isActive?: boolean;
    roles?: string[];
    sendWelcomeEmail?: boolean;
  }>;
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    successCount: number;
    failedCount: number;
    totalCount: number;
    details: Array<{
      identifier: string;
      success: boolean;
      error?: string;
      data?: { userId: string };
    }>;
  };
}
```

#### Bulk Update Users
**PUT** `/api/admin/users/bulk`

**Description:** Update multiple users with the same changes.

**Authentication:** Required (AdminAuth)

**Request Body:**
```typescript
{
  userIds: string[];
  updates: {
    firstName?: string;
    lastName?: string;
    email?: string;
    userType?: number;
    isActive?: boolean;
    roles?: string[];
  };
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    successCount: number;
    failedCount: number;
    totalCount: number;
    details: Array<{
      identifier: string;
      success: boolean;
      error?: string;
      data?: { userId: string };
    }>;
  };
}
```

### 3. Password Management

#### Reset User Password
**PUT** `/api/admin/users/:id/reset-password`

**Description:** Reset user password with admin privileges.

**Authentication:** Required (AdminAuth)

**Path Parameters:**
- `id` - User ID

**Request Body:**
```typescript
{
  generateTemporary?: boolean; // Generate temporary password
  requireChange?: boolean;     // Require password change on next login
  sendEmail?: boolean;         // Send reset email to user
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    userId: string;
    temporaryPassword?: string;
    passwordResetAt: Date;
    requireChange: boolean;
    emailSent: boolean;
  };
}
```

### 4. Activity Management

#### Get Users by Activity
**GET** `/api/admin/users/by-activity/:activityId`

**Description:** Get users participating in a specific activity with pagination.

**Authentication:** Required (AdminAuth)

**Path Parameters:**
- `activityId` - Activity ID

**Query Parameters:**
- `status` (optional) - Filter by participation status
- `includeInactive` (optional) - Include inactive users
- `page` (optional) - Page number (default: 1)
- `pageSize` (optional) - Items per page (default: 20, max: 100)

**Response:**
```typescript
{
  success: boolean;
  data: {
    data: Array<AdminUserDetailsDto & {
      activityDetails?: {
        id: string;
        status: string;
        joinedAt: Date;
      };
    }>;
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
```

### 5. Analytics and Statistics

#### Get User Statistics
**GET** `/api/admin/users/statistics`

**Description:** Get comprehensive user statistics for the admin dashboard.

**Authentication:** Required (AdminAuth)

**Response:**
```typescript
{
  success: boolean;
  data: {
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
  };
}
```

#### Get User Growth Analytics
**GET** `/api/admin/users/analytics/growth`

**Description:** Get user growth analytics over time with configurable periods.

**Authentication:** Required (AdminAuth)

**Query Parameters:**
- `period` (optional) - Time period (week, month, year) - default: month

**Response:**
```typescript
{
  success: boolean;
  data: {
    period: string;
    registrations: Array<{
      date: string;
      count: number;
    }>;
    totalGrowth: number;
    percentageChange: number;
  };
}
```

### 6. Data Export

#### Export Users Data
**GET** `/api/admin/users/export`

**Description:** Export user data in various formats with filtering options.

**Authentication:** Required (AdminAuth)

**Query Parameters:**
- `format` (optional) - Export format (csv, excel, json) - default: csv
- `includeInactive` (optional) - Include inactive users - default: false
- `userType` (optional) - Filter by user type
- `fields` (optional) - Specific fields to export (array)
- `startDate` (optional) - Filter users created after this date
- `endDate` (optional) - Filter users created before this date

**Example Request:**
```
GET /api/admin/users/export?format=csv&userType=3&includeInactive=false&startDate=2024-01-01
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    downloadUrl: string;
    filename: string;
    recordCount: number;
    format: string;
    expiresAt: Date;
  };
}
```

### 7. Audit and Logs

#### Get User Audit Logs
**GET** `/api/admin/users/:id/audit`

**Description:** Get audit logs for a specific user with pagination.

**Authentication:** Required (AdminAuth)

**Path Parameters:**
- `id` - User ID

**Query Parameters:**
- `action` (optional) - Filter by action type
- `startDate` (optional) - Logs after this date
- `endDate` (optional) - Logs before this date
- `page` (optional) - Page number (default: 1)
- `pageSize` (optional) - Items per page (default: 50, max: 100)

**Response:**
```typescript
{
  success: boolean;
  data: {
    userId: string;
    logs: Array<{
      id: string;
      action: string;
      resource: string;
      timestamp: Date;
      ipAddress: string;
      userAgent: string;
      metadata: object;
    }>;
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
```

## Data Transfer Objects (DTOs)

### AdminUserSearchDto
```typescript
export class AdminUserSearchDto {
  q?: string;                    // Search query
  userType?: number;             // 1, 2, or 3
  isActive?: boolean;            // User status filter
  createdFrom?: string;          // Creation date range start
  createdUntil?: string;         // Creation date range end
  lastLoginFrom?: string;        // Last login filter
  roles?: string[];              // Role filter
  hasActivities?: boolean;       // Activity participation filter
  sortBy?: string;               // Sort field
  sortOrder?: 'asc' | 'desc';    // Sort order
  page?: number = 1;             // Page number (1-based)
  pageSize?: number = 20;        // Items per page (1-100)
}
```

### AdminCreateUserDto
```typescript
export class AdminCreateUserDto {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  userType: number;              // 1, 2, or 3
  isActive?: boolean = true;
  roles?: string[];
  sendWelcomeEmail?: boolean = false;
}
```

### AdminUpdateUserDto
```typescript
export class AdminUpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  userType?: number;
  isActive?: boolean;
  roles?: string[];
}
```

### AdminUserDetailsDto
```typescript
export class AdminUserDetailsDto {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userType: number;
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
  activityDetails?: {
    id: string;
    status: string;
    joinedAt: Date;
  };
}
```

### AdminBulkCreateUserDto
```typescript
export class AdminBulkCreateUserDto {
  users: AdminCreateUserDto[];
}
```

### AdminBulkUpdateUserDto
```typescript
export class AdminBulkUpdateUserDto {
  userIds: string[];
  updates: AdminUpdateUserDto;
}
```

### AdminResetPasswordDto
```typescript
export class AdminResetPasswordDto {
  generateTemporary?: boolean = true;
  requireChange?: boolean = true;
  sendEmail?: boolean = false;
}
```

## Advanced Features

### Complex Filtering Examples

```typescript
// Search for active students with activities who logged in this month
{
  q: "john",
  userType: 3,
  isActive: true,
  hasActivities: true,
  lastLoginFrom: "2024-07-01T00:00:00.000Z",
  page: 1,
  pageSize: 20
}

// Find inactive managers created in a date range
{
  userType: 1,
  isActive: false,
  createdFrom: "2024-01-01T00:00:00.000Z",
  createdUntil: "2024-06-30T23:59:59.999Z",
  sortBy: "createdAt",
  sortOrder: "desc"
}
```

### Bulk Operations Examples

```typescript
// Bulk create students
{
  users: [
    {
      username: "student1",
      email: "student1@example.com",
      password: "TempPass123!",
      firstName: "John",
      lastName: "Doe",
      userType: 3,
      sendWelcomeEmail: true
    },
    {
      username: "student2",
      email: "student2@example.com",
      password: "TempPass123!",
      firstName: "Jane",
      lastName: "Smith",
      userType: 3,
      sendWelcomeEmail: true
    }
  ]
}

// Bulk activate users
{
  userIds: ["user1", "user2", "user3"],
  updates: {
    isActive: true
  }
}
```

## Error Handling

### Common Error Responses

**400 - Bad Request**
```typescript
{
  success: false;
  businessCode: 3001;
  message: "Invalid input parameters";
  data: null;
  timestamp: string;
  path: string;
  details: {
    field: string;
    message: string;
  };
}
```

**401 - Unauthorized**
```typescript
{
  success: false;
  businessCode: 2001;
  message: "Admin authentication required";
  data: null;
  timestamp: string;
  path: string;
}
```

**403 - Forbidden**
```typescript
{
  success: false;
  businessCode: 2002;
  message: "Insufficient admin permissions";
  data: null;
  timestamp: string;
  path: string;
}
```

**404 - Not Found**
```typescript
{
  success: false;
  businessCode: 4001;
  message: "User not found";
  data: null;
  timestamp: string;
  path: string;
}
```

### Validation Error Examples
- Invalid pagination parameters (page < 1 or pageSize out of range 1-100)
- Invalid user type (must be 1, 2, or 3)
- Invalid date format for date filters
- Username or email already exists
- Invalid export format

## Performance Considerations

### Recommended Query Patterns

1. **Use pagination** for all list operations
2. **Combine filters** to reduce dataset size
3. **Use appropriate page sizes** (10-50 items typical)
4. **Cache statistics** for dashboard displays
5. **Limit search scope** with specific filters

### Database Optimization

**Recommended Indexes:**
```sql
-- For search performance
CREATE INDEX idx_user_admin_search ON "User" (username, email, "firstName", "lastName");

-- For filtering
CREATE INDEX idx_user_admin_filters ON "User" ("userType", "isActive", "deletedAt", "createdAt");
CREATE INDEX idx_user_last_login ON "User" ("lastLoginAt", "deletedAt");

-- For activity queries
CREATE INDEX idx_user_activities ON "UserActivity" ("userId", "activityId", "status");
```

## Security Considerations

### Access Control
- All endpoints require admin authentication
- Operations are logged for audit purposes
- Sensitive data (passwords) are never exposed in responses
- Input validation prevents injection attacks

### Rate Limiting
- Admin endpoints: 200 requests per minute per admin
- Export endpoints: 10 requests per hour per admin
- Bulk operations: 5 requests per minute per admin

## Examples

### Search Users with Complex Filters
```bash
curl -X GET "http://localhost:2999/api/admin/users/search?q=john&userType=3&isActive=true&hasActivities=true&page=1&pageSize=10" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json"
```

### Create User with Admin Privileges
```bash
curl -X POST "http://localhost:2999/api/admin/users" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "new_student",
    "email": "student@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "userType": 3,
    "sendWelcomeEmail": true
  }'
```

### Export Users as CSV
```bash
curl -X GET "http://localhost:2999/api/admin/users/export?format=csv&userType=3&includeInactive=false" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json"
```

### Get User Statistics
```bash
curl -X GET "http://localhost:2999/api/admin/users/statistics" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json"
```

### Bulk Update Users
```bash
curl -X PUT "http://localhost:2999/api/admin/users/bulk" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": ["user1", "user2", "user3"],
    "updates": {
      "isActive": true,
      "userType": 2
    }
  }'
```

## Language Support

All endpoints support internationalization:
- Add `?lang=en` for English responses
- Add `?lang=zh` for Chinese responses
- Use `Accept-Language` header for automatic language detection

## Best Practices

1. **Pagination**: Always use pagination for list operations
2. **Filtering**: Use specific filters to reduce data transfer
3. **Error Handling**: Implement comprehensive error handling
4. **Logging**: Monitor admin operations for security
5. **Performance**: Cache frequently accessed statistics
6. **Security**: Validate all inputs and sanitize outputs
7. **Auditing**: Log all administrative actions

## Migration Guide

### From Previous Versions
- Enhanced search capabilities with new filtering options
- New bulk operation endpoints for efficient user management
- Statistics and analytics endpoints for dashboard integration
- Export functionality with multiple format support
- Comprehensive audit logging

### Breaking Changes
None. All changes are additive and maintain backward compatibility.

## Troubleshooting

### Common Issues

1. **Pagination not working**: Check page and pageSize parameters
2. **Search returns no results**: Verify filter parameters and user permissions
3. **Export fails**: Check file permissions and disk space
4. **Bulk operations timeout**: Reduce batch size or increase timeout
5. **Statistics load slowly**: Implement caching for better performance

### Debug Endpoints

All admin operations are logged with detailed information for debugging and audit purposes. 