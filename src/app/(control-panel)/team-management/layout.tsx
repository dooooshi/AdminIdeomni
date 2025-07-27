import { ReactNode } from 'react';
import { UserGuard } from 'src/lib/auth';

interface TeamManagementLayoutProps {
  children: ReactNode;
}

/**
 * Team Management Layout
 * Protected for Students only (userType: 3)
 * Managers and Workers are restricted from accessing team management pages
 */
function TeamManagementLayout({ children }: TeamManagementLayoutProps) {
  return (
    <UserGuard userTypes={[3]}>
      <div className="flex flex-col flex-1 relative overflow-hidden">
        {children}
      </div>
    </UserGuard>
  );
}

export default TeamManagementLayout;