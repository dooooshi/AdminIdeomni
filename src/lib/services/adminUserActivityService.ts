import apiClient from '@/lib/http/api-client';
import { ErrorHandler, AdminUserActivityError, ErrorFactory } from '@/lib/errors/AdminUserActivityError';
import { AdminUserActivityValidationService } from '@/lib/validation/adminUserActivityValidation';

// User Activity Status enum
export enum UserActivityStatus {
  ENROLLED = 'ENROLLED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

// Activity Types enum
export enum ActivityType {
  BizSimulation2_0 = 'BizSimulation2.0',
  BizSimulation2_2 = 'BizSimulation2.2',
  BizSimulation3_1 = 'BizSimulation3.1'
}

// User Types constants
export const USER_TYPES = {
  MANAGER: 1,
  WORKER: 2,
  STUDENT: 3
} as const;

// User interface
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  userType: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Activity interface
export interface Activity {
  id: string;
  name: string;
  activityType: ActivityType;
  startAt: string;
  endAt: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Admin interface
export interface Admin {
  id: string;
  username: string;
  email: string;
  adminType: 'SUPER_ADMIN' | 'LIMITED_ADMIN';
}

// User-Activity relationship
export interface UserActivity {
  id: string;
  userId: string;
  activityId: string;
  status: UserActivityStatus;
  enrolledAt: string;
  updatedAt: string;
  addedBy?: string;
  user: User;
  activity: Activity;
  addedByAdmin?: Admin;
}

// Team interfaces
export interface Team {
  id: string;
  name: string;
  description?: string;
  activityId: string;
  leaderId: string;
  maxMembers: number;
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
  activity: Activity;
  leader: User;
  memberCount: number;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  isLeader: boolean;
  joinedAt: string;
  user: User;
  team: Team;
}

// Search and filtering interfaces
export interface AdminUserActivitySearchParams {
  q?: string;
  userType?: number;
  activityStatus?: 'assigned' | 'unassigned' | 'all';
  activityId?: string;
  enrollmentStatus?: UserActivityStatus;
  includeInactive?: boolean;
  sortBy?: 'username' | 'email' | 'createdAt' | 'enrolledAt' | 'firstName' | 'lastName';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface UserWithActivityDto {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  userType: number;
  isActive: boolean;
  createdAt: string;
  currentActivity?: {
    id: string;
    name: string;
    activityType: ActivityType;
    startAt: string;
    endAt: string;
    status: UserActivityStatus;
    enrolledAt: string;
    addedBy?: Admin;
  };
  currentTeam?: {
    id: string;
    name: string;
    isLeader: boolean;
    memberCount: number;
    maxMembers: number;
    isOpen: boolean;
    joinedAt: string;
  };
}

// Request interfaces
export interface AssignUserToActivityRequest {
  userId: string;
  activityId: string;
  reason?: string;
  forceAssignment?: boolean;
}

export interface TransferUserActivityRequest {
  userId: string;
  newActivityId: string;
  reason?: string;
}

export interface RemoveUserFromActivityRequest {
  reason?: string;
}

export interface BulkAssignUsersRequest {
  userIds: string[];
  activityId: string;
  reason?: string;
  forceAssignment?: boolean;
}

export interface UpdateUserActivityStatusRequest {
  userId: string;
  status: UserActivityStatus;
  reason?: string;
  notifyUser?: boolean;
}

export interface BulkUpdateStatusRequest {
  updates: Array<{
    userId: string;
    status: UserActivityStatus;
    reason?: string;
  }>;
  notifyUsers?: boolean;
}

// Team management requests
export interface AssignUserToTeamRequest {
  userId: string;
  teamId: string;
  reason?: string;
}

export interface DisbandTeamRequest {
  reason?: string;
}

export interface TeamSearchParams {
  q?: string;
  activityId?: string;
  includeInactive?: boolean;
  sortBy?: 'name' | 'createdAt' | 'memberCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// Response interfaces
export interface AssignmentResult {
  success: boolean;
  previousActivity?: string;
  newActivity?: string;
  message: string;
  transferredAt?: string;
}

export interface BulkOperationDetail {
  userId: string;
  success: boolean;
  error?: string;
  previousActivity?: string;
  newActivity?: string;
  user?: {
    username: string;
    email: string;
  };
}

export interface BulkOperationResult {
  successCount: number;
  failedCount: number;
  totalCount: number;
  details: BulkOperationDetail[];
}

export interface UserActivityStatistics {
  totalUsers: number;
  usersWithActivity: number;
  usersWithoutActivity: number;
  byUserType: {
    managers: {
      total: number;
      withActivity: number;
      withoutActivity: number;
    };
    workers: {
      total: number;
      withActivity: number;
      withoutActivity: number;
    };
    students: {
      total: number;
      withActivity: number;
      withoutActivity: number;
    };
  };
  byActivity: Array<{
    activityId: string;
    activityName: string;
    totalParticipants: number;
    enrolledCount: number;
    completedCount: number;
    cancelledCount: number;
    noShowCount: number;
  }>;
  recentAssignments: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  teamStatistics: {
    totalTeams: number;
    usersInTeams: number;
    usersWithoutTeams: number;
    averageTeamSize: number;
    teamsByActivity: Array<{
      activityId: string;
      activityName: string;
      totalTeams: number;
      totalMembers: number;
      averageTeamSize: number;
    }>;
  };
}

export interface ExportParams {
  format?: 'csv' | 'excel' | 'json';
  includeUnassigned?: boolean;
  includeInactive?: boolean;
  userType?: number;
  activityId?: string;
  fields?: string[];
}

export interface ExportResult {
  success: boolean;
  data: {
    downloadUrl: string;
    filename: string;
    recordCount: number;
    format: string;
    expiresAt: string;
  };
  message: string;
}

// Pagination response wrapper
export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  businessCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

/**
 * Comprehensive Admin User Activity Service
 * Implements all endpoints from the admin user-activity management documentation
 */
export class AdminUserActivityService {
  private static readonly BASE_PATH = '/admin/user-activities';

