# Trade Integration Guide

## Overview

Ultra-simple trade system where sender offers items, receiver pays everything.

## Key Integration Points

### 1. Facility Inventory
- Read items from ONE facility
- Transfer items on acceptance
- Links with existing FacilityInventoryItem model

### 2. Transportation
- Uses existing TransportationCostService.calculateCost() method
- Integrates with TransportationModule from `src/transportation/`
- Receiver pays all transport costs

### 3. Teams
- Validate same activity
- Transfer gold between teams
- Integrates with existing Team model gold balance

## Simple Trade Flow

```typescript
async executeTrade(tradeId: string, destinationFacilityId: string) {
  return prisma.$transaction(async (tx) => {
    // 1. Get trade
    const trade = await getTrade(tx, tradeId);

    // 2. Calculate transport using TransportationCostService
    const transportCost = await this.transportationCostService.calculateCost(
      sourceInventoryId,
      destInventoryId,
      inventoryItemId,
      quantity,
      receiverTeamId
    );

    // 3. Validate receiver
    const totalCost = trade.totalPrice + transportCost;
    await validateReceiverFunds(receiverTeam, totalCost);
    await validateDestinationSpace(destinationFacility);

    // 4. Execute
    await transferItems(tx, trade.items, destinationFacility);
    await deductGold(tx, receiverTeam, totalCost);
    await addGold(tx, senderTeam, trade.totalPrice);

    // 5. Complete
    await updateStatus(tx, tradeId, 'COMPLETED');
    return createTransaction(tx, trade, transportCost);
  });
}
```

## Service Methods

```typescript
class TradeService {
  // Create trade (sender)
  async createTrade(data: CreateTradeDto) {
    // Validate all items from same facility
    // Create trade with PENDING status
    // No transport options - receiver always pays
  }

  // Preview trade (receiver)
  async previewTrade(tradeId: string, destFacilityId: string) {
    // Calculate transport cost via TransportationCostService
    // Return total: items + transport
  }

  // Accept trade (receiver)
  async acceptTrade(tradeId: string, destFacilityId: string) {
    // Execute in transaction
    // Receiver pays all
    // Instant delivery
  }
}
```

## Database Operations

### Gold Transfer
```typescript
// Receiver pays everything
await tx.team.update({
  where: { id: receiverTeamId },
  data: { goldBalance: { decrement: itemsCost + transportCost } }
});

// Seller receives items price only
await tx.team.update({
  where: { id: sellerTeamId },
  data: { goldBalance: { increment: itemsCost } }
});
```

### Item Transfer
```typescript
// Move items to receiver's chosen facility
for (const item of trade.items) {
  await transferItem(tx, item, destinationFacility);
}
```

## Validation

```typescript
// Sender validation
validateSameFacility(items);
validateInventory(items);

// Receiver validation
validateFunds(receiverTeam, itemsCost + transportCost);
validateSpace(destinationFacility, totalSpace);
```

## Key Points

- **ONE source facility** per trade
- **Receiver pays ALL** (items + transport)
- **Receiver chooses** destination
- **Instant delivery**
- **No negotiation**