# Team Accounts System Overview

The Team Accounts system provides resource management capabilities for teams within the business simulation platform, allowing teams to track and manage their gold and carbon resources.

## System Architecture

### Core Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Team Model    │────│ TeamAccount      │    │ Activity Scope  │
│                 │    │ Model            │    │                 │
│ - id            │    │ - id             │    │ - activityId    │
│ - name          │    │ - teamId (FK)    │    │ - manager       │
│ - leaderId      │    │ - gold           │    │ - teams[]       │
│ - members[]     │    │ - carbon         │    │                 │
│ - activityId    │    │ - timestamps     │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Database Schema

#### TeamAccount Model
```prisma
model TeamAccount {
  id        String    @id @default(cuid())
  teamId    String    @unique  // One-to-one relationship
  gold      Int       @default(0)
  carbon    Int       @default(0)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime? // Soft deletes

  team      Team      @relation(fields: [teamId], references: [id], onDelete: Cascade)
  @@map("team_accounts")
}
```

#### Team Model Updates
```prisma
model Team {
  // ... existing fields
  account   TeamAccount? // Optional one-to-one relationship
}
```

### Service Layer Architecture

```
┌─────────────────────┐
│ TeamAccountService  │
├─────────────────────┤
│ Business Logic:     │
│ - Account creation  │
│ - Balance updates   │
│ - Authorization     │
│ - Activity scoping  │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐    ┌─────────────────────┐
│TeamAccountRepo      │    │ TeamRepository      │
├─────────────────────┤    ├─────────────────────┤
│ - CRUD operations   │    │ - Team queries      │
│ - Balance queries   │    │ - Membership checks │
│ - Activity filtering│    │ - Activity scoping  │
└─────────────────────┘    └─────────────────────┘
```

## Security Model

### Authentication & Authorization

#### Role-Based Access Control

1. **Team Members (Students/Workers)**
   - Can only access their own team's account
   - Read-only access to account balances
   - Cannot modify balances

2. **Team Leaders** 
   - Same access as team members
   - Cannot modify balances (only managers can)

3. **Managers**
   - Can view all team accounts within their activity
   - Can modify balances for any team in their activity
   - Cannot access teams from other activities

#### Security Boundaries

```
Activity Level Security:
┌─────────────────────────────────────────┐
│ Activity A                              │
│ ┌─────────────┐ ┌─────────────┐        │
│ │ Manager A   │ │ Team 1      │        │
│ │ (can manage)│─│ (account)   │        │
│ └─────────────┘ └─────────────┘        │
│                 ┌─────────────┐        │
│                 │ Team 2      │        │
│                 │ (account)   │        │
│                 └─────────────┘        │
└─────────────────────────────────────────┘

Activity Level Security:
┌─────────────────────────────────────────┐
│ Activity B                              │
│ ┌─────────────┐ ┌─────────────┐        │
│ │ Manager B   │ │ Team 3      │        │
│ │ (can manage)│─│ (account)   │        │
│ └─────────────┘ └─────────────┘        │
│                                         │
│ Manager A CANNOT access Activity B      │
└─────────────────────────────────────────┘
```

### API Security Design

#### Secure Endpoint Design

**Before (Insecure):**
```
GET /user/teams/:teamId/account
❌ Users could potentially access other teams by changing teamId
```

**After (Secure):**
```
GET /user/team/account
✅ Automatically gets user's own team account
✅ No teamId parameter to manipulate
```

#### Authorization Flow

```mermaid
graph TD
    A[User Request] --> B{Authentication Valid?}
    B -->|No| C[401 Unauthorized]
    B -->|Yes| D{User in Activity?}
    D -->|No| E[403 Team No Activity]
    D -->|Yes| F{User in Team?}
    F -->|No| G[404 Not Found]
    F -->|Yes| H[Get Team Account]
    H --> I[Return Account Data]
```

## Lifecycle Management

### Account Creation

1. **Automatic Creation**: Team accounts are automatically created when teams are formed
2. **Default Values**: New accounts start with 0 gold and 0 carbon
3. **Error Handling**: Account creation failures don't prevent team creation

```typescript
// Team creation process
async createTeam(userId: string, teamData: CreateTeamDto) {
  // 1. Create team
  const team = await this.teamRepository.create(teamData);
  
  // 2. Add creator as member  
  await this.teamMemberRepository.addUserToTeam(userId, team.id);
  
  // 3. Create team account (safe failure)
  try {
    await this.teamAccountService.createTeamAccount(team.id);
  } catch (error) {
    this.logger.warn('Failed to create team account', error);
    // Continue - account can be created later
  }
  
  return team;
}
```

### Account Updates

#### Balance Modification Methods

1. **Delta Updates** (Relative Changes)
   ```typescript
   updateBalances(teamId, goldDelta: +100, carbonDelta: -50)
   // gold: 1000 → 1100
   // carbon: 500 → 450
   ```

