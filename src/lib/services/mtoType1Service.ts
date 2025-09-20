import apiClient from '@/lib/http/api-client';
import {
  MtoType1Requirement,
  MtoType1TileRequirement,
  MtoType1Delivery,
  MtoType1Settlement,
  MtoType1CalculationHistory,
  MtoType1SettlementHistory,
  MtoType1CreateRequest,
  MtoType1UpdateRequest,
  MtoType1DeliveryRequest,
  MtoType1DeliveryUpdateRequest,
  MtoType1SearchParams,
  MtoType1Statistics,
  MtoType1TileView,
  MtoType1TeamView
} from '@/lib/types/mtoType1';

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

export class MtoType1Service {
  private static readonly MANAGER_BASE_PATH = '/user/manager/mto-type1';
  private static readonly TEAM_BASE_PATH = '/team/mto-type1';

  private static extractResponseData<T>(response: any): T {
    if (response.data && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data || response;
  }

  // Manager Endpoints

  static async createRequirement(
    data: MtoType1CreateRequest
  ): Promise<MtoType1Requirement> {
    const response = await apiClient.post(`${this.MANAGER_BASE_PATH}/requirements`, data);
    return this.extractResponseData<MtoType1Requirement>(response);
  }

  static async updateRequirement(
    id: number,
    data: MtoType1UpdateRequest
  ): Promise<MtoType1Requirement> {
    const response = await apiClient.put(`${this.MANAGER_BASE_PATH}/requirements/${id}`, data);
    return this.extractResponseData<MtoType1Requirement>(response);
  }

  static async deleteRequirement(id: number): Promise<void> {
    await apiClient.delete(`${this.MANAGER_BASE_PATH}/requirements/${id}`);
  }

  static async getRequirement(id: number): Promise<MtoType1Requirement> {
    const response = await apiClient.get(`${this.MANAGER_BASE_PATH}/requirements/${id}`);
    return this.extractResponseData<MtoType1Requirement>(response);
  }

  static async getRequirements(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<MtoType1Requirement[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await apiClient.get(
      `${this.MANAGER_BASE_PATH}/requirements?${queryParams.toString()}`
    );
    return this.extractResponseData<MtoType1Requirement[]>(response);
  }

  static async searchRequirements(
    params: MtoType1SearchParams
  ): Promise<ApiResponse<MtoType1Requirement[]>> {
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
      `${this.MANAGER_BASE_PATH}/requirements?${queryParams.toString()}`
    );
    return response.data;
  }

  static async releaseRequirement(id: number): Promise<MtoType1Requirement> {
    const response = await apiClient.post(`${this.MANAGER_BASE_PATH}/requirements/${id}/release`);
    return this.extractResponseData<MtoType1Requirement>(response);
  }

  static async cancelRequirement(id: number, reason?: string): Promise<MtoType1Requirement> {
    const response = await apiClient.post(`${this.MANAGER_BASE_PATH}/requirements/${id}/cancel`, {
      reason: reason || 'Cancelled by manager'
    });
    return this.extractResponseData<MtoType1Requirement>(response);
  }

  static async getTileRequirements(
    requirementId: number
  ): Promise<MtoType1TileRequirement[]> {
    const response = await apiClient.get(
      `${this.MANAGER_BASE_PATH}/requirements/${requirementId}/tiles`
    );
    return this.extractResponseData<MtoType1TileRequirement[]>(response);
  }

  static async recalculateRequirements(requirementId: number): Promise<MtoType1TileRequirement[]> {
    const response = await apiClient.post(
      `${this.MANAGER_BASE_PATH}/requirements/${requirementId}/recalculate`
    );
    return this.extractResponseData<MtoType1TileRequirement[]>(response);
  }

  static async getDeliveries(requirementId: number): Promise<MtoType1Delivery[]> {
    const response = await apiClient.get(
      `${this.MANAGER_BASE_PATH}/requirements/${requirementId}/deliveries`
    );
    return this.extractResponseData<MtoType1Delivery[]>(response);
  }

  static async settleRequirement(requirementId: number): Promise<MtoType1SettlementHistory> {
    const response = await apiClient.post(
      `${this.MANAGER_BASE_PATH}/requirements/${requirementId}/settle`
    );
    return this.extractResponseData<MtoType1SettlementHistory>(response);
  }

  static async getSettlements(requirementId?: number): Promise<MtoType1Settlement[]> {
    const url = requirementId
      ? `${this.MANAGER_BASE_PATH}/requirements/${requirementId}/settlements`
      : `${this.MANAGER_BASE_PATH}/settlements`;
    const response = await apiClient.get(url);
    return this.extractResponseData<MtoType1Settlement[]>(response);
  }

  static async getCalculationHistory(
    requirementId: number
  ): Promise<MtoType1CalculationHistory[]> {
    const response = await apiClient.get(
      `${this.MANAGER_BASE_PATH}/requirements/${requirementId}/calculation-history`
    );
    return this.extractResponseData<MtoType1CalculationHistory[]>(response);
  }

  static async getSettlementHistory(
    requirementId: number
  ): Promise<MtoType1SettlementHistory[]> {
    const response = await apiClient.get(
      `${this.MANAGER_BASE_PATH}/requirements/${requirementId}/settlement-history`
    );
    return this.extractResponseData<MtoType1SettlementHistory[]>(response);
  }

  static async getStatistics(): Promise<MtoType1Statistics> {
    const response = await apiClient.get(`${this.MANAGER_BASE_PATH}/statistics`);
    return this.extractResponseData<MtoType1Statistics>(response);
  }

  // Team/Student Endpoints

  static async getAvailableRequirements(): Promise<MtoType1TeamView[]> {
    const response = await apiClient.get(`${this.TEAM_BASE_PATH}/available`);
    return this.extractResponseData<MtoType1TeamView[]>(response);
  }

  static async getRequirementForTeam(
    requirementId: number
  ): Promise<MtoType1TeamView> {
    const response = await apiClient.get(`${this.TEAM_BASE_PATH}/requirements/${requirementId}`);
    return this.extractResponseData<MtoType1TeamView>(response);
  }

  static async getTileViewForTeam(
    requirementId: number
  ): Promise<MtoType1TileView[]> {
    const response = await apiClient.get(
      `${this.TEAM_BASE_PATH}/requirements/${requirementId}/tiles`
    );
    return this.extractResponseData<MtoType1TileView[]>(response);
  }

  static async createDelivery(data: MtoType1DeliveryRequest): Promise<MtoType1Delivery> {
    const response = await apiClient.post(`${this.TEAM_BASE_PATH}/deliveries`, data);
    return this.extractResponseData<MtoType1Delivery>(response);
  }

  static async updateDelivery(
    deliveryId: number,
    data: MtoType1DeliveryUpdateRequest
  ): Promise<MtoType1Delivery> {
    const response = await apiClient.put(`${this.TEAM_BASE_PATH}/deliveries/${deliveryId}`, data);
    return this.extractResponseData<MtoType1Delivery>(response);
  }

  static async cancelDelivery(deliveryId: number): Promise<void> {
    await apiClient.delete(`${this.TEAM_BASE_PATH}/deliveries/${deliveryId}`);
  }

  static async getTeamDeliveries(
    teamId?: string,
    requirementId?: number
  ): Promise<MtoType1Delivery[]> {
    const params = new URLSearchParams();
    if (teamId) params.append('teamId', teamId);
    if (requirementId) params.append('requirementId', requirementId.toString());

    const response = await apiClient.get(
      `${this.TEAM_BASE_PATH}/deliveries?${params.toString()}`
    );
    return this.extractResponseData<MtoType1Delivery[]>(response);
  }

  static async getDeliveryStatus(deliveryId: number): Promise<MtoType1Delivery> {
    const response = await apiClient.get(`${this.TEAM_BASE_PATH}/deliveries/${deliveryId}`);
    return this.extractResponseData<MtoType1Delivery>(response);
  }

  static async retrieveUnsettledProducts(
    deliveryId: number,
    targetFacilitySpaceId: number
  ): Promise<void> {
    await apiClient.post(`${this.TEAM_BASE_PATH}/deliveries/${deliveryId}/retrieve`, {
      targetFacilitySpaceId
    });
  }

  static async getTeamSettlements(teamId?: string): Promise<MtoType1Settlement[]> {
    const params = teamId ? `?teamId=${teamId}` : '';
    const response = await apiClient.get(`${this.TEAM_BASE_PATH}/settlements${params}`);
    return this.extractResponseData<MtoType1Settlement[]>(response);
  }

  static async calculateTransportationCost(
    fromTileId: string,
    toTileId: string,
    quantity: number
  ): Promise<{ cost: number; distance: number }> {
    const response = await apiClient.post(`${this.TEAM_BASE_PATH}/calculate-transportation`, {
      fromTileId,
      toTileId,
      quantity
    });
    return this.extractResponseData<{ cost: number; distance: number }>(response);
  }
}

export default MtoType1Service;