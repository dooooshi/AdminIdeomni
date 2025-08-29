# Raw Material Data Model

## Overview
Database schema design for the Raw Material module using Prisma ORM with PostgreSQL, aligned with existing facility system architecture.

## Schema Definition

### Location
`prisma/models/raw-material.prisma`

### Core Models

#### Raw Material Origin Enum
Uses existing facility types from the facility system:

```prisma
// Raw Material Origin based on existing facility types
enum RawMaterialOrigin {
  MINE      // 矿场 - Mining operations (steel, aluminum, minerals)
  QUARRY    // 采石场 - Stone and aggregate extraction  
  FOREST    // 林场 - Timber and wood products
  FARM      // 农场 - Agricultural products (cotton, crops)
  RANCH     // 养殖场 - Livestock-based materials
  FISHERY   // 渔场 - Marine-based materials
  SHOPS     // 商店 - Retail and commercial materials
}
```

#### Raw Material Master Data

```prisma
// Raw Material Master Data
model RawMaterial {
  id                Int                      @id @default(autoincrement())
  materialNumber    Int                      @unique // Material number from CSV (1-172+)
  origin            RawMaterialOrigin        // Production source (facility type)
  nameEn            String                   // English name
  nameZh            String                   // Chinese name
  
  // Resource Requirements
  waterRequired     Decimal                  @db.Decimal(10, 2) // Water units required
  powerRequired     Decimal                  @db.Decimal(10, 2) // Power units required
  
  // Economic Data
  totalCost         Decimal                  @db.Decimal(10, 2) // Total cost per unit
  goldCost          Decimal                  @db.Decimal(10, 2) // Gold component of cost
  
  // Environmental Impact
  carbonEmission    Decimal                  @db.Decimal(10, 2) // Carbon emission per unit (in hundreds)
  
  // Metadata
  isActive          Boolean                  @default(true)
  isDeleted         Boolean                  @default(false) // Soft delete flag
  deletedAt         DateTime?                // Deletion timestamp
  deletedBy         String?                  // Admin who deleted
  deletionReason    String?                  // Reason for deletion
  
  createdAt         DateTime                 @default(now())
  createdBy         String?                  // Admin who created
  updatedAt         DateTime                 @updatedAt
  lastModifiedBy    String?                  // Admin who last modified
  
  // Relations
  auditLogs         RawMaterialAuditLog[]    // Modification history
  
  // Database constraints
  @@index([origin])
  @@index([isActive])
  @@index([isDeleted])
  @@index([materialNumber])
  @@map("raw_materials")
}

// Audit Log for Raw Material Modifications
model RawMaterialAuditLog {
  id                Int                      @id @default(autoincrement())
  rawMaterialId     Int
  rawMaterial       RawMaterial              @relation(fields: [rawMaterialId], references: [id], onDelete: Cascade)
  
  // Action Details
  action            AuditAction              // CREATE, UPDATE, DELETE, RESTORE
  changes           Json?                    // JSON object of changed fields
  previousValues    Json?                    // Previous values before change
  newValues         Json?                    // New values after change
  
  // Modification Context
  modifiedBy        String                   // Admin username/ID
  adminEmail        String?                  // Admin email
  modificationReason String?                 // Reason for modification
  ipAddress         String?                  // IP address of admin
  userAgent         String?                  // Browser/client info
  
  // Timestamp
  createdAt         DateTime                 @default(now())
  
  // Database indexes
  @@index([rawMaterialId])
  @@index([modifiedBy])
  @@index([action])
  @@index([createdAt])
  @@map("raw_material_audit_logs")
}

// Audit Action Types
enum AuditAction {
  CREATE            // New material created
  UPDATE            // Existing material updated
  DELETE            // Material soft deleted
}
```


## Seed Data Structure

### Location
`prisma/seed-data/raw-material.data.ts`

### Data Source
The raw material data is based on the initial `raw_material_list.csv` which contains 172 materials across 7 facility types:
- **Ranch (养殖场)**: 20 materials (e.g., Eggs, Milk, Leather, Silk)
- **Farm (农场)**: 20 materials (e.g., Wheat, Rice, Cotton, Tea)
- **Forest (林场)**: 20 materials (e.g., Wood types, Bamboo, Rubber)
- **Fishery (渔场)**: 20 materials (e.g., Fish, Seafood, Seaweed)
- **Mine (矿场)**: 20 materials (e.g., Iron, Copper, Gold, Rare Earth)
- **Quarry (采石场)**: 20 materials (e.g., Stone, Sand, Marble, Diamond)
- **Shops (商店)**: 52 materials (e.g., Chemicals, Synthetic materials, Luxury items)

### Example Data Structure

