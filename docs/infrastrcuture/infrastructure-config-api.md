# Infrastructure Configuration API Documentation

## Overview

The Infrastructure Configuration API allows super administrators to manage infrastructure-related configuration parameters for map templates. These configurations control the economic aspects of infrastructure facilities including water plants, power plants, base stations, and fire stations.

## Base URL

```
https://api.example.com/api/admin/map-templates
```

## Authentication

All endpoints require JWT authentication with super admin privileges.

**Required Header:**
```
Authorization: Bearer {jwt_token}
```

**Required Permission:** `INFRASTRUCTURE_CONFIG_MANAGE`

---

## Endpoints

### 1. Create Infrastructure Configuration

Creates a new infrastructure configuration for a specific map template.

**Endpoint:** `POST /api/admin/map-templates/{templateId}/infrastructure-config`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| templateId | integer | The ID of the map template |

**Request Body:**
```json
{
  "waterResourceBasePrice": 10.5,
  "electricityResourceBasePrice": 15.5,
  "waterPlantIndex": 1.5,
  "powerPlantIndex": 1.8,
  "waterPlantBaseOperationPoints": 100,
  "powerPlantBaseOperationPoints": 120,
  "waterPlantUpgradeOperationPoints": 20,
  "powerPlantUpgradeOperationPoints": 25,
  "baseStationBaseCost": 50000,
  "fireStationBaseCost": 60000,
  "configData": {
    "description": "Additional configuration data",
    "customField": "value"
  },
  "isActive": true
}
```

**Field Descriptions:**
| Field | Type | Required | Constraints | Description |
|-------|------|----------|------------|-------------|
| waterResourceBasePrice | number | Yes | Min: 0 | Base unit price for water resources (水资源 基础单位价格) |
| electricityResourceBasePrice | number | Yes | Min: 0 | Base unit price for electricity resources (电资源 基础单位价格) |
| waterPlantIndex | number | Yes | Min: 0.1, Max: 10 | Water plant efficiency index (水厂 指数) |
| powerPlantIndex | number | Yes | Min: 0.1, Max: 10 | Power plant efficiency index (电厂 指数) |
| waterPlantBaseOperationPoints | integer | Yes | Min: 1 | Base operation points for water plant (水厂 基础运营点数) |
| powerPlantBaseOperationPoints | integer | Yes | Min: 1 | Base operation points for power plant (电厂 基础运营点数) |
| waterPlantUpgradeOperationPoints | integer | Yes | Min: 0 | Additional operation points per water plant upgrade (水厂 升级增加的运营点数) |
| powerPlantUpgradeOperationPoints | integer | Yes | Min: 0 | Additional operation points per power plant upgrade (电厂 升级增加的运营点数) |
| baseStationBaseCost | number | Yes | Min: 0 | Base construction cost for base station (BASE_STATION 基础费用) |
| fireStationBaseCost | number | Yes | Min: 0 | Base construction cost for fire station (FIRE_STATION 基础费用) |
| configData | object | No | Valid JSON | Additional configuration data in JSON format |
| isActive | boolean | No | - | Whether the configuration is active (default: true) |

