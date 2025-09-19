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
  purchaseGoldPrice: number;
  basePurchaseNumber: number;
  releaseTime: string;
  settlementTime: string;
  overallPurchaseNumber: number;
  overallPurchaseBudget: number;
  baseCountPopulationNumber: number;
  status: keyof MtoType1Status;
  requirementName?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: {
    name?: string;
    description?: string;
    notes?: string;
  };
  // Additional optional properties for UI display
  totalAdjustedRequirement?: number;
  totalDeliveredNumber?: number;
  uniqueTeamsDelivered?: number;
  fulfillmentRate?: number;
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
  activityId?: string;
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