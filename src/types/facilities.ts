// Facility Types for Student Building System
// Based on the API documentation from docs/facility/

// ==================== ENUMS ====================

export enum FacilityType {
  // Raw Material Production (6 types)
  MINE = 'MINE',
  QUARRY = 'QUARRY', 
  FOREST = 'FOREST',
  FARM = 'FARM',
  RANCH = 'RANCH',
  FISHERY = 'FISHERY',
  
  // Functional Facilities (3 types)
  FACTORY = 'FACTORY',
  MALL = 'MALL',
  WAREHOUSE = 'WAREHOUSE',
  
  // Infrastructure (4 types)
  WATER_PLANT = 'WATER_PLANT',
  POWER_PLANT = 'POWER_PLANT',
  BASE_STATION = 'BASE_STATION',
  FIRE_STATION = 'FIRE_STATION',
  
  // Other/Community (4 types)
  SCHOOL = 'SCHOOL',
  HOSPITAL = 'HOSPITAL',
  PARK = 'PARK',
  CINEMA = 'CINEMA',
}

export enum FacilityInstanceStatus {
  UNDER_CONSTRUCTION = 'UNDER_CONSTRUCTION',
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  DAMAGED = 'DAMAGED',
  DECOMMISSIONED = 'DECOMMISSIONED',
}

export enum LandType {
  MARINE = 'MARINE',
  COASTAL = 'COASTAL',
  PLAIN = 'PLAIN',
}

export enum FacilityCategory {
  RAW_MATERIAL_PRODUCTION = 'RAW_MATERIAL_PRODUCTION',
  FUNCTIONAL = 'FUNCTIONAL',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  OTHER = 'OTHER',
}

// ==================== INTERFACES ====================

// Facility Instance (built by students)
export interface TileFacilityInstance {
  id: string;
  facilityType: FacilityType;
  level: number;
  status: FacilityInstanceStatus;
  tileId: number;
  teamId: string;
  buildGoldCost: number;
  buildCarbonCost: number;
  totalUpgradeCost: number;
  constructionStarted: string;
  constructionCompleted?: string;
  productionRate?: number;
  capacity?: number;
  efficiency?: number;
  description?: string;
  builder: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  upgradeHistory: UpgradeHistoryRecord[];
  createdAt: string;
  updatedAt: string;
}

// Facility Configuration (what can be built)
export interface TileFacilityBuildConfig {
  id: string;
  landType: LandType;
  facilityType: FacilityType;
  requiredGold: number;
  requiredCarbon: number;
  requiredAreas: number;
  maxLevel: number;
  upgradeGoldCost: number;
  upgradeCarbonCost: number;
  upgradeMultiplier: number;
  isAllowed: boolean;
  maxInstances: number;
  upgradeData?: UpgradeDataConfig;
  buildData?: BuildDataConfig;
}

// Upgrade History Record
export interface UpgradeHistoryRecord {
  fromLevel: number;
  toLevel: number;
  goldCost: number;
  carbonCost: number;
  totalCost: number;
  upgradedAt: string;
  upgradedBy: string;
  description?: string;
}

// Configuration Data Structures
export interface UpgradeDataConfig {
  [level: string]: {
    capacity?: number;
    efficiency?: number;
    productionRate?: number;
    energyConsumption?: number;
    workerRequirements?: number;
    benefits?: string[];
  };
}

export interface BuildDataConfig {
  buildTime?: string;
  requirements?: string[];
  benefits?: string[];
  specialFeatures?: string[];
  environmentalImpact?: {
    carbonFootprint: number;
    waterUsage: number;
    wasteProduction: number;
  };
  compatibility?: {
    synergiesWith?: FacilityType[];
    conflictsWith?: FacilityType[];
  };
}

// ==================== REQUEST/RESPONSE TYPES ====================

// Build Facility Request
export interface BuildFacilityRequest {
  tileId: number;
  facilityType: FacilityType;
  description?: string;
  maxGoldCost?: number;
  maxCarbonCost?: number;
  metadata?: Record<string, any>;
}

// Upgrade Facility Request
export interface UpgradeFacilityRequest {
  targetLevel: number;
  maxUpgradeCost?: number;
}

// Facility Query Parameters
export interface FacilityInstanceQueryParams {
  page?: number;
  pageSize?: number;
  tileId?: number;
  facilityType?: FacilityType;
  status?: FacilityInstanceStatus;
}

// Build Validation Response
export interface BuildValidationResponse {
  canBuild: boolean;
  goldCost: number;
  carbonCost: number;
  totalCost: number;
  teamGoldBalance: number;
  teamCarbonBalance: number;
  requiredAreas: number;
  availableLandArea: number;
  currentInstances: number;
  maxInstances: number;
  errors: string[];
}

// Team Facility Summary
export interface TeamFacilitySummary {
  teamId: string;
  teamName: string;
  totalFacilities: number;
  totalBuildCost: number;
  totalUpgradeCost: number;
  facilitiesByType: Record<FacilityType, number>;
  facilitiesByStatus: Record<FacilityInstanceStatus, number>;
  avgLevel: number;
  lastBuiltAt?: string;
}

