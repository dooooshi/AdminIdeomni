# Trade Data Model

## Core Models to Create

### TradeOrder
Simple trade request between teams.

```prisma
model TradeOrder {
  id                String          @id @default(cuid())

  // Activity context
  activityId        String
  activity          Activity        @relation(fields: [activityId], references: [id], onDelete: Cascade)

  // Sender
  senderTeamId      String
  senderTeam        Team            @relation("SenderTeam", fields: [senderTeamId], references: [id])
  sourceFacilityId  String
  sourceFacility    TileFacilityInstance @relation("SourceTradeFacility", fields: [sourceFacilityId], references: [id])

  // Receiver
  targetTeamId      String
  targetTeam        Team            @relation("TargetTeam", fields: [targetTeamId], references: [id])

  // Destination chosen by receiver (only set when accepted)
  destInventoryId   String?
  destInventory     FacilitySpaceInventory? @relation("DestTradeInventory", fields: [destInventoryId], references: [id])

  // Trade details
  message           String?         @db.VarChar(500)
  totalPrice        Decimal         @db.Decimal(12, 2)  // Price for items only

  // Status
  status            TradeStatus     @default(PENDING)

  // User tracking
  createdBy         String
  createdByUser     User            @relation("TradeCreator", fields: [createdBy], references: [id])

  // Response tracking
  respondedAt       DateTime?
  respondedBy       String?
  respondedByUser   User?           @relation("TradeResponder", fields: [respondedBy], references: [id])
  responseReason    String?

  // Relations
  items             TradeItem[]
  transaction       TradeTransaction?

  // Timestamps
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  @@index([activityId, status])
  @@index([targetTeamId, status])
  @@map("trade_orders")
}

enum TradeStatus {
  PENDING    // Waiting for response
  ACCEPTED   // Accepted by receiver
  REJECTED   // Rejected by receiver
  CANCELLED  // Cancelled by sender
  COMPLETED  // Trade executed
}
```

### TradeItem
Items in the trade (can be multiple from same facility).

```prisma
model TradeItem {
  id                String          @id @default(cuid())

  // Parent trade
  tradeOrderId      String
  tradeOrder        TradeOrder      @relation(fields: [tradeOrderId], references: [id], onDelete: Cascade)

  // Item reference
  inventoryItemId   String
  inventoryItem     FacilityInventoryItem @relation(fields: [inventoryItemId], references: [id])

  // Source inventory reference (to validate same facility)
  sourceInventoryId String
  sourceInventory   FacilitySpaceInventory @relation("TradeItemSourceInventory", fields: [sourceInventoryId], references: [id])

  // Item details
  itemName          String          // Cached for display
  itemType          InventoryItemType // RAW_MATERIAL or PRODUCT
  quantity          Decimal         @db.Decimal(12, 3)
  unitSpace         Decimal         @db.Decimal(10, 6)  // Space per unit

  // Timestamps
  createdAt         DateTime        @default(now())

  @@index([tradeOrderId])
  @@map("trade_items")
}
```

### TradeTransaction
Completed trade record.

```prisma
model TradeTransaction {
  id                String          @id @default(cuid())

  // Reference to trade order
  tradeOrderId      String          @unique
  tradeOrder        TradeOrder      @relation(fields: [tradeOrderId], references: [id])

  // Activity context
  activityId        String
  activity          Activity        @relation(fields: [activityId], references: [id])

  // Teams
  senderTeamId      String
  senderTeam        Team            @relation("SenderTransaction", fields: [senderTeamId], references: [id])

  receiverTeamId    String
  receiverTeam      Team            @relation("ReceiverTransaction", fields: [receiverTeamId], references: [id])

  // Inventory locations
  sourceInventoryId String
  sourceInventory   FacilitySpaceInventory @relation("SourceTransactionInventory", fields: [sourceInventoryId], references: [id])

  destInventoryId   String          // Chosen by receiver
  destInventory     FacilitySpaceInventory @relation("DestTransactionInventory", fields: [destInventoryId], references: [id])

  // Amounts (receiver pays all)
  itemsCost         Decimal         @db.Decimal(12, 2)
  transportCost     Decimal         @db.Decimal(12, 2)
  totalPaid         Decimal         @db.Decimal(12, 2)  // items + transport
  sellerReceived    Decimal         @db.Decimal(12, 2)  // items cost only

  // Transportation tracking
  transportationOrderId String?      // Reference to created TransportationOrder
  // Transport cost calculated via TransportationCostService.calculateCost()
  // TransportationOrder created separately, not as foreign key relation

  // Execution
  executedBy        String
  executedByUser    User            @relation("TradeExecutor", fields: [executedBy], references: [id])
  executedAt        DateTime        @default(now())

  @@index([receiverTeamId, executedAt])
  @@map("trade_transactions")
}
```

