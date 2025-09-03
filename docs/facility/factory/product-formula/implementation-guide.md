# Product Formula API Implementation Guide

## Quick Overview
Implement APIs that provide contextual data for product formula creation based on team's actual facility infrastructure, following the existing craft category and raw material production systems.

## Core APIs to Implement

### 1. Available Craft Categories API
**Purpose**: Show craft categories the team can use based on their factory levels (1-4 system)

**Key Logic**:
```typescript
// Pseudo-code for main logic
async getAvailableCrafts(teamId: string) {
  // Step 1: Get team's FACTORY type facilities
  const factories = await prisma.tileFacilityInstance.findMany({
    where: {
      teamId,
      facilityType: 'FACTORY',
      isActive: true
    }
  });
  
  // Step 2: Get all craft categories from the 7 types x 4 levels (28 total)
  const allCrafts = await prisma.craftCategory.findMany({
    where: { isActive: true }
  });
  
  // Step 3: Filter by factory level constraint
  const maxFactoryLevel = Math.max(...factories.map(f => f.level));
  const availableCrafts = allCrafts.filter(craft => {
    const craftLevel = parseInt(craft.technologyLevel.replace('LEVEL_', ''));
    return craftLevel <= maxFactoryLevel;
  });
  
  // Step 4: Group by factory and return
  return formatCraftResponse(availableCrafts, factories);
}
```

### 2. Available Raw Materials API
**Purpose**: Show materials from team's material production facilities with infrastructure status

**Key Logic**:
```typescript
// Pseudo-code for main logic
async getAvailableMaterials(teamId: string) {
  // Step 1: Get team's material production facilities
  const facilities = await prisma.tileFacilityInstance.findMany({
    where: {
      teamId,
      facilityType: { 
        in: ['FARM', 'RANCH', 'MINE', 'QUARRY', 'FOREST', 'FISHERY'] 
      },
      isActive: true
    },
    include: {
      infrastructureConnections: true
    }
  });
  
  // Step 2: Check infrastructure (water + power required)
  const facilitiesWithInfra = facilities.map(f => ({
    ...f,
    hasWater: f.infrastructureConnections.some(c => 
      c.connectionType === 'WATER' && c.isActive
    ),
    hasPower: f.infrastructureConnections.some(c => 
      c.connectionType === 'POWER' && c.isActive
    ),
    canProduce: hasWater && hasPower
  }));
  
  // Step 3: Get materials by facility origin
  const materials = await prisma.rawMaterial.findMany();
  
  // Step 4: Map materials to facilities that can produce them
  return materials.map(material => ({
    ...material,
    canProduce: facilitiesWithInfra.some(f => 
      f.facilityType === material.origin && f.canProduce
    ),
    productionFacilities: facilitiesWithInfra.filter(f => 
      f.facilityType === material.origin
    )
  }));
}
```

## Database Schema Requirements

### Key Tables/Models (Already Exist)

```prisma
// TileFacilityInstance Model (existing)
model TileFacilityInstance {
  id            String   @id
  teamId        String
  facilityType  String   // FACTORY, FARM, MINE, etc.
  level         Int      // 1-4 for factories
  isActive      Boolean
  
  // Relations
  team          Team
  tile          MapTile
  spaceInventory FacilitySpaceInventory
  infrastructureConnections InfrastructureConnection[]
}

// CraftCategory Model (existing - 28 records)
model CraftCategory {
  id              Int      @id
  categoryType    String   // 7 types
  technologyLevel String   // LEVEL_1 to LEVEL_4
  nameEn          String
  nameZh          String
  
  // Fixed Costs
  fixedWaterCost  Int
  fixedPowerCost  Int
  fixedGoldCost   Int
  
  // Variable Costs (percentages)
  variableWaterPercent  Float
  variablePowerPercent  Float
  variableGoldPercent   Float
  
  yieldPercentage Int      // 65-99%
  isActive        Boolean
}

// RawMaterial Model (existing)
model RawMaterial {
  id              Int      @id
  materialNumber  Int
  nameEn          String
  nameZh          String
  origin          String   // FARM, MINE, QUARRY, etc.
  waterRequired   Int      // For production
  powerRequired   Int      // For production
  totalCost       Float
  carbonEmission  Float    // Used for space calculation
}

// InfrastructureConnection Model (existing)
model InfrastructureConnection {
  id              String   @id
  facilityId      String   // Consumer facility
  providerId      String   // Provider facility (WATER_PLANT/POWER_PLANT)
  connectionType  String   // WATER or POWER
  isActive        Boolean
  unitPrice       Float
}
```

