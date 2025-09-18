# Manager Product Formula Data Model

## Overview
This document describes the complete data model for the Manager Product Formula module, including Prisma schemas, relationships, and database design decisions.

## Primary Models

### 1. ManagerProductFormula
The main entity representing a product formula created by managers for MTO requirements.

```prisma
model ManagerProductFormula {
  id                    Int                         @id @default(autoincrement())
  formulaNumber         Int                         // Auto-incremented within activity

  // Product Information
  productName           String                      @db.VarChar(200)
  productDescription    String?                     @db.VarChar(500)

  // Activity Association
  activityId            String
  activity              Activity                    @relation(fields: [activityId], references: [id])

  // Cost Components (Auto-calculated)
  totalMaterialCost     Decimal                     @db.Decimal(12, 2)
  totalSetupWaterCost   Int
  totalSetupPowerCost   Int
  totalSetupGoldCost    Decimal                     @db.Decimal(12, 2)
  totalWaterPercent     Decimal                     @db.Decimal(6, 2)
  totalPowerPercent     Decimal                     @db.Decimal(6, 2)
  totalGoldPercent      Decimal                     @db.Decimal(6, 2)
  totalPercent          Decimal                     @db.Decimal(7, 2)

  // Environmental Impact
  productFormulaCarbonEmission Decimal              @db.Decimal(12, 3)

  // MTO Integration Status
  isLocked              Boolean                     @default(false)
  lockedAt              DateTime?
  lockedBy              String?

  // Metadata
  isActive              Boolean                     @default(true)
  isDeleted             Boolean                     @default(false)
  deletedAt             DateTime?
  deletedBy             String?
  createdAt             DateTime                    @default(now())
  createdBy             String
  createdByUser         User                        @relation("ManagerFormulaCreator", fields: [createdBy], references: [id])
  updatedAt             DateTime                    @updatedAt
  updatedBy             String?

  // Relations
  materials             ManagerProductFormulaMaterial[]
  craftCategories       ManagerProductFormulaCraftCategory[]

  // Indexes
  @@index([activityId])
  @@index([isActive])
  @@index([isDeleted])
  @@index([formulaNumber])
  @@index([isLocked])
  @@index([createdBy])
  @@unique([formulaNumber, activityId])
  @@map("manager_product_formulas")
}
```

### 2. ManagerProductFormulaMaterial
Junction table linking formulas to raw materials with quantity requirements.

```prisma
model ManagerProductFormulaMaterial {
  id                    Int                         @id @default(autoincrement())

  // Relations
  managerProductFormulaId Int
  managerProductFormula ManagerProductFormula       @relation(fields: [managerProductFormulaId], references: [id], onDelete: Cascade)

  rawMaterialId         Int
  rawMaterial           RawMaterial                 @relation(fields: [rawMaterialId], references: [id])

  // Material Requirements
  quantity              Decimal                     @db.Decimal(12, 3) // 0.001-9999.999
  unit                  String                      @default("units")

  // Cost Calculation (auto-calculated)
  materialCost          Decimal                     @db.Decimal(12, 2)

  // Metadata
  createdAt             DateTime                    @default(now())
  updatedAt             DateTime                    @updatedAt

  // Constraints
  @@unique([managerProductFormulaId, rawMaterialId])
  @@index([managerProductFormulaId])
  @@index([rawMaterialId])
  @@map("manager_product_formula_materials")
}
```

### 3. ManagerProductFormulaCraftCategory
Junction table linking formulas to craft categories for production requirements.

```prisma
model ManagerProductFormulaCraftCategory {
  id                    Int                         @id @default(autoincrement())

  // Relations
  managerProductFormulaId Int
  managerProductFormula ManagerProductFormula       @relation(fields: [managerProductFormulaId], references: [id], onDelete: Cascade)

  craftCategoryId       Int
  craftCategory         CraftCategory               @relation(fields: [craftCategoryId], references: [id])

  // Metadata
  createdAt             DateTime                    @default(now())
  updatedAt             DateTime                    @updatedAt

  // Constraints
  @@unique([managerProductFormulaId, craftCategoryId])
  @@index([managerProductFormulaId])
  @@index([craftCategoryId])
  @@map("manager_product_formula_craft_categories")
}
```

## Related Model Updates

### Activity Model Addition
```prisma
model Activity {
  // ... existing fields ...

  // Manager Product Formulas
  managerProductFormulas ManagerProductFormula[]
}
```

### CraftCategory Model Addition
```prisma
model CraftCategory {
  // ... existing fields ...

  // Manager product formulas using this craft category
  managerProductFormulaCategories ManagerProductFormulaCraftCategory[]
}
```

### RawMaterial Model Addition
```prisma
model RawMaterial {
  // ... existing fields ...

  // Manager product formulas using this material
  managerProductFormulaMaterials ManagerProductFormulaMaterial[]
}
```

### User Model Addition
```prisma
model User {
  // ... existing fields ...

  // Manager product formulas created by this user
  createdManagerFormulas ManagerProductFormula[] @relation("ManagerFormulaCreator")
}
```

## Database Design Decisions

### 1. Primary Key Strategy
- **Auto-increment IDs**: Using integer auto-increment for performance
- **Formula Numbering**: Separate formulaNumber field for business identification

### 2. Decimal Precision
| Field | Precision | Scale | Reasoning |
|-------|-----------|-------|-----------|
| Material Cost | 12 | 2 | Handle sum of 999 materials |
| Individual Costs | 10 | 2 | Standard cost precision |
| Percentages | 6 | 2 | 0.00-9999.99% range |
| Carbon Emission | 12 | 3 | Environmental precision |
| Quantity | 12 | 3 | 0.001-9999.999 range |

