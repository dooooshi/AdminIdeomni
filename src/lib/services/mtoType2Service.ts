import apiClient from '@/lib/http/api-client';
import {
  MtoType2Requirement,
  MtoType2Submission,
  MtoType2MallBudget,
  MtoType2Settlement,
  MtoType2CalculationHistory,
  MtoType2SettlementHistory,
  MtoType2CreateRequest,
  MtoType2UpdateRequest,
  MtoType2SubmissionRequest,
  MtoType2UnsettledReturnRequest,
  MtoType2SearchParams,
  MtoType2Statistics,
  MtoType2MallOwnerView,
  MtoType2PublicView,
  MtoType2CompetitorAnalysis,
  MtoType2FormulaLock,
  MtoType2MALLVerification,
  MtoType2UnsettledReturn,
  MtoType2SettlementPriority,
  MtoType2PriceTrend,
  MtoType2BulkSettleRequest,
  MtoType2BulkSettleResponse,
  MtoType2AuditTrail,
  MtoType2RequirementDetails,
  MtoType2SubmissionEligibility,
  MtoType2SubmissionHistoryItem,
  MtoType2SubmissionHistoryParams,
  MtoType2SubmissionHistoryResponse
} from '@/lib/types/mtoType2';

export interface ApiResponse<T> {
  success: boolean;
  businessCode: number;
  message: string;
  data: T;
  timestamp: string;
  path?: string;
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

export class MtoType2Service {
  private static readonly MANAGER_BASE_PATH = '/user/manager/mto-type2';
  private static readonly MALL_BASE_PATH = '/mall/mto-type-2';
  private static readonly PUBLIC_BASE_PATH = '/public/mto-type-2';

