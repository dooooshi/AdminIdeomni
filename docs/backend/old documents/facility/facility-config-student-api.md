# Facility Configuration Student API

## Overview

The Facility Configuration Student API allows students to view available facility configurations for their current activity and map template. This API provides essential information about which facilities can be built on different land types, their costs, upgrade paths, and requirements.

## Base URL

```
Base URL: http://localhost:2999/api/user/facility-configs
```

## Authentication

All endpoints require:
- **Bearer Token**: JWT token in Authorization header
- **User Type**: Student/Worker/Manager (userType 2 or 3)
- **Activity Participation**: Must be enrolled in a business activity

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## API Endpoints

### 1. Get Available Configurations

Retrieve all facility configurations available for building in the current activity.

```http
GET /api/user/facility-configs/available
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "config_marine_fishery_001",
      "landType": "MARINE",
      "facilityType": "FISHERY",
      "requiredGold": 150.0,
      "requiredCarbon": 50.0,
      "requiredAreas": 1,
      "maxLevel": 3,
      "upgradeGoldCost": 100.0,
      "upgradeCarbonCost": 30.0,
      "upgradeMultiplier": 1.5,
      "isAllowed": true,
      "maxInstances": 2,
      "upgradeData": {
        "level1": { "capacity": 100, "efficiency": 80 },
        "level2": { "capacity": 180, "efficiency": 88 },
        "level3": { "capacity": 300, "efficiency": 95 }
      },
      "buildData": {
        "buildTime": "instant",
        "requirements": ["water_access"],
        "benefits": ["food_production", "economic_boost"]
      }
    },
    {
      "id": "config_coastal_farm_001",
      "landType": "COASTAL",
      "facilityType": "FARM",
      "requiredGold": 100.0,
      "requiredCarbon": 30.0,
      "requiredAreas": 2,
      "maxLevel": 3,
      "upgradeGoldCost": 70.0,
      "upgradeCarbonCost": 20.0,
      "upgradeMultiplier": 1.3,
      "isAllowed": true,
      "maxInstances": 2,
      "upgradeData": {
        "level1": { "capacity": 80, "efficiency": 75 },
        "level2": { "capacity": 120, "efficiency": 82 },
        "level3": { "capacity": 180, "efficiency": 90 }
      },
      "buildData": {
        "buildTime": "instant",
        "requirements": ["fertile_soil", "water_access"],
        "benefits": ["food_production", "sustainability"]
      }
    }
  ],
  "count": 26,
  "templateId": 1,
  "templateName": "Business Simulation Template v1.0",
  "message": "Available facility configurations retrieved successfully",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

**Query Parameters (Optional):**
```typescript
interface AvailableConfigsQuery {
  landType?: LandType;          // Filter by land type (MARINE, COASTAL, PLAIN)
  facilityType?: FacilityType;  // Filter by facility type
  category?: FacilityCategory;   // Filter by facility category
}
```

**Example with Filters:**
```http
GET /api/user/facility-configs/available?landType=MARINE&category=RAW_MATERIAL_PRODUCTION
Authorization: Bearer <token>
```

### 2. Get Configurations by Land Type

Retrieve facility configurations filtered by specific land type.

```http
GET /api/user/facility-configs/by-land-type?landType=COASTAL
Authorization: Bearer <token>
```

**Query Parameters:**
- `landType` (required): Land type to filter by (MARINE, COASTAL, PLAIN)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "landType": "COASTAL",
    "configurations": [
      {
        "id": "config_coastal_fishery_001",
        "facilityType": "FISHERY",
        "category": "RAW_MATERIAL_PRODUCTION",
        "requiredGold": 120.0,
        "requiredCarbon": 40.0,
        "requiredAreas": 1,
        "maxLevel": 4,
        "upgradeGoldCost": 80.0,
        "upgradeCarbonCost": 25.0,
        "upgradeMultiplier": 1.4,
        "maxInstances": 3,
        "costByLevel": {
          "level1": { "totalGold": 120.0, "totalCarbon": 40.0 },
          "level2": { "totalGold": 232.0, "totalCarbon": 75.0 },
          "level3": { "totalGold": 384.0, "totalCarbon": 115.0 },
          "level4": { "totalGold": 584.0, "totalCarbon": 165.0 }
        }
      },
      {
        "id": "config_coastal_farm_001",
        "facilityType": "FARM",
        "category": "RAW_MATERIAL_PRODUCTION",
        "requiredGold": 100.0,
        "requiredCarbon": 30.0,
        "requiredAreas": 2,
        "maxLevel": 3,
        "upgradeGoldCost": 70.0,
        "upgradeCarbonCost": 20.0,
        "upgradeMultiplier": 1.3,
        "maxInstances": 2,
        "costByLevel": {
          "level1": { "totalGold": 100.0, "totalCarbon": 30.0 },
          "level2": { "totalGold": 191.0, "totalCarbon": 56.0 },
          "level3": { "totalGold": 309.0, "totalCarbon": 86.0 }
        }
      }
    ],
    "totalConfigurations": 6,
    "summary": {
      "cheapestFacility": {
        "facilityType": "FARM",
        "totalCost": 130.0
      },
      "mostExpensiveFacility": {
        "facilityType": "HOSPITAL",
        "totalCost": 420.0
      },
      "averageCost": {
        "gold": 185.5,
        "carbon": 68.2
      }
    }
  },
  "message": "Configurations by land type retrieved successfully",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### 3. Calculate Upgrade Costs

Calculate costs for upgrading a facility to specific levels.

```http
GET /api/user/facility-configs/upgrade-costs?facilityType=MINE&fromLevel=1&toLevel=3
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
interface UpgradeCostQuery {
  facilityType: FacilityType;  // Type of facility (required)
  fromLevel?: number;          // Starting level (default: 1)
  toLevel: number;             // Target level (required)
  landType?: LandType;         // Land type for accurate config (optional)
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "facilityType": "MINE",
    "landType": "PLAIN",
    "fromLevel": 1,
    "toLevel": 3,
    "baseCosts": {
      "upgradeGoldCost": 150.0,
      "upgradeCarbonCost": 60.0,
      "upgradeMultiplier": 1.6
    },
    "levelCosts": [
      {
        "level": 2,
        "goldCost": 150.0,
        "carbonCost": 60.0,
        "totalCost": 210.0
      },
      {
        "level": 3,
        "goldCost": 240.0,
        "carbonCost": 96.0,
        "totalCost": 336.0
      }
    ],
    "totalUpgradeCost": {
      "gold": 390.0,
      "carbon": 156.0,
      "total": 546.0
    },
    "cumulativeCosts": {
      "level1": { "gold": 200.0, "carbon": 80.0, "total": 280.0 },
      "level2": { "gold": 350.0, "carbon": 140.0, "total": 490.0 },
      "level3": { "gold": 590.0, "carbon": 236.0, "total": 826.0 }
    },
    "estimatedBenefits": {
      "level2": {
        "capacityIncrease": "60%",
        "efficiencyIncrease": "10%",
        "productionBoost": "80%"
      },
      "level3": {
        "capacityIncrease": "156%",
        "efficiencyIncrease": "19%",
        "productionBoost": "220%"
      }
    }
  },
  "message": "Upgrade costs calculated successfully",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### 4. Get Configuration Summary

