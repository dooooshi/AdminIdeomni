import apiClient from '@/lib/http/api-client';
import {
  ApiResponse,
  TradeOrder,
  TradeStatus,
  TradeItem,
  TradeTransaction,
  TradeHistory,
  CreateTradeRequest,
  TradeListQuery,
  PreviewTradeRequest,
  AcceptTradeRequest,
  RejectTradeRequest,
  TradeHistoryQuery,
  TradeOperationHistoryQuery,
  TradePreviewResponse,
  TradeListResponse,
  TradeSummary,
  TradeDetailResponse,
  TradeStatistics,
  TradeStats,
  TeamOperationHistory,
  DestinationOption,
  ValidationResult,
  TradeError,
  TradeErrorCode,
  TeamInfo,
  FacilityInventoryInfo,
  PaginationInfo
} from '@/types/trade';
import { TeamListItem } from '@/types/team';
import StudentFacilitySpaceService from './studentFacilitySpaceService';

/**
 * Trade Service
 * Handles all trade-related API operations for students
 * Based on the trade API documentation in docs/trade/
 */
export class TradeService {
  private static readonly BASE_PATH = '/api/trades';

  // ==========================================
  // TRADE CRUD OPERATIONS
  // ==========================================

  /**
   * Create a new trade offer
   * POST /api/trades
   */
  static async createTrade(data: CreateTradeRequest): Promise<TradeOrder> {
    try {
      const response = await apiClient.post<ApiResponse<TradeOrder>>(
        this.BASE_PATH,
        data
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to create trade');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('TradeService.createTrade error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get list of trades with filtering
   * GET /api/trades
   */
  static async listTrades(query: TradeListQuery = {}): Promise<TradeListResponse> {
    try {
      const {
        type = 'all',
        status,
        page = 1,
        pageSize = 20,
        startDate,
        endDate,
        teamId
      } = query;

      const params: Record<string, any> = {
        type,
        page,
        pageSize
      };

      if (status) params.status = status;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (teamId) params.teamId = teamId;

      const response = await apiClient.get<ApiResponse<TradeListResponse>>(
        this.BASE_PATH,
        { params }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch trades');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('TradeService.listTrades error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get detailed information about a specific trade
   * GET /api/trades/:id
   */
  static async getTradeDetails(id: string): Promise<TradeDetailResponse> {
    try {
      const response = await apiClient.get<ApiResponse<TradeDetailResponse>>(
        `${this.BASE_PATH}/${id}`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch trade details');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('TradeService.getTradeDetails error:', error);
      throw this.handleError(error);
    }
  }

  // ==========================================
  // TRADE ACTIONS
  // ==========================================

  /**
   * Preview trade with transport cost calculation
   * POST /api/trades/:id/preview
   */
  static async previewTrade(
    tradeId: string,
    destinationInventoryId: string
  ): Promise<TradePreviewResponse> {
    try {
      const response = await apiClient.post<ApiResponse<TradePreviewResponse>>(
        `${this.BASE_PATH}/${tradeId}/preview`,
        { destinationInventoryId }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to preview trade');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('TradeService.previewTrade error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Accept a trade offer with destination selection
   * POST /api/trades/:id/accept
   */
  static async acceptTrade(
    tradeId: string,
    destinationInventoryId: string
  ): Promise<TradeTransaction> {
    try {
      const response = await apiClient.post<ApiResponse<TradeTransaction>>(
        `${this.BASE_PATH}/${tradeId}/accept`,
        { destinationInventoryId }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to accept trade');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('TradeService.acceptTrade error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Reject a trade offer
   * POST /api/trades/:id/reject
   */
  static async rejectTrade(tradeId: string, reason?: string): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
        `${this.BASE_PATH}/${tradeId}/reject`,
        { reason }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to reject trade');
      }
    } catch (error: any) {
      console.error('TradeService.rejectTrade error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Cancel a trade offer (sender only)
   * DELETE /api/trades/:id
   */
  static async cancelTrade(tradeId: string): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(
        `${this.BASE_PATH}/${tradeId}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to cancel trade');
      }
    } catch (error: any) {
      console.error('TradeService.cancelTrade error:', error);
      throw this.handleError(error);
    }
  }

  // ==========================================
  // HISTORY & ANALYTICS
  // ==========================================

  /**
   * Get trade history for a specific trade
   * GET /api/trades/:id/history
   */
  static async getTradeHistory(tradeId: string): Promise<TradeHistory[]> {
    try {
      const response = await apiClient.get<ApiResponse<TradeHistory[]>>(
        `${this.BASE_PATH}/${tradeId}/history`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch trade history');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('TradeService.getTradeHistory error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get trade statistics for the current user's team
   * GET /api/trades/my-stats
   */
  static async getMyTradeStats(
    startDate?: string,
    endDate?: string
  ): Promise<TradeStatistics> {
    try {
      const params: Record<string, any> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await apiClient.get<ApiResponse<TradeStatistics>>(
        `${this.BASE_PATH}/my-stats`,
        { params }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch trade statistics');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('TradeService.getMyTradeStats error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get team operation history (financial movements)
   * GET /api/trades/my-operations
   */
  static async getMyOperations(
    query: TradeOperationHistoryQuery = {}
  ): Promise<{
    operations: TeamOperationHistory[];
    pagination: PaginationInfo;
  }> {
    try {
      const { page = 1, pageSize = 20, startDate, endDate } = query;

      const params: Record<string, any> = {
        page,
        pageSize
      };

      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await apiClient.get<ApiResponse<{
        operations: TeamOperationHistory[];
        pagination: PaginationInfo;
      }>>(
        `${this.BASE_PATH}/my-operations`,
        { params }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch operations');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('TradeService.getMyOperations error:', error);
      throw this.handleError(error);
    }
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  /**
   * Get available teams for trading (same activity)
   * Uses the pattern from contract/transfer services
   */
  static async getAvailableTeamsForTrade(): Promise<TeamInfo[]> {
    try {
      // Try the dedicated endpoint first
      const response = await apiClient.get<any>(`${this.BASE_PATH}/teams/available`);

      // Handle various response structures
      if (response.data?.success && response.data?.data?.data && Array.isArray(response.data.data.data)) {
        return response.data.data.data.map((team: any) => this.transformToTeamInfo(team));
      }

      if (response.data?.success && response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data.map((team: any) => this.transformToTeamInfo(team));
      }

      if (response.data && Array.isArray(response.data)) {
        return response.data.map((team: any) => this.transformToTeamInfo(team));
      }

      console.warn('No teams found, returning empty array');
      return [];
    } catch (error) {
      console.warn('Failed to fetch available teams:', error);
      // Fallback to the generic teams endpoint
      try {
        const fallbackResponse = await apiClient.get<any>('/api/user/teams/available');
        if (fallbackResponse.data?.data && Array.isArray(fallbackResponse.data.data)) {
          return fallbackResponse.data.data.map((team: any) => this.transformToTeamInfo(team));
        }
      } catch (fallbackError) {
        console.error('Fallback team fetch also failed:', fallbackError);
      }
      return [];
    }
  }

  /**
   * Get team's facility inventories for source/destination selection
   * Leverages the facility space API
   */
  static async getTeamDestinationOptions(): Promise<DestinationOption[]> {
    try {
      const overview = await StudentFacilitySpaceService.getTeamFacilitySpaceOverview();

      if (!overview.data?.facilities) {
        return [];
      }

      return overview.data.facilities
        .filter(f => f.spaceMetrics.availableSpace > 0)
        .map(f => ({
          inventoryId: `inv_${f.facilityInstanceId}`, // Generate inventoryId from facilityInstanceId
          facilityId: f.facilityInstanceId,
          facilityName: f.facilityName,
          facilityType: f.facilityType,
          location: f.tileCoordinates,
          availableSpace: f.spaceMetrics.availableSpace,
          currentUtilization: f.spaceMetrics.utilizationRate
        }));
    } catch (error: any) {
      console.error('Failed to fetch destination options:', error);
      return [];
    }
  }

  /**
   * Validate trade creation request
   */
  static validateCreateTradeRequest(data: CreateTradeRequest): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate target team
    if (!data.targetTeamId) {
      errors.push('Target team is required');
    }

    // Validate source inventory
    if (!data.sourceInventoryId) {
      errors.push('Source inventory is required');
    }

    // Validate items
    if (!data.items || data.items.length === 0) {
      errors.push('At least one item must be selected');
    } else {
      data.items.forEach((item, index) => {
        if (!item.inventoryItemId) {
          errors.push(`Item ${index + 1}: Inventory item ID is required`);
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
        }
      });
    }

    // Validate price
    if (data.totalPrice === undefined || data.totalPrice < 0) {
      errors.push('Total price must be 0 or greater');
    } else if (data.totalPrice > 1000000) {
      warnings.push('Very high price may discourage trades');
    }

    // Validate message
    if (data.message && data.message.length > 500) {
      errors.push('Message cannot exceed 500 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Transform raw team data to TeamInfo interface
   */
  private static transformToTeamInfo(team: any): TeamInfo {
    return {
      id: team.id,
      name: team.name,
      description: team.description,
      leader: team.leader || {
        id: 'unknown',
        username: 'Unknown',
        firstName: null,
        lastName: null
      },
      memberCount: team.currentMembers || team.memberCount || 0,
      maxMembers: team.maxMembers || 10,
      isOpen: team.isOpen !== false
    };
  }

  /**
   * Handle errors from API calls
   */
  private static handleError(error: any): TradeError {
    if (error.response?.data) {
      const data = error.response.data;

      // Map business codes to error codes
      let code = TradeErrorCode.VALIDATION_ERROR;
      if (data.businessCode === 409) {
        if (data.message?.includes('gold')) {
          code = TradeErrorCode.INSUFFICIENT_FUNDS;
        } else if (data.message?.includes('space')) {
          code = TradeErrorCode.INSUFFICIENT_SPACE;
        } else if (data.message?.includes('inventory')) {
          code = TradeErrorCode.INSUFFICIENT_INVENTORY;
        }
      } else if (data.businessCode === 404) {
        code = TradeErrorCode.TRADE_NOT_FOUND;
      } else if (data.businessCode === 403) {
        code = TradeErrorCode.UNAUTHORIZED;
      }

      return {
        code,
        message: data.message || 'An error occurred',
        details: data.details
      };
    }

    return {
      code: TradeErrorCode.VALIDATION_ERROR,
      message: error.message || 'An unexpected error occurred',
      details: null
    };
  }

  /**
   * Get trade dashboard stats
   * GET /api/trades/stats
   */
  static async getTradeStats(): Promise<TradeStats> {
    try {
      const response = await apiClient.get<ApiResponse<TradeStats>>(
        `${this.BASE_PATH}/stats`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch trade stats');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('TradeService.getTradeStats error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Format error message for display
   */
  static getErrorMessage(error: TradeError): string {
    switch (error.code) {
      case TradeErrorCode.INSUFFICIENT_FUNDS:
        return `Insufficient gold. ${error.details ? `Required: ${error.details.required}, Available: ${error.details.available}` : ''}`;
      case TradeErrorCode.INSUFFICIENT_SPACE:
        return `Insufficient space in destination facility. ${error.details ? `Required: ${error.details.required}, Available: ${error.details.available}` : ''}`;
      case TradeErrorCode.INSUFFICIENT_INVENTORY:
        return 'Not enough items in inventory to fulfill this trade';
      case TradeErrorCode.TEAMS_NOT_IN_SAME_ACTIVITY:
        return 'Teams must be in the same activity to trade';
      case TradeErrorCode.TRADE_NOT_FOUND:
        return 'Trade not found or has been removed';
      case TradeErrorCode.TRADE_ALREADY_PROCESSED:
        return 'This trade has already been accepted, rejected, or cancelled';
      case TradeErrorCode.INVALID_TRADE_STATUS:
        return 'Trade is in an invalid status for this operation';
      case TradeErrorCode.UNAUTHORIZED:
        return 'You are not authorized to perform this action';
      default:
        return error.message || 'An error occurred while processing the trade';
    }
  }
}

export default TradeService;