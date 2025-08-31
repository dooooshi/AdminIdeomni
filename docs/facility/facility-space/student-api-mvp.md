# Student API for Team Facility Space Status - MVP Specification

## Overview
This document specifies the MVP-level API endpoints for students to retrieve their team's facility space status. The API provides read-only access to space utilization information for facilities owned by the student's team.

## API Design Principles
- **Read-only access**: Students can only view, not modify space data
- **Team-scoped**: Students can only access their own team's facility information  
- **Activity-aware**: Data is filtered by the current activity context
- **Context-aware**: Team and activity are automatically determined from user authentication
- **Simple and focused**: MVP provides essential space status information only

## Authentication & Authorization
- **Authentication**: JWT token via User authentication system
- **Authorization**: User must be an active member of a team
- **Context Resolution**: The user's current team and activity are automatically determined from their active enrollment
- **Scope**: Limited to the user's current team facilities only

## API Endpoints

### 1. Get Team's Facility Space Overview
**Endpoint**: `GET /api/user/facility-space/team/overview`

**Description**: Get an overview of all facilities with storage space owned by the user's current team in their active activity.

**Authentication**: User JWT token required

**Query Parameters**: None (team and activity are determined from user context)

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Team facility space overview retrieved successfully",
  "data": {
    "teamId": "team123",
    "teamName": "Innovation Squad",
    "activityId": "activity456",
    "summary": {
      "totalFacilities": 5,
      "storageFacilities": 3,
      "totalSpaceCapacity": 8500,
      "totalSpaceUsed": 4250,
      "totalSpaceAvailable": 4250,
      "utilizationRate": 50.0
    },
    "facilities": [
      {
        "facilityInstanceId": "facility789",
        "facilityType": "WAREHOUSE",
        "facilityName": "Central Warehouse",
        "tileCoordinates": {
          "q": 10,
          "r": 5,
          "s": -15
        },
        "level": 3,
        "spaceMetrics": {
          "totalSpace": 5000,
          "usedSpace": 2500,
          "availableSpace": 2500,
          "utilizationRate": 50.0,
          "rawMaterialSpace": 1500,
          "productSpace": 1000
        }
      },
      {
        "facilityInstanceId": "facility790",
        "facilityType": "FACTORY",
        "facilityName": "Production Plant A",
        "tileCoordinates": {
          "q": 12,
          "r": 8,
          "s": -20
        },
        "level": 2,
        "spaceMetrics": {
          "totalSpace": 2500,
          "usedSpace": 1750,
          "availableSpace": 750,
          "utilizationRate": 70.0,
          "rawMaterialSpace": 1000,
          "productSpace": 750
        }
      }
    ]
  }
}
```

### 2. Get Specific Facility Space Details
**Endpoint**: `GET /api/user/facility-space/facilities/:facilityInstanceId`

**Description**: Get detailed space status and inventory summary for a specific facility owned by the team.

**Authentication**: User JWT token required

**Path Parameters**:
- `facilityInstanceId` (string): The facility instance ID

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Facility space details retrieved successfully",
  "data": {
    "facilityInstanceId": "facility789",
    "facilityType": "WAREHOUSE",
    "facilityName": "Central Warehouse",
    "teamId": "team123",
    "activityId": "activity456",
    "tileCoordinates": {
      "q": 10,
      "r": 5,
      "s": -15
    },
    "facilityInfo": {
      "level": 3,
      "status": "ACTIVE",
      "category": "FUNCTIONAL"
    },
    "spaceConfiguration": {
      "initialSpace": 1000,
      "spacePerLevel": 500,
      "maxSpace": 5000,
      "currentTotalSpace": 2000
    },
    "spaceMetrics": {
      "totalSpace": 2000,
      "usedSpace": 1200,
      "availableSpace": 800,
      "utilizationRate": 60.0,
      "rawMaterialSpace": 700,
      "productSpace": 500
    },
    "inventorySummary": {
      "totalItems": 15,
      "rawMaterialItems": 8,
      "productItems": 7,
      "totalValue": 125000,
      "topItemsBySpace": [
        {
          "itemType": "RAW_MATERIAL",
          "name": "Steel",
          "quantity": 100,
          "spaceOccupied": 300,
          "percentageOfTotal": 25.0
        },
        {
          "itemType": "PRODUCT",
          "name": "Car Engine",
          "quantity": 10,
          "spaceOccupied": 200,
          "percentageOfTotal": 16.7
        }
      ]
    },
    "lastUpdated": "2025-08-31T10:30:00Z"
  }
}
```

