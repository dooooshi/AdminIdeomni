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

**Description**: Returns a simplified matrix view of facility-land type compatibility for quick reference and UI display.

**Authentication**: User JWT token required (Student role)

**Query Parameters**:
- `activityId` (optional): Override the default activity context
- `format` (optional): Response format - "simple" (default) or "detailed"

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
- `activityId` (optional): Override the default activity context
- `landType` (optional): Filter for specific land type

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

## Implementation Notes

### Data Source
The facility-land compatibility rules should be configured at the map template level, allowing different activities to have different building rules based on their scenarios.

### Caching Strategy
- Compatibility rules should be cached per template since they don't change frequently
- Cache invalidation should occur when template configurations are updated
- Consider using Redis for caching with a TTL of 1 hour

### Performance Considerations
- The matrix endpoint should use efficient data structures to minimize payload size
- Consider implementing pagination for detailed rules if the dataset grows large
- Use database indexes on template_id, facility_type, and land_type for quick lookups

### Business Logic Integration
- Rules should integrate with existing facility placement validation
- Consider terrain modifiers and special conditions from the activity configuration
- Efficiency ratings should affect production rates and operational costs

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