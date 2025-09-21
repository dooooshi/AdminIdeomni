# Raw Material Shop Business Rules

## Overview
This document defines the business rules and operational constraints for the activity-based Raw Material Shop module. The shop provides a centralized marketplace where all managers in an activity collaborate to manage material availability and pricing for all teams.

## Core Business Concepts

### Shop Ownership and Management

#### Activity-Based Shop Model
```typescript
interface ShopOwnershipRules {
  shopsPerActivity: 1;               // One shop per activity
  managementModel: 'COLLABORATIVE';  // All managers can manage
  servesAllTeams: true;              // Available to all teams in activity
  crossActivityAccess: false;        // Teams cannot access other activity shops
}
```

#### Shop Lifecycle
```typescript
interface ShopLifecycleRules {
  // Shop is always open once activity exists
  alwaysOpen: true;                  // No closing or maintenance

  creation: {
    triggeredBy: 'ACTIVITY_CREATION'; // Auto-created with activity
    startsEmpty: true;                // No materials initially
    managersAddMaterials: true;       // Managers explicitly add materials
  };

  operations: {
    purchasesAlwaysEnabled: true;    // No downtime
    priceChangesInstant: true;       // Changes take effect immediately
    historyAlwaysTracked: true;      // Complete audit trail
  };
}
```

### Collaborative Management Model

#### Manager Permissions
```typescript
interface ManagerCollaboration {
  // All managers in activity have equal rights
  equalPermissions: true;

  // Actions any manager can perform
  allowedActions: [
    'ADD_MATERIAL_TO_SHOP',     // Add new materials to sell
    'REMOVE_MATERIAL_FROM_SHOP', // Remove materials from shop
    'SET_MATERIAL_PRICE',       // Set or update prices freely
    'SET_STOCK_QUANTITY',       // Control how many to sell
    'VIEW_ALL_HISTORY',
    'EXPORT_REPORTS'
  ];

  // Conflict resolution
  conflictHandling: {
    lastWriteWins: true;             // Most recent change prevails
    notifyAllManagers: true;         // All managers notified of changes
    trackChangeHistory: true;        // Complete audit trail
  };

  // Collaboration features
  features: {
    priceChangeNotifications: true;  // Alert when prices changed
    materialAddedNotifications: true; // Alert when materials added/removed
    changeJustification: 'OPTIONAL'; // Can add reason for changes
    bulkPriceUpdate: true;          // Update multiple prices at once
  };
}
```

### Fixed Pricing Model

#### Price Setting Rules
```typescript
interface PricingRules {
  // Fixed pricing = non-negotiable (but managers can change)
  pricingModel: 'FIXED_NON_NEGOTIABLE'; // Students buy at set price
  currencyType: 'GOLD';                 // Gold only

  // No price constraints - managers have full control
  constraints: {
    minimumPrice: 1;                // Must be positive
    maximumPrice: null;             // No upper limit
    requiresWholeNumbers: false;    // Decimals allowed
    canChangePrice: true;           // Managers can update anytime
  };

  // Price policy
  pricePolicy: {
    managerControlled: true;        // Managers set all prices
    updateableAnytime: true;        // Can change whenever needed
    noNegotiation: true;           // Students can't bargain
    perMaterialPricing: true;      // Each material priced individually
  };

  // No discounts or negotiations
  discounts: {
    bulkDiscounts: false;           // No quantity discounts
    teamDiscounts: false;           // No special team pricing
    loyaltyProgram: false;          // No repeat buyer benefits
    promotions: false;              // No special offers
  };
}

// Price validation - minimal constraints
function validatePrice(
  price: number
): ValidationResult {
  // Only constraint: must be positive
  if (price <= 0) {
    return {
      valid: false,
      message: 'Price must be greater than 0'
    };
  }

  // No min/max constraints - manager has full control
  return { valid: true };
}
```

### Material Availability Management

#### Material Management
```typescript
interface MaterialManagementRules {
  // Shop starts empty - no materials by default
  defaultListing: 'EMPTY';           // Shop starts with zero materials

  // Manager controls - must explicitly add materials
  controls: {
    addMaterialToShop: true;        // Explicitly add from 172 materials
    removeMaterialFromShop: true;   // Remove materials from shop
    selectMaterialsToSell: true;    // Choose which of 172 materials
    setQuantityToSell: true;        // Set how many to sell (null = unlimited)
    setPricePerMaterial: true;      // Must set price when adding
  };

  // Stock management
  stockOptions: {
    setSpecificQuantity: true;      // Manager sets exact amount to sell
    unlimited: true;                // Option for infinite stock
    updateQuantityAnytime: true;    // Can change stock levels
    trackSoldQuantity: true;        // Monitor sales
  };

  // Fair distribution
  fairness: {
    perTeamLimits: true;          // Max per team per period
    equalAccess: true;            // All teams same limits
    firstComeFirstServe: true;    // No reservations
  };
}
```

