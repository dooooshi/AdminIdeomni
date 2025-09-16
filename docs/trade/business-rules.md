# Trade Business Rules

## Ultra-Simple Rules

### Trade Creation
- Items must be from **SAME facility**
- Can select **multiple items**
- Set **one total price** for all items
- Choose **target team**

### Trade Acceptance
- Receiver **chooses destination inventory** (FacilitySpaceInventory)
- Receiver **pays everything**: items + transport
- Transport cost **calculated using TransportationCostService**
  - Uses existing `calculateCost()` method from `src/transportation/services/transportation-cost.service.ts`
  - Requires source/dest inventory IDs, not facility IDs
  - Factors in distance, transport configuration, and item space requirements
- **Instant delivery** to chosen inventory

### Core Validations

#### For Sender
```typescript
// Teams must be in same activity
if (senderTeam.activityId !== targetTeam.activityId) {
  throw new Error("Teams must be in same activity");
}

// All items from same inventory (same facility)
if (!allItemsFromSameInventory) {
  throw new Error("All items must be from same facility inventory");
}

// Has enough inventory
if (item.quantity > available) {
  throw new Error("Insufficient inventory");
}
```

#### For Receiver
```typescript
// Has enough gold (items + transport)
const totalCost = trade.totalPrice + transportCost;
if (totalCost > receiverTeamAccount.gold) {
  throw new Error("Insufficient gold");
}

// Has enough space in destination inventory
if (totalSpace > destinationInventory.availableSpace) {
  throw new Error("Insufficient space");
}
```

## Payment Flow

```
Receiver pays: Items Price + Transport Cost
                    ↓              ↓
Sender receives: Items Price      [System handles transport]
```

## Status Flow

```
PENDING → ACCEPTED → COMPLETED
        ↘ REJECTED
        ↘ CANCELLED
```

## Atomic Execution with History Tracking

When trade is accepted:
1. Calculate transport cost using `TransportationCostService.calculateCost(sourceInventoryId, destInventoryId, inventoryItemId, quantity, teamId)`
2. Lock resources in transaction
3. Create TransportationOrder for item transfer
4. Transfer items to receiver's chosen inventory
5. Deduct gold from receiver TeamAccount (items + transport)
6. Add gold to sender TeamAccount (items only)
7. Create transaction record
8. **Create TradeHistory entries for status changes**
9. **Create TeamOperationHistory for financial movements**
10. **Create TeamBalanceHistory for balance snapshots**

All in one transaction - rollback if any step fails.

## History Tracking Requirements

### Mandatory History Records

#### TradeHistory
Must be created for every trade state change:
- **CREATED**: When trade offer is created
- **PREVIEWED**: When receiver previews (optional tracking)
- **ACCEPTED**: When receiver accepts
- **REJECTED**: When receiver rejects
- **CANCELLED**: When sender cancels
- **COMPLETED**: When trade execution succeeds
- **FAILED**: When trade execution fails

#### TeamOperationHistory
Must be created for every financial movement:
- **TRADE_PURCHASE**: Buyer's total payment (items + transport)
- **TRADE_SALE**: Seller's income (items only)
- **TRANSPORTATION_EXPENSE**: Transport cost (can be tracked separately)

#### TeamBalanceHistory
Must be created after each operation:
- Links to TeamOperationHistory via operationId
- Records balance snapshot and change amounts
- Tracks both gold and carbon (even if carbon unchanged)

### History Data Requirements

```typescript
// Minimum required fields for TradeHistory
{
  tradeOrderId: string,
  operation: TradeOperation,
  previousStatus?: TradeStatus,
  newStatus: TradeStatus,
  actorId: string,        // User who performed action
  actorTeamId: string,    // Team of the actor
  description: string,    // Human-readable description
  metadata?: {            // Additional context
    transportCost?: number,
    destinationInventoryId?: string,
    rejectionReason?: string,
    failureDetails?: any
  }
}

// Minimum required fields for TeamOperationHistory
{
  teamId: string,
  userId: string,
  operationType: TeamOperationType,
  amount: Decimal,
  resourceType: 'GOLD' | 'CARBON',
  targetTeamId?: string,     // For purchases (seller)
  sourceTeamId?: string,     // For sales (buyer)
  balanceBefore: Decimal,
  balanceAfter: Decimal,
  description: string,
  metadata?: {
    tradeOrderId: string,
    itemsCost?: number,
    transportCost?: number,
    items?: any[]
  }
}
```

### Audit Trail Compliance

All history records must:
1. Be immutable (no updates allowed)
2. Include timestamp (createdAt)
3. Include actor information (userId and teamId)
4. Provide human-readable descriptions
5. Store relevant metadata for investigation

## History Tracking Benefits

### Audit & Compliance
- Complete trail of all trade actions
- Actor identification for every operation
- Timestamp tracking for all events
- Immutable history records

### Financial Reconciliation
- Track all gold movements
- Separate item costs from transport costs
- Balance snapshots before/after each operation
- Link operations to specific trades

### Analytics & Reporting
With proper history tracking, teams can:

1. **Track Trade Volume**: Query all TRADE_PURCHASE and TRADE_SALE operations
2. **Analyze Transport Costs**: Separate transport costs from item costs
3. **Team Trade Balance**: Calculate net trade income/expense
4. **Trade Activity Reports**: Track trade frequency and patterns
5. **Audit Trail**: Complete history of all trade-related financial movements

### Example Queries for Reports

```sql
-- Total trade volume by team
SELECT
  team_id,
  SUM(CASE WHEN operation_type = 'TRADE_SALE' THEN amount ELSE 0 END) as total_sales,
  SUM(CASE WHEN operation_type = 'TRADE_PURCHASE' THEN amount ELSE 0 END) as total_purchases,
  COUNT(CASE WHEN operation_type = 'TRADE_SALE' THEN 1 END) as sale_count,
  COUNT(CASE WHEN operation_type = 'TRADE_PURCHASE' THEN 1 END) as purchase_count
FROM team_operation_history
WHERE operation_type IN ('TRADE_SALE', 'TRADE_PURCHASE')
GROUP BY team_id;

-- Transport costs by team
SELECT
  team_id,
  SUM(amount) as total_transport_costs,
  COUNT(*) as transport_count
FROM team_operation_history
WHERE operation_type = 'TRANSPORTATION_EXPENSE'
  AND metadata->>'tradeOrderId' IS NOT NULL
GROUP BY team_id;

-- Trade success rate
SELECT
  sender_team_id,
  COUNT(*) as total_trades,
  SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
  AVG(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) * 100 as success_rate
FROM trade_orders
GROUP BY sender_team_id;
```

## Simple Example

1. **Team A creates trade:**
   - 100 Iron Ore + 50 Coal
   - Price: 5000 gold
   - Target: Team B

2. **Team B previews:**
   - Items: 5000 gold
   - Transport: 1000 gold (calculated via TransportationCostService)
   - Total: 6000 gold

3. **Team B accepts:**
   - Pays: 6000 gold
   - Receives: items at chosen facility
   - Team A receives: 5000 gold

## Key Points

- **NO transport payment options** - receiver always pays
- **NO individual item pricing** - one total price
- **NO negotiation** - accept or reject only
- **Simple validation** - inventory, gold, space
- **Instant execution** - no delays