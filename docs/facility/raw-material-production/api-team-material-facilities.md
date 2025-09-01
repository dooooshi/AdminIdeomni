# Team Material Facilities API

## Overview
API endpoint for users to retrieve their team's material production facilities (farms, mines, quarries, etc.)

## Endpoint

### Get Team Material Facilities
**GET** `/api/user/facilities/material-production`

Retrieves all material production facilities owned by the user's team, grouped by facility type.

#### Headers
- `Authorization: Bearer {token}` - User JWT token
- `Accept-Language: en|zh` - Language preference (optional)

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `activityId` | string | No | Filter by specific activity (defaults to user's current activity) |
| `facilityType` | string | No | Filter by facility type (FARM, MINE, QUARRY, FOREST, RANCH, FISHERY) |
| `isActive` | boolean | No | Filter by active status |
| `includeCapacity` | boolean | No | Include production capacity info (default: true) |

#### Response
```json
{
  "success": true,
  "data": {
    "teamId": "team-uuid",
    "teamName": "Team Alpha",
    "activityId": "activity-uuid",
    "facilities": [
      {
        "id": "facility-uuid",
        "facilityType": "FARM",
        "name": "Agricultural Farm",
        "level": 2,
        "tile": {
          "id": "tile-uuid",
          "coordinates": {
            "q": 2,
            "r": -1,
            "s": -1
          },
          "landType": "PLAIN"
        },
        "status": "ACTIVE",
        "capacity": {
          "totalSpace": 1000,
          "usedSpace": 300,
          "availableSpace": 700,
          "rawMaterialSpace": 200,
          "productSpace": 100
        },
        "supportedMaterials": [
          {
            "id": 1,
            "materialNumber": 101,
            "name": "Wheat",
            "origin": "FARM"
          },
          {
            "id": 2,
            "materialNumber": 102,
            "name": "Corn",
            "origin": "FARM"
          }
        ],
        "infrastructure": {
          "hasWater": true,
          "hasPower": true,
          "waterProviderId": "facility-uuid",
          "powerProviderId": "facility-uuid"
        }
      }
    ],
    "summary": {
      "totalFacilities": 5,
      "byType": {
        "FARM": 2,
        "MINE": 1,
        "QUARRY": 1,
        "FOREST": 1
      },
      "totalCapacity": {
        "totalSpace": 5000,
        "usedSpace": 1500,
        "availableSpace": 3500
      }
    }
  }
}
```

#### Error Responses

##### 401 Unauthorized
```json
{
  "success": false,
  "businessCode": 2102,
  "message": "Invalid or expired token"
}
```

##### 403 Forbidden
```json
{
  "success": false,
  "businessCode": 2116,
  "message": "User is not a member of any team"
}
```

##### 404 Not Found
```json
{
  "success": false,
  "businessCode": 2115,
  "message": "User not enrolled in any activity"
}
```

## Implementation Notes

### Facility Types Included
The following facility types are considered material production facilities:
- `FARM` - Agricultural products
- `MINE` - Mineral extraction
- `QUARRY` - Stone and aggregate
- `FOREST` - Timber and wood products
- `RANCH` - Livestock-based materials
- `FISHERY` - Marine resources

### Data Sources
1. **TileFacilityInstance** - Main facility data
2. **FacilitySpaceInventory** - Capacity information
3. **RawMaterial** - Supported materials by origin
4. **InfrastructureConnection** - Water/Power connections

### Performance Considerations
- Results are cached for 60 seconds per team
- Includes pagination for teams with many facilities
- Eager loading of related data to minimize queries

### Security
- Users can only access their own team's facilities
- Managers can view all teams in their activity (if permission granted)
- Activity scope is enforced

## Related APIs
- `/api/user/facilities/raw-materials` - Get available raw materials
- `/api/user/production/produce` - Initiate material production
- `/api/user/facilities/:id/space` - Get facility space details