### Transaction Rules

#### Purchase Process
```typescript
interface PurchaseRules {
  // Buyer eligibility
  eligibility: {
    allowedRoles: ['STUDENT'];     // Only students purchase
    requiresActiveTeam: true;      // Team must be active
    requiresSameActivity: true;    // Must be in shop's activity
  };

  // Purchase constraints
  constraints: {
    minimumQuantity: 1;            // At least 1 unit
    maximumPerTransaction: 9999;   // Per transaction limit
    requiresSufficientFunds: true; // Must have gold
    instantPayment: true;          // Immediate deduction
  };

  // Delivery
  delivery: {
    instant: true;                 // No delay
    targetRequired: true;         // Must specify facility
    validateOwnership: true;      // Must own facility
    noTransportCost: true;        // Free delivery
  };

  // Transaction atomicity
  atomicity: {
    allOrNothing: true;           // Complete or rollback
    noPartialFulfillment: false;  // Full quantity only
  };
}
```

#### Transaction Processing Flow
```typescript
interface TransactionFlow {
  steps: [
    'VALIDATE_MATERIAL_EXISTS',     // Material must be in shop
    'CHECK_STOCK_LIMITS',          // If limits exist
    'VALIDATE_BUYER_ROLE',         // Must be student
    'VALIDATE_TEAM_FUNDS',         // Sufficient gold
    'VALIDATE_FACILITY_OWNERSHIP', // Owns target facility
    'DEDUCT_PAYMENT',              // Remove gold from team
    'DELIVER_MATERIALS',           // Add to facility
    'UPDATE_STOCK_COUNT',          // Update quantitySold
    'CREATE_HISTORY_RECORDS',      // Shop and account history
  ];

  rollbackOn: [
    'INSUFFICIENT_FUNDS',
    'INVALID_FACILITY',
    'STOCK_EXHAUSTED',
    'MATERIAL_NOT_FOUND'
  ];
}
```

### Shop History Tracking

#### History Recording Rules
```typescript
interface HistoryRules {
  // What to track
  trackedEvents: {
    materialAdditions: true;       // Materials added to shop
    materialRemovals: true;        // Materials removed from shop
    priceChanges: true;            // All price updates
    stockUpdates: true;            // Stock quantity changes
    purchases: true;               // All transactions
  };

  // History details
  recordedData: {
    actor: true;                   // Who performed action
    timestamp: true;               // When it occurred
    previousValue: true;           // Before state
    newValue: true;                // After state
    description: true;             // Human-readable summary
    ipAddress: true;               // For security
  };

  // Retention
  retention: {
    shopHistory: 'PERMANENT';      // Never deleted
    priceHistory: 'PERMANENT';     // All price changes kept
    transactionHistory: 'PERMANENT'; // All purchases kept
  };

  // Access control
  access: {
    managers: 'FULL_ACCESS';       // See all history
    students: 'TEAM_TRANSACTIONS'; // Team's purchases only
  };
}
```

### Account History Integration

#### Financial Tracking
```typescript
interface AccountIntegration {
  // Automatic account history creation
  automaticRecording: true;

  // Transaction details in account history
  recordedDetails: {
    transactionType: 'SHOP_PURCHASE';
    amount: 'NEGATIVE';           // Expense
    description: '[Material] x[Quantity]';
    linkedEntity: 'ShopTransaction';
    teamBalance: 'AUTO_UPDATED';
  };

  // Reporting integration
  reporting: {
    includeInFinancials: true;    // Part of financial reports
    categorization: 'MATERIAL_EXPENSE';
    budgetImpact: true;           // Affects team budget
  };
}
```

## Role-Based Permissions

### Manager Permissions (All Activity Managers)
```typescript
interface ManagerPermissions {
  shop: {
    viewDashboard: true;
    exportData: true;
  };

  materials: {
    addMaterial: true;            // Add new materials to shop
    removeMaterial: true;         // Remove materials from shop
    setPrice: true;               // Set or update prices anytime
    setStockQuantity: true;       // Set how many to sell
    bulkUpdate: true;            // Update multiple at once
  };

  history: {
    viewAllTransactions: true;    // See all purchases
    viewPriceHistory: true;       // See all price changes
    viewShopHistory: true;        // Complete audit trail
    exportReports: true;          // Download reports
  };
}
```

### Student Permissions
```typescript
interface StudentPermissions {
  shop: {
    browse: true;                 // View available materials
    viewPrices: true;             // See current prices
    checkAvailability: true;      // See stock status
  };

  purchase: {
    createOrder: true;            // Buy materials
    selectQuantity: true;         // Choose amount
    selectDestination: true;      // Pick facility space
  };

  history: {
    viewOwnTransactions: true;    // Personal purchase history
    viewTeamTransactions: true;   // All team members' purchases
    viewTeamSpending: true;       // Team spending summary
    downloadReceipts: false;      // Not in MVP
  };
}
```