  private static extractResponseData<T>(response: any): T {
    if (response.data && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data || response;
  }

  // Manager Endpoints

  static async createRequirement(
    data: MtoType2CreateRequest
  ): Promise<MtoType2Requirement> {
    const response = await apiClient.post(this.MANAGER_BASE_PATH, data);
    return this.extractResponseData<MtoType2Requirement>(response);
  }

  static async updateRequirement(
    id: number,
    data: MtoType2UpdateRequest
  ): Promise<MtoType2Requirement> {
    const response = await apiClient.put(`${this.MANAGER_BASE_PATH}/${id}`, data);
    return this.extractResponseData<MtoType2Requirement>(response);
  }

  static async deleteRequirement(id: number): Promise<void> {
    await apiClient.delete(`${this.MANAGER_BASE_PATH}/${id}`);
  }

  static async getRequirement(id: number): Promise<MtoType2Requirement> {
    const response = await apiClient.get(`${this.MANAGER_BASE_PATH}/${id}`);
    return this.extractResponseData<MtoType2Requirement>(response);
  }

  static async getRequirements(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    items: MtoType2Requirement[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await apiClient.get(
      `${this.MANAGER_BASE_PATH}?${queryParams.toString()}`
    );
    // Return the full response data including items and pagination
    return this.extractResponseData(response);
  }

  static async searchRequirements(
    params: MtoType2SearchParams
  ): Promise<ApiResponse<MtoType2Requirement[]>> {
    const queryParams = new URLSearchParams();

    if (params.q) queryParams.append('q', params.q);
    if (params.status) {
      if (Array.isArray(params.status)) {
        params.status.forEach(s => queryParams.append('status[]', s));
      } else {
        queryParams.append('status', params.status);
      }
    }
    if (params.managerProductFormulaId) {
      queryParams.append('managerProductFormulaId', params.managerProductFormulaId.toString());
    }
    if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params.dateTo) queryParams.append('dateTo', params.dateTo);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await apiClient.get(
      `${this.MANAGER_BASE_PATH}?${queryParams.toString()}`
    );
    return this.extractResponseData(response);
  }

  static async releaseRequirement(id: number): Promise<MtoType2Requirement> {
    const response = await apiClient.post(`${this.MANAGER_BASE_PATH}/${id}/release`);
    return this.extractResponseData<MtoType2Requirement>(response);
  }

  static async cancelRequirement(id: number, reason?: string): Promise<MtoType2Requirement> {
    const response = await apiClient.post(`${this.MANAGER_BASE_PATH}/${id}/cancel`, {
      reason: reason || 'Cancelled by administrator'
    });
    return this.extractResponseData<MtoType2Requirement>(response);
  }

  static async getMallBudgets(requirementId: number): Promise<MtoType2MallBudget[]> {
    const response = await apiClient.get(
      `${this.MANAGER_BASE_PATH}/${requirementId}/budgets`
    );
    return this.extractResponseData<MtoType2MallBudget[]>(response);
  }

  static async calculateBudgets(requirementId: number): Promise<MtoType2MallBudget[]> {
    const response = await apiClient.post(
      `${this.MANAGER_BASE_PATH}/${requirementId}/calculate-budgets`
    );
    return this.extractResponseData<MtoType2MallBudget[]>(response);
  }

  static async getSubmissions(requirementId: number): Promise<MtoType2Submission[]> {
    const response = await apiClient.get(
      `${this.MANAGER_BASE_PATH}/${requirementId}/submissions`
    );
    return this.extractResponseData<MtoType2Submission[]>(response);
  }

  static async settleRequirement(requirementId: number): Promise<MtoType2SettlementHistory> {
    const response = await apiClient.post(
      `${this.MANAGER_BASE_PATH}/${requirementId}/settle`
    );
    return this.extractResponseData<MtoType2SettlementHistory>(response);
  }

  static async getSettlements(requirementId: number): Promise<MtoType2Settlement[]> {
    const response = await apiClient.get(
      `${this.MANAGER_BASE_PATH}/${requirementId}/settlements`
    );
    return this.extractResponseData<MtoType2Settlement[]>(response);
  }

  static async getCalculationHistory(
    requirementId: number,
    params?: {
      calculationType?: 'BUDGET_DISTRIBUTION' | 'SETTLEMENT_PROCESS' | 'ADJUSTMENT' | 'CANCELLATION';
      limit?: number;
      offset?: number;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<{
    mtoType2Id: number;
    histories: MtoType2CalculationHistory[];
    total: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.calculationType) queryParams.append('calculationType', params.calculationType);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    }

    const response = await apiClient.get(
      `${this.MANAGER_BASE_PATH}/${requirementId}/calculation-history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return this.extractResponseData(response);
  }

  static async getSettlementHistory(
    requirementId: number
  ): Promise<MtoType2SettlementHistory[]> {
    const response = await apiClient.get(
      `${this.MANAGER_BASE_PATH}/${requirementId}/settlement-history`
    );
    return this.extractResponseData<MtoType2SettlementHistory[]>(response);
  }

  static async getStatistics(): Promise<MtoType2Statistics> {
    const response = await apiClient.get(`${this.MANAGER_BASE_PATH}/statistics`);
    return this.extractResponseData<MtoType2Statistics>(response);
  }

  static async getSettlementReport(requirementId: number): Promise<{
    summary: any;
    priceAnalytics: any;
    tileBreakdown: any[];
    topSuppliers: any[];
  }> {
    const response = await apiClient.get(
      `${this.MANAGER_BASE_PATH}/${requirementId}/settlement-report`
    );
    return this.extractResponseData(response);
  }

  static async getManagerFormulas(params?: {
    page?: number;
    limit?: number;
    searchTerm?: string;
  }): Promise<{
    items: Array<{
      id: number;
      name: string;
      productName?: string;
      formulaNumber?: number;
      totalMaterialCost?: string;
      materialCount?: number;
      craftCategoryCount?: number;
      isLocked?: boolean;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.searchTerm) queryParams.append('searchTerm', params.searchTerm);

    const response = await apiClient.get(
      `/user/manager/mto/formulas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    const data = this.extractResponseData<{
      items?: Array<{
        id: number;
        name: string;
        productName?: string;
        formulaNumber?: number;
        totalMaterialCost?: string;
        materialCount?: number;
        craftCategoryCount?: number;
        isLocked?: boolean;
      }>;
      total?: number;
      page?: number;
      limit?: number;
    }>(response);

    // The API returns { items: [...], total, page, limit }
    if (data?.items && Array.isArray(data.items)) {
      const totalPages = Math.ceil((data.total || 0) / (data.limit || params?.limit || 20));
      return {
        items: data.items,
        pagination: {
          page: data.page || params?.page || 1,
          limit: data.limit || params?.limit || 20,
          total: data.total || 0,
          totalPages
        }
      };
    }

    // Fallback for backward compatibility
    return {
      items: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      }
    };
  }

  // MALL Owner Endpoints

  static async getAvailableForMall(): Promise<MtoType2MallOwnerView[]> {
    const response = await apiClient.get(`${this.MALL_BASE_PATH}/available`);
    return this.extractResponseData<MtoType2MallOwnerView[]>(response);
  }

  static async getRequirementForMall(
    requirementId: number
  ): Promise<MtoType2MallOwnerView> {
    const response = await apiClient.get(`${this.MALL_BASE_PATH}/requirements/${requirementId}`);
    return this.extractResponseData<MtoType2MallOwnerView>(response);
  }

  static async getCompetitorAnalysis(
    requirementId: number,
    tileId: string
  ): Promise<MtoType2CompetitorAnalysis> {
    const response = await apiClient.get(
      `${this.MALL_BASE_PATH}/requirements/${requirementId}/competitors?tileId=${tileId}`
    );
    return this.extractResponseData<MtoType2CompetitorAnalysis>(response);
  }

  static async createSubmission(
    data: MtoType2SubmissionRequest
  ): Promise<MtoType2Submission> {
    const { requirementId, ...submitData } = data;
    const response = await apiClient.post(
      `${this.MALL_BASE_PATH}/${requirementId}/submit`,
      submitData
    );
    return this.extractResponseData<MtoType2Submission>(response);
  }

  static async updateSubmission(
    submissionId: number,
    data: Partial<MtoType2SubmissionRequest>
  ): Promise<MtoType2Submission> {
    const response = await apiClient.put(`${this.MALL_BASE_PATH}/submissions/${submissionId}`, data);
    return this.extractResponseData<MtoType2Submission>(response);
  }

  static async withdrawSubmission(submissionId: number): Promise<void> {
    await apiClient.delete(`${this.MALL_BASE_PATH}/submissions/${submissionId}`);
  }

  static async getMallSubmissions(
    mallId?: number,
    requirementId?: number
  ): Promise<MtoType2Submission[]> {
    const params = new URLSearchParams();
    if (mallId) params.append('mallId', mallId.toString());
    if (requirementId) params.append('requirementId', requirementId.toString());

    const response = await apiClient.get(
      `${this.MALL_BASE_PATH}/submissions?${params.toString()}`
    );
    return this.extractResponseData<MtoType2Submission[]>(response);
  }

  static async getSubmissionStatus(submissionId: number): Promise<MtoType2Submission> {
    const response = await apiClient.get(`${this.MALL_BASE_PATH}/submissions/${submissionId}`);
    return this.extractResponseData<MtoType2Submission>(response);
  }

  static async returnUnsettledProducts(
    data: MtoType2UnsettledReturnRequest
  ): Promise<void> {
    await apiClient.post(`${this.MALL_BASE_PATH}/unsettled/return`, data);
  }

  static async getMallSettlements(teamId?: string): Promise<MtoType2Settlement[]> {
    const params = teamId ? `?teamId=${teamId}` : '';
    const response = await apiClient.get(`${this.MALL_BASE_PATH}/settlements${params}`);
    return this.extractResponseData<MtoType2Settlement[]>(response);
  }

  // Public Endpoints (for non-MALL teams)

  static async getPublicRequirements(
    activityId?: string
  ): Promise<MtoType2PublicView[]> {
    const params = activityId ? `?activityId=${activityId}` : '';
    const response = await apiClient.get(`${this.PUBLIC_BASE_PATH}/market${params}`);
    const data = this.extractResponseData<{
      active: MtoType2PublicView[];
      recentlySettled: Array<{
        id: number;
        formulaName: string;
        formulaDescription: string;
        formulaNumber: number;
        settledAt: string;
        budgetUtilization: number;
        averagePrice: string;
      }>;
    }>(response);

    // Return the active requirements for public view
    return data?.active || [];
  }

  static async getPublicRequirement(
    requirementId: number
  ): Promise<MtoType2PublicView> {
    const response = await apiClient.get(`${this.PUBLIC_BASE_PATH}/${requirementId}`);
    return this.extractResponseData<MtoType2PublicView>(response);
  }

  static async getMarketInsights(requirementId: number): Promise<{
    priceDistribution: {
      min: number;
      max: number;
      average: number;
      median: number;
    };
    participationRate: number;
    topTiles: Array<{
      tileId: string;
      mallCount: number;
      estimatedBudget: number;
    }>;
  }> {
    const response = await apiClient.get(
      `${this.PUBLIC_BASE_PATH}/${requirementId}/insights`
    );
    return this.extractResponseData(response);
  }

  // Student-specific endpoint for viewing opportunities
  static async getOpportunitiesForStudents(): Promise<Array<{
    requirementId: number;
    requirementName: string;
    status: string;
    totalBudget: number;
    releaseTime: string;
    settlementTime: string;
    productFormulaName: string;
    marketInsights?: {
      participatingMalls: number;
      averagePrice?: number;
      priceRange?: {
        min: number;
        max: number;
      };
      totalSubmissions: number;
    };
  }>> {
    try {
      // Get the market data directly
      const response = await apiClient.get(`${this.PUBLIC_BASE_PATH}/market`);
      const data = this.extractResponseData<{
        active: Array<any>;
        recentlySettled: Array<{
          id: number;
          formulaName: string;
          formulaDescription: string;
          formulaNumber: number;
          settledAt: string;
          budgetUtilization: number;
          averagePrice: string;
        }>;
      }>(response);

      // Combine active and recently settled for student view
      const activeData = data?.active || [];
      const settledData = data?.recentlySettled || [];

      // Transform active requirements
      const activeOpportunities = activeData.map((item: any) => ({
        requirementId: item.id || item.requirementId,
        requirementName: item.requirementName || item.formulaName || `Requirement ${item.id || item.requirementId}`,
        status: item.status || 'ACTIVE',
        totalBudget: item.totalBudget || 0,
        releaseTime: item.releaseTime || '',
        settlementTime: item.settlementTime || '',
        productFormulaName: item.productFormula?.name || item.formulaName || 'Standard Formula',
        marketInsights: {
          participatingMalls: 0,
          averagePrice: undefined,
          priceRange: undefined,
          totalSubmissions: 0
        }
      }));

      // Transform recently settled data
      const settledOpportunities = settledData.map((item) => ({
        requirementId: item.id,
        requirementName: item.formulaName || `Requirement ${item.id}`,
        status: 'SETTLED',
        totalBudget: 0,
        releaseTime: '',
        settlementTime: item.settledAt,
        productFormulaName: item.formulaName,
        marketInsights: {
          participatingMalls: 0,
          averagePrice: parseFloat(item.averagePrice) || undefined,
          priceRange: undefined,
          totalSubmissions: 0
        }
      }));

      // Combine both arrays
      return [...activeOpportunities, ...settledOpportunities];
    } catch (error) {
      console.error('Error fetching student opportunities:', error);
      // Return empty array on error
      return [];
    }
  }

  // Student-specific endpoint for viewing MTO Type 2 requirement details
  static async getRequirementDetailsForStudent(
    requirementId: number
  ): Promise<MtoType2RequirementDetails> {
    const response = await apiClient.get(
      `/team/mto-type-2/${requirementId}/requirement`
    );
    return this.extractResponseData<MtoType2RequirementDetails>(response);
  }

  // Student-specific endpoint for getting submission eligibility
  static async getSubmissionEligibility(
    requirementId: number
  ): Promise<MtoType2SubmissionEligibility> {
    const response = await apiClient.get(
      `/team/mto-type-2/${requirementId}/submission-eligibility`
    );
    return this.extractResponseData<MtoType2SubmissionEligibility>(response);
  }

  // New methods for missing features

  static async verifyMALLFacility(
    facilityInstanceId: string
  ): Promise<MtoType2MALLVerification> {
    const response = await apiClient.get(
      `${this.MALL_BASE_PATH}/verify-facility/${facilityInstanceId}`
    );
    return this.extractResponseData<MtoType2MALLVerification>(response);
  }

  static async lockFormula(
    formulaId: number,
    mtoType2Id: number
  ): Promise<MtoType2FormulaLock> {
    const response = await apiClient.post(
      `/user/manager/mto/formulas/${formulaId}/lock`,
      { mtoType2Id }
    );
    return this.extractResponseData<MtoType2FormulaLock>(response);
  }

  static async unlockFormula(formulaId: number): Promise<MtoType2FormulaLock> {
    const response = await apiClient.post(
      `/user/manager/mto/formulas/${formulaId}/unlock`
    );
    return this.extractResponseData<MtoType2FormulaLock>(response);
  }

  static async getSettlementPriorities(
    requirementId: number
  ): Promise<MtoType2SettlementPriority[]> {
    const response = await apiClient.get(
      `${this.MANAGER_BASE_PATH}/${requirementId}/settlement-priorities`
    );
    return this.extractResponseData<MtoType2SettlementPriority[]>(response);
  }

  static async createUnsettledReturn(
    data: MtoType2UnsettledReturnRequest
  ): Promise<MtoType2UnsettledReturn> {
    const response = await apiClient.post(
      `${this.MALL_BASE_PATH}/unsettled/returns`,
      data
    );
    return this.extractResponseData<MtoType2UnsettledReturn>(response);
  }

  static async getUnsettledReturns(
    teamId?: string,
    status?: string
  ): Promise<MtoType2UnsettledReturn[]> {
    const params = new URLSearchParams();
    if (teamId) params.append('teamId', teamId);
    if (status) params.append('status', status);

    const response = await apiClient.get(
      `${this.MALL_BASE_PATH}/unsettled/returns?${params.toString()}`
    );
    return this.extractResponseData<MtoType2UnsettledReturn[]>(response);
  }

  static async getPriceTrends(
    formulaId: number,
    period: '7d' | '30d' | '90d' = '30d'
  ): Promise<MtoType2PriceTrend> {
    const response = await apiClient.get(
      `/api/analytics/mto-type-2/price-trends?formulaId=${formulaId}&period=${period}`
    );
    return this.extractResponseData<MtoType2PriceTrend>(response);
  }

  static async bulkSettle(
    data: MtoType2BulkSettleRequest
  ): Promise<MtoType2BulkSettleResponse> {
    const response = await apiClient.post(
      `${this.MANAGER_BASE_PATH}/bulk-settle`,
      data
    );
    return this.extractResponseData<MtoType2BulkSettleResponse>(response);
  }

  static async getAuditTrail(
    mtoType2Id: number
  ): Promise<MtoType2AuditTrail[]> {
    const response = await apiClient.get(
      `${this.MANAGER_BASE_PATH}/${mtoType2Id}/audit-trail`
    );
    return this.extractResponseData<MtoType2AuditTrail[]>(response);
  }

  static async calculateTransportationFee(
    fromFacilityId: string,
    toFacilityId: string,
    quantity: number
  ): Promise<{ fee: number; estimatedTime: string }> {
    const response = await apiClient.post(
      `${this.MALL_BASE_PATH}/calculate-transportation-fee`,
      { fromFacilityId, toFacilityId, quantity }
    );
    return this.extractResponseData(response);
  }

  static async validateFacilityCapacity(
    facilityId: string,
    requiredCapacity: number
  ): Promise<{ hasCapacity: boolean; availableSpace: number; message?: string }> {
    const response = await apiClient.get(
      `${this.MALL_BASE_PATH}/facilities/${facilityId}/validate-capacity?required=${requiredCapacity}`
    );
    return this.extractResponseData(response);
  }

  // Get submission history for MALL teams
  static async getSubmissionHistory(
    params?: MtoType2SubmissionHistoryParams
  ): Promise<MtoType2SubmissionHistoryResponse> {
    const queryParams = new URLSearchParams();

    if (params) {
      if (params.mtoType2Id) queryParams.append('mtoType2Id', params.mtoType2Id.toString());
      if (params.facilityInstanceId) queryParams.append('facilityInstanceId', params.facilityInstanceId);
      if (params.status) queryParams.append('status', params.status);
      if (params.fromDate) queryParams.append('fromDate', params.fromDate);
      if (params.toDate) queryParams.append('toDate', params.toDate);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    }

    const response = await apiClient.get(
      `${this.MALL_BASE_PATH}/submission-history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );

    // Handle the nested data structure from the API response
    const responseData = this.extractResponseData<any>(response);

    // The actual data is nested in responseData.data
    if (responseData && responseData.data) {
      return responseData.data as MtoType2SubmissionHistoryResponse;
    }

    // Fallback to direct response if structure is different
    return responseData as MtoType2SubmissionHistoryResponse;
  }
}

// Create a singleton instance for easier import and use
export const mtoType2Service = {
  createRequirement: MtoType2Service.createRequirement.bind(MtoType2Service),
  updateRequirement: MtoType2Service.updateRequirement.bind(MtoType2Service),
  deleteRequirement: MtoType2Service.deleteRequirement.bind(MtoType2Service),
  getRequirement: MtoType2Service.getRequirement.bind(MtoType2Service),
  getRequirements: MtoType2Service.getRequirements.bind(MtoType2Service),
  searchRequirements: MtoType2Service.searchRequirements.bind(MtoType2Service),
  releaseRequirement: MtoType2Service.releaseRequirement.bind(MtoType2Service),
  cancelRequirement: MtoType2Service.cancelRequirement.bind(MtoType2Service),
  getMallBudgets: MtoType2Service.getMallBudgets.bind(MtoType2Service),
  calculateBudgets: MtoType2Service.calculateBudgets.bind(MtoType2Service),
  getSubmissions: MtoType2Service.getSubmissions.bind(MtoType2Service),
  settleRequirement: MtoType2Service.settleRequirement.bind(MtoType2Service),
  getSettlements: MtoType2Service.getSettlements.bind(MtoType2Service),
  getCalculationHistory: MtoType2Service.getCalculationHistory.bind(MtoType2Service),
  getSettlementHistory: MtoType2Service.getSettlementHistory.bind(MtoType2Service),
  getStatistics: MtoType2Service.getStatistics.bind(MtoType2Service),
  getSettlementReport: MtoType2Service.getSettlementReport.bind(MtoType2Service),
  getManagerFormulas: MtoType2Service.getManagerFormulas.bind(MtoType2Service),

  // MALL Owner methods
  getAvailableForMall: MtoType2Service.getAvailableForMall.bind(MtoType2Service),
  getRequirementForMall: MtoType2Service.getRequirementForMall.bind(MtoType2Service),
  getCompetitorAnalysis: MtoType2Service.getCompetitorAnalysis.bind(MtoType2Service),
  createSubmission: MtoType2Service.createSubmission.bind(MtoType2Service),
  updateSubmission: MtoType2Service.updateSubmission.bind(MtoType2Service),
  withdrawSubmission: MtoType2Service.withdrawSubmission.bind(MtoType2Service),
  getMallSubmissions: MtoType2Service.getMallSubmissions.bind(MtoType2Service),
  getSubmissionStatus: MtoType2Service.getSubmissionStatus.bind(MtoType2Service),
  returnUnsettledProducts: MtoType2Service.returnUnsettledProducts.bind(MtoType2Service),
  getMallSettlements: MtoType2Service.getMallSettlements.bind(MtoType2Service),

  // Public methods
  getPublicRequirements: MtoType2Service.getPublicRequirements.bind(MtoType2Service),
  getPublicRequirement: MtoType2Service.getPublicRequirement.bind(MtoType2Service),
  getMarketInsights: MtoType2Service.getMarketInsights.bind(MtoType2Service),

  // New missing feature methods
  verifyMALLFacility: MtoType2Service.verifyMALLFacility.bind(MtoType2Service),
  lockFormula: MtoType2Service.lockFormula.bind(MtoType2Service),
  unlockFormula: MtoType2Service.unlockFormula.bind(MtoType2Service),
  getSettlementPriorities: MtoType2Service.getSettlementPriorities.bind(MtoType2Service),
  createUnsettledReturn: MtoType2Service.createUnsettledReturn.bind(MtoType2Service),
  getUnsettledReturns: MtoType2Service.getUnsettledReturns.bind(MtoType2Service),
  getPriceTrends: MtoType2Service.getPriceTrends.bind(MtoType2Service),
  bulkSettle: MtoType2Service.bulkSettle.bind(MtoType2Service),
  getAuditTrail: MtoType2Service.getAuditTrail.bind(MtoType2Service),
  calculateTransportationFee: MtoType2Service.calculateTransportationFee.bind(MtoType2Service),
  validateFacilityCapacity: MtoType2Service.validateFacilityCapacity.bind(MtoType2Service),
  getSubmissionHistory: MtoType2Service.getSubmissionHistory.bind(MtoType2Service)
};

export default MtoType2Service;