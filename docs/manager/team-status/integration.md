# Integration: Manager Team Status

## Overview

This document describes how the Manager Team Status Dashboard integrates with the existing ServerIdeomni platform architecture, including authentication, authorization, logging, and other core systems.

## System Architecture Integration

### Module Structure

```typescript
// src/manager/manager.module.ts
@Module({
  imports: [
    PrismaModule,
    UserModule,
    ActivityModule,
    MapModule,
    FacilityModule,
    I18nModule,
    LoggerModule,
  ],
  controllers: [
    TeamStatusController,
  ],
  providers: [
    TeamStatusService,
    TeamAggregationService,
    TeamAuthorizationService,
  ],
  exports: [
    TeamStatusService,
  ],
})
export class ManagerModule {}
```

### Integration with AppModule

```typescript
// src/app.module.ts
@Module({
  imports: [
    // ... existing modules
    ManagerModule, // Add manager module
  ],
})
export class AppModule {}
```

## Authentication Integration

### JWT Strategy Extension

```typescript
// src/auth/strategies/manager-jwt.strategy.ts
@Injectable()
export class ManagerJwtStrategy extends PassportStrategy(Strategy, 'manager-jwt') {
  constructor(
    private readonly userService: UserService,
    private readonly activityService: ActivityService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    // Validate user exists and is a manager
    const user = await this.userService.findById(payload.sub);

    if (!user || user.userType !== 1) {
      throw new UnauthorizedException('Not a manager');
    }

    // Get current activity enrollment
    const enrollment = await this.activityService.getUserCurrentActivity(user.id);

    if (!enrollment) {
      throw new UnauthorizedException('No active activity enrollment');
    }

    return {
      userId: user.id,
      username: user.username,
      userType: user.userType,
      activityId: enrollment.activityId,
    };
  }
}
```

### Guard Implementation

```typescript
// src/manager/guards/manager.guard.ts
@Injectable()
export class ManagerGuard implements CanActivate {
  async canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if user is a manager
    if (!user || user.userType !== 1) {
      throw new ForbiddenException('Manager access required');
    }

    // Check activity enrollment
    if (!user.activityId) {
      throw new ForbiddenException('No active activity enrollment');
    }

    return true;
  }
}
```

## Authorization Integration

### Team Access Validator

```typescript
// src/manager/services/team-authorization.service.ts
@Injectable()
export class TeamAuthorizationService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async validateTeamAccess(
    teamId: string,
    activityId: string,
  ): Promise<boolean> {
    const team = await this.prisma.team.findFirst({
      where: {
        id: teamId,
        activityId: activityId,
        deletedAt: null,
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found in your activity');
    }

    return true;
  }

  async validateBulkTeamAccess(
    teamIds: string[],
    activityId: string,
  ): Promise<boolean> {
    const teams = await this.prisma.team.count({
      where: {
        id: { in: teamIds },
        activityId: activityId,
        deletedAt: null,
      },
    });

    if (teams !== teamIds.length) {
      throw new ForbiddenException('Some teams are not in your activity');
    }

    return true;
  }
}
```

## Logging Integration

### Operation Logging

```typescript
// src/manager/interceptors/manager-logging.interceptor.ts
@Injectable()
export class ManagerLoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const start = Date.now();

    // Log manager access
    await this.logManagerAccess(user, request);

    return next.handle().pipe(
      tap(async (response) => {
        const duration = Date.now() - start;

        // Log successful operation
        await this.logSuccessfulOperation(
          user,
          request,
          response,
          duration,
        );
      }),
      catchError(async (error) => {
        const duration = Date.now() - start;

        // Log failed operation
        await this.logFailedOperation(
          user,
          request,
          error,
          duration,
        );

        throw error;
      }),
    );
  }

  private async logManagerAccess(user: any, request: any) {
    await this.prisma.userOperationLog.create({
      data: {
        userId: user.userId,
        action: 'MANAGER_TEAM_ACCESS',
        resource: 'TeamStatus',
        resourceId: request.params.teamId || null,
        description: `Manager accessed ${request.path}`,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        metadata: {
          activityId: user.activityId,
          path: request.path,
          method: request.method,
          query: request.query,
        },
      },
    });
  }
}
```

