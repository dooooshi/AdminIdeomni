# Infrastructure System Data Model

## Overview
This document defines the data model for the infrastructure management system within the facility module. The system enables cross-team cooperation for resource sharing (water/power) and services (base station/fire station).

## Core Concepts

### Provider-Consumer Relationship
- **Providers**: Teams that own infrastructure facilities (WATER_PLANT, POWER_PLANT, BASE_STATION, FIRE_STATION)
- **Consumers**: Teams that own facilities requiring infrastructure (RAW_MATERIAL_PRODUCTION, FUNCTIONAL)

### Infrastructure Types
1. **Resource Infrastructure**: WATER_PLANT, POWER_PLANT (connection-based, distance affects cost)
2. **Service Infrastructure**: BASE_STATION, FIRE_STATION (range-based coverage)

### Connection/Subscription Restrictions
**Critical Rule**: Each consumer facility can only have ONE connection/subscription per infrastructure type:

1. **For Water/Power Connections**:
   - Maximum ONE active connection per type (one for WATER, one for POWER)
   - If no active connection exists, can only have ONE pending request per type
   - Must cancel existing pending request before applying to a different provider

2. **For Base/Fire Station Services**:
   - Maximum ONE active subscription per type (one for BASE_STATION, one for FIRE_STATION)
   - If no active subscription exists, can only have ONE pending request per type
   - Must cancel existing pending request before applying to a different provider

## Prisma Models

### 1. InfrastructureConnection
Tracks active water/power connections between provider and consumer facilities.

```prisma
model InfrastructureConnection {
  id                    String                 @id @default(cuid())
  connectionType        InfrastructureType     // WATER or POWER
  
  // Provider information
  providerFacilityId    String
  providerFacility      TileFacilityInstance   @relation("ProviderConnections", fields: [providerFacilityId], references: [id])
  providerTeamId        String
  providerTeam          Team                   @relation("ProviderTeamConnections", fields: [providerTeamId], references: [id])
  
  // Consumer information
  consumerFacilityId    String
  consumerFacility      TileFacilityInstance   @relation("ConsumerConnections", fields: [consumerFacilityId], references: [id])
  consumerTeamId        String
  consumerTeam          Team                   @relation("ConsumerTeamConnections", fields: [consumerTeamId], references: [id])
  
  // Connection details
  connectionPath        Json                   // Array of {q: number, r: number} coordinates
  distance              Int                    // Hexagonal distance
  operationPointsCost   Int                    // (distance + 1)
  unitPrice             Decimal                @db.Decimal(65,3) // Price per unit set by provider
  
  // Status tracking
  status                ConnectionStatus       @default(ACTIVE)
  connectedAt           DateTime               @default(now())
  disconnectedAt        DateTime?
  disconnectedBy        String?                // TeamId that initiated disconnection
  disconnectionReason   String?
  
  // Activity context
  activityId            String
  activity              Activity               @relation(fields: [activityId], references: [id])
  
  // System fields
  createdAt             DateTime               @default(now())
  updatedAt             DateTime               @updatedAt
  
  // Ensure unique connection per type per consumer facility
  // A consumer facility can only have ONE active connection per infrastructure type (WATER or POWER)
  @@unique([consumerFacilityId, connectionType])
  @@index([providerFacilityId, status])
  @@index([consumerFacilityId, status])
  @@map("infrastructure_connections")
}

enum InfrastructureType {
  WATER
  POWER
}

enum ConnectionStatus {
  ACTIVE
  DISCONNECTED
  SUSPENDED     // Temporarily suspended (e.g., maintenance)
}
```

### 2. InfrastructureConnectionRequest
Manages connection applications from consumers to providers.

```prisma
model InfrastructureConnectionRequest {
  id                    String                 @id @default(cuid())
  connectionType        InfrastructureType
  
  // Request parties
  consumerTeamId        String
  consumerTeam          Team                   @relation("ConsumerConnectionRequests", fields: [consumerTeamId], references: [id])
  consumerFacilityId    String
  consumerFacility      TileFacilityInstance   @relation("ConsumerFacilityRequests", fields: [consumerFacilityId], references: [id])
  
  providerTeamId        String
  providerTeam          Team                   @relation("ProviderConnectionRequests", fields: [providerTeamId], references: [id])
  providerFacilityId    String
  providerFacility      TileFacilityInstance   @relation("ProviderFacilityRequests", fields: [providerFacilityId], references: [id])
  
  // Request details
  proposedPath          Json                   // Proposed connection path
  distance              Int
  operationPointsNeeded Int
  proposedUnitPrice     Decimal?               @db.Decimal(65,3) // Optional proposed unit price
  
  // Status tracking
  status                RequestStatus          @default(PENDING)
  respondedAt           DateTime?
  
  // Activity context
  activityId            String
  activity              Activity               @relation(fields: [activityId], references: [id])
  
  // System fields
  createdAt             DateTime               @default(now())
  updatedAt             DateTime               @updatedAt
  
  // Prevent duplicate requests and enforce single pending request per type
  // A consumer facility can only have ONE pending request per infrastructure type
  // Must cancel existing pending request before creating a new one
  @@unique([consumerFacilityId, connectionType, status])
  @@index([providerTeamId, status])
  @@index([consumerTeamId, status])
  @@map("infrastructure_connection_requests")
}

enum RequestStatus {
  PENDING
  ACCEPTED
  REJECTED
  CANCELLED
}
```

