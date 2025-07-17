# Superadmin Admin Management - Detailed Endpoint Reference

## Authentication Endpoints

### Admin Login
**Endpoint**: `POST /api/admin/login`  
**Access**: Public  
**Operation Log**: `LOGIN`

**Description**: Authenticate admin user and receive access/refresh tokens.

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```typescript
{
  identifier: string;  // Username or email
  password: string;    // Admin password
}
```

**Success Response (200)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "cm1234567890abcdef",
    "username": "superadmin",
    "email": "admin@example.com",
    "firstName": "Super",
    "lastName": "Admin",
    "adminType": 1,
    "lastLoginAt": "2024-01-15T08:00:00.000Z"
  }
}
```

**Error Responses**:
- `200` - Invalid credentials (BusinessCode: 2010)
- `400` - Validation error (BusinessCode: 3001)
- `429` - Too many failed attempts (BusinessCode: 2019)

---

### Refresh Token
**Endpoint**: `POST /api/admin/refresh-token`  
**Access**: Public  
**Operation Log**: `REFRESH_TOKEN`

**Request Body**:
```typescript
{
  refreshToken: string;  // Valid refresh token
}
```

**Success Response (200)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:
- `200` - Invalid/expired refresh token (BusinessCode: 2014)

---

### Admin Logout
**Endpoint**: `POST /api/admin/logout`  
**Access**: Authenticated Admin  
**Operation Log**: `LOGOUT`

**Request Headers**:
```
Authorization: Bearer <access_token>
```

**Success Response (200)**:
```json
{
  "message": "Logout successful"
}
```

---

## Admin Management Endpoints

### Create Admin
**Endpoint**: `POST /api/admin/create`  
**Access**: Super Admin Only  
**Operation Log**: `CREATE_ADMIN`

**Request Headers**:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:
```typescript
{
  username: string;        // 3-50 chars, unique, alphanumeric + underscore
  email: string;          // Valid email format, unique
  password: string;       // Minimum 6 characters
  firstName?: string;     // Optional, max 100 chars
  lastName?: string;      // Optional, max 100 chars
  adminType: 1 | 2;      // 1: Super Admin, 2: Limited Admin
  creator?: string;       // Optional, admin ID who created this admin
}
```

**Example Request**:
```json
{
  "username": "content_manager",
  "email": "content@company.com",
  "password": "SecurePass123!",
  "firstName": "Content",
  "lastName": "Manager",
  "adminType": 2,
  "creator": "cm1234567890abcdef"
}
```

**Success Response (201)**:
```json
{
  "id": "cm9876543210fedcba",
  "username": "content_manager",
  "email": "content@company.com",
  "firstName": "Content",
  "lastName": "Manager",
  "adminType": 2,
  "isActive": true,
  "creator": "cm1234567890abcdef",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:
- `400` - Username exists (BusinessCode: 2018)
- `400` - Email exists (BusinessCode: 2018)
- `400` - Validation error (BusinessCode: 3001)
- `403` - Insufficient permissions (BusinessCode: 2016)

---

### Update Admin
**Endpoint**: `PUT /api/admin/:id`  
**Access**: Super Admin (any admin) | Limited Admin (own profile)  
**Operation Log**: `UPDATE_ADMIN`

**Path Parameters**:
- `id`: Admin ID to update

**Request Body** (all fields optional):
```typescript
{
  username?: string;      // 3-50 chars, unique, alphanumeric + underscore
  email?: string;         // Valid email format, unique
  firstName?: string;     // Max 100 chars
  lastName?: string;      // Max 100 chars
  adminType?: 1 | 2;     // Requires Super Admin permission
  isActive?: boolean;     // Enable/disable account
  creator?: string;       // Change creator reference
}
```

**Success Response (200)**:
```json
{
  "id": "cm9876543210fedcba",
  "username": "content_manager_updated",
  "email": "content.manager@company.com",
  "firstName": "Content",
  "lastName": "Manager",
  "adminType": 2,
  "isActive": true,
  "creator": "cm1234567890abcdef",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T14:45:00.000Z"
}
```

**Error Responses**:
- `403` - Cannot update superior admin (BusinessCode: 2020)
- `403` - Cannot change admin type (BusinessCode: 2021)
- `404` - Admin not found (BusinessCode: 2017)
- `409` - Username/email conflict (BusinessCode: 2018)

---

### Delete Admin
**Endpoint**: `DELETE /api/admin/:id`  
**Access**: Super Admin Only  
**Operation Log**: `DELETE_ADMIN`

**Path Parameters**:
- `id`: Admin ID to delete

**Success Response (200)**:
```json
{
  "message": "Admin deleted successfully"
}
```

**Error Responses**:
- `400` - Cannot delete self (BusinessCode: 2022)
- `403` - Insufficient permissions (BusinessCode: 2016)
- `404` - Admin not found (BusinessCode: 2017)

---

### Get Admin List
**Endpoint**: `GET /api/admin/list`  
**Access**: Any Authenticated Admin  
**Operation Log**: None

**Success Response (200)**:
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
    "username": "content_manager",
    "email": "content@company.com",
    "firstName": "Content",
    "lastName": "Manager",
    "adminType": 2,
    "isActive": true,
    "creator": "cm1234567890abcdef",
    "createdAt": "2024-01-10T10:00:00.000Z",
    "updatedAt": "2024-01-10T10:00:00.000Z"
  }
]
```

**Filtering Logic**:
- **Super Admin**: Returns all active admins
- **Limited Admin**: Returns self + admins they created

---

## Operation Logs Endpoints

### Get Admin Operation Logs
**Endpoint**: `GET /api/admin/:id/logs`  
**Access**: Super Admin (any logs) | Limited Admin (own logs only)  
**Operation Log**: None

**Path Parameters**:
- `id`: Admin ID whose logs to retrieve

**Query Parameters** (optional):
- `limit`: Number of logs to retrieve (default: 50, max: 1000)
- `offset`: Number of logs to skip (default: 0)
- `action`: Filter by action type
- `startDate`: ISO date string for log start date
- `endDate`: ISO date string for log end date

**Example Request**:
```
GET /api/admin/cm1234567890abcdef/logs?limit=20&action=CREATE_ADMIN&startDate=2024-01-01T00:00:00.000Z
```

**Success Response (200)**:
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
      "responseSize": 512,
      "adminType": 2,
      "creator": "cm1234567890abcdef"
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
      "loginMethod": "password",
      "adminType": 1
    },
    "createdAt": "2024-01-15T08:00:00.000Z"
  }
]
```

