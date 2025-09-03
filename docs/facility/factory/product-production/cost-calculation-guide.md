# Product Production Cost Calculation Guide

## Overview

This guide provides detailed explanations and examples of the production cost calculation system. The system uses a two-tier cost structure: fixed setup costs and variable percentage-based costs calculated on the total raw material value.

## Cost Calculation Formula

### Core Formula Components

```
Total Cost = Setup Costs + Variable Costs

Where:
- Setup Costs = Fixed costs from all craft categories (water + power + gold)
- Variable Costs = Material Cost A × Variable Percentages

Final Calculation:
- Water Consumption = ⌈Setup Water + (Material Cost A × Water%)⌉
- Power Consumption = ⌈Setup Power + (Material Cost A × Power%)⌉  
- Gold Cost = Setup Gold + (Material Cost A × Gold%)
- Carbon Emission = (Total Setup + Material Cost A × Total%) × 1%
```

## Detailed Calculation Steps

### Step 1: Calculate Material Cost A

Material Cost A is the total cost of all raw materials needed for production.

```typescript
Material Cost A = Σ(material.quantity × material.unitCost) × productionQuantity

Example:
Product requires:
- 2 units of Steel @ 50 gold/unit
- 3 units of Copper @ 30 gold/unit
- 1 unit of Glass @ 20 gold/unit

For producing 10 products:
Material Cost A = [(2×50) + (3×30) + (1×20)] × 10
                = [100 + 90 + 20] × 10
                = 210 × 10
                = 2100 gold
```

### Step 2: Aggregate Setup Costs

Setup costs are fixed costs that apply regardless of production quantity.

```typescript
Setup Water = Σ(craftCategory.fixedWaterCost)
Setup Power = Σ(craftCategory.fixedPowerCost)
Setup Gold = Σ(craftCategory.fixedGoldCost)

Example with two craft categories:
Electronic Equipment IV: Water(42), Power(240), Gold(84)
Energy Utilization I: Water(20), Power(60), Gold(30)

Total Setup:
- Water: 42 + 20 = 62
- Power: 240 + 60 = 300
- Gold: 84 + 30 = 114
```

### Step 3: Aggregate Variable Percentages

Variable percentages determine additional costs based on material value.

```typescript
Water% = Σ(craftCategory.variableWaterPercent)
Power% = Σ(craftCategory.variablePowerPercent)
Gold% = Σ(craftCategory.variableGoldPercent)

Example:
Electronic Equipment IV: Water(2%), Power(31.2%), Gold(6.8%)
Energy Utilization I: Water(2%), Power(6%), Gold(2%)

Total Percentages:
- Water%: 2 + 2 = 4%
- Power%: 31.2 + 6 = 37.2%
- Gold%: 6.8 + 2 = 8.8%
- Total%: 4 + 37.2 + 8.8 = 50%
```

### Step 4: Calculate Final Costs

Apply the formula to get final resource consumption and costs.

```typescript
Water Consumption = ⌈62 + (2100 × 4%)⌉ = ⌈62 + 84⌉ = 146 units
Power Consumption = ⌈300 + (2100 × 37.2%)⌉ = ⌈300 + 781.2⌉ = 1082 units
Gold Cost = 114 + (2100 × 8.8%) = 114 + 184.8 = 298.8 gold

Carbon Emission = (476 + 2100 × 50%) × 1% = (476 + 1050) × 1% = 15.26
```

## Complete Examples

### Example 1: Simple Product with One Craft Category

#### Product Formula: Basic Circuit Board
- **Raw Materials:**
  - Copper: 5 units @ 30 gold/unit
  - Silicon: 2 units @ 40 gold/unit
- **Craft Category:**
  - Materials Processing Level 2
    - Fixed: Water(25), Power(80), Gold(45)
    - Variable: Water(3%), Power(12%), Gold(5%)
- **Production Quantity:** 20 units

