# Raw Material Shop API Specification

## Overview
RESTful API endpoints for the activity-based Raw Material Shop module. The shop is managed collaboratively by all managers in an activity and serves all teams within that activity.

## Base URL
```
http://localhost:2999/api/shop
```

## Authentication
All endpoints require JWT authentication with appropriate role permissions.

**Important**: The user's activity is automatically determined from their authentication context (via team membership). No activityId parameter is needed in any endpoint.

**How Activity Context Works**:
1. User authenticates with JWT token
2. System retrieves user's team from the token
3. Activity is determined from team membership
4. All shop operations use this derived activity context
5. Users can only access their own activity's shop

## Response Format
All responses follow the standard format:
```typescript
{
  success: boolean;
  businessCode: number;
  message: string;
  data: T;
  timestamp: string;
  path?: string;
  extra?: object;
}
```

## API Endpoints

### Material Management (Manager Only)

#### 2. Add Material to Shop
**POST** `/api/shop/materials/add`

**Description**: Add a new raw material to current activity's shop

**Authorization**: `UserAuthGuard`, Role: `MANAGER`

**Request Body**:
```json
{
  "rawMaterialId": 1,
  "unitPrice": 12.50,
  "quantityToSell": 1000  // Optional, null = unlimited
}
```

**Response** (201):
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Material added successfully",
  "data": {
    "id": 1,
    "material": {
      "nameEn": "Eggs",
      "nameZh": "蛋类",
      "origin": "RANCH"
    },
    "unitPrice": "12.50",
    "quantityToSell": 1000,
    "addedBy": 5,
    "addedAt": "2024-01-20T12:00:00Z"
  }
}
```

**Validation**:
- Material not already in shop
- Price must be positive (> 0)
- Manager must be in same activity

---

#### 3. Remove Material from Shop
**DELETE** `/api/shop/materials/:materialId`

**Description**: Remove a material from current activity's shop

**Authorization**: `UserAuthGuard`, Role: `MANAGER`

**Response** (200):
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Material removed successfully",
  "data": {
    "materialId": 1,
    "materialName": "Eggs",
    "removedBy": 5,
    "removedAt": "2024-01-20T12:00:00Z"
  }
}
```

---

#### 4. Update Material Price
**POST** `/api/shop/materials/:materialId/price`

**Description**: Update price for an existing material in current activity's shop

**Authorization**: `UserAuthGuard`, Role: `MANAGER`

**Request Body**:
```json
{
  "unitPrice": 12.50,
  "reason": "Market adjustment"  // Optional
}
```

**Response** (200):
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Price updated successfully",
  "data": {
    "materialId": 1,
    "material": {
      "nameEn": "Eggs",
      "nameZh": "蛋类",
      "origin": "RANCH"
    },
    "oldPrice": "10.00",  // null if first time setting
    "newPrice": "12.50",
    "updatedBy": 5,
    "updatedAt": "2024-01-20T12:00:00Z"
  }
}
```

**Validation**:
- Price must be positive (> 0)
- Manager must be in same activity
- No min/max constraints

---

### Shop Browsing (All Users)

#### 6. Browse Shop Materials
**GET** `/api/shop/materials`

**Description**: Get all materials in the activity shop

**Authorization**: `UserAuthGuard`

**Query Parameters**:
- `origin`: Filter by material origin (MINE, FARM, etc.)
- `minPrice`: Minimum unit price
- `maxPrice`: Maximum unit price
- `sortBy`: Sort field (price, name, materialNumber)
- `sortOrder`: asc or desc

**Response** (200):
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Materials retrieved",
  "data": {
    "shopId": 1,
    "materials": [
      {
        "id": 1,
        "rawMaterialId": 1,
        "material": {
          "materialNumber": 1,
          "nameEn": "Eggs",
          "nameZh": "蛋类",
          "origin": "RANCH",
          "baseCost": "8.00",
          "waterRequired": "3.00",
          "powerRequired": "0.00",
          "goldCost": "5.00",
          "carbonEmission": "0.08"
        },
        "unitPrice": "12.50",
        "quantityToSell": null,
        "quantitySold": 245
      }
    ],
    "totalMaterials": 15
  }
}
```

---

### Purchase Transactions (Students)

#### 9. Create Purchase Order
**POST** `/api/shop/purchase`

**Description**: Purchase materials from shop with instant delivery

**Authorization**: `UserAuthGuard`, Role: `STUDENT`

**Request Body**:
```json
{
  "materialId": 1,
  "quantity": 25,
  "facilitySpaceId": 456
}
```