Retrieve a summary of all available configurations organized by category and land type.

```http
GET /api/user/facility-configs/summary
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "templateId": 1,
    "templateName": "Business Simulation Template v1.0",
    "totalConfigurations": 26,
    "configurationsByLandType": {
      "MARINE": {
        "count": 3,
        "facilities": ["FISHERY", "WATER_PLANT", "BASE_STATION"],
        "categories": ["RAW_MATERIAL_PRODUCTION", "INFRASTRUCTURE"],
        "costRange": {
          "min": { "facility": "FISHERY", "cost": 200.0 },
          "max": { "facility": "BASE_STATION", "cost": 400.0 }
        }
      },
      "COASTAL": {
        "count": 6,
        "facilities": ["FISHERY", "FARM", "FACTORY", "MALL", "WAREHOUSE", "HOSPITAL"],
        "categories": ["RAW_MATERIAL_PRODUCTION", "FUNCTIONAL", "OTHER"],
        "costRange": {
          "min": { "facility": "FARM", "cost": 130.0 },
          "max": { "facility": "HOSPITAL", "cost": 420.0 }
        }
      },
      "PLAIN": {
        "count": 16,
        "facilities": [
          "MINE", "QUARRY", "FOREST", "FARM", "RANCH", "FACTORY",
          "MALL", "WAREHOUSE", "WATER_PLANT", "POWER_PLANT", 
          "BASE_STATION", "FIRE_STATION", "SCHOOL", "HOSPITAL", 
          "PARK", "CINEMA"
        ],
        "categories": ["RAW_MATERIAL_PRODUCTION", "FUNCTIONAL", "INFRASTRUCTURE", "OTHER"],
        "costRange": {
          "min": { "facility": "PARK", "cost": 100.0 },
          "max": { "facility": "POWER_PLANT", "cost": 500.0 }
        }
      }
    },
    "configurationsByCategory": {
      "RAW_MATERIAL_PRODUCTION": {
        "count": 6,
        "facilities": ["MINE", "QUARRY", "FOREST", "FARM", "RANCH", "FISHERY"],
        "averageCost": 145.5,
        "upgradeability": {
          "averageMaxLevel": 3.5,
          "highestLevel": { "facility": "MINE", "maxLevel": 4 }
        }
      },
      "FUNCTIONAL": {
        "count": 3,
        "facilities": ["FACTORY", "MALL", "WAREHOUSE"],
        "averageCost": 215.0,
        "upgradeability": {
          "averageMaxLevel": 2.8,
          "highestLevel": { "facility": "FACTORY", "maxLevel": 4 }
        }
      },
      "INFRASTRUCTURE": {
        "count": 3,
        "facilities": ["WATER_PLANT", "POWER_PLANT", "BASE_STATION"],
        "averageCost": 310.0,
        "upgradeability": {
          "averageMaxLevel": 2.7,
          "highestLevel": { "facility": "POWER_PLANT", "maxLevel": 3 }
        }
      },
      "OTHER": {
        "count": 5,
        "facilities": ["FIRE_STATION", "SCHOOL", "HOSPITAL", "PARK", "CINEMA"],
        "averageCost": 190.0,
        "upgradeability": {
          "averageMaxLevel": 2.2,
          "highestLevel": { "facility": "HOSPITAL", "maxLevel": 3 }
        }
      }
    },
    "economicAnalysis": {
      "cheapestToBuild": {
        "facility": "PARK",
        "landType": "PLAIN",
        "cost": 100.0
      },
      "mostExpensive": {
        "facility": "POWER_PLANT",
        "landType": "PLAIN",
        "cost": 500.0
      },
      "bestValueUpgrades": [
        {
          "facility": "FARM",
          "landType": "PLAIN",
          "upgradeMultiplier": 1.2,
          "reason": "Lowest upgrade cost multiplier"
        },
        {
          "facility": "FOREST",
          "landType": "PLAIN",
          "upgradeMultiplier": 1.3,
          "reason": "Low upgrade costs with high benefit"
        }
      ],
      "recommendations": {
        "beginnerFriendly": ["FARM", "PARK", "FOREST"],
        "economicDrivers": ["MINE", "FACTORY", "MALL"],
        "infrastructure": ["WATER_PLANT", "POWER_PLANT"],
        "specialPurpose": ["HOSPITAL", "SCHOOL", "FIRE_STATION"]
      }
    }
  },
  "message": "Configuration summary retrieved successfully",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

## Data Structures

### Configuration Response Format

```typescript
interface FacilityConfigResponse {
  id: string;                           // Unique configuration ID
  landType: LandType;                   // Compatible land type
  facilityType: FacilityType;           // Type of facility
  category: FacilityCategory;           // Facility category
  
