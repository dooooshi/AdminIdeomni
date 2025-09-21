export interface MtoType1Status {
  DRAFT: 'DRAFT';
  RELEASED: 'RELEASED';
  IN_PROGRESS: 'IN_PROGRESS';
  SETTLING: 'SETTLING';
  SETTLED: 'SETTLED';
  CANCELLED: 'CANCELLED';
}

export interface MtoType1Requirement {
  id: number;
  activityId: string;
  managerProductFormulaId: number;
  managerProductName?: string;
  purchaseGoldPrice: number | string;
  basePurchaseNumber: number;
  releaseTime: string;
  settlementTime: string;
  overallPurchaseNumber: number;
  overallPurchaseBudget: number | string;
  baseCountPopulationNumber: number;
  status: keyof MtoType1Status;
  actualSpentBudget?: number | string | null;
  actualPurchasedNumber: number;
  fulfillmentRate: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  settlementCompletedAt?: string | null;
  requirementName?: string;
  metadata?: {
    name?: string;
    description?: string;
    notes?: string;
  };
  managerProductFormula?: {
    id: number;
    formulaNumber: number;
    productName: string;
    productDescription?: string;
    activityId: string;
    totalMaterialCost: number | string;
    totalSetupWaterCost: number;
    totalSetupPowerCost: number;
    totalSetupGoldCost: number | string;
    totalWaterPercent: number | string;
    totalPowerPercent: number | string;
    totalGoldPercent: number | string;
    totalPercent: number | string;
    productFormulaCarbonEmission: number | string;
    isActive: boolean;
    isDeleted: boolean;
    deletedAt?: string | null;
    deletedBy?: string | null;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy?: string | null;
    materials?: Array<{
      id: number;
      managerProductFormulaId: number;
      rawMaterialId: number;
      quantity: number | string;
      unit: string;
      materialCost: number | string;
      createdAt: string;
      updatedAt: string;
      rawMaterial?: {
        id: number;
        materialNumber: number;
        origin: string;
        nameEn: string;
        nameZh: string;
        waterRequired: number | string;
        powerRequired: number | string;
        totalCost: number | string;
        goldCost: number | string;
        carbonEmission: number | string;
        isActive: boolean;
        isDeleted: boolean;
        deletedAt?: string | null;
        deletedBy?: string | null;
        deletionReason?: string | null;
        createdAt: string;
        createdBy: string;
        updatedAt: string;
        lastModifiedBy?: string | null;
      };
    }>;
    craftCategories?: Array<{
      id: number;
      managerProductFormulaId: number;
      craftCategoryId: number;
      createdAt: string;
      updatedAt: string;
      craftCategory?: {
        id: number;
        categoryType: string;
        technologyLevel: string;
        nameEn: string;
        nameZh: string;
        fixedWaterCost: number | string;
        fixedPowerCost: number | string;
        fixedGoldCost: number | string;
        variableWaterPercent: number | string;
        variablePowerPercent: number | string;
        variableGoldPercent: number | string;
        yieldPercentage: number | string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
        createdBy?: string | null;
        updatedBy?: string | null;
      };
    }>;
  };
  // Additional optional properties for UI display
  totalAdjustedRequirement?: number;
  totalDeliveredNumber?: number;
  uniqueTeamsDelivered?: number;
  totalSettledNumber?: number;
  cancellationReason?: string;
  cancelledAt?: string;
}

