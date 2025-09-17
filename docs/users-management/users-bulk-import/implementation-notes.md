# Bulk Import Implementation Notes

## Integration with Existing System

This document provides implementation guidance for integrating the bulk import feature with the existing codebase.

## Key Integration Points

### 1. User Model Integration

The User model already has all required fields:
- `creator` field links to the Admin who creates users
- No schema changes needed for basic bulk import

```typescript
// When creating users in bulk import
const userData = {
  username: user.username,
  email: user.email,
  password: hashedPassword,
  firstName: user.firstName,
  lastName: user.lastName,
  userType: 3,  // ALWAYS 3 (Student) for bulk imports
  isActive: user.isActive ?? true,
  creator: null  // null for admin imports (field is for User-to-User relationships)
};
```

### 2. Role Assignment

Roles use the UserRole junction table:

```typescript
// After creating user, assign roles
if (user.roles && user.roles.length > 0) {
  // Validate role IDs exist
  const validRoles = await tx.userRoleModel.findMany({
    where: { id: { in: user.roles } },
    select: { id: true }
  });

  // Create UserRole entries
  await tx.userRole.createMany({
    data: validRoles.map(role => ({
      userId: createdUser.id,
      roleId: role.id,
      assignedAt: new Date()
    }))
  });
}
```

### 3. Audit Logging

Use AdminOperationLog for tracking:

```typescript
await tx.adminOperationLog.create({
  data: {
    adminId,
    action: 'BULK_CREATE_USER',
    resource: 'User',
    resourceId: createdUser.id,
    description: `Bulk created user: ${user.username}`,
    ipAddress: req.ip,
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
```

### 3. Student Role Validation

Helper method to ensure only student-appropriate roles are assigned:

```typescript
async validateAndGetStudentRoles(
  tx: PrismaTransaction,
  roleIds: string[]
): Promise<string[]> {
  // Get valid student roles from database
  const studentRoles = await tx.userRoleModel.findMany({
    where: {
      id: { in: roleIds },
      name: {
        contains: 'student',  // Or use a specific flag/category
        mode: 'insensitive'
      }
    },
    select: { id: true }
  });

  return studentRoles.map(r => r.id);
}
```

## Implementation Steps

### Step 1: Create DTOs

```typescript
// src/admin/dto/admin-bulk-import.dto.ts

export class BulkImportUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_]+$/)
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  firstName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  lastName?: string;

  @IsInt()
  @IsOptional()  // Optional because we ignore it
  @IsIn([3])  // Only allow 3 if provided
  userType?: number;  // Will be set to 3 internally

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roles?: string[];
}

export class BulkImportDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkImportUserDto)
  @ArrayMaxSize(300)
  users: BulkImportUserDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => BulkImportOptionsDto)
  options?: BulkImportOptionsDto;
}
```

### Step 2: Add Controller Endpoints

```typescript
// src/admin/admin-user.controller.ts

@Post('bulk-import')
@AdminAuth()
@ApiBearerAuth()
@ApiOperation({
  summary: 'Bulk import users with all-or-nothing validation',
  description: 'Import multiple users. All users must pass validation or none are created.'
})
@LogOperation({
  action: 'BULK_IMPORT_USERS',
  resource: 'User',
  description: 'Bulk import users'
})
async bulkImport(
  @Request() req: AdminRequest,
  @Body() dto: BulkImportDto
): Promise<BulkImportResponseDto> {
  return this.adminService.bulkImportUsers(dto, req.admin.id, req);
}

@Post('bulk-import/validate')
@AdminAuth()
@ApiBearerAuth()
@ApiOperation({
  summary: 'Validate bulk import without creating users',
  description: 'Dry run to validate all users without database changes'
})
async validateBulkImport(
  @Request() req: AdminRequest,
  @Body() dto: BulkImportDto
): Promise<ValidationResponseDto> {
  return this.adminService.validateBulkImport(dto.users);
}
```

### Step 3: Implement Service Methods

```typescript
// src/admin/admin.service.ts

async bulkImportUsers(
  dto: BulkImportDto,
  adminId: string,
  req: AdminRequest
): Promise<BulkImportResponseDto> {
  // Step 1: Validate all users
  const validation = await this.validateBulkImport(dto.users);

  if (!validation.valid) {
    throw new ValidationException({
      created: false,
      validationErrors: validation.errors,
      summary: validation.summary
    });
  }

  // Step 2: Process in transaction
  const result = await this.prisma.$transaction(async (tx) => {
    const createdUsers = [];

    for (const user of dto.users) {
      // Hash password
      const password = user.password || this.generatePassword(12);
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const createdUser = await tx.user.create({
        data: {
          username: user.username,
          email: user.email,
          password: hashedPassword,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: 3,  // Always 3 (Student) for bulk imports
          isActive: user.isActive ?? true,
          creator: null  // null for admin imports
        }
      });

      // Assign roles - validate they are student-appropriate
      if (user.roles?.length > 0) {
        const studentRoles = await this.validateAndGetStudentRoles(tx, user.roles);
        if (studentRoles.length > 0) {
          await tx.userRole.createMany({
            data: studentRoles.map(roleId => ({
              userId: createdUser.id,
              roleId: roleId
            }))
          });
        }
      }

      // Create audit log
      await tx.adminOperationLog.create({
        data: {
          adminId,
          action: 'BULK_CREATE_USER',
          resource: 'User',
          resourceId: createdUser.id,
          description: `Bulk created user: ${user.username}`,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          metadata: {
            username: user.username,
            bulkImport: true
          }
        }
      });

      createdUsers.push(createdUser);
    }

    return createdUsers;
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    timeout: 30000
  });

  return {
    created: true,
    totalUsers: result.length,
    users: result.map(u => ({
      username: u.username,
      userId: u.id,
      email: u.email
    }))
  };
}
```

