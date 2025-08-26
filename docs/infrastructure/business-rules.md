# Infrastructure System Business Rules

## Overview
This document defines the business rules, calculations, and operational logic for the infrastructure management system. All rules are based on the provider-consumer model with cross-team cooperation capabilities.

## Facility Categories and Infrastructure Requirements

### Facilities Requiring Infrastructure
Only facilities in these categories require all four types of infrastructure to operate:

1. **RAW_MATERIAL_PRODUCTION**
   - MINE (矿场)
   - QUARRY (采石场)
   - FOREST (林场)
   - FARM (农场)
   - RANCH (养殖场)
   - FISHERY (渔场)

2. **FUNCTIONAL**
   - FACTORY (工厂)
   - MALL (商场)
   - WAREHOUSE (仓库)

### Infrastructure Requirements Matrix

| Facility Category | Water | Power | Base Station | Fire Station |
|------------------|-------|-------|--------------|--------------|
| RAW_MATERIAL_PRODUCTION | ✓ | ✓ | ✓ | ✓ |
| FUNCTIONAL | ✓ | ✓ | ✓ | ✓ |
| INFRASTRUCTURE | ✗ | ✗ | ✗ | ✗ |
| OTHER (Population) | ✗ | ✗ | ✗ | ✗ |

### Operational Status Determination

```typescript
enum OperationalStatus {
  FULL = "FULL",                 // All 4 infrastructure connected
  PARTIAL = "PARTIAL",           // 1-3 infrastructure connected
  NON_OPERATIONAL = "NON_OPERATIONAL" // 0 infrastructure connected
}

function determineOperationalStatus(facility: Facility): OperationalStatus {
  if (!requiresInfrastructure(facility)) {
    return OperationalStatus.FULL;
  }
  
  const connections = getInfrastructureConnections(facility);
  const connectedCount = [
    connections.water,
    connections.power,
    connections.baseStation,
    connections.fireStation
  ].filter(Boolean).length;
  
  if (connectedCount === 4) return OperationalStatus.FULL;
  if (connectedCount > 0) return OperationalStatus.PARTIAL;
  return OperationalStatus.NON_OPERATIONAL;
}
```

## Distance Calculations

### Hexagonal Grid Distance Formula
The system uses axial coordinates (q, r) for hexagonal grid positioning.

```typescript
function calculateHexDistance(from: {q: number, r: number}, to: {q: number, r: number}): number {
  return (
    Math.abs(from.q - to.q) + 
    Math.abs(from.q + from.r - to.q - to.r) + 
    Math.abs(from.r - to.r)
  ) / 2;
}
```

### Examples
- Adjacent tiles: distance = 1
- Two tiles apart: distance = 2
- Diagonal movement: calculated using the formula above

## Water and Power Plant Rules

### Operation Points Calculation

#### Base Configuration (from MapTemplateInfrastructureConfig)
- `waterPlantBaseOperationPoints`: Base operation points for level 1
- `powerPlantBaseOperationPoints`: Base operation points for level 1
- `waterPlantIndex`: Efficiency multiplier for water plants
- `powerPlantIndex`: Efficiency multiplier for power plants

#### Level-Based Capacity

```typescript
function calculateOperationPoints(
  facilityType: 'WATER_PLANT' | 'POWER_PLANT',
  level: number,
  config: InfrastructureConfig
): number {
  const basePoints = facilityType === 'WATER_PLANT' 
    ? config.waterPlantBaseOperationPoints 
    : config.powerPlantBaseOperationPoints;
    
  const index = facilityType === 'WATER_PLANT'
    ? config.waterPlantIndex
    : config.powerPlantIndex;
    
  // Level 1: base points
  // Level 2+: base * index^(level-1)
  return basePoints * Math.pow(index, level - 1);
}
```

#### Example Calculation
Given:
- `waterPlantBaseOperationPoints` = 50
- `waterPlantIndex` = 1.5
- Facility Level = 3

Calculation:
- Total Points = 50 * 1.5^(3-1) = 50 * 2.25 = 112.5 points

### Connection Cost Calculation

Each connection from a provider to a consumer costs operation points based on distance.

```typescript
function calculateConnectionCost(distance: number): number {
  return distance + 1;
}
```

