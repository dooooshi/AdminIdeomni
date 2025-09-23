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
  overallPurchaseBudget: string | number;
  budgetPool?: number;
  requirementName?: string;
  participatingMallIds?: string[];
  participatingMalls?: number;
  status: keyof MtoType2Status;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  actualSpentBudget?: string | null;
  actualPurchasedNumber?: number;
  totalSubmissions?: number;
  averageUnitPrice?: string | null;
  lowestUnitPrice?: string | null;
  highestUnitPrice?: string | null;
  settlementStartedAt?: string | null;
  settlementCompletedAt?: string | null;
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
    totalMaterialCost: string;
    isLocked?: boolean;
    [key: string]: any;
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
  totalSubmissions?: number;
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
  managerProductFormulaId: number;
  releaseTime: string;
  settlementTime: string;
  overallPurchaseBudget: number;
  metadata?: {
    name?: string;
    description?: string;
    notes?: string;
  };
  totalSubmissions?: number;
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
  totalSubmissions?: number;
}

export interface MtoType2SubmissionRequest {
  requirementId: number;
  facilityInstanceId: string;
  productNumber: number;
  unitPrice: number;
}

export interface MtoType2UnsettledReturnRequest {
  submissionId: number;
  targetFacilitySpaceId: number;
}

export interface MtoType2SearchParams {
  q?: string;
  status?: keyof MtoType2Status | Array<keyof MtoType2Status>;
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

// Additional types for missing features
export interface MtoType2FormulaLock {
  formulaId: number;
  lockedForMtoType2Id?: number;
}

export interface MtoType2MALLVerification {
  facilityInstanceId: string;
  facilityType: 'MALL';
  level: number;
  status: 'OPERATIONAL' | 'UNDER_CONSTRUCTION' | 'DISABLED';
  availableCapacity: number;
  currentInventory: number;
  verifiedAt: string;
  errors?: string[];
}

export interface MtoType2UnsettledReturn {
  submissionId: number;
  unsettledQuantity: number;
  targetFacilityInstanceId: string;
  targetFacilityName: string;
  transportationFee: number;
  returnStatus: 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'FAILED';
  requestedAt: string;
  completedAt?: string;
  failureReason?: string;
}

export interface MtoType2SettlementPriority {
  submissionId: number;
  mallLevel: number;
  unitPrice: number;
  submittedAt: string;
  priorityScore: number;
  settlementOrder: number;
  explanation: string;
}

export interface MtoType2PriceTrend {
  formulaId: number;
  period: '7d' | '30d' | '90d';
  trends: Array<{
    date: string;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    volume: number;
    participations: number;
  }>;
  summary: {
    currentAverage: number;
    percentChange: number;
    volatility: number;
    trend: 'INCREASING' | 'DECREASING' | 'STABLE';
  };
}

export interface MtoType2BulkSettleRequest {
  mtoType2Ids: number[];
  skipValidation?: boolean;
  notifyTeams?: boolean;
}

export interface MtoType2BulkSettleResponse {
  jobId: string;
  totalItems: number;
  successful: number;
  failed: number;
  estimatedCompletionTime: string;
  results: Array<{
    mtoType2Id: number;
    status: 'SUCCESS' | 'FAILED';
    message?: string;
    settlementId?: string;
  }>;
}

export interface MtoType2AuditTrail {
  id: number;
  mtoType2Id: number;
  action: string;
  performedBy: string;
  performedAt: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
}

export interface MtoType2RequirementDetails {
  id: number;
  status: "RELEASED" | "IN_PROGRESS" | "SETTLING" | "SETTLED";
  releaseTime: string;
  settlementTime: string;
  overallPurchaseBudget: string;

  productFormula: {
    id: number;
    name: string;
    description?: string;
    craftCategories: Array<{
      id: number;
      name: string;
      description?: string;
    }>;
    rawMaterials: Array<{
      id: number;
      name: string;
      quantity: number;
      unit: string;
    }>;
    productionProcess?: {
      steps?: string[];
      duration?: number; // minutes
      complexity?: "LOW" | "MEDIUM" | "HIGH";
    };
  };

  tileBudgetAllocations: Array<{
    tileId: number;
    tileName: string;
    axialQ: number;
    axialR: number;

    tilePopulation: number;
    populationRatio: number; // percentage of total population
    allocatedBudget: string; // calculated budget for this tile

    mallsInTile: Array<{
      mallId: string;
      mallName: string;
      mallLevel: number; // 1-5
      teamId: string;
      teamName: string;
    }>;

    settlementProgress?: {
      spentBudget: string;
      remainingBudget: string;
      purchasedQuantity: number;
      participatingTeams: number;
    };
  }>;
}

// Submission History Types
export interface MtoType2SubmissionHistoryItem {
  // Submission identification
  submissionId: number;
  submissionNumber: number;
  mtoType2Id: number;
  teamId: string;
  facilityInstanceId: string;

