# Manager Product Formula API Specification

## Overview
API endpoints for managers to create and manage product formulas for Made-To-Order (MTO) requirements. These formulas define the product specifications that teams must fulfill during MTO events.

## Authentication & Authorization
- **Authentication**: User JWT authentication required
- **Authorization**: Manager role (UserRole.MANAGER) required for all operations
- **Access Scope**: Managers have full access to ALL formulas within their activity
- **Collaboration**: Multiple managers in same activity can create, read, update, and delete any formula
- **Activity Boundary**: Managers cannot access formulas from other activities
- **Headers**:
  ```http
  Authorization: Bearer {jwt_token}
  Content-Type: application/json
  Accept-Language: en | zh (optional, defaults to zh)
  ```

## API Endpoints

### 1. Create Manager Product Formula
**POST** `/api/user/manager/mto/product-formulas`

Creates a new product formula for MTO requirements.

#### Request Body
```json
{
  "productName": "Advanced Circuit Board",
  "productDescription": "High-performance electronic component for MTO requirement",
  "activityId": "clxx1234567890abcdef",
  "craftCategories": [
    {
      "craftCategoryId": 11
    },
    {
      "craftCategoryId": 15
    }
  ],
  "materials": [
    {
      "rawMaterialId": 85,
      "quantity": 10.5
    },
    {
      "rawMaterialId": 88,
      "quantity": 7.25
    },
    {
      "rawMaterialId": 95,
      "quantity": 3.0
    }
  ]
}
```

#### Request Schema
| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `productName` | string | Yes | Product name | 1-200 characters |
| `productDescription` | string | No | Product description | Max 500 characters |
| `activityId` | string | Yes | Associated activity ID | Must exist, manager must have access |
| `craftCategories` | array | Yes | Required craft categories | Min 1 item |
| `craftCategories[].craftCategoryId` | number | Yes | Craft category ID | Must exist in database |
| `materials` | array | Yes | Required raw materials | Min 1, max 999 items |
| `materials[].rawMaterialId` | number | Yes | Raw material ID | Must exist in database |
| `materials[].quantity` | number | Yes | Quantity required | 0.001-9999.999 |

#### Validation Rules
1. **Craft Category Uniqueness**: Only one craft category per `categoryType`
2. **Material Uniqueness**: No duplicate raw materials in single formula
3. **Activity Access**: Manager must have access to specified activity
4. **Auto-generated Fields**:
   - `formulaNumber`: Auto-incremented within activity
   - `createdBy`: From authenticated user context
   - Cost calculations (automatic based on materials and craft categories)

#### Success Response (201 Created)
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Manager product formula created successfully",
  "data": {
    "id": 1,
    "formulaNumber": 1,
    "productName": "Advanced Circuit Board",
    "productDescription": "High-performance electronic component for MTO requirement",
    "activityId": "clxx1234567890abcdef",
    "totalMaterialCost": 485.50,
    "totalSetupWaterCost": 125,
    "totalSetupPowerCost": 450,
    "totalSetupGoldCost": 220,
    "totalWaterPercent": 8.5,
    "totalPowerPercent": 42.6,
    "totalGoldPercent": 12.3,
    "totalPercent": 63.4,
    "productFormulaCarbonEmission": 325.8,
    "isLocked": false,
    "craftCategories": [...],
    "materials": [...],
    "createdAt": "2024-01-15T10:30:00Z",
    "createdBy": "manager_user_id"
  }
}
```

### 2. List Manager Product Formulas
**GET** `/api/user/manager/mto/product-formulas`

Lists ALL product formulas for the manager's activity, including formulas created by other managers in the same activity.

#### Query Parameters
| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| `activityId` | string | Yes | Filter by activity ID | - |
| `page` | number | No | Page number | 1 |
| `limit` | number | No | Items per page | 20 |
| `search` | string | No | Search by product name | - |
| `isLocked` | boolean | No | Filter by lock status | - |

#### Success Response (200 OK)
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Formulas retrieved successfully",
  "data": {
    "items": [
      {
        "id": 1,
        "formulaNumber": 1,
        "productName": "Advanced Circuit Board",
        "productDescription": "...",
        "totalMaterialCost": 485.50,
        "materialCount": 4,
        "craftCategoryCount": 2,
        "isLocked": false,
        "usedInMTOType1": true,
        "usedInMTOType2": false,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 20,
      "totalPages": 2
    }
  }
}
```

### 3. Get Manager Product Formula Details
**GET** `/api/user/manager/mto/product-formulas/{id}`

Retrieves detailed information about a specific formula.

#### Path Parameters
- `id` (number): Formula ID

