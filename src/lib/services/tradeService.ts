import apiClient from '@/lib/http/api-client';
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
   */
  private static extractResponseData<T>(response: any): T {
    // Handle nested response structure
    if (response.data?.data?.data) {
      return response.data.data.data;
    }

    if (response.data?.data) {
      return response.data.data;
    }

    if (response.data) {
      return response.data;
    }

    return response;
  }

  /**
   * Handle API errors
   */
  private static handleError(error: any): never {
    if (error.response?.data && isTradeError(error.response.data)) {
      const tradeError = error.response.data as TradeError;
      const errorMessage = tradeError.details
        ? `${tradeError.message} (Required: ${tradeError.details.required}, Available: ${tradeError.details.available})`
        : tradeError.message;
      throw new Error(errorMessage);
    }

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
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
      if (params.status) queryParams.status = params.status;
      if (params.page) queryParams.page = params.page;
      if (params.pageSize) queryParams.pageSize = params.pageSize;

      const response = await apiClient.get<TradeListResponse>(
        this.TRADES_BASE_PATH,
        { params: queryParams }
      );

      const data = this.extractResponseData<TradeListItem[]>(response);

      // Ensure proper response structure
      if (Array.isArray(data)) {
        return {
          success: true,
          data: data,
          total: data.length,
          page: params.page || 1,
          pageSize: params.pageSize || 20,
        };
      }

      return data as TradeListResponse;
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
      return this.extractResponseData<TradeOrder>(response);
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
      return this.extractResponseData<TradeOrder>(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== TRADE ACTION OPERATIONS ====================

  /**
   * Preview trade (calculate transport cost)
   * POST /api/trades/:id/preview
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
      return this.extractResponseData<TradePreviewResponse>(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Accept trade
   * POST /api/trades/:id/accept
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
      return this.extractResponseData<TradeOrder>(response);
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
      return this.extractResponseData<TradeOrder>(response);
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
      return this.extractResponseData<TradeOrder>(response);
    } catch (error) {
      this.handleError(error);
    }
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
  static getStatusText(status: TradeStatus): string {
    const statusTexts: Record<TradeStatus, string> = {
      [TradeStatus.PENDING]: 'Pending',
      [TradeStatus.ACCEPTED]: 'Accepted',
      [TradeStatus.REJECTED]: 'Rejected',
      [TradeStatus.CANCELLED]: 'Cancelled',
      [TradeStatus.COMPLETED]: 'Completed',
    };
    return statusTexts[status] || status;
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
    return trade.status === TradeStatus.PENDING &&
           trade.targetTeamId === currentTeamId;
  }

  /**
   * Check if user can cancel trade
   */
  static canCancelTrade(
    trade: TradeOrder,
    currentTeamId: string
  ): boolean {
    return trade.status === TradeStatus.PENDING &&
           trade.senderTeamId === currentTeamId;
  }

  /**
   * Get trade type for current user
   */
  static getTradeType(
    trade: TradeOrder,
    currentTeamId: string
  ): 'incoming' | 'outgoing' {
    return trade.targetTeamId === currentTeamId ? 'incoming' : 'outgoing';
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