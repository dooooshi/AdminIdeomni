# Facility Space Management API Specification

## Overview

This document provides comprehensive API specifications for the Facility Space Management system. All endpoints follow RESTful conventions and use the standard response format defined in the platform's architecture.

## Base Configuration

### Base URL
```
http://localhost:2999/api
```

### Authentication
All facility space configuration endpoints require:
- JWT authentication with SuperAdmin privileges (adminType = 1)
- All endpoints are under `/api/admin/facility-space-configs/` namespace

```http
Authorization: Bearer <JWT_TOKEN>
```

### Standard Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  businessCode: number;
  message: string;
  data: T;
  timestamp: string;
  path?: string;
  extra?: object;
}
```

### Common HTTP Status Codes
- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., insufficient space)
- `500 Internal Server Error` - Server error

## API Endpoints

### 1. Space Configuration Management

#### 1.1 Get All Storage Facility Configurations

```http
GET /api/admin/facility-space-configs
```

**Response:**
```json
{
  "data": [],
  "businessCode": 0,
  "message": "success",
  "success": true
}
```

#### 1.2 Get Space Configurations for Specific Template

```http
GET /api/admin/facility-space-configs/templates/:templateId
```

**Query Parameters:**
- `onlyStorage` (optional, boolean): Filter to only return storage facilities

**Description**: Retrieve space configurations for all facility types in a map template.

**Path Parameters**:
- `templateId` (integer): Map template ID

**Query Parameters**:
- `facilityType` (string, optional): Filter to return only specific facility type space config

**Response**:
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Facility space configurations retrieved successfully",
  "data": {
    "templateId": 1,
    "configs": [
      {
        "id": "clxx123",
        "facilityType": "WAREHOUSE",
        "initialSpace": 1000,
        "spacePerLevel": 500,
        "maxSpace": 5000,
        "isStorageFacility": true
      },
      {
        "id": "clxx124",
        "facilityType": "FACTORY",
        "initialSpace": 500,
        "spacePerLevel": 250,
        "maxSpace": 2500,
        "isStorageFacility": true
      },
      {
        "id": "clxx125",
        "facilityType": "WATER_PLANT",
        "initialSpace": 0,
        "spacePerLevel": 0,
        "maxSpace": 0,
        "isStorageFacility": false
      }
    ]
  }
}
```

#### 1.3 Get Specific Facility Configuration

```http
GET /api/admin/facility-space-configs/templates/:templateId/facility-types/:facilityType
```

**Description**: Get configuration for a specific facility type in a template.

**Path Parameters**:
- `templateId` (integer): Map template ID
- `facilityType` (string): Facility type enum value

#### 1.4 Create Space Configuration

```http
POST /api/admin/facility-space-configs
```

**Description**: Create a new facility space configuration for a template (SuperAdmin only).

**Authorization**: Requires SuperAdmin privileges (adminType = 1)

**Request Body**:
```json
{
  "templateId": 1,
  "facilityType": "WAREHOUSE",
  "initialSpace": 1000,
  "spacePerLevel": 500,
  "maxSpace": 5000,
  "description": "Main warehouse storage configuration"
}
```

**Response**:
```json
{
  "success": true,
  "businessCode": 201,
  "message": "Facility space configuration created successfully",
  "data": {
    "id": "clxx123",
    "templateId": 1,
    "facilityType": "WAREHOUSE",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### 1.5 Initialize Default Configurations

```http
POST /api/admin/facility-space-configs/templates/:templateId/initialize-defaults
```

**Description**: Initialize default configurations for all facility types in a template.

**Authorization**: Requires SuperAdmin privileges (adminType = 1)

**Request Body**: Empty object `{}`

#### 1.6 Update Space Configuration

```http
PUT /api/admin/facility-space-configs/:id
```

**Description**: Update a specific facility space configuration (SuperAdmin only).

**Authorization**: Requires SuperAdmin privileges (adminType = 1)

**Request Body**:
```json
{
  "initialSpace": 1200,
  "spacePerLevel": 600,
  "maxSpace": 6000,
  "description": "Updated configuration",
  "isActive": true
}
```

#### 1.7 Delete Space Configuration

```http
DELETE /api/admin/facility-space-configs/:id
```

**Description**: Delete a specific facility space configuration (SuperAdmin only).

**Authorization**: Requires SuperAdmin privileges (adminType = 1)

**Response**:
```json
{
  "data": {
    "success": true
  },
  "businessCode": 0,
  "message": "success",
  "success": true
}
```

### 2. Facility Space Inventory Management

#### 2.1 Get Facility Space Status

```http
GET /api/admin/facility-space-configs/facility-instances/:facilityInstanceId/space-status
```

**Description**: Get current space status for a specific facility instance.

**Authorization**: Requires SuperAdmin privileges (adminType = 1)

#### 2.2 Get Team Inventories

```http
GET /api/admin/facility-space-configs/teams/:teamId/inventories
```

**Query Parameters**:
- `activityId` (optional): Filter by specific activity

**Description**: Get all inventories for a team.

**Authorization**: Requires SuperAdmin privileges (adminType = 1)

#### 2.3 Initialize Facility Inventory

```http
POST /api/admin/facility-space-configs/facility-instances/:facilityInstanceId/initialize-inventory
```

**Description**: Initialize inventory for a facility instance that supports storage.

**Authorization**: Requires SuperAdmin privileges (adminType = 1)

## Implementation Summary

### Completed Features
- ✅ Space configuration CRUD operations for SuperAdmin
- ✅ Template-based facility space management
- ✅ Category-based storage rules (only RAW_MATERIAL_PRODUCTION and FUNCTIONAL facilities have storage)
- ✅ Carbon emission units as space measurement
- ✅ Shared storage pool for raw materials and products
- ✅ Default configuration initialization
- ✅ Team inventory management endpoints
- ✅ Facility instance space status tracking

### Key Implementation Details
1. All endpoints require SuperAdmin authentication (adminType = 1)
2. Space is measured in carbon emission units, not simple capacity
3. Storage facilities share space between raw materials and products
4. Non-storage facilities (INFRASTRUCTURE, OTHER categories) have isStorageFacility = false

### Database Models Created
- `FacilitySpaceConfig` - Space configuration per template and facility type
- `FacilitySpaceInventory` - Inventory tracking for facility instances
- `FacilityInventoryItem` - Individual inventory items (raw materials and products)

### Testing Results
All endpoints have been tested and verified working:
- Admin authentication successful
- GET endpoints return correct data
- POST endpoints create configurations successfully
- PUT endpoints update existing configurations
- DELETE endpoints remove configurations properly

### Important Notes
- All endpoints are protected and require SuperAdmin authentication
- The base path is `/api/admin/facility-space-configs/` not `/api/map-templates/`
- Space values are stored as Decimal type in PostgreSQL for precision
- The system automatically determines storage capability based on facility category