#### Success Response (200 OK)
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Formula retrieved successfully",
  "data": {
    "id": 1,
    "formulaNumber": 1,
    "productName": "Advanced Circuit Board",
    "productDescription": "...",
    "activityId": "clxx1234567890abcdef",
    "activity": {
      "id": "clxx1234567890abcdef",
      "name": "Business Simulation 2024"
    },
    "totalMaterialCost": 485.50,
    "totalSetupWaterCost": 125,
    "totalSetupPowerCost": 450,
    "totalSetupGoldCost": 220,
    "totalWaterPercent": 8.5,
    "totalPowerPercent": 42.6,
    "totalGoldPercent": 12.3,
    "totalPercent": 63.4,
    "productFormulaCarbonEmission": 325.8,
    "isLocked": false,
    "craftCategories": [
      {
        "id": 1,
        "craftCategoryId": 11,
        "craftCategory": {
          "id": 11,
          "name": "Electronic Equipment Processing - Level 3",
          "categoryType": "ELECTRONIC_EQUIPMENT",
          "technologyLevel": "LEVEL_3"
        }
      }
    ],
    "materials": [
      {
        "id": 1,
        "rawMaterialId": 85,
        "quantity": 10.5,
        "materialCost": 252.00,
        "rawMaterial": {
          "id": 85,
          "name": "Copper",
          "unitCost": 24,
          "carbonEmission": 2.5,
          "origin": "MINE"
        }
      }
    ],
    "mtoUsage": {
      "type1Count": 2,
      "type2Count": 1,
      "totalRequirements": 3
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "createdBy": "manager_user_id",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 4. Update Manager Product Formula
**PUT** `/api/user/manager/mto/product-formulas/{id}`

Updates an existing formula (only if not locked by active MTO). Any manager in the activity can update any formula within that activity.

#### Path Parameters
- `id` (number): Formula ID

#### Request Body
```json
{
  "productName": "Updated Circuit Board",
  "productDescription": "Updated description",
  "craftCategories": [
    {
      "craftCategoryId": 11
    }
  ],
  "materials": [
    {
      "rawMaterialId": 85,
      "quantity": 12.0
    },
    {
      "rawMaterialId": 88,
      "quantity": 8.5
    }
  ]
}
```

#### Validation Rules
- Formula must belong to the manager's activity
- Formula must not be locked (no active MTO using it)
- Same validation as creation for categories and materials
- Cost recalculation happens automatically
- System tracks updatedBy to show which manager made changes

#### Success Response (200 OK)
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Formula updated successfully",
  "data": {
    // Updated formula object
  }
}
```

### 5. Delete Manager Product Formula
**DELETE** `/api/user/manager/mto/product-formulas/{id}`

Soft deletes a formula (only if not used by any MTO). Any manager in the activity can delete any unused formula within that activity.

#### Path Parameters
- `id` (number): Formula ID

#### Validation Rules
- Formula must belong to the manager's activity
- Formula must not be used by any MTO requirement
- System tracks deletedBy to show which manager deleted

#### Success Response (200 OK)
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Formula deleted successfully"
}
```

### 6. Clone Manager Product Formula
**POST** `/api/user/manager/mto/product-formulas/{id}/clone`

Creates a copy of an existing formula.

#### Path Parameters
- `id` (number): Source formula ID

#### Request Body (optional)
```json
{
  "productName": "Cloned Circuit Board",
  "targetActivityId": "clxx9876543210fedcba"
}
```

#### Success Response (201 Created)
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Formula cloned successfully",
  "data": {
    // New formula object
  }
}
```

### 7. Get All Raw Materials
**GET** `/api/user/manager/mto/raw-materials`

Retrieves all available raw materials for formula creation. Managers can select from this complete list when creating formulas.

#### Query Parameters
| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| `page` | number | No | Page number | 1 |
| `limit` | number | No | Items per page | 50 |
| `search` | string | No | Search by name (English or Chinese) | - |
| `origin` | string | No | Filter by origin (MINE, QUARRY, FOREST, FARM, RANCH, FISHERY, SHOPS) | - |
| `sortBy` | string | No | Sort field (materialNumber, nameEn, nameZh, totalCost) | materialNumber |
| `sortOrder` | string | No | Sort order (asc, desc) | asc |

#### Success Response (200 OK)
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Raw materials retrieved successfully",
  "data": {
    "items": [
      {
        "id": 85,
        "materialNumber": 85,
        "origin": "MINE",
        "nameEn": "Copper",
        "nameZh": "铜",
        "waterRequired": 10,
        "powerRequired": 15,
        "totalCost": 24.00,
        "goldCost": 20.00,
        "carbonEmission": 2.5,
        "isActive": true
      },
      {
        "id": 88,
        "materialNumber": 88,
        "origin": "QUARRY",
        "nameEn": "Silicon",
        "nameZh": "硅",
        "waterRequired": 8,
        "powerRequired": 12,
        "totalCost": 24.00,
        "goldCost": 18.00,
        "carbonEmission": 1.8,
        "isActive": true
      }
    ],
    "pagination": {
      "total": 172,
      "page": 1,
      "limit": 50,
      "totalPages": 4
    }
  }
}
```

### 8. Get All Craft Categories
**GET** `/api/user/manager/mto/craft-categories`

