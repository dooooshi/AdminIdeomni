# Product Production Business Rules

## Overview

This document defines the comprehensive business rules for the Product Production module, implementing the advanced manufacturing cost calculation system and production workflow. Product production occurs in FACTORY facilities using predefined Product Formulas with raw materials.

## Core Business Concepts

### Production Definition
Product production transforms raw materials into finished products using:
- **Product Formula**: Recipe defining materials and craft categories required
- **Factory Facility**: Manufacturing location with storage space
- **Infrastructure Resources**: Water and power from connected providers
- **Yield Rates**: Multiple craft category yield percentages affecting output

## Production Prerequisites

### 1. Factory Requirements

```typescript
interface FactoryRequirements {
  // Must be a FACTORY type facility
  facilityType: 'FACTORY';
  
  // Must be operational
  requiredStatus: 'ACTIVE';
  
  // Must belong to requesting team
  teamOwnership: true;
  
  // Must have active infrastructure connections
  infrastructure: {
    waterConnection: Connection;  // Active WATER_PLANT connection
    powerConnection: Connection;  // Active POWER_PLANT connection
  };
}
```

### 2. Material Requirements

```typescript
interface MaterialRequirements {
  // All formula materials must be present in factory
  materialsPresent: boolean;
  
  // Quantities must meet or exceed formula requirements
  sufficientQuantities: boolean;
  
  // Materials must be in same factory facility
  sameLocation: true;
}
```

### 3. Space Requirements

```typescript
interface SpaceValidation {
  // Calculate space needed for products (carbon emission based)
  productSpaceNeeded: number; // quantity × formula.productFormulaCarbonEmission
  
  // Calculate space freed by consuming materials
  materialSpaceFreed: number; // Σ(material.quantity × material.carbonEmission)
  
  // Smart space check
  netSpaceRequired: number; // productSpaceNeeded - materialSpaceFreed
  
  // Validation
  hasSpace: boolean; // netSpaceRequired <= facility.availableSpace
}
```

## Manufacturing Cost Calculation System

### 1. Cost Structure Overview

The production cost system consists of two main components:

#### Setup Costs (Fixed)
Fixed costs per production batch regardless of quantity:
- **Setup Water**: Sum of all craft categories' water setup costs
- **Setup Power**: Sum of all craft categories' power setup costs  
- **Setup Gold**: Sum of all craft categories' gold setup costs

#### Variable Costs (Percentage-based)
Variable costs calculated as percentage of total raw material cost:
- **Variable Water%**: Sum of all craft categories' water percentages
- **Variable Power%**: Sum of all craft categories' power percentages
- **Variable Gold%**: Sum of all craft categories' gold percentages

### 2. Production Cost Formula

```typescript
class ProductionCostCalculator {
  // Step 1: Calculate total raw material cost (A)
  calculateMaterialCostA(formula: ProductFormula, quantity: number): number {
    return formula.materials.reduce((sum, material) => {
      const materialCost = material.quantity * material.rawMaterial.totalCost;
      return sum + (materialCost * quantity);
    }, 0);
  }
  
  // Step 2: Aggregate setup costs from craft categories
  calculateSetupCosts(formula: ProductFormula): SetupCosts {
    return formula.craftCategories.reduce((total, cc) => ({
      water: total.water + cc.fixedWaterCost,
      power: total.power + cc.fixedPowerCost,
      gold: total.gold + cc.fixedGoldCost
    }), { water: 0, power: 0, gold: 0 });
  }
  
  // Step 3: Aggregate variable percentages
  calculateVariablePercentages(formula: ProductFormula): VariablePercentages {
    return formula.craftCategories.reduce((total, cc) => ({
      waterPercent: total.waterPercent + cc.variableWaterPercent,
      powerPercent: total.powerPercent + cc.variablePowerPercent,
      goldPercent: total.goldPercent + cc.variableGoldPercent
    }), { waterPercent: 0, powerPercent: 0, goldPercent: 0 });
  }
  
  // Step 4: Calculate final production costs
  calculateFinalCosts(
    setupCosts: SetupCosts,
    variablePercentages: VariablePercentages,
    materialCostA: number
  ): ProductionCosts {
    return {
      // Water and Power must be integers (rounded up)
      waterConsumption: Math.ceil(
        setupCosts.water + (materialCostA * variablePercentages.waterPercent / 100)
      ),
      powerConsumption: Math.ceil(
        setupCosts.power + (materialCostA * variablePercentages.powerPercent / 100)
      ),
      // Gold can be decimal
      goldCost: setupCosts.gold + (materialCostA * variablePercentages.goldPercent / 100),
      // Carbon emission calculation
      carbonEmission: this.calculateCarbonEmission(setupCosts, materialCostA, variablePercentages)
    };
  }
  
  // Step 5: Carbon emission calculation
  calculateCarbonEmission(
    setupCosts: SetupCosts,
    materialCostA: number,
    variablePercentages: VariablePercentages
  ): number {
    // Total setup cost
    const totalSetup = setupCosts.water + setupCosts.power + setupCosts.gold;
    
    // Total variable percentage
    const totalPercent = variablePercentages.waterPercent + 
                        variablePercentages.powerPercent + 
                        variablePercentages.goldPercent;
    
    // Formula: (totalSetup + materialCostA × totalPercent%) × 1%
    return (totalSetup + materialCostA * totalPercent / 100) * 0.01;
  }
}
```

