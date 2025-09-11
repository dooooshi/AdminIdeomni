# Team Owned Tiles API Documentation

## Overview

The **Team Owned Tiles for Building API** provides teams with information about tiles where they own land area, specifically designed for facility building functionality. This endpoint returns comprehensive data about land ownership, facility usage, and available space for new construction.

## Endpoint

```
GET /api/user/land-purchase/owned-tiles-for-building
```

## Purpose

This API endpoint is designed to:
- Identify all tiles where a team owns land area (teamOwnedArea > 0)
- Show how much area is currently used by existing facilities
- Calculate available area for new facility construction
- Support facility building UI by providing location selection data

## Authentication

- **Required**: Yes
- **Type**: Bearer Token (JWT)
- **Guard**: UserAuth

## Response Format

### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "tileId": 91,
      "axialQ": -9,
      "axialR": 3,
      "landType": "MARINE",
      "teamOwnedArea": 100,
      "usedArea": 2,
      "availableArea": 98
    },
    {
      "tileId": 45,
      "axialQ": 5,
      "axialR": -2,
      "landType": "PLAIN",
      "teamOwnedArea": 50,
      "usedArea": 0,
      "availableArea": 50
    }
  ],
  "count": 2
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates if the request was successful |
| `data` | array | Array of owned tile information |
| `data[].tileId` | number | Unique identifier of the tile |
| `data[].axialQ` | number | Hexagonal coordinate Q of the tile |
| `data[].axialR` | number | Hexagonal coordinate R of the tile |
| `data[].landType` | string | Type of land: `PLAIN`, `COASTAL`, or `MARINE` |
| `data[].teamOwnedArea` | number | Total area owned by the team on this tile |
| `data[].usedArea` | number | Area currently occupied by facilities |
| `data[].availableArea` | number | Area available for new facility construction |
| `count` | number | Total number of tiles where team owns area |

## Area Calculation Logic

### Team Owned Area
- Represents the total land area purchased by the team on a specific tile
- Accumulated from all land purchases made by the team on that tile

### Used Area
- Calculated by counting active facilities on the tile
- Includes facilities with status: `ACTIVE`, `UNDER_CONSTRUCTION`, or `MAINTENANCE`
- Each facility typically consumes 1 area unit (configurable per facility type)

### Available Area
- Formula: `availableArea = teamOwnedArea - usedArea`
- Represents the space available for building new facilities
- Must be > 0 for a team to build new facilities on that tile

## Error Responses

### 403 Forbidden
```json
{
  "success": false,
  "businessCode": 1003,
  "message": "User not in any activity or team",
  "data": null
}
```

Returned when:
- User is not part of any activity
- User is not part of any team

### 401 Unauthorized
```json
{
  "success": false,
  "businessCode": 2101,
  "message": "Token invalid",
  "data": null
}
```

Returned when:
- JWT token is missing or invalid
- Token has expired

## Use Cases

### 1. Facility Building Interface
When a user wants to build a new facility, this API provides:
- List of all tiles where construction is possible
- Available space on each tile
- Current facility utilization

### 2. Land Management Dashboard
Teams can use this endpoint to:
- Monitor their land portfolio
- Track facility distribution across tiles
- Identify underutilized land areas

### 3. Strategic Planning
Helps teams with:
- Deciding where to purchase additional land
- Optimizing facility placement
- Balancing facility distribution across different land types

## Implementation Details

### Service Method
Located in: `src/user/land-view.service.ts:390`
- Method: `getTeamOwnedTilesForBuilding(userId: string)`

### Controller Endpoint
Located in: `src/user/land-purchase.controller.ts:510`
- Method: `getTeamOwnedTilesForBuilding()`

### Database Queries
1. Fetches user's current activity and team
2. Retrieves all tile states for the activity
3. For each tile, queries:
   - Team's owned area from `TileLandOwnership`
   - Facility count from `TileFacilityInstance`
4. Filters to return only tiles where `teamOwnedArea > 0`

## Performance Considerations

- The endpoint performs multiple database queries per tile
- For activities with many tiles, consider implementing:
  - Pagination for large result sets
  - Caching for frequently accessed data
  - Batch queries to reduce database round trips

## Related APIs

- `GET /api/user/land-purchase/owned-lands` - Get overall land ownership summary
- `GET /api/user/land-purchase/available-tiles` - Get tiles available for purchase
- `POST /api/user/facility-building/build` - Build a facility on owned land
- `GET /api/user/facility-building/my-facilities` - Get team's existing facilities

## Version History

- **v1.0.0** (2025-09-07): Initial implementation
  - Basic owned tiles listing with area calculations
  - Support for facility building location selection