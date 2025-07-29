# Bulk Tile Management API - Admin Guide

## Overview

This document provides comprehensive guidance for administrators to manage map template tiles in bulk, specifically focusing on updating all tiles of a single land type within a map template. This is particularly useful for configuring entire regions of a map with consistent pricing and population parameters.

## 🚀 Key Features

- **Land Type Bulk Updates**: Update all tiles of a specific land type (MARINE, COASTAL, PLAIN) in one operation
- **Dual Pricing Support**: Configure both gold and carbon prices using multipliers or fixed values
- **Flexible Configuration**: Use multipliers for proportional changes or fixed values for absolute configuration
- **Population Management**: Update population settings across all tiles of a land type
- **Transportation Cost Control**: Configure transportation costs for entire regions
- **Atomic Operations**: All updates succeed or fail together ensuring data consistency

---

## 🔧 API Endpoints

### 1. Bulk Update Tiles by Land Type

**Endpoint:** `PUT /api/admin/map-templates/{templateId}/tiles/land-type/{landType}/bulk-update`

**Description:** Updates all tiles of a specific land type within a map template using either multipliers or fixed values.

**Parameters:**
- `templateId` (path): Map template ID 
- `landType` (path): Land type to update (`MARINE`, `COASTAL`, `PLAIN`)

**Request Body:**
```typescript
interface BulkUpdateTilesByLandTypeDto {
  // Multiplier-based updates (proportional changes)
  goldPriceMultiplier?: number;        // e.g., 1.25 = 25% increase
  carbonPriceMultiplier?: number;      // e.g., 0.80 = 20% decrease
  populationMultiplier?: number;       // e.g., 1.50 = 50% increase
  transportationCostMultiplier?: number; // e.g., 0.90 = 10% decrease
  
  // Fixed value updates (absolute values - overrides multipliers)
  fixedGoldPrice?: number;            // e.g., 150.00
  fixedCarbonPrice?: number;          // e.g., 60.00
  fixedPopulation?: number;           // e.g., 1200
  fixedTransportationCost?: number;   // e.g., 6.00
}
```

**Response:**
```typescript
interface MapTileBulkUpdateResponseDto {
  updated: number;                    // Number of tiles successfully updated
  failed: number;                     // Number of tiles that failed to update
  details: Array<{                    // Detailed results per tile
    tileId: number;
    success: boolean;
    error?: string;
  }>;
  message: string;                    // Summary message
}
```

---

## 💡 Usage Examples

### Example 1: Increase All COASTAL Tile Prices by 25%

```bash
curl -X PUT http://localhost:2999/api/admin/map-templates/1/tiles/land-type/COASTAL/bulk-update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "goldPriceMultiplier": 1.25,
    "carbonPriceMultiplier": 1.25,
    "populationMultiplier": 1.10
  }'
```

**Result:** All COASTAL tiles will have their gold and carbon prices increased by 25% and population increased by 10%.

### Example 2: Set Fixed Prices for All MARINE Tiles

```bash
curl -X PUT http://localhost:2999/api/admin/map-templates/1/tiles/land-type/MARINE/bulk-update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "fixedGoldPrice": 50.00,
    "fixedCarbonPrice": 20.00,
    "fixedPopulation": 0,
    "fixedTransportationCost": 8.00
  }'
```

**Result:** All MARINE tiles will be set to exactly 50.00 gold, 20.00 carbon, 0 population, and 8.00 transportation cost.

### Example 3: Economic Adjustment for PLAIN Tiles

```bash
curl -X PUT http://localhost:2999/api/admin/map-templates/1/tiles/land-type/PLAIN/bulk-update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "goldPriceMultiplier": 1.15,
    "carbonPriceMultiplier": 0.95,
    "populationMultiplier": 1.20,
    "transportationCostMultiplier": 0.85
  }'
```

**Result:** PLAIN tiles get 15% higher gold prices, 5% lower carbon prices, 20% more population, and 15% lower transportation costs.

---

## 🎯 Frontend Integration

### React Component Example

