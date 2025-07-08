// Authentication Types based on API Documentation

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse<T = any> {
  success: boolean;
  businessCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
  details?: any;
}

// Admin Authentication Types
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  adminType: 1 | 2; // 1 = Super Admin, 2 = Limited Admin
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminLoginRequest {
  identifier: string; // username or email
  password: string;
}

export interface AdminLoginResponse {
  accessToken: string;
  refreshToken: string;
  admin: AdminUser;
}

export interface AdminCreateRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  adminType: 1 | 2;
  creator?: string;
}

// User Authentication Types
export interface RegularUser {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userType: 1 | 2 | 3; // 1 = Manager, 2 = Worker, 3 = Student
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserLoginRequest {
  identifier: string; // username or email
  password: string;
}

export interface UserLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: RegularUser;
}

export interface UserCreateRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  userType: 1 | 2 | 3;
  creator?: string;
}

// Common Types
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

// Auth Context Types
export type AuthUserType = 'admin' | 'user';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userType: AuthUserType | null;
  user: AdminUser | RegularUser | null;
  tokens: AuthTokens | null;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: AdminLoginRequest | UserLoginRequest, userType: AuthUserType) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  clearError: () => void;
}

// Permission Types
export type AdminPermission = 
  | 'admin:create'
  | 'admin:read'
  | 'admin:update'
  | 'admin:delete'
  | 'admin:manage'
  | 'admin:logs';

export type UserPermission = 
  | 'user:create'
  | 'user:read'
  | 'user:update'
  | 'user:delete'
  | 'user:manage'
  | 'user:logs';

export type Permission = AdminPermission | UserPermission;

// Auth Guard Types
export interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  userType?: AuthUserType;
  adminType?: 1 | 2;
  userTypes?: (1 | 2 | 3)[];
  permissions?: Permission[];
  requireAuth?: boolean;
}

// Error Types
export interface AuthError {
  code: number;
  message: string;
  details?: any;
}

// API Error Codes
export enum AdminErrorCodes {
  ADMIN_INVALID_CREDENTIALS = 2010,
  ADMIN_TOKEN_INVALID = 2011,
  ADMIN_TOKEN_REQUIRED = 2012,
  ADMIN_TOKEN_EXPIRED = 2013,
  ADMIN_REFRESH_TOKEN_INVALID = 2014,
  ADMIN_ACCOUNT_INACTIVE = 2015,
  ADMIN_INSUFFICIENT_PERMISSIONS = 2016,
  ADMIN_NOT_FOUND = 2017,
  ADMIN_USERNAME_OR_EMAIL_EXISTS = 2018,
  ADMIN_CURRENT_PASSWORD_INVALID = 2019,
  ADMIN_CANNOT_CHANGE_TYPE = 2020,
  ADMIN_CANNOT_DELETE_SELF = 2021,
  ADMIN_CANNOT_MANAGE_SUPERIOR = 2022,
  ADMIN_CANNOT_ACCESS_RESOURCE = 2023,
}

export enum UserErrorCodes {
  USER_INVALID_CREDENTIALS = 2100,
  USER_TOKEN_INVALID = 2101,
  USER_TOKEN_REQUIRED = 2102,
  USER_TOKEN_EXPIRED = 2103,
  USER_REFRESH_TOKEN_INVALID = 2104,
  USER_ACCOUNT_INACTIVE = 2105,
  USER_INSUFFICIENT_PERMISSIONS = 2106,
  USER_NOT_FOUND = 2107,
  USER_USERNAME_OR_EMAIL_EXISTS = 2108,
  USER_CURRENT_PASSWORD_INVALID = 2109,
  USER_CANNOT_CREATE_MANAGER = 2110,
  USER_MANAGER_ONLY_OPERATION = 2111,
  USER_CANNOT_MODIFY_OWN_ACCOUNT = 2112,
  USER_CANNOT_DELETE_OWN_ACCOUNT = 2113,
  USER_TYPE_MISMATCH = 2114,
} 