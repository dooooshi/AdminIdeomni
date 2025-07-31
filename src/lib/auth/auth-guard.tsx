'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-context';
import { AuthGuardProps, AdminUser, RegularUser, Permission } from './types';
import IdeomniLoading from '@ideomni/core/IdeomniLoading';

// Default loading component
const DefaultLoadingComponent = () => <IdeomniLoading />;

// Default unauthorized component
const DefaultUnauthorizedComponent = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
      <p className="text-gray-600">You don't have permission to access this page.</p>
    </div>
  </div>
);

// Main AuthGuard component
export function AuthGuard({
  children,
  fallback,
  userType,
  adminType,
  userTypes,
  permissions,
  requireAuth = true,
}: AuthGuardProps) {
  const { isAuthenticated, isLoading, user, userType: currentUserType } = useAuth();
  const router = useRouter();

  // Handle redirects in useEffect to avoid setState during render
  React.useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      const signInPath = userType === 'admin' ? '/sign-in/admin' : '/sign-in';
      router.push(signInPath);
    }
  }, [isLoading, requireAuth, isAuthenticated, userType, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return fallback || <DefaultLoadingComponent />;
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Return loading component while redirect is happening
    return fallback || <DefaultLoadingComponent />;
  }

  // If user is authenticated, check permissions
  if (isAuthenticated && user && currentUserType) {
    // Check user type requirement
    if (userType && currentUserType !== userType) {
      return fallback || <DefaultUnauthorizedComponent />;
    }

    // Check admin type requirement
    if (adminType && currentUserType === 'admin') {
      const adminUser = user as AdminUser;
      // Super Admin (1) can access everything, Limited Admin (2) has restrictions
      if (adminUser.adminType > adminType) {
        return fallback || <DefaultUnauthorizedComponent />;
      }
    }

    // Check user type array requirement
    if (userTypes && currentUserType === 'user') {
      const regularUser = user as RegularUser;
      if (!userTypes.includes(regularUser.userType)) {
        return fallback || <DefaultUnauthorizedComponent />;
      }
    }

    // TODO: Implement permission checking when needed
    // if (permissions && permissions.length > 0) {
    //   // Check if user has required permissions
    // }
  }

  // If not requiring auth and user is not authenticated, show children
  if (!requireAuth && !isAuthenticated) {
    return <>{children}</>;
  }

  // All checks passed, render children
  return <>{children}</>;
}

// Specific guard for admin users only
export function AdminGuard({
  children,
  fallback,
  adminType,
  permissions,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  adminType?: 1 | 2;
  permissions?: Permission[];
}) {
  return (
    <AuthGuard
      userType="admin"
      adminType={adminType}
      permissions={permissions}
      fallback={fallback}
    >
      {children}
    </AuthGuard>
  );
}

// Specific guard for regular users only
export function UserGuard({
  children,
  fallback,
  userTypes,
  permissions,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  userTypes?: (1 | 2 | 3)[];
  permissions?: Permission[];
}) {
  return (
    <AuthGuard
      userType="user"
      userTypes={userTypes}
      permissions={permissions}
      fallback={fallback}
    >
      {children}
    </AuthGuard>
  );
}

// Guard for Super Admin only
export function SuperAdminGuard({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <AdminGuard adminType={1} fallback={fallback}>
      {children}
    </AdminGuard>
  );
}

// Guard for Manager only
export function ManagerGuard({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <UserGuard userTypes={[1]} fallback={fallback}>
      {children}
    </UserGuard>
  );
}

// Guard for Manager and Worker
export function ManagerWorkerGuard({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <UserGuard userTypes={[1, 2]} fallback={fallback}>
      {children}
    </UserGuard>
  );
}

// Guard for guests only (unauthenticated users)
export function GuestGuard({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Handle redirects in useEffect to avoid setState during render
  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Redirect to home which will handle role-based routing
      router.push('/');
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return fallback || <DefaultLoadingComponent />;
  }

  // If user is authenticated, show loading while redirect is happening
  if (isAuthenticated) {
    return fallback || <DefaultLoadingComponent />;
  }

  // User is not authenticated, show children
  return <>{children}</>;
}

// Higher-order component for route protection
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  guardProps?: Omit<AuthGuardProps, 'children'>
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard {...guardProps}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

// Higher-order component for admin route protection
export function withAdminGuard<P extends object>(
  Component: React.ComponentType<P>,
  adminType?: 1 | 2
) {
  return function AdminGuardedComponent(props: P) {
    return (
      <AdminGuard adminType={adminType}>
        <Component {...props} />
      </AdminGuard>
    );
  };
}

// Higher-order component for user route protection
export function withUserGuard<P extends object>(
  Component: React.ComponentType<P>,
  userTypes?: (1 | 2 | 3)[]
) {
  return function UserGuardedComponent(props: P) {
    return (
      <UserGuard userTypes={userTypes}>
        <Component {...props} />
      </UserGuard>
    );
  };
}

// Higher-order component for guest route protection
export function withGuestGuard<P extends object>(
  Component: React.ComponentType<P>
) {
  return function GuestGuardedComponent(props: P) {
    return (
      <GuestGuard>
        <Component {...props} />
      </GuestGuard>
    );
  };
}

// Hook for checking if current route is accessible
export function useRouteAccess(guardProps: Omit<AuthGuardProps, 'children'>) {
  const { isAuthenticated, user, userType: currentUserType } = useAuth();

  const hasAccess = React.useMemo(() => {
    const { userType, adminType, userTypes, requireAuth = true } = guardProps;

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      return false;
    }

    // If user is authenticated, check permissions
    if (isAuthenticated && user && currentUserType) {
      // Check user type requirement
      if (userType && currentUserType !== userType) {
        return false;
      }

      // Check admin type requirement
      if (adminType && currentUserType === 'admin') {
        const adminUser = user as AdminUser;
        if (adminUser.adminType > adminType) {
          return false;
        }
      }

      // Check user type array requirement
      if (userTypes && currentUserType === 'user') {
        const regularUser = user as RegularUser;
        if (!userTypes.includes(regularUser.userType)) {
          return false;
        }
      }
    }

    return true;
  }, [isAuthenticated, user, currentUserType, guardProps]);

  return hasAccess;
} 