#### Examples
- Adjacent facility (distance = 1): costs 2 operation points
- Distance = 5: costs 6 operation points
- Same tile (distance = 0): costs 1 operation point

### Unit Price Calculation

Providers can set their own unit prices, but the system calculates a suggested price based on level.

```typescript
function calculateSuggestedUnitPrice(
  facilityType: 'WATER_PLANT' | 'POWER_PLANT',
  level: number,
  config: InfrastructureConfig
): number {
  const basePrice = facilityType === 'WATER_PLANT'
    ? config.waterResourceBasePrice
    : config.electricityResourceBasePrice;
    
  const index = facilityType === 'WATER_PLANT'
    ? config.waterPlantIndex
    : config.powerPlantIndex;
    
  // Higher level = lower unit cost (more efficient)
  return basePrice / Math.pow(index, level - 1);
}
```

### Capacity Management

```typescript
interface ProviderCapacity {
  totalOperationPoints: number;
  usedOperationPoints: number;
  availableOperationPoints: number;
  activeConnections: Connection[];
  maxAdditionalConnections: number; // Based on remaining points
}

function canAcceptConnection(
  provider: Facility,
  consumerDistance: number
): boolean {
  const connectionCost = calculateConnectionCost(consumerDistance);
  const capacity = getProviderCapacity(provider);
  return capacity.availableOperationPoints >= connectionCost;
}
```

## Base Station and Fire Station Rules

### Influence Range Calculation

Service facilities provide coverage based on their level.

```typescript
function calculateInfluenceRange(facilityLevel: number): number {
  // Level 1: range = 0 (only same tile)
  // Level 2: range = 1 (adjacent tiles)
  // Level 3: range = 2 (two tiles away)
  return facilityLevel - 1;
}
```

### Coverage Area Determination

```typescript
function getTilesInRange(
  center: {q: number, r: number},
  range: number
): Array<{q: number, r: number, distance: number}> {
  const tiles = [];
  
  for (let q = -range; q <= range; q++) {
    for (let r = -range; r <= range; r++) {
      const s = -q - r;
      if (Math.abs(s) <= range) {
        const tile = {
          q: center.q + q,
          r: center.r + r,
          distance: calculateHexDistance(center, {q: center.q + q, r: center.r + r})
        };
        if (tile.distance <= range) {
          tiles.push(tile);
        }
      }
    }
  }
  
  return tiles;
}
```

### Service Eligibility

```typescript
function isEligibleForService(
  consumer: Facility,
  service: InfrastructureService
): boolean {
  const distance = calculateHexDistance(
    consumer.location,
    service.location
  );
  return distance <= service.influenceRange;
}
```

### Annual Fee Structure

- Base cost defined in `MapTemplateInfrastructureConfig`:
  - `baseStationBaseCost`: Base annual fee for BASE_STATION
  - `fireStationBaseCost`: Base annual fee for FIRE_STATION
- Providers can adjust fees for their services
- Fees are charged annually (in-game time)

## Path Validation Rules

### Marine Crossing Restriction

Connections between water/power plants and consumers cannot cross MARINE land types.

```typescript
interface PathValidation {
  valid: boolean;
  path: Array<{q: number, r: number}>;
  crossesMarine: boolean;
  alternativePaths?: Array<Path>;
}

function validateConnectionPath(
  from: {q: number, r: number},
  to: {q: number, r: number},
  tiles: Map<string, LandType>
): PathValidation {
  const path = findShortestPath(from, to, tiles);
  
  // Check if any tile in path is MARINE
  const crossesMarine = path.some(tile => {
    const key = `${tile.q},${tile.r}`;
    return tiles.get(key) === LandType.MARINE;
  });
  
  if (crossesMarine) {
    // Try to find alternative paths
    const alternatives = findAlternativePaths(from, to, tiles);
    return {
      valid: false,
      path: path,
      crossesMarine: true,
      alternativePaths: alternatives
    };
  }
  
  return {
    valid: true,
    path: path,
    crossesMarine: false
  };
}
```

### Path Finding Algorithm

The system should implement A* or Dijkstra's algorithm for optimal path finding:

