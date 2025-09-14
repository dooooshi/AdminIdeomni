# Infrastructure Connection & Service History Tracking System

## Overview
This document specifies the enhanced history tracking system for infrastructure connections and service subscriptions. The system extends the existing `InfrastructureOperationLog` to provide comprehensive lifecycle tracking with detailed event metadata and termination analysis capabilities.

## Integration with Existing System

### Current State
The infrastructure module already includes:
- `InfrastructureOperationLog` for basic audit logging
- `OperationType` enum with connection and subscription events
- Connection tracking fields in `InfrastructureConnection` (disconnectedBy, disconnectionReason)
- Subscription status tracking in `InfrastructureServiceSubscription`

### Enhancement Strategy
Rather than creating a parallel system, this design enhances the existing logging infrastructure by:
1. Extending `InfrastructureOperationLog` with structured event tracking
2. Adding detailed termination analysis capabilities
3. Providing rich metadata schemas for different event types
4. Maintaining backward compatibility with existing code

## Business Requirements

### Events to Track

#### Connection Events (Water/Power)
Maps to existing `OperationType` enum values:

| Event | OperationType | Description |
|-------|---------------|-------------|
| Request Initiated | CONNECTION_REQUESTED | Consumer requests connection from provider |
| Request Declined | CONNECTION_REJECTED | Provider rejects the connection request |
| Request Cancelled | CONNECTION_CANCELLED | Consumer cancels their pending request |
| Connection Established | CONNECTION_ACCEPTED | Provider accepts and connection becomes active |
| Connection Terminated | CONNECTION_DISCONNECTED | Either party disconnects an active connection |

#### Service Events (Base Station/Fire Station)
Maps to existing `OperationType` enum values:

| Event | OperationType | Description |
|-------|---------------|-------------|
| Subscription Requested | SUBSCRIPTION_REQUESTED | Consumer requests service subscription |
| Subscription Declined | SUBSCRIPTION_REJECTED | Provider rejects the subscription request |
| Subscription Cancelled | SUBSCRIPTION_CANCELLED | Consumer cancels their pending request |
| Subscription Activated | SUBSCRIPTION_ACCEPTED | Provider accepts and service becomes active |
| Subscription Terminated | CONNECTION_DISCONNECTED* | Either party ends the subscription |

*Note: Reuses CONNECTION_DISCONNECTED for subscription termination with entityType distinction

### Key Information to Capture
- **Event timestamp**: When the event occurred (existing: timestamp)
- **Event type**: The specific state change (existing: operationType)
- **Actor**: Which team/user initiated the action (existing: performedBy)
- **Context**: Request/connection/subscription details (existing: details JSON)
- **Reason**: Optional reason for decline/termination (enhance: structured in details)
- **Metadata**: Additional event-specific data (enhance: structured schemas)

## Enhanced Data Model

### 1. Extended InfrastructureOperationLog
Enhance the existing model with better structure and indexing:

```prisma
// Note: This extends the existing InfrastructureOperationLog model
// Additional fields and relations to be added via migration

model InfrastructureOperationLog {
  // Existing fields remain unchanged
  id                    String                 @id @default(cuid())
  operationType         OperationType
  providerTeamId        String?
  providerTeam          Team?                  @relation("ProviderOperationLogs", fields: [providerTeamId], references: [id])
  consumerTeamId        String?
  consumerTeam          Team?                  @relation("ConsumerOperationLogs", fields: [consumerTeamId], references: [id])
  entityType            String                 // Connection, Service, Request, Subscription
  entityId              String                 // ID of the affected entity
  details               Json                   // Enhanced with structured schemas
  performedBy           String
  performedByUser       User                   @relation(fields: [performedBy], references: [id])
  activityId            String
  activity              Activity               @relation(fields: [activityId], references: [id])
  timestamp             DateTime               @default(now())
  
  // New enhanced fields (to be added via migration)
  infrastructureType    InfrastructureType?    // WATER, POWER (for connections)
  serviceType           ServiceType?           // BASE_STATION, FIRE_STATION (for services)
  actorRole             String?                // "PROVIDER", "CONSUMER", "SYSTEM"
  providerFacilityId    String?
  consumerFacilityId    String?
  
  // Enhanced relationships for better querying
  terminationDetail     ConnectionTerminationDetail? @relation("LogTerminationDetail")
  
  // Improved indexes for performance
  @@index([providerTeamId, timestamp])
  @@index([consumerTeamId, timestamp])
  @@index([activityId, operationType, timestamp])
  @@index([entityType, entityId, timestamp])
  @@index([infrastructureType, timestamp])
  @@index([serviceType, timestamp])
  @@map("infrastructure_operation_logs")
}
```

### 2. ConnectionTerminationDetail
New table for detailed termination tracking:

