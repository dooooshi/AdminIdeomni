# Feature: User Bulk Import

## Background

### Target Users Type
- **Primary Users**: System Administrators and Administrative Staff
- **Secondary Users**: Educational Institution Administrators, Course Managers

### Expected Impact
- **Business Metrics**:
  - 90% reduction in student onboarding time for large cohorts
  - Support for 300 students import in single operation
  - 100% data integrity with all-or-nothing validation

- **User Benefits**:
  - Streamlined onboarding process for student cohorts
  - Batch student registration for workshops and competitions
  - Guaranteed data consistency with transactional imports
  - Simplified process focused on student accounts only

- **Technical Benefits**:
  - Atomic operations ensure database integrity
  - Clear validation feedback before any changes
  - Simplified error handling with no partial states

### Platform Overview
A comprehensive business simulation platform designed for youth aged 15-22, providing practical business knowledge experience through team-based entrepreneurship simulation. Teams manage virtual companies through multiple fiscal years, making strategic decisions in production, marketing, finance, and operations while competing and collaborating with other teams in a simulated economic environment.

**Technology Stack**:
- **Framework**: NestJS with Fastify adapter (port 2999)
- **Database**: PostgreSQL with Prisma ORM
- **Language**: TypeScript
- **Package Manager**: pnpm (always use pnpm, never npm)
- **Authentication**: JWT with dual-tier system (Admin + User)
- **i18n**: English and Chinese language support

## Implementation Details

### Database Models
- Location: `prisma/models/User.prisma`
- Core fields for bulk import:
  - `username` (unique identifier)
  - `email` (unique email address)
  - `password` (hashed password)
  - `firstName`, `lastName` (optional names)
  - `userType` (fixed to 3: Student for bulk imports)
  - `isActive` (account status)
  - `creator` (for User-created users, null for Admin imports)

#### Related Models
- **UserRole**: Junction table for user-role assignments
- **UserRoleModel**: Defines available roles in the system
- **AdminOperationLog**: Tracks all admin operations including bulk imports
- **Admin**: Admin user who performs the bulk import

### API Endpoints
- Controller: `src/admin/admin-user.controller.ts`
- Services: `src/admin/admin.service.ts`
- DTOs: `src/admin/dto/admin-user-management.dto.ts`
- New Endpoints:
  - `POST /api/admin/users/bulk-import` - Main bulk import endpoint
  - `POST /api/admin/users/bulk-import/validate` - Validation-only endpoint

### Architecture Decisions

#### 1. Data Processing Strategy
- Direct JSON API submission (no file uploads)
- All-or-nothing transactional approach
- Complete validation before any database writes
- Atomic operations using database transactions

#### 2. Validation Strategy
- **Pre-validation Phase**:
  - Check all users for format and structure
  - Verify uniqueness constraints (username, email)
  - Validate business rules (userType, roles)
- **Transaction Phase**:
  - Only proceed if ALL users pass validation
  - Create all users in single transaction
  - Rollback if any operation fails

#### 3. Import Processing
- **Synchronous Processing**: All imports are synchronous
  - Immediate validation feedback
  - Clear success/failure status
  - Detailed error reporting per user
  - Maximum 300 users per request

#### 4. Error Handling Strategy
- **All-or-Nothing**: No partial imports allowed
  - If ANY user fails validation, NO users are created
  - Complete validation results returned
  - Detailed error messages for each failed user
  - Transaction rollback on any failure

#### 5. Security Considerations
- Request size limits (max 10MB)
- Rate limiting on bulk operations (10 requests/minute)
- Admin authentication and authorization required
- Comprehensive audit logging
- Input sanitization and validation

### Testing Strategy

#### Unit Tests
- User data validation logic
- Duplicate detection algorithms
- Password generation and validation
- Transaction rollback scenarios

#### Integration Tests
- End-to-end bulk import flow
- Database transaction handling
- Concurrent import handling
- Permission verification

#### Performance Tests
- Large batch processing (1000 records)
- Memory usage optimization
- Database bulk insert performance
- Response time under load

## Feature Specifications

### Data Structure

#### Request Format
```json
{
  "users": [
    {
      "username": "john_doe",
      "email": "john@example.com",
      "password": "SecurePass123!",
      "firstName": "John",
      "lastName": "Doe",
      "userType": 3,
      "isActive": true,
      "roles": ["student", "participant"]
    }
  ],
  "options": {
    "sendWelcomeEmail": false,
    "requirePasswordChange": false,
    "generatePasswordsIfMissing": true,
    "passwordLength": 12
  }
}
```

### Field Specifications

