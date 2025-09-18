# MTO Type 1 Business Rules

## Overview

This document defines the complete business logic and rules governing the MTO Type 1 population-based Made-To-Order system. All implementations must strictly adhere to these rules to ensure system integrity and fairness.

## 1. Requirement Creation Rules

### 1.1 Configuration Validation

```typescript
interface MtoType1Configuration {
  managerProductFormulaId: number;     // Must reference valid ManagerProductFormula.id
  purchaseGoldPrice: number;           // Must be > 0
  basePurchaseNumber: number;          // Must be > 0
  releaseTime: Date;                   // Must be future time
  settlementTime: Date;               // Must be > releaseTime
  overallPurchaseNumber: number;      // Must be > 0
  baseCountPopulationNumber: number;  // Must be > 1, default: 1000
}
```

**Rules:**
- `overallPurchaseBudget` = `overallPurchaseNumber` × `purchaseGoldPrice`
- `settlementTime` > `releaseTime` (must have delivery window)
- Only managers with appropriate permissions can create requirements
- Cannot modify after status changes to RELEASED

### 1.2 Status Lifecycle

```
DRAFT → RELEASED → IN_PROGRESS → SETTLING → SETTLED
          ↓                         ↓          ↓
      CANCELLED                CANCELLED   (terminal)
```

**Transition Rules:**
- **DRAFT → RELEASED**: Automatic at `releaseTime`
- **RELEASED → IN_PROGRESS**: First delivery received
- **IN_PROGRESS → SETTLING**: Automatic at `settlementTime`
- **SETTLING → SETTLED**: Settlement process completed
- **Any → CANCELLED**: Manual by manager (before SETTLING only)

## 2. Demand Calculation Algorithm

### 2.1 Initial Requirement Calculation

For each tile with population > 0:

```typescript
function calculateInitialRequirement(
  tileState: ActivityTileState,
  config: MtoType1Configuration
): number {
  const populationMultiplier = Math.floor(
    tileState.currentPopulation / config.baseCountPopulationNumber
  );
  return config.basePurchaseNumber * populationMultiplier;
}
```

**Example:**
- Tile population: 5,500
- Base count population: 1,000
- Base purchase number: 100
- Initial requirement: 100 × floor(5,500/1,000) = 500 units

### 2.2 Budget Constraint Adjustment with History Tracking

```typescript
function adjustForBudgetConstraint(
  tileRequirements: TileRequirement[],
  config: MtoType1Configuration,
  mtoType1Id: string
): void {
  let totalRequirement = sum(tileRequirements.map(t => t.initialRequirement));
  let stepNumber = 1;

  // Step 1: Record initial calculation
  recordCalculationStep({
    mtoType1Id,
    calculationStep: stepNumber++,
    stepType: 'INITIAL_CALCULATION',
    stepDescription: 'Initial requirement calculation based on tile populations',
    totalInitialRequirement: totalRequirement,
    totalAdjustedRequirement: totalRequirement,
    tilesSetToZero: 0,
    tileAdjustments: tileRequirements.map(t => ({
      tileId: t.tileId,
      tileName: t.tileName,
      population: t.tilePopulation,
      initialReq: t.initialRequirement,
      adjustedReq: t.initialRequirement,
      reason: 'Initial calculation'
    }))
  });

  // Step 2: Check budget constraint
  if (totalRequirement > config.overallPurchaseNumber) {
    recordCalculationStep({
      mtoType1Id,
      calculationStep: stepNumber++,
      stepType: 'BUDGET_CONSTRAINT_CHECK',
      stepDescription: `Total requirement (${totalRequirement}) exceeds overall limit (${config.overallPurchaseNumber})`,
      totalInitialRequirement: totalRequirement,
      totalAdjustedRequirement: totalRequirement,
      tilesSetToZero: 0
    });
  }

  // Step 3: Iterative tile elimination
  while (totalRequirement > config.overallPurchaseNumber) {
    const beforeTotal = totalRequirement;

    // Find tiles with maximum requirement
    const maxRequirement = Math.max(...tileRequirements.map(t => t.requirement));
    const maxTiles = tileRequirements.filter(t => t.requirement === maxRequirement);

    // Record tiles being eliminated
    const eliminatedTiles = [];

    // Set all max tiles to 0
    maxTiles.forEach(tile => {
      tile.adjustedRequirement = 0;
      tile.adjustmentReason = 'Budget constraint - exceeded overall limit';

      eliminatedTiles.push({
        tileId: tile.tileId,
        tileName: tile.tileName,
        population: tile.tilePopulation,
        initialReq: tile.initialRequirement,
        adjustedReq: 0,
        reason: `Eliminated: had max requirement of ${maxRequirement}`
      });
    });

    // Recalculate total
    totalRequirement = sum(tileRequirements.map(t => t.adjustedRequirement));

    // Record this elimination step
    recordCalculationStep({
      mtoType1Id,
      calculationStep: stepNumber++,
      stepType: 'TILE_ELIMINATION',
      stepDescription: `Eliminated ${maxTiles.length} tile(s) with max requirement ${maxRequirement}`,
      totalInitialRequirement: beforeTotal,
      totalAdjustedRequirement: totalRequirement,
      tilesSetToZero: maxTiles.length,
      tileAdjustments: eliminatedTiles,
      budgetSaved: (beforeTotal - totalRequirement) * config.purchaseGoldPrice
    });
  }

  // Step 4: Record final distribution
  recordCalculationStep({
    mtoType1Id,
    calculationStep: stepNumber++,
    stepType: 'FINAL_DISTRIBUTION',
    stepDescription: 'Final distribution calculation complete',
    totalInitialRequirement: sum(tileRequirements.map(t => t.initialRequirement)),
    totalAdjustedRequirement: totalRequirement,
    tileAdjustments: tileRequirements.map(t => ({
      tileId: t.tileId,
      tileName: t.tileName,
      population: t.tilePopulation,
      initialReq: t.initialRequirement,
      adjustedReq: t.adjustedRequirement,
      reason: t.adjustmentReason || 'Within budget'
    }))
  });
}
```

