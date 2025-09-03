# Product Formula Data Model

## Overview
Database schema design for the Product Formula module using Prisma ORM with PostgreSQL, integrating with raw materials and craft categories for comprehensive production management.

**Note**: While `activityId` and `teamId` are required database fields, they are automatically populated from the authenticated user's context and do not appear in API request bodies.

## Schema Definition

### Location
`prisma/models/product-formula.prisma`

### Core Models

#### Product Formula Model
```prisma
// Product Formula Master Data
model ProductFormula {
  id                    Int                         @id @default(autoincrement())
  formulaNumber         Int                         // System-generated unique number within activity (auto-incremented)
  
  // Product Information
  productDescription    String?                     // Product description
  
  // Activity and Team Association (populated from user authentication context)
  activityId            String                      // Associated activity (from auth context)
  activity              Activity                    @relation(fields: [activityId], references: [id])
  
  teamId                String                      // Team that owns this formula (from auth context)
  team                  Team                        @relation(fields: [teamId], references: [id])
  
  // Cost Components (Calculated)
  totalMaterialCost     Decimal                     @db.Decimal(10, 2) // Sum of material costs (A in the formula)
  
  // Setup Costs (Fixed costs from all craft categories)
  totalSetupWaterCost   Decimal                     @db.Decimal(10, 2) // Sum of fixed water costs
  totalSetupPowerCost   Decimal                     @db.Decimal(10, 2) // Sum of fixed power costs  
  totalSetupGoldCost    Decimal                     @db.Decimal(10, 2) // Sum of fixed gold costs
  
  // Variable Cost Percentages (from all craft categories)
  totalWaterPercent     Decimal                     @db.Decimal(5, 2)  // Sum of water percentages
  totalPowerPercent     Decimal                     @db.Decimal(5, 2)  // Sum of power percentages
  totalGoldPercent      Decimal                     @db.Decimal(5, 2)  // Sum of gold percentages
  totalPercent          Decimal                     @db.Decimal(6, 2)  // totalWaterPercent + totalPowerPercent + totalGoldPercent
  
  // Environmental Impact
  productFormulaCarbonEmission Decimal              @db.Decimal(10, 3) // Sum of (material.quantity * material.carbonEmission) * (1 + totalPercent)
  
  
  // Metadata
  isActive              Boolean                     @default(true)
  isDeleted             Boolean                     @default(false)
  deletedAt             DateTime?
  deletedBy             String?
  createdAt             DateTime                    @default(now())
  createdBy             String?
  updatedAt             DateTime                    @updatedAt
  updatedBy             String?
  
  // Relations
  materials             ProductFormulaMaterial[]    // Material requirements
  craftCategories       ProductFormulaCraftCategory[] // Craft categories for production
  costCalculations     ProductionCostCalculation[] // Production cost calculations
  
  // Indexes
  @@index([activityId])
  @@index([teamId])
  @@index([isActive])
  @@index([isDeleted])
  @@index([formulaNumber])
  @@unique([formulaNumber, activityId]) // Ensure unique formula number per activity
  @@map("product_formulas")
}

// Product Formula Craft Category Association
model ProductFormulaCraftCategory {
  id                    Int                         @id @default(autoincrement())
  
  // Relations
  productFormulaId      Int
  productFormula        ProductFormula              @relation(fields: [productFormulaId], references: [id], onDelete: Cascade)
  
  craftCategoryId       Int
  craftCategory         CraftCategory               @relation(fields: [craftCategoryId], references: [id])
  
  // Metadata
  createdAt             DateTime                    @default(now())
  updatedAt             DateTime                    @updatedAt
  
  // Constraints
  @@unique([productFormulaId, craftCategoryId])  // No duplicate craft categories
  @@index([productFormulaId])
  @@index([craftCategoryId])
  @@map("product_formula_craft_categories")
  
  // Business Rule Constraint (enforced at application level):
  // Only one craft category per categoryType per formula is allowed
  // e.g., cannot have both MECHANICAL_MANUFACTURING_LEVEL_1 and MECHANICAL_MANUFACTURING_LEVEL_2
}

// Product Formula Material Requirements
model ProductFormulaMaterial {
  id                    Int                         @id @default(autoincrement())
  
  // Relations
  productFormulaId      Int
  productFormula        ProductFormula              @relation(fields: [productFormulaId], references: [id], onDelete: Cascade)
  
  rawMaterialId         Int
  rawMaterial           RawMaterial                 @relation(fields: [rawMaterialId], references: [id])
  
  // Material Requirements
  quantity              Decimal                     @db.Decimal(10, 3) // Quantity required (supports decimals)
  unit                  String                      @default("units") // Unit of measurement
  
  // Cost Calculation
  materialCost          Decimal                     @db.Decimal(10, 2) // quantity × material unit cost
  
  // Metadata
  isOptional            Boolean                     @default(false) // Optional material flag
  
  createdAt             DateTime                    @default(now())
  updatedAt             DateTime                    @updatedAt
  
  // Constraints
  @@unique([productFormulaId, rawMaterialId]) // No duplicate materials in formula
  @@index([productFormulaId])
  @@index([rawMaterialId])
  @@map("product_formula_materials")
}


// Production Cost Calculation (for actual production batches)
model ProductionCostCalculation {
  id                    Int                         @id @default(autoincrement())
  
  // Relations
  productFormulaId      Int
  productFormula        ProductFormula              @relation(fields: [productFormulaId], references: [id], onDelete: Cascade)
  
  // Batch Information
  batchQuantity         Int                         // Quantity being produced in this batch
  rawMaterialTotalCost  Decimal                     @db.Decimal(10, 2) // Total raw material cost (A)
  
  // Final Calculated Costs (using the exact formula from rules)
  finalWaterCost        Decimal                     @db.Decimal(10, 2) // Setup + (A * water%), rounded up if integer
  finalPowerCost        Decimal                     @db.Decimal(10, 2) // Setup + (A * power%), rounded up if integer
  finalGoldCost         Decimal                     @db.Decimal(10, 2) // Setup + (A * gold%)
  
  // Production Status
  productionStarted     Boolean                     @default(false) // Production has begun
  productionCompleted   Boolean                     @default(false) // Production finished
  
  // Metadata
  calculatedAt          DateTime                    @default(now())  // When costs were calculated
  startedAt             DateTime?                   // When production started
  completedAt           DateTime?                   // When production finished
  calculatedBy          String?                     // Who calculated the costs
  
  // Indexes
  @@index([productFormulaId])
  @@index([calculatedAt])
  @@map("production_cost_calculations")
}
```

