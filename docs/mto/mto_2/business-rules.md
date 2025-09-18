# MTO Type 2 Business Rules

## Overview

This document defines the comprehensive business rules for MTO Type 2, a MALL-exclusive competitive bidding system where teams with retail facilities compete on price for procurement opportunities.

## 1. Participation Rules

### 1.1 MALL Facility Requirements

**Rule**: Only teams owning MALL facilities can participate in MTO Type 2.

**Validation Process**:
1. Team must have at least one active MALL facility
2. MALL must be in the same activity as the MTO Type 2
3. MALL must have sufficient storage space for submitted products
4. MALL status must be OPERATIONAL (not under construction or disabled)

**Error Conditions**:
- `NO_MALL_FACILITY`: Team has no MALL facilities
- `MALL_WRONG_ACTIVITY`: MALL is in different activity
- `MALL_INSUFFICIENT_SPACE`: Not enough storage for products
- `MALL_NOT_OPERATIONAL`: MALL is not operational

### 1.2 Team Eligibility

**Rule**: Teams must be in active status with valid financial standing.

**Validation**:
- Team status must be ACTIVE
- Team must not be bankrupt or suspended
- Team must have completed onboarding process

## 2. MTO Configuration Rules

### 2.1 Creation and Setup

**Rule**: Managers can create MTO Type 2 with specific parameters.

**Required Parameters**:
- `managerProductFormulaId`: Valid formula defining product specifications
- `releaseTime`: Must be future timestamp
- `settlementTime`: Must be after releaseTime
- `overallPurchaseBudget`: Must be positive decimal

**Validation Rules**:
- Settlement time must be after release time
- Budget must be greater than 0
- Product formula must be active and valid
- **Formula Lock**: Upon MTO creation, the referenced formula is locked
  - Sets `ManagerProductFormula.isLocked = true`
  - Records `lockedAt` timestamp and `lockedBy` = MTO Type 2 ID
  - Formula cannot be modified while locked
  - Unlocked only after MTO reaches SETTLED or CANCELLED status

### 2.2 Status Transitions

**Rule**: MTO Type 2 follows strict status progression.

**Valid Transitions**:
```
DRAFT → RELEASED → IN_PROGRESS → SETTLING → SETTLED
         ↓                           ↓
     CANCELLED                  CANCELLED
```

**Transition Rules**:
- `DRAFT → RELEASED`: Only when current time ≥ releaseTime
- `RELEASED → IN_PROGRESS`: Automatic when first submission received
- `IN_PROGRESS → SETTLING`: Only when current time ≥ settlementTime
- `SETTLING → SETTLED`: Upon successful settlement completion
- `* → CANCELLED`: Only by manager, not allowed after SETTLING

## 3. Submission Rules

### 3.1 Submission Timing

**Rule**: Submissions only accepted between release and settlement times.

**Validation**:
- Current time must be ≥ releaseTime
- Current time must be < settlementTime
- MTO status must be RELEASED or IN_PROGRESS
- **Once submitted, cannot be withdrawn or modified**

### 3.2 Product Requirements

**Rule**: Submitted products must be within MALL facility space.

**Validation Process**:
1. Products must exist in MALL facility inventory
2. Product quantity must be available (not reserved for other purposes)
3. Products must match the manager product formula exactly

### 3.3 Pricing Rules

**Rule**: Teams set unit prices for their submissions.

**Constraints**:
- Unit price must be positive (> 0)
- No maximum price limit
- **Price cannot be changed after submission** (locked permanently)
- Price precision: 2 decimal places

### 3.4 Submission Uniqueness

**Rule**: One submission per team per tile.

**Implementation**:
- Unique constraint on (mtoType2Id, teamId, mapTileId)
- Teams can submit to multiple tiles but only once per tile
- Each tile submission is independent
- Must choose which MALL to use for each tile submission
- **No updates or withdrawals allowed** - submissions are absolutely final
- Once submitted, cannot be modified or cancelled before settlement

### 3.5 Product Formula Validation

**Rule**: Products must exactly match manager product formula.

**Validation Requirements**:
```typescript
// Products must have:
1. Identical craft categories (no more, no less)
2. Exact same raw materials (types and quantities)
3. Correct production process alignment

// Example validation:
formula.craftCategories = ['WOOD', 'METAL']
product.craftCategories = ['WOOD', 'METAL'] ✓
product.craftCategories = ['WOOD'] ✗
product.craftCategories = ['WOOD', 'METAL', 'PLASTIC'] ✗
```

