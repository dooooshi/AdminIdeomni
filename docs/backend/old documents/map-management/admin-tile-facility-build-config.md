# Admin Tile Facility Build Configuration API

## Overview

The Tile Facility Build Configuration system provides administrators with comprehensive control over facility placement rules and upgrade systems within map templates. This system defines which facility types can be built on different land types, their build requirements (gold, carbon, areas), and upgrade configurations including progressive pricing and maximum levels.

## Features

### Facility Build Rules Management
- **Land Type Restrictions**: Define which facilities can be built on specific land types
  - MARINE tiles: Only fisheries allowed
  - COASTAL tiles: All facilities except mines
  - PLAIN tiles: All facilities allowed
- **Build Requirements**: Set gold, carbon, and area requirements for each facility-land combination
- **Instance Limits**: Control maximum instances per tile

### Upgrade System Configuration
- **Progressive Upgrade Costs**: Base upgrade costs with configurable multipliers per level
- **Maximum Upgrade Levels**: Set upgrade caps for different facility types (1-10 levels)
- **Cost Calculations**: Automatic upgrade cost calculations with compound multipliers
- **Custom Upgrade Data**: Store additional upgrade configuration metadata

### Bulk Operations
- **Default Generation**: Automatically create realistic configurations for all facility+land combinations
- **Bulk Updates by Land Type**: Apply multipliers or fixed values across land types
- **Statistics and Analytics**: Comprehensive configuration insights

### Integration Features
- **Template-Based**: Configurations are tied to specific map templates
- **RBAC Protected**: Full permission system with read/manage access levels
- **Audit Logging**: Complete operation tracking and change history
- **Soft Delete**: Safe deletion with restore capabilities

## Authentication & Authorization

All endpoints require:
- **Authentication**: Valid admin JWT token (`AdminJwtAuthGuard`)
- **Authorization**: Appropriate RBAC permissions:
  - `TILE_FACILITY_CONFIG_READ` - View configurations and statistics
  - `TILE_FACILITY_CONFIG_MANAGE` - Create, update, delete configurations
- **Audit Logging**: All operations logged via `OperationLogInterceptor`

## API Endpoints

### Base URL
```
/api/admin/map-templates/:templateId/tile-facility-configs
```

---

### 1. Create Facility Build Configuration

Create a new facility build configuration for a specific template, land type, and facility type combination.