### 3. InfrastructureService
Tracks base station/fire station services and their coverage areas.

```prisma
model InfrastructureService {
  id                    String                 @id @default(cuid())
  serviceType           ServiceType            // BASE_STATION or FIRE_STATION
  
  // Provider information
  providerFacilityId    String                 @unique
  providerFacility      TileFacilityInstance   @relation("ServiceProvider", fields: [providerFacilityId], references: [id])
  providerTeamId        String
  providerTeam          Team                   @relation("ServiceProviderTeam", fields: [providerTeamId], references: [id])
  
  // Service configuration
  facilityLevel         Int                    // Current facility level
  influenceRange        Int                    // (level - 1) tiles distance
  annualServiceFee      Decimal                @db.Decimal(65,3) // Annual fee set by provider
  
  // Coverage area
  coverageTiles         Json                   // Array of {q: number, r: number} within range
  
  // Status
  isActive              Boolean                @default(true)
  maintenanceMode       Boolean                @default(false)
  
  // Activity context
  activityId            String
  activity              Activity               @relation(fields: [activityId], references: [id])
  
  // Relationships
  subscriptions         InfrastructureServiceSubscription[]
  
  // System fields
  createdAt             DateTime               @default(now())
  updatedAt             DateTime               @updatedAt
  
  @@index([serviceType, activityId, isActive])
  @@map("infrastructure_services")
}

enum ServiceType {
  BASE_STATION
  FIRE_STATION
}
```

### 4. InfrastructureServiceSubscription
Manages service subscriptions between consumers and service providers.

```prisma
model InfrastructureServiceSubscription {
  id                    String                 @id @default(cuid())
  
  // Consumer information
  consumerFacilityId    String
  consumerFacility      TileFacilityInstance   @relation("ServiceConsumer", fields: [consumerFacilityId], references: [id])
  consumerTeamId        String
  consumerTeam          Team                   @relation("ServiceConsumerTeam", fields: [consumerTeamId], references: [id])
  
  // Service information
  serviceId             String
  service               InfrastructureService  @relation(fields: [serviceId], references: [id])
  serviceType           ServiceType
  
  // Provider information (denormalized for query performance)
  providerTeamId        String
  providerTeam          Team                   @relation("ServiceProviderTeamSubs", fields: [providerTeamId], references: [id])
  
  // Subscription details
  annualFee             Decimal                @db.Decimal(65,3)
  status                SubscriptionStatus     @default(PENDING)
  
  // Timing
  requestedAt           DateTime               @default(now())
  activatedAt           DateTime?
  nextBillingDate       DateTime?
  cancelledAt           DateTime?
  cancelledBy           String?                // TeamId that cancelled
  cancellationReason    String?
  
  // Activity context
  activityId            String
  activity              Activity               @relation(fields: [activityId], references: [id])
  
  // System fields
  createdAt             DateTime               @default(now())
  updatedAt             DateTime               @updatedAt
  
  // Ensure one subscription per service type per consumer facility
  // A consumer facility can only have ONE subscription per service type (BASE_STATION or FIRE_STATION)
  // Can only have one PENDING or ACTIVE subscription at a time
  @@unique([consumerFacilityId, serviceType])
  @@index([serviceId, status])
  @@index([consumerTeamId, status])
  @@map("infrastructure_service_subscriptions")
}

enum SubscriptionStatus {
  PENDING
  ACTIVE
  CANCELLED
  SUSPENDED
  REJECTED
}
```

### 5. InfrastructureOperationLog
Audit log for all infrastructure operations.

