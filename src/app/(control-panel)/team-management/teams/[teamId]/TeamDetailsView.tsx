'use client';

import { motion } from 'motion/react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import IdeomniLoading from '@ideomni/core/IdeomniLoading';
import { useGetTeamDetailsQuery, useJoinTeamMutation } from '../../TeamApi';
import { useGetCurrentUserTeamAccountQuery } from '../../TeamAccountApi';

interface TeamDetailsViewProps {
  teamId: string;
}

/**
 * Team Details View Component (User View)
 */
function TeamDetailsView({ teamId }: TeamDetailsViewProps) {
  const { t } = useTranslation();
  const router = useRouter();
  
  const { data: team, isLoading, error } = useGetTeamDetailsQuery(teamId);
  const [joinTeam, { isLoading: isJoining }] = useJoinTeamMutation();
  
  // Check if user already belongs to a team
  const { data: currentTeamAccount } = useGetCurrentUserTeamAccountQuery();

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
          {t('teamManagement.TEAM_NOT_FOUND')}
        </Typography>
        <Button
          onClick={() => router.push('/team-management/browse')}
          startIcon={<IdeomniSvgIcon>heroicons-outline:arrow-left</IdeomniSvgIcon>}
        >
          {t('teamManagement.BACK_TO_BROWSE')}
        </Button>
      </div>
    );
  }

  const activeMembers = team.members.filter(m => m.status === 'ACTIVE');
  const canJoin = team.isOpen && activeMembers.length < team.maxMembers && !currentTeamAccount;

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
                  {t('teamManagement.BACK_TO_BROWSE')}
                </Button>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <Typography variant="h3" className="font-semibold">
                  {team.name}
                </Typography>
                <Chip
                  label={team.isOpen ? t('teamManagement.OPEN') : t('teamManagement.CLOSED')}
                  color={team.isOpen ? 'success' : 'default'}
                  variant="outlined"
                />
                {activeMembers.length >= team.maxMembers && (
                  <Chip
                    label={t('teamManagement.FULL')}
                    color="error"
                    variant="outlined"
                  />
                )}
              </div>
              <Typography color="text.secondary" variant="h6">
                {team.description || t('common.NO_DESCRIPTION')}
              </Typography>
            </div>
            
            {canJoin && !currentTeamAccount && (
              <Button
                variant="contained"
                size="large"
                onClick={handleJoinTeam}
                disabled={isJoining}
                startIcon={<IdeomniSvgIcon>heroicons-outline:plus</IdeomniSvgIcon>}
              >
                {isJoining ? t('teamManagement.JOINING') : t('teamManagement.JOIN_TEAM')}
              </Button>
            )}
          </motion.div>

          {/* Team Stats */}
          <motion.div variants={item}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper className="p-6 text-center">
                  <IdeomniSvgIcon size={48} className="text-blue-500 mx-auto mb-2">
                    heroicons-outline:users
                  </IdeomniSvgIcon>
                  <Typography variant="h4" className="font-bold text-blue-600">
                    {activeMembers.length}
                  </Typography>
                  <Typography color="text.secondary">
                    {t('teamManagement.CURRENT_MEMBERS')}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper className="p-6 text-center">
                  <IdeomniSvgIcon size={48} className="text-green-500 mx-auto mb-2">
                    heroicons-outline:user-group
                  </IdeomniSvgIcon>
                  <Typography variant="h4" className="font-bold text-green-600">
                    {team.maxMembers}
                  </Typography>
                  <Typography color="text.secondary">
                    {t('teamManagement.MAX_CAPACITY')}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper className="p-6 text-center">
                  <IdeomniSvgIcon size={48} className="text-purple-500 mx-auto mb-2">
                    heroicons-outline:chart-bar
                  </IdeomniSvgIcon>
                  <Typography variant="h4" className="font-bold text-purple-600">
                    {team.maxMembers - activeMembers.length}
                  </Typography>
                  <Typography color="text.secondary">
                    {t('teamManagement.AVAILABLE_SPOTS')}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper className="p-6 text-center">
                  <IdeomniSvgIcon size={48} className="text-orange-500 mx-auto mb-2">
                    heroicons-outline:calendar
                  </IdeomniSvgIcon>
                  <Typography variant="h4" className="font-bold text-orange-600">
                    {new Date(team.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography color="text.secondary">
                    {t('teamManagement.CREATED')}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </motion.div>

          {/* {t('teamManagement.TEAM_LEADER_LABEL')} */}
          <motion.div variants={item}>
            <Paper className="p-6">
              <Typography variant="h6" className="mb-4">
                {t('teamManagement.TEAM_LEADER')}
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
                      {t('teamManagement.TEAM_LEADER_LABEL')}
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
                {t('teamManagement.TEAM_MEMBERS_COUNT', { current: activeMembers.length, max: team.maxMembers })}
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
                        {t('teamManagement.JOINED_DATE', { date: new Date(member.joinedAt).toLocaleDateString() })}
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
                      {t('teamManagement.AVAILABLE_SPOT')}
                    </Typography>
                  </div>
                ))}
              </div>
            </Paper>
          </motion.div>

          {/* Join Team CTA - Only show if user doesn't have a team */}
          {canJoin && !currentTeamAccount && (
            <motion.div variants={item}>
              <Paper className="p-6 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 text-center">
                <IdeomniSvgIcon size={48} className="text-primary-600 mx-auto mb-3">
                  heroicons-outline:user-plus
                </IdeomniSvgIcon>
                <Typography variant="h6" className="mb-2">
                  {t('teamManagement.READY_TO_JOIN')}
                </Typography>
                <Typography color="text.secondary" className="mb-4">
                  {t('teamManagement.CLICK_TO_JOIN_MESSAGE', { teamName: team.name })}
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleJoinTeam}
                  disabled={isJoining}
                  startIcon={<IdeomniSvgIcon>heroicons-outline:plus</IdeomniSvgIcon>}
                >
                  {isJoining ? t('teamManagement.JOINING_TEAM') : t('teamManagement.JOIN_THIS_TEAM')}
                </Button>
              </Paper>
            </motion.div>
          )}

          {/* Team Not Available or User Already Has Team */}
          {(!canJoin || currentTeamAccount) && (
            <motion.div variants={item}>
              <Paper className="p-6 bg-gray-50 dark:bg-gray-800 text-center">
                <IdeomniSvgIcon size={48} className="text-gray-400 mx-auto mb-3">
                  {currentTeamAccount 
                    ? 'heroicons-outline:check-circle' 
                    : team.isOpen 
                    ? 'heroicons-outline:users' 
                    : 'heroicons-outline:lock-closed'}
                </IdeomniSvgIcon>
                <Typography variant="h6" className="mb-2">
                  {currentTeamAccount 
                    ? t('teamManagement.ALREADY_IN_TEAM')
                    : team.isOpen 
                    ? t('teamManagement.TEAM_IS_FULL') 
                    : t('teamManagement.TEAM_IS_CLOSED')}
                </Typography>
                <Typography color="text.secondary" className="mb-4">
                  {currentTeamAccount
                    ? t('teamManagement.ALREADY_IN_TEAM_MESSAGE')
                    : team.isOpen 
                    ? t('teamManagement.TEAM_FULL_MESSAGE')
                    : t('teamManagement.TEAM_CLOSED_MESSAGE')
                  }
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => router.push(currentTeamAccount ? '/team-management/dashboard' : '/team-management/browse')}
                  startIcon={<IdeomniSvgIcon>
                    {currentTeamAccount ? 'heroicons-outline:home' : 'heroicons-outline:search'}
                  </IdeomniSvgIcon>}
                >
                  {currentTeamAccount ? t('teamManagement.GO_TO_YOUR_TEAM') : t('teamManagement.BROWSE_OTHER_TEAMS')}
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