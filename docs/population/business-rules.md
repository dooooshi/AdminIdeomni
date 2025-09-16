# Population System Business Rules

## Core Calculation Rules

### Three-Step Calculation Process
Every population calculation MUST follow these three steps in order:

1. **Step 1**: Calculate neighbor effects
2. **Step 2**: Add production facility bonuses (if infrastructure requirements met)
3. **Step 3**: Apply growth facility multipliers

### Step 1: Neighbor Effects (Siphon/Spillover)

#### Formula
```
Population after Step 1 = X - (low_level_count × X/10) + (high_level_count × X/10)
```

#### Rules
- **Low-level neighbors**: Neighboring tiles with ONLY level ≤2 facilities (no facilities above level 2)
- **High-level neighbors**: Neighboring tiles that HAVE level ≥4 facilities (may also have other levels)
- **Siphon effect**: Each low-level neighbor reduces population by X/10
- **Spillover effect**: Each high-level neighbor increases population by X/10
- **Integer operations**: Always floor to integer after calculation
- **Neighbor count**: Check all 6 adjacent hexagonal tiles
- **Note**: A tile with both level 2 and level 4 facilities counts as high-level (presence of level ≥4 takes precedence)

#### Example
```
X = 1000, 2 low-level neighbors, 1 high-level neighbor
Result = 1000 - (2 × 100) + (1 × 100) = 900
```

### Step 2: Production Facility Bonuses

#### Infrastructure Requirements (ALL REQUIRED)
Production bonuses ONLY apply if ALL four infrastructure types are connected:
- ✓ Water connection (from water plant)
- ✓ Power connection (from power plant)
- ✓ Base station service coverage
- ✓ Fire station service coverage

If ANY infrastructure is missing → NO production bonus (bonus = 0)

#### Bonus Calculations
**Raw Material Facilities** (MINE, QUARRY, FOREST, FARM, RANCH, FISHERY):
```
Bonus = 0.6 × X per facility
```

**Functional Facilities**:
- Factory/Mall:
  ```
  Bonus = 2X × 2^(level-1)
  ```
- Warehouse:
  ```
  Bonus = 0.8X × 2^(level-1)
  ```

#### Rules
- Each facility contributes independently
- Sum all bonuses together
- Floor each bonus to integer before summing
- Base Population A = Step1_Result + Total_Bonuses

### Step 3: Growth Facility Multipliers

#### Influence Ranges by Level
- **Level 1**: Affects only the tile itself (1 tile total)
- **Level 2**: Affects distance ≤1 (1+6 = 7 tiles total)
- **Level 3**: Affects distance ≤2 (1+6+12 = 19 tiles total)
- **Level 4**: Affects distance ≤3 (1+6+12+18 = 37 tiles total)

#### Bonus Percentages by Distance

| Facility Level | Same Tile (d=0) | Distance 1 (d=1) | Distance 2 (d=2) | Distance 3 (d=3) |
|---------------|-----------------|------------------|------------------|------------------|
| Level 1 | 10% | - | - | - |
| Level 2 | 20% | 4% | - | - |
| Level 3 | 30% | 6% | 3% | - |
| Level 4 | 40% | 8% | 4% | 2% |

#### Calculation Formula
```
Final Population = Base_A × (1 + School_Bonus) × (1 + Hospital_Bonus) × (1 + Park_Bonus) × (1 + Cinema_Bonus)
```

#### Rules
- Growth effects stack MULTIPLICATIVELY, not additively
- Multiple facilities of same type both apply (e.g., two schools)
- Calculate percentage based on facility level and distance
- Apply all multipliers to Base Population A from Step 2
- Floor final result to integer

## Validation Rules

### Population Values
- **Minimum**: 0 (population cannot be negative)
- **Data type**: Integer only (no decimals)
- **Rounding**: Always floor, never round

### Infrastructure Validation
- Binary check: Either ALL 4 types connected or NO bonus
- No partial credit for having 3 out of 4 infrastructure types
- Infrastructure must be ACTIVE (not suspended or disconnected)

### Facility Validation
- Facility must be ACTIVE status
- Facility must be fully constructed (not UNDER_CONSTRUCTION)
- Facility level must be between 1 and 4

### Automatic Calculation Triggers
Population is **automatically recalculated** when:
1. New facility construction completes (status changes to ACTIVE)
2. Facility is upgraded or downgraded
3. Facility is demolished
4. Infrastructure is connected or disconnected
5. Neighboring tile facility changes (for First Calculation effects)
6. Manual adjustment by admin (special cases only)

**Important**: No manual triggering is needed - the system automatically detects these events and updates affected populations within the same database transaction.

## Special Cases

### Empty Tiles
- Use MapTile.initialPopulation as base X value
- No Step 2 bonuses (no facilities)
- No Step 3 multipliers (no growth facilities)
- Still affected by neighbor effects in Step 1

### Isolated Tiles
- No neighbor effects in Step 1 (no neighbors)
- Normal Step 2 and Step 3 calculations apply

### Infrastructure Loss
- If ANY infrastructure disconnects, system automatically removes ALL production bonuses
- Automatic immediate recalculation of all affected tiles
- Historical population automatically retained in history

### Facility Removal
- System automatically removes facility's contribution immediately
- Automatically updates neighboring tiles (First Calculation effects)
- Growth facility removal automatically updates all tiles in influence range

## Calculation Examples

