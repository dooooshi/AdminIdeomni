# Land Management API Reference

This document provides a comprehensive reference for the Land Management API, which enables teams to purchase and manage territorial land areas in the business simulation platform.

## Base URL
```
http://localhost:2999/api
```

## Authentication
All endpoints require JWT authentication via the `Authorization: Bearer <token>` header.

## Endpoint Overview

### Student/Worker Land Endpoints
- `POST /user/land-purchase/purchase` - Purchase land area on a tile
- `GET /user/land-purchase/history` - Get team's land purchase history
- `GET /user/land-purchase/owned-lands` - Get team's land ownership summary
- `GET /user/land-purchase/available-tiles` - Get available tiles for purchase
- `GET /user/land-purchase/tiles/:tileId/details` - Get tile details with ownership
- `GET /user/land-purchase/validate-purchase/:tileId/:area` - Validate purchase capability
- `GET /user/land-purchase/calculate-cost/:tileId/:area` - Calculate purchase cost
- `GET /user/land-purchase/summary` - Get team's land ownership summary (alternative)

### Manager Land Oversight Endpoints
- `GET /user/manager/land-status/overview` - Get activity land ownership overview
- `GET /user/manager/land-status/tiles` - Get detailed tile ownership with pagination
- `GET /user/manager/land-status/tiles/:tileId/ownership` - Get specific tile ownership
- `GET /user/manager/land-status/analytics` - Get land purchase analytics
- `GET /user/manager/land-status/summary` - Get land ownership summary statistics

---

## Student/Worker Land API

### Purchase Land Area

Purchase land area on a specific tile using team resources.

**Endpoint:** `POST /user/land-purchase/purchase`

**Authentication:** Required (User token)

**Authorization:** Active team members only

**Request Body:**
```json
{
  "tileId": 1,
  "area": 2.5,
  "maxGoldCost": 125.75,
  "maxCarbonCost": 50.30,
  "description": "Expanding territory for resource extraction"
}
```

**Request Parameters:**
- `tileId` (required): Map tile ID to purchase area on
- `area` (required): Area to purchase (0.001-100, up to 3 decimal places)
- `maxGoldCost` (optional): Maximum gold cost willing to pay (price protection)
- `maxCarbonCost` (optional): Maximum carbon cost willing to pay (price protection)
- `description` (optional): Purchase description

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx1a2b3c4d5e6f7g8h9i0j1",
    "tileId": 1,
    "teamId": "clx1a2b3c4d5e6f7g8h9i0j2",
    "purchasedArea": 2.5,
    "goldCost": 125.75,
    "carbonCost": 50.30,
    "purchaseDate": "2025-07-20T10:30:00Z",
    "status": "ACTIVE",
    "goldPriceAtPurchase": 50.30,
    "carbonPriceAtPurchase": 20.10,
    "description": "Expanding territory for resource extraction"
  },
  "message": "Successfully purchased 2.5 area on tile 1"
}
```

**Status Codes:**
- `201` - Land purchased successfully
- `400` - Invalid purchase parameters or insufficient resources
- `401` - User not authenticated
- `403` - User not an active team member
- `404` - Tile not found in current activity

**Example Request:**
```bash
curl -X POST http://localhost:2999/api/user/land-purchase/purchase \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "tileId": 1,
    "area": 2.5,
    "maxGoldCost": 130.00,
    "description": "Strategic expansion"
  }'
```

---

### Get Purchase History

Retrieve paginated history of land purchases made by the user's team.

**Endpoint:** `GET /user/land-purchase/history`

**Authentication:** Required (User token)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 20, max: 100)
- `tileId` (optional): Filter by tile ID
- `status` (optional): Filter by purchase status (ACTIVE, CANCELLED, EXPIRED)
- `startDate` (optional): Start date filter (ISO 8601)
- `endDate` (optional): End date filter (ISO 8601)

**Response:**
```json
{
  "data": [
    {
      "id": "clx1a2b3c4d5e6f7g8h9i0j1",
      "tileId": 1,
      "teamId": "clx1a2b3c4d5e6f7g8h9i0j2",
      "purchasedArea": 2.5,
      "goldCost": 125.75,
      "carbonCost": 50.30,
      "purchaseDate": "2025-07-20T10:30:00Z",
      "status": "ACTIVE",
      "goldPriceAtPurchase": 50.30,
      "carbonPriceAtPurchase": 20.10,
      "description": "Strategic expansion"
    }
  ],
  "total": 45,
  "page": 1,
  "pageSize": 20,
  "totalPages": 3,
  "hasNext": true,
  "hasPrevious": false
}
```

**Example Request:**
```bash
curl -X GET "http://localhost:2999/api/user/land-purchase/history?page=1&pageSize=10&tileId=1" \
  -H "Authorization: Bearer <user_token>"
