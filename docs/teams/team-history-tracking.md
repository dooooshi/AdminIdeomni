# Team History Tracking System

The Team History Tracking System provides comprehensive auditing and tracking of all team account operations, including transfers, balance changes, and resource management activities with precise decimal accuracy.

## 🎯 Overview

This system enables:
- **Complete Audit Trail** - Every operation is logged with user, timestamp, and details
- **Balance History** - Snapshot tracking of account balances over time with 3 decimal precision
- **Transfer Tracking** - Detailed records of all resource transfers between teams
- **Operation Analytics** - Summary statistics and reporting capabilities
- **Immutable Records** - Historical data cannot be modified for compliance
- **Precise Financial Data** - Uses Decimal(65,3) for accurate financial calculations

## 🏗️ Architecture

### Database Models

#### TeamOperationHistory
```prisma
model TeamOperationHistory {
  id                String                  @id @default(cuid())
  teamId            String
  userId            String                  // User who performed the operation
  operationType     TeamOperationType
  amount            Decimal                 @db.Decimal(65, 3)  // Amount with 3 decimal precision
  resourceType      TeamResourceType        // GOLD or CARBON
  
  // For transfers, track the other team involved
  targetTeamId      String?                 // For outgoing transfers
  sourceTeamId      String?                 // For incoming transfers
  
  // Balance snapshot after operation with decimal precision
  balanceBefore     Decimal                 @db.Decimal(65, 3)  // Balance before operation
  balanceAfter      Decimal                 @db.Decimal(65, 3)  // Balance after operation
  
  // Additional context
  description       String?                 // Optional description or reason
  metadata          Json?                   // Additional metadata if needed
  
  createdAt         DateTime                @default(now())
  
  // Relationships
  team              Team                    @relation("TeamOperations")
  user              User                    @relation()
  targetTeam        Team?                   @relation("TargetTeamOperations")
  sourceTeam        Team?                   @relation("SourceTeamOperations")
}
```

#### TeamBalanceHistory
```prisma
model TeamBalanceHistory {
  id                String                  @id @default(cuid())
  teamId            String
  
  // Balance snapshot with decimal precision
  goldBalance       Decimal                 @db.Decimal(65, 3)  // Gold balance at this point
  carbonBalance     Decimal                 @db.Decimal(65, 3)  // Carbon balance at this point
  
  // Change information with decimal precision
  goldChange        Decimal                 @db.Decimal(65, 3)  // Change in gold (positive or negative)
  carbonChange      Decimal                 @db.Decimal(65, 3)  // Change in carbon (positive or negative)
  
  // Link to the operation that caused this change
  operationId       String?                 // References TeamOperationHistory
  
  // Timestamp
  createdAt         DateTime                @default(now())
  
  // Relationships
  team              Team                    @relation()
}
```

#### TeamAccount (Updated with Decimal precision)
```prisma
model TeamAccount {
  id        String    @id @default(cuid())
  teamId    String    @unique  // One-to-one relationship with team
  gold      Decimal   @default(0) @db.Decimal(65, 3)  // Gold with 3 decimal places
  carbon    Decimal   @default(0) @db.Decimal(65, 3)  // Carbon with 3 decimal places
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime? // For soft deletes

  // Relationships
  team      Team      @relation(fields: [teamId], references: [id], onDelete: Cascade)
}
```

### Operation Types

```typescript
enum TeamOperationType {
  ACCOUNT_CREATED       // Initial account creation
  TRANSFER_OUT          // Outgoing transfer to another team
  TRANSFER_IN           // Incoming transfer from another team
  MANAGER_ADJUSTMENT    // Manual adjustment by manager
  SYSTEM_GRANT          // System-granted resources
  SYSTEM_DEDUCTION      // System deductions
  ACTIVITY_REWARD       // Rewards from activity completion
  FACILITY_INCOME       // Income from facilities
  FACILITY_EXPENSE      // Expenses for facilities
}

enum TeamResourceType {
  GOLD
  CARBON
}
```

## 🚀 Key Features

### 1. Resource Transfers
Any active team member can transfer resources to other teams in the same activity:

#### Transfer Gold
```http
POST /api/user/team/account/transfer-gold
Content-Type: application/json
Authorization: Bearer <token>

{
  "targetTeamId": "team456",
  "amount": 100.500,
  "description": "Trade agreement for resources"
}
```

