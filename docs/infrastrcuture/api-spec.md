# Infrastructure Module API Specification

## Overview

The Infrastructure module provides comprehensive APIs for managing facility infrastructure connections and services in the business simulation platform. The module supports both connection-based infrastructure (water/power plants) and coverage-based infrastructure (base/fire stations), enabling cross-team cooperation through service sharing.

The module currently includes 30 fully implemented endpoints across 5 categories:
- Infrastructure Connections (7 endpoints)
- Infrastructure Cooperation (7 endpoints)
- Infrastructure Pricing (6 endpoints)
- Infrastructure Coverage (6 endpoints)
- Infrastructure Analytics (4 endpoints)

## Base URL

```
http://localhost:2999/api/infrastructure
```

## Authentication

All endpoints require JWT authentication using the User authentication system.

```
Authorization: Bearer <jwt_token>
```

## API Endpoints

### 1. Infrastructure Connections

Manages physical connections between facilities and infrastructure (water/power plants).

#### 1.1 Create Connection

Creates a new infrastructure connection between a facility and infrastructure.

```
POST /api/infrastructure/connections
```

**Request Body:**
```json
{
  "facilityId": "string",
  "infrastructureId": "string", 
  "connectionType": "WATER | POWER",
  "path": [{"q": number, "r": number}]
}
```

**Response:** `201 Created`
```json
{
  "id": "string",
  "facilityId": "string",
  "infrastructureId": "string",
  "connectionType": "WATER | POWER",
  "teamId": "string",
  "providerTeamId": "string",
  "distance": number,
  "actionPointsUsed": number,
  "path": [{"q": number, "r": number}],
  "status": "ACTIVE | INACTIVE | SUSPENDED",
  "isShared": boolean,
  "goldCostPerUnit": number,
  "createdAt": "ISO 8601"
}
```

#### 1.2 Validate Connection

Validates if a connection can be established between facility and infrastructure.

```
POST /api/infrastructure/connections/validate
```

**Request Body:**
```json
{
  "facilityId": "string",
  "infrastructureId": "string",
  "connectionType": "WATER | POWER"
}
```

**Response:** `200 OK`
```json
{
  "isValid": boolean,
  "distance": number,
  "actionPointsRequired": number,
  "actionPointsAvailable": number,
  "goldCost": number,
  "path": [{"q": number, "r": number}],
  "errors": ["string"]
}
```

#### 1.3 Get Facility Connections

Retrieves all connections for a specific facility.

```
GET /api/infrastructure/connections/facility/{facilityId}
```

**Response:** `200 OK`
```json
{
  "connections": [
    {
      "id": "string",
      "facilityId": "string",
      "infrastructureId": "string",
      "connectionType": "WATER | POWER",
      "status": "ACTIVE | INACTIVE | SUSPENDED",
      "distance": number,
      "actionPointsUsed": number,
      "goldCostPerUnit": number,
      "isShared": boolean
    }
  ],
  "total": number
}
```

#### 1.4 Get Infrastructure Connections

Retrieves all connections for a specific infrastructure.

```
GET /api/infrastructure/connections/infrastructure/{infrastructureId}
```

**Response:** `200 OK`
```json
{
  "connections": [
    {
      "id": "string",
      "facilityId": "string",
      "infrastructureId": "string",
      "connectionType": "WATER | POWER",
      "status": "ACTIVE | INACTIVE | SUSPENDED",
      "distance": number,
      "actionPointsUsed": number,
      "goldCostPerUnit": number,
      "teamId": "string"
    }
  ],
  "total": number
}
```

#### 1.5 Get Team Connections

Retrieves all connections for a team's facilities.

```
GET /api/infrastructure/connections/team/{teamId}
```

**Response:** `200 OK`
```json
{
  "connections": [
    {
      "id": "string",
      "facilityId": "string",
      "infrastructureId": "string",
      "connectionType": "WATER | POWER",
      "status": "ACTIVE | INACTIVE | SUSPENDED",
      "isShared": boolean,
      "providerTeamId": "string"
    }
  ],
  "total": number
}
```

#### 1.6 Update Connection Status

Updates the status of an existing connection.

```
PUT /api/infrastructure/connections/{connectionId}/status
```

**Request Body:**
```json
{
  "status": "ACTIVE | INACTIVE | SUSPENDED"
}
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "status": "ACTIVE | INACTIVE | SUSPENDED",
  "updatedAt": "ISO 8601"
}
```

#### 1.7 Delete Connection

Removes an infrastructure connection.

```
DELETE /api/infrastructure/connections/{connectionId}
```

**Response:** `204 No Content`

### 2. Infrastructure Cooperation

Manages cross-team infrastructure service sharing and requests.

#### 2.1 Submit Service Request

