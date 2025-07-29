# Gold & Carbon Pricing System - Frontend Integration Guide

## Overview

The map template configuration system has been updated from a single price field to a dual pricing system supporting both **Gold** and **Carbon** prices. This document provides comprehensive guidance for frontend developers to integrate with the new API structure.

## 🚨 Breaking Changes Summary

### Database Fields Changed
| Old Field | New Fields |
|-----------|------------|
| `initialPrice` | `initialGoldPrice` + `initialCarbonPrice` |
| `currentPrice` | `currentGoldPrice` + `currentCarbonPrice` |

### API Endpoints Affected
All endpoints dealing with map tiles and activity tile states have been updated to support the new dual pricing structure.

---

## 📊 New Data Structure

### Map Tile Configuration
```typescript
interface MapTile {
  id: number;
  axialQ: number;
  axialR: number;
  landType: 'MARINE' | 'COASTAL' | 'PLAIN';
  
  // NEW: Dual pricing system
  initialGoldPrice?: number;    // Replaces initialPrice
  initialCarbonPrice?: number;  // New field
  
  initialPopulation?: number;
  transportationCostUnit?: number;
  templateId: number;
  // ... other fields
}
```

### Activity Tile State
```typescript
interface ActivityTileState {
  id: number;
  activityId: string;
  tileId: number;
  
  // NEW: Dual pricing system  
  currentGoldPrice?: number;    // Replaces currentPrice
  currentCarbonPrice?: number;  // New field
  
  currentPopulation?: number;
  lastUpdated: Date;
  updatedBy?: string;
  changeReason?: string;
  // ... other fields
}
```

---

## 🎯 Default Pricing by Land Type

The system now provides consistent default pricing across all land types:

```typescript
const DEFAULT_PRICING = {
  MARINE: {
    gold: 0.0,
    carbon: 0.0,
    population: 0
  },
  COASTAL: {
    gold: 0.0,
    carbon: 0.0, 
    population: 500
  },
  PLAIN: {
    gold: 0.0,
    carbon: 0.0,
    population: 1000
  }
};
```

**Note:** All tiles now start with zero pricing for both gold and carbon resources. Prices can be set through admin interfaces or bulk operations as needed for specific simulation scenarios.

---

## 🔌 API Integration

### 1. Creating Map Tiles

**Endpoint:** `POST /api/admin/map-templates/:templateId/tiles`

```typescript
// OLD Request
{
  "axialQ": 0,
  "axialR": 0,
  "landType": "COASTAL",
  "initialPrice": 100.50,
  "initialPopulation": 500
}

// NEW Request
{
  "axialQ": 0,
  "axialR": 0,
  "landType": "COASTAL",
  "initialGoldPrice": 100.50,      // New field
  "initialCarbonPrice": 40.20,     // New field
  "initialPopulation": 500
}
```

### 2. Updating Map Tiles

**Endpoint:** `PUT /api/admin/map-templates/:templateId/tiles/:tileId`

```typescript
// NEW Request Body
{
  "landType": "PLAIN",
  "initialGoldPrice": 150.00,
  "initialCarbonPrice": 60.00,
  "initialPopulation": 1000
}
```

### 3. Bulk Tile Updates

**Endpoint:** `PUT /api/admin/map-templates/:templateId/tiles/bulk`

```typescript
{
  "tiles": [
    {
      "tileId": 1,
      "initialGoldPrice": 120.00,
      "initialCarbonPrice": 48.00,
      "initialPopulation": 750
    }
    // ... more tiles
  ]
}
```

### 4. Land Type Bulk Updates

**Endpoint:** `PUT /api/admin/map-templates/:templateId/tiles/land-type/:landType/bulk-update`

```typescript
// NEW Request Body
{
  "goldPriceMultiplier": 1.25,      // Replaces priceMultiplier
  "carbonPriceMultiplier": 1.15,    // New field
  "populationMultiplier": 1.50,
  "transportationCostMultiplier": 0.90,
  "fixedGoldPrice": 150.00,         // Replaces fixedPrice
  "fixedCarbonPrice": 60.00,        // New field
  "fixedPopulation": 1200,
  "fixedTransportationCost": 6.00
}
```

**📘 For comprehensive bulk management documentation, see:** [Bulk Tile Management API Guide](./bulk-tile-management.md)

### 5. Activity Tile State Management

**Endpoint:** `POST /api/admin/tile-states/configure`

```typescript
// NEW Request Body
{
  "activityId": "clx1a2b3c4d5e6f7g8h9i0j1",
  "tileId": 1,
  "currentGoldPrice": 125.50,       // Replaces currentPrice
  "currentCarbonPrice": 50.20,      // New field
  "currentPopulation": 1500,
  "changeReason": "Market adjustment"
}
```

### 6. Bulk Activity Tile State Updates

**Endpoint:** `POST /api/admin/tile-states/bulk-configure`

