# Superadmin Admin Management API Documentation

## Overview

This documentation covers all API endpoints for **Super Admin (adminType 1)** to manage administrative users in the system. Super Admin has complete control over admin lifecycle including creation, updates, deletion, and monitoring.

## Base URL
All admin management endpoints are prefixed with `/api/admin`

## Authentication
All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

**Permission Level**: Super Admin (adminType 1) only, unless specified otherwise.

## Table of Contents
- [Admin CRUD Operations](#admin-crud-operations)
- [Admin Listing and Search](#admin-listing-and-search)
- [Operation Logs Management](#operation-logs-management)
- [Profile and Password Management](#profile-and-password-management)
- [Error Responses](#error-responses)
- [Data Models](#data-models)

---

## Admin CRUD Operations

### Create New Admin
Create a new admin account (Super Admin only).

**Endpoint**: `POST /api/admin/create`  
**Permission**: Super Admin only  
**Operation Log**: `CREATE_ADMIN`

**Request Body**:
```json
{
  "username": "new_admin",
  "email": "admin@company.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "adminType": 2,
  "creator": "optional-creator-id"
}
```

**Response (201)**:
```json
{
  "id": "cm1234567890abcdef",
  "username": "new_admin",
  "email": "admin@company.com",
  "firstName": "John",
  "lastName": "Doe",
  "adminType": 2,
  "isActive": true,
  "creator": "cm0987654321fedcba",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Validation Rules**:
- `username`: Required, unique, 3-50 characters
- `email`: Required, valid email, unique
- `password`: Required, minimum 6 characters
- `adminType`: Required, 1 (Super Admin) or 2 (Limited Admin)
- `firstName`, `lastName`: Optional strings
- `creator`: Optional, defaults to token creator if not provided

---

### Update Admin
Update existing admin account information.

**Endpoint**: `PUT /api/admin/:id`  
**Permission**: Super Admin (any admin), Limited Admin (own profile only)  
**Operation Log**: `UPDATE_ADMIN`

**Request Body**:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "isActive": false,
  "adminType": 2
}
```

**Response (200)**:
```json
{
  "id": "cm1234567890abcdef",
  "username": "admin_user",
  "email": "admin@company.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "adminType": 2,
  "isActive": false,
  "creator": "cm0987654321fedcba",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T14:45:00.000Z"
}
```

**Permission Rules**:
- Super Admin can update any admin
- Limited Admin can only update own profile
- Admin type changes require Super Admin permissions
- Super Admin can only be managed by another Super Admin

---

### Delete Admin
Soft delete an admin account (Super Admin only).

**Endpoint**: `DELETE /api/admin/:id`  
**Permission**: Super Admin only  
**Operation Log**: `DELETE_ADMIN`

**Response (200)**:
```json
{
  "message": "Admin deleted successfully"
}
```

**Business Rules**:
- Soft delete only (sets `deletedAt` timestamp)
- Cannot delete self
- Deactivates all refresh tokens
- Admin becomes immediately inaccessible

---

## Admin Listing and Search

### Get Admin List
Retrieve list of all admins with permission-based filtering.

**Endpoint**: `GET /api/admin/list`  
**Permission**: Any authenticated admin  
**Operation Log**: None (read operation)

**Response (200)**:
```json
[
  {
    "id": "cm1234567890abcdef",
    "username": "superadmin",
    "email": "admin@example.com",
    "firstName": "Super",
    "lastName": "Admin",
    "adminType": 1,
    "isActive": true,
    "lastLoginAt": "2024-01-15T08:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T08:00:00.000Z"
  },
  {
    "id": "cm9876543210fedcba",
    "username": "admin2",
    "email": "admin2@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "adminType": 2,
    "isActive": true,
    "creator": "cm1234567890abcdef",
    "createdAt": "2024-01-10T10:00:00.000Z",
    "updatedAt": "2024-01-10T10:00:00.000Z"
  }
]
```

**Filtering Rules**:
- **Super Admin**: Can view all admins
- **Limited Admin**: Can only view themselves and admins they created

---

## Operation Logs Management

### Get Admin Operation Logs
Retrieve operation logs for a specific admin.

**Endpoint**: `GET /api/admin/:id/logs`  
**Permission**: Super Admin (any logs), Limited Admin (own logs only)  
**Operation Log**: None (read operation)

**Response (200)**:
```json
[
  {
    "id": "log123456789",
    "adminId": "cm1234567890abcdef",
    "action": "CREATE_ADMIN",
    "resource": "Admin",
    "resourceId": "cm9876543210fedcba",
    "description": "Created new admin account",
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "metadata": {
      "duration": 245,
      "success": true,
      "responseSize": 512
    },
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "id": "log987654321",
    "adminId": "cm1234567890abcdef",
    "action": "LOGIN",
    "resource": null,
    "resourceId": null,
    "description": "Admin login successful",
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "metadata": {
      "duration": 125,
      "success": true,
      "loginMethod": "password"
    },
    "createdAt": "2024-01-15T08:00:00.000Z"
  }
]
```

**Log Types Include**:
- `LOGIN` / `LOGOUT` - Authentication events
- `CREATE_ADMIN` / `UPDATE_ADMIN` / `DELETE_ADMIN` - Admin management
- `CHANGE_PASSWORD` - Password changes
- `CREATE_USER` / `UPDATE_USER` / `DELETE_USER` - User management
- `BULK_OPERATION` - Bulk operations
- Custom business operations

---

### Get Own Operation Logs
Retrieve operation logs for the authenticated admin.

**Endpoint**: `GET /api/admin/logs/mine`  
**Permission**: Any authenticated admin  
**Operation Log**: None (read operation)

**Response**: Same format as above, filtered to requesting admin's logs only.

---

## Profile and Password Management

### Change Password
Change admin password (requires current password).

**Endpoint**: `PUT /api/admin/change-password`  
**Permission**: Any authenticated admin (own password only)  
**Operation Log**: `CHANGE_PASSWORD`

**Request Body**:
```json
{
  "currentPassword": "currentSecurePassword",
  "newPassword": "newSecurePassword123!"
}
```

**Response (200)**:
```json
{
  "message": "Password changed successfully"
}
```

**Validation Rules**:
- Current password must be correct
- New password minimum 6 characters
- New password must be different from current
- Password history validation (if implemented)

---

## Error Responses

All endpoints return standardized error responses:

### Common Error Codes

**400 - Validation Error**:
```json
{
  "success": false,
  "businessCode": 3001,
  "message": "Validation failed",
  "data": null,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/admin/create",
  "details": {
    "field": "email",
    "message": "Email already exists"
  }
}
```

**401 - Unauthorized**:
```json
{
  "success": false,
  "businessCode": 2001,
  "message": "Authentication required",
  "data": null,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/admin/create"
}
```

**403 - Insufficient Permissions**:
```json
{
  "success": false,
  "businessCode": 2016,
  "message": "Insufficient admin permissions to perform this action",
  "data": null,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/admin/create"
}
```

**404 - Admin Not Found**:
```json
{
  "success": false,
  "businessCode": 2017,
  "message": "Admin account not found",
  "data": null,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/admin/cm1234567890abcdef",
  "details": {
    "adminId": "cm1234567890abcdef"
  }
}
```

**409 - Conflict**:
```json
{
  "success": false,
  "businessCode": 2018,
  "message": "Admin username or email already exists",
  "data": null,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/admin/create",
  "details": {
    "field": "username",
    "value": "existing_admin"
  }
}
```

---

## Data Models

### Admin Model
```typescript
interface Admin {
  id: string;                    // Unique identifier (CUID)
  username: string;              // Unique username
  email: string;                 // Unique email address
  firstName?: string;            // Optional first name
  lastName?: string;             // Optional last name
  adminType: number;             // 1: Super Admin, 2: Limited Admin
  isActive: boolean;             // Account status
  lastLoginAt?: Date;            // Last login timestamp
  createdAt: Date;               // Creation timestamp
  updatedAt: Date;               // Last update timestamp
  deletedAt?: Date;              // Soft delete timestamp
  creator?: string;              // ID of creating admin (for type 2)
}
```

### Operation Log Model
```typescript
interface AdminOperationLog {
  id: string;                    // Unique log identifier
  adminId: string;               // Admin who performed the action
  action: string;                // Action type (e.g., "CREATE_ADMIN")
  resource?: string;             // Resource type (e.g., "Admin", "User")
  resourceId?: string;           // ID of affected resource
  description?: string;          // Human-readable description
  ipAddress?: string;            // Client IP address
  userAgent?: string;            // Client user agent
  metadata?: {                   // Additional operation data
    duration: number;            // Operation duration in ms
    success: boolean;            // Operation success status
    responseSize?: number;       // Response size in bytes
    error?: string;              // Error message if failed
    [key: string]: any;          // Custom metadata
  };
  createdAt: Date;               // Log creation timestamp
}
```

### Permission Hierarchy
```typescript
enum AdminType {
  SUPER_ADMIN = 1,               // Full system access, bypasses RBAC
  LIMITED_ADMIN = 2              // Restricted access, governed by RBAC
}
```

**Super Admin Capabilities**:
- Create/update/delete any admin
- View all operation logs
- Manage system settings
- Access all endpoints
- Bypass RBAC restrictions

**Limited Admin Capabilities**:
- Update own profile only
- View own operation logs
- Access assigned features via RBAC
- Cannot manage other admins

---

## Security Considerations

### Authentication
- JWT tokens with 15-minute expiration
- Refresh tokens with 7-day expiration
- Secure token storage and rotation

### Authorization
- Multi-layered permission system
- Admin type checking + RBAC integration
- Resource-level access controls

### Audit Trail
- All operations automatically logged
- IP address and user agent tracking
- Detailed metadata collection
- Immutable log storage

### Rate Limiting
- Admin creation: 5 per hour per IP
- Password changes: 3 per hour per admin
- Failed login attempts: 5 per 15 minutes

### Data Protection
- Password hashing with bcrypt (12 rounds)
- Sensitive data exclusion from responses
- Soft delete for data retention
- GDPR compliance considerations

---

## Best Practices

### Admin Creation
1. Use strong, unique passwords
2. Assign minimal required admin type
3. Set appropriate creator relationships
4. Verify email addresses
5. Implement approval workflows for Super Admin creation

### Monitoring
1. Monitor failed login attempts
2. Track admin creation patterns
3. Review operation logs regularly
4. Set up alerting for suspicious activities
5. Implement automated security checks

### Maintenance
1. Regular password rotation policies
2. Periodic access reviews
3. Clean up inactive accounts
4. Monitor token usage patterns
5. Update security configurations

---

*Last Updated: January 2024*  
*API Version: 1.0* 