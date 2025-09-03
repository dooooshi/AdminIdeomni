# Product Production API Specification

## Overview

This document defines the REST API endpoints for the Product Production module. All endpoints follow RESTful conventions and return standardized JSON responses.

## Base URL

```
http://localhost:2999/api/user/product-production
```

## Authentication

All endpoints require JWT authentication with `UserAuthGuard` for team-based access control. The activityId and teamId are automatically obtained from the authenticated user's context.

## API Endpoints

### 1. Get Available Factories

Retrieve all factories available for production for the current team. This endpoint is designed for users to select which factory to use for production. The activityId is obtained from the authenticated user's context.

#### Endpoint

```http
GET /api/user/product-production/factories
```

#### Query Parameters

None required - all context comes from authenticated user

#### Response

```typescript
interface FactoryListResponse {
  success: boolean;
  data: {
    factories: Factory[];
    totalCount: number;
  };
}

interface Factory {
  id: string;
  name: string;
  level: number;
  location: {
    q: number;
    r: number;
    tileId: string;
    landType: string;
  };
  space: {
    totalSpace: number;
    usedSpace: number;
    availableSpace: number;
    rawMaterialSpace: number;
    productSpace: number;
  };
  infrastructure: {
    hasWaterConnection: boolean;
    waterProvider?: {
      providerId: string;
      providerName: string;
      unitPrice: number;
    };
    hasPowerConnection: boolean;
    powerProvider?: {
      providerId: string;
      providerName: string;
      unitPrice: number;
    };
  };
  productionCapability?: {
    formulaId: number;
    canProduce: boolean;
    maxQuantity: number;
    missingMaterials?: Array<{
      materialId: string;
      materialName: string;
      required: number;
      available: number;
      shortage: number;
    }>;
  };
}
```

#### Example Request

```bash
curl -X GET "https://api.example.com/api/user/product-production/factories" \
  -H "Authorization: Bearer <token>"
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "factories": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Main Factory",
        "level": 3,
        "location": {
          "q": 10,
          "r": 5,
          "tileId": "tile-123",
          "landType": "PLAIN"
        },
        "space": {
          "totalSpace": 1000,
          "usedSpace": 600,
          "availableSpace": 400,
          "rawMaterialSpace": 450,
          "productSpace": 150
        },
        "infrastructure": {
          "hasWaterConnection": true,
          "waterProvider": {
            "providerId": "water-plant-1",
            "providerName": "Central Water Plant",
            "unitPrice": 0.5
          },
          "hasPowerConnection": true,
          "powerProvider": {
            "providerId": "power-plant-1",
            "providerName": "Main Power Station",
            "unitPrice": 0.8
          }
        },
        "productionCapability": {
          "formulaId": "550e8400-e29b-41d4-a716-446655440000",
          "canProduce": true,
          "maxQuantity": 100,
          "missingMaterials": []
        }
      }
    ],
    "totalCount": 1
  }
}
```

### 2. Calculate Production Cost

Calculate the cost of production before confirming. The user selects a factory and formula, then specifies the quantity to produce.

#### Endpoint

```http
POST /api/user/product-production/calculate-cost
```

#### Request Body

```typescript
interface CalculateCostRequest {
  factoryId: string;  // Selected factory ID
  formulaId: number;  // Selected formula ID (from GET /api/user/product-formulas)
  quantity: number;   // Desired production quantity
}
```

#### Response

