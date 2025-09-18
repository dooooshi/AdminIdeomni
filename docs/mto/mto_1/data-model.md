# MTO Type 1 Data Model

## Overview

The MTO Type 1 data model consists of four primary entities that work together to manage the complete lifecycle of population-based Made-To-Order requirements from creation through settlement.

## Entity Relationship Diagram

```
manager_requirement_product_type_1 (1) ----< (n) mto_type_1_tile_requirement
                |                                            |
                |                                            |
                v                                            v
    manager_product_formula (1)                  mto_type_1_delivery (n)
                |                                            |
                |                                            |
                v                                            v
            Products                            mto_type_1_settlement (n)
```

## Prisma Schema Definitions

### 1. Manager Requirement Product Type 1

```prisma
model ManagerRequirementProductType1 {
  id                           Int       @id @default(autoincrement())
  activityId                   String
  managerProductFormulaId      Int
  purchaseGoldPrice            Decimal   @db.Decimal(10, 2)
  basePurchaseNumber           Int
  releaseTime                  DateTime
  settlementTime               DateTime
  overallPurchaseNumber        Int
  overallPurchaseBudget        Decimal   @db.Decimal(15, 2)
  baseCountPopulationNumber    Int       @default(1000)
  status                       MtoType1Status @default(DRAFT)

  // Computed fields
  actualSpentBudget            Decimal?  @db.Decimal(15, 2)
  actualPurchasedNumber        Int?      @default(0)
  fulfillmentRate              Decimal?  @db.Decimal(5, 2)

  // Metadata
  createdBy                    String
  createdAt                    DateTime  @default(now())
  updatedAt                    DateTime  @updatedAt
  settlementCompletedAt        DateTime?

  // Relations
  activity                     Activity  @relation(fields: [activityId], references: [id])
  managerProductFormula        ManagerProductFormula @relation(fields: [managerProductFormulaId], references: [id])
  tileRequirements            MtoType1TileRequirement[]
  deliveries                  MtoType1Delivery[]
  settlements                 MtoType1Settlement[]
  calculationHistory          MtoType1CalculationHistory[]
  settlementHistory           MtoType1SettlementHistory[]

  @@index([activityId])
  @@index([releaseTime])
  @@index([settlementTime])
  @@index([status])
}

enum MtoType1Status {
  DRAFT
  RELEASED
  IN_PROGRESS
  SETTLING
  SETTLED
  CANCELLED
}
```

### 2. MTO Type 1 Tile Requirement

```prisma
model MtoType1TileRequirement {
  id                           Int       @id @default(autoincrement())
  mtoType1Id                   Int
  mapTileId                    Int       // Reference to MapTile
  activityTileStateId          Int?      // Reference to ActivityTileState for population
  tileName                     String    // Denormalized for display
  tilePopulation              Int       // Current population at creation

  // Calculated requirements
  initialRequirementNumber     Int
  adjustedRequirementNumber    Int
  requirementBudget           Decimal   @db.Decimal(15, 2)

  // Fulfillment tracking
  deliveredNumber             Int       @default(0)
  settledNumber               Int       @default(0)
  remainingNumber             Int
  spentBudget                 Decimal   @db.Decimal(15, 2) @default(0)

  // Status
  isActive                    Boolean   @default(true)
  adjustmentReason            String?

  // Metadata
  createdAt                   DateTime  @default(now())
  updatedAt                   DateTime  @updatedAt
  lastDeliveryAt              DateTime?

  // Relations
  mtoType1                    ManagerRequirementProductType1 @relation(fields: [mtoType1Id], references: [id])
  mapTile                     MapTile   @relation(fields: [mapTileId], references: [id])
  activityTileState           ActivityTileState? @relation(fields: [activityTileStateId], references: [id])
  deliveries                  MtoType1Delivery[]
  settlements                 MtoType1Settlement[]

  @@unique([mtoType1Id, mapTileId])
  @@index([mtoType1Id])
  @@index([mapTileId])
  @@index([isActive])
}
```

### 3. MTO Type 1 Delivery

