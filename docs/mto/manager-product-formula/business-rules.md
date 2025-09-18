# Manager Product Formula Business Rules

## Overview
This document defines all business rules, constraints, and validation logic for the Manager Product Formula module used in Made-To-Order (MTO) requirements.

## Core Business Rules

### 1. User Role Requirements

#### Manager-Only Access
- **Rule**: Only users with `userType = 1` (Manager) can create, update, or delete product formulas
- **Validation**: Check user.userType === 1 before any write operation
- **Error**: Return 403 Forbidden if non-manager attempts formula operations

#### Activity-Based Access Control
- **Rule**: Managers have full access to ALL formulas within their assigned activity
- **Scope**: Managers can view, edit, delete, and clone any formula in their activity
- **Collaboration**: Multiple managers in same activity can collaborate on formulas
- **Boundary**: Managers cannot access formulas from other activities
- **Validation**: Verify manager's activity association matches formula's activity
- **Error**: Return 403 if manager attempts to access formula from different activity

### 2. Formula Creation Rules

#### Formula Numbering
- **Rule**: Formula numbers are auto-incremented within each activity
- **Logic**: `MAX(formulaNumber) + 1` WHERE activityId = target_activity
- **Constraint**: Unique combination of (formulaNumber, activityId)

#### Product Naming
- **Rule**: Product names must be unique within an activity
- **Length**: 1-200 characters
- **Validation**: No duplicate names in same activity

#### Material Selection
- **Rule**: Managers can select ANY raw material from the complete list
- **Access**: Retrieve via `/api/user/manager/mto/raw-materials` endpoint
- **Quantity Range**: 0.001 to 9999.999
- **Constraint**: No duplicate materials in single formula
- **Maximum Materials**: 999 per formula
- **Filtering**: Can filter by origin (MINE, QUARRY, FOREST, FARM, RANCH, FISHERY, SHOPS)
- **Search**: Support search by English or Chinese name

#### Craft Category Selection
- **Rule**: Only one craft category per categoryType allowed
- **Access**: Retrieve via `/api/user/manager/mto/craft-categories` endpoint
- **Example**: Cannot have both MECHANICAL_MANUFACTURING_LEVEL_1 and MECHANICAL_MANUFACTURING_LEVEL_2
- **Minimum**: At least 1 craft category required
- **Maximum**: 7 categories (one per categoryType)
- **Available Types**: MECHANICAL_MANUFACTURING, MATERIALS_PROCESSING, BIOCHEMICAL, ELECTRONIC_EQUIPMENT, ENERGY_UTILIZATION, CUTTING_TEXTILE, FOOD_PROCESSING
- **Technology Levels**: LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4

### 3. Cost Calculation Rules

#### Material Cost Calculation
```
Total Material Cost (A) = Σ(material.quantity × rawMaterial.unitCost)
```

#### Setup Cost Aggregation
```
Total Setup Water Cost = Σ(craftCategory.fixedWaterCost)
Total Setup Power Cost = Σ(craftCategory.fixedPowerCost)
Total Setup Gold Cost = Σ(craftCategory.fixedGoldCost)
```

#### Variable Cost Percentages
```
Total Water Percent = Σ(craftCategory.variableWaterPercent)
Total Power Percent = Σ(craftCategory.variablePowerPercent)
Total Gold Percent = Σ(craftCategory.variableGoldPercent)
Total Percent = Total Water % + Total Power % + Total Gold %
```

#### Final Cost Formulas
```
Final Water Cost = Total Setup Water + CEILING(A × Total Water % / 100)
Final Power Cost = Total Setup Power + CEILING(A × Total Power % / 100)
Final Gold Cost = Total Setup Gold + (A × Total Gold % / 100)
```

#### Carbon Emission Calculation
```
Carbon Emission = Σ(material.quantity × rawMaterial.carbonEmission) × (1 + Total Percent / 100)
```

### 4. Formula Modification Rules

#### Update Restrictions
- **Rule**: Formulas cannot be updated when `isLocked = true`
- **Access**: Any manager in the activity can update unlocked formulas
- **Lock Trigger**: Formula becomes locked when used in active MTO requirement
- **Unlock Trigger**: Formula unlocks when MTO completes or is cancelled

#### Allowed Updates When Unlocked
- Product name and description
- Materials (add, remove, change quantities)
- Craft categories
- Costs are recalculated automatically
- **Tracking**: System tracks updatedBy to show which manager made changes

#### Delete Restrictions
- **Rule**: Cannot delete formula if used by any MTO requirement (Type 1 or Type 2)
- **Access**: Any manager in the activity can delete unused formulas
- **Soft Delete**: Set `isDeleted = true`, preserve data for audit
- **Tracking**: System tracks deletedBy to show which manager deleted

### 5. MTO Integration Rules

#### MTO Type 1 Integration
- **Rule**: Formula defines exact product specifications for tile-based requirements
- **Validation**: Team deliveries must match formula exactly (materials and categories)
- **Settlement**: Products are validated against formula during settlement

#### MTO Type 2 Integration
- **Rule**: Formula defines acceptable products for MALL submissions
- **Validation**: MALL products must match formula specifications
- **Budget Distribution**: Based on tile population ratios

### 6. Validation Rules for Team Deliveries

#### Material Matching
- **Rule**: Team formula must contain ALL materials from manager formula
- **Tolerance**: Quantities must match exactly (no tolerance)
- **Error**: Reject delivery if any material is missing or incorrect

