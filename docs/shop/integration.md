# Raw Material Shop Integration Requirements

## Overview
This document outlines the integration requirements for the activity-based Raw Material Shop module with existing platform systems. The shop provides centralized material distribution per activity with collaborative management by all activity managers.

## System Dependencies

### Core Dependencies
```typescript
interface SystemDependencies {
  required: [
    'UserModule',           // User authentication and roles
    'TeamModule',          // Team membership and permissions
    'FacilityModule',      // Facility spaces for delivery
    'RawMaterialModule',   // Material catalog
    'PrismaService',       // Database access
    'I18nService',         // Internationalization
    'ResponseFormatter'    // Standard response format
  ];

  optional: [
    'NotificationModule',  // Future: Transaction notifications
    'ReportingModule'      // Future: Report generation
  ];
}
```

## Integration Points

### 1. User & Authentication System

#### User Role Integration
```typescript
interface UserRoleIntegration {
  // Role validation
  requiredRoles: {
    shopManagement: ['MANAGER'];         // All managers in activity
    purchasing: ['STUDENT'];             // Students only
    browsing: ['ALL_USERS'];            // Everyone can browse
  };

  // Permission checks
  permissions: {
    'shop.manage': ['MANAGER'],         // Any manager in activity
    'shop.setPrice': ['MANAGER'],       // Collaborative pricing
    'shop.purchase': ['STUDENT'],       // Students only
    'shop.view': ['ALL_USERS']         // All can view
  };

  // User context with activity (derived from team membership)
  userContext: {
    userId: number;
    teamId: number;
    activityId: number;                // Derived from team's activity
    role: UserRole;
    permissions: string[];
  };
}

// Implementation example
@Injectable()
export class ShopAuthService {
  constructor(
    private readonly userService: UserService,
    private readonly teamService: TeamService,
    private readonly activityService: ActivityService
  ) {}

  // Get user's activity from auth context
  async getUserActivity(userId: number): Promise<number> {
    const user = await this.userService.findById(userId);
    const team = await this.teamService.findById(user.teamId);
    return team.activityId;
  }

  async validateShopAccess(
    userId: number,
    action: string
  ): Promise<boolean> {
    const user = await this.userService.findById(userId);
    const team = await this.teamService.findById(user.teamId);

    // Activity is determined from team membership
    const activityId = team.activityId;
    const shop = await this.findShopByActivityId(activityId);

    if (!shop) {
      return false;
    }

    // Managers can manage any shop in their activity
    if (user.role === 'MANAGER' && action.startsWith('shop.manage')) {
      return true;
    }

    // Check specific role permissions
    return this.hasPermission(user.role, action);
  }
}
```

#### JWT Token Integration
```typescript
interface JWTIntegration {
  // Extract user info from token
  tokenPayload: {
    userId: number;
    teamId: number;
    role: string;
    email: string;
  };

  // Guards to use
  guards: {
    shopManagement: 'UserAuthGuard + ManagerRoleGuard';
    purchasing: 'UserAuthGuard + StudentRoleGuard';
    browsing: 'UserAuthGuard';
  };
}

// Guard implementation
@UseGuards(UserAuthGuard, RolesGuard)
@Roles(UserRole.MANAGER)
@Controller('api/shop')
export class ShopManagementController {
  // Manager-only endpoints
}
```

### 2. Activity System Integration

#### Activity-Based Shop Model
```typescript
interface ActivityIntegration {
  // Activity constraints
  constraints: {
    oneShopPerActivity: true;           // Single shop per activity
    allTeamsCanAccess: true;           // All teams in activity
    sharedManagement: true;            // All managers collaborate
  };

  // Activity data access
  activityData: {
    activityId: number;
    activityName: string;
    teamCount: number;
    managerCount: number;
    phase: string;
  };

  // Activity operations
  operations: {
    getActivityTeams: (activityId: number) => Promise<Team[]>;
    getActivityManagers: (activityId: number) => Promise<User[]>;
    notifyAllManagers: (activityId: number, message: string) => Promise<void>;
  };
}

// Implementation
@Injectable()
export class ShopActivityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService
  ) {}

  // Get shop for user's current activity (from auth)
  async getCurrentActivityShop(userId: number): Promise<ActivityShop> {
    const activityId = await this.getUserActivity(userId);

    let shop = await this.prisma.activityShop.findUnique({
      where: { activityId }
    });

    if (!shop) {
      // Auto-create shop with activity
      shop = await this.prisma.activityShop.create({
        data: {
          activityId,
          materials: {
            create: [] // Shop starts empty
          }
        }
      });
    }

    return shop;
  }

  async notifyManagersOfPriceChange(
    activityId: number,
    materialId: number,
    changerId: number
  ): Promise<void> {
    const managers = await this.activityService.getManagers(activityId);

    // Notify all managers except the one who made the change
    const otherManagers = managers.filter(m => m.id !== changerId);

    await this.notificationService.sendToUsers(
      otherManagers.map(m => m.id),
      'Material price updated in shop'
    );
  }
}
```

