import apiClient from '@/lib/http/api-client';

// User Management Types based on API documentation
export interface AdminUserDetailsDto {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userType: number; // 1=Manager, 2=Worker, 3=Student
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  roles?: string[];
  statistics?: {
    activitiesParticipated: number;
    activitiesCompleted: number;
    totalLoginCount: number;
  };
  createdBy?: {
    id: string;
    username: string;
  };
  activityDetails?: {
    id: string;
    status: string;
    joinedAt: Date;
  };
}

// Type alias for compatibility with activity management components
export type User = AdminUserDetailsDto;

export interface AdminUserSearchDto {
  q?: string;
  userType?: number;
  isActive?: boolean;
  createdFrom?: string;
  createdUntil?: string;
  lastLoginFrom?: string;
  roles?: string[];
  hasActivities?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface AdminCreateUserDto {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  userType: number;
  isActive?: boolean;
  roles?: string[];
  sendWelcomeEmail?: boolean;
}

export interface AdminUpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  userType?: number;
  isActive?: boolean;
  roles?: string[];
}

export interface AdminBulkCreateUserDto {
  users: AdminCreateUserDto[];
}

export interface AdminBulkUpdateUserDto {
  userIds: string[];
  updates: AdminUpdateUserDto;
}

export interface AdminResetPasswordDto {
  generateTemporary?: boolean;
  requireChange?: boolean;
  sendEmail?: boolean;
}

