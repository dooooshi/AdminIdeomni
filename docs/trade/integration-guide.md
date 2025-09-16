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

    // 3. Calculate transport using TransportationCostService
    const transportCost = await this.transportationCostService.calculateCost(
      trade.items[0].sourceInventoryId, // All items from same inventory
      destInventoryId,
      trade.items[0].inventoryItemId,
      trade.items[0].quantity,
      receiverTeam.id
    );

    // 4. Validate receiver funds and space
    const totalCost = trade.totalPrice + transportCost;
    const receiverAccount = await tx.teamAccount.findUnique({ where: { teamId: receiverTeam.id } });
    if (receiverAccount.gold < totalCost) {
      throw new Error('Insufficient gold');
    }

    const destInventory = await tx.facilitySpaceInventory.findUnique({ where: { id: destInventoryId } });
    if (destInventory.availableSpace < totalSpace) {
      throw new Error('Insufficient space');
    }

    // 5. Track balances before transfer
    const senderAccount = await tx.teamAccount.findUnique({ where: { teamId: senderTeam.id } });
    const receiverBalanceBefore = receiverAccount.gold;
    const senderBalanceBefore = senderAccount.gold;

    // 6. Execute transfers
    // Create TransportationOrder for tracking
    const transportOrder = await this.transportationService.createOrder(tx, {
      sourceInventoryId: trade.items[0].sourceInventoryId,
      destInventoryId,
      items: trade.items,
      teamId: receiverTeam.id
    });

    // Transfer gold between TeamAccount entities
    await tx.teamAccount.update({
      where: { teamId: receiverTeam.id },
      data: { gold: { decrement: totalCost } }
    });

    await tx.teamAccount.update({
      where: { teamId: senderTeam.id },
      data: { gold: { increment: trade.totalPrice } }
    });

    // 7. Create history tracking records
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

    // 8. Complete trade
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

## Service Methods

```typescript
class TradeService {
  // Create trade (sender)
  async createTrade(data: CreateTradeDto) {
    // Validate all items from same FacilitySpaceInventory
    // Validate teams in same activity
    // Create trade with PENDING status
    // No transport options - receiver always pays
  }

  // Preview trade (receiver)
  async previewTrade(tradeId: string, destInventoryId: string) {
    // Calculate transport cost via TransportationCostService.calculateCost(
    //   sourceInventoryId, destInventoryId, inventoryItemId, quantity, teamId
    // )
    // Check TeamAccount gold balance
    // Return total: items + transport
  }

  // Accept trade (receiver)
  async acceptTrade(tradeId: string, destInventoryId: string) {
    // Execute in transaction
    // Create TransportationOrder
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