## Calculated Fields Logic

### Manufacturing Cost Calculation (Based on Provided Rules)

The manufacturing cost system follows the exact formulas provided in the requirements:

#### Setup Costs (Fixed Costs)
Fixed costs are aggregated from all selected craft categories and remain constant regardless of production quantity:

```typescript
// Calculate total setup costs from all craft categories
function calculateSetupCosts(craftCategories: CraftCategory[]): SetupCosts {
  return craftCategories.reduce((total, cc) => ({
    water: total.water + cc.fixedWaterCost,
    power: total.power + cc.fixedPowerCost, 
    gold: total.gold + cc.fixedGoldCost
  }), { water: 0, power: 0, gold: 0 });
}

// Example: Electronic Equipment IV + Energy Utilization I
// Water: 42 + 20 = 62
// Power: 240 + 60 = 300  
// Gold: 84 + 30 = 114
```

#### Variable Cost Percentages
Variable costs are calculated as percentages of the total raw material cost (A):

```typescript
// Calculate total variable percentages from all craft categories
function calculateVariablePercentages(craftCategories: CraftCategory[]): VariablePercentages {
  return craftCategories.reduce((total, cc) => ({
    waterPercent: total.waterPercent + cc.variableWaterPercent,
    powerPercent: total.powerPercent + cc.variablePowerPercent,
    goldPercent: total.goldPercent + cc.variableGoldPercent
  }), { waterPercent: 0, powerPercent: 0, goldPercent: 0 });
}

// Example: Electronic Equipment IV + Energy Utilization I
// Water%: 2 + 2 = 4%
// Power%: 31.2 + 6 = 37.2%
// Gold%: 6.8 + 2 = 8.8%
```

