# Contract System Business Rules (Ultra Simple)

## Overview
Ultra-simple business rules for multi-team contracts with just title and content, plus complete history tracking.

## Contract Lifecycle States

### State Transitions
```typescript
enum ContractStatus {
  PENDING_APPROVAL = "等待全部队伍同意",   // Waiting for all teams to agree
  REJECTED = "队伍取消或拒绝",            // Team cancelled or rejected
  SIGNED = "成功签署"                     // Successfully signed
}

// Valid state transitions
const validTransitions = {
  PENDING_APPROVAL: [SIGNED, REJECTED],
  REJECTED: [],
  SIGNED: []
};
```

## Contract Creation Rules

### User Eligibility
- Must be Student role (userType: 3)
- Must be a member of an active team
- Cannot create contracts without team membership
- Contract starts in PENDING_APPROVAL status upon creation

### Team Requirements
- All participating teams must be active
- Teams must be in same activity
- Minimum 2 teams required for contract

### Contract Validation
```typescript
interface ContractValidation {
  title: {
    minLength: 10,
    maxLength: 200
  },
  content: {
    minLength: 50,
    maxLength: 10000
  },
  teams: {
    minCount: 2,   // At least 2 teams
    maxCount: 10   // Maximum 10 teams
  }
}
```

## Contract Status Rules

### Approval
- All teams must approve for contract to become SIGNED
- Creator's team automatically approves upon creation
- Other teams need to explicitly approve

### Rejection
- Any team can reject or cancel the contract
- Contract moves to REJECTED status immediately
- Cannot be changed once rejected

## Business Constraints

### Limits
| Constraint | Limit |
|-----------|-------|
| Teams per contract | 2-10 |
| Title length | 10-200 characters |
| Content length | 50-10000 characters |
| Active contracts per team | No limit |

### Authorization Requirements
| Action | Required Role | Additional Requirements |
|--------|--------------|------------------------|
| Create contract | Student | Must be in a team |
| Approve contract | Student | Must be in participating team |
| Reject contract | Student | Must be in participating team |
| View contracts | Student | Must be in participating team |
| View history | Student | Must be in participating team |

## Data Integrity Rules

### Unique Constraints
- Contract number must be unique
- Each team can only be in a contract once

### Required Fields
- Title (10-200 characters)
- Content (50-10000 characters)
- At least 2 teams

## Contract Number Generation
```typescript
function generateContractNumber(): string {
  const year = new Date().getFullYear();
  const sequence = getNextSequence(); // Auto-increment
  return `CTR-${year}-${sequence.toString().padStart(4, '0')}`;
}
```

## Validation Rules

### Pre-Creation Validation
1. User must be Student role (userType: 3)
2. User must have active team membership
3. All specified teams must exist and be active
4. All teams must be in same activity

### Pre-Approval Validation
1. Contract must be in PENDING_APPROVAL status
2. User must be Student from participating team
3. Team hasn't already approved

### Pre-Rejection Validation
1. Contract must be in PENDING_APPROVAL status
2. User must be Student from participating team

## Error Handling

### Common Validation Errors
- `CONTRACT_NOT_FOUND` - Contract doesn't exist
- `CONTRACT_ACCESS_DENIED` - No permission to access
- `CONTRACT_INVALID_STATUS` - Wrong status for operation
- `CONTRACT_ALREADY_APPROVED` - Team already approved
- `CONTRACT_ALREADY_REJECTED` - Contract already rejected
- `TEAM_NOT_IN_ACTIVITY` - Team not in same activity
- `UNAUTHORIZED_ROLE` - Insufficient permissions

## Query Optimization

### Indexes
- Contract number for lookups
- Activity + status for filtering
- Team ID for team contracts

## History Tracking Rules

### Automatic History Recording
All contract operations automatically record history:

| Operation | History Entry |
|-----------|--------------|
| Create Contract | CREATED with initial teams and pending status |
| Approve Contract | APPROVED by team with status change |
| Reject Contract | REJECTED by team with status change |
| Delete Contract | DELETED with soft delete |

### History Information Captured
For each operation, the system records:
- **Operator**: User ID and username
- **Operator Team**: Team ID and name
- **Timestamp**: Exact time of operation
- **Operation Type**: Type of action performed
- **Description**: Human-readable description
- **Status Change**: Previous and new status if applicable
- **Metadata**: Additional context (teams, values, etc.)
- **Context**: IP address and user agent

### History Query Rules
- History is immutable - cannot be edited or deleted
- Always ordered by creation time (newest first)
- Accessible to all teams in the contract
- Preserved even after contract soft delete

## Soft Delete Pattern
- Contracts support soft delete via `deletedAt` field
- Soft deleted contracts excluded from queries
- History preserved for soft deleted contracts
- Audit trail maintained permanently