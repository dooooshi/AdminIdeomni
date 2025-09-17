# Bulk Import Architecture Design

## System Architecture

### Core Components

```
┌─────────────────┐
│   Admin Client  │
│  (JSON Request) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Gateway    │
│  (Auth/Rate     │
│   Limiting)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Bulk Import    │
│  Controller     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validation     │
│  Service        │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│Success │ │ Failure│
│  Path  │ │  Path  │
└────┬───┘ └────┬───┘
     │          │
     ▼          ▼
┌────────┐ ┌────────┐
│Create  │ │Return  │
│Service │ │Errors  │
└────┬───┘ └────────┘
     │
     ▼
┌────────────────┐
│   Transaction  │
│    Manager     │
└────────┬───────┘
         │
         ▼
┌────────────────┐
│   PostgreSQL   │
│   Database     │
└────────────────┘
```

## Implementation Components

### 1. Controller Layer

```typescript
// src/admin/controllers/admin-bulk-import.controller.ts

@Controller('api/admin/users')
export class AdminBulkImportController {

  @Post('bulk-import')
  @AdminAuth()
  @UseInterceptors(RateLimitInterceptor)
  async bulkImport(
    @Request() req: AdminRequest,
    @Body() dto: BulkImportDto
  ): Promise<BulkImportResponse> {
    return this.bulkImportService.import(dto, req.admin.id);
  }

  @Post('bulk-import/validate')
  @AdminAuth()
  async validateBulkImport(
    @Request() req: AdminRequest,
    @Body() dto: BulkImportDto
  ): Promise<ValidationResponse> {
    return this.validationService.validateBatch(dto.users);
  }
}
```

### 2. Validation Service

```typescript
// src/admin/services/bulk-import-validation.service.ts

export class BulkImportValidationService {

  async validateBatch(users: BulkImportUser[]): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const processedUsernames = new Set<string>();
    const processedEmails = new Set<string>();

    // Phase 1: Validate within batch
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const userErrors = [];

      // Check duplicate username within batch
      if (processedUsernames.has(user.username)) {
        userErrors.push({
          field: 'username',
          code: 'BATCH_USERNAME_DUPLICATE',
          message: `Duplicate username in batch: ${user.username}`
        });
      }
      processedUsernames.add(user.username);

      // Check duplicate email within batch
      if (processedEmails.has(user.email)) {
        userErrors.push({
          field: 'email',
          code: 'BATCH_EMAIL_DUPLICATE',
          message: `Duplicate email in batch: ${user.email}`
        });
      }
      processedEmails.add(user.email);

      // Validate userType is student only
      if (user.userType && user.userType !== 3) {
        userErrors.push({
          field: 'userType',
          code: 'USERTYPE_INVALID',
          message: 'Only students (userType=3) can be bulk imported'
        });
      }

      // Validate user fields
      const fieldErrors = this.validateUserFields(user);
      userErrors.push(...fieldErrors);

      if (userErrors.length > 0) {
        errors.push({
          index: i,
          username: user.username,
          errors: userErrors
        });
      }
    }

    // Phase 2: Check against database
    if (errors.length === 0) {
      const dbErrors = await this.checkDatabaseConflicts(users);
      errors.push(...dbErrors);
    }

    return {
      valid: errors.length === 0,
      errors,
      summary: {
        totalSubmitted: users.length,
        validUsers: users.length - errors.length,
        invalidUsers: errors.length
      }
    };
  }

  private validateUserFields(user: BulkImportUser): FieldError[] {
    const errors: FieldError[] = [];

    // Username validation
    if (!user.username || user.username.length < 3) {
      errors.push({
        field: 'username',
        code: 'USERNAME_INVALID',
        message: 'Username must be at least 3 characters'
      });
    }

    // Email validation
    if (!this.isValidEmail(user.email)) {
      errors.push({
        field: 'email',
        code: 'EMAIL_INVALID',
        message: 'Invalid email format'
      });
    }

    // UserType validation - removed as it's always 3 for bulk import

    // Password validation
    if (user.password && user.password.length < 6) {
      errors.push({
        field: 'password',
        code: 'PASSWORD_WEAK',
        message: 'Password must be at least 6 characters'
      });
    }

    return errors;
  }

  private async checkDatabaseConflicts(
    users: BulkImportUser[]
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Batch check for existing usernames
    const usernames = users.map(u => u.username);
    const existingUsernames = await this.userRepository.findExistingUsernames(usernames);

    // Batch check for existing emails
    const emails = users.map(u => u.email);
    const existingEmails = await this.userRepository.findExistingEmails(emails);

    users.forEach((user, index) => {
      const userErrors = [];

      if (existingUsernames.includes(user.username)) {
        userErrors.push({
          field: 'username',
          code: 'USERNAME_EXISTS',
          message: `Username already exists: ${user.username}`
        });
      }

      if (existingEmails.includes(user.email)) {
        userErrors.push({
          field: 'email',
          code: 'EMAIL_EXISTS',
          message: `Email already exists: ${user.email}`
        });
      }

      if (userErrors.length > 0) {
        errors.push({
          index,
          username: user.username,
          errors: userErrors
        });
      }
    });

    return errors;
  }
}
```

