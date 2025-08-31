import { FacilityType, FacilityCategory } from './facilities';

// ==================== ENUMS ====================

export enum InventoryItemType {
  RAW_MATERIAL = 'RAW_MATERIAL',
  PRODUCT = 'PRODUCT',
}

// ==================== INTERFACES ====================

// Facility Space Configuration Model
export interface FacilitySpaceConfig {
  id: string;
  templateId: number;
  facilityType: FacilityType;
  
  // Space Configuration (ALWAYS in carbon emission units)
  initialSpace: number;          // Base storage space in carbon units
  spacePerLevel: number;         // Additional space per upgrade level in carbon units
  maxSpace: number;              // Maximum possible space after all upgrades in carbon units
  
  // Category-based rules enforcement
  isStorageFacility: boolean;    // Whether this facility type can store items
  
  // Metadata
  description?: string;          // Optional description of space usage
  metadata?: Record<string, any>; // Additional configuration data
  
  // System fields
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;           // Admin who created this config
  lastModifiedBy?: string;      // Admin who last modified
}

// Create DTO
export interface CreateFacilitySpaceConfigDto {
  facilityType: FacilityType;
  initialSpace: number;
  spacePerLevel: number;
  maxSpace: number;
  isStorageFacility?: boolean;
  description?: string;
  metadata?: Record<string, any>;
}

// Update DTO
export interface UpdateFacilitySpaceConfigDto {
  initialSpace?: number;
  spacePerLevel?: number;
  maxSpace?: number;
  isStorageFacility?: boolean;
  description?: string;
  metadata?: Record<string, any>;
  isActive?: boolean;
}

