# Resource Consumption Service

## Overview

Resource Consumption is an **internal service** that:
1. Processes water/power consumption when facilities operate
2. Records transaction history for auditing
3. Handles payments between consumer and provider teams

It is **NOT a public API** - it's used internally by other modules.

## Architecture

```
User → Production API → ProductionService → [ResourceConsumptionService] → Database
                                                    ↓
                                            (Internal Only)
                                                    ↓
                                            - Validate connections
                                            - Process payments  
                                            - Record history
```

## What It Does

### Core Function
```typescript
// Internal service method (not exposed via API)
consumeResources({
  facilityId: "mine-123",
  resourceRequirements: [
    { type: 'WATER', quantity: 300 },
    { type: 'POWER', quantity: 200 }
  ],
  purpose: 'RAW_MATERIAL_PRODUCTION',
  referenceId: "production-456"
})

// This will:
// 1. Check water/power connections exist
// 2. Calculate costs based on connection prices
// 3. Deduct payment from consumer team
// 4. Add payment to provider team
// 5. Record transaction in history
// 6. Return success/failure
```

### History Tracking
All consumption is recorded in `ResourceTransaction` table:
- Who consumed (facility, team)
- Who provided (facility, team)
- What was consumed (water/power, quantity)
- How much was paid
- Why it was consumed (purpose, reference)
- When it happened

### Gold and Carbon Flow
Resource consumption affects team balances:
- **Gold**: Payment for water/power (consumer pays, provider receives)
- **Carbon**: Environmental impact from production (consumer accumulates)

Integration with team history system:
- Creates `TeamOperationHistory` records for audit trail
- Updates `TeamBalanceHistory` for balance snapshots
- Tracks both gold flow (payment) and carbon impact (emissions)

## Files

```
resource-consumption/
├── README.md            # This file
├── data-model.md        # ResourceTransaction model for history
└── internal-service.md  # Internal service implementation
```

## Data Model

### ResourceTransaction (History Record)
- Single model for all consumption history
- Records every water/power transaction
- Links to infrastructure connections
- Tracks payments between teams
- Permanent audit trail

## Usage by Other Modules

### Example: Raw Material Production
```typescript
class ProductionService {
  // User calls: POST /api/facility/production/start
  async startProduction(request) {
    // Calculate needs
    const waterNeeded = material.waterRequired * quantity;
    const powerNeeded = material.powerRequired * quantity;
    
    // Call internal service
    const result = await this.resourceConsumption.consumeResources({
      resourceRequirements: [
        { type: 'WATER', quantity: waterNeeded },
        { type: 'POWER', quantity: powerNeeded }
      ],
      purpose: 'RAW_MATERIAL_PRODUCTION',
      // ...
    });
    
    // Resources consumed, payments processed, history recorded
    // Continue with production...
  }
}
```

## History API

Each module exposes its own history endpoints:

```typescript
// Production module
GET /api/facility/production/resource-history

// Team module  
GET /api/team/resource-history

// Activity module
GET /api/activity/{id}/resource-history
```

These endpoints internally query the `ResourceTransaction` table.

## Key Design Decisions

1. **Internal Service**: Not exposed as public API
2. **Single History Table**: All consumption in one place
3. **Atomic Operations**: Payment and recording in one transaction
4. **Purpose Tracking**: Know why resources were consumed
5. **Full Audit Trail**: Complete history for analytics

## Benefits

- **Centralized**: One place for all resource consumption logic
- **Consistent**: Same payment flow for all facilities
- **Auditable**: Complete transaction history
- **Reusable**: Any module can use it
- **Simple**: Just consume and record

This service ensures consistent resource consumption handling across the entire platform while maintaining a complete audit trail.