```typescript
import React, { useState } from 'react';

interface BulkUpdateFormProps {
  templateId: number;
  landType: 'MARINE' | 'COASTAL' | 'PLAIN';
  onUpdate: (result: any) => void;
}

const BulkUpdateForm: React.FC<BulkUpdateFormProps> = ({ 
  templateId, 
  landType, 
  onUpdate 
}) => {
  const [updateMode, setUpdateMode] = useState<'multiplier' | 'fixed'>('multiplier');
  const [goldValue, setGoldValue] = useState<number>(1.0);
  const [carbonValue, setCarbonValue] = useState<number>(1.0);
  const [populationValue, setPopulationValue] = useState<number>(1.0);
  const [transportValue, setTransportValue] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = updateMode === 'multiplier' 
      ? {
          goldPriceMultiplier: goldValue,
          carbonPriceMultiplier: carbonValue,
          populationMultiplier: populationValue,
          transportationCostMultiplier: transportValue
        }
      : {
          fixedGoldPrice: goldValue,
          fixedCarbonPrice: carbonValue,
          fixedPopulation: populationValue,
          fixedTransportationCost: transportValue
        };

    try {
      const response = await fetch(
        `/api/admin/map-templates/${templateId}/tiles/land-type/${landType}/bulk-update`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify(payload)
        }
      );

      const result = await response.json();
      onUpdate(result);
    } catch (error) {
      console.error('Bulk update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bulk-update-form">
      <h3>Bulk Update {landType} Tiles</h3>
      
      <div className="mode-selector">
        <label>
          <input
            type="radio"
            value="multiplier"
            checked={updateMode === 'multiplier'}
            onChange={(e) => setUpdateMode(e.target.value as 'multiplier')}
          />
          Multiplier Mode (Proportional Changes)
        </label>
        <label>
          <input
            type="radio" 
            value="fixed"
            checked={updateMode === 'fixed'}
            onChange={(e) => setUpdateMode(e.target.value as 'fixed')}
          />
          Fixed Value Mode (Absolute Values)
        </label>
      </div>

      <div className="input-grid">
        <div className="input-group">
          <label>
            Gold {updateMode === 'multiplier' ? 'Multiplier' : 'Price'}:
            <input
              type="number"
              step="0.01"
              value={goldValue}
              onChange={(e) => setGoldValue(parseFloat(e.target.value))}
              min={updateMode === 'multiplier' ? 0.1 : 0}
            />
          </label>
          {updateMode === 'multiplier' && (
            <small>1.0 = no change, 1.25 = 25% increase, 0.8 = 20% decrease</small>
          )}
        </div>

        <div className="input-group">
          <label>
            Carbon {updateMode === 'multiplier' ? 'Multiplier' : 'Price'}:
            <input
              type="number"
              step="0.01"
              value={carbonValue}
              onChange={(e) => setCarbonValue(parseFloat(e.target.value))}
              min={updateMode === 'multiplier' ? 0.1 : 0}
            />
          </label>
        </div>

        <div className="input-group">
          <label>
            Population {updateMode === 'multiplier' ? 'Multiplier' : 'Count'}:
            <input
              type="number"
              step={updateMode === 'multiplier' ? 0.01 : 1}
              value={populationValue}
              onChange={(e) => setPopulationValue(parseFloat(e.target.value))}
              min={0}
            />
          </label>
        </div>

        <div className="input-group">
          <label>
            Transport Cost {updateMode === 'multiplier' ? 'Multiplier' : 'Value'}:
            <input
              type="number"
              step="0.01"
              value={transportValue}
              onChange={(e) => setTransportValue(parseFloat(e.target.value))}
              min={updateMode === 'multiplier' ? 0.1 : 0}
            />
          </label>
        </div>
      </div>

      <button type="submit" disabled={isLoading} className="submit-button">
        {isLoading ? 'Updating...' : `Update All ${landType} Tiles`}
      </button>
    </form>
  );
};

export default BulkUpdateForm;
```

### Results Display Component

