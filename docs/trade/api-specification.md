# Trade API Specification

## Base URL
```
http://localhost:2999/api
```

## Endpoints

### 1. Get Available Teams for Trading
```http
GET /api/trades/available-teams
```

**Purpose:** Get all teams in the same activity that can receive trades from the current team.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "team_456",
      "name": "Manufacturing Inc",
      "resources": {
        "gold": 50000,
        "carbon": 1000
      },
      "statistics": {
        "memberCount": 4,
        "landCount": 5,
        "facilityCount": 3
      }
    },
    {
      "id": "team_789",
      "name": "Supply Co",
      "resources": {
        "gold": 35000,
        "carbon": 800
      },
      "statistics": {
        "memberCount": 3,
        "landCount": 3,
        "facilityCount": 2
      }
    }
  ]
}
```

### 2. Get Available Destinations for Receiving Trade
```http
GET /api/trades/available-destinations
```

**Purpose:** Get all facility inventories where the team can receive traded items (only RAW_MATERIAL_PRODUCTION and FUNCTIONAL facilities).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "inventoryId": "inv_001",
      "facility": {
        "id": "facility_123",
        "name": "Main Warehouse",
        "type": "WAREHOUSE",
        "level": 2,
        "location": {
          "q": 5,
          "r": -3
        },
        "tileId": 42,
        "uniqueKey": "5,-3_WAREHOUSE"
      },
      "space": {
        "total": 1000,
        "used": 300,
        "available": 700,
        "utilization": "30.00%"
      },
      "itemCount": 5,
      "canReceive": true
    },
    {
      "inventoryId": "inv_002",
      "facility": {
        "id": "facility_456",
        "name": "Production Facility A",
        "type": "FACTORY",
        "level": 1,
        "location": {
          "q": 4,
          "r": -2
        },
        "tileId": 38,
        "uniqueKey": "4,-2_FACTORY"
      },
      "space": {
        "total": 500,
        "used": 450,
        "available": 50,
        "utilization": "90.00%"
      },
      "itemCount": 12,
      "canReceive": true
    }
  ]
}
```

### 3. Get Source Inventories (Tradeable Items)
```http
GET /api/trades/source-inventories
```

