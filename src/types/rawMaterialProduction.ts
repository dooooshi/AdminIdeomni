// Raw Material Production Types

export enum ProductionStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}

export enum ConsumptionPurpose {
  RAW_MATERIAL_PRODUCTION = 'RAW_MATERIAL_PRODUCTION',
  PRODUCT_MANUFACTURING = 'PRODUCT_MANUFACTURING'
}

export interface RawMaterialProduction {
  id: string;
  facilityInstanceId: string;
  rawMaterialId: number;
  quantity: number;
  productionNumber: string;
  waterConsumed: number;
  powerConsumed: number;
  waterCost: number;
  powerCost: number;
  materialBaseCost: number;
  totalCost: number;
  spaceUsed: number;
  status: ProductionStatus;
  failureReason?: string;
  producedAt: Date;
  teamId: string;
  activityId: string;
  initiatedBy: string;
  transactionIds?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductionRequest {
  facilityId: string;
  rawMaterialId: number;
  quantity: number;
}

export interface ProductionEstimate {
  feasible: boolean;
  issues: string[];
  requirements: {
    water: ResourceRequirement;
    power: ResourceRequirement;
    space: SpaceRequirement;
    funds: FundsRequirement;
  };
  costs: ProductionCosts;
}

export interface ResourceRequirement {
  needed: number;
  available: boolean;
  unitPrice: number;
  totalCost: number;
  provider?: ProviderInfo;
}

export interface SpaceRequirement {
  needed: number;
  available: number;
  sufficient: boolean;
}

export interface FundsRequirement {
  needed: number;
  available: number;
  sufficient: boolean;
}

export interface ProductionCosts {
  waterCost: number;
  powerCost: number;
  materialBaseCost: number;
  totalCost: number;
  costPerUnit?: number;
}

export interface ProviderInfo {
  facilityId: string;
  facilityName: string;
  teamId: string;
  teamName: string;
}

export interface ProductionResult {
  success: boolean;
  businessCode: number;
  message: string;
  data?: {
    productionId: string;
    productionNumber: string;
    status: ProductionStatus;
    facility: FacilityInfo;
    material: MaterialInfo;
    resources: ResourceConsumptionDetails;
    costs: ProductionCosts;
    producedAt: string;
    spaceUsed: number;
    transactions?: TransactionInfo[];
  };
  error?: string;
}

export interface FacilityInfo {
  id: string;
  name: string;
  type: string;
  level: number;
  location?: {
    q: number;
    r: number;
  };
}

export interface MaterialInfo {
  id: number;
  name: string;
  quantity: number;
  origin?: string;
}

export interface ResourceConsumptionDetails {
  water: ResourceDetail;
  power: ResourceDetail;
}

export interface ResourceDetail {
  consumed: number;
  unitPrice: number;
  totalCost: number;
  provider: ProviderInfo;
}

export interface TransactionInfo {
  id: string;
  type: 'WATER' | 'POWER';
  amount: number;
  reference: string;
}

export interface ProductionHistoryFilter {
  facilityId?: string;
  teamId?: string;
  status?: ProductionStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RawMaterial {
  id: number;
  materialNumber: number;
  origin: string;
  name: string;
  totalCost: number;
  goldCost: number;
  carbonEmission: number;
  isActive: boolean;
  requirements: {
    water: number;
    power: number;
    gold: number;
  };
  waterRequired?: number; // Deprecated - use requirements.water
  powerRequired?: number; // Deprecated - use requirements.power
  requiredFacilityType?: string;
  requiredConnections?: string[];
  spacePerUnit?: number;
  examples?: MaterialExamples;
}

export interface MaterialExamples {
  small: MaterialExample;
  medium: MaterialExample;
  large: MaterialExample;
}

export interface MaterialExample {
  quantity: number;
  waterNeeded: number;
  powerNeeded: number;
  totalCost: number;
  spaceRequired: number;
}

export interface RawMaterialFilter {
  origin?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}