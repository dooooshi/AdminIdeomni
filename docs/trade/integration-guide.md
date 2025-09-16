# Trade Integration Guide

## Overview

Ultra-simple trade system where sender offers items, receiver pays everything.

## Key Integration Points

### 1. Facility Inventory
- Read items from ONE FacilitySpaceInventory (same facility)
- Transfer items via TransportationOrder on acceptance
- Links with existing FacilityInventoryItem and FacilitySpaceInventory models

### 2. Transportation
- Uses existing TransportationCostService.calculateCost() method
- Integrates with TransportationModule from `src/transportation/`
- Receiver pays all transport costs

### 3. Teams
- Validate same activity between sender and receiver
- Transfer gold between TeamAccount entities
- Integrates with existing TeamAccount model (gold field)

## Complete Trade Flow

### Step-by-Step Trade Process

#### 1. Sender Creates Trade
```typescript
// Step 1: Get available teams to trade with
const availableTeams = await fetch('/api/trades/available-teams');
// Returns list of teams in same activity

// Step 2: Select items from one of your facilities
// (items must be from SAME facility)

// Step 3: Create the trade offer
const trade = await fetch('/api/trades', {
  method: 'POST',
  body: JSON.stringify({
    targetTeamId: selectedTeamId,
    sourceFacilityId: facilityId,
    sourceInventoryId: inventoryId,
    items: selectedItems,
    totalPrice: 5000,
    message: 'Selling iron and coal'
  })
});
```

#### 2. Receiver Reviews Trade
```typescript
// Step 1: List incoming trades
const trades = await fetch('/api/trades?type=incoming');

// Step 2: Get trade details
const tradeDetails = await fetch(`/api/trades/${tradeId}`);

// Step 3: Get available destination facilities
const destinations = await fetch('/api/trades/available-destinations');
// Returns list of your facilities with available space

// Step 4: Preview trade with selected destination
const preview = await fetch(`/api/trades/${tradeId}/preview`, {
  method: 'POST',
  body: JSON.stringify({
    destinationInventoryId: selectedDestinationId
  })
});
// Shows transport cost calculation
```

#### 3. Receiver Accepts Trade
```typescript
// Accept the trade with chosen destination
const result = await fetch(`/api/trades/${tradeId}/accept`, {
  method: 'POST',
  body: JSON.stringify({
    destinationInventoryId: selectedDestinationId
  })
});
// Executes transfer: receiver pays all, seller gets item price
```

## Simple Trade Flow with History Tracking