| Field | Required | Type | Valid Values | Default | Description |
|-------|----------|------|--------------|---------|-------------|
| username | Yes | string | 3-50 chars, alphanumeric + underscore | - | Unique username |
| email | Yes | string | Valid email format | - | Unique email address |
| password | Conditional | string | Min 6 chars, complexity rules | Generated | User password |
| firstName | No | string | 1-50 chars | null | User's first name |
| lastName | No | string | 1-50 chars | null | User's last name |
| userType | No | number | Fixed to 3 (Student) | 3 | Always Student for bulk import |
| isActive | No | boolean | true/false | true | Account active status |
| roles | No | array | Student-related role IDs only | [] | Student roles only |

**Note**: The `creator` field is left null for admin-initiated bulk imports since it's designed for User-to-User creation relationships. Admin actions are tracked in AdminOperationLog instead.

### Validation Rules

1. **Uniqueness Validation**:
   - Username must be unique in database AND within batch
   - Email must be unique in database AND within batch

2. **Format Validation**:
   - Email must be valid format
   - Username must be alphanumeric with underscores only
   - Names must not contain special characters

3. **Business Rules**:
   - **UserType MUST be 3 (Student)** - bulk import restricted to students only
   - If userType provided and not 3, validation fails
   - Roles must be student-appropriate roles only
   - Password must meet complexity requirements

### Transaction Flow

```
1. Receive bulk import request
2. Validate request structure
3. Check batch size limits
4. For each user:
   - Validate format
   - Check uniqueness in database
   - Check uniqueness within batch
   - Validate business rules
5. If ANY validation fails:
   - Return detailed error response
   - No database changes made
6. If ALL validations pass:
   - Begin database transaction
   - Create all users
   - Assign roles
   - Create audit logs
   - Commit transaction
   - Return success response
```

## Quick Links

### Project Resources
- [CLAUDE.md](/CLAUDE.md) - Project guidelines and conventions
- [Bulk Import API Spec](./bulk-import-api.md) - Detailed API documentation
- [API Documentation](http://localhost:2999/docs) - Swagger UI
- [Prisma Studio](http://localhost:5555) - Database management

## Notes & Decisions Log

### Important Decisions
1. **No File Uploads**: Direct JSON API only for better control and security
2. **All-or-Nothing**: Complete validation before any database changes
3. **Synchronous Only**: All operations are synchronous for clarity
4. **Batch Limit**: Maximum 300 users per request for performance
5. **Transaction Isolation**: SERIALIZABLE level for data integrity

### Open Questions
1. Should we support partial success with explicit opt-in?
2. Should we add a preview mode to show what would be created?
3. How should we handle password reset notifications?
4. Should we support custom validation rules per organization?

### Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Large batch timeout | High | 300 user limit, optimized queries |
| Duplicate conflicts | Medium | Pre-validation checks, unique constraints |
| Transaction deadlocks | Medium | SERIALIZABLE isolation, retry logic |
| Memory overflow | Low | Request size limits, streaming validation |
| Rate limit bypass | Low | Per-admin rate limiting, monitoring |

## Implementation Checklist

### Required Implementation
- [ ] Create new DTOs for bulk import request/response
- [ ] Implement validation service with all-or-nothing logic
- [ ] Add transaction wrapper for atomic operations
- [ ] Create bulk import controller endpoints
- [ ] Add comprehensive error responses
- [ ] Implement audit logging for bulk operations
- [ ] Add rate limiting middleware
- [ ] Create integration tests
- [ ] Add performance monitoring

### Optional Enhancements
- [ ] Add preview mode for validation-only checks
- [ ] Implement batch progress notifications
- [ ] Create admin dashboard for import history
- [ ] Add import templates for common scenarios
- [ ] Support custom validation rules
- [ ] Add webhook notifications for completion

## API Usage Examples

### Successful Import
```bash
curl -X POST http://localhost:2999/api/admin/users/bulk-import \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "users": [
      {
        "username": "student_001",
        "email": "student001@school.edu",
        "password": "Pass123!",
        "userType": 3,
        "firstName": "Alice",
        "lastName": "Johnson"
      }
    ],
    "options": {
      "sendWelcomeEmail": true
    }
  }'
```

### Failed Import (No Users Created)
```bash
# Response when validation fails:
{
  "success": false,
  "businessCode": 4001,
  "message": "Validation failed. No users were created.",
  "data": {
    "created": false,
    "validationErrors": [
      {
        "index": 0,
        "username": "duplicate_user",
        "errors": [
          {
            "field": "username",
            "code": "USERNAME_DUPLICATE",
            "message": "Username already exists"
          }
        ]
      }
    ]
  }
}
```

## Performance Considerations

- **Batch Size**: Optimal performance with 50-200 users
- **Response Time**: < 3 seconds for 300 users
- **Memory Usage**: < 50MB for 300 users
- **Database Load**: Single transaction minimizes lock time
- **Network**: JSON compression for large payloads