Submits a request to use another team's infrastructure.

```
POST /api/infrastructure/cooperation/request
```

**Request Body:**
```json
{
  "facilityId": "string",
  "infrastructureId": "string",
  "serviceType": "WATER | POWER | BASE | FIRE",
  "connectionType": "WATER | POWER", // Only for WATER/POWER services
  "proposedTerms": {
    "basePrice": number,
    "duration": number,
    "conditions": ["string"]
  },
  "message": "string"
}
```

**Response:** `201 Created`
```json
{
  "id": "string",
  "requestingTeamId": "string",
  "ownerTeamId": "string",
  "facilityId": "string",
  "infrastructureId": "string",
  "serviceType": "WATER | POWER | BASE | FIRE",
  "status": "PENDING",
  "proposedTerms": object,
  "message": "string",
  "expiresAt": "ISO 8601",
  "createdAt": "ISO 8601"
}
```

#### 2.2 Get Service Requests

Retrieves service requests for the authenticated team.

```
GET /api/infrastructure/cooperation/requests?type={sent|received|all}
```

**Query Parameters:**
- `type`: Filter by request type (sent, received, all)

**Response:** `200 OK`
```json
{
  "requests": [
    {
      "id": "string",
      "requestingTeamId": "string",
      "ownerTeamId": "string",
      "facilityId": "string",
      "infrastructureId": "string",
      "serviceType": "WATER | POWER | BASE | FIRE",
      "status": "PENDING | APPROVED | REJECTED | EXPIRED | CANCELLED",
      "proposedTerms": object,
      "finalTerms": object,
      "message": "string",
      "responseMessage": "string",
      "createdAt": "ISO 8601",
      "expiresAt": "ISO 8601"
    }
  ],
  "total": number
}
```

#### 2.3 Approve Service Request

Approves a pending service request.

```
PUT /api/infrastructure/cooperation/request/{requestId}/approve
```

**Request Body:**
```json
{
  "finalTerms": {
    "basePrice": number,
    "duration": number,
    "conditions": ["string"]
  },
  "responseMessage": "string"
}
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "status": "APPROVED",
  "finalTerms": object,
  "approvedBy": "string",
  "approvedAt": "ISO 8601",
  "responseMessage": "string"
}
```

#### 2.4 Reject Service Request

Rejects a pending service request.

```
PUT /api/infrastructure/cooperation/request/{requestId}/reject
```

**Request Body:**
```json
{
  "responseMessage": "string"
}
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "status": "REJECTED",
  "rejectedBy": "string",
  "rejectedAt": "ISO 8601",
  "responseMessage": "string"
}
```

#### 2.5 Cancel Service Request

Cancels a pending service request.

```
DELETE /api/infrastructure/cooperation/request/{requestId}
```

**Response:** `204 No Content`

#### 2.6 Get Shared Connections

Retrieves cooperation statistics for a team.

```
GET /api/infrastructure/cooperation/shared-connections
```

**Response:** `200 OK`
```json
{
  "providedServices": number,
  "consumedServices": number,
  "totalRevenue": number,
  "totalCost": number,
  "activePartnerships": number
}
```

#### 2.7 Cleanup Expired Requests

Removes expired service requests from the system.

```
POST /api/infrastructure/cooperation/cleanup-expired
```

**Response:** `200 OK`
```json
[
  {
    "id": "string",
    "status": "EXPIRED",
    "expiredAt": "ISO 8601"
  }
]
```

### 3. Infrastructure Pricing

Manages pricing configurations for infrastructure services.

#### 3.1 Set Service Pricing

Configures pricing for infrastructure services.

```
POST /api/infrastructure/pricing
```

**Request Body:**
```json
{
  "infrastructureId": "string",
  "basePrice": number,
  "bulkThreshold": number,
  "bulkDiscountPercent": number,
  "peakHourMultiplier": number,
  "preferredPartners": [
    {
      "teamId": "string",
      "discountPercent": number
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": "string",
  "infrastructureId": "string",
  "teamId": "string",
  "basePrice": number,
  "bulkThreshold": number,
  "bulkDiscountPercent": number,
  "peakHourMultiplier": number,
  "preferredPartners": array,
  "effectiveFrom": "ISO 8601",
  "createdAt": "ISO 8601"
}
```

#### 3.2 Update Service Pricing

Updates existing pricing configuration.

```
PUT /api/infrastructure/pricing/{pricingId}
```

**Request Body:**
```json
{
  "basePrice": number,
  "bulkThreshold": number,
  "bulkDiscountPercent": number,
  "peakHourMultiplier": number,
  "preferredPartners": array
}
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "basePrice": number,
  "bulkThreshold": number,
  "bulkDiscountPercent": number,
  "updatedAt": "ISO 8601"
}
```

