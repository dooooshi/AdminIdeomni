import apiClient from '@/lib/http/api-client';
import {
  TransferGoldRequest,
  TransferCarbonRequest,
  TransferResponse,
  TeamOperationHistory,
  TeamBalanceHistory,
  OperationSummary,
  PaginatedOperationHistory,
  PaginatedTransferHistory,
  PaginatedBalanceHistory,
  OperationHistoryQuery,
  TransferHistoryQuery,
  BalanceHistoryQuery,
  OperationSummaryQuery,
  TeamTransferApiResponse,
  TransferValidationResult,
  AvailableTeam,
  ResourceFlowAnalysis,
  BalanceTrendData,
  TeamOperationType,
  TeamResourceType,
  TransferFormValidation,
  TransferErrorCode
} from '@/types/teamTransfer';
import { TeamAccountWithTeam } from '@/types/teamAccount';

/**
 * Team Transfer Service
 * Handles all API calls for team resource transfers and history tracking
 * Based on the API documentation in docs/teams/team-transfer-api.md
 * and docs/teams/team-history-tracking.md
 */
export class TeamTransferService {
  private static readonly BASE_PATH = '/user/team/account';

  // ===============================
  // TRANSFER OPERATIONS
  // ===============================

  /**
   * Transfer gold to another team
   * POST /user/team/account/transfer-gold
   */
  static async transferGold(request: TransferGoldRequest): Promise<TransferResponse> {
    const response = await apiClient.post<TeamTransferApiResponse<TransferResponse>>(
      `${this.BASE_PATH}/transfer-gold`,
      request
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to transfer gold');
    }

    return response.data.data;
  }

  /**
   * Transfer carbon to another team
   * POST /user/team/account/transfer-carbon
   */
  static async transferCarbon(request: TransferCarbonRequest): Promise<TransferResponse> {
    const response = await apiClient.post<TeamTransferApiResponse<TransferResponse>>(
      `${this.BASE_PATH}/transfer-carbon`,
      request
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to transfer carbon');
    }

    return response.data.data;
  }

  // ===============================
  // HISTORY TRACKING
  // ===============================

  /**
   * Get team operation history with pagination and filtering
   * GET /user/team/account/history/operations
   */
  static async getOperationHistory(query: OperationHistoryQuery = {}): Promise<PaginatedOperationHistory> {
    const { page = 1, pageSize = 20, operationType, resourceType, startDate, endDate } = query;

    const queryParams: Record<string, any> = {
      page,
      pageSize
    };

    if (operationType) {
      queryParams.operationType = operationType;
    }

    if (resourceType) {
      queryParams.resourceType = resourceType;
    }

    if (startDate) {
      queryParams.startDate = startDate;
    }

    if (endDate) {
      queryParams.endDate = endDate;
    }

    const response = await apiClient.get<TeamTransferApiResponse<PaginatedOperationHistory>>(
      `${this.BASE_PATH}/history/operations`,
      { params: queryParams }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get operation history');
    }

    return response.data.data;
  }

  /**
   * Get team transfer history with directional filtering
   * GET /user/team/account/history/transfers
   */
  static async getTransferHistory(query: TransferHistoryQuery = {}): Promise<PaginatedTransferHistory> {
    const { page = 1, pageSize = 20, direction = 'all', resourceType, startDate, endDate } = query;

    const queryParams: Record<string, any> = {
      page,
      pageSize
    };

    if (direction && direction !== 'all') {
      queryParams.direction = direction;
    }

    if (resourceType) {
      queryParams.resourceType = resourceType;
    }

    if (startDate) {
      queryParams.startDate = startDate;
    }

    if (endDate) {
      queryParams.endDate = endDate;
    }

    const response = await apiClient.get<TeamTransferApiResponse<PaginatedTransferHistory>>(
      `${this.BASE_PATH}/history/transfers`,
      { params: queryParams }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get transfer history');
    }

    return response.data.data;
  }

  /**
   * Get team balance history with snapshots over time
   * GET /user/team/account/history/balances
   */
  static async getBalanceHistory(query: BalanceHistoryQuery = {}): Promise<PaginatedBalanceHistory> {
    const { page = 1, pageSize = 20, startDate, endDate } = query;

    const queryParams: Record<string, any> = {
      page,
      pageSize
    };

    if (startDate) {
      queryParams.startDate = startDate;
    }

    if (endDate) {
      queryParams.endDate = endDate;
    }

    const response = await apiClient.get<TeamTransferApiResponse<PaginatedBalanceHistory>>(
      `${this.BASE_PATH}/history/balances`,
      { params: queryParams }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get balance history');
    }

    return response.data.data;
  }