```prisma
model MtoType1Delivery {
  id                           Int       @id @default(autoincrement())
  mtoType1Id                   Int
  tileRequirementId            Int
  teamId                       String    // Team uses cuid()
  teamName                     String    // Denormalized for display

  // Delivery details
  deliveryNumber              Int
  productInventoryItemIds     String[]  // Array of FacilityInventoryItem IDs
  transportationFee           Decimal   @db.Decimal(10, 2)
  sourceFacilityInstanceId   String    // TileFacilityInstance ID

  // Settlement tracking
  settledNumber               Int       @default(0)
  unsettledNumber             Int
  settlementAmount            Decimal?  @db.Decimal(15, 2)
  settlementStatus            DeliverySettlementStatus @default(PENDING)

  // Return handling
  returnRequested             Boolean   @default(false)
  returnFacilityInstanceId    String?   // TileFacilityInstance ID for return
  returnTransportationFee     Decimal?  @db.Decimal(10, 2)
  returnCompletedAt           DateTime?

  // Metadata
  deliveredAt                 DateTime  @default(now())
  settledAt                   DateTime?
  notes                       String?

  // Relations
  mtoType1                    ManagerRequirementProductType1 @relation(fields: [mtoType1Id], references: [id])
  tileRequirement             MtoType1TileRequirement @relation(fields: [tileRequirementId], references: [id])
  team                        Team      @relation(fields: [teamId], references: [id])
  sourceFacility              TileFacilityInstance @relation("SourceDeliveryFacility", fields: [sourceFacilityInstanceId], references: [id])
  returnFacility              TileFacilityInstance? @relation("ReturnDeliveryFacility", fields: [returnFacilityInstanceId], references: [id])
  settlements                 MtoType1Settlement[]

  @@index([mtoType1Id])
  @@index([tileRequirementId])
  @@index([teamId])
  @@index([settlementStatus])
  @@index([deliveredAt])
  @@unique([mtoType1Id, teamId, tileRequirementId]) // One delivery per team per tile
}

enum DeliverySettlementStatus {
  PENDING
  PARTIALLY_SETTLED
  FULLY_SETTLED
  REJECTED
  RETURNED
}
```

### 4. MTO Type 1 Calculation History

```prisma
model MtoType1CalculationHistory {
  id                           Int       @id @default(autoincrement())
  mtoType1Id                   Int

  // Calculation context
  calculationStep              Int       // Step number in the calculation process
  stepType                     CalculationStepType
  stepDescription              String

  // Calculation parameters used
  basePurchaseNumber           Int
  baseCountPopulationNumber    Int
  overallPurchaseNumber        Int
  overallPurchaseBudget        Decimal   @db.Decimal(15, 2)
  purchaseGoldPrice            Decimal   @db.Decimal(10, 2)

  // Results at this step
  totalTilesProcessed          Int
  totalInitialRequirement      Int       // Sum before this step
  totalAdjustedRequirement     Int       // Sum after this step
  tilesSetToZero              Int       // Number of tiles zeroed in this step

  // Detailed tile adjustments (JSON for flexibility)
  tileAdjustments             Json      // Array of { tileId, tileName, population, initialReq, adjustedReq, reason }

  // Budget impact
  budgetBeforeStep            Decimal   @db.Decimal(15, 2)
  budgetAfterStep             Decimal   @db.Decimal(15, 2)
  budgetSaved                 Decimal   @db.Decimal(15, 2)

  // Metadata
  calculatedAt                DateTime  @default(now())
  calculatedBy                String    @default("SYSTEM")

  // Relations
  mtoType1                    ManagerRequirementProductType1 @relation(fields: [mtoType1Id], references: [id])

  @@index([mtoType1Id])
  @@index([calculationStep])
}

enum CalculationStepType {
  INITIAL_CALCULATION         // Initial requirement calculation based on population
  BUDGET_CONSTRAINT_CHECK     // Checking if total exceeds budget
  TILE_ELIMINATION           // Removing tiles with max requirement
  BUDGET_REALLOCATION        // Reallocating budget after elimination
  FINAL_DISTRIBUTION         // Final distribution complete
  MANUAL_ADJUSTMENT          // Manual adjustment by manager
}
```

### 5. MTO Type 1 Settlement History

