# Admin RBAC System

This document describes the Role-Based Access Control (RBAC) subsystem introduced for the **Admin** domain.

## Overview

1. **Roles** –  Named collections of permissions (e.g. `SUPER_ADMIN`, `ACTIVITY_MANAGER`).
2. **Permissions** –  Fine-grained action codes (e.g. `ADMIN_READ`, `ADMIN_CREATE`, `TILE_FACILITY_CONFIG_MANAGE`).
3. **Admin ↔ Role** –  Many-to-many link via `AdminRole`.
4. **Role ↔ Permission** –  Many-to-many link via `RolePermission`.

`Admin` with `adminType = 1` (super admin) bypasses RBAC checks.

## Prisma Models

```prisma
model Role          { … }
model Permission    { … }
model RolePermission{ … }
model AdminRole     { … }
```
(See `prisma/models/rbac.prisma` for details.)

Run the usual migration workflow when the schema file changes:

```bash
pnpm prisma:generate
pnpm prisma:migrate --name admin-rbac
```

## Service & Repositories

* `RbacService` – helper to resolve an admin's permissions and test membership.
* Repositories: `RoleRepository`, `PermissionRepository`, `RolePermissionRepository`, `AdminRoleRepository` (all under `src/admin/rbac`).

## Guards / Decorators

* `RequirePermissions(...codes)` – metadata decorator to declare permission needs.
* `PermissionGuard` – verifies that the authenticated admin possesses the required permissions.
* Composite decorator `AdminPermissionAuth(...codes)` combines `AdminJwtAuthGuard` + `PermissionGuard` for convenience.

Example usage:

```ts
@Post('create')
@AdminPermissionAuth('ADMIN_CREATE')
async createAdmin(/* … */) { /* … */ }
```

## Module Integration

`AdminModule` registers all RBAC providers and exports them for reuse.

## Permission Categories

### Core Admin Permissions
- `ADMIN_READ` - View admin accounts and basic information
- `ADMIN_CREATE` - Create new admin accounts
- `ADMIN_UPDATE` - Modify existing admin accounts
- `ADMIN_DELETE` - Delete admin accounts

### Map Template Permissions
- `MAP_TEMPLATE_READ` - View map templates
- `MAP_TEMPLATE_CREATE` - Create new map templates
- `MAP_TEMPLATE_UPDATE` - Modify existing map templates
- `MAP_TEMPLATE_DELETE` - Delete map templates
- `MAP_TEMPLATE_GENERATE` - Generate procedural map templates

### **Tile Facility Configuration Permissions** (NEW)
- `TILE_FACILITY_CONFIG_READ` - View facility build configurations
  - List all configurations for templates
  - View configuration statistics
  - Access upgrade cost calculations
- `TILE_FACILITY_CONFIG_MANAGE` - Manage facility build configurations
  - Create new facility configurations
  - Update existing configurations
  - Delete and restore configurations
  - Bulk update operations
  - Initialize default configurations

### Activity Management Permissions
- `ACTIVITY_READ` - View activities and participants
- `ACTIVITY_CREATE` - Create new activities
- `ACTIVITY_UPDATE` - Modify existing activities
- `ACTIVITY_DELETE` - Delete activities
- `ACTIVITY_MANAGE` - Full activity management capabilities

### User Management Permissions
- `USER_READ` - View user accounts
- `USER_CREATE` - Create new user accounts
- `USER_UPDATE` - Modify user accounts
- `USER_DELETE` - Delete user accounts

## Role Definitions

### Super Admin
- **Description**: Full system access with all permissions
- **Permissions**: All permissions (bypasses RBAC checks)
- **Use Cases**: System administrators, platform owners

### Activity Manager
- **Description**: Comprehensive activity and template management
- **Permissions**:
  - All `ACTIVITY_*` permissions
  - All `MAP_TEMPLATE_*` permissions
  - `TILE_FACILITY_CONFIG_READ`
  - `TILE_FACILITY_CONFIG_MANAGE`
  - `USER_READ`
- **Use Cases**: Activity coordinators, simulation managers

### Template Editor
- **Description**: Map template and facility configuration management
- **Permissions**:
  - `MAP_TEMPLATE_READ`
  - `MAP_TEMPLATE_UPDATE`
  - `MAP_TEMPLATE_GENERATE`
  - `TILE_FACILITY_CONFIG_READ`
  - `TILE_FACILITY_CONFIG_MANAGE`
- **Use Cases**: Content creators, scenario designers

### Activity Supervisor
- **Description**: Activity oversight and user management
- **Permissions**:
  - `ACTIVITY_READ`
  - `ACTIVITY_UPDATE`
  - `USER_READ`
  - `USER_UPDATE`
  - `MAP_TEMPLATE_READ`
  - `TILE_FACILITY_CONFIG_READ`
- **Use Cases**: Activity supervisors, support staff

## Permission Usage Examples

### Tile Facility Configuration Management

```typescript
// Require read access for viewing configurations
@Get(':templateId/tile-facility-configs')
@RequirePermissions('TILE_FACILITY_CONFIG_READ')
async getConfigurations() { /* ... */ }

// Require manage access for creating configurations
@Post(':templateId/tile-facility-configs')
@RequirePermissions('TILE_FACILITY_CONFIG_MANAGE')
async createConfiguration() { /* ... */ }

// Require manage access for bulk operations
@Put(':templateId/tile-facility-configs/land-type/:landType/bulk-update')
@RequirePermissions('TILE_FACILITY_CONFIG_MANAGE')
async bulkUpdateByLandType() { /* ... */ }
```

### Permission Hierarchy

**Read-Only Access:**
- `TILE_FACILITY_CONFIG_READ` allows viewing all configuration data
- Can access statistics, upgrade calculations, and configuration lists
- Cannot modify any configurations

**Full Management Access:**
- `TILE_FACILITY_CONFIG_MANAGE` includes all read permissions plus:
  - Create, update, delete configurations
  - Bulk operations and default initialization
  - Restore deleted configurations

## Future Extensions

* CRUD endpoints for managing roles & permissions.
* ~~Seed scripts to populate default roles / permissions.~~ ✅ **Completed**
* Caching layer for permission lookups.
* Permission-based UI filtering for admin interfaces.
* Audit logging for permission changes and role assignments. 