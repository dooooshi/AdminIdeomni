# Admin Map Template & Tile Configuration Management API

## Overview

The Admin Map Template Management system provides super administrators with comprehensive control over map templates and tile configurations in the New Continents platform. This system enables the creation, modification, and management of different map configurations with both static tile properties and dynamic activity-specific tile states for business simulations.

## Features

### Map Template Management
- **Template Creation**: Create new map templates with custom configurations
- **Template Generation**: Generate procedural map templates with specified parameters and default tile configurations
- **Template Management**: Full CRUD operations for map templates
- **Template Cloning**: Duplicate existing templates for customization
- **Default Template Management**: Set and manage default templates
- **Template Statistics**: View analytics and statistics about template usage

### Tile Configuration System
- **Static Tile Configuration**: Manage base economic and demographic data per tile
  - Initial pricing based on land type
  - Base population settings
  - Transportation cost configuration
- **Facility Build Configuration**: Control facility placement rules and upgrade systems
  - Define which facilities can be built on different land types
  - Set build requirements (gold, carbon, areas)
  - Configure upgrade costs and maximum levels
- **Dynamic Activity States**: Manage real-time tile data during business simulations
  - Current pricing that changes during activities
  - Population fluctuations
  - Complete audit trail of changes

### Activity Integration
- **Tile State Initialization**: Automatically create tile states for new activities
- **Bulk State Management**: Efficient updates for multiple tiles during simulations
- **Reset Capabilities**: Restore tiles to initial template values
- **Activity Analytics**: Comprehensive statistics and reporting

## Authentication & Authorization

All endpoints require:
- **Authentication**: Valid admin JWT token
- **Authorization**: Super Admin permissions with specific map template permissions:
  - `MAP_TEMPLATE_CREATE` - Create new templates
  - `MAP_TEMPLATE_READ` - View template information
  - `MAP_TEMPLATE_UPDATE` - Modify existing templates
  - `MAP_TEMPLATE_DELETE` - Delete templates
  - `MAP_TEMPLATE_GENERATE` - Generate procedural templates
  - `MAP_TEMPLATE_CLONE` - Clone existing templates
  - `MAP_TEMPLATE_SET_DEFAULT` - Manage default template settings
  - `MAP_TEMPLATE_STATISTICS` - View template analytics
  - `TILE_FACILITY_CONFIG_READ` - View facility build configurations
  - `TILE_FACILITY_CONFIG_MANAGE` - Manage facility build configurations
  - `ACTIVITY_TILE_STATE_MANAGE` - Manage activity tile states
  - `ACTIVITY_TILE_STATE_BULK_UPDATE` - Bulk update tile states

## API Endpoints

### Base URLs
```
Map Templates: /api/admin/map-templates
Tile Facility Configs: /api/admin/map-templates/{templateId}/tile-facility-configs  
Tile States: /api/map/activities/{activityId}/tile-states
```

## Map Template Management

### 1. Create Map Template

Create a new map template manually.

