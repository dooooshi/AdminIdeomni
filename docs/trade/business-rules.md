# Trade Business Rules

## Ultra-Simple Rules

### Trade Creation
- Items must be from **SAME facility**
- Can select **multiple items**
- Set **one total price** for all items
- Choose **target team**

### Trade Acceptance
- Receiver **chooses destination facility**
- Receiver **pays everything**: items + transport
- Transport cost **calculated using TransportationCostService**
  - Uses existing `calculateCost()` method from `src/transportation/services/transportation-cost.service.ts`
  - Factors in distance, transport configuration, and item space requirements
- **Instant delivery** to chosen facility

### Core Validations

#### For Sender
```typescript
// All items from same facility
if (!allItemsFromSameFacility) {
  throw new Error("All items must be from same facility");
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
if (totalCost > receiverTeam.goldBalance) {
  throw new Error("Insufficient gold");
}

// Has enough space
if (totalSpace > destinationFacility.availableSpace) {
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

## Atomic Execution

When trade is accepted:
1. Calculate transport cost using `TransportationCostService.calculateCost()`
2. Lock resources
3. Transfer items to receiver's chosen facility
4. Deduct gold from receiver (items + transport)
5. Add gold to sender (items only)
6. Create transaction record

All in one transaction - rollback if any step fails.

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