# Raw Material List Business Rules

## Overview
This document defines the business rules and constraints for the raw material list module. All rules are designed for the business simulation educational environment targeting students aged 15-22.

## Material Origins

### Facility-Based Categories
Based on the CSV data, raw materials are categorized into 7 origin facility types with the following distribution:

1. **RANCH** (养殖场) - 20 materials
   - Examples: Eggs, Fresh Milk, Honey, Livestock Leather, Silk
   - Characteristics: Wide cost range (8-280), varied resource requirements
   - Carbon range: 0.08-2.8 (low to moderate)

2. **FARM** (农场) - 20 materials
   - Examples: Sweet Potato, Wheat, Rice, Cotton, Tea Leaves, Ginseng
   - Characteristics: Generally low cost except luxury items (Ginseng: 1687)
   - Carbon range: 0.02-16.87 (mostly low)

3. **FOREST** (林场) - 20 materials
   - Examples: Various wood types, Bamboo, Rubber, Sandalwood
   - Characteristics: Wood materials with increasing value for rare types
   - Carbon range: 0.03-3.8 (low to moderate)

4. **FISHERY** (渔场) - 20 materials
   - Examples: Seaweed, Various fish, Seafood, Sea Cucumber
   - Characteristics: Marine products from basic to luxury
   - Carbon range: 0.02-5.56 (low to moderate)

5. **MINE** (矿场) - 20 materials
   - Examples: Iron, Copper, Silver, Platinum, Rare Earth Minerals
   - Characteristics: Metals and minerals, moderate to high value
   - Carbon range: 0.03-1.2 (low to moderate)

6. **QUARRY** (采石场) - 20 materials
   - Examples: Sand, Lime, Marble, Crystal, Diamond
   - Characteristics: Stone and mineral products, extreme value range (1-3555)
   - Carbon range: 0.01-35.55 (low to very high for precious stones)

7. **SHOPS** (商店) - 52 materials
   - Examples: Chemicals, Synthetic materials, Luxury goods, Gold
   - Characteristics: Largest category, includes both synthetic and luxury items
   - Carbon range: 0.02-46.65 (varies widely)

## Core Business Rules

### 1. Cost Structure
**Based on CSV Data**: Each material has distinct cost components

```typescript
interface MaterialCostStructure {
  totalCost: number;         // Total production cost (from CSV column 3)
  waterRequired: number;     // Water resource units (from CSV column 5)
  powerRequired: number;     // Power resource units (from CSV column 6)
  goldCost: number;         // Gold component cost (from CSV column 7)
  carbonEmission: number;   // Carbon emission index (from CSV column 8)
}

// Cost validation
function validateCostStructure(material: RawMaterial): boolean {
  // Total cost should generally be >= sum of resource costs
  // Note: Gold cost can sometimes equal or exceed total cost
  return material.totalCost > 0 && 
         material.carbonEmission >= 0;
}
```

### 2. Resource Requirements
Based on the CSV data, materials have varied resource requirements:

```typescript
interface ResourceRequirements {
  waterRequired: number;     // Range: 0-723 units
  powerRequired: number;     // Range: 0-592 units
  goldCost: number;         // Range: 0-4665 units
}

// Resource patterns by origin:
// - RANCH: Moderate water (3-112), low power (0-19)
// - FARM: Low water (1-723), minimal power (0-6) - Ginseng is outlier
// - FOREST: Low water (1-127), low power (0-63)
// - FISHERY: Low to moderate water (1-159), varied power (1-159)
// - MINE: Low water (1-40), moderate power (1-60)
// - QUARRY: Minimal water (0-593), varied power (1-592)
// - SHOPS: No water/power for chemicals, all cost is gold
```

### 3. Material Value Classification
```typescript
interface ValueTiers {
  basic: number[];          // Cost 1-20
  standard: number[];       // Cost 21-100
  premium: number[];        // Cost 101-500
  luxury: number[];         // Cost 501-2000
  ultraluxury: number[];    // Cost 2000+
}

// Examples from CSV:
// Basic: Sweet Potato (2), Iron (3), Salt (5)
// Standard: Eggs (8), Cotton (34), Copper (24)
// Premium: Silk (280), Crystal (404)
// Luxury: Ginseng (1687), Sea Cucumber (556)
// Ultra-luxury: Diamond (3555), Gold (4665)
```

## Material Constraints

### 1. Material Numbering System
```typescript
interface MaterialIdentification {
  materialNumber: number;    // Unique ID from 1-172
  nameEn: string;           // English name
  nameZh: string;           // Chinese name
  origin: string;           // Facility type
}

// Material number ranges by origin:
// 1-20: RANCH
// 21-40: FARM
// 41-60: FOREST
// 61-80: FISHERY
// 81-100: MINE
// 101-120: QUARRY
// 121-172: SHOPS
```

### 2. Facility Type Mapping
```typescript
function getMaterialOriginFacility(material: RawMaterial): FacilityType {
  // Material origin directly corresponds to facility type
  return material.origin as FacilityType;
}
```