  /**
   * Get operation summary statistics
   * GET /user/team/account/history/summary
   */
  static async getOperationSummary(query: OperationSummaryQuery = {}): Promise<OperationSummary> {
    const { startDate, endDate } = query;

    const queryParams: Record<string, any> = {};

    if (startDate) {
      queryParams.startDate = startDate;
    }

    if (endDate) {
      queryParams.endDate = endDate;
    }

    const response = await apiClient.get<TeamTransferApiResponse<OperationSummary>>(
      `${this.BASE_PATH}/history/summary`,
      { params: queryParams }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get operation summary');
    }

    return response.data.data;
  }

  // ===============================
  // TEAM SELECTION HELPERS
  // ===============================

  /**
   * Get available teams for transfer (teams in same activity)
   * This would typically be provided by the team browsing API
   */
  static async getAvailableTeamsForTransfer(): Promise<AvailableTeam[]> {
    try {
      // Try the dedicated endpoint first with pageSize 100
      const response = await apiClient.get<any>('/user/teams/available-for-transfer', {
        params: { pageSize: 100 }
      });

      // Handle nested response structure
      if (response.data?.success && response.data?.data?.data && Array.isArray(response.data.data.data)) {
        // Transform the nested response to match AvailableTeam format
        return response.data.data.data.map((team: any) => ({
          id: team.id,
          name: team.name,
          description: team.description,
          leader: team.leader || { username: 'Unknown', firstName: null, lastName: null },
          memberCount: team.currentMembers || team.memberCount || 0,
          maxMembers: team.maxMembers || 10,
          isOpen: team.isOpen !== false
        }));
      }

      // Handle direct data structure (backup)
      if (response.data?.success && response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data.map((team: any) => ({
          id: team.id,
          name: team.name,
          description: team.description,
          leader: team.leader || { username: 'Unknown', firstName: null, lastName: null },
          memberCount: team.currentMembers || team.memberCount || 0,
          maxMembers: team.maxMembers || 10,
          isOpen: team.isOpen !== false
        }));
      }

      // Handle direct array response (fallback)
      if (response.data && Array.isArray(response.data)) {
        return response.data.map((team: any) => ({
          id: team.id,
          name: team.name,
          description: team.description,
          leader: team.leader || { username: 'Unknown', firstName: null, lastName: null },
          memberCount: team.currentMembers || team.memberCount || 0,
          maxMembers: team.maxMembers || 10,
          isOpen: team.isOpen !== false
        }));
      }
    } catch (error) {
      console.warn('Available teams endpoint failed:', error);
    }

    // Return empty array as final fallback
    console.warn('No teams found, returning empty array');
    return [];
  }

  // ===============================
  // VALIDATION METHODS
  // ===============================

  /**
   * Validate transfer request before submission
   */
  static validateTransferRequest(
    request: TransferGoldRequest | TransferCarbonRequest,
    currentBalance: number,
    currentTeamId: string
  ): TransferValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate target team
    if (!request.targetTeamId) {
      errors.push('Target team is required');
    } else if (request.targetTeamId === currentTeamId) {
      errors.push('Cannot transfer to the same team');
    }

    // Validate amount
    if (!request.amount || request.amount <= 0) {
      errors.push('Transfer amount must be greater than 0');
    } else if (request.amount < 0.001) {
      errors.push('Minimum transfer amount is 0.001');
    } else if (request.amount > currentBalance) {
      errors.push('Insufficient balance for transfer');
    } else {
      // Check decimal places (maximum 3)
      const decimalPlaces = (request.amount.toString().split('.')[1] || '').length;
      if (decimalPlaces > 3) {
        errors.push('Amount can have maximum 3 decimal places');
      }
    }

    // Validate description (optional)
    if (request.description && request.description.length > 200) {
      errors.push('Description cannot exceed 200 characters');
    }