```typescript
interface CostCalculationResponse {
  success: boolean;
  data: {
    costs: ProductionCosts;
    resources: ResourceRequirements;
    output: ExpectedOutput;
    space: SpaceImpact;
    validation: ValidationStatus;
  };
}

interface ProductionCosts {
  materialCostA: number;
  setupCosts: {
    water: number;
    power: number;
    gold: number;
  };
  variableCosts: {
    waterPercent: number;
    powerPercent: number;
    goldPercent: number;
  };
  finalCosts: {
    waterConsumption: number;
    waterCost: number;
    powerConsumption: number;
    powerCost: number;
    goldCost: number;
    totalCost: number;
  };
  breakdown: Array<{
    component: string;
    amount: number;
    percentage: number;
  }>;
}

interface ResourceRequirements {
  materials: Array<{
    rawMaterialId: string;
    materialName: string;
    quantityRequired: number;
    quantityAvailable: number;
    unitCost: number;
    totalCost: number;
    sufficient: boolean;
  }>;
  water: {
    unitsRequired: number;
    unitPrice: number;
    totalCost: number;
    providerId: string;
    providerName: string;
  };
  power: {
    unitsRequired: number;
    unitPrice: number;
    totalCost: number;
    providerId: string;
    providerName: string;
  };
}

interface ExpectedOutput {
  inputQuantity: number;
  yields: Array<{
    craftCategoryId: string;
    categoryName: string;
    level: number;
    yieldPercentage: number;
  }>;
  combinedYield: number;
  expectedQuantity: number;
  carbonEmission: number;
}

interface SpaceImpact {
  currentUsedSpace: number;
  currentAvailableSpace: number;
  materialSpaceToFree: number;
  productSpaceNeeded: number;
  netSpaceChange: number;
  spaceAfterProduction: number;
  hasEnoughSpace: boolean;
}

interface ValidationStatus {
  canProduce: boolean;
  validations: Array<{
    check: string;
    passed: boolean;
    message?: string;
  }>;
}
```

#### Example Request

```bash
curl -X POST "https://api.example.com/api/user/product-production/calculate-cost" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "factoryId": "550e8400-e29b-41d4-a716-446655440000",
    "formulaId": 123,
    "quantity": 50
  }'
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "costs": {
      "materialCostA": 1000,
      "setupCosts": {
        "water": 62,
        "power": 300,
        "gold": 114
      },
      "variableCosts": {
        "waterPercent": 4,
        "powerPercent": 37.2,
        "goldPercent": 8.8
      },
      "finalCosts": {
        "waterConsumption": 102,
        "waterCost": 51,
        "powerConsumption": 672,
        "powerCost": 537.6,
        "goldCost": 202,
        "totalCost": 790.6
      },
      "breakdown": [
        {"component": "Materials", "amount": 1000, "percentage": 55.8},
        {"component": "Water", "amount": 51, "percentage": 6.4},
        {"component": "Power", "amount": 537.6, "percentage": 68.0},
        {"component": "Labor", "amount": 202, "percentage": 25.5}
      ]
    },
    "resources": {
      "materials": [
        {
          "rawMaterialId": "mat-1",
          "materialName": "Steel",
          "quantityRequired": 100,
          "quantityAvailable": 150,
          "unitCost": 5,
          "totalCost": 500,
          "sufficient": true
        }
      ],
      "water": {
        "unitsRequired": 102,
        "unitPrice": 0.5,
        "totalCost": 51,
        "providerId": "water-1",
        "providerName": "Central Water"
      },
      "power": {
        "unitsRequired": 672,
        "unitPrice": 0.8,
        "totalCost": 537.6,
        "providerId": "power-1",
        "providerName": "Main Power"
      }
    },
    "output": {
      "inputQuantity": 50,
      "yields": [
        {
          "craftCategoryId": "craft-1",
          "categoryName": "Electronic Equipment",
          "level": 4,
          "yieldPercentage": 98
        },
        {
          "craftCategoryId": "craft-2",
          "categoryName": "Energy Utilization",
          "level": 1,
          "yieldPercentage": 82
        }
      ],
      "combinedYield": 80.36,
      "expectedQuantity": 40,
      "carbonEmission": 9.76
    },
    "space": {
      "currentUsedSpace": 600,
      "currentAvailableSpace": 400,
      "materialSpaceToFree": 250,
      "productSpaceNeeded": 200,
      "netSpaceChange": -50,
      "spaceAfterProduction": 550,
      "hasEnoughSpace": true
    },
    "validation": {
      "canProduce": true,
      "validations": [
        {"check": "Factory Active", "passed": true},
        {"check": "Materials Available", "passed": true},
        {"check": "Space Available", "passed": true},
        {"check": "Water Connected", "passed": true},
        {"check": "Power Connected", "passed": true},
        {"check": "Funds Sufficient", "passed": true}
      ]
    }
  }
}
```

### 3. Execute Production

Execute the production after cost confirmation.

#### Endpoint

```http
POST /api/user/product-production/produce
```

#### Request Body