#### Calculation:

```
Step 1: Material Cost A
A = [(5×30) + (2×40)] × 20
  = [150 + 80] × 20
  = 230 × 20
  = 4600 gold

Step 2: Setup Costs
Water Setup = 25
Power Setup = 80
Gold Setup = 45

Step 3: Variable Percentages
Water% = 3%
Power% = 12%
Gold% = 5%
Total% = 20%

Step 4: Final Costs
Water = ⌈25 + (4600 × 3%)⌉ = ⌈25 + 138⌉ = 163 units
Power = ⌈80 + (4600 × 12%)⌉ = ⌈80 + 552⌉ = 632 units
Gold = 45 + (4600 × 5%) = 45 + 230 = 275 gold

Carbon = (25 + 80 + 45 + 4600 × 20%) × 1%
       = (150 + 920) × 1%
       = 10.7

With Infrastructure Pricing:
If Water = 0.5 gold/unit, Power = 0.8 gold/unit
Water Cost = 163 × 0.5 = 81.5 gold
Power Cost = 632 × 0.8 = 505.6 gold
Total Cost = 81.5 + 505.6 + 275 = 862.1 gold
```

### Example 2: Complex Product with Multiple Craft Categories

#### Product Formula: Advanced Smartphone
- **Raw Materials:**
  - Rare Earth Metals: 3 units @ 200 gold/unit
  - Gold: 0.5 units @ 1000 gold/unit
  - Silicon: 10 units @ 40 gold/unit
  - Plastic: 20 units @ 5 gold/unit
- **Craft Categories:**
  1. Electronic Equipment Level 4
     - Fixed: Water(42), Power(240), Gold(84)
     - Variable: Water(2%), Power(31.2%), Gold(6.8%)
     - Yield: 98%
  2. Materials Processing Level 3
     - Fixed: Water(35), Power(120), Gold(60)
     - Variable: Water(4%), Power(18%), Gold(6%)
     - Yield: 95%
  3. Mechanical Manufacturing Level 2
     - Fixed: Water(28), Power(100), Gold(48)
     - Variable: Water(3%), Power(15%), Gold(5%)
     - Yield: 92%
- **Production Quantity:** 50 units

#### Calculation:

```
Step 1: Material Cost A
A = [(3×200) + (0.5×1000) + (10×40) + (20×5)] × 50
  = [600 + 500 + 400 + 100] × 50
  = 1600 × 50
  = 80,000 gold

Step 2: Setup Costs (sum all craft categories)
Water Setup = 42 + 35 + 28 = 105
Power Setup = 240 + 120 + 100 = 460
Gold Setup = 84 + 60 + 48 = 192

Step 3: Variable Percentages (sum all)
Water% = 2 + 4 + 3 = 9%
Power% = 31.2 + 18 + 15 = 64.2%
Gold% = 6.8 + 6 + 5 = 17.8%
Total% = 9 + 64.2 + 17.8 = 91%

Step 4: Final Resource Consumption
Water = ⌈105 + (80,000 × 9%)⌉ = ⌈105 + 7,200⌉ = 7,305 units
Power = ⌈460 + (80,000 × 64.2%)⌉ = ⌈460 + 51,360⌉ = 51,820 units
Gold = 192 + (80,000 × 17.8%) = 192 + 14,240 = 14,432 gold

Carbon = (105 + 460 + 192 + 80,000 × 91%) × 1%
       = (757 + 72,800) × 1%
       = 735.57

Step 5: Calculate Yield
Combined Yield = 98% × 95% × 92% = 0.98 × 0.95 × 0.92 = 0.85652
Output = 50 × 0.85652 = 42.826 → 42 units (rounded down)

Step 6: Total Costs with Infrastructure
If Water = 0.4 gold/unit, Power = 0.75 gold/unit
Water Cost = 7,305 × 0.4 = 2,922 gold
Power Cost = 51,820 × 0.75 = 38,865 gold
Total Production Cost = 2,922 + 38,865 + 14,432 = 56,219 gold
Cost per Unit Produced = 56,219 ÷ 42 = 1,338.5 gold/unit
```