## Exception Handling Integration

### Custom Exceptions

```typescript
// src/manager/exceptions/manager.exceptions.ts
export class NoActivityEnrollmentException extends BusinessException {
  constructor() {
    super(
      'manager.error.noActivityEnrollment',
      'No active activity enrollment found',
      HttpStatus.NOT_FOUND,
      2002,
    );
  }
}

export class TeamNotInActivityException extends BusinessException {
  constructor(teamId: string) {
    super(
      'manager.error.teamNotInActivity',
      `Team ${teamId} is not in your activity`,
      HttpStatus.FORBIDDEN,
      1003,
    );
  }
}

export class ManagerAccessDeniedException extends BusinessException {
  constructor() {
    super(
      'manager.error.accessDenied',
      'Manager access required',
      HttpStatus.FORBIDDEN,
      1002,
    );
  }
}
```

### Exception Filter Integration

```typescript
// src/manager/filters/manager-exception.filter.ts
@Catch()
export class ManagerExceptionFilter extends GlobalExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const lang = this.extractLanguage(request);

    // Handle manager-specific exceptions
    if (exception instanceof NoActivityEnrollmentException) {
      return this.formatResponse(
        false,
        exception.businessCode,
        this.i18n.translate(exception.messageKey, lang),
        null,
        request.path,
      );
    }

    // Delegate to global exception filter
    return super.catch(exception, host);
  }
}
```

## Response Formatting Integration

### Response Interceptor

```typescript
// src/manager/interceptors/manager-response.interceptor.ts
@Injectable()
export class ManagerResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const lang = this.extractLanguage(request);

    return next.handle().pipe(
      map((data) => {
        // Apply standard response format
        return {
          success: true,
          businessCode: 0,
          message: data.message || this.getDefaultMessage(request.path, lang),
          data: data.data || data,
          timestamp: new Date().toISOString(),
          path: request.path,
          extra: {
            activityId: request.user?.activityId,
            managerId: request.user?.userId,
          },
        };
      }),
    );
  }
}
```

## Repository Integration

### Team Repository Extension

```typescript
// src/manager/repositories/team-status.repository.ts
@Injectable()
export class TeamStatusRepository extends AbstractBaseRepository<
  Team,
  Prisma.TeamDelegate<DefaultArgs>
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.modelName = 'team';
  }

  async findTeamsByActivity(
    activityId: string,
    options: PaginationOptions,
  ): Promise<PaginatedResult<Team>> {
    const where = {
      activityId,
      deletedAt: null,
    };

    const [items, total] = await Promise.all([
      this.model.findMany({
        where,
        skip: options.skip,
        take: options.take,
        orderBy: options.orderBy,
        include: {
          leader: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
          account: true,
          _count: {
            select: {
              members: {
                where: { status: 'ACTIVE' },
              },
            },
          },
        },
      }),
      this.model.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages: Math.ceil(total / options.limit),
      },
    };
  }
}
```

## Service Layer Integration

### Dependency Injection

```typescript
// src/manager/services/team-status.service.ts
@Injectable()
export class TeamStatusService {
  constructor(
    // Core services
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(I18nService) private readonly i18n: I18nService,
    @Inject(LoggerService) private readonly logger: LoggerService,

    // Feature services
    @Inject(UserService) private readonly userService: UserService,
    @Inject(ActivityService) private readonly activityService: ActivityService,
    @Inject(MapService) private readonly mapService: MapService,
    @Inject(FacilityService) private readonly facilityService: FacilityService,

    // Manager-specific services
    @Inject(TeamAuthorizationService)
    private readonly authService: TeamAuthorizationService,
    @Inject(TeamAggregationService)
    private readonly aggregationService: TeamAggregationService,
  ) {}
}
```

