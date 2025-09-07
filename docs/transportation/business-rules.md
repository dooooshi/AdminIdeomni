# Transportation System Business Rules

## Overview

This document defines the business rules, calculations, and operational logic for the instant transportation system. The system enables teams to transfer raw materials and products between facilities with configurable cost tiers and carbon emission tracking.

## Core Concepts

### Instant Delivery Model
- **No Transit Time**: Transfers complete immediately upon payment
- **Atomic Operations**: Either the entire transfer succeeds or fails completely
- **Real-time Updates**: Source and destination inventories update simultaneously

### System-Collected Fees
- **Gold Sink Mechanism**: All transportation fees are collected by the system
- **No Player Trading Fees**: Fees do not go to other players
- **Automatic Deduction**: Fees deducted from team balance upon transfer

## Transportation Tier System

### Tier Definitions

The system offers four transportation tiers, each with different cost structures and carbon emissions:

```typescript
enum TransportationTier {
  A = "TIER_A", // Economy - short distance only
  B = "TIER_B", // Standard - medium distance
  C = "TIER_C", // Express - long distance
  D = "TIER_D"  // Premium - unlimited distance
}
```

### Tier Specifications

| Tier | Base Cost | Cost Calculation | Carbon Emission | Space-Based Pricing |
|------|-----------|------------------|-----------------|---------------------|
| A | 5 gold | 5 gold per space unit per transport unit | 1 carbon per space unit per transport unit | 1 space unit basis |
| B | 30 gold | 30 gold per 10 space units per transport unit | 5 carbon per 10 space units per transport unit | 10 space units basis |
| C | 200 gold | 200 gold per 100 space units per transport unit | 25 carbon per 100 space units per transport unit | 100 space units basis |
| D | 1000 gold | 1000 gold per 1000 space units per transport unit | 100 carbon per 1000 space units per transport unit | 1000 space units basis |

### Space-Based Pricing Explanation

Transportation costs are calculated based on the **space occupied** by items (measured in carbon emission units):
- **Tier A**: 5 gold per space unit per transportation cost unit (best for small space requirements)
- **Tier B**: 3 gold per space unit per transportation cost unit (30 gold/10 units)
- **Tier C**: 2 gold per space unit per transportation cost unit (200 gold/100 units)
- **Tier D**: 1 gold per space unit per transportation cost unit (1000 gold/1000 units)

**Space Unit Sources**:
- **Raw Materials**: Space unit = `RawMaterial.carbonEmission` value
- **Products**: Space unit = `ProductFormula.productFormulaCarbonEmission` value
- **Inventory Items**: Total space = `FacilityInventoryItem.totalSpaceOccupied` (quantity × unitSpaceOccupied)

## Distance Calculation

### Two Types of Distance

The transportation system uses TWO different distance measurements:

1. **Hex Distance** - Simple hex count between facilities (for tier selection)
2. **Transportation Cost Units** - Sum of `transportationCostUnit` values from tiles (for fee calculation)

### 1. Hex Distance (For Tier Selection)

Simple hexagonal grid distance calculation:

```typescript
function calculateHexDistance(
  from: {axialQ: number, axialR: number}, 
  to: {axialQ: number, axialR: number}
): number {
  return (
    Math.abs(from.axialQ - to.axialQ) + 
    Math.abs(from.axialQ + from.axialR - to.axialQ - to.axialR) + 
    Math.abs(from.axialR - to.axialR)
  ) / 2;
}
```

### 2. Transportation Cost Units (For Fee Calculation)

Sum of `transportationCostUnit` values from each MapTile along the optimal path:

```typescript
// Example: 4-hex path with different transportation costs
// Hex 1: transportationCostUnit = 1 (plain)
// Hex 2: transportationCostUnit = 3 (mountain)
// Hex 3: transportationCostUnit = 2 (hills)
// Hex 4: transportationCostUnit = 1 (plain)
// Hex Distance = 4 (determines tier: B)
// Transportation Cost Units = 1 + 3 + 2 + 1 = 7 (used for fee calculation)

function calculateTransportationCostUnits(
  sourceTile: MapTile,
  destinationTile: MapTile,
  mapTiles: MapTile[]
): number {
  // Find optimal path between source and destination
  const path = findOptimalPath(sourceTile, destinationTile, mapTiles);
  
  // Sum transportation cost units for all tiles in path
  return path.reduce((total, tile) => {
    return total + (tile.transportationCostUnit || 1); // Default to 1 if not set
  }, 0);
}
```