**Purpose:** Get all facilities with tradeable items, grouped by facility with items from all inventories combined.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "facility": {
        "id": "facility_123",
        "name": "Main Warehouse",
        "type": "WAREHOUSE",
        "level": 2,
        "location": {
          "q": 5,
          "r": -3
        },
        "tileId": 42,
        "uniqueKey": "5,-3_WAREHOUSE"
      },
      "inventoryIds": ["inv_001", "inv_002"],
      "items": [
        {
          "inventoryItemId": "item_001",
          "inventoryId": "inv_001",
          "itemType": "RAW_MATERIAL",
          "name": "Iron Ore",
          "description": null,
          "quantity": 500,
          "unitSpace": 1.5,
          "totalSpace": 750,
          "materialInfo": {
            "id": 1,
            "nameZh": "铁矿石",
            "carbonEmission": 2.5
          }
        },
        {
          "inventoryItemId": "item_002",
          "inventoryId": "inv_001",
          "itemType": "PRODUCT",
          "name": "Steel Beam",
          "description": "High-quality steel beam for construction",
          "quantity": 100,
          "unitSpace": 3.0,
          "totalSpace": 300,
          "productInfo": {
            "id": 42,
            "description": "High-quality steel beam for construction",
            "formulaNumber": 1001
          }
        },
        {
          "inventoryItemId": "item_003",
          "inventoryId": "inv_002",
          "itemType": "RAW_MATERIAL",
          "name": "Copper",
          "description": null,
          "quantity": 200,
          "unitSpace": 1.1,
          "totalSpace": 220,
          "materialInfo": {
            "id": 3,
            "nameZh": "铜",
            "carbonEmission": 2.0
          }
        }
      ]
    },
    {
      "facility": {
        "id": "facility_456",
        "name": "Mine Storage",
        "type": "MINE",
        "level": 1,
        "location": {
          "q": 3,
          "r": -1
        },
        "tileId": 35,
        "uniqueKey": "3,-1_MINE"
      },
      "inventoryIds": ["inv_003"],
      "items": [
        {
          "inventoryItemId": "item_004",
          "inventoryId": "inv_003",
          "itemType": "RAW_MATERIAL",
          "name": "Coal",
          "description": null,
          "quantity": 1000,
          "unitSpace": 1.2,
          "totalSpace": 1200,
          "materialInfo": {
            "id": 2,
            "nameZh": "煤炭",
            "carbonEmission": 3.0
          }
        }
      ]
    }
  ]
}
```

### 4. Create Trade
```http
POST /api/trades
```

**Request:**
```json
{
  "targetTeamId": "team_456",
  "sourceFacilityId": "facility_123",
  "sourceInventoryId": "inventory_123",
  "items": [
    {
      "inventoryItemId": "item_001",
      "quantity": 100
    },
    {
      "inventoryItemId": "item_002",
      "quantity": 50
    }
  ],
  "totalPrice": 5000,
  "message": "Iron and coal for sale"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "trade_001",
    "status": "PENDING",
    "totalPrice": 5000
  }
}
```

### 4. List Trades
```http
GET /api/trades?type=incoming
```

**Query Parameters:**
- `type`: `incoming` | `outgoing` | `all`
- `status`: `PENDING` | `COMPLETED` | `REJECTED`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "trade_001",
      "senderTeam": {
        "id": "team_123",
        "name": "Mining Corp"
      },
      "totalPrice": 5000,
      "itemCount": 2,
      "totalQuantity": 150,
      "status": "PENDING",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### 5. Get Trade Details
```http
GET /api/trades/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "trade_001",
    "senderTeam": {
      "id": "team_123",
      "name": "Mining Corp"
    },
    "totalPrice": 5000,
    "items": [
      {
        "itemName": "Iron Ore",
        "quantity": 100
      },
      {
        "itemName": "Coal",
        "quantity": 50
      }
    ],
    "sourceFacility": {
      "id": "facility_123",
      "type": "WAREHOUSE",
      "location": { "q": 5, "r": -3 }
    },
    "message": "Iron and coal for sale",
    "status": "PENDING"
  }
}
```

### 6. Preview Trade (Calculate Transport)
```http
POST /api/trades/:id/preview
```

**Request:**
```json
{
  "destinationInventoryId": "inventory_456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "itemsCost": 5000,
    "transportCost": 1000,  // Calculated via TransportationCostService.calculateCost()
    "totalCost": 6000,
    "transport": {
      "distance": 5,
      "tier": "TIER_B",
      "method": "TransportationCostService"
    },
    "validation": {
      "hasSpace": true,
      "hasFunds": true,
      "canAccept": true
    }
  }
}
```

### 7. Accept Trade
```http
POST /api/trades/:id/accept
```

**Request:**
```json
{
  "destinationInventoryId": "inventory_456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "trade_001",
    "status": "COMPLETED",
    "transaction": {
      "itemsCost": 5000,
      "transportCost": 1000,  // Via TransportationCostService
      "totalPaid": 6000,
      "itemsReceived": [
        {
          "itemName": "Iron Ore",
          "quantity": 100
        },
        {
          "itemName": "Coal",
          "quantity": 50
        }
      ],
      "destinationInventory": "inventory_456"
    }
  }
}
```

### 8. Reject Trade
```http
POST /api/trades/:id/reject
```

**Request:**
```json
{
  "reason": "Not interested"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "trade_001",
    "status": "REJECTED"
  }
}
```

### 9. Cancel Trade
```http
DELETE /api/trades/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "trade_001",
    "status": "CANCELLED"
  }
}
```

### 10. Get Trade History
```http
GET /api/trades/:id/history
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "history_001",
      "operation": "CREATED",
      "previousStatus": null,
      "newStatus": "PENDING",
      "actor": {
        "id": "user_123",
        "name": "John Doe"
      },
      "actorTeam": {
        "id": "team_123",
        "name": "Mining Corp"
      },
      "description": "Trade offer created",
      "createdAt": "2024-01-15T10:00:00Z"
    },
    {
      "id": "history_002",
      "operation": "PREVIEWED",
      "previousStatus": "PENDING",
      "newStatus": "PENDING",
      "actor": {
        "id": "user_456",
        "name": "Jane Smith"
      },
      "actorTeam": {
        "id": "team_456",
        "name": "Manufacturing Inc"
      },
      "description": "Trade previewed by receiver",
      "metadata": {
        "transportCost": 1000,
        "totalCost": 6000
      },
      "createdAt": "2024-01-15T11:00:00Z"
    },
    {
      "id": "history_003",
      "operation": "ACCEPTED",
      "previousStatus": "PENDING",
      "newStatus": "ACCEPTED",
      "actor": {
        "id": "user_456",
        "name": "Jane Smith"
      },
      "description": "Trade accepted",
      "createdAt": "2024-01-15T11:15:00Z"
    }
  ]
}
```

## Error Responses

### Insufficient Resources
```json
{
  "success": false,
  "businessCode": 409,
  "message": "Insufficient gold",
  "details": {
    "required": 6000,
    "available": 5000
  }
}
```

### Insufficient Space
```json
{
  "success": false,
  "businessCode": 409,
  "message": "Insufficient space in destination facility",
  "details": {
    "required": 250,
    "available": 200
  }
}
```

## Key Business Rules

1. **Items must be from SAME inventory** (same facility)
2. **Receiver ALWAYS pays transportation**
3. **Total cost = Item price + Transport cost**
4. **Transport calculated as ONE combined shipment for ALL items**:
   - Calculate total space units for all items combined
   - Get transport cost for total space using TransportationCostService
   - Distribute cost proportionally by each item's space usage
5. **Instant delivery upon acceptance**
6. **Teams must be in SAME activity**
7. **Only RAW_MATERIAL_PRODUCTION and FUNCTIONAL facilities can store items**
8. **TransportationConfig must be active for trade execution**