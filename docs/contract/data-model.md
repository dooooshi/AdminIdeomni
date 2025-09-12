# Contract System Data Model (Ultra Simple)

## Overview
Ultra-simple contract system that enables multi-team agreements with just title and content.

## Core Concepts

### Contract Structure
- **Contract**: Simple agreement with title and content
- **ContractTeam**: Many-to-many relationship connecting contracts to teams
- **ContractHistory**: Complete audit trail of all contract operations

### Key Features
- Contracts can involve multiple teams (2 or more)
- Minimal fields - just title and content
- Simple status flow: ACTIVE → COMPLETED
- Full history tracking with operator information
- Contracts are immediately active upon creation

## Prisma Model File Location
Create new file: `prisma/models/contract.prisma`

## Prisma Models

```prisma
// Ultra Simple Contract System Models
// Manages multi-team agreements with minimal complexity

// Contract status enum
enum ContractStatus {
  ACTIVE
  COMPLETED
}

// Main contract model - ultra simple
model Contract {
  id                    String                 @id @default(cuid())
  contractNumber        String                 @unique // Format: CTR-YYYY-NNNN
  
  // Core Information
  title                 String                 @db.VarChar(200)
  content               String                 @db.Text // Full contract content
  status                ContractStatus         @default(ACTIVE)
  
  // Activity context
  activityId            String
  activity              Activity               @relation(fields: [activityId], references: [id], onDelete: Cascade)
  
  // Creator
  createdBy             String
  createdByUser         User                   @relation("ContractsCreated", fields: [createdBy], references: [id])
  
  // Teams involved
  teams                 ContractTeam[]
  
  // History tracking
  history               ContractHistory[]
  
  // Timeline
  activatedAt           DateTime?              // When contract became active
  completedAt           DateTime?              // When contract was completed
  
  // System fields
  createdAt             DateTime               @default(now())
  updatedAt             DateTime               @updatedAt
  deletedAt             DateTime?              // For soft deletes
  
  // Indexes for performance
  @@index([activityId, status])
  @@index([contractNumber])
  @@index([status])
  @@index([createdAt])
  @@map("contracts")
}

// Many-to-many relationship between contracts and teams
model ContractTeam {
  id                    String                 @id @default(cuid())
  
  // Contract reference
  contractId            String
  contract              Contract               @relation(fields: [contractId], references: [id], onDelete: Cascade)
  
  // Team reference
  teamId                String
  team                  Team                   @relation("ContractTeams", fields: [teamId], references: [id])
  
  // Join information
  joinedAt              DateTime               @default(now())
  addedBy               String                 // UserId who added this team
  
  // System fields
  createdAt             DateTime               @default(now())
  
  @@unique([contractId, teamId]) // Each team can only be in a contract once
  @@index([teamId])
  @@map("contract_teams")
}

// Contract history for complete audit trail
model ContractHistory {
  id                    String                 @id @default(cuid())
  
  // Contract reference
  contractId            String
  contract              Contract               @relation(fields: [contractId], references: [id], onDelete: Cascade)
  
  // Operation details
  operationType         ContractOperationType
  description           String                 @db.Text
  
  // Operator information
  operatorId            String
  operator              User                   @relation("ContractHistoryOperator", fields: [operatorId], references: [id])
  operatorTeamId        String
  operatorTeam          Team                   @relation("ContractHistoryTeam", fields: [operatorTeamId], references: [id])
  
  // State tracking
  previousStatus        ContractStatus?
  newStatus             ContractStatus?
  
  // Additional details (JSON for flexibility)
  metadata              Json?                  // Additional operation data (e.g., teams added/removed)
  
  // Context
  ipAddress             String?                @db.VarChar(45)
  userAgent             String?                @db.Text
  
  // System fields
  createdAt             DateTime               @default(now())
  
  @@index([contractId, createdAt])
  @@index([operatorId])
  @@index([operatorTeamId])
  @@map("contract_history")
}

// Operation type enum for history tracking
enum ContractOperationType {
  CREATED
  COMPLETED
  DELETED
}
```

