# MTO Type 2 Integration Guide

## Overview

This document details how MTO Type 2 integrates with existing platform systems. MTO Type 2 requires deep integration with facility management, product validation, and financial systems.

## 1. Facility Management Integration

### 1.1 MALL Facility Verification

MTO Type 2 exclusively requires MALL facilities for participation.

#### Integration Points

**Facility Service Interface**:
```typescript
interface FacilityService {
  // Verify MALL ownership
  verifyMallOwnership(teamId: string, facilityInstanceId: string): Promise<boolean>;

  // Get all MALLs for a team
  getTeamMalls(teamId: string, activityId: string): Promise<TileFacilityInstance[]>;

  // Check facility operational status
  isFacilityOperational(facilityInstanceId: string): Promise<boolean>;

  // Get facility capacity
  getFacilityCapacity(facilityInstanceId: string): Promise<FacilityCapacity>;
}
```

**MALL Verification Flow**:
```typescript
async function verifyMallEligibility(
  teamId: string,
  facilityInstanceId: string
): Promise<MallVerificationResult> {
  // Step 1: Verify ownership
  const isOwner = await facilityService.verifyMallOwnership(teamId, facilityInstanceId);
  if (!isOwner) {
    throw new ForbiddenException('Team does not own this MALL');
  }

  // Step 2: Check facility type
  const facilityInstance = await tileFacilityInstanceRepository.findById(facilityInstanceId);
  if (facilityInstance.facilityType !== 'MALL') {
    throw new ValidationException('Facility is not a MALL');
  }

  // Step 3: Verify operational status
  const isOperational = facilityInstance.status === 'ACTIVE';
  if (!isOperational) {
    throw new ValidationException('MALL is not operational');
  }

  // Step 4: Check capacity for products
  const capacity = await facilityService.getFacilityCapacity(facilityInstanceId);

  return {
    eligible: true,
    facilityInstance,
    capacity,
    location: {
      tileId: facilityInstance.tileId,
      coordinates: {
        axialQ: facilityInstance.tile.axialQ,
        axialR: facilityInstance.tile.axialR
      }
    }
  };
}
```

### 1.2 Product Storage Management

Products submitted to MTO Type 2 must be stored within MALL facility.

**Storage Integration**:
```typescript
interface StorageService {
  // Check product availability in facility
  checkProductAvailability(
    facilityInstanceId: string,
    productFormulaId: number,
    quantity: number
  ): Promise<boolean>;

  // Reserve products for MTO submission
  reserveProducts(
    facilityInstanceId: string,
    productFormulaId: number,
    quantity: number,
    reservationId: string
  ): Promise<ReservationResult>;

  // Release reservation (if submission withdrawn)
  releaseReservation(reservationId: string): Promise<void>;

  // Commit reservation (upon settlement)
  commitReservation(reservationId: string): Promise<void>;
}
```

**Reservation Lifecycle**:
1. **Check Availability**: Verify products exist in MALL
2. **Create Reservation**: Lock products for submission
3. **Settlement**: Either commit (sold) or release (unsold)
4. **Return Handling**: Transfer unsold products back

### 1.3 MALL Level Priority System

MALL levels determine settlement priority with higher levels processed first.

**MALL Level Integration**:
```typescript
interface MALLLevelService {
  // Get MALL level for facility
  getMALLLevel(facilityInstanceId: string): Promise<number>;

  // Sort submissions by level and price
  sortSubmissionsForSettlement(
    submissions: MtoSubmission[]
  ): MtoSubmission[];
}

async function sortSubmissionsForSettlement(
  submissions: MtoSubmission[]
): Promise<MtoSubmission[]> {
  // Enrich submissions with MALL levels
  const enrichedSubmissions = await Promise.all(
    submissions.map(async (submission) => ({
      ...submission,
      mallLevel: await getMALLLevel(submission.facilityInstanceId)
    }))
  );

  // Sort by: 1) MALL level (desc), 2) price (asc), 3) timestamp (asc)
  return enrichedSubmissions.sort((a, b) => {
    // First priority: MALL level (highest first)
    if (a.mallLevel !== b.mallLevel) {
      return b.mallLevel - a.mallLevel; // Descending order
    }

    // Second priority: Unit price (lowest first)
    const priceDiff = a.unitPrice - b.unitPrice;
    if (priceDiff !== 0) {
      return priceDiff; // Ascending order
    }

    // Third priority: Submission timestamp (earliest first)
    return a.submittedAt.getTime() - b.submittedAt.getTime();
  });
}
```

