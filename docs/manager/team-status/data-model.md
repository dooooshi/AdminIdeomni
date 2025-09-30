# Data Model: Manager Team Status

## Overview

This document describes the data model architecture and aggregation strategies for the Manager Team Status Dashboard. The feature leverages existing Prisma models without modifications, implementing efficient aggregation patterns at the service layer.

## Core Data Models

### 1. Team Model (`team.prisma`)

```prisma
model Team {
  id          String    @id @default(cuid())
  name        String
  description String?
  maxMembers  Int       @default(6)
  isOpen      Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  // Key relationships for dashboard
  leaderId    String
  activityId  String

  // Related data
  leader      User                    @relation("TeamLeader")
  activity    Activity               @relation()
  members     TeamMember[]
  account     TeamAccount?
  operations  TeamOperationHistory[]
  tileLandPurchases  TileLandPurchase[]
  facilityInstances  TileFacilityInstance[]
}
```

**Dashboard Usage**:
- Primary entity for team list and details
- Filter by activityId for manager's scope
- Join with TeamAccount for financial data
- Count members for team size

### 2. TeamAccount Model (`team-account.prisma`)

```prisma
model TeamAccount {
  id        String    @id @default(cuid())
  teamId    String    @unique
  gold      Decimal   @db.Decimal(65, 3)
  carbon    Decimal   @db.Decimal(65, 3)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  team      Team      @relation()
}
```

**Dashboard Usage**:
- Real-time financial status
- One-to-one relationship with Team
- Always fetch with Team for complete status

### 3. TeamOperationHistory Model

```prisma
model TeamOperationHistory {
  id            String              @id @default(cuid())
  teamId        String
  userId        String?
  operationType TeamOperationType
  amount        Decimal             @db.Decimal(65, 3)
  resourceType  TeamResourceType
  balanceBefore Decimal             @db.Decimal(65, 3)
  balanceAfter  Decimal             @db.Decimal(65, 3)
  createdAt     DateTime            @default(now())

  // Relationships
  team          Team
  user          User?
  targetTeam    Team?
  sourceTeam    Team?
}
```

**Dashboard Usage**:
- Complete audit trail
- Filter by date range and type
- Show user who initiated operation
- Track inter-team transfers

## Aggregation Strategies

### 1. Team Summary Aggregation

```typescript
interface TeamSummaryAggregation {
  // Base query
  baseQuery: {
    where: {
      activityId: managerActivityId,
      deletedAt: null
    },
    include: {
      leader: {
        select: { id: true, username: true }
      },
      account: true,
      _count: {
        select: {
          members: {
            where: { status: 'ACTIVE' }
          }
        }
      }
    }
  },

  // Pagination
  pagination: {
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { [sort]: order }
  }
}
```

**Performance Optimizations**:
- Index on `activityId` and `deletedAt`
- Select only required fields
- Use `_count` for member counting
- Implement cursor-based pagination for large datasets

### 2. Team Status Detail Aggregation

```typescript
interface TeamStatusAggregation {
  // Parallel queries for efficiency
  queries: [
    // Team base data
    prisma.team.findUnique({
      where: { id: teamId },
      include: {
        leader: true,
        account: true
      }
    }),

    // Member count
    prisma.teamMember.groupBy({
      by: ['status'],
      where: { teamId },
      _count: true
    }),

    // Land statistics
    prisma.tileLandOwnership.aggregate({
      where: { teamId },
      _sum: { ownedArea: true }
    }),

    // Facility statistics
    prisma.tileFacilityInstance.groupBy({
      by: ['status'],
      where: { teamId },
      _count: true
    }),

    // Recent operations
    prisma.teamOperationHistory.findMany({
      where: { teamId },
      take: 10,
      orderBy: { createdAt: 'desc' }
    })
  ]
}
```

**Performance Optimizations**:
- Execute queries in parallel using Promise.all()
- Limit recent operations to last 10
- Use aggregation functions for counts
- Cache static data (leader info)

