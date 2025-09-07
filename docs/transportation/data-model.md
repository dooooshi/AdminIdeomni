# Transportation System Data Model

## Overview

This document defines the database schema for the Transportation Management system using Prisma ORM with PostgreSQL. The system tracks instant transfers of raw materials and products between facilities, with configurable tier-based pricing and carbon emission tracking.

## Core Principles

1. **Instant Delivery**: All transfers complete immediately with no transit state
2. **Tier-Based Pricing**: Four configurable tiers with distance restrictions
3. **Carbon Tracking**: Every transfer contributes to carbon footprint
4. **Atomic Transactions**: All-or-nothing transfer execution
5. **Audit Trail**: Complete history of all transportation operations

## Integration with Existing Infrastructure

The transportation system integrates with existing models:
- **FacilitySpaceInventory**: Source and destination for transfers
- **FacilityInventoryItem**: Items being transported
- **Team**: Paying for transportation
- **Activity**: Context for all transfers
- **Infrastructure Distance**: Reuses hex distance calculations

## Prisma Models

### 1. TransportationConfig

Admin-managed configuration for transportation tiers per map template.

```prisma
// Transportation tier configuration per map template
// Location: prisma/models/transportation-config.prisma
model TransportationConfig {
  id                    String          @id @default(cuid())
  
  // Template association
  templateId            Int             @unique
  template              MapTemplate     @relation(fields: [templateId], references: [id], onDelete: Cascade)
  
  // Tier A Configuration (Economy - ONLY for Short Distance)
  tierABaseCost         Decimal         @db.Decimal(10, 2) @default(5)     // 5 gold per space unit per transport unit
  tierAEmissionRate     Decimal         @db.Decimal(10, 3) @default(1)     // 1 carbon per space unit per transport unit
  tierAMinDistance      Int             @default(1)                        // Available from 1 hex
  tierAMaxDistance      Int             @default(3)                        // Available up to 3 hexes
  tierASpaceBasis       Int             @default(1)                        // Price per 1 space unit
  tierAEnabled          Boolean         @default(true)
  
  // Tier B Configuration (Standard - ONLY for Medium Distance)
  tierBBaseCost         Decimal         @db.Decimal(10, 2) @default(30)    // 30 gold per 10 space units per transport unit
  tierBEmissionRate     Decimal         @db.Decimal(10, 3) @default(5)     // 5 carbon per 10 space units per transport unit
  tierBMinDistance      Int             @default(4)                        // Available from 4 hexes
  tierBMaxDistance      Int             @default(6)                        // Available up to 6 hexes
  tierBSpaceBasis       Int             @default(10)                       // Price per 10 space units
  tierBEnabled          Boolean         @default(true)
  
  // Tier C Configuration (Express - ONLY for Long Distance)
  tierCBaseCost         Decimal         @db.Decimal(10, 2) @default(200)   // 200 gold per 100 space units per transport unit
  tierCEmissionRate     Decimal         @db.Decimal(10, 3) @default(25)    // 25 carbon per 100 space units per transport unit
  tierCMinDistance      Int             @default(7)                        // Available from 7 hexes
  tierCMaxDistance      Int             @default(9)                        // Available up to 9 hexes
  tierCSpaceBasis       Int             @default(100)                      // Price per 100 space units
  tierCEnabled          Boolean         @default(true)
  
  // Tier D Configuration (Premium - ONLY for Very Long Distance)
  tierDBaseCost         Decimal         @db.Decimal(10, 2) @default(1000)  // 1000 gold per 1000 space units per transport unit
  tierDEmissionRate     Decimal         @db.Decimal(10, 3) @default(100)   // 100 carbon per 1000 space units per transport unit
  tierDMinDistance      Int             @default(10)                       // Available from 10 hexes (no max)
  tierDSpaceBasis       Int             @default(1000)                     // Price per 1000 space units
  tierDEnabled          Boolean         @default(true)
  
  // Global Settings
  enableCrossTeamTransfers Boolean      @default(true)                     // Allow transfers between teams
  maxTransferQuantity   Decimal?        @db.Decimal(12, 3)                 // Optional max quantity per transfer
  transferCooldownMinutes Int           @default(0)                        // Cooldown between transfers (0 = no cooldown)
  
  // Distance Category Boundaries (admin-configurable)
  distanceAMax          Int             @default(3)                        // Distance category A: 1-3
  distanceBMax          Int             @default(6)                        // Distance category B: 4-6
  distanceCMax          Int             @default(9)                        // Distance category C: 7-9
  // Distance category D: >9 (anything above C)
  
  // Metadata
  description           String?         // Optional description
  metadata              Json?           // Additional configuration data
  
  // Admin tracking
  isActive              Boolean         @default(true)
  createdBy             String?         // Admin ID who created
  lastModifiedBy        String?         // Admin ID who last modified
  
  // System fields
  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt
  
  // Relations
  transportationOrders  TransportationOrder[]
  
  @@index([templateId])
  @@index([isActive])
  @@map("transportation_configs")
}
```