### 3. Bulk Import Service

```typescript
// src/admin/services/bulk-import.service.ts

export class BulkImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly validationService: BulkImportValidationService
  ) {}

  async import(
    dto: BulkImportDto,
    adminId: string
  ): Promise<BulkImportResponse> {
    // Step 1: Validate all users
    const validation = await this.validationService.validateBatch(dto.users);

    if (!validation.valid) {
      return {
        created: false,
        validationErrors: validation.errors,
        summary: validation.summary
      };
    }

    // Step 2: Process passwords
    const usersWithPasswords = await this.processPasswords(dto.users, dto.options);

    // Step 3: Create users in transaction
    try {
      const createdUsers = await this.createUsersInTransaction(
        usersWithPasswords,
        adminId,
        dto.options
      );

      return {
        created: true,
        totalUsers: createdUsers.length,
        users: createdUsers.map(user => ({
          username: user.username,
          userId: user.id,
          email: user.email,
          temporaryPassword: user.temporaryPassword || null
        }))
      };
    } catch (error) {
      // Log the actual error for debugging
      this.logger.error('Bulk import transaction failed', {
        error: error.message,
        adminId,
        userCount: users.length
      });

      // Return user-friendly error
      throw new InternalServerErrorException({
        message: 'Transaction failed. No users were created.',
        businessCode: 5002,
        details: 'All changes have been rolled back'
      });
    }
  }

  private async createUsersInTransaction(
    users: ProcessedUser[],
    adminId: string,
    options: BulkImportOptions
  ): Promise<CreatedUser[]> {
    return await this.prisma.$transaction(async (tx) => {
      const createdUsers: CreatedUser[] = [];

      for (const user of users) {
        // Hash password
        const hashedPassword = await bcrypt.hash(user.password, 10);

        // Create user (creator field left null for admin imports)
        const createdUser = await tx.user.create({
          data: {
            username: user.username,
            email: user.email,
            password: hashedPassword,
            firstName: user.firstName,
            lastName: user.lastName,
            userType: 3,  // Always student for bulk imports
            isActive: user.isActive ?? true,
            creator: null  // null for admin imports (field is for User-to-User creation)
          }
        });

        // Assign roles if provided - validate they are student roles
        if (user.roles && user.roles.length > 0) {
          // Validate roles are appropriate for students
          const validStudentRoles = await this.validateStudentRoles(tx, user.roles);

          if (validStudentRoles.length > 0) {
            await tx.userRole.createMany({
              data: validStudentRoles.map(roleId => ({
                userId: createdUser.id,
                roleId: roleId,
                assignedAt: new Date()
              }))
            });
          }
        }

        // Create audit log in AdminOperationLog table
        await tx.adminOperationLog.create({
          data: {
            adminId,
            action: 'BULK_CREATE_USER',
            resource: 'User',
            resourceId: createdUser.id,
            description: `Bulk created user: ${user.username}`,
            ipAddress: req.ip,  // Capture from request
            userAgent: req.headers['user-agent'],
            metadata: {
              username: user.username,
              email: user.email,
              userType: user.userType,
              bulkImportBatch: true,
              rolesAssigned: user.roles || []
            }
          }
        });

        createdUsers.push({
          ...createdUser,
          temporaryPassword: user.temporaryPassword
        });
      }

      // Send welcome emails if requested
      if (options.sendWelcomeEmail) {
        await this.sendWelcomeEmails(createdUsers);
      }

      return createdUsers;
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      timeout: 30000 // 30 second timeout
    });
  }

  private async processPasswords(
    users: BulkImportUser[],
    options: BulkImportOptions
  ): Promise<ProcessedUser[]> {
    return users.map(user => {
      if (!user.password && options.generatePasswordsIfMissing) {
        const temporaryPassword = this.generatePassword(
          options.passwordLength || 12
        );
        return {
          ...user,
          password: temporaryPassword,
          temporaryPassword
        };
      }
      return user as ProcessedUser;
    });
  }

  private generatePassword(length: number): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }
}
```

