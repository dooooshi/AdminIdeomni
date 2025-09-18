# Land Types System

## Overview
The business simulation platform supports 10 different land types, each with unique characteristics affecting gameplay, facility building, and resource management.

## Land Type Definitions

### 1. MARINE (海洋)
- **Population**: 0 (no population on water)
- **Transport Cost**: 8.0 (highest - requires ships)
- **Initial Gold Price**: 50.0
- **Initial Carbon Price**: 0.0
- **Facilities Allowed**: Only Fishery
- **Special**: Cannot be purchased, blocks infrastructure paths unless special crossing allowed

### 2. COASTAL (海岸)
- **Population**: 500 (moderate coastal population)
- **Transport Cost**: 5.0 (moderate - mixed access)
- **Initial Gold Price**: 100.0
- **Initial Carbon Price**: 5.0
- **Facilities Allowed**: Most facilities except mines and quarries
- **Special**: Good for mixed development, access to water resources

### 3. PLAIN (平原)
- **Population**: 1000 (highest base population)
- **Transport Cost**: 3.0 (low - easy terrain)
- **Initial Gold Price**: 150.0
- **Initial Carbon Price**: 50.0
- **Facilities Allowed**: All facilities
- **Special**: Most versatile land type, ideal for development

### 4. GRASSLANDS (草原)
- **Population**: 800 (high population capacity)
- **Transport Cost**: 2.5 (very low - flat terrain)
- **Initial Gold Price**: 120.0
- **Initial Carbon Price**: 40.0
- **Facilities Allowed**: All except fishery
- **Special**: Excellent for agriculture and ranching

### 5. FORESTS (森林)
- **Population**: 300 (low - limited clearing)
- **Transport Cost**: 4.0 (moderate - requires paths)
- **Initial Gold Price**: 80.0
- **Initial Carbon Price**: 20.0
- **Facilities Allowed**: Forest, Farm, Park only
- **Special**: Limited development, good for forestry

### 6. HILLS (丘陵)
- **Population**: 400 (moderate - terraced settlements)
- **Transport Cost**: 4.5 (moderate-high - elevation changes)
- **Initial Gold Price**: 90.0
- **Initial Carbon Price**: 30.0
- **Facilities Allowed**: Mine, Quarry, Factory, Base Station
- **Special**: Good for mining and infrastructure

### 7. MOUNTAINS (山地)
- **Population**: 100 (very low - harsh conditions)
- **Transport Cost**: 6.0 (high - difficult terrain)
- **Initial Gold Price**: 60.0
- **Initial Carbon Price**: 10.0
- **Facilities Allowed**: Mine, Quarry, Base Station only
- **Special**: Limited to resource extraction and communication

### 8. PLATEAUS (高原)
- **Population**: 350 (moderate - flat highlands)
- **Transport Cost**: 3.5 (moderate - elevation but flat)
- **Initial Gold Price**: 85.0
- **Initial Carbon Price**: 25.0
- **Facilities Allowed**: Most except fishery and mine
- **Special**: Good for industry and ranching

### 9. DESERTS (沙漠)
- **Population**: 50 (very low - harsh climate)
- **Transport Cost**: 5.5 (high - difficult conditions)
- **Initial Gold Price**: 40.0
- **Initial Carbon Price**: 8.0
- **Facilities Allowed**: Mine, Power Plant, Base Station only
- **Special**: Very limited development, good for solar power

### 10. WETLANDS (湿地)
- **Population**: 200 (low - limited dry land)
- **Transport Cost**: 5.0 (moderate-high - requires special infrastructure)
- **Initial Gold Price**: 70.0
- **Initial Carbon Price**: 15.0
- **Facilities Allowed**: Fishery, Water Plant, Park, Farm
- **Special**: Water-focused development, ecological value

## Building Cost Multipliers

Each land type has different cost multipliers for construction:

| Land Type | Gold Multiplier | Carbon Multiplier | Area Multiplier |
|-----------|----------------|-------------------|-----------------|
| MARINE | 0.8x | 1.2x | 2.0x |
| COASTAL | 1.0x | 1.0x | 1.0x |
| PLAIN | 1.2x | 0.8x | 1.0x |
| GRASSLANDS | 1.1x | 0.9x | 1.0x |
| FORESTS | 0.9x | 1.0x | 1.5x |
| HILLS | 1.3x | 1.1x | 1.2x |
| MOUNTAINS | 1.5x | 1.3x | 1.5x |
| PLATEAUS | 1.2x | 1.0x | 1.1x |
| DESERTS | 1.4x | 1.2x | 1.3x |
| WETLANDS | 0.9x | 1.1x | 1.4x |

## Infrastructure Path Rules

- **MARINE**: Cannot be crossed unless special marine crossing is allowed
- **MOUNTAINS**: Can be crossed but with higher transportation costs
- **DESERTS**: Can be crossed but with higher transportation costs
- **Other land types**: Normal crossing allowed

## Facility Build Restrictions

### Resource Extraction
- **Mines**: HILLS, MOUNTAINS, DESERTS only
- **Quarries**: HILLS, MOUNTAINS only
- **Forests**: FORESTS, PLAINS only
- **Fisheries**: MARINE, COASTAL, WETLANDS only

### Agriculture
- **Farms**: All except MARINE, MOUNTAINS, DESERTS
- **Ranches**: PLAINS, GRASSLANDS, PLATEAUS only

### Industry
- **Factories**: PLAINS, HILLS, PLATEAUS only
- **Warehouses**: All except MARINE

### Infrastructure
- **Power Plants**: PLAINS, DESERTS only
- **Water Plants**: PLAINS, WETLANDS only
- **Base Stations**: All except MARINE

### Commercial/Service
- **Malls**: PLAINS, COASTAL, GRASSLANDS only
- **Hospitals**: PLAINS, COASTAL only
- **Parks**: All except MARINE, MOUNTAINS, DESERTS

## Migration History

### Version 1.0 (Initial)
- 3 land types: MARINE, COASTAL, PLAIN

### Version 2.0 (2025-09-18)
- Added 7 new land types: GRASSLANDS, FORESTS, HILLS, MOUNTAINS, PLATEAUS, DESERTS, WETLANDS
- Migration: `20250918_add_land_types`
- Added cost multipliers for each land type
- Added facility restrictions per land type
- Updated path validation rules

## API Integration

### Endpoints Supporting Land Types
- `GET /api/map/tiles/land-type/:landType` - Get tiles by land type
- `PUT /api/map/tiles/:id/land-type` - Update tile land type
- `GET /api/admin/map-templates/:templateId/tile-facility-configs/by-land-type/:landType` - Get facility configs by land type

### Query Parameters
All map tile query endpoints support filtering by land type(s):
- `?landType=PLAIN` - Single land type
- `?landTypes=PLAIN,COASTAL,GRASSLANDS` - Multiple land types

## Business Rules

1. **Purchase Restrictions**: Only MARINE tiles cannot be purchased by teams
2. **Population Calculation**: Initial population varies by land type, affecting economic activity
3. **Transportation Costs**: Different land types have different base transportation costs
4. **Facility Placement**: Each land type restricts which facilities can be built
5. **Upgrade Costs**: Building and upgrade costs are modified by land type multipliers

## Development Guidelines

When adding new features involving land types:

1. Always check facility compatibility using `isFacilityAllowedOnLandType()`
2. Apply cost multipliers from `landTypeMultipliers` configuration
3. Consider transportation cost implications for supply chains
4. Validate land type restrictions in both frontend and backend
5. Update seed data and migrations when modifying land type properties

## Testing

Test cases should cover:
- All 10 land types for basic operations
- Facility placement restrictions per land type
- Cost calculations with multipliers
- Path finding across different land types
- Population and economic calculations