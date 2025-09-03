# Product Formula Business Rules

## Overview
This document defines the comprehensive business rules, constraints, and logic for the Product Formula module. These rules ensure realistic production simulation and business logic enforcement.

## Core Business Concepts

### Formula Definition
A Product Formula represents a recipe combining:
- **Formula Number**: System-generated unique identifier within each activity (auto-incremented)
- **Raw Materials**: 1-99 different material types from the 172 available materials
- **Craft Categories**: Specific technology levels for processing
- **Cost Structure**: Material costs and processing requirements

## Basic Material Rules

### Material Requirements
- **Material Types**: 1-99 different material types required per formula
- **Uniqueness**: No duplicate materials allowed in a single formula
- **Material Origin**: Each raw material belongs to one of 7 origin facility types (RANCH, FARM, FOREST, FISHERY, MINE, QUARRY, SHOPS)
- **Quantity Limits**: Each material quantity must be between 0.001-999.999 units (supports decimal precision)

### Raw Material Origin Constraints
```typescript
interface RawMaterialOriginRules {
  // Each raw material belongs to exactly one origin facility type
  originConstraint: {
    oneOriginPerMaterial: true,
    examples: {
      "Copper": "MINE",            // Copper comes from MINE facility
      "Wheat": "FARM",             // Wheat comes from FARM facility  
      "Cotton": "FARM",            // Cotton comes from FARM facility
      "Eggs": "RANCH",             // Eggs come from RANCH facility
      "Seaweed": "FISHERY",        // Seaweed comes from FISHERY facility
      "Chinese Fir": "FOREST",     // Chinese Fir comes from FOREST facility
      "Diamond": "QUARRY",         // Diamond comes from QUARRY facility
      "Gold": "SHOPS"              // Gold comes from SHOPS facility
    }
  },
  
  // Material origin is fixed and cannot be changed
  originImmutability: {
    rule: "Each raw material has a fixed origin facility type based on the 172-material system",
    rationale: "Ensures consistency with the facility system and realistic production chains",
    validOrigins: ["RANCH", "FARM", "FOREST", "FISHERY", "MINE", "QUARRY", "SHOPS"]
  }
}
```

## Production Method Rules

### 1. Craft Category Selection
```typescript
interface CraftCategoryRules {
  // Available craft categories (7 categories × 4 technology levels = 28 total)
  categories: [
    'MECHANICAL_MANUFACTURING',    // 机械制造 - Industrial machinery production
    'MATERIALS_PROCESSING',        // 材料加工 - Raw material transformation
    'BIOCHEMICAL',                 // 生物化学 - Chemical and biological processes
    'ELECTRONIC_EQUIPMENT',        // 电子器械 - Electronics manufacturing
    'ENERGY_UTILIZATION',          // 能源利用 - Energy conversion processes
    'CUTTING_TEXTILE',             // 裁剪纺织 - Fabric and garment processing
    'FOOD_PROCESSING'              // 食品加工 - Food production and packaging
  ],
  
  // Each category has 4 technology levels
  technologyLevels: ['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4'],
  
  // Craft category restrictions per formula
  restrictions: {
    uniqueCategoryType: true,  // Only one craft category per categoryType per formula
    minCategories: 1           // Minimum 1 craft category required
  },
  
  // Technology level impact
  levelImpact: {
    LEVEL_1: { costMultiplier: 1.0, timeMultiplier: 1.5, qualityScore: 60 },
    LEVEL_2: { costMultiplier: 1.2, timeMultiplier: 1.2, qualityScore: 75 },
    LEVEL_3: { costMultiplier: 1.5, timeMultiplier: 1.0, qualityScore: 85 },
    LEVEL_4: { costMultiplier: 2.0, timeMultiplier: 0.8, qualityScore: 95 }
  }
}
```

