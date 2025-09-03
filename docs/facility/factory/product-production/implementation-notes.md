# Product Production Implementation Notes

## Overview

This document provides implementation guidelines for integrating the Product Production system with the existing codebase. It includes code patterns, integration points, and practical examples.

## Prerequisites

Before implementing product production, ensure these systems are operational:
1. **ProductFormula** system with cost calculations
2. **FacilityInventoryItem** for material/product storage
3. **InfrastructureConnection** for water/power
4. **ResourceTransaction** for consumption tracking
5. **FacilitySpaceInventory** for space management

## Implementation Steps

### Step 1: Create Prisma Models

The implementation requires only 2 new models following the existing patterns.

### Step 2: Update Existing Model Relations

Add to `TileFacilityInstance` model:
```prisma
// In tile-facility-instance.prisma
productProductions    ProductProduction[]     @relation("FactoryProductions")
```

Add to `ProductFormula` model:
```prisma
// In product-formula.prisma
productions           ProductProduction[]
```

### Step 3: Create Service Layer

#### ProductionService Implementation

```typescript
// src/product-production/services/production.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ProductionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculate production costs using the formula
   */
  async calculateProductionCost(
    formulaId: number,
    quantity: number,
    factoryId: string
  ): Promise<ProductionCostResult> {
    // Get formula with pre-calculated costs
    const formula = await this.prisma.productFormula.findUnique({
      where: { id: formulaId },
      include: {
        materials: {
          include: { rawMaterial: true }
        },
        craftCategories: {
          include: { craftCategory: true }
        }
      }
    });

    // Get infrastructure connections for pricing
    const connections = await this.getInfrastructureConnections(factoryId);
    
    // Calculate material cost A
    const materialCostA = formula.totalMaterialCost.mul(quantity);
    
    // Calculate final water consumption
    const waterConsumption = Math.ceil(
      formula.totalSetupWaterCost.toNumber() + 
      materialCostA.mul(formula.totalWaterPercent).div(100).toNumber()
    );
    
    // Calculate final power consumption
    const powerConsumption = Math.ceil(
      formula.totalSetupPowerCost.toNumber() + 
      materialCostA.mul(formula.totalPowerPercent).div(100).toNumber()
    );
    
    // Calculate gold cost
    const goldCost = formula.totalSetupGoldCost.add(
      materialCostA.mul(formula.totalGoldPercent).div(100)
    );
    
    // Calculate water and power costs with infrastructure pricing
    const waterCost = new Decimal(waterConsumption).mul(connections.water.unitPrice);
    const powerCost = new Decimal(powerConsumption).mul(connections.power.unitPrice);
    
    // Calculate carbon emission
    const totalSetup = formula.totalSetupWaterCost
      .add(formula.totalSetupPowerCost)
      .add(formula.totalSetupGoldCost);
    const carbonEmission = totalSetup
      .add(materialCostA.mul(formula.totalPercent).div(100))
      .mul(0.01);
    
    // Calculate combined yield
    const combinedYield = this.calculateCombinedYield(formula.craftCategories);
    const expectedOutput = Math.floor(quantity * combinedYield);
    
    return {
      waterConsumption,
      powerConsumption,
      waterCost: waterCost.toNumber(),
      powerCost: powerCost.toNumber(),
      goldCost: goldCost.toNumber(),
      materialCost: materialCostA.toNumber(),
      totalCost: waterCost.add(powerCost).add(goldCost).toNumber(),
      carbonEmission: carbonEmission.toNumber(),
      combinedYield,
      expectedOutput
    };
  }

  /**
   * Execute production with atomic transaction
   */
  async executeProduction(
    request: ProductionRequest
  ): Promise<ProductionResult> {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Validate all prerequisites
      await this.validateProduction(request, tx);
      
      // 2. Calculate costs
      const costs = await this.calculateProductionCost(
        request.formulaId,
        request.quantity,
        request.factoryId
      );
      
      // 3. Consume materials
      const materialsConsumed = await this.consumeMaterials(
        request.factoryId,
        request.formulaId,
        request.quantity,
        tx
      );
      
      // 4. Create resource transactions for water/power
      const waterTransaction = await this.createResourceTransaction(
        'WATER',
        costs.waterConsumption,
        costs.waterCost,
        request,
        tx
      );
      
      const powerTransaction = await this.createResourceTransaction(
        'POWER',
        costs.powerConsumption,
        costs.powerCost,
        request,
        tx
      );
      
      // 5. Deduct gold from team
      await this.deductTeamFunds(
        request.teamId,
        costs.goldCost,
        tx
      );
      
      // 6. Calculate space changes
      const spaceImpact = await this.calculateSpaceImpact(
        request.factoryId,
        request.formulaId,
        request.quantity,
        costs.expectedOutput,
        tx
      );
      
      // 7. Add products to inventory
      await this.addProductsToInventory(
        request.factoryId,
        request.formulaId,
        costs.expectedOutput,
        tx
      );
      
      // 8. Update space inventory
      await this.updateSpaceInventory(
        request.factoryId,
        spaceImpact,
        tx
      );
      
      // 9. Create production record
      const production = await tx.productProduction.create({
        data: {
          productionNumber: this.generateProductionNumber(),
          factoryId: request.factoryId,
          formulaId: request.formulaId,
          requestedQuantity: request.quantity,
          producedQuantity: costs.expectedOutput,
          combinedYield: costs.combinedYield,
          waterConsumed: costs.waterConsumption,
          powerConsumed: costs.powerConsumption,
          waterCost: costs.waterCost,
          powerCost: costs.powerCost,
          goldCost: costs.goldCost,
          materialCost: costs.materialCost,
          totalCost: costs.totalCost,
          materialSpaceFreed: spaceImpact.materialSpaceFreed,
          productSpaceUsed: spaceImpact.productSpaceUsed,
          netSpaceChange: spaceImpact.netSpaceChange,
          carbonEmission: costs.carbonEmission,
          status: 'SUCCESS',
          teamId: request.teamId,
          activityId: request.activityId,
          initiatedBy: request.userId,
          transactionIds: [waterTransaction.id, powerTransaction.id],
          materialsConsumed: JSON.stringify(materialsConsumed),
          craftCategoriesUsed: JSON.stringify(request.formula.craftCategories)
        }
      });
      
      return {
        success: true,
        productionId: production.id,
        producedQuantity: costs.expectedOutput,
        totalCost: costs.totalCost
      };
    });
  }

  /**
   * Calculate combined yield from multiple craft categories
   */
  private calculateCombinedYield(
    craftCategories: ProductFormulaCraftCategory[]
  ): number {
    return craftCategories.reduce((yield, cc) => {
      return yield * (cc.craftCategory.yieldPercentage.toNumber() / 100);
    }, 1);
  }

  /**
   * Consume raw materials from inventory
   */
  private async consumeMaterials(
    factoryId: string,
    formulaId: number,
    quantity: number,
    tx: any
  ): Promise<MaterialConsumption[]> {
    const formula = await tx.productFormula.findUnique({
      where: { id: formulaId },
      include: {
        materials: {
          include: { rawMaterial: true }
        }
      }
    });

    const spaceInventory = await tx.facilitySpaceInventory.findUnique({
      where: { facilityInstanceId: factoryId }
    });

    const consumed = [];
    
    for (const material of formula.materials) {
      const requiredQuantity = material.quantity.mul(quantity);
      
      // Find inventory item
      const inventoryItem = await tx.facilityInventoryItem.findFirst({
        where: {
          inventoryId: spaceInventory.id,
          itemType: 'RAW_MATERIAL',
          rawMaterialId: material.rawMaterialId
        }
      });
      
      if (!inventoryItem || inventoryItem.quantity.lt(requiredQuantity)) {
        throw new Error(`Insufficient ${material.rawMaterial.nameEn}`);
      }
      
      // Update inventory
      await tx.facilityInventoryItem.update({
        where: { id: inventoryItem.id },
        data: {
          quantity: inventoryItem.quantity.sub(requiredQuantity),
          totalSpaceOccupied: inventoryItem.totalSpaceOccupied.sub(
            requiredQuantity.mul(material.rawMaterial.carbonEmission)
          )
        }
      });
      
      consumed.push({
        rawMaterialId: material.rawMaterialId,
        materialName: material.rawMaterial.nameEn,
        quantityRequired: requiredQuantity.toNumber(),
        unitCost: material.rawMaterial.totalCost.toNumber(),
        spaceFreed: requiredQuantity.mul(material.rawMaterial.carbonEmission).toNumber()
      });
    }
    
    return consumed;
  }

  /**
   * Create resource transaction for water/power consumption
   */
  private async createResourceTransaction(
    resourceType: 'WATER' | 'POWER',
    quantity: number,
    cost: number,
    request: ProductionRequest,
    tx: any
  ): Promise<any> {
    const connectionType = resourceType === 'WATER' ? 'WATER' : 'POWER';
    
    const connection = await tx.infrastructureConnection.findFirst({
      where: {
        consumerFacilityId: request.factoryId,
        connectionType: connectionType,
        status: 'ACTIVE'
      }
    });
    
    if (!connection) {
      throw new Error(`No active ${resourceType} connection`);
    }
    
    return await tx.resourceTransaction.create({
      data: {
        resourceType,
        quantity: new Decimal(quantity),
        unitPrice: connection.unitPrice,
        totalAmount: new Decimal(cost),
        connectionId: connection.id,
        consumerFacilityId: request.factoryId,
        consumerTeamId: request.teamId,
        providerFacilityId: connection.providerFacilityId,
        providerTeamId: connection.providerTeamId,
        purpose: 'PRODUCT_MANUFACTURING',
        referenceType: 'PRODUCTION',
        referenceId: request.productionId,
        status: 'SUCCESS',
        activityId: request.activityId,
        initiatedBy: request.userId
      }
    });
  }
}
```