### Distance Categories (Based on Hex Distance)

```typescript
enum DistanceCategory {
  A = "DISTANCE_A", // 1-3 hexes
  B = "DISTANCE_B", // 4-6 hexes
  C = "DISTANCE_C", // 7-9 hexes
  D = "DISTANCE_D"  // >9 hexes
}

function getDistanceCategory(hexDistance: number): DistanceCategory {
  // Uses HEX distance for tier selection, NOT transportation cost units
  if (hexDistance <= 3) return DistanceCategory.A;
  if (hexDistance <= 6) return DistanceCategory.B;
  if (hexDistance <= 9) return DistanceCategory.C;
  return DistanceCategory.D;
}
```

## Tier Availability Matrix

### Distance-Based Restrictions

Each tier is restricted to specific distance ranges:

| Distance Category | Range (hexes) | Available Tiers | Restricted Tiers |
|-------------------|---------------|-----------------|------------------|
| A (Short) | 1-3 | ✅ A only | B, C, D |
| B (Medium) | 4-6 | ✅ B only | A, C, D |
| C (Long) | 7-9 | ✅ C only | A, B, D |
| D (Very Long) | >9 | ✅ D only | A, B, C |

### Availability Logic

```typescript
function getAvailableTiers(hexDistance: number): TransportationTier[] {
  const category = getDistanceCategory(hexDistance);
  
  // Each tier is exclusively available for its specific hex distance range
  switch(category) {
    case DistanceCategory.A:
      return [Tier.A];  // ONLY Tier A for 1-3 hexes
    case DistanceCategory.B:
      return [Tier.B];  // ONLY Tier B for 4-6 hexes
    case DistanceCategory.C:
      return [Tier.C];  // ONLY Tier C for 7-9 hexes
    case DistanceCategory.D:
      return [Tier.D];  // ONLY Tier D for >9 hexes
  }
}
```

## Cost Calculations

### Transportation Cost Formula

```typescript
interface TransportationCost {
  goldCost: Decimal;
  carbonEmission: Decimal;
}

function calculateTransportationCost(
  tier: TransportationTier,
  inventoryItem: FacilityInventoryItem,  // The item being transferred
  transferQuantity: Decimal,              // Quantity to transfer
  transportCostUnits: number,             // Sum of transportationCostUnit values along path
  config: TransportationConfig
): TransportationCost {
  // Get space units from the inventory item
  const spaceUnits = inventoryItem.unitSpaceOccupied.mul(transferQuantity);
  let goldCost: Decimal;
  let carbonEmission: Decimal;
  
  switch(tier) {
    case Tier.A:
      // 5 gold per space unit per transportation cost unit
      goldCost = new Decimal(5).mul(spaceUnits).mul(transportCostUnits);
      carbonEmission = new Decimal(1).mul(spaceUnits).mul(transportCostUnits);
      break;
    case Tier.B:
      // 30 gold per 10 space units per transportation cost unit (3 gold per space unit)
      goldCost = new Decimal(3).mul(spaceUnits).mul(transportCostUnits);
      carbonEmission = new Decimal(0.5).mul(spaceUnits).mul(transportCostUnits); // 5 per 10 units
      break;
    case Tier.C:
      // 200 gold per 100 space units per transportation cost unit (2 gold per space unit)
      goldCost = new Decimal(2).mul(spaceUnits).mul(transportCostUnits);
      carbonEmission = new Decimal(0.25).mul(spaceUnits).mul(transportCostUnits); // 25 per 100 units
      break;
    case Tier.D:
      // 1000 gold per 1000 space units per transportation cost unit (1 gold per space unit)
      goldCost = new Decimal(1).mul(spaceUnits).mul(transportCostUnits);
      carbonEmission = new Decimal(0.1).mul(spaceUnits).mul(transportCostUnits); // 100 per 1000 units
      break;
  }
  
  return {
    goldCost: goldCost,
    carbonEmission: carbonEmission
  };
}
```

### Example Calculations