**Adjustment Rules:**
1. Calculate sum of all initial requirements
2. If sum > `overallPurchaseNumber`:
   - Identify tile(s) with maximum requirement
   - Set their requirement to 0
   - If multiple tiles have same max, set all to 0
3. Repeat until sum ≤ `overallPurchaseNumber`
4. Record each elimination step in calculation history
5. Store final distribution for transparency

### 2.3 Calculation History Benefits

The calculation history provides:
- **Transparency**: Shows exactly why certain tiles received zero allocation
- **Auditability**: Complete record of the distribution algorithm execution
- **Debugging**: Helps identify issues in the distribution logic
- **Fairness**: Demonstrates the objective, algorithmic distribution process
- **Education**: Helps students understand the budget constraint mechanism

### 2.4 Per-Tile Budget Allocation

```typescript
function calculateTileBudget(tile: TileRequirement, config: MtoType1Configuration): number {
  const requirementRatio = tile.adjustedRequirement / config.overallPurchaseNumber;
  return config.overallPurchaseBudget * requirementRatio;
}
```

## 3. Delivery Rules

### 3.1 Delivery Acceptance Criteria

**Temporal Rules:**
- Deliveries accepted only between `releaseTime` and `settlementTime`
- No modifications to delivered products after submission
- Late deliveries automatically rejected

**Product Rules:**
- Products must exist in team's facility inventory
- Products must match the specified formula exactly (see 3.2 for details)
- Partial deliveries allowed if formula permits
- Minimum delivery quantity: 1 unit

**Team Submission Rules:**
- **One delivery per team per tile**: Each team can deliver to multiple tiles
- Cannot submit multiple deliveries to the same tile
- Each tile delivery is independent and processed separately

### 3.2 Product-Formula Alignment Validation

**Critical Validation Requirements:**

Products delivered MUST exactly match the Manager Product Formula specified in the MTO requirement. This validation checks:

```typescript
interface ProductFormulaAlignment {
  // 1. Craft Categories Must Match Exactly
  craftCategories: {
    requiredCategories: string[];      // From ManagerProductFormulaCraftCategory
    productCategories: string[];       // From delivered product
    mustMatch: boolean;                // All categories must be present
  };

  // 2. Raw Materials Must Match Exactly
  rawMaterials: {
    requiredMaterials: {
      materialId: number;
      requiredQuantity: number;        // From ManagerProductFormulaMaterial
    }[];
    productMaterials: {
      materialId: number;
      actualQuantity: number;          // From product composition
    }[];
    mustMatch: boolean;                // All materials and quantities must match
  };

  // 3. Validation Process
  validationSteps: [
    "Check all required craft categories are present",
    "Verify no extra craft categories exist",
    "Check all required raw materials are present",
    "Verify material quantities match exactly",
    "Confirm no unauthorized materials included"
  ];
}
```

