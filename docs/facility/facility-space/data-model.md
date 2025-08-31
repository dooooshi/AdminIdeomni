# Facility Space Management Data Model

## Overview

This document defines the database schema for the Facility Space Management system using Prisma ORM with PostgreSQL. The system tracks storage capacity, inventory levels, and space utilization across all facility types.

## Core Principles

1. **Space as Carbon Units**: All space measurements use carbon emission values as the unit
2. **Template-Based Configuration**: Initial space defined at map template level
3. **Level-Based Scaling**: Space capacity increases with facility upgrades
4. **Category-Based Allocation**: Only RAW_MATERIAL_PRODUCTION and FUNCTIONAL facilities have storage space
5. **Audit Trail**: Complete history of all space-related transactions

## Integration with Existing Infrastructure

This space management system extends the existing facility infrastructure by adding space tracking capabilities to the already established facility and map template systems. The space configuration is stored alongside existing infrastructure configs in the map template, while space tracking is added as an extension to existing facility instances.

### Facility Space Configuration Model

The space settings are stored in a dedicated `FacilitySpaceConfig` table for better structure and query performance:

```prisma
// Facility Space Configuration Model
// Location: prisma/models/facility-space-config.prisma
model FacilitySpaceConfig {
  id                    String          @id @default(cuid())
  
  // Template and Facility Type (unique combination)
  templateId            Int
  template              MapTemplate     @relation(fields: [templateId], references: [id], onDelete: Cascade)
  
  facilityType          FacilityType    // Which facility type this config is for
  
  // Space Configuration (ALWAYS in carbon emission units)
  initialSpace          Decimal         @db.Decimal(12, 3) // Base storage space in carbon units
  spacePerLevel         Decimal         @db.Decimal(12, 3) // Additional space per upgrade level in carbon units
  maxSpace              Decimal         @db.Decimal(12, 3) // Maximum possible space after all upgrades in carbon units
  
  // Category-based rules enforcement
  isStorageFacility     Boolean         @default(true)     // Whether this facility type can store items
  
  // Metadata
  description           String?         // Optional description of space usage
  metadata              Json?           // Additional configuration data
  
  // System fields
  isActive              Boolean         @default(true)
  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt
  createdBy             String?         // Admin who created this config
  lastModifiedBy        String?         // Admin who last modified
  
  // Ensure unique configuration per template and facility type
  @@unique([templateId, facilityType])
  @@index([templateId])
  @@index([facilityType])
  @@index([isStorageFacility])
  @@map("facility_space_configs")
}
```

**Note**: Space configuration is per `templateId + facilityType` only. The same WAREHOUSE has the same space capacity whether built on COASTAL or PLAIN land within a template.

### Extension to TileFacilityInstance

The space inventory extends existing `TileFacilityInstance` to track space usage:

```prisma
// Extension to existing TileFacilityInstance for space tracking
// Stored in: prisma/models/facility-space-inventory.prisma
model FacilitySpaceInventory {
  id                    String                  @id @default(cuid())
  
  // One-to-one with existing TileFacilityInstance
  facilityInstanceId    String                  @unique
  facilityInstance      TileFacilityInstance    @relation(fields: [facilityInstanceId], references: [id], onDelete: Cascade)
  
  // Current Space Metrics (in carbon emission units)
  totalSpace            Decimal                 @db.Decimal(12, 3) // Total available space (shared by raw materials and products)
  usedSpace             Decimal                 @db.Decimal(12, 3) // Currently used space (raw materials + products)
  availableSpace        Decimal                 @db.Decimal(12, 3) // Remaining available space
  
  // Space Breakdown for tracking (both use the same pool)
  rawMaterialSpace      Decimal                 @db.Decimal(12, 3) @default(0) // Space currently used by raw materials
  productSpace          Decimal                 @db.Decimal(12, 3) @default(0) // Space currently used by products
  
  // Uses existing Activity and Team from TileFacilityInstance
  activityId            String
  activity              Activity                @relation(fields: [activityId], references: [id])
  
  teamId                String
  team                  Team                    @relation(fields: [teamId], references: [id])
  
  // Relations
  inventoryItems        FacilityInventoryItem[] // Detailed inventory items
  
  // Metadata
  metrics               Json?                   // Additional performance metrics
  alerts                Json?                   // Active space alerts/warnings
  
  // System fields
  createdAt             DateTime                @default(now())
  updatedAt             DateTime                @updatedAt
  
  @@index([facilityInstanceId])
  @@index([teamId, activityId])
  @@map("facility_space_inventories")
}
```

