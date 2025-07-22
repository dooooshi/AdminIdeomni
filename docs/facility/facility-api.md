# Facility Management API

## Overview

The Facility module provides comprehensive management of 18 different types of facilities categorized into 4 main groups. This module is designed to be independent and does not integrate with the activity or map modules as requested.

## Facility Categories and Types

### Type 1: 原料生产设施 (Raw Material Production Facilities)
- **MINE** (矿场) - Mining operations for extracting precious metals and minerals
- **QUARRY** (采石场) - Stone and granite extraction for construction materials  
- **FOREST** (林场) - Sustainable timber harvesting operations
- **FARM** (农场) - Multi-crop farming for grains and vegetables
- **RANCH** (养殖场) - Livestock operations for cattle and poultry
- **FISHERY** (渔场) - Marine fishing operations with processing capabilities

### Type 2: 功能性设施 (Functional Facilities)
- **FACTORY** (工厂) - Manufacturing facilities for producing consumer goods
- **MALL** (商场) - Retail complexes with multiple stores and entertainment
- **WAREHOUSE** (仓库) - Large-scale storage and distribution centers
- **MEDIA_BUILDING** (媒体大楼) - Media production and broadcasting facilities

### Type 3: 基础设施 (Infrastructure)
- **WATER_PLANT** (水厂) - Water purification and distribution facilities
- **POWER_PLANT** (电厂) - Clean energy power generation facilities
- **BASE_STATION** (基站) - Telecommunications infrastructure hubs

### Type 4: 其他设施 (Other Facilities)
- **FIRE_STATION** (消防站) - Emergency response and fire safety facilities
- **SCHOOL** (学校) - Educational facilities for secondary education
- **HOSPITAL** (医院) - Full-service medical facilities with emergency care
- **PARK** (公园) - Public recreational spaces with gardens and sports
- **CINEMA** (影院) - Movie theaters with multiple screens and amenities

## Data Model

### Facility Entity

```typescript
interface Facility {
  id: string;                    // Unique identifier (CUID)
  name: string;                  // Facility name
  facilityType: FacilityType;    // One of the 18 facility types
  category: FacilityCategory;    // One of the 4 categories
  description?: string;          // Optional description
  capacity?: number;             // Optional capacity (production, storage, etc.)
  maintenanceCost?: Decimal;     // Optional monthly maintenance cost
  buildCost?: Decimal;           // Optional initial construction cost
  operationCost?: Decimal;       // Optional daily operation cost
  isActive: boolean;             // Active status (default: true)
  createdAt: Date;               // Creation timestamp
  updatedAt: Date;               // Last update timestamp
  deletedAt?: Date;              // Soft delete timestamp
}
```

## API Endpoints

### Base URL: `/api/facilities`

#### 1. Create Facility
- **POST** `/api/facilities`
- **Description**: Create a new facility with validation for type-category matching
- **Auth**: Not required (as per project design)
- **Request Body**:
```json
{
  "name": "Central Mining Complex",
  "facilityType": "MINE",
  "category": "RAW_MATERIAL_PRODUCTION",
  "description": "Large-scale mining operation",
  "capacity": 5000,
  "maintenanceCost": 8000.00,
  "buildCost": 150000.00,
  "operationCost": 1200.00
}
```
- **Response**: `201 Created` with facility details
- **Validation**: 
  - Name must be unique
  - Facility type must match the selected category
  - All cost fields are optional but must be positive if provided

#### 2. Search Facilities
- **GET** `/api/facilities/search`
- **Description**: Search facilities with advanced filtering and pagination
- **Query Parameters**:
  - `search`: String - Search term for facility name (case-insensitive)
  - `facilityType`: FacilityType - Filter by specific facility type
  - `category`: FacilityCategory - Filter by facility category
  - `isActive`: Boolean - Filter by active status
  - `page`: Number - Page number (default: 1)
  - `pageSize`: Number - Items per page (default: 20, max: 100)
  - `sortBy`: String - Sort field (default: createdAt)
  - `sortOrder`: String - Sort order: 'asc' or 'desc' (default: desc)
- **Response**: Paginated facility list with metadata

#### 3. Get Facility Statistics
- **GET** `/api/facilities/stats`
- **Description**: Retrieve comprehensive facility statistics
- **Response**:
```json
{
  "totalFacilities": 150,
  "activeFacilities": 120,
  "inactiveFacilities": 30,
  "facilitiesByCategory": {
    "RAW_MATERIAL_PRODUCTION": 45,
    "FUNCTIONAL": 35,
    "INFRASTRUCTURE": 25,
    "OTHER": 45
  },
  "facilitiesByType": {
    "MINE": 10,
    "QUARRY": 8,
    "FOREST": 7,
    // ... other types
  }
}
```

