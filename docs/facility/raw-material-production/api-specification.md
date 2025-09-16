# Raw Material Production API Specification

## Overview
This document defines the RESTful API endpoints for the raw material production system for Students. All endpoints follow the standard response format and require Student authentication.

**Important Update (2025-09-06)**: 
- When producing the same type of raw material multiple times, the system now **combines them into a single inventory item** instead of creating separate entries
- Space usage is calculated incrementally - only the additional space needed is consumed
- Unit costs are calculated as weighted averages when combining materials
- Production history is maintained in the inventory item's metadata

**Language Support**:
- API returns content in a single language based on request headers
- Language detection: `Accept-Language` header, `?lang=` query param, or `x-lang` header
- Supported languages: `en` (English), `zh` (Chinese)
- Default: `zh` (Chinese)

**Important Architecture Note**: 
- Resource consumption (water/power) is handled by an **internal service layer**
- When production starts, the system **automatically** consumes resources internally
- Resource payments and transactions are processed **behind the scenes**
- There is **NO public API** for resource consumption - it's all handled internally
- The production API response includes resource costs that were already paid

## Base URL
```
/api/facility/production
```

## Authentication
All endpoints require JWT authentication for Student role.
- **Student**: Full access to production features and material viewing

## Endpoints

### 1. Produce Raw Material

Instantly produces raw materials. Production is immediate - resources are consumed and materials are added to inventory in a single atomic transaction.

**Endpoint:** `POST /api/facility/production/produce`

**Request Body:**
```typescript
{
  facilityId: string;           // TileFacilityInstance ID
  rawMaterialId: number;        // RawMaterial ID
  quantity: number;             // Units to produce (decimal allowed)
}
```

**Validation Rules:**
- Facility must be owned by user's team
- Facility type must match material origin
- Quantity must be a positive number
- All infrastructure connections must be active
- Team must have sufficient funds for resource costs
- Facility must have sufficient storage space

**Response - Success (200):**
```typescript
{
  success: true,
  businessCode: 2000,
  message: "Materials produced successfully",
  data: {
    productionId: string,
    productionNumber: string,
    status: "SUCCESS",        // Always SUCCESS for successful production
    facility: {
      id: string,
      name: string,
      type: string,
      level: number
    },
    material: {
      number: number,             // Material number (unique identifier)
      name: string,              // Name in requested language
      quantity: number
    },
    resources: {
      water: {
        consumed: number,
        unitPrice: number,
        totalCost: number,
        provider: {
          facilityId: string,
          facilityName: string,
          teamId: string,
          teamName: string
        }
      },
      power: {
        consumed: number,
        unitPrice: number,
        totalCost: number,
        provider: {
          facilityId: string,
          facilityName: string,
          teamId: string,
          teamName: string
        }
      }
    },
    costs: {
      waterCost: number,
      powerCost: number,
      materialBaseCost: number,
      totalCost: number
    },
    producedAt: string,        // ISO 8601 - single timestamp
    spaceUsed: number,         // Carbon units occupied in storage
    transactions: [
      {
        id: string,
        type: "WATER" | "POWER",
        amount: number,
        reference: string
      }
    ]
  }
}
```

**Response - Validation Error (400):**
```typescript
{
  success: false,
  businessCode: 4001,
  message: "Validation failed",
  data: {
    errors: [
      {
        field: string,
        reason: string
      }
    ]
  }
}
```

**Response - Insufficient Resources (402):**
```typescript
{
  success: false,
  businessCode: 4002,
  message: "Insufficient resources",
  data: {
    required: {
      funds: number,
      space: number
    },
    available: {
      funds: number,
      space: number
    }
  }
}
```

### 2. Get Production History

Retrieves historical production record. Since production is instant, this shows completed production details.

**Endpoint:** `GET /api/facility/production/{productionId}`

**Path Parameters:**
- `productionId` (string): Production record ID

**Response - Success (200):**
```typescript
{
  success: true,
  businessCode: 2000,
  message: "Production record retrieved",
  data: {
    id: string,
    productionNumber: string,
    status: "SUCCESS" | "FAILED",  // Only final states
    failureReason: string | null,   // Reason if failed
    material: {
      number: number,             // Material number (unique identifier)
      name: string,              // Name in requested language
      quantity: number,
      origin: string
    },
    facility: {
      id: string,
      name: string,
      type: string,
      level: number,
      location: {
        q: number,
        r: number
      }
    },
    resourcesConsumed: {
      water: number,
      power: number
    },
    costs: {
      waterCost: number,
      powerCost: number,
      materialBaseCost: number,
      totalCost: number
    },
    spaceUsed: number,
    producedAt: string              // ISO 8601 - when production occurred
  }
}
```

### 3. List Production History

