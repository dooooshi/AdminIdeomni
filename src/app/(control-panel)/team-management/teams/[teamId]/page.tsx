import TeamDetailsView from './TeamDetailsView';

interface TeamDetailsPageProps {
  params: {
    teamId: string;
  };
}

/**
 * Team Details Page (User View)
 */
function TeamDetailsPage({ params }: TeamDetailsPageProps) {
  return <TeamDetailsView teamId={params.teamId} />;
}

export default TeamDetailsPage;