### Step 4: Implement Validation

```typescript
async validateBulkImport(
  users: BulkImportUserDto[],
  options?: BulkImportOptionsDto
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const usernames = new Set<string>();
  const emails = new Set<string>();

  // Check duplicates within batch
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const userErrors = [];

    // Check password requirement
    if (!user.password && !options?.generatePasswordsIfMissing) {
      userErrors.push({
        field: 'password',
        code: 'PASSWORD_REQUIRED',
        message: 'Password is required or enable generatePasswordsIfMissing option'
      });
    }

    // Validate userType is student only (if provided)
    if (user.userType && user.userType !== 3) {
      userErrors.push({
        field: 'userType',
        code: 'USERTYPE_INVALID',
        message: 'Only students (userType=3) can be bulk imported'
      });
    }

    if (usernames.has(user.username)) {
      userErrors.push({
        field: 'username',
        code: 'BATCH_DUPLICATE',
        message: 'Duplicate username in batch'
      });
    }
    usernames.add(user.username);

    if (emails.has(user.email)) {
      userErrors.push({
        field: 'email',
        code: 'BATCH_DUPLICATE',
        message: 'Duplicate email in batch'
      });
    }
    emails.add(user.email);

    if (userErrors.length > 0) {
      errors.push({ index: i, username: user.username, errors: userErrors });
    }
  }

  // Check against database
  if (errors.length === 0) {
    const existingUsers = await this.prisma.user.findMany({
      where: {
        OR: [
          { username: { in: Array.from(usernames) } },
          { email: { in: Array.from(emails) } }
        ]
      },
      select: { username: true, email: true }
    });

    const existingUsernames = new Set(existingUsers.map(u => u.username));
    const existingEmails = new Set(existingUsers.map(u => u.email));

    users.forEach((user, index) => {
      const userErrors = [];

      if (existingUsernames.has(user.username)) {
        userErrors.push({
          field: 'username',
          code: 'USERNAME_EXISTS',
          message: 'Username already exists'
        });
      }

      if (existingEmails.has(user.email)) {
        userErrors.push({
          field: 'email',
          code: 'EMAIL_EXISTS',
          message: 'Email already exists'
        });
      }

      if (userErrors.length > 0) {
        errors.push({ index, username: user.username, errors: userErrors });
      }
    });
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
```

## Testing Considerations

### Unit Tests
```typescript
describe('BulkImportService', () => {
  it('should not create any users if validation fails', async () => {
    const users = [
      { username: 'valid_user', email: 'valid@test.com', userType: 3 },
      { username: 'duplicate', email: 'duplicate@test.com', userType: 3 },
      { username: 'duplicate', email: 'another@test.com', userType: 3 }
    ];

    const result = await service.bulkImportUsers({ users }, adminId, req);

    expect(result.created).toBe(false);
    expect(result.validationErrors).toHaveLength(1);

    const userCount = await prisma.user.count();
    expect(userCount).toBe(initialCount);
  });

  it('should create all users when validation passes', async () => {
    const users = [
      { username: 'user1', email: 'user1@test.com', userType: 3 },
      { username: 'user2', email: 'user2@test.com', userType: 3 }
    ];

    const result = await service.bulkImportUsers({ users }, adminId, req);

    expect(result.created).toBe(true);
    expect(result.totalUsers).toBe(2);

    const createdUsers = await prisma.user.findMany({
      where: { username: { in: ['user1', 'user2'] } }
    });
    expect(createdUsers).toHaveLength(2);
  });
});
```

### Integration Tests
```typescript
describe('Bulk Import E2E', () => {
  it('should rollback on transaction failure', async () => {
    // Force a transaction failure
    jest.spyOn(prisma, '$transaction').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const response = await request(app)
      .post('/api/admin/users/bulk-import')
      .set('Authorization', `Bearer ${token}`)
      .send({ users: validUsers });

    expect(response.status).toBe(500);

    const userCount = await prisma.user.count();
    expect(userCount).toBe(initialCount);
  });
});
```

## Performance Optimization

### Batch Validation
```typescript
// Instead of checking each user individually
const existingUsers = await prisma.user.findMany({
  where: {
    OR: [
      { username: { in: usernames } },
      { email: { in: emails } }
    ]
  },
  select: { username: true, email: true }
});
```

### Index Optimization
```sql
-- Ensure indexes exist for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_creator ON users(creator);
```

## Security Checklist

- [x] Admin authentication required
- [x] Rate limiting on bulk endpoints
- [x] Input validation with class-validator
- [x] SQL injection prevention (Prisma parameterized queries)
- [x] Audit logging for all operations
- [x] Transaction isolation for consistency
- [x] Password hashing with bcrypt
- [x] Request size limits (10MB max)
- [x] Maximum users per request (300)

## Monitoring

### Key Metrics to Track
1. Average validation time
2. Average transaction time
3. Success/failure rates
4. Common validation errors
5. Peak usage times

### Logging
```typescript
logger.info('Bulk import started', {
  adminId,
  userCount: users.length,
  timestamp: new Date()
});

logger.info('Bulk import completed', {
  adminId,
  success: result.created,
  created: result.totalUsers,
  duration: endTime - startTime
});
```

## Future Enhancements

1. **Async Processing**: For very large batches (>300 users)
2. **Progress Tracking**: Real-time updates for long-running imports
3. **Import Templates**: Predefined templates for common scenarios
4. **Webhook Notifications**: Notify external systems on completion
5. **Import History**: Track all bulk imports with BulkImportJob model
6. **Custom Validators**: Organization-specific validation rules
7. **Partial Success Mode**: Opt-in mode to allow partial imports