**Endpoint:** `POST /api/admin/map-templates/:templateId/tile-facility-configs`

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "landType": "COASTAL",
  "facilityType": "MINE",
  "requiredGold": 80000.50,
  "requiredCarbon": 1500.75,
  "requiredAreas": 2,
  "maxLevel": 4,
  "upgradeGoldCost": 32000.00,
  "upgradeCarbonCost": 600.00,
  "upgradeMultiplier": 1.4,
  "isAllowed": true,
  "maxInstances": 1,
  "upgradeData": {
    "capacityBonusPerLevel": 0.25,
    "efficiencyBonusPerLevel": 0.15
  },
  "buildData": {
    "constructionTime": 24,
    "prerequisites": ["POWER_PLANT", "WATER_PLANT"]
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "clx1a2b3c4d5e6f7g8h9i0j1",
    "templateId": 1,
    "landType": "COASTAL",
    "facilityType": "MINE",
    "requiredGold": 80000.50,
    "requiredCarbon": 1500.75,
    "requiredAreas": 2,
    "maxLevel": 4,
    "upgradeGoldCost": 32000.00,
    "upgradeCarbonCost": 600.00,
    "upgradeMultiplier": 1.4,
    "isAllowed": true,
    "maxInstances": 1,
    "upgradeData": {
      "capacityBonusPerLevel": 0.25,
      "efficiencyBonusPerLevel": 0.15
    },
    "buildData": {
      "constructionTime": 24,
      "prerequisites": ["POWER_PLANT", "WATER_PLANT"]
    },
    "isActive": true,
    "createdAt": "2025-07-28T01:00:00Z",
    "updatedAt": "2025-07-28T01:00:00Z",
    "deletedAt": null
  },
  "message": "Tile facility build configuration created successfully"
}
```

---

### 2. List All Configurations for Template

Retrieve all facility build configurations for a specific template with optional pagination and filtering.

**Endpoint:** `GET /api/admin/map-templates/:templateId/tile-facility-configs`

**Query Parameters:**
- `landType` (optional): Filter by land type (MARINE, COASTAL, PLAIN)
- `facilityType` (optional): Filter by facility type
- `isAllowed` (optional): Filter by allowed status (true/false)
- `isActive` (optional): Filter by active status (true/false)
- `isUpgradable` (optional): Filter upgradable facilities (maxLevel > 1)
- `sortBy` (optional): Sort field (landType, facilityType, requiredGold, etc.)
- `sortOrder` (optional): Sort direction (asc, desc)
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 20, max: 100)

**Example Request:**
```
GET /api/admin/map-templates/1/tile-facility-configs?landType=COASTAL&isAllowed=true&page=1&pageSize=10
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx1a2b3c4d5e6f7g8h9i0j1",
      "templateId": 1,
      "landType": "COASTAL",
      "facilityType": "MINE",
      "requiredGold": 80000.50,
      "requiredCarbon": 1500.75,
      "requiredAreas": 2,
      "maxLevel": 4,
      "upgradeGoldCost": 32000.00,
      "upgradeCarbonCost": 600.00,
      "upgradeMultiplier": 1.4,
      "isAllowed": true,
      "maxInstances": 1,
      "upgradeData": {
        "capacityBonusPerLevel": 0.25,
        "efficiencyBonusPerLevel": 0.15
      },
      "buildData": {
        "constructionTime": 24,
        "prerequisites": ["POWER_PLANT", "WATER_PLANT"]
      },
      "isActive": true,
      "createdAt": "2025-07-28T01:00:00Z",
      "updatedAt": "2025-07-28T01:00:00Z",
      "deletedAt": null
    }
    // ... more configurations
  ],
  "meta": {
    "total": 48,
    "page": 1,
    "pageSize": 10,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

---

### 3. Get Configurations by Land Type

Retrieve all facility configurations for a specific land type within a template.

**Endpoint:** `GET /api/admin/map-templates/:templateId/tile-facility-configs/by-land-type/:landType`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx1a2b3c4d5e6f7g8h9i0j1",
      "templateId": 1,
      "landType": "COASTAL",
      "facilityType": "FISHERY",
      "requiredGold": 70000.00,
      "requiredCarbon": 1800.00,
      "requiredAreas": 1,
      "maxLevel": 4,
      "upgradeGoldCost": 28000.00,
      "upgradeCarbonCost": 720.00,
      "upgradeMultiplier": 1.4,
      "isAllowed": true,
      "maxInstances": 2,
      "upgradeData": {
        "capacityBonusPerLevel": 0.25,
        "efficiencyBonusPerLevel": 0.15
      },
      "buildData": {
        "constructionTime": 18,
        "prerequisites": []
      },
      "isActive": true,
      "createdAt": "2025-07-28T01:00:00Z",
      "updatedAt": "2025-07-28T01:00:00Z",
      "deletedAt": null
    }
    // ... more coastal facility configurations
  ]
}
```

---

### 4. Get Configurations by Facility Type

Retrieve all land type configurations for a specific facility type within a template.

**Endpoint:** `GET /api/admin/map-templates/:templateId/tile-facility-configs/by-facility-type/:facilityType`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx1a2b3c4d5e6f7g8h9i0j1",
      "templateId": 1,
      "landType": "COASTAL",
      "facilityType": "FISHERY",
      "requiredGold": 70000.00,
      "requiredCarbon": 1800.00,
      "isAllowed": true,
      "maxLevel": 4,
      "createdAt": "2025-07-28T01:00:00Z",
      "updatedAt": "2025-07-28T01:00:00Z"
    },
    {
      "id": "clx2b3c4d5e6f7g8h9i0j1k2",
      "templateId": 1,
      "landType": "MARINE",
      "facilityType": "FISHERY",
      "requiredGold": 56000.00,
      "requiredCarbon": 2160.00,
      "isAllowed": true,
      "maxLevel": 4,
      "createdAt": "2025-07-28T01:00:00Z",
      "updatedAt": "2025-07-28T01:00:00Z"
    }
    // ... PLAIN fishery configuration
  ]
}
```

