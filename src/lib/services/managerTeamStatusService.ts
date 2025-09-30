/**
 * Manager Team Status Service
 * API service for Manager Team Status Dashboard
 * Handles all HTTP requests to the manager team status endpoints
 */

import apiClient from '@/lib/http/api-client';
import type {
  ApiResponse,
  PaginatedResponse,
  TeamSummary,
  TeamStatus,
  TeamOperation,
  TeamFacility,
  TeamLandOwnership,
  TeamMemberDetail,
  TeamBalanceHistory,
  ListTeamsQuery,
  OperationsQuery,
  FacilitiesQuery,
  LandQuery,
  MembersQuery,
  BalanceHistoryQuery,
} from '@/types/managerTeamStatus';

/**
 * Manager Team Status Service Class
 * Provides methods to interact with manager team status API endpoints
 */
export class ManagerTeamStatusService {
  private static readonly BASE_PATH = '/manager/teams';

  /**
   * Get list of all teams in the manager's activity
   * @param params Query parameters for filtering, sorting, and pagination
   * @returns Paginated list of team summaries
   */
  static async getTeams(
    params: ListTeamsQuery = {}
  ): Promise<PaginatedResponse<TeamSummary>> {
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      limit: params.limit || 20,
      ...(params.sort && { sort: params.sort }),
      ...(params.order && { order: params.order }),
      ...(params.search && { search: params.search }),
      ...(params.isOpen !== undefined && { isOpen: params.isOpen }),
    };

    const response = await apiClient.get<ApiResponse<PaginatedResponse<TeamSummary>>>(
      this.BASE_PATH,
      { params: queryParams }
    );