### 2. TransportationOrder

Records of completed transportation transfers (instant delivery).

```prisma
// Transportation order tracking (all orders are instantly completed)
// Location: prisma/models/transportation-order.prisma
model TransportationOrder {
  id                    String          @id @default(cuid())
  
  // Configuration reference
  configId              String
  config                TransportationConfig @relation(fields: [configId], references: [id])
  
  // Source facility and inventory
  sourceInventoryId     String
  sourceInventory       FacilitySpaceInventory @relation("TransportSource", fields: [sourceInventoryId], references: [id])
  sourceFacilityId      String
  sourceFacility        TileFacilityInstance @relation("SourceFacility", fields: [sourceFacilityId], references: [id])
  
  // Destination facility and inventory
  destInventoryId       String
  destInventory         FacilitySpaceInventory @relation("TransportDestination", fields: [destInventoryId], references: [id])
  destFacilityId        String
  destFacility          TileFacilityInstance @relation("DestinationFacility", fields: [destFacilityId], references: [id])
  
  // Item reference (the actual inventory item transferred)
  inventoryItemId       String
  inventoryItem         FacilityInventoryItem @relation(fields: [inventoryItemId], references: [id])
  
  // Item details (cached from FacilityInventoryItem at time of transfer)
  itemType              InventoryItemType  // RAW_MATERIAL or PRODUCT
  rawMaterialId         Int?               // If RAW_MATERIAL
  rawMaterial           RawMaterial?       @relation(fields: [rawMaterialId], references: [id])
  productFormulaId      Int?               // If PRODUCT
  productFormula        ProductFormula?    @relation(fields: [productFormulaId], references: [id])
  
  // Transfer details
  quantity              Decimal         @db.Decimal(12, 3)  // Quantity transferred
  unitSpaceOccupied     Decimal         @db.Decimal(10, 6)  // From item's unitSpaceOccupied (carbon emission)
  totalSpaceTransferred Decimal         @db.Decimal(12, 3)  // From item's totalSpaceOccupied for this quantity
  
  // Transportation details
  tier                  String          // TIER_A, TIER_B, TIER_C, or TIER_D
  hexDistance           Int             // Hex distance (for tier selection)
  transportCostUnits    Int             // Sum of transportationCostUnit values (for fee calculation)
  distanceCategory      String          // DISTANCE_A, B, C, or D (based on hex distance)
  
  // Cost and emissions
  unitCost              Decimal         @db.Decimal(10, 4)  // Cost per unit
  totalGoldCost         Decimal         @db.Decimal(12, 2)  // Total gold charged
  carbonEmissionRate    Decimal         @db.Decimal(10, 3)  // Emission per unit/hex
  totalCarbonEmission   Decimal         @db.Decimal(12, 3)  // Total carbon emitted
  
  // Team information
  senderTeamId          String
  senderTeam            Team            @relation("SenderTeam", fields: [senderTeamId], references: [id])
  receiverTeamId        String
  receiverTeam          Team            @relation("ReceiverTeam", fields: [receiverTeamId], references: [id])
  
  // User tracking
  initiatedBy           String
  initiatedByUser       User            @relation(fields: [initiatedBy], references: [id])
  
  // Activity context
  activityId            String
  activity              Activity        @relation(fields: [activityId], references: [id])
  
  // Status (always COMPLETED for instant delivery)
  status                TransportStatus @default(COMPLETED)
  completedAt           DateTime        @default(now())
  
  // Additional metadata
  metadata              Json?           // Additional transfer data
  
  // System fields
  createdAt             DateTime        @default(now())
  
  // Ensure item type consistency
  @@check("(item_type = 'RAW_MATERIAL' AND raw_material_id IS NOT NULL AND product_formula_id IS NULL) OR (item_type = 'PRODUCT' AND product_formula_id IS NOT NULL AND raw_material_id IS NULL)")
  
  @@index([senderTeamId, createdAt])
  @@index([receiverTeamId, createdAt])
  @@index([activityId, createdAt])
  @@index([sourceInventoryId])
  @@index([destInventoryId])
  @@index([tier, distanceCategory])
  @@map("transportation_orders")
}

enum TransportStatus {
  COMPLETED
  FAILED      // Only if rollback needed
  CANCELLED   // If cancelled before execution
}
```

