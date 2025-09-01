# Raw Material Production Business Rules (Student)

## Overview
Raw material production system for Students. Production is **instant** - materials are produced immediately when resources are successfully paid. No waiting, no processing time.

## Core Production Flow

### Instant Production Lifecycle
```
REQUEST → VALIDATE → PAY → PRODUCE → STORE
         (instant - all in one transaction)
```

1. **REQUEST**: Student requests production
2. **VALIDATE**: Check all prerequisites
3. **PAY**: Process resource payments
4. **PRODUCE**: Materials created instantly
5. **STORE**: Add to facility inventory

## Production Prerequisites

### 1. Facility Requirements

```typescript
interface FacilityRequirements {
  // Facility must be a raw material production type
  validTypes: [
    'MINE',      // Can produce mine materials
    'QUARRY',    // Can produce quarry materials
    'FOREST',    // Can produce forest materials
    'FARM',      // Can produce farm materials
    'RANCH',     // Can produce ranch materials
    'FISHERY'    // Can produce fishery materials
  ];
  
  // Facility must be operational
  requiredStatus: 'ACTIVE';
  
  // Facility must match material origin
  materialOriginMatch: true; // MINE facility can only produce MINE origin materials
}
```

### 2. Infrastructure Requirements

All raw material production facilities **MUST** have active connections for:
- ✅ Water connection (from WATER_PLANT)
- ✅ Power connection (from POWER_PLANT)

```typescript
function validateInfrastructure(facility: Facility): ValidationResult {
  const waterConnection = getActiveConnection(facility, 'WATER');
  const powerConnection = getActiveConnection(facility, 'POWER');
  
  if (!waterConnection) {
    return { valid: false, reason: "No active water connection" };
  }
  
  if (!powerConnection) {
    return { valid: false, reason: "No active power connection" };
  }
  
  return { valid: true };
}
```

### 3. Space Requirements

```typescript
function validateSpace(
  facility: Facility,
  material: RawMaterial,
  quantity: number
): ValidationResult {
  const spaceNeeded = material.carbonEmission * quantity;
  const availableSpace = facility.spaceInventory.availableSpace;
  
  if (spaceNeeded > availableSpace) {
    return { 
      valid: false, 
      reason: `Insufficient space. Need ${spaceNeeded}, have ${availableSpace}` 
    };
  }
  
  return { valid: true };
}
```

## Resource Consumption Calculations

### 1. Resource Requirements

```typescript
function calculateResourceNeeds(
  material: RawMaterial,
  quantity: number
): ResourceNeeds {
  return {
    waterNeeded: material.waterRequired * quantity,
    powerNeeded: material.powerRequired * quantity
  };
}
```

### 2. Cost Calculation

```typescript
function calculateProductionCost(
  material: RawMaterial,
  quantity: number,
  waterConnection: Connection,
  powerConnection: Connection
): CostBreakdown {
  const resources = calculateResourceNeeds(material, quantity);
  
  return {
    waterCost: resources.waterNeeded * waterConnection.unitPrice,
    powerCost: resources.powerNeeded * powerConnection.unitPrice,
    materialBaseCost: material.totalCost * quantity,
    totalCost: waterCost + powerCost + materialBaseCost
  };
}
```

### 3. Space Calculation

```typescript
function calculateSpaceRequired(
  material: RawMaterial,
  quantity: number
): number {
  // Space is based on carbon emission per unit
  return material.carbonEmission * quantity;
}
```

## Validation Rules Summary

### Pre-Production Checklist

All validations happen **before** payment:

```typescript
interface ProductionValidation {
  facilityChecks: {
    isCorrectType: boolean;      // Facility type matches material origin
    isActive: boolean;            // Facility is operational
    hasWaterConnection: boolean; // Active water connection exists
    hasPowerConnection: boolean; // Active power connection exists
  };
  
  resourceChecks: {
    hasSufficientFunds: boolean;  // Team can afford resource costs
  };
  
  spaceChecks: {
    hasStorageSpace: boolean;     // Facility has space for output
  };
}
```

## Error Handling

### Instant Failure Scenarios

Production fails **instantly** if:

1. **No Infrastructure Connection**
   - Message: "Facility lacks required {WATER/POWER} connection"
   - Action: Student must establish connection first

2. **Insufficient Funds**
   - Message: "Insufficient funds. Need ${amount}, have ${balance}"
   - Action: Production cancelled, no resources consumed

3. **No Storage Space**
   - Message: "Insufficient storage space. Need {space} carbon units"
   - Action: Production cancelled, suggest clearing inventory

4. **Invalid Material Type**
   - Message: "This facility cannot produce {material} materials"
   - Action: Show valid material types for facility

## Production Metrics

### Key Performance Indicators

```typescript
interface ProductionMetrics {
  // Success metrics
  totalProductions: number;        // Total production attempts
  successRate: number;             // Success / Total
  
  // Financial metrics
  averageCostPerUnit: number;      // Total cost / units produced
  totalResourceCost: number;       // Sum of all resource costs
  
  // Resource metrics
  totalWaterConsumed: number;      // Total water used
  totalPowerConsumed: number;      // Total power used
  
  // Production metrics
  averageQuantity: number;         // Average quantity per production
  spaceUtilization: number;        // Used space / total space
}
```

## Activity Lifecycle

### During Activity
- Production is instant at any time during active gameplay
- Resource prices from connections apply immediately
- No carryover or pending productions

### Activity End
- All productions are already complete (instant)
- Only history records remain
- No cleanup needed

## Benefits of Instant Production

1. **Simple**: No state management
2. **Clear**: Pay → Produce → Done
3. **Fast**: Immediate user feedback
4. **Reliable**: No stuck productions
5. **Atomic**: All-or-nothing transaction

This instant production model eliminates complexity while maintaining full functionality.