### 2. Yield Calculation
```typescript
function calculateActualOutput(
  inputQuantity: number,
  yieldPercentage: number,
  qualityFactors: QualityFactors
): number {
  // Base yield from craft category
  const baseYield = inputQuantity * (yieldPercentage / 100);
  
  // Apply quality modifiers
  const qualityMultiplier = qualityFactors.calculate();
  
  // Final output (rounded down)
  return Math.floor(baseYield * qualityMultiplier);
}

// Quality factors that affect yield
interface QualityFactors {
  materialQuality: number;     // 0.9-1.1 based on material grade
  workerSkill: number;         // 0.8-1.2 based on team experience
  facilityCondition: number;   // 0.85-1.15 based on maintenance
  rushProduction: number;      // 0.7-1.0 if rushing, 1.0 normal
}
```

## Manufacturing Cost Calculation Rules (Updated)

### 1. Manufacturing Cost System Overview

The manufacturing cost system implements the exact formulas provided in the requirements, divided into two main components:

#### Setup Costs (Fixed per Production Cycle)
Setup costs are fixed amounts regardless of production quantity, aggregated from all selected craft categories:

- **Setup Water** = Sum of all craft categories' `fixedWaterCost`
- **Setup Power** = Sum of all craft categories' `fixedPowerCost` 
- **Setup Gold** = Sum of all craft categories' `fixedGoldCost`

#### Variable Costs (Percentage-based on Raw Material Total)
Variable costs are calculated as percentages of the total raw material cost (A):

- **Variable Water%** = Sum of all craft categories' `variableWaterPercent`
- **Variable Power%** = Sum of all craft categories' `variablePowerPercent`
- **Variable Gold%** = Sum of all craft categories' `variableGoldPercent`

### 2. Manufacturing Cost Formula Implementation

```typescript
// Step 1: Calculate total raw material cost (A)
function calculateTotalMaterialCost(materials: FormulaMaterial[]): number {
  return materials.reduce((sum, mat) => {
    return sum + (mat.quantity * mat.rawMaterial.totalCost);
  }, 0);
}

// Step 2: Aggregate setup costs from all craft categories
function calculateSetupCosts(craftCategories: CraftCategory[]): SetupCosts {
  return craftCategories.reduce((total, cc) => ({
    water: total.water + cc.fixedWaterCost,
    power: total.power + cc.fixedPowerCost,
    gold: total.gold + cc.fixedGoldCost
  }), { water: 0, power: 0, gold: 0 });
}

// Step 3: Aggregate variable percentages from all craft categories
function calculateVariablePercentages(craftCategories: CraftCategory[]): VariablePercentages {
  return craftCategories.reduce((total, cc) => ({
    waterPercent: total.waterPercent + cc.variableWaterPercent,
    powerPercent: total.powerPercent + cc.variablePowerPercent,
    goldPercent: total.goldPercent + cc.variableGoldPercent
  }), { waterPercent: 0, powerPercent: 0, goldPercent: 0 });
}

// Step 3a: Calculate total percentage for environmental impact
function calculateTotalPercent(variablePercents: VariablePercentages): number {
  return variablePercents.waterPercent + variablePercents.powerPercent + variablePercents.goldPercent;
}

// Step 3b: Calculate product formula carbon emission
function calculateProductFormulaCarbonEmission(materials: FormulaMaterial[], totalPercent: number): number {
  const baseCarbonEmission = materials.reduce((sum, material) => {
    return sum + (material.quantity * material.rawMaterial.carbonEmission);
  }, 0);
  
  // Apply the formula: baseCarbonEmission * (1 + totalPercent / 100)
  return baseCarbonEmission * (1 + totalPercent / 100);
}

// Step 4: Calculate final production costs
function calculateFinalProductionCosts(
  setupCosts: SetupCosts,
  variablePercents: VariablePercentages,
  materialCostA: number
): FinalProductionCosts {
  // Calculate variable costs
  const variableWaterCost = materialCostA * (variablePercents.waterPercent / 100);
  const variablePowerCost = materialCostA * (variablePercents.powerPercent / 100);
  const variableGoldCost = materialCostA * (variablePercents.goldPercent / 100);
  
  // Apply the exact formula from requirements
  return {
    waterCost: Math.ceil(setupCosts.water + variableWaterCost), // Rounded up for integers
    powerCost: Math.ceil(setupCosts.power + variablePowerCost), // Rounded up for integers
    goldCost: setupCosts.gold + variableGoldCost // Can be decimal
  };
}
```