Retrieves all available craft categories for formula creation. Managers must select appropriate craft categories for production requirements.

#### Query Parameters
| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| `categoryType` | string | No | Filter by category type | - |
| `technologyLevel` | string | No | Filter by technology level (LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4) | - |

#### Success Response (200 OK)
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Craft categories retrieved successfully",
  "data": [
    {
      "id": 1,
      "categoryType": "MECHANICAL_MANUFACTURING",
      "technologyLevel": "LEVEL_1",
      "nameEn": "Mechanical Manufacturing - Level 1",
      "nameZh": "机械制造 - 1级",
      "fixedWaterCost": 10,
      "fixedPowerCost": 30,
      "fixedGoldCost": 20.00,
      "variableWaterPercent": 1.0,
      "variablePowerPercent": 3.0,
      "variableGoldPercent": 1.0,
      "yieldPercentage": 91.00,
      "isActive": true
    },
    {
      "id": 11,
      "categoryType": "ELECTRONIC_EQUIPMENT",
      "technologyLevel": "LEVEL_3",
      "nameEn": "Electronic Equipment Processing - Level 3",
      "nameZh": "电子器械 - 3级",
      "fixedWaterCost": 42,
      "fixedPowerCost": 240,
      "fixedGoldCost": 84.00,
      "variableWaterPercent": 2.0,
      "variablePowerPercent": 31.2,
      "variableGoldPercent": 6.8,
      "yieldPercentage": 93.00,
      "isActive": true
    }
  ]
}
```

### 9. Validate Formula Against Team Delivery
**POST** `/api/user/manager/mto/product-formulas/{id}/validate`

Validates if team's product matches the formula specifications.

#### Request Body
```json
{
  "teamFormulaId": 123,
  "quantity": 100
}
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Validation successful",
  "data": {
    "isValid": true,
    "matches": {
      "materials": true,
      "craftCategories": true,
      "quantities": true
    },
    "details": {
      "materialMatch": "100%",
      "categoryMatch": "100%",
      "totalCost": 48550.00
    }
  }
}
```

### Error Handling for Reference Data Endpoints

#### Raw Materials Endpoint Errors
- **403 Forbidden**: Non-manager attempting to access
- **400 Bad Request**: Invalid query parameters (e.g., invalid origin value)

#### Craft Categories Endpoint Errors
- **403 Forbidden**: Non-manager attempting to access
- **400 Bad Request**: Invalid filter parameters

## Error Responses

### 400 Bad Request - Validation Error
```json
{
  "success": false,
  "businessCode": 1001,
  "message": "Invalid input data",
  "errors": [
    {
      "field": "materials",
      "message": "Duplicate material ID: 85"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "businessCode": 401,
  "message": "Authentication required"
}
```

### 403 Forbidden - Not Manager Role
```json
{
  "success": false,
  "businessCode": 403,
  "message": "Manager role required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "businessCode": 404,
  "message": "Formula not found"
}
```

### 409 Conflict - Formula Locked
```json
{
  "success": false,
  "businessCode": 1011,
  "message": "Formula is locked by active MTO requirement",
  "extra": {
    "mtoType": "TYPE_1",
    "mtoId": 5
  }
}
```

## Implementation Notes

### Cost Calculation Formula
```
Total Material Cost (A) = Σ(material.quantity × material.unitCost)

For each craft category:
- Setup costs: water, power, gold (fixed)
- Variable percentages: water%, power%, gold%

Final costs:
- Water = Σ(setupWater) + (A × Σ(waterPercent)/100)
- Power = Σ(setupPower) + (A × Σ(powerPercent)/100)
- Gold = Σ(setupGold) + (A × Σ(goldPercent)/100)

Carbon Emission = Σ(material.quantity × material.carbonEmission) × (1 + totalPercent/100)
```

### Permission Matrix
| Operation | Manager (Same Activity) | Manager (Other Activity) | Worker | Student |
|-----------|-------------------------|--------------------------|--------|---------|
| Create Formula | ✓ | ✗ | ✗ | ✗ |
| List Formulas | ✓ (all) | ✗ | ✓ (read-only) | ✓ (read-only) |
| View Details | ✓ (any) | ✗ | ✓ | ✓ |
| Update Formula | ✓ (any) | ✗ | ✗ | ✗ |
| Delete Formula | ✓ (any) | ✗ | ✗ | ✗ |
| Clone Formula | ✓ (any) | ✗ | ✗ | ✗ |
| Validate Delivery | ✓ | ✗ | ✓ | ✗ |

**Note**: "any" means managers can perform the operation on any formula within their activity, not just formulas they created.

### Rate Limiting
- Create/Update/Delete: 10 requests per minute
- List/Read: 60 requests per minute
- Validation: 30 requests per minute

### Caching Strategy
- Formula list: Cache for 5 minutes
- Formula details: Cache for 10 minutes
- Invalidate on any update/delete operation