### Example 1: Complete Calculation
```
Initial: X = 1000
First Calculation: 2 low-level neighbors, 1 high-level neighbor
  = 1000 - (2 × 100) + (1 × 100) = 900
  
Second Calculation: Has all infrastructure, 1 FARM, 1 Level 2 FACTORY
  FARM = 0.6 × 1000 = 600
  FACTORY = 2 × 1000 × 2^(2-1) = 2000 × 2 = 4000
  Base A = 900 + 600 + 4000 = 5500
  
Third Calculation: Level 2 SCHOOL on same tile (20% bonus)
  Final = 5500 × 1.20 = 6600
```

### Example 2: Missing Infrastructure
```
Initial: X = 2000
Step 1: No neighbor effects = 2000
Step 2: Has Level 3 FACTORY but NO fire station
  Bonus = 0 (infrastructure requirement not met)
  Base A = 2000
Step 3: No growth facilities
  Final = 2000
```

## History Tracking Rules

### Required History Events
Must create history record for:
- Any population change >0
- Manual adjustments (even if no change)
- Failed calculations (with error reason)

### History Metadata
Each history record must include:
- Previous and new population values
- Change type (enum)
- Human-readable change reason
- Calculation step (1, 2, or 3)
- Related facility/team if applicable
- User who triggered change
- Timestamp

## Manager Access Rules

### Access Permissions
Managers have special access to population data for their activity (automatically determined from authentication context):

#### Manager-Exclusive Endpoints
1. **My Activity Population History** (`/api/population/my-activity/history`)
   - View all population changes across entire activity
   - Activity automatically resolved from manager's authentication context
   - Filter by team, tile, change type, and date range
   - Access to detailed change metadata and triggers

2. **My Activity Team Summary** (`/api/population/my-activity/team-summary`)
   - View aggregated population by team
   - Activity automatically resolved from manager's authentication context
   - Compare team performance metrics
   - Access population breakdowns by change type

#### Context-Based Access Pattern
- **No activityId in URL**: Activity is automatically determined from manager's profile
- **Single Activity per Manager**: Each manager is associated with exactly one activity
- **Automatic Resolution**: System retrieves manager's activity during authentication
- **Request Context**: Activity is injected into request context for service layer use

#### Access Validation
- Manager's activity must be resolved from authentication context
- If manager has no associated activity, access is denied
- No manual activityId passing to prevent cross-activity access
- Admin users use separate endpoints with explicit activityId

### Data Visibility Rules

#### Full Visibility for Managers
Managers can see:
- All tiles in their activity (regardless of ownership)
- All teams' population data
- Complete history of all changes
- User information for who triggered changes
- Facility details that caused population changes

#### Aggregation Requirements
Manager views must include:
- **Summary Statistics**: Total changes, net population change, most active team/tile
- **Team Rankings**: Population totals and percentages
- **Time-based Metrics**: Recent changes (1hr, 24hr, 7 days)
- **Change Breakdowns**: By type (siphon, spillover, production, growth)

### Real-Time Update Rules

#### WebSocket Subscriptions
- Managers can subscribe to activity-wide population events
- Must validate manager status before allowing subscription
- Send aggregated summaries for significant changes (>1000 population)

#### Event Broadcasting
When broadcasting to managers:
- Include team and user attribution
- Provide change context (facility type, action taken)
- Send updated team summaries periodically

### Filtering and Pagination

#### Required Filters
Manager endpoints must support:
- **Date Range**: ISO 8601 format (dateFrom, dateTo)
- **Team Filter**: Single or multiple team IDs
- **Change Type**: Filter by calculation type
- **Tile Filter**: Specific tile or tile range

#### Pagination Requirements
- Default limit: 100 records for history, all teams for summary
- Maximum limit: 500 records for history endpoints
- Must return pagination metadata (total, offset, limit, hasNext, hasPrevious)

#### Sorting Options
- Timestamp (default for history)
- Change amount (for impact analysis)
- Team/tile ID (for systematic review)
- Support ascending and descending order

### Data Export Rules

#### Export Formats
Managers can export population data in:
- **JSON**: Full structured data with metadata
- **CSV**: Flattened tabular format for spreadsheet analysis

#### Export Limits
- Maximum 10,000 records per export
- Include all available fields in export
- Must validate manager access before export

### Audit and Compliance

#### Activity Logging
Log all manager access to population data:
- Manager ID (from auth context)
- Activity ID (resolved from manager's profile)
- Endpoint accessed (my-activity/history or my-activity/team-summary)
- Filters applied (if any)
- Timestamp of access
- Export operations (if any)

#### Security Benefits of Context-Based Access
- **Prevents URL Manipulation**: Managers cannot access other activities by changing URL
- **Simplified Authorization**: Activity validation happens once during auth
- **Audit Trail**: Clear association between manager and their activity
- **Reduced Errors**: No possibility of accessing wrong activity

#### Data Retention
- Population history must be retained for entire activity duration
- Manager access logs retained for 90 days minimum
- Exported data tracking for compliance

## Performance Optimization Rules

### Caching
- Cache calculation results in PopulationCalculation table
- Invalidate cache on any trigger event
- Cache TTL: Until next trigger event

### Batch Processing
- Group multiple tile updates in same transaction
- Process neighbor updates together
- Limit concurrent calculations to prevent deadlocks

### Query Optimization
- Use pre-computed TileNeighbor relationships
- Index on activityId + tileId for fast lookups
- Materialized views for activity-wide summaries (post-MVP)