  // MTO Type 2 details
  mtoType2: {
    id: number;
    status: 'DRAFT' | 'RELEASED' | 'IN_PROGRESS' | 'SETTLING' | 'SETTLED' | 'CANCELLED';
    releaseTime: string;
    settlementTime: string;
    overallPurchaseBudget: string;
  };

  // Manager's required product formula
  managerProductFormula: {
    id: number;
    formulaNumber: number;
    productName: string;
    productDescription?: string;

    // Material requirements
    materials: Array<{
      id: number;
      rawMaterialId: number;
      rawMaterialName: string;
      quantity: string;
      unit: string;
      materialCost: string;
    }>;

    // Craft category requirements
    craftCategories: Array<{
      id: number;
      categoryId: number;
      categoryName: string;
      categoryType: string;
      categoryLevel: number;
    }>;

    // Cost components
    totalMaterialCost: string;
    totalSetupWaterCost: number;
    totalSetupPowerCost: number;
    totalSetupGoldCost: string;
    totalWaterPercent: string;
    totalPowerPercent: string;
    totalGoldPercent: string;
    totalPercent: string;
    productFormulaCarbonEmission: string;
  };

  // Product validation (only available after settlement)
  productValidation?: {
    formulaValidated: boolean;
    validationTimestamp?: string;

    validationDetails?: {
      materialsMatch: boolean;
      categoriesMatch: boolean;
      isFullyCompatible: boolean;

      materialsDifference?: Array<{
        materialId: number;
        materialName: string;
        requiredQuantity: string;
        actualQuantity?: string;
        difference?: string;
        unit: string;
      }>;
      missingCategories?: string[];
      extraCategories?: string[];

      notes?: string;
    };
  };

  // Submission details
  submission: {
    productNumber: number;
    unitPrice: string;
    totalValue: string;
    submittedAt: string;
    modifiedAt: string;
  };

  // MALL facility information
  mallInfo: {
    facilityInstanceId: string;
    facilityName: string;
    mallLevel: number;
    mapTileId: number;
    tileName: string;
    axialQ: number;
    axialR: number;
    tilePopulation: number;
  };

  // Settlement results
  settlementResults: {
    settlementStatus: 'PENDING' | 'PARTIAL' | 'FULL' | 'UNSETTLED' | 'RETURNED';
    settledNumber: number;
    settledValue: string;
    unsettledNumber: number;
    settlementOrder?: number;
    settledAt?: string;

    // Return handling
    returnRequested: boolean;
    returnFacilityInstanceId?: string;
    returnCompletedAt?: string;

    // Performance metrics
    fulfillmentRate: number;
    averageSettledPrice?: string;

    // Settlement details (if settled)
    settlementDetails?: {
      paymentStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
      paymentTransactionId?: string;
      paymentCompletedAt?: string;
      validationDetails?: {
        formulaValidated: boolean;
        validationNotes?: string;
      };
    };
  };

  // Budget allocation for the tile
  tileBudgetInfo: {
    allocatedBudget: string;
    spentBudget: string;
    remainingBudget: string;
    populationRatio: number;
    processedSubmissions: number;
  };
}

export interface MtoType2SubmissionHistoryParams {
  mtoType2Id?: number;
  facilityInstanceId?: string;
  status?: 'PENDING' | 'PARTIAL' | 'FULL' | 'UNSETTLED' | 'RETURNED';
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'submittedAt' | 'settlementTime' | 'unitPrice' | 'settledNumber' | 'totalValue';
  sortOrder?: 'asc' | 'desc';
}

export interface MtoType2SubmissionHistoryResponse {
  items: MtoType2SubmissionHistoryItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MtoType2SubmissionEligibility {
  mtoType2: {
    id: number;
    status: "RELEASED" | "IN_PROGRESS";
    releaseTime: string;
    settlementTime: string;
    isOpenForSubmission: boolean;
  };

  teamInfo: {
    teamId: string;
    teamName: string;
    totalMALLs: number;
    eligibleMALLs: number;
  };

  eligibleFacilities: Array<{
    facilityId: string;
    facilityName: string;
    mallLevel: number; // 1-5

    tile: {
      tileId: number;
      tileName: string;
      axialQ: number;
      axialR: number;
      population: number;

      budgetAllocation: {
        allocatedBudget: string;
        remainingBudget?: string;
        populationRatio: number;
      };
    };

    submissionStatus: {
      hasSubmitted: boolean;
      submittedAt?: string;
      submittedQuantity?: number;
      submittedPrice?: string;
    };

    inventory: {
      totalSpaceCapacity: number;
      usedSpace: number;
      availableSpace: number;

      products: Array<{
        inventoryItemId: string;
        productFormulaId: number;
        productName: string;
        quantity: number;
        unitSpaceRequired: number;
        totalSpaceUsed: number;

        productDetails: {
          materials: Array<{
            id: number;
            name: string;
            quantity: number;
          }>;
          craftCategories: string[];
          productionDate?: string;
          qualityLevel?: string;
        };
      }>;

      rawMaterials?: Array<{
        inventoryItemId: string;
        materialId: number;
        name: string;
        quantity: number;
        unit: string;
      }>;
    };
  }>;
}

// Submission History Types
export interface MtoType2SubmissionHistoryItem {
  // Submission identification
  submissionId: number;
  submissionNumber: number;
  mtoType2Id: number;
  teamId: string;
  facilityInstanceId: string;