### 3. Operation History Aggregation

```typescript
interface OperationHistoryAggregation {
  // Main query with filters
  query: {
    where: {
      teamId,
      // Dynamic filters
      ...(operationType && { operationType }),
      ...(resourceType && { resourceType }),
      ...(dateFrom && {
        createdAt: { gte: new Date(dateFrom) }
      }),
      ...(dateTo && {
        createdAt: { lte: new Date(dateTo) }
      })
    },
    include: {
      user: {
        select: { id: true, username: true }
      },
      targetTeam: {
        select: { id: true, name: true }
      },
      sourceTeam: {
        select: { id: true, name: true }
      }
    },
    // Pagination
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' }
  },

  // Count query for pagination
  countQuery: {
    where: { /* same as above */ },
    count: true
  }
}
```

**Performance Optimizations**:
- Composite index on (teamId, createdAt)
- Index on operationType for filtering
- Separate count query for total
- Limit includes to necessary fields

### 4. Land Ownership Aggregation

```typescript
interface LandOwnershipAggregation {
  // Aggregated ownership view
  query: {
    where: {
      teamId,
      activityId: managerActivityId
    },
    include: {
      tile: {
        select: {
          id: true,
          q: true,
          r: true,
          landType: true
        }
      }
    },
    // Include recent purchases
    include: {
      purchases: {
        where: { teamId },
        take: 5,
        orderBy: { purchaseDate: 'desc' },
        include: {
          purchaser: {
            select: { id: true, username: true }
          }
        }
      }
    }
  }
}
```

**Performance Optimizations**:
- Use TileLandOwnership aggregated table
- Limit recent purchases to 5
- Index on (teamId, activityId)
- Cache tile coordinate data

### 5. Facility Inventory Aggregation

```typescript
interface FacilityAggregation {
  query: {
    where: {
      teamId,
      activityId: managerActivityId,
      deletedAt: null
    },
    include: {
      tile: {
        select: {
          id: true,
          q: true,
          r: true,
          landType: true
        }
      },
      builder: {
        select: {
          id: true,
          username: true
        }
      },
      _count: {
        select: {
          providerConnections: true,
          consumerConnections: true
        }
      }
    }
  }
}
```

**Performance Optimizations**:
- Index on (teamId, activityId, status)
- Use _count for connection counting
- Select minimal tile data
- Consider materialized view for complex facilities

## Database Indexes

### Required Indexes

```sql
-- Team indexes
CREATE INDEX idx_team_activity ON teams(activityId, deletedAt);
CREATE INDEX idx_team_leader ON teams(leaderId);

-- TeamAccount indexes
CREATE INDEX idx_team_account_team ON team_accounts(teamId);

-- TeamOperationHistory indexes
CREATE INDEX idx_operation_team_date ON team_operation_history(teamId, createdAt DESC);
CREATE INDEX idx_operation_type ON team_operation_history(operationType);
CREATE INDEX idx_operation_resource ON team_operation_history(resourceType);

-- TileLandOwnership indexes
CREATE INDEX idx_land_team_activity ON tile_land_ownership(teamId, activityId);
CREATE INDEX idx_land_tile ON tile_land_ownership(tileId);

-- TileFacilityInstance indexes
CREATE INDEX idx_facility_team_activity ON tile_facility_instances(teamId, activityId);
CREATE INDEX idx_facility_status ON tile_facility_instances(status);
CREATE INDEX idx_facility_type ON tile_facility_instances(facilityType);

-- TeamMember indexes
CREATE INDEX idx_member_team_status ON team_members(teamId, status);
```

## Query Optimization Patterns

### 1. Batch Loading Pattern