#### Final Production Cost Calculation
The total cost combines setup costs with variable costs based on raw material total (A):

```typescript
// Calculate final production costs (with ceiling for water/power if integers)
function calculateFinalCosts(
  setupCosts: SetupCosts,
  variablePercents: VariablePercentages, 
  materialCostA: number
): FinalCosts {
  const waterCost = setupCosts.water + (materialCostA * variablePercents.waterPercent / 100);
  const powerCost = setupCosts.power + (materialCostA * variablePercents.powerPercent / 100);
  const goldCost = setupCosts.gold + (materialCostA * variablePercents.goldPercent / 100);
  
  return {
    // Water and power costs are rounded up if they need to be integers
    water: Math.ceil(waterCost),
    power: Math.ceil(powerCost), 
    gold: goldCost // Gold cost can be decimal
  };
}

// Calculate total percentage and carbon emission
function calculateTotalPercent(variablePercents: VariablePercentages): number {
  return variablePercents.waterPercent + variablePercents.powerPercent + variablePercents.goldPercent;
}

function calculateProductFormulaCarbonEmission(materials: FormulaMaterial[], totalPercent: number): number {
  const baseCarbonEmission = materials.reduce((sum, material) => {
    return sum + (material.quantity * material.rawMaterial.carbonEmission);
  }, 0);
  
  // Apply the formula: baseCarbonEmission * (1 + totalPercent / 100)
  return baseCarbonEmission * (1 + totalPercent / 100);
}

// Final formulas:
// Water Cost = Setup Water + (A × Water%)  [rounded up]
// Power Cost = Setup Power + (A × Power%)  [rounded up]
// Gold Cost = Setup Gold + (A × Gold%)
// Total Percent = Water% + Power% + Gold%
// Product Formula Carbon Emission = Σ(material.quantity × material.carbonEmission) × (1 + totalPercent%)
```




## Data Relationships

### Primary Relationships
1. **ProductFormula → Activity** (Many-to-One)
   - Each formula belongs to a specific activity
   - Formulas are scoped within activity context

2. **ProductFormula → Team** (Many-to-One)
   - Each formula is owned by a specific team
   - Teams create and manage their own formulas

3. **ProductFormula → ProductFormulaCraftCategory → CraftCategory** (Many-to-Many)
   - Each formula can use multiple craft categories
   - **Restriction**: Only one craft category per categoryType per formula
   - Example: ✅ Can have MECHANICAL_MANUFACTURING_LEVEL_2 and ELECTRONIC_EQUIPMENT_LEVEL_3
   - Example: ❌ Cannot have MECHANICAL_MANUFACTURING_LEVEL_1 and MECHANICAL_MANUFACTURING_LEVEL_2
   - **Rationale**: Each production method (categoryType) can only use one technology level

4. **ProductFormula → ProductFormulaMaterial** (One-to-Many)
   - Each formula has 1-99 material requirements
   - Links to raw materials with quantities

5. **ProductFormulaMaterial → RawMaterial** (Many-to-One)
   - Each material requirement references a raw material
   - Provides cost and property information

6. **ProductFormula → ProductFormulaCraftCategory** (One-to-Many)
   - Each formula can have multiple craft categories
   - Provides flexibility in production methods

### Cascade Rules
- Deleting a ProductFormula cascades to ProductFormulaMaterial
- RawMaterial deletion is restricted if used in formulas

## Indexes and Performance

### Primary Indexes
- Composite unique on `[formulaNumber, activityId]` for unique formulas per activity
- Composite unique on `[productFormulaId, rawMaterialId]` to prevent duplicates
- Composite unique on `[productFormulaId, craftCategoryId]` to ensure unique craft categories
- Index on `activityId` for activity-based queries
- Index on `teamId` for team-based queries
- Index on `isActive` and `isDeleted` for soft delete support

