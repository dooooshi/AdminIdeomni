# Business Rules: Manager Team Status

## Overview

This document defines the business rules, access control policies, and operational logic for the Manager Team Status Dashboard feature.

## Access Control Rules

### 1. Authentication Requirements

- **Required**: Valid JWT token in Authorization header
- **Token Type**: User token (not Admin token)
- **Token Validation**: Must not be expired or revoked
- **Refresh Token**: Support automatic refresh if token expires

### 2. Authorization Rules

#### Manager Verification
```typescript
interface ManagerAuthorizationRules {
  // User must be a manager
  userType: 1; // Manager type

  // User must be active
  isActive: true;

  // User must have current activity enrollment
  hasActivityEnrollment: true;

  // Enrollment must be active
  enrollmentStatus: 'ENROLLED';
}
```

#### Activity Context Validation
1. Manager must be enrolled in exactly one active activity
2. Activity must be within valid date range (startAt <= now <= endAt)
3. Activity must not be deleted (deletedAt === null)
4. Activity must be active (isActive === true)

#### Team Access Rules
1. Teams must belong to the manager's enrolled activity
2. Manager can view ALL teams within their activity
3. Manager cannot access teams from other activities
4. Manager cannot modify team data (read-only access)

### 3. Role-Based Permissions

| Action | Manager | Worker | Student | Admin |
|--------|---------|--------|---------|-------|
| View all teams in activity | ✅ | ❌ | ❌ | ✅* |
| View team details | ✅ | ❌** | ❌** | ✅ |
| View operation history | ✅ | ❌ | ❌ | ✅ |
| View land ownership | ✅ | ❌ | ❌ | ✅ |
| View facility details | ✅ | ❌ | ❌ | ✅ |
| Export data | ✅ | ❌ | ❌ | ✅ |

*Admin can view all activities
**Workers/Students can only view their own team (not in this feature scope)

## Business Logic Rules

### 1. Activity Enrollment Rules

#### Single Activity Constraint
- A user can only be enrolled in ONE activity at a time
- Previous enrollments must be marked as COMPLETED or CANCELLED
- System automatically retrieves the current enrollment

#### Activity Validation
```typescript
function validateManagerActivity(userId: string): ActivityValidation {
  // 1. Check user has exactly one ENROLLED status
  // 2. Verify activity is currently running
  // 3. Ensure activity is not deleted
  // 4. Validate user is actually a manager
  return {
    isValid: boolean,
    activityId: string | null,
    errorCode: string | null
  };
}
```

### 2. Team Data Access Rules

#### Team Filtering
- All team queries automatically filtered by manager's activityId
- No cross-activity data exposure
- Soft-deleted teams excluded by default

#### Data Visibility Levels
1. **Public Data**: Team name, description, member count
2. **Financial Data**: Gold/carbon balances (manager only)
3. **Operation Details**: Full transaction history (manager only)
4. **Member Details**: Full user information (manager only)

### 3. Pagination Rules

#### Default Settings
```typescript
const PaginationDefaults = {
  page: 1,
  limit: 20,
  maxLimit: 100,
  defaultSort: 'createdAt',
  defaultOrder: 'DESC'
};
```

#### Validation Rules
- Page must be >= 1
- Limit must be between 1 and maxLimit
- Invalid values fall back to defaults
- Total pages calculated as Math.ceil(total / limit)

### 4. Operation History Rules

#### Operation Types Visibility
All operation types are visible to managers:
- Account operations (creation, adjustments)
- Transfer operations (in/out)
- Facility operations (build, upgrade, maintenance)
- Land operations (purchase, sale)
- Production operations (raw materials, products)
- Infrastructure operations
- Trade operations

#### Balance Tracking
- Show balance before and after each operation
- Track both GOLD and CARBON resources
- Display operation metadata when available

### 5. Land Ownership Rules

#### Ownership Calculation
```typescript
interface LandOwnershipRules {
  // Sum all active purchases for a team on a tile
  totalOwned = sum(TileLandPurchase.purchasedArea);

  // Track total investment
  totalGoldSpent = sum(TileLandPurchase.goldCost);
  totalCarbonSpent = sum(TileLandPurchase.carbonCost);

  // Only count ACTIVE purchases
  status = 'ACTIVE';
}
```

#### Purchase Validation
- Only show purchases within manager's activity
- Include purchaser information
- Track pricing at time of purchase

### 6. Facility Management Rules