```prisma
model ConnectionTerminationDetail {
  id                    String                 @id @default(cuid())
  
  // Link to operation log
  operationLogId        String                 @unique
  operationLog          InfrastructureOperationLog @relation("LogTerminationDetail", fields: [operationLogId], references: [id])
  
  // Termination classification
  terminationType       String                 // "VOLUNTARY", "FORCED", "SYSTEM"
  initiatedBy           String                 // "PROVIDER", "CONSUMER", "SYSTEM"
  terminationReason     String                 // Structured reason code
  detailedReason        String?                // Additional explanation
  
  // Financial impact
  penaltyAmount         Decimal?               @db.Decimal(65,3)
  refundAmount          Decimal?               @db.Decimal(65,3)
  outstandingBalance    Decimal?               @db.Decimal(65,3)
  
  // Connection/Service metrics at termination
  connectionDuration    Int                    // Duration in days
  totalResourcesUsed    Decimal?               @db.Decimal(65,3) // For water/power
  totalServiceFeesPaid  Decimal?               @db.Decimal(65,3) // For services
  
  // Link to original connection/subscription
  connectionId          String?                // For connection terminations
  subscriptionId        String?                // For subscription terminations
  
  createdAt             DateTime               @default(now())
  
  @@index([terminationType, terminationReason])
  @@index([connectionId])
  @@index([subscriptionId])
  @@map("connection_termination_details")
}
```

### 3. Structured Details Schema
The existing `details` JSON field will use structured schemas:

```typescript
// Base interface for all operation details
interface OperationDetails {
  // Common fields
  infrastructureType?: 'WATER' | 'POWER' | 'BASE_STATION' | 'FIRE_STATION';
  providerFacilityId: string;
  providerFacilityType: string;
  providerFacilityLevel: number;
  consumerFacilityId: string;
  consumerFacilityType: string;
  consumerFacilityLevel: number;
  actorTeamId: string;
  actorRole: 'PROVIDER' | 'CONSUMER' | 'SYSTEM';
  reason?: string;
  
  // Event-specific fields
  eventData: RequestDetails | ConnectionDetails | TerminationDetails;
}

// For CONNECTION_REQUESTED / SUBSCRIPTION_REQUESTED
interface RequestDetails {
  proposedPath?: Array<{q: number, r: number}>;  // For connections
  distance?: number;                               // For connections
  operationPointsNeeded?: number;                  // For connections
  proposedUnitPrice?: number;                      // Proposed pricing
  annualServiceFee?: number;                       // For services
  requestMessage?: string;                         // Optional message
}

// For CONNECTION_ACCEPTED / SUBSCRIPTION_ACCEPTED
interface ConnectionDetails {
  agreedUnitPrice?: number;        // For connections
  annualServiceFee?: number;       // For services
  connectionPath?: Array<{q: number, r: number}>;  // For connections
  coverageTiles?: Array<{q: number, r: number}>;   // For services
  effectiveDate: string;
}

// For CONNECTION_REJECTED / SUBSCRIPTION_REJECTED
interface RejectionDetails {
  rejectionReason: string;
  suggestedAlternative?: string;
  canReapplyAfter?: string;
}

// For CONNECTION_DISCONNECTED (both connections and subscriptions)
interface TerminationDetails {
  disconnectedBy: string;           // TeamId that initiated
  disconnectionReason: string;
  finalUsage?: number;              // For connections
  finalBilling?: number;
  unpaidAmount?: number;
  wasEmergency: boolean;
}
```

## Implementation Strategy

### Phase 1: Database Migration
Create migration to enhance existing InfrastructureOperationLog:

```sql
-- Add new columns to existing table
ALTER TABLE infrastructure_operation_logs
ADD COLUMN infrastructure_type VARCHAR(20),
ADD COLUMN service_type VARCHAR(20),
ADD COLUMN actor_role VARCHAR(20),
ADD COLUMN provider_facility_id VARCHAR(30),
ADD COLUMN consumer_facility_id VARCHAR(30);

-- Create new termination details table
CREATE TABLE connection_termination_details (
  -- table structure as defined above
);

-- Add indexes for performance
CREATE INDEX idx_infrastructure_type ON infrastructure_operation_logs(infrastructure_type, timestamp);
CREATE INDEX idx_service_type ON infrastructure_operation_logs(service_type, timestamp);
CREATE INDEX idx_entity ON infrastructure_operation_logs(entity_type, entity_id, timestamp);
```

### Phase 2: Service Layer Enhancement
Extend existing infrastructure services:

```typescript
// Enhanced logging service
export class InfrastructureLoggingService {
  constructor(
    private prisma: PrismaService,
    private existingLogService: InfrastructureOperationLogService
  ) {}

  async logConnectionRequest(data: {
    connectionType: InfrastructureType;
    consumerTeam: Team;
    providerTeam: Team;
    consumerFacility: TileFacilityInstance;
    providerFacility: TileFacilityInstance;
    proposedPath: Coordinate[];
    distance: number;
    operationPointsNeeded: number;
    proposedUnitPrice?: number;
    performedBy: string;
    activityId: string;
  }) {
    const details: OperationDetails = {
      infrastructureType: data.connectionType,
      providerFacilityId: data.providerFacility.id,
      providerFacilityType: data.providerFacility.facilityType,
      providerFacilityLevel: data.providerFacility.level,
      consumerFacilityId: data.consumerFacility.id,
      consumerFacilityType: data.consumerFacility.facilityType,
      consumerFacilityLevel: data.consumerFacility.level,
      actorTeamId: data.consumerTeam.id,
      actorRole: 'CONSUMER',
      eventData: {
        proposedPath: data.proposedPath,
        distance: data.distance,
        operationPointsNeeded: data.operationPointsNeeded,
        proposedUnitPrice: data.proposedUnitPrice
      }
    };

    return this.prisma.infrastructureOperationLog.create({
      data: {
        operationType: OperationType.CONNECTION_REQUESTED,
        providerTeamId: data.providerTeam.id,
        consumerTeamId: data.consumerTeam.id,
        entityType: 'ConnectionRequest',
        entityId: '', // Will be set to request ID
        details,
        performedBy: data.performedBy,
        activityId: data.activityId,
        // New fields
        infrastructureType: data.connectionType,
        actorRole: 'CONSUMER',
        providerFacilityId: data.providerFacility.id,
        consumerFacilityId: data.consumerFacility.id
      }
    });
  }

  async logConnectionTermination(data: {
    connection: InfrastructureConnection;
    disconnectedBy: string;
    disconnectionReason: string;
    performedBy: string;
    finalUsage?: number;
    unpaidAmount?: number;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // Create the operation log
      const log = await tx.infrastructureOperationLog.create({
        data: {
          operationType: OperationType.CONNECTION_DISCONNECTED,
          providerTeamId: data.connection.providerTeamId,
          consumerTeamId: data.connection.consumerTeamId,
          entityType: 'Connection',
          entityId: data.connection.id,
          details: {
            // Structured termination details
            disconnectedBy: data.disconnectedBy,
            disconnectionReason: data.disconnectionReason,
            finalUsage: data.finalUsage,
            unpaidAmount: data.unpaidAmount
          },
          performedBy: data.performedBy,
          activityId: data.connection.activityId,
          infrastructureType: data.connection.connectionType,
          actorRole: data.disconnectedBy === data.connection.providerTeamId ? 'PROVIDER' : 'CONSUMER'
        }
      });

      // Create detailed termination record
      await tx.connectionTerminationDetail.create({
        data: {
          operationLogId: log.id,
          terminationType: this.classifyTerminationType(data.disconnectionReason),
          initiatedBy: data.disconnectedBy === data.connection.providerTeamId ? 'PROVIDER' : 'CONSUMER',
          terminationReason: data.disconnectionReason,
          connectionId: data.connection.id,
          connectionDuration: this.calculateDuration(data.connection.connectedAt, new Date()),
          totalResourcesUsed: data.finalUsage,
          outstandingBalance: data.unpaidAmount
        }
      });

      return log;
    });
  }
}
```

### Phase 3: Query Implementation
Implement query patterns for history retrieval:

```typescript
// Repository for history queries
export class InfrastructureHistoryRepository {
  async getConnectionLifecycle(connectionId: string) {
    return this.prisma.infrastructureOperationLog.findMany({
      where: {
        OR: [
          { entityId: connectionId, entityType: 'Connection' },
          { entityId: connectionId, entityType: 'ConnectionRequest' }
        ]
      },
      include: {
        providerTeam: true,
        consumerTeam: true,
        performedByUser: true,
        terminationDetail: true
      },
      orderBy: { timestamp: 'asc' }
    });
  }

  async getTeamInfrastructureHistory(
    teamId: string,  // From auth context
    activityId: string,  // From auth context
    params: {
      role?: 'PROVIDER' | 'CONSUMER';
      infrastructureType?: InfrastructureType;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ) {
    const where: any = {
      activityId: activityId,
      timestamp: {
        gte: params.dateFrom,
        lte: params.dateTo
      }
    };

    if (params.role === 'PROVIDER') {
      where.providerTeamId = teamId;
    } else if (params.role === 'CONSUMER') {
      where.consumerTeamId = teamId;
    } else {
      where.OR = [
        { providerTeamId: teamId },
        { consumerTeamId: teamId }
      ];
    }

    if (params.infrastructureType) {
      where.infrastructureType = params.infrastructureType;
    }

    return this.prisma.infrastructureOperationLog.findMany({
      where,
      include: {
        providerTeam: true,
        consumerTeam: true,
        performedByUser: true,
        terminationDetail: true
      },
      orderBy: { timestamp: 'desc' }
    });
  }

  async getTerminationDetails(connectionId: string) {
    return this.prisma.connectionTerminationDetail.findOne({
      where: {
        connectionId
      },
      include: {
        operationLog: {
          include: {
            providerTeam: true,
            consumerTeam: true
          }
        }
      }
    });
  }
}
```

