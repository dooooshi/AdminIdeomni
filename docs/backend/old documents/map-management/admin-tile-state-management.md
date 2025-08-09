# Admin Activity Tile State Management

## Overview

The Admin Activity Tile State Management system provides comprehensive tools for administrators to configure, monitor, and manage tile states within business simulation activities. This system allows fine-grained control over tile properties such as pricing, population, and economic conditions.

## Table of Contents

- [Architecture](#architecture)
- [Permissions](#permissions)
- [API Endpoints](#api-endpoints)
- [Configuration Management](#configuration-management)
- [Template System](#template-system)
- [Analytics & Reporting](#analytics--reporting)
- [Bulk Operations](#bulk-operations)
- [Best Practices](#best-practices)

## Architecture

### Core Components

1. **AdminTileStateController** - REST API endpoints for admin operations
2. **AdminTileStateService** - Business logic for admin tile management
3. **ActivityTileStateService** - Core tile state management service
4. **Template System** - Predefined configurations for different scenarios

### Data Flow

```
Admin Request → Controller → Admin Service → Core Service → Repository → Database
                    ↓
              Permission Check → RBAC System
                    ↓
              Operation Logging → Audit Trail
```

## Permissions

### Required Permissions

| Permission | Description | Required For |
|------------|-------------|--------------|
| `TILE_STATE_READ` | View tile state information | All read operations |
| `TILE_STATE_UPDATE` | Edit individual tile states | Single tile updates |
| `TILE_STATE_BULK_UPDATE` | Update multiple tile states | Bulk operations |
| `TILE_STATE_RESET` | Reset tiles to defaults | Reset operations |
| `TILE_STATE_ANALYTICS` | View analytics and reports | Analytics endpoints |
| `TILE_STATE_DASHBOARD` | Access management dashboard | Dashboard access |
| `TILE_STATE_TEMPLATE_CREATE` | Create configuration templates | Template creation |
| `TILE_STATE_TEMPLATE_READ` | View templates | Template listing |
| `TILE_STATE_TEMPLATE_UPDATE` | Edit templates | Template modifications |
| `TILE_STATE_TEMPLATE_DELETE` | Delete templates | Template removal |
| `TILE_STATE_TEMPLATE_APPLY` | Apply templates to activities | Template application |

### Role Assignments

- **Super Admin**: All tile state permissions
- **Activity Manager**: All basic tile state permissions + template application
- **Other Roles**: Limited to read-only access

## API Endpoints

### Base URL
```
/api/admin/tile-states
```

### Individual Tile Configuration

#### Update Tile State
```http
PUT /admin/tile-states/configure
```

**Request Body:**
```json
{
  "activityId": "clx1a2b3c4d5e6f7g8h9i0j1",
  "tileId": 1,
  "currentPrice": 125.50,
  "currentPopulation": 1500,
  "changeReason": "Admin adjusted for Q3 simulation scenario"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "activityId": "clx1a2b3c4d5e6f7g8h9i0j1",
    "tileId": 1,
    "currentPrice": 125.50,
    "currentPopulation": 1500,
    "lastUpdated": "2025-07-20T10:30:00Z",
    "updatedBy": "admin123",
    "changeReason": "Admin adjusted for Q3 simulation scenario"
  },
  "message": "Tile state configured successfully"
}
```

### Bulk Operations

#### Bulk Update Tile States
```http
PUT /admin/tile-states/bulk-configure
```

**Request Body:**
```json
{
  "activityId": "clx1a2b3c4d5e6f7g8h9i0j1",
  "configurations": [
    {
      "tileId": 1,
      "currentPrice": 125.50,
      "currentPopulation": 1500,
      "changeReason": "Market adjustment"
    },
    {
      "tileId": 2,
      "currentPrice": 110.00,
      "currentPopulation": 1200,
      "changeReason": "Population adjustment"
    }
  ],
  "globalReason": "Bulk adjustment for market simulation event"
}
```

**Response:**
```json
{
  "success": 2,
  "failed": 0,
  "details": [
    { "tileId": 1, "success": true },
    { "tileId": 2, "success": true }
  ],
  "message": "Bulk configuration completed: 2 updated, 0 failed"
}
```

#### Reset Activity Tile States
```http
POST /admin/tile-states/{activityId}/reset
```

**Request Body:**
```json
{
  "reason": "Admin reset for new simulation scenario"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "updatedCount": 105
  },
  "message": "Reset 105 tile states to template defaults"
}
```

### Search and Filtering

#### Advanced Tile State Search
```http
GET /admin/tile-states/search
```

**Query Parameters:**
- `activityId` (optional): Filter by activity ID
- `minCurrentPrice` (optional): Minimum current price
- `maxCurrentPrice` (optional): Maximum current price
- `minCurrentPopulation` (optional): Minimum current population
- `maxCurrentPopulation` (optional): Maximum current population
- `landType` (optional): Filter by land type (MARINE, COASTAL, PLAIN)
- `updatedBy` (optional): Filter by admin who updated
- `reasonSearch` (optional): Search in change reasons
- `updatedAfter` (optional): Updated after date
- `updatedBefore` (optional): Updated before date
- `sortBy` (optional): Sort field (lastUpdated, currentPrice, currentPopulation, tileId)
- `sortOrder` (optional): Sort order (asc, desc)
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 20, max: 100)

**Example Request:**
```http
GET /admin/tile-states/search?activityId=clx1a2b3c4d5e6f7g8h9i0j1&minCurrentPrice=100&maxCurrentPrice=200&page=1&pageSize=20
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "activityId": "clx1a2b3c4d5e6f7g8h9i0j1",
      "tileId": 1,
      "previousPrice": 100.00,
      "newPrice": 125.00,
      "previousPopulation": 500,
      "newPopulation": 600,
      "updatedBy": "admin123",
      "changeReason": "Market adjustment for Q3 simulation",
      "changedAt": "2025-07-20T10:30:00Z",
      "tile": {
        "id": 1,
        "axialQ": 0,
        "axialR": 0,
        "landType": "COASTAL",
        "templateId": 1
      }
    }
  ],
  "total": 50,
  "page": 1,
  "pageSize": 20,
  "totalPages": 3,
  "hasNext": true,
  "hasPrevious": false
}
```

### Analytics and Reporting

#### Activity Tile State Analytics
```http
GET /admin/tile-states/{activityId}/analytics
```

**Query Parameters:**
- `startDate` (optional): Start date for analytics
- `endDate` (optional): End date for analytics  
- `landType` (optional): Filter by land type
- `groupBy` (optional): Time grouping (hour, day, week, month)

**Response:**
```json
{
  "activitySummary": {
    "activityId": "clx1a2b3c4d5e6f7g8h9i0j1",
    "activityName": "Q3 Business Simulation",
    "totalTiles": 105,
    "averagePrice": 125.50,
    "averagePopulation": 850,
    "totalValue": 13177.50
  },
  "landTypeBreakdown": {
    "MARINE": {
      "count": 60,
      "averagePrice": 75.00,
      "averagePopulation": 100,
      "totalValue": 4500.00,
      "priceRange": { "min": 50.00, "max": 100.00 },
      "populationRange": { "min": 0, "max": 200 }
    },
    "COASTAL": {
      "count": 30,
      "averagePrice": 150.00,
      "averagePopulation": 1200,
      "totalValue": 4500.00,
      "priceRange": { "min": 100.00, "max": 200.00 },
      "populationRange": { "min": 800, "max": 1600 }
    },
    "PLAIN": {
      "count": 15,
      "averagePrice": 200.00,
      "averagePopulation": 1800,
      "totalValue": 3000.00,
      "priceRange": { "min": 150.00, "max": 250.00 },
      "populationRange": { "min": 1200, "max": 2400 }
    }
  },
  "topTiles": [
    {
      "tileId": 15,
      "currentPrice": 250.00,
      "currentPopulation": 2400,
      "totalValue": 490.00,
      "landType": "PLAIN",
      "coordinates": { "q": 0, "r": 0 }
    }
  ],
  "recentChanges": {
    "last24Hours": 15,
    "lastWeek": 45,
    "lastMonth": 120,
    "mostActiveAdmin": "admin123"
  }
}
```

### Template Management

#### Create Tile State Template
```http
POST /admin/tile-states/templates
```

**Request Body:**
```json
{
  "templateName": "Economic Boom Scenario",
  "description": "Preset configuration for economic growth simulation",
  "configurationByLandType": {
    "MARINE": {
      "priceMultiplier": 1.2,
      "populationMultiplier": 1.0
    },
    "COASTAL": {
      "priceMultiplier": 1.5,
      "populationMultiplier": 1.3
    },
    "PLAIN": {
      "priceMultiplier": 1.8,
      "populationMultiplier": 1.6
    }
  },
  "isActive": true
}
```

#### Apply Template to Activity
```http
POST /admin/tile-states/templates/apply
```

**Request Body:**
```json
{
  "templateId": 1,
  "activityId": "clx1a2b3c4d5e6f7g8h9i0j1",
  "reason": "Applied Economic Boom template for Q3 simulation",
  "overwriteExisting": false
}
```

#### List Templates
```http
GET /admin/tile-states/templates
```

**Query Parameters:**
- `page` (optional): Page number
- `pageSize` (optional): Items per page
- `isActive` (optional): Filter by active status
- `createdBy` (optional): Filter by creator

### Dashboard

#### Management Dashboard
```http
GET /admin/tile-states/dashboard
```

**Response:**
```json
{
  "overview": {
    "totalActivities": 15,
    "totalTileStates": 1575,
    "activeConfigurations": 8,
    "recentChanges": 45
  },
  "topActivities": [
    {
      "activityId": "activity_123",
      "activityName": "Q3 Business Simulation",
      "totalValue": 125000,
      "changeCount": 25,
      "lastModified": "2025-07-20T10:30:00Z"
    }
  ],
  "templates": {
    "totalTemplates": 5,
    "activeTemplates": 4,
    "mostUsedTemplate": "Economic Boom Scenario"
  },
  "recentActivity": [
    {
      "adminId": "admin123",
      "adminName": "John Admin",
      "action": "Bulk Updated Tile States",
      "timestamp": "2025-07-20T10:30:00Z",
      "activityId": "activity_123",
      "tilesAffected": 15
    }
  ]
}
```

## Configuration Management

### Tile State Properties

Each tile state contains the following configurable properties:

- **currentPrice**: Current market price for the tile
- **currentPopulation**: Current population on the tile
- **changeReason**: Reason for the last change (audit trail)
- **updatedBy**: Admin who made the last update
- **lastUpdated**: Timestamp of last update

### Default Values

When tiles are reset to defaults, they revert to:
- Initial price from the map template
- Initial population from the map template
- Change reason: "Reset to template defaults"

## Template System

### Template Structure

Templates define multipliers for each land type:

```json
{
  "MARINE": {
    "priceMultiplier": 1.2,
    "populationMultiplier": 1.0
  },
  "COASTAL": {
    "priceMultiplier": 1.5,
    "populationMultiplier": 1.3
  },
  "PLAIN": {
    "priceMultiplier": 1.8,
    "populationMultiplier": 1.6
  }
}
```

### Predefined Templates

1. **Economic Boom Scenario**
   - Increases prices and population across all land types
   - Focus on growth simulation

2. **Market Recession**
   - Decreases prices and population
   - Economic downturn simulation

### Template Application

When applying a template:
1. Current tile values are multiplied by template multipliers
2. Original values are preserved for audit
3. Change reason indicates template application
4. Option to overwrite existing customizations

## Bulk Operations

### Supported Operations

1. **Bulk Update**: Update multiple tiles with different values
2. **Bulk Reset**: Reset all tiles in an activity to defaults
3. **Template Application**: Apply predefined configurations

### Performance Considerations

- Bulk operations are processed sequentially for data integrity
- Large operations (>100 tiles) may take several seconds
- Failed operations are tracked individually
- Audit logs are created for each successful update

### Error Handling

```json
{
  "success": 85,
  "failed": 15,
  "details": [
    {
      "tileId": 1,
      "success": true
    },
    {
      "tileId": 2,
      "success": false,
      "error": "Tile not found in activity"
    }
  ]
}
```

## Best Practices

### Security

1. **Permission Verification**: All operations require appropriate permissions
2. **Audit Logging**: Every change is logged with admin ID and reason
3. **Input Validation**: All inputs are validated for type and range
4. **Rate Limiting**: Bulk operations may be rate-limited

### Performance

1. **Pagination**: Use appropriate page sizes for large datasets
2. **Filtering**: Apply filters to reduce data transfer
3. **Caching**: Analytics data may be cached for performance
4. **Batch Operations**: Use bulk endpoints for multiple updates

### Data Management

1. **Backup Before Bulk Changes**: Always backup before major modifications
2. **Test Templates**: Test templates on development activities first
3. **Document Reasons**: Provide clear reasons for all changes
4. **Monitor Analytics**: Use analytics to verify changes are as expected

### Troubleshooting

#### Common Issues

1. **Permission Denied**: Verify admin has required permissions
2. **Tile Not Found**: Ensure tile belongs to the specified activity
3. **Invalid Values**: Check value ranges and data types
4. **Template Conflicts**: Verify template is compatible with activity

#### Debug Information

All operations include detailed error messages and operation IDs for tracking issues.

## Integration Examples

### Frontend Integration

```typescript
// Update single tile
const updateTile = async (config: TileConfig) => {
  const response = await fetch('/api/admin/tile-states/configure', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(config)
  });
  return response.json();
};

// Bulk update
const bulkUpdate = async (bulkConfig: BulkTileConfig) => {
  const response = await fetch('/api/admin/tile-states/bulk-configure', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(bulkConfig)
  });
  return response.json();
};
```

### Monitoring and Alerts

```typescript
// Monitor tile state changes
const monitorChanges = async (activityId: string) => {
  const analytics = await fetch(`/api/admin/tile-states/${activityId}/analytics`);
  const data = await analytics.json();
  
  // Alert on unusual changes
  if (data.recentChanges.last24Hours > 50) {
    console.warn('High number of tile changes detected');
  }
};
```

## Conclusion

The Admin Activity Tile State Management system provides comprehensive tools for managing simulation environments. With proper permissions, detailed audit trails, and powerful bulk operations, administrators can effectively configure and monitor business simulation activities.

For additional support or feature requests, please refer to the system administration documentation or contact the development team. 