#### 3.3 Get Infrastructure Pricing

Retrieves pricing for a specific infrastructure.

```
GET /api/infrastructure/pricing/infrastructure/{infrastructureId}
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "infrastructureId": "string",
  "teamId": "string",
  "basePrice": number,
  "bulkThreshold": number,
  "bulkDiscountPercent": number,
  "peakHourMultiplier": number,
  "preferredPartners": array,
  "effectiveFrom": "ISO 8601"
}
```

#### 3.4 Get Team Pricing

Retrieves all pricing configurations for a team.

```
GET /api/infrastructure/pricing/team/{teamId}
```

**Response:** `200 OK`
```json
{
  "pricingConfigs": [
    {
      "id": "string",
      "infrastructureId": "string",
      "basePrice": number,
      "bulkThreshold": number,
      "bulkDiscountPercent": number,
      "effectiveFrom": "ISO 8601"
    }
  ],
  "total": number
}
```

#### 3.5 Get Pricing History

Retrieves historical pricing data for an infrastructure.

```
GET /api/infrastructure/pricing/{infrastructureId}/history
```

**Response:** `200 OK`
```json
{
  "history": [
    {
      "id": "string",
      "basePrice": number,
      "effectiveFrom": "ISO 8601",
      "effectiveTo": "ISO 8601"
    }
  ]
}
```

#### 3.6 Deactivate Pricing

Deactivates a pricing configuration.

```
DELETE /api/infrastructure/pricing/{pricingId}
```

**Response:** `204 No Content`

### 4. Infrastructure Coverage

Manages coverage-based infrastructure services (base stations, fire stations).

#### 4.1 Get Coverage Area

Retrieves the coverage area for a BASE_STATION or FIRE_STATION.

```
GET /api/infrastructure/coverage/area/{infrastructureId}
```

**Response:** `200 OK`
```json
{
  "infrastructureId": "string",
  "serviceType": "BASE | FIRE",
  "centerCoordinate": {"q": number, "r": number},
  "coverageRadius": number,
  "coveredTiles": [
    {"q": number, "r": number}
  ],
  "coveredFacilities": [
    {
      "facilityId": "string",
      "facilityType": "string",
      "teamId": "string",
      "distance": number
    }
  ]
}
```

#### 4.2 Validate Coverage

Checks if a facility is within coverage of an infrastructure.

```
POST /api/infrastructure/coverage/validate
```

**Request Body:**
```json
{
  "facilityId": "string",
  "infrastructureId": "string"
}
```

**Response:** `200 OK`
```json
{
  "isInCoverage": boolean,
  "serviceType": "BASE | FIRE",
  "distance": number,
  "coverageRadius": number,
  "canProvideService": boolean
}
```

#### 4.3 Get Facility Coverage Status

Retrieves complete infrastructure coverage status for a facility.

```
GET /api/infrastructure/coverage/facility/{facilityId}/status
```

**Response:** `200 OK`
```json
{
  "facilityId": "string",
  "hasWater": boolean,
  "hasPower": boolean,
  "hasBaseStation": boolean,
  "hasFireStation": boolean,
  "canOperate": boolean,
  "missingInfrastructure": ["WATER", "POWER", "BASE", "FIRE"],
  "connections": [
    {
      "type": "WATER | POWER | BASE | FIRE",
      "infrastructureId": "string",
      "providerTeamId": "string",
      "isShared": boolean
    }
  ]
}
```

#### 4.4 Get Covered Facilities

Retrieves all facilities covered by an infrastructure.

```
GET /api/infrastructure/coverage/infrastructure/{infrastructureId}/covered
```

**Response:** `200 OK`
```json
{
  "infrastructureId": "string",
  "serviceType": "BASE | FIRE",
  "coverageRadius": number,
  "coveredFacilities": [
    {
      "facilityId": "string",
      "facilityType": "string",
      "teamId": "string",
      "distance": number,
      "isShared": boolean
    }
  ],
  "total": number
}
```

#### 4.5 Validate Facility Operation

Validates if a facility can operate with current infrastructure.

```
POST /api/infrastructure/coverage/facility/{facilityId}/validate-operation
```

**Response:** `200 OK`
```json
{
  "canOperate": boolean,
  "status": {
    "hasWater": boolean,
    "hasPower": boolean,
    "hasBaseStation": boolean,
    "hasFireStation": boolean,
    "missingInfrastructure": ["string"]
  }
}
```

#### 4.6 Get Team Missing Infrastructure

Retrieves facilities with missing infrastructure for a team.

```
GET /api/infrastructure/coverage/team/{teamId}/missing
```

