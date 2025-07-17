import apiClient from '@/lib/http/api-client';

// Types based on API documentation
export interface Admin {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  adminType: 1 | 2; // 1: Super Admin, 2: Limited Admin
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  creator?: string;
}

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

  // Admin management endpoints
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

  static async getAdminList(): Promise<Admin[]> {
    const response = await apiClient.get<Admin[]>('/admin/list');
    const data = response.data;
    
    // Ensure we always return an array
    if (Array.isArray(data)) {
      return data;
    }
    
    // Handle wrapped response format
    if (data && typeof data === 'object' && Array.isArray(data.data)) {
      return data.data;
    }
    
    // Fallback to empty array if data format is unexpected
    console.warn('Unexpected admin list response format:', data);
    return [];
  }

  static async getProfile(): Promise<Admin> {
    const response = await apiClient.get<Admin>('/admin/profile');
    return response.data;
  }

  // Operation logs endpoints
  static async getAdminLogs(adminId: string, params?: LogsQueryParams): Promise<AdminOperationLog[]> {
    const response = await apiClient.get<AdminOperationLog[]>(`/admin/${adminId}/logs`, {
      params
    });
    const data = response.data;
    
    // Ensure we always return an array
    if (Array.isArray(data)) {
      return data;
    }
    
    // Handle wrapped response format
    if (data && typeof data === 'object' && Array.isArray(data.data)) {
      return data.data;
    }
    
    // Fallback to empty array if data format is unexpected
    console.warn('Unexpected admin logs response format:', data);
    return [];
  }

  static async getOwnLogs(params?: LogsQueryParams): Promise<AdminOperationLog[]> {
    const response = await apiClient.get<AdminOperationLog[]>('/admin/logs/mine', {
      params
    });
    const data = response.data;
    
    // Ensure we always return an array
    if (Array.isArray(data)) {
      return data;
    }
    
    // Handle wrapped response format
    if (data && typeof data === 'object' && Array.isArray(data.data)) {
      return data.data;
    }
    
    // Fallback to empty array if data format is unexpected
    console.warn('Unexpected own logs response format:', data);
    return [];
  }

  static async getSystemLogs(params?: SystemLogsQueryParams): Promise<AdminOperationLog[]> {
    const response = await apiClient.get<AdminOperationLog[]>('/admin/logs/system', {
      params
    });
    const data = response.data;
    
    // Ensure we always return an array
    if (Array.isArray(data)) {
      return data;
    }
    
    // Handle wrapped response format
    if (data && typeof data === 'object' && Array.isArray(data.data)) {
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