---

### 5. Get Specific Configuration

Retrieve detailed information about a specific facility build configuration.

**Endpoint:** `GET /api/admin/map-templates/:templateId/tile-facility-configs/:configId`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx1a2b3c4d5e6f7g8h9i0j1",
    "templateId": 1,
    "landType": "COASTAL",
    "facilityType": "MINE",
    "requiredGold": 80000.50,
    "requiredCarbon": 1500.75,
    "requiredAreas": 2,
    "maxLevel": 4,
    "upgradeGoldCost": 32000.00,
    "upgradeCarbonCost": 600.00,
    "upgradeMultiplier": 1.4,
    "isAllowed": true,
    "maxInstances": 1,
    "upgradeData": {
      "capacityBonusPerLevel": 0.25,
      "efficiencyBonusPerLevel": 0.15
    },
    "buildData": {
      "constructionTime": 24,
      "prerequisites": ["POWER_PLANT", "WATER_PLANT"]
    },
    "isActive": true,
    "createdAt": "2025-07-28T01:00:00Z",
    "updatedAt": "2025-07-28T01:00:00Z",
    "deletedAt": null
  }
}
```

---

### 6. Update Configuration

Update an existing facility build configuration.

**Endpoint:** `PUT /api/admin/map-templates/:templateId/tile-facility-configs/:configId`

**Request Body (partial updates allowed):**
```json
{
  "requiredGold": 90000.00,
  "maxLevel": 5,
  "upgradeGoldCost": 36000.00,
  "upgradeMultiplier": 1.5,
  "upgradeData": {
    "capacityBonusPerLevel": 0.30,
    "efficiencyBonusPerLevel": 0.20
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx1a2b3c4d5e6f7g8h9i0j1",
    "templateId": 1,
    "landType": "COASTAL",
    "facilityType": "MINE",
    "requiredGold": 90000.00,
    "requiredCarbon": 1500.75,
    "requiredAreas": 2,
    "maxLevel": 5,
    "upgradeGoldCost": 36000.00,
    "upgradeCarbonCost": 600.00,
    "upgradeMultiplier": 1.5,
    "isAllowed": true,
    "maxInstances": 1,
    "upgradeData": {
      "capacityBonusPerLevel": 0.30,
      "efficiencyBonusPerLevel": 0.20
    },
    "buildData": {
      "constructionTime": 24,
      "prerequisites": ["POWER_PLANT", "WATER_PLANT"]
    },
    "isActive": true,
    "createdAt": "2025-07-28T01:00:00Z",
    "updatedAt": "2025-07-28T01:30:00Z",
    "deletedAt": null
  },
  "message": "Tile facility build configuration updated successfully"
}
```

---

### 7. Calculate Upgrade Costs

Calculate the progressive upgrade costs for a facility from level 1 to a target level.

**Endpoint:** `GET /api/admin/map-templates/:templateId/tile-facility-configs/upgrade-calculator/:landType/:facilityType?targetLevel=3`

**Query Parameters:**
- `targetLevel` (required): Target upgrade level (2-10)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "facilityType": "MINE",
    "landType": "COASTAL",
    "currentLevel": 1,
    "targetLevel": 3,
    "upgradeCosts": [
      {
        "level": 2,
        "goldCost": 36000,
        "carbonCost": 600
      },
      {
        "level": 3,
        "goldCost": 54000,
        "carbonCost": 900
      }
    ],
    "totalCost": {
      "gold": 90000,
      "carbon": 1500
    }
  }
}
```