## Business Rules Implementation

### Factory Level and Craft Category Rules

```typescript
// Factory levels determine max craft level
function getMaxCraftLevel(factoryLevel: number): string {
  return `LEVEL_${factoryLevel}`; // 1-4
}

// All 7 craft category types (each has 4 levels)
const CRAFT_CATEGORY_TYPES = [
  'MECHANICAL_MANUFACTURING',   // 88-99% yield
  'MATERIALS_PROCESSING',       // 85-99% yield  
  'BIOCHEMICAL',               // 70-97% yield
  'ELECTRONIC_EQUIPMENT',      // 65-98% yield
  'ENERGY_UTILIZATION',        // 82-98% yield
  'CUTTING_TEXTILE',           // 82-98% yield
  'FOOD_PROCESSING'            // 80-98% yield
];

// Material origin to facility type mapping
const MATERIAL_PRODUCTION_MAP = {
  'FARM': 'FARM',
  'RANCH': 'RANCH',
  'MINE': 'MINE',
  'QUARRY': 'QUARRY',
  'FOREST': 'FOREST',
  'FISHERY': 'FISHERY',
  'SHOPS': null  // Market only, no production facility
};
```

### Validation Rules

```typescript
class FormulaValidator {
  // Check if craft is available based on factory level
  validateCraftAvailability(craft: CraftCategory, teamFactories: Facility[]) {
    const maxFactoryLevel = Math.max(...teamFactories.map(f => f.level));
    const craftLevel = parseInt(craft.technologyLevel.replace('LEVEL_', ''));
    return craftLevel <= maxFactoryLevel;
  }
  
  // Check material availability (production facility or market)
  validateMaterialAvailability(material: RawMaterial, teamFacilities: Facility[]) {
    // Check if team has matching facility type with infrastructure
    const canProduce = teamFacilities.some(f => {
      if (f.facilityType !== material.origin) return false;
      
      // Check infrastructure connections
      const hasWater = f.infrastructureConnections.some(
        c => c.connectionType === 'WATER' && c.isActive
      );
      const hasPower = f.infrastructureConnections.some(
        c => c.connectionType === 'POWER' && c.isActive
      );
      
      return hasWater && hasPower;
    });
    
    return canProduce || material.origin === 'SHOPS'; // SHOPS = market only
  }
  
  // Validate no duplicate category types in formula
  validateCategoryUniqueness(categories: CraftCategory[]) {
    const types = categories.map(c => c.categoryType);
    return types.length === new Set(types).size;
  }
  
  // Validate space requirements for production
  validateSpaceRequirements(material: RawMaterial, quantity: number, facility: Facility) {
    const spaceNeeded = material.carbonEmission * quantity;
    return facility.spaceInventory.availableSpace >= spaceNeeded;
  }
}
```

## Controller Implementation

```typescript
@Controller('api/user/team')
export class TeamResourceController {
  
  @Get('available-craft-categories')
  @UseGuards(UserJwtAuthGuard)
  async getAvailableCrafts(@Req() req, @Query() query) {
    const teamId = req.user.teamId;
    if (!teamId) throw new ForbiddenException('No team membership');
    
    return this.service.getAvailableCraftCategories(teamId, query);
  }
  
  @Get('available-raw-materials')
  @UseGuards(UserJwtAuthGuard)
  async getAvailableMaterials(@Req() req, @Query() query) {
    const teamId = req.user.teamId;
    if (!teamId) throw new ForbiddenException('No team membership');
    
    return this.service.getAvailableRawMaterials(teamId, query);
  }
  
  @Get('factory-capabilities')
  @UseGuards(UserJwtAuthGuard)
  async getFactoryCapabilities(@Req() req) {
    const teamId = req.user.teamId;
    if (!teamId) throw new ForbiddenException('No team membership');
    
    return this.service.getFactoryCapabilities(teamId);
  }
}
```

## Service Implementation

