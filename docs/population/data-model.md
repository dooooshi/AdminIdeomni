# Population System Data Models

## Overview
The population system extends existing models and adds new ones to track population calculations, history, and facility influences.

## Existing Model Extensions

### ActivityTileState (activity-scoped population)
```prisma
model ActivityTileState {
  // EXISTING FIELDS
  currentPopulation  Int?      @default(0)       // Current population during activity
  
  // NEW FIELDS TO ADD
  basePopulationA        Int?     // Population after step 2 calculation
  populationMultiplier   Decimal? @db.Decimal(10,4) // Growth facility multiplier
  lastPopulationUpdate   DateTime? // When population was last recalculated
  populationUpdateReason String?  // Brief description of last update
  calculationStatus      CalculationStatus @default(PENDING)
  calculationError       String?  // Error message if calculation failed
}
```

### TileFacilityInstance (facility population impact)
```prisma
model TileFacilityInstance {
  // NEW FIELDS TO ADD
  populationImpact       Int?     // Direct population contribution
  populationMultiplier   Decimal? @db.Decimal(10,4) // For growth facilities
  influenceRange         Int?     // 0, 1, 2, or 3 based on level
  influenceStrength      Decimal? @db.Decimal(10,4) // Base influence percentage
}
```

## New Models Required

### PopulationHistory
Tracks all population changes with complete audit trail.

```prisma
model PopulationHistory {
  id                String   @id @default(cuid())
  
  // Context
  tileId            Int
  tile              MapTile  @relation(fields: [tileId], references: [id])
  activityId        String
  activity          Activity @relation(fields: [activityId], references: [id])
  
  // Change details
  previousPopulation Int
  newPopulation     Int
  changeAmount      Int      // Can be positive or negative
  changeType        PopulationChangeType
  changeReason      String   // Human-readable description
  calculationStep   Int      // 1, 2, or 3
  
  // Related entities
  relatedFacilityId String?
  relatedTeamId     String?
  changedBy         String?  // User who triggered change
  
  // Metadata
  calculationDetails Json?   // Detailed calculation breakdown
  timestamp         DateTime @default(now())
  
  @@index([tileId, activityId, timestamp])
  @@map("population_history")
}
```

### PopulationCalculation
Caches calculation results for performance and debugging.

```prisma
model PopulationCalculation {
  id                String   @id @default(cuid())
  
  // Context
  tileId            Int
  activityId        String
  
  // Base values
  initialPopulation Int      // X value from MapTile
  
  // Step 1: Neighbor effects
  step1Population   Int?
  neighboringLowLevelCount Int?
  neighboringHighLevelCount Int?
  siphonLoss        Int?
  spilloverGain     Int?
  
  // Step 2: Production facilities
  step2Population   Int?
  hasInfrastructureSupport Boolean @default(false)
  rawMaterialBonus  Int?
  functionalBonus   Int?
  productionFacilities Json?
  
  // Step 3: Growth facilities
  finalPopulation   Int?
  growthMultiplier  Decimal? @db.Decimal(10,4)
  growthFacilities  Json?
  
  // Metadata
  lastCalculated    DateTime @default(now())
  isValid          Boolean  @default(true)
  
  @@unique([tileId, activityId])
  @@map("population_calculations")
}
```

### FacilityInfluenceRange
Maps growth facility coverage areas.

```prisma
model FacilityInfluenceRange {
  id                String   @id @default(cuid())
  
  facilityId        String   @unique
  facility          TileFacilityInstance @relation(...)
  
  influenceType     FacilityType // SCHOOL, HOSPITAL, PARK, CINEMA
  facilityLevel     Int
  maxInfluenceDistance Int     // 0, 1, 2, or 3
  
  affectedTiles     Json     // Array of affected tiles with percentages
  totalTilesAffected Int
  
  activityId        String
  isActive          Boolean  @default(true)
  
  @@map("facility_influence_ranges")
}
```

### TileNeighbor
Pre-computed hexagonal neighbor relationships.

```prisma
model TileNeighbor {
  id           String  @id @default(cuid())
  
  tileId       Int
  neighborId   Int
  distance     Int     // 1 for adjacent, 2 for distance-2
  direction    HexDirection
  templateId   Int
  
  @@unique([tileId, neighborId])
  @@index([tileId, distance])
  @@map("tile_neighbors")
}
```

## Enums

```prisma
enum PopulationChangeType {
  SIPHON_EFFECT
  SPILLOVER_EFFECT
  PRODUCTION_FACILITY
  GROWTH_FACILITY
  INFRASTRUCTURE_CONNECTION
  MANUAL_ADJUSTMENT
  FACILITY_UPGRADE
  FACILITY_REMOVAL
  INITIAL_SETUP
}

enum CalculationStatus {
  PENDING
  CALCULATING
  COMPLETED
  FAILED
  LOCKED
}

enum HexDirection {
  NORTHEAST
  EAST
  SOUTHEAST
  SOUTHWEST
  WEST
  NORTHWEST
}
```

## Relationships

### Activity Level
- Activity → has many → PopulationHistory
- Activity → has many → PopulationCalculation
- Activity → has many → FacilityInfluenceRange

### Tile Level
- MapTile → has many → PopulationHistory
- MapTile → has many → PopulationCalculation
- MapTile → has many → TileNeighbor (as tile and neighbor)

### Facility Level
- TileFacilityInstance → has many → PopulationHistory
- TileFacilityInstance → has one → FacilityInfluenceRange

### Team/User Level
- Team → has many → PopulationHistory
- User → has many → PopulationHistory (as operator)

## Important Notes

### Data Flow
1. **MapTile.initialPopulation**: Static template value (X)
2. **ActivityTileState.currentPopulation**: Dynamic activity value
3. **PopulationCalculation**: Cached calculation details
4. **PopulationHistory**: Change audit trail

### Key Constraints
- One PopulationCalculation per tile per activity
- One FacilityInfluenceRange per facility
- TileNeighbor relationships are template-scoped
- All population values are integers (floor operations)

### Migration Requirements
1. Add new fields to existing models
2. Create new population tables
3. Generate TileNeighbor relationships
4. Initialize population values from existing data