**Endpoint:** `POST /api/admin/map-templates`

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Island Economic Simulation Template",
  "description": "Template designed for island-based business scenarios with maritime focus",
  "version": "1.0",
  "isActive": true,
  "isDefault": false
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Island Economic Simulation Template",
    "description": "Template designed for island-based business scenarios with maritime focus",
    "version": "1.0",
    "isActive": true,
    "isDefault": false,
    "createdAt": "2025-07-20T10:15:30.000Z",
    "updatedAt": "2025-07-20T10:15:30.000Z",
    "deletedAt": null
  },
  "message": "Map template created successfully"
}
```

### 2. Generate Map Template with Tile Configuration

Generate a new map template with procedural tile generation and automatic configuration based on land types.

**Endpoint:** `POST /api/admin/map-templates/generate`

**Request Body:**
```json
{
  "templateName": "Maritime Economic Zone",
  "description": "Template focused on maritime business scenarios with diverse economic zones",
  "width": 15,
  "height": 7,
  "marinePercentage": 60,
  "coastalPercentage": 25,
  "plainPercentage": 15,
  "randomSeed": 12345
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "Maritime Economic Zone",
    "description": "Template focused on maritime business scenarios with diverse economic zones",
    "version": "1.0",
    "isActive": true,
    "isDefault": false,
    "createdAt": "2025-07-20T10:20:15.000Z",
    "updatedAt": "2025-07-20T10:20:15.000Z",
    "deletedAt": null,
    "tiles": [
      {
        "id": 106,
        "axialQ": 0,
        "axialR": 0,
        "landType": "MARINE",
        "initialPrice": 50.00,
        "initialPopulation": 0,
        "transportationCostUnit": 8.00,
        "templateId": 3,
        "isActive": true,
        "createdAt": "2025-07-20T10:20:15.000Z",
        "updatedAt": "2025-07-20T10:20:15.000Z"
      },
      {
        "id": 107,
        "axialQ": 1,
        "axialR": 0,
        "landType": "COASTAL",
        "initialPrice": 100.00,
        "initialPopulation": 500,
        "transportationCostUnit": 5.00,
        "templateId": 3,
        "isActive": true,
        "createdAt": "2025-07-20T10:20:15.000Z",
        "updatedAt": "2025-07-20T10:20:15.000Z"
      }
      // ... more tiles with configurations
    ],
    "tileCount": 105,
    "defaultConfigurations": {
      "MARINE": {
        "initialPrice": 50.00,
        "initialPopulation": 0,
        "transportationCostUnit": 8.00
      },
      "COASTAL": {
        "initialPrice": 100.00,
        "initialPopulation": 500,
        "transportationCostUnit": 5.00
      },
      "PLAIN": {
        "initialPrice": 150.00,
        "initialPopulation": 1000,
        "transportationCostUnit": 3.00
      }
    }
  },
  "message": "Map template generated successfully with tile configurations"
}
```

### 3. Get Template with Enhanced Tile Information

Retrieve a specific map template with detailed tile configuration data.

**Endpoint:** `GET /api/admin/map-templates/:id`

**Query Parameters:**
- `includeTiles` (optional): Include tiles in response (true/false)
- `includeStatistics` (optional): Include economic statistics (true/false)

**Example Request:**
```
GET /api/admin/map-templates/1?includeTiles=true&includeStatistics=true
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Default Economic Template",
    "description": "The original default template with balanced economic zones",
    "version": "1.0",
    "isActive": true,
    "isDefault": true,
    "createdAt": "2025-07-20T10:00:00.000Z",
    "updatedAt": "2025-07-20T10:00:00.000Z",
    "deletedAt": null,
    "tiles": [
      {
        "id": 1,
        "axialQ": -7,
        "axialR": 0,
        "landType": "COASTAL",
        "initialPrice": 100.00,
        "initialPopulation": 500,
        "transportationCostUnit": 5.00,
        "templateId": 1,
        "isActive": true,
        "createdAt": "2025-07-20T10:00:00.000Z",
        "updatedAt": "2025-07-20T10:00:00.000Z",
        "deletedAt": null
      }
      // ... more tiles
    ],
    "tileCount": 105,
    "landTypeDistribution": {
      "MARINE": 35,
      "COASTAL": 35,
      "PLAIN": 35
    },
    "economicStatistics": {
      "totalInitialValue": 11025.00,
      "totalInitialPopulation": 52500,
      "averagePrice": 105.00,
      "averagePopulation": 500,
      "averageTransportationCost": 5.33,
      "priceByLandType": {
        "MARINE": 50.00,
        "COASTAL": 100.00,
        "PLAIN": 150.00
      },
      "populationByLandType": {
        "MARINE": 0,
        "COASTAL": 500,
        "PLAIN": 1000
      }
    }
  }
}
```

### 4. Create Individual Tile with Custom Configuration

Create a single tile with specific configuration.

**Endpoint:** `POST /api/map/tiles`

**Request Body:**
```json
{
  "axialQ": 0,
  "axialR": 0,
  "landType": "PLAIN",
  "templateId": 1,
  "initialPrice": 175.00,
  "initialPopulation": 1200,
  "transportationCostUnit": 2.75
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 210,
    "axialQ": 0,
    "axialR": 0,
    "landType": "PLAIN",
    "initialPrice": 175.00,
    "initialPopulation": 1200,
    "transportationCostUnit": 2.75,
    "templateId": 1,
    "isActive": true,
    "createdAt": "2025-07-20T11:00:00.000Z",
    "updatedAt": "2025-07-20T11:00:00.000Z",
    "deletedAt": null
  },
  "message": "Tile created successfully with custom configuration"
}
```

## Activity Tile State Management

### 5. Initialize Activity Tile States

Create tile states for an activity based on its map template.

**Endpoint:** `POST /api/map/activities/:activityId/tile-states/initialize`

**Response (201 Created):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "activityId": "activity_123",
      "tileId": 1,
      "currentPrice": 100.00,
      "currentPopulation": 500,
      "lastUpdated": "2025-07-20T12:00:00.000Z",
      "updatedBy": "admin_456",
      "changeReason": "Initial state from template",
      "createdAt": "2025-07-20T12:00:00.000Z",
      "updatedAt": "2025-07-20T12:00:00.000Z",
      "tile": {
        "id": 1,
        "axialQ": -7,
        "axialR": 0,
        "landType": "COASTAL",
        "initialPrice": 100.00,
        "initialPopulation": 500,
        "transportationCostUnit": 5.00
      }
    }
    // ... 104 more tile states
  ],
  "count": 105,
  "message": "Activity tile states initialized successfully"
}
```