```typescript
async executeTrade(tradeId: string, destInventoryId: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    // 1. Get trade with all relations
    const trade = await getTrade(tx, tradeId);
    const senderTeam = await getTeam(tx, trade.senderTeamId);
    const receiverTeam = await getTeam(tx, trade.targetTeamId);

    // 2. Validate same activity
    if (senderTeam.activityId !== receiverTeam.activityId) {
      throw new Error('Teams must be in same activity');
    }

    // 3. Calculate TOTAL space for ALL items combined
    const totalSpaceUnits = trade.items.reduce((sum, item) => {
      return sum.add(item.quantity.mul(item.unitSpace));
    }, new Decimal(0));

    // 4. Calculate transport cost for TOTAL combined shipment
    // TransportationCostService should calculate for all items as single shipment
    const transportCalc = await this.transportationCostService.calculateCost(
      trade.items[0].sourceInventoryId, // All items from same inventory
      destInventoryId,
      totalSpaceUnits, // Total space for all items combined
      receiverTeam.id
    );
    const transportCost = transportCalc.cheapestTier.totalCost;

    // 5. Validate receiver funds and space
    const totalCost = trade.totalPrice.add(transportCost);
    const receiverAccount = await tx.teamAccount.findUnique({ where: { teamId: receiverTeam.id } });
    if (receiverAccount.gold.lessThan(totalCost)) {
      throw new Error('Insufficient gold');
    }

    const destInventory = await tx.facilitySpaceInventory.findUnique({ where: { id: destInventoryId } });
    if (destInventory.availableSpace.lessThan(totalSpaceUnits)) {
      throw new Error('Insufficient space');
    }

    // 6. Track balances before transfer
    const senderAccount = await tx.teamAccount.findUnique({ where: { teamId: senderTeam.id } });
    const receiverBalanceBefore = receiverAccount.gold;
    const senderBalanceBefore = senderAccount.gold;

    // 7. Execute transfers
    // Get active transport configuration
    const transportConfig = await tx.transportationConfig.findFirst({
      where: {
        templateId: activity.mapTemplateId,
        isActive: true  // Important: Only use active configs
      }
    });

    // Create TransportationOrder for EACH item with proportional costs
    const transportationOrderIds = [];
    for (const item of trade.items) {
      const itemSpaceRatio = item.quantity.mul(item.unitSpace).div(totalSpaceUnits);
      const itemTransportCost = transportCost.mul(itemSpaceRatio);
      const itemCarbonEmission = transportCalc.cheapestTier.carbonEmission.mul(itemSpaceRatio);

      const transportOrder = await tx.transportationOrder.create({
        data: {
          configId: transportConfig.id,
          sourceInventoryId: item.sourceInventoryId,
          destInventoryId,
          inventoryItemId: item.inventoryItemId,
          quantity: item.quantity,
          unitSpaceOccupied: item.unitSpace,
          totalSpaceTransferred: item.quantity.mul(item.unitSpace),
          tier: transportCalc.cheapestTier.tier,
          hexDistance: transportCalc.hexDistance,
          transportCostUnits: transportCalc.transportCostUnits, // From path calculation
          totalGoldCost: itemTransportCost,  // Proportional to space
          totalCarbonEmission: itemCarbonEmission,  // Proportional to space
          // ... other fields
        }
      });
      transportationOrderIds.push(transportOrder.id);
    }

    // Transfer gold between TeamAccount entities
    await tx.teamAccount.update({
      where: { teamId: receiverTeam.id },
      data: { gold: { decrement: totalCost } }
    });

    await tx.teamAccount.update({
      where: { teamId: senderTeam.id },
      data: { gold: { increment: trade.totalPrice } }
    });

    // 8. Create history tracking records
    // Trade history
    await tx.tradeHistory.create({
      data: {
        tradeOrderId: tradeId,
        operation: 'ACCEPTED',
        previousStatus: 'PENDING',
        newStatus: 'ACCEPTED',
        actorId: userId,
        actorTeamId: receiverTeam.id,
        description: 'Trade accepted',
        metadata: {
          destinationInventoryId: destInventoryId,
          transportCost,
          totalCost
        }
      }
    });

    // Buyer's operation history
    const buyerOp = await tx.teamOperationHistory.create({
      data: {
        teamId: receiverTeam.id,
        userId: userId,
        operationType: 'TRADE_PURCHASE',
        amount: totalCost,
        resourceType: 'GOLD',
        targetTeamId: senderTeam.id,
        balanceBefore: receiverBalanceBefore,
        balanceAfter: receiverBalanceBefore - totalCost,
        description: `Trade purchase from ${senderTeam.name}`,
        metadata: {
          tradeOrderId: tradeId,
          itemsCost: trade.totalPrice,
          transportCost: transportCost,
          items: trade.items
        }
      }
    });

    // Seller's operation history
    const sellerOp = await tx.teamOperationHistory.create({
      data: {
        teamId: senderTeam.id,
        userId: userId,
        operationType: 'TRADE_SALE',
        amount: trade.totalPrice,
        resourceType: 'GOLD',
        sourceTeamId: receiverTeam.id,
        balanceBefore: senderBalanceBefore,
        balanceAfter: senderBalanceBefore + trade.totalPrice,
        description: `Trade sale to ${receiverTeam.name}`,
        metadata: {
          tradeOrderId: tradeId,
          items: trade.items
        }
      }
    });

    // Balance history for buyer
    await tx.teamBalanceHistory.create({
      data: {
        teamId: receiverTeam.id,
        goldBalance: receiverBalanceBefore - totalCost,
        carbonBalance: receiverAccount.carbon,
        goldChange: -totalCost,
        carbonChange: 0,
        operationId: buyerOp.id
      }
    });

    // Balance history for seller
    await tx.teamBalanceHistory.create({
      data: {
        teamId: senderTeam.id,
        goldBalance: senderBalanceBefore + trade.totalPrice,
        carbonBalance: senderAccount.carbon,
        goldChange: trade.totalPrice,
        carbonChange: 0,
        operationId: sellerOp.id
      }
    });

    // 9. Complete trade
    await updateStatus(tx, tradeId, 'COMPLETED');

    // Final trade history entry
    await tx.tradeHistory.create({
      data: {
        tradeOrderId: tradeId,
        operation: 'COMPLETED',
        previousStatus: 'ACCEPTED',
        newStatus: 'COMPLETED',
        actorId: userId,
        actorTeamId: receiverTeam.id,
        description: 'Trade executed successfully',
        metadata: {
          transactionId: transaction.id,
          transportationOrderId: transportOrder.id
        }
      }
    });

    return createTransaction(tx, trade, transportCost, transportOrder.id);
  });
}
```