---

### 8. Bulk Update by Land Type

Apply bulk updates to all configurations of a specific land type using multipliers or fixed values.

**Endpoint:** `PUT /api/admin/map-templates/:templateId/tile-facility-configs/land-type/:landType/bulk-update`

**Request Body:**
```json
{
  // Option 1: Use multipliers
  "requiredGoldMultiplier": 1.25,
  "requiredCarbonMultiplier": 1.10,
  "upgradeGoldCostMultiplier": 1.30,
  "upgradeCarbonCostMultiplier": 1.20,
  
  // Option 2: Use fixed values (overrides multipliers)
  "fixedRequiredGold": 75000.00,
  "fixedRequiredCarbon": 1600.00,
  "fixedMaxLevel": 6,
  
  // Option 3: Set allowed status
  "isAllowed": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "updated": 15,
    "failed": 2,
    "details": [
      {
        "configId": "clx1a2b3c4d5e6f7g8h9i0j1",
        "success": true
      },
      {
        "configId": "clx2b3c4d5e6f7g8h9i0j1k2",
        "success": true
      },
      {
        "configId": "clx3c4d5e6f7g8h9i0j1k2l3",
        "success": false,
        "error": "Configuration validation failed"
      }
      // ... more results
    ],
    "message": "Bulk update completed: 15 updated, 2 failed"
  }
}
```

---

### 9. Initialize Default Configurations

Generate and create default facility build configurations for all land type + facility type combinations.

**Endpoint:** `POST /api/admin/map-templates/:templateId/tile-facility-configs/initialize-defaults`

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "count": 53
  },
  "message": "Default tile facility build configurations initialized successfully"
}
```

**Default Configuration Rules:**
- **MARINE**: Only fisheries allowed, higher carbon costs due to transport
- **COASTAL**: All facilities except mines, balanced costs
- **PLAIN**: All facilities allowed, higher gold costs but lower carbon

**Sample Default Values:**
```json
{
  "MARINE_FISHERY": {
    "requiredGold": 56000,
    "requiredCarbon": 2160,
    "requiredAreas": 2,
    "maxLevel": 4
  },
  "COASTAL_FACTORY": {
    "requiredGold": 150000,
    "requiredCarbon": 3000,
    "requiredAreas": 1,
    "maxLevel": 6
  },
  "PLAIN_MINE": {
    "requiredGold": 120000,
    "requiredCarbon": 1600,
    "requiredAreas": 1,
    "maxLevel": 5
  }
}
```

---

### 10. Get Configuration Statistics

Retrieve comprehensive statistics about facility configurations for a template.

**Endpoint:** `GET /api/admin/map-templates/:templateId/tile-facility-configs/statistics`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalConfigs": 53,
    "allowedConfigs": 47,
    "disallowedConfigs": 6,
    "configsByLandType": {
      "MARINE": 6,
      "COASTAL": 17,
      "PLAIN": 17
    },
    "upgradableConfigs": 41,
    "averageCosts": {
      "requiredGold": 95750.50,
      "requiredCarbon": 1847.25,
      "upgradeGoldCost": 38300.20,
      "upgradeCarbonCost": 738.90
    },
    "costRanges": {
      "goldRange": {
        "min": 30000.00,
        "max": 300000.00
      },
      "carbonRange": {
        "min": 500.00,
        "max": 6000.00
      }
    },
    "maxLevelDistribution": {
      "1": 2,
      "2": 4,
      "3": 8,
      "4": 12,
      "5": 15,
      "6": 10,
      "7": 2,
      "8": 1
    },
    "facilityTypeBreakdown": {
      "MINE": {
        "total": 3,
        "allowed": 2,
        "averageGoldCost": 106666.67
      },
      "FACTORY": {
        "total": 3,
        "allowed": 3,
        "averageGoldCost": 165000.00
      }
      // ... more facility types
    }
  }
}
```

---

