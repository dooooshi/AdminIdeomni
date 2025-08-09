# Activity Module API Documentation

## Overview
The Activity module provides comprehensive management for business simulation activities with role-based access control, pagination support, and user participation management.

## Authentication
All endpoints require admin authentication via JWT token in the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

## Base URL
```
/api/activity
```

## Core Activity Endpoints

### 1. Create Activity
**POST** `/api/activity`

Create a new business simulation activity.

**Request Body:**
```json
{
  "name": "Business Simulation Q1 2025",
  "activityType": "BizSimulation3_1",
  "startAt": "2025-06-01T09:00:00.000Z",
  "endAt": "2025-06-01T17:00:00.000Z",
  "description": "Quarterly business simulation for team training"
}
```

**Response:** `201 Created`
```json
{
  "id": "clx1a2b3c4d5e6f7g8h9i0j1",
  "name": "Business Simulation Q1 2025",
  "activityType": "BizSimulation3_1",
  "startAt": "2025-06-01T09:00:00.000Z",
  "endAt": "2025-06-01T17:00:00.000Z",
  "description": "Quarterly business simulation for team training",
  "isActive": true,
  "createdAt": "2025-05-15T10:30:00.000Z",
  "updatedAt": "2025-05-15T10:30:00.000Z",
  "createdBy": {
    "id": "admin-123",
    "username": "superadmin",
    "email": "admin@example.com",
    "firstName": "Super",
    "lastName": "Admin"
  }
}
```

### 2. Search Activities (Paginated)
**GET** `/api/activity`

Search and list activities with filters and pagination.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number (min: 1) |
| `pageSize` | integer | No | 20 | Items per page (min: 1, max: 100) |
| `name` | string | No | - | Filter by activity name (partial match) |
| `activityType` | enum | No | - | Filter by activity type |
| `creator` | string | No | - | Filter by creator admin ID |
| `isActive` | boolean | No | - | Filter by active status |
| `includeDeleted` | boolean | No | false | Include soft-deleted activities |
| `startFrom` | string | No | - | Filter activities starting from date |
| `startUntil` | string | No | - | Filter activities starting until date |
| `endFrom` | string | No | - | Filter activities ending from date |
| `endUntil` | string | No | - | Filter activities ending until date |