  // Build requirements
  requiredGold: number;                 // Gold cost to build
  requiredCarbon: number;               // Carbon cost to build
  requiredAreas: number;                // Land areas required
  
  // Upgrade configuration
  maxLevel: number;                     // Maximum upgrade level
  upgradeGoldCost: number;              // Base gold cost per upgrade
  upgradeCarbonCost: number;            // Base carbon cost per upgrade
  upgradeMultiplier: number;            // Cost multiplier per level
  
  // Build constraints
  isAllowed: boolean;                   // Whether building is allowed
  maxInstances: number;                 // Max instances per tile
  
  // Extended data
  upgradeData?: any;                    // Upgrade benefits and stats
  buildData?: any;                      // Build requirements and benefits
}
```

### Land Type Compatibility Matrix

```typescript
interface LandTypeCompatibility {
  MARINE: {
    allowedFacilities: ["FISHERY", "WATER_PLANT", "BASE_STATION"];
    characteristics: {
      waterAccess: true;
      transportationCost: "high";
      buildingComplexity: "medium";
    };
  };
  COASTAL: {
    allowedFacilities: [
      "FISHERY", "FARM", "FACTORY", "MALL", 
      "WAREHOUSE", "HOSPITAL"
    ];
    characteristics: {
      waterAccess: true;
      landAccess: true;
      transportationCost: "medium";
      buildingComplexity: "low";
    };
  };
  PLAIN: {
    allowedFacilities: [
      "MINE", "QUARRY", "FOREST", "FARM", "RANCH", 
      "FACTORY", "MALL", "WAREHOUSE", "WATER_PLANT", 
      "POWER_PLANT", "BASE_STATION", "FIRE_STATION", 
      "SCHOOL", "HOSPITAL", "PARK", "CINEMA"
    ];
    characteristics: {
      versatile: true;
      transportationCost: "low";
      buildingComplexity: "low";
    };
  };
}
```

## Usage Examples

### Complete Configuration Discovery Workflow

```bash
#!/bin/bash