  // MTO Type 2 details
  mtoType2: {
    id: number;
    status: 'DRAFT' | 'RELEASED' | 'IN_PROGRESS' | 'SETTLING' | 'SETTLED' | 'CANCELLED';
    releaseTime: string;
    settlementTime: string;
    overallPurchaseBudget: string;
  };

  // Manager's required product formula
  managerProductFormula: {
    id: number;
    formulaNumber: number;
    productName: string;
    productDescription?: string;

    // Material requirements
    materials: Array<{
      id: number;
      rawMaterialId: number;
      rawMaterialName: string;
      quantity: string;
      unit: string;
      materialCost: string;
    }>;

    // Craft category requirements
    craftCategories: Array<{
      id: number;
      categoryId: number;
      categoryName: string;
      categoryType: string;
      categoryLevel: number;
    }>;

    // Cost components
    totalMaterialCost: string;
    totalSetupWaterCost: number;
    totalSetupPowerCost: number;
    totalSetupGoldCost: string;
    totalWaterPercent: string;
    totalPowerPercent: string;
    totalGoldPercent: string;
    totalPercent: string;
    productFormulaCarbonEmission: string;
  };

  // Product validation (only available after settlement)
  productValidation?: {
    formulaValidated: boolean;
    validationTimestamp?: string;

    validationDetails?: {
      materialsMatch: boolean;
      categoriesMatch: boolean;
      isFullyCompatible: boolean;

      materialsDifference?: Array<{
        materialId: number;
        materialName: string;
        requiredQuantity: string;
        actualQuantity?: string;
        difference?: string;
        unit: string;
      }>;
      missingCategories?: string[];
      extraCategories?: string[];

      notes?: string;
    };
  };

  // Submission details
  submission: {
    productNumber: number;
    unitPrice: string;
    totalValue: string;
    submittedAt: string;
    modifiedAt: string;
  };

  // MALL facility information
  mallInfo: {
    facilityInstanceId: string;
    facilityName: string;
    mallLevel: number;
    mapTileId: number;
    tileName: string;
    axialQ: number;
    axialR: number;
    tilePopulation: number;
  };

  // Settlement results
  settlementResults: {
    settlementStatus: 'PENDING' | 'PARTIAL' | 'FULL' | 'UNSETTLED' | 'RETURNED';
    settledNumber: number;
    settledValue: string;
    unsettledNumber: number;
    settlementOrder?: number;
    settledAt?: string;

    // Return handling
    returnRequested: boolean;
    returnFacilityInstanceId?: string;
    returnCompletedAt?: string;

    // Performance metrics
    fulfillmentRate: number;
    averageSettledPrice?: string;

    // Settlement details (if settled)
    settlementDetails?: {
      paymentStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
      paymentTransactionId?: string;
      paymentCompletedAt?: string;
      validationDetails?: {
        formulaValidated: boolean;
        validationNotes?: string;
      };
    };
  };

  // Budget allocation for the tile
  tileBudgetInfo: {
    allocatedBudget: string;
    spentBudget: string;
    remainingBudget: string;
    populationRatio: number;
    processedSubmissions: number;
  };
}

export interface MtoType2SubmissionHistoryParams {
  mtoType2Id?: number;
  facilityInstanceId?: string;
  status?: 'PENDING' | 'PARTIAL' | 'FULL' | 'UNSETTLED' | 'RETURNED';
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'submittedAt' | 'settlementTime' | 'unitPrice' | 'settledNumber' | 'totalValue';
  sortOrder?: 'asc' | 'desc';
}

export interface MtoType2SubmissionHistoryResponse {
  items: MtoType2SubmissionHistoryItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}