**Settlement Priority Rules**:
- Level 5 MALLs are always processed before Level 4
- Level 4 MALLs are always processed before Level 3, etc.
- Within the same level, lowest price wins
- For identical level and price, earliest submission wins

## 2. Product Formula Integration

### 2.1 Formula Validation System

Products must exactly match the manager product formula specification.

**Formula Service Interface**:
```typescript
interface ProductFormulaService {
  // Get formula details
  getFormula(formulaId: number): Promise<ProductFormula>;

  // Validate products against formula
  validateProducts(
    products: Product[],
    formulaId: number
  ): Promise<ValidationResult>;

  // Get formula requirements
  getFormulaRequirements(formulaId: number): Promise<{
    craftCategories: string[];
    rawMaterials: RawMaterial[];
    specifications: ProductSpec[];
  }>;
}
```

**Validation Process**:
```typescript
async function validateSubmissionProducts(
  submission: MtoSubmission,
  formulaId: number
): Promise<ValidationResult> {
  const formula = await productFormulaService.getFormula(formulaId);
  const products = await getProductsFromFacility(
    submission.facilityId,
    submission.productNumber
  );

  // Validate craft categories
  const categoriesValid = validateCraftCategories(
    products,
    formula.craftCategories
  );

  // Validate raw materials
  const materialsValid = validateRawMaterials(
    products,
    formula.rawMaterials
  );

  // Validate specifications
  const specsValid = validateSpecifications(
    products,
    formula.specifications
  );

  return {
    isValid: categoriesValid && materialsValid && specsValid,
    details: {
      craftCategories: categoriesValid,
      rawMaterials: materialsValid,
      specifications: specsValid
    },
    errors: collectValidationErrors(...)
  };
}
```

### 2.2 Formula Matching Algorithm

**Exact Match Requirements**:
```typescript
function validateExactMatch(
  product: Product,
  formula: ProductFormula
): boolean {
  // Craft categories must match exactly (order doesn't matter)
  const categoriesMatch =
    product.craftCategories.length === formula.craftCategories.length &&
    product.craftCategories.every(cat =>
      formula.craftCategories.includes(cat)
    );

  // Raw materials must match exactly
  const materialsMatch =
    product.rawMaterials.length === formula.rawMaterials.length &&
    product.rawMaterials.every(mat =>
      formula.rawMaterials.some(fMat =>
        fMat.type === mat.type &&
        fMat.quantity === mat.quantity
      )
    );

  return categoriesMatch && materialsMatch;
}
```

## 3. Population System Integration

### 3.1 Population Data Access

Budget distribution based on MALL tile populations.

**Population Service Interface**:
```typescript
interface PopulationService {
  // Get current population for a tile
  getTilePopulation(
    tileId: number,
    activityId: string
  ): Promise<number>;

  // Get populations for multiple tiles
  getBatchTilePopulations(
    tileIds: number[],
    activityId: string
  ): Promise<Map<number, number>>;

  // Get population at specific time
  getHistoricalPopulation(
    tileId: number,
    activityId: string,
    timestamp: Date
  ): Promise<number>;
}
```

### 3.2 Budget Distribution Calculation