### Example 3: Resource-Efficient Production

#### Product Formula: Eco-Friendly Packaging
- **Raw Materials:**
  - Recycled Paper: 100 units @ 2 gold/unit
  - Biodegradable Plastic: 50 units @ 8 gold/unit
- **Craft Category:**
  - Cutting and Textile Level 1
    - Fixed: Water(15), Power(30), Gold(25)
    - Variable: Water(1%), Power(4%), Gold(2%)
    - Yield: 82%
- **Production Quantity:** 100 units

#### Calculation:

```
Step 1: Material Cost A
A = [(100×2) + (50×8)] × 100
  = [200 + 400] × 100
  = 600 × 100
  = 60,000 gold

Step 2: Setup Costs
Water Setup = 15
Power Setup = 30
Gold Setup = 25

Step 3: Variable Percentages
Water% = 1%
Power% = 4%
Gold% = 2%
Total% = 7%

Step 4: Final Costs
Water = ⌈15 + (60,000 × 1%)⌉ = ⌈15 + 600⌉ = 615 units
Power = ⌈30 + (60,000 × 4%)⌉ = ⌈30 + 2,400⌉ = 2,430 units
Gold = 25 + (60,000 × 2%) = 25 + 1,200 = 1,225 gold

Carbon = (15 + 30 + 25 + 60,000 × 7%) × 1%
       = (70 + 4,200) × 1%
       = 42.7

Output = 100 × 82% = 82 units

With Infrastructure:
If Water = 0.3 gold/unit, Power = 0.6 gold/unit
Total Cost = (615 × 0.3) + (2,430 × 0.6) + 1,225
           = 184.5 + 1,458 + 1,225
           = 2,867.5 gold
Cost per Unit = 2,867.5 ÷ 82 = 34.97 gold/unit
```

## Special Cases and Edge Conditions

### Case 1: High Variable, Low Fixed Costs

Products using primarily Biochemical processes often have low fixed costs but high variable percentages.

```
Example: Pharmaceutical Product
- Biochemical Level 3
  - Fixed: Water(8), Power(15), Gold(20)
  - Variable: Water(8%), Power(25%), Gold(12%)

With Material Cost A = 10,000:
Water = ⌈8 + 10,000 × 8%⌉ = ⌈8 + 800⌉ = 808 units
Power = ⌈15 + 10,000 × 25%⌉ = ⌈15 + 2,500⌉ = 2,515 units
Gold = 20 + 10,000 × 12% = 20 + 1,200 = 1,220 gold
```

### Case 2: Multiple Low-Yield Categories

When combining multiple craft categories with low yields, the cumulative effect significantly reduces output.

```
Example: Three categories with moderate yields
- Category 1: 85% yield
- Category 2: 80% yield  
- Category 3: 75% yield

Combined Yield = 0.85 × 0.80 × 0.75 = 0.51 (51%)
For 100 input units → 51 output units
```

### Case 3: Space-Freeing Production

Some productions free more space than they consume due to material density differences.

```
Example: Dense Material → Light Product
Materials consume: 500 carbon emission units
Products require: 200 carbon emission units
Net Space Change = 200 - 500 = -300 (frees 300 units)
```

## Optimization Strategies

### 1. Cost Efficiency Analysis

```typescript
interface CostEfficiencyAnalysis {
  // Compare different craft category combinations
  compareOptions(formula: ProductFormula): ComparisonResult[] {
    const options = generateCraftCombinations(formula);
    
    return options.map(option => ({
      categories: option,
      setupCost: calculateSetupCost(option),
      variableCost: calculateVariableCost(option),
      yield: calculateCombinedYield(option),
      costPerUnit: calculateCostPerUnit(option),
      efficiency: calculateEfficiency(option)
    }));
  }
}
```

