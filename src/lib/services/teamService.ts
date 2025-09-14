import apiClient from '@/lib/http/api-client';
import {
  Team,
  TeamListItem,
  TeamMember,
  CreateTeamRequest,
  UpdateTeamRequest,
  InviteMembersRequest,
  TransferLeadershipRequest,
  InviteResponse,
  PaginatedResponse
} from '@/types/team';

export interface TeamListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  businessCode?: number;
  timestamp?: string;
  path?: string;
}

export class TeamService {
  private static readonly BASE_PATH = '/user/team';

  // Team Management

  /**
   * Get current user's team
   */
  static async getCurrentTeam(): Promise<Team> {
    const response = await apiClient.get<ApiResponse<Team>>(this.BASE_PATH);
    return response.data.data;
  }

  /**
   * Create a new team
   */
  static async createTeam(teamData: CreateTeamRequest): Promise<Team> {
    const response = await apiClient.post<ApiResponse<Team>>(this.BASE_PATH, teamData);
    return response.data.data;
  }

  /**
   * Update team settings
   */
  static async updateTeam(teamData: UpdateTeamRequest): Promise<Team> {
    const response = await apiClient.put<ApiResponse<Team>>(this.BASE_PATH, teamData);
    return response.data.data;
  }

  /**
   * Leave team
   */
  static async leaveTeam(): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`${this.BASE_PATH}/leave`);
  }

  /**
   * Disband team (leader only)
   */
  static async disbandTeam(): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(this.BASE_PATH);
  }

  // Team Discovery

  /**
   * Get available teams to join
   */
  static async getAvailableTeams(params: TeamListQuery = {}): Promise<PaginatedResponse<TeamListItem>> {
    const { page = 1, pageSize = 20, search = '' } = params;

    const queryParams: Record<string, any> = {
      page,
      pageSize,
      search: encodeURIComponent(search)
    };

    const response = await apiClient.get<ApiResponse<PaginatedResponse<TeamListItem>>>('/user/teams/available', {
      params: queryParams
    });

    return response.data.data;
  }

  /**
   * Join a team
   */
  static async joinTeam(teamId: string): Promise<void> {
    try {
      await apiClient.post<ApiResponse<void>>(`/user/teams/${teamId}/join`);
    } catch (error: any) {
      console.error('TeamService.joinTeam error:', {
        error,
        teamId,
        errorMessage: error?.message,
        errorResponse: error?.response,
        errorStatus: error?.response?.status
      });
      
      // Re-throw with consistent error format
      throw {
        httpStatus: error?.response?.status || 500,
        status: error?.response?.status || 500,
        message: error?.response?.data?.message || error?.message || 'Failed to join team',
        data: error?.response?.data || error?.message || 'Failed to join team',
        originalError: error
      };
    }
  }

  /**
   * Get team details
   */
  static async getTeamDetails(teamId: string): Promise<Team> {
    const response = await apiClient.get<ApiResponse<Team>>(`/user/teams/${teamId}`);
    return response.data.data;
  }

  // Team Members Management

  /**
   * Get team members
   */
  static async getTeamMembers(): Promise<TeamMember[]> {
    const response = await apiClient.get<ApiResponse<TeamMember[]>>(`${this.BASE_PATH}/members`);
    return response.data.data;
  }

  /**
   * Invite members to team
   */
  static async inviteMembers(inviteData: InviteMembersRequest): Promise<InviteResponse> {
    const response = await apiClient.post<ApiResponse<InviteResponse>>(`${this.BASE_PATH}/invite`, inviteData);
    return response.data.data;
  }

  /**
   * Remove member from team
   */
  static async removeMember(userId: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`${this.BASE_PATH}/members/${userId}`);
  }

  /**
   * Transfer team leadership
   */
  static async transferLeadership(transferData: TransferLeadershipRequest): Promise<void> {
    await apiClient.put<ApiResponse<void>>(`${this.BASE_PATH}/transfer-leadership`, transferData);
  }

  // Utility methods

  /**
   * Check if user can join team
   */
  static canJoinTeam(team: TeamListItem): boolean {
    return team.isOpen && team.currentMemberCount < team.maxMembers && team.status === 'active';
  }

  /**
   * Format team status
   */
  static formatTeamStatus(status: string): { label: string; color: 'success' | 'warning' | 'error' | 'default' } {
    switch (status) {
      case 'active':
        return { label: 'Active', color: 'success' };
      case 'full':
        return { label: 'Full', color: 'warning' };
      case 'inactive':
        return { label: 'Inactive', color: 'default' };
      case 'disbanded':
        return { label: 'Disbanded', color: 'error' };
      default:
        return { label: 'Unknown', color: 'default' };
    }
  }

  /**
   * Get member role display name
   */
  static getMemberRoleName(role: string): string {
    switch (role) {
      case 'leader':
        return 'Team Leader';
      case 'member':
        return 'Member';
      default:
        return 'Unknown';
    }
  }

  /**
   * Check if team is full
   */
  static isTeamFull(team: Team | TeamListItem): boolean {
    return (team.currentMemberCount || 0) >= team.maxMembers;
  }

  /**
   * Get team capacity info
   */
  static getTeamCapacityInfo(team: Team | TeamListItem): {
    current: number;
    max: number;
    percentage: number;
    available: number;
  } {
    const current = team.currentMemberCount || 0;
    const max = team.maxMembers;
    const available = max - current;
    const percentage = max > 0 ? Math.round((current / max) * 100) : 0;

    return {
      current,
      max,
      percentage,
      available
    };
  }
}

export default TeamService;