### Step 4: Create Controller Layer

```typescript
// src/product-production/controllers/production.controller.ts
import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserAuthGuard } from '@/common/guards/user-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Product Production')
@Controller('api/user/product-production')
@UseGuards(UserAuthGuard)
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Get('factories')
  @ApiOperation({ summary: 'Get available factories for production' })
  async getFactories(
    @CurrentUser() user: UserPayload,
    @Query('formulaId') formulaId?: number
  ) {
    return await this.productionService.getAvailableFactories(
      user.teamId,
      user.activityId,
      formulaId
    );
  }

  @Post('calculate-cost')
  @ApiOperation({ summary: 'Calculate production costs' })
  async calculateCost(
    @CurrentUser() user: UserPayload,
    @Body() dto: CalculateCostDto
  ) {
    // Validate user has access to factory
    await this.validateFactoryAccess(user.teamId, dto.factoryId);
    
    return await this.productionService.calculateProductionCost(
      dto.formulaId,
      dto.quantity,
      dto.factoryId
    );
  }

  @Post('produce')
  @ApiOperation({ summary: 'Execute production' })
  async produce(
    @CurrentUser() user: UserPayload,
    @Body() dto: ProduceDto
  ) {
    const request: ProductionRequest = {
      ...dto,
      teamId: user.teamId,
      userId: user.id,
      activityId: user.activityId
    };
    
    return await this.productionService.executeProduction(request);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get production history' })
  async getHistory(
    @CurrentUser() user: UserPayload,
    @Query() query: GetHistoryDto
  ) {
    return await this.productionService.getProductionHistory({
      teamId: user.teamId,
      ...query
    });
  }
}
```