Lists all production records for a facility or team. Since production is instant, all records show completed productions.

**Endpoint:** `GET /api/facility/production`

**Query Parameters:**
- `facilityId` (string, optional): Filter by facility
- `teamId` (string, optional): Filter by team
- `status` (string, optional): Filter by status ("SUCCESS" or "FAILED")
- `startDate` (string, optional): ISO 8601 date
- `endDate` (string, optional): ISO 8601 date
- `page` (number, default: 1): Page number
- `limit` (number, default: 20, max: 100): Items per page
- `sortBy` (string, default: "producedAt"): Sort field
- `sortOrder` (string, default: "desc"): "asc" or "desc"

**Response - Success (200):**
```typescript
{
  success: true,
  businessCode: 2000,
  message: "Production history retrieved",
  data: {
    productions: [
      {
        id: string,
        productionNumber: string,
        status: "SUCCESS" | "FAILED",
        material: {
          number: number,         // Material number (unique identifier)
          name: string,          // Name in requested language
          quantity: number
        },
        facility: {
          id: string,
          name: string,
          type: string
        },
        totalCost: number,
        spaceUsed: number,
        producedAt: string       // ISO 8601 - when production occurred
      }
    ],
    pagination: {
      currentPage: number,
      totalPages: number,
      totalItems: number,
      itemsPerPage: number,
      hasNext: boolean,
      hasPrevious: boolean
    }
  }
}
```

### 4. Get Production Estimate

Calculates production costs and requirements without actually producing. Useful for planning.

**Endpoint:** `POST /api/facility/production/estimate`

**Request Body:**
```typescript
{
  facilityId: string;
  rawMaterialId: number;
  quantity: number;
}
```

**Response - Success (200):**
```typescript
{
  success: true,
  businessCode: 2000,
  message: "Production estimate calculated",
  data: {
    feasible: boolean,
    issues: string[],          // Any blocking issues
    requirements: {
      water: {
        needed: number,
        available: boolean,
        unitPrice: number,
        totalCost: number,
        provider: {
          facilityId: string,
          facilityName: string,
          teamId: string,
          teamName: string
        }
      },
      power: {
        needed: number,
        available: boolean,
        unitPrice: number,
        totalCost: number,
        provider: {
          facilityId: string,
          facilityName: string,
          teamId: string,
          teamName: string
        }
      },
      space: {
        needed: number,
        available: number,
        sufficient: boolean
      },
      funds: {
        needed: number,
        available: number,
        sufficient: boolean
      }
    },
    costs: {
      waterCost: number,
      powerCost: number,
      materialBaseCost: number,
      totalCost: number,
      costPerUnit: number
    }
  }
}
```

### 5. Get Resource Transactions

Retrieves resource transaction history.

**Endpoint:** `GET /api/facility/transactions`

**Query Parameters:**
- `facilityId` (string, optional): Filter by facility
- `teamId` (string, optional): Filter by team
- `resourceType` (string, optional): "WATER" or "POWER"
- `transactionType` (string, optional): "CONSUMER" or "PROVIDER"
- `startDate` (string, optional): ISO 8601 date
- `endDate` (string, optional): ISO 8601 date
- `page` (number, default: 1): Page number
- `limit` (number, default: 20, max: 100): Items per page

**Response - Success (200):**
```typescript
{
  success: true,
  businessCode: 2000,
  message: "Transactions retrieved",
  data: {
    transactions: [
      {
        id: string,
        resourceType: "WATER" | "POWER",
        role: "CONSUMER" | "PROVIDER",
        quantity: number,
        unitPrice: number,
        totalAmount: number,
        counterparty: {
          facilityId: string,
          facilityName: string,
          teamId: string,
          teamName: string
        },
        productionId: string | null,
        transactionDate: string,
        reference: string,
        status: "SUCCESS" | "FAILED" | "REFUNDED"
      }
    ],
    summary: {
      totalTransactions: number,
      totalAmount: number,
      byType: {
        water: {
          count: number,
          amount: number
        },
        power: {
          count: number,
          amount: number
        }
      }
    },
    pagination: {
      currentPage: number,
      totalPages: number,
      totalItems: number,
      itemsPerPage: number
    }
  }
}
```

### 6. List Raw Materials

Returns a list of all available raw materials that can be produced.

**Endpoint:** `GET /api/facility/raw-materials`

**Query Parameters:**
- `origin` (string, optional): Filter by origin type (MINE, QUARRY, FOREST, FARM, RANCH, FISHERY)
- `search` (string, optional): Search in material names (English or Chinese)
- `page` (number, default: 1): Page number
- `limit` (number, default: 50, max: 100): Items per page
- `sortBy` (string, default: "materialNumber"): Sort field (materialNumber, name, origin, totalCost)
- `sortOrder` (string, default: "asc"): "asc" or "desc"

