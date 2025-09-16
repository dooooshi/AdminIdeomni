# Population System API Specification

## Automatic Population Updates

The population system **automatically recalculates** populations whenever any operation affects them. Manual recalculation is NOT needed for normal operations.

### Operations That Trigger Automatic Updates

#### Facility Operations
- **Facility Build Completion**: Automatically updates tile and all affected neighbors/influence range
- **Facility Upgrade**: Automatically recalculates based on level changes and range expansion
- **Facility Demolition**: Automatically removes influence and updates all affected tiles

#### Infrastructure Operations  
- **Water/Power Connection**: Automatically enables production bonuses for all facilities
- **Water/Power Disconnection**: Automatically removes ALL production bonuses immediately
- **Base/Fire Station Service Change**: Automatically updates production bonus eligibility

#### Automatic Update Scope
| Operation | Tiles Auto-Updated | Reason |
|-----------|-------------------|---------|
| Build RAW_MATERIAL facility | Self only | Production bonus is local |
| Build FUNCTIONAL facility | Self only | Production bonus is local |
| Build Level 1 growth facility | Self only | Influence range = 1 tile |
| Build Level 2 growth facility | Self + 6 neighbors | Influence range = 7 tiles |
| Build Level 3 growth facility | Self + 18 neighbors | Influence range = 19 tiles |
| Build Level 4 growth facility | Self + 36 neighbors | Influence range = 37 tiles |
| Upgrade facility to Level 3+ | 6 neighbors | Siphon→Spillover effect change |
| Upgrade growth facility level | Expanding influence area | Range expansion |
| Infrastructure connect | All production facilities | Enables bonuses |
| Infrastructure disconnect | All production facilities | Disables ALL bonuses |
| Demolish any facility | All previously affected | Removes all influences |

### Implementation Note
Population updates are triggered through event listeners on:
- `FacilityService` events (build, upgrade, demolish)
- `InfrastructureConnectionService` events (connect, disconnect)
- `InfrastructureServiceService` events (subscribe, cancel)

## Base URL
```
/api/population
```

## Authentication
All endpoints require JWT authentication with appropriate role permissions.

## Endpoints

### 1. Get Tile Population
Get current population and calculation breakdown for a specific tile.

**Endpoint:** `GET /api/population/tile/:tileId`

**Parameters:**
- `tileId` (path): Map tile ID
- `activityId` (query): Activity context

**Response:**
```json
{
  "success": true,
  "data": {
    "tileId": 123,
    "activityId": "activity_abc",
    "currentPopulation": 5420,
    "initialPopulation": 1000,
    "breakdown": {
      "step1": {
        "result": 900,
        "siphonLoss": -200,
        "spilloverGain": 100
      },
      "step2": {
        "result": 2700,
        "hasInfrastructure": true,
        "rawMaterialBonus": 600,
        "functionalBonus": 1200
      },
      "step3": {
        "result": 5420,
        "multiplier": 2.007
      }
    },
    "lastUpdated": "2025-01-13T10:30:00Z"
  }
}
```

### 2. Get Population History
Retrieve population change history for a tile.

**Endpoint:** `GET /api/population/history/:tileId`

**Parameters:**
- `tileId` (path): Map tile ID
- `activityId` (query): Filter by activity
- `limit` (query): Number of records (default: 50)
- `offset` (query): Pagination offset

**Response:**
```json
{
  "success": true,
  "data": {
    "tileId": 123,
    "history": [
      {
        "id": "hist_001",
        "timestamp": "2025-01-13T10:30:00Z",
        "previousPopulation": 3200,
        "newPopulation": 5420,
        "changeAmount": 2220,
        "changeType": "PRODUCTION_FACILITY",
        "changeReason": "Factory upgraded to level 2",
        "calculationStep": 2
      }
    ],
    "pagination": {
      "total": 124,
      "limit": 50,
      "offset": 0
    }
  }
}
```

### 2a. Get My Activity Population History (Manager View)
Retrieve all population changes across all tiles in the manager's activity. The activity is automatically determined from the authenticated manager's context.

**Endpoint:** `GET /api/population/my-activity/history`

