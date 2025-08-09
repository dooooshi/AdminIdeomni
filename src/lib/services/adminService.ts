import apiClient from '@/lib/http/api-client';

// Updated types based on new API documentation
export interface Admin {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string; // Updated to match new API
  status: string; // Updated to match new API
  adminType?: 1 | 2; // Keep for backward compatibility
  isActive?: boolean; // Keep for backward compatibility
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  creator?: string;
}

// New pagination response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  businessCode?: number;
  timestamp?: string;
  path?: string;
}

export interface AdminSearchResponseDto extends PaginatedResponse<Admin> {}

export interface AdminListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: 'username' | 'email' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

// Updated operation log types
export interface OperationLogDetailsDto {
  id: string;
  adminId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: object;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  admin: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export interface OperationLogsSearchResponseDto extends PaginatedResponse<OperationLogDetailsDto> {}

export interface AdminOperationLogsParams {
  page?: number;
  pageSize?: number;
  action?: string;
  resource?: string;
  resourceId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'action' | 'resource';
  sortOrder?: 'asc' | 'desc';
}

// Keep existing types for backward compatibility
export interface AdminOperationLog {
  id: string;
  adminId: string;
  action: string;
  resource?: string;
  resourceId?: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata: {
    duration: number;
    success: boolean;
    responseSize?: number;
    error?: string;
    errorCode?: number;
    requestBody?: object;
    changes?: object;
    [key: string]: any;
  };
  createdAt: string;
}

export interface CreateAdminRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  adminType: 1 | 2;
  creator?: string;
}

export interface UpdateAdminRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  adminType?: 1 | 2;
  isActive?: boolean;
  creator?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  admin: Admin;
}

export interface LogsQueryParams {
  limit?: number;
  offset?: number;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
  success?: boolean;
  sortBy?: 'createdAt' | 'action' | 'duration';
  sortOrder?: 'asc' | 'desc';
}

export interface SystemLogsQueryParams extends LogsQueryParams {
  adminId?: string;
  adminType?: 1 | 2;
  ipAddress?: string;
  minDuration?: number;
  maxDuration?: number;
}

export class AdminService {
  // Authentication endpoints
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/admin/login', credentials);
    return response.data;
  }

  static async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await apiClient.post<{ accessToken: string }>('/admin/refresh-token', {
      refreshToken
    });
    return response.data;
  }

  static async logout(): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/admin/logout');
    return response.data;
  }

  // Updated admin management endpoints
  static async createAdmin(adminData: CreateAdminRequest): Promise<Admin> {
    const response = await apiClient.post<Admin>('/admin/create', adminData);
    return response.data;
  }

  static async updateAdmin(adminId: string, updateData: UpdateAdminRequest): Promise<Admin> {
    const response = await apiClient.put<Admin>(`/admin/${adminId}`, updateData);
    return response.data;
  }

  static async deleteAdmin(adminId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/admin/${adminId}`);
    return response.data;
  }

  // Updated paginated admin list method
  static async getAdminList(params: AdminListParams = {}): Promise<AdminSearchResponseDto> {
    const {
      page = 1,
      pageSize = 20,
      search,
      role,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;

    const queryParams: Record<string, any> = {
      page,
      pageSize,
      sortBy,
      sortOrder
    };

    if (search) queryParams.search = search;
    if (role) queryParams.role = role;
    if (status) queryParams.status = status;

    const response = await apiClient.get<ApiResponse<AdminSearchResponseDto>>('/admin/list', {
      params: queryParams
    });
    
    return response.data.data;
  }

  // Legacy method for backward compatibility
  static async getAllAdmins(): Promise<Admin[]> {
    const response = await this.getAdminList({ page: 1, pageSize: 1000 });
    return response.data;
  }

  static async getProfile(): Promise<Admin> {
    const response = await apiClient.get<Admin>('/admin/profile');
    return response.data;
  }

  // Updated operation logs methods
  static async getAdminLogs(adminId: string, params: AdminOperationLogsParams = {}): Promise<OperationLogsSearchResponseDto> {
    const {
      page = 1,
      pageSize = 20,
      action,
      resource,
      resourceId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;

    const queryParams: Record<string, any> = {
      page,
      pageSize,
      sortBy,
      sortOrder
    };

    if (action) queryParams.action = action;
    if (resource) queryParams.resource = resource;
    if (resourceId) queryParams.resourceId = resourceId;
    if (startDate) queryParams.startDate = startDate;
    if (endDate) queryParams.endDate = endDate;

    const response = await apiClient.get<ApiResponse<OperationLogsSearchResponseDto>>(`/admin/${adminId}/logs`, {
      params: queryParams
    });
    
    return response.data.data;
  }

  // Legacy log methods for backward compatibility
  static async getAdminLogsLegacy(adminId: string, params?: LogsQueryParams): Promise<AdminOperationLog[]> {
    const response = await apiClient.get<AdminOperationLog[] | { data: AdminOperationLog[] }>(`/admin/${adminId}/logs`, {
      params
    });
    const data = response.data;
    
    // Ensure we always return an array
    if (Array.isArray(data)) {
      return data;
    }
    
    // Handle wrapped response format
    if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
      return data.data;
    }
    
    // Fallback to empty array if data format is unexpected
    console.warn('Unexpected admin logs response format:', data);
    return [];
  }

  static async getOwnLogs(params?: LogsQueryParams): Promise<AdminOperationLog[]> {
    const response = await apiClient.get<AdminOperationLog[] | { data: AdminOperationLog[] }>('/admin/logs/mine', {
      params
    });
    const data = response.data;
    
    // Ensure we always return an array
    if (Array.isArray(data)) {
      return data;
    }
    
    // Handle wrapped response format
    if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
      return data.data;
    }
    
    // Fallback to empty array if data format is unexpected
    console.warn('Unexpected own logs response format:', data);
    return [];
  }

  static async getSystemLogs(params?: SystemLogsQueryParams): Promise<AdminOperationLog[]> {
    const response = await apiClient.get<AdminOperationLog[] | { data: AdminOperationLog[] }>('/admin/logs/system', {
      params
    });
    const data = response.data;
    
    // Ensure we always return an array
    if (Array.isArray(data)) {
      return data;
    }
    
    // Handle wrapped response format
    if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
      return data.data;
    }
    
    // Fallback to empty array if data format is unexpected
    console.warn('Unexpected system logs response format:', data);
    return [];
  }

  // Password management
  static async changePassword(passwordData: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await apiClient.put<{ message: string }>('/admin/change-password', passwordData);
    return response.data;
  }

  // Utility methods
  static getAdminTypeName(adminType: 1 | 2): string {
    return adminType === 1 ? 'Super Admin' : 'Limited Admin';
  }

  static formatOperationAction(action: string): string {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  static getOperationSeverity(log: AdminOperationLog): 'low' | 'medium' | 'high' | 'critical' {
    if (!log.metadata.success) {
      if (log.action.includes('DELETE') || log.action.includes('CREATE_ADMIN')) {
        return 'critical';
      }
      return 'high';
    }
    
    if (log.action.includes('DELETE') || log.action.includes('CREATE_ADMIN')) {
      return 'medium';
    }
    
    return 'low';
  }
}

export default AdminService; 