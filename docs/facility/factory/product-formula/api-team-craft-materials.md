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
        "nameEn": "Electronic Equipment Processing - Level 3",
        "nameZh": "电子器械 - 3级",
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
        "nameEn": "Mechanical Manufacturing - Level 2",
        "nameZh": "机械制造 - 2级",
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

### 2. Get Team's Material Inventory
**GET** `/api/user/team/material-inventory`

**Description**: Retrieves actual raw materials currently stored in team's facilities (warehouses, factories, production facilities). This shows what materials the team has in stock, not what they can produce.

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
| facilityId | string | No | Filter by specific facility |
| minQuantity | number | No | Only show materials with quantity >= this value |
| includeZeroQuantity | boolean | No | Include materials with zero quantity (default: false) |

#### Response (200 OK)
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Material inventory retrieved successfully",
  "data": {
    "materials": [
      {
        "rawMaterialId": 85,
        "materialNumber": 501,
        "nameEn": "Iron Ore",
        "nameZh": "铁矿石",
        "origin": "MINE",
        "unitCost": 24,
        "carbonEmission": 2.5,
        "totalQuantity": 250.5,
        "totalValue": 6012.00,
        "totalSpaceUsed": 125.25,
        "source": "MIXED",
        "locations": [
          {
            "facilityId": "facility_123",
            "facilityName": "Main Warehouse",
            "facilityType": "WAREHOUSE",
            "quantity": 150.5,
            "spaceUsed": 75.25,
            "value": 3612.00,
            "acquisitionSource": "SELF_PRODUCED",
            "lastUpdated": "2024-01-15T08:00:00Z"
          },
          {
            "facilityId": "facility_456",
            "facilityName": "Factory Storage",
            "facilityType": "FACTORY",
            "quantity": 100.0,
            "spaceUsed": 50.0,
            "value": 2400.00,
            "acquisitionSource": "PURCHASED",
            "purchasedFrom": "team_789",
            "lastUpdated": "2024-01-14T15:30:00Z"
          }
        ]
      },
      {
        "rawMaterialId": 12,
        "materialNumber": 101,
        "nameEn": "Wheat",
        "nameZh": "小麦",
        "origin": "FARM",
        "unitCost": 8,
        "carbonEmission": 0.5,
        "totalQuantity": 500.0,
        "totalValue": 4000.00,
        "totalSpaceUsed": 250.0,
        "source": "SELF_PRODUCED",
        "locations": [
          {
            "facilityId": "facility_202",
            "facilityName": "Wheat Farm",
            "facilityType": "FARM",
            "quantity": 300.0,
            "spaceUsed": 150.0,
            "value": 2400.00,
            "acquisitionSource": "SELF_PRODUCED",
            "lastUpdated": "2024-01-15T06:00:00Z"
          },
          {
            "facilityId": "facility_123",
            "facilityName": "Main Warehouse",
            "facilityType": "WAREHOUSE",
            "quantity": 200.0,
            "spaceUsed": 100.0,
            "value": 1600.00,
            "acquisitionSource": "SELF_PRODUCED",
            "lastUpdated": "2024-01-14T12:00:00Z"
          }
        ]
      },
      {
        "rawMaterialId": 88,
        "materialNumber": 601,
        "nameEn": "Silicon",
        "nameZh": "硅",
        "origin": "QUARRY",
        "unitCost": 24,
        "carbonEmission": 1.8,
        "totalQuantity": 75.5,
        "totalValue": 1812.00,
        "totalSpaceUsed": 37.75,
        "source": "PURCHASED",
        "locations": [
          {
            "facilityId": "facility_456",
            "facilityName": "Factory Storage",
            "facilityType": "FACTORY",
            "quantity": 75.5,
            "spaceUsed": 37.75,
            "value": 1812.00,
            "acquisitionSource": "MARKET_PURCHASE",
            "lastUpdated": "2024-01-13T10:00:00Z"
          }
        ]
      }
    ],
    "summary": {
      "totalMaterialTypes": 25,
      "materialsInStock": 18,
      "materialsOutOfStock": 7,
      "totalInventoryValue": 11824.00,
      "totalSpaceUsed": 413.0,
      "storageLocations": [
        {
          "facilityId": "facility_123",
          "facilityName": "Main Warehouse",
          "facilityType": "WAREHOUSE",
          "totalSpace": 2000,
          "usedSpace": 413.0,
          "availableSpace": 1587.0,
          "materialTypes": 12
        },
        {
          "facilityId": "facility_456",
          "facilityName": "Factory Storage",
          "facilityType": "FACTORY",
          "totalSpace": 1000,
          "usedSpace": 237.75,
          "availableSpace": 762.25,
          "materialTypes": 8
        }
      ],
      "sourceBreakdown": {
        "selfProduced": 8500.00,
        "purchasedFromTeams": 2400.00,
        "marketPurchase": 924.00
      }
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/user/team/material-inventory"
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

### 4. Check Formula Production Feasibility
**POST** `/api/user/team/product-formulas/check-feasibility`

**Description**: Checks if the team has sufficient materials in inventory to produce a specific quantity using a formula

**Authentication**: User JWT authentication required

#### Request Body
```json
{
  "formulaId": 1,
  "quantity": 100
}
```

#### Response (200 OK) - Feasible
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Production is feasible",
  "data": {
    "feasible": true,
    "quantity": 100,
    "formulaId": 1,
    "materialRequirements": [
      {
        "rawMaterialId": 85,
        "nameEn": "Iron Ore",
        "nameZh": "铁矿石",
        "requiredQuantity": 500.0,
        "availableQuantity": 250.5,
        "sufficient": false,
        "shortage": 249.5,
        "locations": [
          {
            "facilityId": "facility_123",
            "facilityName": "Main Warehouse",
            "availableQuantity": 150.5
          },
          {
            "facilityId": "facility_456",
            "facilityName": "Factory Storage",
            "availableQuantity": 100.0
          }
        ]
      },
      {
        "rawMaterialId": 88,
        "nameEn": "Silicon",
        "nameZh": "硅",
        "requiredQuantity": 350.0,
        "availableQuantity": 75.5,
        "sufficient": false,
        "shortage": 274.5
      }
    ],
    "maxProducibleQuantity": 21,
    "missingMaterials": [
      {
        "rawMaterialId": 85,
        "shortage": 249.5,
        "estimatedCost": 5988.00
      },
      {
        "rawMaterialId": 88,
        "shortage": 274.5,
        "estimatedCost": 6588.00
      }
    ],
    "totalShortageValue": 12576.00
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/user/team/product-formulas/check-feasibility"
}
```

### 5. Transfer Materials Between Facilities
**POST** `/api/user/team/material-transfer`

**Description**: Transfer raw materials between team's facilities (warehouses, factories, production facilities)

**Authentication**: User JWT authentication required

#### Request Body
```json
{
  "fromFacilityId": "facility_123",
  "toFacilityId": "facility_456",
  "transfers": [
    {
      "rawMaterialId": 85,
      "quantity": 50.0
    },
    {
      "rawMaterialId": 88,
      "quantity": 25.5
    }
  ],
  "reason": "Preparing materials for production"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Materials transferred successfully",
  "data": {
    "transferId": "transfer_abc123",
    "fromFacility": {
      "id": "facility_123",
      "name": "Main Warehouse",
      "availableSpaceBefore": 1587.0,
      "availableSpaceAfter": 1624.75
    },
    "toFacility": {
      "id": "facility_456",
      "name": "Factory Storage",
      "availableSpaceBefore": 762.25,
      "availableSpaceAfter": 724.50
    },
    "transferredMaterials": [
      {
        "rawMaterialId": 85,
        "nameEn": "Iron Ore",
        "quantity": 50.0,
        "spaceReleased": 25.0,
        "spaceOccupied": 25.0,
        "value": 1200.00
      },
      {
        "rawMaterialId": 88,
        "nameEn": "Silicon",
        "quantity": 25.5,
        "spaceReleased": 12.75,
        "spaceOccupied": 12.75,
        "value": 612.00
      }
    ],
    "totalValue": 1812.00,
    "totalSpaceTransferred": 37.75,
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/user/team/material-transfer"
}
```

#### Error Response (400) - Insufficient Materials
```json
{
  "success": false,
  "businessCode": 3001,
  "message": "Insufficient materials in source facility",
  "errors": [
    {
      "rawMaterialId": 85,
      "requested": 50.0,
      "available": 30.0
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/user/team/material-transfer"
}
```

#### Error Response (400) - Insufficient Space
```json
{
  "success": false,
  "businessCode": 3002,
  "message": "Insufficient space in destination facility",
  "data": {
    "requiredSpace": 37.75,
    "availableSpace": 20.0,
    "shortage": 17.75
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/user/team/material-transfer"
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
    private readonly facilityInventoryRepository: FacilitySpaceInventoryRepository,
    private readonly rawMaterialRepository: RawMaterialRepository,
    private readonly teamRepository: TeamRepository,
    private readonly prisma: PrismaService,
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

  async getMaterialInventory(teamId: string, filters?: InventoryFilters) {
    // 1. Get all team facilities with storage capability
    const facilities = await this.facilityRepository.findTeamStorageFacilities(teamId);
    
    // 2. Get material inventory from all facilities
    const inventoryItems = await this.facilityInventoryRepository.findByFacilities(
      facilities.map(f => f.id),
      filters
    );
    
    // 3. Aggregate materials across locations
    const aggregatedMaterials = this.aggregateMaterialsByType(inventoryItems);
    
    // 4. Calculate summary statistics
    return this.formatInventoryResponse(aggregatedMaterials, facilities, filters);
  }

  async checkProductionFeasibility(
    teamId: string, 
    formulaId: number, 
    quantity: number
  ): Promise<FeasibilityResult> {
    // 1. Get formula requirements
    const formula = await this.productFormulaRepository.findById(formulaId);
    
    // 2. Get team's current material inventory
    const inventory = await this.getMaterialInventory(teamId);
    
    // 3. Check each material requirement against inventory
    const requirements = formula.materials.map(mat => {
      const available = inventory.materials.find(m => m.rawMaterialId === mat.rawMaterialId);
      const requiredQty = mat.quantity * quantity;
      const availableQty = available?.totalQuantity || 0;
      
      return {
        rawMaterialId: mat.rawMaterialId,
        requiredQuantity: requiredQty,
        availableQuantity: availableQty,
        sufficient: availableQty >= requiredQty,
        shortage: Math.max(0, requiredQty - availableQty)
      };
    });
    
    // 4. Calculate max producible quantity
    const maxQuantity = this.calculateMaxProducibleQuantity(formula, inventory);
    
    return {
      feasible: requirements.every(r => r.sufficient),
      materialRequirements: requirements,
      maxProducibleQuantity: maxQuantity
    };
  }

  async transferMaterials(
    teamId: string,
    fromFacilityId: string,
    toFacilityId: string,
    transfers: MaterialTransfer[]
  ): Promise<TransferResult> {
    return this.prisma.executeTransaction(async (tx) => {
      // 1. Verify facilities belong to team
      await this.verifyFacilityOwnership(teamId, [fromFacilityId, toFacilityId], tx);
      
      // 2. Check source facility has materials
      await this.verifyMaterialAvailability(fromFacilityId, transfers, tx);
      
      // 3. Check destination facility has space
      await this.verifySpaceAvailability(toFacilityId, transfers, tx);
      
      // 4. Execute transfers
      for (const transfer of transfers) {
        // Remove from source
        await this.facilityInventoryRepository.decrementQuantity(
          fromFacilityId,
          transfer.rawMaterialId,
          transfer.quantity,
          tx
        );
        
        // Add to destination
        await this.facilityInventoryRepository.incrementQuantity(
          toFacilityId,
          transfer.rawMaterialId,
          transfer.quantity,
          tx
        );
      }
      
      // 5. Return transfer result
      return this.formatTransferResult(transfers, fromFacilityId, toFacilityId);
    });
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