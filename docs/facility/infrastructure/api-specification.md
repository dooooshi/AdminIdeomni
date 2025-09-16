# Infrastructure System API Specification

## Overview
This document defines the RESTful API endpoints for the infrastructure management system. All endpoints follow REST conventions and return standardized responses via the ResponseFormatterInterceptor.

## Base URL
```
/api/infrastructure
```

## Authentication
All endpoints require JWT authentication:
- User endpoints: UserAuthGuard (automatically provides teamId and activityId from authenticated user context)
- Admin endpoints: AdminAuthGuard

**Note**: For student users, the teamId and activityId are automatically obtained from the authentication token. There's no need to pass these as parameters in the API calls.

## API Endpoints

### 1. Facility Infrastructure Status APIs

Essential APIs for students to check their facility infrastructure requirements and status.

#### GET /api/infrastructure/status/facility/:facilityId
Get complete infrastructure status for a specific facility.

**Authorization**: UserAuthGuard

**Parameters**:
- `facilityId` (path): The facility instance ID

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Infrastructure status retrieved successfully",
  "data": {
    "facilityId": "cuid123",
    "facilityType": "FACTORY",
    "category": "FUNCTIONAL",
    "requiresInfrastructure": true,
    "infrastructureStatus": {
      "water": {
        "required": true,
        "connected": true,
        "provider": {
          "facilityId": "cuid456",
          "teamId": "team123",
          "teamName": "Team Alpha",
          "facilityLevel": 2,
          "unitPrice": 10.5
        },
        "connectionDetails": {
          "distance": 5,
          "operationPointsCost": 6,
          "connectedAt": "2024-01-15T10:00:00Z"
        }
      },
      "power": {
        "required": true,
        "connected": false,
        "provider": null,
        "connectionDetails": null
      },
      "baseStation": {
        "required": true,
        "covered": true,
        "provider": {
          "facilityId": "cuid789",
          "teamId": "team456",
          "teamName": "Team Beta",
          "facilityLevel": 3,
          "annualFee": 1000
        },
        "subscriptionDetails": {
          "distance": 2,
          "subscribedAt": "2024-01-10T10:00:00Z",
          "nextBillingDate": "2025-01-10T10:00:00Z"
        }
      },
      "fireStation": {
        "required": true,
        "covered": false,
        "provider": null,
        "subscriptionDetails": null
      }
    },
    "operationalStatus": "PARTIAL",
    "missingInfrastructure": ["POWER", "FIRE_STATION"],
    "operationalPercentage": 50
  }
}
```

#### GET /api/infrastructure/status/team/facilities
List all team facilities with their infrastructure status. Team ID is obtained from the authenticated user.

**Authorization**: UserAuthGuard

**Query Parameters**:
- `activityId` (optional): Filter by activity ID

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Team facilities status retrieved successfully",
  "data": {
    "teamId": "team123",
    "teamName": "Team Alpha",
    "facilities": [
      {
        "facilityId": "cuid123",
        "facilityType": "FACTORY",
        "tileCoordinates": { "q": 5, "r": 3 },
        "level": 2,
        "operationalStatus": "FULL",
        "infrastructureStatus": {
          "water": { "connected": true, "providerTeam": "Team Beta" },
          "power": { "connected": true, "providerTeam": "Team Beta" },
          "baseStation": { "covered": true, "providerTeam": "Team Gamma" },
          "fireStation": { "covered": true, "providerTeam": "Team Delta" }
        }
      },
      {
        "facilityId": "cuid456",
        "facilityType": "MINE",
        "tileCoordinates": { "q": 7, "r": 2 },
        "level": 1,
        "operationalStatus": "PARTIAL",
        "missingInfrastructure": ["FIRE_STATION"]
      }
    ],
    "summary": {
      "totalFacilities": 2,
      "fullyOperational": 1,
      "partiallyOperational": 1,
      "nonOperational": 0
    }
  }
}
```

#### GET /api/infrastructure/status/activity/overview
Get activity-wide infrastructure overview. Activity ID is obtained from the authenticated user.