**Population-Based Allocation**:
```typescript
async function calculateBudgetDistribution(
  mtoType2Id: number,
  overallBudget: number
): Promise<BudgetDistribution[]> {
  // Get all tiles with MALLs
  const mallTiles = await getMallTiles(mtoType2Id);

  // Get populations for all tiles
  const populations = await populationService.getBatchTilePopulations(
    mallTiles.map(t => t.tileId),
    activityId
  );

  // Calculate total population
  const totalPopulation = Array.from(populations.values())
    .reduce((sum, pop) => sum + pop, 0);

  // Distribute budget proportionally (with zero population protection)
  const distributions = mallTiles.map(tile => {
    const tilePopulation = populations.get(tile.tileId) || 0;
    let ratio: number;
    let allocatedBudget: number;

    if (totalPopulation > 0) {
      // Normal case: distribute by population
      ratio = tilePopulation / totalPopulation;
      allocatedBudget = overallBudget * ratio;
    } else {
      // Edge case: all tiles have zero population, distribute evenly
      ratio = 1.0 / mallTiles.length;
      allocatedBudget = overallBudget / mallTiles.length;
    }

    return {
      tileId: tile.tileId,
      tilePopulation,
      populationRatio: ratio,
      allocatedBudget,
      mallCount: tile.mallCount,
      mallFacilityIds: tile.facilityIds
    };
  });

  // Store distribution
  await saveBudgetDistribution(mtoType2Id, distributions);

  return distributions;
}
```

## 4. Team Account Integration

### 4.1 Payment Processing

Successful settlements trigger team payments.

**Account Service Interface**:
```typescript
interface TeamAccountService {
  // Credit team account
  creditAccount(
    teamId: string,
    amount: number,
    reference: string,
    description: string
  ): Promise<TransactionResult>;

  // Debit for transportation fees
  debitAccount(
    teamId: string,
    amount: number,
    reference: string,
    description: string
  ): Promise<TransactionResult>;

  // Check account balance
  getBalance(teamId: string): Promise<number>;

  // Batch transactions
  processBatchTransactions(
    transactions: Transaction[]
  ): Promise<BatchTransactionResult>;
}
```

### 4.2 Settlement Payment Flow

**Payment Processing**:
```typescript
async function processSettlementPayments(
  settlements: Settlement[]
): Promise<PaymentResult[]> {
  const transactions = settlements.map(settlement => ({
    type: 'CREDIT',
    teamId: settlement.teamId,
    amount: settlement.totalAmount,
    reference: `MTO2-SETTLEMENT-${settlement.id}`,
    description: `MTO Type 2 settlement for ${settlement.quantity} units`,
    metadata: {
      mtoType2Id: settlement.mtoType2Id,
      submissionId: settlement.submissionId,
      unitPrice: settlement.unitPrice,
      quantity: settlement.settledNumber
    }
  }));

  // Process batch for efficiency
  const result = await teamAccountService.processBatchTransactions(
    transactions
  );

  // Update settlement payment status
  await updatePaymentStatuses(result);

  return result.transactions;
}
```

## 5. Return System Integration

### 5.1 Product Returns

Unsettled products can be returned to any facility without transportation fees.

**Return Service Interface**:
```typescript
interface ReturnService {
  // Process product return
  processReturn(
    submissionId: number,
    targetFacilityInstanceId: string
  ): Promise<ReturnResult>;

  // Validate facility capacity
  validateTargetCapacity(
    facilityInstanceId: string,
    quantity: number
  ): Promise<boolean>;

  // Transfer products
  transferProducts(
    fromFacilityInstanceId: string,
    toFacilityInstanceId: string,
    products: Product[]
  ): Promise<TransferResult>;
}
```

### 5.2 Return Process Implementation

**Product Return Flow**:
```typescript
async function processProductReturn(
  submissionId: number
): Promise<ReturnResult> {
  const submission = await getSubmission(submissionId);

  // Calculate unsettled quantity
  const unsettledQuantity = submission.productNumber - submission.settledNumber;

  if (unsettledQuantity <= 0) {
    throw new ValidationException('No unsettled products to return');
  }

  // Products automatically return to original MALL facility
  // No capacity validation needed since products originated there
  const originalMall = submission.facilityInstanceId;

  // Transfer products directly back to original MALL (no fees)
  const transfer = await returnService.transferProducts(
    submission.facilityInstanceId,
    originalMall, // Same as source - returns to original location
    products
  );

  // Update submission status
  await updateSubmissionReturn(submissionId, {
    returnRequested: true,
    returnFacilityInstanceId: originalMall,
    returnCompletedAt: new Date()
  });

  return {
    submissionId,
    unsettledQuantity,
    originalMall,
    returnStatus: 'COMPLETED'
  };
}
```

## 6. Activity System Integration

### 6.1 Activity Context

MTO Type 2 operates within activity boundaries.