### 11. Delete Configuration (Soft Delete)

Soft delete a facility build configuration.

**Endpoint:** `DELETE /api/admin/map-templates/:templateId/tile-facility-configs/:configId`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Tile facility build configuration deleted successfully"
}
```

---

### 12. Restore Configuration

Restore a previously soft-deleted configuration.

**Endpoint:** `PUT /api/admin/map-templates/:templateId/tile-facility-configs/:configId/restore`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx1a2b3c4d5e6f7g8h9i0j1",
    "templateId": 1,
    "landType": "COASTAL",
    "facilityType": "MINE",
    "requiredGold": 80000.50,
    "requiredCarbon": 1500.75,
    "isAllowed": true,
    "isActive": true,
    "createdAt": "2025-07-28T01:00:00Z",
    "updatedAt": "2025-07-28T01:00:00Z",
    "deletedAt": null
  },
  "message": "Configuration restored successfully"
}
```

## Business Workflows

### Complete Template Setup Workflow

```bash
# 1. Create a new map template
curl -X POST "http://localhost:2999/api/admin/map-templates" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Industrial Simulation Template",
    "description": "Template focused on industrial facility development",
    "version": "1.0"
  }'

# 2. Initialize default facility configurations
curl -X POST "http://localhost:2999/api/admin/map-templates/1/tile-facility-configs/initialize-defaults" \
  -H "Authorization: Bearer <admin_token>"

# 3. Customize coastal mining costs (increase difficulty)
curl -X PUT "http://localhost:2999/api/admin/map-templates/1/tile-facility-configs/land-type/COASTAL/bulk-update" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "requiredGoldMultiplier": 1.5,
    "requiredCarbonMultiplier": 2.0
  }'

# 4. Review statistics
curl -X GET "http://localhost:2999/api/admin/map-templates/1/tile-facility-configs/statistics" \
  -H "Authorization: Bearer <admin_token>"
```

### Upgrade Cost Analysis Workflow

```bash
# Calculate upgrade costs for different facility scenarios
curl -X GET "http://localhost:2999/api/admin/map-templates/1/tile-facility-configs/upgrade-calculator/PLAIN/FACTORY?targetLevel=5" \
  -H "Authorization: Bearer <admin_token>"

curl -X GET "http://localhost:2999/api/admin/map-templates/1/tile-facility-configs/upgrade-calculator/COASTAL/FISHERY?targetLevel=3" \
  -H "Authorization: Bearer <admin_token>"

curl -X GET "http://localhost:2999/api/admin/map-templates/1/tile-facility-configs/upgrade-calculator/MARINE/FISHERY?targetLevel=4" \
  -H "Authorization: Bearer <admin_token>"
```

### Scenario Customization Workflow

```bash
# Create "Easy Mode" scenario - reduce all costs by 25%
curl -X PUT "http://localhost:2999/api/admin/map-templates/1/tile-facility-configs/land-type/PLAIN/bulk-update" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{"requiredGoldMultiplier": 0.75, "requiredCarbonMultiplier": 0.75}'

curl -X PUT "http://localhost:2999/api/admin/map-templates/1/tile-facility-configs/land-type/COASTAL/bulk-update" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{"requiredGoldMultiplier": 0.75, "requiredCarbonMultiplier": 0.75}'

# Create "Challenge Mode" scenario - increase upgrade levels
curl -X PUT "http://localhost:2999/api/admin/map-templates/1/tile-facility-configs/land-type/PLAIN/bulk-update" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{"fixedMaxLevel": 8}'
```

## Land Type and Facility Type Reference

### Land Types
- **MARINE**: Ocean/water tiles, limited to water-based facilities
- **COASTAL**: Shore tiles, balanced facility access
- **PLAIN**: Land tiles, full facility access

### Facility Types
**Resource Extraction:**
- `MINE` - Mining operations (not allowed on COASTAL/MARINE)
- `QUARRY` - Stone/material extraction
- `FOREST` - Logging operations
- `FARM` - Agricultural production
- `RANCH` - Livestock operations
- `FISHERY` - Aquaculture (only facility allowed on MARINE)