## Transport Cost Calculation Method

### Combined Shipment Principle
All items in a trade are shipped together as ONE combined shipment:

```typescript
// CORRECT: Calculate total space for all items
const totalSpaceUnits = trade.items.reduce((sum, item) => {
  return sum.add(item.quantity.mul(item.unitSpace));
}, new Decimal(0));

// Calculate cost for combined shipment
const transportCalc = await transportationCostService.calculateCost(
  sourceInventoryId,
  destInventoryId,
  totalSpaceUnits,  // Total space, not individual items
  teamId
);
```

### Cost Distribution
Transport costs are distributed proportionally by space occupied:

```typescript
// Each item pays proportional to its space usage
for (const item of trade.items) {
  const itemSpaceRatio = item.quantity.mul(item.unitSpace).div(totalSpaceUnits);
  const itemTransportCost = totalTransportCost.mul(itemSpaceRatio);
  const itemCarbonEmission = totalCarbonEmission.mul(itemSpaceRatio);

  // Create TransportationOrder with proportional costs
  await createTransportOrder({
    totalGoldCost: itemTransportCost,  // NOT divided equally
    totalCarbonEmission: itemCarbonEmission
  });
}
```

## Service Methods

```typescript
class TradeService {
  // Create trade (sender)
  async createTrade(data: CreateTradeDto) {
    // Validate all items from same FacilitySpaceInventory
    // Validate teams in same activity
    // Check facility category is RAW_MATERIAL_PRODUCTION or FUNCTIONAL
    // Create trade with PENDING status
    // No transport options - receiver always pays
  }

  // Preview trade (receiver)
  async previewTrade(tradeId: string, destInventoryId: string) {
    // Calculate TOTAL space for all items combined
    // Calculate transport cost via TransportationCostService.calculateCost(
    //   sourceInventoryId, destInventoryId, totalSpaceUnits, teamId
    // )
    // Check TeamAccount gold balance
    // Return total: items + transport
  }

  // Accept trade (receiver)
  async acceptTrade(tradeId: string, destInventoryId: string) {
    // Execute in transaction
    // Verify TransportationConfig is active
    // Create TransportationOrder for EACH item with proportional costs
    // Update TeamAccount balances
    // Receiver pays all
    // Instant delivery to inventory
  }
}
```

## Database Operations

### Gold Transfer
```typescript
// Receiver pays everything (from TeamAccount)
await tx.teamAccount.update({
  where: { teamId: receiverTeamId },
  data: { gold: { decrement: itemsCost + transportCost } }
});

// Seller receives items price only (to TeamAccount)
await tx.teamAccount.update({
  where: { teamId: sellerTeamId },
  data: { gold: { increment: itemsCost } }
});
```

### Item Transfer
```typescript
// Move items via TransportationService to receiver's chosen inventory
const transportOrder = await this.transportationService.createOrder(tx, {
  sourceInventoryId: trade.items[0].sourceInventoryId,
  destInventoryId,
  items: trade.items,
  teamId: receiverTeam.id
});

// Items are transferred via the transportation system
await this.transportationService.executeTransfer(tx, transportOrder.id);
```

## Validation