**Activity Service Interface**:
```typescript
interface ActivityService {
  // Get activity details
  getActivity(activityId: string): Promise<Activity>;

  // Check if activity is active
  isActivityActive(activityId: string): Promise<boolean>;

  // Get activity time settings
  getActivityTimeSettings(activityId: string): Promise<{
    currentFiscalYear: number;
    currentQuarter: number;
    timeMultiplier: number;
  }>;

  // Get teams in activity
  getActivityTeams(activityId: string): Promise<Team[]>;
}
```

### 7.2 Activity Validation

**Activity Context Validation**:
```typescript
async function validateActivityContext(
  mtoType2: MtoType2Create
): Promise<void> {
  // Verify activity exists and is active
  const isActive = await activityService.isActivityActive(
    mtoType2.activityId
  );

  if (!isActive) {
    throw new ValidationException('Activity is not active');
  }

  // Check timing within activity bounds
  const timeSettings = await activityService.getActivityTimeSettings(
    mtoType2.activityId
  );

  // Validate MTO timing fits within fiscal year
  validateTimingConstraints(
    mtoType2.releaseTime,
    mtoType2.settlementTime,
    timeSettings
  );
}
```

## 8. Monitoring & Metrics Integration

### 8.1 Performance Metrics

**Metrics Service Interface**:
```typescript
interface MetricsService {
  // Record metric
  recordMetric(
    name: string,
    value: number,
    tags: Record<string, string>
  ): void;

  // Record timing
  recordTiming(
    name: string,
    duration: number,
    tags: Record<string, string>
  ): void;
}
```

### 8.2 Key Metrics Tracking

**Settlement Performance Metrics**:
```typescript
async function trackSettlementMetrics(
  settlementResult: SettlementResult
): Promise<void> {
  // Settlement duration
  metricsService.recordTiming(
    'mto_type2.settlement.duration',
    settlementResult.duration,
    {
      mtoType2Id: settlementResult.mtoType2Id.toString(),
      submissionCount: settlementResult.totalSubmissions.toString()
    }
  );

  // Budget utilization
  metricsService.recordMetric(
    'mto_type2.budget.utilization',
    settlementResult.budgetUtilization,
    {
      mtoType2Id: settlementResult.mtoType2Id.toString()
    }
  );

  // Price metrics
  metricsService.recordMetric(
    'mto_type2.price.average',
    settlementResult.averagePrice,
    {
      formulaId: settlementResult.formulaId.toString()
    }
  );
}
```

## 9. Audit & Compliance Integration

### 9.1 Audit Logging

All significant actions must be logged for compliance.

**Audit Service Interface**:
```typescript
interface AuditService {
  // Log action
  logAction(
    action: string,
    entityType: string,
    entityId: string,
    userId: string,
    details: object
  ): Promise<void>;

  // Log financial transaction
  logFinancialTransaction(
    transaction: FinancialAuditLog
  ): Promise<void>;
}
```

### 9.2 Audit Implementation

**Comprehensive Audit Trail**:
```typescript
async function auditMtoType2Settlement(
  settlement: Settlement
): Promise<void> {
  // Log settlement action
  await auditService.logAction(
    'SETTLEMENT_PROCESSED',
    'MTO_TYPE_2',
    settlement.mtoType2Id.toString(),
    'SYSTEM',
    {
      submissionId: settlement.submissionId,
      teamId: settlement.teamId,
      quantity: settlement.settledNumber,
      amount: settlement.totalAmount,
      unitPrice: settlement.unitPrice
    }
  );

  // Log financial transaction
  await auditService.logFinancialTransaction({
    transactionType: 'MTO_TYPE_2_PAYMENT',
    amount: settlement.totalAmount,
    fromAccount: 'SYSTEM',
    toAccount: settlement.teamId,
    reference: `MTO2-${settlement.id}`,
    timestamp: new Date()
  });
}
```

## 10. Error Recovery Integration

### 10.1 Transaction Rollback

Failed settlements must be properly rolled back.

**Transaction Manager Interface**:
```typescript
interface TransactionManager {
  // Start transaction
  beginTransaction(): Promise<Transaction>;

  // Commit transaction
  commit(transaction: Transaction): Promise<void>;

  // Rollback transaction
  rollback(transaction: Transaction): Promise<void>;
}
```