2. **Absolute Updates** (Set Values)
   ```typescript
   setBalances(teamId, gold: 2000, carbon: 1000)
   // gold: any → 2000  
   // carbon: any → 1000
   ```

#### Validation Rules

- **Non-negative Constraint**: Balances cannot go below 0
- **Manager Only**: Only managers can modify balances
- **Activity Scope**: Managers can only modify teams in their activity
- **Atomic Operations**: Balance updates are transactional

### Account Deletion

- **Cascade Deletion**: Team accounts are deleted when teams are deleted
- **Soft Deletion**: Uses `deletedAt` timestamp for recovery
- **Data Retention**: Deleted accounts can be restored with full history

## Performance Considerations

### Database Optimization

1. **Indexing Strategy**
   ```sql
   -- Primary access patterns
   CREATE INDEX idx_team_accounts_team_id ON team_accounts(team_id);
   CREATE INDEX idx_team_accounts_deleted_at ON team_accounts(deleted_at);
   
   -- Activity-based queries
   CREATE INDEX idx_teams_activity_id ON teams(activity_id);
   CREATE INDEX idx_teams_leader_id ON teams(leader_id);
   ```

2. **Query Optimization**
   - Single query to get user's team account via `findUserCurrentTeam`
   - Efficient pagination for manager overview
   - Minimal data fetching with selective includes

### Caching Strategy

```typescript
// Repository level caching for frequently accessed data
class TeamAccountRepository {
  @Cache(TTL: '5 minutes')
  async getActivityAccountSummary(activityId: string) {
    // Expensive aggregation query
    // Results cached for 5 minutes
  }
}
```

## Error Handling

### Exception Hierarchy

```
BaseException
├── BusinessException
│   ├── TEAM_NO_ACTIVITY
│   ├── TEAM_ACCESS_DENIED  
│   ├── TEAM_ACCOUNT_NOT_FOUND
│   └── TEAM_ACCOUNT_ALREADY_EXISTS
├── ValidationException
│   ├── INVALID_GOLD_DELTA
│   └── INVALID_CARBON_DELTA
└── SystemException
    └── DATABASE_ERROR
```

### Error Recovery

1. **Graceful Degradation**: Team functionality continues if account operations fail
2. **Retry Logic**: Automatic retry for transient failures
3. **Audit Logging**: All balance changes are logged for debugging
4. **Manual Recovery**: Admins can manually create missing accounts

## Integration Points

### Team Management Integration

```typescript
// Team service automatically creates accounts
class TeamService {
  async createTeam() {
    // ... team creation logic
    await this.teamAccountService.createTeamAccount(team.id);
  }
}
```

### Activity Management Integration

- **Activity Scoping**: All account operations respect activity boundaries  
- **Manager Assignment**: Account access follows activity manager assignments
- **Activity Deletion**: Cascade deletes all team accounts in the activity

### User Management Integration

- **Role Validation**: User roles determine account access permissions
- **Activity Enrollment**: Account access requires active activity enrollment
- **Team Membership**: Account visibility follows team membership

## Monitoring & Analytics

### Key Metrics

1. **Resource Distribution**
   - Total gold/carbon per activity
   - Average balances per team
   - Resource inequality metrics

2. **Usage Patterns**
   - Balance change frequency
   - Manager intervention rates
   - Account access patterns

3. **System Health**
   - Account creation success rate
   - Balance update latency
   - Error rates by operation type

### Audit Trail

```typescript
// All balance changes are logged
interface BalanceChangeLog {
  teamId: string;
  managerId: string;
  operation: 'delta' | 'absolute';
  previousGold: number;
  previousCarbon: number;
  newGold: number;
  newCarbon: number;
  timestamp: Date;
  reason?: string;
}
```

## Future Enhancements

### Planned Features

1. **Transaction History**: Detailed log of all balance changes
2. **Balance Notifications**: Alert teams when balances change
3. **Resource Trading**: Allow teams to trade resources with each other
4. **Advanced Analytics**: Resource usage trends and projections
5. **Bulk Operations**: Manager tools for bulk balance adjustments

### Scalability Considerations

1. **Database Sharding**: Partition by activity for large deployments
2. **Read Replicas**: Separate read/write workloads for better performance
3. **Event Sourcing**: Consider event-driven architecture for audit trail
4. **Microservice Split**: Extract account service for independent scaling

## Deployment Notes

### Environment Variables

```bash
# Database connection
DATABASE_URL=postgresql://user:pass@localhost:5432/db

# Application settings  
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m

# Feature flags
TEAM_ACCOUNTS_ENABLED=true
BALANCE_CHANGE_NOTIFICATIONS=false
```

### Database Migration

```bash
# Apply team account migration
pnpm prisma:migrate

# Verify migration
pnpm prisma:generate
```

### Health Checks

The system includes health checks for:
- Database connectivity
- Account creation functionality  
- Balance update operations
- Manager access controls

Monitor these endpoints for system health:
- `GET /health/team-accounts`
- `GET /metrics/team-accounts`