### Step 5: Create DTOs

```typescript
// src/product-production/dto/production.dto.ts
import { IsInt, Min, IsUUID, IsOptional } from 'class-validator';

export class CalculateCostDto {
  @IsUUID()
  factoryId: string;

  @IsInt()
  formulaId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class ProduceDto extends CalculateCostDto {
  @IsOptional()
  costConfirmation?: {
    expectedCost: number;
    acceptPrice: boolean;
  };
}

export class GetHistoryDto {
  @IsOptional()
  @IsUUID()
  factoryId?: string;

  @IsOptional()
  @IsInt()
  formulaId?: number;

  @IsOptional()
  status?: 'SUCCESS' | 'FAILED';

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
```

### Step 6: Integration with Existing Systems

#### Update FacilityInventoryItem for Products

```typescript
private async addProductsToInventory(
  factoryId: string,
  formulaId: number,
  quantity: number,
  tx: any
): Promise<void> {
  const spaceInventory = await tx.facilitySpaceInventory.findUnique({
    where: { facilityInstanceId: factoryId }
  });
  
  const formula = await tx.productFormula.findUnique({
    where: { id: formulaId }
  });
  
  // Check if product already exists in inventory
  const existingProduct = await tx.facilityInventoryItem.findFirst({
    where: {
      inventoryId: spaceInventory.id,
      itemType: 'PRODUCT',
      productFormulaId: formulaId
    }
  });
  
  if (existingProduct) {
    // Update existing product
    await tx.facilityInventoryItem.update({
      where: { id: existingProduct.id },
      data: {
        quantity: existingProduct.quantity.add(quantity),
        totalSpaceOccupied: existingProduct.totalSpaceOccupied.add(
          new Decimal(quantity).mul(formula.productFormulaCarbonEmission)
        )
      }
    });
  } else {
    // Create new product entry
    await tx.facilityInventoryItem.create({
      data: {
        inventoryId: spaceInventory.id,
        itemType: 'PRODUCT',
        productFormulaId: formulaId,
        quantity: new Decimal(quantity),
        unitSpaceOccupied: formula.productFormulaCarbonEmission,
        totalSpaceOccupied: new Decimal(quantity).mul(formula.productFormulaCarbonEmission),
        unitCost: new Decimal(0), // Will be calculated based on production cost
        totalValue: new Decimal(0)
      }
    });
  }
}
```

