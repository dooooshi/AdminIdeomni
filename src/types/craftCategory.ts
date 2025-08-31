// Craft Category Type Definitions

// Production Technology Types (7 categories)
export enum CraftCategoryType {
  MECHANICAL_MANUFACTURING = 'MECHANICAL_MANUFACTURING',
  MATERIALS_PROCESSING = 'MATERIALS_PROCESSING',
  BIOCHEMICAL = 'BIOCHEMICAL',
  ELECTRONIC_EQUIPMENT = 'ELECTRONIC_EQUIPMENT',
  ENERGY_UTILIZATION = 'ENERGY_UTILIZATION',
  CUTTING_TEXTILE = 'CUTTING_TEXTILE',
  FOOD_PROCESSING = 'FOOD_PROCESSING'
}

// Technology Levels (4 levels)
export enum TechnologyLevel {
  LEVEL_1 = 'LEVEL_1',
  LEVEL_2 = 'LEVEL_2',
  LEVEL_3 = 'LEVEL_3',
  LEVEL_4 = 'LEVEL_4'
}

// Main Craft Category interface
export interface CraftCategory {
  id: number;
  categoryType: CraftCategoryType;
  technologyLevel: TechnologyLevel;
  nameEn: string;
  nameZh: string;
  
  // Fixed Costs (per production cycle)
  fixedWaterCost: number;
  fixedPowerCost: number;
  fixedGoldCost: number;
  
  // Variable Costs (percentage of production volume)
  variableWaterPercent: number;
  variablePowerPercent: number;
  variableGoldPercent: number;
  
  // Production Efficiency
  yieldPercentage: number;
  
  // Metadata
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// Cost breakdown interface for calculations
export interface CraftCategoryCosts {
  fixed: {
    water: number;
    power: number;
    gold: number;
  };
  variable: {
    water: number;
    power: number;
    gold: number;
  };
}

// Request interfaces
export interface CreateCraftCategoryRequest {
  categoryType: CraftCategoryType;
  technologyLevel: TechnologyLevel;
  nameEn: string;
  nameZh: string;
  fixedWaterCost: number;
  fixedPowerCost: number;
  fixedGoldCost: number;
  variableWaterPercent: number;
  variablePowerPercent: number;
  variableGoldPercent: number;
  yieldPercentage: number;
}

export interface UpdateCraftCategoryRequest {
  nameEn?: string;
  nameZh?: string;
  fixedWaterCost?: number;
  fixedPowerCost?: number;
  fixedGoldCost?: number;
  variableWaterPercent?: number;
  variablePowerPercent?: number;
  variableGoldPercent?: number;
  yieldPercentage?: number;
  isActive?: boolean;
}

// Search and filter parameters
export interface CraftCategorySearchParams {
  page?: number;
  limit?: number;
  categoryType?: CraftCategoryType;
  technologyLevel?: TechnologyLevel;
  sort?: string;
  order?: 'asc' | 'desc';
  isActive?: boolean;
  search?: string;
}

// Response interfaces
export interface CraftCategorySearchResponse {
  items: CraftCategory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CraftCategoryStatistics {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  categoriesByType: Record<CraftCategoryType, number>;
  categoriesByLevel: Record<TechnologyLevel, number>;
}

// Comparison interface
export interface CraftCategoryComparison {
  categories: CraftCategory[];
  maxValues: {
    fixedWaterCost: number;
    fixedPowerCost: number;
    fixedGoldCost: number;
    variableWaterPercent: number;
    variablePowerPercent: number;
    variableGoldPercent: number;
    yieldPercentage: number;
  };
  minValues: {
    fixedWaterCost: number;
    fixedPowerCost: number;
    fixedGoldCost: number;
    variableWaterPercent: number;
    variablePowerPercent: number;
    variableGoldPercent: number;
    yieldPercentage: number;
  };
}

// Cost calculation interface
export interface ProductionCostCalculation {
  craftCategoryId: number;
  productionVolume: number;
  fixedCosts: {
    water: number;
    power: number;
    gold: number;
    total: number;
  };
  variableCosts: {
    water: number;
    power: number;
    gold: number;
    total: number;
  };
  totalCost: number;
  expectedYield: number;
  costPerUnit: number;
}

// Validation constraints
export const CRAFT_CATEGORY_CONSTRAINTS = {
  yieldPercentage: {
    min: 50,
    max: 100
  },
  costs: {
    min: 0,
    max: 999999
  },
  percentages: {
    min: 0,
    max: 100
  }
};

// Helper function to get display name for category type
export function getCraftCategoryTypeDisplayName(type: CraftCategoryType): { en: string; zh: string } {
  const displayNames: Record<CraftCategoryType, { en: string; zh: string }> = {
    [CraftCategoryType.MECHANICAL_MANUFACTURING]: { en: 'Mechanical Manufacturing', zh: '机械制造' },
    [CraftCategoryType.MATERIALS_PROCESSING]: { en: 'Materials Processing', zh: '材料加工' },
    [CraftCategoryType.BIOCHEMICAL]: { en: 'Biochemical', zh: '生物化学' },
    [CraftCategoryType.ELECTRONIC_EQUIPMENT]: { en: 'Electronic Equipment', zh: '电子器械' },
    [CraftCategoryType.ENERGY_UTILIZATION]: { en: 'Energy Utilization', zh: '能源利用' },
    [CraftCategoryType.CUTTING_TEXTILE]: { en: 'Cutting & Textile', zh: '裁剪纺织' },
    [CraftCategoryType.FOOD_PROCESSING]: { en: 'Food Processing', zh: '食品加工' }
  };
  return displayNames[type];
}

// Helper function to get display name for technology level
export function getTechnologyLevelDisplayName(level: TechnologyLevel): { en: string; zh: string } {
  const displayNames: Record<TechnologyLevel, { en: string; zh: string }> = {
    [TechnologyLevel.LEVEL_1]: { en: 'Level 1 - Basic', zh: '等级1 - 基础' },
    [TechnologyLevel.LEVEL_2]: { en: 'Level 2 - Standard', zh: '等级2 - 标准' },
    [TechnologyLevel.LEVEL_3]: { en: 'Level 3 - Advanced', zh: '等级3 - 高级' },
    [TechnologyLevel.LEVEL_4]: { en: 'Level 4 - Peak', zh: '等级4 - 顶级' }
  };
  return displayNames[level];
}