# Product Production Data Model

## Overview

This document defines the database schema for the Product Production module, building upon existing Prisma models. The design leverages existing infrastructure including `TileFacilityInstance`, `ProductFormula`, `ResourceTransaction`, and `FacilityInventoryItem` models.

## Integration with Existing Models

### Existing Models Used

1. **TileFacilityInstance** - Factory facilities where production occurs
2. **ProductFormula** - Product recipes with pre-calculated costs
3. **ResourceTransaction** - Tracks water/power consumption (with PRODUCT_MANUFACTURING purpose)
4. **FacilityInventoryItem** - Manages raw materials and products in facilities
5. **InfrastructureConnection** - Water/power connections for resource supply
6. **FacilitySpaceInventory** - Space management for materials and products
7. **CraftCategory** - Production methods with yields and costs

### Key Model Features

#### ProductFormula (Existing)
Already contains pre-calculated cost components:
- `totalMaterialCost` - Sum of material costs (A in formula)
- `totalSetupWaterCost`, `totalSetupPowerCost`, `totalSetupGoldCost` - Fixed costs
- `totalWaterPercent`, `totalPowerPercent`, `totalGoldPercent` - Variable percentages
- `productFormulaCarbonEmission` - Environmental impact

#### ResourceTransaction (Existing)
Can track production resource consumption with:
- `purpose: PRODUCT_MANUFACTURING` enum value
- Links to infrastructure connections and facilities
- Tracks water/power consumption and costs
- References production via `referenceId` field

#### FacilityInventoryItem (Existing)
Manages both raw materials and products:
- `itemType` enum (RAW_MATERIAL or PRODUCT)
- Links to `rawMaterialId` or `productFormulaId`
- Tracks quantity and space usage

## New Models Required

### 1. ProductProduction

Main table for tracking product production, following the pattern of `RawMaterialProduction`.

```prisma
model ProductProduction {
  id                    String                  @id @default(cuid())
  
  // Production identification
  productionNumber      String                  @unique // Unique production identifier
  
  // Facility and Formula
  factoryId             String
  factory               TileFacilityInstance    @relation(fields: [factoryId], references: [id])
  
  formulaId             Int
  formula               ProductFormula          @relation(fields: [formulaId], references: [id])
  
  // Production quantities
  requestedQuantity     Int                     // Units requested
  producedQuantity      Int                     // Actual units produced after yield
  combinedYield         Decimal                 @db.Decimal(5, 4) // Combined yield from all craft categories
  
  // Resource consumption
  waterConsumed         Int                     // Water units consumed
  powerConsumed         Int                     // Power units consumed
  
  // Costs
  waterCost             Decimal                 @db.Decimal(12, 2) // Cost paid for water
  powerCost             Decimal                 @db.Decimal(12, 2) // Cost paid for power
  goldCost              Decimal                 @db.Decimal(12, 2) // Gold/labor costs
  materialCost          Decimal                 @db.Decimal(12, 2) // Total raw material cost
  totalCost             Decimal                 @db.Decimal(12, 2) // Total production cost
  
  // Space impact
  materialSpaceFreed    Decimal                 @db.Decimal(12, 3) // Space freed from materials
  productSpaceUsed      Decimal                 @db.Decimal(12, 3) // Space used by products
  netSpaceChange        Decimal                 @db.Decimal(12, 3) // Net space change
  
  // Environmental impact
  carbonEmission        Decimal                 @db.Decimal(12, 3) // Carbon emission generated
  
  // Status
  status                ProductionStatus        
  failureReason         String?                 // Reason if failed
  
  // Infrastructure connections used
  waterConnectionId     String?
  waterConnection       InfrastructureConnection? @relation("WaterProductionConnection", fields: [waterConnectionId], references: [id])
  
  powerConnectionId     String?
  powerConnection       InfrastructureConnection? @relation("PowerProductionConnection", fields: [powerConnectionId], references: [id])
  
  // Team and Activity Context
  teamId                String
  team                  Team                    @relation(fields: [teamId], references: [id])
  
  activityId            String
  activity              Activity                @relation(fields: [activityId], references: [id])
  
  // User who initiated
  initiatedBy           String
  initiatedByUser       User                    @relation(fields: [initiatedBy], references: [id])
  
  // Resource Transaction References (JSON array of transaction IDs)
  transactionIds        Json?                   // Array of ResourceTransaction IDs
  
  // Material consumption details (JSON)
  materialsConsumed     Json                    // Detailed breakdown of materials consumed
  /* Structure:
  [
    {
      "rawMaterialId": number,
      "materialName": string,
      "quantityRequired": number,
      "quantityConsumed": number,
      "unitCost": number,
      "totalCost": number,
      "spaceFreed": number
    }
  ]
  */
  
  // Craft categories used (JSON)
  craftCategoriesUsed   Json                    // Craft categories and their yields
  /* Structure:
  [
    {
      "craftCategoryId": number,
      "categoryName": string,
      "level": string,
      "yieldPercentage": number,
      "fixedWaterCost": number,
      "fixedPowerCost": number,
      "fixedGoldCost": number
    }
  ]
  */
  
  // Timestamps
  producedAt            DateTime                @default(now()) // Production is instant
  
  // Metadata
  metadata              Json?                   // Additional production data
  
  // System fields
  createdAt             DateTime                @default(now())
  updatedAt             DateTime                @updatedAt
  
  // Relations
  inventoryChanges      ProductionInventoryChange[]
  
  @@index([factoryId, status])
  @@index([teamId, activityId])
  @@index([formulaId])
  @@index([producedAt])
  @@map("product_productions")
}

enum ProductionStatus {
  SUCCESS           // Production completed successfully
  FAILED            // Production failed
}
```