### 3. Example Calculation

Using **Electronic Equipment IV** + **Energy Utilization I**:

```typescript
// Given craft category values
const electronicEquipmentIV = {
  fixedWaterCost: 42,
  fixedPowerCost: 240,
  fixedGoldCost: 84,
  variableWaterPercent: 2,
  variablePowerPercent: 31.2,
  variableGoldPercent: 6.8,
  yieldPercentage: 98
};

const energyUtilizationI = {
  fixedWaterCost: 20,
  fixedPowerCost: 60,
  fixedGoldCost: 30,
  variableWaterPercent: 2,
  variablePowerPercent: 6,
  variableGoldPercent: 2,
  yieldPercentage: 82
};

// Calculation with material cost A = 1000
const setupWater = 42 + 20 = 62;
const setupPower = 240 + 60 = 300;
const setupGold = 84 + 30 = 114;

const waterPercent = 2 + 2 = 4%;
const powerPercent = 31.2 + 6 = 37.2%;
const goldPercent = 6.8 + 2 = 8.8%;

// Final costs
const waterConsumption = Math.ceil(62 + 1000 * 0.04) = 102;
const powerConsumption = Math.ceil(300 + 1000 * 0.372) = 672;
const goldCost = 114 + 1000 * 0.088 = 202;

// Carbon emission
const carbonEmission = (476 + 1000 * 0.50) * 0.01 = 9.76;
```

## Yield Calculation System

### 1. Multi-Stage Yield Application

```typescript
interface YieldCalculation {
  // Apply multiple craft category yields sequentially
  calculateFinalOutput(inputQuantity: number, formula: ProductFormula): number {
    // Get all yield percentages from craft categories
    const yields = formula.craftCategories.map(cc => cc.yieldPercentage / 100);
    
    // Apply yields sequentially
    let output = inputQuantity;
    for (const yield of yields) {
      output = output * yield;
    }
    
    // Round down to nearest integer (no partial products)
    return Math.floor(output);
  }
}

// Example with 100 input units
// Electronic Equipment IV (98%) × Energy Utilization I (82%)
// Output = 100 × 0.98 × 0.82 = 80.36 → 80 products
```

### 2. Yield Impact Rules

```typescript
interface YieldRules {
  // Minimum yield to prevent total loss
  minimumCombinedYield: 0.50; // 50% minimum combined yield
  
  // Yield stacking rules
  multipleYieldsStack: true; // Multiplicative stacking
  
  // Quality factors (future enhancement)
  qualityModifiers?: {
    facilityCondition: number;  // 0.9-1.1
    teamExperience: number;     // 0.95-1.05
  };
}
```

## Resource Consumption from Infrastructure

### 1. Water Consumption

```typescript
interface WaterConsumption {
  // Calculate water units needed
  unitsRequired: number; // From production cost calculation
  
  // Get water connection details
  connection: {
    providerId: string;
    unitPrice: number;
    providerTeamId: string;
  };
  
  // Calculate water cost
  totalWaterCost: number; // unitsRequired × connection.unitPrice
  
  // Record consumption
  recordConsumption(): ResourceConsumptionRecord;
}
```

