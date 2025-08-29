# Raw Material API Specification

## Base URL
`http://localhost:2999/api`

## Authentication
All endpoints require JWT authentication:
- Admin endpoints: `AdminAuthGuard`
- User endpoints: `UserAuthGuard`

## Material Origins
Raw materials are produced by existing facility types:
- `MINE` - Mining operations (steel, aluminum, minerals)
- `QUARRY` - Stone and aggregate extraction
- `FOREST` - Timber and wood products
- `FARM` - Agricultural products (cotton, crops)
- `RANCH` - Livestock-based materials
- `FISHERY` - Marine-based materials
- `SHOPS` - Retail and commercial materials

## Endpoints Overview

### Admin Endpoints (Material Management)
- `GET /api/admin/raw-materials` - List all raw materials
- `GET /api/admin/raw-materials/:id` - Get single material details
- `POST /api/admin/raw-materials` - Create new raw material
- `PUT /api/admin/raw-materials/:id` - Update raw material
- `PATCH /api/admin/raw-materials/:id` - Partial update raw material
- `DELETE /api/admin/raw-materials/:id` - Delete raw material (soft delete)
- `GET /api/admin/raw-materials/audit-log` - View modification history

### User Endpoints (Material Viewing)
- `GET /api/raw-materials` - Get available raw materials (with pagination)
- `GET /api/raw-materials/:id` - Get material details

---

## Admin API Endpoints

### 1. List All Raw Materials
**GET** `/api/admin/raw-materials`

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 20, max: 100) |
| offset | number | No | Skip number of items (alternative to page) |
| sort | string | No | Sort field (materialNumber, nameEn, nameZh, totalCost, carbonEmission) |
| order | string | No | Sort order (asc, desc) (default: asc) |
| origin | string | No | Filter by facility type (MINE, QUARRY, FOREST, FARM, RANCH, FISHERY, SHOPS) |
| isActive | boolean | No | Filter by active status (default: true) |
| isDeleted | boolean | No | Include deleted items (default: false) |
| search | string | No | Search in name (EN/ZH) or material number |
| minCost | number | No | Minimum total cost filter |
| maxCost | number | No | Maximum total cost filter |
| minCarbon | number | No | Minimum carbon emission filter |
| maxCarbon | number | No | Maximum carbon emission filter |

#### Response
```json
{
  "success": true,
  "businessCode": 20000,
  "message": "Raw materials retrieved successfully",
  "data": {
    "items": [
      {
        "id": 1,
        "materialNumber": 1,
        "origin": "RANCH",
        "nameEn": "Eggs",
        "nameZh": "蛋类",
        "totalCost": 8,
        "waterRequired": 3,
        "powerRequired": 0,
        "goldCost": 5,
        "carbonEmission": 0.08,
        "isActive": true,
        "isDeleted": false,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      },
      {
        "id": 2,
        "materialNumber": 2,
        "origin": "RANCH",
        "nameEn": "Fresh Milk",
        "nameZh": "鲜奶",
        "totalCost": 9,
        "waterRequired": 4,
        "powerRequired": 0,
        "goldCost": 5,
        "carbonEmission": 0.09,
        "isActive": true,
        "isDeleted": false,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 172,
      "page": 1,
      "limit": 20,
      "totalPages": 9,
      "hasNext": true,
      "hasPrev": false,
      "nextPage": 2,
      "prevPage": null
    },
    "filters": {
      "origin": null,
      "isActive": true,
      "search": null,
      "costRange": null,
      "carbonRange": null
    }
  }
}
```

#### Example Requests

**Get first page with 50 items:**
```
GET /api/admin/raw-materials?page=1&limit=50
```

**Search for materials containing "wood":**
```
GET /api/admin/raw-materials?search=wood&limit=20
```

**Filter by MINE origin and sort by cost:**
```
GET /api/admin/raw-materials?origin=MINE&sort=totalCost&order=desc
```

**Get luxury materials (cost > 1000):**
```
GET /api/admin/raw-materials?minCost=1000&sort=totalCost&order=desc
```

