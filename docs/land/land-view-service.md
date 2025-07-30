# Land View Service Guide

The LandViewService provides shared viewing functionality for land management operations, serving as a common layer between student/worker interfaces and manager oversight systems. This service handles data retrieval, ownership calculations, and permission-based access to land information.

## Service Overview

### Purpose

The LandViewService acts as a centralized data access layer that:
- Provides common land viewing functionality for both student and manager interfaces
- Handles activity-scoped data retrieval with proper security boundaries
- Integrates with the hexagonal map system for enhanced tile information
- Manages ownership calculations and aggregations
- Enforces permission-based access to land data

### Architecture Position

```
┌─────────────────────────────────────────────────────────┐
│                 Controller Layer                        │
│  • LandPurchaseController                              │
│  • ManagerLandController                               │
├─────────────────────────────────────────────────────────┤
│                 Service Layer                           │
│  • LandPurchaseService ──┐                            │
│  • ManagerLandService ───┼──► LandViewService         │
│  • Other Services ───────┘                            │
├─────────────────────────────────────────────────────────┤
│                Repository Layer                         │
│  • TileLandOwnershipRepository                         │
│  • ActivityTileStateService                            │
│  • UserActivityRepository                              │
│  • TeamRepository                                      │
└─────────────────────────────────────────────────────────┘
```

## Core Functionality

### Activity Map Integration

#### getActivityMapForUser(userId: string)

Retrieves complete activity map data for a user's current activity.

**Purpose:**
- Provide foundational map data for land interfaces
- Ensure activity-scoped data access
- Support map-based land visualization

**Implementation Details:**
```typescript
async getActivityMapForUser(userId: string): Promise<any[]> {
  // 1. Get user's current activity
  const userActivity = await this.userActivityRepository.getUserCurrentActivity(userId);
  
  // 2. Retrieve all tile states for the activity
  const tileStates = await this.activityTileStateService.getActivityTileStatesByActivity(
    userActivity.activityId
  );
  
  return tileStates;
}
```

**Use Cases:**
- Loading initial map data for student interfaces
- Providing base map information for purchase decisions
- Supporting manager oversight map visualizations

### Detailed Tile Analysis

#### getTileDetailsWithOwnership(userId: string, tileId: number)

Provides comprehensive tile information including ownership breakdown and current state.

**Purpose:**
- Support detailed tile analysis before purchases
- Provide ownership transparency across teams
- Enable strategic decision-making with complete information

**Data Integration:**
- **Tile Information**: Basic tile properties from map system
- **Current State**: Real-time pricing and population data
- **Ownership Details**: Complete breakdown by team with purchase history
- **Availability Calculation**: Remaining purchasable area

**Response Structure:**
```typescript
interface TileDetailsWithOwnershipDto {
  tile: {
    id: number;
    axialQ: number;
    axialR: number;
    landType: string;
    initialGoldPrice?: number;
    initialCarbonPrice?: number;
    initialPopulation?: number;
    transportationCostUnit?: number;
  };
  currentState: {
    currentGoldPrice?: number;
    currentCarbonPrice?: number;
    currentPopulation?: number;
    lastUpdated: Date;
  };
  ownership: TileOwnershipDetailDto[];
  totalOwnedArea: number;
  availableArea: number;
}
```

### Team Ownership Management

#### getTeamLandSummary(userId: string)

Generates comprehensive ownership summary for the user's team.

**Purpose:**
- Provide team portfolio overview
- Support strategic planning with historical data
- Enable performance tracking and analysis

**Calculation Logic:**
- Aggregates all team ownership records across tiles
- Calculates total area, spending, and purchase metrics
- Handles edge cases (no purchases, empty teams)
- Provides meaningful defaults for new teams

**Implementation Highlights:**
```typescript
// Handle teams with no land purchases
if (summary.tilesOwnedCount === 0) {
  return {
    teamId: userTeam.id,
    teamName: userTeam.name,
    totalOwnedArea: 0,
    totalSpent: 0,
    // ... other zero values
  };
}
```

### Available Tiles Discovery

#### getAvailableTilesForUser(userId: string)

Discovers all tiles available for purchase with ownership context.

**Purpose:**
- Enable efficient tile discovery for purchase planning
- Provide ownership context for strategic decisions
- Support competitive analysis

**Enhanced Information:**
- **Ownership Status**: Current ownership by all teams
- **Team Position**: User's team ownership on each tile
- **Purchase Capability**: Whether team can purchase more area
- **Availability Metrics**: Remaining area for acquisition

### Enhanced Tile States

#### getTileStatesForTeamView(userId: string, includeOwnership: boolean)

Provides enhanced tile state information with optional ownership overlay.

**Purpose:**
- Support map-based interfaces with ownership information
- Enable efficient bulk data retrieval
- Provide flexible ownership detail inclusion

**Performance Optimization:**
```typescript
// Optional ownership enhancement
if (!includeOwnership) {
  return tileStates; // Return basic states quickly
}

// Enhanced processing for ownership data
for (const tileState of tileStates) {
  const totalOwnedArea = await this.tileLandOwnershipRepository.getTileTotalOwnedArea(
    userActivity.activityId,
    tileState.tile.id
  );
  // ... additional ownership calculations
}
```

**Ownership Enhancement:**
- **Total Ownership**: Area owned by all teams
- **Team Ownership**: Specific team's ownership
- **Available Area**: Calculated remaining area
- **Purchase Status**: Whether more purchases are possible

## Permission and Security

### Activity Scoping

All LandViewService operations are strictly scoped to the user's current activity:

```typescript
// Standard activity validation pattern
const userActivity = await this.userActivityRepository.getUserCurrentActivity(userId);
if (!userActivity) {
  throw BusinessException.generic('USER_NO_ACTIVITY');
}
```

