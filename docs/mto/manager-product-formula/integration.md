# Manager Product Formula Integration Guide

## Overview
This document details how the Manager Product Formula module integrates with MTO (Made-To-Order) types, existing systems, and the broader platform architecture.

## MTO Type Integration

### MTO Type 1 Integration

#### Data Model Connection
```prisma
model ManagerRequirementProductType1 {
  id                            Int @id @default(autoincrement())

  // Link to Manager Product Formula
  managerProductFormulaId       Int
  managerProductFormula         ManagerProductFormula @relation(fields: [managerProductFormulaId], references: [id])

  // MTO Type 1 specific fields
  purchaseGoldPrice             Decimal @db.Decimal(10, 2)
  basePurchaseNumber            Int
  releaseTime                   DateTime
  settlementTime                DateTime
  overallPurchaseNumber         Int
  overallPurchaseBudget         Decimal @db.Decimal(12, 2)
  baseCountPopulationNumber     Int @default(1000)

  // Tile-based requirements
  tileRequirements              TileRequirement[]
}
```

#### Business Process Integration

1. **Requirement Creation**
   - Manager creates product formula first
   - Formula defines product specifications (materials, craft categories)
   - MTO Type 1 requirement references the formula

2. **Release Time Processing**
   ```typescript
   // Calculate tile requirements based on population
   for (const tile of activityTiles) {
     const requirement = basePurchaseNumber *
       Math.floor(tile.population / baseCountPopulationNumber);

     // Adjust if total exceeds overall purchase number
     if (totalRequirement > overallPurchaseNumber) {
       adjustRequirements();
     }
   }
   ```

3. **Delivery Validation**
   ```typescript
   async validateDelivery(
     teamFormulaId: number,
     managerFormulaId: number,
     quantity: number
   ): Promise<ValidationResult> {
     // 1. Load both formulas
     const teamFormula = await this.getTeamFormula(teamFormulaId);
     const managerFormula = await this.getManagerFormula(managerFormulaId);

     // 2. Validate materials match
     const materialsValid = this.validateMaterials(
       teamFormula.materials,
       managerFormula.materials
     );

     // 3. Validate craft categories match
     const categoriesValid = this.validateCategories(
       teamFormula.categories,
       managerFormula.categories
     );

     return { materialsValid, categoriesValid };
   }
   ```

4. **Settlement Processing**
   ```typescript
   async settleMTOType1(mtoId: number): Promise<void> {
     // Lock the formula during settlement
     await this.lockFormula(mtoRequirement.managerProductFormulaId);

     // Process deliveries per tile
     for (const tile of tileRequirements) {
       const deliveries = await this.getDeliveries(tile.id);

       for (const delivery of deliveries) {
         if (await this.validateAgainstFormula(delivery)) {
           await this.processPayment(delivery.team, purchaseGoldPrice);
           await this.updateInventory(delivery);
         }
       }
     }

     // Unlock formula after settlement
     await this.unlockFormula(mtoRequirement.managerProductFormulaId);
   }
   ```

### MTO Type 2 Integration

#### Data Model Connection
```prisma
model ManagerRequirementProductType2 {
  id                            Int @id @default(autoincrement())

  // Link to Manager Product Formula
  managerProductFormulaId       Int
  managerProductFormula         ManagerProductFormula @relation(fields: [managerProductFormulaId], references: [id])

  // MTO Type 2 specific fields
  releaseTime                   DateTime
  settlementTime                DateTime
  overallPurchaseBudget         Decimal @db.Decimal(12, 2)

  // MALL submissions
  mallSubmissions               MallProductSubmission[]
}
```

#### Business Process Integration

