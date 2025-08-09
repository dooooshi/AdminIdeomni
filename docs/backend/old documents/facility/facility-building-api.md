# Facility Building API

## Overview

The Facility Building API provides comprehensive endpoints for students to build, upgrade, and manage facilities on owned land tiles within business simulation activities. All endpoints require JWT authentication and active team membership.

## Base URL

```
Base URL: http://localhost:2999/api/user/facilities
```

## Authentication

All endpoints require:
- **Bearer Token**: JWT token in Authorization header
- **User Type**: Student/Worker/Manager (userType 2 or 3)
- **Team Membership**: Active membership in a team
- **Activity Participation**: Enrollment in a business activity

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## API Endpoints

### 1. Build Facility

Build a new facility on a tile owned by your team.

```http
POST /api/user/facilities/build
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "tileId": 1,
  "facilityType": "MINE",
  "description": "Primary mining operation for gold extraction",
  "maxGoldCost": 200.0,
  "maxCarbonCost": 80.0,
  "metadata": {
    "priority": "high",
    "expectedProduction": 1000
  }
}
```

**Request DTO:**
```typescript
interface BuildFacilityDto {
  tileId: number;                    // Target tile ID (required)
  facilityType: FacilityType;        // Type of facility to build (required)
  description?: string;              // Optional description
  maxGoldCost?: number;             // Price protection: max gold cost
  maxCarbonCost?: number;           // Price protection: max carbon cost
  metadata?: Record<string, any>;    // Additional metadata
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "clx1a2b3c4d5e6f7g8h9i0j1",
    "facilityType": "MINE",
    "level": 1,
    "status": "ACTIVE",
    "tileId": 1,
    "teamId": "team_123",
    "buildGoldCost": 200.0,
    "buildCarbonCost": 80.0,
    "totalUpgradeCost": 0.0,
    "constructionStarted": "2025-01-15T10:30:00.000Z",
    "constructionCompleted": "2025-01-15T10:30:00.000Z",
    "productionRate": null,
    "capacity": null,
    "efficiency": null,
    "description": "Primary mining operation for gold extraction",
    "builder": {
      "id": "user_456",
      "username": "student1",
      "firstName": "John",
      "lastName": "Doe"
    },
    "upgradeHistory": [],
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  },
  "message": "Facility built successfully",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

**Error Responses:**

**Insufficient Resources (400):**
```json
{
  "success": false,
  "businessCode": 3001,
  "message": "Insufficient gold. Required: 200.0, available: 150.0",
  "data": null,
  "timestamp": "2025-01-15T10:30:00.000Z",
  "path": "/api/user/facilities/build"
}
```

**Land Not Owned (400):**
```json
{
  "success": false,
  "businessCode": 4002,
  "message": "Team does not own land on this tile",
  "data": null,
  "timestamp": "2025-01-15T10:30:00.000Z",
  "path": "/api/user/facilities/build"
}
```

### 2. Upgrade Facility

Upgrade an existing facility to a higher level.

```http
PUT /api/user/facilities/{facilityId}/upgrade
Content-Type: application/json
Authorization: Bearer <token>
```

**Path Parameters:**
- `facilityId` (string): ID of the facility to upgrade

**Request Body:**
```json
{
  "targetLevel": 3,
  "maxUpgradeCost": 500.0
}
```

**Request DTO:**
```typescript
interface UpgradeFacilityDto {
  targetLevel: number;              // Target level (must be > current level)
  maxUpgradeCost?: number;         // Price protection: max total upgrade cost
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx1a2b3c4d5e6f7g8h9i0j1",
    "facilityType": "MINE",
    "level": 3,
    "status": "ACTIVE",
    "tileId": 1,
    "teamId": "team_123",
    "buildGoldCost": 200.0,
    "buildCarbonCost": 80.0,
    "totalUpgradeCost": 450.0,
    "constructionStarted": "2025-01-15T10:30:00.000Z",
    "constructionCompleted": "2025-01-15T10:30:00.000Z",
    "productionRate": null,
    "capacity": null,
    "efficiency": null,
    "description": "Primary mining operation for gold extraction",
    "builder": {
      "id": "user_456",
      "username": "student1",
      "firstName": "John",
      "lastName": "Doe"
    },
    "upgradeHistory": [
      {
        "fromLevel": 1,
        "toLevel": 2,
        "cost": 150.0,
        "upgradedAt": "2025-01-15T11:00:00.000Z"
      },
      {
        "fromLevel": 2,
        "toLevel": 3,
        "cost": 300.0,
        "upgradedAt": "2025-01-15T11:30:00.000Z"
      }
    ],
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T11:30:00.000Z"
  },
  "message": "Facility upgraded successfully",
  "timestamp": "2025-01-15T11:30:00.000Z"
}
```

### 3. Get Team Facilities

Retrieve all facilities owned by your team with pagination and filtering.

```http
GET /api/user/facilities/owned?page=1&pageSize=20&facilityType=MINE&status=ACTIVE
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
interface FacilityInstanceQueryDto {
  page?: number;                    // Page number (default: 1)
  pageSize?: number;               // Items per page (default: 20, max: 100)
  tileId?: number;                 // Filter by tile ID
  facilityType?: FacilityType;     // Filter by facility type
  status?: FacilityInstanceStatus; // Filter by status
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "clx1a2b3c4d5e6f7g8h9i0j1",
        "facilityType": "MINE",
        "level": 3,
        "status": "ACTIVE",
        "tileId": 1,
        "teamId": "team_123",
        "buildGoldCost": 200.0,
        "buildCarbonCost": 80.0,
        "totalUpgradeCost": 450.0,
        "constructionStarted": "2025-01-15T10:30:00.000Z",
        "constructionCompleted": "2025-01-15T10:30:00.000Z",
        "builder": {
          "id": "user_456",
          "username": "student1",
          "firstName": "John",
          "lastName": "Doe"
        },
        "upgradeHistory": [...],
        "createdAt": "2025-01-15T10:30:00.000Z",
        "updatedAt": "2025-01-15T11:30:00.000Z"
      }
    ],
    "total": 15,
    "page": 1,
    "pageSize": 20,
    "totalPages": 1,
    "hasNext": false,
    "hasPrevious": false
  },
  "message": "Team facilities retrieved successfully",
  "timestamp": "2025-01-15T12:00:00.000Z"
}
```

### 4. Get Facility Details

Retrieve detailed information about a specific facility.

```http
GET /api/user/facilities/{facilityId}
Authorization: Bearer <token>
```

**Path Parameters:**
- `facilityId` (string): ID of the facility

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx1a2b3c4d5e6f7g8h9i0j1",
    "facilityType": "MINE",
    "level": 3,
    "status": "ACTIVE",
    "tileId": 1,
    "teamId": "team_123",
    "buildGoldCost": 200.0,
    "buildCarbonCost": 80.0,
    "totalUpgradeCost": 450.0,
    "constructionStarted": "2025-01-15T10:30:00.000Z",
    "constructionCompleted": "2025-01-15T10:30:00.000Z",
    "productionRate": null,
    "capacity": null,
    "efficiency": null,
    "description": "Primary mining operation for gold extraction",
    "builder": {
      "id": "user_456",
      "username": "student1",
      "firstName": "John",
      "lastName": "Doe"
    },
    "upgradeHistory": [
      {
        "fromLevel": 1,
        "toLevel": 2,
        "cost": 150.0,
        "upgradedAt": "2025-01-15T11:00:00.000Z"
      },
      {
        "fromLevel": 2,
        "toLevel": 3,
        "cost": 300.0,
        "upgradedAt": "2025-01-15T11:30:00.000Z"
      }
    ],
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T11:30:00.000Z"
  },
  "message": "Facility details retrieved successfully",
  "timestamp": "2025-01-15T12:00:00.000Z"
}
```