```typescript
{
  "activityId": "clx1a2b3c4d5e6f7g8h9i0j1",
  "configurations": [
    {
      "tileId": 1,
      "currentGoldPrice": 130.00,
      "currentCarbonPrice": 52.00,
      "currentPopulation": 1600,
      "changeReason": "Economic growth"
    }
    // ... more configurations
  ],
  "globalReason": "Q3 market adjustment"
}
```

### 7. Filtering & Search

**Endpoint:** `GET /api/admin/tile-states/search`

```typescript
// NEW Query Parameters
{
  activityId?: string;
  
  // NEW: Separate gold and carbon price filters
  minCurrentGoldPrice?: number;     // Replaces minCurrentPrice
  maxCurrentGoldPrice?: number;     // Replaces maxCurrentPrice
  minCurrentCarbonPrice?: number;   // New field
  maxCurrentCarbonPrice?: number;   // New field
  
  minCurrentPopulation?: number;
  maxCurrentPopulation?: number;
  
  // NEW: Updated sort options
  sortBy?: 'lastUpdated' | 'currentGoldPrice' | 'currentCarbonPrice' | 'currentPopulation' | 'tileId';
  
  page?: number;
  pageSize?: number;
}
```

---

## 📈 Analytics & Reporting

### Analytics Response Structure

```typescript
interface TileAnalytics {
  activitySummary: {
    activityId: string;
    activityName: string;
    totalTiles: number;
    averagePrice: number;        // Now based on gold price
    averagePopulation: number;
    totalValue: number;          // Gold + Carbon + Population value
  };
  
  landTypeBreakdown: {
    [landType]: {
      count: number;
      averagePrice: number;      // Gold price average
      averagePopulation: number;
      totalValue: number;        // Combined value
      priceRange: { min: number; max: number; };
      populationRange: { min: number; max: number; };
    };
  };
  
  // NEW: Enhanced top tiles with dual pricing
  topTiles: Array<{
    tileId: number;
    currentGoldPrice: number;     // Replaces currentPrice
    currentCarbonPrice: number;   // New field
    currentPopulation: number;
    totalValue: number;           // Gold + Carbon + Population
    landType: string;
    coordinates: { q: number; r: number; };
  }>;
}
```

---

## 🎨 Frontend Display Recommendations

### 1. Tile Display Cards
```typescript
// Recommended display format
function TileCard({ tile }: { tile: MapTile }) {
  return (
    <div className="tile-card">
      <h3>Tile ({tile.axialQ}, {tile.axialR})</h3>
      <div className="pricing">
        <div className="gold-price">
          <span className="label">Gold:</span>
          <span className="value">${tile.initialGoldPrice || 0}</span>
        </div>
        <div className="carbon-price">
          <span className="label">Carbon:</span>
          <span className="value">${tile.initialCarbonPrice || 0}</span>
        </div>
        <div className="total-value">
          <span className="label">Total:</span>
          <span className="value">${(tile.initialGoldPrice || 0) + (tile.initialCarbonPrice || 0)}</span>
        </div>
      </div>
      <div className="population">Population: {tile.initialPopulation || 0}</div>
    </div>
  );
}
```

### 2. Price Input Forms
```typescript
function PriceInputForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [goldPrice, setGoldPrice] = useState<number>(0);
  const [carbonPrice, setCarbonPrice] = useState<number>(0);
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit({
        initialGoldPrice: goldPrice,
        initialCarbonPrice: carbonPrice
      });
    }}>
      <div className="price-inputs">
        <label>
          Gold Price:
          <input 
            type="number" 
            step="0.01"
            value={goldPrice}
            onChange={(e) => setGoldPrice(parseFloat(e.target.value))}
          />
        </label>
        <label>
          Carbon Price:
          <input 
            type="number" 
            step="0.01" 
            value={carbonPrice}
            onChange={(e) => setCarbonPrice(parseFloat(e.target.value))}
          />
        </label>
        <div className="total-display">
          Total Value: ${goldPrice + carbonPrice}
        </div>
      </div>
      <button type="submit">Update Prices</button>
    </form>
  );
}
```

### 3. Filter Components
```typescript
function PriceFilters({ onFilterChange }: { onFilterChange: (filters: any) => void }) {
  return (
    <div className="price-filters">
      <div className="gold-filters">
        <h4>Gold Price Range</h4>
        <input 
          type="number" 
          placeholder="Min Gold Price"
          onChange={(e) => onFilterChange({ minCurrentGoldPrice: parseFloat(e.target.value) })}
        />
        <input 
          type="number" 
          placeholder="Max Gold Price"
          onChange={(e) => onFilterChange({ maxCurrentGoldPrice: parseFloat(e.target.value) })}
        />
      </div>
      
      <div className="carbon-filters">
        <h4>Carbon Price Range</h4>
        <input 
          type="number" 
          placeholder="Min Carbon Price"
          onChange={(e) => onFilterChange({ minCurrentCarbonPrice: parseFloat(e.target.value) })}
        />
        <input 
          type="number" 
          placeholder="Max Carbon Price"
          onChange={(e) => onFilterChange({ maxCurrentCarbonPrice: parseFloat(e.target.value) })}
        />
      </div>
    </div>
  );
}
```