1. **MALL Product Submission**
   ```typescript
   async submitToMall(
     teamId: string,
     formulaId: number,
     quantity: number,
     unitPrice: number
   ): Promise<void> {
     // Validate team has MALL facility
     const hasMall = await this.checkMallFacility(teamId);
     if (!hasMall) throw new Error('Team must have MALL facility');

     // Validate products match formula
     const teamProducts = await this.getTeamProducts(teamId);
     const isValid = await this.validateAgainstFormula(
       teamProducts,
       formulaId
     );

     if (isValid) {
       await this.createMallSubmission({
         teamId,
         formulaId,
         quantity,
         unitPrice
       });
     }
   }
   ```

2. **Budget Distribution**
   ```typescript
   async calculateTileBudgets(mtoId: number): Promise<Map<number, number>> {
     const mto = await this.getMTOType2(mtoId);
     const tilesWithMall = await this.getTilesWithMall();

     const totalPopulation = tilesWithMall.reduce(
       (sum, tile) => sum + tile.population, 0
     );

     const budgets = new Map();
     for (const tile of tilesWithMall) {
       const tileBudget = (tile.population / totalPopulation) *
         mto.overallPurchaseBudget;
       budgets.set(tile.id, tileBudget);
     }

     return budgets;
   }
   ```

3. **Settlement Processing**
   ```typescript
   async settleMTOType2(mtoId: number): Promise<void> {
     const tileBudgets = await this.calculateTileBudgets(mtoId);

     for (const [tileId, budget] of tileBudgets) {
       const submissions = await this.getMallSubmissions(tileId);

       // Sort by price (lowest first)
       submissions.sort((a, b) => a.unitPrice - b.unitPrice);

       let remainingBudget = budget;
       for (const submission of submissions) {
         const canPurchase = Math.floor(remainingBudget / submission.unitPrice);
         const purchased = Math.min(canPurchase, submission.quantity);

         if (purchased > 0) {
           const cost = purchased * submission.unitPrice;
           await this.processTeamPayment(submission.teamId, cost);
           remainingBudget -= cost;
         }
       }
     }
   }
   ```

## Existing System Integration

### Team Product Formula Integration

#### Validation Service
```typescript
@Injectable()
export class FormulaComparisonService {
  async compareFormulas(
    managerFormulaId: number,
    teamFormulaId: number
  ): Promise<ComparisonResult> {
    const managerFormula = await this.managerFormulaRepo.findById(managerFormulaId);
    const teamFormula = await this.teamFormulaRepo.findById(teamFormulaId);

    return {
      materialsMatch: this.compareMaterials(
        managerFormula.materials,
        teamFormula.materials
      ),
      categoriesMatch: this.compareCategories(
        managerFormula.categories,
        teamFormula.categories
      ),
      costsAlignment: this.compareCosts(
        managerFormula,
        teamFormula
      )
    };
  }

  private compareMaterials(
    managerMaterials: Material[],
    teamMaterials: Material[]
  ): boolean {
    // Check all manager materials exist in team formula
    for (const mMaterial of managerMaterials) {
      const found = teamMaterials.find(
        t => t.rawMaterialId === mMaterial.rawMaterialId &&
             t.quantity === mMaterial.quantity
      );
      if (!found) return false;
    }
    return true;
  }
}
```

### Activity Module Integration

#### Activity Service Extension
```typescript
@Injectable()
export class ActivityService {
  async getActivityFormulas(
    activityId: string,
    userId: string
  ): Promise<ManagerProductFormula[]> {
    // Verify user has access to activity
    await this.verifyActivityAccess(activityId, userId);

    // Get formulas based on user role
    const user = await this.userService.findById(userId);

    if (user.userType === UserType.MANAGER) {
      // Managers see ALL formulas in their activity (full collaboration)
      // This includes formulas created by other managers
      return this.managerFormulaRepo.findByActivity(activityId, {
        includeDeleted: false,
        includeCreatorInfo: true, // Show who created each formula
        includeAuditTrail: true   // Show modification history
      });
    } else {
      // Workers and Students see only active, unlocked formulas
      return this.managerFormulaRepo.findActiveByActivity(activityId, {
        includeDeleted: false,
        onlyUnlocked: true
      });
    }
  }

  async canManagerModifyFormula(
    managerId: string,
    formulaId: number
  ): Promise<boolean> {
    // Get manager's activity
    const managerActivity = await this.getUserActivity(managerId);

    // Get formula's activity
    const formula = await this.managerFormulaRepo.findById(formulaId);

    // Manager can modify any formula in their activity
    return managerActivity.id === formula.activityId && !formula.isLocked;
  }
}
```