## Required Model Extensions

### Team Model
Add these relations to existing Team model (around line 82):

```prisma
  // Trade relationships
  sentTrades            TradeOrder[]         @relation("SenderTeam")
  receivedTrades        TradeOrder[]         @relation("TargetTeam")
  senderTransactions    TradeTransaction[]   @relation("SenderTransaction")
  receiverTransactions  TradeTransaction[]   @relation("ReceiverTransaction")
  tradeHistory          TradeHistory[]       @relation("TradeHistoryTeam")
```

### User Model
Add these relations to existing User model (around line 65):

```prisma
  // Trade relationships
  createdTrades         TradeOrder[]         @relation("TradeCreator")
  respondedTrades       TradeOrder[]         @relation("TradeResponder")
  executedTrades        TradeTransaction[]   @relation("TradeExecutor")
  tradeHistory          TradeHistory[]       @relation("TradeHistoryActor")
```

### Activity Model
Add these relations to existing Activity model (around line 68):

```prisma
  // Trade relationships
  tradeOrders           TradeOrder[]
  tradeTransactions     TradeTransaction[]
```

### TileFacilityInstance Model
Add these relations (around line 84):

```prisma
  // Trade relationships
  sourceTradeOffers     TradeOrder[]         @relation("SourceTradeFacility")
```

### FacilityInventoryItem Model
Add these relations (around line 54):

```prisma
  // Trade relationships
  tradeItems            TradeItem[]
```

### FacilitySpaceInventory Model
Add these relations:

```prisma
  // Trade relationships
  destTradeOrders       TradeOrder[]         @relation("DestTradeInventory")
  tradeItemSources      TradeItem[]          @relation("TradeItemSourceInventory")
  sourceTransactions    TradeTransaction[]   @relation("SourceTransactionInventory")
  destTransactions      TradeTransaction[]   @relation("DestTransactionInventory")
```

### TransportationOrder Model
(No changes needed - TransportationOrder is created for trades but not linked via foreign key)

## Simple Flow

### 1. Create Trade
```typescript
// Sender selects multiple items from ONE facility
// Sets total price for items
// No transport payment options (receiver always pays)
```

### 2. Preview Trade
```typescript
// Receiver chooses destination facility
// System calculates transport cost using:
// TransportationCostService.calculateCost(
//   sourceInventoryId, // FacilitySpaceInventory ID
//   destInventoryId,   // FacilitySpaceInventory ID
//   inventoryItemId,   // FacilityInventoryItem ID
//   quantity,          // Decimal
//   teamId            // Team ID
// )
// Shows total: items + transport
```

### 3. Accept Trade
```typescript
// Receiver pays items + transport
// Items transfer to chosen facility via TransportationService
// Creates TransportationOrder for tracking
// Seller receives item price only
```

### TradeHistory
Comprehensive audit trail for all trade operations.

```prisma
model TradeHistory {
  id                String          @id @default(cuid())

  // Parent trade
  tradeOrderId      String
  tradeOrder        TradeOrder      @relation(fields: [tradeOrderId], references: [id], onDelete: Cascade)

  // Operation type
  operation         TradeOperation
  previousStatus    TradeStatus?
  newStatus         TradeStatus

  // Actor information
  actorId           String
  actor             User            @relation("TradeHistoryActor", fields: [actorId], references: [id])
  actorTeamId       String
  actorTeam         Team            @relation("TradeHistoryTeam", fields: [actorTeamId], references: [id])

  // Additional context
  description       String          @db.Text
  metadata          Json?           // Additional data (e.g., rejection reason, transport cost breakdown)

  // Timestamp
  createdAt         DateTime        @default(now())

  @@index([tradeOrderId, createdAt])
  @@index([actorTeamId, createdAt])
  @@map("trade_history")
}

enum TradeOperation {
  CREATED           // Trade offer created
  PREVIEWED         // Trade previewed by receiver
  ACCEPTED          // Trade accepted by receiver
  REJECTED          // Trade rejected by receiver
  CANCELLED         // Trade cancelled by sender
  COMPLETED         // Trade execution completed
  FAILED            // Trade execution failed
}
```

## Key Rules

1. **All items must be from SAME source facility**
2. **Receiver ALWAYS pays transportation**
3. **Receiver chooses destination facility**
4. **Total cost = Item price + Transport cost**
5. **Seller receives item price only**

## History Tracking Integration

### Required TeamOperationType Additions
Add these operation types to the existing `TeamOperationType` enum in `prisma/models/team-operation-history.prisma`:

