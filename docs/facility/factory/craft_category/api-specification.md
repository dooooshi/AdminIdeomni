# Craft Category API Specification

## Base URL
`http://localhost:2999/api`

## Authentication
All endpoints require JWT authentication:
- Admin endpoints: `AdminAuthGuard`
- User endpoints: `UserAuthGuard`

## Craft Category Types
Production technologies available in the system:
- `MECHANICAL_MANUFACTURING` - Industrial machinery and equipment
- `MATERIALS_PROCESSING` - Raw material transformation
- `BIOCHEMICAL` - Chemical and biological processes
- `ELECTRONIC_EQUIPMENT` - Electronics and high-tech equipment
- `ENERGY_UTILIZATION` - Energy conversion and optimization
- `CUTTING_TEXTILE` - Fabric and garment production
- `FOOD_PROCESSING` - Food production and packaging

## Technology Levels
Each craft category has 4 progressive technology levels:
- `LEVEL_1` - Basic technology
- `LEVEL_2` - Standard technology
- `LEVEL_3` - Advanced technology
- `LEVEL_4` - Peak technology

## Endpoints Overview

### Admin Endpoints (Craft Category Management)
- `GET /api/admin/craft-categories` - List all craft categories
- `GET /api/admin/craft-categories/:id` - Get single craft category details
- `POST /api/admin/craft-categories` - Create new craft category
- `PUT /api/admin/craft-categories/:id` - Update craft category
- `PATCH /api/admin/craft-categories/:id` - Partial update craft category
- `DELETE /api/admin/craft-categories/:id` - Delete craft category (soft delete)
- `POST /api/admin/craft-categories/bulk-import` - Import from CSV
- `GET /api/admin/craft-categories/cost-analysis` - Analyze costs across categories

### User Endpoints (Craft Category Usage)
- `GET /api/craft-categories` - Get available craft categories
- `GET /api/craft-categories/:id` - Get craft category details
- `GET /api/craft-categories/compare` - Compare multiple categories

---

## Admin API Endpoints

### 1. List All Craft Categories
**GET** `/api/admin/craft-categories`

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 20, max: 100) |
| categoryType | string | No | Filter by category type |
| technologyLevel | string | No | Filter by technology level |
| sort | string | No | Sort field (categoryType, technologyLevel, yieldPercentage, totalCost) |
| order | string | No | Sort order (asc, desc) (default: asc) |
| isActive | boolean | No | Filter by active status |

