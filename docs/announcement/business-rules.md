# Announcement System Business Rules

## Overview

This document defines the business rules, constraints, and behavioral specifications for the announcement system. These rules ensure consistent system behavior, maintain data integrity, and enforce security policies across all announcement operations.

## User Role Permissions

### Role Definitions

| User Type | Value | Announcement Permissions |
|-----------|-------|-------------------------|
| Manager | 1 | Create, Read, Update, Delete (own), React |
| Worker | 2 | Read only (future enhancement) |
| Student | 3 | Read, React (Like/Dislike) |
| Admin | - | Full access (system administration) |

### Permission Matrix

| Action | Manager | Student | Worker | Notes |
|--------|---------|---------|--------|-------|
| Create Announcement | ✅ | ❌ | ❌ | Only within enrolled activity |
| Edit Announcement | ✅ | ❌ | ❌ | Only own announcements |
| Delete Announcement | ✅ | ❌ | ❌ | Only own announcements (soft delete) |
| View Announcements | ✅ | ✅ | Future | Only from enrolled activity |
| React to Announcement | ✅ | ✅ | Future | One reaction per user |
| View Reactions | ✅ | ✅ | Future | Aggregated counts only |

## Activity Scope Rules

### Rule 1: Activity Isolation
- **Description**: All announcements are strictly scoped to a single activity
- **Implementation**:
  - Announcement must have valid `activityId` reference
  - Users can only access announcements from their enrolled activity
  - Cross-activity announcement access is prohibited
- **Validation**: System validates user's `UserActivity` enrollment status

### Rule 2: Single Activity Enrollment
- **Description**: Users can only be enrolled in one activity at a time
- **Implementation**:
  - Check `UserActivity` table for active enrollment
  - Enrollment status must be `ENROLLED` to access announcements
  - Completed or cancelled enrollments deny announcement access
- **Business Rationale**: Prevents information leakage between activities

### Rule 3: Activity Lifecycle
- **Description**: Announcement availability follows activity lifecycle
- **Rules**:
  - Active activities: Full announcement functionality
  - Completed activities: Read-only access to historical announcements
  - Deleted activities: Cascade delete all announcements
- **Archive Policy**: Announcements preserved for audit after activity completion

## Announcement Creation Rules

### Rule 4: Manager-Only Creation
- **Description**: Only users with Manager role can create announcements
- **Validation**:
  ```typescript
  if (user.userType !== UserType.MANAGER) {
    throw new ForbiddenException('Only managers can create announcements');
  }
  ```
- **Business Rationale**: Maintains authority hierarchy in simulation

### Rule 5: Content Validation
- **Title Requirements**:
  - Required field
  - Maximum 200 characters
  - Cannot be empty or whitespace only
  - No profanity filter in MVP (future enhancement)
- **Content Requirements**:
  - Required field
  - No maximum length in MVP (consider 10,000 chars for future)
  - Basic HTML sanitization for security
  - No file attachments in MVP

### Rule 6: Creation Limits
- **Rate Limiting**:
  - Maximum 10 announcements per manager per hour
  - Maximum 50 announcements per activity per day
- **Storage Limits**:
  - Maximum 500 active announcements per activity
  - Automatic archival of announcements older than 90 days
- **Business Rationale**: Prevent spam and maintain system performance

## Announcement Modification Rules

### Rule 7: Author-Only Editing
- **Description**: Only the original author can edit an announcement
- **Validation**:
  ```typescript
  if (announcement.authorId !== user.id) {
    throw new ForbiddenException('Only the author can edit this announcement');
  }
  ```
- **Audit Trail**: All edits update `updatedAt` timestamp

### Rule 8: Edit History
- **Current Scope**: No version history in MVP
- **Future Enhancement**:
  - Store edit history with timestamps
  - Track what changed (title, content)
  - Display "edited" indicator to users

### Rule 9: Immutable Fields
- **Cannot Change**:
  - `id` - Announcement identifier
  - `activityId` - Activity scope
  - `authorId` - Original author
  - `createdAt` - Creation timestamp
