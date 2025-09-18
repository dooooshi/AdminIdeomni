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
  MtoType2CompetitorAnalysis
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
  private static readonly ADMIN_BASE_PATH = '/api/admin/mto-type-2';
  private static readonly MALL_BASE_PATH = '/api/mall/mto-type-2';
  private static readonly PUBLIC_BASE_PATH = '/api/public/mto-type-2';

  private static extractResponseData<T>(response: any): T {
    if (response.data && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data || response;
  }

  // Manager/Admin Endpoints

  static async createRequirement(
    data: MtoType2CreateRequest
  ): Promise<MtoType2Requirement> {
    const response = await apiClient.post(this.ADMIN_BASE_PATH, data);
    return this.extractResponseData<MtoType2Requirement>(response);
  }

  static async updateRequirement(
    id: number,
    data: MtoType2UpdateRequest
  ): Promise<MtoType2Requirement> {
    const response = await apiClient.put(`${this.ADMIN_BASE_PATH}/${id}`, data);
    return this.extractResponseData<MtoType2Requirement>(response);
  }

  static async deleteRequirement(id: number): Promise<void> {
    await apiClient.delete(`${this.ADMIN_BASE_PATH}/${id}`);
  }

  static async getRequirement(id: number): Promise<MtoType2Requirement> {
    const response = await apiClient.get(`${this.ADMIN_BASE_PATH}/${id}`);
    return this.extractResponseData<MtoType2Requirement>(response);
  }

  static async getRequirements(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<MtoType2Requirement[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await apiClient.get(
      `${this.ADMIN_BASE_PATH}?${queryParams.toString()}`
    );
    return this.extractResponseData<MtoType2Requirement[]>(response);
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
    if (params.activityId) queryParams.append('activityId', params.activityId);
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
      `${this.ADMIN_BASE_PATH}?${queryParams.toString()}`
    );
    return response.data;
  }

  static async releaseRequirement(id: number): Promise<MtoType2Requirement> {
    const response = await apiClient.post(`${this.ADMIN_BASE_PATH}/${id}/release`);
    return this.extractResponseData<MtoType2Requirement>(response);
  }

  static async cancelRequirement(id: number): Promise<MtoType2Requirement> {
    const response = await apiClient.post(`${this.ADMIN_BASE_PATH}/${id}/cancel`);
    return this.extractResponseData<MtoType2Requirement>(response);
  }

  static async getMallBudgets(requirementId: number): Promise<MtoType2MallBudget[]> {
    const response = await apiClient.get(
      `${this.ADMIN_BASE_PATH}/${requirementId}/budgets`
    );
    return this.extractResponseData<MtoType2MallBudget[]>(response);
  }

  static async calculateBudgets(requirementId: number): Promise<MtoType2MallBudget[]> {
    const response = await apiClient.post(
      `${this.ADMIN_BASE_PATH}/${requirementId}/calculate-budgets`
    );
    return this.extractResponseData<MtoType2MallBudget[]>(response);
  }

  static async getSubmissions(requirementId: number): Promise<MtoType2Submission[]> {
    const response = await apiClient.get(
      `${this.ADMIN_BASE_PATH}/${requirementId}/submissions`
    );
    return this.extractResponseData<MtoType2Submission[]>(response);
  }

  static async settleRequirement(requirementId: number): Promise<MtoType2SettlementHistory> {
    const response = await apiClient.post(
      `${this.ADMIN_BASE_PATH}/${requirementId}/settle`
    );
    return this.extractResponseData<MtoType2SettlementHistory>(response);
  }

  static async getSettlements(requirementId: number): Promise<MtoType2Settlement[]> {
    const response = await apiClient.get(
      `${this.ADMIN_BASE_PATH}/${requirementId}/settlements`
    );
    return this.extractResponseData<MtoType2Settlement[]>(response);
  }

  static async getCalculationHistory(
    requirementId: number
  ): Promise<MtoType2CalculationHistory[]> {
    const response = await apiClient.get(
      `${this.ADMIN_BASE_PATH}/${requirementId}/calculation-history`
    );
    return this.extractResponseData<MtoType2CalculationHistory[]>(response);
  }

  static async getSettlementHistory(
    requirementId: number
  ): Promise<MtoType2SettlementHistory[]> {
    const response = await apiClient.get(
      `${this.ADMIN_BASE_PATH}/${requirementId}/settlement-history`
    );
    return this.extractResponseData<MtoType2SettlementHistory[]>(response);
  }

  static async getStatistics(activityId?: string): Promise<MtoType2Statistics> {
    const params = activityId ? `?activityId=${activityId}` : '';
    const response = await apiClient.get(`${this.ADMIN_BASE_PATH}/statistics${params}`);
    return this.extractResponseData<MtoType2Statistics>(response);
  }

  // MALL Owner Endpoints

  static async getAvailableForMall(
    activityId?: string
  ): Promise<MtoType2MallOwnerView[]> {
    const params = activityId ? `?activityId=${activityId}` : '';
    const response = await apiClient.get(`${this.MALL_BASE_PATH}/available${params}`);
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
    const response = await apiClient.post(`${this.MALL_BASE_PATH}/submissions`, data);
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
    const response = await apiClient.get(`${this.PUBLIC_BASE_PATH}/available${params}`);
    return this.extractResponseData<MtoType2PublicView[]>(response);
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
}

export default MtoType2Service;