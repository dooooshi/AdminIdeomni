# Trade Implementation Checklist

## Ultra-Simple Trade System

### Core Concept
- Sender offers items with price
- Receiver pays everything (items + transport)
- Instant delivery to receiver's chosen facility

## 1. Database Setup

### Create Prisma Model
```prisma
// prisma/models/trade.prisma
model TradeOrder {
  // Basic fields
  id, activityId, status
  senderTeamId, targetTeamId
  sourceFacilityId
  totalPrice // items only

  // Relations
  items TradeItem[]
  transaction TradeTransaction?
}

model TradeItem {
  // Multiple items from same facility
  tradeOrderId
  inventoryItemId
  quantity
}

model TradeTransaction {
  // Completed trade record
  itemsCost
  transportCost
  totalPaid // items + transport
  destFacilityId // chosen by receiver
}
```

### Run Migrations
```bash
pnpm run prisma:generate
pnpm run prisma:migrate
```

## 2. Core Implementation

### Service Methods
- [ ] `createTrade()` - Sender creates offer
- [ ] `listTrades()` - View incoming trades
- [ ] `previewTrade()` - Calculate transport cost
- [ ] `acceptTrade()` - Pay and receive items
- [ ] `rejectTrade()` - Decline offer
- [ ] `cancelTrade()` - Cancel own offer

### API Endpoints
- [ ] `POST /api/trades` - Create
- [ ] `GET /api/trades` - List
- [ ] `GET /api/trades/:id` - Details
- [ ] `POST /api/trades/:id/preview` - Preview with transport
- [ ] `POST /api/trades/:id/accept` - Accept
- [ ] `POST /api/trades/:id/reject` - Reject
- [ ] `DELETE /api/trades/:id` - Cancel

## 3. Business Logic

### Validations
- [ ] Items from SAME facility
- [ ] Receiver has gold (items + transport)
- [ ] Destination has space
- [ ] Teams in same activity

### Execution Flow
```typescript
// 1. Calculate transport using existing service
const transportCost = await this.transportationCostService.calculateCost(
  sourceInventoryId, destInventoryId, itemId, quantity, teamId
);

// 2. Total cost
const total = trade.totalPrice + transportCost;

// 3. Execute atomic
prisma.$transaction(async (tx) => {
  // Transfer items
  // Receiver pays total
  // Sender gets items price
  // Update status
});
```

## 4. Integration

### Transportation (Using Existing TransportationModule)
- [ ] Use TransportationCostService.calculateCost() for transport cost
- [ ] Create TransportationOrder on acceptance
- [ ] Leverage existing transport tier system
- [ ] Integrate with existing transportation infrastructure

### Teams & Gold
- [ ] Deduct from receiver: items + transport
- [ ] Add to sender: items only
- [ ] Validate funds before execution

## 5. Testing

- [ ] Create trade with multiple items
- [ ] Preview shows transport cost
- [ ] Accept transfers items and gold
- [ ] Reject/cancel works correctly
- [ ] Validation prevents invalid trades

## Quick Implementation

```typescript
// Minimal viable implementation
class TradeService {
  create(items, price, targetTeam) {
    // Validate same facility
    // Create PENDING trade
  }

  preview(tradeId, destFacility) {
    // Use TransportationCostService.calculateCost()
    // Return total cost (items + transport)
  }

  accept(tradeId, destFacility) {
    // Validate funds & space
    // Transfer in transaction
    // Receiver pays all
  }
}
```

## Key Rules

✅ Items from SAME facility
✅ Receiver ALWAYS pays transport
✅ Receiver chooses destination
✅ One total price for all items
✅ Instant delivery

❌ NO transport payment options
❌ NO individual item pricing
❌ NO negotiation