- **Can Change**:
  - `title` - Announcement title
  - `content` - Announcement body
  - `isActive` - Soft delete flag

## Deletion Rules

### Rule 10: Soft Delete Policy
- **Description**: Announcements are never hard deleted, only marked inactive
- **Implementation**:
  - Set `isActive = false`
  - Set `deletedAt` timestamp
  - Preserve all data for audit trail
- **Visibility**: Soft-deleted announcements hidden from normal queries

### Rule 11: Cascade Behavior
- **Activity Deletion**:
  - Hard cascade delete all announcements
  - Override soft delete policy for data cleanup
- **User Deletion**:
  - Author deletion: RESTRICT (preserve announcement history)
  - Student deletion: CASCADE delete their reactions
- **Business Rationale**: Maintain content integrity while allowing user cleanup

### Rule 12: Restoration Policy
- **MVP Scope**: No restoration UI/API
- **Backend Support**: Database structure supports restoration
- **Future Enhancement**: Admin restoration interface

## Reaction Rules

### Rule 13: Student Reaction Permissions
- **Description**: Only Students can react to announcements
- **Exception**: Managers can also react to test functionality
- **Validation**:
  ```typescript
  if (user.userType !== UserType.STUDENT && user.userType !== UserType.MANAGER) {
    throw new ForbiddenException('Only students can react to announcements');
  }
  ```

### Rule 14: Single Reaction Constraint
- **Description**: Each user can have exactly one reaction per announcement
- **Implementation**:
  - Unique constraint: `[announcementId, userId]`
  - Changing reaction updates existing record
  - No multiple reactions from same user
- **Business Rationale**: Ensures accurate engagement metrics

### Rule 15: Reaction Types
- **Allowed Values**:
  - `LIKE` - Positive reaction
  - `DISLIKE` - Negative reaction
- **Not Allowed**:
  - Neutral/no reaction stored in database
  - Custom reaction types
  - Emoji reactions (future enhancement)

### Rule 16: Reaction Modification
- **Change Reaction**:
  - User can change from LIKE to DISLIKE or vice versa
  - Updates existing reaction record
  - Updates cached counts accordingly
- **Remove Reaction**:
  - User can delete their reaction entirely
  - Removes database record
  - Decrements appropriate count

### Rule 17: Reaction Count Caching
- **Description**: Like and dislike counts cached on announcement record
- **Update Strategy**:
  - Increment/decrement in same transaction as reaction change
  - Periodic reconciliation job (future enhancement)
- **Consistency**: Counts may briefly diverge but eventually consistent

## Visibility Rules

### Rule 18: Active Announcement Filtering
- **Default Behavior**: Only show active announcements (`isActive = true`)
- **Manager Exception**: Managers can view their own deleted announcements
- **Query Filter**:
  ```typescript
  where: {
    isActive: true,
    activityId: user.currentActivityId
  }
  ```

### Rule 19: Chronological Ordering
- **Default Sort**: Newest announcements first (`createdAt DESC`)
- **Immutable**: Users cannot change sort order in MVP
- **Pagination**: Required for lists exceeding 20 items

### Rule 20: Cross-Activity Isolation
- **Strict Enforcement**: No announcement visibility across activities
- **No Exceptions**: Even admins respect activity boundaries in UI
- **Database Access**: Only through direct database queries for support

## Data Validation Rules

### Rule 21: Required Field Validation
- **Creation Required**:
  - `title` - Not empty, max 200 chars
  - `content` - Not empty
- **System Generated**:
  - `id` - Auto-generated CUID
  - `activityId` - From user's enrollment
  - `authorId` - From authenticated user
  - `createdAt`, `updatedAt` - Timestamps

### Rule 22: Input Sanitization
- **XSS Prevention**:
  - Strip dangerous HTML tags
  - Escape special characters
  - Validate against script injection
- **SQL Injection**: Prevented by Prisma parameterized queries
- **Size Limits**: Enforce maximum content length (future)