### 6. Bulk Update Activity Tile States

Update multiple tile states for business simulation events.

**Endpoint:** `PUT /api/map/activities/:activityId/tile-states/bulk`

**Request Body:**
```json
{
  "updates": [
    {
      "tileId": 1,
      "currentPrice": 125.00,
      "changeReason": "Coastal development project increased property values"
    },
    {
      "tileId": 2,
      "currentPopulation": 600,
      "changeReason": "New employment opportunities attracted residents"
    },
    {
      "tileId": 3,
      "currentPrice": 110.00,
      "currentPopulation": 550,
      "changeReason": "Economic spillover from nearby development"
    }
  ],
  "globalChangeReason": "Q2 Coastal Development Initiative",
  "updatedBy": "admin_456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "updated": 3,
    "failed": 0,
    "details": [
      {
        "tileId": 1,
        "success": true
      },
      {
        "tileId": 2,
        "success": true
      },
      {
        "tileId": 3,
        "success": true
      }
    ]
  },
  "message": "Bulk update completed: 3 updated, 0 failed"
}
```

### 7. Get Activity Tile Statistics

Retrieve comprehensive statistics for an activity's tile states.

**Endpoint:** `GET /api/map/activities/:activityId/tile-statistics`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalTiles": 105,
    "tilesWithPrice": 105,
    "tilesWithPopulation": 70,
    "averagePrice": 118.75,
    "averagePopulation": 543,
    "minPrice": 45.00,
    "maxPrice": 180.00,
    "minPopulation": 0,
    "maxPopulation": 1250,
    "totalPopulation": 38010,
    "economicGrowth": {
      "priceGrowthRate": 0.125,
      "populationGrowthRate": 0.086,
      "totalValueIncrease": 1143.75
    },
    "landTypeAnalysis": {
      "MARINE": {
        "count": 35,
        "averagePrice": 52.50,
        "averagePopulation": 0,
        "totalValue": 1837.50
      },
      "COASTAL": {
        "count": 35,
        "averagePrice": 115.00,
        "averagePopulation": 580,
        "totalValue": 4025.00
      },
      "PLAIN": {
        "count": 35,
        "averagePrice": 168.75,
        "averagePopulation": 1100,
        "totalValue": 5906.25
      }
    }
  }
}
```

### 8. Reset Activity Tile States

Reset all tile states in an activity to their initial template values.

**Endpoint:** `POST /api/map/activities/:activityId/tile-states/reset`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "updatedCount": 105
  },
  "message": "Reset 105 tile states to initial values"
}
```