## API Endpoints

### Query Endpoints

#### 1. Get Connection History
```
GET /api/infrastructure/history/connection/{connectionId}
```
Returns complete event history for a specific connection.

Response includes:
- All state changes from request to termination
- Actor information for each event
- Structured event metadata
- Termination details if applicable

#### 2. Get Team Infrastructure History
```
GET /api/infrastructure/history/team
Query Parameters:
  - infrastructureType?: WATER | POWER | BASE_STATION | FIRE_STATION
  - operationType?: OperationType
  - dateFrom?: ISO 8601
  - dateTo?: ISO 8601
  - role?: PROVIDER | CONSUMER
```
Note: teamId and activityId are automatically obtained from the authenticated user's context

#### 3. Get Termination Details
```
GET /api/infrastructure/history/termination/{connectionId}
```
Returns detailed termination information including:
- Who initiated the termination
- Reason and classification
- Financial impact
- Connection duration and usage metrics


## Migration from Existing System

### Data Migration Script
```typescript
// Migrate existing logs to enhanced format
async function enhanceExistingLogs() {
  const existingLogs = await prisma.infrastructureOperationLog.findMany({
    where: {
      infrastructureType: null // Not yet enhanced
    }
  });

  for (const log of existingLogs) {
    const details = log.details as any;
    
    // Determine infrastructure type from entity
    let infrastructureType: InfrastructureType | undefined;
    let serviceType: ServiceType | undefined;
    
    if (log.entityType === 'Connection' || log.entityType === 'ConnectionRequest') {
      // Extract from related connection
      const connection = await prisma.infrastructureConnection.findUnique({
        where: { id: log.entityId }
      });
      infrastructureType = connection?.connectionType;
    } else if (log.entityType === 'Service' || log.entityType === 'Subscription') {
      // Extract from related service
      const service = await prisma.infrastructureService.findUnique({
        where: { id: log.entityId }
      });
      serviceType = service?.serviceType;
    }

    // Update with enhanced fields
    await prisma.infrastructureOperationLog.update({
      where: { id: log.id },
      data: {
        infrastructureType,
        serviceType,
        actorRole: determineActorRole(log, details),
        providerFacilityId: details.providerFacilityId,
        consumerFacilityId: details.consumerFacilityId
      }
    });
  }
}
```

## Benefits of This Approach

### 1. Backward Compatibility
- Existing code continues to work without modification
- Gradual migration path for enhanced features
- No breaking changes to API contracts

### 2. Performance Optimization
- Better indexing for common query patterns
- Structured data reduces JSON parsing overhead
- Dedicated termination table for complex analysis

### 3. Enhanced History Tracking
- Rich metadata for comprehensive audit trails
- Detailed termination tracking with reasons
- Complete lifecycle visibility for connections

### 4. Maintainability
- Extends existing system rather than replacing
- Clear separation of concerns
- Structured schemas improve data quality

## Security & Access Control

### Permission Levels
1. **Team Members**: View own team's history
2. **Team Managers**: View counterparty limited history
3. **Activity Admins**: Full access to activity data
4. **System Admins**: Complete access across all activities

### Data Privacy
- Sensitive financial data requires elevated permissions
- Personal user information masked in public queries
- Audit trail for all data access

## Implementation Status

### Completed Components ✅

1. **TypeScript Types & Interfaces**
   - `src/types/infrastructureHistory.ts` - Complete type definitions
   - `src/lib/utils/infrastructureHistoryHelpers.ts` - Helper utilities

2. **Service Layer**
   - `src/lib/services/infrastructureLoggingService.ts` - Logging service for events
   - `src/lib/services/infrastructureHistoryService.ts` - Query service for history

3. **UI Components**
   - `src/components/infrastructure/InfrastructureHistoryViewer.tsx` - Main history viewer
   - `src/app/(control-panel)/infrastructure/history/page.tsx` - History page

4. **Translations**
   - English translations added to `en.ts`
   - Chinese translations added to `zh.ts`

5. **Navigation**
   - History link added to navigation configuration

### Architecture Notes

The implementation follows a TypeScript/API client architecture rather than direct database access:
- Services communicate with backend APIs via `apiClient`
- Types are defined in TypeScript interfaces
- Material-UI components are used for the UI layer
- History tracking integrates with existing infrastructure management system

## Conclusion
This enhanced history tracking system builds upon the existing infrastructure logging to provide comprehensive lifecycle tracking and detailed termination records while maintaining full backward compatibility with the current implementation.