## 4. Budget Distribution Rules

### 4.1 Population-Based Allocation

**Rule**: Budget distributed proportionally based on MALL tile populations.

**Calculation Formula**:
```
For each tile with MALL facilities:
  tile_population = ActivityTileState.currentPopulation
  population_ratio = tile_population / total_population_all_mall_tiles
  allocated_budget = overall_budget * population_ratio
```

### 4.2 Zero Population Handling

**Rule**: Tiles with zero population receive no budget.

**Implementation**:
- If tile population = 0, allocated_budget = 0
- These tiles are excluded from settlement processing
- MALLs in zero-population tiles cannot sell products

**Protection for All-Zero Population**:
- If total population of all MALL tiles = 0, distribute budget evenly
- Each tile receives: overallBudget / numberOfMallTiles
- Ensures budget is always spendable
- Logged as special case in calculation history

### 4.3 Budget Calculation Timing

**Rule**: Budget calculation occurs at settlement time.

**Process**:
1. Lock population values at settlementTime
2. Calculate all tile populations with MALLs
3. Compute budget distribution
4. Store in `mto_type_2_mall_budget` table
5. Proceed with settlement

## 5. Settlement Rules

### 5.1 Settlement Trigger

**Rule**: Settlement begins automatically at settlementTime.

**Process**:
1. Change status to SETTLING
2. Lock all submissions (no new/modified submissions)
3. Calculate budget distribution
4. Execute price-based fulfillment
5. Process payments
6. Update status to SETTLED

### 5.2 MALL Level and Price-Based Fulfillment

**Rule**: Products purchased prioritizing highest MALL levels first, then by ascending price order until budget exhaustion.

**Algorithm per Tile**:
```typescript
function settleTile(tileId: number, allocatedBudget: decimal) {
  // Get all submissions for this tile
  submissions = getSubmissionsForTile(tileId)
    .sortBy('mallLevel', 'DESC')    // Highest MALL level first
    .thenBy('unitPrice', 'ASC')     // Then lowest price
    .thenBy('submittedAt', 'ASC')   // Then earliest submission

  remainingBudget = allocatedBudget

  for (submission of submissions) {
    if (!validateProductFormula(submission)) {
      markAsInvalid(submission)
      continue
    }

    maxPurchasable = floor(remainingBudget / submission.unitPrice)
    purchaseQuantity = min(maxPurchasable, submission.productNumber)

    if (purchaseQuantity > 0) {
      createSettlement(submission, purchaseQuantity)
      remainingBudget -= purchaseQuantity * submission.unitPrice
    }

    if (remainingBudget < lowestRemainingPrice) {
      break
    }
  }
}
```

### 5.3 Partial Fulfillment

**Rule**: Submissions can be partially fulfilled.

**Scenarios**:
- Budget allows for 50 units, submission has 100 → purchase 50
- Remaining budget = 500, unit price = 60 → purchase 8 units (480 total)
- Last submission in budget may be partial

### 5.4 Settlement Priority Rules

**Rule**: Settlement prioritizes higher-level MALLs, then lower prices, then earlier submissions.

**Sorting Order**:
1. Primary: MALL level (descending - highest level first)
2. Secondary: Unit price (ascending - lowest price first)
3. Tertiary: Submission timestamp (earliest first)
4. Quaternary: Submission ID (for absolute determinism)

### 5.5 Formula Validation During Settlement

**Rule**: Each submission validated before purchase.

**Validation Process**:
1. Load manager product formula
2. Check craft categories match exactly
3. Verify raw materials match exactly
4. If validation fails, skip submission
5. Log validation failure for audit

## 6. Payment Rules

### 6.1 Payment Processing

**Rule**: Successful settlements trigger immediate payment.

**Payment Flow**:
1. Calculate total payment (quantity × unitPrice)
2. Credit team account
3. Record transaction ID
4. Update payment status to COMPLETED

### 6.2 Payment Atomicity

**Rule**: Payments are atomic with settlement.

**Implementation**:
- Use database transactions
- If payment fails, rollback settlement
- Retry mechanism for transient failures
- Manual intervention for persistent failures

## 7. Unsettled Product Rules

### 7.1 Identification

**Rule**: Products not purchased during settlement marked as unsettled.

**Calculation**:
```
unsettledNumber = submittedNumber - settledNumber
```

### 7.2 Return Process

