# Trade API Specification

## Base URL
```
http://localhost:2999/api
```

## Endpoints

### 1. Create Trade
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

### 2. List Trades
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

### 3. Get Trade Details
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

### 4. Preview Trade (Calculate Transport)
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

### 5. Accept Trade
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

### 6. Reject Trade
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

### 7. Cancel Trade
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

### 8. Get Trade History
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

### 9. Get My Trade Statistics
```http
GET /api/trades/my-stats
```

**Note**: Team is determined from authenticated user's team context.

**Query Parameters:**
- `startDate`: ISO date string for start of period
- `endDate`: ISO date string for end of period

**Response:**
```json
{
  "success": true,
  "data": {
    "teamId": "team_123",
    "period": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-01-31T23:59:59Z"
    },
    "sales": {
      "count": 15,
      "totalAmount": 75000,
      "averageAmount": 5000,
      "topBuyers": [
        {
          "teamId": "team_456",
          "teamName": "Manufacturing Inc",
          "tradeCount": 5,
          "totalAmount": 25000
        }
      ]
    },
    "purchases": {
      "count": 10,
      "totalAmount": 60000,
      "averageAmount": 6000,
      "transportCosts": 10000,
      "topSellers": [
        {
          "teamId": "team_789",
          "teamName": "Supply Co",
          "tradeCount": 3,
          "totalAmount": 18000
        }
      ]
    },
    "netPosition": 15000,  // sales - purchases
    "mostTradedItems": [
      {
        "itemName": "Iron Ore",
        "quantity": 1000,
        "tradeCount": 8
      }
    ]
  }
}
```

### 10. Get My Trade Operation History
```http
GET /api/trades/my-operations
```

**Note**: Team is determined from authenticated user's team context.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `startDate`: ISO date string for filtering
- `endDate`: ISO date string for filtering

**Response:**
```json
{
  "success": true,
  "data": {
    "operations": [
      {
        "id": "op_001",
        "operationType": "TRADE_PURCHASE",
        "amount": 6000,
        "resourceType": "GOLD",
        "balanceBefore": 50000,
        "balanceAfter": 44000,
        "targetTeam": {
          "id": "team_789",
          "name": "Supply Co"
        },
        "description": "Trade purchase from Supply Co",
        "metadata": {
          "tradeOrderId": "trade_123",
          "itemsCost": 5000,
          "transportCost": 1000
        },
        "createdAt": "2024-01-15T11:30:00Z"
      },
      {
        "id": "op_002",
        "operationType": "TRADE_SALE",
        "amount": 3000,
        "resourceType": "GOLD",
        "balanceBefore": 44000,
        "balanceAfter": 47000,
        "sourceTeam": {
          "id": "team_456",
          "name": "Manufacturing Inc"
        },
        "description": "Trade sale to Manufacturing Inc",
        "createdAt": "2024-01-16T09:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
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
4. **Transport calculated using TransportationCostService.calculateCost(sourceInventoryId, destInventoryId, inventoryItemId, quantity, teamId)**
5. **Instant delivery upon acceptance**
6. **Teams must be in SAME activity**