#### 4. Get Facility Types by Category
- **GET** `/api/facilities/types-by-category`
- **Description**: Retrieve all facility types organized by categories
- **Response**: Object mapping categories to their facility types

#### 5. Get Facilities by Type
- **GET** `/api/facilities/by-type/:facilityType`
- **Description**: Retrieve all active facilities of a specific type
- **Parameters**: `facilityType` - The facility type to filter by
- **Response**: Array of facility details

#### 6. Get Facilities by Category
- **GET** `/api/facilities/by-category/:category`
- **Description**: Retrieve all active facilities of a specific category
- **Parameters**: `category` - The facility category to filter by
- **Response**: Array of facility details

#### 7. Get Facility by ID
- **GET** `/api/facilities/:id`
- **Description**: Retrieve a specific facility by its unique identifier
- **Parameters**: `id` - Facility ID
- **Response**: `200 OK` with facility details or `404 Not Found`

#### 8. Update Facility
- **PUT** `/api/facilities/:id`
- **Description**: Update an existing facility
- **Parameters**: `id` - Facility ID
- **Request Body**: Partial facility data (all fields optional)
- **Response**: `200 OK` with updated facility details
- **Validation**: Same as create, plus name uniqueness check

#### 9. Toggle Facility Status
- **PUT** `/api/facilities/:id/toggle-status`
- **Description**: Toggle the active status of a facility
- **Parameters**: `id` - Facility ID
- **Response**: `200 OK` with updated facility details

#### 10. Restore Facility
- **PUT** `/api/facilities/:id/restore`
- **Description**: Restore a previously soft-deleted facility
- **Parameters**: `id` - Facility ID
- **Response**: `200 OK` with restored facility details
- **Error**: `400 Bad Request` if facility is not deleted

#### 11. Delete Facility (Soft Delete)
- **DELETE** `/api/facilities/:id`
- **Description**: Soft delete a facility (marks as deleted but keeps in database)
- **Parameters**: `id` - Facility ID
- **Response**: `204 No Content`

## Business Logic Features

### 1. Type-Category Validation
The system automatically validates that facility types match their designated categories:
- Raw Material Production: MINE, QUARRY, FOREST, FARM, RANCH, FISHERY
- Functional: FACTORY, MALL, WAREHOUSE, MEDIA_BUILDING
- Infrastructure: WATER_PLANT, POWER_PLANT, BASE_STATION
- Other: FIRE_STATION, SCHOOL, HOSPITAL, PARK, CINEMA

### 2. Soft Delete Support
All facilities support soft deletion, allowing for:
- Safe removal without data loss
- Restoration capabilities
- Audit trail maintenance

### 3. Cost Management
Optional cost tracking includes:
- **Build Cost**: Initial construction investment
- **Maintenance Cost**: Monthly upkeep expenses
- **Operation Cost**: Daily operational expenses

### 4. Search and Filtering
Advanced search capabilities:
- Full-text search on facility names
- Type and category filtering
- Active status filtering
- Flexible pagination and sorting

## Error Handling

The API uses the project's standardized exception handling system:

### Business Exceptions (HTTP 200 with error in body)
- Facility name already exists
- Invalid facility type for category
- Facility not found
- Facility not deleted (when trying to restore)

### Validation Exceptions (HTTP 400)
- Missing required fields
- Invalid input formats
- Validation constraint violations

### System Exceptions (HTTP 500)
- Database errors
- Unexpected system failures

## Internationalization

All error messages and responses support internationalization with:
- English (en) - Default language
- Chinese (zh) - Fallback language

Translation keys are available in:
- `src/common/i18n/translations/en/FACILITY.json`
- `src/common/i18n/translations/zh/FACILITY.json`

## Sample Data

The module includes comprehensive seed data with realistic examples of all 18 facility types, including:
- Descriptive names and detailed descriptions
- Appropriate capacity values for each type
- Realistic cost estimates for build, maintenance, and operation
- Proper type-category assignments

## Security Considerations

- No authentication is required as per project design
- Input validation prevents injection attacks
- Soft delete prevents accidental data loss
- Audit trails are maintained through timestamps

## Performance Features

- Efficient database indexing on commonly queried fields
- Pagination to handle large datasets
- Optimized aggregate queries for statistics
- Proper caching strategies for frequently accessed data

## Module Architecture

The facility module follows the established project patterns:
- **Controller**: REST API endpoints with Swagger documentation
- **Service**: Business logic and validation
- **Repository**: Data access layer with base repository extension
- **DTOs**: Request/response data transfer objects with validation
- **Exceptions**: Proper error handling and reporting
- **Seeds**: Development data for testing and demonstration 