### 2. Power Consumption

```typescript
interface PowerConsumption {
  // Calculate power units needed
  unitsRequired: number; // From production cost calculation
  
  // Get power connection details
  connection: {
    providerId: string;
    unitPrice: number;
    providerTeamId: string;
  };
  
  // Calculate power cost
  totalPowerCost: number; // unitsRequired × connection.unitPrice
  
  // Record consumption
  recordConsumption(): ResourceConsumptionRecord;
}
```

### 3. Infrastructure Validation

```typescript
function validateInfrastructure(factory: TileFacilityInstance): ValidationResult {
  // Check water connection
  const waterConnection = getActiveConnection(factory, 'WATER');
  if (!waterConnection) {
    return { valid: false, reason: "No active water connection" };
  }
  
  // Check power connection
  const powerConnection = getActiveConnection(factory, 'POWER');
  if (!powerConnection) {
    return { valid: false, reason: "No active power connection" };
  }
  
  // Check provider capacity
  if (!hasCapacity(waterConnection, waterRequired)) {
    return { valid: false, reason: "Water provider has insufficient capacity" };
  }
  
  if (!hasCapacity(powerConnection, powerRequired)) {
    return { valid: false, reason: "Power provider has insufficient capacity" };
  }
  
  return { valid: true };
}
```

## Production Process Workflow

### 1. Pre-Production Phase

```typescript
class PreProductionValidation {
  async validateProduction(request: ProductionRequest): Promise<ValidationResult> {
    const validations = await Promise.all([
      this.validateFactory(request.factoryId),
      this.validateFormula(request.formulaId),
      this.validateMaterials(request.factoryId, request.formulaId, request.quantity),
      this.validateSpace(request.factoryId, request.formulaId, request.quantity),
      this.validateInfrastructure(request.factoryId),
      this.validateTeamFunds(request.teamId, calculatedCosts)
    ]);
    
    return ValidationResult.combine(validations);
  }
}
```

### 2. Cost Confirmation Phase

```typescript
interface CostConfirmation {
  // Present costs to user before production
  displayCosts: {
    materialCost: number;
    waterCost: number;
    powerCost: number;
    laborCost: number;
    totalCost: number;
    expectedOutput: number;
    carbonEmission: number;
  };
  
  // Require explicit confirmation
  userConfirmation: boolean;
  
  // Lock prices during confirmation
  priceLock: {
    duration: 60; // seconds
    lockedPrices: Map<string, number>;
  };
}
```

### 3. Production Execution Phase

```typescript
class ProductionExecution {
  async executeProduction(request: ConfirmedProductionRequest): Promise<ProductionResult> {
    const transaction = await this.startTransaction();
    
    try {
      // 1. Consume raw materials
      await this.consumeMaterials(request);
      
      // 2. Charge resource costs
      await this.chargeWater(request.waterCost);
      await this.chargePower(request.powerCost);
      await this.chargeGold(request.goldCost);
      
      // 3. Calculate actual output with yields
      const output = this.calculateYieldedOutput(request);
      
      // 4. Add products to inventory
      await this.addProducts(request.factoryId, request.formulaId, output);
      
      // 5. Update space usage
      await this.updateSpaceUsage(request.factoryId);
      
      // 6. Create history record
      await this.createHistory(request, output);
      
      await transaction.commit();
      return { success: true, producedQuantity: output };
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
```

## Space Management During Production

### 1. Smart Space Calculation

```typescript
class ProductionSpaceManager {
  calculateNetSpaceChange(
    formula: ProductFormula,
    productQuantity: number
  ): number {
    // Space needed for products
    const productSpace = productQuantity * formula.productFormulaCarbonEmission;
    
    // Space freed from consuming materials
    const materialSpaceFreed = formula.materials.reduce((sum, mat) => {
      const consumed = mat.quantity * productQuantity;
      return sum + (consumed * mat.rawMaterial.carbonEmission);
    }, 0);
    
    // Net space change (negative means space is freed)
    return productSpace - materialSpaceFreed;
  }
  
  canProduceWithSpace(
    factory: FacilitySpaceInventory,
    netSpaceChange: number
  ): boolean {
    // Production is allowed if:
    // 1. Net space change is negative (freeing space)
    // 2. Available space can accommodate positive net change
    return netSpaceChange <= 0 || netSpaceChange <= factory.availableSpace;
  }
}
```