#### Example 1: Short Distance Transfer
- **Scenario**: Transfer iron ore occupying 50 space units
- **Hex Distance**: 2 hexes (straight line)
- **Transportation Cost Units**: 3 (tiles: plain=1, mountain=2)
- **Distance Category**: A (based on 2 hexes)
- **Available Tier**: ONLY Tier A

| Tier | Cost Calculation | Total Cost | Carbon Emission |
|------|------------------|------------|-----------------|
| A | 5 gold × 50 space × 3 transport units | 750 gold | 150 carbon |

#### Example 2: Medium Distance Transfer
- **Scenario**: Transfer steel occupying 100 space units
- **Hex Distance**: 5 hexes
- **Transportation Cost Units**: 8 (varied terrain)
- **Distance Category**: B (based on 5 hexes)
- **Available Tier**: ONLY Tier B

| Tier | Cost Calculation | Total Cost | Carbon Emission |
|------|------------------|------------|-----------------|
| B | 3 gold × 100 space × 8 transport units | 2,400 gold | 400 carbon |

#### Example 3: Long Distance Transfer
- **Scenario**: Transfer products occupying 500 space units
- **Hex Distance**: 8 hexes
- **Transportation Cost Units**: 12 (difficult terrain)
- **Distance Category**: C (based on 8 hexes)
- **Available Tier**: ONLY Tier C

| Tier | Cost Calculation | Total Cost | Carbon Emission |
|------|------------------|------------|-----------------|
| C | 2 gold × 500 space × 12 transport units | 12,000 gold | 1,500 carbon |

#### Example 4: Very Long Distance Transfer
- **Scenario**: Transfer raw materials occupying 1000 space units
- **Hex Distance**: 12 hexes
- **Transportation Cost Units**: 18 (mixed terrain)
- **Distance Category**: D (based on 12 hexes, >9)
- **Available Tier**: ONLY Tier D

| Tier | Cost Calculation | Total Cost | Carbon Emission |
|------|------------------|------------|-----------------|
| D | 1 gold × 1000 space × 18 transport units | 18,000 gold | 1,800 carbon |

## Transfer Validation Rules

### Pre-Transfer Validation

```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function validateTransfer(
  source: FacilitySpaceInventory,
  destination: FacilitySpaceInventory,
  item: TransferItem,
  tier: TransportationTier,
  team: Team
): ValidationResult {
  const errors: string[] = [];
  
  // 1. Check source has sufficient inventory
  if (!hassufficientInventory(source, item)) {
    errors.push("INSUFFICIENT_INVENTORY");
  }
  
  // 2. Check destination has sufficient space
  const requiredSpace = calculateItemSpace(item);
  if (destination.availableSpace < requiredSpace) {
    errors.push("INSUFFICIENT_SPACE");
  }
  
  // 3. Check tier is available for hex distance
  const hexDistance = calculateHexDistance(source.location, destination.location);
  const transportCostUnits = calculateTransportationCostUnits(source.tile, destination.tile, mapTiles);
  const availableTiers = getAvailableTiers(hexDistance);
  if (!availableTiers.includes(tier)) {
    errors.push("TIER_NOT_AVAILABLE");
  }
  
  // 4. Check team has sufficient funds
  const cost = calculateTransportationCost(tier, item, item.quantity, transportCostUnits, config);
  if (team.balance < cost.goldCost) {
    errors.push("INSUFFICIENT_FUNDS");
  }
  
  // 5. Check facilities are active
  if (source.facilityInstance.status !== "ACTIVE") {
    errors.push("SOURCE_FACILITY_INACTIVE");
  }
  if (destination.facilityInstance.status !== "ACTIVE") {
    errors.push("DESTINATION_FACILITY_INACTIVE");
  }
  
  // 6. Check same activity context
  if (source.activityId !== destination.activityId) {
    errors.push("DIFFERENT_ACTIVITY");
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}
```

### Item Space Calculation

Space calculations use carbon emission values from the facility-space system:

```typescript
function calculateItemSpace(item: TransferItem): Decimal {
  if (item.type === "RAW_MATERIAL") {
    return item.quantity.mul(item.rawMaterial.carbonEmission);
  } else if (item.type === "PRODUCT") {
    return item.quantity.mul(item.productFormula.productFormulaCarbonEmission);
  }
  return new Decimal(0);
}
```

## Transfer Execution Rules

### Atomic Transaction Flow