```prisma
model MtoType1SettlementHistory {
  id                           Int       @id @default(autoincrement())
  mtoType1Id                   Int

  // Settlement context
  settlementStep               Int       // Step number in settlement process
  stepType                     SettlementStepType
  stepDescription              String

  // Tile being processed
  tileId                       Int?
  tileName                     String?
  tileRequirement              Int?

  // Processing details
  deliveriesProcessed          Int       @default(0)
  productsValidated            Int       @default(0)
  productsSettled              Int       @default(0)
  productsRejected             Int       @default(0)

  // Validation details (JSON for flexibility)
  validationDetails            Json?     // Array of validation results per product
  // Structure: [{
  //   deliveryId, productId, teamId,
  //   validationResult: { valid, reason, details },
  //   settled: boolean,
  //   paymentAmount: decimal
  // }]

  // Financial impact
  totalPaymentAmount           Decimal?  @db.Decimal(15, 2)
  totalTransportationFees      Decimal?  @db.Decimal(15, 2)

  // Error tracking
  errors                       Json?     // Array of errors encountered

  // Metadata
  processedAt                  DateTime  @default(now())
  processedBy                  String    @default("SYSTEM")
  processingDuration           Int?      // Duration in milliseconds

  // Relations
  mtoType1                     ManagerRequirementProductType1 @relation(fields: [mtoType1Id], references: [id])

  @@index([mtoType1Id])
  @@index([settlementStep])
  @@index([stepType])
}

enum SettlementStepType {
  SETTLEMENT_INITIATED        // Settlement process started
  TILE_PROCESSING_START       // Starting to process a specific tile
  DELIVERY_VALIDATION         // Validating deliveries for a tile
  PRODUCT_VALIDATION          // Validating individual products against formula
  PAYMENT_PROCESSING          // Processing payments to teams
  UNSETTLED_HANDLING          // Handling unsettled products
  TILE_PROCESSING_COMPLETE    // Completed processing for a tile
  SETTLEMENT_SUMMARY          // Final settlement summary
  SETTLEMENT_COMPLETED        // Settlement process completed
  SETTLEMENT_ERROR            // Error during settlement
}
```

### 6. MTO Type 1 Settlement

```prisma
model MtoType1Settlement {
  id                           Int       @id @default(autoincrement())
  mtoType1Id                   Int
  tileRequirementId            Int
  deliveryId                   Int
  teamId                       String    // Team uses cuid()

  // Settlement details
  settledInventoryItemIds      String[]  // Validated FacilityInventoryItem IDs
  settledNumber               Int
  unitPrice                   Decimal   @db.Decimal(10, 2)
  totalAmount                 Decimal   @db.Decimal(15, 2)

  // Validation
  formulaValidated            Boolean
  validationErrors            String[]

  // Payment processing
  paymentStatus               PaymentStatus @default(PENDING)
  paymentTransactionId        String?   // Reference to TeamBalanceHistory
  paymentMethod               String    @default("SYSTEM_CREDIT")
  paymentProcessedAt          DateTime?

  // Metadata
  settledAt                   DateTime  @default(now())
  settledBy                   String    @default("SYSTEM")
  notes                       String?

  // Relations
  mtoType1                    ManagerRequirementProductType1 @relation(fields: [mtoType1Id], references: [id])
  tileRequirement             MtoType1TileRequirement @relation(fields: [tileRequirementId], references: [id])
  delivery                    MtoType1Delivery @relation(fields: [deliveryId], references: [id])
  team                        Team      @relation(fields: [teamId], references: [id])

  @@index([mtoType1Id])
  @@index([tileRequirementId])
  @@index([deliveryId])
  @@index([teamId])
  @@index([paymentStatus])
  @@index([settledAt])
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REVERSED
}
```

## Supporting Models (Existing in Platform)

### Manager Product Formula (Reference from manager-product-formula.prisma)

```prisma
model ManagerProductFormula {
  id                           Int       @id @default(autoincrement())
  formulaNumber                Int       // Auto-incremented within activity
  productName                  String    @db.VarChar(200)
  productDescription           String?   @db.VarChar(500)
  activityId                   String

  // Cost components
  totalMaterialCost            Decimal   @db.Decimal(12, 2)
  totalSetupWaterCost          Int
  totalSetupPowerCost          Int
  totalSetupGoldCost           Decimal   @db.Decimal(12, 2)

  // MTO Integration
  isLocked                     Boolean   @default(false)
  lockedAt                     DateTime?
  lockedBy                     String?   // MTO requirement ID

  // Relations
  activity                     Activity  @relation(fields: [activityId], references: [id])
  materials                    ManagerProductFormulaMaterial[]
  craftCategories             ManagerProductFormulaCraftCategory[]
  mtoType1Requirements        ManagerRequirementProductType1[]

  @@unique([formulaNumber, activityId])
  @@index([activityId])
  @@index([isLocked])
}
```