  /**
   * Utility method to properly serialize query parameters
   * Ensures boolean values are sent as actual booleans, not strings
   */
  private static serializeQueryParams(params: Record<string, any>): Record<string, any> {
    const serialized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        // Handle boolean values properly
        if (typeof value === 'boolean') {
          serialized[key] = value;
        } else if (typeof value === 'string' && (value === 'true' || value === 'false')) {
          serialized[key] = value === 'true';
        } else {
          serialized[key] = value;
        }
      }
    }
    
    return serialized;
  }

  // ===================== User-Activity Search & Management =====================

  /**
   * Advanced user search with activity participation filtering
   */
  static async searchUsersWithActivityStatus(
    params: AdminUserActivitySearchParams = {}
  ): Promise<PaginationResult<UserWithActivityDto>> {
    try {
      // Validate input parameters
      const validationResult = AdminUserActivityValidationService.validate('searchUsers', params);
      if (!validationResult.isValid) {
        throw validationResult.errors[0]; // Throw the first validation error
      }

      const queryParams = this.serializeQueryParams({
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        q: params.q,
        userType: params.userType,
        activityStatus: params.activityStatus === 'all' ? undefined : params.activityStatus,
        activityId: params.activityId,
        enrollmentStatus: params.enrollmentStatus,
        includeInactive: params.includeInactive,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      });

      const response = await apiClient.get<ApiResponse<PaginationResult<UserWithActivityDto>>>(
        `${this.BASE_PATH}/search`,
        { params: queryParams }
      );
      return response.data.data;
    } catch (error) {
      const processedError = ErrorHandler.processError(error, 'searchUsersWithActivityStatus');
      ErrorHandler.logError(processedError, 'AdminUserActivityService.searchUsersWithActivityStatus');
      throw processedError;
    }
  }

  /**
   * Assign a user to an activity with one-activity constraint handling
   */
  static async assignUserToActivity(
    request: AssignUserToActivityRequest
  ): Promise<AssignmentResult> {
    try {
      // Validate input parameters
      const validationResult = AdminUserActivityValidationService.validate('assignUser', request);
      if (!validationResult.isValid) {
        throw validationResult.errors[0]; // Throw the first validation error
      }

      const response = await apiClient.post<ApiResponse<AssignmentResult>>(
        `${this.BASE_PATH}/assign`,
        request
      );
      return response.data.data;
    } catch (error) {
      const processedError = ErrorHandler.processError(error, 'assignUserToActivity');
      ErrorHandler.logError(processedError, 'AdminUserActivityService.assignUserToActivity');
      throw processedError;
    }
  }

  /**
   * Transfer a user from their current activity to a new one
   */
  static async transferUserBetweenActivities(
    request: TransferUserActivityRequest
  ): Promise<AssignmentResult> {
    const response = await apiClient.put<ApiResponse<AssignmentResult>>(
      `${this.BASE_PATH}/transfer`,
      request
    );
    return response.data.data;
  }

  /**
   * Remove a user from their current activity assignment
   */
  static async removeUserFromActivity(
    userId: string,
    request: RemoveUserFromActivityRequest = {}
  ): Promise<AssignmentResult> {
    const response = await apiClient.delete<ApiResponse<AssignmentResult>>(
      `${this.BASE_PATH}/users/${userId}/activity`,
      { data: request }
    );
    return response.data.data;
  }