### 9. Query Activity Tile States with Filters

Get filtered tile states for analysis and management.

**Endpoint:** `GET /api/map/activity-tile-states`

**Query Parameters:**
- `activityId` (required): Activity ID
- `minCurrentPrice` (optional): Minimum current price filter
- `maxCurrentPrice` (optional): Maximum current price filter
- `minCurrentPopulation` (optional): Minimum population filter
- `maxCurrentPopulation` (optional): Maximum population filter
- `page` (optional): Page number for pagination
- `pageSize` (optional): Items per page

**Example Request:**
```
GET /api/map/activity-tile-states?activityId=activity_123&minCurrentPrice=100&maxCurrentPrice=200&page=1&pageSize=20
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "activityId": "activity_123",
      "tileId": 25,
      "currentPrice": 125.00,
      "currentPopulation": 600,
      "lastUpdated": "2025-07-20T13:30:00.000Z",
      "updatedBy": "admin_456",
      "changeReason": "Market adjustment based on demand",
      "createdAt": "2025-07-20T12:00:00.000Z",
      "updatedAt": "2025-07-20T13:30:00.000Z",
      "tile": {
        "id": 25,
        "axialQ": 2,
        "axialR": 1,
        "landType": "COASTAL",
        "initialPrice": 100.00,
        "initialPopulation": 500,
        "transportationCostUnit": 5.00
      }
    }
    // ... more filtered results
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "pageSize": 20,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Enhanced Template Generation Parameters

### Required Parameters
- **templateName**: Name for the new template
- **width**: Grid width (recommended: 15)
- **height**: Grid height (recommended: 7)
- **marinePercentage**: Percentage of MARINE tiles (0-100)
- **coastalPercentage**: Percentage of COASTAL tiles (0-100)
- **plainPercentage**: Percentage of PLAIN tiles (0-100)

### Optional Parameters
- **description**: Template description
- **randomSeed**: Seed for reproducible generation (integer)
- **customPricing**: Override default pricing by land type
- **customPopulation**: Override default population by land type
- **customTransportation**: Override default transportation costs

### Custom Configuration Example
```json
{
  "templateName": "Custom Economic Zones",
  "description": "Template with custom economic parameters",
  "width": 15,
  "height": 7,
  "marinePercentage": 40,
  "coastalPercentage": 30,
  "plainPercentage": 30,
  "randomSeed": 42,
  "customPricing": {
    "MARINE": 75.00,
    "COASTAL": 125.00,
    "PLAIN": 200.00
  },
  "customPopulation": {
    "MARINE": 0,
    "COASTAL": 750,
    "PLAIN": 1500
  },
  "customTransportation": {
    "MARINE": 10.00,
    "COASTAL": 6.00,
    "PLAIN": 2.50
  }
}
```

## Business Simulation Workflows

### Complete Activity Simulation Workflow

1. **Create Activity with Template**
```bash
curl -X POST "http://localhost:2999/api/activities" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Q3 Economic Simulation",
    "activityType": "BizSimulation3_1",
    "startAt": "2025-08-01T09:00:00Z",
    "endAt": "2025-08-01T17:00:00Z",
    "mapTemplateId": 1
  }'
```

2. **Initialize Facility Build Configurations (if not already done)**
```bash
curl -X POST "http://localhost:2999/api/admin/map-templates/1/tile-facility-configs/initialize-defaults" \
  -H "Authorization: Bearer <admin_token>"