### Authentication & Authorization Integration

#### Manager Guard Implementation
```typescript
@Injectable()
export class ManagerFormulaGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if user is a manager
    if (user.userType !== UserType.MANAGER) {
      return false;
    }

    // For formula operations, verify activity match
    const formulaId = request.params?.id;
    if (formulaId) {
      // Check if formula belongs to manager's activity
      const formula = await this.formulaService.findById(formulaId);
      const userActivity = await this.userService.getActivity(user.id);

      if (formula.activityId !== userActivity.id) {
        return false; // Formula from different activity
      }
    }

    // For activity-based operations
    const activityId = request.body?.activityId ||
                      request.query?.activityId;

    if (activityId) {
      // Verify manager belongs to this activity
      return this.verifyManagerActivityAccess(user.id, activityId);
    }

    return true;
  }

  private async verifyManagerActivityAccess(
    managerId: string,
    activityId: string
  ): Promise<boolean> {
    // Manager can access all formulas within their activity
    const userActivity = await this.userService.getActivity(managerId);
    return userActivity.id === activityId;
  }
}
```

### Reference Data Service Integration

#### Raw Material Service
```typescript
@Injectable()
export class RawMaterialService {
  async getAllRawMaterials(
    query: RawMaterialQueryDto
  ): Promise<PaginatedResult<RawMaterial>> {
    const { page = 1, limit = 50, search, origin, sortBy = 'materialNumber', sortOrder = 'asc' } = query;

    const where = {
      isActive: true,
      isDeleted: false,
      ...(origin && { origin }),
      ...(search && {
        OR: [
          { nameEn: { contains: search, mode: 'insensitive' } },
          { nameZh: { contains: search } }
        ]
      })
    };

    const [items, total] = await Promise.all([
      this.prisma.rawMaterial.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          materialNumber: true,
          origin: true,
          nameEn: true,
          nameZh: true,
          waterRequired: true,
          powerRequired: true,
          totalCost: true,
          goldCost: true,
          carbonEmission: true,
          isActive: true
        }
      }),
      this.prisma.rawMaterial.count({ where })
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}
```

#### Craft Category Service
```typescript
@Injectable()
export class CraftCategoryService {
  async getAllCraftCategories(
    filters: CraftCategoryFilters
  ): Promise<CraftCategory[]> {
    const { categoryType, technologyLevel } = filters;

    return this.prisma.craftCategory.findMany({
      where: {
        isActive: true,
        ...(categoryType && { categoryType }),
        ...(technologyLevel && { technologyLevel })
      },
      orderBy: [
        { categoryType: 'asc' },
        { technologyLevel: 'asc' }
      ],
      select: {
        id: true,
        categoryType: true,
        technologyLevel: true,
        nameEn: true,
        nameZh: true,
        fixedWaterCost: true,
        fixedPowerCost: true,
        fixedGoldCost: true,
        variableWaterPercent: true,
        variablePowerPercent: true,
        variableGoldPercent: true,
        yieldPercentage: true,
        isActive: true
      }
    });
  }
}
```

### Transportation Module Integration

#### Product Delivery Service
```typescript
@Injectable()
export class ProductDeliveryService {
  async deliverMTOProducts(
    transportOrder: TransportationOrder,
    mtoRequirementId: number
  ): Promise<void> {
    // Get MTO requirement and formula
    const requirement = await this.getMTORequirement(mtoRequirementId);
    const formula = requirement.managerProductFormula;

    // Validate products match formula
    const products = transportOrder.products;
    const isValid = await this.validateProductsAgainstFormula(
      products,
      formula
    );

    if (!isValid) {
      throw new ValidationException('Products do not match MTO formula');
    }

    // Process delivery
    await this.processDelivery(transportOrder);
  }
}
```