```typescript
export const rawMaterialSeedData = [
  // RANCH origin materials
  {
    materialNumber: 1,
    origin: 'RANCH',
    nameEn: 'Eggs',
    nameZh: '蛋类',
    totalCost: 8,
    waterRequired: 3,
    powerRequired: 0,
    goldCost: 5,
    carbonEmission: 0.08 // Actual carbon units (multiply by 100 for display)
  },
  {
    materialNumber: 2,
    origin: 'RANCH',
    nameEn: 'Fresh Milk',
    nameZh: '鲜奶',
    totalCost: 9,
    waterRequired: 4,
    powerRequired: 0,
    goldCost: 5,
    carbonEmission: 0.09
  },
  
  // FARM origin materials
  {
    materialNumber: 21,
    origin: 'FARM',
    nameEn: 'Sweet Potato',
    nameZh: '红薯',
    totalCost: 2,
    waterRequired: 1,
    powerRequired: 0,
    goldCost: 1,
    carbonEmission: 0.02
  },
  
  // FOREST origin materials
  {
    materialNumber: 41,
    origin: 'FOREST',
    nameEn: 'Chinese Fir',
    nameZh: '杉木',
    totalCost: 3,
    waterRequired: 1,
    powerRequired: 1,
    goldCost: 1,
    carbonEmission: 0.03
  },
  
  // FISHERY origin materials
  {
    materialNumber: 61,
    origin: 'FISHERY',
    nameEn: 'Seaweed',
    nameZh: '海草',
    totalCost: 2,
    waterRequired: 1,
    powerRequired: 1,
    goldCost: 0,
    carbonEmission: 0.02
  },
  
  // MINE origin materials
  {
    materialNumber: 81,
    origin: 'MINE',
    nameEn: 'Iron',
    nameZh: '铁',
    totalCost: 3,
    waterRequired: 1,
    powerRequired: 1,
    goldCost: 1,
    carbonEmission: 0.03
  },
  
  // QUARRY origin materials
  {
    materialNumber: 101,
    origin: 'QUARRY',
    nameEn: 'Natural Soda Ash',
    nameZh: '天然碱',
    totalCost: 1,
    waterRequired: 0,
    powerRequired: 1,
    goldCost: 0,
    carbonEmission: 0.01
  },
  
  // SHOPS origin materials (Chemical/Synthetic)
  {
    materialNumber: 121,
    origin: 'SHOPS',
    nameEn: 'Sodium Hydroxide',
    nameZh: '烧碱',
    totalCost: 2,
    waterRequired: 0,
    powerRequired: 0,
    goldCost: 2,
    carbonEmission: 0.02
  },
  
  // High-value SHOPS materials
  {
    materialNumber: 172,
    origin: 'SHOPS',
    nameEn: 'Gold',
    nameZh: '黄金',
    totalCost: 4665,
    waterRequired: 0,
    powerRequired: 0,
    goldCost: 4665,
    carbonEmission: 46.65
  }
];
```

## Business Rules Implementation

### Data Validation Constraints

```typescript
// Application-level validation rules
class RawMaterialValidator {
  
  // Validate material number range (1-172 based on CSV)
  static validateMaterialNumber(materialNumber: number): boolean {
    return materialNumber >= 1 && materialNumber <= 172;
  }
  
  // All costs and requirements must be non-negative
  static validateNonNegativeValues(material: RawMaterial): boolean {
    return material.waterRequired >= 0 &&
           material.powerRequired >= 0 &&
           material.carbonEmission >= 0 &&
           material.goldCost >= 0 &&
           material.totalCost > 0;
  }
  
  // Validate origin is one of the 7 facility types
  static validateOrigin(origin: string): boolean {
    const validOrigins = ['RANCH', 'FARM', 'FOREST', 'FISHERY', 'MINE', 'QUARRY', 'SHOPS'];
    return validOrigins.includes(origin);
  }
  
  // Validate bilingual names are present
  static validateNames(material: RawMaterial): boolean {
    return material.nameEn && material.nameEn.length > 0 &&
           material.nameZh && material.nameZh.length > 0;
  }
}
```

### Service Validation

```typescript
// Material validation service
class RawMaterialService {
  
  // Validate material data on create/update
  async validateMaterialConstraints(
    material: RawMaterial,
    isUpdate: boolean = false
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    
    // For new materials after 172, allow higher numbers
    if (!isUpdate && material.materialNumber <= 172) {
      const existing = await this.checkMaterialNumberExists(material.materialNumber);
      if (existing) {
        errors.push(`Material number ${material.materialNumber} already exists`);
      }
    }
    
    if (!RawMaterialValidator.validateNonNegativeValues(material)) {
      errors.push('All resource requirements must be non-negative');
    }
    
    if (!RawMaterialValidator.validateOrigin(material.origin)) {
      errors.push('Invalid origin facility type');
    }
    
    if (!RawMaterialValidator.validateNames(material)) {
      errors.push('Both English and Chinese names are required');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  // Audit trail for modifications
  async logModification(
    materialId: number,
    action: AuditAction,
    adminInfo: AdminInfo,
    changes?: any
  ): Promise<void> {
    await this.prisma.rawMaterialAuditLog.create({
      data: {
        rawMaterialId: materialId,
        action,
        changes,
        modifiedBy: adminInfo.username,
        adminEmail: adminInfo.email,
        ipAddress: adminInfo.ipAddress,
        modificationReason: adminInfo.reason
      }
    });
  }
  
  // Soft delete with audit
  async softDelete(
    materialId: number,
    adminInfo: AdminInfo,
    reason: string
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Update material - mark as deleted and inactive
      await tx.rawMaterial.update({
        where: { id: materialId },
        data: {
          isDeleted: true,
          isActive: false,
          deletedAt: new Date(),
          deletedBy: adminInfo.username,
          deletionReason: reason
        }
      });
      
      // Log action
      await this.logModification(materialId, 'DELETE', adminInfo, { reason });
    });
  }
}
```