```

3. **Initialize Tile States**
```bash
curl -X POST "http://localhost:2999/api/map/activities/activity_123/tile-states/initialize" \
  -H "Authorization: Bearer <admin_token>"
```

4. **Review Facility Build Options for Players**
```bash
curl -X GET "http://localhost:2999/api/admin/map-templates/1/tile-facility-configs/by-land-type/COASTAL" \
  -H "Authorization: Bearer <admin_token>"
```

5. **Simulate Market Event**
```bash
curl -X PUT "http://localhost:2999/api/map/activities/activity_123/tile-states/bulk" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [
      {
        "tileId": 1,
        "currentPrice": 125.00,
        "changeReason": "Tech boom increased property values"
      }
    ],
    "globalChangeReason": "Technology Sector Growth Event"
  }'
```

6. **Monitor Progress**
```bash
curl -X GET "http://localhost:2999/api/map/activities/activity_123/tile-statistics" \
  -H "Authorization: Bearer <admin_token>"
```

7. **Reset for New Scenario**
```bash
curl -X POST "http://localhost:2999/api/map/activities/activity_123/tile-states/reset" \
  -H "Authorization: Bearer <admin_token>"
```

## Error Handling

### Enhanced Error Responses

**Tile Configuration Validation Error (400):**
```json
{
  "success": false,
  "businessCode": 3001,
  "message": "Tile configuration validation failed",
  "data": {
    "errors": [
      {
        "field": "initialPrice",
        "message": "must be a positive number"
      },
      {
        "field": "transportationCostUnit",
        "message": "must be greater than 0"
      }
    ]
  },
  "timestamp": "2025-07-20T10:45:30.000Z",
  "path": "/api/map/tiles"
}
```

**Activity Tile State Conflict (409):**
```json
{
  "success": false,
  "businessCode": 4003,
  "message": "Tile state already exists for this activity",
  "data": {
    "activityId": "activity_123",
    "tileId": 45
  },
  "timestamp": "2025-07-20T10:45:30.000Z",
  "path": "/api/map/activity-tile-states"
}
```

**Bulk Update Partial Failure (207):**
```json
{
  "success": true,
  "data": {
    "updated": 8,
    "failed": 2,
    "details": [
      {
        "tileId": 1,
        "success": true
      },
      {
        "tileId": 2,
        "success": false,
        "error": "Tile not found in activity template"
      }
    ]
  },
  "message": "Bulk update completed with some failures"
}
```

## Operation Logging

Enhanced operation logging includes:

### Template Operations
- `CREATE_MAP_TEMPLATE` - Template creation with configuration
- `GENERATE_MAP_TEMPLATE` - Template generation with tile configs
- `VIEW_TEMPLATE_ECONOMICS` - Economic statistics viewing
- `UPDATE_TILE_CONFIG` - Individual tile configuration updates

### Activity Tile State Operations
- `INITIALIZE_TILE_STATES` - Activity tile state initialization
- `BULK_UPDATE_TILE_STATES` - Bulk tile state modifications
- `RESET_TILE_STATES` - Reset to initial values
- `VIEW_TILE_STATISTICS` - Activity analytics viewing
- `UPDATE_INDIVIDUAL_TILE_STATE` - Single tile state updates

### Audit Trail Enhancement
Each operation logs:
- **Economic Impact**: Total value changes
- **Population Changes**: Population fluctuations
- **Price Volatility**: Price change magnitude
- **Business Reason**: Simulation event context

## Best Practices

### Template Configuration
1. **Economic Balance**: Ensure reasonable price ratios between land types
2. **Population Density**: Set realistic population distributions
3. **Transportation Logic**: Lower costs for better accessibility
4. **Version Management**: Update versions for significant config changes

### Activity Simulation Management
1. **State Initialization**: Always initialize tile states before simulation events
2. **Change Documentation**: Provide meaningful change reasons for audit trails
3. **Bulk Operations**: Use bulk updates for efficiency with large-scale events
4. **Progress Monitoring**: Regular statistics checks during long simulations
5. **Reset Strategy**: Plan reset points for alternative scenario testing

### Performance Optimization
1. **Batch Updates**: Group related tile changes into single bulk operations
2. **Selective Queries**: Use filters to limit data retrieval
3. **Statistics Caching**: Cache frequently accessed statistics
4. **Pagination**: Always paginate large result sets

### Security & Compliance
1. **Permission Granularity**: Assign specific permissions for different operations
2. **Audit Completeness**: Ensure all modifications are logged with reasons
3. **Data Validation**: Validate all economic parameters for realistic ranges
4. **Access Logging**: Monitor template and tile state access patterns

## Integration Examples

### Advanced Economic Simulation

```typescript
class EconomicSimulationManager {
  async runMarketSimulation(activityId: string, adminId: string) {
    // Phase 1: Economic boom in coastal areas
    await this.simulateCoastalBoom(activityId, adminId);
    
    // Phase 2: Infrastructure development
    await this.buildInfrastructure(activityId, adminId);
    
    // Phase 3: Market correction
    await this.simulateMarketCorrection(activityId, adminId);
    
    // Phase 4: Generate final report
    return await this.generateFinalReport(activityId);
  }