**Manufacturing:**
- `FACTORY` - Industrial production
- `WAREHOUSE` - Storage facilities

**Commercial:**
- `MALL` - Shopping centers
- `CINEMA` - Movie theaters

**Infrastructure:**
- `WATER_PLANT` - Water treatment
- `POWER_PLANT` - Power generation
- `BASE_STATION` - Communications

**Services:**
- `FIRE_STATION` - Emergency services
- `SCHOOL` - Educational facilities
- `HOSPITAL` - Healthcare facilities
- `PARK` - Recreational areas

## Error Handling

### Common Error Responses

**400 Validation Error:**
```json
{
  "success": false,
  "businessCode": 3001,
  "message": "Validation failed",
  "data": {
    "errors": [
      {
        "field": "requiredGold",
        "message": "must be a positive number"
      },
      {
        "field": "maxLevel",
        "message": "must be between 1 and 10"
      }
    ]
  },
  "timestamp": "2025-07-28T14:30:00.000Z",
  "path": "/api/admin/map-templates/1/tile-facility-configs"
}
```

**404 Configuration Not Found:**
```json
{
  "success": false,
  "businessCode": 4050,
  "message": "Tile facility build configuration not found",
  "timestamp": "2025-07-28T14:30:00.000Z",
  "path": "/api/admin/map-templates/1/tile-facility-configs/invalid-id"
}
```

**409 Configuration Already Exists:**
```json
{
  "success": false,
  "businessCode": 4051,
  "message": "Configuration already exists for this template, land type, and facility type combination",
  "data": {
    "templateId": 1,
    "landType": "COASTAL",
    "facilityType": "MINE"
  },
  "timestamp": "2025-07-28T14:30:00.000Z"
}
```

**400 Invalid Upgrade Level:**
```json
{
  "success": false,
  "businessCode": 4053,
  "message": "Invalid upgrade level - must be within allowed range",
  "data": {
    "requestedLevel": 8,
    "maxAllowedLevel": 5
  },
  "timestamp": "2025-07-28T14:30:00.000Z"
}
```

## Integration Examples

### Frontend Integration

```typescript
// Facility Configuration Manager
class FacilityConfigManager {
  constructor(private apiKey: string) {}

  // Initialize template with default configurations
  async initializeTemplate(templateId: number): Promise<void> {
    const response = await fetch(
      `/api/admin/map-templates/${templateId}/tile-facility-configs/initialize-defaults`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to initialize default configurations');
    }
  }

  // Get facility options for a specific land type
  async getFacilityOptions(templateId: number, landType: string): Promise<FacilityConfig[]> {
    const response = await fetch(
      `/api/admin/map-templates/${templateId}/tile-facility-configs/by-land-type/${landType}`,
      {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      }
    );
    
    const data = await response.json();
    return data.data.filter((config: FacilityConfig) => config.isAllowed);
  }

  // Calculate upgrade costs for UI display
  async calculateUpgradeCosts(
    templateId: number, 
    landType: string, 
    facilityType: string, 
    targetLevel: number
  ): Promise<UpgradeCostCalculation> {
    const response = await fetch(
      `/api/admin/map-templates/${templateId}/tile-facility-configs/upgrade-calculator/${landType}/${facilityType}?targetLevel=${targetLevel}`,
      {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      }
    );
    
    const data = await response.json();
    return data.data;
  }

  // Bulk update scenario configurations
  async applyScenarioSettings(templateId: number, scenario: 'easy' | 'normal' | 'hard'): Promise<void> {
    const multipliers = {
      easy: { gold: 0.75, carbon: 0.75 },
      normal: { gold: 1.0, carbon: 1.0 },
      hard: { gold: 1.5, carbon: 1.5 }
    };

    const landTypes = ['MARINE', 'COASTAL', 'PLAIN'];
    const settings = multipliers[scenario];

    await Promise.all(
      landTypes.map(landType =>
        fetch(
          `/api/admin/map-templates/${templateId}/tile-facility-configs/land-type/${landType}/bulk-update`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              requiredGoldMultiplier: settings.gold,
              requiredCarbonMultiplier: settings.carbon
            })
          }
        )
      )
    );
  }
}
```

