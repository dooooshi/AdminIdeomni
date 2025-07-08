import { useAuth } from './auth-context';
import {
  AdminUser,
  RegularUser,
  AuthUserType,
  AdminLoginRequest,
  UserLoginRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
} from './types';

// Main auth hook - re-export for convenience
export { useAuth };

// Hook for checking if user is authenticated
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

// Hook for getting current user
export function useCurrentUser(): AdminUser | RegularUser | null {
  const { user } = useAuth();
  return user;
}

// Hook for getting current user type
export function useCurrentUserType(): AuthUserType | null {
  const { userType } = useAuth();
  return userType;
}

// Hook for checking if user is admin
export function useIsAdmin(): boolean {
  const { userType } = useAuth();
  return userType === 'admin';
}

// Hook for checking if user is regular user
export function useIsUser(): boolean {
  const { userType } = useAuth();
  return userType === 'user';
}

// Hook for getting admin user (with type safety)
export function useAdminUser(): AdminUser | null {
  const { user, userType } = useAuth();
  return userType === 'admin' ? (user as AdminUser) : null;
}

// Hook for getting regular user (with type safety)
export function useRegularUser(): RegularUser | null {
  const { user, userType } = useAuth();
  return userType === 'user' ? (user as RegularUser) : null;
}

// Hook for checking admin type permissions
export function useAdminPermissions() {
  const adminUser = useAdminUser();
  
  const isSuperAdmin = adminUser?.adminType === 1;
  const isLimitedAdmin = adminUser?.adminType === 2;
  
  const canCreateAdmin = isSuperAdmin;
  const canManageAdmins = isSuperAdmin;
  const canDeleteAdmin = isSuperAdmin;
  const canViewAdminLogs = isSuperAdmin;
  
  return {
    isSuperAdmin,
    isLimitedAdmin,
    canCreateAdmin,
    canManageAdmins,
    canDeleteAdmin,
    canViewAdminLogs,
  };
}

// Hook for checking user type permissions
export function useUserPermissions() {
  const regularUser = useRegularUser();
  
  const isManager = regularUser?.userType === 1;
  const isWorker = regularUser?.userType === 2;
  const isStudent = regularUser?.userType === 3;
  
  const canCreateUser = isManager;
  const canManageUsers = isManager;
  const canDeleteUser = isManager;
  const canViewUserLogs = isManager;
  const canViewUserList = isManager || isWorker;
  
  return {
    isManager,
    isWorker,
    isStudent,
    canCreateUser,
    canManageUsers,
    canDeleteUser,
    canViewUserLogs,
    canViewUserList,
  };
}

// Hook for login functionality
export function useLogin() {
  const { login, isLoading, error, clearError } = useAuth();
  
  const adminLogin = async (credentials: AdminLoginRequest) => {
    return await login(credentials, 'admin');
  };
  
  const userLogin = async (credentials: UserLoginRequest) => {
    return await login(credentials, 'user');
  };
  
  return {
    adminLogin,
    userLogin,
    isLoading,
    error,
    clearError,
  };
}

// Hook for logout functionality
export function useLogout() {
  const { logout, isLoading } = useAuth();
  
  return {
    logout,
    isLoading,
  };
}

// Hook for profile management
export function useProfile() {
  const { user, updateProfile, isLoading, error, clearError } = useAuth();
  
  return {
    user,
    updateProfile,
    isLoading,
    error,
    clearError,
  };
}

// Hook for password management
export function usePasswordChange() {
  const { changePassword, isLoading, error, clearError } = useAuth();
  
  return {
    changePassword,
    isLoading,
    error,
    clearError,
  };
}

// Hook for checking loading state
export function useAuthLoading(): boolean {
  const { isLoading } = useAuth();
  return isLoading;
}

// Hook for getting auth errors
export function useAuthError(): string | null {
  const { error } = useAuth();
  return error;
}

// Hook for permission checking
export function usePermissions() {
  const { userType, user } = useAuth();
  
  const hasPermission = (requiredUserType?: AuthUserType, requiredLevel?: number): boolean => {
    if (!user || !userType) return false;
    
    // Check user type match
    if (requiredUserType && userType !== requiredUserType) return false;
    
    // Check level permissions
    if (requiredLevel !== undefined) {
      if (userType === 'admin') {
        const adminUser = user as AdminUser;
        // Super Admin (1) has all permissions
        if (adminUser.adminType === 1) return true;
        // Limited Admin (2) has restricted permissions
        return adminUser.adminType >= requiredLevel;
      } else {
        const regularUser = user as RegularUser;
        // Manager (1) has all permissions
        if (regularUser.userType === 1) return true;
        // Worker (2) has limited permissions
        if (regularUser.userType === 2 && requiredLevel >= 2) return true;
        // Student (3) has minimal permissions
        return regularUser.userType === requiredLevel;
      }
    }
    
    return true;
  };
  
  const canAccess = (
    requiredUserType?: AuthUserType,
    requiredAdminType?: 1 | 2,
    requiredUserTypes?: (1 | 2 | 3)[]
  ): boolean => {
    if (!user || !userType) return false;
    
    // Check user type
    if (requiredUserType && userType !== requiredUserType) return false;
    
    // Check admin type
    if (requiredAdminType && userType === 'admin') {
      const adminUser = user as AdminUser;
      return adminUser.adminType <= requiredAdminType;
    }
    
    // Check user types
    if (requiredUserTypes && userType === 'user') {
      const regularUser = user as RegularUser;
      return requiredUserTypes.includes(regularUser.userType);
    }
    
    return true;
  };
  
  return {
    hasPermission,
    canAccess,
  };
}

// Hook for getting user display name
export function useUserDisplayName(): string {
  const { user } = useAuth();
  
  if (!user) return '';
  
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  
  if (user.firstName) {
    return user.firstName;
  }
  
  if (user.lastName) {
    return user.lastName;
  }
  
  return user.username || user.email || 'User';
}

// Hook for getting user initials
export function useUserInitials(): string {
  const { user } = useAuth();
  
  if (!user) return '';
  
  if (user.firstName && user.lastName) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }
  
  if (user.firstName) {
    return user.firstName.charAt(0).toUpperCase();
  }
  
  if (user.lastName) {
    return user.lastName.charAt(0).toUpperCase();
  }
  
  const username = user.username || user.email || 'U';
  return username.charAt(0).toUpperCase();
} 