### 3. TransportationCostPreview

Temporary storage for cost calculations before confirmation (optional, for UI preview).

```prisma
// Cost preview calculations (temporary, auto-cleanup after 1 hour)
// Location: prisma/models/transportation-cost-preview.prisma
model TransportationCostPreview {
  id                    String          @id @default(cuid())
  
  // Request details
  sourceInventoryId     String
  destInventoryId       String
  itemType              InventoryItemType
  itemId                Int             // Raw material or product ID
  quantity              Decimal         @db.Decimal(12, 3)
  
  // Calculated distance
  hexDistance           Int
  distanceCategory      String
  
  // Available tiers and costs
  availableTiers        Json            // Array of tier calculations
  /* Structure:
  [
    {
      tier: "TIER_A",
      available: true,
      unitCost: 5.00,
      totalCost: 250.00,
      carbonEmission: 50.00,
      reason: null
    },
    {
      tier: "TIER_B",
      available: false,
      reason: "Distance exceeds tier maximum"
    }
  ]
  */
  
  // Requesting team
  teamId                String
  userId                String
  
  // Expiry (auto-delete after 1 hour)
  expiresAt             DateTime
  createdAt             DateTime        @default(now())
  
  @@index([teamId, createdAt])
  @@index([expiresAt])
  @@map("transportation_cost_previews")
}
```


## Integration with Existing Models

### Extensions to FacilitySpaceInventory

```prisma
// Add transportation relationships to FacilitySpaceInventory
model FacilitySpaceInventory {
  // ... existing fields ...
  
  // Transportation relationships
  outgoingTransfers     TransportationOrder[] @relation("TransportSource")
  incomingTransfers     TransportationOrder[] @relation("TransportDestination")
}
```

### Extensions to TileFacilityInstance

```prisma
// Add transportation relationships to TileFacilityInstance
model TileFacilityInstance {
  // ... existing fields ...
  
  // Transportation relationships
  sourceTransfers       TransportationOrder[] @relation("SourceFacility")
  destinationTransfers  TransportationOrder[] @relation("DestinationFacility")
}
```

### Extensions to Team

```prisma
// Add transportation relationships to Team
model Team {
  // ... existing fields ...
  
  // Transportation relationships
  sentTransfers         TransportationOrder[] @relation("SenderTeam")
  receivedTransfers     TransportationOrder[] @relation("ReceiverTeam")
}
```

### Extensions to Activity

```prisma
// Add transportation relationships to Activity
model Activity {
  // ... existing fields ...
  
  // Transportation relationships
  transportationOrders  TransportationOrder[]
}
```

```

### Extensions to User

```prisma
// Add transportation order relationship to User
model User {
  // ... existing fields ...
  
  // Transportation orders initiated
  transportationOrders  TransportationOrder[]
}
```

## Calculated Fields and Business Logic

### Space Unit Calculation

Space units are derived from the carbon emission values of items:

```typescript
// For Raw Materials
function getRawMaterialSpaceUnit(rawMaterial: RawMaterial): Decimal {
  return rawMaterial.carbonEmission; // From RawMaterial model
}