**Parameters:**
- `tileId` (query, optional): Filter by specific tile ID
- `changeType` (query, optional): Filter by change type (SIPHON_EFFECT, SPILLOVER_EFFECT, PRODUCTION_FACILITY, GROWTH_FACILITY, INFRASTRUCTURE_CHANGE, MANUAL_ADJUSTMENT)
- `teamId` (query, optional): Filter by team ownership
- `dateFrom` (query, optional): Start date for history (ISO 8601)
- `dateTo` (query, optional): End date for history (ISO 8601)
- `sortBy` (query, optional): Sort field (timestamp, changeAmount, tileId) - default: timestamp
- `sortOrder` (query, optional): Sort order (asc, desc) - default: desc
- `limit` (query): Number of records (default: 100, max: 500)
- `offset` (query): Pagination offset

**Response:**
```json
{
  "success": true,
  "data": {
    "activityId": "activity_abc",
    "summary": {
      "totalChanges": 1247,
      "totalPopulationGain": 45000,
      "totalPopulationLoss": -12000,
      "netChange": 33000,
      "mostActiveTeam": "team_001",
      "mostActiveTile": 123
    },
    "history": [
      {
        "id": "hist_001",
        "tileId": 123,
        "tileCoordinates": { "x": 10, "y": 5 },
        "teamId": "team_001",
        "teamName": "Blue Dragons",
        "timestamp": "2025-01-13T10:30:00Z",
        "previousPopulation": 3200,
        "newPopulation": 5420,
        "changeAmount": 2220,
        "changeType": "PRODUCTION_FACILITY",
        "changeReason": "Factory upgraded to level 2",
        "facilityType": "FACTORY",
        "calculationStep": 2,
        "triggeredBy": {
          "userId": "user_456",
          "username": "john_doe",
          "action": "FACILITY_UPGRADE"
        }
      },
      {
        "id": "hist_002",
        "tileId": 45,
        "tileCoordinates": { "x": 11, "y": 5 },
        "teamId": "team_002",
        "teamName": "Red Phoenix",
        "timestamp": "2025-01-13T10:25:00Z",
        "previousPopulation": 1500,
        "newPopulation": 2100,
        "changeAmount": 600,
        "changeType": "GROWTH_FACILITY",
        "changeReason": "Hospital built (Level 1)",
        "facilityType": "HOSPITAL",
        "calculationStep": 3,
        "triggeredBy": {
          "userId": "user_789",
          "username": "jane_smith",
          "action": "FACILITY_BUILD"
        }
      }
    ],
    "pagination": {
      "total": 1247,
      "limit": 100,
      "offset": 0,
      "hasNext": true,
      "hasPrevious": false
    }
  }
}
```

**Permissions:**
- Managers can only view history for their own activity
- Admins must use the admin-specific endpoints with activityId

### 3. Get Facility Population Influence
Get population influence details for a specific facility.

**Endpoint:** `GET /api/population/influence/:facilityId`

**Response:**
```json
{
  "success": true,
  "data": {
    "facilityId": "facility_xyz",
    "facilityType": "SCHOOL",
    "level": 3,
    "influenceType": "GROWTH_MULTIPLIER",
    "affectedTiles": [
      {
        "tileId": 45,
        "distance": 0,
        "influencePercentage": 30,
        "populationImpact": 1500
      }
    ],
    "totalPopulationImpact": 3800,
    "tilesAffected": 19
  }
}
```

### 4. Get Tile Influence Map
Get all influences affecting a specific tile.

**Endpoint:** `GET /api/population/influence-map/:tileId`

**Response:**
```json
{
  "success": true,
  "data": {
    "tileId": 123,
    "productionInfluences": [
      {
        "facilityId": "facility_001",
        "facilityType": "FACTORY",
        "level": 2,
        "populationBonus": 1200
      }
    ],
    "growthInfluences": [
      {
        "facilityId": "facility_002",
        "facilityType": "HOSPITAL",
        "level": 3,
        "distance": 1,
        "multiplierBonus": 0.06
      }
    ],
    "infrastructureStatus": {
      "hasWater": true,
      "hasPower": true,
      "hasBaseStation": true,
      "hasFireStation": true,
      "allRequirementsMet": true
    }
  }
}
```

### 5. Manual Population Adjustment (Admin Only)
Manually adjust population for special cases or corrections.

**Endpoint:** `PUT /api/population/manual-adjustment`

**Request Body:**
```json
{
  "tileId": 123,
  "activityId": "activity_abc",
  "newPopulation": 6000,
  "reason": "Special event bonus"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tileId": 123,
    "previousPopulation": 5420,
    "newPopulation": 6000,
    "adjustmentAmount": 580,
    "adjustedBy": "admin_user_id",
    "timestamp": "2025-01-13T11:00:00Z"
  }
}
```

