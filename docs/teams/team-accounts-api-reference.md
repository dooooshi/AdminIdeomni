# Team Accounts API Reference

This document provides a comprehensive reference for the Team Accounts API, which manages gold and carbon resources for teams in the business simulation platform.

## Base URL
```
http://localhost:2999/api
```

## Authentication
All endpoints require JWT authentication via the `Authorization: Bearer <token>` header.

## Endpoint Overview

### Team Member Endpoints
- `GET /user/team/account` - Get current user's team account

### Manager Endpoints  
- `GET /user/manage/team-accounts` - List all team accounts in activity
- `GET /user/manage/team-accounts/summary` - Get account statistics
- `GET /user/manage/team-accounts/:teamId` - Get specific team account
- `PUT /user/manage/team-accounts/:teamId/balances` - Update team balances (delta)
- `PUT /user/manage/team-accounts/:teamId/set-balances` - Set team balances (absolute)

---

## Team Member API

### Get Current User's Team Account

Retrieves the team account for the authenticated user's current team. Users can only access their own team's account.

**Endpoint:** `GET /user/team/account`

**Authentication:** Required (User token)

**Authorization:** Team members, Team leaders

**Response:**
```json
{
  "id": "teamaccount_123",
  "teamId": "team_456", 
  "gold": 1000,
  "carbon": 500,
  "createdAt": "2025-07-28T10:00:00.000Z",
  "updatedAt": "2025-07-28T10:00:00.000Z",
  "team": {
    "id": "team_456",
    "name": "Alpha Squad",
    "description": "Strategic business simulation team",
    "leader": {
      "id": "user_789",
      "username": "alice_manager",
      "email": "alice@example.com",
      "firstName": "Alice",
      "lastName": "Johnson"
    },
    "members": [
      {
        "id": "teammember_101",
        "status": "ACTIVE",
        "user": {
          "id": "user_789",
          "username": "alice_manager",
          "email": "alice@example.com",
          "firstName": "Alice",
          "lastName": "Johnson"
        }
      }
    ]
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Authentication required
- `403` - User not enrolled in any activity
- `404` - User not in any team or team account not found

**Example Request:**
```bash
curl -X GET http://localhost:2999/api/user/team/account \
  -H "Authorization: Bearer <user_token>"
```

---

## Manager API

### List All Team Accounts

Retrieves all team accounts within the manager's current activity with pagination support.

**Endpoint:** `GET /user/manage/team-accounts`

**Authentication:** Required (Manager token)

**Authorization:** Managers only

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 20, max: 100)
- `search` (optional): Search term for team name

**Response:**
```json
{
  "data": [
    {
      "id": "teamaccount_123",
      "teamId": "team_456",
      "gold": 1000,
      "carbon": 500,
      "createdAt": "2025-07-28T10:00:00.000Z",
      "updatedAt": "2025-07-28T10:00:00.000Z",
      "team": {
        "id": "team_456",
        "name": "Alpha Squad",
        "description": "Strategic business simulation team",
        "leader": {
          "id": "user_789",
          "username": "alice_manager",
          "email": "alice@example.com",
          "firstName": "Alice",
          "lastName": "Johnson"
        },
        "_count": {
          "members": 4
        }
      }
    }
  ],
  "total": 15,
  "page": 1,
  "pageSize": 20,
  "totalPages": 1,
  "hasNext": false,
  "hasPrevious": false
}
```

**Status Codes:**
- `200` - Success
- `401` - Authentication required
- `403` - Only managers can access this feature

**Example Request:**
```bash
curl -X GET "http://localhost:2999/api/user/manage/team-accounts?page=1&pageSize=10&search=Alpha" \
  -H "Authorization: Bearer <manager_token>"
```

### Get Account Summary Statistics

Provides aggregate statistics for all team accounts in the manager's activity.

**Endpoint:** `GET /user/manage/team-accounts/summary`

**Authentication:** Required (Manager token)

**Authorization:** Managers only

**Response:**
```json
{
  "totalTeamsWithAccounts": 15,
  "totalGold": 15000,
  "totalCarbon": 7500,
  "averageGold": 1000,
  "averageCarbon": 500
}
```

**Status Codes:**
- `200` - Success
- `401` - Authentication required
- `403` - Only managers can access this feature

**Example Request:**
```bash
curl -X GET http://localhost:2999/api/user/manage/team-accounts/summary \
  -H "Authorization: Bearer <manager_token>"