### Inventory Items Model

Individual inventory items stored in facilities, linking to existing RawMaterial and ProductFormula:

```prisma
// Inventory items linking to existing RawMaterial and ProductFormula models
// Stored in: prisma/models/facility-inventory-item.prisma
model FacilityInventoryItem {
  id                    String                  @id @default(cuid())
  
  // Parent Inventory
  inventoryId           String
  inventory             FacilitySpaceInventory  @relation(fields: [inventoryId], references: [id], onDelete: Cascade)
  
  // Item Type
  itemType              InventoryItemType       // RAW_MATERIAL or PRODUCT
  
  // Links to existing RawMaterial and ProductFormula models
  rawMaterialId         Int?                    // References existing RawMaterial
  rawMaterial           RawMaterial?            @relation(fields: [rawMaterialId], references: [id])
  
  productFormulaId      Int?                    // References existing ProductFormula
  productFormula        ProductFormula?         @relation(fields: [productFormulaId], references: [id])
  
  // Quantity and Space
  quantity              Decimal                 @db.Decimal(12, 3) // Current quantity
  unitSpaceOccupied     Decimal                 @db.Decimal(10, 6) // Space per unit (carbon emission)
  totalSpaceOccupied    Decimal                 @db.Decimal(12, 3) // quantity * unitSpaceOccupied
  
  // Item Information
  receivedDate          DateTime                @default(now()) // When received into inventory
  expiryDate            DateTime?               // Optional expiry for perishables
  
  // Value Tracking
  unitCost              Decimal                 @db.Decimal(10, 2) // Cost per unit
  totalValue            Decimal                 @db.Decimal(12, 2) // quantity * unitCost
  
  // Metadata
  metadata              Json?                   // Additional item-specific data
  notes                 String?                 // Optional notes
  
  // System fields
  createdAt             DateTime                @default(now())
  updatedAt             DateTime                @updatedAt
  
  // Ensure item is either raw material or product, not both
  @@check("(item_type = 'RAW_MATERIAL' AND raw_material_id IS NOT NULL AND product_formula_id IS NULL) OR (item_type = 'PRODUCT' AND product_formula_id IS NOT NULL AND raw_material_id IS NULL)")
  
  @@index([inventoryId, itemType])
  @@index([rawMaterialId])
  @@index([productFormulaId])
  @@index([receivedDate])
  @@map("facility_inventory_items")
}

enum InventoryItemType {
  RAW_MATERIAL
  PRODUCT
}
```


## Integration Points with Existing Models

The space management system integrates seamlessly with existing models without modifying them:

### TileFacilityInstance Integration

```prisma
// TileFacilityInstance gets extended with optional space tracking
model TileFacilityInstance {
  // ... existing fields (facilityType, level, status, team, activity, etc.) ...
  
  // Space inventory is optional - only facilities that need space tracking will have it
  spaceInventory        FacilitySpaceInventory?  @relation("FacilitySpaceTracking")
}
```

### RawMaterial and ProductFormula Integration

The existing models are used for space calculations:

```prisma
// RawMaterial already has carbonEmission field used for space calculation
model RawMaterial {
  // ... existing fields including carbonEmission ...
  
  // Space system uses existing carbonEmission for space calculations
  inventoryItems        FacilityInventoryItem[]  @relation("MaterialInventory")
}

// ProductFormula already has productFormulaCarbonEmission for space calculation  
model ProductFormula {
  // ... existing fields including productFormulaCarbonEmission ...
  
  // Space system uses existing productFormulaCarbonEmission for space calculations
  inventoryItems        FacilityInventoryItem[]  @relation("ProductInventory")
}
```

### Activity and Team Context

The space system uses existing Activity and Team relationships from TileFacilityInstance:

```prisma
// Activity and Team are already linked through TileFacilityInstance
// Space inventory inherits these relationships for consistency
model Activity {
  // ... existing fields ...
  facilityInventories   FacilitySpaceInventory[]  @relation("ActivitySpaceTracking")
}

model Team {
  // ... existing fields ...
  facilityInventories   FacilitySpaceInventory[]  @relation("TeamSpaceTracking")
}
```


## Calculated Fields and Business Logic

### Space Calculation