```typescript
interface ProductionRequest {
  factoryId: string;   // Selected factory ID
  formulaId: number;   // Selected formula ID
  quantity: number;    // Production quantity
  costConfirmation: {
    expectedCost: number;    // Total cost from calculate-cost endpoint
    acceptPrice: boolean;    // User confirms the price
  };
}
```

#### Response

```typescript
interface ProductionResponse {
  success: boolean;
  data: {
    productionId: string;
    status: 'SUCCESS' | 'FAILED' | 'PROCESSING';
    result: ProductionResult;
    history: ProductionHistorySummary;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

interface ProductionResult {
  requestedQuantity: number;
  producedQuantity: number;
  actualYield: number;
  materialsConsumed: Array<{
    materialId: string;
    materialName: string;
    quantityConsumed: number;
  }>;
  resourcesConsumed: {
    water: number;
    power: number;
    gold: number;
  };
  totalCost: number;
  carbonEmissionGenerated: number;
  spaceChanges: {
    before: number;
    after: number;
    netChange: number;
  };
}

interface ProductionHistorySummary {
  id: string;
  timestamp: string;
  duration: number;
  factoryName: string;
  formulaName: string;
}
```

#### Example Request

```bash
curl -X POST "https://api.example.com/api/user/product-production/produce" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "factoryId": "550e8400-e29b-41d4-a716-446655440000",
    "formulaId": 456,
    "quantity": 50,
    "costConfirmation": {
      "expectedCost": 790.6,
      "acceptPrice": true
    }
  }'
```

#### Example Success Response

```json
{
  "success": true,
  "data": {
    "productionId": "prod-456",
    "status": "SUCCESS",
    "result": {
      "requestedQuantity": 50,
      "producedQuantity": 40,
      "actualYield": 80.36,
      "materialsConsumed": [
        {
          "materialId": "mat-1",
          "materialName": "Steel",
          "quantityConsumed": 100
        }
      ],
      "resourcesConsumed": {
        "water": 102,
        "power": 672,
        "gold": 202
      },
      "totalCost": 790.6,
      "carbonEmissionGenerated": 9.76,
      "spaceChanges": {
        "before": 600,
        "after": 550,
        "netChange": -50
      }
    },
    "history": {
      "id": "hist-789",
      "timestamp": "2024-01-15T10:30:00Z",
      "duration": 1250,
      "factoryName": "Main Factory",
      "formulaName": "Advanced Circuit Board"
    }
  }
}
```

#### Example Error Response

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_MATERIALS",
    "message": "Insufficient raw materials in factory",
    "details": {
      "missing": [
        {
          "materialId": "mat-1",
          "required": 100,
          "available": 80,
          "shortage": 20
        }
      ]
    }
  }
}
```

### 4. Get Production History

Retrieve production history for the team.

#### Endpoint

```http
GET /api/user/product-production/history
```

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| teamId | string | No | Team ID (admin only) |
| factoryId | string | No | Filter by factory |
| formulaId | number | No | Filter by formula |
| status | string | No | Filter by status (SUCCESS, FAILED, CANCELLED) |
| startDate | string | No | ISO 8601 date |
| endDate | string | No | ISO 8601 date |
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 20, max: 100) |
| sort | string | No | Sort field (createdAt, quantity, cost) |
| order | string | No | Sort order (asc, desc) |

#### Response

```typescript
interface HistoryResponse {
  success: boolean;
  data: {
    history: ProductionHistoryItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    summary: {
      totalProductions: number;
      successfulProductions: number;
      totalQuantityProduced: number;
      totalCost: number;
      totalCarbonEmission: number;
      averageYield: number;
    };
  };
}

interface ProductionHistoryItem {
  id: string;
  productionNumber: number;
  factory: {
    id: string;
    name: string;
    level: number;
  };
  formula: {
    id: string;
    name: string;
    formulaNumber: number;
  };
  quantities: {
    requested: number;
    produced: number;
    yield: number;
  };
  costs: {
    materials: number;
    water: number;
    power: number;
    gold: number;
    total: number;
  };
  resources: {
    waterConsumed: number;
    powerConsumed: number;
  };
  impact: {
    carbonEmission: number;
    spaceChange: number;
  };
  status: string;
  failureReason?: string;
  timestamps: {
    started: string;
    completed: string;
    duration: number;
  };
  initiatedBy: {
    userId: string;
    username: string;
  };
}
```

#### Example Request

```bash
curl -X GET "https://api.example.com/api/user/product-production/history?status=SUCCESS&page=1&limit=10&sort=createdAt&order=desc" \
  -H "Authorization: Bearer <token>"
