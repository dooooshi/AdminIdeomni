import TeamDetails from './TeamDetails';

interface TeamDetailsPageProps {
  params: {
    teamId: string;
  };
}

/**
 * Team Details Page
 */
function TeamDetailsPage({ params }: TeamDetailsPageProps) {
  return <TeamDetails teamId={params.teamId} />;
}

export default TeamDetailsPage;