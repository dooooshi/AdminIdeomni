# Resource Consumption Data Model

## Overview
This document defines the data model for tracking resource consumption history. This model records all water and power consumption transactions for history tracking and auditing purposes.

## Core Model

### ResourceTransaction
The single model for recording all resource consumption history.

```prisma
// Location: prisma/models/resource-transaction.prisma

enum ResourceType {
  WATER
  POWER
}

enum ConsumptionPurpose {
  RAW_MATERIAL_PRODUCTION   // Mining, farming, etc.
  PRODUCT_MANUFACTURING     // Factory production
}

enum TransactionStatus {
  SUCCESS
  FAILED
}

model ResourceTransaction {
  id                    String                  @id @default(cuid())
  
  // Resource Information
  resourceType          ResourceType            // WATER or POWER
  quantity              Decimal                 @db.Decimal(12, 3) // Units consumed
  unitPrice             Decimal                 @db.Decimal(10, 4) // Price per unit at time of transaction
  totalAmount           Decimal                 @db.Decimal(12, 2) // Total payment amount
  
  // Connection Reference (which infrastructure provided the resource)
  connectionId          String
  connection            InfrastructureConnection @relation(fields: [connectionId], references: [id])
  
  // Consumer Information (who used the resource)
  consumerFacilityId    String
  consumerFacility      TileFacilityInstance    @relation("ConsumerTransactions", fields: [consumerFacilityId], references: [id])
  consumerTeamId        String
  consumerTeam          Team                    @relation("ConsumerResourceTransactions", fields: [consumerTeamId], references: [id])
  
  // Provider Information (who supplied the resource)
  providerFacilityId    String
  providerFacility      TileFacilityInstance    @relation("ProviderTransactions", fields: [providerFacilityId], references: [id])
  providerTeamId        String
  providerTeam          Team                    @relation("ProviderResourceTransactions", fields: [providerTeamId], references: [id])
  
  // Purpose and Reference
  purpose               ConsumptionPurpose      // Why resource was consumed
  referenceType         String?                 // "PRODUCTION", "MAINTENANCE", etc.
  referenceId           String?                 // ID of related entity (production ID, order ID, etc.)
  
  // Transaction Status
  status                TransactionStatus       @default(SUCCESS)
  failureReason         String?                 // Reason if failed
  
  // Team History Integration
  operationHistoryId    String?                 // Links to TeamOperationHistory for gold tracking
  balanceHistoryId      String?                 // Links to TeamBalanceHistory for carbon/gold changes
  
  // Activity Context
  activityId            String
  activity              Activity                @relation(fields: [activityId], references: [id])
  
  // User who initiated (for audit)
  initiatedBy           String
  initiatedByUser       User                    @relation(fields: [initiatedBy], references: [id])
  
  // Timestamps
  transactionDate       DateTime                @default(now())
  
  // Metadata
  metadata              Json?                   // Additional transaction data
  
  @@index([consumerTeamId, transactionDate])
  @@index([providerTeamId, transactionDate])
  @@index([consumerFacilityId, resourceType])
  @@index([purpose, transactionDate])
  @@index([referenceType, referenceId])
  @@index([activityId, resourceType])
  @@map("resource_transactions")
}
```

## Integration with Existing Models

### TileFacilityInstance
```prisma
model TileFacilityInstance {
  // ... existing fields ...
  
  // Resource consumption relationships
  consumerTransactions  ResourceTransaction[]    @relation("ConsumerTransactions")
  providerTransactions  ResourceTransaction[]    @relation("ProviderTransactions")
}
```

### Team
```prisma
model Team {
  // ... existing fields ...
  
  // Resource transaction relationships
  consumerResourceTransactions ResourceTransaction[] @relation("ConsumerResourceTransactions")
  providerResourceTransactions ResourceTransaction[] @relation("ProviderResourceTransactions")
}
```

### InfrastructureConnection
```prisma
model InfrastructureConnection {
  // ... existing fields ...
  
  // Transaction history
  resourceTransactions  ResourceTransaction[]
}
```

### Activity
```prisma
model Activity {
  // ... existing fields ...
  
  // Resource consumption tracking
  resourceTransactions  ResourceTransaction[]
}
```

### User
```prisma
model User {
  // ... existing fields ...
  
  // Audit trail
  initiatedResourceTransactions ResourceTransaction[]
}
```

## Usage Examples

### Recording a Transaction (Internal)

```typescript
// When raw material production consumes resources
const transaction = await prisma.resourceTransaction.create({
  data: {
    resourceType: 'WATER',
    quantity: 300,
    unitPrice: 0.5,
    totalAmount: 150,
    connectionId: waterConnection.id,
    consumerFacilityId: mine.id,
    consumerTeamId: team.id,
    providerFacilityId: waterPlant.id,
    providerTeamId: providerTeam.id,
    purpose: 'RAW_MATERIAL_PRODUCTION',
    referenceType: 'PRODUCTION',
    referenceId: production.id,
    status: 'SUCCESS',
    activityId: activity.id,
    initiatedBy: user.id
  }
});
```

### Querying Consumption History

```typescript
// Get facility's water consumption history
const history = await prisma.resourceTransaction.findMany({
  where: {
    consumerFacilityId: facilityId,
    resourceType: 'WATER',
    transactionDate: {
      gte: startDate,
      lte: endDate
    },
    status: 'SUCCESS'
  },
  orderBy: { transactionDate: 'desc' }
});

// Get team's total resource costs
const transactions = await prisma.resourceTransaction.findMany({
  where: {
    consumerTeamId: teamId,
    status: 'SUCCESS'
  }
});

const totalCost = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
```

## Database Indexes

Optimized for history queries:

1. **By Team and Date**: For team consumption history
2. **By Facility and Type**: For facility-specific queries
3. **By Purpose**: For analyzing consumption by purpose
4. **By Reference**: For finding transactions related to specific operations
5. **By Activity**: For activity-wide consumption tracking

## Data Retention

- **Transactions**: Keep indefinitely as permanent history record
- **No aggregation needed**: Query history directly from transactions

## Benefits

1. **Simple**: Single model for all consumption history
2. **Complete**: Full audit trail of every transaction
3. **Queryable**: Indexed for fast history retrieval
4. **Flexible**: JSON metadata for additional context
5. **Permanent**: Complete historical record

This model provides a clean, simple way to track all resource consumption history without unnecessary complexity.