# Set authentication token
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

echo "=== Facility Configuration Discovery ==="

# 1. Get overview of all available configurations
echo "1. Getting configuration summary..."
curl -s -X GET "http://localhost:2999/api/user/facility-configs/summary" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.totalConfigurations'

# 2. Explore configurations by land type
for land_type in MARINE COASTAL PLAIN; do
  echo "2. Configurations for $land_type land:"
  curl -s -X GET "http://localhost:2999/api/user/facility-configs/by-land-type?landType=$land_type" \
    -H "Authorization: Bearer $TOKEN" | jq '.data.configurations | length'
done

# 3. Get all available configurations with filters
echo "3. Raw material production facilities:"
curl -s -X GET "http://localhost:2999/api/user/facility-configs/available?category=RAW_MATERIAL_PRODUCTION" \
  -H "Authorization: Bearer $TOKEN" | jq '.data | length'

# 4. Calculate upgrade costs for specific facility
echo "4. Calculating upgrade costs for MINE (Level 1 → 3):"
curl -s -X GET "http://localhost:2999/api/user/facility-configs/upgrade-costs?facilityType=MINE&fromLevel=1&toLevel=3" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.totalUpgradeCost'

# 5. Find facilities for specific land type
echo "5. Finding cheapest facility for COASTAL land:"
curl -s -X GET "http://localhost:2999/api/user/facility-configs/by-land-type?landType=COASTAL" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data.summary.cheapestFacility'

echo "Configuration discovery complete!"
```

### Planning Facility Development

```bash
#!/bin/bash

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

echo "=== Facility Development Planning ==="

# Function to get facility cost breakdown
get_facility_costs() {
  local facility_type=$1
  local max_level=$2
  
  echo "Cost analysis for $facility_type (max level $max_level):"
  
  for level in $(seq 1 $max_level); do
    cost_data=$(curl -s -X GET \
      "http://localhost:2999/api/user/facility-configs/upgrade-costs?facilityType=$facility_type&fromLevel=1&toLevel=$level" \
      -H "Authorization: Bearer $TOKEN")
    
    total_cost=$(echo $cost_data | jq '.data.cumulativeCosts.level'$level'.total')
    echo "  Level $level: $total_cost total cost"
  done
}

# Analyze different facility types
get_facility_costs "FARM" 4
get_facility_costs "MINE" 4
get_facility_costs "FACTORY" 4

# Find best value facilities
echo "Best value facilities for beginners:"
curl -s -X GET "http://localhost:2999/api/user/facility-configs/summary" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data.economicAnalysis.recommendations.beginnerFriendly'

# Economic drivers for advanced players
echo "Economic driver facilities:"
curl -s -X GET "http://localhost:2999/api/user/facility-configs/summary" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data.economicAnalysis.recommendations.economicDrivers'
```

### Land Type Optimization

```bash
#!/bin/bash

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

echo "=== Land Type Optimization Analysis ==="

# Compare facility options across land types
compare_land_types() {
  local facility_type=$1
  
  echo "Comparing $facility_type across land types:"
  
  for land_type in MARINE COASTAL PLAIN; do
    config_data=$(curl -s -X GET \
      "http://localhost:2999/api/user/facility-configs/available?landType=$land_type&facilityType=$facility_type" \
      -H "Authorization: Bearer $TOKEN")
    
    if [ "$(echo $config_data | jq '.data | length')" -gt 0 ]; then
      cost=$(echo $config_data | jq '.data[0].requiredGold + .data[0].requiredCarbon')
      max_level=$(echo $config_data | jq '.data[0].maxLevel')
      max_instances=$(echo $config_data | jq '.data[0].maxInstances')
      
      echo "  $land_type: Cost=$cost, MaxLevel=$max_level, MaxInstances=$max_instances"
    else
      echo "  $land_type: Not available"
    fi
  done
  echo ""
}

# Compare facilities that can be built on multiple land types
compare_land_types "FISHERY"
compare_land_types "FARM"
compare_land_types "FACTORY"
compare_land_types "WAREHOUSE"

# Find land type with most diversity
echo "Land type facility diversity:"
for land_type in MARINE COASTAL PLAIN; do
  count=$(curl -s -X GET \
    "http://localhost:2999/api/user/facility-configs/by-land-type?landType=$land_type" \
    -H "Authorization: Bearer $TOKEN" | jq '.data.totalConfigurations')
  
  echo "$land_type: $count facility types available"
done