```prisma
// Trade Operations (add to existing TeamOperationType enum)
TRADE_PURCHASE             // Buyer pays for trade (items + transport)
TRADE_SALE                 // Seller receives payment for items
// Note: Use existing TRANSPORTATION_EXPENSE for transport cost tracking
```

### TeamOperationHistory Integration
When a trade is completed, create entries in TeamOperationHistory:

```typescript
// For the buyer (receiver)
await createTeamOperation({
  teamId: receiverTeamId,
  userId: executorUserId,
  operationType: 'TRADE_PURCHASE',
  amount: totalCost,                     // items + transport
  resourceType: 'GOLD',
  targetTeamId: senderTeamId,
  balanceBefore: receiverBalanceBefore,
  balanceAfter: receiverBalanceAfter,
  description: `Trade purchase from ${senderTeamName}`,
  metadata: {
    tradeOrderId,
    itemsCost,
    transportCost,
    items: tradeItems
  }
});

// For the seller (sender)
await createTeamOperation({
  teamId: senderTeamId,
  userId: executorUserId,
  operationType: 'TRADE_SALE',
  amount: itemsCost,                    // items price only
  resourceType: 'GOLD',
  sourceTeamId: receiverTeamId,
  balanceBefore: senderBalanceBefore,
  balanceAfter: senderBalanceAfter,
  description: `Trade sale to ${receiverTeamName}`,
  metadata: {
    tradeOrderId,
    items: tradeItems
  }
});

// For transportation cost tracking (optional separate tracking)
await createTeamOperation({
  teamId: receiverTeamId,
  userId: executorUserId,
  operationType: 'TRANSPORTATION_EXPENSE',  // Use existing type
  amount: transportCost,
  resourceType: 'GOLD',
  balanceBefore: beforeTransport,
  balanceAfter: afterTransport,
  description: `Transport cost for trade ${tradeOrderId}`,
  metadata: {
    tradeOrderId,
    sourceInventoryId,
    destInventoryId,
    transportationOrderId
  }
});
```

### Operation Type Usage Guidelines

#### TRADE_PURCHASE
- **Actor**: Buyer (receiver team)
- **Amount**: Total cost (items + transport)
- **Direction**: Outgoing (negative balance change)
- **Metadata**: tradeOrderId, itemsCost, transportCost, items

#### TRADE_SALE
- **Actor**: Seller (sender team)
- **Amount**: Items price only
- **Direction**: Incoming (positive balance change)
- **Metadata**: tradeOrderId, items

### TeamBalanceHistory Integration
Track balance changes for audit trail:

```typescript
// Create balance history entry
await createBalanceHistory({
  teamId: receiverTeamId,
  goldBalance: newGoldBalance,
  carbonBalance: carbonBalance,        // unchanged
  goldChange: -(itemsCost + transportCost),
  carbonChange: 0,
  operationId: teamOperationId
});
```

### TradeHistory Creation
Track all trade status changes:

```typescript
// When trade is created
await createTradeHistory({
  tradeOrderId,
  operation: 'CREATED',
  newStatus: 'PENDING',
  actorId: creatorUserId,
  actorTeamId: senderTeamId,
  description: 'Trade offer created'
});

// When trade is accepted
await createTradeHistory({
  tradeOrderId,
  operation: 'ACCEPTED',
  previousStatus: 'PENDING',
  newStatus: 'ACCEPTED',
  actorId: acceptorUserId,
  actorTeamId: receiverTeamId,
  description: 'Trade accepted',
  metadata: {
    destinationInventoryId,
    transportCost,
    totalCost
  }
});

// When trade is completed
await createTradeHistory({
  tradeOrderId,
  operation: 'COMPLETED',
  previousStatus: 'ACCEPTED',
  newStatus: 'COMPLETED',
  actorId: systemUserId,
  actorTeamId: receiverTeamId,
  description: 'Trade executed successfully',
  metadata: {
    transactionId,
    transportationOrderId
  }
});
```

## Database Indexes

```sql
-- Trade Orders
CREATE INDEX idx_trade_orders_activity ON trade_orders(activity_id, status);
CREATE INDEX idx_trade_orders_sender ON trade_orders(sender_team_id, status);
CREATE INDEX idx_trade_orders_target ON trade_orders(target_team_id, status);

-- Trade Items
CREATE INDEX idx_trade_items_order ON trade_items(trade_order_id);

-- Trade Transactions
CREATE INDEX idx_trade_transactions_sender ON trade_transactions(sender_team_id, executed_at DESC);
CREATE INDEX idx_trade_transactions_receiver ON trade_transactions(receiver_team_id, executed_at DESC);
```