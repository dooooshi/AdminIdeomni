import apiClient from '@/lib/http/api-client';
import { ApiError } from '@/lib/http/axios-config';
import {
  TradeOrder,
  TradeStatus,
  CreateTradeRequest,
  AcceptTradeRequest,
  RejectTradeRequest,
  PreviewTradeRequest,
  TradePreviewResponse,
  TradeListParams,
  TradeListResponse,
  TradeDetailsResponse,
  TradeHistory,
  AvailableTeamsResponse,
  AvailableDestinationsResponse,
  Team,
  FacilitySpaceInventory,
  TradeError,
  isTradeError,
  toNumber,
  TradeListItem,
  TradeStatusTranslationKeys,
} from '@/types/trade';

/**
 * Trade Service
 * Handles all trade-related API operations for students
 * Based on the API documentation from docs/trade/
 */
export class TradeService {
  private static readonly TRADES_BASE_PATH = '/trades';

  /**
   * Helper method to extract data from API response wrapper
   * According to API spec, all responses should be { success: true, data: {...} }
   */
  private static extractResponseData<T>(response: any): T {
    // Standard API response format
    if (response.data && 'success' in response.data && 'data' in response.data) {
      console.log('API Response:', response.data);
      return response.data.data;
    }

    // Fallback for backward compatibility
    if (response.data) {
      console.warn('Non-standard API response format:', response.data);
      return response.data;
    }

    console.error('Unexpected response format:', response);
    return response;
  }

  /**
   * Handle API errors
   */
  private static handleError(error: any): never {
    if (error instanceof ApiError) {
      const detailMessage = typeof error.details?.message === 'string'
        ? error.details.message
        : typeof error.details?.error === 'string'
          ? error.details.error
          : null;

      if (detailMessage) {
        throw new Error(detailMessage);
      }

      if (typeof error.message === 'string' && error.message) {
        throw new Error(error.message);
      }

      throw error;
    }

    const responseData = error.response?.data;

    if (responseData && isTradeError(responseData)) {
      const tradeError = responseData as TradeError;

      const detailMessage = typeof tradeError.details?.message === 'string'
        ? tradeError.details.message
        : typeof tradeError.details?.error === 'string'
          ? tradeError.details.error
          : null;

      if (detailMessage) {
        throw new Error(detailMessage);
      }

      const hasQuantityDetails = typeof tradeError.details?.required !== 'undefined'
        && typeof tradeError.details?.available !== 'undefined';

      if (hasQuantityDetails) {
        throw new Error(
          `${tradeError.message} (Required: ${tradeError.details?.required}, Available: ${tradeError.details?.available})`
        );
      }

      throw new Error(tradeError.message);
    }

    const detailsMessage = typeof responseData?.details?.message === 'string'
      ? responseData.details.message
      : typeof responseData?.details?.error === 'string'
        ? responseData.details.error
        : null;

    if (detailsMessage) {
      throw new Error(detailsMessage);
    }

    if (typeof responseData?.message === 'string') {
      throw new Error(responseData.message);
    }

    throw error;
  }

  // ==================== TRADE RETRIEVAL OPERATIONS ====================