**Success Response (201 Created):**
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Infrastructure configuration created successfully",
  "data": {
    "id": "cme9ggfp400524f25zby7t0ux",
    "templateId": 1,
    "waterResourceBasePrice": "10.5",
    "electricityResourceBasePrice": "15.5",
    "waterPlantIndex": "1.5",
    "powerPlantIndex": "1.8",
    "waterPlantBaseOperationPoints": 100,
    "powerPlantBaseOperationPoints": 120,
    "waterPlantUpgradeOperationPoints": 20,
    "powerPlantUpgradeOperationPoints": 25,
    "baseStationBaseCost": "50000",
    "fireStationBaseCost": "60000",
    "configData": {
      "description": "Additional configuration data",
      "customField": "value"
    },
    "isActive": true,
    "createdAt": "2025-08-13T04:13:19.097Z",
    "updatedAt": "2025-08-13T04:13:19.097Z",
    "deletedAt": null
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input data or validation error
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Map template not found
- `409 Conflict` - Configuration already exists for this template

---

### 2. Get Infrastructure Configuration

Retrieves the infrastructure configuration for a specific map template.

**Endpoint:** `GET /api/admin/map-templates/{templateId}/infrastructure-config`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| templateId | integer | The ID of the map template |

**Success Response (200 OK):**
```json
{
  "success": true,
  "businessCode": 0,
  "message": "success",
  "data": {
    "id": "cme9ggfp400524f25zby7t0ux",
    "templateId": 1,
    "waterResourceBasePrice": "10.5",
    "electricityResourceBasePrice": "15.5",
    "waterPlantIndex": "1.5",
    "powerPlantIndex": "1.8",
    "waterPlantBaseOperationPoints": 100,
    "powerPlantBaseOperationPoints": 120,
    "waterPlantUpgradeOperationPoints": 20,
    "powerPlantUpgradeOperationPoints": 25,
    "baseStationBaseCost": "50000",
    "fireStationBaseCost": "60000",
    "configData": {
      "description": "Additional configuration data"
    },
    "isActive": true,
    "createdAt": "2025-08-13T04:13:19.097Z",
    "updatedAt": "2025-08-13T04:13:19.097Z",
    "deletedAt": null
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Configuration not found for this template

---

### 3. Update Infrastructure Configuration

Updates an existing infrastructure configuration for a map template.

**Endpoint:** `PUT /api/admin/map-templates/{templateId}/infrastructure-config`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| templateId | integer | The ID of the map template |

**Request Body:**
```json
{
  "waterResourceBasePrice": 12.5,
  "electricityResourceBasePrice": 18.5,
  "waterPlantIndex": 1.7
}
```

*Note: All fields are optional. Only provided fields will be updated.*

**Success Response (200 OK):**
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Infrastructure configuration updated successfully",
  "data": {
    "id": "cme9ggfp400524f25zby7t0ux",
    "templateId": 1,
    "waterResourceBasePrice": "12.5",
    "electricityResourceBasePrice": "18.5",
    "waterPlantIndex": "1.7",
    "powerPlantIndex": "1.8",
    "waterPlantBaseOperationPoints": 100,
    "powerPlantBaseOperationPoints": 120,
    "waterPlantUpgradeOperationPoints": 20,
    "powerPlantUpgradeOperationPoints": 25,
    "baseStationBaseCost": "50000",
    "fireStationBaseCost": "60000",
    "configData": {
      "description": "Additional configuration data"
    },
    "isActive": true,
    "createdAt": "2025-08-13T04:13:19.097Z",
    "updatedAt": "2025-08-13T05:09:21.554Z",
    "deletedAt": null
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input data or validation error
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Configuration not found for this template

---

### 4. Create or Update Infrastructure Configuration (Upsert)

Creates a new configuration if it doesn't exist, or updates it if it does.

**Endpoint:** `PUT /api/admin/map-templates/{templateId}/infrastructure-config/upsert`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| templateId | integer | The ID of the map template |

**Request Body:** Same as Create Infrastructure Configuration

**Success Response (200 OK):**
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Infrastructure configuration saved successfully",
  "data": {
    "id": "cme9ggfp400524f25zby7t0ux",
    "templateId": 1,
    "waterResourceBasePrice": "10.5",
    "electricityResourceBasePrice": "15.5",
    "waterPlantIndex": "1.5",
    "powerPlantIndex": "1.8",
    "waterPlantBaseOperationPoints": 100,
    "powerPlantBaseOperationPoints": 120,
    "waterPlantUpgradeOperationPoints": 20,
    "powerPlantUpgradeOperationPoints": 25,
    "baseStationBaseCost": "50000",
    "fireStationBaseCost": "60000",
    "configData": null,
    "isActive": true,
    "createdAt": "2025-08-13T04:13:19.097Z",
    "updatedAt": "2025-08-13T05:09:21.554Z",
    "deletedAt": null
  }
}
```

---

### 5. Delete Infrastructure Configuration (Soft Delete)

Soft deletes an infrastructure configuration by setting the deletedAt timestamp.

**Endpoint:** `DELETE /api/admin/map-templates/{templateId}/infrastructure-config`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| templateId | integer | The ID of the map template |

**Success Response (200 OK):**
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Infrastructure configuration deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Configuration not found for this template

---

### 6. List All Infrastructure Configurations

Retrieves a list of all infrastructure configurations with optional filtering.

**Endpoint:** `GET /api/admin/map-templates/infrastructure-configs`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| isActive | boolean | No | Filter by active status |
| includeDeleted | boolean | No | Include soft-deleted configurations (default: false) |

**Success Response (200 OK):**
```json
{
  "success": true,
  "businessCode": 0,
  "message": "success",
  "data": [
    {
      "id": "cme9ggfp400524f25zby7t0ux",
      "templateId": 1,
      "waterResourceBasePrice": "12.5",
      "electricityResourceBasePrice": "18.5",
      "waterPlantIndex": "1.6",
      "powerPlantIndex": "1.9",
      "waterPlantBaseOperationPoints": 110,
      "powerPlantBaseOperationPoints": 130,
      "waterPlantUpgradeOperationPoints": 25,
      "powerPlantUpgradeOperationPoints": 30,
      "baseStationBaseCost": "55000",
      "fireStationBaseCost": "65000",
      "configData": {
        "timestamp": "2025-08-13T05:09:21Z",
        "description": "Test configuration"
      },
      "isActive": true,
      "createdAt": "2025-08-13T04:13:19.097Z",
      "updatedAt": "2025-08-13T05:09:21.554Z",
      "deletedAt": null,
      "template": {
        "id": 1,
        "name": "Default Template 1",
        "description": "Default hexagonal map template",
        "version": "1.0",
        "isActive": true,
        "isDefault": true,
        "createdAt": "2025-08-13T04:13:18.914Z",
        "updatedAt": "2025-08-13T04:13:18.914Z",
        "deletedAt": null
      }
    }
  ],
  "total": 1
}
```

---

### 7. Get Infrastructure Configuration Statistics

Retrieves aggregated statistics for all infrastructure configurations.

**Endpoint:** `GET /api/admin/map-templates/infrastructure-configs/statistics`

**Success Response (200 OK):**
```json
{
  "success": true,
  "businessCode": 0,
  "message": "success",
  "data": {
    "totalConfigured": 2,
    "avgWaterPrice": 12.5,
    "avgElectricityPrice": 18.5,
    "avgWaterPlantIndex": 1.6,
    "avgPowerPlantIndex": 1.9,
    "unconfiguredTemplates": 1
  }
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| totalConfigured | integer | Number of templates with active configurations |
| avgWaterPrice | number | Average water resource base price across all configurations |
| avgElectricityPrice | number | Average electricity resource base price across all configurations |
| avgWaterPlantIndex | number | Average water plant index across all configurations |
| avgPowerPlantIndex | number | Average power plant index across all configurations |
| unconfiguredTemplates | integer | Number of templates without configurations |

---

### 8. Copy Infrastructure Configuration

Copies the infrastructure configuration from one template to another.

**Endpoint:** `POST /api/admin/map-templates/{templateId}/infrastructure-config/copy-from/{sourceTemplateId}`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| templateId | integer | The ID of the target map template |
| sourceTemplateId | integer | The ID of the source map template to copy from |

**Success Response (200 OK):**
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Infrastructure configuration copied successfully",
  "data": {
    "id": "cme9hh1p500524f26abc8t1vy",
    "templateId": 2,
    "waterResourceBasePrice": "12.5",
    "electricityResourceBasePrice": "18.5",
    "waterPlantIndex": "1.6",
    "powerPlantIndex": "1.9",
    "waterPlantBaseOperationPoints": 110,
    "powerPlantBaseOperationPoints": 130,
    "waterPlantUpgradeOperationPoints": 25,
    "powerPlantUpgradeOperationPoints": 30,
    "baseStationBaseCost": "55000",
    "fireStationBaseCost": "65000",
    "configData": {
      "timestamp": "2025-08-13T05:09:21Z",
      "description": "Test configuration"
    },
    "isActive": true,
    "createdAt": "2025-08-13T05:10:15.097Z",
    "updatedAt": "2025-08-13T05:10:15.097Z",
    "deletedAt": null
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Source configuration or target template not found

---

### 9. Apply Default Configuration

Applies default infrastructure configuration values to a map template.

**Endpoint:** `POST /api/admin/map-templates/{templateId}/infrastructure-config/apply-defaults`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| templateId | integer | The ID of the map template |

**Default Values:**
```json
{
  "waterResourceBasePrice": 10.0,
  "electricityResourceBasePrice": 15.0,
  "waterPlantIndex": 1.5,
  "powerPlantIndex": 1.8,
  "waterPlantBaseOperationPoints": 100,
  "powerPlantBaseOperationPoints": 120,
  "waterPlantUpgradeOperationPoints": 20,
  "powerPlantUpgradeOperationPoints": 25,
  "baseStationBaseCost": 50000,
  "fireStationBaseCost": 60000,
  "isActive": true
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Default infrastructure configuration applied successfully",
  "data": {
    "id": "cme9hh2p600524f27xyz9t2wz",
    "templateId": 3,
    "waterResourceBasePrice": "10",
    "electricityResourceBasePrice": "15",
    "waterPlantIndex": "1.5",
    "powerPlantIndex": "1.8",
    "waterPlantBaseOperationPoints": 100,
    "powerPlantBaseOperationPoints": 120,
    "waterPlantUpgradeOperationPoints": 20,
    "powerPlantUpgradeOperationPoints": 25,
    "baseStationBaseCost": "50000",
    "fireStationBaseCost": "60000",
    "configData": null,
    "isActive": true,
    "createdAt": "2025-08-13T05:11:20.097Z",
    "updatedAt": "2025-08-13T05:11:20.097Z",
    "deletedAt": null
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Map template not found

---

## Error Response Format

All error responses follow a consistent format:

```json
{
  "success": false,
  "businessCode": 4001,
  "message": "Validation error message",
  "data": null,
  "timestamp": "2025-08-13T05:00:00.000Z",
  "path": "/api/admin/map-templates/1/infrastructure-config",
  "details": {
    "errorCode": 4001,
    "messageKey": "VALIDATION_ERROR",
    "errors": [
      {
        "field": "waterResourceBasePrice",
        "message": "must be a positive number"
      }
    ]
  }
}
```

## Common Error Codes

| Code | Message Key | Description |
|------|------------|-------------|
| 2011 | ADMIN_TOKEN_INVALID | Authentication token is invalid or expired |
| 2012 | ADMIN_PERMISSION_DENIED | Insufficient permissions for this operation |
| 4001 | VALIDATION_ERROR | Request validation failed |
| 4004 | NOT_FOUND | Resource not found |
| 4009 | CONFLICT | Resource already exists |
| 5000 | INTERNAL_SERVER_ERROR | Internal server error |

## Data Types and Constraints

### Decimal Fields
The following fields are stored as decimal values with high precision:
- `waterResourceBasePrice`: Decimal(65,3)
- `electricityResourceBasePrice`: Decimal(65,3)
- `waterPlantIndex`: Decimal(10,3)
- `powerPlantIndex`: Decimal(10,3)
- `baseStationBaseCost`: Decimal(65,3)
- `fireStationBaseCost`: Decimal(65,3)

*Note: These values are returned as strings in JSON responses to preserve precision.*

### Integer Fields
The following fields are stored as integers:
- `waterPlantBaseOperationPoints`: Integer (Min: 1)
- `powerPlantBaseOperationPoints`: Integer (Min: 1)
- `waterPlantUpgradeOperationPoints`: Integer (Min: 0)
- `powerPlantUpgradeOperationPoints`: Integer (Min: 0)

*Note: While the database supports large integer values, the API validates minimum values only. Maximum values are constrained by the database integer type limits.*

### Relationships
- Each map template can have at most one infrastructure configuration (1:1 relationship)
- Deleting a map template will cascade delete its infrastructure configuration

## Rate Limiting

API endpoints are subject to rate limiting:
- **Default limit:** 100 requests per minute per IP
- **Authenticated limit:** 1000 requests per minute per user

## Implementation Notes

### Validation
- The API currently validates minimum values for all numeric fields
- Maximum values are not explicitly validated in the API layer but are constrained by database field types
- Plant indices (waterPlantIndex, powerPlantIndex) have both min (0.1) and max (10) validation

### Permission Requirements
- Read operations require `INFRASTRUCTURE_CONFIG_READ` permission
- Write operations (create, update, delete, copy, apply defaults) require `INFRASTRUCTURE_CONFIG_MANAGE` permission
- All operations require super admin authentication via JWT

## Changelog

### Version 1.0.1 (2025-08-13)
- Updated documentation to accurately reflect implementation validation constraints
- Clarified that maximum values for prices and operation points are database-constrained, not API-validated
- Fixed path parameter naming for copy endpoint to match implementation

### Version 1.0.0 (2025-08-13)
- Initial release of Infrastructure Configuration API
- Support for all 10 infrastructure parameters
- CRUD operations with soft delete
- Statistics and bulk operations
- Configuration copying and default application

## Support

For API support or questions, please contact:
- Technical Support: support@example.com
- API Documentation: https://docs.example.com/api
- Status Page: https://status.example.com