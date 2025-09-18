# MTO Type 2 Data Model

## Overview

The MTO Type 2 data model implements a competitive marketplace system where teams with MALL facilities submit products with self-determined pricing. The model supports dynamic budget allocation based on MALL tile populations and price-based fulfillment during settlement.

## Entity Relationship Diagram

```
manager_requirement_product_type_2 (1) ----< (n) mto_type_2_submission
                |                                         |
                |                                         |
                v                                         v
    manager_product_formula (1)              mto_type_2_mall_budget (n)
                |                                         |
                |                                         |
                v                                         v
            Products                          mto_type_2_settlement (n)
                                                         |
                                                         v
                                          mto_type_2_calculation_history (n)
```

## Core Entities

### 1. Manager Requirement Product Type 2

The main configuration entity that defines an MTO Type 2 procurement opportunity.

```prisma
model ManagerRequirementProductType2 {
  id                           Int       @id @default(autoincrement())
  activityId                   String
  managerProductFormulaId      Int
  releaseTime                  DateTime
  settlementTime               DateTime
  overallPurchaseBudget        Decimal   @db.Decimal(15, 2)

  // Status management
  status                       MtoType2Status @default(DRAFT)

  // Settlement results
  actualSpentBudget            Decimal?  @db.Decimal(15, 2)
  actualPurchasedNumber        Int?      @default(0)
  totalSubmissions             Int?      @default(0)
  participatingMalls           Int?      @default(0)
  averageUnitPrice             Decimal?  @db.Decimal(10, 2)
  lowestUnitPrice              Decimal?  @db.Decimal(10, 2)
  highestUnitPrice             Decimal?  @db.Decimal(10, 2)

  // Metadata
  createdBy                    String
  createdAt                    DateTime  @default(now())
  updatedAt                    DateTime  @updatedAt
  settlementStartedAt          DateTime?
  settlementCompletedAt        DateTime?

  // Relations
  activity                     Activity  @relation(fields: [activityId], references: [id])
  managerProductFormula        ManagerProductFormula @relation(fields: [managerProductFormulaId], references: [id])
  submissions                  MtoType2Submission[]
  mallBudgets                  MtoType2MallBudget[]
  settlements                  MtoType2Settlement[]
  calculationHistory           MtoType2CalculationHistory[]

  @@index([activityId])
  @@index([releaseTime])
  @@index([settlementTime])
  @@index([status])
  @@index([managerProductFormulaId])
}

enum MtoType2Status {
  DRAFT        // Initial creation, not visible to teams
  RELEASED     // Visible to MALL owners, accepting submissions
  IN_PROGRESS  // Between release and settlement
  SETTLING     // Settlement process running
  SETTLED      // Settlement complete
  CANCELLED    // Cancelled before settlement
}
```

### 2. MTO Type 2 Submission

Records of products submitted by MALL-owning teams with pricing information.

```prisma
model MtoType2Submission {
  id                           Int       @id @default(autoincrement())
  mtoType2Id                   Int
  teamId                       String    // References Team.id (cuid)
  facilityInstanceId           String    // References TileFacilityInstance.id (cuid)

  // Submission details
  productNumber                Int
  unitPrice                    Decimal   @db.Decimal(10, 2)
  totalValue                   Decimal   @db.Decimal(15, 2) // productNumber * unitPrice

  // MALL information
  mallLevel                    Int       // MALL facility level (1-5), denormalized for settlement sorting

  // Location information (denormalized from facility instance)
  mapTileId                    Int
  tileName                     String    // Denormalized for display
  axialQ                       Int       // Hex coordinates from MapTile
  axialR                       Int       // Hex coordinates from MapTile

  // Settlement tracking
  settledNumber                Int       @default(0)
  settledValue                 Decimal   @db.Decimal(15, 2) @default(0)
  unsettledNumber              Int       @default(0) // Updated via trigger: productNumber - settledNumber
  settlementStatus             SubmissionStatus @default(PENDING)
  settlementOrder              Int?      // Order in price-based fulfillment

  // Return handling
  returnRequested              Boolean   @default(false)
  returnFacilityInstanceId     String?   // Target facility instance for returns
  returnTransportationFee      Decimal?  @db.Decimal(10, 2)
  returnCompletedAt            DateTime?

  // Metadata
  submittedAt                  DateTime  @default(now())
  modifiedAt                   DateTime  @updatedAt
  settledAt                    DateTime?

  // Relations
  mtoType2                     ManagerRequirementProductType2 @relation(fields: [mtoType2Id], references: [id])
  team                         Team      @relation(fields: [teamId], references: [id])
  facilityInstance             TileFacilityInstance @relation(fields: [facilityInstanceId], references: [id])
  returnFacilityInstance       TileFacilityInstance? @relation("ReturnFacility", fields: [returnFacilityInstanceId], references: [id])
  settlements                  MtoType2Settlement[]

  @@index([mtoType2Id])
  @@index([teamId])
  @@index([facilityInstanceId])
  @@index([mapTileId])
  @@index([mallLevel])  // For efficient sorting during settlement
  @@index([unitPrice])
  @@index([settlementStatus])
  @@unique([mtoType2Id, teamId, mapTileId]) // One submission per team per tile
}

enum SubmissionStatus {
  PENDING      // Awaiting settlement
  PARTIAL      // Partially settled
  FULL         // Fully settled
  UNSETTLED    // Not settled at all
  RETURNED     // Unsettled products returned
}
```