### 3. Example Calculation (Electronic Equipment IV + Energy Utilization I)

Using the craft category coefficients:
- **Electronic Equipment IV**: Water(42), Power(240), Gold(84), Water%(2), Power%(31.2), Gold%(6.8)
- **Energy Utilization I**: Water(20), Power(60), Gold(30), Water%(2), Power%(6), Gold%(2)

#### Setup Costs (Fixed):
- Water: 42 + 20 = 62
- Power: 240 + 60 = 300
- Gold: 84 + 30 = 114

#### Variable Percentages:
- Water%: 2 + 2 = 4%
- Power%: 31.2 + 6 = 37.2%
- Gold%: 6.8 + 2 = 8.8%
- Total%: 4 + 37.2 + 8.8 = 50%

#### Final Cost Formula (assuming A = 1000):
- Water Cost = 62 + (1000 × 4%) = 62 + 40 = 102 (rounded up)
- Power Cost = 300 + (1000 × 37.2%) = 300 + 372 = 672 (rounded up)
- Gold Cost = 114 + (1000 × 8.8%) = 114 + 88 = 202





### 5. Automatic Formula Cost Calculation

The system automatically calculates all formula costs when formulas are created or updated:

```typescript
interface AutomaticCostCalculation {
  // Automatic calculation when formula is created/updated
  calculateAndStoreAllCosts(formula: ProductFormula): ProductFormula {
    const materialCostA = calculateTotalMaterialCost(formula.materials);
    const setupCosts = calculateSetupCosts(formula.craftCategories);
    const variablePercents = calculateVariablePercentages(formula.craftCategories);
    const totalPercent = calculateTotalPercent(variablePercents);
    const carbonEmission = calculateProductFormulaCarbonEmission(formula.materials, totalPercent);
    
    // Store all calculated values in the formula
    formula.totalMaterialCost = materialCostA;
    formula.totalSetupWaterCost = setupCosts.water;
    formula.totalSetupPowerCost = setupCosts.power;
    formula.totalSetupGoldCost = setupCosts.gold;
    formula.totalWaterPercent = variablePercents.waterPercent;
    formula.totalPowerPercent = variablePercents.powerPercent;
    formula.totalGoldPercent = variablePercents.goldPercent;
    formula.totalPercent = totalPercent;
    formula.productFormulaCarbonEmission = carbonEmission;
    
    return formula;
  },
  
  // Real-time cost calculation for formula analysis
  calculateFormulaCost(formula: ProductFormula, quantity: number): FormulaCosts {
    return {
      quantity,
      finalWaterCost: Math.ceil(formula.totalSetupWaterCost + (formula.totalMaterialCost * formula.totalWaterPercent / 100)),
      finalPowerCost: Math.ceil(formula.totalSetupPowerCost + (formula.totalMaterialCost * formula.totalPowerPercent / 100)),
      finalGoldCost: formula.totalSetupGoldCost + (formula.totalMaterialCost * formula.totalGoldPercent / 100),
    };
  }
}
```

### 6. Automatic Cost Calculation Rules

#### Formula Number Generation
- **Auto-Generation**: Formula numbers are automatically generated by the system
- **Uniqueness**: Each formula number is unique within its activity
- **Sequential**: Numbers are assigned sequentially (1, 2, 3, ...) per activity
- **No Manual Input**: Users cannot specify formula numbers in creation requests

#### Formula Cost Calculation Triggers
- **Formula Creation**: All costs are automatically calculated and stored when a new formula is created
- **Material Price Updates**: Costs are automatically recalculated when raw material prices change
- **Real-time Calculation**: Formula costs are calculated instantly for any quantity
- **Immediate Access**: All cost breakdowns are available instantly for analysis