**Authorization**: UserAuthGuard

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Activity infrastructure overview retrieved successfully",
  "data": {
    "activityId": "activity123",
    "infrastructureProviders": {
      "waterPlants": [
        {
          "facilityId": "cuid123",
          "teamName": "Team Alpha",
          "level": 2,
          "location": { "q": 5, "r": 3 },
          "totalCapacity": 100,
          "usedCapacity": 45,
          "availableCapacity": 55,
          "connections": 8,
          "unitPrice": 10
        }
      ],
      "powerPlants": [...],
      "baseStations": [...],
      "fireStations": [...]
    },
    "statistics": {
      "totalProviders": 12,
      "totalConsumers": 24,
      "activeConnections": 36,
      "averageWaterPrice": 12.5,
      "averagePowerPrice": 15.0,
      "coverageMap": {
        "baseStationCoverage": "85%",
        "fireStationCoverage": "72%"
      }
    }
  }
}
```

### 2. Infrastructure Discovery APIs

APIs for discovering available infrastructure providers and services.

#### GET /api/infrastructure/discovery/available/connections/:facilityId
Discover available water and power providers for a consumer facility.

**Authorization**: UserAuthGuard

**Parameters**:
- `facilityId` (path): The consumer facility ID
- `type` (query, optional): Filter by WATER or POWER
- `maxDistance` (query, optional): Maximum distance to search
- `sortBy` (query, optional): Sort by distance, price, or capacity

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Available providers discovered successfully",
  "data": {
    "consumerFacility": {
      "facilityId": "cuid123",
      "location": { "q": 10, "r": 5 },
      "type": "FACTORY"
    },
    "waterProviders": [
      {
        "providerId": "cuid456",
        "providerTeamId": "team123",
        "providerTeamName": "Team Alpha",
        "facilityLevel": 2,
        "location": { "q": 8, "r": 4 },
        "distance": 3,
        "operationPointsCost": 4,
        "unitPrice": 10.5,
        "totalCapacity": 100,
        "usedCapacity": 30,
        "availableCapacity": 70,
        "pathValid": true,
        "pathCrossesMarine": false,
        "estimatedPath": [
          { "q": 10, "r": 5 },
          { "q": 9, "r": 5 },
          { "q": 8, "r": 4 }
        ]
      }
    ],
    "powerProviders": [...]
  }
}
```

#### GET /api/infrastructure/discovery/available/services/:facilityId
Discover available base station and fire station services.

**Authorization**: UserAuthGuard

**Parameters**:
- `facilityId` (path): The consumer facility ID
- `type` (query, optional): Filter by BASE_STATION or FIRE_STATION

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Available services discovered successfully",
  "data": {
    "consumerFacility": {
      "facilityId": "cuid123",
      "location": { "q": 10, "r": 5 },
      "type": "WAREHOUSE"
    },
    "baseStations": [
      {
        "serviceId": "service123",
        "providerId": "cuid789",
        "providerTeamId": "team456",
        "providerTeamName": "Team Beta",
        "facilityLevel": 3,
        "location": { "q": 9, "r": 6 },
        "distance": 2,
        "influenceRange": 2,
        "inRange": true,
        "annualFee": 1000,
        "currentSubscribers": 5
      }
    ],
    "fireStations": [...]
  }
}
```

#### GET /api/infrastructure/discovery/reachable/:facilityId
Get all facilities this infrastructure provider can reach.

**Authorization**: UserAuthGuard

**Parameters**:
- `facilityId` (path): The provider facility ID
- `facilityCategory` (query, optional): Filter by RAW_MATERIAL_PRODUCTION or FUNCTIONAL

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Reachable facilities retrieved successfully",
  "data": {
    "providerFacility": {
      "facilityId": "cuid123",
      "type": "WATER_PLANT",
      "level": 2,
      "location": { "q": 5, "r": 3 },
      "operationPoints": 100,
      "usedOperationPoints": 30,
      "availableOperationPoints": 70
    },
    "reachableFacilities": [
      {
        "facilityId": "cuid456",
        "teamId": "team789",
        "teamName": "Team Gamma",
        "facilityType": "FACTORY",
        "location": { "q": 7, "r": 4 },
        "distance": 3,
        "operationPointsRequired": 4,
        "hasWaterConnection": false,
        "pathValid": true
      }
    ],
    "statistics": {
      "totalReachable": 15,
      "currentlyConnected": 5,
      "potentialConnections": 10
    }
  }
}
```