```typescript
interface UpdateResultsProps {
  result: {
    updated: number;
    failed: number;
    details: Array<{
      tileId: number;
      success: boolean;
      error?: string;
    }>;
    message: string;
  };
}

const UpdateResults: React.FC<UpdateResultsProps> = ({ result }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className={`update-results ${result.failed > 0 ? 'has-errors' : 'success'}`}>
      <h4>Update Results</h4>
      <div className="summary">
        <span className="success">✅ {result.updated} tiles updated</span>
        {result.failed > 0 && (
          <span className="failed">❌ {result.failed} tiles failed</span>
        )}
      </div>
      <p>{result.message}</p>
      
      {result.details.length > 0 && (
        <div className="details-section">
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="toggle-details"
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
          
          {showDetails && (
            <div className="details-list">
              {result.details.map((detail, index) => (
                <div 
                  key={index} 
                  className={`detail-item ${detail.success ? 'success' : 'error'}`}
                >
                  <span>Tile {detail.tileId}: </span>
                  <span>{detail.success ? 'Success' : `Failed - ${detail.error}`}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

---

## 📊 Use Cases & Scenarios

### 1. **Economic Simulation Setup**
Configure different regions with appropriate economic characteristics:
- **MARINE**: Low gold/carbon prices, zero population, high transport costs
- **COASTAL**: Medium prices, moderate population, medium transport costs  
- **PLAIN**: High prices, high population, low transport costs

### 2. **Market Fluctuation Simulation**
Apply market changes across regions:
```typescript
// Economic boom in coastal areas
{
  goldPriceMultiplier: 1.30,
  carbonPriceMultiplier: 1.25,
  populationMultiplier: 1.15
}

// Resource scarcity in plains
{
  goldPriceMultiplier: 1.50,
  carbonPriceMultiplier: 1.40,
  transportationCostMultiplier: 1.20
}
```

### 3. **Environmental Impact Scenarios**
Model environmental changes:
```typescript
// Climate change affecting marine areas
{
  carbonPriceMultiplier: 2.0,    // Carbon becomes more valuable
  populationMultiplier: 0.8,     // Population decreases
  transportationCostMultiplier: 1.3  // Higher transport costs
}
```

### 4. **Standardization & Reset Operations**
Reset regions to baseline values:
```typescript
// Reset all COASTAL tiles to standard configuration
{
  fixedGoldPrice: 100.0,
  fixedCarbonPrice: 40.0,
  fixedPopulation: 500,
  fixedTransportationCost: 5.0
}
```

---

## ⚡ Performance & Best Practices

### Optimization Tips

1. **Batch Operations**: Use bulk updates instead of individual tile updates when changing multiple tiles
2. **Template Cloning**: For major changes, consider cloning templates and bulk updating the clone  
3. **Validation**: Always validate input values before sending requests
4. **Error Handling**: Check the response for failed tiles and handle them appropriately

### Error Handling

```typescript
const handleBulkUpdate = async (templateId: number, landType: string, config: any) => {
  try {
    const response = await bulkUpdateTiles(templateId, landType, config);
    
    if (response.failed > 0) {
      console.warn(`${response.failed} tiles failed to update:`, 
        response.details.filter(d => !d.success)
      );
      // Handle partial failures
      showPartialSuccessNotification(response);
    } else {
      // All updates successful
      showSuccessNotification(`All ${response.updated} tiles updated successfully`);
    }
    
    return response;
  } catch (error) {
    console.error('Bulk update failed:', error);
    showErrorNotification('Failed to update tiles. Please try again.');
    throw error;
  }
};
```

### Validation Rules

```typescript
const validateBulkUpdateInput = (data: BulkUpdateTilesByLandTypeDto): string[] => {
  const errors: string[] = [];
  
  // Multiplier validation
  if (data.goldPriceMultiplier !== undefined && data.goldPriceMultiplier < 0.1) {
    errors.push('Gold price multiplier must be at least 0.1');
  }
  
  if (data.carbonPriceMultiplier !== undefined && data.carbonPriceMultiplier < 0.1) {
    errors.push('Carbon price multiplier must be at least 0.1');
  }
  
  if (data.populationMultiplier !== undefined && data.populationMultiplier < 0) {
    errors.push('Population multiplier cannot be negative');
  }
  
  // Fixed value validation
  if (data.fixedGoldPrice !== undefined && data.fixedGoldPrice < 0) {
    errors.push('Fixed gold price cannot be negative');
  }
  
  if (data.fixedCarbonPrice !== undefined && data.fixedCarbonPrice < 0) {
    errors.push('Fixed carbon price cannot be negative');
  }
  
  if (data.fixedPopulation !== undefined && data.fixedPopulation < 0) {
    errors.push('Fixed population cannot be negative');
  }
  
  return errors;
};
```

---

## 🧪 Testing Examples

### Test Scenarios

```bash
# Test 1: Validate multiplier functionality
curl -X PUT http://localhost:2999/api/admin/map-templates/1/tiles/land-type/COASTAL/bulk-update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"goldPriceMultiplier": 1.5}'

