export interface RawMaterial {
  id: number;
  materialNumber: number;
  name?: string;
  nameEn?: string;
  nameZh?: string;
  origin: string;
  totalCost: number;
  unitCost?: number;
  waterCost?: number;
  waterRequired?: number;
  powerCost?: number;
  powerRequired?: number;
  goldCost?: number;
  carbonEmission: number;
  unit?: string;
  isActive: boolean;
  totalQuantity?: number;
  totalSpaceOccupied?: number;
}

export interface CraftCategory {
  id: number;
  categoryType: string;
  technologyLevel: string;
  name?: string;  // Combined name field from API
  nameEn?: string;
  nameZh?: string;
  yieldPercentage: number;
  costs: {
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
  };
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Legacy fields for backward compatibility
  fixedWaterCost?: number;
  fixedPowerCost?: number;
  fixedGoldCost?: number;
  variableWaterPercent?: number;
  variablePowerPercent?: number;
  variableGoldPercent?: number;
}

export interface MaterialRequirement {
  id?: number;
  rawMaterialId: number;
  rawMaterial?: RawMaterial;
  quantity: number;
  unit?: string;
  materialCost?: number;
  totalCost?: number;
}

export interface ProductFormulaCraftCategory {
  id?: number;
  craftCategoryId: number;
  craftCategory?: CraftCategory;
}

export interface ProductFormula {
  id: number;
  formulaNumber: number;
  productName?: string;
  productDescription?: string;
  activityId?: string;
  teamId?: string;
  
  totalMaterialCost: number;
  totalSetupWaterCost: number;
  totalSetupPowerCost: number;
  totalSetupGoldCost: number;
  totalWaterPercent: number;
  totalPowerPercent: number;
  totalGoldPercent: number;
  totalPercent: number;
  productFormulaCarbonEmission: number;
  
  materials: MaterialRequirement[];
  craftCategories: ProductFormulaCraftCategory[];
  
  materialCount?: number;
  craftCategoryCount?: number;
  
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductFormulaDto {
  productName: string;
  productDescription?: string;
  craftCategories: Array<{
    craftCategoryId: number;
  }>;
  materials: Array<{
    rawMaterialId: number;
    quantity: number;
  }>;
}

export interface UpdateProductFormulaDto extends Partial<CreateProductFormulaDto> {}

export interface ProductFormulaSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  isActive?: boolean;
}

export interface ProductFormulaSearchResponse {
  items: ProductFormula[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  businessCode: number;
  message: string;
  data: T;
  timestamp?: string;
  path?: string;
  extra?: Record<string, unknown>;
}

export interface CostCalculation {
  waterCost: number;
  powerCost: number;
  goldCost: number;
  carbonEmission: number;
  totalMaterialCost: number;
}

export interface ProductionCostCalculation {
  id?: number;
  productFormulaId: number;
  batchQuantity: number;
  rawMaterialTotalCost: number;
  finalWaterCost: number;
  finalPowerCost: number;
  finalGoldCost: number;
  productionStarted?: boolean;
  productionCompleted?: boolean;
  calculatedAt?: string;
  startedAt?: string;
  completedAt?: string;
}

export const CraftCategoryTypes = {
  MECHANICAL_MANUFACTURING: 'MECHANICAL_MANUFACTURING',
  MATERIALS_PROCESSING: 'MATERIALS_PROCESSING',
  BIOCHEMICAL: 'BIOCHEMICAL',
  ELECTRONIC_EQUIPMENT: 'ELECTRONIC_EQUIPMENT',
  ENERGY_UTILIZATION: 'ENERGY_UTILIZATION',
  CUTTING_TEXTILE: 'CUTTING_TEXTILE',
  FOOD_PROCESSING: 'FOOD_PROCESSING'
} as const;

export const TechnologyLevels = {
  LEVEL_1: 'LEVEL_1',
  LEVEL_2: 'LEVEL_2',
  LEVEL_3: 'LEVEL_3',
  LEVEL_4: 'LEVEL_4'
} as const;

export const FacilityOrigins = {
  RANCH: 'RANCH',
  FARM: 'FARM',
  FOREST: 'FOREST',
  FISHERY: 'FISHERY',
  MINE: 'MINE',
  QUARRY: 'QUARRY',
  SHOPS: 'SHOPS'
} as const;

export type CraftCategoryType = typeof CraftCategoryTypes[keyof typeof CraftCategoryTypes];
export type TechnologyLevel = typeof TechnologyLevels[keyof typeof TechnologyLevels];
export type FacilityOrigin = typeof FacilityOrigins[keyof typeof FacilityOrigins];