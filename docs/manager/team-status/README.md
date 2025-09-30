# Feature: Manager Team Status Dashboard

## Background

### Target Users Type
- **Primary Users**: Managers (userType === 1) supervising teams within activities
- **Secondary Users**: Admin users reviewing activity performance

### Expected Impact
- **Business Metrics**:
  - Reduce manager response time by 60% through real-time team visibility
  - Improve resource allocation efficiency by providing comprehensive team statistics
  - Enable early detection of struggling teams through operation history analysis

- **User Benefits**:
  - Complete visibility into all team activities and resources
  - Quick identification of teams requiring assistance
  - Data-driven decision making for resource redistribution

- **Technical Benefits**:
  - Leverage existing data models without structural changes
  - Optimized queries with pagination for large datasets
  - Reusable aggregation services for future features

### Platform Overview
A comprehensive business simulation platform designed for youth aged 15-22, providing practical business knowledge experience through team-based entrepreneurship simulation. Teams manage virtual companies through multiple fiscal years, making strategic decisions in production, marketing, finance, and operations while competing and collaborating with other teams in a simulated economic environment.

**Technology Stack**:
- **Framework**: NestJS with Fastify adapter (port 2999)
- **Database**: PostgreSQL with Prisma ORM
- **Language**: TypeScript
- **Package Manager**: pnpm (always use pnpm, never npm)
- **Authentication**: JWT with dual-tier system (Admin + User)
- **i18n**: English and Chinese language support

## Feature Overview

The Manager Team Status Dashboard provides comprehensive visibility into all teams within a manager's assigned activity. Managers can monitor team financial status, member composition, operation history, land ownership, and facility operations through a unified interface.

### Core Capabilities

1. **Team Overview**
   - List all teams in the manager's activity
   - Real-time gold and carbon balance tracking
   - Team member count and status indicators
   - Quick filtering and sorting options

2. **Team Detail View**
   - Complete team member roster with roles
   - Current resource balances (gold/carbon)
   - Recent activity indicators
   - Performance metrics and trends

3. **Operation History**
   - Comprehensive transaction log
   - Filter by operation type and date range
   - Resource flow visualization
   - Export capability for reporting

4. **Land Management View**
   - Visual representation of owned land
   - Purchase history and costs
   - Land utilization statistics
   - Facility placement overview

5. **Facility Statistics**
   - Complete facility inventory
   - Production capacity and efficiency
   - Maintenance status and costs
   - Infrastructure connections

## Implementation Details

### Database Models
- Location: Uses existing models in `prisma/models/`
  - `team.prisma` - Core team data
  - `team-account.prisma` - Financial tracking
  - `team-operation-history.prisma` - Transaction logs
  - `team-balance-history.prisma` - Balance snapshots over time
  - `tile-land-purchase.prisma` - Land ownership
  - `tile-facility-instance.prisma` - Facility data

### API Endpoints
- Controller: `src/manager/controllers/team-status.controller.ts`
- Services: `src/manager/services/team-status.service.ts`
- DTOs: `src/manager/dto/team-status.dto.ts`

### Key Features

#### 1. Activity Context Auto-Detection
- Manager's activity automatically determined from UserActivity enrollment
- No need for activityId in API paths
- Validates team membership in manager's activity

#### 2. Comprehensive Pagination
- All list endpoints support pagination
- Default limit: 20, Max limit: 100
- Consistent response format with metadata

#### 3. Advanced Filtering
- Operation history: filter by type, resource, date range
- Facilities: filter by type, status
- Land: filter by tile, purchase date
- Members: filter by status, user type

#### 4. Performance Optimization
- Aggregated views for complex queries
- Indexed fields for frequent searches
- Lazy loading for detailed data
- Caching for static configuration

### Architecture Decisions

1. **No New Models Required**
   - Leverage existing team-related models
   - Create service-level aggregations
   - Minimize database schema changes

2. **Manager-Scoped Access**
   - Activity context derived from authentication
   - Automatic filtering by manager's activity
   - Row-level security through service layer

3. **Standardized Pagination**
   - Consistent pagination across all endpoints
   - Metadata in every paginated response
   - Sorting and filtering capabilities

4. **Real-time Data Priority**
   - Live database queries for current data
   - Minimal caching to ensure accuracy
   - WebSocket support for future updates

### Testing Strategy

1. **Unit Tests**
   - Service layer business logic
   - DTO validation
   - Authorization checks

2. **Integration Tests**
   - Complete API endpoint testing
   - Pagination and filtering
   - Error handling scenarios

3. **Performance Tests**
   - Large dataset pagination
   - Complex aggregation queries
   - Concurrent user access

## Quick Links

### Project Resources
- [CLAUDE.md](/CLAUDE.md) - Project guidelines and conventions
- [API Documentation](http://localhost:2999/docs) - Swagger UI
- [Prisma Studio](http://localhost:5555) - Database management

## Notes & Decisions Log

### Important Decisions

1. **Activity Context from Authentication** (2025-09-30)
   - Decision: Derive activityId from manager's enrollment rather than URL path
   - Rationale: Managers are enrolled in only one activity at a time
   - Impact: Simpler API design, automatic context validation

2. **Pagination for All List Endpoints** (2025-09-30)
   - Decision: Implement consistent pagination across all endpoints
   - Rationale: Prevent performance issues with large datasets
   - Impact: Predictable API behavior, better scalability

3. **Leverage Existing Models** (2025-09-30)
   - Decision: Use existing team-related models without modifications
   - Rationale: Minimize database migrations and maintain stability
   - Impact: Faster implementation, lower risk

### Open Questions

1. Should we implement caching for frequently accessed team data?
2. Do we need export functionality for operation history?
3. Should real-time updates via WebSocket be included in initial release?

### Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Large operation history queries | Performance degradation | Implement pagination with reasonable limits |
| Complex aggregation queries | Slow response times | Create database indexes, consider materialized views |
| Concurrent access by multiple managers | Data consistency issues | Use transaction isolation, implement optimistic locking |
| Authorization bypass attempts | Security breach | Validate manager enrollment, implement row-level security |

## API Response Format

All endpoints follow the standardized response format:

```typescript
{
  success: boolean,
  businessCode: number,
  message: string,
  data: {
    items: T[],
    pagination?: {
      page: number,
      limit: number,
      total: number,
      totalPages: number
    }
  },
  timestamp: string,
  path: string
}
```

## Performance Requirements

- **Response Time**: < 200ms for paginated lists (p95)
- **Concurrent Users**: Support 50+ managers simultaneously
- **Data Freshness**: Real-time for financial data
- **Availability**: 99.9% uptime during activity hours