    // Add warnings
    if (request.amount > currentBalance * 0.5) {
      warnings.push('Transfer amount is more than 50% of current balance');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get transfer form validation rules
   */
  static getTransferFormValidation(): TransferFormValidation {
    return {
      targetTeamId: {
        required: true,
        message: 'Please select a target team'
      },
      amount: {
        required: true,
        min: 0.001,
        decimalPlaces: 3,
        message: 'Amount must be between 0.001 and available balance with maximum 3 decimal places'
      },
      description: {
        maxLength: 200,
        message: 'Description cannot exceed 200 characters'
      }
    };
  }

  // ===============================
  // UTILITY METHODS
  // ===============================

  /**
   * Format transfer amount for display (without icons)
   * Use with Material-UI icons in components
   */
  static formatTransferAmount(amount: number, resourceType?: TeamResourceType): string {
    return amount.toFixed(3).replace(/\.?0+$/, ''); // Remove trailing zeros
  }

  /**
   * Format transfer amount for display with emoji (legacy)
   */
  static formatTransferAmountWithEmoji(amount: number, resourceType: TeamResourceType): string {
    const formatted = amount.toFixed(3).replace(/\.?0+$/, ''); // Remove trailing zeros
    const symbol = resourceType === TeamResourceType.GOLD ? '🪙' : '🌿';
    return `${formatted} ${symbol}`;
  }

  /**
   * Get operation type display name
   */
  static getOperationTypeDisplayName(operationType: TeamOperationType): string {
    const displayNames: Record<TeamOperationType, string> = {
      [TeamOperationType.ACCOUNT_CREATED]: 'Account Created',
      [TeamOperationType.TRANSFER_OUT]: 'Outgoing Transfer',
      [TeamOperationType.TRANSFER_IN]: 'Incoming Transfer',
      [TeamOperationType.MANAGER_ADJUSTMENT]: 'Manager Adjustment',
      [TeamOperationType.SYSTEM_GRANT]: 'System Grant',
      [TeamOperationType.SYSTEM_DEDUCTION]: 'System Deduction',
      [TeamOperationType.ACTIVITY_REWARD]: 'Activity Reward',
      [TeamOperationType.FACILITY_INCOME]: 'Facility Income',
      [TeamOperationType.FACILITY_EXPENSE]: 'Facility Expense'
    };

    return displayNames[operationType] || operationType;
  }

  /**
   * Get operation type color for UI
   */
  static getOperationTypeColor(operationType: TeamOperationType): string {
    const colors: Record<TeamOperationType, string> = {
      [TeamOperationType.ACCOUNT_CREATED]: 'text-blue-600',
      [TeamOperationType.TRANSFER_OUT]: 'text-red-600',
      [TeamOperationType.TRANSFER_IN]: 'text-green-600',
      [TeamOperationType.MANAGER_ADJUSTMENT]: 'text-purple-600',
      [TeamOperationType.SYSTEM_GRANT]: 'text-blue-600',
      [TeamOperationType.SYSTEM_DEDUCTION]: 'text-orange-600',
      [TeamOperationType.ACTIVITY_REWARD]: 'text-green-600',
      [TeamOperationType.FACILITY_INCOME]: 'text-green-600',
      [TeamOperationType.FACILITY_EXPENSE]: 'text-red-600'
    };

    return colors[operationType] || 'text-gray-600';
  }

  /**
   * Generate balance trend data for charts
   */
  static generateBalanceTrendData(balanceHistory: TeamBalanceHistory[]): BalanceTrendData[] {
    return balanceHistory.map(history => ({
      date: history.createdAt,
      gold: history.goldBalance,
      carbon: history.carbonBalance
    }));
  }

  /**
   * Calculate resource flow analysis
   */
  static calculateResourceFlowAnalysis(operationHistory: TeamOperationHistory[]): ResourceFlowAnalysis {
    let totalGoldIn = 0;
    let totalGoldOut = 0;
    let totalCarbonIn = 0;
    let totalCarbonOut = 0;

    const transferPartners = new Map<string, {
      teamName: string;
      goldExchanged: number;
      carbonExchanged: number;
      transferCount: number;
    }>();

    operationHistory.forEach(operation => {
      if (operation.resourceType === TeamResourceType.GOLD) {
        if (operation.operationType === TeamOperationType.TRANSFER_IN) {
          totalGoldIn += operation.amount;
          // Track source team
          if (operation.sourceTeam) {
            const partner = transferPartners.get(operation.sourceTeam.id) || {
              teamName: operation.sourceTeam.name,
              goldExchanged: 0,
              carbonExchanged: 0,
              transferCount: 0
            };
            partner.goldExchanged += operation.amount;
            partner.transferCount += 1;
            transferPartners.set(operation.sourceTeam.id, partner);
          }
        } else if (operation.operationType === TeamOperationType.TRANSFER_OUT) {
          totalGoldOut += operation.amount;
          // Track target team
          if (operation.targetTeam) {
            const partner = transferPartners.get(operation.targetTeam.id) || {
              teamName: operation.targetTeam.name,
              goldExchanged: 0,
              carbonExchanged: 0,
              transferCount: 0
            };
            partner.goldExchanged += operation.amount;
            partner.transferCount += 1;
            transferPartners.set(operation.targetTeam.id, partner);
          }
        }
      } else if (operation.resourceType === TeamResourceType.CARBON) {
        if (operation.operationType === TeamOperationType.TRANSFER_IN) {
          totalCarbonIn += operation.amount;
          // Track source team
          if (operation.sourceTeam) {
            const partner = transferPartners.get(operation.sourceTeam.id) || {
              teamName: operation.sourceTeam.name,
              goldExchanged: 0,
              carbonExchanged: 0,
              transferCount: 0
            };
            partner.carbonExchanged += operation.amount;
            partner.transferCount += 1;
            transferPartners.set(operation.sourceTeam.id, partner);
          }
        } else if (operation.operationType === TeamOperationType.TRANSFER_OUT) {
          totalCarbonOut += operation.amount;
          // Track target team
          if (operation.targetTeam) {
            const partner = transferPartners.get(operation.targetTeam.id) || {
              teamName: operation.targetTeam.name,
              goldExchanged: 0,
              carbonExchanged: 0,
              transferCount: 0
            };
            partner.carbonExchanged += operation.amount;
            partner.transferCount += 1;
            transferPartners.set(operation.targetTeam.id, partner);
          }
        }
      }
    });

    // Convert map to array and sort by total exchange volume
    const topTransferPartners = Array.from(transferPartners.entries())
      .map(([teamId, data]) => ({
        teamId,
        teamName: data.teamName,
        totalGoldExchanged: data.goldExchanged,
        totalCarbonExchanged: data.carbonExchanged,
        transferCount: data.transferCount
      }))
      .sort((a, b) => 
        (b.totalGoldExchanged + b.totalCarbonExchanged) - 
        (a.totalGoldExchanged + a.totalCarbonExchanged)
      )
      .slice(0, 10); // Top 10 partners

    return {
      goldFlow: {
        totalIn: totalGoldIn,
        totalOut: totalGoldOut,
        netFlow: totalGoldIn - totalGoldOut
      },
      carbonFlow: {
        totalIn: totalCarbonIn,
        totalOut: totalCarbonOut,
        netFlow: totalCarbonIn - totalCarbonOut
      },
      topTransferPartners
    };
  }

  /**
   * Parse error response and provide user-friendly message
   */
  static parseTransferError(error: any): string {
    if (error.response?.data?.details?.error) {
      const errorCode = error.response.data.details.error as TransferErrorCode;
      
      const errorMessages: Record<TransferErrorCode, string> = {
        [TransferErrorCode.TEAM_NOT_MEMBER]: 'You are not an active member of any team',
        [TransferErrorCode.INSUFFICIENT_BALANCE]: 'Insufficient balance for this transfer',
        [TransferErrorCode.TARGET_TEAM_NOT_FOUND]: 'Target team not found',
        [TransferErrorCode.TEAM_DIFFERENT_ACTIVITY]: 'Can only transfer to teams in the same activity',
        [TransferErrorCode.TEAM_NOT_ACTIVE_MEMBER]: 'Your team membership is not active',
        [TransferErrorCode.TEAM_ACCOUNT_NOT_FOUND]: 'Team account not found',
        [TransferErrorCode.INVALID_AMOUNT]: 'Invalid transfer amount',
        [TransferErrorCode.SAME_TEAM_TRANSFER]: 'Cannot transfer to the same team'
      };

      return errorMessages[errorCode] || error.response.data.message || 'Transfer failed';
    }

    return error.message || 'An unexpected error occurred';
  }
}

export default TeamTransferService;