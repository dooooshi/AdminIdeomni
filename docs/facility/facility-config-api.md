# Facility Configuration Management API

## Overview

The Facility Configuration API provides comprehensive management of configuration templates for all 18 facility types. This system stores default values, constraints, and metadata for each facility type, enabling consistent facility creation and validation.

## Configuration Features

### Configuration Management
- **Create Configurations**: Define configuration templates for facility types
- **Update Configurations**: Modify existing configuration parameters
- **Search & Filter**: Find configurations by type, category, or status
- **Statistics**: View configuration usage and distribution
- **Bulk Operations**: Initialize default configurations for all types

### Default Value Application
- **Automatic Defaults**: Apply configuration defaults during facility creation
- **Capacity Validation**: Enforce min/max capacity constraints
- **Cost Templates**: Default build, maintenance, and operation costs
- **Flexible Override**: Allow manual override of default values

## API Endpoints

### Configuration Management

#### Create Configuration
```http
POST /api/facility-configs
Content-Type: application/json

{
  "facilityType": "MINE",
  "category": "RAW_MATERIAL_PRODUCTION",
  "name": "Mining Facility",
  "description": "Large-scale mineral extraction operations",
  "defaultCapacity": 5000,
  "defaultMaintenanceCost": 8000.00,
  "defaultBuildCost": 150000.00,
  "defaultOperationCost": 1200.00,
  "minCapacity": 500,
  "maxCapacity": 50000,
  "configData": {
    "productionRate": 100,
    "energyConsumption": 800,
    "requiredWorkers": 50,
    "environmentalImpact": "high"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx1a2b3c4d5e6f7g8h9i0j1",
    "facilityType": "MINE",
    "category": "RAW_MATERIAL_PRODUCTION",
    "name": "Mining Facility",
    "description": "Large-scale mineral extraction operations",
    "defaultCapacity": 5000,
    "defaultMaintenanceCost": 8000.00,
    "defaultBuildCost": 150000.00,
    "defaultOperationCost": 1200.00,
    "minCapacity": 500,
    "maxCapacity": 50000,
    "configData": {
      "productionRate": 100,
      "energyConsumption": 800,
      "requiredWorkers": 50,
      "environmentalImpact": "high"
    },
    "isActive": true,
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

#### Search Configurations
```http
GET /api/facility-configs/search?search=mining&category=RAW_MATERIAL_PRODUCTION&page=1&pageSize=20
```

**Query Parameters:**
- `search` (optional): Search in name and description
- `facilityType` (optional): Filter by specific facility type
- `category` (optional): Filter by facility category
- `isActive` (optional): Filter by active status
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 20)
- `sortBy` (optional): Sort field (default: facilityType)
- `sortOrder` (optional): Sort order (asc/desc, default: asc)

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "clx1a2b3c4d5e6f7g8h9i0j1",
        "facilityType": "MINE",
        "category": "RAW_MATERIAL_PRODUCTION",
        "name": "Mining Facility",
        "description": "Large-scale mineral extraction operations",
        "defaultCapacity": 5000,
        "isActive": true,
        "createdAt": "2025-01-15T10:30:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 20,
    "totalPages": 1,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

### Configuration Queries

#### Get Configuration by Facility Type
```http
GET /api/facility-configs/facility-type/MINE
```

#### Get Configurations by Category
```http
GET /api/facility-configs/category/RAW_MATERIAL_PRODUCTION
```

#### Get All Configurations Grouped by Category
```http
GET /api/facility-configs/by-category
```

**Response:**
```json
{
  "success": true,
  "data": {
    "RAW_MATERIAL_PRODUCTION": [
      {
        "id": "clx1...",
        "facilityType": "MINE",
        "name": "Mining Facility",
        "defaultCapacity": 5000
      }
    ],
    "FUNCTIONAL": [...],
    "INFRASTRUCTURE": [...],
    "OTHER": [...]
  }
}
```

### Statistics and Analytics

#### Get Configuration Statistics
```http
GET /api/facility-configs/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalConfigs": 18,
    "activeConfigs": 18,
    "inactiveConfigs": 0,
    "configsByCategory": {
      "RAW_MATERIAL_PRODUCTION": 6,
      "FUNCTIONAL": 4,
      "INFRASTRUCTURE": 3,
      "OTHER": 5
    }
  }
}
```

### Bulk Operations

#### Initialize Default Configurations
```http
POST /api/facility-configs/initialize-defaults
```

Creates default configurations for all 18 facility types if they don't exist.

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 18
  }
}
```

### Configuration Management