```

---

### Get Team's Land Ownership Summary

Get a summary of all land owned by the user's team.

**Endpoint:** `GET /user/land-purchase/owned-lands`

**Authentication:** Required (User token)

**Response:**
```json
{
  "success": true,
  "data": {
    "teamId": "clx1a2b3c4d5e6f7g8h9i0j2",
    "teamName": "Team Alpha",
    "totalOwnedArea": 15.75,
    "totalSpent": 2500.50,
    "totalGoldSpent": 1800.25,
    "totalCarbonSpent": 700.25,
    "tilesOwnedCount": 8,
    "totalPurchases": 12,
    "firstPurchaseDate": "2025-07-15T10:30:00Z",
    "lastPurchaseDate": "2025-07-20T10:30:00Z"
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - User not in any team

---

### Get Available Tiles for Purchase

Get all tiles available for purchase in the user's current activity with pricing and ownership information.

**Endpoint:** `GET /user/land-purchase/available-tiles`

**Authentication:** Required (User token)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "tileId": 1,
      "axialQ": 0,
      "axialR": 0,
      "landType": "PLAIN",
      "currentGoldPrice": 50.30,
      "currentCarbonPrice": 20.10,
      "currentPopulation": 1250,
      "totalOwnedArea": 3.5,
      "teamOwnedArea": 1.25,
      "availableArea": 21.5,
      "canPurchase": true
    }
  ],
  "count": 25
}
```

**Status Codes:**
- `200` - Success
- `403` - User not in any activity or team

---

### Get Tile Details with Ownership

Get detailed information about a specific tile including current pricing and ownership breakdown.

**Endpoint:** `GET /user/land-purchase/tiles/:tileId/details`

**Authentication:** Required (User token)

**Path Parameters:**
- `tileId` (required): Tile ID

**Response:**
```json
{
  "success": true,
  "data": {
    "tile": {
      "id": 1,
      "axialQ": 0,
      "axialR": 0,
      "landType": "PLAIN",
      "initialGoldPrice": 45.00,
      "initialCarbonPrice": 18.00,
      "initialPopulation": 1200,
      "transportationCostUnit": 5.50
    },
    "currentState": {
      "currentGoldPrice": 50.30,
      "currentCarbonPrice": 20.10,
      "currentPopulation": 1250,
      "lastUpdated": "2025-07-20T10:30:00Z"
    },
    "ownership": [
      {
        "tileId": 1,
        "teamId": "clx1a2b3c4d5e6f7g8h9i0j2",
        "teamName": "Team Alpha",
        "ownedArea": 3.25,
        "totalPurchased": 450.75,
        "totalGoldSpent": 325.50,
        "totalCarbonSpent": 125.25,
        "purchaseCount": 3,
        "firstPurchaseDate": "2025-07-15T10:30:00Z",
        "lastPurchaseDate": "2025-07-20T10:30:00Z"
      }
    ],
    "totalOwnedArea": 8.75,
    "availableArea": 16.25
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - Tile not found in current activity

---

### Validate Purchase Capability

Check if the team can purchase the specified area on a tile, including cost calculation and resource validation.

**Endpoint:** `GET /user/land-purchase/validate-purchase/:tileId/:area`

**Authentication:** Required (User token)

**Path Parameters:**
- `tileId` (required): Tile ID
- `area` (required): Area to purchase

**Response:**
```json
{
  "success": true,
  "data": {
    "canPurchase": true,
    "goldCost": 125.75,
    "carbonCost": 50.30,
    "totalCost": 176.05,
    "availableArea": 22.5,
    "teamGoldBalance": 500.00,
    "teamCarbonBalance": 200.00,
    "errors": []
  }
}
```

**Error Response (Insufficient Resources):**
```json
{
  "success": true,
  "data": {
    "canPurchase": false,
    "goldCost": 125.75,
    "carbonCost": 50.30,
    "totalCost": 176.05,
    "availableArea": 22.5,
    "teamGoldBalance": 100.00,
    "teamCarbonBalance": 30.00,
    "errors": [
      "Insufficient gold balance: need 125.75, have 100.00",
      "Insufficient carbon balance: need 50.30, have 30.00"
    ]
  }
}
```

---

### Calculate Purchase Cost

Calculate the total cost (gold + carbon) for purchasing the specified area on a tile.

**Endpoint:** `GET /user/land-purchase/calculate-cost/:tileId/:area`

**Authentication:** Required (User token)

**Path Parameters:**
- `tileId` (required): Tile ID
- `area` (required): Area to calculate cost for

**Response:**
```json
{
  "success": true,
  "data": {
    "goldCost": 125.75,
    "carbonCost": 50.30,
    "totalCost": 176.05,
    "goldPrice": 50.30,
    "carbonPrice": 20.12
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - Tile not found in current activity

---

## Manager Land Oversight API

### Get Activity Land Ownership Overview

Get a comprehensive overview of all land purchases and ownership in the manager's current activity.

**Endpoint:** `GET /user/manager/land-status/overview`

**Authentication:** Required (Manager token)

**Authorization:** Managers only

**Response:**
```json
{
  "success": true,
  "data": {
    "activityId": "clx1a2b3c4d5e6f7g8h9i0j1",
    "activityName": "Business Simulation 2025",
    "totalLandPurchases": 45,
    "totalAreaPurchased": 127.5,
    "totalGoldSpent": 5420.75,
    "totalCarbonSpent": 2180.30,
    "totalRevenue": 7601.05,
    "teamsWithLand": 8,
    "tilesWithOwnership": 15,
    "averageAreaPerTeam": 15.94,
    "mostActiveTile": {
      "tileId": 12,
      "purchaseCount": 8,
      "totalArea": 18.5
    },
    "topTeamByArea": {
      "teamId": "clx1a2b3c4d5e6f7g8h9i0j2",
      "teamName": "Team Alpha",
      "totalArea": 32.75
    },
    "recentPurchases": [
      {
        "id": "clx1a2b3c4d5e6f7g8h9i0j3",
        "teamName": "Team Beta",
        "tileId": 5,
        "tileCoordinates": "(1, -1)",
        "landType": "COASTAL",
        "area": 3.25,
        "goldCost": 163.75,
        "carbonCost": 65.30,
        "totalCost": 229.05,
        "purchaseDate": "2025-07-20T15:45:00Z",
        "purchaserName": "John Smith"
      }
    ]
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - User not authenticated
- `403` - User is not a manager or not in any activity

---

### Get Detailed Tile Ownership Information

Get paginated detailed information about tile ownership in the manager's current activity.

**Endpoint:** `GET /user/manager/land-status/tiles`

**Authentication:** Required (Manager token)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 20)
- `tileId` (optional): Filter by specific tile ID
- `landType` (optional): Filter by land type (PLAIN, COASTAL, MARINE)

**Response:**
```json
{
  "data": [
    {
      "tileId": 1,
      "axialQ": 0,
      "axialR": 0,
      "landType": "PLAIN",
      "currentGoldPrice": 50.30,
      "currentCarbonPrice": 20.10,
      "currentPopulation": 1250,
      "totalOwnedArea": 8.75,
      "availableArea": 16.25,
      "totalRevenue": 625.50,
      "ownershipBreakdown": [
        {
          "teamId": "clx1a2b3c4d5e6f7g8h9i0j2",
          "teamName": "Team Alpha",
          "ownedArea": 3.25,
          "totalSpent": 229.05,
          "purchaseCount": 2,
          "lastPurchaseDate": "2025-07-20T10:30:00Z"
        }
      ]
    }
  ],
  "total": 45,
  "page": 1,
  "pageSize": 20,
  "totalPages": 3,
  "hasNext": true,
  "hasPrevious": false
}
```

---

### Get Land Purchase Analytics

Get comprehensive analytics about land purchases in the manager's current activity.

**Endpoint:** `GET /user/manager/land-status/analytics`

**Authentication:** Required (Manager token)

**Response:**
```json
{
  "success": true,
  "data": {
    "activityId": "clx1a2b3c4d5e6f7g8h9i0j1",
    "totalPurchases": {
      "today": 5,
      "thisWeek": 23,
      "thisMonth": 45,
      "total": 127
    },
    "totalRevenue": {
      "today": 425.50,
      "thisWeek": 2180.75,
      "thisMonth": 5420.30,
      "total": 12450.80
    },
    "purchasesByLandType": [
      {
        "landType": "PLAIN",
        "purchases": 45,
        "area": 127.5,
        "revenue": 6250.75
      },
      {
        "landType": "COASTAL",
        "purchases": 23,
        "area": 67.25,
        "revenue": 3850.30
      }
    ],
    "topPerformingTiles": [
      {
        "tileId": 12,
        "axialQ": 2,
        "axialR": -1,
        "landType": "COASTAL",
        "totalRevenue": 850.25,
        "totalArea": 18.5,
        "purchases": 8
      }
    ],
    "teamRankings": {
      "byArea": [
        {
          "teamId": "clx1a2b3c4d5e6f7g8h9i0j2",
          "teamName": "Team Alpha",
          "totalArea": 32.75,
          "rank": 1
        }
      ],
      "bySpending": [
        {
          "teamId": "clx1a2b3c4d5e6f7g8h9i0j2",
          "teamName": "Team Alpha",
          "totalSpent": 2450.80,
          "rank": 1
        }
      ]
    },
    "purchaseTrends": [
      {
        "date": "2025-07-20",
        "purchases": 5,
        "area": 12.75,
        "revenue": 425.50
      }
    ]
  }
}
```

---

## Error Handling

### Common Error Responses

**Authentication Error (401):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**Forbidden Access (403):**
```json
{
  "statusCode": 403,
  "message": "Access denied",
  "error": "Forbidden"
}
```

**Validation Error (400):**
```json
{
  "statusCode": 400,
  "message": ["area must be a positive number", "tileId must be a positive integer"],
  "error": "Bad Request"
}
```

**Business Logic Error (400):**
```json
{
  "statusCode": 400,
  "message": "Insufficient team resources for purchase",
  "error": "Business Exception",
  "details": {
    "code": "INSUFFICIENT_RESOURCES",
    "goldNeeded": 125.75,
    "goldAvailable": 100.00,
    "carbonNeeded": 50.30,
    "carbonAvailable": 30.00
  }
}
```

**Resource Not Found (404):**
```json
{
  "statusCode": 404,
  "message": "Tile not found in current activity",
  "error": "Not Found"
}
```

### Business Exception Codes

- `TEAM_NOT_MEMBER` - User is not a team member
- `TEAM_NOT_ACTIVE_MEMBER` - User is not an active team member
- `USER_NO_ACTIVITY` - User is not enrolled in any activity
- `TILE_NO_PRICING` - Tile has no pricing information available
- `INSUFFICIENT_RESOURCES` - Team lacks sufficient gold/carbon for purchase
- `PRICE_PROTECTION_EXCEEDED` - Purchase cost exceeds maximum limits
- `INVALID_AREA_AMOUNT` - Invalid area amount for purchase

---

## Usage Examples

### Complete Purchase Workflow

1. **Check available tiles:**
```bash
curl -X GET http://localhost:2999/api/user/land-purchase/available-tiles \
  -H "Authorization: Bearer <user_token>"
```

2. **Calculate purchase cost:**
```bash
curl -X GET http://localhost:2999/api/user/land-purchase/calculate-cost/1/2.5 \
  -H "Authorization: Bearer <user_token>"
```

3. **Validate purchase capability:**
```bash
curl -X GET http://localhost:2999/api/user/land-purchase/validate-purchase/1/2.5 \
  -H "Authorization: Bearer <user_token>"
```

4. **Make the purchase:**
```bash
curl -X POST http://localhost:2999/api/user/land-purchase/purchase \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "tileId": 1,
    "area": 2.5,
    "maxGoldCost": 130.00,
    "description": "Strategic expansion"
  }'
```

5. **Check purchase history:**
```bash
curl -X GET http://localhost:2999/api/user/land-purchase/history \
  -H "Authorization: Bearer <user_token>"
```

### Manager Oversight Workflow

1. **Get activity overview:**
```bash
curl -X GET http://localhost:2999/api/user/manager/land-status/overview \
  -H "Authorization: Bearer <manager_token>"
```

2. **Get detailed analytics:**
```bash
curl -X GET http://localhost:2999/api/user/manager/land-status/analytics \
  -H "Authorization: Bearer <manager_token>"
```

3. **Review specific tile ownership:**
```bash
curl -X GET http://localhost:2999/api/user/manager/land-status/tiles/1/ownership \
  -H "Authorization: Bearer <manager_token>"
```

---

## Integration Notes

- **Team Account Integration**: All purchases automatically deduct from team gold/carbon balances
- **Activity Scoping**: All operations are scoped to the user's current activity
- **Real-time Pricing**: Costs calculated using current tile pricing from activity state
- **Transaction Safety**: All purchases use database transactions for consistency
- **Audit Trail**: All operations logged in team operation history
- **Permission System**: Role-based access control for students vs managers