### 2. Space Transaction Rules

```typescript
interface SpaceTransaction {
  // Before production
  preProduction: {
    totalSpace: number;
    usedSpace: number;
    availableSpace: number;
    rawMaterialSpace: number;
    productSpace: number;
  };
  
  // Space changes
  changes: {
    materialSpaceFreed: number;  // Positive value
    productSpaceAdded: number;   // Positive value
    netChange: number;           // Can be positive or negative
  };
  
  // After production
  postProduction: {
    totalSpace: number;         // Unchanged
    usedSpace: number;          // Updated
    availableSpace: number;     // Updated
    rawMaterialSpace: number;   // Decreased
    productSpace: number;       // Increased
  };
}
```

## Factory Selection Logic

### 1. Available Factory Query

```typescript
interface FactoryAvailability {
  // Get all team factories
  getTeamFactories(teamId: string): TileFacilityInstance[] {
    return facilities.filter(f => 
      f.teamId === teamId &&
      f.facilityType === 'FACTORY' &&
      f.status === 'ACTIVE'
    );
  }
  
  // Check material availability
  checkMaterialAvailability(
    factory: TileFacilityInstance,
    formula: ProductFormula,
    quantity: number
  ): MaterialCheck {
    const inventory = getInventory(factory.id);
    const missing: MaterialShortage[] = [];
    
    for (const material of formula.materials) {
      const required = material.quantity * quantity;
      const available = inventory.getMaterialQuantity(material.rawMaterialId);
      
      if (available < required) {
        missing.push({
          materialId: material.rawMaterialId,
          required,
          available,
          shortage: required - available
        });
      }
    }
    
    return {
      hasAllMaterials: missing.length === 0,
      missing
    };
  }
  
  // Check how many units can be produced with available materials
  calculateMaxProducible(
    factory: TileFacilityInstance,
    formula: ProductFormula
  ): number {
    // Maximum quantity that can be produced based on available materials
    const materialLimits = formula.materials.map(mat => {
      const available = getInventory(factory).getMaterialQuantity(mat.rawMaterialId);
      return Math.floor(available / mat.quantity);
    });
    
    return Math.min(...materialLimits);
  }
}
```

### 2. Factory Filtering

```typescript
interface FactoryFiltering {
  filterFactories(
    factories: TileFacilityInstance[],
    formula: ProductFormula,
    desiredQuantity: number
  ): FactoryDetails[] {
    return factories.map(factory => ({
      factory,
      details: {
        hasAllMaterials: this.checkMaterials(factory, formula, desiredQuantity),
        spaceAvailable: this.checkSpace(factory, formula, desiredQuantity),
        infrastructureConnected: this.checkInfrastructure(factory),
        maxProducible: this.calculateMaxProducible(factory, formula)
      }
    }))
    .filter(f => f.details.infrastructureConnected);
  }
}
```

## Production History Tracking

### Production History Structure

```typescript
interface ProductionHistory {
  id: string;
  activityId: number;
  teamId: string;
  factoryId: string;
  formulaId: number;
  
  // Production details
  requestedQuantity: number;
  producedQuantity: number;
  yieldPercentage: number;
  
  // Resource consumption
  waterConsumed: number;
  waterCost: number;
  powerConsumed: number;
  powerCost: number;
  goldCost: number;
  totalCost: number;
  
  // Environmental impact
  carbonEmission: number;
  
  // Space changes
  spaceFreed: number;
  spaceUsed: number;
  netSpaceChange: number;
  
  // Timestamps
  startedAt: Date;
  completedAt: Date;
  duration: number; // milliseconds
  
  // User tracking
  initiatedBy: string; // userId
  
  // Status
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED';
  failureReason?: string;
}
```

## Validation Rules

### 1. Production Request Validation