```typescript
async function executeTransfer(
  transferRequest: TransferRequest
): Promise<TransferResult> {
  // Begin transaction
  return await prisma.$transaction(async (tx) => {
    // 1. Validate transfer
    const validation = validateTransfer(/* params */);
    if (!validation.valid) {
      throw new BusinessException(validation.errors);
    }
    
    // 2. Deduct from source inventory
    await deductInventory(tx, source, item, quantity);
    
    // 3. Add to destination inventory
    await addInventory(tx, destination, item, quantity);
    
    // 4. Deduct transportation fee from team
    await deductTeamBalance(tx, team, cost.goldCost);
    
    // 5. Record carbon emission
    await recordCarbonEmission(tx, team, cost.carbonEmission);
    
    // 6. Create transfer record
    const order = await createTransportationOrder(tx, {
      sourceInventoryId: source.id,
      destInventoryId: destination.id,
      tier: tier,
      distance: distance,
      totalCost: cost.goldCost,
      carbonEmission: cost.carbonEmission,
      status: "COMPLETED",
      completedAt: new Date()
    });
    
    // 7. Log operation
    await logTeamOperation(tx, {
      type: "TRANSPORTATION_TRANSFER",
      teamId: team.id,
      details: order
    });
    
    return { success: true, orderId: order.id };
  });
}
```

### Inventory Update Rules

```typescript
// Deduct from source
async function deductInventory(
  tx: PrismaTransaction,
  inventory: FacilitySpaceInventory,
  item: InventoryItem,
  quantity: Decimal
): Promise<void> {
  // Update inventory item quantity
  await tx.facilityInventoryItem.update({
    where: { id: item.id },
    data: {
      quantity: { decrement: quantity },
      totalSpaceOccupied: { 
        decrement: quantity.mul(item.unitSpaceOccupied) 
      }
    }
  });
  
  // Update space inventory totals
  const spaceFreed = quantity.mul(item.unitSpaceOccupied);
  await tx.facilitySpaceInventory.update({
    where: { id: inventory.id },
    data: {
      usedSpace: { decrement: spaceFreed },
      availableSpace: { increment: spaceFreed },
      [item.type === "RAW_MATERIAL" ? "rawMaterialSpace" : "productSpace"]: {
        decrement: spaceFreed
      }
    }
  });
}

// Add to destination
async function addInventory(
  tx: PrismaTransaction,
  inventory: FacilitySpaceInventory,
  item: InventoryItem,
  quantity: Decimal
): Promise<void> {
  // Check if item already exists in destination
  const existingItem = await findExistingItem(tx, inventory, item);
  
  if (existingItem) {
    // Update existing item
    await tx.facilityInventoryItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: { increment: quantity },
        totalSpaceOccupied: { 
          increment: quantity.mul(item.unitSpaceOccupied) 
        }
      }
    });
  } else {
    // Create new item
    await tx.facilityInventoryItem.create({
      data: {
        inventoryId: inventory.id,
        itemType: item.type,
        rawMaterialId: item.rawMaterialId,
        productFormulaId: item.productFormulaId,
        quantity: quantity,
        unitSpaceOccupied: item.unitSpaceOccupied,
        totalSpaceOccupied: quantity.mul(item.unitSpaceOccupied)
      }
    });
  }
  
  // Update space inventory totals
  const spaceUsed = quantity.mul(item.unitSpaceOccupied);
  await tx.facilitySpaceInventory.update({
    where: { id: inventory.id },
    data: {
      usedSpace: { increment: spaceUsed },
      availableSpace: { decrement: spaceUsed },
      [item.type === "RAW_MATERIAL" ? "rawMaterialSpace" : "productSpace"]: {
        increment: spaceUsed
      }
    }
  });
}
```

## Cross-Team Transfer Rules

### Permission Validation

```typescript
function canTransferCrossTeam(
  sourceTeam: Team,
  destinationTeam: Team,
  sourceInventory: FacilitySpaceInventory,
  destinationInventory: FacilitySpaceInventory
): boolean {
  // Both facilities must be in same activity
  if (sourceInventory.activityId !== destinationInventory.activityId) {
    return false;
  }
  
  // Source team must own source facility
  if (sourceInventory.teamId !== sourceTeam.id) {
    return false;
  }
  
  // Destination team must own destination facility
  if (destinationInventory.teamId !== destinationTeam.id) {
    return false;
  }
  
  // Both teams must be active in the activity
  return isTeamActiveInActivity(sourceTeam) && 
         isTeamActiveInActivity(destinationTeam);
}
```