### 3. Infrastructure Connection APIs

APIs for managing water and power connections.

#### POST /api/infrastructure/connections/request
Consumer requests connection to provider's water/power plant.

**Authorization**: UserAuthGuard

**Request Body**:
```json
{
  "consumerFacilityId": "cuid123",
  "providerFacilityId": "cuid456",
  "connectionType": "WATER",
  "proposedUnitPrice": 12.5
}
```

**Success Response**:
```json
{
  "success": true,
  "businessCode": 201,
  "message": "Connection request sent successfully",
  "data": {
    "requestId": "req123",
    "status": "PENDING",
    "consumerTeam": "Team Alpha",
    "providerTeam": "Team Beta",
    "connectionType": "WATER",
    "distance": 5,
    "operationPointsNeeded": 6,
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

**Error Response - Already Connected**:
```json
{
  "success": false,
  "businessCode": 400,
  "message": "Facility already has an active water connection",
  "error": {
    "code": "ALREADY_CONNECTED",
    "details": "This facility already has an active WATER connection. Disconnect first before requesting a new connection."
  }
}
```

**Error Response - Pending Request Exists**:
```json
{
  "success": false,
  "businessCode": 400,
  "message": "Facility already has a pending water connection request",
  "error": {
    "code": "PENDING_REQUEST_EXISTS",
    "details": "This facility has a pending WATER connection request. Cancel the existing request before creating a new one."
  }
}
```

**Note**: If a facility previously had a connection that was disconnected, the system will automatically clean up the old disconnected record when creating a new connection request. This prevents database constraint violations and ensures smooth reconnection workflows.

#### GET /api/infrastructure/connections/requests/provider
List connection requests where team is provider.

**Authorization**: UserAuthGuard

**Query Parameters**:
- `status` (optional): Filter by status (PENDING, ACCEPTED, REJECTED)
- `connectionType` (optional): Filter by WATER or POWER
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Provider requests retrieved successfully",
  "data": {
    "requests": [
      {
        "requestId": "req123",
        "connectionType": "WATER",
        "consumerTeam": {
          "teamId": "team789",
          "teamName": "Team Gamma"
        },
        "consumerFacility": {
          "facilityId": "cuid789",
          "type": "FACTORY",
          "location": { "q": 10, "r": 5 }
        },
        "distance": 5,
        "operationPointsNeeded": 6,
        "proposedUnitPrice": 12.5,
        "status": "PENDING",
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 3,
      "totalPages": 1
    }
  }
}
```

#### GET /api/infrastructure/connections/requests/consumer
List connection requests where team is consumer.

**Authorization**: UserAuthGuard

**Query Parameters**: Same as provider requests

**Response**: Similar structure to provider requests

#### PUT /api/infrastructure/connections/requests/:requestId/accept
Provider accepts connection request.

**Authorization**: UserAuthGuard

**Parameters**:
- `requestId` (path): The request ID

**Request Body**:
```json
{
  "unitPrice": 11.0
}
```

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Connection request accepted",
  "data": {
    "connectionId": "conn123",
    "status": "ACTIVE",
    "unitPrice": 11.0,
    "operationPointsCost": 6,
    "connectedAt": "2024-01-15T11:00:00Z"
  }
}
```

#### PUT /api/infrastructure/connections/requests/:requestId/reject
Provider rejects connection request.

**Authorization**: UserAuthGuard

**Parameters**:
- `requestId` (path): The request ID

**Request Body**:
```json
{
  "reason": "Insufficient capacity"
}
```

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Connection request rejected",
  "data": {
    "requestId": "req123",
    "status": "REJECTED",
    "rejectedAt": "2024-01-15T11:00:00Z"
  }
}
```

#### DELETE /api/infrastructure/connections/:connectionId
Either party disconnects connection.

**Authorization**: UserAuthGuard

**Parameters**:
- `connectionId` (path): The connection ID