### 6. Force Recalculate (Admin Debug Only)
Force population recalculation for debugging or recovery. NOT needed for normal operations.

**Endpoint:** `POST /api/population/force-recalculate`

**Request Body:**
```json
{
  "scope": "tile",  // "tile", "tiles", or "activity"
  "tileIds": [123],  // For scope="tile" or "tiles"
  "activityId": "activity_abc",
  "reason": "Debug: Testing calculation logic"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tilesProcessed": 1,
    "tilesChanged": 1,
    "results": [
      {
        "tileId": 123,
        "previousPopulation": 3200,
        "newPopulation": 5420,
        "changeAmount": 2220
      }
    ]
  }
}
```

## Population Update Events

The system emits these events for real-time updates:

### WebSocket Events
```typescript
// Population changed on a tile
{
  "event": "population.changed",
  "data": {
    "tileId": 123,
    "activityId": "activity_abc",
    "previousPopulation": 3200,
    "newPopulation": 5420,
    "changeType": "FACILITY_UPGRADE"
  }
}

// Population milestone reached
{
  "event": "population.milestone",
  "data": {
    "tileId": 123,
    "milestone": 10000,
    "teamId": "team_001"
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TILE_ID",
    "message": "The specified tile ID does not exist"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "Admin role required for manual adjustments"
  }
}
```

### 409 Conflict
```json
{
  "success": false,
  "error": {
    "code": "CALCULATION_IN_PROGRESS",
    "message": "A population calculation is already in progress"
  }
}
```

## Rate Limits

| Endpoint Type | Limit |
|--------------|-------|
| Population queries | 100 requests/minute |
| Manual adjustments | 5 requests/minute |
| Force recalculate | 2 requests/minute |

## Permissions

| Endpoint | Required Role | Scope |
|----------|--------------|-------|
| GET /api/population/tile/:tileId | Any authenticated user | Tile must be in user's activity |
| GET /api/population/history/:tileId | Any authenticated user | Tile must be in user's activity |
| GET /api/population/my-activity/history | Manager only | Automatically scoped to manager's activity |
| GET /api/population/my-activity/team-summary | Manager only | Automatically scoped to manager's activity |
| GET /api/population/influence/:facilityId | Any authenticated user | Facility must be in user's activity |
| GET /api/population/influence-map/:tileId | Any authenticated user | Tile must be in user's activity |
| PUT /api/population/manual-adjustment | Admin only | Any activity |
| POST /api/population/force-recalculate | Admin only | Any activity |

### Manager-Specific Access Rights
Managers have enhanced access to population data for their activity (automatically determined from authentication context):
- **Activity-wide History**: Can view all population changes across their entire activity
- **Team Summaries**: Can see aggregated population data by team
- **No activityId Required**: Activity is automatically resolved from manager's context
- **Filtering Capabilities**: Can filter history by team, tile, change type, and date range
- **Performance Metrics**: Can track recent population changes and team performance

### Admin Access
Admins who need to access specific activities should use admin-specific endpoints that include activityId in the path (to be implemented separately).

## Integration with Existing Services

### Facility Service Integration
```typescript
// Automatically triggered on facility events
facilityService.on('facility.built', async (event) => {
  await populationService.handleFacilityBuilt(event);
});

facilityService.on('facility.upgraded', async (event) => {
  await populationService.handleFacilityUpgraded(event);
});

facilityService.on('facility.demolished', async (event) => {
  await populationService.handleFacilityDemolished(event);
});
```

### Infrastructure Service Integration
```typescript
// Automatically triggered on infrastructure events
infrastructureService.on('connection.established', async (event) => {
  await populationService.handleInfrastructureConnected(event);
});

infrastructureService.on('connection.lost', async (event) => {
  await populationService.handleInfrastructureDisconnected(event);
});
```

## Important Notes

1. **Automatic Updates**: Population is automatically recalculated when facilities or infrastructure change. Manual recalculation is only for debugging.

2. **Transaction Safety**: All population updates happen within database transactions with the triggering operation.

3. **Event-Driven**: The system uses event listeners to trigger updates, ensuring consistency.

4. **Performance**: Batch updates are optimized to process multiple tiles efficiently.

5. **Audit Trail**: Every population change is recorded in history with the triggering operation.