### Worker Permissions
```typescript
interface WorkerPermissions {
  shop: {
    browse: true;                 // Can view shop
    viewPrices: true;             // See pricing
  };

  purchase: {
    createOrder: false;           // Cannot purchase
  };

  history: {
    viewTransactions: false;      // No history access
  };
}
```

## Stock Management

### Stock Control Rules
```typescript
interface StockControlRules {
  // Stock limit options
  limitTypes: {
    unlimited: 'DEFAULT';         // No limits
    dailyLimit: number;          // Reset daily
    weeklyLimit: number;         // Reset weekly
    activityLimit: number;       // Total for activity
    perTeamLimit: number;        // Max per team
  };

  // Stock tracking (simplified)
  tracking: {
    quantityToSell: true;         // Manager sets limit (or unlimited)
    quantitySold: true;           // Track sales
    reservations: false;          // No pre-orders
    backorders: false;           // No waiting lists
  };
}
```

## Reporting

### Shop Reports
```typescript
interface ShopReports {
  // Transaction reports
  transactions: {
    transactionLog: true;         // Detailed purchase list
    teamPurchases: true;          // Purchases by team
    materialSales: true;          // Sales by material
  };

  // History reports
  history: {
    priceChangeLog: true;        // Price update history
    materialAdditions: true;     // When materials were added
    stockMovement: true;         // Inventory changes
    managerActivity: true;       // Manager action log
  };
}
```

## Error Handling

### Transaction Failures
```typescript
interface FailureHandling {
  insufficientFunds: {
    action: 'REJECT',
    message: 'Team has insufficient gold',
    suggestion: 'Check team balance'
  };

  materialNotFound: {
    action: 'REJECT',
    message: 'Material not found in shop',
    showAlternatives: false      // No alternatives in MVP
  };

  stockExhausted: {
    action: 'REJECT',
    message: 'Stock limit reached',
    showRemaining: true          // Show how many left
  };

  invalidFacility: {
    action: 'REJECT',
    message: 'Invalid or unowned facility',
    validateBeforePayment: true  // Check first
  };
}
```

## Compliance and Governance

### Audit Requirements
```typescript
interface AuditRequirements {
  // Comprehensive logging
  logging: {
    allPriceChanges: true;       // Every price update
    allTransactions: true;       // Every purchase
    materialChanges: true;       // Material add/remove
    managerActions: true;        // All manager activities
  };

  // Data integrity
  dataIntegrity: {
    immutableHistory: true;      // Cannot delete history
    timestampAccuracy: true;     // Precise timestamps
    actorTracking: true;        // Who did what
  };

  // Compliance
  compliance: {
    financialAccuracy: true;     // Accurate financial records
    fairTrading: true;          // Equal access for all teams
    priceTransparency: true;    // Current prices visible to all
  };
}
```

## Special Scenarios

### Activity Phase Transitions
```typescript
interface PhaseTransitionRules {
  // What happens on phase change
  onPhaseChange: {
    maintainPrices: true;        // Prices carry over
    allowPriceAdjustment: true;  // Managers can adjust for new phase
    resetStockLimits: 'OPTIONAL'; // Can reset if configured
    preserveHistory: true;       // All history retained
    notifyTeams: true;          // Alert all teams
  };
}
```

### Conflict Resolution
```typescript
interface ConflictResolution {
  // When managers update prices simultaneously
  priceConflicts: {
    resolution: 'LAST_CHANGE_WINS';  // Most recent update prevails
    notification: 'ALL_MANAGERS';     // All managers notified
    historyTracking: true;           // All changes logged
  };

  // Concurrent updates
  concurrentUpdates: {
    handling: 'SEQUENTIAL';      // Process in order
    locking: 'OPTIMISTIC';      // Assume success
    retryOnConflict: true;      // Auto-retry
  };
}
```

## Performance Guidelines

### Response Time Targets
```typescript
interface PerformanceTargets {
  browsing: {
    materialList: '<500ms';      // Load all materials
    priceDisplay: '<100ms';     // Show prices
  };

  purchasing: {
    validation: '<200ms';        // Check eligibility
    transaction: '<1000ms';      // Complete purchase
  };

  reporting: {
    recentHistory: '<500ms';     // Last 100 transactions
    fullExport: '<5000ms';      // Complete data export
  };
}
```

## Future Considerations

### Planned Enhancements
1. **Scheduled Availability**: Time-based material availability
2. **Approval Workflows**: Multi-manager approval for large price changes
3. **Budget Planning**: Integration with team budget allocation
4. **Material Bundles**: Package deals for related materials
5. **API Integration**: External system connections

This comprehensive business rules document ensures consistent behavior and clear operational boundaries for the activity-based Raw Material Shop module with collaborative management.