**Request Body**:
```json
{
  "reason": "No longer needed"
}
```

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Connection disconnected successfully",
  "data": {
    "connectionId": "conn123",
    "status": "DISCONNECTED",
    "disconnectedAt": "2024-01-15T12:00:00Z",
    "disconnectedBy": "team123"
  }
}
```

#### GET /api/infrastructure/connections/provider
List active connections as provider.

**Authorization**: UserAuthGuard

**Query Parameters**:
- `facilityId` (optional): Filter by provider facility
- `connectionType` (optional): Filter by WATER or POWER
- `status` (optional): Filter by status

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Provider connections retrieved successfully",
  "data": {
    "connections": [
      {
        "connectionId": "conn123",
        "connectionType": "WATER",
        "providerFacility": {
          "facilityId": "cuid123",
          "type": "WATER_PLANT",
          "level": 2
        },
        "consumerFacility": {
          "facilityId": "cuid456",
          "teamName": "Team Gamma",
          "type": "FACTORY"
        },
        "operationPointsCost": 6,
        "unitPrice": 11.0,
        "status": "ACTIVE",
        "connectedAt": "2024-01-15T11:00:00Z"
      }
    ],
    "summary": {
      "totalConnections": 8,
      "totalOperationPointsUsed": 45,
      "totalRevenue": 880
    }
  }
}
```

#### GET /api/infrastructure/connections/consumer
List active connections as consumer.

**Authorization**: UserAuthGuard

**Query Parameters**: Similar to provider connections

**Response**: Similar structure to provider connections

### 4. Infrastructure Service APIs

APIs for managing base station and fire station services.

#### POST /api/infrastructure/services/subscribe
Consumer applies for service subscription.

**Authorization**: UserAuthGuard

**Request Body**:
```json
{
  "consumerFacilityId": "cuid123",
  "serviceId": "service456",
  "proposedAnnualFee": 900
}
```

**Response**:
```json
{
  "success": true,
  "businessCode": 201,
  "message": "Service subscription requested successfully",
  "data": {
    "subscriptionId": "sub123",
    "status": "PENDING",
    "serviceType": "FIRE_STATION",
    "providerTeam": "Team Beta",
    "requestedAt": "2024-01-15T10:00:00Z"
  }
}
```

**Note**: If a facility previously had a subscription that was cancelled or suspended, the system will automatically clean up the old record when creating a new subscription request. This ensures smooth resubscription workflows without database constraint violations.

#### GET /api/infrastructure/services/subscriptions/provider
List subscriptions where team is service provider.

**Authorization**: UserAuthGuard

**Query Parameters**:
- `serviceType` (optional): Filter by BASE_STATION or FIRE_STATION
- `status` (optional): Filter by status

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Provider subscriptions retrieved successfully",
  "data": {
    "subscriptions": [
      {
        "subscriptionId": "sub123",
        "serviceType": "BASE_STATION",
        "consumerFacility": {
          "facilityId": "cuid789",
          "teamName": "Team Delta",
          "type": "WAREHOUSE",
          "location": { "q": 8, "r": 4 }
        },
        "annualFee": 1000,
        "status": "ACTIVE",
        "activatedAt": "2024-01-10T10:00:00Z",
        "nextBillingDate": "2025-01-10T10:00:00Z"
      }
    ],
    "summary": {
      "totalSubscriptions": 5,
      "totalAnnualRevenue": 5000
    }
  }
}
```

#### GET /api/infrastructure/services/subscriptions/consumer
List subscriptions where team is service consumer.

**Authorization**: UserAuthGuard

**Query Parameters**: Similar to provider subscriptions

**Response**: Similar structure to provider subscriptions

#### PUT /api/infrastructure/services/subscriptions/:subscriptionId/accept
Provider accepts service subscription.

**Authorization**: UserAuthGuard

**Parameters**:
- `subscriptionId` (path): The subscription ID

**Request Body**:
```json
{
  "annualFee": 950,
  "startDate": "2024-01-16T00:00:00Z"
}
```

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Subscription accepted",
  "data": {
    "subscriptionId": "sub123",
    "status": "ACTIVE",
    "annualFee": 950,
    "activatedAt": "2024-01-16T00:00:00Z"
  }
}
```

#### PUT /api/infrastructure/services/subscriptions/:subscriptionId/cancel
Either party cancels subscription.