```typescript
class ProductionValidator {
  validateRequest(request: ProductionRequest): ValidationResult {
    const errors: string[] = [];
    
    // Quantity validation
    if (request.quantity < 1) {
      errors.push('Production quantity must be at least 1');
    }
    
    if (request.quantity > 9999) {
      errors.push('Production quantity cannot exceed 9999');
    }
    
    // Factory validation
    if (!this.isValidFactory(request.factoryId)) {
      errors.push('Invalid or inactive factory');
    }
    
    // Formula validation
    if (!this.isValidFormula(request.formulaId)) {
      errors.push('Invalid or inactive product formula');
    }
    
    // Team ownership
    if (!this.isTeamFactory(request.teamId, request.factoryId)) {
      errors.push('Factory does not belong to your team');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
```

### 2. Resource Validation

```typescript
interface ResourceValidation {
  // Material availability
  validateMaterials(
    inventory: FacilityInventory,
    formula: ProductFormula,
    quantity: number
  ): boolean {
    for (const material of formula.materials) {
      const required = material.quantity * quantity;
      const available = inventory.getMaterialQuantity(material.rawMaterialId);
      if (available < required) return false;
    }
    return true;
  }
  
  // Fund availability
  validateFunds(
    teamId: string,
    totalCost: number
  ): boolean {
    const teamBalance = getTeamBalance(teamId);
    return teamBalance >= totalCost;
  }
  
  // Infrastructure capacity
  validateInfrastructureCapacity(
    waterRequired: number,
    powerRequired: number,
    connections: InfrastructureConnections
  ): boolean {
    const waterCapacity = connections.water.availableCapacity;
    const powerCapacity = connections.power.availableCapacity;
    
    return waterRequired <= waterCapacity && powerRequired <= powerCapacity;
  }
}
```

## Error Handling

### Production Failure Scenarios

```typescript
enum ProductionFailureReason {
  // Pre-production failures
  INSUFFICIENT_MATERIALS = "Insufficient raw materials in factory",
  NO_SPACE = "Insufficient space for products",
  NO_WATER_CONNECTION = "Factory lacks water connection",
  NO_POWER_CONNECTION = "Factory lacks power connection",
  INSUFFICIENT_FUNDS = "Team has insufficient funds",
  FACTORY_INACTIVE = "Factory is not operational",
  
  // During production failures
  INFRASTRUCTURE_DISCONNECTED = "Infrastructure disconnected during production",
  TRANSACTION_FAILED = "Database transaction failed",
  
  // Post-production failures
  INVENTORY_UPDATE_FAILED = "Failed to update inventory",
  HISTORY_CREATION_FAILED = "Failed to create history record"
}
```

## Performance Optimization

### 1. Batch Processing

```typescript
interface BatchProduction {
  // Process multiple production requests efficiently
  processBatch(requests: ProductionRequest[]): BatchResult {
    // Group by factory for efficiency
    const byFactory = groupBy(requests, 'factoryId');
    
    // Process each factory's productions in sequence
    const results = [];
    for (const [factoryId, factoryRequests] of byFactory) {
      // Lock factory inventory once
      const lock = acquireLock(factoryId);
      
      // Process all requests for this factory
      for (const request of factoryRequests) {
        results.push(processProduction(request));
      }
      
      lock.release();
    }
    
    return results;
  }
}
```

## Integration Points

### 1. Facility System Integration
- Uses TileFacilityInstance for factory management
- Integrates with FacilitySpaceInventory for space tracking
- Leverages facility status and level

### 2. Infrastructure Integration
- Consumes water/power through Connection system
- Records consumption in ResourceConsumptionRecord
- Respects provider capacity limits

### 3. Inventory Integration
- Updates FacilityInventoryItem for materials and products
- Maintains transactional consistency
- Tracks space usage changes

### 4. Financial Integration
- Deducts costs from team treasury
- Records financial transactions
- Tracks production costs

## Activity Lifecycle

### During Activity
- Production available when activity is ACTIVE
- All productions are instant (no waiting)
- Resource prices from current connections apply
- History tracked for activity duration

### Activity End
- No new productions allowed
- Existing inventory preserved
- History records finalized

## Summary

The Product Production system implements a sophisticated manufacturing model with:
1. **Advanced cost calculation** using setup and variable costs
2. **Multi-stage yield application** for realistic output
3. **Smart space management** with net calculation
4. **Infrastructure resource consumption** with provider connections
5. **Comprehensive history tracking** for auditability
6. **Factory selection intelligence** for optimal production

This system ensures realistic business simulation while maintaining gameplay balance and educational value for the target audience.