#### Transfer Carbon
```http
POST /api/user/team/account/transfer-carbon
Content-Type: application/json
Authorization: Bearer <token>

{
  "targetTeamId": "team456",
  "amount": 50.750,
  "description": "Carbon credit exchange"
}
```

**Validation Rules:**
- `amount`: Number with maximum 3 decimal places, minimum 0.001
- `targetTeamId`: Must be a valid team ID in the same activity
- `description`: Optional string for transfer context

### 2. Operation History Tracking

#### Get All Operations
```http
GET /api/user/team/account/history/operations?page=1&pageSize=20&operationType=TRANSFER_OUT&resourceType=GOLD&startDate=2025-07-01&endDate=2025-07-31
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "op123",
      "teamId": "team123",
      "userId": "user456",
      "operationType": "TRANSFER_OUT",
      "amount": 100.500,
      "resourceType": "GOLD",
      "balanceBefore": 1000.250,
      "balanceAfter": 899.750,
      "targetTeamId": "team789",
      "description": "Trade agreement",
      "createdAt": "2025-07-28T10:00:00.000Z",
      "user": {
        "id": "user456",
        "username": "john_doe",
        "firstName": "John",
        "lastName": "Doe"
      },
      "targetTeam": {
        "id": "team789",
        "name": "Alpha Team"
      }
    }
  ],
  "total": 50,
  "page": 1,
  "pageSize": 20,
  "totalPages": 3,
  "hasNext": true,
  "hasPrevious": false
}
```

### 3. Transfer History

#### Get Transfer History
```http
GET /api/user/team/account/history/transfers?direction=all&resourceType=GOLD
Authorization: Bearer <token>
```

**Query Parameters:**
- `direction`: `incoming`, `outgoing`, or `all`
- `resourceType`: `GOLD` or `CARBON`
- `startDate`, `endDate`: Date range filtering (ISO format)
- `page`, `pageSize`: Pagination (default: page=1, pageSize=20)

### 4. Balance History

#### Get Balance Snapshots
```http
GET /api/user/team/account/history/balances?page=1&pageSize=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "bh123",
      "teamId": "team123",
      "goldBalance": 899.750,
      "carbonBalance": 550.125,
      "goldChange": -100.500,
      "carbonChange": 0.000,
      "operationId": "op123",
      "createdAt": "2025-07-28T10:00:00.000Z"
    }
  ],
  "total": 25,
  "page": 1,
  "pageSize": 20,
  "totalPages": 2,
  "hasNext": true,
  "hasPrevious": false
}
```

### 5. Operation Summary

#### Get Statistics
```http
GET /api/user/team/account/history/summary?startDate=2025-07-01&endDate=2025-07-31
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalOperations": 150,
  "totalGoldIn": 5000.750,
  "totalGoldOut": 3000.250,
  "totalCarbonIn": 2500.500,
  "totalCarbonOut": 1500.125,
  "operationsByType": {
    "TRANSFER_OUT": 45,
    "TRANSFER_IN": 32,
    "SYSTEM_GRANT": 20,
    "ACTIVITY_REWARD": 15,
    "FACILITY_INCOME": 38
  }
}
```

## 🔒 Security Features

### Access Control
- **Team Membership Validation** - Only active team members can perform operations
- **Activity Isolation** - Teams can only interact within the same activity
- **Balance Validation** - Prevents negative balances and invalid transfers
- **Atomic Transactions** - All operations are atomic to ensure data consistency
- **Decimal Precision** - Prevents floating-point errors in financial calculations

### Audit Compliance
- **Immutable Records** - History entries cannot be modified or deleted
- **Complete Traceability** - Every operation includes user identification and timestamps
- **Metadata Support** - Additional context can be stored for complex operations
- **Precise Financial Data** - Decimal precision ensures accurate audit trails

## 📊 Implementation Details

### Decimal Precision Handling

The system uses `Decimal(65,3)` for all financial data:

```typescript
import Decimal from 'decimal.js';

// Creating transfers with precise decimal calculations
const transferAmount = new Decimal(transferDto.amount);
const newBalance = currentBalance.sub(transferAmount);

// Validation ensures 3 decimal places maximum
@IsNumber({ maxDecimalPlaces: 3 })
@Min(0.001)
amount: number;
```

