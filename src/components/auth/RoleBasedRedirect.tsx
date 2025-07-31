'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import { getDefaultDashboardPath, getUserRoleDisplayName } from '@/lib/auth/redirects';

interface RoleBasedRedirectProps {
  fallbackPath?: string;
}

export default function RoleBasedRedirect({ fallbackPath = '/sign-in' }: RoleBasedRedirectProps) {
  const router = useRouter();
  const { isAuthenticated, userType, user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user || !userType) {
      router.replace(fallbackPath);
      return;
    }

    const redirectPath = getDefaultDashboardPath(userType, user);
    router.replace(redirectPath);
  }, [isAuthenticated, userType, user, isLoading, router, fallbackPath]);

  // Show loading state while determining redirect
  const userRole = getUserRoleDisplayName(userType, user);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Loading...' : `Redirecting ${userRole}...`}
        </p>
      </div>
    </div>
  );
}