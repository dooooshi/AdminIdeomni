import { ReactNode } from 'react';
import { ManagerGuard } from 'src/lib/auth';

interface TeamAdministrationLayoutProps {
  children: ReactNode;
}

/**
 * Team Administration Layout
 * Protected for managers only (userType: 1)
 */
function TeamAdministrationLayout({ children }: TeamAdministrationLayoutProps) {
  return (
    <ManagerGuard>
      <div className="flex flex-col flex-1 relative overflow-hidden">
        {children}
      </div>
    </ManagerGuard>
  );
}

export default TeamAdministrationLayout;