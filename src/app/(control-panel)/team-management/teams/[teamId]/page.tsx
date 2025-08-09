import TeamDetailsView from './TeamDetailsView';

interface TeamDetailsPageProps {
  params: Promise<{
    teamId: string;
  }>;
}

/**
 * Team Details Page (User View)
 */
async function TeamDetailsPage({ params }: TeamDetailsPageProps) {
  const { teamId } = await params;
  return <TeamDetailsView teamId={teamId} />;
}

export default TeamDetailsPage;