## Relationships with Other Models

### Activity Model Extension
```prisma
// Add to Activity model
model Activity {
  // ... existing fields ...
  
  // Contract relationships
  contracts             Contract[]
}
```

### Team Model Extension
```prisma
// Add to Team model
model Team {
  // ... existing fields ...
  
  // Contract relationships
  contractTeams         ContractTeam[]          @relation("ContractTeams")
  contractHistory       ContractHistory[]       @relation("ContractHistoryTeam")
}
```

### User Model Extension
```prisma
// Add to User model
model User {
  // ... existing fields ...
  
  // Contract relationships
  contractsCreated      Contract[]              @relation("ContractsCreated")
  contractHistory       ContractHistory[]       @relation("ContractHistoryOperator")
}
```

## Database Indexes

### Performance Optimization
1. Activity contracts: `@@index([activityId, status])`
2. Contract lookup: `@@index([contractNumber])`
3. Status filtering: `@@index([status])`
4. Time-based queries: `@@index([createdAt])`
5. Team contracts: `@@index([teamId])` on ContractTeam
6. History queries: `@@index([contractId, createdAt])` on ContractHistory
7. Operator tracking: `@@index([operatorId])` on ContractHistory

## Query Patterns

### Common Queries
```typescript
// Get team's contracts
const contracts = await prisma.contract.findMany({
  where: {
    activityId: activityId,
    teams: {
      some: {
        teamId: teamId
      }
    },
    status: '等待全部队伍同意',
    deletedAt: null
  },
  include: {
    teams: {
      include: {
        team: {
          select: { id: true, name: true }
        }
      }
    },
    createdByUser: {
      select: { id: true, username: true }
    }
  },
  orderBy: { createdAt: 'desc' }
});

// Create contract with teams (starts in pending)
const contract = await prisma.contract.create({
  data: {
    contractNumber: await generateContractNumber(),
    title: 'Partnership Agreement',
    content: 'Agreement content here...',
    status: '等待全部队伍同意',
    activityId: activityId,
    createdBy: userId,
    teams: {
      create: teamIds.map(teamId => ({
        teamId: teamId,
        addedBy: userId,
        approved: teamId === userTeamId, // Creator's team auto-approves
        approvedAt: teamId === userTeamId ? new Date() : null,
        approvedBy: teamId === userTeamId ? userId : null
      }))
    }
  }
});

// Approve contract for a team
await prisma.$transaction(async (tx) => {
  // Update team approval
  await tx.contractTeam.update({
    where: { 
      contractId_teamId: {
        contractId: contractId,
        teamId: teamId
      }
    },
    data: {
      approved: true,
      approvedAt: new Date(),
      approvedBy: userId
    }
  });
  
  // Check if all teams approved
  const allTeams = await tx.contractTeam.findMany({
    where: { contractId: contractId }
  });
  
  const allApproved = allTeams.every(t => t.approved);
  
  if (allApproved) {
    // Update contract to signed
    await tx.contract.update({
      where: { id: contractId },
      data: {
        status: '成功签署',
        signedAt: new Date()
      }
    });
  }
  
  await tx.contractHistory.create({
    data: {
      contractId: contractId,
      operationType: 'APPROVED',
      description: `Team ${teamName} approved the contract`,
      operatorId: userId,
      operatorTeamId: teamId,
      previousStatus: '等待全部队伍同意',
      newStatus: allApproved ? '成功签署' : '等待全部队伍同意',
      ipAddress: ipAddress,
      userAgent: userAgent
    }
  });
});

// Reject contract by a team
await prisma.$transaction(async (tx) => {
  const contract = await tx.contract.update({
    where: { id: contractId },
    data: {
      status: '队伍取消或拒绝',
      rejectedAt: new Date()
    }
  });
  
  await tx.contractHistory.create({
    data: {
      contractId: contractId,
      operationType: 'REJECTED',
      description: `Team ${teamName} rejected the contract`,
      operatorId: userId,
      operatorTeamId: teamId,
      previousStatus: '等待全部队伍同意',
      newStatus: '队伍取消或拒绝',
      ipAddress: ipAddress,
      userAgent: userAgent
    }
  });
  
  return contract;
});

// Get contract with history
const contract = await prisma.contract.findUnique({
  where: { id: contractId },
  include: {
    teams: {
      include: {
        team: true
      }
    },
    history: {
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        operator: {
          select: { id: true, username: true, firstName: true, lastName: true }
        },
        operatorTeam: {
          select: { id: true, name: true }
        }
      }
    }
  }
});
```