**Security Benefits:**
- Prevents cross-activity data leakage
- Ensures users only see relevant information
- Maintains simulation integrity

### Permission Checking

#### canUserViewLandInfo(userId: string)

Validates whether a user has permission to view land information.

**Validation Criteria:**
- User must be enrolled in an active activity
- User account must be valid and authenticated
- Activity must be currently accessible

**Usage Pattern:**
```typescript
const canView = await this.landViewService.canUserViewLandInfo(userId);
if (!canView) {
  // Handle permission denial
}
```

### Data Access Control

The service implements graduated access control:

- **Public Information**: Basic tile states and general availability
- **Team Information**: User's team ownership and purchase capability
- **Private Information**: Other teams' detailed financial data (restricted)

## Integration Patterns

### Activity Tile State Integration

```typescript
// Efficient tile state retrieval
const tileStates = await this.activityTileStateService.getActivityTileStates({
  activityId: userActivity.activityId,
  tileId: specificTileId, // Optional filtering
});
```

**Integration Benefits:**
- Real-time pricing information
- Current population and state data
- Consistent tile identification
- Efficient bulk operations

### Team Repository Integration

```typescript
// Team context resolution
const userTeam = await this.teamRepository.findUserCurrentTeam(userId);
if (!userTeam) {
  throw BusinessException.generic('TEAM_NOT_MEMBER');
}
```

**Team Context Features:**
- Current team identification
- Team membership validation
- Multi-team support handling

### Ownership Repository Integration

```typescript
// Efficient ownership queries
const ownershipDetails = await this.tileLandOwnershipRepository.getTileOwnershipDetails(
  activityId,
  tileId
);
```

## Performance Considerations

### Caching Strategy

The service benefits from strategic caching at multiple levels:

- **Tile States**: Activity-level tile state caching
- **Team Information**: User-team relationship caching
- **Ownership Calculations**: Aggregated ownership result caching

### Query Optimization

**Efficient Data Retrieval:**
- Batch queries for multiple tiles
- Selective field loading based on requirements
- Pagination support for large datasets

**Aggregation Optimization:**
- Pre-calculated ownership totals
- Efficient area summation queries
- Optimized team ranking calculations

### Bulk Operations Support

```typescript
// Efficient multi-tile processing
const enhancedTileStates: any[] = [];
for (const tileState of tileStates) {
  // Batched ownership calculations
  const ownership = await this.getOwnershipForTile(tileState.tile.id);
  enhancedTileStates.push({ ...tileState, ownership });
}
```

## Error Handling

### Common Exception Patterns

**Activity Validation:**
```typescript
if (!userActivity) {
  throw BusinessException.generic('USER_NO_ACTIVITY');
}
```

**Resource Not Found:**
```typescript
if (!tileStates.data || tileStates.data.length === 0) {
  throw BusinessException.notFound('TileState', tileId.toString());
}
```

**System Error Handling:**
```typescript
catch (error) {
  if (error instanceof BaseException) {
    throw error; // Re-throw business exceptions
  }
  
  this.logger.error('Service operation failed:', error);
  throw SystemException.fromError(error);
}
```

## Usage Examples

### Basic Tile Discovery

```typescript
// Get available tiles for purchase planning
const availableTiles = await landViewService.getAvailableTilesForUser(userId);

// Filter for specific land type
const plainTiles = availableTiles.filter(tile => tile.landType === 'PLAIN');

// Find tiles with low competition
const lowCompetitionTiles = availableTiles.filter(tile => 
  tile.totalOwnedArea < 5 && tile.canPurchase
);
```

### Comprehensive Tile Analysis

```typescript
// Get detailed tile information
const tileDetails = await landViewService.getTileDetailsWithOwnership(userId, tileId);

// Analyze competition
const competitorCount = tileDetails.ownership.length;
const dominantTeam = tileDetails.ownership.reduce((max, team) => 
  team.ownedArea > max.ownedArea ? team : max
);

// Assess purchase opportunity
const isGoodOpportunity = tileDetails.availableArea > 10 && 
                         competitorCount < 3;
```

### Team Portfolio Management

```typescript
// Get team ownership summary
const portfolioSummary = await landViewService.getTeamLandSummary(userId);

// Calculate portfolio metrics
const averageCostPerArea = portfolioSummary.totalSpent / portfolioSummary.totalOwnedArea;
const diversificationLevel = portfolioSummary.tilesOwnedCount;

// Assess expansion capacity
const hasExpansionBudget = /* check team account balances */;
const expansionRecommendation = hasExpansionBudget && diversificationLevel < 10;
```

## Service Extension Patterns

### Custom View Implementations

The service can be extended for specialized viewing requirements:

```typescript
// Custom filtered tile views
async getHighValueTilesForUser(userId: string): Promise<AvailableTileDto[]> {
  const availableTiles = await this.getAvailableTilesForUser(userId);
  
  return availableTiles.filter(tile => 
    tile.currentPopulation > 1000 && 
    tile.availableArea > 15 &&
    tile.teamOwnedArea === 0 // Not yet owned by team
  );
}
```

### Analytics Integration

```typescript
// Market analysis support
async getMarketTrends(userId: string): Promise<MarketTrendData> {
  const tileStates = await this.getTileStatesForTeamView(userId, true);
  
  // Calculate market metrics
  const utilizationRates = tileStates.map(state => ({
    tileId: state.tile.id,
    utilization: state.ownership.totalOwnedArea / 25 // Assuming 25 max area
  }));
  
  return { utilizationRates, /* other trend data */ };
}
```

The LandViewService provides a robust foundation for land management viewing operations, balancing performance, security, and functionality across the platform's land management ecosystem.