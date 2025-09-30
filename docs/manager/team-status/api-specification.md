# API Specification: Manager Team Status

## Overview

This document defines the API endpoints for the Manager Team Status Dashboard feature. All endpoints are protected by JWT authentication and require manager-level access (userType === 1).

## Base Configuration

- **Base Path**: `/api/manager`
- **Authentication**: Bearer token (JWT)
- **Content Type**: `application/json`
- **Activity Context**: Automatically derived from manager's UserActivity enrollment

## Common Response Structure

```typescript
interface ApiResponse<T> {
  success: boolean;
  businessCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
  extra?: object;
}
```

## Pagination Structure

```typescript
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}
```

## API Endpoints

### 1. List All Teams

**Endpoint**: `GET /api/manager/teams`

**Description**: Retrieve all teams in the manager's current activity

**Query Parameters**:
```typescript
interface ListTeamsQuery {
  page?: number;        // Default: 1
  limit?: number;       // Default: 20, Max: 100
  sort?: 'name' | 'createdAt' | 'goldBalance' | 'carbonBalance';  // Default: 'name'
  order?: 'ASC' | 'DESC';  // Default: 'ASC'
  search?: string;      // Search in team name
  isOpen?: boolean;     // Filter by open/closed status
}
```

**Response**:
```typescript
interface TeamSummary {
  id: string;
  name: string;
  description: string | null;
  leaderId: string;
  leaderName: string;
  memberCount: number;
  maxMembers: number;
  isOpen: boolean;
  goldBalance: string;    // Decimal as string
  carbonBalance: string;  // Decimal as string
  lastActivityAt: string; // ISO datetime
  createdAt: string;     // ISO datetime
}

type Response = ApiResponse<PaginatedResponse<TeamSummary>>;
```