### Query Optimization Examples
```sql
-- Get all active formulas for a team in an activity
SELECT pf.*
FROM product_formulas pf
WHERE pf.activity_id = ?
  AND pf.team_id = ?
  AND pf.is_active = true
  AND pf.is_deleted = false
ORDER BY pf.formula_number;

-- Get formula with materials
SELECT 
  pf.*,
  pfm.quantity,
  rm.name_en as material_name,
  rm.total_cost as material_unit_cost
FROM product_formulas pf
JOIN product_formula_materials pfm ON pf.id = pfm.product_formula_id
JOIN raw_materials rm ON pfm.raw_material_id = rm.id
WHERE pf.id = ?
ORDER BY pfm.sort_order;

-- Calculate production cost for volume with multiple craft categories
SELECT 
  pf.formula_number,
  pf.product_description,
  pf.total_material_cost,
  SUM(cc.fixed_water_cost) as total_setup_water,
  SUM(cc.fixed_power_cost) as total_setup_power,
  SUM(cc.variable_water_percent) as total_water_percent,
  SUM(cc.variable_power_percent) as total_power_percent
FROM product_formulas pf
JOIN product_formula_craft_categories pfcc ON pf.id = pfcc.product_formula_id
JOIN craft_categories cc ON pfcc.craft_category_id = cc.id
WHERE pf.id = ?
GROUP BY pf.id, pf.formula_number, pf.product_description, pf.total_material_cost;
```

## Seed Data Structure

### Location
`prisma/seed-data/product-formula.data.ts`

### Example Seed Data
```typescript
export const productFormulaSeedData = [
  {
    // formulaNumber is auto-generated by the system
    activityId: 'clxx1234567890abcdef',    // Activity CUID
    teamId: 'clxx1234567890abcdef01',        // Team CUID
    productDescription: 'Advanced mobile communication device',
    craftCategories: [
      { craftCategoryId: 11 }, // Electronic Equipment - Level 3
      { craftCategoryId: 2 }   // Mechanical Manufacturing - Level 2
    ], // ✅ Valid: Different categoryTypes
    materials: [
      { rawMaterialId: 85, quantity: 5.0 },   // Copper
      { rawMaterialId: 88, quantity: 3.5 },   // Silicon
      { rawMaterialId: 95, quantity: 2.25 },  // Lithium
      { rawMaterialId: 120, quantity: 1.0 }   // Diamond
    ]
  },
  {
    // formulaNumber is auto-generated by the system
    activityId: 'clxx1234567890abcdef',    // Activity CUID
    teamId: 'clxx1234567890abcdef02',        // Team CUID
    productDescription: 'Healthy whole grain bread',
    craftCategories: [
      { craftCategoryId: 26 } // Food Processing - Level 2
    ], // ✅ Valid: Single category
    materials: [
      { rawMaterialId: 22, quantity: 10.5 }, // Wheat
      { rawMaterialId: 1, quantity: 2.0 },   // Eggs
      { rawMaterialId: 2, quantity: 3.25 }   // Fresh Milk
    ]
  },
  {
    // formulaNumber is auto-generated by the system
    activityId: 'clxx1234567890abcdef',    // Activity CUID
    teamId: 'clxx1234567890abcdef03',        // Team CUID
    productDescription: 'Premium leather handbag',
    craftCategories: [
      { craftCategoryId: 22 }, // Cutting Textile - Level 2
      { craftCategoryId: 6 }   // Materials Processing - Level 2
    ], // ✅ Valid: Different categoryTypes
    materials: [
      { rawMaterialId: 5, quantity: 8.5 },   // Leather
      { rawMaterialId: 20, quantity: 2.75 }, // Silk
      { rawMaterialId: 172, quantity: 1.0 }, // Gold
      { rawMaterialId: 120, quantity: 1.5 }  // Diamond
    ]
  }
];

// ❌ INVALID Example - Multiple craft categories with same categoryType:
// This would be rejected by validation
const invalidExample = {
  // formulaNumber would be auto-generated
  activityId: 'clxx1234567890abcdef',
  teamId: 'clxx1234567890abcdef04',
  productDescription: 'Invalid formula example',
  craftCategories: [
    { craftCategoryId: 1 },  // Mechanical Manufacturing - Level 1
    { craftCategoryId: 2 }   // Mechanical Manufacturing - Level 2
  ], // ❌ Invalid: Same categoryType (MECHANICAL_MANUFACTURING) with different levels
  materials: [
    { rawMaterialId: 85, quantity: 5.0 },
    { rawMaterialId: 88, quantity: 3.5 },
    { rawMaterialId: 95, quantity: 2.25 }
  ]
};
```

