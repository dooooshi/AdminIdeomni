import { apiClient } from 'src/lib/http';
import type { ApiResponse } from 'src/lib/http';
import {
  Team,
  TeamListItem,
  PaginatedResponse,
  TeamStatistics,
  TeamListQuery,
  TransferLeadershipRequest
} from 'src/types/team';

/**
 * Base URL for team administration API endpoints
 */
const TEAM_ADMIN_BASE_URL = '/user/manage/teams';

/**
 * Wrapper for API responses that include business logic metadata
 */
interface ApiBusinessResponse<T> {
  data: T;
  businessCode: number;
  message: string;
  success: boolean;
  timestamp: string;
  extra: {
    version: string;
  };
  path: string;
}

/**
 * Manager Team API Service using lib/http
 */
class ManagerTeamApiService {
  private baseUrl = TEAM_ADMIN_BASE_URL;
  /**
   * Get all teams in activity (Manager only)
   */
  async getAllTeams(query: TeamListQuery = {}): Promise<PaginatedResponse<TeamListItem>> {
    try {
      const { page = 1, pageSize = 20, search = '' } = query;
      const response: ApiResponse<ApiBusinessResponse<PaginatedResponse<TeamListItem>>> = await apiClient.get(
        `${this.baseUrl}?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`
      );
      return response.data.data;
    } catch (error) {
      console.error('ManagerTeamApiService.getAllTeams failed:', error);
      throw error;
    }
  }

  /**
   * Get team details (Manager)
   */
  async getManagerTeamDetails(teamId: string): Promise<Team> {
    try {
      const response: ApiResponse<ApiBusinessResponse<Team>> = await apiClient.get(
        `${this.baseUrl}/${teamId}`
      );
      return response.data.data;
    } catch (error) {
      console.error('ManagerTeamApiService.getManagerTeamDetails failed:', error);
      throw error;
    }
  }

  /**
   * Force disband team
   */
  async forceDisbandTeam(teamId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${teamId}`);
  }

  /**
   * Force remove member
   */
  async forceRemoveMember(teamId: string, userId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${teamId}/members/${userId}`);
  }

  /**
   * Force transfer leadership
   */
  async forceTransferLeadership(teamId: string, newLeaderId: string): Promise<void> {
    await apiClient.put(`${this.baseUrl}/${teamId}/leader`, {
      newLeaderId
    });
  }

  /**
   * Get team statistics
   */
  async getTeamStatistics(): Promise<TeamStatistics> {
    try {
      const response: ApiResponse<ApiBusinessResponse<TeamStatistics>> = await apiClient.get(
        `${this.baseUrl}/statistics`
      );
      return response.data.data;
    } catch (error) {
      console.error('ManagerTeamApiService.getTeamStatistics failed:', error);
      throw error;
    }
  }

  /**
   * Get the base URL for team administration endpoints
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Set a custom base URL (useful for testing or different environments)
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }
}

// Create and export service instance
const managerTeamApiService = new ManagerTeamApiService();

export default managerTeamApiService;

// Export the class for potential extension
export { ManagerTeamApiService };