### MapTile (Reference from map.prisma)

```prisma
model MapTile {
  id                           Int       @id @default(autoincrement())
  axialQ                       Int       // Axial coordinate Q (column)
  axialR                       Int       // Axial coordinate R (row)
  landType                     LandType

  // Static configuration
  initialPopulation            Int?      @default(0)
  transportationCostUnit       Decimal?  @db.Decimal(65,3)

  // Template relationship
  templateId                   Int
  template                     MapTemplate @relation(fields: [templateId], references: [id])

  // Relations
  activityStates              ActivityTileState[]
  mtoType1Requirements        MtoType1TileRequirement[]

  @@unique([axialQ, axialR, templateId])
}
```

### ActivityTileState (Reference from map.prisma)

```prisma
model ActivityTileState {
  id                           Int       @id @default(autoincrement())

  // Current dynamic data
  currentPopulation            Int?      @default(0)
  basePopulationA              Int?      // Population after calculation
  populationMultiplier         Decimal?  @db.Decimal(10,4)

  // Relationships
  activityId                   String
  activity                     Activity  @relation(fields: [activityId], references: [id])
  tileId                       Int
  tile                         MapTile   @relation(fields: [tileId], references: [id])

  // Relations
  mtoType1TileRequirements    MtoType1TileRequirement[]

  @@unique([activityId, tileId])
}
```

## Data Integrity Rules

### Constraints

1. **Budget Constraint**: Sum of all tile requirements' budget ≤ overall purchase budget
2. **Quantity Constraint**: Sum of all adjusted requirement numbers ≤ overall purchase number
3. **Time Constraint**: Release time < Settlement time
4. **Population Constraint**: Base count population number > 1
5. **Price Constraint**: Purchase gold price > 0
6. **Delivery Constraint**: Delivered products must match formula specifications

### Cascading Operations

1. **Deletion**: Soft delete with status change to CANCELLED
2. **Update**: Prevent updates after RELEASED status
3. **Settlement**: Atomic transaction for all related records

### Validation Rules

1. **Formula Validation**: Products must strictly match formula components
2. **Timing Validation**: No deliveries accepted after settlement time
3. **Budget Validation**: Cannot exceed allocated tile budget
4. **Quantity Validation**: Cannot deliver more than requirement

## Indexes and Performance

### Primary Indexes
- All ID fields (UUID)
- Activity ID for multi-tenancy
- Time-based fields for scheduling
- Status fields for filtering

### Composite Indexes
```prisma
@@index([mtoType1Id, tileId])
@@index([teamId, settlementStatus])
@@index([releaseTime, status])
@@index([settlementTime, status])
```

### Query Optimization
- Denormalized tile name and team name for display
- Computed fields for quick statistics
- Status enums for efficient filtering
- Pagination support on all list queries

## Migration Considerations

### Initial Setup
```sql
-- Create sequences for auto-increment IDs
-- (Prisma will handle this automatically)

-- Create enum types
CREATE TYPE mto_type1_status AS ENUM ('DRAFT', 'RELEASED', 'IN_PROGRESS', 'SETTLING', 'SETTLED', 'CANCELLED');
CREATE TYPE delivery_settlement_status AS ENUM ('PENDING', 'PARTIALLY_SETTLED', 'FULLY_SETTLED', 'REJECTED', 'RETURNED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REVERSED');
```

### Data Seeding
- Default base count population: 1000
- Default status: DRAFT
- Default payment method: SYSTEM_CREDIT

## Audit and Logging

### Audit Fields
- createdBy: User who created the record
- createdAt: Timestamp of creation
- updatedAt: Last modification timestamp
- settlementCompletedAt: Settlement completion timestamp

### Change Tracking
- All status changes logged
- Financial transactions recorded
- Delivery and settlement history maintained
- Return operations tracked