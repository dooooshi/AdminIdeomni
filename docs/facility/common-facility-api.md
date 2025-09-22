# Common Facility API Specification

## Overview

This document specifies common facility-related APIs that provide cross-cutting functionality for the facility management system. These APIs support various user roles and provide essential facility configuration information.

## Base Configuration

### Base URL
```
http://localhost:2999/api
```

### Authentication
- User endpoints require JWT authentication via User authentication system
- Admin endpoints require JWT authentication with appropriate admin privileges
- Student-accessible endpoints automatically determine team and activity from user context
- The user's current activityId is retrieved from the database based on their authentication token, not from request parameters

### Standard Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  businessCode: number;
  message: string;
  data: T;
  timestamp: string;
  path?: string;
  extra?: object;
}
```

## API Endpoints

### 1. Facility-Land Type Compatibility API

#### 1.1 Get Simplified Building Compatibility Matrix
**Endpoint**: `GET /api/user/facility-land-compatibility/matrix`

**Description**: Returns a simplified matrix view of facility-land type compatibility for quick reference and UI display. The compatibility rules are based on the user's current activity's map template.

**Authentication**: User JWT token required (Student role)

**Query Parameters**:
- `format` (optional): Response format - "simple" (default) or "detailed"

**Headers Required**:
- `Authorization`: Bearer {JWT_TOKEN}

**Response Structure (Simple Format)**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Facility-land compatibility matrix retrieved successfully",
  "data": {
    "activityId": "activity123",
    "templateId": 1,
    "matrix": {
      "header": {
        "facilityTypes": ["MINE", "QUARRY", "FOREST", "FARM", "RANCH", "FISHERY", "FACTORY", "MALL", "WAREHOUSE", "WATER_PLANT", "POWER_PLANT", "BASE_STATION", "FIRE_STATION", "SCHOOL", "HOSPITAL", "PARK", "CINEMA"],
        "landTypes": ["MARINE", "PLAIN", "COASTAL", "GRASSLANDS", "FORESTS", "HILLS", "MOUNTAINS", "PLATEAUS", "DESERTS", "WETLANDS"]
      },
      "compatibility": [
        {
          "landType": "MARINE",
          "buildable": [false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false]
        },
        {
          "landType": "PLAIN",
          "buildable": [false, false, true, true, true, false, true, true, true, true, true, true, true, true, true, true, true]
        },
        {
          "landType": "COASTAL",
          "buildable": [false, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]
        },
        {
          "landType": "MOUNTAINS",
          "buildable": [true, true, false, false, false, false, false, false, true, false, true, true, false, false, false, false, false]
        },
        ...
      ],
    }
  }
}
```

#### 1.2 Get Land Types with Buildable Facilities
**Endpoint**: `GET /api/user/facility-land-compatibility/land-types`

**Description**: Retrieves which facilities can be built on each land type.

**Authentication**: User JWT token required (Student role)

**Query Parameters**:
- `landType` (optional): Filter for specific land type (e.g., "PLAIN", "MARINE", "MOUNTAINS")

**Headers Required**:
- `Authorization`: Bearer {JWT_TOKEN}

**Response Structure**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Land types with buildable facilities retrieved successfully",
  "data": {
    "activityId": "activity123",
    "templateId": 1,
    "landTypes": {
      "PLAIN": ["FARM", "RANCH", "FOREST", "FACTORY", "MALL", "WAREHOUSE", "WATER_PLANT", "POWER_PLANT", "BASE_STATION", "FIRE_STATION", "SCHOOL", "HOSPITAL", "PARK", "CINEMA"],
      "MARINE": ["FISHERY"],
      "MOUNTAINS": ["MINE", "QUARRY", "WAREHOUSE", "POWER_PLANT", "BASE_STATION"],
      "COASTAL": ["FISHERY", "FARM", "FACTORY", "WAREHOUSE", "MALL", "WATER_PLANT"],
      "GRASSLANDS": ["FARM", "RANCH", "FACTORY", "WAREHOUSE", "MALL", "SCHOOL", "HOSPITAL", "PARK", "CINEMA"],
      "FORESTS": ["FOREST", "QUARRY", "PARK"],
      "HILLS": ["MINE", "QUARRY", "RANCH", "FACTORY", "WAREHOUSE"],
      "PLATEAUS": ["MINE", "RANCH", "BASE_STATION", "POWER_PLANT"],
      "DESERTS": ["QUARRY", "WAREHOUSE", "POWER_PLANT", "BASE_STATION"],
      "WETLANDS": ["FISHERY", "FARM", "WATER_PLANT", "PARK"],
    }
  }
}
```
## Error Responses

### Common Error Codes
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions or not enrolled in activity)
- `404` - Not Found (activity or template not found)

### Error Response Format
```json
{
  "success": false,
  "businessCode": 400,
  "message": "Invalid facility type provided",
  "data": null,
  "timestamp": "2025-01-20T10:00:00Z",
  "path": "/api/user/facility-land-compatibility/check"
}
```

## Implementation Details

### Data Model
The facility-land compatibility rules are stored in the `TileFacilityBuildConfig` table:
```prisma
model TileFacilityBuildConfig {
  id           Int          @id @default(autoincrement())
  templateId   Int
  facilityType FacilityType
  landType     LandType
  isAllowed    Boolean      @default(true)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  mapTemplate  MapTemplate  @relation(fields: [templateId], references: [id])

  @@unique([templateId, facilityType, landType])
}
```

### Implementation Architecture
- **Controller**: `FacilityLandCompatibilityController` handles HTTP requests with JWT authentication
- **Service**: `FacilityLandCompatibilityService` implements business logic and data retrieval
- **Repository**: `TileFacilityBuildConfigRepository` extends `AbstractBaseRepository` for database access
- **DTOs**: Type-safe request/response objects with validation decorators

### Data Source
The facility-land compatibility rules are configured at the map template level, allowing different activities to have different building rules based on their scenarios.

### Performance Considerations
- The matrix endpoint uses efficient data structures to minimize payload size
- Database indexes on template_id, facility_type, and land_type for quick lookups
- Results are computed on-demand based on the user's current activity

### Business Logic Integration
- Rules integrate with existing facility placement validation
- User's current activity is determined from their authentication context
- Map template ID is retrieved from the activity configuration

### Future Enhancements
1. **Dynamic Rules**: Support for activity-specific rule overrides
2. **Terrain Chains**: Rules for facilities that require specific terrain combinations
3. **Progressive Unlocking**: Facilities that become available based on game progression
4. **Environmental Factors**: Weather and climate effects on building compatibility
5. **Resource Dependencies**: Rules based on nearby resource availability
6. **Infrastructure Requirements**: Detailed infrastructure dependency chains

## Related APIs
- `/api/user/facility-space/team/overview` - Team facility space overview
- `/api/admin/facility-space-configs` - Admin facility configuration
- `/api/user/map/tiles` - Map tile information including land types

## Change Log
- **v1.0.0** (2025-01-20): Initial API design for facility-land compatibility rules