# Infrastructure History API Specification

## Overview
This document specifies the Infrastructure History API endpoints that provide comprehensive tracking and querying capabilities for infrastructure connections, services, and their lifecycle events. All endpoints support pagination for efficient data retrieval.

## Base URL
```
/api/infrastructure/history
```

## Authentication
All endpoints require JWT authentication via InfrastructureAuthGuard, which automatically provides:
- `teamId`: The authenticated team's ID
- `activityId`: The current activity context

## Pagination Support
All list endpoints support pagination with the following parameters:
- `limit`: Number of items per page (defaults vary by endpoint, max: 100)
- `offset`: Starting position for results (default: 0)

### Pagination Response Format
```json
{
  "data": [...],     // Array of results
  "total": 100,      // Total count of matching records
  "limit": 50,       // Items returned per page
  "offset": 0        // Starting position
}
```

## API Endpoints

### 1. Get Connection Lifecycle History

Retrieves the complete lifecycle history for a specific infrastructure connection.

**Endpoint:**
```
GET /api/infrastructure/history/connection/:connectionId
```

**Parameters:**
- `connectionId` (path): The connection ID to retrieve history for

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 50, max: 100)
- `offset` (optional): Starting position (default: 0)

**Response Example:**
```json
{
  "success": true,
  "businessCode": 200,
  "message": "success",
  "data": {
    "data": [
      {
        "id": "log123",
        "operationType": "CONNECTION_REQUESTED",
        "providerTeamId": "team456",
        "consumerTeamId": "team123",
        "entityType": "ConnectionRequest",
        "entityId": "req123",
        "details": {
          "connectionType": "WATER",
          "distance": 5,
          "unitPrice": 10.5,
          "operationPointsCost": 6
        },
        "performedBy": "user123",
        "activityId": "activity123",
        "infrastructureType": "WATER",
        "timestamp": "2025-01-13T10:00:00Z",
        "providerTeam": {
          "id": "team456",
          "name": "Team Beta"
        },
        "consumerTeam": {
          "id": "team123",
          "name": "Team Alpha"
        },
        "performedByUser": {
          "id": "user123",
          "username": "john_doe",
          "firstName": "John",
          "lastName": "Doe"
        },
        "terminationDetail": null
      },
      {
        "id": "log124",
        "operationType": "CONNECTION_ACCEPTED",
        "providerTeamId": "team456",
        "consumerTeamId": "team123",
        "entityType": "Connection",
        "entityId": "conn123",
        "details": {
          "connectionType": "WATER",
          "unitPrice": 10.5,
          "distance": 5
        },
        "performedBy": "user456",
        "activityId": "activity123",
        "infrastructureType": "WATER",
        "timestamp": "2025-01-13T11:00:00Z",
        "providerTeam": {
          "id": "team456",
          "name": "Team Beta"
        },
        "consumerTeam": {
          "id": "team123",
          "name": "Team Alpha"
        },
        "performedByUser": {
          "id": "user456",
          "username": "jane_smith",
          "firstName": "Jane",
          "lastName": "Smith"
        },
        "terminationDetail": null
      }
    ],
    "total": 2,
    "limit": 50,
    "offset": 0
  }
}
```

### 2. Get Team Infrastructure History

Retrieves infrastructure operation history for the authenticated team with comprehensive filtering options.

**Endpoint:**
```
GET /api/infrastructure/history/team
```

**Query Parameters:**
- `role` (optional): Filter by team role - "PROVIDER" or "CONSUMER"
- `infrastructureType` (optional): Filter by infrastructure type (WATER, POWER)
- `serviceType` (optional): Filter by service type (BASE_STATION, FIRE_STATION)
- `operationType` (optional): Filter by operation type (CONNECTION_REQUESTED, CONNECTION_ACCEPTED, etc.)
- `dateFrom` (optional): Start date for filtering (ISO 8601 format)
- `dateTo` (optional): End date for filtering (ISO 8601 format)
- `limit` (optional): Number of records to return (default: 50, max: 100)
- `offset` (optional): Starting position (default: 0)