```typescript
@Injectable()
export class TeamResourceService {
  
  async getAvailableCraftCategories(teamId: string, filters?: any) {
    // 1. Get factories with their capabilities
    const factories = await this.prisma.facility.findMany({
      where: {
        teamId,
        facilityType: { in: ['ULTRA', 'HEAVY', 'LIGHT', 'BASIC'] },
        status: 'OPERATIONAL'
      }
    });
    
    if (!factories.length) {
      throw new NotFoundException('No operational factories found');
    }
    
    // 2. Build query for compatible crafts
    const craftConditions = factories.map(f => ({
      AND: [
        { requiredFactory: f.facilityType },
        { technologyLevel: { lte: f.techLevel } }
      ]
    }));
    
    // 3. Get crafts
    const crafts = await this.prisma.craftCategory.findMany({
      where: { OR: craftConditions }
    });
    
    // 4. Format response with factory mapping
    return this.formatCraftResponse(crafts, factories);
  }
  
  async getAvailableRawMaterials(teamId: string, filters?: any) {
    // 1. Get production facilities
    const facilities = await this.prisma.facility.findMany({
      where: {
        teamId,
        facilityType: { in: ['FARM', 'RANCH', 'MINE', 'QUARRY', 'FOREST', 'FISHERY'] },
        status: 'OPERATIONAL'
      },
      include: {
        producedMaterials: true
      }
    });
    
    // 2. Get self-produced materials
    const selfProducedIds = facilities.flatMap(f => 
      f.producedMaterials.map(m => m.id)
    );
    
    // 3. Get all materials with production info
    const materials = await this.prisma.rawMaterial.findMany({
      where: filters?.inStock ? 
        { id: { in: selfProducedIds } } : 
        { OR: [
          { id: { in: selfProducedIds } },
          { marketAvailable: true }
        ]}
    });
    
    // 4. Format with source information
    return this.formatMaterialResponse(materials, facilities);
  }
}
```

## Testing Strategy

### Unit Tests
```typescript
describe('TeamResourceService', () => {
  it('should return only compatible crafts for factory level', async () => {
    // Setup: Team has HEAVY factory (level 2)
    const teamId = 'test-team';
    const factory = { type: 'HEAVY', techLevel: 2 };
    
    // Test: Should not return LEVEL_3 crafts
    const crafts = await service.getAvailableCraftCategories(teamId);
    expect(crafts.every(c => c.level <= 2)).toBe(true);
  });
  
  it('should prioritize self-produced materials', async () => {
    // Setup: Team produces copper
    const materials = await service.getAvailableRawMaterials(teamId);
    
    // Test: Copper should show as self-produced
    const copper = materials.find(m => m.name === 'Copper');
    expect(copper.selfProduced).toBe(true);
    expect(copper.cost).toBeLessThan(copper.marketPrice);
  });
});
```

### Integration Tests
```bash
# Test craft categories endpoint
curl -X GET http://localhost:2999/api/user/team/available-craft-categories \
  -H "Authorization: Bearer ${TOKEN}"

# Test materials endpoint with filters
curl -X GET "http://localhost:2999/api/user/team/available-raw-materials?origin=MINE&inStock=true" \
  -H "Authorization: Bearer ${TOKEN}"
```

## Performance Considerations

1. **Caching Strategy**
   - Cache craft categories (1 hour) - rarely changes
   - Cache factory capabilities (5 minutes) - changes with upgrades
   - Cache material list (10 minutes) - changes with production

2. **Query Optimization**
   - Use database indexes on teamId, facilityType, techLevel
   - Batch load related data to avoid N+1 queries
   - Consider materialized views for complex joins

3. **Response Size**
   - Implement pagination for large material lists
   - Use field filtering (?fields=id,name,cost)
   - Compress responses with gzip

## Error Handling

```typescript
// Common error scenarios
class ErrorHandler {
  handleNoFactories(teamId: string) {
    throw new BusinessException(
      'NO_FACTORIES_FOUND',
      'Team must have at least one operational factory',
      { teamId }
    );
  }
  
  handleInvalidFactoryLevel(required: number, actual: number) {
    throw new ValidationException(
      'INSUFFICIENT_FACTORY_LEVEL',
      `Factory level ${actual} cannot use level ${required} crafts`,
      { required, actual }
    );
  }
  
  handleMaterialUnavailable(materialId: number) {
    throw new NotFoundException(
      'MATERIAL_NOT_AVAILABLE',
      'Material not produced by team and not available in market',
      { materialId }
    );
  }
}
```

## Deployment Checklist

- [ ] Database migrations for new tables/fields
- [ ] Seed data for craft categories and materials
- [ ] API endpoints registered in module
- [ ] Authentication guards configured
- [ ] Response interceptors applied
- [ ] Error handling integrated
- [ ] Caching layer configured
- [ ] API documentation updated
- [ ] Integration tests passing
- [ ] Performance benchmarks met