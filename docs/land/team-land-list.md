# Land Management API

## Overview
Simple API for users to view their team's land ownership status and facilities built on each land tile.

## API Endpoint

### Get Team Land Status
Retrieve comprehensive information about the team's land ownership and facilities.

```typescript
GET /api/user/land-purchase/team/land-status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "teamId": "team_123",
      "teamName": "Alpha Team",
      "totalOwnedArea": 150.5,
      "totalGoldSpent": 50000,
      "totalCarbonSpent": 30000,
      "tilesOwnedCount": 5,
      "totalFacilities": 8
    },
    "tiles": [
      {
        "tileId": 1,
        "coordinates": { "q": 0, "r": 0 },
        "landType": "PLAIN",
        "ownedArea": 50.5,
        "facilities": [
          {
            "id": "facility_1",
            "facilityType": "FACTORY",
            "level": 2,
            "status": "ACTIVE",
            "constructionDate": "2024-01-15T10:00:00Z"
          },
          {
            "id": "facility_2", 
            "facilityType": "WAREHOUSE",
            "level": 1,
            "status": "ACTIVE",
            "constructionDate": "2024-01-20T14:30:00Z"
          }
        ]
      },
      {
        "tileId": 2,
        "coordinates": { "q": 1, "r": 0 },
        "landType": "COASTAL",
        "ownedArea": 100,
        "facilities": [
          {
            "id": "facility_3",
            "facilityType": "FARM",
            "level": 1,
            "status": "UNDER_CONSTRUCTION",
            "constructionDate": "2024-02-01T09:00:00Z"
          }
        ]
      }
    ]
  }
}
```

## Data Models

### Related Database Tables
- **TileLandOwnership**: Stores aggregated land ownership per team per tile
- **TileFacilityInstance**: Stores facilities built on tiles by teams
- **MapTile**: Contains tile coordinates and land type information

### Key Fields
- **Land Ownership**: Team ID, Tile ID, Owned Area, Total Spent
- **Facilities**: Facility Type, Level, Status, Construction Date
- **Tile Info**: Coordinates (Q, R), Land Type

## Implementation Notes
- Land ownership is scoped by activity (each simulation has separate land data)
- Teams can own multiple tiles and build multiple facilities per tile
- Facility status can be: ACTIVE, UNDER_CONSTRUCTION, MAINTENANCE, DAMAGED, DECOMMISSIONED

## Data Model Alignment
This API specification aligns with the following Prisma models:

### TileLandOwnership (prisma/models/tile-land-purchase.prisma)
- `ownedArea`: Decimal - Total area owned by team on tile
- `totalGoldSpent`: Decimal - Total gold spent
- `totalCarbonSpent`: Decimal - Total carbon spent
- `teamId`, `tileId`, `activityId`: Foreign keys

### TileFacilityInstance (prisma/models/tile-facility-instance.prisma)
- `facilityType`: FacilityType enum (FACTORY, WAREHOUSE, FARM, etc.)
- `level`: Int - Current upgrade level
- `status`: FacilityInstanceStatus enum
- `constructionCompleted`: DateTime - Maps to constructionDate in response
- `teamId`, `tileId`, `activityId`: Foreign keys

### MapTile (prisma/models/map.prisma)
- `axialQ`, `axialR`: Int - Hexagonal coordinates
- `landType`: LandType enum (MARINE, PLAIN, COASTAL)
- `id`: Int - Tile identifier