**Rule**: Teams can retrieve unsettled products after settlement.

**Process**:
1. Team selects target facility for return
2. **System validates target facility capacity**
3. System calculates transportation fee
4. Team confirms and pays fee
5. Products transferred to target facility
6. Submission marked as RETURNED

**Capacity Validation**:
- Check available space: `targetFacility.capacity - targetFacility.currentInventory`
- If insufficient: `availableSpace < unsettledQuantity`
- Error: "Target facility has insufficient capacity for {quantity} products"
- Team must select different facility or free up space

### 7.3 Return Availability

**Rule**: Unsettled products can be returned at any time after settlement.

**Implementation**:
- No time limit for returns
- Products remain available indefinitely until returned
- Teams can request returns whenever convenient

## 8. Visibility Rules

### 8.1 Pre-Release Visibility

**Rule**: MTO Type 2 not visible before release time.

**Access Levels**:
- Managers: Full visibility always
- MALL owners: No visibility
- Other teams: No visibility

### 8.2 Active Period Visibility

**Rule**: During RELEASED/IN_PROGRESS status.

**MALL Owners Can See**:
- MTO details (formula, budget, timing)
- Their own submissions
- Cannot see other teams' submissions or prices

**Other Teams Can See**:
- Basic MTO information
- Cannot submit or see submissions

### 8.3 Post-Settlement Visibility

**Rule**: After SETTLED status.

**Public Information**:
- Settlement summary statistics
- Average/min/max prices
- Total quantity purchased
- Budget utilization

**Private Information** (team-specific):
- Own settlement details
- Own payment amounts
- Own unsettled products

### 8.4 Price Opacity

**Rule**: Submission prices hidden until settlement.

**Implementation**:
- Prices stored encrypted during submission period
- Decrypted only during settlement process
- Historical prices visible after settlement

## 9. Calculation History Rules

### 9.1 Audit Trail

**Rule**: All calculations must be recorded.

**Required Records**:
- Budget distribution calculations
- Settlement process details
- Price sorting results
- Validation failures

### 9.2 History Retention

**Rule**: History retained for 1 year minimum.

**Archival Process**:
- Active history: Current fiscal year
- Archived history: Previous fiscal years
- Compressed storage for old records

## 10. Edge Cases and Exceptions

### 10.1 No MALL Facilities

**Scenario**: No MALLs exist at settlement time.

**Handling**:
- Settlement proceeds but no purchases made
- MTO marked as SETTLED with zero spending
- Budget remains unspent

### 10.2 All Submissions Invalid

**Scenario**: All submissions fail formula validation.

**Handling**:
- Settlement completes with zero purchases
- Detailed validation failure report generated
- Teams notified of validation failures

### 10.3 Identical Prices

**Scenario**: Multiple submissions with same price.

**Resolution**:
- Earlier submission timestamp takes precedence
- If timestamps identical, lower submission ID wins
- Ensures deterministic ordering

### 10.4 Budget Exactly Divisible

**Scenario**: Remaining budget exactly matches product price.

**Handling**:
```typescript
if (remainingBudget === unitPrice * quantity) {
  // Purchase exactly fills budget
  purchaseAll(quantity)
  remainingBudget = 0
  settlementComplete = true
}
```

### 10.5 System Failure During Settlement

**Scenario**: System crashes during settlement.

**Recovery Process**:
1. Settlement marked as FAILED
2. All partial transactions rolled back
3. Manual intervention required
4. Settlement can be retried
5. Audit log preserves failure details

## 11. Performance Optimization Rules

### 11.1 Batch Processing

**Rule**: Settlements processed in batches for efficiency.

**Batch Sizes**:
- Tiles: Process up to 100 tiles in parallel
- Submissions per tile: Process in chunks of 1000
- Payments: Batch up to 100 transactions

### 11.2 Caching Strategy

**Rule**: Frequently accessed data cached during settlement.

**Cached Items**:
- Product formula details
- Team account information
- Facility locations and distances

## 12. Compliance and Fairness

### 12.1 No Preferential Treatment

**Rule**: All teams treated equally in settlement.

**Enforcement**:
- No team-specific advantages
- No special pricing rules
- Transparent algorithm application

### 12.2 Market Manipulation Prevention

**Rule**: Prevent price manipulation strategies.

**Safeguards**:
- One submission per MALL enforced
- No price changes after submission
- Price opacity until settlement
- Audit trail for investigation