**Example Response**:
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Teams retrieved successfully",
  "data": {
    "items": [
      {
        "id": "cm2abc123",
        "name": "Alpha Team",
        "description": "Innovation focused team",
        "leaderId": "cm2def456",
        "leaderName": "John Doe",
        "memberCount": 4,
        "maxMembers": 6,
        "isOpen": true,
        "goldBalance": "15000.500",
        "carbonBalance": "8500.250",
        "lastActivityAt": "2025-09-30T10:30:00Z",
        "createdAt": "2025-09-15T08:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  },
  "timestamp": "2025-09-30T14:00:00Z",
  "path": "/api/manager/teams"
}
```

### 2. Get Team Status

**Endpoint**: `GET /api/manager/teams/:teamId/status`

**Description**: Retrieve detailed status information for a specific team

**Path Parameters**:
- `teamId`: The team's unique identifier

**Response**:
```typescript
interface TeamStatus {
  id: string;
  name: string;
  description: string | null;
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;

  // Leadership
  leader: {
    id: string;
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };

  // Financial status
  account: {
    goldBalance: string;
    carbonBalance: string;
    lastUpdated: string;
  };

  // Statistics
  statistics: {
    totalMembers: number;
    activeMembers: number;
    totalLandOwned: string;  // Decimal area
    totalFacilities: number;
    activeFacilities: number;
    totalOperations: number;
    operationsToday: number;
    operationsThisWeek: number;
  };

  // Recent activity
  recentOperations: {
    type: string;
    amount: string;
    resourceType: 'GOLD' | 'CARBON';
    timestamp: string;
  }[];
}

type Response = ApiResponse<TeamStatus>;
```

### 3. Get Team Operations History

**Endpoint**: `GET /api/manager/teams/:teamId/operations`

**Description**: Retrieve paginated operation history for a team

**Path Parameters**:
- `teamId`: The team's unique identifier

**Query Parameters**:
```typescript
interface OperationsQuery {
  page?: number;        // Default: 1
  limit?: number;       // Default: 20, Max: 100
  sort?: 'createdAt' | 'amount';  // Default: 'createdAt'
  order?: 'ASC' | 'DESC';  // Default: 'DESC'

  // Filters
  operationType?: TeamOperationType;
  resourceType?: 'GOLD' | 'CARBON';
  dateFrom?: string;    // ISO date
  dateTo?: string;      // ISO date
  minAmount?: number;
  maxAmount?: number;
}
```

**Response**:
```typescript
interface TeamOperation {
  id: string;
  operationType: TeamOperationType;
  amount: string;
  resourceType: 'GOLD' | 'CARBON';
  balanceBefore: string;
  balanceAfter: string;
  description: string | null;

  // Related entities
  user: {
    id: string;
    username: string;
  } | null;

  targetTeam: {
    id: string;
    name: string;
  } | null;

  sourceTeam: {
    id: string;
    name: string;
  } | null;

  metadata: object | null;
  createdAt: string;
}

type Response = ApiResponse<PaginatedResponse<TeamOperation>>;
```

### 4. Get Team Facilities

**Endpoint**: `GET /api/manager/teams/:teamId/facilities`

**Description**: Retrieve all facilities owned by a team

**Path Parameters**:
- `teamId`: The team's unique identifier

**Query Parameters**:
```typescript
interface FacilitiesQuery {
  page?: number;        // Default: 1
  limit?: number;       // Default: 20, Max: 100
  sort?: 'constructionStarted' | 'facilityType' | 'level';  // Default: 'constructionStarted'
  order?: 'ASC' | 'DESC';  // Default: 'DESC'

  // Filters
  facilityType?: FacilityType;
  status?: FacilityInstanceStatus;
  tileId?: number;
  minLevel?: number;
}
```

**Response**:
```typescript
interface TeamFacility {
  id: string;
  facilityType: string;
  level: number;
  occupiedLandArea: number;
  status: string;

  // Costs
  buildGoldCost: string;
  buildCarbonCost: string;
  totalUpgradeCost: string;

  // Performance
  productionRate: string | null;
  capacity: number | null;
  efficiency: string | null;

  // Location
  tile: {
    id: number;
    q: number;
    r: number;
    landType: string;
  };

  // Build info
  constructionStarted: string;
  constructionCompleted: string | null;
  builtBy: {
    id: string;
    username: string;
  };

  // Infrastructure
  hasInfrastructureConnections: boolean;
  infrastructureConnectionCount: number;
}

type Response = ApiResponse<PaginatedResponse<TeamFacility>>;
```

### 5. Get Team Land Ownership

**Endpoint**: `GET /api/manager/teams/:teamId/land`

**Description**: Retrieve land ownership details for a team

**Path Parameters**:
- `teamId`: The team's unique identifier

**Query Parameters**:
```typescript
interface LandQuery {
  page?: number;        // Default: 1
  limit?: number;       // Default: 20, Max: 100
  sort?: 'purchaseDate' | 'ownedArea' | 'totalSpent';  // Default: 'purchaseDate'
  order?: 'ASC' | 'DESC';  // Default: 'DESC'

  // Filters
  tileId?: number;
  dateFrom?: string;    // ISO date
  dateTo?: string;      // ISO date
  minArea?: number;
}
```

**Response**:
```typescript
interface TeamLandOwnership {
  id: string;

  // Ownership details
  ownedArea: string;       // Total area owned on this tile
  totalGoldSpent: string;
  totalCarbonSpent: string;
  purchaseCount: number;

  // Tile information
  tile: {
    id: number;
    q: number;
    r: number;
    landType: string;
    totalArea: number;
  };

  // Purchase history
  firstPurchaseDate: string;
  lastPurchaseDate: string;

  // Recent purchases
  recentPurchases: {
    id: string;
    purchasedArea: string;
    goldCost: string;
    carbonCost: string;
    purchaseDate: string;
    purchasedBy: {
      id: string;
      username: string;
    };
  }[];
}

type Response = ApiResponse<PaginatedResponse<TeamLandOwnership>>;
```

### 6. Get Team Members

**Endpoint**: `GET /api/manager/teams/:teamId/members`

**Description**: Retrieve team member details

**Path Parameters**:
- `teamId`: The team's unique identifier

**Query Parameters**:
```typescript
interface MembersQuery {
  page?: number;        // Default: 1
  limit?: number;       // Default: 20, Max: 100
  sort?: 'joinedAt' | 'username' | 'userType';  // Default: 'joinedAt'
  order?: 'ASC' | 'DESC';  // Default: 'ASC'

  // Filters
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  userType?: 1 | 2 | 3;  // Manager/Worker/Student
}
```

**Response**:
```typescript
interface TeamMemberDetail {
  id: string;

  user: {
    id: string;
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    userType: number;
    userTypeLabel: string;  // "Manager" | "Worker" | "Student"
    isActive: boolean;
    lastLoginAt: string | null;
  };

  membership: {
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
    joinedAt: string;
    leftAt: string | null;
    isLeader: boolean;
  };

  // Activity statistics
  statistics: {
    operationsCount: number;
    landPurchasesCount: number;
    facilitiesBuiltCount: number;
  };
}

type Response = ApiResponse<PaginatedResponse<TeamMemberDetail>>;
```

### 7. Get Team Balance History

**Endpoint**: `GET /api/manager/teams/:teamId/balance-history`

**Description**: Retrieve historical balance snapshots for a team

**Path Parameters**:
- `teamId`: The team's unique identifier

**Query Parameters**:
```typescript
interface BalanceHistoryQuery {
  page?: number;        // Default: 1
  limit?: number;       // Default: 20, Max: 100
  sort?: 'createdAt';   // Default: 'createdAt'
  order?: 'ASC' | 'DESC';  // Default: 'DESC'

  // Filters
  dateFrom?: string;    // ISO date
  dateTo?: string;      // ISO date
  minChange?: number;   // Minimum change amount
}
```

**Response**:
```typescript
interface TeamBalanceHistory {
  id: string;

  // Balance snapshot
  goldBalance: string;       // Gold balance at this point
  carbonBalance: string;     // Carbon balance at this point

  // Change information
  goldChange: string;        // Change in gold (positive or negative)
  carbonChange: string;      // Change in carbon (positive or negative)

  // Related operation
  operationId: string | null;  // Link to TeamOperationHistory
  operation: {
    type: string;
    description: string | null;
  } | null;

  // Timestamp
  createdAt: string;
}

type Response = ApiResponse<PaginatedResponse<TeamBalanceHistory>>;
```

## Error Responses

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| 1001 | Unauthorized - Invalid or missing token | 401 |
| 1002 | Forbidden - Not a manager | 403 |
| 1003 | Forbidden - Team not in manager's activity | 403 |
| 2001 | Team not found | 404 |
| 2002 | No activity enrollment found | 404 |
| 3001 | Invalid pagination parameters | 400 |
| 3002 | Invalid filter parameters | 400 |
| 5001 | Internal server error | 500 |

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  businessCode: number;
  message: string;
  error: {
    code: string;
    details?: object;
  };
  timestamp: string;
  path: string;
}
```

## Rate Limiting

- **Requests per minute**: 60
- **Burst limit**: 10
- **Headers returned**:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Reset timestamp

## Implementation Notes

1. **Activity Context**: All endpoints automatically filter data based on the manager's enrolled activity
2. **Authorization**: Middleware validates manager role and activity enrollment
3. **Data Consistency**: Use transactions for operations affecting multiple tables
4. **Performance**: Implement database indexes on frequently queried fields
5. **Caching**: Consider caching team summaries with short TTL (5 minutes)
6. **Audit**: Log all manager access to team data for security compliance

## Future Enhancements

1. **WebSocket Support**: Real-time updates for team operations
2. **Export Functionality**: CSV/Excel export for operation history
3. **Bulk Operations**: Batch operations for managing multiple teams
4. **Analytics Dashboard**: Advanced metrics and visualizations
5. **Notifications**: Alert managers when teams need attention