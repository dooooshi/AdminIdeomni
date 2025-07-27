'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import IdeomniLoading from '@ideomni/core/IdeomniLoading';
import { useGetCurrentTeamQuery } from '../TeamApi';
import CreateTeamModal from './CreateTeamModal';

/**
 * Team Dashboard Component
 */
function TeamDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: team, isLoading, error, refetch } = useGetCurrentTeamQuery();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleTeamCreateSuccess = () => {
    refetch(); // Refresh team data after successful creation
  };

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

  // User has no team
  if (error || !team) {
    return (
      <div className="flex flex-col flex-1 relative overflow-hidden">
        <div className="flex flex-col flex-1 max-w-2xl w-full mx-auto px-6 py-8">
          <motion.div
            className="flex flex-col gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {/* Header */}
            <motion.div variants={item}>
              <Typography variant="h3" className="font-semibold">
                {t('teamManagement:TEAM_DASHBOARD')}
              </Typography>
              <Typography color="text.secondary" className="mt-2">
                {t('teamManagement:MANAGE_TEAM_COLLABORATION')}
              </Typography>
            </motion.div>

            {/* No Team Card */}
            <motion.div variants={item}>
              <Paper className="p-8 text-center">
                <IdeomniSvgIcon size={64} className="text-gray-400 mx-auto mb-4">
                  heroicons-outline:user-group
                </IdeomniSvgIcon>
                <Typography variant="h5" className="mb-2">
                  {t('teamManagement:NOT_IN_TEAM_YET')}
                </Typography>
                <Typography color="text.secondary" className="mb-6">
                  {t('teamManagement:JOIN_OR_CREATE_TEAM')}
                </Typography>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="contained"
                    onClick={() => router.push('/team-management/browse')}
                    startIcon={<IdeomniSvgIcon>heroicons-outline:search</IdeomniSvgIcon>}
                  >
                    {t('teamManagement:BROWSE_TEAMS_BUTTON')}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleOpenCreateModal}
                    startIcon={<IdeomniSvgIcon>heroicons-outline:plus</IdeomniSvgIcon>}
                  >
                    {t('teamManagement:CREATE_TEAM_BUTTON')}
                  </Button>
                </div>
              </Paper>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // User has a team
  const isLeader = team.leader.id === team.members.find(m => m.status === 'ACTIVE')?.user.id;

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
          <motion.div variants={item} className="flex items-center justify-between">
            <div>
              <Typography variant="h3" className="font-semibold">
                {team.name}
              </Typography>
              <Typography color="text.secondary" className="mt-1">
                {team.description || t('teamManagement:TEAM_DASHBOARD_FALLBACK')}
              </Typography>
            </div>
            <div className="flex gap-2">
              <Button
                variant="contained"
                onClick={handleOpenCreateModal}
                startIcon={<IdeomniSvgIcon>heroicons-outline:plus</IdeomniSvgIcon>}
              >
                {t('teamManagement:CREATE_TEAM_BUTTON')}
              </Button>
              {isLeader && (
                <Button
                  variant="outlined"
                  onClick={() => router.push('/team-management/settings')}
                  startIcon={<IdeomniSvgIcon>heroicons-outline:cog</IdeomniSvgIcon>}
                >
                  {t('teamManagement:SETTINGS')}
                </Button>
              )}
            </div>
          </motion.div>

          {/* Team Info Card */}
          <motion.div variants={item}>
            <Paper className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Typography variant="h6">{t('teamManagement:TEAM_INFORMATION')}</Typography>
                <div className="flex items-center gap-2">
                  <IdeomniSvgIcon size={20} className="text-green-500">
                    heroicons-solid:check-circle
                  </IdeomniSvgIcon>
                  <Typography color="text.secondary" variant="body2">
                    {team.isOpen ? t('teamManagement:OPEN_TO_NEW_MEMBERS') : t('teamManagement:CLOSED_TEAM')}
                  </Typography>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('teamManagement:TEAM_LEADER')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {team.leader.firstName && team.leader.lastName
                      ? `${team.leader.firstName} ${team.leader.lastName}`
                      : team.leader.username}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('teamManagement:MEMBERS')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {team.members.filter(m => m.status === 'ACTIVE').length} / {team.maxMembers}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('teamManagement:CREATED')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {new Date(team.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </div>
            </Paper>
          </motion.div>

          {/* Team Members */}
          <motion.div variants={item}>
            <Paper className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Typography variant="h6">{t('teamManagement:TEAM_MEMBERS')}</Typography>
                {isLeader && (
                  <Button
                    size="small"
                    onClick={() => {/* TODO: Open invite dialog */}}
                    startIcon={<IdeomniSvgIcon>heroicons-outline:plus</IdeomniSvgIcon>}
                  >
                    {t('teamManagement:INVITE_MEMBERS')}
                  </Button>
                )}
              </div>
              
              <div className="space-y-3">
                {team.members
                  .filter(member => member.status === 'ACTIVE')
                  .map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold">
                          {member.user.firstName && member.user.lastName
                            ? `${member.user.firstName[0]}${member.user.lastName[0]}`
                            : member.user.username[0].toUpperCase()}
                        </div>
                        <div>
                          <Typography variant="body1" className="font-medium">
                            {member.user.firstName && member.user.lastName
                              ? `${member.user.firstName} ${member.user.lastName}`
                              : member.user.username}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {member.user.email}
                          </Typography>
                        </div>
                        {member.user.id === team.leader.id && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900 rounded-full">
                            <IdeomniSvgIcon size={14} className="text-primary-600">
                              heroicons-solid:star
                            </IdeomniSvgIcon>
                            <Typography variant="caption" className="text-primary-600 font-medium">
                              {t('teamManagement:LEADER')}
                            </Typography>
                          </div>
                        )}
                      </div>
                      <Typography variant="body2" color="text.secondary">
                        {t('teamManagement:JOINED')} {new Date(member.joinedAt).toLocaleDateString()}
                      </Typography>
                    </div>
                  ))}
              </div>
            </Paper>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={item}>
            <Paper className="p-6">
              <Typography variant="h6" className="mb-4">
                {t('teamManagement:QUICK_ACTIONS')}
              </Typography>
              <div className="flex gap-3 flex-wrap">
                <Button
                  variant="outlined"
                  onClick={() => router.push('/team-management/browse')}
                  startIcon={<IdeomniSvgIcon>heroicons-outline:search</IdeomniSvgIcon>}
                >
                  {t('teamManagement:BROWSE_OTHER_TEAMS')}
                </Button>
              </div>
            </Paper>
          </motion.div>
        </motion.div>
      </div>

      {/* Create Team Modal */}
      <CreateTeamModal
        open={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleTeamCreateSuccess}
      />
    </div>
  );
}

export default TeamDashboard;