### 10.2 Settlement Recovery

**Failure Recovery Process**:
```typescript
async function settlementWithRecovery(
  mtoType2Id: number
): Promise<void> {
  const transaction = await transactionManager.beginTransaction();

  try {
    // Lock MTO Type 2
    await lockMtoType2(mtoType2Id, transaction);

    // Calculate budget distribution
    const distribution = await calculateBudgetDistribution(
      mtoType2Id,
      transaction
    );

    // Process settlements
    const settlements = await processSettlements(
      mtoType2Id,
      distribution,
      transaction
    );

    // Process payments
    await processPayments(settlements, transaction);

    // Commit transaction
    await transactionManager.commit(transaction);

  } catch (error) {
    // Rollback all changes
    await transactionManager.rollback(transaction);

    // Log failure
    await logSettlementFailure(mtoType2Id, error);

    // Log settlement failure for audit
    await logSettlementFailure(mtoType2Id, error);

    throw error;
  }
}
```

## 11. Scheduler & Automation Integration

### 11.1 Automated Scheduler Service

MTO Type 2 integrates with NestJS Schedule module for automatic release and settlement.

**Scheduler Service Implementation**:
```typescript
@Injectable()
export class MtoSchedulerService {
  private readonly logger = new Logger(MtoSchedulerService.name);

  constructor(
    private readonly mtoType2Service: MtoType2Service,
    private readonly mtoType2Repository: MtoType2Repository,
  ) {}

  /**
   * Check for MTO Type 2 releases and settlements every minute
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async checkMtoType2Tasks() {
    try {
      await this.checkMtoType2Releases();
      await this.checkMtoType2Settlements();
    } catch (error) {
      this.logger.error('Error in MTO Type 2 scheduler:', error);
    }
  }

  private async checkMtoType2Releases() {
    const now = new Date();
    const mtoType2sToRelease = await this.mtoType2Repository.findMany({
      where: {
        status: MtoType2Status.DRAFT,
        releaseTime: { lte: now },
      },
    });

    for (const mtoType2 of mtoType2sToRelease) {
      try {
        await this.mtoType2Service.release(mtoType2.id);
        this.logger.log(
          `MTO Type 2 ${mtoType2.id} released automatically at ${now.toISOString()}`
        );
      } catch (error) {
        this.logger.error(`Failed to release MTO Type 2 ${mtoType2.id}:`, error);
      }
    }
  }

  private async checkMtoType2Settlements() {
    const now = new Date();
    const mtoType2sToSettle = await this.mtoType2Repository.findMany({
      where: {
        status: {
          in: [MtoType2Status.RELEASED, MtoType2Status.IN_PROGRESS],
        },
        settlementTime: { lte: now },
      },
    });

    for (const mtoType2 of mtoType2sToSettle) {
      try {
        // Call settle with auto=true for automatic settlement
        await this.mtoType2Service.settle(mtoType2.id, true);
        this.logger.log(
          `MTO Type 2 ${mtoType2.id} settled automatically at ${now.toISOString()}`
        );
      } catch (error) {
        this.logger.error(`Failed to settle MTO Type 2 ${mtoType2.id}:`, error);

        // Rollback to IN_PROGRESS for retry in next cycle
        try {
          await this.mtoType2Repository.updateStatus(
            mtoType2.id,
            MtoType2Status.IN_PROGRESS
          );
        } catch (rollbackError) {
          this.logger.error(
            `Failed to rollback MTO Type 2 ${mtoType2.id} status:`,
            rollbackError
          );
        }
      }
    }
  }
}
```

### 11.2 Automation Features

**Key Automation Behaviors**:

1. **Automatic Status Transitions**:
   - DRAFT → RELEASED: At releaseTime
   - RELEASED → IN_PROGRESS: On first submission
   - IN_PROGRESS → SETTLING: At settlementTime
   - SETTLING → SETTLED: Upon successful settlement
   - Error → IN_PROGRESS: On settlement failure (retry enabled)

2. **Dynamic Budget Allocation**:
   - Calculated at settlement time based on current population
   - Special handling for zero-population tiles (equal distribution)
   - Budget records created/updated automatically