### 4. Database Integration

#### Existing Models Used

```prisma
// User model - already exists in prisma/models/user.prisma
model User {
  id            String    @id @default(cuid())
  username      String    @unique
  email         String    @unique
  password      String
  firstName     String?
  lastName      String?
  userType      Int       @default(3)
  isActive      Boolean   @default(true)
  creator       String?   // Links to Admin who created this user
  createdBy     User?     @relation("UserCreator", fields: [creator], references: [id])
  roles         UserRole[]
  // ... other fields
}

// UserRole model - junction table for user-role assignments
model UserRole {
  userId     String
  roleId     String
  user       User          @relation(fields: [userId], references: [id])
  role       UserRoleModel @relation(fields: [roleId], references: [id])
  assignedAt DateTime      @default(now())

  @@id([userId, roleId])
}

// AdminOperationLog - for audit trail
model AdminOperationLog {
  id          String   @id @default(cuid())
  adminId     String
  admin       Admin    @relation(fields: [adminId], references: [id])
  action      String
  resource    String?
  resourceId  String?
  description String?
  ipAddress   String?
  userAgent   String?
  metadata    Json?
  createdAt   DateTime @default(now())
}
```

#### Optional Enhancement (Future)

```prisma
// Optional: Track bulk import jobs for analytics
model BulkImportJob {
  id              String   @id @default(cuid())
  adminId         String
  admin           Admin    @relation(fields: [adminId], references: [id])
  totalUsers      Int
  successCount    Int
  failureCount    Int
  status          String   // 'completed', 'failed'
  validationErrors Json?   // Store validation errors
  requestData     Json     // Original request data
  responseData    Json?    // Response data
  startedAt       DateTime @default(now())
  completedAt     DateTime?

  @@map("bulk_import_jobs")
}
```

## Transaction Management

### Isolation Levels

```typescript
// Use SERIALIZABLE for complete isolation
const isolationLevel = Prisma.TransactionIsolationLevel.Serializable;

// Ensures:
// 1. No phantom reads
// 2. No non-repeatable reads
// 3. No dirty reads
// 4. Complete consistency
```

### Rollback Scenarios

1. **Validation Failure**: No transaction started
2. **Constraint Violation**: Automatic rollback
3. **Timeout**: Transaction rolled back after 30s
4. **Application Error**: Explicit rollback
5. **Database Error**: Automatic rollback

## Performance Optimization

### Database Optimizations

