# Team Product Formula Creation API

## Overview
This document specifies the API endpoint for teams to create product formulas in the business simulation platform. The API follows the existing NestJS architecture patterns with proper authentication, validation, and error handling.

## API Endpoint Specification

### Create Team Product Formula
**POST** `/api/user/team/product-formulas`

**Description**: Allows authenticated team members to create a new product formula for their team

**Authentication**: User JWT authentication required (`UserJwtAuthGuard`)

**Authorization**: Team member must have appropriate permissions

### Request Headers
```http
Authorization: Bearer {jwt_token}
Content-Type: application/json
Accept-Language: en | zh (optional, defaults to zh)
X-Lang: en | zh (optional, alternative language header)
```

### Request Body
```json
{
  "productName": "SmartPhone X5",
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
      "quantity": 5.0
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

### Request Body Schema

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `productName` | string | Yes | Product name | Max 200 characters, required |
| `productDescription` | string | No | Product description | Max 500 characters |
| `craftCategories` | array | Yes | Craft categories for production | Min 1 item |
| `craftCategories[].craftCategoryId` | number | Yes | ID of craft category | Must exist in database |
| `materials` | array | Yes | Raw materials required | Min 1, max 99 items |
| `materials[].rawMaterialId` | number | Yes | ID of raw material | Must exist in database |
| `materials[].quantity` | number | Yes | Quantity required | Min 0.001, max 999.999 |

### Validation Rules

#### 1. Automatic Field Population
- `formulaNumber`: System-generated, auto-incremented within activity
- `activityId`: Obtained from authenticated user's context
- `teamId`: Obtained from authenticated user's team membership

#### 2. Craft Category Validation
- **Unique Category Type Rule**: Only one craft category per `categoryType` is allowed
- Valid Example: `[MECHANICAL_MANUFACTURING_LEVEL_2, ELECTRONIC_EQUIPMENT_LEVEL_3]`
- Invalid Example: `[MECHANICAL_MANUFACTURING_LEVEL_1, MECHANICAL_MANUFACTURING_LEVEL_2]`

#### 3. Material Validation
- No duplicate materials allowed in a single formula
- Each material must have a valid origin facility type (RANCH, FARM, FOREST, FISHERY, MINE, QUARRY, SHOPS)
- Quantity must support decimal precision (3 decimal places)

#### 4. Cost Calculation (Automatic)
The system automatically calculates and stores:
- Total material cost (A)
- Setup costs (water, power, gold)
- Variable percentages
- Carbon emission
- All cost components based on the formula rules

### Success Response (201 Created)

**Note**: The `name` field in `craftCategory` and `rawMaterial` objects returns localized content based on the request's `Accept-Language` or `X-Lang` header:
- For `en`: Returns English names (e.g., "Electronic Equipment Processing - Level 3")
- For `zh` (default): Returns Chinese names (e.g., "电子器械 - 3级")

```json
{
  "success": true,
  "businessCode": 0,
  "message": "Product formula created successfully",
  "data": {
    "id": 1,
    "formulaNumber": 1,
    "productName": "SmartPhone X5",
    "productDescription": "Advanced mobile communication device",
    "activityId": "clxx1234567890abcdef",
    "teamId": "clxx1234567890abcdef01",
    "totalMaterialCost": 245.00,
    "totalSetupWaterCost": 62,
    "totalSetupPowerCost": 300,
    "totalSetupGoldCost": 114,
    "totalWaterPercent": 4.0,
    "totalPowerPercent": 37.2,
    "totalGoldPercent": 8.8,
    "totalPercent": 50.0,
    "productFormulaCarbonEmission": 125.5,
    "craftCategories": [
      {
        "id": 1,
        "craftCategoryId": 11,
        "craftCategory": {
          "id": 11,
          "name": "Electronic Equipment Processing - Level 3",
          "categoryType": "ELECTRONIC_EQUIPMENT",
          "technologyLevel": "LEVEL_3",
          "yieldPercentage": 93,
          "fixedWaterCost": 42,
          "fixedPowerCost": 240,
          "fixedGoldCost": 84,
          "variableWaterPercent": 2,
          "variablePowerPercent": 31.2,
          "variableGoldPercent": 6.8
        }
      },
      {
        "id": 2,
        "craftCategoryId": 2,
        "craftCategory": {
          "id": 2,
          "name": "Mechanical Manufacturing - Level 2",
          "categoryType": "MECHANICAL_MANUFACTURING",
          "technologyLevel": "LEVEL_2",
          "yieldPercentage": 92,
          "fixedWaterCost": 20,
          "fixedPowerCost": 60,
          "fixedGoldCost": 30,
          "variableWaterPercent": 2,
          "variablePowerPercent": 6,
          "variableGoldPercent": 2
        }
      }
    ],
    "materials": [
      {
        "id": 1,
        "rawMaterialId": 85,
        "quantity": 5.0,
        "materialCost": 120.00,
        "rawMaterial": {
          "id": 85,
          "name": "Copper",
          "totalCost": 24,
          "carbonEmission": 2.5,
          "origin": "MINE"
        }
      },
      {
        "id": 2,
        "rawMaterialId": 88,
        "quantity": 3.5,
        "materialCost": 84.00,
        "rawMaterial": {
          "id": 88,
          "name": "Silicon",
          "totalCost": 24,
          "carbonEmission": 1.8,
          "origin": "QUARRY"
        }
      },
      {
        "id": 3,
        "rawMaterialId": 95,
        "quantity": 2.25,
        "materialCost": 41.00,
        "rawMaterial": {
          "id": 95,
          "name": "Lithium",
          "totalCost": 18.22,
          "carbonEmission": 3.2,
          "origin": "MINE"
        }
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/user/team/product-formulas"
}
```

### Error Responses

#### 400 Bad Request - Validation Error
```json
{
  "success": false,
  "businessCode": 1001,
  "message": "Invalid input data",
  "errors": [
    {
      "field": "materials",
      "message": "Formula must have 1-99 material types"
    },
    {
      "field": "craftCategories",
      "message": "Cannot have multiple craft categories of the same type"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/user/team/product-formulas"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "businessCode": 401,
  "message": "Authentication required",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/user/team/product-formulas"
}
```

#### 403 Forbidden - No Team Access
```json
{
  "success": false,
  "businessCode": 1007,
  "message": "User is not a member of any team",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/user/team/product-formulas"
}
```

#### 404 Not Found - Resource Not Found
```json
{
  "success": false,
  "businessCode": 1005,
  "message": "Raw material not found",
  "errors": {
    "rawMaterialId": 999
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/user/team/product-formulas"
}
```

#### 409 Conflict - Business Rule Violation
```json
{
  "success": false,
  "businessCode": 1011,
  "message": "Duplicate craft category type",
  "errors": {
    "categoryType": "MECHANICAL_MANUFACTURING",
    "conflictingIds": [1, 2]
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/user/team/product-formulas"
}
```

## Implementation Guidelines

### Controller Implementation
```typescript
// src/user/product-formula.controller.ts
@ApiTags('User - Team Product Formula')
@ApiBearerAuth()
@UseGuards(UserJwtAuthGuard)
@Controller('api/user/team')
export class ProductFormulaController {
  constructor(
    private readonly productFormulaService: ProductFormulaService,
    private readonly i18nService: I18nService,
  ) {}

  @Post('product-formulas')
  @ApiOperation({ summary: 'Create a product formula for the team' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Product formula created successfully',
  })
  async createProductFormula(
    @Body() createDto: CreateProductFormulaDto,
    @Req() req: AuthenticatedRequest,
    @Headers('accept-language') lang?: string,
  ) {
    const user = req.user;
    const language = this.getLanguage(lang);
    
    // Validate user has team membership
    if (!user.teamId) {
      throw new ForbiddenException(
        this.i18nService.translate('errors.NO_TEAM_ACCESS', language)
      );
    }
    
    // Create formula with team context
    return this.productFormulaService.create({
      ...createDto,
      teamId: user.teamId,
      activityId: user.activityId,
      createdBy: user.id,
    }, language);
  }
}
```

### Service Implementation Pattern
```typescript
// src/product-formula/product-formula.service.ts
@Injectable()
export class ProductFormulaService {
  constructor(
    private readonly productFormulaRepository: ProductFormulaRepository,
    private readonly craftCategoryRepository: CraftCategoryRepository,
    private readonly rawMaterialRepository: RawMaterialRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(data: CreateProductFormulaWithContext, lang: 'en' | 'zh') {
    // Transaction wrapper for atomic operations
    return this.prisma.executeTransaction(async (tx) => {
      // 1. Validate craft categories
      await this.validateCraftCategories(data.craftCategories, tx);
      
      // 2. Validate materials
      await this.validateMaterials(data.materials, tx);
      
      // 3. Generate formula number
      const formulaNumber = await this.generateFormulaNumber(data.activityId, tx);
      
      // 4. Calculate costs
      const costs = await this.calculateFormulaCosts(
        data.materials,
        data.craftCategories,
        tx
      );
      
      // 5. Create formula
      return this.productFormulaRepository.create({
        ...data,
        formulaNumber,
        ...costs,
      }, tx);
    });
  }
}
```

### DTO Definitions
```typescript
// src/product-formula/dto/create-product-formula.dto.ts
export class CreateProductFormulaDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  @ApiProperty({
    description: 'Product name',
    maxLength: 200,
    required: true,
  })
  productName: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ApiPropertyOptional({
    description: 'Product description',
    maxLength: 500,
  })
  productDescription?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CraftCategoryDto)
  @ApiProperty({
    description: 'Craft categories for production',
    type: [CraftCategoryDto],
    minItems: 1,
  })
  craftCategories: CraftCategoryDto[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(99)
  @ValidateNested({ each: true })
  @Type(() => MaterialRequirementDto)
  @ApiProperty({
    description: 'Raw materials required',
    type: [MaterialRequirementDto],
    minItems: 1,
    maxItems: 99,
  })
  materials: MaterialRequirementDto[];
}

export class CraftCategoryDto {
  @IsInt()
  @Min(1)
  @ApiProperty({
    description: 'Craft category ID',
    minimum: 1,
  })
  craftCategoryId: number;
}

export class MaterialRequirementDto {
  @IsInt()
  @Min(1)
  @ApiProperty({
    description: 'Raw material ID',
    minimum: 1,
  })
  rawMaterialId: number;

  @IsNumber()
  @Min(0.001)
  @Max(999.999)
  @ApiProperty({
    description: 'Quantity required',
    minimum: 0.001,
    maximum: 999.999,
  })
  quantity: number;
}
```

## Integration with Existing System

### 1. Module Registration
Add the ProductFormulaController to UserModule:
```typescript
// src/user/user.module.ts
@Module({
  controllers: [
    // ... existing controllers
    ProductFormulaController,
  ],
  providers: [
    // ... existing providers
    ProductFormulaService,
    ProductFormulaRepository,
  ],
})
```

### 2. Repository Pattern
Follow the existing repository pattern:
```typescript
// src/product-formula/product-formula.repository.ts
@Injectable()
export class ProductFormulaRepository extends AbstractBaseRepository<ProductFormula> {
  constructor(prismaService: PrismaService) {
    super(prismaService);
    this.modelName = 'productFormula';
  }
}
```

### 3. Exception Handling
Use the existing exception system:
```typescript
// Validation exceptions
throw new ValidationException('INVALID_CRAFT_CATEGORY', { categoryId });

// Business exceptions
throw new BusinessException('DUPLICATE_CATEGORY_TYPE', { categoryType });

// Resource not found
throw new NotFoundException('MATERIAL_NOT_FOUND', { materialId });
```

### 4. Response Formatting
Responses are automatically formatted by `ResponseFormatterInterceptor`

## Testing Examples

### Valid Request Example
```bash
curl -X POST http://localhost:2999/api/user/team/product-formulas \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept-Language: en" \
  -d '{
    "productName": "SmartHome Hub",
    "productDescription": "Smart home controller",
    "craftCategories": [
      {"craftCategoryId": 11}
    ],
    "materials": [
      {"rawMaterialId": 85, "quantity": 2.5},
      {"rawMaterialId": 88, "quantity": 1.75}
    ]
  }'
```

### Invalid Request Examples

#### Duplicate Category Type
```json
{
  "craftCategories": [
    {"craftCategoryId": 1},
    {"craftCategoryId": 2}
  ],
  "materials": [{"rawMaterialId": 85, "quantity": 5}]
}
// Error: Both categories are MECHANICAL_MANUFACTURING type
```

#### Invalid Material Quantity
```json
{
  "craftCategories": [{"craftCategoryId": 11}],
  "materials": [
    {"rawMaterialId": 85, "quantity": 1000}
  ]
}
// Error: Quantity exceeds maximum of 999.999
```

## Performance Considerations

1. **Transaction Management**: All formula creation operations are wrapped in database transactions
2. **Batch Validation**: Validate all craft categories and materials in single queries
3. **Cost Calculation**: Pre-calculate all costs during creation to avoid runtime calculations
4. **Index Optimization**: Ensure proper indexes on frequently queried fields

## Security Considerations

1. **Authentication**: JWT token required for all operations
2. **Team Authorization**: Users can only create formulas for their own team
3. **Input Validation**: Comprehensive validation using class-validator
4. **SQL Injection Prevention**: Use parameterized queries via Prisma
5. **Rate Limiting**: Applied via ThrottlerModule (200 requests/minute)

## Monitoring and Logging

1. **Audit Trail**: Track formula creation with `createdBy` field
2. **Operation Logging**: Log all formula operations via interceptors
3. **Error Tracking**: Centralized error handling with proper logging
4. **Performance Metrics**: Monitor response times for formula creation

## Future Enhancements

1. **Bulk Import**: Support for importing multiple formulas via CSV/Excel
2. **Formula Templates**: Pre-defined templates for common products
3. **Version Control**: Track formula modifications with version history
4. **Approval Workflow**: Optional approval process for high-value formulas
5. **Cost Optimization**: AI-powered suggestions for material optimization