### Cross-Team Cost Allocation

- **Sender Pays**: The team initiating the transfer pays all transportation costs
- **No Revenue Sharing**: Destination team does not receive any portion of the fee
- **System Collection**: All fees go to the system as a gold sink

## Admin Configuration Rules

### Configurable Parameters

Administrators can configure the following per map template:

```typescript
interface AdminConfigurableParams {
  // Tier A
  tierABaseCost: Decimal;       // Default: 5 gold
  tierAEmission: Decimal;        // Default: 1
  tierAMaxDistance: number;      // Default: 3
  
  // Tier B
  tierBBaseCost: Decimal;        // Default: 30 gold
  tierBEmission: Decimal;        // Default: 5
  tierBMinDistance: number;      // Default: 1
  tierBMaxDistance: number;      // Default: 6
  
  // Tier C
  tierCBaseCost: Decimal;        // Default: 200 gold
  tierCEmission: Decimal;        // Default: 25
  tierCMinDistance: number;      // Default: 1
  tierCMaxDistance: number;      // Default: 9
  
  // Tier D
  tierDBaseCost: Decimal;        // Default: 1000 gold
  tierDEmission: Decimal;        // Default: 100
  tierDMinDistance: number;      // Default: 1
  
  // Global settings
  enableCrossTeamTransfers: boolean;  // Default: true
  maxTransferQuantity: Decimal;       // Default: unlimited
  transferCooldown: number;            // Default: 0 (no cooldown)
}
```

### Configuration Update Rules

- **Immediate Effect**: Configuration changes apply to new transfers immediately
- **No Retroactive Changes**: Completed transfers maintain their original costs
- **Template Scoped**: Each map template has independent configuration
- **Activity Inheritance**: Activities inherit configuration from their map template

## Performance Optimization Rules

### Batch Transfer Support

```typescript
interface BatchTransfer {
  transfers: TransferRequest[];
  atomicExecution: boolean; // All succeed or all fail
}

function executeBatchTransfer(batch: BatchTransfer): Promise<BatchResult> {
  if (batch.atomicExecution) {
    // Execute all transfers in single transaction
    return executeAtomicBatch(batch.transfers);
  } else {
    // Execute transfers independently
    return executeIndependentBatch(batch.transfers);
  }
}
```

### Caching Strategy

- **Distance Cache**: Cache calculated distances between facilities
- **Tier Availability Cache**: Cache available tiers for common routes
- **Configuration Cache**: Cache transportation config per template
- **Invalidation**: Clear caches on facility moves or config updates

## Audit and Compliance Rules

### Transfer Logging

Every transfer creates an audit record:

```typescript
interface TransportationAudit {
  orderId: string;
  timestamp: DateTime;
  sourceTeamId: string;
  destinationTeamId: string;
  itemType: string;
  itemId: number;
  quantity: Decimal;
  tier: TransportationTier;
  distance: number;
  goldCost: Decimal;
  carbonEmission: Decimal;
  initiatedBy: string; // User ID
}
```
## Error Handling Rules

### Common Error Scenarios

| Error Code | Description | User Message |
|------------|-------------|--------------|
| INSUFFICIENT_INVENTORY | Source lacks requested items | "Not enough items in source facility" |
| INSUFFICIENT_SPACE | Destination lacks space | "Destination facility has insufficient space" |
| INSUFFICIENT_FUNDS | Team lacks gold for fee | "Insufficient funds for transportation" |
| TIER_NOT_AVAILABLE | Selected tier unavailable for distance | "Selected tier not available for this distance" |
| FACILITY_INACTIVE | Source or destination inactive | "Cannot transfer to/from inactive facility" |
| DIFFERENT_ACTIVITY | Facilities in different activities | "Facilities must be in same activity" |
| QUANTITY_EXCEEDED | Exceeds max transfer quantity | "Transfer quantity exceeds maximum allowed" |

### Recovery Mechanisms

- **Transaction Rollback**: Automatic rollback on any failure
- **Partial Success Prevention**: No partial transfers allowed
- **Error Notification**: Clear error messages to users
- **Retry Support**: Allow immediate retry after fixing issues