#### Craft Category Matching
- **Rule**: Team formula must use same craft categories
- **Level Matching**: Technology levels must match exactly
- **Error**: Reject if categories don't align

### 7. Data Integrity Rules

#### Referential Integrity
- **Cascade Delete**: When formula is deleted, cascade to:
  - ManagerProductFormulaMaterial records
  - ManagerProductFormulaCraftCategory records
- **Protect**: Cannot delete if referenced by MTO requirements

#### Audit Trail
- **Creation**: Track createdBy (manager ID) and createdAt
- **Updates**: Track updatedBy and updatedAt for transparency
- **Deletion**: Track deletedBy, deletedAt, and deletion reason
- **Visibility**: All managers in activity can see audit trail
- **Collaboration**: Shows history of all managers who contributed

### 8. Performance Constraints

#### Query Limits
- **List Operations**: Maximum 100 formulas per page
- **Material Limit**: Maximum 999 materials per formula
- **Category Limit**: Maximum 7 categories (one per type)

#### Response Time Targets
- **Create Formula**: < 500ms for 99 materials
- **List Formulas**: < 200ms for 100 items
- **Validate Delivery**: < 100ms per validation

### 9. Business Logic Precedence

#### Formula Selection Priority
1. Most recent unlocked formula
2. Formula with highest formulaNumber
3. Formula with most specific requirements

#### Cost Rounding Rules
- **Water/Power**: Always round up (CEILING)
- **Gold**: Two decimal places, standard rounding
- **Carbon**: Three decimal places, standard rounding

### 10. Special Cases

#### Empty Formula Handling
- **Rule**: Formula must have at least 1 material AND 1 craft category
- **Error**: Reject creation/update that results in empty formula

#### Maximum Complexity
- **Warning Threshold**: Formulas with >50 materials trigger complexity warning
- **Suggestion**: System suggests simplification for >100 materials

#### Formula Cloning
- **Rule**: Cloned formulas get new formulaNumber in target activity
- **Preservation**: Original formula reference stored for traceability
- **Name**: Append "(Clone)" to product name if not specified
- **Access**: Any manager in the activity can clone existing formulas

### 11. Collaboration Features

#### Manager Collaboration Within Activity
- **Shared Access**: All managers in an activity share full access to formulas
- **Concurrent Editing**: System prevents concurrent edits via optimistic locking
- **Change Tracking**: All changes are attributed to specific managers
- **Formula Ownership**: While createdBy tracks original creator, all managers have equal rights
- **Team Workflow**: Enables managers to collaborate on MTO requirements

#### Cross-Activity Restrictions
- **Isolation**: Formulas from different activities are completely isolated
- **No Cross-Access**: Managers cannot view or modify formulas from other activities
- **Activity Boundary**: Enforced at API and database levels

## Validation Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| MTO_001 | Invalid manager role | 403 |
| MTO_002 | No activity access | 403 |
| MTO_003 | Duplicate product name | 409 |
| MTO_004 | Duplicate material in formula | 400 |
| MTO_005 | Duplicate category type | 400 |
| MTO_006 | Formula locked | 409 |
| MTO_007 | Formula in use by MTO | 409 |
| MTO_008 | Material not found | 404 |
| MTO_009 | Craft category not found | 404 |
| MTO_010 | Invalid quantity range | 400 |
| MTO_011 | Exceeds material limit | 400 |
| MTO_012 | Empty formula | 400 |
| MTO_013 | Formula not found | 404 |
| MTO_014 | Validation failed | 422 |

## State Transitions

### Formula Lifecycle
```
DRAFT → ACTIVE → LOCKED → ACTIVE → DELETED
         ↑         ↓
         └─────────┘
```

- **DRAFT**: Initial creation (isActive=false)
- **ACTIVE**: Available for use (isActive=true, isLocked=false)
- **LOCKED**: Used in active MTO (isLocked=true)
- **DELETED**: Soft deleted (isDeleted=true)

## Calculation Examples

### Example 1: Simple Formula
```
Materials:
- Copper (ID: 85): 10 units @ 24 gold = 240 gold
- Silicon (ID: 88): 5 units @ 24 gold = 120 gold
Total Material Cost (A) = 360 gold

Craft Categories:
- Electronic Equipment Level 3:
  - Fixed: Water=42, Power=240, Gold=84
  - Variable: Water=2%, Power=31.2%, Gold=6.8%

Final Costs:
- Water = 42 + CEILING(360 × 0.02) = 42 + 8 = 50
- Power = 240 + CEILING(360 × 0.312) = 240 + 113 = 353
- Gold = 84 + (360 × 0.068) = 84 + 24.48 = 108.48
```

### Example 2: Complex Formula with Multiple Categories
```
Materials: 50 different types, total cost = 5000 gold
Categories: 3 different types
- Total Fixed: Water=100, Power=400, Gold=200
- Total Variable: Water=5%, Power=50%, Gold=15%

Final Costs:
- Water = 100 + CEILING(5000 × 0.05) = 100 + 250 = 350
- Power = 400 + CEILING(5000 × 0.50) = 400 + 2500 = 2900
- Gold = 200 + (5000 × 0.15) = 200 + 750 = 950
```

## Implementation Notes

### Database Constraints
- Enforce unique constraints at database level
- Use transactions for multi-table operations
- Index frequently queried fields

### Application Logic
- Validate business rules before database operations
- Use service layer for complex calculations
- Cache formula calculations when possible

### Error Handling
- Return specific error codes for each validation failure
- Include field-level error details
- Log all formula modifications for audit