### Transaction Safety
All transfer operations use database transactions to ensure:
- Source account is debited with exact decimal precision
- Target account is credited with exact decimal precision
- Operation history is recorded with precise amounts
- Balance history is updated with accurate snapshots
- Complete rollback on any failure

### Data Flow
1. **Validation** - Check user permissions, team membership, sufficient balance
2. **Transaction Start** - Begin atomic database transaction
3. **Balance Updates** - Update both source and target team accounts
4. **History Recording** - Create operation and balance history records
5. **Transaction Commit** - Commit all changes atomically
6. **Response** - Return updated account information

### Performance Optimization
- **Indexed Queries** - Efficient querying by team, user, and date
- **Pagination Support** - Handle large datasets efficiently with standardized pagination
- **Selective Loading** - Include only necessary related data using Prisma select
- **Decimal Operations** - Optimized decimal calculations using decimal.js library

### Error Handling
Common error scenarios:
- `TEAM_NOT_MEMBER` - User is not an active team member
- `INSUFFICIENT_BALANCE` - Not enough resources for transfer
- `TARGET_TEAM_NOT_FOUND` - Invalid target team
- `TEAM_DIFFERENT_ACTIVITY` - Teams in different activities
- `TEAM_NOT_ACTIVE_MEMBER` - User membership is inactive
- `TEAM_ACCOUNT_NOT_FOUND` - Team account doesn't exist

## 🧪 Testing & Quality Assurance

### Unit Tests
```typescript
describe('TeamAccountService', () => {
  it('should transfer gold with precise decimal calculation', async () => {
    const transferDto = { targetTeamId: 'team2', amount: 100.125 };
    const result = await service.transferGoldToTeam('user1', transferDto);
    
    expect(result.gold).toBe(899.875); // Precise decimal result
  });
});
```

### Integration Tests
- Test complete transfer workflows
- Verify atomic transaction behavior
- Validate history record creation
- Check balance consistency

## 📈 Analytics & Reporting

### Available Metrics
1. **Resource Flow Analysis** - Track gold/carbon movement between teams with precise amounts
2. **Team Performance** - Compare resource management across teams with decimal precision
3. **Activity Economics** - Overall resource distribution and circulation analysis
4. **User Behavior** - Individual contribution patterns within teams

### Advanced Analytics Methods

#### Balance Summary by Date Range
```typescript
async getBalanceChangeSummary(
  teamId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  startGoldBalance: Decimal;
  endGoldBalance: Decimal;
  totalGoldChange: Decimal;
  startCarbonBalance: Decimal;
  endCarbonBalance: Decimal;
  totalCarbonChange: Decimal;
  numberOfChanges: number;
}>
```

#### Daily Balance Snapshots
```typescript
async getDailyBalanceSnapshots(
  teamId: string,
  startDate: Date,
  endDate: Date
): Promise<Array<{
  date: Date;
  goldBalance: Decimal;
  carbonBalance: Decimal;
}>>
```

## 🔮 Future Enhancements

### Planned Features
1. **Real-time Notifications** - WebSocket alerts for team transfers
2. **Transfer Approval Workflow** - Multi-signature transfers for large amounts
3. **Resource Exchange Rates** - Dynamic pricing between gold and carbon
4. **Advanced Analytics Dashboard** - Real-time team performance metrics
5. **API Webhooks** - External system integration for transfers

### Integration Opportunities
1. **Facility System** - Automatic resource generation/consumption
2. **Map System** - Territory-based resource bonuses
3. **Activity System** - Event-triggered resource rewards
4. **Blockchain Integration** - Immutable transaction recording

## 🛠️ Development Guidelines

### Adding New Operation Types
1. Update `TeamOperationType` enum
2. Implement operation logic in service
3. Add validation rules
4. Create tests for new operation
5. Update documentation

### Best Practices
- Always use Decimal for financial calculations
- Implement proper error handling
- Use database transactions for multi-step operations
- Include comprehensive logging
- Validate all inputs thoroughly

---

*This documentation covers the comprehensive team history tracking system that provides full transparency and auditability for all team account operations in the business simulation platform with precise decimal accuracy.*