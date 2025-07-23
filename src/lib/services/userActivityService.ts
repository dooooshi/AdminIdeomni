import apiClient from '@/lib/http/api-client';

// User Activity Status enum
export enum UserActivityStatus {
  ENROLLED = 'ENROLLED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

// User interface for activity participants
export interface ActivityParticipantUser {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  userType: number; // 1: Manager, 2: Worker, 3: Student
  isActive: boolean;
}

// Activity interface for participants
export interface ParticipantActivity {
  id: string;
  name: string;
  activityType: string;
  startAt: string;
  endAt: string;
}

// Admin interface
export interface AdminInfo {
  id: string;
  username: string;
  email: string;
}

// Activity participant interface
export interface ActivityParticipant {
  id: string;
  user: ActivityParticipantUser;
  activity: ParticipantActivity;
  status: UserActivityStatus;
  enrolledAt: string;
  updatedAt: string;
  addedByAdmin?: AdminInfo;
}

// Add users to activity request
export interface AddUsersToActivityRequest {
  userIds: string[];
  reason?: string;
  sendNotification?: boolean;
}

// Remove users from activity request
export interface RemoveUsersFromActivityRequest {
  userIds: string[];
  reason?: string;
  sendNotification?: boolean;
}

// Update user activity status request
export interface UpdateUserActivityStatusRequest {
  userId: string;
  status: UserActivityStatus;
  reason?: string;
  sendNotification?: boolean;
}

// Bulk status update request
export interface BulkUpdateStatusRequest {
  updates: Array<{
    userId: string;
    status: UserActivityStatus;
    reason?: string;
  }>;
  sendNotification?: boolean;
}

// Operation result for individual user
export interface UserOperationResult {
  userId: string;
  success: boolean;
  error?: string;
  user?: {
    username: string;
    email: string;
  };
}

// Bulk operation response
export interface BulkOperationResponse {
  successCount: number;
  failedCount: number;
  totalCount: number;
  details: UserOperationResult[];
  metadata: {
    activityId: string;
    activityName: string;
    operationTimestamp: string;
    performedBy: string;
  };
}

// Get participants query parameters
export interface GetParticipantsParams {
  status?: UserActivityStatus;
  userType?: number;
  searchName?: string;
  includeInactive?: boolean;
  sortBy?: 'enrolledAt' | 'status' | 'username' | 'userType';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// Participants response with statistics
export interface ParticipantsResponse {
  data: ActivityParticipant[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  statistics: {
    totalParticipants: number;
    enrolled: number;
    completed: number;
    cancelled: number;
    noShow: number;
  };
}

// User activity history params
export interface UserActivityHistoryParams {
  status?: UserActivityStatus;
  includeUpcoming?: boolean;
  includePast?: boolean;
  page?: number;
  pageSize?: number;
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

export class UserActivityService {
  private static readonly BASE_PATH = '/admin/users';

  // Add users to activity
  static async addUsersToActivity(
    activityId: string, 
    request: AddUsersToActivityRequest
  ): Promise<BulkOperationResponse> {
    const response = await apiClient.post<ApiResponse<BulkOperationResponse>>(
      `${this.BASE_PATH}/activities/${activityId}/participants`,
      request
    );
    return response.data.data;
  }

  // Remove users from activity
  static async removeUsersFromActivity(
    activityId: string, 
    request: RemoveUsersFromActivityRequest
  ): Promise<BulkOperationResponse> {
    const response = await apiClient.delete<ApiResponse<BulkOperationResponse>>(
      `${this.BASE_PATH}/activities/${activityId}/participants`,
      request
    );
    return response.data.data;
  }

  // Get activity participants
  static async getActivityParticipants(
    activityId: string, 
    params: GetParticipantsParams = {}
  ): Promise<ParticipantsResponse> {
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
    };

    if (params.status) queryParams.status = params.status;
    if (params.userType) queryParams.userType = params.userType;
    if (params.searchName) queryParams.searchName = params.searchName;
    if (params.includeInactive !== undefined) queryParams.includeInactive = params.includeInactive;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

    const response = await apiClient.get<ApiResponse<ParticipantsResponse>>(
      `${this.BASE_PATH}/activities/${activityId}/participants`,
      { params: queryParams }
    );
    return response.data.data;
  }

  // Update user activity status
  static async updateUserActivityStatus(
    activityId: string, 
    request: UpdateUserActivityStatusRequest
  ): Promise<void> {
    await apiClient.put(
      `${this.BASE_PATH}/activities/${activityId}/participants/status`,
      request
    );
  }

  // Bulk update user activity status
  static async bulkUpdateUserActivityStatus(
    activityId: string, 
    request: BulkUpdateStatusRequest
  ): Promise<BulkOperationResponse> {
    const response = await apiClient.put<ApiResponse<BulkOperationResponse>>(
      `${this.BASE_PATH}/activities/${activityId}/participants/bulk-status`,
      request
    );
    return response.data.data;
  }

  // Get user activity history
  static async getUserActivityHistory(
    userId: string, 
    params: UserActivityHistoryParams = {}
  ): Promise<ParticipantsResponse> {
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
    };

    if (params.status) queryParams.status = params.status;
    if (params.includeUpcoming !== undefined) queryParams.includeUpcoming = params.includeUpcoming;
    if (params.includePast !== undefined) queryParams.includePast = params.includePast;

    const response = await apiClient.get<ApiResponse<ParticipantsResponse>>(
      `${this.BASE_PATH}/${userId}/activities`,
      { params: queryParams }
    );
    return response.data.data;
  }

  // Helper method to get status display name
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

  // Helper method to get status color
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

  // Helper method to get user type display name
  static getUserTypeDisplayName(userType: number): string {
    switch (userType) {
      case 1:
        return 'Manager';
      case 2:
        return 'Worker';
      case 3:
        return 'Student';
      default:
        return 'Unknown';
    }
  }

  // Helper method to get user type color
  static getUserTypeColor(userType: number): 'primary' | 'secondary' | 'info' | 'default' {
    switch (userType) {
      case 1:
        return 'primary'; // Manager
      case 2:
        return 'secondary'; // Worker
      case 3:
        return 'info'; // Student
      default:
        return 'default';
    }
  }

  // Helper method to format user display name
  static formatUserDisplayName(user: ActivityParticipantUser): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  }
}

export default UserActivityService; 