### 2. Break-Even Analysis

```typescript
function calculateBreakEvenQuantity(
  formula: ProductFormula,
  sellingPrice: number
): number {
  const setupCosts = getSetupCosts(formula);
  const variableCostPerUnit = getVariableCostPerUnit(formula);
  const yield = getCombinedYield(formula);
  
  // Break-even = Setup Costs / (Selling Price × Yield - Variable Cost)
  const profitPerUnit = (sellingPrice × yield) - variableCostPerUnit;
  return Math.ceil(setupCosts / profitPerUnit);
}

Example:
Setup Costs = 500 gold
Variable Cost per Unit = 20 gold
Yield = 90%
Selling Price = 30 gold/unit

Break-even = 500 / (30 × 0.9 - 20)
           = 500 / (27 - 20)
           = 500 / 7
           = 72 units
```

### 3. Batch Size Optimization

```typescript
function findOptimalBatchSize(
  formula: ProductFormula,
  constraints: ProductionConstraints
): number {
  // Fixed costs are constant regardless of batch size
  const setupCosts = getSetupCosts(formula);
  
  // Variable costs scale with quantity
  const variableRate = getVariableRate(formula);
  
  // Find quantity that minimizes cost per unit
  // considering: space limits, material availability, fund limits
  
  const maxBySpace = constraints.availableSpace / formula.netSpacePerUnit;
  const maxByMaterials = getMaxByMaterials(formula, constraints.inventory);
  const maxByFunds = constraints.availableFunds / estimateTotalCost(formula);
  
  const maxPossible = Math.min(maxBySpace, maxByMaterials, maxByFunds);
  
  // Optimal is usually maximum possible due to fixed cost amortization
  return Math.floor(maxPossible);
}
```

## Infrastructure Cost Impact

### Water and Power Pricing Effects

Infrastructure providers set their own unit prices, significantly impacting total production costs.

```typescript
Example: Same production with different infrastructure pricing

Scenario 1: Low-cost providers
- Water: 0.2 gold/unit × 1000 units = 200 gold
- Power: 0.5 gold/unit × 2000 units = 1000 gold
- Total Infrastructure Cost: 1200 gold

Scenario 2: Premium providers
- Water: 0.8 gold/unit × 1000 units = 800 gold
- Power: 1.2 gold/unit × 2000 units = 2400 gold
- Total Infrastructure Cost: 3200 gold

Difference: 3200 - 1200 = 2000 gold (167% increase)
```

### Cross-Team Infrastructure Deals

Teams can negotiate special rates with infrastructure providers.

```typescript
interface InfrastructureDeal {
  // Volume discount example
  calculateVolumeDiscount(basePrice: number, volume: number): number {
    if (volume > 10000) return basePrice × 0.8;  // 20% discount
    if (volume > 5000) return basePrice × 0.9;   // 10% discount
    if (volume > 1000) return basePrice × 0.95;  // 5% discount
    return basePrice;
  }
  
  // Long-term contract example
  calculateContractPrice(basePrice: number, duration: number): number {
    const discountRate = Math.min(duration * 0.02, 0.3); // Max 30% discount
    return basePrice * (1 - discountRate);
  }
}
```

## Carbon Emission Calculation

### Environmental Impact Formula

```typescript
Carbon Emission = (Total Setup Costs + Material Cost A × Total Variable%) × 1%

Where:
- Total Setup = Sum of all fixed costs (water + power + gold)
- Total Variable% = Sum of all variable percentages
```

### Example Calculation

```
Given:
- Total Setup = 476 (from water: 62, power: 300, gold: 114)
- Material Cost A = 10,000
- Total Variable% = 50% (water: 4%, power: 37.2%, gold: 8.8%)

Carbon = (476 + 10,000 × 50%) × 1%
       = (476 + 5,000) × 1%
       = 5,476 × 1%
       = 54.76 units
```

