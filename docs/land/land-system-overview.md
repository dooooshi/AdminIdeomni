# Land Management System Overview

The Land Management System is a core component of the business simulation platform that enables teams to purchase, own, and manage territorial land areas on hexagonal map tiles. This system integrates with team accounts, activity management, and the hexagonal map system to create a comprehensive territorial expansion simulation.

## System Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Land Management System                   │
├─────────────────────────────────────────────────────────────┤
│  Controllers:                                               │
│  • LandPurchaseController (Student/Worker Interface)        │
│  • ManagerLandController (Manager Oversight)               │
├─────────────────────────────────────────────────────────────┤
│  Services:                                                  │
│  • LandPurchaseService (Purchase Logic & Transactions)     │
│  • LandViewService (Shared Viewing Functionality)          │
│  • ManagerLandService (Analytics & Oversight)              │
├─────────────────────────────────────────────────────────────┤
│  Repositories:                                              │
│  • TileLandPurchaseRepository (Purchase Records)           │
│  • TileLandOwnershipRepository (Ownership Aggregation)     │
├─────────────────────────────────────────────────────────────┤
│  Database Models:                                           │
│  • TileLandPurchase (Individual Purchase Tracking)         │
│  • TileLandOwnership (Team Ownership Aggregation)          │
└─────────────────────────────────────────────────────────────┘
```

### Integration Points

The land system integrates with several core platform systems:

- **Team Account System**: Resource deduction and balance management
- **Activity Management**: Activity-scoped operations and participant validation
- **Hexagonal Map System**: Tile coordinates, pricing, and land types
- **User Management**: Authentication, authorization, and team membership
- **Operation History**: Audit trails for all land transactions

## Database Schema

### TileLandPurchase Model

Individual purchase records that track every land acquisition:

```typescript
model TileLandPurchase {
  id                    String              @id @default(cuid())
  
  // Purchase Details
  purchasedArea         Decimal             @db.Decimal(65, 3)
  goldCost             Decimal              @db.Decimal(65, 3)
  carbonCost           Decimal              @db.Decimal(65, 3)
  purchaseDate         DateTime             @default(now())
  status               LandPurchaseStatus   @default(ACTIVE)
  
  // Historical Pricing
  goldPriceAtPurchase   Decimal?            @db.Decimal(65, 3)
  carbonPriceAtPurchase Decimal?            @db.Decimal(65, 3)
  
  // Metadata
  description          String?
  purchasedBy          String              // User ID
  
  // Relationships
  activityId           String
  tileId               Int
  teamId               String
  
  // Timestamps
  createdAt            DateTime             @default(now())
  updatedAt            DateTime             @updatedAt
  deletedAt            DateTime?            // Soft delete support
}
```

### TileLandOwnership Model

Aggregated ownership view that consolidates team ownership per tile:

```typescript
model TileLandOwnership {
  id                   String              @id @default(cuid())
  
  // Ownership Totals
  ownedArea           Decimal              @db.Decimal(65, 3)
  totalPurchased      Decimal              @db.Decimal(65, 3)
  totalGoldSpent      Decimal              @db.Decimal(65, 3)
  totalCarbonSpent    Decimal              @db.Decimal(65, 3)
  purchaseCount       Int                  @default(1)
  
  // Timing Information
  firstPurchaseDate   DateTime
  lastPurchaseDate    DateTime
  
  // Relationships
  activityId          String
  tileId              Int
  teamId              String
  
  // Unique constraint: one ownership record per team per tile per activity
  @@unique([activityId, tileId, teamId])
}
```

### Purchase Status Enum

```typescript
enum LandPurchaseStatus {
  ACTIVE      // Purchase is active and valid
  CANCELLED   // Purchase was cancelled/refunded
  EXPIRED     // Purchase has expired (if applicable)
}
```

## Business Logic

### Purchase Workflow

The land purchase process follows a comprehensive validation and transaction workflow:

1. **User Validation**
   - Authenticate user with valid JWT token
   - Verify user is an active team member
   - Confirm user is enrolled in current activity

2. **Tile Validation**
   - Verify tile exists in current activity
   - Validate tile has current pricing information
   - Check tile land type and availability

3. **Cost Calculation**
   - Calculate gold cost: `goldPrice × area`
   - Calculate carbon cost: `carbonPrice × area`
   - Apply price protection limits if specified

4. **Resource Validation**
   - Check team account balances
   - Validate sufficient gold and carbon resources
   - Verify purchase doesn't exceed available tile area

5. **Transaction Execution**
   - Deduct resources from team account
   - Create purchase record in TileLandPurchase
   - Update or create ownership record in TileLandOwnership
   - Log operation in team operation history
   - Record balance changes in team balance history

6. **Response Generation**
   - Return purchase confirmation with details
   - Include current pricing and team balances

### Pricing System

Land pricing is dynamic and tile-specific:

- **Gold Price**: Cost per area unit in gold currency
- **Carbon Price**: Cost per area unit in carbon currency
- **Total Cost**: `(goldPrice + carbonPrice) × area`
- **Price Protection**: Optional maximum cost limits to protect against price volatility

### Ownership Aggregation

The system maintains both detailed purchase records and aggregated ownership views:

- **Individual Purchases**: Complete audit trail of all transactions
- **Ownership Summary**: Current team ownership per tile with totals
- **Historical Tracking**: Purchase timing and pricing evolution
- **Multi-team Support**: Multiple teams can own portions of the same tile

## Service Architecture

### LandPurchaseService

Handles core purchase operations and validations:

```typescript
// Key Methods
- purchaseTileArea(userId, purchaseDto): Execute land purchase
- getTeamPurchaseHistory(userId, queryDto): Retrieve purchase history
- getTeamLandOwnership(userId): Get team ownership summary
- validatePurchaseCapability(userId, tileId, area): Pre-purchase validation
- calculatePurchaseCost(userId, tileId, area): Cost calculation
```

**Key Features:**
- Transaction-safe operations using database transactions
- Comprehensive validation at multiple levels
- Integration with team account resource management
- Price protection mechanisms
- Detailed error handling and business exceptions

### LandViewService

Provides shared viewing functionality for both students and managers:

```typescript
// Key Methods
- getActivityMapForUser(userId): Get activity map data
- getTileDetailsWithOwnership(userId, tileId): Detailed tile information
- getTeamLandSummary(userId): Team ownership summary
- getAvailableTilesForUser(userId): Available tiles for purchase
- getTileStatesForTeamView(userId): Enhanced tile states with ownership
```

**Key Features:**
- Activity-scoped data retrieval
- Team-based ownership filtering
- Integration with hexagonal map system
- Ownership breakdown calculations
- Permission-based data access

### ManagerLandService

Provides comprehensive oversight and analytics for managers:

```typescript
// Key Methods
- getActivityLandStatus(managerId): Complete activity overview
- getDetailedTileOwnership(managerId, filters): Paginated tile details
- getTileOwnershipInfo(managerId, tileId): Specific tile ownership
- getLandPurchaseAnalytics(managerId): Comprehensive analytics
```

**Key Features:**
- Activity-wide analytics and reporting
- Team performance rankings
- Purchase trend analysis
- Revenue and utilization metrics
- Tile performance comparisons

## Security and Authorization

### Role-Based Access Control

The system implements strict role-based access:

- **Students/Workers**: Can purchase land and view their team's data only
- **Managers**: Can view all activity data and analytics but cannot make purchases
- **Authentication**: All endpoints require valid JWT tokens
- **Activity Scoping**: All operations are scoped to user's current activity

### Data Protection

- **Team Isolation**: Users can only access their own team's detailed data
- **Activity Boundaries**: No cross-activity data access
- **Audit Trails**: All operations logged with user attribution
- **Soft Deletes**: Purchase records support soft deletion for data integrity

## Performance Considerations

### Database Optimization

- **Indexed Queries**: Optimized indexes on activity, team, and tile relationships
- **Aggregation Views**: TileLandOwnership reduces complex JOIN operations
- **Pagination**: All list endpoints support pagination to handle large datasets
- **Connection Pooling**: Efficient database connection management

### Caching Strategy

- **Current Pricing**: Tile pricing cached at activity level
- **Ownership Calculations**: Aggregated ownership data for performance
- **Team Balances**: Team account balances cached for quick validation

## Integration Patterns

### Team Account Integration

```typescript
// Resource Deduction Pattern
const result = await this.prismaService.executeTransaction(async (prisma) => {
  // 1. Validate team resources
  const teamAccount = await this.teamAccountService.getTeamAccount(teamId);
  
  // 2. Deduct resources
  await this.teamAccountService.updateTeamBalance(teamId, {
    goldDelta: -goldCost,
    carbonDelta: -carbonCost
  });
  
  // 3. Record purchase
  const purchase = await this.tileLandPurchaseRepository.create(purchaseData);
  
  // 4. Update ownership
  await this.tileLandOwnershipRepository.upsertOwnership(ownershipData);
  
  return purchase;
});
```

### Activity Tile State Integration

```typescript
// Pricing Retrieval Pattern
const tileStates = await this.activityTileStateService.getActivityTileStates({
  activityId: userActivity.activityId,
  tileId: purchaseDto.tileId,
});