## Migration Strategy

### Initial Migration
```bash
# Create product formula tables
pnpm run prisma:migrate -- --name add_product_formula_module
```

### Seed Process
```bash
# Seed product formula data
pnpm run prisma:seed
```

### Data Integrity Checks
```sql
-- Verify formula material counts (should be 1-99)
SELECT 
  pf.formula_number,
  COUNT(pfm.id) as material_count
FROM product_formulas pf
LEFT JOIN product_formula_materials pfm ON pf.id = pfm.product_formula_id
GROUP BY pf.id, pf.formula_number
HAVING COUNT(pfm.id) < 1 OR COUNT(pfm.id) > 99;

-- Check for duplicate materials in formulas
SELECT 
  pf.formula_number,
  pfm.raw_material_id,
  COUNT(*) as duplicate_count
FROM product_formulas pf
JOIN product_formula_materials pfm ON pf.id = pfm.product_formula_id
GROUP BY pf.id, pf.formula_number, pfm.raw_material_id
HAVING COUNT(*) > 1;

-- Verify cost calculations
SELECT 
  pf.formula_number,
  pf.total_material_cost,
  SUM(pfm.quantity * rm.total_cost) as calculated_cost
FROM product_formulas pf
JOIN product_formula_materials pfm ON pf.id = pfm.product_formula_id
JOIN raw_materials rm ON pfm.raw_material_id = rm.id
GROUP BY pf.id, pf.formula_number, pf.total_material_cost
HAVING ABS(pf.total_material_cost - SUM(pfm.quantity * rm.total_cost)) > 0.01;
```

## Repository Methods

### ProductFormulaRepository
```typescript
interface ProductFormulaRepository {
  // CRUD Operations
  create(data: CreateProductFormulaDto): Promise<ProductFormula> // formulaNumber auto-generated
  findById(id: number): Promise<ProductFormula>
  findByNumber(number: number, activityId: string): Promise<ProductFormula> // For system-generated numbers
  findAll(filters?: ProductFormulaFilters): Promise<ProductFormula[]>
  findByActivity(activityId: string): Promise<ProductFormula[]>
  findByTeam(teamId: string, activityId: string): Promise<ProductFormula[]>
  update(id: number, data: UpdateProductFormulaDto): Promise<ProductFormula>
  softDelete(id: number, deletedBy: string): Promise<void>
  
  // Material Management
  addMaterial(formulaId: number, material: AddMaterialDto): Promise<void>
  removeMaterial(formulaId: number, materialId: number): Promise<void>
  updateMaterial(formulaId: number, materialId: number, quantity: number): Promise<void>
  
  // Cost Calculations
  calculateProductionCost(formulaId: number, quantity: number): Promise<CostBreakdown>
  calculateCarbonFootprint(formulaId: number): Promise<number>
  
  // Search and Filter
  searchByName(query: string): Promise<ProductFormula[]>
  findByCategory(category: ProductCategory): Promise<ProductFormula[]>
  findByCraftCategory(craftCategoryId: number): Promise<ProductFormula[]>
  findByMaterial(materialId: number): Promise<ProductFormula[]>
  
  // Analytics
  getMostUsedMaterials(): Promise<MaterialUsageStats[]>
  getFormulaProfitability(): Promise<ProfitabilityReport[]>
  getCategoryDistribution(): Promise<CategoryStats[]>
}
```

## Security Considerations

### Access Control Matrix
```typescript
interface FormulaPermissions {
  SUPER_ADMIN: {
    create: true,
    read: true,
    update: true,
    delete: true,
    bulkOperations: true,
    viewAuditLog: true
  },
  LIMITED_ADMIN: {
    create: false,
    read: true,
    update: false,
    delete: false,
    bulkOperations: false,
    viewAuditLog: true
  },
  USER: {
    create: false,
    read: true,
    update: false,
    delete: false,
    bulkOperations: false,
    viewAuditLog: false
  }
}
```

### Data Validation
- Enforce material quantity ranges (0.001-999.999)
- Validate craft category exists and is active
- Ensure material count is between 1-99
- Prevent circular dependencies
- Sanitize all text inputs