**Get low carbon materials:**
```
GET /api/admin/raw-materials?maxCarbon=0.5&sort=carbonEmission&order=asc
```

### 2. Get Single Material Details
**GET** `/api/admin/raw-materials/:id`

#### Response
```json
{
  "success": true,
  "businessCode": 20000,
  "message": "Material retrieved successfully",
  "data": {
    "id": 1,
    "materialNumber": 1,
    "origin": "RANCH",
    "nameEn": "Eggs",
    "nameZh": "蛋类",
    "totalCost": 8,
    "waterRequired": 3,
    "powerRequired": 0,
    "goldCost": 5,
    "carbonEmission": 0.08,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "lastModifiedBy": "admin123",
    "modificationHistory": [
      {
        "modifiedAt": "2024-01-15T10:30:00Z",
        "modifiedBy": "admin123",
        "changes": {
          "totalCost": { "old": 7, "new": 8 }
        }
      }
    ]
  }
}
```

### 3. Create Raw Material
**POST** `/api/admin/raw-materials`

#### Request Body
```json
{
  "materialNumber": 173,
  "origin": "MINE",
  "nameEn": "Lithium Battery Material",
  "nameZh": "锂电池材料",
  "totalCost": 850,
  "waterRequired": 150,
  "powerRequired": 300,
  "goldCost": 400,
  "carbonEmission": 8.5
}
```

#### Validation Rules
- `materialNumber` must be unique across all active materials
- `nameEn` and `nameZh` are required and cannot be empty
- All resource requirements must be non-negative (>= 0)
- `totalCost` must be positive (> 0)
- `carbonEmission` must be non-negative (>= 0)
- `origin` must be a valid facility type
- `modificationReason` is required for audit trail

#### Response
```json
{
  "success": true,
  "businessCode": 20000,
  "message": "Raw material created successfully",
  "data": {
    "id": 8,
    "code": "RM-ALU-001",
    "nameEn": "Aluminum",
    "nameZh": "铝材"
  }
}
```

### 4. Update Raw Material (Full)
**PUT** `/api/admin/raw-materials/:id`

Allows updating ALL fields of a raw material, including names in both languages.

#### Request Body
```json
{
  "materialNumber": 1,
  "origin": "RANCH",
  "nameEn": "Eggs (Updated)",
  "nameZh": "鸡蛋类",
  "totalCost": 9,
  "waterRequired": 3,
  "powerRequired": 0,
  "goldCost": 6,
  "carbonEmission": 0.09,
  "isActive": true,
  "modificationReason": "Updated names for clarity and corrected pricing"
}
```

#### Updatable Fields
- `materialNumber` - Unique identifier (must not conflict with existing)
- `origin` - Facility type (MINE, QUARRY, FOREST, FARM, RANCH, FISHERY, SHOPS)
- `nameEn` - English name
- `nameZh` - Chinese name  
- `totalCost` - Total production cost
- `waterRequired` - Water resource requirement
- `powerRequired` - Power resource requirement
- `goldCost` - Gold component cost
- `carbonEmission` - Carbon emission value
- `isActive` - Active/inactive status

#### Response
```json
{
  "success": true,
  "businessCode": 20000,
  "message": "Raw material updated successfully",
  "data": {
    "id": 1,
    "materialNumber": 1,
    "nameEn": "Eggs (Updated)",
    "nameZh": "鸡蛋类",
    "previousValues": {
      "nameEn": "Eggs",
      "nameZh": "蛋类",
      "totalCost": 8,
      "goldCost": 5,
      "carbonEmission": 0.08
    },
    "newValues": {
      "nameEn": "Eggs (Updated)",
      "nameZh": "鸡蛋类",
      "totalCost": 9,
      "goldCost": 6,
      "carbonEmission": 0.09
    },
    "modifiedBy": "admin123",
    "modifiedAt": "2024-01-16T14:20:00Z"
  }
}
```

### 5. Partial Update Raw Material
**PATCH** `/api/admin/raw-materials/:id`

Allows updating specific fields without providing all data.

#### Request Body Examples