// Upgrade Cost Calculation - Expected TypeScript interface
export interface UpgradeCostCalculation {
  facilityType: FacilityType;
  landType: LandType;
  fromLevel: number;
  toLevel: number;
  baseCosts: {
    upgradeGoldCost: number;
    upgradeCarbonCost: number;
    upgradeMultiplier: number;
  };
  levelCosts: {
    level: number;
    goldCost: number;
    carbonCost: number;
    totalCost: number;
  }[];
  totalUpgradeCost: {
    gold: number;
    carbon: number;
    total: number;
  };
  cumulativeCosts: {
    [level: string]: {
      gold: number;
      carbon: number;
      total: number;
    };
  };
  estimatedBenefits?: {
    [level: string]: {
      capacityIncrease: string;
      efficiencyIncrease: string;
      productionBoost: string;
    };
  };
}

// Upgrade Cost Calculation - Actual API Response Structure
export interface UpgradeCostApiResponse {
  facilityType: FacilityType;
  landType: LandType;
  currentLevel: number;
  targetLevel: number;
  upgradeCosts: {
    level: number;
    goldCost: number;
    carbonCost: number;
  }[];
  totalCost: {
    gold: number;
    carbon: number;
  };
}

// Available Configurations Response
export interface AvailableConfigsResponse {
  data: TileFacilityBuildConfig[];
  count: number;
  templateId: number;
  templateName: string;
}

// Configuration Summary
export interface ConfigurationSummary {
  templateId: number;
  templateName: string;
  totalConfigurations: number;
  configurationsByLandType: {
    [key in LandType]: {
      count: number;
      facilities: FacilityType[];
      categories: FacilityCategory[];
      costRange: {
        min: { facility: FacilityType; cost: number };
        max: { facility: FacilityType; cost: number };
      };
    };
  };
  configurationsByCategory: {
    [key in FacilityCategory]: {
      count: number;
      facilities: FacilityType[];
      averageCost: number;
      upgradeability: {
        averageMaxLevel: number;
        highestLevel: { facility: FacilityType; maxLevel: number };
      };
    };
  };
  economicAnalysis: {
    cheapestToBuild: {
      facility: FacilityType;
      landType: LandType;
      cost: number;
    };
    mostExpensive: {
      facility: FacilityType;
      landType: LandType;
      cost: number;
    };
    bestValueUpgrades: {
      facility: FacilityType;
      landType: LandType;
      upgradeMultiplier: number;
      reason: string;
    }[];
    recommendations: {
      beginnerFriendly: FacilityType[];
      economicDrivers: FacilityType[];
      infrastructure: FacilityType[];
      specialPurpose: FacilityType[];
    };
  };
}

// Paginated Response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  businessCode?: number;
  message: string;
  data: T;
  timestamp: string;
  path?: string;
}

// ==================== UTILITY TYPES ====================

// Facility Category Mapping
export type FacilityTypesByCategory = {
  [FacilityCategory.RAW_MATERIAL_PRODUCTION]: [
    FacilityType.MINE,
    FacilityType.QUARRY,
    FacilityType.FOREST,
    FacilityType.FARM,
    FacilityType.RANCH,
    FacilityType.FISHERY
  ];
  [FacilityCategory.FUNCTIONAL]: [
    FacilityType.FACTORY,
    FacilityType.MALL,
    FacilityType.WAREHOUSE
  ];
  [FacilityCategory.INFRASTRUCTURE]: [
    FacilityType.WATER_PLANT,
    FacilityType.POWER_PLANT,
    FacilityType.BASE_STATION,
    FacilityType.FIRE_STATION
  ];
  [FacilityCategory.OTHER]: [
    FacilityType.SCHOOL,
    FacilityType.HOSPITAL,
    FacilityType.PARK,
    FacilityType.CINEMA
  ];
};

// Land Type Compatibility
export type FacilityLandCompatibility = {
  [key in FacilityType]: LandType[];
};

// Resource Requirements
export interface ResourceRequirements {
  gold: number;
  carbon: number;
  totalCost: number;
}

// Facility Performance Metrics
export interface FacilityPerformanceMetrics {
  efficiency: number;
  productivity: number;
  maintenanceScore: number;
  utilizationRate: number;
  roi: number;
}

// Filter Options
export interface FacilityFilterOptions {
  facilityTypes: FacilityType[];
  categories: FacilityCategory[];
  landTypes: LandType[];
  statuses: FacilityInstanceStatus[];
  levels: number[];
}

// Sort Options
export type FacilitySortField = 
  | 'name'
  | 'facilityType'
  | 'level'
  | 'status'
  | 'buildCost'
  | 'totalUpgradeCost'
  | 'createdAt'
  | 'updatedAt';

export type SortOrder = 'asc' | 'desc';

export interface FacilitySortOptions {
  field: FacilitySortField;
  order: SortOrder;
}