### Facility Module Integration

#### MALL Facility Operations
```typescript
@Injectable()
export class MallFacilityService {
  async submitMTOProducts(
    facilityId: number,
    mtoType2Id: number,
    products: ProductSubmission[]
  ): Promise<void> {
    // Verify facility is MALL type
    const facility = await this.facilityRepo.findById(facilityId);
    if (facility.type !== FacilityType.MALL) {
      throw new Error('Only MALL facilities can submit to MTO Type 2');
    }

    // Get MTO Type 2 requirement
    const mto = await this.mtoService.getMTOType2(mtoType2Id);

    // Validate products against formula
    for (const product of products) {
      const isValid = await this.validateAgainstFormula(
        product,
        mto.managerProductFormulaId
      );

      if (isValid) {
        await this.createMallSubmission(facilityId, product);
      }
    }
  }
}
```

## API Integration Points

### RESTful Endpoints
```typescript
// Manager endpoints
POST   /api/user/manager/mto/product-formulas
GET    /api/user/manager/mto/product-formulas
GET    /api/user/manager/mto/product-formulas/:id
PUT    /api/user/manager/mto/product-formulas/:id
DELETE /api/user/manager/mto/product-formulas/:id
POST   /api/user/manager/mto/product-formulas/:id/clone

// Reference data endpoints (for formula creation)
GET    /api/user/manager/mto/raw-materials        // Get all raw materials
GET    /api/user/manager/mto/craft-categories     // Get all craft categories

// Validation endpoints (accessible by teams)
POST   /api/user/mto/validate-formula
GET    /api/user/mto/formula-requirements/:activityId

// MTO integration endpoints
POST   /api/user/mto/type1/deliver
POST   /api/user/mto/type2/submit
GET    /api/user/mto/active-requirements
```

### WebSocket Events
```typescript
// Real-time updates for MTO events
socket.emit('mto:formula:created', { formulaId, activityId });
socket.emit('mto:formula:locked', { formulaId, mtoId });
socket.emit('mto:formula:unlocked', { formulaId });
socket.emit('mto:requirement:released', { type, formulaId });
socket.emit('mto:settlement:started', { mtoId });
socket.emit('mto:settlement:completed', { mtoId, results });
```

## Database Transaction Management

### Formula Creation Transaction
```typescript
async createFormula(
  dto: CreateFormulaDto,
  managerId: string
): Promise<ManagerProductFormula> {
  return this.prisma.executeTransaction(async (tx) => {
    // 0. Verify manager's activity matches requested activity
    const managerActivity = await this.getUserActivity(managerId, tx);
    if (managerActivity.id !== dto.activityId) {
      throw new ForbiddenException('Cannot create formula in different activity');
    }

    // 1. Create formula with manager tracking
    const formula = await tx.managerProductFormula.create({
      data: {
        ...dto,
        createdBy: managerId, // Track which manager created it
      }
    });

    // 2. Create materials
    await tx.managerProductFormulaMaterial.createMany({
      data: dto.materials.map(m => ({
        managerProductFormulaId: formula.id,
        ...m
      }))
    });

    // 3. Create craft categories
    await tx.managerProductFormulaCraftCategory.createMany({
      data: dto.categories.map(c => ({
        managerProductFormulaId: formula.id,
        ...c
      }))
    });

    // 4. Calculate and update costs
    const costs = await this.calculateCosts(formula.id, tx);
    await tx.managerProductFormula.update({
      where: { id: formula.id },
      data: costs
    });

    // 5. Emit event for other managers in activity
    this.eventEmitter.emit('formula:created', {
      formulaId: formula.id,
      activityId: formula.activityId,
      createdBy: managerId
    });

    return formula;
  });
}
```