**Update only cost:**
```json
{
  "totalCost": 10,
  "modificationReason": "Inflation adjustment"
}
```

**Update only names:**
```json
{
  "nameEn": "Premium Eggs",
  "nameZh": "优质鸡蛋",
  "modificationReason": "Brand name update"
}
```

**Update multiple fields:**
```json
{
  "nameEn": "Organic Eggs",
  "totalCost": 12,
  "carbonEmission": 0.07,
  "modificationReason": "Product upgrade to organic"
}
```

#### Response
```json
{
  "success": true,
  "businessCode": 20000,
  "message": "Raw material updated successfully",
  "data": {
    "id": 8,
    "code": "RM-ALU-001",
    "unitCost": 650,
    "minBatchSize": 15
  }
}
```

### 6. Delete Raw Material (Soft Delete)
**DELETE** `/api/admin/raw-materials/:id`

#### Request Body
```json
{
  "reason": "Material no longer available",
  "permanent": false
}
```

#### Response
```json
{
  "success": true,
  "businessCode": 20000,
  "message": "Raw material deleted successfully",
  "data": {
    "id": 8,
    "deleted": true
  }
}
```

### 7. View Modification History
**GET** `/api/admin/raw-materials/audit-log`

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| materialId | number | No | Filter by specific material |
| adminId | string | No | Filter by admin who made changes |
| startDate | string | No | Start date (ISO 8601) |
| endDate | string | No | End date (ISO 8601) |
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 50) |

#### Response
```json
{
  "success": true,
  "businessCode": 20000,
  "message": "Audit log retrieved successfully",
  "data": {
    "logs": [
      {
        "id": 1234,
        "materialId": 1,
        "materialName": "Eggs",
        "action": "UPDATE",
        "changes": {
          "totalCost": { "old": 7, "new": 8 }
        },
        "modifiedBy": "admin123",
        "adminEmail": "admin@example.com",
        "modifiedAt": "2024-01-15T10:30:00Z",
        "reason": "Market price adjustment",
        "ipAddress": "192.168.1.100"
      },
      {
        "id": 1235,
        "materialId": 173,
        "materialName": "Lithium Battery Material",
        "action": "CREATE",
        "changes": null,
        "modifiedBy": "superadmin",
        "adminEmail": "super@example.com",
        "modifiedAt": "2024-01-16T09:00:00Z",
        "reason": "New material added",
        "ipAddress": "192.168.1.101"
      }
    ],
    "pagination": {
      "total": 245,
      "page": 1,
      "limit": 50,
      "totalPages": 5
    }
  }
}
```

---

## User API Endpoints

### 1. Get Available Raw Materials
**GET** `/api/raw-materials`

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 20, max: 100) |
| sort | string | No | Sort field (materialNumber, nameEn, totalCost, carbonEmission) |
| order | string | No | Sort order (asc, desc) (default: asc) |
| origin | string | No | Filter by facility type (MINE, QUARRY, FOREST, FARM, RANCH, FISHERY, SHOPS) |
| search | string | No | Search in material names |
| minCost | number | No | Minimum total cost filter |
| maxCost | number | No | Maximum total cost filter |

#### Response
```json
{
  "success": true,
  "businessCode": 20000,
  "message": "Raw materials retrieved successfully",
  "data": {
    "materials": [
      {
        "id": 1,
        "materialNumber": 1,
        "nameEn": "Eggs",
        "nameZh": "蛋类",
        "origin": "RANCH",
        "totalCost": 8,
        "waterRequired": 3,
        "powerRequired": 0,
        "goldCost": 5,
        "carbonEmission": 0.08
      }
    ],
    "pagination": {
      "total": 172,
      "page": 1,
      "limit": 20,
      "totalPages": 9,
      "currentPage": 1
    }
  }
}
```

### 2. Get Material Details
**GET** `/api/raw-materials/:id`