```typescript
// Calculate space for raw materials
function calculateRawMaterialSpace(
  quantity: Decimal,
  material: RawMaterial
): Decimal {
  return quantity.mul(material.carbonEmission);
}

// Calculate space for products
function calculateProductSpace(
  quantity: Decimal,
  formula: ProductFormula
): Decimal {
  return quantity.mul(formula.productFormulaCarbonEmission);
}

// Calculate total facility space based on level and category
function calculateFacilitySpace(
  facilityType: FacilityType,
  category: FacilityCategory,
  config: FacilitySpaceConfig,
  level: number
): Decimal {
  // Infrastructure and Other facilities have no storage space
  if (category === 'INFRASTRUCTURE' || category === 'OTHER') {
    return new Decimal(0);
  }
  
  // Only RAW_MATERIAL_PRODUCTION and FUNCTIONAL have space
  const baseSpace = config.initialSpace;
  const additionalSpace = config.spacePerLevel.mul(level - 1);
  const totalSpace = baseSpace.add(additionalSpace);
  
  return Decimal.min(totalSpace, config.maxSpace);
}

// Calculate shared space availability
function calculateAvailableSpace(
  inventory: FacilitySpaceInventory
): SpaceAvailability {
  const spaceAvailable = inventory.totalSpace.sub(inventory.usedSpace);
  
  return {
    totalAvailable: spaceAvailable,
    canAcceptItems: spaceAvailable.gt(0)
  };
}
```

## Indexes and Performance

### Primary Indexes

```sql
-- Facility Space Config
CREATE UNIQUE INDEX idx_facility_space_configs_unique ON facility_space_configs(template_id, facility_type);
CREATE INDEX idx_facility_space_configs_template ON facility_space_configs(template_id);
CREATE INDEX idx_facility_space_configs_type ON facility_space_configs(facility_type);
CREATE INDEX idx_facility_space_configs_storage ON facility_space_configs(is_storage_facility);

-- Space Inventory
CREATE UNIQUE INDEX idx_space_inventory_facility ON facility_space_inventories(facility_instance_id);
CREATE INDEX idx_space_inventory_team_activity ON facility_space_inventories(team_id, activity_id);

-- Inventory Items
CREATE INDEX idx_inventory_items_inventory ON facility_inventory_items(inventory_id, item_type);
CREATE INDEX idx_inventory_items_material ON facility_inventory_items(raw_material_id);
CREATE INDEX idx_inventory_items_product ON facility_inventory_items(product_formula_id);
CREATE INDEX idx_inventory_items_status ON facility_inventory_items(status);
```

### Query Optimization Examples

```sql
-- Get current space usage for a facility
SELECT 
  fsi.*,
  fsc.initial_space,
  fsc.max_space,
  fsc.space_per_level
FROM facility_space_inventories fsi
JOIN tile_facility_instances tfi ON fsi.facility_instance_id = tfi.id
JOIN map_templates mt ON mt.id = tfi.activity.map_template_id
JOIN facility_space_configs fsc ON fsc.template_id = mt.id AND fsc.facility_type = tfi.facility_type
WHERE fsi.facility_instance_id = ?
  AND fsc.is_active = true;

-- Get current space usage for a team
SELECT 
  fsi.facility_instance_id,
  fsi.total_space,
  fsi.used_space,
  fsi.available_space
FROM facility_space_inventories fsi
WHERE fsi.team_id = ?
  AND fsi.activity_id = ?
ORDER BY fsi.facility_instance_id;

-- Calculate total inventory value by team
SELECT 
  fii.inventory_id,
  SUM(fii.total_value) as total_inventory_value,
  SUM(fii.total_space_occupied) as total_space_used
FROM facility_inventory_items fii
JOIN facility_space_inventories fsi ON fii.inventory_id = fsi.id
WHERE fsi.team_id = ?
  AND fii.status = 'AVAILABLE'
GROUP BY fii.inventory_id;
```

## Seed Data Structure