### Rule 23: Unicode Support
- **Title**: Full UTF-8 support for multilingual content
- **Content**: Full UTF-8 support including emoji
- **Database**: Ensure proper UTF-8 collation

## Performance Rules

### Rule 24: Query Optimization
- **Required Indexes**:
  - `[activityId, createdAt DESC]` - List queries
  - `[authorId]` - Author's announcements
  - `[isActive, activityId]` - Active filtering
- **Eager Loading**: Include author info in list queries
- **Pagination**: Mandatory for all list endpoints

### Rule 25: Rate Limiting
- **Endpoint Limits**:
  - Creation: 30 requests/minute per user
  - Reading: 60 requests/minute per user
  - Reactions: 30 requests/minute per user
- **Global Limits**: 1000 requests/minute per activity
- **Implementation**: Use platform's ThrottlerModule

### Rule 26: Caching Strategy
- **Cache Candidates**:
  - Announcement lists per activity (5-minute TTL)
  - Reaction counts (updated on change)
  - User's own reactions (session cache)
- **Cache Invalidation**: On create, update, delete operations

## Audit and Compliance Rules

### Rule 27: Operation Logging
- **Logged Actions**:
  - Announcement creation (author, title, timestamp)
  - Announcement updates (what changed)
  - Announcement deletion (who, when)
  - Reaction changes (user, type, timestamp)
- **Storage**: Use platform's existing operation log system

### Rule 28: Data Retention
- **Active Data**: Retained indefinitely while activity exists
- **Soft Deleted**: Retained for 180 days minimum
- **Hard Delete**: Only on activity deletion or data cleanup
- **Compliance**: Follow platform's data retention policies

### Rule 29: Privacy Compliance
- **Personal Data**: Username and reactions are personal data
- **GDPR Rights**: Support data export and deletion requests
- **Anonymization**: Consider anonymizing old announcements

## Error Handling Rules

### Rule 30: Standardized Error Responses
- **Format**: Use platform's standard error format
- **Codes**: Use consistent business codes
- **Messages**: Localized error messages (i18n)
- **Logging**: Log all errors with context

### Rule 31: Graceful Degradation
- **Missing Activity**: Return empty list, not error
- **Missing Author**: Display "Unknown Author"
- **Missing Reactions**: Default to zero counts
- **Service Failures**: Cache fallback when possible

## Future Enhancement Rules

### Rule 32: Notification Integration (Future)
- **Trigger Events**:
  - New announcement created
  - Announcement edited significantly
  - High engagement threshold reached
- **Delivery Channels**: In-app, email, push notifications
- **User Preferences**: Opt-in/out settings

### Rule 33: Rich Content Support (Future)
- **Markdown**: Support formatted text
- **Attachments**: Images, PDFs, documents
- **Embeds**: Videos, links with preview
- **Size Limits**: 10MB per attachment, 5 attachments per announcement

### Rule 34: Advanced Analytics (Future)
- **Metrics**:
  - Read rates
  - Engagement over time
  - Reaction sentiment analysis
- **Dashboards**: Manager and admin views
- **Export**: CSV/Excel reports

## Testing Requirements

### Unit Test Coverage
- Business logic: 80% minimum coverage
- Critical paths: 100% coverage
- Edge cases: Comprehensive testing

### Integration Tests
- All API endpoints
- Permission scenarios
- Activity isolation
- Reaction constraints

### Performance Tests
- Load testing: 100 concurrent users per activity
- Response time: <200ms for reads, <500ms for writes
- Database queries: <50ms average

## Monitoring and Alerts

### Key Metrics
- Announcement creation rate
- Reaction engagement rate
- API response times
- Error rates by endpoint

### Alert Thresholds
- Error rate >5%: Warning
- Error rate >10%: Critical
- Response time >1s: Warning
- Database connection failures: Critical

## Documentation Requirements

### Code Documentation
- All public methods: JSDoc comments
- Complex logic: Inline comments
- API endpoints: Swagger annotations

### User Documentation
- Feature guide for managers
- Usage guide for students
- API documentation for developers
- Troubleshooting guide for support