**Response - Success (200):**
```typescript
{
  success: true,
  businessCode: 2000,
  message: "Raw materials retrieved",
  data: {
    materials: [
      {
        id: number,
        materialNumber: number,
        origin: string,              // MINE, QUARRY, FOREST, etc.
        name: string,                // Name in requested language
        // Resource requirements
        waterRequired: number,       // Water units per unit of material
        powerRequired: number,       // Power units per unit of material
        // Costs
        totalCost: number,           // Total cost per unit
        goldCost: number,            // Gold component of cost
        // Environmental
        carbonEmission: number,      // Carbon emission (also used as space unit)
        // Facility requirement
        requiredFacilityType: string // Which facility type can produce this
      }
    ],
    summary: {
      totalMaterials: number,
      byOrigin: {
        MINE: number,
        QUARRY: number,
        FOREST: number,
        FARM: number,
        RANCH: number,
        FISHERY: number
      }
    },
    pagination: {
      currentPage: number,
      totalPages: number,
      totalItems: number,
      itemsPerPage: number,
      hasNext: boolean,
      hasPrevious: boolean
    }
  }
}
```

### 7. Get Raw Material Details

Gets detailed information about a specific raw material.

**Endpoint:** `GET /api/facility/raw-materials/{materialId}`

**Path Parameters:**
- `materialId` (number): Raw material ID

**Response - Success (200):**
```typescript
{
  success: true,
  businessCode: 2000,
  message: "Material details retrieved",
  data: {
    id: number,
    materialNumber: number,
    origin: string,
    name: string,                // Name in requested language
    // Resource requirements
    waterRequired: number,
    powerRequired: number,
    // Costs breakdown
    totalCost: number,
    goldCost: number,
    // Environmental impact
    carbonEmission: number,
    // Production info
    requiredFacilityType: string,
    requiredConnections: ["WATER", "POWER"],
    // Space calculation
    spacePerUnit: number,        // Same as carbonEmission
    // Example calculations
    examples: {
      small: {
        quantity: 10,
        waterNeeded: number,
        powerNeeded: number,
        totalCost: number,
        spaceRequired: number
      },
      medium: {
        quantity: 100,
        waterNeeded: number,
        powerNeeded: number,
        totalCost: number,
        spaceRequired: number
      },
      large: {
        quantity: 500,
        waterNeeded: number,
        powerNeeded: number,
        totalCost: number,
        spaceRequired: number
      }
    }
  }
}
```

**Response - Not Found (404):**
```typescript
{
  success: false,
  businessCode: 4404,
  message: "Material not found",
  data: null
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 2000 | Success |
| 4001 | Validation error |
| 4002 | Insufficient resources |
| 4003 | No infrastructure connection |
| 4004 | Insufficient space |
| 4005 | Invalid facility type |
| 4006 | Production record not found |
| 4008 | Provider capacity exceeded |
| 4009 | Invalid material for facility |
| 4404 | Material not found |
| 5001 | Internal server error |

## Rate Limiting

Production endpoints are subject to rate limiting:
- Start Production: 10 requests per minute per team
- Status Check: 60 requests per minute per user
- List/Analytics: 30 requests per minute per user


## SDK Examples

### TypeScript/JavaScript
```typescript
// Get list of raw materials
const materials = await facilityClient.getRawMaterials({
  origin: "MINE",
  page: 1,
  limit: 50
});

// Get material details
const material = await facilityClient.getRawMaterialDetails(42);

// Produce materials instantly
const production = await facilityClient.produceRawMaterial({
  facilityId: "facility-123",
  rawMaterialId: 42,
  quantity: 100
});

// Get production history
const history = await facilityClient.getProductionHistory(production.productionId);

// Get estimate
const estimate = await facilityClient.estimateProduction({
  facilityId: "facility-123",
  rawMaterialId: 42,
  quantity: 100
});
```

### cURL
```bash
# Get list of raw materials (English)
curl -X GET "https://api.example.com/api/facility/raw-materials?origin=MINE&page=1&lang=en" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept-Language: en"

# Get list of raw materials (Chinese - default)
curl -X GET "https://api.example.com/api/facility/raw-materials?origin=MINE&page=1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get material details (with language header)
curl -X GET https://api.example.com/api/facility/raw-materials/42 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-lang: zh"

# Produce materials instantly
curl -X POST https://api.example.com/api/facility/production/produce \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "facilityId": "facility-123",
    "rawMaterialId": 42,
    "quantity": 100
  }'

# Get production history
curl -X GET https://api.example.com/api/facility/production/prod-456 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

This API specification provides a complete interface for instant raw material production with automatic resource consumption and payment processing.