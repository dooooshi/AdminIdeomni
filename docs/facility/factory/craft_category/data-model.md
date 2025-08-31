# Craft Category Data Model

## Overview
Database schema design for the Craft Category module using Prisma ORM with PostgreSQL, integrated with the factory production system architecture.

## Schema Definition

### Location
`prisma/models/craft-category.prisma`

### Core Models

#### Craft Category Type Enum

```prisma
// Craft Category Types for Production
enum CraftCategoryType {
  MECHANICAL_MANUFACTURING    // 机械制造 - Industrial machinery production
  MATERIALS_PROCESSING       // 材料加工 - Raw material transformation
  BIOCHEMICAL               // 生物化学 - Chemical and biological processes
  ELECTRONIC_EQUIPMENT      // 电子器械 - Electronics manufacturing
  ENERGY_UTILIZATION       // 能源利用 - Energy conversion processes
  CUTTING_TEXTILE          // 裁剪纺织 - Fabric and garment production
  FOOD_PROCESSING          // 食品加工 - Food production and packaging
}
```

#### Technology Level Enum

```prisma
// Technology Levels for Craft Categories
enum TechnologyLevel {
  LEVEL_1      // Basic technology level
  LEVEL_2      // Standard technology level
  LEVEL_3      // Advanced technology level
  LEVEL_4      // Peak technology level
}
```

#### Craft Category Master Data

```prisma
// Craft Category Configuration
model CraftCategory {
  id                    Int                   @id @default(autoincrement())
  categoryType          CraftCategoryType     // Type of craft category
  technologyLevel       TechnologyLevel       // Technology level
  nameEn                String                // English name (e.g., "Mechanical Manufacturing - Level 1")
  nameZh                String                // Chinese name
  
  // Fixed Costs (per production cycle)
  fixedWaterCost        Decimal               @db.Decimal(10, 2) // Fixed water units required
  fixedPowerCost        Decimal               @db.Decimal(10, 2) // Fixed power units required
  fixedGoldCost         Decimal               @db.Decimal(10, 2) // Fixed gold cost
  
  // Variable Costs (percentage of production volume)
  variableWaterPercent  Decimal               @db.Decimal(5, 2)  // Variable water cost percentage
  variablePowerPercent  Decimal               @db.Decimal(5, 2)  // Variable power cost percentage
  variableGoldPercent   Decimal               @db.Decimal(5, 2)  // Variable gold cost percentage
  
  // Production Efficiency
  yieldPercentage       Decimal               @db.Decimal(5, 2)  // Yield efficiency rate (e.g., 88.00 for 88%)
  
  // Metadata
  isActive              Boolean               @default(true)      // Active status for soft delete
  createdAt             DateTime              @default(now())     // Creation timestamp
  updatedAt             DateTime              @updatedAt          // Last update timestamp
  createdBy             String?               // Admin who created the record
  updatedBy             String?               // Admin who last updated
  
  // Indexes
  @@unique([categoryType, technologyLevel])  // Unique combination of category and level
  @@index([categoryType])                    // Index for category queries
  @@index([technologyLevel])                 // Index for level queries
  @@index([isActive])                        // Index for active records
}
```


## Data Relationships

### Primary Relationships

1. **CraftCategory** is a standalone master data entity
   - Defines the production technology configurations
   - Used by factories to determine production costs and yields
   - Referenced in production calculations and cost analysis

## Indexes and Performance

### Primary Indexes
- Unique constraint on `[categoryType, technologyLevel]` for data integrity
- Index on `categoryType` for category-based queries
- Index on `technologyLevel` for level-based filtering
- Index on `isActive` for soft-delete implementation

### Query Optimization
- Composite indexes for common query patterns
- Category and level filtering for fast lookups
- Active status filtering for available categories

## Data Migration Strategy

### Initial Data Load
1. Parse CSV file with craft category coefficients
2. Create CraftCategory records for all 28 combinations (7 categories × 4 levels)
3. Validate data integrity and relationships
4. Set up initial cost analysis baselines

### Data Validation Rules
- Ensure all percentage values are between 0 and 100
- Validate that yield percentages are realistic (50-100%)
- Check that technology levels (Level 1 → Level 2 → Level 3 → Level 4) have progressively better yields
- Verify cost progressions are logical

## API Integration Points

### Repository Methods Required
```typescript
// CraftCategoryRepository
findAll(filters?: CraftCategoryFilters): Promise<CraftCategory[]>
findById(id: number): Promise<CraftCategory>
findByCategoryAndLevel(category: CraftCategoryType, level: TechnologyLevel): Promise<CraftCategory>
create(data: CreateCraftCategoryDto): Promise<CraftCategory>
update(id: number, data: UpdateCraftCategoryDto): Promise<CraftCategory>
softDelete(id: number): Promise<void>
getActiveCategories(): Promise<CraftCategory[]>
getCostComparison(categoryIds: number[]): Promise<CostComparisonResult>
```

### Service Layer Integration
```typescript
// CraftCategoryService
findAll(filters?: CraftCategoryFilters): Promise<CraftCategory[]>
findById(id: number): Promise<CraftCategory>
create(data: CreateCraftCategoryDto): Promise<CraftCategory>
update(id: number, data: UpdateCraftCategoryDto): Promise<CraftCategory>
delete(id: number): Promise<void>
```

## Security Considerations

### Access Control
- Admin-only access for creating/modifying craft categories
- User read access for available categories
- Read-only access for production cost calculations
- Audit logging for all modifications

### Data Integrity
- Foreign key constraints for all relationships
- Cascade rules for related data
- Soft delete for maintaining historical records
- Transaction support for complex operations