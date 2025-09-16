# Raw Material Production Data Model (Student)

## Overview
This document defines the data models for the raw material production system for Students. Production is **instant** - materials are produced immediately when resources are paid.

## Core Models

### 1. RawMaterialProduction
Records completed raw material production (history/audit).

```prisma
// Location: prisma/models/raw-material-production.prisma

enum ProductionStatus {
  SUCCESS           // Production completed successfully
  FAILED            // Production failed (insufficient resources/funds/space)
}

model RawMaterialProduction {
  id                    String                  @id @default(cuid())
  
  // Facility and Material
  facilityInstanceId    String
  facilityInstance      TileFacilityInstance    @relation(fields: [facilityInstanceId], references: [id])
  
  rawMaterialId         Int
  rawMaterial           RawMaterial             @relation(fields: [rawMaterialId], references: [id])
  
  // Production Details
  quantity              Decimal                 @db.Decimal(12, 3) // Units produced
  productionNumber      String                  @unique // Unique production identifier
  
  // Resource Consumption (from RawMaterial requirements)
  waterConsumed         Decimal                 @db.Decimal(12, 3) // Water units consumed
  powerConsumed         Decimal                 @db.Decimal(12, 3) // Power units consumed
  
  // Cost Record
  waterCost             Decimal                 @db.Decimal(12, 2) // Cost paid for water
  powerCost             Decimal                 @db.Decimal(12, 2) // Cost paid for power
  materialBaseCost      Decimal                 @db.Decimal(12, 2) // Base material cost
  totalCost             Decimal                 @db.Decimal(12, 2) // Total production cost
  
  // Space Used
  spaceUsed             Decimal                 @db.Decimal(12, 3) // Carbon units stored
  
  // Status
  status                ProductionStatus        
  failureReason         String?                 // Reason if failed
  
  // Timestamp (single timestamp - production is instant)
  producedAt            DateTime                @default(now())
  
  // Team and Activity Context
  teamId                String
  team                  Team                    @relation(fields: [teamId], references: [id])
  
  activityId            String
  activity              Activity                @relation(fields: [activityId], references: [id])
  
  // Student who initiated
  initiatedBy           String
  initiatedByStudent    User                    @relation(fields: [initiatedBy], references: [id])
  
  // Resource Transaction References
  transactionIds        Json?                   // Array of ResourceTransaction IDs
  
  // Metadata
  metadata              Json?                   // Additional production data
  
  // System fields
  createdAt             DateTime                @default(now())
  updatedAt             DateTime                @updatedAt
  
  @@index([facilityInstanceId, status])
  @@index([teamId, activityId])
  @@index([producedAt])
  @@map("raw_material_productions")
}
```

### 2. Integration with Resource Consumption Service

Raw material production uses the internal Resource Consumption Service for water/power payments.

```typescript
// Production is INSTANT - no waiting/processing states
interface InstantProduction {
  async produceRawMaterial(request: ProductionRequest): Promise<ProductionResult> {
    // 1. Validate prerequisites
    validateFacility(request.facilityId);
    validateMaterial(request.rawMaterialId);
    validateSpace(request.facilityId, request.quantity);
    
    // 2. Calculate resource needs
    const waterNeeded = material.waterRequired * quantity;
    const powerNeeded = material.powerRequired * quantity;
    
    // 3. Consume resources (internal service)
    const resourceResult = await resourceService.consume({
      facilityId: request.facilityId,
      requirements: [
        { type: "WATER", quantity: waterNeeded },
        { type: "POWER", quantity: powerNeeded }
      ],
      purpose: "RAW_MATERIAL_PRODUCTION",
      referenceType: "PRODUCTION",
      referenceId: production.id
    });
    
    if (!resourceResult.success) {
      // Record failed production
      return { success: false, error: resourceResult.error };
    }
    
    // 4. Add to inventory IMMEDIATELY (combines with existing if same type)
    await addToInventory(request.facilityId, material, quantity);
    
    // 5. Record successful production
    const production = await recordProduction({
      ...request,
      status: 'SUCCESS',
      transactionIds: resourceResult.transactions
    });
    
    return { 
      success: true, 
      production,
      message: "Raw materials produced successfully"
    };
  }
}
```


## Key Changes for Instant Production

### Removed Fields
- ❌ `PENDING`, `PROCESSING`, `CANCELLED` status - production is instant
- ❌ `startedAt`, `estimatedCompletion` - no timing needed
- ❌ `timePerLevel`, `minProductionTime` - instant production
- ❌ Production timing configuration

### Simplified Flow
1. Request production
2. Pay for resources
3. Materials produced instantly
4. Added to inventory
5. Record created for history

## Relationships with Existing Models

### TileFacilityInstance
```prisma
model TileFacilityInstance {
  // ... existing fields ...
  productions           RawMaterialProduction[]
}
```

### Team
```prisma
model Team {
  // ... existing fields ...
  productions           RawMaterialProduction[]
}
```

### Activity
```prisma
model Activity {
  // ... existing fields ...
  productions           RawMaterialProduction[]
}
```

### RawMaterial
```prisma
model RawMaterial {
  // ... existing fields ...
  productions           RawMaterialProduction[]
}
```

### User
```prisma
model User {
  // ... existing fields ...
  initiatedProductions  RawMaterialProduction[]
}
```

## Database Indexes

Optimized for history queries:
1. **By Facility**: Find all production for a facility
2. **By Team**: Track team production history
3. **By Date**: Production timeline analysis
4. **By Status**: Success/failure rates

## Data Integrity

### Validation Rules
1. **Instant Completion**: No intermediate states
2. **Space Check**: Must have space before production
3. **Connection Check**: Must have water AND power connections
4. **Payment Check**: Must have funds for resources

## Inventory Combination Logic

### When Producing Same Material Type
The system now intelligently combines materials of the same type:

1. **Check Existing Inventory**: Before creating a new inventory item, check if the same raw material already exists
2. **Combine Quantities**: If found, add the new quantity to existing quantity
3. **Weighted Average Cost**: Calculate new unit cost as weighted average of old and new
4. **Incremental Space**: Only consume the additional space needed, not duplicate the full amount
5. **Production History**: Maintain last 10 production records in metadata for tracking

```typescript
// Example: Combining materials
if (existingItem) {
  const newQuantity = existingItem.quantity + request.quantity;
  const newTotalValue = existingItem.totalValue + newProduction.totalCost;
  const newUnitCost = newTotalValue / newQuantity;
  const newTotalSpace = material.carbonEmission * newQuantity;
  const spaceIncrement = newTotalSpace - existingItem.totalSpaceOccupied;
  
  // Update existing item instead of creating new
  await updateInventoryItem({
    quantity: newQuantity,
    unitCost: newUnitCost,
    totalValue: newTotalValue,
    totalSpaceOccupied: newTotalSpace,
    metadata: {
      ...existingMetadata,
      lastProductionNumber: productionNumber,
      productionHistory: [...history, newProduction].slice(-10)
    }
  });
}
```

## Benefits of Instant Production

1. **Simpler**: No state management or timing logic
2. **Cleaner**: Single transaction for entire production
3. **Faster**: Immediate feedback to user
4. **Reliable**: No pending/stuck productions
5. **Intuitive**: Pay resources → Get materials
6. **Space Efficient**: Same materials combine in inventory
7. **Cost Tracking**: Weighted average maintains accurate unit costs

This simplified model reflects that raw material production is instant once resources are paid, with intelligent inventory management.