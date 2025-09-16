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

  // Facilities
  sourceFacilityId  String
  sourceFacility    TileFacilityInstance @relation("SourceTransaction", fields: [sourceFacilityId], references: [id])

  destFacilityId    String          // Chosen by receiver
  destFacility      TileFacilityInstance @relation("DestTransaction", fields: [destFacilityId], references: [id])

  // Amounts (receiver pays all)
  itemsCost         Decimal         @db.Decimal(12, 2)
  transportCost     Decimal         @db.Decimal(12, 2)
  totalPaid         Decimal         @db.Decimal(12, 2)  // items + transport
  sellerReceived    Decimal         @db.Decimal(12, 2)  // items cost only

  // Transportation (linked to existing transportation system)
  transportationOrderId String       @unique
  transportationOrder   TransportationOrder @relation(fields: [transportationOrderId], references: [id])
  // Transport cost calculated via TransportationCostService.calculateCost()

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
```

### User Model
Add these relations to existing User model (around line 65):

```prisma
  // Trade relationships
  createdTrades         TradeOrder[]         @relation("TradeCreator")
  respondedTrades       TradeOrder[]         @relation("TradeResponder")
  executedTrades        TradeTransaction[]   @relation("TradeExecutor")
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
  sourceTransactions    TradeTransaction[]   @relation("SourceTransaction")
  destTransactions      TradeTransaction[]   @relation("DestTransaction")
```

### FacilityInventoryItem Model
Add these relations (around line 54):

```prisma
  // Trade relationships
  tradeItems            TradeItem[]
```

### TransportationOrder Model
Add these relations (around line 145):

```prisma
  // Trade relationship
  tradeTransaction      TradeTransaction?
```

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
//   sourceInventoryId, destInventoryId, itemId, quantity, teamId
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

## Key Rules

1. **All items must be from SAME source facility**
2. **Receiver ALWAYS pays transportation**
3. **Receiver chooses destination facility**
4. **Total cost = Item price + Transport cost**
5. **Seller receives item price only**

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