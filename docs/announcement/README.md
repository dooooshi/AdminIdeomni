# Announcement System

## Executive Summary

The Announcement System provides a streamlined communication channel for Managers to broadcast important information to all Students within their activity. This MVP implementation focuses on essential functionality: creating, reading, and reacting to announcements without the complexity of real-time notifications. The system enhances team coordination and information dissemination within the business simulation platform, supporting the educational objectives of participants aged 15-22.

## Background

### Target Users

- **Primary Users**:
  - Managers (userType: 1) - Create and manage announcements for their activity participants
  - Students (userType: 3) - Read and react to announcements from their enrolled activity
- **Secondary Users**:
  - Workers (userType: 2) - Future expansion to include worker access to announcements
  - Administrators - Monitor announcement engagement metrics and moderate content if needed

### Expected Impact

- **Business Metrics**:
  - Improved information dissemination efficiency within activities
  - Measurable engagement through reaction tracking (likes/dislikes)
  - Reduced communication overhead for activity managers
  - Enhanced participant awareness of important updates and deadlines

- **User Benefits**:
  - Managers gain centralized communication tool for activity-wide messages
  - Students receive organized, persistent access to important information
  - Clear feedback mechanism through reactions
  - Historical record of all activity announcements

- **Technical Benefits**:
  - Lightweight implementation without websocket complexity
  - Scalable architecture supporting future notification features
  - Integrated with existing authentication and authorization systems
  - Minimal infrastructure requirements for MVP deployment

### Platform Overview

The Announcement System integrates seamlessly with the existing business simulation platform, leveraging established patterns for authentication, authorization, and data management. As an activity-scoped feature, it respects the platform's multi-activity architecture while providing focused communication within each simulation instance.

**Technology Stack**:
- **Framework**: NestJS with Fastify adapter (port 2999)
- **Database**: PostgreSQL with Prisma ORM
- **Language**: TypeScript
- **Authentication**: JWT with dual-tier system (Admin + User)
- **i18n**: English and Chinese language support
- **Architecture**: Repository pattern with service layer abstraction

## System Overview

### Core Functionality

The announcement system implements a hierarchical communication model where:

1. **Managers create announcements** with title and content for their activity
2. **Students view announcements** from their enrolled activity in chronological order
3. **Reaction system** allows students to express feedback (like/dislike)
4. **Activity-scoped isolation** ensures announcements remain within activity boundaries
5. **Pull-based reading** model (no push notifications in MVP)

### Key Features

#### Manager Capabilities
- Create announcements with rich text content
- Edit existing announcements with version tracking
- Soft-delete announcements (maintain audit trail)
- View engagement metrics (reaction counts)
- Filter own announcements by status (active/archived)

#### Student Capabilities
- View all active announcements from enrolled activity
- Read individual announcement details
- React with like or dislike (one reaction per announcement)
- Change reaction (from like to dislike or vice versa)
- Remove reaction entirely

### Architecture Decisions

#### Data Scope
- Announcements are strictly activity-scoped
- No cross-activity announcement visibility
- Historical announcements preserved for audit purposes

#### Access Control
- Role-based permissions enforced at API level
- Manager-only write operations
- Student read and reaction permissions
- No anonymous access to announcements

#### Performance Considerations
- Pagination for announcement lists
- Indexed queries on activityId and createdAt
- Cached reaction counts for efficiency
- Lazy loading of announcement content

### MVP Limitations

This MVP implementation intentionally excludes:
- Real-time notifications (websocket/SSE)
- Email/SMS notifications
- Announcement scheduling
- Rich media attachments (images/files)
- Comment threads on announcements
- Announcement categories or tags
- Analytics dashboard
- Bulk announcement operations

These features can be added in future iterations based on user feedback and platform requirements.

## Implementation Status

### Completed
- Documentation and system design
- API specification
- Data model definition
- Business rules documentation
- Integration guidelines
- i18n design

### Pending Implementation
- Prisma schema creation
- Repository implementation
- Service layer development
- Controller endpoints
- DTO validation
- Integration testing
- Seed data creation

## Quick Links

### Project Resources
- [Data Model](./data-model.md) - Database schema and relationships
- [API Specification](./api-specification.md) - Endpoint documentation
- [Business Rules](./business-rules.md) - System behavior and constraints
- [Integration Guide](./integration.md) - Platform integration details
- [i18n Design](./i18n-design.md) - Internationalization strategy

### Development Resources
- [CLAUDE.md](/CLAUDE.md) - Project guidelines and conventions
- [Prisma Studio](http://localhost:5555) - Database management
- [API Documentation](http://localhost:2999/docs) - Swagger UI

## Notes & Decisions Log

### Important Decisions

1. **MVP Scope**: Focus on essential CRUD and reaction features, defer notifications
2. **Activity Isolation**: Strict boundary enforcement for multi-activity support
3. **Soft Deletes**: Maintain audit trail for all announcements
4. **Single Reaction**: One reaction per user per announcement for simplicity
5. **Pull Model**: Users check for new announcements rather than push notifications

### Open Questions

1. Should Workers (userType: 2) have access to announcements in future versions?
2. What moderation capabilities should administrators have?
3. Should announcement creation be rate-limited to prevent spam?
4. How long should soft-deleted announcements be retained?

### Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Announcement spam | User experience degradation | Implement rate limiting and content validation |
| Large content storage | Database performance | Limit content length, implement pagination |
| Missing critical announcements | Reduced engagement | Future: add notification system |
| Cross-activity data leaks | Security breach | Strict activity validation in all queries |
| Reaction manipulation | False engagement metrics | One reaction per user constraint |