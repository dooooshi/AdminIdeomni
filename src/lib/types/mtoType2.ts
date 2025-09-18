export interface MtoType2Status {
  DRAFT: 'DRAFT';
  RELEASED: 'RELEASED';
  IN_PROGRESS: 'IN_PROGRESS';
  SETTLED: 'SETTLED';
  CANCELLED: 'CANCELLED';
}

export interface MtoType2Requirement {
  id: number;
  activityId: string;
  managerProductFormulaId: number;
  releaseTime: string;
  settlementTime: string;
  overallPurchaseBudget: number;
  budgetPool?: number;
  requirementName?: string;
  participatingMallIds?: string[];
  status: keyof MtoType2Status;
  createdAt?: string;
  updatedAt?: string;
  metadata?: {
    name?: string;
    description?: string;
    notes?: string;
  };
}

export interface MtoType2Submission {
  id: number;
  requirementId: number;
  teamId: string;
  mallFacilityId: number;
  tileId: string;
  productQuantity: number;
  unitPrice: number;
  totalValue: number;
  mallLevel: number;
  submissionStatus: 'PENDING' | 'VALIDATED' | 'SETTLED' | 'PARTIALLY_SETTLED' | 'UNSETTLED' | 'REJECTED';
  settledQuantity?: number;
  settledAmount?: number;
  validationErrors?: string[];
  submittedAt: string;
  settledAt?: string;
}

export interface MtoType2MallBudget {
  id: number;
  requirementId: number;
  tileId: string;
  mallCount: number;
  tilePopulation: number;
  allocatedBudget: number;
  usedBudget: number;
  remainingBudget: number;
  mallDetails: Array<{
    mallId: number;
    teamId: string;
    level: number;
    submissions: number;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface MtoType2Settlement {
  id: number;
  requirementId: number;
  submissionId: number;
  teamId: string;
  mallFacilityId: number;
  tileId: string;
  settledQuantity: number;
  unitPrice: number;
  totalPayment: number;
  transactionId: string;
  priority: number;
  settledAt: string;
  metadata?: {
    mallLevel: number;
    budgetAtSettlement: number;
    formulaValidation?: {
      isValid: boolean;
      errors?: string[];
    };
  };
}

export interface MtoType2CalculationHistory {
  id: number;
  requirementId: number;
  calculationType: 'BUDGET_DISTRIBUTION' | 'SETTLEMENT_PRIORITY';
  totalMallTiles: number;
  totalPopulation: number;
  totalBudget: number;
  details: {
    tileAllocations: Array<{
      tileId: string;
      population: number;
      mallCount: number;
      allocatedBudget: number;
      percentage: number;
    }>;
    populationDistribution: {
      highest: { tileId: string; population: number };
      lowest: { tileId: string; population: number };
      average: number;
    };
  };
  calculatedAt: string;
}

export interface MtoType2SettlementHistory {
  id: number;
  requirementId: number;
  settlementStartedAt: string;
  settlementCompletedAt?: string;
  totalSubmissions: number;
  settledSubmissions: number;
  partiallySettledSubmissions: number;
  unsettledSubmissions: number;
  totalBudgetUsed: number;
  details: {
    settlementOrder: Array<{
      order: number;
      submissionId: number;
      teamId: string;
      mallLevel: number;
      unitPrice: number;
      requestedQuantity: number;
      settledQuantity: number;
      amount: number;
      reason?: string;
    }>;
    budgetUtilization: Array<{
      tileId: string;
      allocated: number;
      used: number;
      utilizationRate: number;
    }>;
    priceAnalysis: {
      minPrice: number;
      maxPrice: number;
      averagePrice: number;
      medianPrice: number;
      priceByLevel: Record<number, { min: number; max: number; avg: number }>;
    };
  };
}

export interface MtoType2CreateRequest {
  activityId: string;
  managerProductFormulaId: number;
  releaseTime: string;
  settlementTime: string;
  overallPurchaseBudget: number;
  metadata?: {
    name?: string;
    description?: string;
    notes?: string;
  };
}

export interface MtoType2UpdateRequest {
  releaseTime?: string;
  settlementTime?: string;
  overallPurchaseBudget?: number;
  metadata?: {
    name?: string;
    description?: string;
    notes?: string;
  };
}

export interface MtoType2SubmissionRequest {
  requirementId: number;
  productQuantity: number;
  unitPrice: number;
  mallFacilitySpaceId: number;
}

export interface MtoType2UnsettledReturnRequest {
  submissionId: number;
  targetFacilitySpaceId: number;
}

export interface MtoType2SearchParams {
  q?: string;
  status?: keyof MtoType2Status | Array<keyof MtoType2Status>;
  activityId?: string;
  managerProductFormulaId?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MtoType2Statistics {
  totalRequirements: number;
  byStatus: Record<keyof MtoType2Status, number>;
  totalBudget: number;
  totalSettled: number;
  budgetUtilizationRate: number;
  priceCompetitiveness: {
    trend: 'INCREASING' | 'DECREASING' | 'STABLE';
    averageChange: number;
  };
  topMallOperators: Array<{
    teamId: string;
    teamName: string;
    mallCount: number;
    totalRevenue: number;
    averagePrice: number;
  }>;
  marketActivity: Array<{
    timestamp: string;
    type: 'CREATED' | 'RELEASED' | 'SUBMISSION' | 'SETTLED';
    description: string;
  }>;
}

export interface MtoType2MallOwnerView {
  requirementId: number;
  requirementName?: string;
  status: keyof MtoType2Status;
  totalBudget: number;
  myMalls: Array<{
    mallId: number;
    tileId: string;
    level: number;
    estimatedBudgetShare: number;
    population: number;
    competitorCount: number;
  }>;
  mySubmissions: Array<{
    mallId: number;
    tileId: string;
    quantity: number;
    unitPrice: number;
    status: string;
    submittedAt: string;
    expectedRevenue: number;
    settledAmount?: number;
  }>;
  marketInsights?: {
    participatingMalls: number;
    averageSubmissionSize: number;
    priceRange?: {
      min: number;
      max: number;
      median: number;
    };
  };
}

export interface MtoType2PublicView {
  requirementId: number;
  requirementName?: string;
  status: keyof MtoType2Status;
  releaseTime: string;
  settlementTime: string;
  totalBudget: number;
  productFormula: {
    id: number;
    name: string;
    description?: string;
  };
  participationRequirements: {
    facilityType: 'MALL';
    minimumLevel?: number;
  };
  statistics?: {
    participatingTeams: number;
    totalSubmissions: number;
    tilesWithMalls: number;
  };
}

export interface MtoType2CompetitorAnalysis {
  tileId: string;
  competitors: Array<{
    teamId: string;
    teamName: string;
    mallLevel: number;
    historicalPerformance?: {
      participations: number;
      successRate: number;
      averagePrice: number;
    };
  }>;
  estimatedCompetition: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendedStrategy?: {
    priceRange: { min: number; max: number };
    quantityRange: { min: number; max: number };
    confidence: number;
  };
}