---

## 🔄 Migration Strategy

### 1. Gradual Migration Approach
- **Phase 1:** Update API calls to use new field names
- **Phase 2:** Implement dual price display in UI
- **Phase 3:** Add carbon-specific functionality
- **Phase 4:** Remove old price field references

### 2. Backward Compatibility Notes
- Existing data has been migrated (`initialPrice` → `initialGoldPrice`, `currentPrice` → `currentGoldPrice`)
- Carbon prices are initially `null` and can be populated through admin interfaces
- All existing functionality continues to work with gold prices

### 3. Error Handling
```typescript
// Handle missing price data gracefully
function getTotalValue(tile: MapTile): number {
  const goldPrice = tile.initialGoldPrice || 0;
  const carbonPrice = tile.initialCarbonPrice || 0;
  return goldPrice + carbonPrice;
}

// Validate price inputs
function validatePriceInput(goldPrice?: number, carbonPrice?: number): boolean {
  if (goldPrice !== undefined && goldPrice < 0) return false;
  if (carbonPrice !== undefined && carbonPrice < 0) return false;
  return true;
}
```

---

## 🧪 Testing Checklist

### Frontend Testing Checklist
- [ ] Tile creation with dual pricing works correctly
- [ ] Tile updates handle both gold and carbon prices
- [ ] Bulk operations process all price fields
- [ ] Filtering works with separate gold/carbon ranges
- [ ] Analytics display shows combined values correctly
- [ ] Forms validate price inputs properly
- [ ] Error handling works for missing price data
- [ ] Migration from old single price displays works
- [ ] Mobile responsive design accommodates dual pricing
- [ ] Accessibility features work with new price structure

### API Testing Examples
```bash
# Test tile creation
curl -X POST http://localhost:2999/api/admin/map-templates/1/tiles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "axialQ": 0,
    "axialR": 0,
    "landType": "COASTAL",
    "initialGoldPrice": 100.50,
    "initialCarbonPrice": 40.20,
    "initialPopulation": 500
  }'

# Test filtering with dual prices
curl -X GET "http://localhost:2999/api/admin/tile-states/search?minCurrentGoldPrice=50&maxCurrentCarbonPrice=100" \
  -H "Authorization: Bearer <token>"
```

---

## 📋 Migration Action Items

### Immediate Actions Required
1. **Update API Integration:** Replace all `initialPrice`/`currentPrice` references with gold/carbon equivalents
2. **Update UI Components:** Modify tile display components to show dual pricing
3. **Update Forms:** Add carbon price inputs to all tile management forms
4. **Update Filters:** Implement separate gold and carbon price filtering
5. **Update Analytics:** Display combined value calculations in dashboards

### Future Enhancements
1. **Carbon Trading Features:** Implement carbon-specific trading functionality
2. **Price History Tracking:** Add historical price tracking for both gold and carbon
3. **Market Simulation:** Implement market dynamics affecting gold vs carbon prices differently
4. **Environmental Impact:** Add environmental impact metrics based on carbon pricing

---

## 🚀 Advanced Bulk Management

For administrators who need to efficiently manage large numbers of tiles, we provide comprehensive bulk management capabilities:

### **Land Type Bulk Operations**
- Update all tiles of a single land type (MARINE, COASTAL, PLAIN) within a template
- Use multipliers for proportional changes or fixed values for absolute configuration
- Support for both dual pricing and population management
- Atomic operations ensuring data consistency

### **Reset to Defaults**
- Reset all tiles in a template to their default land-type-specific configurations
- Useful for standardizing templates or starting fresh configurations

### **Comprehensive Documentation**
For detailed implementation guides, React components, testing examples, and advanced use cases, see:

**📘 [Bulk Tile Management API Guide](./bulk-tile-management.md)**

This dedicated guide includes:
- Complete API documentation with examples
- Ready-to-use React components
- Performance optimization tips
- Error handling strategies
- Testing scenarios and validation rules
- Analytics and monitoring recommendations

---

## 🔗 Related Documentation
- [API Reference](/docs/api) - Complete API documentation
- [Database Schema](/docs/database) - Updated schema documentation  
- [Business Logic](/docs/business-logic) - Dual pricing business rules
- [Bulk Tile Management](./bulk-tile-management.md) - Comprehensive bulk operations guide

## 📞 Support
For questions regarding this migration, please contact the backend development team or create an issue in the project repository.

---

**Last Updated:** July 29, 2025  
**Version:** 2.0.0 - Gold & Carbon Pricing System