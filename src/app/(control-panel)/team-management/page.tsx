import { redirect } from 'next/navigation';

/**
 * Team Management Root Page
 * Redirects to dashboard
 */
function TeamManagementPage() {
  redirect('/team-management/dashboard');
}

export default TeamManagementPage;