**Example Request:**
```
GET /api/activity?page=1&pageSize=10&name=simulation&activityType=BizSimulation3_1&isActive=true
```

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "clx1a2b3c4d5e6f7g8h9i0j1",
      "name": "Business Simulation Q1 2025",
      "activityType": "BizSimulation3_1",
      "startAt": "2025-06-01T09:00:00.000Z",
      "endAt": "2025-06-01T17:00:00.000Z",
      "description": "Quarterly business simulation",
      "isActive": true,
      "createdAt": "2025-05-15T10:30:00.000Z",
      "updatedAt": "2025-05-20T14:45:00.000Z",
      "createdBy": {
        "id": "admin-123",
        "username": "superadmin",
        "email": "admin@example.com",
        "firstName": "Super",
        "lastName": "Admin"
      }
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 10,
  "totalPages": 10,
  "hasNext": true,
  "hasPrevious": false
}
```

### 3. Get Activity by ID
**GET** `/api/activity/{id}`

Retrieve a specific activity by its ID.

**Response:** `200 OK`
```json
{
  "id": "clx1a2b3c4d5e6f7g8h9i0j1",
  "name": "Business Simulation Q1 2025",
  "activityType": "BizSimulation3_1",
  "startAt": "2025-06-01T09:00:00.000Z",
  "endAt": "2025-06-01T17:00:00.000Z",
  "description": "Quarterly business simulation",
  "isActive": true,
  "createdAt": "2025-05-15T10:30:00.000Z",
  "updatedAt": "2025-05-20T14:45:00.000Z",
  "createdBy": {
    "id": "admin-123",
    "username": "superadmin",
    "email": "admin@example.com",
    "firstName": "Super",
    "lastName": "Admin"
  }
}
```

### 4. Update Activity
**PUT** `/api/activity/{id}`

Update an existing activity.

**Request Body:**
```json
{
  "name": "Updated Business Simulation",
  "description": "Updated description",
  "isActive": false
}
```

**Response:** `200 OK` (same format as get activity)

### 5. Delete Activity
**DELETE** `/api/activity/{id}`

Soft delete an activity.

**Response:** `204 No Content`

### 6. Restore Activity
**POST** `/api/activity/{id}/restore`

Restore a soft-deleted activity (Super Admin only).

**Response:** `200 OK` (same format as get activity)

## Status-Based Endpoints

### 7. Get Upcoming Activities
**GET** `/api/activity/status/upcoming`

**Query Parameters:**
- `limit` (integer, optional): Maximum number of activities to return

**Response:** `200 OK`
```json
[
  {
    "id": "activity-1",
    "name": "Future Simulation",
    "startAt": "2025-07-01T09:00:00.000Z",
    "endAt": "2025-07-01T17:00:00.000Z",
    "activityType": "BizSimulation3_1"
  }
]
```

### 8. Get Ongoing Activities
**GET** `/api/activity/status/ongoing`

**Response:** `200 OK` (same format as upcoming activities)

### 9. Get Activity Statistics
**GET** `/api/activity/statistics/overview`

**Response:** `200 OK`
```json
{
  "total": 150,
  "active": 120,
  "upcoming": 25,
  "ongoing": 5,
  "byType": {
    "BizSimulation2_0": 50,
    "BizSimulation2_2": 45,
    "BizSimulation3_1": 55
  }
}
```

### 10. Get Activities by Creator
**GET** `/api/activity/creator/{creatorId}`

**Query Parameters:**
- `includeDeleted` (boolean, optional): Include soft-deleted activities
- `limit` (integer, optional): Maximum number of activities to return

**Response:** `200 OK` (array of activities)

## Activity Types

The system supports the following activity types:

| Type | Description |
|------|-------------|
| `BizSimulation2_0` | Business Simulation version 2.0 |
| `BizSimulation2_2` | Business Simulation version 2.2 |
| `BizSimulation3_1` | Business Simulation version 3.1 |

## Permission System

### Admin Types
- **Super Admin (type 1)**: Full access to all activities
- **Limited Admin (type 2)**: Access only to their own created activities

### Permission Matrix
| Operation | Super Admin | Limited Admin |
|-----------|-------------|---------------|
| Create Activity | ✅ | ✅ |
| View All Activities | ✅ | ❌ (own only) |
| Update Any Activity | ✅ | ❌ (own only) |
| Delete Any Activity | ✅ | ❌ (own only) |
| Restore Activity | ✅ | ❌ |
| View Statistics | ✅ | ✅ (own only) |

## Error Responses

### Common Error Codes

**400 Bad Request**
```json
{
  "success": false,
  "businessCode": 3001,
  "message": "Validation failed",
  "data": null,
  "timestamp": "2025-07-18T12:00:00.000Z",
  "path": "/api/activity"
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "businessCode": 2001,
  "message": "Authentication required",
  "data": null,
  "timestamp": "2025-07-18T12:00:00.000Z",
  "path": "/api/activity"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "businessCode": 2003,
  "message": "Insufficient permissions",
  "data": null,
  "timestamp": "2025-07-18T12:00:00.000Z",
  "path": "/api/activity"
}
```

**404 Not Found**
```json
{
  "success": false,
  "businessCode": 4001,
  "message": "Activity not found",
  "data": null,
  "timestamp": "2025-07-18T12:00:00.000Z",
  "path": "/api/activity/invalid-id"
}
```

## Pagination Guidelines

### Parameters
- **page**: Page number starting from 1
- **pageSize**: Number of items per page (1-100, default: 20)

### Response Format
All paginated endpoints return:
```json
{
  "data": [...],          // Array of items
  "total": 100,           // Total count of items
  "page": 1,             // Current page number
  "pageSize": 20,        // Items per page
  "totalPages": 5,       // Total number of pages
  "hasNext": true,       // Whether there's a next page
  "hasPrevious": false   // Whether there's a previous page
}
```

### Validation Rules
- `page` must be ≥ 1
- `pageSize` must be between 1 and 100
- Invalid pagination parameters return 400 Bad Request

## Rate Limiting

API endpoints are subject to rate limiting based on admin authentication. Refer to the global rate limiting configuration for specific limits.

## Internationalization

Error messages support multiple languages based on the `Accept-Language` header or `lang` query parameter:
- `en`: English (default)
- `zh`: Chinese

## Examples

### Create and Search Workflow
```bash
# 1. Create a new activity
curl -X POST /api/activity \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Q1 2025 Training",
    "activityType": "BizSimulation3_1",
    "startAt": "2025-04-01T09:00:00Z",
    "endAt": "2025-04-01T17:00:00Z"
  }'

# 2. Search for activities
curl -X GET "/api/activity?page=1&pageSize=10&name=training" \
  -H "Authorization: Bearer <token>"

# 3. Get activity statistics
curl -X GET /api/activity/statistics/overview \
  -H "Authorization: Bearer <token>"
```

---

*This API follows RESTful conventions and includes comprehensive error handling, pagination, and role-based access control for secure activity management.* 