**Error Responses**:
- `403` - Cannot access resource (BusinessCode: 2023)
- `404` - Admin not found (BusinessCode: 2017)

---

### Get Own Operation Logs
**Endpoint**: `GET /api/admin/logs/mine`  
**Access**: Any Authenticated Admin  
**Operation Log**: None

**Query Parameters**: Same as above endpoint

**Success Response**: Same format as above, but filtered to requesting admin's logs only.

---

## Profile Management Endpoints

### Change Password
**Endpoint**: `PUT /api/admin/change-password`  
**Access**: Any Authenticated Admin (own password only)  
**Operation Log**: `CHANGE_PASSWORD`

**Request Body**:
```typescript
{
  currentPassword: string;  // Current admin password
  newPassword: string;      // New password (min 6 chars)
}
```

**Success Response (200)**:
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses**:
- `400` - Current password incorrect (BusinessCode: 2010)
- `400` - New password same as current (BusinessCode: 2024)
- `400` - Password too weak (BusinessCode: 2025)

---

### Get Profile
**Endpoint**: `GET /api/admin/profile`  
**Access**: Any Authenticated Admin  
**Operation Log**: None

**Success Response (200)**:
```json
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
}
```

---

## System-Wide Operation Logs

### Get Recent System Logs
**Endpoint**: `GET /api/admin/logs/system`  
**Access**: Super Admin Only  
**Operation Log**: `VIEW_SYSTEM_LOGS`

