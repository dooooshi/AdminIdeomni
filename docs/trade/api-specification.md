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
  "destinationFacilityId": "facility_456"
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
  "destinationFacilityId": "facility_456"
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
      "destinationFacility": "facility_456"
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

1. **Items must be from SAME facility**
2. **Receiver ALWAYS pays transportation**
3. **Total cost = Item price + Transport cost**
4. **Transport calculated using TransportationCostService.calculateCost()**
5. **Instant delivery upon acceptance**