#### Update Space Inventory

```typescript
private async updateSpaceInventory(
  factoryId: string,
  spaceImpact: SpaceImpact,
  tx: any
): Promise<void> {
  await tx.facilitySpaceInventory.update({
    where: { facilityInstanceId: factoryId },
    data: {
      usedSpace: { increment: spaceImpact.netSpaceChange },
      availableSpace: { decrement: spaceImpact.netSpaceChange },
      rawMaterialSpace: { decrement: spaceImpact.materialSpaceFreed },
      productSpace: { increment: spaceImpact.productSpaceUsed }
    }
  });
}
```

### Step 7: Error Handling

```typescript
// src/product-production/exceptions/production.exceptions.ts
export class InsufficientMaterialsException extends BusinessException {
  constructor(materials: MaterialShortage[]) {
    super(
      'INSUFFICIENT_MATERIALS',
      'Insufficient raw materials in factory',
      { missing: materials }
    );
  }
}

export class NoInfrastructureException extends BusinessException {
  constructor(type: 'WATER' | 'POWER') {
    super(
      'NO_INFRASTRUCTURE',
      `Factory lacks ${type.toLowerCase()} connection`
    );
  }
}

export class InsufficientSpaceException extends BusinessException {
  constructor(needed: number, available: number) {
    super(
      'INSUFFICIENT_SPACE',
      `Insufficient space. Need ${needed}, have ${available}`
    );
  }
}
```

### Step 8: Testing

#### Unit Tests

```typescript
// src/product-production/services/production.service.spec.ts
describe('ProductionService', () => {
  let service: ProductionService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ProductionService, PrismaService]
    }).compile();

    service = module.get<ProductionService>(ProductionService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('calculateProductionCost', () => {
    it('should calculate costs correctly', async () => {
      // Mock formula with craft categories
      const mockFormula = {
        totalMaterialCost: new Decimal(100),
        totalSetupWaterCost: new Decimal(62),
        totalSetupPowerCost: new Decimal(300),
        totalSetupGoldCost: new Decimal(114),
        totalWaterPercent: new Decimal(4),
        totalPowerPercent: new Decimal(37.2),
        totalGoldPercent: new Decimal(8.8),
        totalPercent: new Decimal(50)
      };

      jest.spyOn(prisma.productFormula, 'findUnique')
        .mockResolvedValue(mockFormula);

      const result = await service.calculateProductionCost(1, 10, 'factory-1');

      expect(result.waterConsumption).toBe(102); // ⌈62 + 1000*4%⌉
      expect(result.powerConsumption).toBe(672); // ⌈300 + 1000*37.2%⌉
      expect(result.goldCost).toBe(202); // 114 + 1000*8.8%
    });
  });

  describe('executeProduction', () => {
    it('should execute production atomically', async () => {
      // Test transaction rollback on failure
      const request = {
        factoryId: 'factory-1',
        formulaId: 1,
        quantity: 10,
        teamId: 'team-1',
        userId: 'user-1',
        activityId: 1
      };

      // Mock insufficient materials
      jest.spyOn(prisma, '$transaction')
        .mockRejectedValue(new InsufficientMaterialsException([]));

      await expect(service.executeProduction(request))
        .rejects.toThrow(InsufficientMaterialsException);
    });
  });
});
```