### 3. Team System Integration

#### Team Financial Operations
```typescript
interface TeamIntegration {
  // Team operations for purchases
  operations: {
    validateFunds: (teamId: number, amount: number) => Promise<boolean>;
    deductGold: (teamId: number, amount: number) => Promise<void>;
    getBalance: (teamId: number) => Promise<number>;
  };

  // No seller team - shop owned by activity
  shopOwnership: 'ACTIVITY';

  // Payment flow
  paymentFlow: {
    source: 'TEAM_BALANCE';
    destination: 'ACTIVITY_SHOP';  // Not to another team
    instant: true;
  };
}

// Implementation
@Injectable()
export class ShopTeamService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  async processPayment(
    buyerTeamId: number,
    amount: number
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Validate funds
      const team = await tx.team.findUnique({
        where: { id: buyerTeamId }
      });

      if (team.goldBalance < amount) {
        throw new BusinessException('Insufficient funds');
      }

      // Deduct from buyer team
      await tx.team.update({
        where: { id: buyerTeamId },
        data: { goldBalance: { decrement: amount } }
      });

      // Money goes to activity shop (not another team)
      // Shop tracks total sales internally
    });
  }
}
```

### 4. Raw Material System Integration

#### Material Catalog Access
```typescript
interface MaterialIntegration {
  // Access material master data
  materialData: {
    getMaterial: (id: number) => Promise<RawMaterial>;
    getMaterialByNumber: (num: number) => Promise<RawMaterial>;
    getAllMaterials: () => Promise<RawMaterial[]>;
    getMaterialsByOrigin: (origin: string) => Promise<RawMaterial[]>;
  };

  // Material validation
  validation: {
    validateMaterialId: (id: number) => Promise<boolean>;
    checkMaterialActive: (id: number) => Promise<boolean>;
    getMaterialCosts: (id: number) => Promise<MaterialCosts>;
  };

  // Price validation
  priceValidation: {
    getBaseCost: (materialId: number) => Promise<number>;
    validatePrice: (price: number) => boolean; // Only check > 0
  };
}

// Implementation
@Injectable()
export class ShopMaterialService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  async validateMaterialListing(
    materialId: number,
    unitPrice: number
  ): Promise<void> {
    const material = await this.prisma.rawMaterial.findUnique({
      where: { id: materialId }
    });

    if (!material) {
      throw new BusinessException('Invalid material');
    }

    // Only constraint: price must be positive
    if (unitPrice <= 0) {
      throw new BusinessException('Price must be greater than 0');
    }
  }
}
```

### 4. Facility System Integration

#### Facility Space Delivery
```typescript
interface FacilityIntegration {
  // Facility validation
  validation: {
    validateFacilitySpace: (spaceId: number) => Promise<boolean>;
    checkOwnership: (spaceId: number, teamId: number) => Promise<boolean>;
    checkCapacity: (spaceId: number, quantity: number) => Promise<boolean>;
    checkCompatibility: (spaceId: number, materialId: number) => Promise<boolean>;
  };

  // Delivery operations
  delivery: {
    deliverMaterials: (
      spaceId: number,
      materialId: number,
      quantity: number
    ) => Promise<void>;

    updateInventory: (
      spaceId: number,
      materials: MaterialDelivery[]
    ) => Promise<void>;
  };

  // Space information
  spaceInfo: {
    getSpace: (id: number) => Promise<FacilitySpace>;
    getCapacity: (id: number) => Promise<number>;
    getCurrentInventory: (id: number) => Promise<Inventory>;
  };
}

// Implementation
@Injectable()
export class ShopDeliveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly facilityService: FacilityService
  ) {}

  async deliverToFacility(
    transaction: RawMaterialTransaction
  ): Promise<void> {
    // Validate facility space
    const space = await this.facilityService.getSpace(
      transaction.facilitySpaceId
    );

    if (!space || space.teamId !== transaction.buyerTeamId) {
      throw new BusinessException('Invalid facility space');
    }

    // Check capacity
    const hasCapacity = await this.facilityService.checkCapacity(
      space.id,
      transaction.quantity
    );

    if (!hasCapacity) {
      throw new BusinessException('Insufficient storage capacity');
    }

    // Deliver materials
    await this.facilityService.addMaterials(
      space.id,
      transaction.inventory.rawMaterialId,
      transaction.quantity
    );
  }
}
```

### 5. Exception Handling Integration

