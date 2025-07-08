import {
  AuthResponse,
  AuthTokens,
  AdminLoginRequest,
  AdminLoginResponse,
  AdminUser,
  AdminCreateRequest,
  UserLoginRequest,
  UserLoginResponse,
  RegularUser,
  UserCreateRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ChangePasswordRequest,
  UpdateProfileRequest,
  AuthUserType,
  AdminErrorCodes,
  UserErrorCodes,
} from './types';
import { apiClient, tokenManager } from '../http';

class AuthService {

  // Authentication status
  isAuthenticated(): boolean {
    return !!tokenManager.getAccessToken();
  }

  getCurrentUserType(): AuthUserType | null {
    return tokenManager.getUserType();
  }

  getAccessToken(): string | null {
    return tokenManager.getAccessToken();
  }

  // Admin Authentication Methods
  async adminLogin(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
    const response = await apiClient.postAuth<AdminLoginResponse>('/admin/login', credentials);

    const tokens = {
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    };

    tokenManager.setTokens(tokens, 'admin');
    return response.data;
  }

  async adminLogout(): Promise<void> {
    try {
      await apiClient.postAuth('/admin/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Admin logout API call failed:', error);
    }
    tokenManager.clearTokens();
  }

  async getAdminProfile(): Promise<AdminUser> {
    const response = await apiClient.getAuth<AdminUser>('/admin/profile');
    return response.data;
  }

  async updateAdminProfile(data: UpdateProfileRequest): Promise<AdminUser> {
    const response = await apiClient.putAuth<AdminUser>('/admin/profile', data);
    return response.data;
  }

  async changeAdminPassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.putAuth('/admin/change-password', data);
  }

  async createAdmin(data: AdminCreateRequest): Promise<AdminUser> {
    const response = await apiClient.postAuth<AdminUser>('/admin/create', data);
    return response.data;
  }

  async getAdminList(): Promise<AdminUser[]> {
    const response = await apiClient.getAuth<AdminUser[]>('/admin/list');
    return response.data;
  }

  async updateAdmin(id: string, data: UpdateProfileRequest): Promise<AdminUser> {
    const response = await apiClient.putAuth<AdminUser>(`/admin/${id}`, data);
    return response.data;
  }

  async deleteAdmin(id: string): Promise<void> {
    await apiClient.deleteAuth(`/admin/${id}`);
  }

  // User Authentication Methods
  async userLogin(credentials: UserLoginRequest): Promise<UserLoginResponse> {
    const response = await apiClient.postAuth<UserLoginResponse>('/user/login', credentials);

    const tokens = {
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    };

    tokenManager.setTokens(tokens, 'user');
    return response.data;
  }

  async userLogout(): Promise<void> {
    try {
      await apiClient.postAuth('/user/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('User logout API call failed:', error);
    }
    tokenManager.clearTokens();
  }

  async getUserProfile(): Promise<RegularUser> {
    const response = await apiClient.getAuth<RegularUser>('/user/profile');
    return response.data;
  }

  async updateUserProfile(data: UpdateProfileRequest): Promise<RegularUser> {
    const response = await apiClient.putAuth<RegularUser>('/user/profile', data);
    return response.data;
  }

  async changeUserPassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.putAuth('/user/change-password', data);
  }

  async createUser(data: UserCreateRequest): Promise<RegularUser> {
    const response = await apiClient.postAuth<RegularUser>('/user/create', data);
    return response.data;
  }

  async getUserList(): Promise<RegularUser[]> {
    const response = await apiClient.getAuth<RegularUser[]>('/user/list');
    return response.data;
  }

  async getUsersByType(userType: 1 | 2 | 3): Promise<RegularUser[]> {
    const response = await apiClient.getAuth<RegularUser[]>(`/user/list?userType=${userType}`);
    return response.data;
  }

  async updateUser(id: string, data: UpdateProfileRequest): Promise<RegularUser> {
    const response = await apiClient.putAuth<RegularUser>(`/user/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await apiClient.deleteAuth(`/user/${id}`);
  }

  // Token refresh is now handled by the Axios interceptor
  async refreshAccessToken(): Promise<void> {
    await tokenManager.refreshToken();
  }

  // Permission checking methods
  hasAdminPermission(adminType: 1 | 2, requiredType: 1 | 2): boolean {
    // Super Admin (1) can access everything
    // Limited Admin (2) can only access Limited Admin features
    return adminType <= requiredType;
  }

  hasUserPermission(userType: 1 | 2 | 3, requiredType: 1 | 2 | 3): boolean {
    // Manager (1) can access everything
    // Worker (2) can access Worker and Student features
    // Student (3) can only access Student features
    return userType <= requiredType;
  }

  // Unified methods that work with current user type
  async getCurrentUser(): Promise<AdminUser | RegularUser> {
    const userType = this.getCurrentUserType();
    
    if (userType === 'admin') {
      return await this.getAdminProfile();
    } else if (userType === 'user') {
      return await this.getUserProfile();
    } else {
      throw new Error('No authenticated user');
    }
  }

  async logout(): Promise<void> {
    const userType = this.getCurrentUserType();
    
    if (userType === 'admin') {
      await this.adminLogout();
    } else if (userType === 'user') {
      await this.userLogout();
    } else {
      // Clear tokens even if no user type
      tokenManager.clearTokens();
    }
  }

  async updateProfile(data: UpdateProfileRequest): Promise<AdminUser | RegularUser> {
    const userType = this.getCurrentUserType();
    
    if (userType === 'admin') {
      return await this.updateAdminProfile(data);
    } else if (userType === 'user') {
      return await this.updateUserProfile(data);
    } else {
      throw new Error('No authenticated user');
    }
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    const userType = this.getCurrentUserType();
    
    if (userType === 'admin') {
      await this.changeAdminPassword(data);
    } else if (userType === 'user') {
      await this.changeUserPassword(data);
    } else {
      throw new Error('No authenticated user');
    }
  }
}

// Create and export singleton instance
const authService = new AuthService();

export default authService; 