3. **Settlement Process**:
   - Validates product formulas against manager requirements
   - Sorts submissions by price (lowest first)
   - Processes payments atomically
   - Creates settlement history for audit

4. **Error Recovery**:
   - Failed settlements automatically retry in next scheduler cycle
   - Status rollback to IN_PROGRESS on failure
   - Comprehensive logging for troubleshooting
   - No data loss on partial failures

### 11.3 Module Configuration

**Schedule Module Setup**:
```typescript
@Module({
  imports: [
    ScheduleModule.forRoot(),
    // other imports...
  ],
  providers: [
    MtoSchedulerService,
    MtoType2Service,
    // other providers...
  ],
})
export class MtoModule {}
```

### 11.4 Automation Monitoring

**Health Check Implementation**:
```typescript
@Cron(CronExpression.EVERY_HOUR)
async healthCheck() {
  this.logger.log('MTO Scheduler Service is running - Health check passed');
}
```

**Key Metrics to Monitor**:
- Scheduler execution frequency
- Release/settlement success rates
- Average settlement processing time
- Failed settlement retry counts
- Budget utilization rates

### 11.5 Manual Override Capabilities

While automation handles normal flow, manual interventions are supported:

```typescript
// Manual release (bypasses time check)
await mtoType2Service.release(mtoId);

// Manual settlement with override
await mtoType2Service.settle(mtoId, false); // auto=false for manual

// Force status update
await mtoType2Repository.updateStatus(mtoId, MtoType2Status.SETTLED);
```

## 12. Integration Testing

### 12.1 Test Scenarios

**Critical Integration Tests**:

1. **MALL Verification Test**
   - Create team with MALL
   - Verify eligibility
   - Submit to MTO Type 2
   - Verify submission accepted

2. **Formula Validation Test**
   - Create products matching formula
   - Create products not matching formula
   - Verify only matching products accepted

3. **Budget Distribution Test**
   - Set up tiles with different populations
   - Calculate distribution
   - Verify proportional allocation

4. **Settlement Integration Test**
   - Create multiple submissions
   - Run settlement
   - Verify payments processed
   - Verify products transferred

5. **Return Flow Test**
   - Create unsettled products
   - Request return
   - Verify transportation fee charged
   - Verify products returned

### 12.2 Integration Test Framework

```typescript
describe('MTO Type 2 Integration', () => {
  it('should complete full lifecycle', async () => {
    // Setup
    const team = await createTeamWithMall();
    const mto = await createMtoType2();

    // Submit
    const submission = await submitToMto(team, mto);

    // Settlement
    await runSettlement(mto);

    // Verify payment
    const balance = await getTeamBalance(team);
    expect(balance).toBeGreaterThan(0);

    // Return unsettled
    const returnResult = await requestReturn(submission);
    expect(returnResult.success).toBe(true);
  });
});
```

## 13. Migration & Deployment

### 13.1 System Dependencies

**Required Systems for MTO Type 2**:
- Facility Management System (v2.0+)
- Product Formula System (v1.5+)
- Team Account System (v3.0+)
- Transportation System (v1.2+)
- Population System (v2.1+)
- Scheduler Module (NestJS Schedule)

### 13.2 Deployment Checklist

- [ ] Verify all dependent services are running
- [ ] Run database migrations
- [ ] Seed initial test data
- [ ] Verify MALL facility queries
- [ ] Test formula validation endpoints
- [ ] Confirm payment processing
- [ ] Validate system events
- [ ] Check monitoring metrics
- [ ] Run integration test suite
- [ ] Verify audit logging
- [ ] Confirm scheduler is running (check logs for health check)
- [ ] Verify automatic release at configured times
- [ ] Test automatic settlement triggers
- [ ] Validate error recovery mechanisms

## Appendix: Service Contracts

### Complete Service Registry

```typescript
interface MtoType2ServiceRegistry {
  facilityService: FacilityService;
  productFormulaService: ProductFormulaService;
  populationService: PopulationService;
  teamAccountService: TeamAccountService;
  transportationService: TransportationService;
  activityService: ActivityService;
  metricsService: MetricsService;
  auditService: AuditService;
  transactionManager: TransactionManager;
}
```