#### Standard Exception System
```typescript
interface ExceptionIntegration {
  // Custom exceptions
  exceptions: {
    ShopNotFoundException: BusinessException;
    InsufficientInventoryException: BusinessException;
    InsufficientFundsException: BusinessException;
    InvalidDestinationException: BusinessException;
    UnauthorizedShopAccessException: BusinessException;
  };

  // Error codes
  errorCodes: {
    SHOP_NOT_FOUND: 1001;
    SHOP_ALREADY_EXISTS: 1002;
    INSUFFICIENT_INVENTORY: 1005;
    INSUFFICIENT_FUNDS: 1007;
    INVALID_DESTINATION: 1008;
  };

  // I18n messages
  messages: {
    'shop.notFound': {
      en: 'Shop not found',
      zh: '商店未找到'
    };
    'shop.insufficientFunds': {
      en: 'Insufficient team funds',
      zh: '团队资金不足'
    };
  };
}

// Implementation
@Injectable()
export class ShopExceptionService {
  constructor(
    private readonly i18n: I18nService
  ) {}

  throwShopNotFound(lang: string = 'en'): never {
    throw new BusinessException(
      this.i18n.translate('shop.notFound', lang),
      1001
    );
  }

  throwInsufficientFunds(
    required: number,
    available: number,
    lang: string = 'en'
  ): never {
    throw new BusinessException(
      this.i18n.translate('shop.insufficientFunds', lang, {
        required,
        available
      }),
      1007
    );
  }
}
```

### 6. Response Formatting Integration

#### Standard Response Format
```typescript
interface ResponseIntegration {
  // Use ResponseFormatterInterceptor
  interceptor: 'ResponseFormatterInterceptor';

  // Response structure
  structure: {
    success: boolean;
    businessCode: number;
    message: string;
    data: any;
    timestamp: string;
    path?: string;
    extra?: object;
  };

  // Pagination format
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

// Controller implementation
@Controller('api/shop')
@UseInterceptors(ResponseFormatterInterceptor)
export class ShopController {
  @Get('materials')
  @UseGuards(UserAuthGuard)
  async getMaterials(
    @Req() request: AuthenticatedRequest
  ): Promise<ShopMaterialDto[]> {
    // Get activity from user's team membership
    const activityId = await this.shopService.getUserActivity(request.user.id);
    // Return raw data, interceptor formats it
    return this.shopService.getMaterialsForActivity(activityId);
  }

  @Get('team-transactions')
  @UseGuards(UserAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  async getTeamTransactions(
    @Req() request: AuthenticatedRequest,
    @Query() query: TeamTransactionsQueryDto
  ): Promise<TeamTransactionsResponseDto> {
    // Get team ID from user's authentication context
    const teamId = request.user.teamId;
    // Students can only view their own team's transactions
    return this.shopService.getTeamTransactions(teamId, query);
  }
}
```

### 7. Database Transaction Integration

#### Prisma Transaction Management
```typescript
interface TransactionIntegration {
  // Use Prisma transactions
  transactionWrapper: '$transaction';

  // Transaction isolation
  isolationLevel: 'Serializable'; // For inventory operations

  // Rollback strategy
  rollbackOn: [
    'InsufficientInventory',
    'InsufficientFunds',
    'DeliveryFailure',
    'ValidationError'
  ];

  // Retry logic
  retry: {
    maxAttempts: 3;
    delay: 100; // ms
    backoff: 'exponential';
  };
}

// Implementation
@Injectable()
export class ShopTransactionService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  async processPurchaseWithRetry(
    purchase: PurchaseDto
  ): Promise<TransactionResult> {
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        return await this.prisma.$transaction(
          async (tx) => {
            // Lock inventory
            const inventory = await tx.rawMaterialShopInventory.update({
              where: { id: purchase.inventoryId },
              data: {
                quantityReserved: {
                  increment: purchase.quantity
                }
              }
            });

            // Process payment
            await this.processPayment(tx, purchase);

            // Update inventory
            await tx.rawMaterialShopInventory.update({
              where: { id: purchase.inventoryId },
              data: {
                quantityAvailable: {
                  decrement: purchase.quantity
                },
                quantityReserved: {
                  decrement: purchase.quantity
                }
              }
            });

            // Deliver materials
            await this.deliverMaterials(tx, purchase);

            return { success: true };
          },
          {
            isolationLevel: 'Serializable',
            timeout: 10000
          }
        );
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw error;
        }
        await this.delay(100 * Math.pow(2, attempts));
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 8. Logging & Audit Integration

#### Audit Trail Requirements
```typescript
interface AuditIntegration {
  // Log all modifications
  auditEvents: [
    'SHOP_CREATED',
    'SHOP_UPDATED',
    'LISTING_ADDED',
    'LISTING_UPDATED',
    'LISTING_REMOVED',
    'PRICE_CHANGED',
    'PURCHASE_COMPLETED',
    'PURCHASE_FAILED'
  ];