## Database Transaction Integration

### Transaction Management

```typescript
// src/manager/services/team-aggregation.service.ts
@Injectable()
export class TeamAggregationService {
  async getTeamCompleteStatus(teamId: string): Promise<TeamCompleteStatus> {
    return await this.prisma.$transaction(async (tx) => {
      // All queries in same transaction for consistency
      const [team, operations, facilities, landOwnership, members] =
        await Promise.all([
          tx.team.findUnique({
            where: { id: teamId },
            include: { leader: true, account: true },
          }),
          tx.teamOperationHistory.findMany({
            where: { teamId },
            take: 10,
            orderBy: { createdAt: 'desc' },
          }),
          tx.tileFacilityInstance.findMany({
            where: { teamId },
          }),
          tx.tileLandOwnership.findMany({
            where: { teamId },
          }),
          tx.teamMember.findMany({
            where: { teamId },
            include: { user: true },
          }),
        ]);

      return this.aggregateTeamData({
        team,
        operations,
        facilities,
        landOwnership,
        members,
      });
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
    });
  }
}
```

## Cache Integration

### Redis Cache Service

```typescript
// src/manager/services/team-cache.service.ts
@Injectable()
export class TeamCacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getCachedTeamList(
    activityId: string,
    options: PaginationOptions,
  ): Promise<PaginatedResult<Team> | null> {
    const key = this.generateCacheKey('team-list', activityId, options);
    return await this.cacheManager.get(key);
  }

  async setCachedTeamList(
    activityId: string,
    options: PaginationOptions,
    data: PaginatedResult<Team>,
  ): Promise<void> {
    const key = this.generateCacheKey('team-list', activityId, options);
    await this.cacheManager.set(key, data, 300); // 5 minutes TTL
  }

  async invalidateTeamCache(activityId: string): Promise<void> {
    const pattern = `team-list:${activityId}:*`;
    const keys = await this.cacheManager.store.keys(pattern);
    await Promise.all(keys.map(key => this.cacheManager.del(key)));
  }

  private generateCacheKey(
    prefix: string,
    activityId: string,
    options: any,
  ): string {
    const optionsHash = crypto
      .createHash('md5')
      .update(JSON.stringify(options))
      .digest('hex');
    return `${prefix}:${activityId}:${optionsHash}`;
  }
}
```

## Performance Monitoring Integration

### Metrics Collection

```typescript
// src/manager/services/team-metrics.service.ts
@Injectable()
export class TeamMetricsService {
  private readonly metrics = new Map<string, MetricData>();

  async trackQuery<T>(
    operation: string,
    query: () => Promise<T>,
  ): Promise<T> {
    const start = process.hrtime.bigint();

    try {
      const result = await query();
      const duration = Number(process.hrtime.bigint() - start) / 1_000_000;

      this.recordMetric(operation, duration, true);

      if (duration > 1000) {
        this.logger.warn(`Slow query detected: ${operation} took ${duration}ms`);
      }

      return result;
    } catch (error) {
      const duration = Number(process.hrtime.bigint() - start) / 1_000_000;
      this.recordMetric(operation, duration, false);
      throw error;
    }
  }

  private recordMetric(
    operation: string,
    duration: number,
    success: boolean,
  ) {
    const metric = this.metrics.get(operation) || {
      count: 0,
      totalDuration: 0,
      maxDuration: 0,
      errors: 0,
    };

    metric.count++;
    metric.totalDuration += duration;
    metric.maxDuration = Math.max(metric.maxDuration, duration);
    if (!success) metric.errors++;

    this.metrics.set(operation, metric);
  }

  getMetrics(): Record<string, MetricData> {
    return Object.fromEntries(this.metrics);
  }
}
```