// For Products  
function getProductSpaceUnit(productFormula: ProductFormula): Decimal {
  return productFormula.productFormulaCarbonEmission; // From ProductFormula model
}

// For Inventory Items
function getInventoryItemTotalSpace(item: FacilityInventoryItem): Decimal {
  return item.totalSpaceOccupied; // quantity × unitSpaceOccupied
}
```

### Dual Distance System

The transportation system uses TWO different distance measurements:

1. **Hex Distance**: Simple hex count between facilities (for tier selection)
2. **Transportation Cost Units**: Sum of transportationCostUnit from tiles (for fee calculation)

```typescript
// 1. Calculate hex distance for tier selection
function calculateHexDistance(
  sourceTile: MapTile,
  destinationTile: MapTile
): number {
  return (
    Math.abs(sourceTile.axialQ - destinationTile.axialQ) + 
    Math.abs(sourceTile.axialQ + sourceTile.axialR - destinationTile.axialQ - destinationTile.axialR) + 
    Math.abs(sourceTile.axialR - destinationTile.axialR)
  ) / 2;
}

// 2. Calculate transportation cost units for fee calculation
function calculateTransportCostUnits(
  sourceTile: MapTile,
  destinationTile: MapTile,
  mapTiles: MapTile[]
): number {
  // Find optimal path between source and destination
  const path = findOptimalPath(sourceTile, destinationTile, mapTiles);
  
  // Sum transportationCostUnit for all tiles in the path
  return path.reduce((total, tile) => {
    // Each tile has a transportationCostUnit value (e.g., 1, 3, 5)
    return total + (tile.transportationCostUnit || 1);
  }, 0);
}

// The pathfinding algorithm should minimize total transportation cost
// Not necessarily the shortest hex path
function findOptimalPath(
  source: MapTile,
  destination: MapTile,
  allTiles: MapTile[]
): MapTile[] {
  // Use Dijkstra's algorithm or A* with transportationCostUnit as edge weights
  // Returns array of tiles forming the optimal path
  return pathTiles;
}
```

### Cost Calculation

```typescript
function calculateTransportCost(
  config: TransportationConfig,
  tier: string,
  inventoryItem: FacilityInventoryItem,  // Item being transferred
  transferQuantity: Decimal,              // Quantity to transfer
  hexDistance: number,                    // Hex distance (for tier validation)
  transportCostUnits: number              // Transport cost units (for fee calculation)
): { goldCost: Decimal, carbonEmission: Decimal } {
  // Calculate space units for the transfer quantity
  const spaceUnits = inventoryItem.unitSpaceOccupied.mul(transferQuantity);
  
  let baseCost: Decimal;
  let emissionRate: Decimal;
  let spaceBasis: number;
  
  switch(tier) {
    case 'TIER_A':
      baseCost = config.tierABaseCost;       // 5 gold
      emissionRate = config.tierAEmissionRate; // 1 carbon
      spaceBasis = config.tierASpaceBasis;   // per 1 space unit
      break;
    case 'TIER_B':
      baseCost = config.tierBBaseCost;       // 30 gold
      emissionRate = config.tierBEmissionRate; // 5 carbon
      spaceBasis = config.tierBSpaceBasis;   // per 10 space units
      break;
    case 'TIER_C':
      baseCost = config.tierCBaseCost;       // 200 gold
      emissionRate = config.tierCEmissionRate; // 25 carbon
      spaceBasis = config.tierCSpaceBasis;   // per 100 space units
      break;
    case 'TIER_D':
      baseCost = config.tierDBaseCost;       // 1000 gold
      emissionRate = config.tierDEmissionRate; // 100 carbon
      spaceBasis = config.tierDSpaceBasis;   // per 1000 space units
      break;
  }
  
  // Calculate cost per space unit
  const costPerSpaceUnit = baseCost.div(spaceBasis);
  const emissionPerSpaceUnit = emissionRate.div(spaceBasis);
  
  // Total costs (using transport cost units, NOT hex distance)
  const goldCost = costPerSpaceUnit.mul(spaceUnits).mul(transportCostUnits);
  const carbonEmission = emissionPerSpaceUnit.mul(spaceUnits).mul(transportCostUnits);
  
  return { goldCost, carbonEmission };
}
```

### Tier Availability

```typescript
function getAvailableTiers(
  config: TransportationConfig,
  hexDistance: number
): string[] {
  // Each tier is exclusively available for its specific HEX distance range
  // Only ONE tier is available for any given hex distance
  
  if (config.tierAEnabled && 
      hexDistance >= config.tierAMinDistance && 
      hexDistance <= config.tierAMaxDistance) {
    return ['TIER_A'];  // 1-3 hexes ONLY
  }
  
  if (config.tierBEnabled && 
      hexDistance >= config.tierBMinDistance && 
      hexDistance <= config.tierBMaxDistance) {
    return ['TIER_B'];  // 4-6 hexes ONLY
  }
  
  if (config.tierCEnabled && 
      hexDistance >= config.tierCMinDistance && 
      hexDistance <= config.tierCMaxDistance) {
    return ['TIER_C'];  // 7-9 hexes ONLY
  }
  
  if (config.tierDEnabled && hexDistance >= config.tierDMinDistance) {
    return ['TIER_D'];  // 10+ hexes ONLY
  }
  
  return [];  // No tier available (should not happen with proper config)
}
```

## Indexes and Performance

### Primary Indexes

```sql
-- Transportation Config
CREATE UNIQUE INDEX idx_transport_config_template ON transportation_configs(template_id);
CREATE INDEX idx_transport_config_active ON transportation_configs(is_active);

