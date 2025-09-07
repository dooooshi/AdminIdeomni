# Transportation System Integration Summary

## Overview
This document summarizes how the transportation system integrates with the existing data models for raw materials, products, facility inventory, and map tiles.

## Critical Integration: Dual Distance System

The transportation system uses TWO different distance measurements:

### 1. Hex Distance (for Tier Selection)
- **Calculation**: Simple hex count between facilities
- **Purpose**: Determines which tier is available (1-3=A, 4-6=B, 7-9=C, >9=D)
- **Field**: Not stored in tiles, calculated from axialQ/axialR coordinates

### 2. Transportation Cost Units (for Fee Calculation)
- **Field**: `MapTile.transportationCostUnit` (Decimal)
- **Purpose**: Represents terrain difficulty/cost (e.g., mountains = 3, plains = 1)
- **Calculation**: Sum of transportationCostUnit values along the optimal path
- **Example**: A 3-hex path might have 7 transport units if tiles have costs [1, 3, 3]

## Key Integration Points

### 1. Space Unit Calculation
The transportation system's pricing is based on **space units**, which are derived from carbon emission values:

#### Raw Materials
- **Source**: `RawMaterial.carbonEmission` field
- **Example**: Iron ore with `carbonEmission = 0.03` means 0.03 space units per item
- **Total Space**: Quantity × carbonEmission

#### Products  
- **Source**: `ProductFormula.productFormulaCarbonEmission` field
- **Example**: A product formula with `productFormulaCarbonEmission = 0.5` means 0.5 space units per product
- **Total Space**: Quantity × productFormulaCarbonEmission

#### Inventory Items
- **Source**: `FacilityInventoryItem.totalSpaceOccupied` field
- **Calculation**: Already calculated as `quantity × unitSpaceOccupied`
- **Direct Use**: The transportation system uses this value directly

### 2. Transportation Cost Formula

```typescript
// Transportation cost is based on space units, not just quantity
Cost = (Space Units) × (Cost per Space Unit) × (Distance in Hexes)

Where:
- Space Units = FacilityInventoryItem.totalSpaceOccupied (for the transfer quantity)
- Cost per Space Unit depends on tier:
  - Tier A: 5 gold per space unit
  - Tier B: 3 gold per space unit (30 gold/10 units)
  - Tier C: 2 gold per space unit (200 gold/100 units)  
  - Tier D: 1 gold per space unit (1000 gold/1000 units)
```

### 3. Data Model Relationships

```
TransportationOrder
    ├── FacilitySpaceInventory (source & destination)
    ├── FacilityInventoryItem (the actual item being transferred)
    ├── RawMaterial or ProductFormula (item details)
    └── Team (sender & receiver)
```

### 4. Transfer Process Flow

1. **Select Item**: User selects a `FacilityInventoryItem` to transfer
2. **Calculate Space**: System uses `item.totalSpaceOccupied` for the transfer quantity
3. **Determine Tier**: Based on distance, only one tier is available
4. **Calculate Cost**: `spaceUnits × tierCostPerSpaceUnit × distance`
5. **Execute Transfer**: 
   - Deduct from source `FacilitySpaceInventory`
   - Add to destination `FacilitySpaceInventory`
   - Update `FacilityInventoryItem` quantities
   - Create `TransportationOrder` record

### 5. API Changes

#### Calculate Cost Endpoint
```json
// Request
{
  "sourceInventoryId": "inv123",        // FacilitySpaceInventory ID
  "destInventoryId": "inv456",          // FacilitySpaceInventory ID
  "inventoryItemId": "item789",         // FacilityInventoryItem ID
  "quantity": "100"                     // Quantity to transfer
}

// Response includes
{
  "itemDetails": {
    "unitSpaceOccupied": "0.03",       // From RawMaterial.carbonEmission
    "totalSpaceOccupied": "3.000"      // For the transfer quantity
  },
  "availableTiers": [{
    "totalSpaceUnits": "3.000",        // Space units for cost calculation
    "costPerSpaceUnit": "5.00",        // Tier pricing
    "totalCost": "45.00"                // 5 × 3 × 3 (cost × space × distance)
  }]
}
```

### 6. Key Principles

1. **Space-Based Pricing**: All costs are calculated based on space occupied (carbon emission units), not simple quantity
2. **Exclusive Tier Assignment**: Each distance range has exactly ONE available tier
3. **Direct Model Integration**: Uses existing `FacilityInventoryItem` records directly
4. **Atomic Transactions**: All inventory updates happen in a single database transaction

### 7. Database Schema Updates

The `TransportationOrder` model now includes:
- `inventoryItemId`: Direct link to the `FacilityInventoryItem` being transferred
- `unitSpaceOccupied`: Cached from the item at transfer time
- `totalSpaceTransferred`: The actual space units used for cost calculation

### 8. Benefits of This Approach

1. **Consistency**: Uses the same space units (carbon emissions) as the facility inventory system
2. **Accuracy**: Costs reflect actual space usage, not arbitrary units
3. **Simplicity**: Direct integration with existing inventory items
4. **Traceability**: Each transfer links to specific inventory items

## Example Scenarios

### Scenario 1: Transfer Raw Material
- **Item**: 100 units of Iron Ore
- **Space per unit**: 0.03 (from `RawMaterial.carbonEmission`)
- **Total space**: 3.0 units
- **Distance**: 3 hexes (Tier A only)
- **Cost**: 5 gold/space × 3 space × 3 hexes = 45 gold

### Scenario 2: Transfer Product
- **Item**: 50 units of Steel Ingots
- **Space per unit**: 0.5 (from `ProductFormula.productFormulaCarbonEmission`)
- **Total space**: 25.0 units
- **Distance**: 8 hexes (Tier C only)
- **Cost**: 2 gold/space × 25 space × 8 hexes = 400 gold

## Implementation Notes

1. Always use `FacilityInventoryItem.totalSpaceOccupied` for space calculations
2. Cache item details in `TransportationOrder` for historical accuracy
3. Validate space availability at destination before transfer
4. Update both source and destination inventory atomically