**Response Example:**
```json
{
  "success": true,
  "businessCode": 200,
  "message": "success",
  "data": {
    "data": [
      {
        "id": "log125",
        "operationType": "CONNECTION_ACCEPTED",
        "providerTeamId": "team123",
        "consumerTeamId": "team789",
        "entityType": "Connection",
        "entityId": "water-connection-1",
        "details": {
          "distance": 3,
          "unitPrice": 15.5,
          "connectionType": "WATER"
        },
        "performedBy": "user123",
        "activityId": "activity123",
        "infrastructureType": "WATER",
        "serviceType": null,
        "actorRole": "PROVIDER",
        "providerFacilityId": "facility123",
        "consumerFacilityId": "facility456",
        "timestamp": "2025-01-13T06:14:12.571Z",
        "providerTeam": {
          "id": "team123",
          "name": "Team A"
        },
        "consumerTeam": {
          "id": "team789",
          "name": "Team B"
        },
        "performedByUser": {
          "id": "user123",
          "username": "222",
          "firstName": "Alex",
          "lastName": "Wang"
        },
        "terminationDetail": null
      },
      {
        "id": "log126",
        "operationType": "SUBSCRIPTION_ACCEPTED",
        "providerTeamId": "team123",
        "consumerTeamId": "team789",
        "entityType": "Subscription",
        "entityId": "subscription-1",
        "details": {
          "annualFee": 5000,
          "serviceType": "BASE_STATION"
        },
        "performedBy": "user234",
        "activityId": "activity123",
        "infrastructureType": null,
        "serviceType": "BASE_STATION",
        "actorRole": "PROVIDER",
        "providerFacilityId": "facility234",
        "consumerFacilityId": "facility567",
        "timestamp": "2025-01-13T06:14:12.571Z",
        "providerTeam": {
          "id": "team123",
          "name": "Team A"
        },
        "consumerTeam": {
          "id": "team789",
          "name": "Team B"
        },
        "performedByUser": {
          "id": "user234",
          "username": "333",
          "firstName": "Sarah",
          "lastName": "Liu"
        },
        "terminationDetail": null
      }
    ],
    "total": 2,
    "limit": 50,
    "offset": 0
  }
}
```

### 3. Get Connection Termination Details

Retrieves detailed termination information for a specific connection.

**Endpoint:**
```
GET /api/infrastructure/history/termination/connection/:connectionId
```

**Parameters:**
- `connectionId` (path): The connection ID

**Response Example:**
```json
{
  "success": true,
  "businessCode": 200,
  "message": "success",
  "data": {
    "id": "term123",
    "operationLogId": "log127",
    "terminationType": "VOLUNTARY",
    "initiatedBy": "CONSUMER",
    "terminationReason": "NO_LONGER_NEEDED",
    "detailedReason": "Facility relocated to different area",
    "penaltyAmount": null,
    "refundAmount": null,
    "outstandingBalance": "0",
    "connectionDuration": 45,
    "totalResourcesUsed": "4500",
    "totalServiceFeesPaid": null,
    "connectionId": "conn123",
    "subscriptionId": null,
    "createdAt": "2025-01-15T10:00:00Z",
    "operationLog": {
      "id": "log127",
      "operationType": "CONNECTION_DISCONNECTED",
      "timestamp": "2025-01-15T10:00:00Z",
      "providerTeam": {
        "id": "team456",
        "name": "Team Beta"
      },
      "consumerTeam": {
        "id": "team123",
        "name": "Team Alpha"
      },
      "performedByUser": {
        "id": "user123",
        "username": "john_doe",
        "firstName": "John",
        "lastName": "Doe"
      }
    },
    "connection": {
      "id": "conn123",
      "connectionType": "WATER",
      "providerFacilityId": "facility456",
      "consumerFacilityId": "facility123",
      "unitPrice": "10.5",
      "distance": 5,
      "connectedAt": "2025-01-01T10:00:00Z",
      "disconnectedAt": "2025-01-15T10:00:00Z"
    }
  }
}
```

### 4. Get Subscription Termination Details

Retrieves detailed termination information for a specific subscription.

**Endpoint:**
```
GET /api/infrastructure/history/termination/subscription/:subscriptionId
```

**Parameters:**
- `subscriptionId` (path): The subscription ID

**Response:** Similar structure to connection termination details

### 5. Get Recent Operations

Retrieves recent infrastructure operations for the authenticated team.

**Endpoint:**
```
GET /api/infrastructure/history/recent
```

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 10, max: 50)
- `offset` (optional): Starting position (default: 0)