```


## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_REQUEST` | Request validation failed |
| `FACTORY_NOT_FOUND` | Factory does not exist |
| `FORMULA_NOT_FOUND` | Formula does not exist |
| `INSUFFICIENT_MATERIALS` | Not enough raw materials |
| `INSUFFICIENT_SPACE` | Not enough space for products |
| `NO_INFRASTRUCTURE` | Missing water or power connection |
| `INSUFFICIENT_FUNDS` | Team has insufficient funds |
| `FACTORY_INACTIVE` | Factory is not operational |
| `PRODUCTION_IN_PROGRESS` | Another production is already running |
| `UNAUTHORIZED` | User lacks permission |
| `ACTIVITY_ENDED` | Activity has ended |

## Rate Limiting

| Endpoint | Rate Limit |
|----------|------------|
| Calculate Cost | 60 requests/minute |
| Execute Production | 10 requests/minute |
| Get History | 100 requests/minute |

## API Flow Example

The typical flow for product production:

```typescript
// Step 1: Get available factories
const factories = await fetch('/api/user/product-production/factories', {
  headers: { 'Authorization': 'Bearer ' + token }
});

// Step 2: Get available formulas (from product-formula API)
const formulas = await fetch('/api/user/product-formulas', {
  headers: { 'Authorization': 'Bearer ' + token }
});

// Step 3: Calculate production cost
const costResult = await fetch('/api/user/product-production/calculate-cost', {
  method: 'POST',
  headers: { 
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    factoryId: 'factory-123',
    formulaId: 456,  // Formula ID is a number
    quantity: 50
  })
});

// Step 4: Execute production if cost is acceptable
if (costResult.data.validation.canProduce) {
  const production = await fetch('/api/user/product-production/produce', {
    method: 'POST',
    headers: { 
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      factoryId: 'factory-123',
      formulaId: 456,
      quantity: 50,
      costConfirmation: {
        expectedCost: costResult.data.costs.finalCosts.totalCost,
        acceptPrice: true
      }
    })
  });
}
```

## SDK Examples

### TypeScript/JavaScript

```typescript
import { ProductionAPI } from '@ideomni/production-sdk';

const api = new ProductionAPI({
  baseURL: 'http://localhost:2999',
  token: 'your-jwt-token'
});

// Get factories (no activityId needed - from auth context)
const factories = await api.getFactories();

// Calculate cost
const costResult = await api.calculateCost({
  factoryId: 'factory-123',
  formulaId: 456,  // Number, not string
  quantity: 50
});

// Execute production
if (costResult.data.validation.canProduce) {
  const production = await api.produce({
    factoryId: 'factory-123',
    formulaId: 456,
    quantity: 50,
    costConfirmation: {
      expectedCost: costResult.data.costs.finalCosts.totalCost,
      acceptPrice: true
    }
  });
}

// Get history (no activityId needed)
const history = await api.getHistory({
  status: 'SUCCESS',
  page: 1,
  limit: 20
});
```

### Python

```python
from ideomni_sdk import ProductionAPI

api = ProductionAPI(
    base_url="http://localhost:2999",
    token="your-jwt-token"
)

# Get factories
factories = api.get_factories()

# Calculate cost
cost_result = api.calculate_cost(
    factory_id="factory-123",
    formula_id=456,  # Number, not string
    quantity=50
)

# Execute production
if cost_result["data"]["validation"]["canProduce"]:
    production = api.produce(
        factory_id="factory-123",
        formula_id=456,
        quantity=50,
        cost_confirmation={
            "expectedCost": cost_result["data"]["costs"]["finalCosts"]["totalCost"],
            "acceptPrice": True
        }
    )
```

## Summary

The Product Production API provides:
1. **Factory discovery** with production capability assessment
2. **Cost calculation** with detailed breakdown
3. **Production execution** with atomic transactions
4. **History tracking** with comprehensive filtering
5. **Real-time status** updates