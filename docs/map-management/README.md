# Admin Features Documentation

This directory contains documentation for all admin-related features in the system.

## Core Admin System
- [Admin System Overview](admin-system-overview.md) - Core admin functionality and architecture
- [Admin RBAC System](admin-rbac.md) - Role-based access control
- [Admin Security Guidelines](admin-security-guidelines.md) - Security best practices
- [Admin Setup Guide](admin-setup-guide.md) - Initial setup and configuration

## Authentication & Authorization
- [Admin Authentication Flow](admin-auth-flow.md) - Login, JWT tokens, and session management
- [Admin API Endpoints](admin-api-endpoints.md) - Complete API reference

## User Management
- [Admin User Management](admin-user-api-documentation.md) - User CRUD operations
- [Admin User Pagination](admin-user-pagination.md) - Pagination and filtering

## Activity Management  
- [Admin Activity Management](admin-activity-management.md) - Activity oversight and control
- [Activity Tile State Management](admin-tile-state-management.md) - Runtime tile state modifications

## Map Template Management
- [Map Template Management](admin-map-template-management.md) - Template CRUD operations
- [Map Template Tile Configuration](admin-map-template-tile-config.md) - Base tile configuration APIs
- [**Tile Facility Build Configuration**](admin-tile-facility-build-config.md) - **NEW: Facility placement rules and upgrade management**

## Audit & Operations
- [Admin Operation Logging](admin-operation-logging.md) - Activity tracking and audit trails

## Quick API Reference

### Authentication
- `POST /admin/login` - Admin login
- `POST /admin/refresh-token` - Token refresh
- `POST /admin/logout` - Admin logout

### User Management
- `GET /admin/users/search` - Search users with pagination
- `POST /admin/users` - Create new user
- `PUT /admin/users/:id` - Update user
- `DELETE /admin/users/:id` - Delete user

### Activity Management
- `GET /admin/activities/manage` - List activities with management controls
- `POST /admin/activities/create` - Create new activity
- `PUT /admin/activities/bulk-update` - Bulk update activities

### Map Template Management
- `GET /admin/map-templates` - List templates
- `POST /admin/map-templates` - Create template
- `POST /admin/map-templates/generate` - Generate template with tiles
- `PUT /admin/map-templates/:id/set-default` - Set default template

### Map Template Tile Configuration
- `PUT /admin/map-templates/:templateId/tiles/:tileId/config` - Update individual tile
- `PUT /admin/map-templates/:templateId/tiles/bulk-update` - Bulk update multiple tiles  
- `PUT /admin/map-templates/:templateId/tiles/land-type/:landType/bulk-update` - Update by land type
- `PUT /admin/map-templates/:templateId/tiles/reset-defaults` - Reset tiles to defaults

### **NEW: Tile Facility Build Configuration**
- `POST /admin/map-templates/:templateId/tile-facility-configs` - Create facility config
- `GET /admin/map-templates/:templateId/tile-facility-configs` - List facility configs
- `GET /admin/map-templates/:templateId/tile-facility-configs/:configId` - Get specific config
- `PUT /admin/map-templates/:templateId/tile-facility-configs/:configId` - Update config
- `DELETE /admin/map-templates/:templateId/tile-facility-configs/:configId` - Delete config
- `GET /admin/map-templates/:templateId/tile-facility-configs/upgrade-calculator/:landType/:facilityType` - Calculate upgrade costs
- `PUT /admin/map-templates/:templateId/tile-facility-configs/land-type/:landType/bulk-update` - Bulk update by land type
- `POST /admin/map-templates/:templateId/tile-facility-configs/initialize-defaults` - Initialize default configs
- `GET /admin/map-templates/:templateId/tile-facility-configs/statistics` - Get configuration statistics

### Tile State Management (Activity Runtime)
- `PUT /admin/tile-states/configure` - Configure individual tile state
- `PUT /admin/tile-states/bulk-configure` - Bulk configure tile states
- `POST /admin/tile-states/:activityId/reset` - Reset activity tile states

## Key Differences

### Map Template System Architecture

**Map Template Tiles** (Base Configuration):
- Stored in `MapTile` table
- Define the **initial/default** values for new activities
- Fields: `initialPrice`, `initialPopulation`, `transportationCostUnit`
- Changed via `/admin/map-templates/:templateId/tiles/*` endpoints
- Affects **future** activities created from the template

**Tile Facility Build Configuration** (Facility Placement Rules):
- Stored in `TileFacilityBuildConfig` table
- Define **which facilities can be built** on which tile types
- Fields: `requiredGold`, `requiredCarbon`, `requiredAreas`, `maxLevel`, upgrade costs
- Changed via `/admin/map-templates/:templateId/tile-facility-configs/*` endpoints
- Controls facility placement and upgrade systems for activities

**Activity Tile States** (Runtime Values):
- Stored in `ActivityTileState` table  
- Define the **current** values during an active simulation
- Fields: `currentPrice`, `currentPopulation`
- Changed via `/admin/tile-states/*` endpoints
- Affects **existing** activity instances

### When to Use Each API

**Use Map Template Tile APIs when:**
- Setting up new simulation scenarios
- Adjusting baseline economic conditions
- Creating template variations
- Preparing for future activities

**Use Tile Facility Build Configuration APIs when:**
- Defining which facilities can be built on different land types
- Setting up facility build requirements (gold, carbon, areas)
- Configuring facility upgrade systems and max levels
- Creating different simulation game modes with varied facility rules

**Use Activity Tile State APIs when:**
- Managing ongoing simulations
- Responding to real-time issues
- Testing scenarios during activities
- Correcting runtime data

## Permission Requirements

All admin APIs require:
- Valid admin JWT token
- Appropriate RBAC permissions:
  - `MAP_TEMPLATE_UPDATE` - For template tile configuration
  - `TILE_FACILITY_CONFIG_READ` - For viewing facility configurations
  - `TILE_FACILITY_CONFIG_MANAGE` - For managing facility configurations
  - `TILE_STATE_UPDATE` - For activity tile state management
  - `ACTIVITY_MANAGE` - For activity management
  - `USER_MANAGE` - For user management

## Getting Started

1. **Admin Setup**: Follow [Admin Setup Guide](admin-setup-guide.md)
2. **Authentication**: Use [Admin Auth Flow](admin-auth-flow.md) 
3. **Template Configuration**: See [Map Template Tile Configuration](admin-map-template-tile-config.md)
4. **Facility Configuration**: See [Tile Facility Build Configuration](admin-tile-facility-build-config.md)
5. **Runtime Management**: Use [Tile State Management](admin-tile-state-management.md)

## Error Handling

All admin APIs use standardized error responses:
- Business exceptions return HTTP 200 with error details
- HTTP exceptions return appropriate status codes
- All errors include internationalized messages
- Detailed validation errors for input validation failures

See individual documentation files for specific error scenarios and handling. 