**Response Example:**
```json
{
  "success": true,
  "businessCode": 200,
  "message": "success",
  "data": {
    "data": [
      {
        "id": "log128",
        "operationType": "CONNECTION_REQUESTED",
        "providerTeamId": "team456",
        "consumerTeamId": "team123",
        "entityType": "ConnectionRequest",
        "entityId": "req456",
        "details": {
          "connectionType": "POWER",
          "distance": 7,
          "unitPrice": 12.0
        },
        "performedBy": "user123",
        "activityId": "activity123",
        "timestamp": "2025-01-13T14:30:00Z",
        "providerTeam": {
          "id": "team456",
          "name": "Team Beta"
        },
        "consumerTeam": {
          "id": "team123",
          "name": "Team Alpha"
        },
        "performedByUser": {
          "id": "user123",
          "username": "john_doe",
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ],
    "total": 15,
    "limit": 10,
    "offset": 0
  }
}
```

### 6. Get Entity History

Retrieves operation history for a specific entity (for debugging/admin purposes).

**Endpoint:**
```
GET /api/infrastructure/history/entity/:entityType/:entityId
```

**Parameters:**
- `entityType` (path): The entity type (Connection, Subscription, ConnectionRequest, etc.)
- `entityId` (path): The entity ID

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 50, max: 100)
- `offset` (optional): Starting position (default: 0)

**Response:** Similar paginated structure with operation logs

### 7. Get Termination Statistics

Retrieves termination statistics for the authenticated team.

**Endpoint:**
```
GET /api/infrastructure/history/stats/terminations
```

**Response Example:**
```json
{
  "success": true,
  "businessCode": 200,
  "message": "success",
  "data": {
    "total": 12,
    "byType": {
      "VOLUNTARY": 8,
      "FORCED": 3,
      "SYSTEM": 1
    },
    "byInitiator": {
      "PROVIDER": 5,
      "CONSUMER": 6,
      "SYSTEM": 1
    },
    "byReason": {
      "NO_LONGER_NEEDED": 4,
      "INSUFFICIENT_CAPACITY": 3,
      "NON_PAYMENT": 2,
      "FACILITY_DEMOLISHED": 2,
      "SYSTEM_MAINTENANCE": 1
    },
    "asProvider": 7,
    "asConsumer": 5,
    "averageDuration": 32
  }
}
```

## Operation Types

The following operation types are tracked in the history:

### Connection Operations
- `CONNECTION_REQUESTED`: Consumer requests a connection from provider
- `CONNECTION_ACCEPTED`: Provider accepts connection request
- `CONNECTION_REJECTED`: Provider rejects connection request
- `CONNECTION_CANCELLED`: Consumer cancels pending request
- `CONNECTION_DISCONNECTED`: Either party disconnects an active connection

### Subscription Operations
- `SUBSCRIPTION_REQUESTED`: Consumer requests service subscription
- `SUBSCRIPTION_ACCEPTED`: Provider accepts subscription request
- `SUBSCRIPTION_REJECTED`: Provider rejects subscription request
- `SUBSCRIPTION_CANCELLED`: Consumer cancels pending request
- `CONNECTION_DISCONNECTED`: Reused for subscription termination (distinguished by entityType)

## Error Responses

All endpoints follow the standard error response format:

```json
{
  "success": false,
  "businessCode": 400,
  "message": "Error message",
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error information"
  },
  "timestamp": "2025-01-13T10:00:00Z",
  "path": "/api/infrastructure/history/team"
}
```

### Common Error Codes
- `INVALID_CONNECTION_ID`: Connection ID not found
- `INVALID_SUBSCRIPTION_ID`: Subscription ID not found
- `INVALID_DATE_RANGE`: Invalid date range specified
- `PAGINATION_LIMIT_EXCEEDED`: Requested limit exceeds maximum allowed
- `UNAUTHORIZED_ACCESS`: User lacks permission to view this history

## Performance Considerations

1. **Pagination is Required**: All list endpoints enforce pagination to prevent excessive data transfer
2. **Default Limits**: Each endpoint has sensible defaults (10-50 items)
3. **Maximum Limits**: Hard cap of 100 items per request
4. **Indexed Queries**: All filter fields are properly indexed for optimal performance
5. **Parallel Queries**: Count and data queries execute in parallel for faster response times

## Rate Limiting

History endpoints are subject to rate limiting:
- Standard queries: 60 requests per minute
- Heavy queries (with multiple filters): 30 requests per minute

## Best Practices

1. **Use Appropriate Limits**: Request only the data you need
2. **Filter Early**: Apply filters to reduce result sets
3. **Cache Results**: History data is immutable once created
4. **Batch Requests**: Use pagination rather than multiple filtered requests
5. **Date Ranges**: Use date filters for time-bounded queries

## Migration Notes

For systems migrating from non-paginated endpoints:
1. Add pagination parameters to existing queries
2. Update response handlers to process paginated format
3. Implement pagination UI components
4. Consider caching strategies for paginated data