**Query Parameters**:
- `limit`: Number of logs (default: 100, max: 1000)
- `action`: Filter by action type
- `adminType`: Filter by admin type (1 or 2)
- `startDate`: ISO date string
- `endDate`: ISO date string

**Success Response (200)**:
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
    "userAgent": "Mozilla/5.0...",
    "metadata": {
      "duration": 245,
      "success": true,
      "responseSize": 512
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "admin": {
      "id": "cm1234567890abcdef",
      "username": "superadmin",
      "email": "admin@example.com",
      "adminType": 1
    }
  }
]
```

---

## Common Response Patterns

### Success Response Envelope
```typescript
{
  success: true;
  data: any;              // Response data
  message?: string;       // Optional success message
  timestamp: string;      // ISO timestamp
  path: string;          // Request path
}
```

### Error Response Envelope
```typescript
{
  success: false;
  businessCode: number;   // Error code from ErrorCode enum
  message: string;        // Internationalized error message
  data: null;
  timestamp: string;      // ISO timestamp
  path: string;          // Request path
  details?: object;      // Optional error details
}
```

### Pagination Response
```typescript
{
  items: T[];            // Array of data items
  pagination: {
    page: number;        // Current page number
    pageSize: number;    // Items per page
    totalItems: number;  // Total count of items
    totalPages: number;  // Total number of pages
    hasNext: boolean;    // Has next page
    hasPrev: boolean;    // Has previous page
  }
}
```

---

## HTTP Status Codes

| Status | Usage | Description |
|--------|-------|-------------|
| 200 | Success | Request completed successfully |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data or validation error |
| 401 | Unauthorized | Authentication required or token invalid |
| 403 | Forbidden | Insufficient permissions for operation |
| 404 | Not Found | Requested resource not found |
| 409 | Conflict | Resource conflict (e.g., duplicate username) |
| 429 | Rate Limited | Too many requests |
| 500 | Server Error | Unexpected server error |

---

## Operation Log Actions

### Authentication Actions
- `LOGIN` - Admin login attempt
- `LOGOUT` - Admin logout
- `REFRESH_TOKEN` - Token refresh
- `CHANGE_PASSWORD` - Password change

### Admin Management Actions
- `CREATE_ADMIN` - Admin account creation
- `UPDATE_ADMIN` - Admin account modification
- `DELETE_ADMIN` - Admin account deletion
- `ACTIVATE_ADMIN` - Admin account activation
- `DEACTIVATE_ADMIN` - Admin account deactivation

### System Actions
- `VIEW_SYSTEM_LOGS` - System log access
- `BULK_OPERATION` - Bulk data operations
- `EXPORT_DATA` - Data export operations
- `SYSTEM_CONFIG_CHANGE` - Configuration changes

### User Management Actions (from Admin)
- `CREATE_USER` - User account creation by admin
- `UPDATE_USER` - User account modification by admin
- `DELETE_USER` - User account deletion by admin
- `BULK_CREATE_USERS` - Bulk user creation
- `BULK_UPDATE_USERS` - Bulk user updates

---

## Request/Response Examples

### Creating a Limited Admin
```bash
curl -X POST \
  http://localhost:2999/api/admin/create \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "site_admin",
    "email": "site@company.com",
    "password": "SecurePass123!",
    "firstName": "Site",
    "lastName": "Administrator",
    "adminType": 2
  }'
```

### Updating Admin Status
```bash
curl -X PUT \
  http://localhost:2999/api/admin/cm9876543210fedcba \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "isActive": false,
    "firstName": "Former Site"
  }'
```

### Getting Operation Logs
```bash
curl -X GET \
  'http://localhost:2999/api/admin/cm1234567890abcdef/logs?limit=10&action=CREATE_ADMIN' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

---

*Last Updated: January 2024*  
*API Version: 1.0* 