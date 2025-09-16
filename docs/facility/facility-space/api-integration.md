# Facility Space and Inventory API Integration

## Overview
This document describes the integration between the facility space overview API and the facility inventory items API, demonstrating how to use the `inventoryId` field to access detailed inventory information.

## API Flow

### Step 1: Get Team Facility Overview
First, retrieve the team's facility overview to get a list of all facilities with their inventory IDs.

**Endpoint**: `GET /api/user/facility-space/team/overview`

**Response Structure**:
```json
{
  "data": {
    "facilities": [
      {
        "facilityInstanceId": "facility789",
        "inventoryId": "inv123abc",  // Use this ID to fetch inventory items
        "facilityType": "WAREHOUSE",
        "facilityName": "Central Warehouse",
        // ... other facility details
      }
    ]
  }
}
```

### Step 2: Get Inventory Items for a Facility
Using the `inventoryId` from the overview, retrieve detailed inventory items.

**Endpoint**: `GET /api/transportation/facilities/{inventoryId}/items`

**Example Request**:
```
GET /api/transportation/facilities/inv123abc/items?itemType=RAW_MATERIAL&sortBy=quantity&sortOrder=desc
```

**Response Structure**:
```json
{
  "data": {
    "inventoryId": "inv123abc",
    "facilityInstanceId": "facility789",
    "facilityType": "WAREHOUSE",
    "facilityName": "Central Warehouse Level 3",
    "spaceUtilization": {
      "totalSpace": 5000,
      "usedSpace": 2500,
      "availableSpace": 2500,
      "utilizationRate": 50.0
    },
    "items": [
      {
        "itemId": "item001",
        "itemType": "RAW_MATERIAL",
        "rawMaterialId": "rm123",
        "name": "Steel",
        "quantity": 100,
        "unitSpaceRequired": 3,
        "totalSpaceOccupied": 300,
        "totalValue": 50000,
        "lastUpdated": "2025-09-01T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 10,
      "totalPages": 2
    }
  }
}
```

## Integration Benefits

### 1. Direct Access
The `inventoryId` field in the facility overview response provides direct access to inventory items without needing to:
- Know the internal mapping between facilities and inventories
- Make additional API calls to discover the inventory ID
- Handle complex facility-to-inventory relationships

### 2. Simplified Client Implementation
```typescript
// Example: Get all items from all team facilities
async function getAllTeamInventoryItems() {
  // Step 1: Get facility overview
  const overview = await fetch('/api/user/facility-space/team/overview', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(res => res.json());

  // Step 2: Fetch items for each facility using inventoryId
  const allItems = await Promise.all(
    overview.data.facilities.map(facility => 
      fetch(`/api/transportation/facilities/${facility.inventoryId}/items`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json())
    )
  );

  return allItems;
}
```

### 3. Flexible Querying
With the inventory ID, clients can:
- Filter items by type (RAW_MATERIAL or PRODUCT)
- Search for specific items by name
- Sort by various criteria (quantity, space, value)
- Paginate through large inventories

## Use Cases

### Use Case 1: Space Analysis Dashboard
```typescript
async function buildSpaceAnalysisDashboard() {
  // Get overview with inventory IDs
  const overview = await getTeamFacilityOverview();
  
  // For each facility, get detailed items if utilization > 80%
  const criticalFacilities = overview.data.facilities
    .filter(f => f.spaceMetrics.utilizationRate > 80);
  
  const detailedInventories = await Promise.all(
    criticalFacilities.map(f => 
      getInventoryItems(f.inventoryId, { sortBy: 'totalSpaceOccupied', sortOrder: 'desc' })
    )
  );
  
  // Analyze which items are consuming the most space
  return analyzeSpaceConsumption(detailedInventories);
}
```

### Use Case 2: Inventory Value Report
```typescript
async function generateInventoryValueReport() {
  const overview = await getTeamFacilityOverview();
  
  // Fetch all inventory items
  const inventories = await Promise.all(
    overview.data.facilities.map(f => 
      getInventoryItems(f.inventoryId, { limit: 100 })
    )
  );
  
  // Calculate total values by facility type
  const valueByFacilityType = {};
  inventories.forEach((inv, index) => {
    const facilityType = overview.data.facilities[index].facilityType;
    const totalValue = inv.data.items.reduce((sum, item) => sum + item.totalValue, 0);
    valueByFacilityType[facilityType] = (valueByFacilityType[facilityType] || 0) + totalValue;
  });
  
  return valueByFacilityType;
}
```

### Use Case 3: Raw Material Distribution
```typescript
async function getRawMaterialDistribution() {
  const overview = await getTeamFacilityOverview();
  
  // Get only raw materials from each facility
  const rawMaterials = await Promise.all(
    overview.data.facilities.map(f => 
      getInventoryItems(f.inventoryId, { itemType: 'RAW_MATERIAL' })
    )
  );
  
  // Build distribution map
  const distribution = {};
  rawMaterials.forEach((inv, index) => {
    const facility = overview.data.facilities[index];
    distribution[facility.facilityName] = inv.data.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      space: item.totalSpaceOccupied
    }));
  });
  
  return distribution;
}
```

## Error Handling

### Common Scenarios
```typescript
async function safeGetInventoryItems(inventoryId: string) {
  try {
    const response = await fetch(`/api/transportation/facilities/${inventoryId}/items`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      switch (response.status) {
        case 404:
          console.error(`Inventory ${inventoryId} not found`);
          return { items: [] };
        case 403:
          console.error('Access denied to inventory');
          return { items: [] };
        default:
          throw new Error(`HTTP ${response.status}`);
      }
    }
    
    return response.json();
  } catch (error) {
    console.error('Failed to fetch inventory items:', error);
    return { items: [] };
  }
}
```

## Performance Considerations

### Batch Loading
When loading items for multiple facilities, use parallel requests:
```typescript
// Good: Parallel loading
const items = await Promise.all(
  facilities.map(f => getInventoryItems(f.inventoryId))
);

// Avoid: Sequential loading
const items = [];
for (const facility of facilities) {
  items.push(await getInventoryItems(facility.inventoryId));
}
```

### Caching Strategy
```typescript
class InventoryCache {
  private cache = new Map();
  private ttl = 5 * 60 * 1000; // 5 minutes
  
  async getItems(inventoryId: string, options?: any) {
    const cacheKey = `${inventoryId}-${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.data;
    }
    
    const fresh = await fetchInventoryItems(inventoryId, options);
    this.cache.set(cacheKey, { data: fresh, timestamp: Date.now() });
    return fresh;
  }
}
```

## Summary
The `inventoryId` field creates a seamless integration between facility overview and inventory management APIs, enabling:
- Direct access to inventory items without complex lookups
- Efficient client-side data aggregation
- Flexible querying and filtering capabilities
- Simplified error handling and caching strategies

This design pattern ensures that clients can easily navigate from high-level facility overviews to detailed inventory information with minimal API calls and complexity.