### Backend Integration

```typescript
// Activity Service Integration
@Injectable()
export class ActivityFacilityService {
  constructor(
    private readonly configService: AdminTileFacilityBuildConfigService
  ) {}

  // Check if facility can be built on specific tile during activity
  async canBuildFacility(
    activityId: string,
    tileId: string,
    facilityType: FacilityType
  ): Promise<{
    allowed: boolean;
    requirements?: BuildRequirements;
    reason?: string;
  }> {
    // Get activity's map template
    const activity = await this.getActivity(activityId);
    const tile = await this.getTile(tileId);
    
    // Get facility configuration
    const config = await this.configService.getConfigsByTemplateAndTypes(
      activity.mapTemplateId,
      tile.landType,
      facilityType
    );

    if (!config || !config.isAllowed) {
      return {
        allowed: false,
        reason: `${facilityType} cannot be built on ${tile.landType} tiles`
      };
    }

    return {
      allowed: true,
      requirements: {
        gold: config.requiredGold,
        carbon: config.requiredCarbon,
        areas: config.requiredAreas
      }
    };
  }

  // Calculate facility upgrade costs for activity
  async getUpgradeCosts(
    activityId: string,
    facilityId: string,
    targetLevel: number
  ): Promise<UpgradeCostCalculation> {
    const facility = await this.getFacility(facilityId);
    const activity = await this.getActivity(activityId);
    
    return await this.configService.calculateUpgradeCosts(
      activity.mapTemplateId,
      facility.tile.landType,
      facility.facilityType,
      targetLevel
    );
  }
}
```

## Security Considerations

### Permission Model
- **Read Access**: `TILE_FACILITY_CONFIG_READ` required for viewing configurations
- **Manage Access**: `TILE_FACILITY_CONFIG_MANAGE` required for modifications
- **Super Admin Bypass**: Super admins bypass all permission checks
- **Template Isolation**: Configurations are isolated per template

### Data Validation
- **Numerical Constraints**: All costs and multipliers validated for positive values
- **Level Constraints**: Max levels constrained to 1-10 range
- **Enum Validation**: Land types and facility types validated against defined enums
- **Business Logic**: Upgrade requirements validated for logical consistency

### Audit Logging
All operations are logged with:
- Admin ID and timestamp
- Template and configuration IDs
- Operation type (CREATE, UPDATE, DELETE, BULK_UPDATE)
- Before/after values for updates
- Success/failure status with error details

### Rate Limiting
- Bulk operations processed sequentially to prevent database overload
- Large bulk updates may take several seconds
- Consider pagination for very large result sets

## Best Practices

### Configuration Management
1. **Template Initialization**: Always run `initialize-defaults` for new templates
2. **Scenario Testing**: Use statistics endpoint to validate configuration balance
3. **Incremental Updates**: Make small adjustments and test before bulk changes
4. **Documentation**: Use template descriptions to document configuration purposes

### Performance Optimization
1. **Pagination**: Always paginate large configuration lists
2. **Filtering**: Use land type and facility type filters to reduce result sets
3. **Caching**: Consider caching frequently accessed configurations
4. **Bulk Operations**: Use bulk updates for efficiency with large-scale changes

### Development Workflow
1. **Local Testing**: Test configuration changes in development environment
2. **Configuration Versioning**: Consider template versioning for major changes
3. **Rollback Strategy**: Use soft delete and restore for safe configuration management
4. **Monitoring**: Monitor configuration usage through audit logs

This comprehensive documentation provides complete coverage of the Tile Facility Build Configuration system, enabling effective management of facility placement rules and upgrade systems within the admin interface.