```typescript
function findShortestPath(
  start: {q: number, r: number},
  end: {q: number, r: number},
  tiles: Map<string, TileInfo>,
  avoidMarine: boolean = true
): Array<{q: number, r: number}> {
  // A* implementation
  const openSet = new PriorityQueue<Node>();
  const closedSet = new Set<string>();
  const cameFrom = new Map<string, Node>();
  
  // ... A* algorithm implementation
  // Avoid MARINE tiles when avoidMarine is true
  // Return shortest valid path
}
```

## Cross-Team Cooperation Rules

### Connection/Subscription Restrictions

**Fundamental Rule**: One connection/subscription per infrastructure type per consumer facility.

```typescript
interface InfrastructureRestrictions {
  // Each consumer facility can have:
  maxActiveConnectionsPerType: 1;  // One WATER connection, one POWER connection
  maxPendingRequestsPerType: 1;    // If no active connection, only one pending request
  maxActiveSubscriptionsPerType: 1; // One BASE_STATION subscription, one FIRE_STATION subscription
}

function canCreateRequest(
  consumerFacility: Facility,
  infrastructureType: InfrastructureType
): ValidationResult {
  // Check for existing active connection/subscription
  const hasActive = hasActiveInfrastructure(consumerFacility, infrastructureType);
  if (hasActive) {
    return { valid: false, reason: "ALREADY_CONNECTED" };
  }
  
  // Check for existing pending request
  const hasPending = hasPendingRequest(consumerFacility, infrastructureType);
  if (hasPending) {
    return { valid: false, reason: "PENDING_REQUEST_EXISTS" };
  }
  
  return { valid: true };
}
```

### Connection Request Workflow

1. **Pre-Request Validation**
   - Check if consumer already has active connection for this type
   - Check if consumer has pending request for this type
   - If either exists, must cancel/disconnect first

2. **Discovery Phase**
   - Consumer discovers available providers
   - System calculates distance and validates paths
   - Consumer sees provider pricing and capacity

3. **Request Phase**
   - Consumer sends connection request (only if validation passes)
   - Optional: Include proposed unit price
   - System enforces one pending request per type

4. **Response Phase**
   - Provider reviews request
   - Can accept with original or adjusted price
   - Can reject with reason

5. **Connection Phase**
   - On acceptance, connection becomes active
   - Any other pending requests for same type are auto-cancelled
   - Operation points deducted from provider
   - Consumer starts paying per unit consumed

### Service Subscription Workflow

1. **Eligibility Check**
   - Consumer facility must be within service range
   - Service must have available capacity (if limited)

2. **Subscription Request**
   - Consumer requests subscription
   - Can propose different annual fee

3. **Provider Response**
   - Accept with original or adjusted fee
   - Reject with reason

4. **Active Subscription**
   - Service becomes active immediately
   - Annual billing cycle starts

### Disconnection Rules

Either party can disconnect with the following rules:

#### Provider-Initiated Disconnection
- Must provide reason
- Consumer notified immediately
- Grace period of 1 game day before disconnection (configurable)

#### Consumer-Initiated Disconnection
- Immediate disconnection
- Provider capacity freed up
- No refund for partial billing periods


## Capacity and Load Management

### Provider Load Calculation

```typescript
interface ProviderLoad {
  facilityId: string;
  type: 'WATER_PLANT' | 'POWER_PLANT';
  level: number;
  connections: Array<{
    consumerId: string;
    distance: number;
    operationPointsCost: number;
  }>;
  totalCapacity: number;
  usedCapacity: number;
  utilizationPercentage: number;
}

function calculateProviderLoad(provider: Facility): ProviderLoad {
  const connections = getActiveConnections(provider);
  const totalCapacity = calculateOperationPoints(
    provider.type,
    provider.level,
    getConfig()
  );
  
  const usedCapacity = connections.reduce((sum, conn) => {
    return sum + calculateConnectionCost(conn.distance);
  }, 0);
  
  return {
    facilityId: provider.id,
    type: provider.type,
    level: provider.level,
    connections: connections,
    totalCapacity: totalCapacity,
    usedCapacity: usedCapacity,
    utilizationPercentage: (usedCapacity / totalCapacity) * 100
  };
}
```

### Service Coverage Analytics

