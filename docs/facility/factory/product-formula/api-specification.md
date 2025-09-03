# Product Formula API Specification

## Overview
RESTful API endpoints for managing product formulas in the business simulation platform. All endpoints follow the standardized response format and include proper authentication, validation, and error handling.

## Base URL
```
http://localhost:2999/api
```

## Authentication
All endpoints require JWT authentication with `UserAuthGuard` for team-based access control.

## Response Format
All responses follow the standardized format:
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

## Admin Endpoints

*No admin endpoints are required for product formula management. All operations are handled by team members (users).*

## User Endpoints

### 1. Create Product Formula
**POST** `/api/user/product-formulas`

**Description**: Create a new product formula with material requirements and craft categories

**Authentication**: User authentication required

**Request Body**:
```json
{
  "productDescription": "Advanced mobile communication device",
  "craftCategories": [
    {
      "craftCategoryId": 11
    },
    {
      "craftCategoryId": 2
    }
  ],
  "materials": [
    {
      "rawMaterialId": 85,
      "quantity": 5
    },
    {
      "rawMaterialId": 88,
      "quantity": 3.5
    },
    {
      "rawMaterialId": 95,
      "quantity": 2.25
    }
  ]
}
```

**Validation Rules**:
- `formulaNumber`: System-generated, auto-incremented within activity
- `activityId`: Obtained from user authentication context
- `teamId`: Obtained from user authentication context  
- `productDescription`: Optional, max 500 characters
- `craftCategories`: Required array, min 1 item
- `craftCategories[].craftCategoryId`: Required, must exist in database
- **Craft Category Restriction**: Only one craft category per categoryType allowed
  - ✅ Valid: [MECHANICAL_MANUFACTURING_LEVEL_2, ELECTRONIC_EQUIPMENT_LEVEL_3]
  - ❌ Invalid: [MECHANICAL_MANUFACTURING_LEVEL_1, MECHANICAL_MANUFACTURING_LEVEL_2]
- `materials`: Required array, min 1 item, max 99 items
- `materials[].rawMaterialId`: Required, must exist in database
- `materials[].quantity`: Required, min 0.001, max 999.999
- **Raw Material Origin**: Each raw material belongs to one of 7 origin facility types
  - ✅ Valid: Copper (MINE), Wheat (FARM), Cotton (FARM), Eggs (RANCH)
  - ❌ Invalid: Materials with invalid or missing origin facility types

**Success Response** (201):
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Product formula created successfully",
  "data": {
    "id": 1,
    "formulaNumber": 1,
    "productDescription": "Advanced mobile communication device",
    "totalMaterialCost": 245.00,
    "totalSetupWaterCost": 62,
    "totalSetupPowerCost": 300,
    "totalSetupGoldCost": 114,
    "totalWaterPercent": 4.0,
    "totalPowerPercent": 37.2,
    "totalGoldPercent": 8.8,
    "totalPercent": 50.0,
    "productFormulaCarbonEmission": 125.5,
    "craftCategories": [...],
    "materials": [...]
  }
}
```

**Error Responses**:
- 400: Validation error (invalid input)
- 401: Unauthorized
- 403: Forbidden (team access only)
- 409: Conflict (duplicate formula number)

### 2. Get Product Formulas (User)
**GET** `/api/user/product-formulas`

**Description**: Retrieve available product formulas

**Authentication**: User authentication required

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search by description

**Note**: User can only access formulas from their own team and activity (determined by authentication context)

**Success Response** (200):
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Product formulas retrieved successfully",
  "data": {
    "items": [
      {
        "id": 1,
        "formulaNumber": 1,
        "productDescription": "Advanced mobile communication device",
        "materialCount": 4,
        "craftCategoryCount": 2
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

### 3. Get Formula Details
**GET** `/api/user/product-formulas/:id`

**Description**: Get detailed information about a specific formula

**Authentication**: User authentication required

**Path Parameters**:
- `id`: Formula ID (number)

**Success Response** (200):
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Formula details retrieved successfully",
  "data": {
    "id": 1,
    "formulaNumber": 1,
    "productDescription": "Advanced mobile communication device",
    "craftCategories": [
      {
        "id": 11,
        "categoryType": "ELECTRONIC_EQUIPMENT",
        "technologyLevel": "LEVEL_3",
        "yieldPercentage": 93
      },
      {
        "id": 2,
        "categoryType": "MECHANICAL_MANUFACTURING",
        "technologyLevel": "LEVEL_2",
        "yieldPercentage": 92
      }
    ],
    "materials": [
      {
        "id": 1,
        "rawMaterial": {
          "id": 85,
          "nameEn": "Copper",
          "nameZh": "铜",
          "unitCost": 24
        },
        "quantity": 5.0,
        "totalCost": 120.00
      }
    ]
  }
}
```



## Common DTOs

### CreateProductFormulaDto
```typescript
class CreateProductFormulaDto {
  @IsOptional()
  @MaxLength(500)
  productDescription?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CraftCategoryDto)
  craftCategories: CraftCategoryDto[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(99)
  @ValidateNested({ each: true })
  @Type(() => MaterialRequirementDto)
  materials: MaterialRequirementDto[];
}

// Note: formulaNumber is system-generated (auto-incremented within activity)
// activityId and teamId are obtained from the authenticated user context
// None of these fields need to be included in the request body
```


### MaterialRequirementDto
```typescript
class MaterialRequirementDto {
  @IsInt()
  @Min(1)
  rawMaterialId: number;

  @IsNumber()
  @Min(0.001)
  @Max(999.999)
  quantity: number;
}

class CraftCategoryDto {
  @IsInt()
  @Min(1)
  craftCategoryId: number;
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 0 | Success |
| 1001 | Invalid input data |
| 1002 | Formula not found |
| 1003 | Duplicate formula number |
| 1004 | Invalid material count |
| 1005 | Material not found |
| 1006 | Craft category not found |
| 1011 | Duplicate craft category type |
| 1007 | Insufficient permissions |
| 1008 | Formula is inactive |
| 1009 | Calculation error |
| 1010 | Export failed |
| 1015 | Raw material origin validation failed |

## Rate Limiting

- User endpoints: 200 requests per minute

## Webhook Events

### Formula Created
```json
{
  "event": "formula.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "formulaId": 1,
    "formulaNumber": 1,
    "createdBy": "team-member@example.com"
  }
}
```

