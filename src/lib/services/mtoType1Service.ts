import apiClient from '@/lib/http/api-client';
import {
  MtoType1Requirement,
  MtoType1TileRequirement,
  MtoType1Delivery,
  MtoType1Settlement,
  MtoType1CalculationHistory,
  MtoType1SettlementHistory,
  MtoType1SettlementHistoryResponse,
  MtoType1CreateRequest,
  MtoType1UpdateRequest,
  MtoType1DeliveryRequest,
  MtoType1DeliveryUpdateRequest,
  MtoType1SearchParams,
  MtoType1Statistics,
  MtoType1TileView,
  MtoType1TeamView,
  MtoType1DeliveryDetail,
  MtoType1DeliverySummary,
  DeliveryFilters,
  PaginationParams,
  PaginatedResponse,
  DeliverySummaryStats
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
  ): Promise<{ data: MtoType1Requirement[]; extra?: { pagination?: any } }> {
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

    // Handle the nested response structure
    const responseData = response.data;
    if (responseData && responseData.data) {
      // If data has an items array, use that
      if (responseData.data.items && Array.isArray(responseData.data.items)) {
        return {
          data: responseData.data.items,
          extra: { pagination: responseData.data.pagination }
        };
      }
      // Otherwise use data directly if it's an array
      if (Array.isArray(responseData.data)) {
        return {
          data: responseData.data,
          extra: responseData.extra
        };
      }
    }

    // Fallback
    return { data: [], extra: undefined };
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

  static async getSettlementHistoryV2(
    requirementId: number
  ): Promise<{ data: MtoType1SettlementHistoryResponse }> {
    const response = await apiClient.get(
      `${this.MANAGER_BASE_PATH}/requirements/${requirementId}/settlement-history`
    );
    return response.data;
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

  static async getManagerFormula(formulaId: number): Promise<any> {
    const response = await apiClient.get(
      `${this.TEAM_BASE_PATH}/manager-formulas/${formulaId}`
    );
    return this.extractResponseData<any>(response);
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

  // Get available tiles for a requirement
  static async getRequirementTiles(requirementId: number): Promise<MtoType1TileView[]> {
    const response = await apiClient.get(
      `${this.TEAM_BASE_PATH}/requirements/${requirementId}/tiles`
    );
    return this.extractResponseData<MtoType1TileView[]>(response);
  }

  // Transportation API methods
  static async getTeamFacilitiesWithSpace(activityId?: string): Promise<any> {
    const params = new URLSearchParams();
    if (activityId) params.append('activityId', activityId);

    const response = await apiClient.get(
      `/transportation/facilities/space-status?${params.toString()}`
    );
    return this.extractResponseData<any>(response);
  }

  static async getFacilityInventoryItems(
    inventoryId: string,
    itemType?: 'RAW_MATERIAL' | 'PRODUCT'
  ): Promise<any> {
    const params = new URLSearchParams();
    if (itemType) params.append('itemType', itemType);

    const response = await apiClient.get(
      `/transportation/facilities/${inventoryId}/items?${params.toString()}`
    );
    return this.extractResponseData<any>(response);
  }

  static async calculateTransportationCostDetailed(
    sourceInventoryId: string,
    destInventoryId: string,
    inventoryItemId: string,
    quantity: string
  ): Promise<any> {
    const response = await apiClient.post('/transportation/calculate', {
      sourceInventoryId,
      destInventoryId,
      inventoryItemId,
      quantity
    });
    return this.extractResponseData<any>(response);
  }

  // Calculate MTO-specific transportation cost to a tile
  static async calculateMtoTransportationCost(
    inventoryItemId: string,
    quantity: string,
    sourceInventoryId: string,
    destinationTileId: string
  ): Promise<any> {
    const response = await apiClient.post('/transportation/mto-calculate', {
      inventoryItemId,
      quantity,
      sourceInventoryId,
      destinationTileId
    });
    return this.extractResponseData<any>(response);
  }

  static async executeTransfer(
    sourceInventoryId: string,
    destInventoryId: string,
    inventoryItemId: string,
    quantity: string,
    tier: string
  ): Promise<any> {
    const response = await apiClient.post('/transportation/transfer', {
      sourceInventoryId,
      destInventoryId,
      inventoryItemId,
      quantity,
      tier
    });
    return this.extractResponseData<any>(response);
  }

  // Submit MTO delivery with product inventory items
  static async submitMtoDelivery(data: {
    mtoType1Id: number;
    tileRequirementId: number;
    deliveryNumber: number;
    productInventoryItemIds: string[];
    sourceFacilityInstanceId: string;
  }): Promise<any> {
    const response = await apiClient.post(`${this.TEAM_BASE_PATH}/deliveries`, data);
    return this.extractResponseData<any>(response);
  }

  // Enhanced Student Delivery Methods

  // Get all team deliveries with full details and pagination (endpoint 2.12)
  static async getTeamDeliveriesDetailed(
    params?: DeliveryFilters & PaginationParams
  ): Promise<PaginatedResponse<MtoType1DeliverySummary>> {
    const queryParams = new URLSearchParams();

    // Add filter parameters
    if (params?.mtoType1Id) queryParams.append('mtoType1Id', params.mtoType1Id.toString());
    if (params?.status) {
      params.status.forEach(s => queryParams.append('status[]', s));
    }
    if (params?.tileId) queryParams.append('tileId', params.tileId);
    if (params?.settlementStatus) queryParams.append('settlementStatus', params.settlementStatus);

    // Date filters
    if (params?.dateFrom) queryParams.append('fromDate', params.dateFrom);
    if (params?.dateTo) queryParams.append('toDate', params.dateTo);
    if (params?.dateType) queryParams.append('dateType', params.dateType);

    // Amount filters
    if (params?.minAmount) queryParams.append('minAmount', params.minAmount.toString());
    if (params?.maxAmount) queryParams.append('maxAmount', params.maxAmount.toString());

    // Pagination
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    // Display options
    queryParams.append('includeFormula', 'true');
    queryParams.append('includeTileInfo', 'true');

    const response = await apiClient.get(
      `${this.TEAM_BASE_PATH}/deliveries?${queryParams.toString()}`
    );

    const responseData = response.data;
    if (responseData && responseData.data) {
      // Map the actual API response structure to our interface
      const mappedDeliveries: MtoType1DeliverySummary[] = responseData.data.map((delivery: any) => ({
        id: delivery.id.toString(),
        mtoType1Id: delivery.mtoType1Id,
        mtoType1Name: delivery.mtoType1?.managerProductFormula?.productName || delivery.managerProductFormulaName,
        mtoStatus: delivery.mtoType1?.status,
        deliveryNumber: delivery.id, // Use id as delivery number
        deliveryStatus: delivery.settlementStatus,
        deliveredAt: delivery.deliveredAt,
        settledAt: delivery.settledAt,
        tile: {
          tileId: delivery.tileRequirement?.mapTileId?.toString() || delivery.tileRequirementId?.toString(),
          tileName: delivery.tileRequirement?.tileName || 'Unknown',
          axialQ: 0, // These might need to be extracted from tile coordinates
          axialR: 0
        },
        formulaSummary: delivery.mtoType1 ? {
          formulaId: delivery.mtoType1.managerProductFormulaId,
          productName: delivery.mtoType1?.managerProductFormula?.productName || delivery.managerProductFormulaName,
          purchasePrice: delivery.mtoType1.purchaseGoldPrice
        } : undefined,
        quantities: {
          delivered: delivery.unsettledNumber + delivery.settledNumber,
          settled: delivery.settledNumber,
          unsettled: delivery.unsettledNumber,
          rejected: delivery.settlementStatus === 'REJECTED' ? delivery.unsettledNumber + delivery.settledNumber : 0
        },
        financial: {
          transportationFee: delivery.transportationFee,
          settlementAmount: delivery.settlementAmount || 0,
          totalRevenue: delivery.settlementAmount || 0
        },
        canRequestReturn: !delivery.returnRequested && delivery.unsettledNumber > 0
      }));

      return {
        data: mappedDeliveries,
        extra: responseData.extra
      };
    }

    // Fallback
    return { data: [], extra: undefined };
  }

  // Get single delivery comprehensive details (endpoint 2.11)
  static async getDeliveryFullDetails(
    deliveryId: string,
    includeOptions?: {
      includeFormula?: boolean;
      includeProducts?: boolean;
      includeSettlement?: boolean;
    }
  ): Promise<MtoType1DeliveryDetail> {
    const queryParams = new URLSearchParams();

    // Default to include all details
    queryParams.append('includeFormula', (includeOptions?.includeFormula ?? true).toString());
    queryParams.append('includeProducts', (includeOptions?.includeProducts ?? true).toString());
    queryParams.append('includeSettlement', (includeOptions?.includeSettlement ?? true).toString());

    const response = await apiClient.get(
      `${this.TEAM_BASE_PATH}/deliveries/${deliveryId}?${queryParams.toString()}`
    );

    // Extract the nested data structure from API response
    const responseData = response.data;
    if (responseData && responseData.data && responseData.data.delivery) {
      return this.mapApiResponseToDeliveryDetail(responseData.data);
    }

    return this.extractResponseData<MtoType1DeliveryDetail>(response);
  }

  // Helper method to map API response to our interface
  private static mapApiResponseToDeliveryDetail(apiData: any): MtoType1DeliveryDetail {
    // Handle both the wrapped response structure and direct delivery data
    const delivery = apiData.delivery || apiData;
    const mtoType1 = apiData.mtoRequirement || delivery.mtoType1 || {};
    const tileRequirement = apiData.tileLocation || delivery.tileRequirement || {};

    return {
      id: delivery.id?.toString() || '',
      deliveryNumber: delivery.id || 0, // Use id as delivery number
      mtoType1Id: delivery.mtoType1Id || mtoType1.id || 0,
      mtoRequirement: {
        id: mtoType1.id || delivery.mtoType1Id || 0,
        requirementName: mtoType1.requirementName || mtoType1.metadata?.name,
        status: mtoType1.status || 'PENDING',
        purchaseGoldPrice: mtoType1.purchaseGoldPrice || '0',
        releaseTime: mtoType1.releaseTime || '',
        settlementTime: mtoType1.settlementTime || ''
      },
      tileLocation: {
        tileId: tileRequirement.mapTileId?.toString() || tileRequirement.tileId || '',
        tileName: tileRequirement.tileName || 'Unknown',
        coordinates: {
          q: tileRequirement.axialQ || 0,
          r: tileRequirement.axialR || 0
        },
        population: tileRequirement.tilePopulation,
        tileRequirement: tileRequirement.tileRequirement || {
          initialRequirementNumber: tileRequirement.initialRequirementNumber || 0,
          adjustedRequirementNumber: tileRequirement.adjustedRequirementNumber || 0,
          deliveredNumber: tileRequirement.deliveredNumber || 0,
          settledNumber: tileRequirement.settledNumber || 0,
          remainingNumber: tileRequirement.remainingNumber || 0
        }
      },
      deliveryStatus: delivery.settlementStatus || delivery.status || 'PENDING',
      quantities: {
        delivered: (delivery.unsettledNumber || 0) + (delivery.settledNumber || 0),
        settled: delivery.settledNumber || 0,
        unsettled: delivery.unsettledNumber || 0,
        rejected: 0
      },
      financial: {
        transportationFee: delivery.transportationFee || '0',
        settlementAmount: delivery.settlementAmount || '0',
        unitPrice: mtoType1.purchaseGoldPrice || '0',
        totalRevenue: delivery.settlementAmount || '0'
      },
      managerFormula: apiData.managerFormula || undefined,
      submittedProducts: apiData.submittedProducts || delivery.submittedProducts || [],
      timestamps: {
        deliveredAt: delivery.deliveredAt || '',
        settledAt: delivery.settledAt || null,
        returnRequestedAt: null,
        returnCompletedAt: delivery.returnCompletedAt || null
      },
      returnStatus: {
        requested: delivery.returnRequested || false,
        returnFacilityId: delivery.returnFacilityInstanceId,
        returnTransportationFee: delivery.returnTransportationFee,
        returnCompletedAt: delivery.returnCompletedAt
      },
      canRequestReturn: !delivery.returnRequested && (delivery.unsettledNumber || 0) > 0
    };
  }

  // Get delivery summary statistics
  static async getDeliverySummaryStats(
    teamId?: string,
    requirementId?: number
  ): Promise<DeliverySummaryStats> {
    const params = new URLSearchParams();
    if (teamId) params.append('teamId', teamId);
    if (requirementId) params.append('requirementId', requirementId.toString());

    const response = await apiClient.get(
      `${this.TEAM_BASE_PATH}/deliveries/summary?${params.toString()}`
    );

    return this.extractResponseData<DeliverySummaryStats>(response);
  }

  // Request product return for unsettled items
  static async requestProductReturn(
    deliveryId: string,
    data: {
      returnFacilityId: string;
      acceptTransportationFee: boolean;
    }
  ): Promise<void> {
    await apiClient.post(
      `${this.TEAM_BASE_PATH}/deliveries/${deliveryId}/return`,
      data
    );
  }

  // Get distribution summary for student view
  static async getDistributionSummary(requirementId: number): Promise<any> {
    const response = await apiClient.get(
      `${this.TEAM_BASE_PATH}/requirements/${requirementId}/distribution-summary`
    );
    return this.extractResponseData<any>(response);
  }

  // Get settlement results for team
  static async getTeamSettlementResults(
    requirementId: number
  ): Promise<any> {
    const response = await apiClient.get(
      `${this.TEAM_BASE_PATH}/requirements/${requirementId}/settlement-results`
    );
    return this.extractResponseData<any>(response);
  }
}

export default MtoType1Service;