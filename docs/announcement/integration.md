# Announcement System Integration Guide

## Overview

This document provides comprehensive integration guidelines for implementing the announcement system within the existing business simulation platform. It covers authentication, authorization, database integration, service layer patterns, and interaction with other platform modules.

## Architecture Integration

### Module Structure

The announcement system follows the platform's modular architecture:

```typescript
// src/announcement/announcement.module.ts
import { Module } from '@nestjs/common';
import { AnnouncementController } from './controllers/announcement.controller';
import { AnnouncementService } from './services/announcement.service';
import { AnnouncementRepository } from './repositories/announcement.repository';
import { AnnouncementReactionRepository } from './repositories/announcement-reaction.repository';
import { PrismaModule } from '@/prisma/prisma.module';
import { UserModule } from '@/user/user.module';
import { ActivityModule } from '@/activity/activity.module';

@Module({
  imports: [
    PrismaModule,
    UserModule, // For user validation
    ActivityModule, // For activity validation
  ],
  controllers: [AnnouncementController],
  providers: [
    AnnouncementService,
    AnnouncementRepository,
    AnnouncementReactionRepository,
  ],
  exports: [AnnouncementService], // Export for other modules
})
export class AnnouncementModule {}
```

### Integration with AppModule

```typescript
// src/app.module.ts
import { AnnouncementModule } from './announcement/announcement.module';

@Module({
  imports: [
    // ... existing modules
    AnnouncementModule, // Add announcement module
    // ... other modules
  ],
})
export class AppModule {}
```

## Authentication Integration

### JWT Authentication

The announcement system uses the platform's existing JWT authentication:

```typescript
// All announcement endpoints use UserAuthGuard
import { UseGuards } from '@nestjs/common';
import { UserAuthGuard } from '@/common/guards/user-auth.guard';

@Controller('announcement')
@UseGuards(UserAuthGuard)
export class AnnouncementController {
  // All methods protected by default
}
```

### User Context Extraction

```typescript
// Get authenticated user from request
import { User } from '@/common/decorators/user.decorator';
import { User as UserEntity } from '@/user/entities/user.entity';

@Post()
create(
  @Body() dto: CreateAnnouncementDto,
  @User() user: UserEntity // Injected authenticated user
) {
  // user object contains id, userType, currentActivityId, etc.
}
```

## Authorization Integration

### Role-Based Access Control

Integration with existing RBAC system:

```typescript
// Custom decorator for role checking
import { RequireRole } from '@/common/decorators/require-role.decorator';
import { UserType } from '@/user/enums/user-type.enum';

@Post()
@RequireRole(UserType.MANAGER)
create(@Body() dto: CreateAnnouncementDto, @User() user: UserEntity) {
  // Only managers can access
}

@Get()
@RequireRole(UserType.STUDENT, UserType.MANAGER)
findAll(@User() user: UserEntity) {
  // Students and managers can access
}
```

### Permission Validation

```typescript
// Service-level permission checks
class AnnouncementService {
  async update(id: string, dto: UpdateAnnouncementDto, user: UserEntity) {
    const announcement = await this.repository.findById(id);

    // Integrate with existing permission system
    if (announcement.authorId !== user.id) {
      throw new ForbiddenException('ANNOUNCEMENT.ERRORS.NOT_AUTHOR');
    }

    // Proceed with update
  }
}
```

## Database Integration

### Repository Pattern

Following the platform's repository pattern:

```typescript
// src/announcement/repositories/announcement.repository.ts
import { Injectable } from '@nestjs/common';
import { AbstractBaseRepository } from '@/prisma/repositories/base.repository';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AnnouncementRepository extends AbstractBaseRepository<'announcement'> {
  constructor(prisma: PrismaService) {
    super(prisma);
    this.modelName = 'announcement';
  }

  // Custom queries specific to announcements
  async findByActivity(activityId: string, pagination: PaginationDto) {
    return this.findMany({
      where: {
        activityId,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });
  }
}
```

### Transaction Management

Using platform's transaction wrapper:

```typescript
// Complex operations with transaction
async addReaction(announcementId: string, userId: string, type: AnnouncementReactionType) {
  return this.prisma.executeTransaction(async (tx) => {
    // Check existing reaction
    const existing = await tx.announcementReaction.findUnique({
      where: {
        announcementId_userId: {
          announcementId,
          userId,
        },
      },
    });

    if (existing) {
      // Update reaction and counts
      const oldType = existing.reactionType;
      await tx.announcementReaction.update({
        where: { id: existing.id },
        data: { reactionType: type },
      });

      // Update counts
      await tx.announcement.update({
        where: { id: announcementId },
        data: {
          likeCount: {
            increment: oldType === 'DISLIKE' && type === 'LIKE' ? 1 : 0,
            decrement: oldType === 'LIKE' && type === 'DISLIKE' ? 1 : 0,
          },
          dislikeCount: {
            increment: oldType === 'LIKE' && type === 'DISLIKE' ? 1 : 0,
            decrement: oldType === 'DISLIKE' && type === 'LIKE' ? 1 : 0,
          },
        },
      });
    } else {
      // Create new reaction
      await tx.announcementReaction.create({
        data: {
          announcementId,
          userId,
          reactionType: type,
        },
      });

      // Update count
      await tx.announcement.update({
        where: { id: announcementId },
        data: {
          [type === 'LIKE' ? 'likeCount' : 'dislikeCount']: {
            increment: 1,
          },
        },
      });
    }
  });
}
```

## Activity Module Integration

### Activity Validation

```typescript
// Integrate with ActivityService for validation
import { ActivityService } from '@/activity/services/activity.service';

@Injectable()
export class AnnouncementService {
  constructor(
    private readonly activityService: ActivityService,
    private readonly repository: AnnouncementRepository,
  ) {}

  async create(dto: CreateAnnouncementDto, user: UserEntity) {
    // Validate user's activity enrollment
    const userActivity = await this.activityService.getUserActivity(user.id);

    if (!userActivity || userActivity.status !== 'ENROLLED') {
      throw new ForbiddenException('ANNOUNCEMENT.ERRORS.NOT_ENROLLED');
    }

    // Create announcement with validated activity
    return this.repository.create({
      ...dto,
      activityId: userActivity.activityId,
      authorId: user.id,
    });
  }
}
```

### Activity Lifecycle Hooks

```typescript
// Listen to activity events
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class AnnouncementService {
  @OnEvent('activity.completed')
  async handleActivityCompleted(payload: { activityId: string }) {
    // Archive all announcements for completed activity
    await this.repository.updateMany({
      where: { activityId: payload.activityId },
      data: { isActive: false },
    });
  }

  @OnEvent('activity.deleted')
  async handleActivityDeleted(payload: { activityId: string }) {
    // Cascade delete handled by database
    // Log for audit purposes
    console.log(`Announcements deleted for activity: ${payload.activityId}`);
  }
}
```

## User Module Integration

### User Service Integration

```typescript
// Integrate with UserService for user details
import { UserService } from '@/user/services/user.service';

@Injectable()
export class AnnouncementService {
  constructor(
    private readonly userService: UserService,
    private readonly repository: AnnouncementRepository,
  ) {}

  async enrichAnnouncementWithUserData(announcement: any) {
    // Get additional user data if needed
    const author = await this.userService.findById(announcement.authorId);

    return {
      ...announcement,
      author: {
        id: author.id,
        username: author.username,
        name: author.name,
        avatar: author.avatar, // Additional fields
        userType: author.userType,
      },
    };
  }
}
```

### User Type Validation

```typescript
// Validate user types for operations
import { UserType } from '@/user/enums/user-type.enum';

async validateManagerPermission(user: UserEntity) {
  if (user.userType !== UserType.MANAGER) {
    throw new ForbiddenException('ANNOUNCEMENT.ERRORS.MANAGER_ONLY');
  }
}

async validateStudentPermission(user: UserEntity) {
  if (user.userType !== UserType.STUDENT) {
    throw new ForbiddenException('ANNOUNCEMENT.ERRORS.STUDENT_ONLY');
  }
}
```

## Exception Handling Integration

### Custom Exceptions

Using platform's exception system:

```typescript
// Use existing business exceptions
import { BusinessException } from '@/common/exceptions/business.exception';
import { ErrorCodes } from '@/common/exceptions/error.codes';

throw new BusinessException(
  ErrorCodes.ANNOUNCEMENT_NOT_FOUND,
  'ANNOUNCEMENT.ERRORS.NOT_FOUND',
  { announcementId: id }
);
```

### Error Code Definition