-- Transportation Orders
CREATE INDEX idx_transport_orders_sender ON transportation_orders(sender_team_id, created_at DESC);
CREATE INDEX idx_transport_orders_receiver ON transportation_orders(receiver_team_id, created_at DESC);
CREATE INDEX idx_transport_orders_activity ON transportation_orders(activity_id, created_at DESC);
CREATE INDEX idx_transport_orders_source ON transportation_orders(source_inventory_id);
CREATE INDEX idx_transport_orders_dest ON transportation_orders(dest_inventory_id);
CREATE INDEX idx_transport_orders_tier ON transportation_orders(tier, distance_category);

-- Cost Previews
CREATE INDEX idx_cost_preview_team ON transportation_cost_previews(team_id, created_at DESC);
CREATE INDEX idx_cost_preview_expiry ON transportation_cost_previews(expires_at);
```

### Query Optimization Examples

```sql
-- Get transportation history for a team
SELECT 
  to.*,
  rm.name as raw_material_name,
  pf.product_name as product_name
FROM transportation_orders to
LEFT JOIN raw_materials rm ON to.raw_material_id = rm.id
LEFT JOIN product_formulas pf ON to.product_formula_id = pf.id
WHERE to.sender_team_id = ? OR to.receiver_team_id = ?
ORDER BY to.created_at DESC
LIMIT 50;

