import apiClient from '@/lib/http/api-client';
import {
  TransferRequest,
  TransferCostRequest,
  TransferResponse,
  TransportationCostPreview,
  TransportationOrder,
  TransportationOrderListResponse,
  AvailableRoute,
  TransportationTier,
  FacilityInventoryResponse
} from '@/types/transportation';

export class TransportationService {
  private static readonly BASE_PATH = '/transportation';

  private static extractResponseData<T>(response: { data: { data?: { data?: T } | T } | T }): T {
    const data = response.data;
    if (typeof data === 'object' && data !== null && 'data' in data) {
      const innerData = (data as { data: unknown }).data;
      if (typeof innerData === 'object' && innerData !== null && 'data' in innerData) {
        return (innerData as { data: T }).data;
      }
      return innerData as T;
    }
    return data as T;
  }

  static async calculateTransferCost(
    request: TransferCostRequest
  ): Promise<TransportationCostPreview> {
    const response = await apiClient.post<{ data: TransportationCostPreview }>(
      `${this.BASE_PATH}/calculate`,
      request
    );
    return this.extractResponseData<TransportationCostPreview>(response);
  }

  static async executeTransfer(
    request: TransferRequest
  ): Promise<TransferResponse> {
    const response = await apiClient.post<{ data: TransferResponse }>(
      `${this.BASE_PATH}/transfer`,
      request
    );
    return this.extractResponseData<TransferResponse>(response);
  }

  static async getAvailableRoutes(
    sourceInventoryId: string,
    itemType?: string,
    itemId?: number
  ): Promise<AvailableRoute[]> {
    const response = await apiClient.get<{ data: AvailableRoute[] }>(
      `${this.BASE_PATH}/routes`,
      {
        params: { sourceInventoryId, itemType, itemId }
      }
    );
    return this.extractResponseData<AvailableRoute[]>(response) || [];
  }

  static async getFacilityInventoryItems(
    inventoryId: string,
    params?: {
      itemType?: 'RAW_MATERIAL' | 'PRODUCT';
      sortBy?: 'quantity' | 'totalValue' | 'receivedDate' | 'spaceOccupied';
      sortOrder?: 'asc' | 'desc';
      includeExpired?: boolean;
      search?: string;
    }
  ): Promise<FacilityInventoryResponse> {
    const response = await apiClient.get<FacilityInventoryResponse>(
      `${this.BASE_PATH}/facilities/${inventoryId}/items`,
      { params }
    );
    return this.extractResponseData<FacilityInventoryResponse>(response);
  }

  static async getTransferHistory(
    filters?: {
      activityId?: string;
      role?: 'sender' | 'receiver';
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ items: TransportationOrder[]; total: number }> {
    const response = await apiClient.get<any>(
      `${this.BASE_PATH}/history`,
      { params: filters }
    );
    
    // Handle the actual API response structure
    const responseData = response.data;
    
    // Check if the response has the expected structure
    if (responseData?.data?.transfers && responseData?.data?.pagination) {
      return {
        items: responseData.data.transfers || [],
        total: responseData.data.pagination.total || 0
      };
    }
    
    // Fallback to legacy structure
    const data = this.extractResponseData<{ items: TransportationOrder[]; total: number }>(response);
    return {
      items: data.items || [],
      total: data.total || 0
    };
  }

  static async getTransferDetails(orderId: string): Promise<TransportationOrder> {
    const response = await apiClient.get<{ data: TransportationOrder }>(
      `${this.BASE_PATH}/orders/${orderId}`
    );
    return this.extractResponseData<TransportationOrder>(response);
  }

  static async cancelTransfer(orderId: string): Promise<TransferResponse> {
    const response = await apiClient.post<{ data: TransferResponse }>(
      `${this.BASE_PATH}/orders/${orderId}/cancel`
    );
    return this.extractResponseData<TransferResponse>(response);
  }

  static calculateHexDistance(
    sourceCoords: { q: number; r: number },
    destCoords: { q: number; r: number }
  ): number {
    return (
      Math.abs(sourceCoords.q - destCoords.q) +
      Math.abs(sourceCoords.q + sourceCoords.r - destCoords.q - destCoords.r) +
      Math.abs(sourceCoords.r - destCoords.r)
    ) / 2;
  }

  static determineTier(hexDistance: number): TransportationTier | null {
    if (hexDistance >= 1 && hexDistance <= 3) return TransportationTier.A;
    if (hexDistance >= 4 && hexDistance <= 6) return TransportationTier.B;
    if (hexDistance >= 7 && hexDistance <= 9) return TransportationTier.C;
    if (hexDistance >= 10) return TransportationTier.D;
    return null;
  }

  static formatGoldCost(cost: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(cost);
  }

  static formatCarbonEmission(emission: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3
    }).format(emission);
  }

  static getTierDisplayName(tier: TransportationTier): string {
    const tierNames = {
      [TransportationTier.A]: 'Economy (1-3 hexes)',
      [TransportationTier.B]: 'Standard (4-6 hexes)',
      [TransportationTier.C]: 'Express (7-9 hexes)',
      [TransportationTier.D]: 'Premium (10+ hexes)'
    };
    return tierNames[tier] || tier;
  }

  static getTierColor(tier: TransportationTier): string {
    const tierColors = {
      [TransportationTier.A]: '#4CAF50',
      [TransportationTier.B]: '#2196F3',
      [TransportationTier.C]: '#FF9800',
      [TransportationTier.D]: '#9C27B0'
    };
    return tierColors[tier] || '#757575';
  }
}

export default TransportationService;