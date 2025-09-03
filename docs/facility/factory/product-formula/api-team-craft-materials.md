# Team Craft Categories and Raw Materials API

## Overview
This document specifies APIs for retrieving available craft categories and raw materials based on team's facility infrastructure. These endpoints support the product formula creation process by providing contextual data based on team's actual capabilities.

## API Endpoints

### 1. Get Available Craft Categories for Team Factories
**GET** `/api/user/team/available-craft-categories`

**Description**: Retrieves craft categories available to the team based on their factory facilities' levels, matching the technology level constraints from the craft category system.

**Authentication**: User JWT authentication required

#### Request Headers
```http
Authorization: Bearer {jwt_token}
Accept-Language: en | zh (optional)
```

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| categoryType | string | No | Filter by craft category type (MECHANICAL_MANUFACTURING, ELECTRONIC_EQUIPMENT, etc.) |
| maxLevel | number | No | Maximum technology level to return (1-4) |
| includeDetails | boolean | No | Include detailed cost information (default: true) |

#### Response (200 OK)

**Note**: The `name` field for craft categories and raw materials returns localized content based on the request's `Accept-Language` or `X-Lang` header:
- For `en`: Returns English names (e.g., "Electronic Equipment Processing - Level 3")
- For `zh` (default): Returns Chinese names (e.g., "电子器械 - 3级")

```json
{
  "success": true,
  "businessCode": 0,
  "message": "Available craft categories retrieved successfully",
  "data": {
    "teamFactories": [
      {
        "id": "facility_123",
        "facilityType": "FACTORY",
        "name": "Main Production Factory",
        "level": 3,
        "tile": {
          "coordinates": {
            "q": 2,
            "r": -1
          }
        },
        "status": "ACTIVE"
      }
    ],
    "availableCrafts": [
      {
        "id": 11,
        "categoryType": "ELECTRONIC_EQUIPMENT",
        "technologyLevel": "LEVEL_3",
        "name": "Electronic Equipment Processing - Level 3",
        "requiredFactoryLevel": 3,
        "fixedWaterCost": 42,
        "fixedPowerCost": 240,
        "fixedGoldCost": 84,
        "variableWaterPercent": 2,
        "variablePowerPercent": 31.2,
        "variableGoldPercent": 6.8,
        "yieldPercentage": 93,
        "availableFrom": [
          {
            "facilityId": "facility_123",
            "facilityName": "Main Production Factory"
          }
        ]
      },
      {
        "id": 8,
        "categoryType": "MECHANICAL_MANUFACTURING",
        "technologyLevel": "LEVEL_2",
        "name": "Mechanical Manufacturing - Level 2",
        "requiredFactoryLevel": 2,
        "fixedWaterCost": 24,
        "fixedPowerCost": 64,
        "fixedGoldCost": 72,
        "variableWaterPercent": 3.6,
        "variablePowerPercent": 6.8,
        "variableGoldPercent": 9.6,
        "yieldPercentage": 93,
        "availableFrom": [
          {
            "facilityId": "facility_123",
            "facilityName": "Main Production Factory"
          }
        ]
      }
    ],
    "summary": {
      "totalFactories": 1,
      "maxFactoryLevel": 3,
      "totalAvailableCrafts": 21,
      "categoryTypes": [
        "MECHANICAL_MANUFACTURING",
        "MATERIALS_PROCESSING",
        "BIOCHEMICAL",
        "ELECTRONIC_EQUIPMENT",
        "ENERGY_UTILIZATION",
        "CUTTING_TEXTILE",
        "FOOD_PROCESSING"
      ]
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/user/team/available-craft-categories"
}
```

### 2. Get Team's Available Raw Materials
**GET** `/api/user/team/available-raw-materials`

**Description**: Retrieves raw materials that can be produced by team's material production facilities (farms, mines, quarries, etc.) or purchased from market

**Authentication**: User JWT authentication required

#### Request Headers
```http
Authorization: Bearer {jwt_token}
Accept-Language: en | zh (optional)
```

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| origin | string | No | Filter by origin (FARM, RANCH, MINE, QUARRY, FOREST, FISHERY, SHOPS) |
| facilityType | string | No | Filter by facility type |
| includeMarket | boolean | No | Include market-available materials (default: true) |
| includeInfrastructure | boolean | No | Include infrastructure connection status (default: true) |