### 3. Index Strategy
- **Primary Indexes**: activityId, formulaNumber, isActive
- **Query Optimization**: isLocked, createdBy for filtering
- **Composite Unique**: (formulaNumber, activityId) for business constraint

### 4. Cascade Strategy
- **Cascade Delete**: Junction tables cascade on formula deletion
- **Protect References**: Cannot delete if referenced by MTO requirements

## Entity Relationship Diagram

```
┌─────────────────────────┐
│  ManagerProductFormula  │
├─────────────────────────┤
│ • id (PK)              │
│ • formulaNumber        │
│ • productName          │
│ • activityId (FK)      │
│ • createdBy (FK)       │
│ • costs...             │
│ • isLocked             │
└──────────┬──────────────┘
           │
           ├──────────────────┬─────────────────┐
           ▼                  ▼                 ▼
┌──────────────────┐  ┌───────────────┐  ┌──────────┐
│ MPF_Material     │  │ MPF_Category  │  │ Activity │
├──────────────────┤  ├───────────────┤  ├──────────┤
│ • formulaId (FK) │  │ • formulaId   │  │ • id     │
│ • materialId(FK) │  │ • categoryId  │  │ • name   │
│ • quantity       │  │               │  └──────────┘
└──────────────────┘  └───────────────┘
           │                  │
           ▼                  ▼
┌──────────────────┐  ┌───────────────┐
│   RawMaterial    │  │ CraftCategory │
├──────────────────┤  ├───────────────┤
│ • id             │  │ • id          │
│ • name           │  │ • type        │
│ • cost           │  │ • level       │
└──────────────────┘  └───────────────┘
```

## Data Types and Constraints

### String Fields
| Field | Type | Max Length | Required | Notes |
|-------|------|------------|----------|-------|
| productName | VARCHAR | 200 | Yes | Unique per activity |
| productDescription | VARCHAR | 500 | No | Optional details |
| unit | STRING | - | Yes | Default: "units" |
| lockedBy | STRING | - | No | MTO requirement ID |

### Numeric Fields
| Field | Type | Range | Default | Notes |
|-------|------|-------|---------|-------|
| formulaNumber | INT | 1-999999 | Auto | Per activity |
| quantity | DECIMAL | 0.001-9999.999 | - | Material amount |
| totalMaterialCost | DECIMAL | 0-999999.99 | Calculated | Sum of materials |
| setupCosts | INT/DECIMAL | 0-99999 | Calculated | Fixed costs |
| percentages | DECIMAL | 0-999.99 | Calculated | Variable rates |

### Boolean Fields
| Field | Default | Description |
|-------|---------|-------------|
| isActive | true | Formula available for use |
| isDeleted | false | Soft delete flag |
| isLocked | false | Locked by active MTO |

### DateTime Fields
| Field | Default | Nullable | Description |
|-------|---------|----------|-------------|
| createdAt | now() | No | Creation timestamp |
| updatedAt | @updatedAt | No | Last modification |
| deletedAt | - | Yes | Soft delete timestamp |
| lockedAt | - | Yes | When formula was locked |

## Query Patterns

### Common Queries
```sql
-- Get active formulas for an activity
SELECT * FROM manager_product_formulas
WHERE activityId = ? AND isActive = true AND isDeleted = false
ORDER BY formulaNumber DESC;

-- Find unlocked formulas
SELECT * FROM manager_product_formulas
WHERE isLocked = false AND isActive = true;

-- Get formula with materials and categories
SELECT f.*, m.*, c.*
FROM manager_product_formulas f
LEFT JOIN manager_product_formula_materials m ON f.id = m.managerProductFormulaId
LEFT JOIN manager_product_formula_craft_categories c ON f.id = c.managerProductFormulaId
WHERE f.id = ?;
```

### Aggregation Queries
```sql
-- Calculate total material cost
SELECT SUM(m.quantity * rm.totalCost) as totalMaterialCost
FROM manager_product_formula_materials m
JOIN raw_materials rm ON m.rawMaterialId = rm.id
WHERE m.managerProductFormulaId = ?;

-- Count formulas by activity
SELECT activityId, COUNT(*) as formulaCount
FROM manager_product_formulas
WHERE isDeleted = false
GROUP BY activityId;
```

## Migration Considerations

### Initial Migration
```sql
-- Create tables
CREATE TABLE manager_product_formulas (...);
CREATE TABLE manager_product_formula_materials (...);
CREATE TABLE manager_product_formula_craft_categories (...);

-- Add indexes
CREATE INDEX idx_formula_activity ON manager_product_formulas(activityId);
CREATE UNIQUE INDEX idx_formula_number ON manager_product_formulas(formulaNumber, activityId);

-- Add foreign key constraints
ALTER TABLE manager_product_formula_materials
ADD CONSTRAINT fk_formula_material
FOREIGN KEY (managerProductFormulaId)
REFERENCES manager_product_formulas(id) ON DELETE CASCADE;
```

### Rollback Plan
```sql
-- Drop tables in reverse order
DROP TABLE manager_product_formula_craft_categories;
DROP TABLE manager_product_formula_materials;
DROP TABLE manager_product_formulas;
```

## Performance Optimization

### Indexing Strategy
1. **Primary Access**: Index on activityId for filtering
2. **Formula Lookup**: Unique index on (formulaNumber, activityId)
3. **Status Filtering**: Indexes on isActive, isDeleted, isLocked
4. **User Queries**: Index on createdBy for manager's formulas

### Caching Recommendations
- Cache formula details for 10 minutes
- Cache material/category lookups indefinitely
- Invalidate cache on any update operation

### Query Optimization
- Use eager loading for related data
- Implement pagination for large result sets
- Consider materialized views for complex calculations