```typescript
// Add to src/common/exceptions/error.codes.ts
export enum ErrorCodes {
  // ... existing codes

  // Announcement errors (45xxx range)
  ANNOUNCEMENT_NOT_FOUND = 45001,
  ANNOUNCEMENT_ACCESS_DENIED = 45002,
  ANNOUNCEMENT_INVALID_CONTENT = 45003,
  ANNOUNCEMENT_REACTION_EXISTS = 45004,
  ANNOUNCEMENT_NOT_ENROLLED = 45005,
}
```

### Global Exception Filter

Automatically handled by platform's GlobalExceptionFilter:

```typescript
// Exceptions are automatically caught and formatted
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Platform handles all exception formatting
    // Returns standardized error response
  }
}
```

## Response Formatting Integration

### Response Interceptor

Using platform's ResponseFormatterInterceptor:

```typescript
// Applied globally or at controller level
@UseInterceptors(ResponseFormatterInterceptor)
@Controller('announcement')
export class AnnouncementController {
  // All responses automatically formatted
}

// Response format
{
  success: true,
  businessCode: 20000,
  message: 'Announcement created successfully',
  data: { /* announcement data */ },
  timestamp: '2024-01-20T10:00:00.000Z',
  path: '/api/announcement'
}
```

## Internationalization Integration

### i18n Service Integration

```typescript
// Use platform's I18nService
import { I18nService } from '@/common/i18n/i18n.service';

@Injectable()
export class AnnouncementService {
  constructor(private readonly i18n: I18nService) {}

  async create(dto: CreateAnnouncementDto, lang: string) {
    // Get localized success message
    const message = await this.i18n.translate(
      'ANNOUNCEMENT.MESSAGES.CREATED',
      lang
    );

    return {
      announcement: created,
      message,
    };
  }
}
```

### Translation Keys

```json
// Add to src/common/i18n/translations/en/announcement.json
{
  "ANNOUNCEMENT": {
    "MESSAGES": {
      "CREATED": "Announcement created successfully",
      "UPDATED": "Announcement updated successfully",
      "DELETED": "Announcement deleted successfully",
      "REACTION_ADDED": "Reaction added successfully",
      "REACTION_REMOVED": "Reaction removed successfully"
    },
    "ERRORS": {
      "NOT_FOUND": "Announcement not found",
      "NOT_AUTHOR": "You are not the author of this announcement",
      "NOT_ENROLLED": "You are not enrolled in any activity",
      "MANAGER_ONLY": "Only managers can perform this action",
      "STUDENT_ONLY": "Only students can perform this action"
    }
  }
}
```

## Logging Integration

### Operation Logging

Using platform's OperationLogInterceptor:

```typescript
// Apply to sensitive operations
import { OperationLogInterceptor } from '@/common/interceptors/operation-log.interceptor';

@UseInterceptors(OperationLogInterceptor)
@Delete(':id')
async delete(@Param('id') id: string, @User() user: UserEntity) {
  // Deletion automatically logged
  return this.service.delete(id, user);
}
```

### Custom Logging