## Migration Script

```sql
-- Create contracts table
CREATE TABLE contracts (
  id VARCHAR(30) PRIMARY KEY DEFAULT (cuid()),
  contract_number VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  activity_id VARCHAR(30) NOT NULL,
  created_by VARCHAR(30) NOT NULL,
  activated_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create indexes
CREATE INDEX idx_contracts_activity ON contracts(activity_id, status);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_created ON contracts(created_at);

-- Create contract_teams table
CREATE TABLE contract_teams (
  id VARCHAR(30) PRIMARY KEY DEFAULT (cuid()),
  contract_id VARCHAR(30) NOT NULL,
  team_id VARCHAR(30) NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  added_by VARCHAR(30) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id),
  UNIQUE KEY unique_contract_team (contract_id, team_id)
);

CREATE INDEX idx_contract_teams_team ON contract_teams(team_id);

-- Create contract_history table
CREATE TABLE contract_history (
  id VARCHAR(30) PRIMARY KEY DEFAULT (cuid()),
  contract_id VARCHAR(30) NOT NULL,
  operation_type VARCHAR(30) NOT NULL,
  description TEXT NOT NULL,
  operator_id VARCHAR(30) NOT NULL,
  operator_team_id VARCHAR(30) NOT NULL,
  previous_status VARCHAR(20),
  new_status VARCHAR(20),
  metadata JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
  FOREIGN KEY (operator_id) REFERENCES users(id),
  FOREIGN KEY (operator_team_id) REFERENCES teams(id)
);

CREATE INDEX idx_contract_history_contract ON contract_history(contract_id, created_at);
CREATE INDEX idx_contract_history_operator ON contract_history(operator_id);
CREATE INDEX idx_contract_history_team ON contract_history(operator_team_id);

-- Create sequence for contract numbers
CREATE SEQUENCE contract_number_seq START WITH 1;
```

## Contract Number Generation

```typescript
async function generateContractNumber(): Promise<string> {
  const year = new Date().getFullYear();
  
  // Get the next sequence number
  const result = await prisma.$queryRaw<[{ nextval: BigInt }]>`
    SELECT nextval('contract_number_seq')
  `;
  
  const sequence = result[0].nextval.toString();
  return `CTR-${year}-${sequence.padStart(4, '0')}`;
}
```

## Soft Delete Pattern

```typescript
// Soft delete a contract
async function softDeleteContract(contractId: string): Promise<void> {
  await prisma.contract.update({
    where: { id: contractId },
    data: { deletedAt: new Date() }
  });
}

// Query excluding soft deleted
const activeContracts = await prisma.contract.findMany({
  where: {
    deletedAt: null,
    // ... other conditions
  }
});
```

## Data Validation

```typescript
// Contract validation
const contractValidation = {
  title: {
    minLength: 10,
    maxLength: 200
  },
  content: {
    minLength: 50,
    maxLength: 10000
  },
  teams: {
    minCount: 2,  // At least 2 teams required
    maxCount: 10  // Maximum 10 teams per contract
  }
};
```

## Notes

1. Ultra-simple design with just title and content
2. Supports multiple teams (not limited to bilateral)
3. No complex terms, signatures, or negotiation
4. Simple status flow: PENDING_APPROVAL → SIGNED or REJECTED
5. Contracts scoped to activities
6. Soft deletes supported
7. Team approval tracking