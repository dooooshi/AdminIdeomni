'use client';

import { motion } from 'motion/react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import { useRouter } from 'next/navigation';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import IdeomniLoading from '@ideomni/core/IdeomniLoading';
import { useGetTeamDetailsQuery, useJoinTeamMutation } from '../../TeamApi';

interface TeamDetailsViewProps {
  teamId: string;
}

/**
 * Team Details View Component (User View)
 */
function TeamDetailsView({ teamId }: TeamDetailsViewProps) {
  const router = useRouter();
  
  const { data: team, isLoading, error } = useGetTeamDetailsQuery(teamId);
  const [joinTeam, { isLoading: isJoining }] = useJoinTeamMutation();

  const container = {
    show: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return <IdeomniLoading />;
  }

  if (error || !team) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-8">
        <Typography variant="h6" className="mb-4">
          Team not found
        </Typography>
        <Button
          onClick={() => router.push('/team-management/browse')}
          startIcon={<IdeomniSvgIcon>heroicons-outline:arrow-left</IdeomniSvgIcon>}
        >
          Back to Browse
        </Button>
      </div>
    );
  }

  const activeMembers = team.members.filter(m => m.status === 'ACTIVE');
  const canJoin = team.isOpen && activeMembers.length < team.maxMembers;

  const handleJoinTeam = async () => {
    try {
      await joinTeam(teamId).unwrap();
      router.push('/team-management/dashboard');
    } catch (err) {
      console.error('Failed to join team:', err);
    }
  };

  return (
    <div className="flex flex-col flex-1 relative overflow-hidden">
      <div className="flex flex-col flex-1 max-w-4xl w-full mx-auto px-6 py-8">
        <motion.div
          className="flex flex-col gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Header */}
          <motion.div variants={item} className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Button
                  variant="text"
                  onClick={() => router.push('/team-management/browse')}
                  startIcon={<IdeomniSvgIcon>heroicons-outline:arrow-left</IdeomniSvgIcon>}
                >
                  Back to Browse
                </Button>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <Typography variant="h3" className="font-semibold">
                  {team.name}
                </Typography>
                <Chip
                  label={team.isOpen ? 'Open' : 'Closed'}
                  color={team.isOpen ? 'success' : 'default'}
                  variant="outlined"
                />
                {activeMembers.length >= team.maxMembers && (
                  <Chip
                    label="Full"
                    color="error"
                    variant="outlined"
                  />
                )}
              </div>
              <Typography color="text.secondary" variant="h6">
                {team.description || 'No description provided'}
              </Typography>
            </div>
            
            {canJoin && (
              <Button
                variant="contained"
                size="large"
                onClick={handleJoinTeam}
                disabled={isJoining}
                startIcon={<IdeomniSvgIcon>heroicons-outline:plus</IdeomniSvgIcon>}
              >
                {isJoining ? 'Joining...' : 'Join Team'}
              </Button>
            )}
          </motion.div>

          {/* Team Stats */}
          <motion.div variants={item}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper className="p-6 text-center">
                  <IdeomniSvgIcon size={48} className="text-blue-500 mx-auto mb-2">
                    heroicons-outline:users
                  </IdeomniSvgIcon>
                  <Typography variant="h4" className="font-bold text-blue-600">
                    {activeMembers.length}
                  </Typography>
                  <Typography color="text.secondary">
                    Current Members
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Paper className="p-6 text-center">
                  <IdeomniSvgIcon size={48} className="text-green-500 mx-auto mb-2">
                    heroicons-outline:user-group
                  </IdeomniSvgIcon>
                  <Typography variant="h4" className="font-bold text-green-600">
                    {team.maxMembers}
                  </Typography>
                  <Typography color="text.secondary">
                    Max Capacity
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Paper className="p-6 text-center">
                  <IdeomniSvgIcon size={48} className="text-purple-500 mx-auto mb-2">
                    heroicons-outline:chart-bar
                  </IdeomniSvgIcon>
                  <Typography variant="h4" className="font-bold text-purple-600">
                    {team.maxMembers - activeMembers.length}
                  </Typography>
                  <Typography color="text.secondary">
                    Available Spots
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Paper className="p-6 text-center">
                  <IdeomniSvgIcon size={48} className="text-orange-500 mx-auto mb-2">
                    heroicons-outline:calendar
                  </IdeomniSvgIcon>
                  <Typography variant="h4" className="font-bold text-orange-600">
                    {new Date(team.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography color="text.secondary">
                    Created
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </motion.div>

          {/* Team Leader */}
          <motion.div variants={item}>
            <Paper className="p-6">
              <Typography variant="h6" className="mb-4">
                Team Leader
              </Typography>
              
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold text-xl">
                  {team.leader.firstName && team.leader.lastName
                    ? `${team.leader.firstName[0]}${team.leader.lastName[0]}`
                    : team.leader.username[0].toUpperCase()}
                </div>
                
                <div>
                  <Typography variant="h6" className="font-medium">
                    {team.leader.firstName && team.leader.lastName
                      ? `${team.leader.firstName} ${team.leader.lastName}`
                      : team.leader.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {team.leader.email}
                  </Typography>
                  <div className="flex items-center gap-1 mt-1">
                    <IdeomniSvgIcon size={16} className="text-primary-600">
                      heroicons-solid:star
                    </IdeomniSvgIcon>
                    <Typography variant="caption" className="text-primary-600 font-medium">
                      Team Leader
                    </Typography>
                  </div>
                </div>
              </div>
            </Paper>
          </motion.div>

          {/* Team Members */}
          <motion.div variants={item}>
            <Paper className="p-6">
              <Typography variant="h6" className="mb-4">
                Team Members ({activeMembers.length}/{team.maxMembers})
              </Typography>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeMembers.map((member) => (
                  <div 
                    key={member.id} 
                    className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold">
                      {member.user.firstName && member.user.lastName
                        ? `${member.user.firstName[0]}${member.user.lastName[0]}`
                        : member.user.username[0].toUpperCase()}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Typography variant="subtitle1" className="font-medium truncate">
                          {member.user.firstName && member.user.lastName
                            ? `${member.user.firstName} ${member.user.lastName}`
                            : member.user.username}
                        </Typography>
                        {member.user.id === team.leader.id && (
                          <IdeomniSvgIcon size={16} className="text-primary-600">
                            heroicons-solid:star
                          </IdeomniSvgIcon>
                        )}
                      </div>
                      <Typography variant="body2" color="text.secondary" className="truncate">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </Typography>
                    </div>
                  </div>
                ))}
                
                {/* Empty slots */}
                {Array.from({ length: team.maxMembers - activeMembers.length }).map((_, index) => (
                  <div 
                    key={`empty-${index}`}
                    className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <IdeomniSvgIcon className="text-gray-400">
                        heroicons-outline:plus
                      </IdeomniSvgIcon>
                    </div>
                    <Typography variant="body2" color="text.secondary">
                      Available spot
                    </Typography>
                  </div>
                ))}
              </div>
            </Paper>
          </motion.div>

          {/* Join Team CTA */}
          {canJoin && (
            <motion.div variants={item}>
              <Paper className="p-6 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 text-center">
                <IdeomniSvgIcon size={48} className="text-primary-600 mx-auto mb-3">
                  heroicons-outline:user-plus
                </IdeomniSvgIcon>
                <Typography variant="h6" className="mb-2">
                  Ready to join this team?
                </Typography>
                <Typography color="text.secondary" className="mb-4">
                  Click the button above to become a member of {team.name}
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleJoinTeam}
                  disabled={isJoining}
                  startIcon={<IdeomniSvgIcon>heroicons-outline:plus</IdeomniSvgIcon>}
                >
                  {isJoining ? 'Joining Team...' : 'Join This Team'}
                </Button>
              </Paper>
            </motion.div>
          )}

          {/* Team Not Available */}
          {!canJoin && (
            <motion.div variants={item}>
              <Paper className="p-6 bg-gray-50 dark:bg-gray-800 text-center">
                <IdeomniSvgIcon size={48} className="text-gray-400 mx-auto mb-3">
                  {team.isOpen ? 'heroicons-outline:users' : 'heroicons-outline:lock-closed'}
                </IdeomniSvgIcon>
                <Typography variant="h6" className="mb-2">
                  {team.isOpen ? 'Team is Full' : 'Team is Closed'}
                </Typography>
                <Typography color="text.secondary" className="mb-4">
                  {team.isOpen 
                    ? 'This team has reached its maximum capacity.'
                    : 'This team is not accepting new members at this time.'
                  }
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/team-management/browse')}
                  startIcon={<IdeomniSvgIcon>heroicons-outline:search</IdeomniSvgIcon>}
                >
                  Browse Other Teams
                </Button>
              </Paper>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default TeamDetailsView;