```

## Migration Strategy

### Initial Setup

```typescript
// Migration to create transportation tables
export async function up(knex: Knex): Promise<void> {
  // 1. Create transportation_configs table
  await knex.schema.createTable('transportation_configs', (table) => {
    table.string('id').primary();
    table.integer('template_id').unique().notNullable();
    // ... all config fields
    table.timestamps(true, true);
    
    table.foreign('template_id').references('map_templates.id').onDelete('CASCADE');
  });
  
  // 2. Create transportation_orders table
  await knex.schema.createTable('transportation_orders', (table) => {
    table.string('id').primary();
    // ... all order fields
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Foreign keys
    table.foreign('config_id').references('transportation_configs.id');
    table.foreign('source_inventory_id').references('facility_space_inventories.id');
    // ... other foreign keys
  });
  
  // 3. Create indexes
  await knex.raw('CREATE INDEX ...');
}
```

### Seed Data Structure

```typescript
// Default transportation configuration for templates
const defaultTransportConfig = {
  // Tier A - Economy (1-3 hexes ONLY)
  tierABaseCost: 5,          // 5 gold per space unit per transport unit
  tierAEmissionRate: 1,       // 1 carbon per space unit per transport unit
  tierAMinDistance: 1,
  tierAMaxDistance: 3,
  tierASpaceBasis: 1,         // Per 1 space unit
  tierAEnabled: true,
  
  // Tier B - Standard (4-6 hexes ONLY)  
  tierBBaseCost: 30,          // 30 gold per 10 space units per transport unit
  tierBEmissionRate: 5,       // 5 carbon per 10 space units per transport unit
  tierBMinDistance: 4,
  tierBMaxDistance: 6,
  tierBSpaceBasis: 10,        // Per 10 space units
  tierBEnabled: true,
  
  // Tier C - Express (7-9 hexes ONLY)
  tierCBaseCost: 200,         // 200 gold per 100 space units per transport unit
  tierCEmissionRate: 25,      // 25 carbon per 100 space units per transport unit
  tierCMinDistance: 7,
  tierCMaxDistance: 9,
  tierCSpaceBasis: 100,       // Per 100 space units
  tierCEnabled: true,
  
  // Tier D - Premium (10+ hexes ONLY)
  tierDBaseCost: 1000,        // 1000 gold per 1000 space units per transport unit
  tierDEmissionRate: 100,     // 100 carbon per 1000 space units per transport unit
  tierDMinDistance: 10,
  tierDSpaceBasis: 1000,      // Per 1000 space units
  tierDEnabled: true,
  
  // Global settings
  enableCrossTeamTransfers: true,
  maxTransferQuantity: null, // Unlimited
  transferCooldownMinutes: 0,
  
  // Distance categories
  distanceAMax: 3,
  distanceBMax: 6,
  distanceCMax: 9,
  
  isActive: true
};

// Apply to each map template
async function seedTransportationConfigs() {
  const templates = await prisma.mapTemplate.findMany();
  
  for (const template of templates) {
    await prisma.transportationConfig.create({
      data: {
        templateId: template.id,
        ...defaultTransportConfig
      }
    });
  }
}
```

## Data Integrity Checks

```sql
-- Verify all orders have valid inventories
SELECT COUNT(*) as orphaned_orders
FROM transportation_orders to
LEFT JOIN facility_space_inventories fsi_source ON to.source_inventory_id = fsi_source.id
LEFT JOIN facility_space_inventories fsi_dest ON to.dest_inventory_id = fsi_dest.id
WHERE fsi_source.id IS NULL OR fsi_dest.id IS NULL;

-- Check for configuration consistency
SELECT 
  tc.*,
  CASE 
    WHEN tc.tier_a_max_distance >= tc.tier_b_max_distance THEN 'Tier A max >= Tier B max'
    WHEN tc.tier_b_max_distance >= tc.tier_c_max_distance THEN 'Tier B max >= Tier C max'
    ELSE 'OK'
  END as validation_status
FROM transportation_configs tc
WHERE tc.is_active = true;

-- Verify carbon emissions are tracked
SELECT 
  DATE(created_at) as date,
  COUNT(*) as transfers_without_emissions
FROM transportation_orders
WHERE total_carbon_emission = 0 OR total_carbon_emission IS NULL
GROUP BY DATE(created_at);
```

## Implementation Notes

### Transaction Management

1. **Atomic Transfers**: Use database transactions for all transfer operations
2. **Inventory Locking**: Lock source inventory row during transfer
3. **Balance Checks**: Verify team balance before deducting fees
4. **Rollback Strategy**: Automatic rollback on any failure

### Performance Considerations

1. **Distance Caching**: Cache calculated distances between facilities
2. **Configuration Caching**: Cache active transport configs per template
3. **Batch Processing**: Support bulk transfers in single transaction
4. **Analytics Jobs**: Run analytics aggregation as background jobs

### Security Considerations

1. **Permission Checks**: Verify user belongs to team initiating transfer
2. **Facility Ownership**: Validate team owns source facility
3. **Activity Context**: Ensure all facilities in same activity
4. **Rate Limiting**: Prevent rapid repeated transfers if configured