#### Update Configuration
```http
PUT /api/facility-configs/{id}
Content-Type: application/json

{
  "name": "Updated Mining Facility",
  "defaultCapacity": 6000,
  "configData": {
    "productionRate": 120,
    "efficiency": 95
  }
}
```

#### Toggle Configuration Status
```http
PUT /api/facility-configs/{id}/toggle-status
```

#### Restore Configuration
```http
PUT /api/facility-configs/{id}/restore
```

#### Delete Configuration
```http
DELETE /api/facility-configs/{id}
```

## Configuration Schema

### Core Configuration Fields

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `facilityType` | `FacilityType` | Type of facility (unique per config) | Yes |
| `category` | `FacilityCategory` | Category grouping | Yes |
| `name` | `string` | Display name for the facility type | Yes |
| `description` | `string` | Detailed description | No |

### Default Values

| Field | Type | Description |
|-------|------|-------------|
| `defaultCapacity` | `number` | Default facility capacity |
| `defaultMaintenanceCost` | `decimal` | Monthly maintenance cost |
| `defaultBuildCost` | `decimal` | Construction cost |
| `defaultOperationCost` | `decimal` | Daily operation cost |

### Constraints

| Field | Type | Description |
|-------|------|-------------|
| `minCapacity` | `number` | Minimum allowed capacity |
| `maxCapacity` | `number` | Maximum allowed capacity |

### Extended Configuration

| Field | Type | Description |
|-------|------|-------------|
| `configData` | `JSON` | Flexible metadata object |

## Integration with Facilities

### Automatic Default Application

When creating a facility, the system automatically applies configuration defaults:

1. **Lookup Configuration**: Find config for the facility type
2. **Apply Defaults**: Use config values where not specified
3. **Validate Constraints**: Ensure capacity within min/max bounds
4. **Create Facility**: Proceed with enhanced data

### Configuration Data Examples

#### Raw Material Production Facilities
```json
{
  "configData": {
    "productionRate": 100,
    "energyConsumption": 800,
    "requiredWorkers": 50,
    "environmentalImpact": "high",
    "specialRequirements": ["water_access", "transport_link"],
    "upgradeOptions": ["efficiency", "capacity", "safety"]
  }
}
```

#### Infrastructure Facilities
```json
{
  "configData": {
    "serviceArea": 50000,
    "energyConsumption": 1500,
    "requiredWorkers": 30,
    "environmentalImpact": "positive",
    "specialRequirements": ["water_source", "distribution_network"],
    "upgradeOptions": ["capacity", "efficiency", "automation"]
  }
}
```

## Error Handling

### Common Error Codes

| Code | Description |
|------|-------------|
| `CONFIG_NOT_FOUND` | Configuration not found |
| `CONFIG_ALREADY_EXISTS` | Configuration exists for facility type |
| `INVALID_CAPACITY_RANGE` | Capacity constraints invalid |
| `VALIDATION_ERROR` | Input validation failed |

### Error Response Format
```json
{
  "success": false,
  "businessCode": 4001,
  "message": "Configuration already exists for this facility type",
  "data": null,
  "timestamp": "2025-01-15T10:30:00.000Z",
  "path": "/api/facility-configs"
}
```

## Best Practices

### Configuration Design
1. **Realistic Defaults**: Use industry-standard values for defaults
2. **Flexible Constraints**: Set reasonable min/max capacity bounds
3. **Rich Metadata**: Leverage `configData` for facility-specific attributes
4. **Consistent Naming**: Use clear, descriptive names for facility types

### API Usage
1. **Initialize First**: Run `initialize-defaults` for new environments
2. **Validate Types**: Ensure facility type matches category
3. **Handle Nulls**: Configuration lookup may return null for missing types
4. **Monitor Stats**: Use statistics endpoint for configuration health

### Performance Considerations
1. **Cache Lookups**: Configuration data is relatively static
2. **Bulk Operations**: Use bulk endpoints for multiple configurations
3. **Index Filtering**: Search endpoints support efficient filtering
4. **Pagination**: Use pagination for large result sets

## Implementation Notes

### Database Design
- One configuration per facility type (unique constraint)
- Soft delete support for configuration history
- JSON storage for flexible metadata
- Indexed queries for fast lookups

### Validation Rules
- Facility type must match category grouping
- Min capacity ≤ max capacity
- Default capacity within min/max range
- Required fields validation

### Integration Points
- Facility creation applies configuration defaults
- Capacity validation uses configuration constraints
- Cost estimation uses configuration templates
- UI forms populate from configuration metadata 