**Validation Algorithm:**

```typescript
function validateProductAgainstFormula(
  product: Product,
  formula: ManagerProductFormula
): ValidationResult {
  // Step 1: Validate Craft Categories
  const formulaCategories = formula.craftCategories.map(c => c.categoryId);
  const productCategories = product.craftCategories.map(c => c.categoryId);

  if (!arraysEqual(formulaCategories.sort(), productCategories.sort())) {
    return {
      valid: false,
      reason: "Craft categories mismatch",
      details: {
        required: formulaCategories,
        provided: productCategories
      }
    };
  }

  // Step 2: Validate Raw Materials
  const formulaMaterials = formula.materials.map(m => ({
    id: m.materialId,
    quantity: m.quantity
  }));

  const productMaterials = product.materials.map(m => ({
    id: m.materialId,
    quantity: m.quantity
  }));

  for (const required of formulaMaterials) {
    const provided = productMaterials.find(m => m.id === required.id);

    if (!provided) {
      return {
        valid: false,
        reason: `Missing required material: ${required.id}`
      };
    }

    if (provided.quantity !== required.quantity) {
      return {
        valid: false,
        reason: `Material quantity mismatch for material ${required.id}`,
        details: {
          required: required.quantity,
          provided: provided.quantity
        }
      };
    }
  }

  // Step 3: Check for extra materials
  for (const provided of productMaterials) {
    if (!formulaMaterials.find(m => m.id === provided.id)) {
      return {
        valid: false,
        reason: `Unauthorized material included: ${provided.id}`
      };
    }
  }

  return { valid: true };
}
```

**Example Validation:**

```yaml
Manager Product Formula:
  formulaId: 123
  productName: "Advanced Circuit Board"
  craftCategories:
    - Electronics Assembly (id: 5)
    - Quality Control (id: 8)
  materials:
    - Silicon Wafer (id: 101): quantity 2
    - Copper Wire (id: 102): quantity 5
    - Gold Connector (id: 103): quantity 1

Valid Product:
  craftCategories: [5, 8]              ✅ Matches exactly
  materials:
    - materialId: 101, quantity: 2     ✅ Correct
    - materialId: 102, quantity: 5     ✅ Correct
    - materialId: 103, quantity: 1     ✅ Correct

Invalid Product Examples:
  1. Missing craft category: [5]       ❌ Missing category 8
  2. Wrong material quantity:
     - materialId: 101, quantity: 3    ❌ Should be 2
  3. Extra material:
     - materialId: 104, quantity: 1    ❌ Not in formula
  4. Missing material:
     - Materials: [101, 102]           ❌ Missing material 103
```

### 3.3 Transportation Fee Calculation

```typescript
function calculateTransportationFee(
  originFacilityInstance: TileFacilityInstance,
  destinationMapTile: MapTile,
  productCount: number
): number {
  const distance = calculateDistance(
    originFacilityInstance.mapTileId,
    destinationMapTile.id
  );
  const baseRate = getTransportationRate(distance);
  const volumeMultiplier = Math.ceil(productCount / 100); // Per 100 units

  return baseRate * volumeMultiplier;
}
```

**Fee Rules:**
- Charged at delivery time
- Non-refundable once delivery confirmed
- Deducted from team account immediately
- Separate fee for product returns

### 3.4 Delivery Validation

```typescript
interface DeliveryValidation {
  checkTeamBalance(transportationFee: number): boolean;
  checkProductOwnership(teamId: string, productIds: string[]): boolean;
  checkProductFormula(productIds: string[], formulaId: string): boolean;
  checkDeliveryWindow(currentTime: Date): boolean;
  checkTileRequirement(tileId: string, quantity: number): boolean;
}
```

**Validation Sequence:**
1. Verify delivery window is open
2. Confirm team owns specified products
3. Validate products match formula
4. Check team has sufficient balance for transportation
5. Verify tile still has unfulfilled requirement

## 4. Settlement Process

### 4.1 Settlement Trigger