```sql
-- Indexes for bulk validation
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Batch insert optimization
ALTER TABLE users SET (fillfactor = 90);

-- Connection pooling
-- Set in Prisma configuration:
-- connection_limit = 20
```

### Query Optimization

```typescript
// Batch existence check
const existingUsers = await prisma.user.findMany({
  where: {
    OR: [
      { username: { in: usernames } },
      { email: { in: emails } }
    ]
  },
  select: {
    username: true,
    email: true
  }
});
```

### Memory Management

```typescript
// Process in chunks to avoid memory overflow
const CHUNK_SIZE = 100;

for (let i = 0; i < users.length; i += CHUNK_SIZE) {
  const chunk = users.slice(i, i + CHUNK_SIZE);
  await processChunk(chunk);
}
```

## Error Handling

### Error Response Structure

```typescript
interface BulkImportError {
  success: false;
  businessCode: number;
  message: string;
  data: {
    created: false;
    validationErrors: ValidationError[];
    summary: ValidationSummary;
  };
  timestamp: string;
}
```

### Error Categories

1. **Validation Errors** (4xxx)
   - Field validation failures
   - Duplicate detection
   - Business rule violations

2. **System Errors** (5xxx)
   - Database connection issues
   - Transaction failures
   - Timeout errors

## Monitoring & Logging

### Audit Trail

```typescript
// Log every bulk import attempt
await auditLog.create({
  adminId,
  action: 'BULK_IMPORT_ATTEMPT',
  resource: 'User',
  metadata: {
    userCount: users.length,
    success: result.created,
    errors: result.validationErrors?.length || 0
  }
});
```

### Performance Metrics

```typescript
// Track import performance
const metrics = {
  totalTime: endTime - startTime,
  validationTime: validationEnd - validationStart,
  transactionTime: txEnd - txStart,
  usersPerSecond: userCount / totalTime
};
```

### Monitoring Alerts

- Transaction failures > 3 in 5 minutes
- Response time > 10 seconds
- Memory usage > 80%
- Database connection pool exhaustion

## Security Considerations

### Input Sanitization

```typescript
// Sanitize all string inputs
const sanitizedUsername = username
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9_]/g, '');
```

### Rate Limiting

```typescript
// Implement sliding window rate limiting
@UseInterceptor(RateLimitInterceptor({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  keyGenerator: (req) => req.admin.id
}))
```

### Permission Checks

```typescript
// Verify admin has user management permissions
if (!admin.permissions.includes('USER_MANAGEMENT')) {
  throw new ForbiddenException('Insufficient permissions');
}
```

## Testing Strategy

### Unit Tests

```typescript
describe('BulkImportValidationService', () => {
  it('should detect duplicate usernames within batch', async () => {
    const users = [
      { username: 'john_doe', ... },
      { username: 'john_doe', ... }
    ];
    const result = await service.validateBatch(users);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('BATCH_USERNAME_DUPLICATE');
  });
});
```

### Integration Tests

```typescript
describe('Bulk Import E2E', () => {
  it('should rollback all users on failure', async () => {
    // Arrange: Create users with one invalid
    const users = [...validUsers, invalidUser];

    // Act: Attempt import
    const response = await request(app)
      .post('/api/admin/users/bulk-import')
      .send({ users });

    // Assert: No users created
    expect(response.body.created).toBe(false);
    const dbUsers = await prisma.user.count();
    expect(dbUsers).toBe(initialCount);
  });
});
```

### Load Tests

```javascript
// K6 load test script
import http from 'k6/http';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
};

export default function() {
  const users = generateUsers(50); // 50 users per request (keeping under 300 limit)
  const response = http.post(
    'http://localhost:2999/api/admin/users/bulk-import',
    JSON.stringify({ users }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(response, {
    'status is 201': (r) => r.status === 201,
    'response time < 3s': (r) => r.timings.duration < 3000,
  });
}
```