### 5. Validate Build Capability

Check if a facility can be built on a specific tile before attempting to build.

```http
GET /api/user/facilities/validate-build/{tileId}/{facilityType}
Authorization: Bearer <token>
```

**Path Parameters:**
- `tileId` (number): Target tile ID
- `facilityType` (FacilityType): Type of facility to validate

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "canBuild": true,
    "goldCost": 200.0,
    "carbonCost": 80.0,
    "totalCost": 280.0,
    "teamGoldBalance": 1500.0,
    "teamCarbonBalance": 800.0,
    "requiredAreas": 3,
    "availableLandArea": 5,
    "currentInstances": 0,
    "maxInstances": 2,
    "errors": []
  },
  "message": "Build validation completed",
  "timestamp": "2025-01-15T12:00:00.000Z"
}
```

**Validation Failed Response:**
```json
{
  "success": true,
  "data": {
    "canBuild": false,
    "goldCost": 200.0,
    "carbonCost": 80.0,
    "totalCost": 280.0,
    "teamGoldBalance": 150.0,
    "teamCarbonBalance": 50.0,
    "requiredAreas": 3,
    "availableLandArea": 2,
    "currentInstances": 2,
    "maxInstances": 2,
    "errors": [
      "Insufficient gold. Required: 200.0, available: 150.0",
      "Insufficient carbon. Required: 80.0, available: 50.0",
      "Insufficient land area. Required: 3, available: 2",
      "Maximum instances of this facility type reached on tile"
    ]
  },
  "message": "Build validation completed",
  "timestamp": "2025-01-15T12:00:00.000Z"
}
```

### 6. Get Team Facility Summary

Retrieve comprehensive statistics about your team's facilities.

```http
GET /api/user/facilities/summary
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "teamId": "team_123",
    "teamName": "Alpha Team",
    "totalFacilities": 12,
    "totalBuildCost": 2400.0,
    "totalUpgradeCost": 1800.0,
    "facilitiesByType": {
      "MINE": 3,
      "FARM": 2,
      "FACTORY": 2,
      "WAREHOUSE": 1,
      "HOSPITAL": 1,
      "SCHOOL": 1,
      "PARK": 2
    },
    "facilitiesByStatus": {
      "ACTIVE": 10,
      "UNDER_CONSTRUCTION": 1,
      "MAINTENANCE": 1,
      "DAMAGED": 0,
      "DECOMMISSIONED": 0
    },
    "avgLevel": 2.33,
    "lastBuiltAt": "2025-01-15T11:30:00.000Z"
  },
  "message": "Team facility summary retrieved successfully",
  "timestamp": "2025-01-15T12:00:00.000Z"
}
```

### 7. Get Facilities on Tile

Retrieve all facilities built on a specific tile.

```http
GET /api/user/facilities/tile/{tileId}
Authorization: Bearer <token>
```

**Path Parameters:**
- `tileId` (number): Tile ID to query

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx1a2b3c4d5e6f7g8h9i0j1",
      "facilityType": "MINE",
      "level": 3,
      "status": "ACTIVE",
      "teamId": "team_123",
      "teamName": "Alpha Team",
      "buildGoldCost": 200.0,
      "buildCarbonCost": 80.0,
      "builder": {
        "id": "user_456",
        "username": "student1"
      },
      "createdAt": "2025-01-15T10:30:00.000Z"
    },
    {
      "id": "clx2b3c4d5e6f7g8h9i0j1k2",
      "facilityType": "WAREHOUSE",
      "level": 1,
      "status": "ACTIVE",
      "teamId": "team_456",
      "teamName": "Beta Team",
      "buildGoldCost": 180.0,
      "buildCarbonCost": 50.0,
      "builder": {
        "id": "user_789",
        "username": "student2"
      },
      "createdAt": "2025-01-15T14:00:00.000Z"
    }
  ],
  "message": "Tile facilities retrieved successfully",
  "timestamp": "2025-01-15T15:00:00.000Z"
}
```

