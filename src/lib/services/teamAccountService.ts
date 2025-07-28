import apiClient from '@/lib/http/api-client';
import {
  TeamAccount,
  TeamAccountWithTeam,
  TeamAccountListItem,
  PaginatedTeamAccounts,
  AccountSummaryStatistics,
  UpdateBalancesRequest,
  SetBalancesRequest,
  TeamAccountListQuery,
  TeamAccountApiResponse,
  BalanceUpdateResult
} from '@/types/teamAccount';

/**
 * Team Account Service
 * Handles all API calls for team account management
 * Based on the API documentation in docs/teams/team-accounts-api-reference.md
 */
export class TeamAccountService {
  private static readonly USER_BASE_PATH = '/user/team/account';
  private static readonly MANAGER_BASE_PATH = '/user/manage/team-accounts';

  // ===============================
  // USER ENDPOINTS
  // ===============================

  /**
   * Get current user's team account
   * GET /user/team/account
   */
  static async getCurrentUserTeamAccount(): Promise<TeamAccountWithTeam> {
    const response = await apiClient.get<TeamAccountApiResponse<TeamAccountWithTeam>>(
      this.USER_BASE_PATH
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get team account');
    }
    
    return response.data.data;
  }

  // ===============================
  // MANAGER ENDPOINTS
  // ===============================

  /**
   * Get all team accounts in manager's activity (with pagination)
   * GET /user/manage/team-accounts
   */
  static async getTeamAccounts(params: TeamAccountListQuery = {}): Promise<PaginatedTeamAccounts> {
    const { page = 1, pageSize = 20, search = '' } = params;

    const queryParams: Record<string, any> = {
      page,
      pageSize
    };

    if (search && search.trim()) {
      queryParams.search = encodeURIComponent(search.trim());
    }

    const response = await apiClient.get<TeamAccountApiResponse<PaginatedTeamAccounts>>(
      this.MANAGER_BASE_PATH,
      { params: queryParams }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get team accounts');
    }

    return response.data.data;
  }

  /**
   * Get account summary statistics
   * GET /user/manage/team-accounts/summary
   */
  static async getAccountSummary(): Promise<AccountSummaryStatistics> {
    const response = await apiClient.get<TeamAccountApiResponse<AccountSummaryStatistics>>(
      `${this.MANAGER_BASE_PATH}/summary`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get account summary');
    }

    return response.data.data;
  }

  /**
   * Get specific team account by team ID
   * GET /user/manage/team-accounts/:teamId
   */
  static async getTeamAccount(teamId: string): Promise<TeamAccountWithTeam> {
    if (!teamId) {
      throw new Error('Team ID is required');
    }

    const response = await apiClient.get<TeamAccountApiResponse<TeamAccountWithTeam>>(
      `${this.MANAGER_BASE_PATH}/${teamId}`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get team account');
    }

    return response.data.data;
  }

  /**
   * Update team account balances (delta changes)
   * PUT /user/manage/team-accounts/:teamId/balances
   */
  static async updateTeamBalances(
    teamId: string, 
    balanceChanges: UpdateBalancesRequest
  ): Promise<TeamAccount> {
    if (!teamId) {
      throw new Error('Team ID is required');
    }

    // Validate that at least one balance change is provided
    if (balanceChanges.goldDelta === undefined && balanceChanges.carbonDelta === undefined) {
      throw new Error('At least one balance change (goldDelta or carbonDelta) is required');
    }

    const response = await apiClient.put<TeamAccountApiResponse<TeamAccount>>(
      `${this.MANAGER_BASE_PATH}/${teamId}/balances`,
      balanceChanges
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update team balances');
    }

    return response.data.data;
  }

  /**
   * Set team account balances (absolute values)
   * PUT /user/manage/team-accounts/:teamId/set-balances
   */
  static async setTeamBalances(
    teamId: string, 
    newBalances: SetBalancesRequest
  ): Promise<TeamAccount> {
    if (!teamId) {
      throw new Error('Team ID is required');
    }

    // Validate non-negative values
    if (newBalances.gold < 0 || newBalances.carbon < 0) {
      throw new Error('Gold and carbon amounts must be non-negative');
    }

    const response = await apiClient.put<TeamAccountApiResponse<TeamAccount>>(
      `${this.MANAGER_BASE_PATH}/${teamId}/set-balances`,
      newBalances
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to set team balances');
    }

    return response.data.data;
  }

  // ===============================
  // UTILITY METHODS
  // ===============================

  /**
   * Check if user has sufficient permissions to access manager endpoints
   */
  static async validateManagerAccess(): Promise<boolean> {
    try {
      await this.getAccountSummary();
      return true;
    } catch (error: any) {
      if (error?.response?.status === 403) {
        return false;
      }
      // Re-throw other errors (network issues, etc.)
      throw error;
    }
  }