### 3. MTO Type 2 MALL Budget

Dynamic budget allocation for each tile containing MALL facilities.

```prisma
model MtoType2MallBudget {
  id                           Int       @id @default(autoincrement())
  mtoType2Id                   Int
  mapTileId                    Int

  // Population and calculation
  tilePopulation               Int       // Population at settlement time
  populationRatio              Decimal   @db.Decimal(5, 4) // This tile / total population
  allocatedBudget              Decimal   @db.Decimal(15, 2)

  // MALL information
  mallCount                    Int       // Number of MALLs in this tile
  mallFacilityInstanceIds      String[]  // Array of TileFacilityInstance IDs (cuid)

  // Settlement tracking
  spentBudget                  Decimal   @db.Decimal(15, 2) @default(0)
  remainingBudget              Decimal   @db.Decimal(15, 2)
  purchasedNumber              Int       @default(0)
  processedSubmissions         Int       @default(0)

  // Price analytics
  lowestPricePaid              Decimal?  @db.Decimal(10, 2)
  highestPricePaid             Decimal?  @db.Decimal(10, 2)
  averagePricePaid             Decimal?  @db.Decimal(10, 2)

  // Metadata
  calculatedAt                 DateTime  @default(now())
  settledAt                    DateTime?

  // Relations
  mtoType2                     ManagerRequirementProductType2 @relation(fields: [mtoType2Id], references: [id])
  settlements                  MtoType2Settlement[]

  @@index([mtoType2Id])
  @@index([mapTileId])
  @@unique([mtoType2Id, mapTileId])
}
```

### 4. MTO Type 2 Settlement

Individual settlement transactions recording successful purchases.

```prisma
model MtoType2Settlement {
  id                           Int       @id @default(autoincrement())
  mtoType2Id                   Int
  submissionId                 Int
  mallBudgetId                 Int
  teamId                       String

  // Transaction details
  settledNumber                Int
  unitPrice                    Decimal   @db.Decimal(10, 2)
  totalAmount                  Decimal   @db.Decimal(15, 2)

  // Validation tracking
  formulaValidated             Boolean   @default(false)
  validationDetails            Json?     // Detailed validation results

  // Payment information
  paymentStatus                PaymentStatus @default(PENDING)
  paymentTransactionId         String?
  paymentCompletedAt           DateTime?

  // Metadata
  settlementOrder              Int       // Order of processing
  createdAt                    DateTime  @default(now())

  // Relations
  mtoType2                     ManagerRequirementProductType2 @relation(fields: [mtoType2Id], references: [id])
  submission                   MtoType2Submission @relation(fields: [submissionId], references: [id])
  mallBudget                   MtoType2MallBudget @relation(fields: [mallBudgetId], references: [id])
  team                         Team      @relation(fields: [teamId], references: [id])

  @@index([mtoType2Id])
  @@index([submissionId])
  @@index([mallBudgetId])
  @@index([teamId])
  @@index([paymentStatus])
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REVERSED
}
```

### 5. MTO Type 2 Calculation History

Audit trail for budget distribution calculations and settlement processes.

```prisma
model MtoType2CalculationHistory {
  id                           Int       @id @default(autoincrement())
  mtoType2Id                   Int
  calculationType              CalculationType

  // Calculation inputs
  totalPopulation              Int?      // Sum of all MALL tile populations
  participatingTiles           Int?      // Number of tiles with MALLs
  totalMalls                   Int?      // Total number of MALLs
  overallBudget                Decimal?  @db.Decimal(15, 2)

  // Calculation details
  calculationDetails           Json      // Detailed breakdown per tile
  /*
  Example structure:
  {
    tiles: [
      {
        mapTileId: 1,
        tileName: "Tile A",
        population: 5000,
        mallCount: 2,
        populationRatio: 0.25,
        allocatedBudget: 25000
      },
      ...
    ],
    summary: {
      totalPopulation: 20000,
      totalBudget: 100000,
      averageBudgetPerTile: 25000
    }
  }
  */

  // Settlement summary (for SETTLEMENT type)
  totalSubmissions             Int?
  processedSubmissions         Int?
  totalSettled                 Int?
  totalSpent                   Decimal?  @db.Decimal(15, 2)
  settlementDuration           Int?      // Duration in milliseconds

  // Metadata
  createdAt                    DateTime  @default(now())
  createdBy                    String?   // System or admin user

  // Relations
  mtoType2                     ManagerRequirementProductType2 @relation(fields: [mtoType2Id], references: [id])

  @@index([mtoType2Id])
  @@index([calculationType])
  @@index([createdAt])
}

enum CalculationType {
  BUDGET_DISTRIBUTION  // Initial budget allocation to tiles
  SETTLEMENT_PROCESS   // Settlement execution details
  ADJUSTMENT          // Manual budget adjustments
  CANCELLATION        // Cancellation details
}
```

