import { ReactNode } from 'react';
import { UserGuard } from 'src/lib/auth';

interface TeamManagementLayoutProps {
  children: ReactNode;
}

/**
 * Team Management Layout
 * Protected for regular users (Manager, Worker, Student)
 */
function TeamManagementLayout({ children }: TeamManagementLayoutProps) {
  return (
    <UserGuard userTypes={[1, 2, 3]}>
      <div className="flex flex-col flex-1 relative overflow-hidden">
        {children}
      </div>
    </UserGuard>
  );
}

export default TeamManagementLayout;