#### Response
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Craft categories retrieved successfully",
  "data": {
    "items": [
      {
        "id": 1,
        "categoryType": "MECHANICAL_MANUFACTURING",
        "technologyLevel": "LEVEL_1",
        "nameEn": "Mechanical Manufacturing - Level 1",
        "nameZh": "机械制造",
        "fixedWaterCost": 18,
        "fixedPowerCost": 40,
        "fixedGoldCost": 64,
        "variableWaterPercent": 2.2,
        "variablePowerPercent": 2.8,
        "variableGoldPercent": 5,
        "yieldPercentage": 88,
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 28,
    "page": 1,
    "limit": 20,
    "totalPages": 2
  }
}
```

### 2. Get Single Craft Category
**GET** `/api/admin/craft-categories/:id`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | Craft category ID |

#### Response
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Craft category retrieved successfully",
  "data": {
    "id": 1,
    "categoryType": "MECHANICAL_MANUFACTURING",
    "technologyLevel": "LEVEL_1",
    "nameEn": "Mechanical Manufacturing - Level 1",
    "nameZh": "机械制造",
    "fixedWaterCost": 18,
    "fixedPowerCost": 40,
    "fixedGoldCost": 64,
    "variableWaterPercent": 2.2,
    "variablePowerPercent": 2.8,
    "variableGoldPercent": 5,
    "yieldPercentage": 88,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 3. Create Craft Category
**POST** `/api/admin/craft-categories`

#### Request Body
```json
{
  "categoryType": "MECHANICAL_MANUFACTURING",
  "technologyLevel": "LEVEL_2",
  "nameEn": "Mechanical Manufacturing - Level 2",
  "nameZh": "机械制造",
  "fixedWaterCost": 24,
  "fixedPowerCost": 64,
  "fixedGoldCost": 72,
  "variableWaterPercent": 3.6,
  "variablePowerPercent": 6.8,
  "variableGoldPercent": 9.6,
  "yieldPercentage": 93
}
```

#### Response
```json
{
  "success": true,
  "businessCode": 201,
  "message": "Craft category created successfully",
  "data": {
    "id": 29,
    "categoryType": "MECHANICAL_MANUFACTURING",
    "technologyLevel": "LEVEL_2",
    // ... all fields
  }
}
```

### 4. Update Craft Category
**PUT** `/api/admin/craft-categories/:id`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | Craft category ID |

#### Request Body
```json
{
  "fixedWaterCost": 25,
  "fixedPowerCost": 65,
  "fixedGoldCost": 73,
  "variableWaterPercent": 3.7,
  "variablePowerPercent": 6.9,
  "variableGoldPercent": 9.7,
  "yieldPercentage": 94
}
```

### 5. Bulk Import from CSV
**POST** `/api/admin/craft-categories/bulk-import`

#### Request Body (multipart/form-data)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | file | Yes | CSV file with craft category data |
| overwrite | boolean | No | Overwrite existing records (default: false) |

#### Response
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Craft categories imported successfully",
  "data": {
    "imported": 28,
    "updated": 0,
    "failed": 0,
    "errors": []
  }
}
```

---

## User API Endpoints

### 1. Get Available Craft Categories
**GET** `/api/craft-categories`

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| categoryType | string | No | Filter by category type |
| technologyLevel | string | No | Filter by technology level |
| maxGoldCost | number | No | Maximum gold cost filter |
| minYield | number | No | Minimum yield percentage filter |

#### Response
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Available craft categories retrieved",
  "data": [
    {
      "id": 1,
      "categoryType": "MECHANICAL_MANUFACTURING",
      "technologyLevel": "LEVEL_1",
      "nameEn": "Mechanical Manufacturing - Level 1",
      "nameZh": "机械制造",
      "costs": {
        "fixed": {
          "water": 18,
          "power": 40,
          "gold": 64
        },
        "variable": {
          "water": 2.2,
          "power": 2.8,
          "gold": 5
        }
      },
      "yieldPercentage": 88
    }
  ]
}
```

### 2. Compare Craft Categories
**GET** `/api/craft-categories/compare`

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ids | string | Yes | Comma-separated craft category IDs |

#### Response
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Craft categories compared successfully",
  "data": [
    {
      "id": 1,
      "categoryType": "MECHANICAL_MANUFACTURING",
      "technologyLevel": "LEVEL_1",
      "nameEn": "Mechanical Manufacturing - Level 1",
      "nameZh": "机械制造",
      "fixedWaterCost": 18,
      "fixedPowerCost": 40,
      "fixedGoldCost": 64,
      "variableWaterPercent": 2.2,
      "variablePowerPercent": 2.8,
      "variableGoldPercent": 5,
      "yieldPercentage": 88
    },
    {
      "id": 2,
      "categoryType": "MECHANICAL_MANUFACTURING",
      "technologyLevel": "LEVEL_2",
      "nameEn": "Mechanical Manufacturing - Level 2",
      "nameZh": "机械制造",
      "fixedWaterCost": 24,
      "fixedPowerCost": 64,
      "fixedGoldCost": 72,
      "variableWaterPercent": 3.6,
      "variablePowerPercent": 6.8,
      "variableGoldPercent": 9.6,
      "yieldPercentage": 93
    }
  ]
}
```

---


## Error Responses

### Common Error Codes
| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Missing or invalid JWT |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate or constraint violation |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error |

### Error Response Format
```json
{
  "success": false,
  "businessCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "yieldPercentage",
      "message": "Yield percentage must be between 0 and 100"
    }
  ],
  "timestamp": "2024-01-01T00:00:00Z",
  "path": "/api/admin/craft-categories"
}
```

---

## Implementation Notes

### Validation Rules
1. **Yield Percentage**: Must be between 50 and 100
2. **Cost Values**: Must be positive numbers
3. **Variable Percentages**: Must be between 0 and 100
4. **Technology Levels**: Must follow progression (LOW → MEDIUM → HIGH → TOP)
5. **Category Uniqueness**: Each combination of categoryType and technologyLevel must be unique

### Business Logic
1. **Admin Management**:
   - Full CRUD operations on all craft categories
   - Soft delete maintains historical records
   - Bulk import from CSV supported

### Performance Considerations
- Cache frequently accessed craft categories
- Index on categoryType and technologyLevel for fast queries
- Batch operations for bulk imports
- Pagination for large result sets

### Security
- Admin-only access for modifications
- Rate limiting on calculation endpoints
- Input sanitization for all parameters
- Audit logging for all changes