#### Cost Display Rules
- Water and power costs are always rounded up when displayed as integers
- Gold costs can be displayed as decimals for precision
- All cost breakdowns are available immediately

## Validation Rules

### 1. Enhanced Formula Creation Validation
```typescript
class FormulaValidator {
  validateFormula(formula: CreateProductFormulaDto): ValidationResult {
    const errors: string[] = [];
    
    // Note: formulaNumber is auto-generated by the system, not provided in request
    
    // Check material count
    if (formula.materials.length < 1 || formula.materials.length > 99) {
      errors.push('Formula must have 1-99 material types');
    }
    
    // Check for duplicate materials
    const materialIds = formula.materials.map(m => m.rawMaterialId);
    if (new Set(materialIds).size !== materialIds.length) {
      errors.push('Formula cannot have duplicate materials');
    }
    
    // Validate raw material origin consistency  
    if (!this.validateMaterialOriginConsistency(formula.materials)) {
      errors.push('All raw materials must have valid origin facility types');
    }
    
    // Validate quantities
    formula.materials.forEach(mat => {
      if (mat.quantity < 0.001 || mat.quantity > 999.999) {
        errors.push(`Material quantity must be 0.001-999.999`);
      }
    });
    
    // Check craft category compatibility
    if (!this.isCraftCategoryValid(formula.productDescription, formula.craftCategories)) {
      errors.push('Craft category incompatible with product type');
    }
    
    // Check for duplicate craft category types
    if (!this.validateUniqueCraftCategoryTypes(formula.craftCategories)) {
      errors.push('Cannot have multiple craft categories of the same type (e.g., MECHANICAL_MANUFACTURING_LEVEL_1 and MECHANICAL_MANUFACTURING_LEVEL_2)');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  // Validate that each raw material has a valid origin facility type
  private validateMaterialOriginConsistency(materials: MaterialRequirementDto[]): boolean {
    const validOrigins = ['RANCH', 'FARM', 'FOREST', 'FISHERY', 'MINE', 'QUARRY', 'SHOPS'];
    
    for (const material of materials) {
      const rawMaterial = this.rawMaterialRepository.findById(material.rawMaterialId);
      if (!rawMaterial) continue;
      
      // Check that the raw material has a valid origin facility type
      if (!rawMaterial.origin || !validOrigins.includes(rawMaterial.origin)) {
        return false; // Material must have a valid origin
      }
    }
    
    return true; // All materials have valid origins
  }
  
  // Validate that craft categories don't have duplicate categoryTypes
  private validateUniqueCraftCategoryTypes(craftCategories: CraftCategoryDto[]): boolean {
    const categoryTypes = new Set<string>();
    
    for (const craftCategory of craftCategories) {
      // Get the craft category from database to check its categoryType
      const category = this.craftCategoryRepository.findById(craftCategory.craftCategoryId);
      if (!category) continue;
      
      if (categoryTypes.has(category.categoryType)) {
        return false; // Duplicate categoryType found
      }
      categoryTypes.add(category.categoryType);
    }
    
    return true; // All categoryTypes are unique
  }
}
```

### 2. Business Logic Validation
```typescript
interface BusinessValidation {
  // Economic viability check
  checkViability(formula: ProductFormula): ViabilityResult {
    const materialCostEstimate = formula.totalMaterialCost;
    
    return {
      viable: materialCostEstimate >= 1 && materialCostEstimate <= 10000, // Basic cost range validation
      materialCostEstimate
    };
  },
  
  // Material availability check
  checkMaterialAvailability(materials: MaterialRequirement[]): AvailabilityResult {
    const unavailable = materials.filter(mat => !mat.rawMaterial.isActive);
    return {
      available: unavailable.length === 0,
      unavailableMaterials: unavailable
    };
  },
  
}
```