## Supporting Entities

### 6. MTO Type 2 Price History

Optional entity for tracking price trends and market analysis.

```prisma
model MtoType2PriceHistory {
  id                           Int       @id @default(autoincrement())
  mtoType2Id                   Int
  managerProductFormulaId      Int

  // Price snapshot
  snapshotTime                 DateTime
  submissionCount              Int
  minPrice                     Decimal   @db.Decimal(10, 2)
  maxPrice                     Decimal   @db.Decimal(10, 2)
  avgPrice                     Decimal   @db.Decimal(10, 2)
  medianPrice                  Decimal   @db.Decimal(10, 2)
  priceStdDev                  Decimal   @db.Decimal(10, 4)

  // Market concentration
  topSupplierShare             Decimal   @db.Decimal(5, 4) // Market share of lowest price
  herfindahlIndex              Decimal   @db.Decimal(6, 4) // Market concentration index

  // Metadata
  createdAt                    DateTime  @default(now())

  @@index([mtoType2Id])
  @@index([managerProductFormulaId])
  @@index([snapshotTime])
}
```

## Data Integrity Rules

### Constraints

1. **Unique Submission per MALL**: Each MALL can only submit once per MTO Type 2
2. **Budget Allocation**: Sum of all tile budgets must equal overall budget
3. **Settlement Order**: Must be sequential based on unit price
4. **Population Ratio**: Sum of all population ratios must equal 1.0
5. **Product Number**: Settled number cannot exceed submitted number

### Validation Rules

1. **MALL Verification**: Facility must be type MALL and owned by submitting team
2. **Formula Compliance**: Products must exactly match manager product formula
3. **Time Constraints**: Submissions only accepted between release and settlement times
4. **Price Validation**: Unit price must be positive decimal
5. **Budget Constraints**: Settlement cannot exceed allocated tile budget

### Indexes

Optimized indexes for:
- Price-based sorting during settlement
- MALL facility lookups
- Team submission queries
- Settlement status tracking
- Historical price analysis

## Migration Considerations

### From Type 1 to Type 2

- Different requirement structure (no per-tile requirements)
- Price field addition for competitive bidding
- MALL facility verification requirement
- Dynamic budget allocation mechanism

### Performance Optimization

- Compound indexes for settlement queries
- Denormalized fields for display (tileName)
- JSON fields for detailed calculation storage
- Batch processing support for large settlements

## Sample Queries

### Get eligible MALLs for submission
```sql
SELECT DISTINCT tfi.id, tfi.facility_type, mt.id as tile_id, mt.axial_q, mt.axial_r
FROM tile_facility_instances tfi
JOIN map_tiles mt ON tfi.tile_id = mt.id
WHERE tfi.facility_type = 'MALL'
  AND tfi.team_id = $teamId
  AND tfi.activity_id = $activityId
  AND tfi.status = 'ACTIVE';
```

### Calculate budget distribution
```sql
WITH mall_populations AS (
  SELECT
    mt.id,
    ats.current_population,
    COUNT(DISTINCT tfi.id) as mall_count
  FROM map_tiles mt
  JOIN activity_tile_states ats ON mt.id = ats.tile_id
  JOIN tile_facility_instances tfi ON mt.id = tfi.tile_id
  WHERE tfi.facility_type = 'MALL'
    AND tfi.activity_id = $activityId
    AND tfi.status = 'ACTIVE'
  GROUP BY mt.id, ats.current_population
)
SELECT
  id,
  current_population,
  mall_count,
  current_population::decimal / SUM(current_population) OVER() as population_ratio,
  $overallBudget * (current_population::decimal / SUM(current_population) OVER()) as allocated_budget
FROM mall_populations;
```

### Price-based settlement order
```sql
SELECT
  s.id,
  s.team_id,
  s.unit_price,
  s.product_number,
  mb.allocated_budget,
  ROW_NUMBER() OVER (PARTITION BY s.map_tile_id ORDER BY s.unit_price ASC) as price_rank
FROM mto_type_2_submissions s
JOIN mto_type_2_mall_budgets mb ON s.map_tile_id = mb.map_tile_id
WHERE s.mto_type_2_id = $mtoType2Id
ORDER BY s.map_tile_id, s.unit_price ASC;
```