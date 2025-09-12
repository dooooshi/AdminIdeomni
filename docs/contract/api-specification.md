# Contract System API Specification (Ultra Simple)

## Overview
Ultra-simple REST API for managing multi-team contracts with just title and content.

## Base URL
```
/api/contract
```

## Authentication
All endpoints require JWT authentication:
- UserAuthGuard (automatically provides teamId and activityId from authenticated user context)

## API Endpoints

### 1. Create Contract

#### POST /api/contract/create
Create a new contract with teams.

**Authorization**: UserAuthGuard (Student role required, must be in a team)

**Request Body**:
```json
{
  "title": "Partnership Agreement",
  "content": "This agreement establishes a partnership between the involved teams...",
  "teamIds": ["team456", "team789"]  // Array of team IDs to include (creator's team is added automatically)
}
```

**Response**:
```json
{
  "success": true,
  "businessCode": 201,
  "message": "Contract created successfully",
  "data": {
    "contractId": "cuid123",
    "contractNumber": "CTR-2024-0001",
    "status": "等待全部队伍同意",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### 2. List Contracts

#### GET /api/contract/list
Get list of contracts for the authenticated team.

**Authorization**: UserAuthGuard

**Query Parameters**:
- `status` (optional): Filter by status (等待全部队伍同意, 队伍取消或拒绝, 成功签署)
- `page` (default: 1): Page number
- `limit` (default: 20): Items per page

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Contracts retrieved successfully",
  "data": {
    "contracts": [
      {
        "contractId": "cuid123",
        "contractNumber": "CTR-2024-0001",
        "title": "Partnership Agreement",
        "status": "等待全部队伍同意",
        "teamCount": 3,
        "teams": [
          { "teamId": "team123", "teamName": "Team Alpha" },
          { "teamId": "team456", "teamName": "Team Beta" },
          { "teamId": "team789", "teamName": "Team Gamma" }
        ],
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

### 3. Get Contract Details

#### GET /api/contract/:contractId
Get full details of a specific contract.

**Authorization**: UserAuthGuard

**Parameters**:
- `contractId` (path): The contract ID

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Contract details retrieved successfully",
  "data": {
    "contractId": "cuid123",
    "contractNumber": "CTR-2024-0001",
    "title": "Partnership Agreement",
    "content": "This agreement establishes a partnership between the involved teams...",
    "status": "等待全部队伍同意",
    "teams": [
      {
        "teamId": "team123",
        "teamName": "Team Alpha",
        "joinedAt": "2024-01-15T10:00:00Z"
      },
      {
        "teamId": "team456",
        "teamName": "Team Beta",
        "joinedAt": "2024-01-15T10:00:00Z"
      },
      {
        "teamId": "team789",
        "teamName": "Team Gamma",
        "joinedAt": "2024-01-15T11:00:00Z"
      }
    ],
    "createdBy": {
      "userId": "user123",
      "username": "john.doe",
      "firstName": "John",
      "lastName": "Doe"
    },
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### 4. Approve Contract

#### POST /api/contract/:contractId/approve
Approve a contract for the user's team.

**Authorization**: UserAuthGuard (Student role required, must be in a team)

**Parameters**:
- `contractId` (path): The contract ID

**Request Body**:
```json
{}
```

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Contract approved by team",
  "data": {
    "contractId": "cuid123",
    "status": "成功签署",
    "signedAt": "2024-03-15T10:00:00Z",
    "allTeamsApproved": true
  }
}
```

### 5. Reject Contract

#### POST /api/contract/:contractId/reject
Reject a contract for the user's team.

**Authorization**: UserAuthGuard (Student role required, must be in a team)

**Parameters**:
- `contractId` (path): The contract ID

**Request Body**:
```json
{}
```

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Contract rejected by team",
  "data": {
    "contractId": "cuid123",
    "status": "队伍取消或拒绝",
    "rejectedAt": "2024-03-15T10:00:00Z"
  }
}
```

### 6. Get Available Teams

#### GET /api/contract/teams/available
Get list of teams in the user's activity (excluding user's own team).

**Authorization**: UserAuthGuard (Student role required, must be in a team)

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Available teams retrieved successfully",
  "data": {
    "teams": [
      {
        "teamId": "team456",
        "teamName": "Team Beta"
      },
      {
        "teamId": "team789",
        "teamName": "Team Gamma"
      }
    ],
    "total": 2
  }
}
```

### 7. Get Contract History

#### GET /api/contract/:contractId/history
Get operation history for a specific contract.

**Authorization**: UserAuthGuard

**Parameters**:
- `contractId` (path): The contract ID

**Query Parameters**:
- `page` (default: 1): Page number
- `limit` (default: 20): Items per page

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Contract history retrieved successfully",
  "data": {
    "history": [
      {
        "id": "hist122",
        "operationType": "APPROVED",
        "description": "Team Beta approved the contract",
        "operator": {
          "userId": "user456",
          "username": "jane.smith",
          "firstName": "Jane",
          "lastName": "Smith"
        },
        "operatorTeam": {
          "teamId": "team456",
          "teamName": "Team Beta"
        },
        "previousStatus": "等待全部队伍同意",
        "newStatus": "成功签署",
        "metadata": null,
        "createdAt": "2024-03-15T10:00:00Z"
      },
      {
        "id": "hist121",
        "operationType": "CREATED",
        "description": "Contract created",
        "operator": {
          "userId": "user123",
          "username": "john.doe",
          "firstName": "John",
          "lastName": "Doe"
        },
        "operatorTeam": {
          "teamId": "team123",
          "teamName": "Team Alpha"
        },
        "previousStatus": null,
        "newStatus": "等待全部队伍同意",
        "metadata": {
          "initialTeams": ["team123", "team456"]
        },
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 2,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

## Error Responses

All error responses follow the standard format:

```json
{
  "success": false,
  "businessCode": 400,
  "message": "Error message",
  "error": {
    "code": "CONTRACT_NOT_FOUND",
    "details": "Contract with ID cuid123 not found"
  },
  "timestamp": "2024-01-15T10:00:00Z",
  "path": "/api/contract/cuid123"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| CONTRACT_NOT_FOUND | 404 | Contract does not exist |
| CONTRACT_ACCESS_DENIED | 403 | No permission to access contract |
| CONTRACT_INVALID_STATUS | 400 | Operation not allowed in current status |
| CONTRACT_VALIDATION_ERROR | 400 | Invalid contract data |
| TEAM_NOT_FOUND | 404 | Team does not exist |
| TEAM_NOT_IN_ACTIVITY | 400 | Team not in same activity |
| CONTRACT_LIMIT_EXCEEDED | 429 | Team contract limit reached |
| UNAUTHORIZED_ROLE | 403 | User role not authorized |

## Business Logic Validation

### Contract Creation
- Student role (userType: 3) required
- Must be a member of an active team
- Title: 10-200 characters
- Content: 50-10000 characters
- At least 2 teams required (including creator's team)
- Maximum 10 teams per contract
- All teams must be in same activity
- Contract starts in PENDING_APPROVAL status
- Creator's team automatically approves

### Contract Approval
- Must be in PENDING_APPROVAL status
- Student from participating team can approve
- All teams must approve for contract to be signed

### Contract Rejection
- Must be in PENDING_APPROVAL status
- Any Student from participating teams can reject
- Contract immediately moves to REJECTED status

## Rate Limiting

- Create operations: 10 per hour
- Read operations: 100 per minute
- Complete operations: 20 per hour