const goldPrice = tileState.currentGoldPrice;
const carbonPrice = tileState.currentCarbonPrice;
```

## Error Handling

### Business Exceptions

The system uses a comprehensive exception hierarchy:

- **BusinessException**: Expected business logic errors (insufficient resources)
- **ValidationException**: Input validation errors (invalid area amounts)
- **SystemException**: Unexpected system errors
- **BaseException**: Common exception interface

### Exception Codes

- `TEAM_NOT_MEMBER`: User is not a team member
- `TEAM_NOT_ACTIVE_MEMBER`: User is not an active team member
- `USER_NO_ACTIVITY`: User is not enrolled in any activity
- `TILE_NO_PRICING`: Tile has no pricing information
- `INSUFFICIENT_RESOURCES`: Team lacks sufficient resources
- `PRICE_PROTECTION_EXCEEDED`: Purchase exceeds maximum cost limits

## Monitoring and Analytics

### Operational Metrics

- **Purchase Volume**: Number of purchases per time period
- **Revenue Tracking**: Total gold and carbon spent
- **Team Activity**: Active teams and purchase patterns
- **Tile Utilization**: Most and least popular tiles

### Manager Analytics

- **Team Rankings**: By area owned and total spending
- **Purchase Trends**: Daily, weekly, monthly patterns
- **Land Type Performance**: Purchases by tile type
- **Revenue Analysis**: Income generation by tile and team

## Future Enhancements

### Planned Features

- **Land Transfer**: Team-to-team land trading capabilities
- **Land Leasing**: Temporary land usage agreements
- **Resource Generation**: Land-based resource production
- **Territory Bonuses**: Benefits for contiguous land ownership
- **Advanced Analytics**: Predictive analytics and forecasting

### Scalability Considerations

- **Sharding Strategy**: Partition data by activity for large-scale deployment
- **Event Sourcing**: Consider event-driven architecture for complex operations
- **Microservice Split**: Potential separation of purchase and analytics services
- **Real-time Updates**: WebSocket integration for live ownership changes

This land management system provides a comprehensive foundation for territorial simulation within the business platform, supporting both individual team operations and activity-wide management oversight.