# Population System

## Background

### Target Users Type
- **Primary Users**: Team managers responsible for land development and urban planning
- **Secondary Users**: Activity administrators monitoring population dynamics

### Expected Impact
- **Business Metrics**: Enhanced strategic depth through population-driven economics
- **User Benefits**: Strategic decision-making based on population growth patterns
- **Technical Benefits**: Transparent calculation system with full audit trail

### Platform Overview
The population system simulates realistic urban development dynamics where each tile has a base population that **automatically updates** based on neighboring developments, infrastructure support, and facility placement. The system implements an automatic three-step calculation process that models siphon/spillover effects, production facility impacts, and growth facility multipliers. All population updates happen in real-time as facilities and infrastructure change - no manual recalculation is needed.

## Core Features

### 1. Three-Step Population Calculation
- **First Calculation**: Neighbor effects (siphon/spillover based on development levels)
- **Second Calculation**: Production facility bonuses (requires complete infrastructure)
- **Third Calculation**: Growth facility multipliers (schools, hospitals, parks, cinemas)

### 2. Infrastructure Requirements
Production facilities only contribute to population if ALL infrastructure is connected:
- Water connection from water plant
- Power connection from power plant
- Base station service coverage
- Fire station service coverage

### 3. Influence Range System
Growth facilities affect tiles based on level:
- Level 1: Affects only the tile itself (1 tile)
- Level 2: Affects tiles at distance ≤1 (7 tiles)
- Level 3+: Affects tiles at distance ≤2 (19 tiles)

### 4. Automatic Population Updates
- **Real-time Updates**: Population automatically recalculates when any related operation occurs
- **Transaction Safety**: Updates happen within the same database transaction as the triggering operation
- **Event-Driven**: System listens to facility and infrastructure events automatically

### 5. Population History Tracking
- Complete audit trail of all automatic population changes
- Change categorization by type and reason
- User and timestamp tracking for accountability

### 6. Seamless Facility Integration
- **Automatic triggers**: Population updates automatically on facility build/upgrade/demolish
- **No manual intervention**: System detects facility changes and updates populations
- Critical thresholds: Level 2→3 changes neighbor effects
- Growth facility influence expands with level upgrades
- Infrastructure validation for production bonuses

## Key Concepts

### Initial Population (X)
- Stored in `MapTile.initialPopulation` at template level
- Base value for all calculations
- Static per map template

### Current Population
- Stored in `ActivityTileState.currentPopulation`
- Dynamic value that changes during activity
- Result of three-step calculation

### Population Change Types
- **Siphon Effect**: Population lost to better developed neighbors
- **Spillover Effect**: Population gained from highly developed neighbors
- **Production Facility**: Impact from raw material or functional facilities
- **Growth Facility**: Impact from schools, hospitals, parks, cinemas
- **Infrastructure Change**: Impact from connection/disconnection
- **Manual Adjustment**: Admin overrides

## Quick Start

### View Population
```http
GET /api/population/tile/:tileId?activityId=xxx
```

### Force Recalculation (Debug Only)
```http
POST /api/population/force-recalculate
```
**Note**: Population automatically updates with facility/infrastructure changes. Manual recalculation is only for debugging.

### View History
```http
GET /api/population/history/:tileId?activityId=xxx
```

## Implementation Status

### Phase 1: Database Foundation ✅
- Population models defined
- Relationships established
- Migration guide prepared

### Phase 2: Calculation Engine 🚧
- Three-step calculator design complete
- Infrastructure validation planned
- Influence range calculator designed

### Phase 3: API Implementation 📋
- Endpoints specified
- DTOs defined
- Controllers planned

### Phase 4: Testing Strategy 📋
- Unit tests for calculations
- Integration tests for workflows
- Performance benchmarks defined