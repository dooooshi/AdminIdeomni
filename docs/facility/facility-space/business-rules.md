# Facility Space Management Business Rules

## Overview

This document outlines the business rules for the Facility Space Management extension that integrates with the existing facility infrastructure. The space management system leverages existing TileFacilityInstance, RawMaterial, and ProductFormula models to provide space tracking capabilities without duplicating functionality.

## Core Business Rules

### 1. Space Unit Definition

#### Rule 1.1: Carbon Emission as the ONLY Space Unit
- **Definition**: All space measurements ALWAYS use carbon emission values as the unit
- **Rationale**: Provides environmental awareness and consistent measurement across different material types
- **No Alternatives**: Space is NEVER measured in simple capacity units - always carbon

```typescript
interface SpaceCalculation {
  // Raw Material Space
  rawMaterialSpace = quantity × material.carbonEmission
  
  // Product Space  
  productSpace = quantity × productFormula.productFormulaCarbonEmission
}
```

#### Rule 1.2: Decimal Precision
- **Requirement**: All space calculations maintain 3 decimal places minimum
- **Rounding**: Use banker's rounding (round to nearest even) for consistency
- **Display**: Show 2 decimal places in UI, maintain full precision in database

### 2. Facility Space Configuration

#### Rule 2.0: Space Allocation by Facility Category
- **RAW_MATERIAL_PRODUCTION** (MINE, QUARRY, FOREST, FARM, RANCH, FISHERY): Has storage space
- **FUNCTIONAL** (FACTORY, MALL, WAREHOUSE): Has storage space
- **INFRASTRUCTURE** (WATER_PLANT, POWER_PLANT, BASE_STATION, FIRE_STATION): NO storage space (0)
- **OTHER** (SCHOOL, HOSPITAL, PARK, CINEMA): NO storage space (0)

```typescript
interface FacilityCategorySpaceRules {
  hasStorageSpace(category: FacilityCategory): boolean {
    return category === 'RAW_MATERIAL_PRODUCTION' || category === 'FUNCTIONAL';
  }
  
  getInitialSpace(facilityType: FacilityType, category: FacilityCategory): number {
    if (category === 'INFRASTRUCTURE' || category === 'OTHER') {
      return 0; // No storage space for infrastructure and population facilities
    }
    // Return configured space for material and functional facilities
    return spaceConfig[facilityType].initialSpace;
  }
}
```

#### Rule 2.1: FacilitySpaceConfig Table Structure
- **Principle**: Space configuration is stored in dedicated `FacilitySpaceConfig` table
- **Storage**: Separate records for each template + facilityType combination
- **Pattern**: Space is per template + facilityType (NOT landType)
- **Rationale**: A WAREHOUSE has the same space whether on COASTAL or PLAIN land
- **Category Rule**: Only RAW_MATERIAL_PRODUCTION and FUNCTIONAL facilities have space
- **Enforcement**: `isStorageFacility` field enforces category rules

```typescript
// Space configuration in FacilitySpaceConfig table
interface SpaceConfigurationRules {
  // Pattern: template + facilityType only (unique constraint)
  templateId: number,
  facilityType: FacilityType,
  
  // Space configuration fields (ALWAYS in carbon units)
  initialSpace: Decimal,        // Base space in carbon units
  spacePerLevel: Decimal,       // Additional space per level in carbon units
  maxSpace: Decimal,            // Maximum possible space in carbon units
  isStorageFacility: boolean    // true for RAW_MATERIAL_PRODUCTION and FUNCTIONAL only
}
```

#### Rule 2.2: Level-Based Space Scaling
- **Formula**: `totalSpace = initialSpace + (spacePerLevel × (facilityInstance.level - 1))`
- **Integration**: Uses the existing `level` field from TileFacilityInstance
- **Cap**: Total space cannot exceed `maxSpace` defined in configuration
- **Upgrade**: Space automatically increases when TileFacilityInstance.level is upgraded

#### Rule 2.3: Shared Storage Space
- **Principle**: Raw materials and products share the same storage space pool
- **No Segregation**: No separate allocations for raw materials vs products
- **Hard Limit**: Cannot exceed maximum facility space
- **Flexibility**: Any mix of raw materials and products can fill the space

```typescript
interface SharedSpaceRules {
  sharedPool: true,  // Raw materials and products share same space
  trackingOnly: {
    // Track usage by type for analytics only, not enforcement
    rawMaterialSpace: Decimal,  // Current space used by raw materials
    productSpace: Decimal        // Current space used by products
  }
}
```

### 3. Inventory Management Rules

#### Rule 3.1: Space Occupancy Calculation

```typescript
class SpaceOccupancyRules {
  // Uses existing RawMaterial.carbonEmission field
  calculateRawMaterialSpace(quantity: Decimal, material: RawMaterial): Decimal {
    return quantity * material.carbonEmission;
  }
  
  // Uses existing ProductFormula.productFormulaCarbonEmission field
  calculateProductSpace(quantity: Decimal, formula: ProductFormula): Decimal {
    return quantity * formula.productFormulaCarbonEmission;
  }
  
  // Leverages existing carbon emission values from base models
  calculateItemSpace(item: FacilityInventoryItem): Decimal {
    if (item.itemType === 'RAW_MATERIAL' && item.rawMaterial) {
      return item.quantity * item.rawMaterial.carbonEmission;
    } else if (item.itemType === 'PRODUCT' && item.productFormula) {
      return item.quantity * item.productFormula.productFormulaCarbonEmission;
    }
    return new Decimal(0);
  }
}
```

#### Rule 3.2: Inventory Addition Validation

```typescript
interface InventoryAdditionRules {
  // Validates against existing TileFacilityInstance constraints
  canAddInventory(
    inventory: FacilitySpaceInventory, 
    item: FacilityInventoryItem
  ): ValidationResult {
    // Ensures consistency with parent TileFacilityInstance
    const facilityInstance = inventory.facilityInstance;
    
    const checks = [
      this.checkFacilityActive(facilityInstance),
      this.checkSpaceAvailable(inventory, item),
      this.checkTeamOwnership(inventory, facilityInstance.teamId),
      this.checkActivityContext(inventory, facilityInstance.activityId)
    ];
    
    return ValidationResult.combine(checks);
  }
  
  // Uses existing facility status from TileFacilityInstance
  checkFacilityActive(facility: TileFacilityInstance): boolean {
    return facility.status === 'ACTIVE';
  }
  
  // Space check using shared pool
  checkSpaceAvailable(inventory: FacilitySpaceInventory, item: FacilityInventoryItem): boolean {
    const requiredSpace = this.calculateItemSpace(item);
    return requiredSpace <= inventory.availableSpace;
  }
}
```

#### Rule 3.3: Inventory Removal Constraints

```typescript
interface InventoryRemovalRules {
  // Can remove items
  canRemoveItem(item: FacilityInventoryItem): boolean {
    return true; // All items can be removed
  }
  
  // Partial removal allowed
  canRemovePartial(item: FacilityInventoryItem, quantity: Decimal): boolean {
    return quantity <= item.quantity && quantity > 0;
  }
  
}
```

### 4. Simple Validation Rules

#### Rule 4.1: Basic Validation

```typescript
interface ValidationRules {
  // Space validation
  space: {
    mustBePositive: true,
    cannotExceedMax: true,
    trackUsage: true
  },
  
  // Quantity validation
  quantity: {
    mustBePositive: true,
    supportDecimals: true
  }
}
```