### 2. ProductionInventoryChange

Tracks inventory changes from production (material consumption and product creation).

```prisma
model ProductionInventoryChange {
  id                    String                  @id @default(cuid())
  
  // Link to production
  productionId          String
  production            ProductProduction       @relation(fields: [productionId], references: [id])
  
  // Change type
  changeType            InventoryChangeType     // CONSUME_MATERIAL or ADD_PRODUCT
  
  // Item reference
  inventoryItemId       String
  inventoryItem         FacilityInventoryItem   @relation(fields: [inventoryItemId], references: [id])
  
  // Quantities
  quantityBefore        Decimal                 @db.Decimal(12, 3)
  quantityChanged       Decimal                 @db.Decimal(12, 3) // Negative for consumption
  quantityAfter         Decimal                 @db.Decimal(12, 3)
  
  // Space impact
  spaceBefore           Decimal                 @db.Decimal(12, 3)
  spaceChanged          Decimal                 @db.Decimal(12, 3) // Negative when freeing
  spaceAfter            Decimal                 @db.Decimal(12, 3)
  
  // Timestamps
  changedAt             DateTime                @default(now())
  
  @@index([productionId])
  @@index([inventoryItemId])
  @@map("production_inventory_changes")
}

enum InventoryChangeType {
  CONSUME_MATERIAL  // Raw material consumed
  ADD_PRODUCT      // Product created
}
```


## Integration with Existing Tables

### ResourceTransaction Usage

When production occurs, create ResourceTransaction records:

```typescript
// Water consumption
await ResourceTransaction.create({
  resourceType: 'WATER',
  quantity: waterConsumed,
  unitPrice: waterConnection.unitPrice,
  totalAmount: waterCost,
  connectionId: waterConnection.id,
  consumerFacilityId: factory.id,
  consumerTeamId: team.id,
  providerFacilityId: waterConnection.providerFacilityId,
  providerTeamId: waterConnection.providerTeamId,
  purpose: 'PRODUCT_MANUFACTURING',
  referenceType: 'PRODUCTION',
  referenceId: production.id,
  activityId: activity.id,
  initiatedBy: user.id,
  status: 'SUCCESS'
});
```

### FacilityInventoryItem Updates

Update inventory items for materials and products:

```typescript
// Consume materials
for (const material of materialsToConsume) {
  await FacilityInventoryItem.update({
    where: { id: material.inventoryItemId },
    data: {
      quantity: { decrement: material.quantityRequired },
      totalSpaceOccupied: { 
        decrement: material.quantityRequired * material.unitSpaceOccupied 
      }
    }
  });
}

// Add or update product inventory
const productItem = await FacilityInventoryItem.findFirst({
  where: {
    inventoryId: spaceInventory.id,
    itemType: 'PRODUCT',
    productFormulaId: formula.id
  }
});

if (productItem) {
  await FacilityInventoryItem.update({
    where: { id: productItem.id },
    data: {
      quantity: { increment: producedQuantity },
      totalSpaceOccupied: { 
        increment: producedQuantity * formula.productFormulaCarbonEmission 
      }
    }
  });
} else {
  await FacilityInventoryItem.create({
    data: {
      inventoryId: spaceInventory.id,
      itemType: 'PRODUCT',
      productFormulaId: formula.id,
      quantity: producedQuantity,
      unitSpaceOccupied: formula.productFormulaCarbonEmission,
      totalSpaceOccupied: producedQuantity * formula.productFormulaCarbonEmission,
      unitCost: totalCost / producedQuantity,
      totalValue: totalCost
    }
  });
}
```

### FacilitySpaceInventory Updates

Update space usage after production:

```typescript
await FacilitySpaceInventory.update({
  where: { facilityInstanceId: factory.id },
  data: {
    usedSpace: { increment: netSpaceChange },
    availableSpace: { decrement: netSpaceChange },
    rawMaterialSpace: { decrement: materialSpaceFreed },
    productSpace: { increment: productSpaceUsed }
  }
});
```

## Database Views

### ActiveProductionView

Shows recent production activity:

```sql
CREATE VIEW ActiveProductionView AS
SELECT 
    p.id,
    p.productionNumber,
    t.name AS teamName,
    f.facilityType,
    pf.productName,
    p.requestedQuantity,
    p.producedQuantity,
    p.status,
    p.totalCost,
    p.producedAt
FROM ProductProduction p
JOIN Team t ON p.teamId = t.id
JOIN TileFacilityInstance f ON p.factoryId = f.id
JOIN ProductFormula pf ON p.formulaId = pf.id
WHERE p.producedAt > NOW() - INTERVAL '24 hours'
ORDER BY p.producedAt DESC;
```

### ProductionEfficiencyView

Analyzes production efficiency by factory and formula:

```sql
CREATE VIEW ProductionEfficiencyView AS
SELECT 
    f.id AS factoryId,
    f.level AS factoryLevel,
    pf.id AS formulaId,
    pf.productName,
    COUNT(*) AS totalProductions,
    AVG(p.producedQuantity::FLOAT / p.requestedQuantity) AS avgYield,
    SUM(p.producedQuantity) AS totalOutput,
    AVG(p.totalCost / NULLIF(p.producedQuantity, 0)) AS avgCostPerUnit
FROM ProductProduction p
JOIN TileFacilityInstance f ON p.factoryId = f.id
JOIN ProductFormula pf ON p.formulaId = pf.id
WHERE p.status = 'SUCCESS'
GROUP BY f.id, f.level, pf.id, pf.productName;
```

## Migration Strategy

### Step 1: Create Core Tables

```sql
-- Add ProductProduction table
CREATE TABLE product_productions (
  -- ... schema as defined above
);

-- Add ProductionInventoryChange table  
CREATE TABLE production_inventory_changes (
  -- ... schema as defined above
);
```

### Step 2: Add Indexes

```sql
-- Performance indexes
CREATE INDEX idx_production_factory_date ON product_productions(factoryId, producedAt DESC);
CREATE INDEX idx_production_team_formula ON product_productions(teamId, formulaId);
CREATE INDEX idx_inventory_change_item ON production_inventory_changes(inventoryItemId);
```

### Step 3: Update Existing Enums

```sql
-- Already exists in ResourceTransaction
-- ConsumptionPurpose enum already has PRODUCT_MANUFACTURING value
```

## Data Retention Policy

### Production History

- Keep detailed records for 6 months
- Archive older records to cold storage
- Maintain summary records for reporting

### Cleanup Script

```sql
-- Archive old production records (run monthly)
INSERT INTO product_productions_archive
SELECT * FROM product_productions
WHERE producedAt < NOW() - INTERVAL '6 months';

DELETE FROM product_productions
WHERE producedAt < NOW() - INTERVAL '6 months';
```

## Summary

This data model provides:

1. **Minimal new tables** - Only 2 new tables required
2. **Maximum reuse** - Leverages existing ResourceTransaction, FacilityInventoryItem, and space models
3. **Consistent patterns** - Follows the same structure as RawMaterialProduction
4. **Complete tracking** - Records all aspects of production
5. **Integration ready** - Works seamlessly with existing infrastructure