**Response** (201):
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Purchase completed successfully",
  "data": {
    "transactionId": 1,
    "transactionCode": "TXN-2024-0001",
    "status": "COMPLETED",
    "buyer": {
      "userId": 2,
      "username": "student1",
      "teamId": 1,
      "teamName": "Team Alpha"
    },
    "purchase": {
      "materialName": "Eggs",
      "quantity": 25,
      "unitPrice": "12.50",
      "totalAmount": "312.50"
    },
    "delivery": {
      "status": "DELIVERED",
      "facilitySpaceId": 456,
      "facilityName": "Ranch Space A",
      "deliveredAt": "2024-01-20T13:00:00Z"
    },
    "financials": {
      "previousBalance": "5000.00",
      "amountCharged": "312.50",
      "newBalance": "4687.50",
      "accountHistoryId": 789
    }
  }
}
```

**Validation**:
- Material must exist in shop
- Buyer has student role
- Buyer in same activity as shop
- Team has sufficient gold
- Valid owned facility space

**Error Responses**:
- 400: Invalid quantity or facility
- 402: Insufficient funds
- 404: Material not in shop
- 409: Stock limit reached

---

#### 10. Get Team Purchase History
**GET** `/api/shop/team-transactions`

**Description**: Get purchase history for student's own team (from auth context)

**Authorization**: `UserAuthGuard`, Role: `STUDENT`

**Query Parameters**:
- `materialId`: Filter by specific material (optional)
- `startDate`: Start date for range (optional)
- `endDate`: End date for range (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response** (200):
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Team transactions retrieved",
  "data": {
    "teamInfo": {
      "teamId": 1,
      "teamName": "Team Alpha",
      "currentBalance": "4687.50"
    },
    "transactions": [
      {
        "id": 1,
        "transactionCode": "TXN-2024-0001",
        "material": {
          "id": 1,
          "nameEn": "Eggs",
          "nameZh": "蛋类",
          "origin": "RANCH"
        },
        "quantity": 25,
        "unitPrice": "12.50",
        "totalAmount": "312.50",
        "purchasedBy": {
          "userId": 2,
          "username": "student1"
        },
        "delivery": {
          "facilitySpaceId": 456,
          "facilityName": "Ranch Space A",
          "status": "DELIVERED"
        },
        "purchasedAt": "2024-01-20T13:00:00Z"
      },
      {
        "id": 2,
        "transactionCode": "TXN-2024-0002",
        "material": {
          "id": 3,
          "nameEn": "Water",
          "nameZh": "水",
          "origin": "MINE"
        },
        "quantity": 100,
        "unitPrice": "2.00",
        "totalAmount": "200.00",
        "purchasedBy": {
          "userId": 3,
          "username": "student2"
        },
        "delivery": {
          "facilitySpaceId": 457,
          "facilityName": "Mine Storage B",
          "status": "DELIVERED"
        },
        "purchasedAt": "2024-01-20T14:00:00Z"
      }
    ],
    "summary": {
      "totalTransactions": 42,
      "totalSpent": "5000.00",
      "uniqueMaterials": 15,
      "periodStart": "2024-01-01T00:00:00Z",
      "periodEnd": "2024-01-20T23:59:59Z"
    },
    "pagination": {
      "total": 42,
      "page": 1,
      "pages": 3,
      "limit": 20
    }
  }
}
```

**Notes**:
- Team ID is automatically determined from student's authentication context
- Shows all purchases made by any student in the same team
- Includes who made each purchase within the team
- Summary statistics help track team spending patterns
- Cannot view other teams' transactions

---

### Shop History & Analytics

#### 11. Get Shop History (Manager)
**GET** `/api/shop/history`

**Description**: Get complete shop activity history for current activity

**Authorization**: `UserAuthGuard`, Role: `MANAGER`

**Query Parameters**:
- `actionType`: Filter by action type (PURCHASE_COMPLETED, PRICE_CHANGED, etc.)
- `actorId`: Filter by user who performed action
- `startDate`: Start date for range
- `endDate`: End date for range
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)