### Carbon Efficiency Strategies

1. **Choose Low-Carbon Craft Categories**: Some categories have lower total percentages
2. **Optimize Material Selection**: Use materials with lower carbon emission values
3. **Maximize Batch Size**: Spread fixed carbon costs over more units

## Advanced Calculations

### Multi-Product Production Planning

When planning multiple products, optimize the sequence to minimize total costs.

```typescript
interface ProductionPlan {
  products: ProductionItem[];
  
  optimizeSequence(): ProductionItem[] {
    // Sort by:
    // 1. Products that free the most space first
    // 2. Products with highest profit margins
    // 3. Products with fastest production times
    
    return this.products.sort((a, b) => {
      const scoreA = a.spaceFreed * 0.3 + 
                     a.profitMargin * 0.5 + 
                     (1/a.productionTime) * 0.2;
      const scoreB = b.spaceFreed * 0.3 + 
                     b.profitMargin * 0.5 + 
                     (1/b.productionTime) * 0.2;
      return scoreB - scoreA;
    });
  }
}
```

### Resource Pooling Strategy

Teams can pool resources for bulk production benefits.

```typescript
interface ResourcePooling {
  // Calculate pooled production benefits
  calculatePooledCost(
    teams: Team[],
    formula: ProductFormula,
    totalQuantity: number
  ): PooledCostResult {
    // Bulk material purchasing discount
    const materialDiscount = getBulkDiscount(totalQuantity);
    
    // Shared fixed costs
    const sharedSetupCost = getSetupCosts(formula) / teams.length;
    
    // Infrastructure volume rates
    const volumeRates = negotiateVolumeRates(totalQuantity);
    
    return {
      individualCost: calculateIndividualCost(formula, totalQuantity/teams.length),
      pooledCost: calculateWithDiscounts(formula, totalQuantity, materialDiscount, volumeRates),
      savingsPerTeam: (individualCost - pooledCost/teams.length),
      breakdownByTeam: distributePooledCosts(teams, pooledCost)
    };
  }
}
```

## Quick Reference Tables

### Setup Cost Ranges by Category Type

| Category Type | Water Range | Power Range | Gold Range |
|--------------|------------|------------|------------|
| Mechanical Manufacturing | 24-48 | 80-160 | 42-132 |
| Materials Processing | 25-45 | 80-140 | 45-105 |
| Biochemical | 5-12 | 10-40 | 15-60 |
| Electronic Equipment | 20-42 | 60-240 | 30-84 |
| Energy Utilization | 20-50 | 60-180 | 30-90 |
| Cutting & Textile | 15-36 | 30-72 | 25-60 |
| Food Processing | 10-24 | 20-48 | 20-48 |

### Variable Percentage Ranges

| Category Type | Water% Range | Power% Range | Gold% Range |
|--------------|------------|------------|------------|
| Mechanical Manufacturing | 2-8% | 10-20% | 4-16% |
| Materials Processing | 3-6% | 12-24% | 5-10% |
| Biochemical | 5-10% | 15-30% | 8-16% |
| Electronic Equipment | 1-2% | 20-31.2% | 3-6.8% |
| Energy Utilization | 2-5% | 6-18% | 2-6% |
| Cutting & Textile | 1-4% | 4-12% | 2-8% |
| Food Processing | 2-6% | 5-15% | 3-9% |

## Summary

The production cost calculation system provides:
1. **Predictable costs** through fixed setup + variable structure
2. **Scalability benefits** as fixed costs amortize over larger batches
3. **Strategic depth** through craft category selection
4. **Environmental awareness** via carbon emission tracking
5. **Cross-team opportunities** through infrastructure negotiations
6. **Clear optimization paths** for cost reduction

Understanding these calculations enables teams to make informed production decisions and optimize their manufacturing operations for maximum profitability.