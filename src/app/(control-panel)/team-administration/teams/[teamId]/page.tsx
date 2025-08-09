import TeamDetails from './TeamDetails';

interface TeamDetailsPageProps {
  params: Promise<{
    teamId: string;
  }>;
}

/**
 * Team Details Page
 */
async function TeamDetailsPage({ params }: TeamDetailsPageProps) {
  const { teamId } = await params;
  return <TeamDetails teamId={teamId} />;
}

export default TeamDetailsPage;