## Database Performance Optimization

### Indexing Strategy

```sql
-- Frequently queried fields
CREATE INDEX idx_raw_materials_origin ON raw_materials(origin);
CREATE INDEX idx_raw_materials_active ON raw_materials(is_active);
CREATE INDEX idx_raw_materials_code ON raw_materials(code);
```

### Query Optimization Examples

```sql
-- Get all raw materials by origin
SELECT 
  rm.id,
  rm.code,
  rm.name_en,
  rm.name_zh,
  rm.origin,
  rm.unit_cost
FROM raw_materials rm
WHERE rm.origin = ?
  AND rm.is_active = true
ORDER BY rm.name_en;

-- Search raw materials by name
SELECT 
  rm.*
FROM raw_materials rm
WHERE (rm.name_en ILIKE ? OR rm.name_zh ILIKE ?)
  AND rm.is_active = true
ORDER BY rm.code;

-- Get material details with requirements
SELECT 
  rm.id,
  rm.code,
  rm.name_en,
  rm.name_zh,
  rm.water_required,
  rm.power_required,
  rm.carbon_emission,
  rm.space_required,
  rm.unit_cost,
  rm.min_batch_size,
  rm.max_batch_size
FROM raw_materials rm
WHERE rm.id = ?;
```

## Integration with Existing Systems

### Admin System Integration

```typescript
// Admin permission requirements for material management
interface MaterialManagementPermissions {
  VIEW_MATERIALS: 'raw_materials.view';
  CREATE_MATERIAL: 'raw_materials.create';
  UPDATE_MATERIAL: 'raw_materials.update';
  DELETE_MATERIAL: 'raw_materials.delete';
  VIEW_AUDIT_LOG: 'raw_materials.audit';
}

// Admin context for modifications
interface AdminContext {
  adminId: number;
  username: string;
  email: string;
  adminType: AdminType; // SUPER_ADMIN or LIMITED_ADMIN
  permissions: string[];
  ipAddress: string;
  sessionId: string;
}

// Validate admin permissions
function canModifyMaterial(
  admin: AdminContext,
  action: string
): boolean {
  if (admin.adminType === 'SUPER_ADMIN') return true;
  return admin.permissions.includes(`raw_materials.${action}`);
}
```

### Facility System Integration

```typescript
// Material origin corresponds to facility types
interface MaterialFacilityMapping {
  material: RawMaterial;
  requiredFacilityType: FacilityType; // MINE, QUARRY, FOREST, etc.
}

function getMaterialFacilityRequirement(material: RawMaterial): FacilityType {
  // Material origin directly maps to facility type
  return material.origin as FacilityType;
}
```

## Migration Strategy

### Initial Migration

```bash
# Create raw material tables
pnpm run prisma:migrate -- --name add_raw_material_module
```

### Seed Process

```bash
# Seed raw material master data
pnpm run prisma:seed
```

### Data Integrity Checks

```sql
-- Verify unique material numbers
SELECT material_number, COUNT(*) as count
FROM raw_materials
WHERE is_deleted = false
GROUP BY material_number
HAVING COUNT(*) > 1;

-- Verify positive values constraint
SELECT material_number, name_en 
FROM raw_materials 
WHERE total_cost <= 0 
   OR water_required < 0 
   OR power_required < 0 
   OR carbon_emission < 0
   OR gold_cost < 0;

-- Check for orphaned audit logs
SELECT COUNT(*) as orphaned_logs
FROM raw_material_audit_logs al
LEFT JOIN raw_materials rm ON al.raw_material_id = rm.id
WHERE rm.id IS NULL;

-- Materials modified in last 30 days
SELECT 
  rm.material_number,
  rm.name_en,
  COUNT(al.id) as modification_count,
  MAX(al.created_at) as last_modified
FROM raw_materials rm
JOIN raw_material_audit_logs al ON rm.id = al.raw_material_id
WHERE al.created_at > NOW() - INTERVAL '30 days'
GROUP BY rm.id, rm.material_number, rm.name_en
ORDER BY modification_count DESC;

-- Admin activity summary
SELECT 
  modified_by,
  action,
  COUNT(*) as action_count
FROM raw_material_audit_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY modified_by, action
ORDER BY modified_by, action_count DESC;
```


This data model provides the foundation for the raw material list module, defining the master data structure for all raw materials available in the business simulation platform.