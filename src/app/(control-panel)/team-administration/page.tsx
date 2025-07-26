import { redirect } from 'next/navigation';

/**
 * Team Administration Root Page
 * Redirects to overview
 */
function TeamAdministrationPage() {
  redirect('/team-administration/overview');
}

export default TeamAdministrationPage;