## Testing Integration

### E2E Test Setup

```typescript
// src/manager/tests/team-status.e2e-spec.ts
describe('Manager Team Status E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let managerId: string;
  let activityId: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);

    // Setup test data
    const { manager, activity, token } = await setupTestData(prisma);
    managerId = manager.id;
    activityId = activity.id;
    authToken = token;
  });

  describe('GET /api/manager/teams', () => {
    it('should return paginated team list', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/manager/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          items: expect.any(Array),
          pagination: {
            page: 1,
            limit: 10,
            total: expect.any(Number),
            totalPages: expect.any(Number),
          },
        },
      });
    });

    it('should reject non-manager access', async () => {
      const studentToken = await getStudentToken();

      await request(app.getHttpServer())
        .get('/api/manager/teams')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });
  });
});
```

## Deployment Integration

### Environment Configuration

```env
# Manager Module Configuration
MANAGER_CACHE_TTL=300
MANAGER_MAX_EXPORT_ROWS=10000
MANAGER_RATE_LIMIT_PER_MINUTE=60
MANAGER_ENABLE_METRICS=true
MANAGER_ENABLE_AUDIT_LOG=true
```

### Docker Integration

```dockerfile
# Additional configuration for manager module
ENV MANAGER_CACHE_TTL=300
ENV MANAGER_MAX_EXPORT_ROWS=10000
ENV MANAGER_ENABLE_METRICS=true
```

### Health Check Integration

```typescript
// src/manager/health/team-status.health.ts
@Injectable()
export class TeamStatusHealthIndicator extends HealthIndicator {
  constructor(
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Check database connectivity
      const teamCount = await this.prisma.team.count();

      // Check response time
      const start = Date.now();
      await this.prisma.team.findFirst();
      const responseTime = Date.now() - start;

      const isHealthy = responseTime < 100;

      return this.getStatus(key, isHealthy, {
        teamCount,
        responseTime,
      });
    } catch (error) {
      return this.getStatus(key, false, { error: error.message });
    }
  }
}
```

## Migration Strategy

### Database Migrations

```sql
-- Add indexes for manager queries
CREATE INDEX idx_team_activity_deleted ON teams(activityId, deletedAt);
CREATE INDEX idx_operation_team_created ON team_operation_history(teamId, createdAt DESC);
CREATE INDEX idx_facility_team_activity ON tile_facility_instances(teamId, activityId);
CREATE INDEX idx_land_team_activity ON tile_land_ownership(teamId, activityId);
```

### Feature Flag Integration

```typescript
// src/manager/config/feature-flags.ts
export enum ManagerFeatureFlags {
  TEAM_STATUS_ENABLED = 'manager.teamStatus.enabled',
  EXPORT_ENABLED = 'manager.export.enabled',
  REAL_TIME_UPDATES = 'manager.realtime.enabled',
}

@Injectable()
export class ManagerFeatureFlagService {
  isEnabled(flag: ManagerFeatureFlags): boolean {
    return this.configService.get<boolean>(flag, true);
  }
}
```

## Monitoring and Alerting

### Prometheus Metrics

```typescript
// src/manager/metrics/prometheus.metrics.ts
@Injectable()
export class ManagerPrometheusMetrics {
  private readonly teamListDuration = new Histogram({
    name: 'manager_team_list_duration_seconds',
    help: 'Duration of team list queries',
    labelNames: ['status'],
  });

  private readonly teamAccessCounter = new Counter({
    name: 'manager_team_access_total',
    help: 'Total number of team access requests',
    labelNames: ['manager_id', 'activity_id'],
  });

  recordTeamListQuery(duration: number, status: 'success' | 'error') {
    this.teamListDuration.observe({ status }, duration / 1000);
  }

  recordTeamAccess(managerId: string, activityId: string) {
    this.teamAccessCounter.inc({ manager_id: managerId, activity_id: activityId });
  }
}
```