#### Facility Status Rules
```typescript
enum FacilityVisibilityRules {
  UNDER_CONSTRUCTION, // Show with construction progress
  ACTIVE,            // Show with full performance metrics
  MAINTENANCE,       // Show with maintenance indicator
  DAMAGED,           // Highlight for manager attention
  DECOMMISSIONED     // Show in history only
}
```

#### Performance Metrics
- Production rate only for production facilities
- Capacity metrics for storage facilities
- Efficiency calculated from actual vs theoretical output

### 7. Team Member Rules

#### Member Status
- ACTIVE: Currently active team member
- INACTIVE: Temporarily inactive
- PENDING: Invited but not accepted

#### Leader Privileges
- Team must have exactly one leader
- Leader cannot leave team without transfer
- Leader info prominently displayed

## Data Consistency Rules

### 1. Transaction Requirements

#### Read Consistency
- Use READ COMMITTED isolation level
- Ensure snapshot consistency for reports
- No dirty reads allowed

#### Aggregation Consistency
```typescript
// Ensure consistent aggregations
async function getTeamStatistics(teamId: string) {
  return await prisma.$transaction(async (tx) => {
    const team = await tx.team.findUnique({...});
    const account = await tx.teamAccount.findUnique({...});
    const members = await tx.teamMember.count({...});
    // All data from same transaction
    return { team, account, memberCount: members };
  });
}
```

### 2. Cache Invalidation

#### Cacheable Data
- Team list (5 minute TTL)
- Team statistics (1 minute TTL)
- Activity configuration (30 minute TTL)

#### Non-Cacheable Data
- Financial balances (always real-time)
- Operation history (always real-time)
- Member status (always real-time)

## Error Handling Rules

### 1. Error Priority

1. **Authentication Errors** (401): Return immediately
2. **Authorization Errors** (403): Log and return
3. **Validation Errors** (400): Return with details
4. **Not Found Errors** (404): Return with context
5. **System Errors** (500): Log, alert, return generic message

### 2. Error Logging

```typescript
interface ErrorLoggingRules {
  // Always log
  authentication: true,
  authorization: true,
  systemErrors: true,

  // Conditional logging
  validation: false, // Only if repeated
  notFound: false,   // Only if suspicious pattern

  // Include context
  userId: true,
  activityId: true,
  teamId: true,
  timestamp: true,
  requestPath: true,
}
```

## Audit Trail Requirements

### 1. Manager Actions to Log

- Login to dashboard
- View team list
- Access team details
- Export data
- View sensitive financial data

### 2. Audit Entry Format

```typescript
interface AuditEntry {
  userId: string;
  userType: 'MANAGER';
  action: 'VIEW_TEAMS' | 'VIEW_TEAM_DETAILS' | 'EXPORT_DATA';
  resourceType: 'TEAM' | 'OPERATION' | 'FACILITY' | 'LAND';
  resourceId: string;
  activityId: string;
  metadata: {
    ip: string;
    userAgent: string;
    filters?: object;
    pagination?: object;
  };
  timestamp: Date;
}
```

## Performance Requirements

### 1. Response Time Targets

| Operation | Target (p50) | Target (p95) | Max |
|-----------|-------------|--------------|-----|
| Team list | 50ms | 200ms | 500ms |
| Team details | 100ms | 300ms | 1000ms |
| Operation history | 150ms | 400ms | 1500ms |
| Land ownership | 100ms | 300ms | 1000ms |
| Facility list | 100ms | 300ms | 1000ms |

### 2. Concurrent Access

- Support 50+ concurrent managers
- Queue long-running queries
- Implement connection pooling
- Use read replicas for reports

## Security Considerations

### 1. Data Protection

- No sensitive data in URLs
- Mask financial data in logs
- Encrypt data in transit (HTTPS)
- Validate all input parameters

### 2. Rate Limiting

```typescript
interface RateLimitRules {
  requestsPerMinute: 60,
  burstLimit: 10,

  // Stricter limits for expensive operations
  exportLimit: 5, // per hour

  // Per-user tracking
  trackBy: 'userId',

  // Response headers
  includeHeaders: true,
}
```

## Compliance Requirements

### 1. Data Privacy

- No PII exposure without authorization
- Support data anonymization for reports
- Implement right-to-be-forgotten
- Audit all data access

### 2. Regulatory Compliance

- GDPR compliance for EU users
- Data residency requirements
- Audit trail retention (90 days minimum)
- Secure data deletion procedures