### 3. Get Team Space Utilization Trends (Simple)
**Endpoint**: `GET /api/user/facility-space/team/utilization`

**Description**: Get current space utilization metrics across all facilities of the user's current team.

**Authentication**: User JWT token required

**Query Parameters**: None (team and activity are determined from user context)

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Team space utilization retrieved successfully",
  "data": {
    "teamId": "team123",
    "activityId": "activity456",
    "timestamp": "2025-08-31T10:30:00Z",
    "utilization": {
      "byFacilityType": [
        {
          "facilityType": "WAREHOUSE",
          "count": 1,
          "totalSpace": 5000,
          "usedSpace": 2500,
          "utilizationRate": 50.0
        },
        {
          "facilityType": "FACTORY",
          "count": 2,
          "totalSpace": 3500,
          "usedSpace": 2100,
          "utilizationRate": 60.0
        }
      ],
      "byItemType": {
        "rawMaterials": {
          "totalSpace": 2500,
          "percentage": 55.6
        },
        "products": {
          "totalSpace": 2000,
          "percentage": 44.4
        }
      },
      "alerts": [
        {
          "type": "HIGH_UTILIZATION",
          "facilityInstanceId": "facility791",
          "facilityName": "Production Plant B",
          "message": "Facility is at 95% capacity",
          "severity": "WARNING"
        }
      ]
    }
  }
}
```

## Error Responses

### Common Error Codes
```json
{
  "success": false,
  "businessCode": 403,
  "message": "Access denied: You can only view your team's facilities",
  "timestamp": "2025-08-31T10:30:00Z"
}
```

**Error Scenarios**:
- `401 Unauthorized`: No valid JWT token
- `403 Forbidden`: Attempting to access another team's facilities
- `404 Not Found`: Facility not found or doesn't belong to team
- `400 Bad Request`: Missing required parameters

## Implementation Notes

### Security Considerations
1. **Team Validation**: Always verify the requesting user belongs to the team
2. **Activity Context**: Ensure data is filtered by the correct activity
3. **No Write Operations**: MVP is read-only to prevent accidental data modification
4. **Rate Limiting**: Apply appropriate rate limits to prevent abuse

### Data Calculations
1. **Space Units**: All space values are in carbon emission units
2. **Utilization Rate**: `(usedSpace / totalSpace) * 100`
3. **Available Space**: `totalSpace - usedSpace`
4. **Percentage Calculations**: Round to 1 decimal place for display

### Performance Considerations
1. **Caching**: Consider caching overview data for 1-5 minutes
2. **Pagination**: For teams with many facilities, implement pagination
3. **Query Optimization**: Use database indexes on teamId and activityId

## MVP Limitations
This MVP version does NOT include:
- Historical data or trends over time
- Detailed inventory item listings
- Space allocation or reservation features
- Predictive analytics or recommendations
- Batch operations or bulk data export
- Real-time updates via WebSocket

## Future Enhancements
Potential features for future versions:
1. Historical space utilization graphs
2. Inventory item search and filtering
3. Space optimization recommendations
4. Alert customization and notifications
5. Comparative analytics with other teams
6. Export functionality for reports

## Usage Example

### JavaScript/TypeScript Client
```typescript
// Get team's facility space overview
async function getTeamFacilityOverview() {
  const response = await fetch(
    `/api/user/facility-space/team/overview`,
    {
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch facility overview');
  }
  
  return response.json();
}

// Get specific facility details
async function getFacilityDetails(facilityInstanceId: string) {
  const response = await fetch(
    `/api/user/facility-space/facilities/${facilityInstanceId}`,
    {
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch facility details');
  }
  
  return response.json();
}
```

## Summary
This MVP API provides students with essential read-only access to their team's facility space information. It focuses on:
- **Simplicity**: Three straightforward endpoints
- **Security**: Team-scoped access only
- **Performance**: Lightweight responses with summary data
- **Usability**: Clear structure and meaningful metrics

The API can be easily extended in future iterations while maintaining backward compatibility with the MVP version.