**Response** (200):
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Shop history retrieved",
  "data": {
    "history": [
      {
        "id": 100,
        "actionType": "MATERIAL_PRICE_SET",
        "actionCategory": "PRICING",
        "actor": {
          "id": 5,
          "username": "manager2",
          "role": "MANAGER"
        },
        "entityType": "material",
        "entityId": 1,
        "previousValue": { "price": "10.00" },
        "newValue": { "price": "12.50" },
        "changeDescription": "Price changed from 10.00 to 12.50 gold",
        "createdAt": "2024-01-20T12:00:00Z"
      },
      {
        "id": 101,
        "actionType": "PURCHASE_COMPLETED",
        "actionCategory": "TRANSACTION",
        "actor": {
          "id": 2,
          "username": "student1",
          "role": "STUDENT"
        },
        "entityType": "transaction",
        "entityId": 1,
        "newValue": {
          "material": "Eggs",
          "quantity": 25,
          "totalAmount": "312.50"
        },
        "changeDescription": "Student purchased 25 units of Eggs for 312.50 gold",
        "createdAt": "2024-01-20T13:00:00Z"
      }
    ],
    "pagination": {
      "total": 542,
      "page": 1,
      "pages": 11,
      "limit": 50
    }
  }
}
```

---

#### 12. Get Shop Transactions
**GET** `/api/shop/transactions`

**Description**: Get purchase transactions (filtered by role)

**Authorization**: `UserAuthGuard`

**Query Parameters**:
- `teamId`: Filter by team (managers see all, students see own team)
- `materialId`: Filter by specific material
- `startDate`: Start date for range
- `endDate`: End date for range
- `page`: Page number
- `limit`: Items per page

**Response** (200):
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Transactions retrieved",
  "data": {
    "transactions": [
      {
        "id": 1,
        "transactionCode": "TXN-2024-0001",
        "buyer": {
          "username": "student1",
          "teamName": "Team Alpha"
        },
        "material": {
          "nameEn": "Eggs",
          "nameZh": "蛋类"
        },
        "quantity": 25,
        "unitPrice": "12.50",
        "totalAmount": "312.50",
        "facilitySpace": "Ranch Space A",
        "createdAt": "2024-01-20T13:00:00Z"
      }
    ],
    "summary": {
      "totalSpent": "5000.00",
      "transactionCount": 42,
      "uniqueMaterials": 15
    },
    "pagination": {
      "total": 42,
      "page": 1,
      "pages": 3,
      "limit": 20
    }
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 0 | Success |
| 1001 | Shop not found |
| 1002 | Material not in shop |
| 1003 | Material already in shop |
| 1004 | Stock limit reached |
| 1005 | Invalid quantity |
| 1006 | Insufficient funds |
| 1007 | Invalid facility space |
| 1008 | Unauthorized access |
| 1009 | Not in same activity |
| 1010 | Invalid price |
| 1011 | Transaction failed |
| 1012 | Invalid role |
| 1013 | Activity not found |

## Rate Limiting

- Browse endpoints: 100 requests/minute
- Purchase endpoints: 20 requests/minute
- Manager operations: 50 requests/minute
- History endpoints: 20 requests/minute

## WebSocket Events (Future)

```typescript
// Price updates (for all users in activity)
socket.on('price:changed', (data) => {
  // Material price updated by a manager
});

// Transaction notifications (managers only)
socket.on('transaction:completed', (data) => {
  // New purchase in shop
});

// Stock alerts
socket.on('stock:low', (data) => {
  // Stock limit approaching
});
```

## SDK Examples

### TypeScript/JavaScript

```typescript
import { ShopAPI } from '@ideomni/shop-sdk';

const shop = new ShopAPI({
  baseURL: 'http://localhost:2999/api',
  token: 'jwt_token_here'
});

// Get current activity shop (activity determined from auth)
const currentShop = await shop.getCurrentShop();

// Add material to shop (manager)
const addResult = await shop.addMaterial({
  rawMaterialId: 1,
  unitPrice: 12.50,
  quantityToSell: 1000
});

// Browse materials in your activity's shop
const materials = await shop.getMaterials({
  origin: 'MINE'
});

// Purchase materials (student - from your activity's shop)
const result = await shop.purchase({
  materialId: 1,
  quantity: 25,
  facilitySpaceId: 456
});

// Update price (manager - for existing material in shop)
const priceResult = await shop.updatePrice(materialId, {
  unitPrice: 15.00,
  reason: 'Market adjustment'
});

// Remove material from shop (manager)
await shop.removeMaterial(materialId);

// Get team purchase history (student - for your team)
const teamHistory = await shop.getTeamTransactions({
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});

// Get shop history (manager - for your activity)
const history = await shop.getShopHistory({
  actionType: 'MATERIAL_ADDED',
  startDate: '2024-01-01'
});
```

This API specification provides a complete interface for the activity-based Raw Material Shop module with collaborative management, fixed non-negotiable pricing (managers can update prices), and comprehensive history tracking.