  private async simulateCoastalBoom(activityId: string, adminId: string) {
    const coastalUpdates = [
      { tileId: 1, currentPrice: 150.00, currentPopulation: 700 },
      { tileId: 5, currentPrice: 145.00, currentPopulation: 650 },
      // ... more coastal tiles
    ];

    await this.bulkUpdateTileStates(activityId, coastalUpdates, 
      "Coastal Economic Boom - Tourism and Tech Growth", adminId);
  }
}
```

## Template and Facility Configuration Integration

### Template-Facility Relationship

Each map template can have associated facility build configurations that define the rules for facility placement and upgrades during activities. This relationship enables:

**Template-Level Configuration:**
- Base tile properties (price, population, transportation costs)
- Facility build rules and requirements
- Upgrade systems and progression paths

**Activity-Level Implementation:**
- Runtime tile states based on template defaults
- Facility placement validation using template configurations
- Upgrade cost calculations for player actions

### Configuration Lifecycle

1. **Template Creation**: Create map template with base tile configuration
2. **Facility Configuration**: Initialize or customize facility build rules
3. **Activity Creation**: Activities inherit facility rules from template
4. **Runtime Validation**: Facility placement and upgrades validated against template configs
5. **Template Updates**: Changes affect future activities, not existing ones

### Best Practices for Template-Facility Management

**Template Setup:**
```bash
# 1. Create template
curl -X POST "/api/admin/map-templates" -d '{"name": "Industrial Template"}'

# 2. Generate tiles if needed
curl -X POST "/api/admin/map-templates/generate" -d '{...tile generation params...}'

# 3. Initialize facility configurations
curl -X POST "/api/admin/map-templates/1/tile-facility-configs/initialize-defaults"

# 4. Customize facility rules for specific gameplay
curl -X PUT "/api/admin/map-templates/1/tile-facility-configs/land-type/COASTAL/bulk-update" \
  -d '{"requiredGoldMultiplier": 1.5}'
```

**Template Validation:**
```bash
# Review template configuration completeness
curl -X GET "/api/admin/map-templates/1/tile-facility-configs/statistics"

# Verify facility upgrade paths
curl -X GET "/api/admin/map-templates/1/tile-facility-configs/upgrade-calculator/PLAIN/FACTORY?targetLevel=5"
```

This enhanced documentation provides comprehensive coverage of the integrated tile and facility configuration system, enabling effective management of template-based simulation environments with detailed facility placement and upgrade mechanics. 