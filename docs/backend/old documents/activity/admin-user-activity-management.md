# Admin Activity-User Relationship Management

## Overview

This module provides comprehensive functionality for administrators to manage the relationships between users and activities. It allows admins to add users to activities, remove users from activities, update participation statuses, and monitor activity participation with detailed analytics.

## Table of Contents
- [Features](#features)
- [API Endpoints](#api-endpoints)
- [Permission System](#permission-system)
- [Data Models](#data-models)
- [Usage Examples](#usage-examples)
- [Error Handling](#error-handling)
- [Internationalization](#internationalization)

## Features

### Core Functionality
- **Add Users to Activities**: Bulk add multiple users to an activity with validation
- **Remove Users from Activities**: Bulk remove users from activities with soft delete
- **Status Management**: Update individual or bulk user activity statuses
- **Participant Viewing**: Advanced filtering and search for activity participants
- **Activity History**: View comprehensive user activity participation history
- **Permission Control**: Role-based access control for activity management
- **Audit Logging**: Complete operation logging for compliance
- **Notification System**: Optional email notifications for status changes

### Advanced Features
- **Bulk Operations**: Efficient handling of multiple users simultaneously
- **Smart Validation**: Prevents duplicate enrollments and validates user states
- **Flexible Filtering**: Filter participants by status, user type, and search terms
- **Pagination**: Efficient handling of large participant lists
- **Statistics**: Real-time statistics on activity participation
- **Soft Delete Recovery**: Reactivate previously cancelled enrollments

## API Endpoints

### Base URL
All admin activity-user endpoints are prefixed with `/api/admin/users`

### Authentication
All endpoints require admin authentication via JWT Bearer token.

### 1. Add Users to Activity
```http
POST /api/admin/users/activities/{activityId}/participants
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userIds": ["user1_id", "user2_id", "user3_id"],
  "reason": "Added for business simulation training",
  "sendNotification": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "successCount": 2,
    "failedCount": 1,
    "totalCount": 3,
    "details": [
      {
        "userId": "user1_id",
        "success": true,
        "user": {
          "username": "john_doe",
          "email": "john@example.com"
        }
      },
      {
        "userId": "user2_id",
        "success": true,
        "user": {
          "username": "jane_smith",
          "email": "jane@example.com"
        }
      },
      {
        "userId": "user3_id",
        "success": false,
        "error": "User is already enrolled in this activity",
        "user": {
          "username": "bob_jones",
          "email": "bob@example.com"
        }
      }
    ],
    "metadata": {
      "activityId": "activity_123",
      "activityName": "Q3 Business Simulation",
      "operationTimestamp": "2025-01-20T10:30:00Z",
      "performedBy": "admin_456"
    }
  }
}
```

### 2. Remove Users from Activity
```http
DELETE /api/admin/users/activities/{activityId}/participants
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userIds": ["user1_id", "user2_id"],
  "reason": "User cancelled participation",
  "sendNotification": true
}
```

### 3. Get Activity Participants
```http
GET /api/admin/users/activities/{activityId}/participants?status=ENROLLED&userType=3&searchName=john&page=1&pageSize=20
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `status` (optional): Filter by participation status (ENROLLED, COMPLETED, CANCELLED, NO_SHOW)
- `userType` (optional): Filter by user type (1: Manager, 2: Worker, 3: Student)
- `searchName` (optional): Search by user name, username, or email
- `includeInactive` (optional): Include inactive users (default: false)
- `sortBy` (optional): Sort field (enrolledAt, status, username, userType)
- `sortOrder` (optional): Sort order (asc, desc)
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "participation_123",
        "user": {
          "id": "user1_id",
          "username": "john_doe",
          "email": "john@example.com",
          "firstName": "John",
          "lastName": "Doe",
          "userType": 3,
          "isActive": true
        },
        "activity": {
          "id": "activity_123",
          "name": "Q3 Business Simulation",
          "activityType": "BizSimulation3_1",
          "startAt": "2025-02-01T09:00:00Z",
          "endAt": "2025-02-01T17:00:00Z"
        },
        "status": "ENROLLED",
        "enrolledAt": "2025-01-20T10:30:00Z",
        "updatedAt": "2025-01-20T10:30:00Z",
        "addedByAdmin": {
          "id": "admin_456",
          "username": "admin_user",
          "email": "admin@example.com"
        }
      }
    ],
    "total": 25,
    "page": 1,
    "pageSize": 20,
    "totalPages": 2,
    "hasNext": true,
    "hasPrevious": false,
    "statistics": {
      "totalParticipants": 25,
      "enrolled": 20,
      "completed": 3,
      "cancelled": 2,
      "noShow": 0
    }
  }
}
```

### 4. Update User Activity Status
```http
PUT /api/admin/users/activities/{activityId}/participants/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userId": "user1_id",
  "status": "COMPLETED",
  "reason": "User completed the training session successfully",
  "sendNotification": true
}
```

### 5. Bulk Update User Activity Status
```http
PUT /api/admin/users/activities/{activityId}/participants/bulk-status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "updates": [
    {
      "userId": "user1_id",
      "status": "COMPLETED",
      "reason": "Finished training"
    },
    {
      "userId": "user2_id",
      "status": "NO_SHOW",
      "reason": "Did not attend"
    }
  ],
  "sendNotification": true
}
```

### 6. Get User Activity History
```http
GET /api/admin/users/{userId}/activities?status=COMPLETED&includeUpcoming=true&includePast=true&page=1&pageSize=20
Authorization: Bearer <admin_token>
```

## Permission System

### Admin Types
- **Super Admin (Type 1)**: Can manage all activities and users
- **Limited Admin (Type 2)**: Can only manage activities they created

### Permission Checks
- Admins can only add/remove users from activities they have permission to modify
- Super admins have access to all activities
- Limited admins can only modify their own created activities
- All operations are logged for audit purposes

### Operation Logging
All admin operations are automatically logged with:
- Admin ID and details
- Action performed
- Target resources (activity, users)
- Timestamp
- Operation results
- IP address and user agent

## Data Models

### User Activity Status Enum
```typescript
enum UserActivityStatus {
  ENROLLED = 'ENROLLED',      // User is enrolled and can participate
  COMPLETED = 'COMPLETED',    // User has completed the activity
  CANCELLED = 'CANCELLED',    // User's enrollment was cancelled
  NO_SHOW = 'NO_SHOW'        // User didn't show up for the activity
}
```

### Admin Activity Participant DTO
```typescript
interface AdminActivityParticipantDto {
  id: string;
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    userType: number;
    isActive: boolean;
  };
  activity: {
    id: string;
    name: string;
    activityType: string;
    startAt: Date;
    endAt: Date;
  };
  status: UserActivityStatus;
  enrolledAt: Date;
  updatedAt: Date;
  addedByAdmin?: {
    id: string;
    username: string;
    email: string;
  };
}
```

## Usage Examples

### Example 1: Adding Students to a Business Simulation

```javascript
// Add multiple students to a business simulation activity
const response = await fetch('/api/admin/users/activities/biz_sim_123/participants', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + adminToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userIds: ['student_1', 'student_2', 'student_3'],
    reason: 'Added for Q1 business simulation training',
    sendNotification: true
  })
});

const result = await response.json();
console.log(`Successfully added ${result.data.successCount} students`);
```

### Example 2: Bulk Status Update After Training Session

```javascript
// Mark multiple users as completed after training session
const updates = [
  { userId: 'student_1', status: 'COMPLETED', reason: 'Excellent performance' },
  { userId: 'student_2', status: 'COMPLETED', reason: 'Good participation' },
  { userId: 'student_3', status: 'NO_SHOW', reason: 'Did not attend session' }
];

const response = await fetch('/api/admin/users/activities/biz_sim_123/participants/bulk-status', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + adminToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    updates,
    sendNotification: true
  })
});
```

### Example 3: Searching and Filtering Participants

```javascript
// Get all enrolled students in the activity
const response = await fetch('/api/admin/users/activities/biz_sim_123/participants?' + 
  new URLSearchParams({
    status: 'ENROLLED',
    userType: '3', // Students only
    searchName: 'john',
    page: '1',
    pageSize: '50',
    sortBy: 'enrolledAt',
    sortOrder: 'desc'
  }), {
  headers: {
    'Authorization': 'Bearer ' + adminToken
  }
});

const participants = await response.json();
console.log(`Found ${participants.data.total} participants`);
```

## Error Handling

### Common Error Codes
- `400 Bad Request`: Invalid input data or validation errors
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions for the operation
- `404 Not Found`: Activity, user, or participation record not found
- `409 Conflict`: User already enrolled or other conflict
- `500 Internal Server Error`: Unexpected server error

### Error Response Format
```json
{
  "success": false,
  "businessCode": 4001,
  "message": "User is already enrolled in this activity",
  "data": null,
  "timestamp": "2025-01-20T10:30:00Z",
  "path": "/api/admin/users/activities/123/participants",
  "details": {
    "userId": "user_123",
    "activityId": "activity_456"
  }
}
```

### Bulk Operation Error Handling
For bulk operations, individual failures don't stop the entire operation. Each item in the operation is processed independently, and detailed results are provided:

```json
{
  "successCount": 2,
  "failedCount": 1,
  "totalCount": 3,
  "details": [
    {
      "userId": "user1",
      "success": true
    },
    {
      "userId": "user2", 
      "success": false,
      "error": "User is already enrolled in this activity"
    },
    {
      "userId": "user3",
      "success": true
    }
  ]
}
```

## Internationalization

The system supports multiple languages for error messages and responses. Language is determined by:

1. Query parameter: `?lang=en`
2. Accept-Language header
3. Custom header: `x-lang`
4. Default fallback: `zh` (Chinese)

### Supported Languages
- **English (en)**: Full support
- **Chinese (zh)**: Full support (default)

### Translation Keys
Key translation keys used in this module:
- `ACTIVITY_USER_ADDED_SUCCESS`
- `ACTIVITY_USER_REMOVED_SUCCESS`
- `ACTIVITY_USER_STATUS_UPDATED`
- `ACTIVITY_PARTICIPANTS_RETRIEVED`
- `USER_ALREADY_ENROLLED`
- `USER_NOT_ENROLLED`
- `ACTIVITY_PERMISSION_DENIED`

## Best Practices

### 1. Bulk Operations
- Use bulk operations when adding/removing multiple users
- Process operations in reasonable batch sizes (recommended: 50-100 users per batch)
- Always check the detailed results for individual failures

### 2. Status Management
- Update user statuses promptly after activities
- Use appropriate status values:
  - `ENROLLED`: Default status when user is added
  - `COMPLETED`: User successfully completed the activity
  - `CANCELLED`: User or admin cancelled participation
  - `NO_SHOW`: User didn't attend the scheduled activity

### 3. Permission Management
- Always verify admin permissions before performing operations
- Use the principle of least privilege
- Log all administrative actions for audit purposes

### 4. Error Handling
- Implement proper error handling for all API calls
- Check both HTTP status codes and business logic errors
- Provide meaningful error messages to users

### 5. Performance Optimization
- Use pagination for large participant lists
- Implement appropriate filtering to reduce data transfer
- Cache frequently accessed data when possible

## Security Considerations

### 1. Authentication
- All endpoints require valid admin JWT tokens
- Tokens should be properly validated and not expired
- Use HTTPS for all API communications

### 2. Authorization
- Implement proper role-based access control
- Verify admin permissions for each operation
- Log all access attempts and operations

### 3. Data Validation
- Validate all input data on both client and server side
- Sanitize user inputs to prevent injection attacks
- Implement rate limiting for bulk operations

### 4. Audit Logging
- Log all administrative operations
- Include sufficient detail for compliance requirements
- Store logs securely and implement proper retention policies

## Troubleshooting

### Common Issues

**1. "User already enrolled" error**
- Check if user is already participating in the activity
- Use the participants endpoint to verify current enrollments
- Consider reactivating cancelled enrollments instead

**2. Permission denied errors**
- Verify admin has appropriate permissions
- Check if admin created the activity (for limited admins)
- Ensure admin account is active and not expired

**3. Bulk operation partial failures**
- Review the detailed results for specific failure reasons
- Process failed items separately if needed
- Check for data consistency issues

**4. Performance issues with large participant lists**
- Use appropriate pagination parameters
- Implement filtering to reduce result sets
- Consider caching strategies for frequently accessed data

### Support

For additional support or questions about the admin activity-user management system, please refer to:
- API documentation in Swagger/OpenAPI format
- System logs for detailed error information
- Admin operation logs for audit trails
- Contact the development team for technical issues 