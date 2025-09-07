# Transportation System API Specification

## Overview

This document provides comprehensive API specifications for the Transportation Management system. All endpoints follow RESTful conventions and use the standard response format defined in the platform's architecture.

## Base Configuration

### Base URL
```
http://localhost:2999/api
```

### Authentication
- **Admin Endpoints**: JWT authentication with Admin privileges
- **User Endpoints**: JWT authentication with User privileges (Student role)

```http
Authorization: Bearer <JWT_TOKEN>
```

### Standard Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  businessCode: number;
  message: string;
  data: T;
  timestamp: string;
  path?: string;
  extra?: object;
}
```

### Common HTTP Status Codes
- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., insufficient inventory/funds)
- `500 Internal Server Error` - Server error

## Admin API Endpoints

### 1. Transportation Configuration Management

#### 1.1 Create Transportation Configuration

```http
POST /api/admin/transportation-configs
```

**Description**: Create transportation configuration for a map template.

**Request Body**:
```json
{
  "templateId": 1,
  "tierABaseCost": 5,
  "tierAEmissionRate": 1,
  "tierAMinDistance": 1,
  "tierAMaxDistance": 3,
  "tierASpaceBasis": 1,
  "tierAEnabled": true,
  "tierBBaseCost": 30,
  "tierBEmissionRate": 5,
  "tierBMinDistance": 4,
  "tierBMaxDistance": 6,
  "tierBSpaceBasis": 10,
  "tierBEnabled": true,
  "tierCBaseCost": 200,
  "tierCEmissionRate": 25,
  "tierCMinDistance": 7,
  "tierCMaxDistance": 9,
  "tierCSpaceBasis": 100,
  "tierCEnabled": true,
  "tierDBaseCost": 1000,
  "tierDEmissionRate": 100,
  "tierDMinDistance": 10,
  "tierDSpaceBasis": 1000,
  "tierDEnabled": true,
  "enableCrossTeamTransfers": true,
  "maxTransferQuantity": null,
  "transferCooldownMinutes": 0,
  "distanceAMax": 3,
  "distanceBMax": 6,
  "distanceCMax": 9,
  "description": "Default transportation configuration"
}
```

**Response**:
```json
{
  "success": true,
  "businessCode": 201,
  "message": "Transportation configuration created successfully",
  "data": {
    "id": "clxx123",
    "templateId": 1,
    "tierABaseCost": "5.00",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

#### 1.2 Update Transportation Configuration

```http
PUT /api/admin/transportation-configs/:configId
```

**Description**: Update existing transportation configuration.

**Path Parameters**:
- `configId` (string): Configuration ID

**Request Body**:
```json
{
  "tierABaseCost": 6,
  "tierBEnabled": false,
  "maxTransferQuantity": "10000",
  "description": "Updated configuration for special event"
}
```

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Transportation configuration updated successfully",
  "data": {
    "id": "clxx123",
    "tierABaseCost": "6.00",
    "tierBEnabled": false,
    "maxTransferQuantity": "10000.000",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

#### 1.3 Get Transportation Configuration

```http
GET /api/admin/transportation-configs/:templateId
```

**Description**: Get transportation configuration for a specific template.

**Path Parameters**:
- `templateId` (integer): Map template ID

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Transportation configuration retrieved successfully",
  "data": {
    "id": "clxx123",
    "templateId": 1,
    "tierABaseCost": "5.00",
    "tierAEmissionRate": "1.000",
    "tierAMaxDistance": 3,
    "tierAEnabled": true,
    "tierBBaseCost": "30.00",
    "tierBEmissionRate": "5.000",
    "tierBMinDistance": 1,
    "tierBMaxDistance": 6,
    "tierBCostIndex": 10,
    "tierBEnabled": true,
    "tierCBaseCost": "200.00",
    "tierCEmissionRate": "25.000",
    "tierCMinDistance": 1,
    "tierCMaxDistance": 9,
    "tierCCostIndex": 100,
    "tierCEnabled": true,
    "tierDBaseCost": "1000.00",
    "tierDEmissionRate": "100.000",
    "tierDMinDistance": 1,
    "tierDCostIndex": 1000,
    "tierDEnabled": true,
    "enableCrossTeamTransfers": true,
    "maxTransferQuantity": null,
    "transferCooldownMinutes": 0,
    "distanceAMax": 3,
    "distanceBMax": 6,
    "distanceCMax": 9,
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

#### 1.4 List All Transportation Configurations

```http
GET /api/admin/transportation-configs
```

**Description**: List all transportation configurations.

**Query Parameters**:
- `isActive` (boolean, optional): Filter by active status
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 20)

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Transportation configurations retrieved successfully",
  "data": {
    "items": [
      {
        "id": "clxx123",
        "templateId": 1,
        "templateName": "Standard Map",
        "isActive": true,
        "description": "Default configuration"
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 20
  }
}
```


## User API Endpoints

### 1. Cost Calculation

#### 1.1 Calculate Transfer Cost

```http
POST /api/transportation/calculate
```

**Description**: Calculate transportation cost for different tiers before executing transfer.

**Request Body**:
```json
{
  "sourceInventoryId": "inv123",           // FacilitySpaceInventory ID
  "destInventoryId": "inv456",             // FacilitySpaceInventory ID
  "inventoryItemId": "item789",            // FacilityInventoryItem ID to transfer
  "quantity": "100"                        // Quantity to transfer
```

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Transportation cost calculated successfully",
  "data": {
    "sourceLocation": {
      "facilityId": "fac123",
      "facilityType": "MINE",
      "level": 2,
      "coordinates": { "axialQ": 5, "axialR": 3 }
    },
    "destinationLocation": {
      "facilityId": "fac456",
      "facilityType": "FACTORY",
      "level": 3,
      "coordinates": { "axialQ": 8, "axialR": 5 }
    },
    "hexDistance": 3,                   // Hex distance (for tier selection)
    "transportCostUnits": 5,            // Total transportation cost units (for fee calculation)
    "distanceCategory": "A",            // Based on hex distance (1-3 hexes)
    "itemDetails": {
      "itemType": "RAW_MATERIAL",
      "name": "Iron Ore",        // i18n supported from RawMaterial.name
      "quantity": "100.000",
      "unitSpaceOccupied": "0.03",        // From RawMaterial.carbonEmission
      "totalSpaceOccupied": "3.000"       // quantity × unitSpaceOccupied
    },
    "availableTiers": [
      {
        "tier": "TIER_A",
        "available": true,
        "costPerSpaceUnit": "5.00",
        "totalCost": "75.00",              // 5 gold × 3 space × 5 transport units
        "totalSpaceUnits": "3.000",       // From item's totalSpaceOccupied
        "carbonEmission": "15.000",       // 1 carbon × 3 space × 5 transport units
        "description": "5 gold per space unit per transport unit (Required for 1-3 hex distance)"
      }
    ],
    "currentTeamGold": "50000.00",
    "sourceAvailableQuantity": "500.000",
    "destinationAvailableSpace": "2000.000"
  }
}
```

### 2. Transfer Execution

#### 2.1 Execute Instant Transfer

```http
POST /api/transportation/transfer
```

**Description**: Execute instant transportation transfer between facilities.

**Request Body**:
```json
{
  "sourceInventoryId": "inv123",           // FacilitySpaceInventory ID
  "destInventoryId": "inv456",             // FacilitySpaceInventory ID  
  "inventoryItemId": "item789",            // FacilityInventoryItem ID to transfer
  "quantity": "100",                       // Quantity to transfer
  "tier": "TIER_B"                         // Selected tier (must be available for distance)
}
```

**Response**:
```json
{
  "success": true,
  "businessCode": 201,
  "message": "Transportation transfer completed successfully",
  "data": {
    "orderId": "order789",
    "status": "COMPLETED",
    "completedAt": "2024-01-15T14:30:00Z",
    "summary": {
      "itemTransferred": "Iron Ore",     // i18n supported
      "quantity": "100.000",
      "fromFacilityId": "fac123",
      "toFacilityId": "fac456",
      "tier": "TIER_B",
      "hexDistance": 5,                  // Hex distance
      "transportCostUnits": 8,
      "totalCost": "900.00",
      "carbonEmission": "1500.000"
    },
    "updatedBalances": {
      "teamGoldBalance": "49100.00",
      "sourceInventory": {
        "facilityId": "fac123",
        "facilityType": "MINE",
        "itemQuantity": "400.000",
        "availableSpace": "1100.000"
      },
      "destInventory": {
        "facilityId": "fac456",
        "facilityType": "FACTORY",
        "itemQuantity": "100.000",
        "availableSpace": "1900.000"
      }
    }
  }
}
```

**Error Response (Insufficient Funds)**:
```json
{
  "success": false,
  "businessCode": 409,
  "message": "Insufficient funds for transportation",
  "data": {
    "required": "900.00",
    "available": "500.00",
    "shortfall": "400.00"
  }
}
```

#### 2.2 Execute Batch Transfer

```http
POST /api/transportation/transfer/batch
```

**Description**: Execute multiple transfers in a single transaction.

**Request Body**:
```json
{
  "atomicExecution": true,
  "transfers": [
    {
      "sourceInventoryId": "inv123",
      "destInventoryId": "inv456",
      "itemType": "RAW_MATERIAL",
      "itemId": 1,
      "quantity": "50",
      "tier": "TIER_A"
    },
    {
      "sourceInventoryId": "inv123",
      "destInventoryId": "inv789",
      "itemType": "RAW_MATERIAL",
      "itemId": 2,
      "quantity": "75",
      "tier": "TIER_B"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "businessCode": 201,
  "message": "Batch transfer completed successfully",
  "data": {
    "totalTransfers": 2,
    "successfulTransfers": 2,
    "totalCost": "2000.00",
    "totalCarbonEmission": "3000.000",
    "orders": [
      {
        "orderId": "order001",
        "status": "COMPLETED"
      },
      {
        "orderId": "order002",
        "status": "COMPLETED"
      }
    ]
  }
}
```

### 3. Space Availability Check

#### 3.1 Get Team Facilities with Space Status

```http
GET /api/transportation/facilities/space-status
```

**Description**: Get all team facilities with their current space status to help decide transfer sources and destinations.

**Query Parameters**:
- `activityId` (string): Activity ID
- `itemType` (string, optional): RAW_MATERIAL or PRODUCT
- `minAvailableSpace` (number, optional): Minimum available space required

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Facility space status retrieved successfully",
  "data": {
    "teamId": "team123",
    "teamName": "Team Alpha",
    "facilities": [
      {
        "facilityId": "fac123",
        "inventoryId": "inv123",
        "facilityType": "WAREHOUSE",
        "coordinates": { "axialQ": 5, "axialR": 3 },
        "level": 3,
        "space": {
          "totalSpace": "5000.000",
          "usedSpace": "3000.000",
          "availableSpace": "2000.000",
          "utilizationRate": 60.0,
          "rawMaterialSpace": "1800.000",
          "productSpace": "1200.000"
        },
        "canReceive": true,
        "canSend": true
      },
      {
        "facilityId": "fac456",
        "inventoryId": "inv456",
        "facilityType": "FACTORY",
        "level": 2,
        "coordinates": { "axialQ": 8, "axialR": 5 },
        "space": {
          "totalSpace": "2500.000",
          "usedSpace": "2400.000",
          "availableSpace": "100.000",
          "utilizationRate": 96.0,
          "rawMaterialSpace": "1500.000",
          "productSpace": "900.000"
        },
        "canReceive": false,
        "canSend": true,
        "warning": "Near capacity (96% full)"
      }
    ]
  }
}
```

#### 3.2 Check Transfer Space Feasibility

```http
POST /api/transportation/check-feasibility
```

**Description**: Check if a transfer is feasible based on space constraints at source and destination.

**Request Body**:
```json
{
  "sourceInventoryId": "inv123",           // FacilitySpaceInventory ID
  "destInventoryId": "inv456",             // FacilitySpaceInventory ID
  "inventoryItemId": "item789",            // FacilityInventoryItem ID to transfer
  "quantity": "100"                        // Quantity to transfer
```

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Transfer feasibility checked successfully",
  "data": {
    "feasible": true,
    "source": {
      "currentQuantity": "500.000",
      "requestedQuantity": "100.000",
      "hasEnoughInventory": true,
      "spaceToFree": "1000.000"
    },
    "destination": {
      "availableSpace": "100.000",
      "requiredSpace": "1000.000",
      "hasEnoughSpace": false,
      "spaceDeficit": "900.000"
    },
    "item": {
      "type": "RAW_MATERIAL",
      "name": "Iron Ore",        // i18n supported from RawMaterial.name
      "unitSpace": "10.000",
      "totalSpaceRequired": "1000.000"
    },
    "recommendations": [
      {
        "type": "SPACE_WARNING",
        "message": "Destination facility lacks 900.000 units of space. Consider transferring to a facility with more available space.",
        "alternativeFacilities": [
          {
            "facilityId": "fac789",
            "availableSpace": "3000.000",
            "hexDistance": 5
          }
        ]
      }
    ]
  }
}
```

#### 3.3 Get Facilities with Available Space for Item

```http
GET /api/transportation/facilities/available-for-item
```

**Description**: Find all team facilities that have enough space to receive a specific item quantity.

**Query Parameters**:
- `itemType` (string): RAW_MATERIAL or PRODUCT
- `itemId` (integer): Item ID
- `quantity` (number): Quantity to transfer
- `excludeFacilityId` (string, optional): Exclude a specific facility (usually the source)

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Available facilities retrieved successfully",
  "data": {
    "itemInfo": {
      "type": "RAW_MATERIAL",
      "id": 1,
      "name": "Iron Ore",        // i18n supported from RawMaterial.name
      "quantity": "100.000",
      "unitSpace": "10.000",
      "totalSpaceRequired": "1000.000"
    },
    "availableFacilities": [
      {
        "facilityId": "fac789",
        "inventoryId": "inv789",
        "facilityType": "WAREHOUSE",
        "coordinates": { "axialQ": 10, "axialR": 8 },
        "availableSpace": "3000.000",
        "currentItemQuantity": "0.000",
        "canAccommodate": true,
        "distanceFromSource": null
      },
      {
        "facilityId": "fac012",
        "inventoryId": "inv012",
        "facilityType": "WAREHOUSE",
        "coordinates": { "axialQ": 3, "axialR": 2 },
        "availableSpace": "1500.000",
        "currentItemQuantity": "50.000",
        "canAccommodate": true,
        "distanceFromSource": null
      }
    ],
    "insufficientSpaceFacilities": [
      {
        "facilityId": "fac456",
        "availableSpace": "100.000",
        "spaceDeficit": "900.000"
      }
    ]
  }
}
```

### 4. Route Discovery

#### 4.1 Get Available Routes

```http
GET /api/transportation/routes
```

**Description**: Discover available transportation routes from a facility.

**Query Parameters**:
- `sourceInventoryId` (string): Source facility inventory ID
- `itemType` (string): RAW_MATERIAL or PRODUCT
- `itemId` (integer): Item ID to transport

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Available routes retrieved successfully",
  "data": {
    "sourceInfo": {
      "facilityId": "fac123",
      "inventoryId": "inv123",
      "facilityType": "MINE",
      "level": 2,
      "teamId": "team123",
      "coordinates": { "axialQ": 5, "axialR": 3 },
      "availableQuantity": "500.000"
    },
    "destinations": [
      {
        "facilityId": "fac456",
        "inventoryId": "inv456",
        "facilityType": "FACTORY",
        "level": 3,
        "teamId": "team123",
        "teamName": "Team Alpha",
        "isSameTeam": true,
        "coordinates": { "axialQ": 8, "axialR": 5 },
        "hexDistance": 3,                // Hex distance
        "transportCostUnits": 5,         // Transport cost units
        "distanceCategory": "A",
        "availableSpace": "2000.000",
        "availableTiers": ["TIER_A"]
      },
      {
        "facilityId": "fac789",
        "inventoryId": "inv789",
        "facilityType": "WAREHOUSE",
        "level": 4,
        "teamId": "team456",
        "teamName": "Team Beta",
        "isSameTeam": false,
        "coordinates": { "axialQ": 10, "axialR": 8 },
        "hexDistance": 7,
        "transportCostUnits": 11,
        "distanceCategory": "C",
        "availableSpace": "5000.000",
        "availableTiers": ["TIER_C"]
      }
    ]
  }
}
```

### 5. Transfer History

#### 5.1 Get Transfer History

```http
GET /api/transportation/history
```

**Description**: Get transportation transfer history for the team.

**Query Parameters**:
- `activityId` (string): Activity ID
- `role` (string, optional): "sender" or "receiver" 
- `startDate` (string, optional): Start date (ISO 8601)
- `endDate` (string, optional): End date (ISO 8601)
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 20)

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Transfer history retrieved successfully",
  "data": {
    "transfers": [
      {
        "orderId": "order789",
        "timestamp": "2024-01-15T14:30:00Z",
        "role": "sender",
        "itemType": "RAW_MATERIAL",
        "itemName": "Iron Ore",         // i18n supported
        "quantity": "100.000",
        "sourceFacility": "Iron Mine",    // i18n supported facility name
        "destFacility": "Steel Factory",       // i18n supported facility name
        "otherTeam": null,
        "tier": "TIER_B",
        "hexDistance": 3,
        "totalCost": "900.00",
        "carbonEmission": "1500.000",
        "status": "COMPLETED"
      },
      {
        "orderId": "order790",
        "timestamp": "2024-01-15T13:00:00Z",
        "role": "receiver",
        "itemType": "PRODUCT",
        "itemName": "Steel Ingot",  // i18n supported      // i18n supported from ProductFormula.productName
        "quantity": "50.000",
        "sourceFacility": "Partner Factory",  // i18n supported facility name
        "destFacility": "Central Warehouse",        // i18n supported facility name
        "otherTeam": "Team Beta",
        "tier": "TIER_C",
        "hexDistance": 8,
        "totalCost": "0.00",
        "carbonEmission": "6250.000",
        "status": "COMPLETED"
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    },
    "summary": {
      "totalSent": 25,
      "totalReceived": 20,
      "totalCostPaid": "15000.00",
      "totalCarbonEmitted": "75000.000"
    }
  }
}
```

#### 5.2 Get Transfer Details

```http
GET /api/transportation/orders/:orderId
```

**Description**: Get detailed information about a specific transfer.

**Path Parameters**:
- `orderId` (string): Transportation order ID

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Transfer details retrieved successfully",
  "data": {
    "orderId": "order789",
    "status": "COMPLETED",
    "completedAt": "2024-01-15T14:30:00Z",
    "source": {
      "inventoryId": "inv123",
      "facilityId": "fac123",
      "facilityType": "MINE",
      "level": 2,
      "teamId": "team123",
      "teamName": "Team Alpha",
      "coordinates": { "axialQ": 5, "axialR": 3 }
    },
    "destination": {
      "inventoryId": "inv456",
      "facilityId": "fac456",
      "facilityType": "FACTORY",
      "level": 3,
      "teamId": "team123",
      "teamName": "Team Alpha",
      "coordinates": { "axialQ": 8, "axialR": 5 }
    },
    "item": {
      "type": "RAW_MATERIAL",
      "id": 1,
      "name": "Iron Ore",        // i18n supported from RawMaterial.name
      "quantity": "100.000",
      "unitSpaceOccupied": "10.000",
      "totalSpaceTransferred": "1000.000"
    },
    "transportation": {
      "tier": "TIER_B",
      "hexDistance": 3,                  // Hex distance for tier selection
      "transportCostUnits": 5,           // Total transportation cost units for fee calculation
      "distanceCategory": "A",
      "unitCost": "3.00",
      "totalGoldCost": "900.00",
      "carbonEmissionRate": "5.000",
      "totalCarbonEmission": "1500.000"
    },
    "initiatedBy": {
      "userId": "user123",
      "username": "john_doe",
      "role": "STUDENT"
    }
  }
}
```

### 6. Configuration Query (User)

#### 6.1 Get Active Transportation Config

```http
GET /api/transportation/config
```

**Description**: Get active transportation configuration for the current activity.

**Query Parameters**:
- `activityId` (string): Activity ID

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Transportation configuration retrieved successfully",
  "data": {
    "tiers": [
      {
        "tier": "TIER_A",
        "name": "Economy",
        "enabled": true,
        "baseCost": "5.00",
        "costPerSpaceUnit": "5.00",
        "emissionRate": "1.000",
        "distanceRange": "1-3 hexes ONLY",
        "spaceBasis": 1,
        "description": "5 gold per space unit per transport unit - Required for short distances (1-3 hexes)"
      },
      {
        "tier": "TIER_B",
        "name": "Standard",
        "enabled": true,
        "baseCost": "30.00",
        "costPerSpaceUnit": "3.00",
        "emissionRate": "5.000",
        "distanceRange": "4-6 hexes ONLY",
        "spaceBasis": 10,
        "description": "30 gold per 10 space units (3 gold per space unit) - Required for medium distances (4-6 hexes)"
      },
      {
        "tier": "TIER_C",
        "name": "Express",
        "enabled": true,
        "baseCost": "200.00",
        "costPerSpaceUnit": "2.00",
        "emissionRate": "25.000",
        "distanceRange": "7-9 hexes ONLY",
        "spaceBasis": 100,
        "description": "200 gold per 100 space units (2 gold per space unit) - Required for long distances (7-9 hexes)"
      },
      {
        "tier": "TIER_D",
        "name": "Premium",
        "enabled": true,
        "baseCost": "1000.00",
        "costPerSpaceUnit": "1.00",
        "emissionRate": "100.000",
        "distanceRange": ">9 hexes ONLY",
        "spaceBasis": 1000,
        "description": "1000 gold per 1000 space units (1 gold per space unit) - Required for very long distances (>9 hexes)"
      }
    ],
    "distanceCategories": {
      "A": { "range": "1-3", "description": "Short distance" },
      "B": { "range": "4-6", "description": "Medium distance" },
      "C": { "range": "7-9", "description": "Long distance" },
      "D": { "range": ">9", "description": "Very long distance" }
    },
    "settings": {
      "crossTeamTransfersEnabled": true,
      "maxTransferQuantity": null,
      "transferCooldownMinutes": 0
    }
  }
}
```

## Error Codes Reference

| Code | Description | Typical Scenario |
|------|-------------|------------------|
| 4001 | Invalid source inventory | Source inventory not found |
| 4002 | Invalid destination inventory | Destination inventory not found |
| 4003 | Insufficient inventory | Not enough items to transfer |
| 4004 | Insufficient space | Destination lacks space |
| 4005 | Insufficient funds | Team lacks gold for fee |
| 4006 | Tier not available | Selected tier unavailable for distance |
| 4007 | Facility inactive | Source or destination inactive |
| 4008 | Different activity | Facilities in different activities |
| 4009 | Cross-team disabled | Cross-team transfers disabled |
| 4010 | Quantity exceeded | Exceeds max transfer quantity |
| 4011 | Cooldown active | Transfer cooldown not expired |
| 4012 | Invalid item type | Item type mismatch |
| 4013 | Permission denied | User lacks permission |

## Rate Limiting

API endpoints are subject to rate limiting:

- **Cost Calculation**: 60 requests per minute per user
- **Transfer Execution**: 20 requests per minute per team
- **History Queries**: 30 requests per minute per user
- **Admin Operations**: 30 requests per minute per admin

Rate limit headers:
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1642255200
```

## API Versioning

The API uses URL versioning. Current version: v1

Future versions will be available at:
- `/api/v2/transportation/...`

Deprecation notices will be provided 30 days before removing old versions.