// Query Parameters
export interface GetFacilitySpaceConfigsQueryParams {
  templateId?: number;
  facilityType?: FacilityType;
  isStorageFacility?: boolean;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: 'facilityType' | 'initialSpace' | 'maxSpace' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

// Batch Update DTO
export interface BatchUpdateFacilitySpaceConfigDto {
  facilityTypes: FacilityType[];
  updates: UpdateFacilitySpaceConfigDto;
}

// Category-based Batch Update
export interface CategorySpaceConfigDto {
  category: FacilityCategory;
  initialSpace: number;
  spacePerLevel: number;
  maxSpace: number;
}

// Space Calculation Result
export interface SpaceCalculationResult {
  facilityType: FacilityType;
  level: number;
  baseSpace: number;
  additionalSpace: number;
  totalSpace: number;
  maxSpace: number;
  effectiveSpace: number; // min(totalSpace, maxSpace)
}

// Template Space Summary
export interface TemplateSpaceSummary {
  templateId: number;
  totalConfigs: number;
  storageFacilities: number;
  nonStorageFacilities: number;
  categorySummary: {
    [key in FacilityCategory]: {
      count: number;
      averageInitialSpace: number;
      averageMaxSpace: number;
    };
  };
}

// ==================== UTILITY TYPES ====================

// Default space configurations by facility type
export const DEFAULT_SPACE_CONFIGS: Record<FacilityType, Omit<CreateFacilitySpaceConfigDto, 'facilityType'>> = {
  // RAW_MATERIAL_PRODUCTION facilities
  [FacilityType.MINE]: {
    initialSpace: 300,
    spacePerLevel: 150,
    maxSpace: 1500,
    isStorageFacility: true,
  },
  [FacilityType.QUARRY]: {
    initialSpace: 350,
    spacePerLevel: 175,
    maxSpace: 1750,
    isStorageFacility: true,
  },
  [FacilityType.FOREST]: {
    initialSpace: 400,
    spacePerLevel: 200,
    maxSpace: 2000,
    isStorageFacility: true,
  },
  [FacilityType.FARM]: {
    initialSpace: 500,
    spacePerLevel: 250,
    maxSpace: 2500,
    isStorageFacility: true,
  },
  [FacilityType.RANCH]: {
    initialSpace: 450,
    spacePerLevel: 225,
    maxSpace: 2250,
    isStorageFacility: true,
  },
  [FacilityType.FISHERY]: {
    initialSpace: 350,
    spacePerLevel: 175,
    maxSpace: 1750,
    isStorageFacility: true,
  },
  
  // FUNCTIONAL facilities
  [FacilityType.FACTORY]: {
    initialSpace: 500,
    spacePerLevel: 250,
    maxSpace: 2500,
    isStorageFacility: true,
  },
  [FacilityType.MALL]: {
    initialSpace: 800,
    spacePerLevel: 400,
    maxSpace: 4000,
    isStorageFacility: true,
  },
  [FacilityType.WAREHOUSE]: {
    initialSpace: 1000,
    spacePerLevel: 500,
    maxSpace: 5000,
    isStorageFacility: true,
  },
  
  // INFRASTRUCTURE facilities (NO STORAGE)
  [FacilityType.WATER_PLANT]: {
    initialSpace: 0,
    spacePerLevel: 0,
    maxSpace: 0,
    isStorageFacility: false,
  },
  [FacilityType.POWER_PLANT]: {
    initialSpace: 0,
    spacePerLevel: 0,
    maxSpace: 0,
    isStorageFacility: false,
  },
  [FacilityType.BASE_STATION]: {
    initialSpace: 0,
    spacePerLevel: 0,
    maxSpace: 0,
    isStorageFacility: false,
  },
  [FacilityType.FIRE_STATION]: {
    initialSpace: 0,
    spacePerLevel: 0,
    maxSpace: 0,
    isStorageFacility: false,
  },
  
  // OTHER facilities (NO STORAGE)
  [FacilityType.SCHOOL]: {
    initialSpace: 0,
    spacePerLevel: 0,
    maxSpace: 0,
    isStorageFacility: false,
  },
  [FacilityType.HOSPITAL]: {
    initialSpace: 0,
    spacePerLevel: 0,
    maxSpace: 0,
    isStorageFacility: false,
  },
  [FacilityType.PARK]: {
    initialSpace: 0,
    spacePerLevel: 0,
    maxSpace: 0,
    isStorageFacility: false,
  },
  [FacilityType.CINEMA]: {
    initialSpace: 0,
    spacePerLevel: 0,
    maxSpace: 0,
    isStorageFacility: false,
  },
};

// Utility function to get facility category
export function getFacilityCategory(type: FacilityType): FacilityCategory {
  const rawMaterialTypes = [
    FacilityType.MINE, FacilityType.QUARRY, FacilityType.FOREST,
    FacilityType.FARM, FacilityType.RANCH, FacilityType.FISHERY
  ];
  const functionalTypes = [
    FacilityType.FACTORY, FacilityType.MALL, FacilityType.WAREHOUSE
  ];
  const infrastructureTypes = [
    FacilityType.WATER_PLANT, FacilityType.POWER_PLANT, 
    FacilityType.BASE_STATION, FacilityType.FIRE_STATION
  ];

  if (rawMaterialTypes.includes(type)) return FacilityCategory.RAW_MATERIAL_PRODUCTION;
  if (functionalTypes.includes(type)) return FacilityCategory.FUNCTIONAL;
  if (infrastructureTypes.includes(type)) return FacilityCategory.INFRASTRUCTURE;
  return FacilityCategory.OTHER;
}

// Check if facility category can have storage
export function canHaveStorage(category: FacilityCategory): boolean {
  return category === FacilityCategory.RAW_MATERIAL_PRODUCTION || 
         category === FacilityCategory.FUNCTIONAL;
}

// Calculate facility space based on level
export function calculateFacilitySpace(
  config: FacilitySpaceConfig,
  level: number
): SpaceCalculationResult {
  const category = getFacilityCategory(config.facilityType);
  
  // Infrastructure and Other facilities have no storage space
  if (!canHaveStorage(category)) {
    return {
      facilityType: config.facilityType,
      level,
      baseSpace: 0,
      additionalSpace: 0,
      totalSpace: 0,
      maxSpace: 0,
      effectiveSpace: 0,
    };
  }
  
  const baseSpace = Number(config.initialSpace);
  const spacePerLevel = Number(config.spacePerLevel);
  const maxSpace = Number(config.maxSpace);
  
  const additionalSpace = spacePerLevel * (level - 1);
  const totalSpace = baseSpace + additionalSpace;
  const effectiveSpace = Math.min(totalSpace, maxSpace);
  
  return {
    facilityType: config.facilityType,
    level,
    baseSpace,
    additionalSpace,
    totalSpace,
    maxSpace: maxSpace,
    effectiveSpace,
  };
}

// Group facilities by category
export function groupFacilitiesByCategory(configs: FacilitySpaceConfig[]): Record<FacilityCategory, FacilitySpaceConfig[]> {
  const grouped: Record<FacilityCategory, FacilitySpaceConfig[]> = {
    [FacilityCategory.RAW_MATERIAL_PRODUCTION]: [],
    [FacilityCategory.FUNCTIONAL]: [],
    [FacilityCategory.INFRASTRUCTURE]: [],
    [FacilityCategory.OTHER]: [],
  };
  
  configs.forEach(config => {
    const category = getFacilityCategory(config.facilityType);
    grouped[category].push(config);
  });
  
  return grouped;
}