```typescript
interface ServiceCoverage {
  serviceId: string;
  type: 'BASE_STATION' | 'FIRE_STATION';
  level: number;
  coverageTiles: number;
  potentialConsumers: number;
  activeSubscriptions: number;
  coverageEfficiency: number; // percentage of potential covered
}

function analyzeServiceCoverage(service: Service): ServiceCoverage {
  const range = calculateInfluenceRange(service.level);
  const tilesInRange = getTilesInRange(service.location, range);
  
  const potentialConsumers = tilesInRange
    .map(tile => getFacilitiesOnTile(tile))
    .flat()
    .filter(facility => requiresInfrastructure(facility));
    
  const activeSubscriptions = getActiveSubscriptions(service);
  
  return {
    serviceId: service.id,
    type: service.type,
    level: service.level,
    coverageTiles: tilesInRange.length,
    potentialConsumers: potentialConsumers.length,
    activeSubscriptions: activeSubscriptions.length,
    coverageEfficiency: potentialConsumers.length > 0
      ? (activeSubscriptions.length / potentialConsumers.length) * 100
      : 0
  };
}
```

## Billing and Payment Rules

### Resource Consumption Billing (Water/Power)

- **Billing Cycle**: Per unit consumed
- **Payment**: Deducted from team account
- **Calculation**: `consumption * unitPrice`

### Service Subscription Billing (Base/Fire Station)

- **Billing Cycle**: Annual (in-game time)
- **Payment**: Deducted at start of billing period

### Failed Payment Handling

```typescript
enum PaymentFailureAction {
  SUSPEND_SERVICE = "SUSPEND_SERVICE",     // Temporary suspension
  DISCONNECT_SERVICE = "DISCONNECT_SERVICE", // Permanent disconnection
  GRACE_PERIOD = "GRACE_PERIOD"           // Allow grace period
}

function handlePaymentFailure(
  connection: Connection | Subscription,
  failureCount: number
): PaymentFailureAction {
  if (failureCount === 1) {
    // First failure: grace period
    return PaymentFailureAction.GRACE_PERIOD;
  } else if (failureCount === 2) {
    // Second failure: suspend
    return PaymentFailureAction.SUSPEND_SERVICE;
  } else {
    // Third failure: disconnect
    return PaymentFailureAction.DISCONNECT_SERVICE;
  }
}
```

## Upgrade Impact Rules

When a facility is upgraded, the following changes occur:

### Water/Power Plant Upgrades
1. Operation points increase based on formula
2. Unit cost efficiency improves
3. Existing connections maintained
4. New capacity available for additional connections

### Base/Fire Station Upgrades
1. Influence range expands
2. More facilities become eligible for service
3. Existing subscriptions maintained
4. Can accept new subscriptions in expanded area

## Activity Lifecycle Rules

### Activity Start
1. All facilities start without infrastructure connections
2. Infrastructure facilities become available for connections
3. Teams must establish infrastructure before operations begin

### During Activity
1. Connections can be created/modified/deleted
2. Prices can be adjusted by providers
3. Teams can switch providers
4. New facilities inherit no connections (must establish)

### Activity End
1. All connections terminated
2. Final billing calculations
3. Infrastructure performance metrics calculated
4. No carryover to next activity

## Performance Metrics

### Provider Metrics
```typescript
interface ProviderMetrics {
  totalRevenue: number;
  totalConnections: number;
  averageUtilization: number;
  connectionUptime: number; // percentage
  customerSatisfaction: number; // based on disconnections
}
```

### Consumer Metrics
```typescript
interface ConsumerMetrics {
  totalInfrastructureCost: number;
  operationalUptime: number; // percentage with full infrastructure
  averageCostPerUnit: number;
  serviceReliability: number; // based on disconnections
}
```

## Validation Rules Summary

1. **Connection Validation**
   - Path cannot cross MARINE tiles
   - Provider must have sufficient operation points
   - Consumer must not have existing active connection of same type
   - Consumer must not have existing pending request of same type (must cancel first)
   - Both facilities must be in same activity

2. **Service Validation**
   - Consumer must be within influence range
   - Service must be active
   - Consumer must not have existing active subscription of same type
   - Consumer must not have existing pending request of same type (must cancel first)
   - Both facilities must be in same activity

3. **Team Validation**
   - User must belong to team
   - User must have appropriate role (manager/worker for operations)
   - Team must own the facility

4. **Activity Validation**
   - Activity must be active
   - Operations must occur during activity timeframe
   - All parties must be enrolled in same activity