```typescript
// Use platform's logger
import { Logger } from '@nestjs/common';

@Injectable()
export class AnnouncementService {
  private readonly logger = new Logger(AnnouncementService.name);

  async create(dto: CreateAnnouncementDto, user: UserEntity) {
    this.logger.log(`Creating announcement for activity ${user.activityId}`);

    try {
      const result = await this.repository.create(data);
      this.logger.log(`Announcement ${result.id} created successfully`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to create announcement: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

## Validation Integration

### DTO Validation

Using class-validator with platform patterns:

```typescript
// DTOs with validation
import { IsString, IsNotEmpty, MaxLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnnouncementDto {
  @ApiProperty({
    description: 'Announcement title',
    example: 'Team Meeting Tomorrow',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Announcement content',
    example: 'Please attend the meeting at 10 AM',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
```

### Custom Validators

```typescript
// Custom validation rules
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isValidReactionType', async: false })
export class IsValidReactionType implements ValidatorConstraintInterface {
  validate(value: any) {
    return value === 'LIKE' || value === 'DISLIKE';
  }

  defaultMessage() {
    return 'Reaction type must be either LIKE or DISLIKE';
  }
}
```

## Testing Integration

### Test Module Setup

```typescript
// test/announcement/announcement.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementService } from '@/announcement/services/announcement.service';
import { PrismaService } from '@/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';

describe('AnnouncementService', () => {
  let service: AnnouncementService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
      ],
      providers: [
        AnnouncementService,
        PrismaService,
        // Mock other dependencies
      ],
    }).compile();

    service = module.get<AnnouncementService>(AnnouncementService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  // Test cases
});
```

## Seeding Integration

### Seed Data

```typescript
// prisma/seed-data/announcements.seed.ts
export const announcementSeedData = {
  development: [
    {
      id: 'announcement-1',
      activityId: 'activity-1',
      authorId: 'manager-1',
      title: 'Welcome to Business Simulation',
      content: 'Welcome all participants to our Q1 2024 simulation...',
      isActive: true,
      likeCount: 0,
      dislikeCount: 0,
    },
    // More seed data
  ],
  production: [
    // Minimal production seed data
  ],
};
```

### Seed Orchestration

```typescript
// Add to prisma/seed-orchestrator.ts
import { announcementSeedData } from './seed-data/announcements.seed';

class SeedOrchestrator {
  async seed() {
    // ... existing seeding

    // Seed announcements
    await this.seedAnnouncements();

    // Seed reactions
    await this.seedAnnouncementReactions();
  }

  private async seedAnnouncements() {
    const data = announcementSeedData[this.environment];

    for (const announcement of data) {
      await this.prisma.announcement.upsert({
        where: { id: announcement.id },
        update: {},
        create: announcement,
      });
    }
  }
}
```

## Performance Optimization

### Query Optimization

```typescript
// Optimized queries with selective includes
async getAnnouncementsOptimized(activityId: string) {
  return this.prisma.announcement.findMany({
    where: {
      activityId,
      isActive: true,
    },
    select: {
      id: true,
      title: true,
      content: true,
      likeCount: true,
      dislikeCount: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          username: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20,
  });
}
```

### Caching Strategy

```typescript
// Integration with platform's caching
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AnnouncementService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getAnnouncements(activityId: string) {
    const cacheKey = `announcements:${activityId}`;

    // Check cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    // Fetch from database
    const announcements = await this.repository.findByActivity(activityId);

    // Cache for 5 minutes
    await this.cacheManager.set(cacheKey, announcements, 300);

    return announcements;
  }
}
```

## Monitoring Integration

### Metrics Collection

```typescript
// Integration with platform metrics
import { Counter, Histogram } from 'prom-client';

const announcementCreatedCounter = new Counter({
  name: 'announcement_created_total',
  help: 'Total number of announcements created',
  labelNames: ['activityId'],
});

const reactionTimeHistogram = new Histogram({
  name: 'announcement_reaction_duration_seconds',
  help: 'Duration of reaction operations',
  labelNames: ['operation'],
});

// Use in service
async create(dto: CreateAnnouncementDto, user: UserEntity) {
  const result = await this.repository.create(data);
  announcementCreatedCounter.inc({ activityId: user.activityId });
  return result;
}
```

## Migration Path

### Implementation Phases

1. **Phase 1: Core Infrastructure**
   - Create Prisma models
   - Implement repositories
   - Basic service layer

2. **Phase 2: API Implementation**
   - Controller endpoints
   - DTO validation
   - Permission checks

3. **Phase 3: Integration**
   - Activity integration
   - User integration
   - i18n support

4. **Phase 4: Testing & Optimization**
   - Unit tests
   - Integration tests
   - Performance optimization

### Rollback Strategy

```typescript
// Graceful feature toggle
const FEATURE_ANNOUNCEMENT_ENABLED = process.env.FEATURE_ANNOUNCEMENT_ENABLED === 'true';

@Controller('announcement')
export class AnnouncementController {
  @Get()
  async findAll() {
    if (!FEATURE_ANNOUNCEMENT_ENABLED) {
      throw new ServiceUnavailableException('Feature temporarily disabled');
    }
    // Normal operation
  }
}
```

## Deployment Considerations

### Database Migrations

```bash
# Generate migration
pnpm run prisma:migrate

# Apply migration
pnpm run prisma:migrate:deploy

# Rollback if needed
pnpm run prisma:migrate:reset
```

### Environment Variables

```env
# Add to .env files
ANNOUNCEMENT_MAX_CONTENT_LENGTH=10000
ANNOUNCEMENT_RATE_LIMIT=30
ANNOUNCEMENT_CACHE_TTL=300
```

### Health Checks

```typescript
// Add announcement health check
@Injectable()
export class AnnouncementHealthIndicator extends HealthIndicator {
  async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.announcement.count();
      return this.getStatus('announcement', true);
    } catch (error) {
      return this.getStatus('announcement', false, { error: error.message });
    }
  }
}
```