  /**
   * Assign multiple users to an activity in a single operation
   */
  static async bulkAssignUsersToActivity(
    request: BulkAssignUsersRequest
  ): Promise<BulkOperationResult> {
    try {
      // Validate input parameters
      const validationResult = AdminUserActivityValidationService.validate('bulkAssign', request);
      if (!validationResult.isValid) {
        throw validationResult.errors[0]; // Throw the first validation error
      }

      const response = await apiClient.post<ApiResponse<BulkOperationResult>>(
        `${this.BASE_PATH}/bulk-assign`,
        request
      );
      return response.data.data;
    } catch (error) {
      const processedError = ErrorHandler.processError(error, 'bulkAssignUsersToActivity');
      ErrorHandler.logError(processedError, 'AdminUserActivityService.bulkAssignUsersToActivity');
      throw processedError;
    }
  }

  // ===================== Activity Management =====================

  /**
   * Get list of users participating in a specific activity
   */
  static async getActivityParticipants(
    activityId: string,
    params: {
      status?: UserActivityStatus;
      userType?: number;
      searchName?: string;
      includeInactive?: boolean;
      page?: number;
      pageSize?: number;
    } = {}
  ): Promise<PaginationResult<UserActivity>> {
    const queryParams = this.serializeQueryParams({
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      status: params.status,
      userType: params.userType,
      searchName: params.searchName,
      includeInactive: params.includeInactive,
    });

    const response = await apiClient.get<ApiResponse<PaginationResult<UserActivity>>>(
      `/admin/activities/${activityId}/participants`,
      { params: queryParams }
    );
    return response.data.data;
  }

  /**
   * Add multiple users to an activity as participants
   */
  static async addUsersToActivity(
    activityId: string,
    request: {
      userIds: string[];
      enrollmentStatus?: UserActivityStatus;
      notifyUsers?: boolean;
    }
  ): Promise<BulkOperationResult> {
    const response = await apiClient.post<ApiResponse<BulkOperationResult>>(
      `/admin/activities/${activityId}/participants`,
      request
    );
    return response.data.data;
  }

  /**
   * Update participation status of a user in an activity
   */
  static async updateUserActivityStatus(
    activityId: string,
    request: UpdateUserActivityStatusRequest
  ): Promise<void> {
    await apiClient.put(
      `/admin/activities/${activityId}/participants/status`,
      request
    );
  }

  /**
   * Bulk update user activity status
   */
  static async bulkUpdateUserActivityStatus(
    activityId: string,
    request: BulkUpdateStatusRequest
  ): Promise<BulkOperationResult> {
    const response = await apiClient.put<ApiResponse<BulkOperationResult>>(
      `/admin/activities/${activityId}/participants/bulk-status`,
      request
    );
    return response.data.data;
  }

  // ===================== Team Management =====================

  /**
   * View all teams across activities with filtering options
   */
  static async getAllTeams(
    params: TeamSearchParams = {}
  ): Promise<PaginationResult<Team>> {
    const queryParams = this.serializeQueryParams({
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      q: params.q,
      activityId: params.activityId,
      includeInactive: params.includeInactive,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    });

    const response = await apiClient.get<ApiResponse<PaginationResult<Team>>>(
      `${this.BASE_PATH}/teams`,
      { params: queryParams }
    );
    return response.data.data;
  }

  /**
   * Assign a user to a team within their current activity
   */
  static async assignUserToTeam(
    request: AssignUserToTeamRequest
  ): Promise<AssignmentResult> {
    const response = await apiClient.post<ApiResponse<AssignmentResult>>(
      `${this.BASE_PATH}/teams/assign`,
      request
    );
    return response.data.data;
  }

  /**
   * Remove a user from their current team
   */
  static async removeUserFromTeam(
    userId: string
  ): Promise<AssignmentResult> {
    const response = await apiClient.delete<ApiResponse<AssignmentResult>>(
      `${this.BASE_PATH}/users/${userId}/team`
    );
    return response.data.data;
  }

  /**
   * Forcibly disband a team and remove all members
   */
  static async forceDisbandTeam(
    teamId: string,
    request: DisbandTeamRequest = {}
  ): Promise<AssignmentResult> {
    const response = await apiClient.delete<ApiResponse<AssignmentResult>>(
      `${this.BASE_PATH}/teams/${teamId}/disband`,
      { data: request }
    );
    return response.data.data;
  }

  // ===================== Statistics & Analytics =====================