```prisma
model InfrastructureOperationLog {
  id                    String                 @id @default(cuid())
  operationType         OperationType
  
  // Parties involved
  providerTeamId        String?
  providerTeam          Team?                  @relation("ProviderOperationLogs", fields: [providerTeamId], references: [id])
  consumerTeamId        String?
  consumerTeam          Team?                  @relation("ConsumerOperationLogs", fields: [consumerTeamId], references: [id])
  
  // Operation details
  entityType            String                 // Connection, Service, Request, Subscription
  entityId              String                 // ID of the affected entity
  details               Json                   // Detailed operation data
  
  // User tracking
  performedBy           String
  performedByUser       User                   @relation(fields: [performedBy], references: [id])
  
  // Activity context
  activityId            String
  activity              Activity               @relation(fields: [activityId], references: [id])
  
  // System fields
  timestamp             DateTime               @default(now())
  
  @@index([providerTeamId, timestamp])
  @@index([consumerTeamId, timestamp])
  @@index([activityId, operationType, timestamp])
  @@map("infrastructure_operation_logs")
}

enum OperationType {
  CONNECTION_REQUESTED
  CONNECTION_ACCEPTED
  CONNECTION_REJECTED
  CONNECTION_CANCELLED
  CONNECTION_DISCONNECTED
  
  SERVICE_CREATED
  SERVICE_FEE_UPDATED
  SERVICE_DEACTIVATED
  
  SUBSCRIPTION_REQUESTED
  SUBSCRIPTION_ACCEPTED
  SUBSCRIPTION_REJECTED
  SUBSCRIPTION_CANCELLED
}
```

## Relationships with Existing Models

### TileFacilityInstance Extensions
Add relationships to track infrastructure connections and services:

```prisma
// Add to existing TileFacilityInstance model
model TileFacilityInstance {
  // ... existing fields ...
  
  // Infrastructure relationships
  providerConnections   InfrastructureConnection[]      @relation("ProviderConnections")
  consumerConnections   InfrastructureConnection[]      @relation("ConsumerConnections")
  
  providerConnectionRequests InfrastructureConnectionRequest[] @relation("ProviderFacilityRequests")
  consumerConnectionRequests InfrastructureConnectionRequest[] @relation("ConsumerFacilityRequests")
  
  infrastructureService InfrastructureService?          @relation("ServiceProvider")
  serviceSubscriptions  InfrastructureServiceSubscription[] @relation("ServiceConsumer")
}
```

### Team Extensions
Add relationships for infrastructure operations:

```prisma
// Add to existing Team model
model Team {
  // ... existing fields ...
  
  // Infrastructure provider relationships
  providerConnections       InfrastructureConnection[]       @relation("ProviderTeamConnections")
  providerConnectionRequests InfrastructureConnectionRequest[] @relation("ProviderConnectionRequests")
  providerServices          InfrastructureService[]          @relation("ServiceProviderTeam")
  providerServiceSubscriptions InfrastructureServiceSubscription[] @relation("ServiceProviderTeamSubs")
  providerOperationLogs     InfrastructureOperationLog[]     @relation("ProviderOperationLogs")
  
  // Infrastructure consumer relationships
  consumerConnections       InfrastructureConnection[]       @relation("ConsumerTeamConnections")
  consumerConnectionRequests InfrastructureConnectionRequest[] @relation("ConsumerConnectionRequests")
  consumerServiceSubscriptions InfrastructureServiceSubscription[] @relation("ServiceConsumerTeam")
  consumerOperationLogs     InfrastructureOperationLog[]     @relation("ConsumerOperationLogs")
}
```

### Activity Extensions
Add infrastructure-related relationships:

```prisma
// Add to existing Activity model
model Activity {
  // ... existing fields ...
  
  // Infrastructure relationships
  infrastructureConnections InfrastructureConnection[]
  infrastructureConnectionRequests InfrastructureConnectionRequest[]
  infrastructureServices InfrastructureService[]
  infrastructureServiceSubscriptions InfrastructureServiceSubscription[]
  infrastructureOperationLogs InfrastructureOperationLog[]
}
```

### User Extensions
Add operation log relationship:

```prisma
// Add to existing User model
model User {
  // ... existing fields ...
  
  // Infrastructure operation logs
  infrastructureOperations InfrastructureOperationLog[]
}
```

## Database Indexes Strategy

### Performance Optimization
1. **Provider lookups**: Index on `providerFacilityId` and `providerTeamId`
2. **Consumer lookups**: Index on `consumerFacilityId` and `consumerTeamId`
3. **Status filtering**: Composite indexes including status fields
4. **Activity scoping**: Include `activityId` in composite indexes
5. **Time-based queries**: Index on timestamp fields for logs

### Query Patterns
- Find all active connections for a facility
- List pending requests for a team
- Check service coverage for a tile
- Get infrastructure status for a facility
- Audit trail for a team's operations

## Migration Considerations

### Initial Setup
1. Create all infrastructure tables
2. Add foreign key relationships
3. Create indexes for performance
4. Seed initial configuration data

### Data Integrity
- Use transactions for connection/subscription operations
- Implement soft deletes where appropriate
- Maintain audit logs for all operations
- Validate path constraints (no MARINE crossing)
- Enforce unique constraints to prevent duplicates

## Performance Considerations

### Query Optimization
1. Use denormalized fields for frequently accessed data
2. Implement pagination for list endpoints
3. Use database views for complex status calculations
4. Consider read replicas for discovery queries