```typescript
// Seed facility space configurations as separate records
const facilitySpaceConfigs = [
  // Template 1 - RAW_MATERIAL_PRODUCTION facilities
  {
    templateId: 1,
    facilityType: 'MINE',
    initialSpace: 300,
    spacePerLevel: 150,
    maxSpace: 1500,
    isStorageFacility: true
  },
  {
    templateId: 1,
    facilityType: 'QUARRY',
    initialSpace: 350,
    spacePerLevel: 175,
    maxSpace: 1750,
    isStorageFacility: true
  },
  {
    templateId: 1,
    facilityType: 'FOREST',
    initialSpace: 400,
    spacePerLevel: 200,
    maxSpace: 2000,
    isStorageFacility: true
  },
  {
    templateId: 1,
    facilityType: 'FARM',
    initialSpace: 500,
    spacePerLevel: 250,
    maxSpace: 2500,
    isStorageFacility: true
  },
  {
    templateId: 1,
    facilityType: 'RANCH',
    initialSpace: 450,
    spacePerLevel: 225,
    maxSpace: 2250,
    isStorageFacility: true
  },
  {
    templateId: 1,
    facilityType: 'FISHERY',
    initialSpace: 350,
    spacePerLevel: 175,
    maxSpace: 1750,
    isStorageFacility: true
  },
  
  // Template 1 - FUNCTIONAL facilities
  {
    templateId: 1,
    facilityType: 'FACTORY',
    initialSpace: 500,
    spacePerLevel: 250,
    maxSpace: 2500,
    isStorageFacility: true
  },
  {
    templateId: 1,
    facilityType: 'MALL',
    initialSpace: 800,
    spacePerLevel: 400,
    maxSpace: 4000,
    isStorageFacility: true
  },
  {
    templateId: 1,
    facilityType: 'WAREHOUSE',
    initialSpace: 1000,
    spacePerLevel: 500,
    maxSpace: 5000,
    isStorageFacility: true
  },
  
  // Template 1 - INFRASTRUCTURE facilities (NO STORAGE)
  {
    templateId: 1,
    facilityType: 'WATER_PLANT',
    initialSpace: 0,
    spacePerLevel: 0,
    maxSpace: 0,
    isStorageFacility: false
  },
  {
    templateId: 1,
    facilityType: 'POWER_PLANT',
    initialSpace: 0,
    spacePerLevel: 0,
    maxSpace: 0,
    isStorageFacility: false
  },
  {
    templateId: 1,
    facilityType: 'BASE_STATION',
    initialSpace: 0,
    spacePerLevel: 0,
    maxSpace: 0,
    isStorageFacility: false
  },
  {
    templateId: 1,
    facilityType: 'FIRE_STATION',
    initialSpace: 0,
    spacePerLevel: 0,
    maxSpace: 0,
    isStorageFacility: false
  },
  
  // Template 1 - OTHER facilities (NO STORAGE)
  {
    templateId: 1,
    facilityType: 'SCHOOL',
    initialSpace: 0,
    spacePerLevel: 0,
    maxSpace: 0,
    isStorageFacility: false
  },
  {
    templateId: 1,
    facilityType: 'HOSPITAL',
    initialSpace: 0,
    spacePerLevel: 0,
    maxSpace: 0,
    isStorageFacility: false
  },
  {
    templateId: 1,
    facilityType: 'PARK',
    initialSpace: 0,
    spacePerLevel: 0,
    maxSpace: 0,
    isStorageFacility: false
  },
  {
    templateId: 1,
    facilityType: 'CINEMA',
    initialSpace: 0,
    spacePerLevel: 0,
    maxSpace: 0,
    isStorageFacility: false
  }
  // ... configurations for other templates
];
```

## Data Integrity Checks

```sql
-- Verify space calculations are consistent
SELECT 
  fsi.id,
  fsi.used_space,
  fsi.raw_material_space + fsi.product_space + fsi.buffer_space as calculated_space,
  ABS(fsi.used_space - (fsi.raw_material_space + fsi.product_space + fsi.buffer_space)) as difference
FROM facility_space_inventories fsi
WHERE ABS(fsi.used_space - (fsi.raw_material_space + fsi.product_space + fsi.buffer_space)) > 0.001;

-- Check for orphaned inventory items
SELECT COUNT(*) as orphaned_items
FROM facility_inventory_items fii
LEFT JOIN facility_space_inventories fsi ON fii.inventory_id = fsi.id
WHERE fsi.id IS NULL;

```

## Implementation Notes

This is a simplified data model for a simulation system:

1. **Space Tracking**: Basic tracking of used vs available space
2. **Inventory Items**: Simple list of what's stored in each facility
3. **Validation**: Basic checks for space constraints and positive quantities

The model focuses on simulation needs rather than production system complexity.