  /**
   * Get available teams for trading
   * GET /api/trades/available-teams
   */
  static async getAvailableTeams(): Promise<Team[]> {
    try {
      const response = await apiClient.get<AvailableTeamsResponse>(
        `${this.TRADES_BASE_PATH}/available-teams`
      );
      return this.extractResponseData<Team[]>(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get available destinations for receiving trade
   * GET /api/trades/available-destinations
   */
  static async getAvailableDestinations(): Promise<FacilitySpaceInventory[]> {
    try {
      const response = await apiClient.get<AvailableDestinationsResponse>(
        `${this.TRADES_BASE_PATH}/available-destinations`
      );
      return this.extractResponseData<FacilitySpaceInventory[]>(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get source inventories with tradeable items
   * GET /api/trades/source-inventories
   */
  static async getSourceInventories(): Promise<FacilitySpaceInventory[]> {
    try {
      const response = await apiClient.get<AvailableDestinationsResponse>(
        `${this.TRADES_BASE_PATH}/source-inventories`
      );
      return this.extractResponseData<FacilitySpaceInventory[]>(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * List trades with filtering
   * GET /api/trades
   */
  static async listTrades(params: TradeListParams = {}): Promise<TradeListResponse> {
    try {
      const queryParams: Record<string, any> = {};

      if (params.type) queryParams.type = params.type;
      if (params.status) {
        queryParams.status = Array.isArray(params.status)
          ? params.status.join(',')
          : params.status;
      }
      if (params.page) queryParams.page = params.page;
      if (params.limit) {
        const parsedLimit = Math.max(1, Math.min(params.limit, 100));
        queryParams.limit = parsedLimit;
      }

      const response = await apiClient.get<TradeListResponse>(
        this.TRADES_BASE_PATH,
        { params: queryParams }
      );

      const extracted = this.extractResponseData<any>(response);

      const normalizeData = (payload: any) => {
        if (!payload || typeof payload !== 'object') {
          return { items: Array.isArray(payload) ? payload : [], pagination: undefined };
        }

        if (Array.isArray(payload)) {
          return { items: payload, pagination: undefined };
        }

        const nestedData = Array.isArray(payload.data)
          ? payload.data
          : Array.isArray(payload.items)
            ? payload.items
            : Array.isArray(payload.trades)
              ? payload.trades
              : Array.isArray(payload.results)
                ? payload.results
                : Array.isArray(payload.records)
                  ? payload.records
                  : Array.isArray(payload.list)
                    ? payload.list
                    : Array.isArray(payload)
                      ? payload
                      : Array.isArray(payload.data?.data)
                        ? payload.data.data
                        : [];

        const pagination = payload.pagination || payload.meta || payload.pageInfo || payload.data?.pagination || undefined;

        return { items: nestedData, pagination };
      };

      const { items, pagination } = normalizeData(extracted);

      const result: TradeListResponse = {
        success: response.data?.success ?? true,
        data: items,
        total: pagination?.total ?? extracted?.total ?? items.length,
        page: pagination?.page ?? extracted?.page ?? params.page ?? 1,
        limit: pagination?.limit ?? pagination?.pageSize ?? extracted?.limit ?? params.limit ?? 20,
        pagination,
      };

      return result;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get trade details
   * GET /api/trades/:id
   */
  static async getTradeDetails(tradeId: string): Promise<TradeOrder> {
    try {
      const response = await apiClient.get<TradeDetailsResponse>(
        `${this.TRADES_BASE_PATH}/${tradeId}`
      );
      const data = this.extractResponseData<TradeOrder>(response);
      return this.normalizeTrade(data);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get trade history
   * GET /api/trades/:id/history
   */
  static async getTradeHistory(tradeId: string): Promise<TradeHistory[]> {
    try {
      const response = await apiClient.get(
        `${this.TRADES_BASE_PATH}/${tradeId}/history`
      );
      return this.extractResponseData<TradeHistory[]>(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== TRADE CREATION OPERATIONS ====================

  /**
   * Create a new trade
   * POST /api/trades
   */
  static async createTrade(request: CreateTradeRequest): Promise<TradeOrder> {
    try {
      const response = await apiClient.post<TradeDetailsResponse>(
        this.TRADES_BASE_PATH,
        request
      );
      const data = this.extractResponseData<TradeOrder>(response);
      return this.normalizeTrade(data);
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== TRADE ACTION OPERATIONS ====================

  /**
   * Preview trade (calculate transport cost)
   * POST /api/trades/:id/preview
   * Response should include itemsCost, transportCost, totalCost, validation
   */
  static async previewTrade(
    tradeId: string,
    request: PreviewTradeRequest
  ): Promise<TradePreviewResponse> {
    try {
      const response = await apiClient.post<{ success: boolean; data: TradePreviewResponse }>(
        `${this.TRADES_BASE_PATH}/${tradeId}/preview`,
        request
      );
      const data = this.extractResponseData<TradePreviewResponse>(response);

      // Validate response structure matches API spec
      if (!data.itemsCost || !data.transportCost || !data.totalCost) {
        console.error('Invalid preview response structure:', data);
        throw new Error('Invalid trade preview response from server');
      }

      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Accept trade
   * POST /api/trades/:id/accept
   * Response should include transaction details with itemsCost, transportCost, totalPaid
   */
  static async acceptTrade(
    tradeId: string,
    request: AcceptTradeRequest
  ): Promise<TradeOrder> {
    try {
      const response = await apiClient.post<TradeDetailsResponse>(
        `${this.TRADES_BASE_PATH}/${tradeId}/accept`,
        request
      );
      const data = this.extractResponseData<TradeOrder>(response);

      // Log transaction details if available
      if (data.transaction) {
        console.log('Trade accepted with transaction:', {
          itemsCost: data.transaction.itemsCost,
          transportCost: data.transaction.transportCost,
          totalPaid: data.transaction.totalPaid,
        });
      }

      return this.normalizeTrade(data);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Reject trade
   * POST /api/trades/:id/reject
   */
  static async rejectTrade(
    tradeId: string,
    request: RejectTradeRequest = {}
  ): Promise<TradeOrder> {
    try {
      const response = await apiClient.post<TradeDetailsResponse>(
        `${this.TRADES_BASE_PATH}/${tradeId}/reject`,
        request
      );
      const data = this.extractResponseData<TradeOrder>(response);
      return this.normalizeTrade(data);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Cancel trade
   * DELETE /api/trades/:id
   */
  static async cancelTrade(tradeId: string): Promise<TradeOrder> {
    try {
      const response = await apiClient.delete<TradeDetailsResponse>(
        `${this.TRADES_BASE_PATH}/${tradeId}`
      );
      const data = this.extractResponseData<TradeOrder>(response);
      return this.normalizeTrade(data);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Ensure trade summary fields are present regardless of backend omissions
   */
  private static normalizeTrade(trade: TradeOrder): TradeOrder {
    if (!trade) {
      return trade;
    }

    const senderTeamId = trade.senderTeamId || trade.senderTeam?.id;
    const targetTeamId = trade.targetTeamId || trade.targetTeam?.id;
    const sourceFacilityId = trade.sourceFacilityId || trade.sourceFacility?.id;

    if (senderTeamId === trade.senderTeamId &&
        targetTeamId === trade.targetTeamId &&
        sourceFacilityId === trade.sourceFacilityId) {
      return trade;
    }

    return {
      ...trade,
      senderTeamId,
      targetTeamId,
      sourceFacilityId,
    };
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get trade status color for UI
   */
  static getStatusColor(status: TradeStatus): 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' {
    const colors: Record<TradeStatus, 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'> = {
      [TradeStatus.PENDING]: 'warning',
      [TradeStatus.ACCEPTED]: 'info',
      [TradeStatus.REJECTED]: 'error',
      [TradeStatus.CANCELLED]: 'default',
      [TradeStatus.COMPLETED]: 'success',
    };
    return colors[status] || 'default';
  }

  /**
   * Get trade status display text
   */
  static getStatusText(
    status: TradeStatus,
    translate?: (key: string, options?: Record<string, unknown>) => string
  ): string {
    const translationKey = TradeStatusTranslationKeys[status];
    const fallbackLabel = status.charAt(0) + status.slice(1).toLowerCase();

    if (translationKey && translate) {
      return translate(translationKey, { defaultValue: fallbackLabel });
    }

    return translationKey ? fallbackLabel : status;
  }

  /**
   * Format currency for display
   */
  static formatCurrency(value: number | string, showSymbol = true): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (showSymbol) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(numValue).replace('$', '');
    }

    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  }

  /**
   * Calculate total items quantity
   */
  static calculateTotalQuantity(items: Array<{ quantity: number | string }>): number {
    return items.reduce((total, item) => {
      const quantity = typeof item.quantity === 'string'
        ? parseFloat(item.quantity)
        : item.quantity;
      return total + quantity;
    }, 0);
  }

  /**
   * Check if user can respond to trade
   */
  static canRespondToTrade(
    trade: TradeOrder,
    currentTeamId: string
  ): boolean {
    const targetTeamId = trade.targetTeamId || trade.targetTeam?.id;
    return trade.status === TradeStatus.PENDING && targetTeamId === currentTeamId;
  }

  /**
   * Check if user can cancel trade
   */
  static canCancelTrade(
    trade: TradeOrder,
    currentTeamId: string
  ): boolean {
    const senderTeamId = trade.senderTeamId || trade.senderTeam?.id;
    return trade.status === TradeStatus.PENDING && senderTeamId === currentTeamId;
  }

  /**
   * Get trade type for current user
   */
  static getTradeType(
    trade: TradeOrder,
    currentTeamId: string
  ): 'incoming' | 'outgoing' {
    const targetTeamId = trade.targetTeamId || trade.targetTeam?.id;
    return targetTeamId === currentTeamId ? 'incoming' : 'outgoing';
  }

  /**
   * Format trade date
   */
  static formatTradeDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  }

  /**
   * Get trade summary text
   */
  static getTradeSummary(trade: TradeOrder): string {
    const itemCount = trade.items?.length || 0;
    const totalQuantity = trade.items
      ? this.calculateTotalQuantity(trade.items)
      : 0;

    return `${itemCount} item${itemCount !== 1 ? 's' : ''} (${totalQuantity} units)`;
  }

  /**
   * Validate trade creation request
   */
  static validateTradeRequest(request: CreateTradeRequest): string[] {
    const errors: string[] = [];

    if (!request.targetTeamId) {
      errors.push('Target team is required');
    }

    if (!request.sourceFacilityId) {
      errors.push('Source facility is required');
    }

    if (!request.sourceInventoryId) {
      errors.push('Source inventory is required');
    }

    if (!request.items || request.items.length === 0) {
      errors.push('At least one item is required');
    }

    if (request.totalPrice <= 0) {
      errors.push('Total price must be greater than 0');
    }

    request.items?.forEach((item, index) => {
      if (!item.inventoryItemId) {
        errors.push(`Item ${index + 1}: Inventory item ID is required`);
      }
      if (item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
      }
    });

    return errors;
  }

  /**
   * Group trades by date
   */
  static groupTradesByDate(trades: TradeListItem[]): Map<string, TradeListItem[]> {
    const grouped = new Map<string, TradeListItem[]>();

    trades.forEach(trade => {
      const date = new Date(trade.createdAt).toDateString();
      const existing = grouped.get(date) || [];
      grouped.set(date, [...existing, trade]);
    });

    return grouped;
  }
}

export default TradeService;