export interface MtoType1TileRequirement {
  id: number;
  requirementId: number;
  tileId: string;
  tilePopulation: number;
  calculatedRequirement: number;
  adjustedRequirement: number;
  deliveredQuantity: number;
  remainingQuantity: number;
  isExcluded: boolean;
  excludedReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MtoType1Delivery {
  id: number;
  requirementId: number;
  teamId: string;
  tileId: string;
  productQuantity: number;
  transportationFee: number;
  deliveryStatus: 'PENDING' | 'VALIDATED' | 'SETTLED' | 'REJECTED';
  validationErrors?: string[];
  submittedAt: string;
  settledAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export interface MtoType1Settlement {
  id: number;
  requirementId: number;
  requirementName?: string;
  deliveryId: number;
  teamId: string;
  tileId: string;
  settledQuantity: number;
  unitPrice: number;
  totalPayment: number;
  totalSettledAmount?: number;
  deliveryCount?: number;
  transactionId: string;
  settledAt: string;
  metadata?: {
    formulaValidation?: {
      isValid: boolean;
      errors?: string[];
    };
    paymentDetails?: {
      method: string;
      reference: string;
    };
  };
}

export interface MtoType1CalculationHistory {
  id: number;
  requirementId: number;
  calculationType: 'INITIAL' | 'ADJUSTMENT' | 'RECALCULATION';
  totalPopulation: number;
  activeTiles: number;
  excludedTiles: number;
  totalCalculatedRequirement: number;
  totalAdjustedRequirement: number;
  adjustmentReason?: string;
  details: {
    tileCalculations: Array<{
      tileId: string;
      population: number;
      calculated: number;
      adjusted: number;
      excluded: boolean;
    }>;
    adjustmentSteps?: Array<{
      step: number;
      action: string;
      tilesAffected: string[];
      totalAfterStep: number;
    }>;
  };
  calculatedAt: string;
}

export interface MtoType1SettlementHistoryStep {
  step: number;
  stepType: 'SETTLEMENT_INITIATED' | 'SETTLEMENT_COMPLETED' | 'TILE_PROCESSING_START' | 'DELIVERY_VALIDATION' | 'PRODUCT_VALIDATION' | 'PAYMENT_PROCESSING' | 'TILE_PROCESSING_COMPLETE';
  stepDescription: string;
  timestamp: string;
  tileId: string | null;
  tileName: string | null;
  tileRequirement: number | null;
  productsValidated: number;
  productsSettled: number;
  productsRejected: number;
  validationDetails: string | null;
  processingDuration: number | null;
}

export interface MtoType1SettlementHistorySummary {
  totalTilesProcessed: number;
  totalDeliveriesProcessed: number;
  totalProductsValidated: number;
  totalProductsSettled: number;
  totalProductsRejected: number;
  totalPaymentsProcessed: number;
  totalProcessingTime: number;
}

export interface MtoType1SettlementHistoryResponse {
  mtoType1Id: number;
  totalSteps: number;
  settlementStatus: 'PENDING' | 'IN_PROGRESS' | 'SETTLED' | 'FAILED';
  settlementStarted: string;
  settlementCompleted: string | null;
  summary: MtoType1SettlementHistorySummary;
  steps: MtoType1SettlementHistoryStep[];
}

// Legacy interface kept for backward compatibility
export interface MtoType1SettlementHistory {
  id: number;
  requirementId: number;
  settlementStartedAt: string;
  settlementCompletedAt?: string;
  totalDeliveries: number;
  validDeliveries: number;
  settledDeliveries: number;
  rejectedDeliveries: number;
  totalSettledQuantity: number;
  totalSettlementAmount: number;
  details: {
    deliveryProcessing: Array<{
      deliveryId: number;
      teamId: string;
      tileId: string;
      quantity: number;
      status: 'SETTLED' | 'REJECTED' | 'PARTIAL';
      reason?: string;
      amount?: number;
    }>;
    summaryByTile: Array<{
      tileId: string;
      requirement: number;
      delivered: number;
      settled: number;
      fulfillmentRate: number;
    }>;
    summaryByTeam: Array<{
      teamId: string;
      deliveries: number;
      settledQuantity: number;
      totalPayment: number;
    }>;
  };
}

export interface MtoType1CreateRequest {
  activityId: string;
  managerProductFormulaId: number;
  purchaseGoldPrice: number;
  basePurchaseNumber: number;
  releaseTime: string;
  settlementTime: string;
  overallPurchaseNumber: number;
  baseCountPopulationNumber?: number;
  metadata?: {
    name?: string;
    description?: string;
    notes?: string;
  };
}

export interface MtoType1UpdateRequest {
  purchaseGoldPrice?: number;
  basePurchaseNumber?: number;
  releaseTime?: string;
  settlementTime?: string;
  overallPurchaseNumber?: number;
  baseCountPopulationNumber?: number;
  metadata?: {
    name?: string;
    description?: string;
    notes?: string;
  };
}

export interface MtoType1DeliveryRequest {
  requirementId: number;
  tileId: string;
  productQuantity: number;
  facilitySpaceId?: number;
}

export interface MtoType1DeliveryUpdateRequest {
  productQuantity?: number;
  facilitySpaceId?: number;
}

export interface MtoType1SearchParams {
  q?: string;
  status?: keyof MtoType1Status | Array<keyof MtoType1Status>;
  managerProductFormulaId?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MtoType1Statistics {
  totalRequirements: number;
  byStatus: Record<keyof MtoType1Status, number>;
  totalBudget: number;
  totalSettled: number;
  averageFulfillmentRate: number;
  topPerformingTeams: Array<{
    teamId: string;
    teamName: string;
    deliveries: number;
    totalRevenue: number;
  }>;
  recentActivity: Array<{
    timestamp: string;
    type: 'CREATED' | 'RELEASED' | 'DELIVERY' | 'SETTLED';
    description: string;
  }>;
}

export interface MtoType1TileView {
  tileId: string;
  tileCoordinates: {
    x: number;
    y: number;
  };
  population: number;
  requirement: number;
  delivered: number;
  remaining: number;
  teams: Array<{
    teamId: string;
    teamName: string;
    quantity: number;
    status: string;
  }>;
  transportationCost: number;
}

export interface MtoType1TeamView {
  requirementId: number;
  requirementName?: string;
  status: keyof MtoType1Status;
  unitPrice: number;
  availableTiles: Array<{
    tileId: string;
    requirement: number;
    remaining: number;
    transportationCost: number;
    distance: number;
  }>;
  myDeliveries: Array<{
    tileId: string;
    quantity: number;
    status: string;
    submittedAt: string;
    expectedPayment: number;
  }>;
  potentialRevenue: number;
  transportationCosts: number;
  netProfit: number;
}

// Student Delivery Status Types
export type DeliverySettlementStatus =
  | 'PENDING'
  | 'VALIDATED'
  | 'PARTIALLY_SETTLED'
  | 'FULLY_SETTLED'
  | 'REJECTED';

export interface MtoType1DeliveryDetail {
  id: string;
  deliveryNumber: number;
  mtoType1Id: number;
  mtoRequirement: {
    id: number;
    requirementName?: string;
    status: keyof MtoType1Status;
    purchaseGoldPrice: string | number;
    releaseTime: string;
    settlementTime: string;
  };
  tileLocation: {
    tileId: string;
    tileName: string;
    coordinates: {
      q: number;
      r: number;
    };
    population?: number;
    tileRequirement?: {
      initialRequirementNumber: number;
      adjustedRequirementNumber: number;
      deliveredNumber: number;
      settledNumber: number;
      remainingNumber: number;
    };
  };
  deliveryStatus: DeliverySettlementStatus;
  quantities: {
    delivered: number;
    settled: number;
    unsettled: number;
    rejected: number;
  };
  financial: {
    transportationFee: string | number;
    settlementAmount: string | number;
    unitPrice: string | number;
    totalRevenue?: string | number;
  };
  managerFormula?: {
    id: number;
    productName: string;
    materials: Array<{
      rawMaterialId: number;
      quantity: string;
      rawMaterial: {
        nameEn: string;
        nameZh: string;
      };
    }>;
    craftCategories: Array<{
      craftCategoryId: number;
      craftCategory: {
        categoryType: string;
        nameEn: string;
        nameZh: string;
      };
    }>;
  };
  submittedProducts?: Array<{
    inventoryItemId: string;
    productName: string;
    quantity: string;
    unitSpaceOccupied: string;
    teamProductFormulaId: number;
    teamProductFormula?: {
      id: number;
      formulaNumber: number;
      productName: string;
      productDescription: string;
      totalMaterialCost: string;
      productFormulaCarbonEmission: string;
      materials: Array<{
        rawMaterialId: number;
        quantity: string;
        rawMaterial: {
          nameEn: string;
          nameZh: string;
        };
      }>;
      craftCategories: Array<{
        craftCategoryId: number;
        craftCategory: {
          categoryType: string;
          nameEn: string;
          nameZh: string;
        };
      }>;
    };
    formulaValidation: {
      isValid: boolean;
      matchesManagerFormula: boolean;
      errors?: string[];
    };
    settlementStatus: 'SETTLED' | 'REJECTED' | 'PENDING';
    paymentReceived?: string | number;
  }>;
  timestamps: {
    deliveredAt: string;
    settledAt?: string;
    returnRequestedAt?: string;
    returnCompletedAt?: string;
  };
  returnStatus?: {
    requested: boolean;
    returnFacilityId?: string;
    returnTransportationFee?: string | number;
    returnCompletedAt?: string;
  };
  canRequestReturn?: boolean;
}

export interface MtoType1DeliverySummary {
  id: string;
  mtoType1Id: number;
  mtoType1Name?: string;
  mtoStatus: keyof MtoType1Status;
  deliveryNumber: number;
  deliveryStatus: DeliverySettlementStatus;
  deliveredAt: string;
  settledAt?: string;
  tile: {
    tileId: string;
    tileName: string;
    axialQ: number;
    axialR: number;
  };
  formulaSummary?: {
    formulaId: number;
    productName: string;
    purchasePrice: string | number;
  };
  quantities: {
    delivered: number;
    settled: number;
    unsettled: number;
    rejected: number;
  };
  financial: {
    transportationFee: string | number;
    settlementAmount: string | number;
    totalRevenue: string | number;
  };
  canRequestReturn: boolean;
}

export interface DeliveryFilters {
  status?: DeliverySettlementStatus[];
  mtoType1Id?: number;
  tileId?: string;
  dateFrom?: string;
  dateTo?: string;
  dateType?: 'delivered' | 'settled';
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
  settlementStatus?: 'settled' | 'unsettled' | 'mixed';
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  extra?: {
    pagination?: {
      total: number;
      page: number;
      limit: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface DeliverySummaryStats {
  totalDeliveries: number;
  totalDelivered: number;
  totalSettled: number;
  totalUnsettled: number;
  totalRevenue: string | number;
  totalTransportationCost: string | number;
  netProfit: string | number;
  averageSettlementRate: string;
}