#### Response
```json
{
  "success": true,
  "businessCode": 20000,
  "message": "Material details retrieved successfully",
  "data": {
    "id": 1,
    "code": "RM-STL-001",
    "nameEn": "Steel",
    "nameZh": "钢材",
    "origin": "MINE",
    "description": "High-strength steel for construction",
    "waterRequired": 100,
    "powerRequired": 200,
    "carbonEmission": 50,
    "spaceRequired": 50,
    "unitCost": 500,
    "minBatchSize": 10,
    "maxBatchSize": 1000,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```


---

## Error Responses

### Validation Error
```json
{
  "success": false,
  "businessCode": 40001,
  "message": "Validation failed",
  "data": {
    "errors": [
      {
        "field": "carbonEmission",
        "message": "Carbon emission must equal space required"
      }
    ]
  }
}
```

### Not Found Error
```json
{
  "success": false,
  "businessCode": 40004,
  "message": "Raw material not found",
  "data": {
    "id": 999
  }
}
```

---

## Performance Optimizations

### Caching Strategy

#### Cache Layers
1. **Application Cache** (In-Memory)
   - Materials list cached for 5 minutes
   - Individual material details cached for 10 minutes
   - Cache invalidated on any CREATE, UPDATE, DELETE operations

2. **HTTP Cache Headers**
   ```
   Cache-Control: private, max-age=300
   ETag: "material-list-v1-[hash]"
   Last-Modified: [timestamp]
   ```

3. **Database Query Optimization**
   - Indexed fields: materialNumber, origin, isActive, isDeleted
   - Query result limiting with pagination
   - Selective field projection for list views

### Response Compression
- Gzip compression for responses > 1KB
- Brotli compression supported for modern clients

### Query Performance

#### Optimized Query Example
```sql
-- List endpoint with filters and pagination
SELECT 
  id, material_number, name_en, name_zh, 
  origin, total_cost, carbon_emission
FROM raw_materials
WHERE is_active = true 
  AND is_deleted = false
  AND ($1::text IS NULL OR origin = $1)
  AND ($2::text IS NULL OR (name_en ILIKE $2 OR name_zh ILIKE $2))
  AND ($3::decimal IS NULL OR total_cost >= $3)
  AND ($4::decimal IS NULL OR total_cost <= $4)
ORDER BY 
  CASE WHEN $5 = 'materialNumber' AND $6 = 'asc' THEN material_number END ASC,
  CASE WHEN $5 = 'materialNumber' AND $6 = 'desc' THEN material_number END DESC,
  CASE WHEN $5 = 'totalCost' AND $6 = 'asc' THEN total_cost END ASC,
  CASE WHEN $5 = 'totalCost' AND $6 = 'desc' THEN total_cost END DESC
LIMIT $7 OFFSET $8;
```

---

## Rate Limiting

### Endpoint Limits
- Admin list endpoints: 100 requests per minute
- Admin modification endpoints: 30 requests per minute
- User read endpoints: 200 requests per minute
- Search endpoints: 60 requests per minute

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642435200
```

---

## Pagination

### Pagination Rules
- Default page size: 20 items
- Maximum page size: 100 items
- Page numbering starts at 1
- Total count included in response
- Next/Previous page links provided

### Cursor-Based Pagination (Alternative)
For large datasets, cursor-based pagination is available:
```
GET /api/raw-materials?cursor=eyJpZCI6MTAwfQ&limit=20
```

---

## Search and Filtering

### Search Capabilities
1. **Text Search**: Searches in nameEn and nameZh fields
2. **Fuzzy Matching**: Supports partial matches
3. **Case Insensitive**: All searches are case-insensitive

### Filter Combinations
Multiple filters can be combined:
```
GET /api/raw-materials?origin=MINE&minCost=100&maxCost=500&search=iron
```

### Sort Options
- `materialNumber`: Sort by material ID
- `nameEn`: Sort alphabetically by English name
- `nameZh`: Sort by Chinese name
- `totalCost`: Sort by cost
- `carbonEmission`: Sort by environmental impact

---

## Localization

### Language Support
All endpoints support language selection:
- Header: `Accept-Language: zh` or `Accept-Language: en`
- Query param: `?lang=zh` or `?lang=en`
- Default: Chinese (zh)

### Localized Fields
- Error messages
- Response messages
- Material descriptions (when available)