**Response:** `200 OK`
```json
[
  {
    "facilityId": "string",
    "facilityType": "string",
    "location": {"q": number, "r": number},
    "missingInfrastructure": ["WATER", "POWER", "BASE", "FIRE"],
    "canOperate": false
  }
]
```

### 5. Infrastructure Analytics

Provides analytics and insights for infrastructure management. Currently supports action points tracking and revenue analysis.

#### 5.1 Get Action Points Analytics

Retrieves action points usage analytics for an infrastructure.

```
GET /api/infrastructure/analytics/action-points/{infrastructureId}
```

**Response:** `200 OK`
```json
{
  "infrastructureId": "string",
  "infrastructureType": "WATER_PLANT | POWER_PLANT",
  "level": number,
  "totalActionPoints": number,
  "usedActionPoints": number,
  "availablePoints": number,
  "connections": number,
  "utilizationRate": number
}
```

#### 5.2 Get Team Action Points

Retrieves action points usage across all team infrastructures.

```
GET /api/infrastructure/analytics/action-points/team/{teamId}
```

**Response:** `200 OK`
```json
{
  "teamId": "string",
  "infrastructures": [
    {
      "infrastructureId": "string",
      "type": "WATER_PLANT | POWER_PLANT",
      "totalActionPoints": number,
      "usedActionPoints": number,
      "availablePoints": number
    }
  ],
  "totalUsed": number,
  "totalAvailable": number
}
```

#### 5.3 Get Revenue Analysis

Analyzes revenue for an infrastructure.

```
GET /api/infrastructure/analytics/revenue/{infrastructureId}?startDate={date}&endDate={date}
```

**Query Parameters:**
- `startDate`: Start date for analysis (optional)
- `endDate`: End date for analysis (optional)

**Response:** `200 OK`
```json
{
  "infrastructureId": "string",
  "totalRevenue": number,
  "averageRevenue": number,
  "topCustomers": [
    {
      "teamId": "string",
      "revenue": number,
      "usage": number
    }
  ],
  "revenueByPeriod": [
    {
      "period": "string",
      "revenue": number
    }
  ]
}
```

#### 5.4 Calculate Price

Calculates the price for infrastructure service usage.

```
GET /api/infrastructure/analytics/pricing/calculate/{infrastructureId}?quantity={number}&requestingTeamId={string}
```

**Query Parameters:**
- `quantity`: Quantity of service required
- `requestingTeamId`: Team requesting the service (optional)

**Response:** `200 OK`
```json
{
  "basePrice": number,
  "quantity": number,
  "subtotal": number,
  "discounts": [
    {
      "type": "BULK | PARTNER",
      "amount": number
    }
  ],
  "totalPrice": number
}
```

## Error Responses

All endpoints follow a standardized error response format:

```json
{
  "success": false,
  "businessCode": number,
  "message": "string",
  "timestamp": "ISO 8601",
  "path": "string",
  "errors": [
    {
      "field": "string",
      "message": "string"
    }
  ]
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid or missing JWT token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource conflict (e.g., duplicate connection) |
| 422 | Unprocessable Entity - Validation error |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## Rate Limiting

All endpoints are subject to rate limiting:
- Default: 100 requests per minute per user
- Burst: 20 requests per second

## Performance Requirements

- Response time: < 200ms for 95th percentile
- Concurrent connections: Support 1000+ concurrent users
- Database query optimization: Use indexes for all foreign keys
- Caching: Cache coverage calculations and path validations

## Security Considerations

1. **Authentication**: All endpoints require valid JWT tokens
2. **Authorization**: Team-based access control for resources
3. **Input Validation**: Comprehensive validation using class-validator DTOs
4. **SQL Injection**: Protected through Prisma ORM parameterized queries
5. **Rate Limiting**: Prevent DoS attacks through request throttling
6. **Audit Logging**: All infrastructure modifications are logged

## Internationalization

All error messages and responses support English and Chinese languages based on:
- `Accept-Language` header
- `?lang=` query parameter
- `x-lang` header

Default language: Chinese (zh)

## WebSocket Events (Future Enhancement)

Planned real-time events for infrastructure changes:
- `infrastructure.connection.created`
- `infrastructure.connection.deleted`
- `infrastructure.request.received`
- `infrastructure.request.approved`
- `infrastructure.coverage.changed`

## Testing Requirements

1. **Unit Tests**: Service layer methods
2. **Integration Tests**: All API endpoints
3. **Performance Tests**: Path calculation and coverage computation
4. **Security Tests**: Authorization and input validation
5. **Load Tests**: Concurrent connection creation

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-15 | Initial API specification |
| 1.1.0 | 2024-01-20 | Added coverage-based services |
| 1.2.0 | 2024-01-25 | Added analytics endpoints |
| 1.3.0 | 2025-01-12 | Removed unimplemented analytics endpoints to reflect actual implementation |