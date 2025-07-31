import { AdminUser, RegularUser, AuthUserType } from './types';

/**
 * Get the default dashboard path based on user role
 */
export function getDefaultDashboardPath(
  userType: AuthUserType | null,
  user: AdminUser | RegularUser | null
): string {
  if (!userType || !user) {
    return '/sign-in';
  }

  if (userType === 'admin') {
    // All admins go to activity management
    return '/activity-management';
  }

  if (userType === 'user') {
    const regularUser = user as RegularUser;
    
    switch (regularUser.userType) {
      case 1: // Manager
        return '/team-administration';
      case 2: // Worker
        return '/team-management/dashboard';
      case 3: // Student
        return '/team-management/dashboard';
      default:
        return '/team-management/dashboard';
    }
  }

  return '/sign-in';
}

/**
 * Role-based redirect paths configuration
 */
export const ROLE_REDIRECTS = {
  // Admin redirects
  admin: '/activity-management',
  
  // User redirects by userType
  user: {
    manager: '/team-administration',        // userType: 1
    worker: '/team-management/dashboard',   // userType: 2  
    student: '/team-management/dashboard',  // userType: 3
  },
  
  // Fallback paths
  fallback: {
    unauthenticated: '/sign-in',
    authenticated: '/team-management/dashboard',
  }
} as const;

/**
 * Get user role display name
 */
export function getUserRoleDisplayName(
  userType: AuthUserType | null,
  user: AdminUser | RegularUser | null
): string {
  if (!userType || !user) {
    return 'Unknown';
  }

  if (userType === 'admin') {
    const adminUser = user as AdminUser;
    return adminUser.adminType === 1 ? 'Super Admin' : 'Limited Admin';
  }

  if (userType === 'user') {
    const regularUser = user as RegularUser;
    
    switch (regularUser.userType) {
      case 1:
        return 'Manager';
      case 2:
        return 'Worker';
      case 3:
        return 'Student';
      default:
        return 'User';
    }
  }

  return 'Unknown';
}

/**
 * Check if user can access a specific path
 */
export function canUserAccessPath(
  path: string,
  userType: AuthUserType | null,
  user: AdminUser | RegularUser | null
): boolean {
  if (!userType || !user) {
    return false;
  }

  // Admin access rules
  if (userType === 'admin') {
    const adminUser = user as AdminUser;
    
    // Super admins can access everything
    if (adminUser.adminType === 1) {
      return true;
    }
    
    // Limited admins have restricted access
    const restrictedPaths = ['/admin-management', '/user-management'];
    return !restrictedPaths.some(restrictedPath => path.startsWith(restrictedPath));
  }

  // User access rules
  if (userType === 'user') {
    const regularUser = user as RegularUser;
    
    // Manager access
    if (regularUser.userType === 1) {
      return !path.startsWith('/admin-management');
    }
    
    // Worker and Student access
    if (regularUser.userType === 2 || regularUser.userType === 3) {
      const allowedPaths = [
        '/team-management',
        '/land-management/student',
        '/land-management/manager', // Students might need manager view for some features
      ];
      
      return allowedPaths.some(allowedPath => path.startsWith(allowedPath));
    }
  }

  return false;
}