**Authorization**: UserAuthGuard

**Parameters**:
- `subscriptionId` (path): The subscription ID

**Request Body**:
```json
{
  "reason": "Service no longer needed",
  "effectiveDate": "2024-02-01T00:00:00Z"
}
```

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Subscription cancelled successfully",
  "data": {
    "subscriptionId": "sub123",
    "status": "CANCELLED",
    "cancelledAt": "2024-01-20T10:00:00Z",
    "effectiveDate": "2024-02-01T00:00:00Z"
  }
}
```

### 5. Infrastructure Operation APIs

APIs for calculations and validations.

#### GET /api/infrastructure/operations/provider/capacity/:facilityId
Get available operation points for provider facility.

**Authorization**: UserAuthGuard

**Parameters**:
- `facilityId` (path): The provider facility ID

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Provider capacity retrieved successfully",
  "data": {
    "facilityId": "cuid123",
    "facilityType": "WATER_PLANT",
    "level": 2,
    "baseOperationPoints": 50,
    "levelMultiplier": 1.5,
    "totalOperationPoints": 75,
    "connections": [
      {
        "consumerId": "cuid456",
        "distance": 5,
        "operationPointsCost": 6
      }
    ],
    "usedOperationPoints": 30,
    "availableOperationPoints": 45,
    "maxAdditionalConnections": 7
  }
}
```

#### GET /api/infrastructure/operations/consumer/requirements/:facilityId
Get resource requirements for consumer facility.

**Authorization**: UserAuthGuard

**Parameters**:
- `facilityId` (path): The consumer facility ID

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Consumer requirements retrieved successfully",
  "data": {
    "facilityId": "cuid789",
    "facilityType": "FACTORY",
    "category": "FUNCTIONAL",
    "requirements": {
      "water": {
        "required": true,
        "dailyConsumption": 100,
        "currentProvider": "Team Alpha",
        "unitPrice": 10
      },
      "power": {
        "required": true,
        "dailyConsumption": 150,
        "currentProvider": null,
        "unitPrice": null
      },
      "baseStation": {
        "required": true,
        "currentProvider": "Team Beta",
        "annualFee": 1000
      },
      "fireStation": {
        "required": true,
        "currentProvider": null,
        "annualFee": null
      }
    },
    "operationalStatus": "PARTIAL",
    "estimatedDailyCost": 1000,
    "estimatedAnnualServiceCost": 1000
  }
}
```

#### GET /api/infrastructure/operations/path-validation
Validate connection path between facilities.

**Authorization**: UserAuthGuard

**Query Parameters**:
- `fromQ`: Source tile Q coordinate
- `fromR`: Source tile R coordinate
- `toQ`: Destination tile Q coordinate
- `toR`: Destination tile R coordinate
- `activityId`: Activity context

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Path validation completed",
  "data": {
    "from": { "q": 5, "r": 3 },
    "to": { "q": 10, "r": 5 },
    "distance": 7,
    "pathValid": true,
    "crossesMarine": false,
    "suggestedPath": [
      { "q": 5, "r": 3, "landType": "PLAIN" },
      { "q": 6, "r": 3, "landType": "COASTAL" },
      { "q": 7, "r": 3, "landType": "PLAIN" },
      { "q": 8, "r": 4, "landType": "PLAIN" },
      { "q": 9, "r": 4, "landType": "COASTAL" },
      { "q": 10, "r": 5, "landType": "PLAIN" }
    ],
    "alternativePaths": []
  }
}
```

#### GET /api/infrastructure/operations/distance
Calculate hexagonal distance between tiles.

**Authorization**: UserAuthGuard

