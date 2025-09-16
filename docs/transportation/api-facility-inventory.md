# Facility Inventory Items API

## Endpoint: Get Facility Inventory Items

### Description
Retrieves detailed information about all inventory items stored in a specific facility. This endpoint provides comprehensive data about raw materials and products, including quantities, space usage, values, and metadata.

### Endpoint
```
GET /api/transportation/facilities/:inventoryId/items
```

### Authentication
- Requires JWT Bearer token
- User must be a member of an active team
- User can only view inventory from their own team's facilities or public facilities

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| inventoryId | string | Yes | The facility space inventory ID |

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| itemType | string | No | Filter by item type: 'RAW_MATERIAL' or 'PRODUCT' |
| sortBy | string | No | Sort field: 'quantity', 'totalValue', 'receivedDate', 'spaceOccupied' |
| sortOrder | string | No | Sort order: 'asc' or 'desc' (default: 'desc') |
| includeExpired | boolean | No | Include expired items (default: false) |
| search | string | No | Search items by name |

### Response Structure

#### Success Response (200 OK)
```json
{
  "success": true,
  "businessCode": 200,
  "message": "Facility inventory items retrieved successfully",
  "data": {
    "facility": {
      "inventoryId": "inv-001",
      "facilityId": "fac-001",
      "facilityType": "WAREHOUSE",
      "level": 3,
      "teamId": "team-001",
      "teamName": "Alpha Team",
      "location": {
        "axialQ": 10,
        "axialR": 5
      }
    },
    "spaceUtilization": {
      "totalSpace": "1000.000",
      "usedSpace": "750.500",
      "availableSpace": "249.500",
      "utilizationPercentage": 75.05,
      "rawMaterialSpace": "500.000",
      "productSpace": "250.500"
    },
    "inventory": {
      "totalItems": 15,
      "rawMaterials": {
        "count": 10,
        "items": [
          {
            "id": "item-001",
            "materialId": 5,
            "materialNumber": 105,
            "name": "Steel Ingot",
            "nameZh": "钢锭",
            "origin": "MINE",
            "quantity": "100.000",
            "unitSpaceOccupied": "2.500",
            "totalSpaceOccupied": "250.000",
            "unitCost": "50.00",
            "totalValue": "5000.00",
            "receivedDate": "2025-01-15T10:30:00Z",
            "expiryDate": null,
            "daysInStorage": 5,
            "metadata": {
              "quality": "high",
              "supplier": "Northern Mines"
            }
          }
          // ... more raw materials
        ]
      },
      "products": {
        "count": 5,
        "items": [
          {
            "id": "item-002",
            "formulaId": 12,
            "formulaNumber": 1012,
            "productName": "Advanced Circuit Board",
            "productDescription": "High-performance electronic component",
            "quantity": "50.000",
            "unitSpaceOccupied": "1.200",
            "totalSpaceOccupied": "60.000",
            "unitCost": "150.00",
            "totalValue": "7500.00",
            "receivedDate": "2025-01-18T14:20:00Z",
            "expiryDate": "2025-02-18T14:20:00Z",
            "daysUntilExpiry": 30,
            "daysInStorage": 2,
            "carbonEmission": "25.500",
            "metadata": {
              "batchNumber": "B2025-018",
              "qualityGrade": "A"
            }
          }
          // ... more products
        ]
      }
    },
    "summary": {
      "totalValue": "45000.00",
      "totalCarbonFootprint": "850.00",
      "averageStorageDays": 7.5,
      "expiringItemsCount": 2,
      "lowStockItemsCount": 3
    }
  }
}
```

#### Error Responses

##### 400 Bad Request
```json
{
  "success": false,
  "businessCode": 3001,
  "message": "Invalid inventory ID format"
}
```

##### 403 Forbidden
```json
{
  "success": false,
  "businessCode": 4003,
  "message": "You don't have permission to view this facility's inventory"
}
```

##### 404 Not Found
```json
{
  "success": false,
  "businessCode": 4004,
  "message": "Facility inventory not found"
}
```

### Implementation Notes

1. **Permission Checking**: 
   - Users can only view inventory from facilities owned by their team
   - Cross-team viewing may be allowed for public/market facilities

2. **Space Calculation**:
   - All space values are in carbon emission units
   - Total space occupied = sum of all items' totalSpaceOccupied

3. **Value Calculation**:
   - Total value = sum of (quantity × unitCost) for all items

4. **Expiry Handling**:
   - Products may have expiry dates
   - Raw materials typically don't expire
   - Alert on items expiring within 7 days

5. **Performance Optimization**:
   - Use database indexes on inventoryId
   - Implement pagination for large inventories (>100 items)
   - Cache frequently accessed inventory data

### Example Usage

#### Request
```bash
curl -X GET "http://localhost:2999/api/transportation/facilities/inv-001/items?itemType=RAW_MATERIAL&sortBy=quantity&sortOrder=desc" \
  -H "Authorization: Bearer <token>"
```

#### Response
Returns filtered and sorted inventory items for the specified facility.

### Related Endpoints
- `GET /api/transportation/facilities/space-status` - Get space status for all team facilities
- `POST /api/transportation/transfer` - Transfer items between facilities
- `POST /api/transportation/calculate` - Calculate transfer costs