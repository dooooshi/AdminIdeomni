// Product Production System Types

// Factory Types
export interface Factory {
  id: string;
  name: string;
  level: number;
  location: {
    q: number;
    r: number;
    tileId: string;
    landType: string;
  };
  space: {
    totalSpace: number;
    usedSpace: number;
    availableSpace: number;
    rawMaterialSpace: number;
    productSpace: number;
  };
  infrastructure: {
    hasWaterConnection: boolean;
    waterProvider?: {
      providerId: string;
      providerName: string;
      unitPrice: number;
    };
    hasPowerConnection: boolean;
    powerProvider?: {
      providerId: string;
      providerName: string;
      unitPrice: number;
    };
  };
  productionCapability?: {
    formulaId: number;
    canProduce: boolean;
    maxQuantity: number;
    missingMaterials?: Array<{
      materialId: string;
      materialName: string;
      required: number;
      available: number;
      shortage: number;
    }>;
  };
}

// Cost Calculation Types
export interface CalculateCostRequest {
  factoryId: string;
  formulaId: number;
  quantity: number;
}

export interface ProductionCosts {
  materialCostA: number;
  setupCosts: {
    water: number;
    power: number;
    gold: number;
  };
  variableCosts: {
    waterPercent: number;
    powerPercent: number;
    goldPercent: number;
  };
  finalCosts: {
    waterConsumption: number;
    waterCost: number;
    powerConsumption: number;
    powerCost: number;
    goldCost: number;
    totalCost: number;
  };
  breakdown: Array<{
    component: string;
    amount: number;
    percentage: number;
  }>;
}

export interface ResourceRequirements {
  materials: Array<{
    rawMaterialId: string;
    materialName: string;
    quantityRequired: number;
    quantityAvailable: number;
    unitCost: number;
    totalCost: number;
    sufficient: boolean;
  }>;
  water: {
    unitsRequired: number;
    unitPrice: number;
    totalCost: number;
    providerId: string;
    providerName: string;
  };
  power: {
    unitsRequired: number;
    unitPrice: number;
    totalCost: number;
    providerId: string;
    providerName: string;
  };
}

export interface ExpectedOutput {
  inputQuantity: number;
  yields: Array<{
    craftCategoryId: string;
    categoryName: string;
    level: number;
    yieldPercentage: number;
  }>;
  combinedYield: number;
  expectedQuantity: number;
  carbonEmission: number;
}

export interface SpaceImpact {
  currentUsedSpace: number;
  currentAvailableSpace: number;
  materialSpaceToFree: number;
  productSpaceNeeded: number;
  netSpaceChange: number;
  spaceAfterProduction: number;
  hasEnoughSpace: boolean;
}

export interface ValidationStatus {
  canProduce: boolean;
  validations: Array<{
    check: string;
    passed: boolean;
    message?: string;
  }>;
}

export interface CostCalculationResponse {
  success: boolean;
  data: {
    costs: ProductionCosts;
    resources: ResourceRequirements;
    output: ExpectedOutput;
    space: SpaceImpact;
    validation: ValidationStatus;
  };
}

// Production Request Types
export interface ProductionRequest {
  factoryId: string;
  formulaId: number;
  quantity: number;
  costConfirmation: {
    expectedCost: number;
    acceptPrice: boolean;
  };
}

export interface ProductionResult {
  requestedQuantity: number;
  producedQuantity: number;
  actualYield: number;
  materialsConsumed: Array<{
    materialId: string;
    materialName: string;
    quantityConsumed: number;
  }>;
  resourcesConsumed: {
    water: number;
    power: number;
    gold: number;
  };
  totalCost: number;
  carbonEmissionGenerated: number;
  spaceChanges: {
    before: number;
    after: number;
    netChange: number;
  };
}

export interface ProductionHistorySummary {
  id: string;
  timestamp: string;
  duration: number;
  factoryName: string;
  formulaName: string;
}

export interface ProductionResponse {
  success: boolean;
  data: {
    productionId: string;
    status: 'SUCCESS' | 'FAILED' | 'PROCESSING';
    result: ProductionResult;
    history: ProductionHistorySummary;
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// History Types
export interface ProductionHistoryItem {
  id: string;
  productionNumber: number;
  factory: {
    id: string;
    name: string;
    level: number;
  };
  formula: {
    id: string;
    name: string;
    formulaNumber: number;
  };
  quantities: {
    requested: number;
    produced: number;
    yield: number;
  };
  costs: {
    materials: number;
    water: number;
    power: number;
    gold: number;
    total: number;
  };
  resources: {
    waterConsumed: number;
    powerConsumed: number;
  };
  impact: {
    carbonEmission: number;
    spaceChange: number;
  };
  status: string;
  failureReason?: string;
  timestamps: {
    started: string;
    completed: string;
    duration: number;
  };
  initiatedBy: {
    userId: string;
    username: string;
  };
}

export interface HistoryParams {
  factoryId?: string;
  formulaId?: number;
  status?: 'SUCCESS' | 'FAILED' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface HistoryResponse {
  success: boolean;
  data: {
    history: ProductionHistoryItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    summary: {
      totalProductions: number;
      successfulProductions: number;
      totalQuantityProduced: number;
      totalCost: number;
      totalCarbonEmission: number;
      averageYield: number;
    };
  };
}

// Factory List Response
export interface FactoryListResponse {
  success: boolean;
  data: {
    factories: Factory[];
    totalCount: number;
  };
}

// Error Codes
export enum ProductionErrorCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  FACTORY_NOT_FOUND = 'FACTORY_NOT_FOUND',
  FORMULA_NOT_FOUND = 'FORMULA_NOT_FOUND',
  INSUFFICIENT_MATERIALS = 'INSUFFICIENT_MATERIALS',
  INSUFFICIENT_SPACE = 'INSUFFICIENT_SPACE',
  NO_INFRASTRUCTURE = 'NO_INFRASTRUCTURE',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  FACTORY_INACTIVE = 'FACTORY_INACTIVE',
  PRODUCTION_IN_PROGRESS = 'PRODUCTION_IN_PROGRESS',
  UNAUTHORIZED = 'UNAUTHORIZED',
  ACTIVITY_ENDED = 'ACTIVITY_ENDED'
}

// API Response Type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}