```typescript
async function batchLoadTeamData(teamIds: string[]) {
  const [teams, accounts, memberCounts] = await Promise.all([
    // Load all teams
    prisma.team.findMany({
      where: { id: { in: teamIds } }
    }),

    // Load all accounts
    prisma.teamAccount.findMany({
      where: { teamId: { in: teamIds } }
    }),

    // Count all members
    prisma.teamMember.groupBy({
      by: ['teamId'],
      where: {
        teamId: { in: teamIds },
        status: 'ACTIVE'
      },
      _count: true
    })
  ]);

  // Combine results
  return combineResults(teams, accounts, memberCounts);
}
```

### 2. Cursor Pagination Pattern

```typescript
async function getCursorPaginatedTeams(cursor?: string, limit: number = 20) {
  const teams = await prisma.team.findMany({
    where: {
      activityId: managerActivityId,
      ...(cursor && {
        createdAt: { lt: new Date(cursor) }
      })
    },
    take: limit + 1,
    orderBy: { createdAt: 'desc' }
  });

  const hasMore = teams.length > limit;
  const items = hasMore ? teams.slice(0, -1) : teams;
  const nextCursor = hasMore ? items[items.length - 1].createdAt : null;

  return { items, nextCursor, hasMore };
}
```

### 3. Aggregation Cache Pattern

```typescript
interface AggregationCache {
  key: string;
  data: any;
  ttl: number;
  timestamp: Date;
}

class TeamStatisticsCache {
  private cache = new Map<string, AggregationCache>();

  async getStatistics(teamId: string): Promise<TeamStatistics> {
    const cached = this.cache.get(teamId);

    if (cached && !this.isExpired(cached)) {
      return cached.data;
    }

    const statistics = await this.calculateStatistics(teamId);

    this.cache.set(teamId, {
      key: teamId,
      data: statistics,
      ttl: 60, // 1 minute
      timestamp: new Date()
    });

    return statistics;
  }
}
```

## Data Consistency Patterns

### 1. Transaction Pattern

```typescript
async function getConsistentTeamSnapshot(teamId: string) {
  return await prisma.$transaction(async (tx) => {
    const team = await tx.team.findUnique({
      where: { id: teamId }
    });

    const account = await tx.teamAccount.findUnique({
      where: { teamId }
    });

    const memberCount = await tx.teamMember.count({
      where: { teamId, status: 'ACTIVE' }
    });

    return {
      team,
      account,
      memberCount,
      snapshotTime: new Date()
    };
  });
}
```

### 2. Optimistic Locking Pattern

```typescript
async function updateWithOptimisticLock(teamId: string, version: number) {
  const result = await prisma.team.update({
    where: {
      id: teamId,
      version: version // Ensure version matches
    },
    data: {
      // Update data
      version: { increment: 1 }
    }
  });

  if (!result) {
    throw new Error('Concurrent modification detected');
  }

  return result;
}
```

## Performance Monitoring

### Key Metrics to Track

1. **Query Performance**
   - Average query time per endpoint
   - Slow query log (> 1 second)
   - Query count per request

2. **Cache Effectiveness**
   - Cache hit ratio
   - Cache memory usage
   - TTL optimization

3. **Database Load**
   - Connection pool usage
   - Active queries
   - Lock contention

### Monitoring Implementation

```typescript
interface QueryMetrics {
  endpoint: string;
  queryCount: number;
  totalTime: number;
  maxTime: number;
  errors: number;
}

class MetricsCollector {
  async trackQuery<T>(
    name: string,
    query: () => Promise<T>
  ): Promise<T> {
    const start = Date.now();

    try {
      const result = await query();
      const duration = Date.now() - start;

      this.recordMetric(name, duration, true);

      if (duration > 1000) {
        this.logSlowQuery(name, duration);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.recordMetric(name, duration, false);
      throw error;
    }
  }
}
```

## Data Migration Considerations

### Future Enhancements

1. **Materialized Views** for complex aggregations
2. **Read Replicas** for report queries
3. **Time-series Database** for operation history
4. **Redis Cache** for frequently accessed data
5. **Elasticsearch** for advanced search capabilities