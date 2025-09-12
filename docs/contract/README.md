# Contract System (Ultra Simple)

## Background

### Target Users Type
- **Primary Users**: Students in teams who create and manage contracts
- **Secondary Users**: Other students in participating teams with viewing permissions

### Expected Impact
- **Business Metrics**: Enable simple multi-team agreements
- **User Benefits**: Clear contracts with minimal complexity
- **Technical Benefits**: Ultra-simple, maintainable system

### Platform Overview
Ultra-simple contract system that enables multi-team agreements with just title and content. Contracts are scoped to activities, allowing teams to create agreements with multiple other teams in the same activity. All operations are tracked with complete history including operator information.

## Core Features

### 1. Simple Contract Model
- Just title and content - no complex terms
- Support for multiple teams (2-10 teams)
- Simple status flow: PENDING_APPROVAL → SIGNED or REJECTED
- Contracts require all teams to approve

### 2. Contract Operations
- Create contract with teams (pending approval) - Student role required
- Approve contract - Students from participating teams
- Reject contract - Any student from participating teams
- View complete operation history - All students in participating teams

## Database Models
- Location: `prisma/models/contract.prisma`
- Core entities:
  - Contract: Simple contract with title and content
  - ContractTeam: Many-to-many relationship with teams
  - ContractHistory: Complete audit trail with operator tracking

## API Endpoints
- `POST /api/contract/create` - Create contract (pending approval)
- `GET /api/contract/list` - List team contracts
- `GET /api/contract/:id` - Get contract details
- `POST /api/contract/:id/approve` - Approve for team
- `POST /api/contract/:id/reject` - Reject for team
- `GET /api/contract/teams/available` - Get available teams in activity
- `GET /api/contract/:id/history` - Get operation history

## Business Rules

### Contract Creation
- Student role (userType: 3) required
- Must be a member of an active team
- Title: 10-200 characters
- Content: 50-10000 characters
- At least 2 teams required
- All teams must be in same activity
- Contract starts in pending approval status
- Creator's team automatically approves

### Status Flow
- PENDING_APPROVAL (等待全部队伍同意): Waiting for all teams to approve
- SIGNED (成功签署): All teams approved, contract is active
- REJECTED (队伍取消或拒绝): At least one team rejected

## Integration Points

### With Activity Module
- Contracts scoped to activities
- Activity deletion cascades to contracts

### With Team Module
- Multi-team support via ContractTeam
- Team authorization checks

### With User Module
- Student role verification (userType: 3)
- Team membership validation
- Creator tracking

## Technical Implementation

### Security
- Team-based access control
- Student-only operations (must be in team)
- JWT authentication

### Data Validation
- Title: 10-200 characters
- Content: 50-10000 characters
- Teams: 2-10 per contract

### Performance
- Indexed by activity, status, team
- Soft delete support
- Contract number sequence
- History tracking with operator info

## Quick Links

### Project Resources
- [API Specification](./api-specification.md) - API documentation
- [Business Rules](./business-rules.md) - Business logic
- [Data Model](./data-model.md) - Database schema
- [CLAUDE.md](/CLAUDE.md) - Project guidelines

## Notes & Decisions Log

### Design Principles
- Ultra-simple design - just title and content
- Multi-team support (not limited to bilateral)
- No complex features like terms or negotiation
- Simple three-state lifecycle (PENDING → SIGNED/REJECTED)
- Immutable after creation - no modifications allowed
- Complete history tracking with operator information
- Requires all teams to approve for activation

### Limitations
- No contract terms or conditions
- No signatures or approval flow
- No negotiation capability
- No modifications after creation
- No team changes after creation
- No automated tracking
- No templates or versioning