```typescript
// Sender validation
validateSameActivity(senderTeam, targetTeam);
validateSameInventory(items); // All from same FacilitySpaceInventory
validateInventoryQuantity(items);

// Receiver validation
validateFunds(receiverTeamAccount, itemsCost + transportCost); // Check TeamAccount.gold
validateSpace(destinationInventory, totalSpace); // Check FacilitySpaceInventory.availableSpace
```

## History Tracking Features

### Trade History
Every trade operation is tracked in TradeHistory:
- **CREATE**: When trade offer is created
- **PREVIEW**: When receiver previews with transport calculation
- **ACCEPT/REJECT/CANCEL**: Status changes
- **COMPLETE**: When trade is executed
- **FAIL**: If execution fails (rollback)

### Team Operation History
Financial movements tracked in TeamOperationHistory:
- **TRADE_PURCHASE**: Buyer's payment (outgoing)
- **TRADE_SALE**: Seller's income (incoming)
- **TRANSPORTATION_EXPENSE**: Transport cost (separate tracking)

### Balance History
Snapshot of account balances after each operation:
- Links to TeamOperationHistory via operationId
- Tracks both gold and carbon balances
- Records the change amount (positive/negative)

### Audit Trail Benefits
1. **Complete Visibility**: Every action and actor is recorded
2. **Financial Reconciliation**: Track all gold movements
3. **Performance Analytics**: Analyze trade patterns
4. **Dispute Resolution**: Full history for conflict resolution
5. **Compliance**: Meet audit requirements

## History Query Examples

```typescript
// Get all trades for a team
async getTeamTradeHistory(teamId: string) {
  const operations = await prisma.teamOperationHistory.findMany({
    where: {
      teamId,
      operationType: { in: ['TRADE_PURCHASE', 'TRADE_SALE'] }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      targetTeam: true,
      sourceTeam: true,
      user: true
    }
  });

  return operations.map(op => ({
    type: op.operationType === 'TRADE_PURCHASE' ? 'bought' : 'sold',
    amount: op.amount,
    partner: op.targetTeam || op.sourceTeam,
    items: op.metadata?.items,
    date: op.createdAt
  }));
}

// Get trade volume statistics
async getTradeStatistics(teamId: string) {
  const stats = await prisma.teamOperationHistory.aggregate({
    where: { teamId, operationType: { in: ['TRADE_PURCHASE', 'TRADE_SALE'] } },
    _sum: { amount: true },
    _count: { id: true },
    _avg: { amount: true }
  });

  return {
    totalVolume: stats._sum.amount,
    tradeCount: stats._count.id,
    averageValue: stats._avg.amount
  };
}
```

## Key Points

- **ONE source inventory** (same facility) per trade
- **Receiver pays ALL** (items + transport)
- **Receiver chooses** destination
- **Instant delivery**
- **No negotiation**
- **Complete audit trail** for all operations

## Integration with Facility-Space System

### Space Calculation
- All space measurements use **carbon emission units**
- `unitSpaceOccupied` is derived from `RawMaterial.carbonEmission` or `ProductFormula.productFormulaCarbonEmission`
- Space validation against `FacilitySpaceInventory.availableSpace`
- Only `RAW_MATERIAL_PRODUCTION` and `FUNCTIONAL` facilities have storage space

### Facility Category Checking
```typescript
// CORRECT: Check facility category, not hardcoded types
const canStoreFacility = await tx.tileFacilityInstance.findFirst({
  where: {
    id: facilityId,
    category: {
      in: ['RAW_MATERIAL_PRODUCTION', 'FUNCTIONAL']
    }
  }
});

// WRONG: Don't hardcode facility types
// if (['FACTORY', 'WAREHOUSE', 'MALL'].includes(facility.facilityType))
```

### Integration Points
- Uses `FacilityInventoryItem` for item tracking
- Updates `FacilitySpaceInventory` for space management
- Links to existing `RawMaterial` and `ProductFormula` models
- Creates `TransportationOrder` records for full transport tracking

## Removed Features

### Statistics Endpoints
- Trade statistics endpoints have been removed to maintain module focus
- Historical data is still preserved in `TeamOperationHistory` and `TradeHistory` tables
- Statistics can be generated through direct queries to operation history tables if needed
- Focus is on core trade functionality and proper integration with existing systems