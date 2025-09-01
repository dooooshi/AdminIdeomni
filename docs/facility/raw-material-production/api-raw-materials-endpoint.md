# Raw Materials Endpoint Documentation

## Endpoint: `GET /api/facility/raw-materials`

### Overview
Retrieves a list of available raw materials that can be produced by facilities, including their resource requirements and costs.

### Authentication
- **Required**: Yes (JWT Bearer Token)
- **Guard**: `UserJwtAuthGuard`

### Request

#### Headers
```
Authorization: Bearer <token>
Accept-Language: en|zh (optional)
X-Lang: en|zh (optional)
```

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `facilityId` | string | No | - | Filter by specific facility ID |
| `facilityType` | string | No | - | Filter by facility type (FARM, RANCH, FISHERY, MINE, QUARRY, FOREST) |
| `origin` | string | No | - | Filter by material origin |
| `category` | string | No | - | Filter by material category |
| `isActive` | boolean | No | - | Filter by active status |
| `limit` | number | No | 100 | Number of items per page |
| `page` | number | No | 1 | Page number |
| `sortBy` | string | No | materialNumber | Sort field |
| `sortOrder` | string | No | asc | Sort order (asc, desc) |
| `lang` | string | No | zh | Language preference (en, zh) |

### Response

#### Success Response (200 OK)
```json
{
  "success": true,
  "businessCode": 0,
  "message": "Success",
  "data": {
    "materials": [
      {
        "id": 3,
        "materialNumber": "RM00003",
        "name": "Coarse Grains",
        "origin": "FARM",
        "category": "GRAIN",
        "baseCost": 0,
        "goldCost": 1,
        "carbonEmission": 0.03,
        "description": "Basic grain crops suitable for various uses",
        "isActive": true,
        "requirements": {
          "water": 1,
          "power": 1,
          "gold": 1
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 172,
      "itemsPerPage": 100,
      "hasNext": true,
      "hasPrevious": false
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "path": "/api/facility/raw-materials"
}
```

#### Material Object Structure
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Unique material ID |
| `materialNumber` | string | Material code (e.g., "RM00003") |
| `name` | string | Localized material name |
| `origin` | string | Source facility type |
| `category` | string | Material category |
| `baseCost` | number | Base production cost |
| `goldCost` | number | Gold cost per unit |
| `carbonEmission` | number | Carbon emission per unit |
| `description` | string | Localized description |
| `isActive` | boolean | Whether material is active |
| `requirements` | object | Resource requirements per unit |
| `requirements.water` | number | Water units required |
| `requirements.power` | number | Power units required |
| `requirements.gold` | number | Gold cost (same as goldCost) |

### Examples

#### 1. Get all active materials
```bash
curl -X GET "http://localhost:2999/api/facility/raw-materials" \
  -H "Authorization: Bearer <token>"
```

#### 2. Filter by facility type
```bash
curl -X GET "http://localhost:2999/api/facility/raw-materials?facilityType=FARM" \
  -H "Authorization: Bearer <token>"
```

#### 3. Filter by specific facility
```bash
curl -X GET "http://localhost:2999/api/facility/raw-materials?facilityId=facility-123" \
  -H "Authorization: Bearer <token>"
```

#### 4. Paginated request with English language
```bash
curl -X GET "http://localhost:2999/api/facility/raw-materials?page=2&limit=20&lang=en" \
  -H "Authorization: Bearer <token>"
```

#### 5. Sort by gold cost descending
```bash
curl -X GET "http://localhost:2999/api/facility/raw-materials?sortBy=goldCost&sortOrder=desc" \
  -H "Authorization: Bearer <token>"
```

### Filtering Logic

#### Facility Type Mapping
When filtering by `facilityType` or `facilityId`, the system maps facility types to material origins:
- `FARM` → Materials with origin "FARM"
- `RANCH` → Materials with origin "RANCH"
- `FISHERY` → Materials with origin "FISHERY"
- `MINE` → Materials with origin "MINE"
- `QUARRY` → Materials with origin "QUARRY"
- `FOREST` → Materials with origin "FOREST"

### Language Support

The endpoint supports internationalization through multiple methods (in priority order):
1. Query parameter: `?lang=en`
2. Custom header: `X-Lang: en`
3. Standard header: `Accept-Language: en-US`
4. Default: `zh` (Chinese)

Affected fields:
- `name` - Material name
- `description` - Material description

### Error Responses

#### 401 Unauthorized
```json
{
  "success": false,
  "businessCode": 401,
  "message": "Unauthorized",
  "statusCode": 401
}
```

#### 400 Bad Request (Invalid parameters)
```json
{
  "success": false,
  "businessCode": 400,
  "message": "Invalid query parameters",
  "statusCode": 400
}
```

### Implementation Notes

1. **Performance**: Results are paginated by default (100 items) to prevent large data transfers
2. **Caching**: Consider implementing caching for frequently accessed material lists
3. **Resource Requirements**: The `requirements` field provides critical information for production planning
4. **Active Status**: Inactive materials are excluded by default unless explicitly queried

### Use Cases

1. **Material Selection UI**: Display available materials for a facility
2. **Production Planning**: Show resource requirements before production
3. **Cost Analysis**: Compare material costs across different types
4. **Inventory Management**: Filter materials by category for organization

### Related Endpoints

- `POST /api/facility/production/estimate` - Estimate production costs
- `POST /api/facility/production/produce` - Produce raw materials
- `GET /api/facility/production` - View production history