### 8. Get Facilities by Type

Retrieve all team facilities of a specific type.

```http
GET /api/user/facilities/type/{facilityType}
Authorization: Bearer <token>
```

**Path Parameters:**
- `facilityType` (FacilityType): Type of facility to filter by

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx1a2b3c4d5e6f7g8h9i0j1",
      "facilityType": "MINE",
      "level": 3,
      "status": "ACTIVE",
      "tileId": 1,
      "buildGoldCost": 200.0,
      "buildCarbonCost": 80.0,
      "totalUpgradeCost": 450.0,
      "builder": {
        "id": "user_456",
        "username": "student1",
        "firstName": "John",
        "lastName": "Doe"
      },
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T11:30:00.000Z"
    }
  ],
  "message": "Facilities by type retrieved successfully",
  "timestamp": "2025-01-15T15:00:00.000Z"
}
```

### 9. Get Facilities Needing Attention

Retrieve facilities that require maintenance or are damaged.

```http
GET /api/user/facilities/attention
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx3c4d5e6f7g8h9i0j1k2l3",
      "facilityType": "FACTORY",
      "level": 2,
      "status": "MAINTENANCE",
      "tileId": 5,
      "buildGoldCost": 250.0,
      "buildCarbonCost": 90.0,
      "description": "Manufacturing facility requiring maintenance",
      "createdAt": "2025-01-10T08:00:00.000Z",
      "updatedAt": "2025-01-15T09:00:00.000Z"
    },
    {
      "id": "clx4d5e6f7g8h9i0j1k2l3m4",
      "facilityType": "POWER_PLANT",
      "level": 1,
      "status": "DAMAGED",
      "tileId": 8,
      "buildGoldCost": 350.0,
      "buildCarbonCost": 150.0,
      "description": "Power plant damaged in recent storm",
      "createdAt": "2025-01-12T12:00:00.000Z",
      "updatedAt": "2025-01-14T16:30:00.000Z"
    }
  ],
  "message": "Facilities needing attention retrieved successfully",
  "timestamp": "2025-01-15T15:00:00.000Z"
}
```

## Data Transfer Objects

### Request DTOs

#### BuildFacilityDto
```typescript
import { IsNotEmpty, IsInt, IsEnum, IsOptional, IsString, IsNumber, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BuildFacilityDto {
  @ApiProperty({ description: 'Target tile ID', example: 1 })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  tileId: number;

  @ApiProperty({ description: 'Type of facility to build', enum: FacilityType })
  @IsNotEmpty()
  @IsEnum(FacilityType)
  facilityType: FacilityType;

  @ApiPropertyOptional({ description: 'Optional facility description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Maximum gold cost for price protection' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxGoldCost?: number;

  @ApiPropertyOptional({ description: 'Maximum carbon cost for price protection' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxCarbonCost?: number;

  @ApiPropertyOptional({ 
    description: 'Additional metadata',
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
```

#### UpgradeFacilityDto
```typescript
export class UpgradeFacilityDto {
  @ApiProperty({ description: 'Target level for upgrade', example: 3 })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  targetLevel: number;

  @ApiPropertyOptional({ description: 'Maximum upgrade cost for price protection' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxUpgradeCost?: number;
}
```

#### FacilityInstanceQueryDto
```typescript
export class FacilityInstanceQueryDto {
  @ApiPropertyOptional({ description: 'Page number', example: 1, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', example: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  pageSize?: number = 20;

  @ApiPropertyOptional({ description: 'Filter by tile ID' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  tileId?: number;

  @ApiPropertyOptional({ description: 'Filter by facility type', enum: FacilityType })
  @IsOptional()
  @IsEnum(FacilityType)
  facilityType?: FacilityType;

  @ApiPropertyOptional({ description: 'Filter by facility status', enum: FacilityInstanceStatus })
  @IsOptional()
  @IsEnum(FacilityInstanceStatus)
  status?: FacilityInstanceStatus;
}
```

### Response DTOs

#### FacilityInstanceResponseDto
```typescript
export class FacilityInstanceResponseDto {
  @ApiProperty({ description: 'Facility instance ID' })
  id: string;

  @ApiProperty({ description: 'Type of facility', enum: FacilityType })
  facilityType: FacilityType;

  @ApiProperty({ description: 'Current facility level' })
  level: number;

  @ApiProperty({ description: 'Current facility status', enum: FacilityInstanceStatus })
  status: FacilityInstanceStatus;

  @ApiProperty({ description: 'Tile ID where facility is built' })
  tileId: number;

  @ApiProperty({ description: 'Team ID that owns the facility' })
  teamId: string;

  @ApiProperty({ description: 'Gold cost for building' })
  buildGoldCost: number;

  @ApiProperty({ description: 'Carbon cost for building' })
  buildCarbonCost: number;

  @ApiProperty({ description: 'Total cost spent on upgrades' })
  totalUpgradeCost: number;

  @ApiProperty({ description: 'Construction start timestamp' })
  constructionStarted: Date;

  @ApiPropertyOptional({ description: 'Construction completion timestamp' })
  constructionCompleted?: Date;

  @ApiPropertyOptional({ description: 'Production rate (if applicable)' })
  productionRate?: number;

  @ApiPropertyOptional({ description: 'Facility capacity (if applicable)' })
  capacity?: number;

  @ApiPropertyOptional({ description: 'Efficiency percentage (if applicable)' })
  efficiency?: number;

  @ApiPropertyOptional({ description: 'Facility description' })
  description?: string;

  @ApiProperty({ description: 'User who built the facility' })
  builder: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };

  @ApiProperty({ description: 'Upgrade history', type: 'array', items: { type: 'object' } })
  upgradeHistory: any[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
```

#### BuildValidationResponseDto
```typescript
export class BuildValidationResponseDto {
  @ApiProperty({ description: 'Whether facility can be built' })
  canBuild: boolean;

  @ApiProperty({ description: 'Gold cost to build facility' })
  goldCost: number;

  @ApiProperty({ description: 'Carbon cost to build facility' })
  carbonCost: number;

  @ApiProperty({ description: 'Total cost (gold + carbon)' })
  totalCost: number;

  @ApiProperty({ description: 'Team current gold balance' })
  teamGoldBalance: number;

  @ApiProperty({ description: 'Team current carbon balance' })
  teamCarbonBalance: number;

  @ApiProperty({ description: 'Required land areas for facility' })
  requiredAreas: number;

  @ApiProperty({ description: 'Available land area owned by team' })
  availableLandArea: number;

  @ApiProperty({ description: 'Current instances of this facility type on tile' })
  currentInstances: number;

  @ApiProperty({ description: 'Maximum allowed instances on tile' })
  maxInstances: number;

  @ApiProperty({ description: 'List of validation errors', type: [String] })
  errors: string[];
}
```

## Error Codes Reference

### Business Logic Errors (HTTP 200)

| Code | Error Key | Description |
|------|-----------|-------------|
| 4001 | TEAM_NOT_MEMBER | User is not a member of any team |
| 4002 | TEAM_NOT_ACTIVE_MEMBER | User is not an active team member |
| 4003 | USER_NO_ACTIVITY | User is not enrolled in any activity |
| 4004 | TEAM_DOES_NOT_OWN_LAND | Team does not own land on target tile |
| 4005 | FACILITY_NOT_ALLOWED_ON_LAND_TYPE | Facility type not allowed on this land type |
| 4006 | MAX_FACILITY_INSTANCES_REACHED | Maximum instances limit reached |
| 4007 | TEAM_ACCOUNT_NOT_FOUND | Team account not found |
| 4008 | FACILITY_NOT_OWNED_BY_TEAM | Facility not owned by user's team |
| 4009 | FACILITY_NOT_ACTIVE | Facility is not in active status |

### Validation Errors (HTTP 400)

| Code | Error Key | Description |
|------|-----------|-------------|
| 3001 | INSUFFICIENT_RESOURCE | Insufficient gold, carbon, or land area |
| 3002 | PRICE_PROTECTION_EXCEEDED | Cost exceeds specified maximum |
| 3003 | INVALID_INPUT | Invalid input parameter |
| 3004 | VALIDATION_FAILED | DTO validation failed |

### System Errors (HTTP 500)

| Code | Error Key | Description |
|------|-----------|-------------|
| 5001 | DATABASE_ERROR | Database operation failed |
| 5002 | TRANSACTION_FAILED | Transaction could not be completed |
| 5003 | INTERNAL_ERROR | Unexpected system error |

## Usage Examples

### Complete Build Workflow

```bash
# 1. Login to get JWT token
curl -X POST http://localhost:2999/api/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "student1@example.com",
    "password": "password123"
  }'

# Extract token from response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 2. Validate build capability
curl -X GET "http://localhost:2999/api/user/facilities/validate-build/1/MINE" \
  -H "Authorization: Bearer $TOKEN"

# 3. Build facility if validation passes
curl -X POST http://localhost:2999/api/user/facilities/build \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tileId": 1,
    "facilityType": "MINE",
    "description": "Primary mining operation",
    "maxGoldCost": 250.0,
    "maxCarbonCost": 100.0
  }'

# 4. Check facility status
curl -X GET "http://localhost:2999/api/user/facilities/owned?facilityType=MINE" \
  -H "Authorization: Bearer $TOKEN"

# 5. Upgrade facility
FACILITY_ID="clx1a2b3c4d5e6f7g8h9i0j1"
curl -X PUT "http://localhost:2999/api/user/facilities/$FACILITY_ID/upgrade" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetLevel": 2,
    "maxUpgradeCost": 300.0
  }'

# 6. Get team facility summary
curl -X GET "http://localhost:2999/api/user/facilities/summary" \
  -H "Authorization: Bearer $TOKEN"
```

### Batch Operations Example

```bash
# Get all facilities needing attention
curl -X GET "http://localhost:2999/api/user/facilities/attention" \
  -H "Authorization: Bearer $TOKEN"

# Get facilities on multiple tiles
for tile_id in 1 2 3 4 5; do
  echo "Facilities on tile $tile_id:"
  curl -s -X GET "http://localhost:2999/api/user/facilities/tile/$tile_id" \
    -H "Authorization: Bearer $TOKEN" | jq '.data'
done

# Get facilities by type
for facility_type in MINE FARM FACTORY; do
  echo "Facilities of type $facility_type:"
  curl -s -X GET "http://localhost:2999/api/user/facilities/type/$facility_type" \
    -H "Authorization: Bearer $TOKEN" | jq '.data | length'
done
```

## Best Practices

### Error Handling
1. **Always check validation** before building facilities
2. **Handle price protection** by setting reasonable max costs
3. **Retry logic** for temporary system errors
4. **User feedback** for business logic errors

### Performance
1. **Use pagination** for large facility lists
2. **Filter results** to reduce response sizes
3. **Cache facility data** when appropriate
4. **Batch operations** when possible

### Security
1. **Validate tokens** before each request
2. **Handle expired tokens** gracefully
3. **Don't store sensitive data** in facility metadata
4. **Log facility operations** for audit purposes