```

### Get Specific Team Account

Retrieves detailed information for a specific team account.

**Endpoint:** `GET /user/manage/team-accounts/:teamId`

**Authentication:** Required (Manager token)

**Authorization:** Managers only

**Path Parameters:**
- `teamId`: The ID of the team

**Response:** Same as "Get Current User's Team Account"

**Status Codes:**
- `200` - Success
- `401` - Authentication required
- `403` - Only managers can access this feature
- `404` - Team account not found

**Example Request:**
```bash
curl -X GET http://localhost:2999/api/user/manage/team-accounts/team_456 \
  -H "Authorization: Bearer <manager_token>"
```

### Update Team Account Balances (Delta Changes)

Updates team account balances by adding or subtracting amounts.

**Endpoint:** `PUT /user/manage/team-accounts/:teamId/balances`

**Authentication:** Required (Manager token)

**Authorization:** Managers only

**Path Parameters:**
- `teamId`: The ID of the team

**Request Body:**
```json
{
  "goldDelta": 100,    // Optional: Amount to add/subtract from gold (can be negative)
  "carbonDelta": -50   // Optional: Amount to add/subtract from carbon (can be negative)
}
```

**Response:**
```json
{
  "id": "teamaccount_123",
  "teamId": "team_456",
  "gold": 1100,        // Updated balance
  "carbon": 450,       // Updated balance
  "createdAt": "2025-07-28T10:00:00.000Z",
  "updatedAt": "2025-07-28T10:30:00.000Z"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid balance changes (would result in negative balance)
- `401` - Authentication required
- `403` - Only managers can access this feature
- `404` - Team account not found

**Example Request:**
```bash
curl -X PUT http://localhost:2999/api/user/manage/team-accounts/team_456/balances \
  -H "Authorization: Bearer <manager_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "goldDelta": 100,
    "carbonDelta": -50
  }'
```

### Set Team Account Balances (Absolute Values)

Sets team account balances to specific absolute values.

**Endpoint:** `PUT /user/manage/team-accounts/:teamId/set-balances`

**Authentication:** Required (Manager token)

**Authorization:** Managers only

**Path Parameters:**
- `teamId`: The ID of the team

**Request Body:**
```json
{
  "gold": 2000,    // Required: New gold amount (must be >= 0)
  "carbon": 1000   // Required: New carbon amount (must be >= 0)
}
```

**Response:** Same as "Update Team Account Balances"

**Status Codes:**
- `200` - Success
- `400` - Invalid input (negative values not allowed)
- `401` - Authentication required
- `403` - Only managers can access this feature
- `404` - Team account not found

**Example Request:**
```bash
curl -X PUT http://localhost:2999/api/user/manage/team-accounts/team_456/set-balances \
  -H "Authorization: Bearer <manager_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "gold": 2000,
    "carbon": 1000
  }'
```

## Error Handling

All endpoints follow the standard error response format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Error type"
}
```

### Common Error Codes

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | Bad Request | Invalid request parameters or body |
| 401 | Unauthorized | Authentication required or invalid token |
| 403 | Forbidden | Insufficient permissions for the operation |
| 404 | Not Found | Requested resource not found |
| 500 | Internal Server Error | Unexpected server error |

### Team Account Specific Errors

| Error Message | Description |
|---------------|-------------|
| `TEAM_NO_ACTIVITY` | User is not enrolled in any activity |
| `TEAM_ACCESS_DENIED` | User lacks permission to access the resource |
| `TEAM_ACCOUNT_NOT_FOUND` | Team account does not exist |
| `TEAM_ACCOUNT_ALREADY_EXISTS` | Team account already exists |

## Data Models

### TeamAccount
```typescript
{
  id: string;           // Unique account identifier
  teamId: string;       // Associated team ID
  gold: number;         // Gold resource amount
  carbon: number;       // Carbon resource amount  
  createdAt: Date;      // Account creation timestamp
  updatedAt: Date;      // Last update timestamp
}
```

### Team (Basic Info)
```typescript
{
  id: string;
  name: string;
  description: string | null;
  leader: User;
  _count: {
    members: number;    // Total member count
  };
}
```

### User (Basic Info)
```typescript
{
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}
```

## Security Considerations

1. **Authentication Required**: All endpoints require valid JWT tokens
2. **Role-Based Access**: Clear separation between team member and manager endpoints
3. **Activity Scope**: Managers can only access teams within their assigned activity
4. **Team Membership**: Regular users can only access their own team's account
5. **Balance Validation**: Prevents negative balance operations to maintain data integrity

## Rate Limiting

All endpoints are subject to the global rate limiting policy:
- **General endpoints**: 100 requests per minute per user
- **Balance update endpoints**: 20 requests per minute per user (additional restriction)

## Swagger Documentation

Interactive API documentation is available at:
```
http://localhost:2999/docs
```

Navigate to the "Team Account Management" and "Manager Team Account Management" sections for interactive testing.