## Special Material Categories

### 1. Luxury Materials (Cost > 1000)
```typescript
// From CSV data:
const luxuryMaterials = [
  { id: 40, name: 'Ginseng', cost: 1687 },
  { id: 120, name: 'Diamond', cost: 3555 },
  { id: 157, name: 'Meteoric Iron', cost: 1081 },
  { id: 163, name: 'Cordyceps', cost: 1809 },
  { id: 172, name: 'Gold', cost: 4665 }
  // And others...
];
```

### 2. Zero-Resource Materials
```typescript
// SHOPS chemicals with no water/power requirements:
const zeroResourceMaterials = [
  'Sodium Hydroxide',
  'Ammonia Solution',
  'Chlorine Gas',
  // All chemical materials use only gold cost
];
```

## Environmental Impact

### 1. Carbon Emission Analysis
```typescript
interface CarbonProfile {
  // Based on actual CSV data (values in decimal, multiply by 100 for units)
  ultraLow: number;      // < 0.1 (10 units)
  low: number;          // 0.1-1.0 (10-100 units)
  moderate: number;     // 1.0-10.0 (100-1000 units)
  high: number;         // 10.0-50.0 (1000-5000 units)
}

// Actual ranges from CSV:
// Lowest: Natural Soda Ash (0.01)
// Highest: Gold (46.65)
// Most materials: 0.02-2.0 range
```

### 2. Sustainability Classification
```typescript
function getMaterialSustainability(material: RawMaterial): string {
  const carbonUnits = material.carbonEmission * 100;
  if (carbonUnits <= 10) return 'ULTRA_SUSTAINABLE';
  if (carbonUnits <= 100) return 'SUSTAINABLE';
  if (carbonUnits <= 500) return 'MODERATE';
  if (carbonUnits <= 2000) return 'HIGH_IMPACT';
  return 'EXTREME_IMPACT'; // Diamond, Gold, etc.
}
```

## Economic Patterns

### 1. Cost-Carbon Relationship
```typescript
interface EconomicAnalysis {
  costEfficiency: number;    // Total cost per carbon unit
  resourceIntensity: number; // (Water + Power) / Total Cost
  goldDependency: number;    // Gold Cost / Total Cost ratio
}

// Observed patterns from CSV:
// - Higher value items tend to have higher carbon emissions
// - SHOPS materials often have 100% gold dependency (no water/power)
// - Luxury items (Diamond, Gold) have extreme carbon-to-cost ratios
```



## Admin Modification Rules

### 1. Permission Levels
```typescript
interface AdminPermissions {
  SUPER_ADMIN: {
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canViewAuditLog: true,
    canModifyBaseMaterials: true  // Materials 1-172
  },
  LIMITED_ADMIN: {
    canCreate: true,              // Only new materials (173+)
    canUpdate: true,              // With restrictions
    canDelete: false,             // Cannot delete
    canViewAuditLog: true,        // View only own changes
    canModifyBaseMaterials: false // Cannot modify 1-172
  }
}
```

### 2. Modification Constraints
```typescript
interface ModificationRules {
  // Base materials (1-172) from CSV
  baseMaterials: {
    protected: true,              // Extra protection
    requiresSuperAdmin: true,     // Only super admin
    requiresReason: true,         // Must provide reason
    notifiesAllAdmins: true,      // Sends notification
    allowFullUpdate: true         // Can update ALL fields including names
  },
  
  // Custom materials (173+)
  customMaterials: {
    protected: false,
    requiresSuperAdmin: false,
    requiresReason: true,
    notifiesAllAdmins: false,
    allowFullUpdate: true         // Can update ALL fields including names
  },
  
  // ALL updatable fields (no restrictions)
  updatableFields: [
    'materialNumber',   // Unique identifier
    'origin',          // Facility type
    'nameEn',          // English name
    'nameZh',          // Chinese name
    'totalCost',       // Total cost
    'waterRequired',   // Water requirement
    'powerRequired',   // Power requirement
    'goldCost',        // Gold cost component
    'carbonEmission',  // Environmental impact
    'isActive'         // Active status
  ],
  
  // Critical fields that trigger alerts
  criticalFields: [
    'nameEn',         // Name changes (brand impact)
    'nameZh',         // Name changes (brand impact)
    'totalCost',      // Price changes
    'carbonEmission', // Environmental impact
    'origin'          // Facility type change
  ]
}
```

### 3. Audit Requirements
```typescript
interface AuditRequirements {
  // All modifications must be logged
  logAllChanges: true,
  
  // Required information for each change
  requiredInfo: {
    adminId: string,
    timestamp: DateTime,
    ipAddress: string,
    previousValues: object,
    newValues: object,
    reason: string
  },
  
  // Retention policy
  retentionPeriod: '2 years',
  
  // Cannot be deleted
  immutable: true
}
```