  /**
   * Get comprehensive statistics for admin dashboard
   */
  static async getUserActivityStatistics(): Promise<UserActivityStatistics> {
    const response = await apiClient.get<ApiResponse<UserActivityStatistics>>(
      `${this.BASE_PATH}/statistics`
    );
    return response.data.data;
  }

  /**
   * Get users not assigned to any activity
   */
  static async getUnassignedUsers(
    params: {
      userType?: number;
      includeInactive?: boolean;
      page?: number;
      pageSize?: number;
    } = {}
  ): Promise<PaginationResult<User>> {
    const queryParams = this.serializeQueryParams({
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      userType: params.userType,
      includeInactive: params.includeInactive,
    });

    const response = await apiClient.get<ApiResponse<PaginationResult<User>>>(
      `${this.BASE_PATH}/unassigned`,
      { params: queryParams }
    );
    return response.data.data;
  }

  // ===================== Export & Reporting =====================

  /**
   * Export user-activity relationship data in various formats
   */
  static async exportUserActivityData(
    params: ExportParams = {}
  ): Promise<ExportResult> {
    try {
      // Validate input parameters
      const validationResult = AdminUserActivityValidationService.validate('export', params);
      if (!validationResult.isValid) {
        throw validationResult.errors[0]; // Throw the first validation error
      }

      const queryParams = this.serializeQueryParams({
        format: params.format,
        includeUnassigned: params.includeUnassigned,
        includeInactive: params.includeInactive,
        userType: params.userType,
        activityId: params.activityId,
        fields: params.fields ? params.fields.join(',') : undefined,
      });

      const response = await apiClient.get<ApiResponse<ExportResult>>(
        `${this.BASE_PATH}/export`,
        { params: queryParams }
      );
      return response.data.data;
    } catch (error) {
      const processedError = ErrorHandler.processError(error, 'exportUserActivityData');
      ErrorHandler.logError(processedError, 'AdminUserActivityService.exportUserActivityData');
      throw processedError;
    }
  }

  // ===================== Helper Methods =====================

  /**
   * Get status display name
   */
  static getStatusDisplayName(status: UserActivityStatus): string {
    switch (status) {
      case UserActivityStatus.ENROLLED:
        return 'Enrolled';
      case UserActivityStatus.COMPLETED:
        return 'Completed';
      case UserActivityStatus.CANCELLED:
        return 'Cancelled';
      case UserActivityStatus.NO_SHOW:
        return 'No Show';
      default:
        return status;
    }
  }

  /**
   * Get status color for UI components
   */
  static getStatusColor(status: UserActivityStatus): 'success' | 'info' | 'warning' | 'error' | 'default' {
    switch (status) {
      case UserActivityStatus.ENROLLED:
        return 'info';
      case UserActivityStatus.COMPLETED:
        return 'success';
      case UserActivityStatus.CANCELLED:
        return 'warning';
      case UserActivityStatus.NO_SHOW:
        return 'error';
      default:
        return 'default';
    }
  }

  /**
   * Get user type display name
   */
  static getUserTypeDisplayName(userType: number): string {
    switch (userType) {
      case USER_TYPES.MANAGER:
        return 'Manager';
      case USER_TYPES.WORKER:
        return 'Worker';
      case USER_TYPES.STUDENT:
        return 'Student';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get user type color for UI components
   */
  static getUserTypeColor(userType: number): 'primary' | 'secondary' | 'info' | 'default' {
    switch (userType) {
      case USER_TYPES.MANAGER:
        return 'primary';
      case USER_TYPES.WORKER:
        return 'secondary';
      case USER_TYPES.STUDENT:
        return 'info';
      default:
        return 'default';
    }
  }

  /**
   * Format user display name
   */
  static formatUserDisplayName(user: User | UserWithActivityDto): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username || user.email || 'Unknown User';
  }

  /**
   * Check if user can be assigned to activity (one-activity constraint)
   */
  static canAssignUserToActivity(user: UserWithActivityDto): boolean {
    return !user.currentActivity;
  }

  /**
   * Get activity time status (upcoming, ongoing, completed)
   */
  static getActivityTimeStatus(activity: Activity): {
    label: string;
    color: 'info' | 'success' | 'default';
    isActive: boolean;
  } {
    const now = new Date();
    const startTime = new Date(activity.startAt);
    const endTime = new Date(activity.endAt);

    if (now < startTime) {
      return { label: 'Upcoming', color: 'info', isActive: false };
    } else if (now > endTime) {
      return { label: 'Completed', color: 'default', isActive: false };
    } else {
      return { label: 'Ongoing', color: 'success', isActive: true };
    }
  }
}

export default AdminUserActivityService;