### Collaborative Formula Update
```typescript
async updateFormula(
  formulaId: number,
  dto: UpdateFormulaDto,
  managerId: string
): Promise<ManagerProductFormula> {
  return this.prisma.executeTransaction(async (tx) => {
    // 1. Load formula with pessimistic lock
    const formula = await tx.managerProductFormula.findUnique({
      where: { id: formulaId },
      lock: { mode: 'Exclusive' } // Prevent concurrent edits
    });

    // 2. Verify manager is in same activity
    const managerActivity = await this.getUserActivity(managerId, tx);
    if (formula.activityId !== managerActivity.id) {
      throw new ForbiddenException('Cannot modify formula from different activity');
    }

    // 3. Check if formula is locked
    if (formula.isLocked) {
      throw new ConflictException('Formula is locked by active MTO');
    }

    // 4. Update formula with tracking
    const updated = await tx.managerProductFormula.update({
      where: { id: formulaId },
      data: {
        ...dto,
        updatedBy: managerId, // Track which manager updated
        updatedAt: new Date()
      }
    });

    // 5. Emit update event
    this.eventEmitter.emit('formula:updated', {
      formulaId,
      updatedBy: managerId,
      changes: dto
    });

    return updated;
  });
}
```

## Error Handling Integration

### Custom Exceptions
```typescript
export class FormulaLockedException extends BusinessException {
  constructor(formulaId: number, mtoId: string) {
    super('FORMULA_LOCKED', {
      formulaId,
      mtoId,
      message: 'Formula is locked by active MTO requirement'
    });
  }
}

export class FormulaValidationException extends ValidationException {
  constructor(errors: ValidationError[]) {
    super('FORMULA_VALIDATION_FAILED', {
      errors,
      message: 'Formula validation failed'
    });
  }
}
```

## Performance Optimization

### Caching Strategy
```typescript
@Injectable()
export class FormulaCacheService {
  private cache = new NodeCache({ stdTTL: 600 }); // 10 min TTL

  async getFormula(id: number): Promise<ManagerProductFormula> {
    const cacheKey = `formula:${id}`;
    let formula = this.cache.get<ManagerProductFormula>(cacheKey);

    if (!formula) {
      formula = await this.formulaRepo.findByIdWithRelations(id);
      this.cache.set(cacheKey, formula);
    }

    return formula;
  }

  invalidate(id: number): void {
    this.cache.del(`formula:${id}`);
    this.cache.del(`formula:list:*`); // Invalidate list caches
  }
}
```

### Query Optimization
```typescript
// Optimized query with eager loading
async getFormulaWithDetails(id: number): Promise<ManagerProductFormula> {
  return this.prisma.managerProductFormula.findUnique({
    where: { id },
    include: {
      materials: {
        include: {
          rawMaterial: true
        }
      },
      craftCategories: {
        include: {
          craftCategory: true
        }
      },
      activity: true,
      createdByUser: {
        select: {
          id: true,
          username: true,
          email: true
        }
      }
    }
  });
}
```

## Testing Integration

### Integration Test Example
```typescript
describe('Manager Product Formula Integration', () => {
  it('should validate team delivery against manager formula', async () => {
    // Create manager formula
    const managerFormula = await createManagerFormula({
      materials: [
        { rawMaterialId: 1, quantity: 10 },
        { rawMaterialId: 2, quantity: 5 }
      ],
      categories: [{ craftCategoryId: 1 }]
    });

    // Create matching team formula
    const teamFormula = await createTeamFormula({
      materials: [
        { rawMaterialId: 1, quantity: 10 },
        { rawMaterialId: 2, quantity: 5 }
      ],
      categories: [{ craftCategoryId: 1 }]
    });

    // Validate
    const result = await validateDelivery(
      teamFormula.id,
      managerFormula.id
    );

    expect(result.isValid).toBe(true);
  });
});
```