export interface UserSearchResponseDto {
  data: AdminUserDetailsDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface UserStatisticsDto {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  byUserType: {
    managers: number;
    workers: number;
    students: number;
  };
  recentRegistrations: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

export interface UserGrowthAnalyticsDto {
  period: string;
  registrations: Array<{
    date: string;
    count: number;
  }>;
  totalGrowth: number;
  percentageChange: number;
}

export interface UserExportResponseDto {
  downloadUrl: string;
  filename: string;
  recordCount: number;
  format: string;
  expiresAt: Date;
}

export interface UserAuditLogDto {
  id: string;
  action: string;
  resource: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  metadata: object;
}

export interface UserAuditLogsResponseDto {
  userId: string;
  logs: UserAuditLogDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface BulkOperationResultDto {
  successCount: number;
  failedCount: number;
  totalCount: number;
  details: Array<{
    identifier: string;
    success: boolean;
    error?: string;
    data?: { userId: string };
  }>;
}

export interface PasswordResetResultDto {
  userId: string;
  temporaryPassword?: string;
  passwordResetAt: Date;
  requireChange: boolean;
  emailSent: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  businessCode?: number;
  message?: string;
  timestamp?: string;
  path?: string;
}

export class UserService {
  private static readonly BASE_PATH = '/admin/users';

  // 1. User Search and Management

  /**
   * Search users with advanced filtering and pagination
   */
  static async searchUsers(params: AdminUserSearchDto = {}): Promise<UserSearchResponseDto> {
    const {
      page = 1,
      pageSize = 20,
      q,
      userType,
      isActive,
      createdFrom,
      createdUntil,
      lastLoginFrom,
      roles,
      hasActivities,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;

    const queryParams: Record<string, any> = {
      page,
      pageSize,
      sortBy,
      sortOrder
    };

    if (q) queryParams.q = q;
    if (userType !== undefined) queryParams.userType = userType;
    if (isActive !== undefined) queryParams.isActive = isActive;
    if (createdFrom) queryParams.createdFrom = createdFrom;
    if (createdUntil) queryParams.createdUntil = createdUntil;
    if (lastLoginFrom) queryParams.lastLoginFrom = lastLoginFrom;
    if (roles?.length) queryParams.roles = roles;
    if (hasActivities !== undefined) queryParams.hasActivities = hasActivities;

    const response = await apiClient.get<ApiResponse<UserSearchResponseDto>>(`${this.BASE_PATH}/search`, {
      params: queryParams
    });

    return response.data.data;
  }

  /**
   * Create a new user account
   */
  static async createUser(userData: AdminCreateUserDto): Promise<AdminUserDetailsDto> {
    const response = await apiClient.post<ApiResponse<AdminUserDetailsDto>>(this.BASE_PATH, userData);
    return response.data.data;
  }

  /**
   * Get user details by ID
   */
  static async getUserById(id: string): Promise<AdminUserDetailsDto> {
    const response = await apiClient.get<ApiResponse<AdminUserDetailsDto>>(`${this.BASE_PATH}/${id}`);
    return response.data.data;
  }

  /**
   * Update user information
   */
  static async updateUser(id: string, updateData: AdminUpdateUserDto): Promise<AdminUserDetailsDto> {
    const response = await apiClient.put<ApiResponse<AdminUserDetailsDto>>(`${this.BASE_PATH}/${id}`, updateData);
    return response.data.data;
  }

  /**
   * Delete user account
   */
  static async deleteUser(id: string, hardDelete: boolean = false): Promise<{ id: string; deletedAt: Date; hardDeleted: boolean }> {
    const response = await apiClient.delete<ApiResponse<{ id: string; deletedAt: Date; hardDeleted: boolean }>>(`${this.BASE_PATH}/${id}`, {
      params: { hardDelete }
    });
    return response.data.data;
  }

  // 2. Bulk Operations

  /**
   * Create multiple users in bulk
   */
  static async bulkCreateUsers(bulkData: AdminBulkCreateUserDto): Promise<BulkOperationResultDto> {
    const response = await apiClient.post<ApiResponse<BulkOperationResultDto>>(`${this.BASE_PATH}/bulk`, bulkData);
    return response.data.data;
  }

  /**
   * Update multiple users in bulk
   */
  static async bulkUpdateUsers(bulkData: AdminBulkUpdateUserDto): Promise<BulkOperationResultDto> {
    const response = await apiClient.put<ApiResponse<BulkOperationResultDto>>(`${this.BASE_PATH}/bulk`, bulkData);
    return response.data.data;
  }

  // 3. Password Management

  /**
   * Reset user password
   */
  static async resetUserPassword(id: string, resetData: AdminResetPasswordDto = {}): Promise<PasswordResetResultDto> {
    const response = await apiClient.put<ApiResponse<PasswordResetResultDto>>(`${this.BASE_PATH}/${id}/reset-password`, resetData);
    return response.data.data;
  }

  // 4. Activity Management

  /**
   * Get users by activity ID
   */
  static async getUsersByActivity(
    activityId: string,
    params: {
      status?: string;
      includeInactive?: boolean;
      page?: number;
      pageSize?: number;
    } = {}
  ): Promise<UserSearchResponseDto> {
    const { page = 1, pageSize = 20, status, includeInactive } = params;

    const queryParams: Record<string, any> = { page, pageSize };
    if (status) queryParams.status = status;
    if (includeInactive !== undefined) queryParams.includeInactive = includeInactive;

    const response = await apiClient.get<ApiResponse<UserSearchResponseDto>>(`${this.BASE_PATH}/by-activity/${activityId}`, {
      params: queryParams
    });

    return response.data.data;
  }

  // 5. Analytics and Statistics

  /**
   * Get user statistics for dashboard
   */
  static async getUserStatistics(): Promise<UserStatisticsDto> {
    const response = await apiClient.get<ApiResponse<UserStatisticsDto>>(`${this.BASE_PATH}/statistics`);
    return response.data.data;
  }

  /**
   * Get user growth analytics
   */
  static async getUserGrowthAnalytics(period: 'week' | 'month' | 'year' = 'month'): Promise<UserGrowthAnalyticsDto> {
    const response = await apiClient.get<ApiResponse<UserGrowthAnalyticsDto>>(`${this.BASE_PATH}/analytics/growth`, {
      params: { period }
    });
    return response.data.data;
  }

  // 6. Data Export

  /**
   * Export users data in various formats
   */
  static async exportUsers(params: {
    format?: 'csv' | 'excel' | 'json';
    includeInactive?: boolean;
    userType?: number;
    fields?: string[];
    startDate?: string;
    endDate?: string;
  } = {}): Promise<UserExportResponseDto> {
    const { format = 'csv', includeInactive = false, userType, fields, startDate, endDate } = params;

    const queryParams: Record<string, any> = { format, includeInactive };
    if (userType !== undefined) queryParams.userType = userType;
    if (fields?.length) queryParams.fields = fields;
    if (startDate) queryParams.startDate = startDate;
    if (endDate) queryParams.endDate = endDate;

    const response = await apiClient.get<ApiResponse<UserExportResponseDto>>(`${this.BASE_PATH}/export`, {
      params: queryParams
    });

    return response.data.data;
  }

  // 7. Audit and Logs

  /**
   * Get user audit logs
   */
  static async getUserAuditLogs(
    userId: string,
    params: {
      action?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      pageSize?: number;
    } = {}
  ): Promise<UserAuditLogsResponseDto> {
    const { page = 1, pageSize = 50, action, startDate, endDate } = params;

    const queryParams: Record<string, any> = { page, pageSize };
    if (action) queryParams.action = action;
    if (startDate) queryParams.startDate = startDate;
    if (endDate) queryParams.endDate = endDate;

    const response = await apiClient.get<ApiResponse<UserAuditLogsResponseDto>>(`${this.BASE_PATH}/${userId}/audit`, {
      params: queryParams
    });

    return response.data.data;
  }

  // Helper methods for user type management
  static getUserTypeName(userType: number): string {
    switch (userType) {
      case 1: return 'Manager';
      case 2: return 'Worker';
      case 3: return 'Student';
      default: return 'Unknown';
    }
  }

  static getUserTypeOptions(): Array<{ value: number; label: string }> {
    return [
      { value: 1, label: 'Manager' },
      { value: 2, label: 'Worker' },
      { value: 3, label: 'Student' }
    ];
  }

  // Helper method for status formatting
  static formatUserStatus(isActive: boolean): { label: string; color: 'success' | 'default' } {
    return {
      label: isActive ? 'Active' : 'Inactive',
      color: isActive ? 'success' : 'default'
    };
  }
}

export default UserService; 