# Test 2: Validate fixed value functionality  
curl -X PUT http://localhost:2999/api/admin/map-templates/1/tiles/land-type/MARINE/bulk-update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"fixedGoldPrice": 75.0, "fixedCarbonPrice": 25.0}'

# Test 3: Validate mixed updates
curl -X PUT http://localhost:2999/api/admin/map-templates/1/tiles/land-type/PLAIN/bulk-update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "goldPriceMultiplier": 1.2, 
    "fixedCarbonPrice": 50.0,
    "populationMultiplier": 1.1
  }'

# Test 4: Edge case - zero values
curl -X PUT http://localhost:2999/api/admin/map-templates/1/tiles/land-type/MARINE/bulk-update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"fixedPopulation": 0, "fixedGoldPrice": 0, "fixedCarbonPrice": 0}'
```

### Expected Response Format

```json
{
  "updated": 15,
  "failed": 0,
  "details": [
    {"tileId": 1, "success": true},
    {"tileId": 3, "success": true},
    {"tileId": 7, "success": true}
  ],
  "message": "COASTAL tiles updated: 15 updated, 0 failed"
}
```

---

## 🔧 Additional Admin Features

### Reset to Defaults

**Endpoint:** `PUT /api/admin/map-templates/{templateId}/tiles/reset-defaults`

Resets all tiles in a template to their default land-type-specific configurations:

```bash
curl -X PUT http://localhost:2999/api/admin/map-templates/1/tiles/reset-defaults \
  -H "Authorization: Bearer <token>"
```

This will reset:
- **MARINE**: Gold 0.0, Carbon 0.0, Population 0, Transport 8.0
- **COASTAL**: Gold 0.0, Carbon 0.0, Population 500, Transport 5.0  
- **PLAIN**: Gold 0.0, Carbon 0.0, Population 1000, Transport 3.0

---

## 📈 Analytics & Monitoring

### Tracking Bulk Updates

Monitor the effectiveness of bulk updates through analytics:

```typescript
interface BulkUpdateAnalytics {
  templateId: number;
  landType: string;
  updateType: 'multiplier' | 'fixed' | 'mixed';
  tilesAffected: number;
  successRate: number;
  averageImpact: {
    goldPriceChange: number;
    carbonPriceChange: number;
    populationChange: number;
  };
  timestamp: Date;
}
```

### Usage Metrics

Track how administrators use bulk updates to optimize the interface:

- Most commonly updated land types
- Preferred update methods (multiplier vs fixed)
- Average batch sizes
- Success rates by template size
- Time-to-complete by operation type

---

## 🔗 Related APIs

- **Individual Tile Update**: `PUT /api/admin/map-templates/{templateId}/tiles/{tileId}/config`
- **Bulk Tile Updates**: `PUT /api/admin/map-templates/{templateId}/tiles/bulk-update`
- **Template Management**: `GET|POST|PUT|DELETE /api/admin/map-templates/{templateId}`
- **Activity Tile States**: `PUT /api/admin/tile-states/bulk-configure`

---

## 📞 Support & Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure the admin has `MAP_TEMPLATE_UPDATE` permission
2. **Template Not Found**: Verify the template ID exists and is not deleted
3. **Invalid Land Type**: Use only `MARINE`, `COASTAL`, or `PLAIN`
4. **Validation Errors**: Check that multipliers are ≥ 0.1 and fixed values are ≥ 0

### Debug Mode

Enable detailed logging for bulk operations:

```typescript
const debugBulkUpdate = async (templateId: number, landType: string, config: any) => {
  console.log('Starting bulk update:', { templateId, landType, config });
  
  const result = await bulkUpdateTiles(templateId, landType, config);
  
  console.log('Bulk update completed:', result);
  console.log('Failed tiles:', result.details.filter(d => !d.success));
  
  return result;
};
```

---

**Last Updated:** July 29, 2025  
**Version:** 1.0.0 - Bulk Tile Management API