Settlement automatically initiates at `settlementTime` with the following sequence:

```typescript
async function executeSettlement(mtoType1Id: string): Promise<void> {
  // 1. Lock all deliveries (no new submissions)
  await lockDeliveries(mtoType1Id);

  // 2. Process each tile sequentially
  for (const tile of tiles) {
    await processTileSettlement(tile);
  }

  // 3. Handle unsettled products
  await processUnsettledReturns();

  // 4. Calculate final statistics
  await calculateFinalMetrics();

  // 5. Update status to SETTLED
  await updateStatus('SETTLED');
}
```

### 4.2 Per-Tile Settlement Logic with History Tracking

```typescript
function processTileSettlement(tile: TileRequirement, mtoType1Id: string): SettlementResult {
  const startTime = Date.now();
  const deliveries = getDeliveriesForTile(tile.id);
  let remainingRequirement = tile.adjustedRequirement;
  let remainingBudget = tile.requirementBudget;
  const settlements = [];
  const validationResults = [];
  let stepNumber = 1;

  // Record tile processing start
  recordSettlementStep({
    mtoType1Id,
    settlementStep: stepNumber++,
    stepType: 'TILE_PROCESSING_START',
    stepDescription: `Starting settlement for tile ${tile.tileName}`,
    tileId: tile.id,
    tileName: tile.tileName,
    tileRequirement: tile.adjustedRequirement
  });

  // Sort deliveries by timestamp (FIFO)
  deliveries.sort((a, b) => a.deliveredAt - b.deliveredAt);

  // Record delivery validation
  recordSettlementStep({
    mtoType1Id,
    settlementStep: stepNumber++,
    stepType: 'DELIVERY_VALIDATION',
    stepDescription: `Processing ${deliveries.length} deliveries for tile`,
    tileId: tile.id,
    deliveriesProcessed: deliveries.length
  });

  for (const delivery of deliveries) {
    if (remainingRequirement <= 0) break;

    // Validate products one by one with detailed tracking
    let validatedCount = 0;
    let rejectedCount = 0;
    const productValidations = [];

    for (const productId of delivery.productIds) {
      if (remainingRequirement <= 0) {
        rejectedCount++;
        productValidations.push({
          productId,
          valid: false,
          reason: 'Tile requirement already fulfilled'
        });
        continue;
      }

      const validationResult = validateProductAgainstFormula(productId, tile.formulaId);

      if (validationResult.valid) {
        validatedCount++;
        remainingRequirement--;

        // Create settlement record
        settlements.push({
          deliveryId: delivery.id,
          productId: productId,
          unitPrice: tile.purchaseGoldPrice,
          status: 'SETTLED'
        });

        productValidations.push({
          productId,
          valid: true,
          settled: true,
          paymentAmount: tile.purchaseGoldPrice
        });
      } else {
        rejectedCount++;
        productValidations.push({
          productId,
          valid: false,
          reason: validationResult.reason,
          details: validationResult.details
        });
      }
    }

    // Record product validation results
    recordSettlementStep({
      mtoType1Id,
      settlementStep: stepNumber++,
      stepType: 'PRODUCT_VALIDATION',
      stepDescription: `Validated products for delivery ${delivery.id}`,
      tileId: tile.id,
      productsValidated: validatedCount + rejectedCount,
      productsSettled: validatedCount,
      productsRejected: rejectedCount,
      validationDetails: productValidations
    });

    // Calculate and process payment
    const paymentAmount = validatedCount * tile.purchaseGoldPrice;
    if (paymentAmount > 0) {
      processPayment(delivery.teamId, paymentAmount);

      // Record payment processing
      recordSettlementStep({
        mtoType1Id,
        settlementStep: stepNumber++,
        stepType: 'PAYMENT_PROCESSING',
        stepDescription: `Processed payment for team ${delivery.teamId}`,
        tileId: tile.id,
        totalPaymentAmount: paymentAmount
      });
    }

    // Update delivery status
    updateDeliverySettlement(delivery.id, validatedCount, rejectedCount);
  }

  // Record tile completion
  const processingDuration = Date.now() - startTime;
  recordSettlementStep({
    mtoType1Id,
    settlementStep: stepNumber++,
    stepType: 'TILE_PROCESSING_COMPLETE',
    stepDescription: `Completed settlement for tile ${tile.tileName}`,
    tileId: tile.id,
    productsSettled: settlements.length,
    processingDuration
  });

  return settlements;
}
```