### 4. Validation for Modifications
```typescript
function validateModification(
  material: RawMaterial,
  changes: Partial<RawMaterial>,
  admin: AdminContext
): ValidationResult {
  const errors: string[] = [];
  
  // Check base material protection
  if (material.materialNumber <= 172) {
    if (admin.adminType !== 'SUPER_ADMIN') {
      errors.push('Only super admins can modify base materials');
    }
  }
  
  // Validate name changes
  if (changes.nameEn !== undefined) {
    if (!changes.nameEn || changes.nameEn.trim().length === 0) {
      errors.push('English name cannot be empty');
    }
  }
  
  if (changes.nameZh !== undefined) {
    if (!changes.nameZh || changes.nameZh.trim().length === 0) {
      errors.push('Chinese name cannot be empty');
    }
  }
  
  // Validate cost changes
  if (changes.totalCost !== undefined) {
    if (changes.totalCost <= 0) {
      errors.push('Total cost must be positive');
    }
    const changePercent = Math.abs(
      (changes.totalCost - material.totalCost) / material.totalCost * 100
    );
    if (changePercent > 50) {
      // Alert but don't block - admin can still proceed
      console.warn('Cost change exceeds 50% threshold');
    }
  }
  
  // Validate carbon emission changes
  if (changes.carbonEmission !== undefined) {
    if (changes.carbonEmission < 0) {
      errors.push('Carbon emission cannot be negative');
    }
  }
  
  // Validate origin changes - allowed but logged
  if (changes.origin) {
    const validOrigins = ['MINE', 'QUARRY', 'FOREST', 'FARM', 'RANCH', 'FISHERY', 'SHOPS'];
    if (!validOrigins.includes(changes.origin)) {
      errors.push('Invalid origin facility type');
    }
  }
  
  // Validate material number uniqueness
  if (changes.materialNumber !== undefined) {
    // Check for conflicts (would be done at service layer)
    if (changes.materialNumber < 1) {
      errors.push('Material number must be positive');
    }
  }
  
  return { valid: errors.length === 0, errors };
}
```

## Validation Rules Summary

### Material Definition Validation
1. **Origin Type**: Must be one of the seven facility types (MINE, QUARRY, FOREST, FARM, RANCH, FISHERY, SHOPS)
2. **Non-Negative Values**: All resource requirements must be non-negative
3. **Positive Cost**: Total cost must be positive
4. **Unique Number**: Material number must be unique across active materials
5. **Language Support**: Both English (nameEn) and Chinese (nameZh) names required

### Modification Validation
1. **Permission Check**: Admin must have appropriate permissions
2. **Base Material Protection**: Materials 1-172 require super admin
3. **All Fields Updatable**: Admins can modify ALL fields including names (nameEn, nameZh)
4. **Reason Required**: All modifications require a reason for audit trail
5. **Audit Trail**: All changes are logged and immutable
6. **Soft Delete**: Materials are soft deleted (marked as inactive)

### Field Update Permissions

#### Super Admin - Can Update:
- **All fields** on materials 1-172 (base materials)
- **All fields** on materials 173+ (custom materials)
- Including: materialNumber, origin, nameEn, nameZh, all costs, all requirements

#### Limited Admin - Can Update:
- **All fields** on materials 173+ (custom materials only)
- Cannot modify materials 1-172
- Including: nameEn, nameZh, costs, requirements (on allowed materials)

## Educational Focus Areas

### Key Learning Outcomes
1. **Resource Understanding**: Learning about different material types and their characteristics
2. **Environmental Awareness**: Understanding carbon footprint of different materials
3. **Economic Principles**: Base costs and resource requirements
4. **Category Knowledge**: Facility types and material origins
5. **Sustainability Concepts**: Comparing environmental impact across materials

### Material Categories for Learning
- High-impact industrial materials (MINE origin)
- Sustainable natural materials (FOREST, FISHERY origins)
- Agricultural materials (FARM, RANCH origins)
- Construction materials (QUARRY origin)
- Commercial materials (SHOPS origin)

## Data Governance

### 1. Data Integrity
```typescript
interface DataIntegrityRules {
  // Prevent accidental data loss
  softDeleteOnly: true,           // Never hard delete
  requireBackup: true,            // Backup before bulk operations
  validateConsistency: true,      // Check data consistency
  
  // Data quality
  preventDuplicates: true,        // No duplicate material numbers
  enforceCompleteness: true,      // All required fields
  validateRanges: true            // Values within acceptable ranges
}
```

### 2. Change Management Process
```typescript
interface ChangeManagementProcess {
  steps: [
    'VALIDATION',      // Validate proposed changes
    'AUTHORIZATION',   // Check admin permissions
    'PREVIEW',        // Show changes preview
    'CONFIRMATION',   // Require confirmation
    'EXECUTION',      // Apply changes
    'AUDIT',          // Log to audit trail
    'NOTIFICATION'    // Notify relevant parties
  ],
  
  rollback: {
    enabled: false,               // No rollback capability
    reason: 'Use update to correct mistakes'
  }
}
```