**Query Parameters**:
- `fromQ`: Source tile Q coordinate
- `fromR`: Source tile R coordinate
- `toQ`: Destination tile Q coordinate
- `toR`: Destination tile R coordinate

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Distance calculated successfully",
  "data": {
    "from": { "q": 5, "r": 3 },
    "to": { "q": 10, "r": 5 },
    "distance": 7,
    "operationPointsCost": 8
  }
}
```

#### GET /api/infrastructure/operations/influence-range/:facilityId
Get influence range for service facility.

**Authorization**: UserAuthGuard

**Parameters**:
- `facilityId` (path): The service facility ID

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Influence range calculated successfully",
  "data": {
    "facilityId": "cuid123",
    "facilityType": "BASE_STATION",
    "level": 3,
    "location": { "q": 5, "r": 3 },
    "influenceRange": 2,
    "coveredTiles": [
      { "q": 5, "r": 3, "distance": 0 },
      { "q": 6, "r": 3, "distance": 1 },
      { "q": 5, "r": 4, "distance": 1 },
      { "q": 4, "r": 3, "distance": 1 },
      { "q": 5, "r": 2, "distance": 1 },
      { "q": 6, "r": 2, "distance": 1 },
      { "q": 4, "r": 4, "distance": 1 },
      { "q": 7, "r": 3, "distance": 2 },
      { "q": 5, "r": 5, "distance": 2 }
    ],
    "facilitiesInRange": [
      {
        "facilityId": "cuid456",
        "teamName": "Team Beta",
        "facilityType": "WAREHOUSE",
        "distance": 1,
        "subscriptionStatus": "ACTIVE"
      }
    ]
  }
}
```

## Error Responses

All endpoints follow the standard error response format:

```json
{
  "success": false,
  "businessCode": 400,
  "message": "Error message",
  "error": {
    "code": "INFRASTRUCTURE_ERROR",
    "details": "Detailed error information"
  },
  "timestamp": "2024-01-15T10:00:00Z",
  "path": "/api/infrastructure/connections/request"
}
```

### Common Error Codes

- `ALREADY_CONNECTED`: Consumer facility already has an active connection/subscription of this type
- `PENDING_REQUEST_EXISTS`: Consumer facility already has a pending request of this type - must cancel first
- `INSUFFICIENT_CAPACITY`: Provider lacks operation points
- `PATH_CROSSES_MARINE`: Connection path crosses MARINE tiles
- `OUT_OF_RANGE`: Consumer facility outside service range
- `INVALID_FACILITY_TYPE`: Facility type doesn't support operation
- `UNAUTHORIZED_OPERATION`: User lacks permission for operation
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist

**Note on Reconnection/Resubscription**:
- The system automatically handles cleanup of disconnected connections and cancelled subscriptions
- Previous 500 errors from unique constraint violations have been resolved
- Facilities can seamlessly apply for new connections/subscriptions after disconnection/cancellation
- All operations are now protected by database transactions to prevent race conditions

## Rate Limiting

All endpoints are subject to rate limiting:
- Discovery endpoints: 30 requests per minute
- Status endpoints: 60 requests per minute
- Connection/Service endpoints: 20 requests per minute

## Webhooks

Infrastructure events can trigger webhooks (if configured):
- Connection accepted/rejected
- Service subscription activated/cancelled
- Facility disconnections

## Versioning

API version is included in the response headers:
```
X-API-Version: 1.0.1
```

## Performance Considerations

- Pagination required for list endpoints (max 100 items)

## Changelog

### Version 1.0.1 (2025-09-15)

#### Bug Fixes
- **Fixed 500 errors on reconnection**: Resolved unique constraint violations when facilities apply for new connections after disconnection
- **Fixed 500 errors on resubscription**: Resolved unique constraint violations when facilities apply for new service subscriptions after cancellation
- **Fixed service registration conflicts**: Infrastructure services (BASE_STATION/FIRE_STATION) now handle re-registration gracefully with update-or-create logic

#### Improvements
- **Transaction protection**: All connection and subscription requests now wrapped in database transactions to prevent race conditions
- **Automatic cleanup**: System automatically removes old DISCONNECTED connections and CANCELLED/SUSPENDED subscriptions before creating new ones
- **Double validation**: Added validation checks both outside and inside transactions for consistency
- **Seamless reconnection**: Facilities can now reconnect/resubscribe without manual cleanup of old records

#### Technical Details
- Updated `infrastructure-connection.service.ts` to handle disconnected connection cleanup
- Updated `infrastructure-service.service.ts` to handle cancelled subscription cleanup
- Updated `facility-building.service.ts` to handle service re-registration
- Added transaction wrappers to prevent concurrent operation conflicts