**Settlement Rules:**
1. Process deliveries in FIFO order (first delivered, first settled)
2. Validate each product against formula
3. Count valid products until requirement fulfilled
4. Pay teams for validated products only
5. Mark remaining products as unsettled

### 4.3 Payment Processing

```typescript
interface PaymentRules {
  paymentAmount: number;      // validatedCount × purchaseGoldPrice
  paymentMethod: 'SYSTEM_CREDIT';
  paymentTiming: 'IMMEDIATE';
  transactionType: 'MTO_TYPE1_SETTLEMENT';
}
```

**Payment Rules:**
- Immediate credit to team account upon validation
- No payment for invalid products
- Transaction recorded with unique ID
- Reversible only by system admin with reason

### 4.4 Settlement History Benefits

The settlement history provides:
- **Transparency**: Shows exactly which products were accepted or rejected and why
- **Auditability**: Complete record of the settlement process for each tile
- **Debugging**: Helps identify validation failures and payment issues
- **Team Feedback**: Teams can understand why products weren't settled
- **Performance Monitoring**: Tracks processing time per tile and overall

### 4.5 Unsettled Product Handling

```typescript
function handleUnsettledProducts(delivery: Delivery): void {
  const unsettledCount = delivery.deliveryNumber - delivery.settledNumber;

  if (unsettledCount > 0) {
    // Option 1: Team requests return
    if (delivery.returnRequested) {
      const returnFee = calculateTransportationFee(
        delivery.tile,
        delivery.returnFacility,
        unsettledCount
      );

      if (chargeTeam(delivery.teamId, returnFee)) {
        transferProducts(delivery.productIds, delivery.returnFacility);
        updateDeliveryStatus('RETURNED');
      }
    }

    // Option 2: Abandon products (no action needed)
    else {
      updateDeliveryStatus('ABANDONED');
    }
  }
}
```

**Return Rules:**
- Teams can request returns for unsettled products after settlement
- Must specify destination facility with available space
- Pay return transportation fee
- Products transferred to specified facility
- **No time limitation** for return requests - products remain available indefinitely

## 5. Edge Cases and Exception Handling

### 5.1 Zero Population Tiles

**Rule:** Tiles with population = 0 receive no requirement allocation

### 5.2 Insufficient Team Balance

**Rule:** Delivery rejected if team cannot pay transportation fee

### 5.3 Formula Mismatch

**Rule:** Products not matching formula are excluded from settlement

### 5.4 System Failure During Settlement

**Rule:** Implement two-phase commit:
1. Prepare phase: Validate all transactions
2. Commit phase: Execute all changes atomically
3. Rollback on any failure

### 5.5 Concurrent Deliveries

**Rule:** Use optimistic locking to prevent oversupply:
```typescript
function acceptDelivery(delivery: Delivery): boolean {
  const tile = getTileWithLock(delivery.tileId);

  if (tile.remainingRequirement >= delivery.quantity) {
    tile.deliveredNumber += delivery.quantity;
    tile.remainingRequirement -= delivery.quantity;
    saveTile(tile);
    return true;
  }

  return false;
}
```

## 6. Compliance and Governance

### 6.1 Fair Play Rules

- No preferential treatment for specific teams
- Requirements visible to teams only after RELEASED status
- No public access - authentication required for all endpoints
- Students cannot see DRAFT, SETTLING, SETTLED, or CANCELLED requirements
- Equal access to released information at release time
- FIFO processing ensures fairness

### 6.2 Anti-Gaming Measures

- One delivery per team per tile (cannot submit multiple times to same tile)
- Cannot modify products after delivery
- Cannot cancel deliveries after submission

### 6.3 Dispute Resolution

- All disputes logged with evidence
- Manager review required for resolution
- System admin has final authority

## 7. Performance Constraints

### 7.1 Processing Limits

- Maximum 10,000 tiles per requirement
- Maximum 100,000 total products per settlement
- Settlement must complete within 5 minutes
- Real-time updates throttled to 1 per second

### 7.2 Data Retention

- Active requirements: Full data retained
- Settled requirements: 90 days full data, then archived
- Archived data: Summary only, detailed logs purged
- Audit trail: 1 year retention minimum