    return response.data.data;
  }

  /**
   * Get detailed status information for a specific team
   * @param teamId The team's unique identifier
   * @returns Complete team status with statistics
   */
  static async getTeamStatus(teamId: string): Promise<TeamStatus> {
    const response = await apiClient.get<ApiResponse<TeamStatus>>(
      `${this.BASE_PATH}/${teamId}/status`
    );

    return response.data.data;
  }

  /**
   * Get operation history for a team
   * @param teamId The team's unique identifier
   * @param params Query parameters for filtering and pagination
   * @returns Paginated list of team operations
   */
  static async getTeamOperations(
    teamId: string,
    params: OperationsQuery = {}
  ): Promise<PaginatedResponse<TeamOperation>> {
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      limit: params.limit || 20,
      ...(params.sort && { sort: params.sort }),
      ...(params.order && { order: params.order }),
      ...(params.operationType && { operationType: params.operationType }),
      ...(params.resourceType && { resourceType: params.resourceType }),
      ...(params.dateFrom && { dateFrom: params.dateFrom }),
      ...(params.dateTo && { dateTo: params.dateTo }),
      ...(params.minAmount !== undefined && { minAmount: params.minAmount }),
      ...(params.maxAmount !== undefined && { maxAmount: params.maxAmount }),
    };

    const response = await apiClient.get<ApiResponse<PaginatedResponse<TeamOperation>>>(
      `${this.BASE_PATH}/${teamId}/operations`,
      { params: queryParams }
    );

    return response.data.data;
  }

  /**
   * Get facilities owned by a team
   * @param teamId The team's unique identifier
   * @param params Query parameters for filtering and pagination
   * @returns Paginated list of team facilities
   */
  static async getTeamFacilities(
    teamId: string,
    params: FacilitiesQuery = {}
  ): Promise<PaginatedResponse<TeamFacility>> {
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      limit: params.limit || 20,
      ...(params.sort && { sort: params.sort }),
      ...(params.order && { order: params.order }),
      ...(params.facilityType && { facilityType: params.facilityType }),
      ...(params.status && { status: params.status }),
      ...(params.tileId !== undefined && { tileId: params.tileId }),
      ...(params.minLevel !== undefined && { minLevel: params.minLevel }),
    };

    const response = await apiClient.get<ApiResponse<PaginatedResponse<TeamFacility>>>(
      `${this.BASE_PATH}/${teamId}/facilities`,
      { params: queryParams }
    );

    return response.data.data;
  }

  /**
   * Get land ownership details for a team
   * @param teamId The team's unique identifier
   * @param params Query parameters for filtering and pagination
   * @returns Paginated list of land ownership records
   */
  static async getTeamLand(
    teamId: string,
    params: LandQuery = {}
  ): Promise<PaginatedResponse<TeamLandOwnership>> {
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      limit: params.limit || 20,
      ...(params.sort && { sort: params.sort }),
      ...(params.order && { order: params.order }),
      ...(params.tileId !== undefined && { tileId: params.tileId }),
      ...(params.dateFrom && { dateFrom: params.dateFrom }),
      ...(params.dateTo && { dateTo: params.dateTo }),
      ...(params.minArea !== undefined && { minArea: params.minArea }),
    };

    const response = await apiClient.get<ApiResponse<PaginatedResponse<TeamLandOwnership>>>(
      `${this.BASE_PATH}/${teamId}/land`,
      { params: queryParams }
    );

    return response.data.data;
  }

  /**
   * Get team members with details and statistics
   * @param teamId The team's unique identifier
   * @param params Query parameters for filtering and pagination
   * @returns Paginated list of team members
   */
  static async getTeamMembers(
    teamId: string,
    params: MembersQuery = {}
  ): Promise<PaginatedResponse<TeamMemberDetail>> {
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      limit: params.limit || 20,
      ...(params.sort && { sort: params.sort }),
      ...(params.order && { order: params.order }),
      ...(params.status && { status: params.status }),
      ...(params.userType !== undefined && { userType: params.userType }),
    };

    const response = await apiClient.get<ApiResponse<PaginatedResponse<TeamMemberDetail>>>(
      `${this.BASE_PATH}/${teamId}/members`,
      { params: queryParams }
    );

    return response.data.data;
  }

  /**
   * Get balance history for a team
   * @param teamId The team's unique identifier
   * @param params Query parameters for filtering and pagination
   * @returns Paginated list of balance history records
   */
  static async getTeamBalanceHistory(
    teamId: string,
    params: BalanceHistoryQuery = {}
  ): Promise<PaginatedResponse<TeamBalanceHistory>> {
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      limit: params.limit || 20,
      ...(params.sort && { sort: params.sort }),
      ...(params.order && { order: params.order }),
      ...(params.dateFrom && { dateFrom: params.dateFrom }),
      ...(params.dateTo && { dateTo: params.dateTo }),
      ...(params.minChange !== undefined && { minChange: params.minChange }),
    };

    const response = await apiClient.get<ApiResponse<PaginatedResponse<TeamBalanceHistory>>>(
      `${this.BASE_PATH}/${teamId}/balance-history`,
      { params: queryParams }
    );

    return response.data.data;
  }

  /**
   * Refresh all team data for the current manager
   * Utility method to fetch fresh data for the dashboard
   */
  static async refreshDashboardData(): Promise<{
    teams: PaginatedResponse<TeamSummary>;
  }> {
    const teams = await this.getTeams({ page: 1, limit: 20 });
    return { teams };
  }

  /**
   * Get summary statistics across all teams
   * Utility method to calculate aggregated stats
   */
  static async getDashboardSummary(teams: TeamSummary[]): Promise<{
    totalTeams: number;
    totalMembers: number;
    totalGold: string;
    totalCarbon: string;
    openTeams: number;
    closedTeams: number;
  }> {
    const totalTeams = teams.length;
    const totalMembers = teams.reduce((sum, team) => sum + team.memberCount, 0);
    const totalGold = teams
      .reduce((sum, team) => sum + parseFloat(team.goldBalance), 0)
      .toFixed(3);
    const totalCarbon = teams
      .reduce((sum, team) => sum + parseFloat(team.carbonBalance), 0)
      .toFixed(3);
    const openTeams = teams.filter((team) => team.isOpen).length;
    const closedTeams = teams.filter((team) => !team.isOpen).length;

    return {
      totalTeams,
      totalMembers,
      totalGold,
      totalCarbon,
      openTeams,
      closedTeams,
    };
  }
}

// Export default instance
export default ManagerTeamStatusService;