#### Integration Tests

```typescript
// e2e/product-production.e2e-spec.ts
describe('Product Production E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('POST /api/user/product-production/produce', () => {
    it('should complete production successfully', async () => {
      // Setup test data
      await setupTestFactory();
      await setupTestFormula();
      await addMaterialsToInventory();
      
      const response = await request(app.getHttpServer())
        .post('/api/user/product-production/produce')
        .set('Authorization', 'Bearer ' + getTestToken())
        .send({
          factoryId: 'test-factory',
          formulaId: 1,
          quantity: 10
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.producedQuantity).toBeGreaterThan(0);
    });
  });
});
```

## Performance Optimization

### 1. Use Pre-calculated Formula Costs

```typescript
// ProductFormula already has pre-calculated costs
// No need to recalculate on every production
const formula = await prisma.productFormula.findUnique({
  where: { id: formulaId },
  select: {
    totalMaterialCost: true,
    totalSetupWaterCost: true,
    totalSetupPowerCost: true,
    totalSetupGoldCost: true,
    totalWaterPercent: true,
    totalPowerPercent: true,
    totalGoldPercent: true
  }
});
```

### 2. Batch Database Operations

```typescript
// Use Promise.all for independent operations
const [formula, factory, inventory] = await Promise.all([
  prisma.productFormula.findUnique({ where: { id: formulaId }}),
  prisma.tileFacilityInstance.findUnique({ where: { id: factoryId }}),
  prisma.facilitySpaceInventory.findUnique({ where: { facilityInstanceId: factoryId }})
]);
```

### 3. Index Optimization

```sql
-- Add composite indexes for common queries
CREATE INDEX idx_production_team_activity_date 
ON product_productions(teamId, activityId, producedAt DESC);

CREATE INDEX idx_inventory_item_type_formula 
ON facility_inventory_items(itemType, productFormulaId)
WHERE itemType = 'PRODUCT';
```

## Common Integration Issues

### Issue 1: Decimal Precision

```typescript
// Problem: JavaScript number loses precision
const cost = 100.123456789; // Loses precision

// Solution: Use Prisma's Decimal type
import { Decimal } from '@prisma/client/runtime/library';
const cost = new Decimal('100.123456789');
```

### Issue 2: Transaction Rollback

```typescript
// Ensure all operations are in the same transaction
await prisma.$transaction(async (tx) => {
  // All database operations must use tx, not prisma
  await tx.facilityInventoryItem.update(...);
  await tx.resourceTransaction.create(...);
  // If any operation fails, all are rolled back
});
```

### Issue 3: Concurrent Productions

```typescript
// Use optimistic locking to prevent race conditions
await prisma.facilityInventoryItem.update({
  where: { 
    id: itemId,
    version: currentVersion // Optimistic lock
  },
  data: {
    quantity: { decrement: amount },
    version: { increment: 1 }
  }
});
```

## Error Tracking

```typescript
// Log production failures for analysis
logger.error('Production failed', {
  productionId: production.id,
  factoryId: request.factoryId,
  formulaId: request.formulaId,
  error: error.message,
  stack: error.stack,
  context: {
    teamId: request.teamId,
    userId: request.userId,
    quantity: request.quantity
  }
});
```

## Deployment Checklist

### Pre-deployment
- [ ] Run Prisma migrations: `pnpm run prisma:migrate`
- [ ] Generate Prisma client: `pnpm run prisma:generate`
- [ ] Update API documentation
- [ ] Run all tests
- [ ] Performance testing with load

### Post-deployment
- [ ] Monitor error rates
- [ ] Check resource consumption patterns
- [ ] Verify space calculations
- [ ] Validate yield calculations

## Summary

This implementation integrates product production seamlessly with:
1. **Existing models** - Only 2 new tables, maximum reuse
2. **Transaction safety** - Atomic operations prevent inconsistencies
3. **Performance** - Pre-calculated costs, efficient queries
4. **Error handling** - Comprehensive validation and recovery