  // Audit data
  auditData: {
    eventType: string;
    entityType: string;
    entityId: number;
    userId: number;
    teamId: number;
    changes?: object;
    metadata?: object;
    timestamp: Date;
  };

  // Retention
  retention: '1 year';
}

// Implementation
@Injectable()
export class ShopAuditService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger
  ) {}

  async logShopEvent(
    event: ShopAuditEvent
  ): Promise<void> {
    // Log to database
    await this.prisma.shopAuditLog.create({
      data: {
        eventType: event.type,
        shopId: event.shopId,
        userId: event.userId,
        changes: event.changes,
        createdAt: new Date()
      }
    });

    // Log to application logger
    this.logger.log(
      `Shop event: ${event.type} by user ${event.userId}`,
      'ShopAudit'
    );
  }
}
```

## Module Configuration

### NestJS Module Setup
```typescript
@Module({
  imports: [
    PrismaModule,
    UserModule,
    TeamModule,
    FacilityModule,
    RawMaterialModule,
    CommonModule, // For i18n, exceptions, etc.
  ],
  controllers: [
    ShopController,
    ShopInventoryController,
    ShopTransactionController
  ],
  providers: [
    ShopService,
    ShopInventoryService,
    ShopTransactionService,
    ShopDeliveryService,
    ShopAuthService,
    ShopAuditService,
    ShopRepository,
    ShopInventoryRepository,
    TransactionRepository
  ],
  exports: [
    ShopService // Export for other modules
  ]
})
export class ShopModule {}
```

### Repository Pattern Implementation
```typescript
// Base repository
@Injectable()
export class ShopRepository extends AbstractBaseRepository<ActivityShop> {
  constructor(prisma: PrismaService) {
    super(prisma);
    this.modelName = 'activityShop';
  }

  async findByActivityId(activityId: number): Promise<ActivityShop | null> {
    return this.prismaService.activityShop.findUnique({
      where: { activityId },
      include: {
        materials: {
          include: {
            rawMaterial: true
          }
        }
      }
    });
  }
}
```

## Testing Requirements

### Integration Testing
```typescript
describe('Shop Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userService: UserService;
  let teamService: TeamService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ShopModule, TestModule]
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  describe('Shop Creation', () => {
    it('should create shop for manager', async () => {
      // Setup test data
      const team = await createTestTeam();
      const manager = await createTestUser(UserRole.MANAGER, team.id);

      // Test shop creation
      const response = await request(app.getHttpServer())
        .post('/api/shop/create')
        .set('Authorization', `Bearer ${manager.token}`)
        .send({});

      expect(response.status).toBe(201);
      expect(response.body.data.teamId).toBe(team.id);
    });

    it('should prevent duplicate shops per team', async () => {
      // Test constraint
    });
  });

  describe('Purchase Flow', () => {
    it('should complete purchase transaction', async () => {
      // Test full purchase flow
    });
  });
});
```

## Performance Considerations

### Caching Strategy
```typescript
interface CachingStrategy {
  // Cache frequently accessed data
  cacheTargets: [
    'shopDetails',        // 5 minute TTL
    'inventoryList',      // 1 minute TTL
    'materialPrices',     // 30 second TTL
    'shopStatistics'      // 5 minute TTL
  ];

  // Cache implementation
  provider: 'Redis';

  // Cache keys
  keys: {
    shop: 'shop:{shopId}';
    inventory: 'shop:{shopId}:inventory';
    prices: 'shop:{shopId}:prices';
  };
}
```

### Database Optimization
```typescript
interface DatabaseOptimization {
  // Indexes
  indexes: [
    'shop_team_id',
    'inventory_shop_material',
    'transaction_buyer_status',
    'price_history_material_date'
  ];

  // Query optimization
  includes: {
    minimal: ['id', 'name', 'price'];
    standard: ['material', 'pricing'];
    full: ['material', 'pricing', 'history'];
  };

  // Pagination
  defaultLimit: 20;
  maxLimit: 100;
}
```

## Migration Path

### Initial Setup
```bash
# 1. Create Prisma models
echo "Create prisma/models/raw-material-shop.prisma"

# 2. Generate Prisma client
pnpm run prisma:generate

# 3. Create migration
pnpm run prisma:migrate -- --name add_shop_module

# 4. Seed initial data (dev only)
pnpm run prisma:seed
```

### Module Implementation Order
1. Create Prisma models and repositories
2. Implement core shop service
3. Add inventory management
4. Implement transaction processing
5. Add delivery integration
6. Create controllers and DTOs
7. Add guards and interceptors
8. Write integration tests
9. Add documentation

This integration document ensures the Raw Material Shop module seamlessly integrates with all existing platform systems while maintaining consistency with established patterns and conventions.