# Identify unique facilities per land type
echo "Unique facilities by land type:"
curl -s -X GET "http://localhost:2999/api/user/facility-configs/summary" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data.configurationsByLandType | to_entries[] | {landType: .key, uniqueFacilities: .value.facilities}'
```

## Configuration Categories

### Raw Material Production Facilities
Focus on resource generation and extraction:

| Facility | Land Types | Base Cost | Max Level | Specialization |
|----------|------------|-----------|-----------|----------------|
| MINE | PLAIN | 280 | 4 | High-value mineral extraction |
| QUARRY | PLAIN | 250 | 3 | Construction materials |
| FOREST | PLAIN | 160 | 3 | Sustainable timber |
| FARM | COASTAL, PLAIN | 130-115 | 3-4 | Food production |
| RANCH | PLAIN | 175 | 3 | Livestock products |
| FISHERY | MARINE, COASTAL | 200-160 | 3-4 | Marine resources |

### Functional Facilities
Business and commercial operations:

| Facility | Land Types | Base Cost | Max Level | Specialization |
|----------|------------|-----------|-----------|----------------|
| FACTORY | COASTAL, PLAIN | 340-305 | 3-4 | Manufacturing |
| MALL | COASTAL, PLAIN | 260-235 | 2-3 | Retail operations |
| WAREHOUSE | COASTAL, PLAIN | 230-205 | 2-3 | Storage & logistics |

### Infrastructure Facilities
Essential services and utilities:

| Facility | Land Types | Base Cost | Max Level | Specialization |
|----------|------------|-----------|-----------|----------------|
| WATER_PLANT | MARINE, PLAIN | 280-340 | 2-3 | Water services |
| POWER_PLANT | PLAIN | 500 | 3 | Energy generation |
| BASE_STATION | MARINE, PLAIN | 400-375 | 2-3 | Communications |

### Other Facilities
Community and specialized services:

| Facility | Land Types | Base Cost | Max Level | Specialization |
|----------|------------|-----------|-----------|----------------|
| FIRE_STATION | PLAIN | 270 | 2 | Emergency services |
| SCHOOL | PLAIN | 320 | 2 | Education |
| HOSPITAL | COASTAL, PLAIN | 420-450 | 2-3 | Healthcare |
| PARK | PLAIN | 100 | 2 | Recreation |
| CINEMA | PLAIN | 200 | 2 | Entertainment |

## Economic Considerations

### Cost-Benefit Analysis

#### Low-Cost High-Return Facilities
- **PARK** (100 total cost): Community benefit, low maintenance
- **FARM** (115-130 cost): Essential resource production
- **FOREST** (160 cost): Sustainable resource generation

#### Medium Investment Facilities
- **WAREHOUSE** (205-230 cost): Logistics efficiency
- **RANCH** (175 cost): Diverse product output
- **CINEMA** (200 cost): Entertainment sector growth

#### High Investment Infrastructure
- **POWER_PLANT** (500 cost): Critical infrastructure
- **HOSPITAL** (420-450 cost): Essential services

### Upgrade Strategy Recommendations

#### Priority Upgrade Path
1. **Economic Foundations**: MINE, FARM, FISHERY to level 2-3
2. **Production Scale**: FACTORY, WAREHOUSE to level 2
3. **Infrastructure**: POWER_PLANT, WATER_PLANT to level 2
4. **Community Services**: HOSPITAL, SCHOOL to level 2

#### Cost-Effective Upgrades
- **FARM** (1.2x multiplier): Cheapest upgrade path
- **FOREST** (1.3x multiplier): Low-cost sustainable growth
- **PARK** (1.3x multiplier): Community benefit optimization

#### Advanced Optimization
- **MINE** to level 4: Maximum resource extraction
- **FACTORY** to level 4: Peak manufacturing efficiency
- **FISHERY** to level 4: Specialized marine resource dominance

## Best Practices

### Configuration Planning
1. **Survey Available Options**: Always check summary first
2. **Land Type Analysis**: Understand terrain advantages
3. **Cost Budgeting**: Plan upgrade paths within budget
4. **Strategic Placement**: Consider facility synergies

### Resource Management
1. **Start Small**: Begin with low-cost, high-benefit facilities
2. **Scale Gradually**: Upgrade existing before building new
3. **Diversify Portfolio**: Balance production and services
4. **Plan Infrastructure**: Invest in power and water early

### Economic Optimization
1. **ROI Focus**: Prioritize facilities with best return ratios
2. **Upgrade Timing**: Take advantage of low multipliers
3. **Market Positioning**: Build facilities that complement team strategy
4. **Long-term Vision**: Plan for maximum level facilities in key areas