#### Response (200 OK)
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Available raw materials retrieved successfully",
  "data": {
    "productionFacilities": [
      {
        "id": "facility_201",
        "facilityType": "MINE",
        "name": "Iron Mine",
        "level": 2,
        "tile": {
          "coordinates": {
            "q": 3,
            "r": -2
          }
        },
        "status": "ACTIVE",
        "infrastructure": {
          "hasWater": true,
          "hasPower": true,
          "waterProviderId": "facility_water_1",
          "powerProviderId": "facility_power_1"
        },
        "capacity": {
          "totalSpace": 1000,
          "usedSpace": 300,
          "availableSpace": 700
        }
      },
      {
        "id": "facility_202",
        "facilityType": "FARM",
        "name": "Wheat Farm",
        "level": 1,
        "tile": {
          "coordinates": {
            "q": 2,
            "r": 0
          }
        },
        "status": "ACTIVE",
        "infrastructure": {
          "hasWater": true,
          "hasPower": true,
          "waterProviderId": "facility_water_1",
          "powerProviderId": "facility_power_1"
        },
        "capacity": {
          "totalSpace": 800,
          "usedSpace": 400,
          "availableSpace": 400
        }
      }
    ],
    "availableMaterials": [
      {
        "id": 85,
        "materialNumber": 501,
        "name": "Iron Ore",
        "origin": "MINE",
        "waterRequired": 10,
        "powerRequired": 15,
        "totalCost": 24,
        "carbonEmission": 2.5,
        "canProduce": true,
        "productionFacilities": [
          {
            "facilityId": "facility_201",
            "facilityName": "Iron Mine",
            "canProduceNow": true,
            "requiredSpace": 2.5
          }
        ]
      },
      {
        "id": 12,
        "materialNumber": 101,
        "name": "Wheat",
        "origin": "FARM",
        "waterRequired": 5,
        "powerRequired": 3,
        "totalCost": 8,
        "carbonEmission": 0.5,
        "canProduce": true,
        "productionFacilities": [
          {
            "facilityId": "facility_202",
            "facilityName": "Wheat Farm",
            "canProduceNow": true,
            "requiredSpace": 0.5
          }
        ]
      },
      {
        "id": 88,
        "materialNumber": 601,
        "name": "Silicon",
        "origin": "QUARRY",
        "waterRequired": 8,
        "powerRequired": 12,
        "totalCost": 24,
        "carbonEmission": 1.8,
        "canProduce": false,
        "productionFacilities": [],
        "marketAvailable": true,
        "note": "No QUARRY facility - available from market only"
      }
    ],
    "summary": {
      "totalFacilities": 4,
      "activeFacilities": 4,
      "facilityTypes": ["MINE", "FARM", "RANCH", "FOREST"],
      "totalMaterialTypes": 25,
      "selfProducible": 18,
      "marketOnly": 7,
      "infrastructureStatus": {
        "allConnected": true,
        "missingWater": 0,
        "missingPower": 0
      }
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/user/team/available-raw-materials"
}
```

### 3. Get Team Factory Capabilities
**GET** `/api/user/team/factory-capabilities`

**Description**: Retrieves detailed information about team's factory facilities and their production capabilities for formula creation

**Authentication**: User JWT authentication required

#### Response (200 OK)
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Factory capabilities retrieved successfully",
  "data": {
    "factories": [
      {
        "id": "facility_123",
        "facilityType": "FACTORY",
        "name": "Advanced Production Factory",
        "level": 4,
        "tile": {
          "coordinates": {
            "q": 1,
            "r": -1
          }
        },
        "status": "ACTIVE",
        "capabilities": {
          "maxTechnologyLevel": 4,
          "availableCraftCategories": [
            {
              "categoryType": "MECHANICAL_MANUFACTURING",
              "levels": ["LEVEL_1", "LEVEL_2", "LEVEL_3", "LEVEL_4"]
            },
            {
              "categoryType": "ELECTRONIC_EQUIPMENT",
              "levels": ["LEVEL_1", "LEVEL_2", "LEVEL_3", "LEVEL_4"]
            },
            {
              "categoryType": "MATERIALS_PROCESSING",
              "levels": ["LEVEL_1", "LEVEL_2", "LEVEL_3", "LEVEL_4"]
            }
          ],
          "totalAvailableCrafts": 28
        },
        "infrastructure": {
          "hasWater": true,
          "hasPower": true
        },
        "capacity": {
          "totalSpace": 2000,
          "usedSpace": 800,
          "availableSpace": 1200
        }
      },
      {
        "id": "facility_124",
        "facilityType": "FACTORY",
        "name": "Basic Factory",
        "level": 2,
        "tile": {
          "coordinates": {
            "q": 2,
            "r": 1
          }
        },
        "status": "ACTIVE",
        "capabilities": {
          "maxTechnologyLevel": 2,
          "availableCraftCategories": [
            {
              "categoryType": "FOOD_PROCESSING",
              "levels": ["LEVEL_1", "LEVEL_2"]
            },
            {
              "categoryType": "CUTTING_TEXTILE",
              "levels": ["LEVEL_1", "LEVEL_2"]
            }
          ],
          "totalAvailableCrafts": 14
        }
      }
    ],
    "aggregatedCapabilities": {
      "totalFactories": 2,
      "maxFactoryLevel": 4,
      "totalAvailableCrafts": 42,
      "availableCategories": [
        "MECHANICAL_MANUFACTURING",
        "ELECTRONIC_EQUIPMENT",
        "MATERIALS_PROCESSING",
        "FOOD_PROCESSING",
        "CUTTING_TEXTILE"
      ],
      "levelDistribution": {
        "level1": 2,
        "level2": 2,
        "level3": 1,
        "level4": 1
      }
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/user/team/factory-capabilities"
}
```

## Error Responses

### 404 Not Found - No Facilities
```json
{
  "success": false,
  "businessCode": 2001,
  "message": "No production facilities found for team",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/user/team/available-raw-materials"
}
```

### 403 Forbidden - No Team Access
```json
{
  "success": false,
  "businessCode": 1007,
  "message": "User is not a member of any team",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/user/team/available-craft-categories"
}
```

## Implementation Notes

### Service Layer Integration
```typescript
// src/user/team-resources.service.ts
@Injectable()
export class TeamResourcesService {
  constructor(
    private readonly facilityRepository: FacilityRepository,
    private readonly craftCategoryRepository: CraftCategoryRepository,
    private readonly rawMaterialRepository: RawMaterialRepository,
    private readonly teamRepository: TeamRepository,
  ) {}

  async getAvailableCraftCategories(teamId: string, filters?: CraftFilters) {
    // 1. Get team's factory facilities
    const factories = await this.facilityRepository.findTeamFactories(teamId);
    
    // 2. Map factory levels to available craft categories
    const craftCategories = await this.craftCategoryRepository.findByFactoryLevels(
      factories.map(f => ({ type: f.factoryType, level: f.technologyLevel }))
    );
    
    // 3. Apply filters and return formatted response
    return this.formatCraftResponse(craftCategories, factories, filters);
  }

  async getAvailableRawMaterials(teamId: string, filters?: MaterialFilters) {
    // 1. Get team's production facilities
    const facilities = await this.facilityRepository.findTeamProductionFacilities(teamId);
    
    // 2. Get materials produced by these facilities
    const materials = await this.rawMaterialRepository.findByFacilities(
      facilities.map(f => f.id)
    );
    
    // 3. Include market-available materials if requested
    if (filters?.includeMarket) {
      const marketMaterials = await this.rawMaterialRepository.findMarketAvailable();
      materials.push(...marketMaterials);
    }
    
    return this.formatMaterialResponse(materials, facilities, filters);
  }
}
```

### Caching Strategy
- Cache craft categories (TTL: 1 hour) - rarely changes
- Cache raw material list (TTL: 10 minutes) - changes with production
- Cache factory capabilities (TTL: 5 minutes) - changes with upgrades
- Use Redis for distributed caching across instances

### Performance Optimization
1. Use database views for complex joins
2. Implement pagination for large material lists
3. Batch load related data to avoid N+1 queries
4. Index on teamId, facilityType, and technologyLevel