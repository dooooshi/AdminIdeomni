export interface ManagerRawMaterial {
  id: number;
  materialNumber: number;
  name: string;
  nameEn?: string;
  nameZh?: string;
  origin: string;
  waterRequired: number;
  powerRequired: number;
  totalCost: number;
  goldCost: number;
  carbonEmission: number;
  isActive?: boolean;
}

export interface ManagerCraftCategory {
  id: number;
  categoryType: string;
  technologyLevel: string;
  name?: string;
  nameEn?: string;
  nameZh?: string;
  fixedWaterCost: number | string;
  fixedPowerCost: number | string;
  fixedGoldCost: number | string;
  variableWaterPercent: number | string;
  variablePowerPercent: number | string;
  variableGoldPercent: number | string;
  yieldPercentage: number | string;
  isActive: boolean;
}

export interface ManagerProductFormulaMaterial {
  id?: number;
  rawMaterialId: number;
  rawMaterial?: ManagerRawMaterial;
  quantity: number;
  unit?: string;
  materialCost?: number;
}

export interface ManagerProductFormulaCraftCategory {
  id?: number;
  craftCategoryId: number;
  craftCategory?: ManagerCraftCategory;
}

export interface ManagerProductFormula {
  id: number;
  formulaNumber: number;
  productName: string;
  productDescription?: string;
  activityId: string;
  activity?: {
    id: string;
    name: string;
  };
  totalMaterialCost: number;
  totalSetupWaterCost: number;
  totalSetupPowerCost: number;
  totalSetupGoldCost: number;
  totalWaterPercent: number;
  totalPowerPercent: number;
  totalGoldPercent: number;
  totalPercent: number;
  productFormulaCarbonEmission: number;
  materials: ManagerProductFormulaMaterial[];
  craftCategories: ManagerProductFormulaCraftCategory[];
  materialCount?: number;
  craftCategoryCount?: number;
  usedInMTOType1?: boolean;
  usedInMTOType2?: boolean;
  mtoUsage?: {
    type1Count: number;
    type2Count: number;
    totalRequirements: number;
  };
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface CreateManagerProductFormulaDto {
  productName: string;
  productDescription?: string;
  materials: Array<{
    rawMaterialId: number;
    quantity: number;
    unit?: string;
  }>;
  craftCategoryIds: number[];
}

export interface UpdateManagerProductFormulaDto {
  productName?: string;
  productDescription?: string;
  materials?: Array<{
    rawMaterialId: number;
    quantity: number;
    unit?: string;
  }>;
  craftCategoryIds?: number[];
  isActive?: boolean;
}

export interface ManagerProductFormulaSearchParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  isActive?: boolean;
  includeDeleted?: boolean;
  includeRelations?: boolean;
  sort?: 'formulaNumber' | 'productName' | 'createdAt' | 'totalMaterialCost';
  order?: 'asc' | 'desc';
}

export interface ManagerProductFormulaSearchResponse {
  items: ManagerProductFormula[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CloneManagerProductFormulaDto {
  productName?: string;
  targetActivityId?: string;
}

export interface ValidateFormulaDto {
  teamFormulaId: number;
  quantity: number;
}

export interface ValidateFormulaResponse {
  isValid: boolean;
  matches: {
    materials: boolean;
    craftCategories: boolean;
    quantities: boolean;
  };
  details: {
    materialMatch: string;
    categoryMatch: string;
    totalCost: number;
  };
}

export interface RawMaterialSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  origin?: 'MINE' | 'QUARRY' | 'FOREST' | 'FARM' | 'RANCH' | 'FISHERY' | 'SHOPS';
  sortBy?: 'materialNumber' | 'nameEn' | 'nameZh' | 'totalCost';
  sortOrder?: 'asc' | 'desc';
}

export interface RawMaterialSearchResponse {
  items: ManagerRawMaterial[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CraftCategorySearchParams {
  categoryType?: string;
  technologyLevel?: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4';
}

export interface ApiResponse<T> {
  success: boolean;
  businessCode: number;
  message: string;
  data: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  extra?: any;
}

export interface CostCalculation {
  totalMaterialCost: number;
  totalSetupWaterCost: number;
  totalSetupPowerCost: number;
  totalSetupGoldCost: number;
  totalWaterPercent: number;
  totalPowerPercent: number;
  totalGoldPercent: number;
  totalPercent: number;
  productFormulaCarbonEmission: number;
}