  /**
   * Calculate balance changes preview
   */
  static calculateBalancePreview(
    currentGold: number,
    currentCarbon: number,
    changes: UpdateBalancesRequest
  ): { newGold: number; newCarbon: number; isValid: boolean } {
    const newGold = currentGold + (changes.goldDelta || 0);
    const newCarbon = currentCarbon + (changes.carbonDelta || 0);
    
    const isValid = newGold >= 0 && newCarbon >= 0;

    return {
      newGold: Math.max(0, newGold),
      newCarbon: Math.max(0, newCarbon),
      isValid
    };
  }

  /**
   * Format resource amount for display
   */
  static formatResourceAmount(amount: number): string {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toString();
  }

  /**
   * Get resource display color based on amount
   */
  static getResourceColor(amount: number, resourceType: 'gold' | 'carbon'): string {
    if (amount === 0) return 'text-gray-500';
    
    if (resourceType === 'gold') {
      if (amount >= 1000) return 'text-yellow-600';
      if (amount >= 500) return 'text-yellow-500';
      return 'text-yellow-400';
    } else {
      if (amount >= 1000) return 'text-green-600';
      if (amount >= 500) return 'text-green-500';
      return 'text-green-400';
    }
  }

  /**
   * Format date for display with locale support
   */
  static formatDate(date: string | Date, locale?: string, options?: Intl.DateTimeFormatOptions): string {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Check for invalid date
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      
      const formatOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options
      };
      
      // Use browser locale as fallback if locale is not provided
      const resolvedLocale = locale || navigator.language || 'en-US';
      return dateObj.toLocaleDateString(resolvedLocale, formatOptions);
    } catch (error) {
      console.warn('Error formatting date:', error);
      return String(date);
    }
  }

  /**
   * Format datetime for display with locale support
   */
  static formatDateTime(date: string | Date, locale?: string, options?: Intl.DateTimeFormatOptions): string {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Check for invalid date
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      
      const formatOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        ...options
      };
      
      // Use browser locale as fallback if locale is not provided
      const resolvedLocale = locale || navigator.language || 'en-US';
      return dateObj.toLocaleString(resolvedLocale, formatOptions);
    } catch (error) {
      console.warn('Error formatting datetime:', error);
      return String(date);
    }
  }

  /**
   * Format relative time for display with locale support
   */
  static formatRelativeTime(date: string | Date, locale?: string): string {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Check for invalid date
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
      
      // Use Intl.RelativeTimeFormat for better locale support
      const resolvedLocale = locale || navigator.language || 'en-US';
      const rtf = new Intl.RelativeTimeFormat(resolvedLocale, { numeric: 'auto' });
      
      if (diffInSeconds < 60) {
        return rtf.format(-diffInSeconds, 'second');
      } else if (diffInSeconds < 3600) {
        return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
      } else if (diffInSeconds < 86400) {
        return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
      } else if (diffInSeconds < 2592000) {
        return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
      } else if (diffInSeconds < 31536000) {
        return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
      } else {
        return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
      }
    } catch (error) {
      console.warn('Error formatting relative time:', error);
      // Fallback to absolute date formatting
      return this.formatDate(date, locale);
    }
  }

  /**
   * Validate balance change request
   */
  static validateBalanceChanges(
    currentGold: number,
    currentCarbon: number,
    changes: UpdateBalancesRequest
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (changes.goldDelta !== undefined) {
      const newGold = currentGold + changes.goldDelta;
      if (newGold < 0) {
        errors.push(`Gold would become negative (${newGold})`);
      }
    }

    if (changes.carbonDelta !== undefined) {
      const newCarbon = currentCarbon + changes.carbonDelta;
      if (newCarbon < 0) {
        errors.push(`Carbon would become negative (${newCarbon})`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Batch operation helper (for future bulk operations)
   */
  static async batchUpdateBalances(
    updates: Array<{ teamId: string; changes: UpdateBalancesRequest }>
  ): Promise<BalanceUpdateResult[]> {
    const results: BalanceUpdateResult[] = [];

    for (const update of updates) {
      try {
        const currentAccount = await this.getTeamAccount(update.teamId);
        const updatedAccount = await this.updateTeamBalances(update.teamId, update.changes);

        results.push({
          success: true,
          teamId: update.teamId,
          previousGold: currentAccount.gold,
          previousCarbon: currentAccount.carbon,
          newGold: updatedAccount.gold,
          newCarbon: updatedAccount.carbon
        });
      } catch (error: any) {
        results.push({
          success: false,
          teamId: update.teamId,
          previousGold: 0,
          previousCarbon: 0,
          newGold: 0,
          newCarbon: 0,
          error: error.message || 'Unknown error occurred'
        });
      }
    }

    return results;
  }
}

export default TeamAccountService;