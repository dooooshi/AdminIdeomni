'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import IdeomniLoading from '@ideomni/core/IdeomniLoading';
import { useGetCurrentTeamQuery } from '../TeamApi';
import CreateTeamModal from './CreateTeamModal';
import TeamAccountCard from './TeamAccountCard';
import TeamAccountService from '@/lib/services/teamAccountService';

/**
 * Team Dashboard Component - Minimalist Business Design
 */
function TeamDashboard() {
  const { t, i18n } = useTranslation();
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
    refetch();
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.3 } }
  };

  if (isLoading) {
    return <IdeomniLoading />;
  }

  // User has no team
  if (error || !team) {
    return (
      <>
        <div className="min-h-screen bg-white dark:bg-zinc-900">
          <div className="max-w-2xl mx-auto px-6 py-16">
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="show"
              className="space-y-12"
            >
              <div className="text-center">
                <Typography variant="h4" className="font-light text-gray-900 dark:text-white mb-3">
                  {t('teamManagement.TEAM_DASHBOARD')}
                </Typography>
                <Typography variant="body1" color="text.secondary" className="max-w-md mx-auto">
                  {t('teamManagement.MANAGE_TEAM_COLLABORATION')}
                </Typography>
              </div>

              <Paper className="p-16 text-center border border-gray-100 dark:border-gray-800 shadow-none bg-gray-50/50 dark:bg-gray-800/50">
                <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                  <IdeomniSvgIcon size={32} className="text-gray-400 dark:text-gray-500">
                    heroicons-outline:user-group
                  </IdeomniSvgIcon>
                </div>
                <Typography variant="h5" className="font-medium mb-4 text-gray-900 dark:text-white">
                  {t('teamManagement.NOT_IN_TEAM_YET')}
                </Typography>
                <Typography variant="body1" color="text.secondary" className="mb-12 max-w-sm mx-auto leading-relaxed">
                  {t('teamManagement.JOIN_OR_CREATE_TEAM')}
                </Typography>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => router.push('/team-management/browse')}
                    className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-none font-medium px-8 py-3"
                  >
                    {t('teamManagement.BROWSE_TEAMS_BUTTON')}
                  </Button>
                  <Button
                    variant="text"
                    size="large"
                    onClick={handleOpenCreateModal}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 font-medium px-8 py-3"
                  >
                    {t('teamManagement.CREATE_TEAM_BUTTON')}
                  </Button>
                </div>
              </Paper>
            </motion.div>
          </div>
        </div>

        <CreateTeamModal
          open={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          onSuccess={handleTeamCreateSuccess}
        />
      </>
    );
  }

  // User has a team
  const isLeader = team.leader.id === team.members.find(m => m.status === 'ACTIVE')?.user.id;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="show"
          className="space-y-12"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <Typography variant="h3" className="font-light text-gray-900 dark:text-white mb-2">
                {team.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {team.description || t('teamManagement.TEAM_DASHBOARD_FALLBACK')}
              </Typography>
            </div>
            {isLeader && (
              <Button
                variant="text"
                onClick={() => router.push('/team-management/settings')}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                endIcon={<IdeomniSvgIcon size={18}>heroicons-outline:cog</IdeomniSvgIcon>}
              >
                {t('teamManagement.SETTINGS')}
              </Button>
            )}
          </div>

          {/* Overview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Team Information */}
            <Paper className="lg:col-span-1 p-8 border border-gray-100 dark:border-gray-800 shadow-none">
              <div className="flex items-center justify-between mb-8">
                <Typography variant="h6" className="font-medium text-gray-900 dark:text-white">
                  {t('common.OVERVIEW')}
                </Typography>
                <div className={`w-3 h-3 rounded-full ${team.isOpen ? 'bg-green-400' : 'bg-amber-400'}`} />
              </div>
              
              <div className="space-y-6">
                <div>
                  <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-medium">
                    {t('teamManagement.LEADER')}
                  </Typography>
                  <Typography variant="body2" className="font-medium text-gray-900 dark:text-white mt-2">
                    {team.leader.firstName && team.leader.lastName
                      ? `${team.leader.firstName} ${team.leader.lastName}`
                      : team.leader.username}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-medium">
                    {t('teamManagement.MEMBERS')}
                  </Typography>
                  <Typography variant="body2" className="font-medium text-gray-900 dark:text-white mt-2">
                    {team.members.filter(m => m.status === 'ACTIVE').length} {t('common.of')} {team.maxMembers}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-medium">
                    {t('teamManagement.CREATED')}
                  </Typography>
                  <Typography variant="body2" className="font-medium text-gray-900 dark:text-white mt-2">
                    {TeamAccountService.formatDate(team.createdAt, i18n.language)}
                  </Typography>
                </div>
              </div>
            </Paper>

            {/* Team Account Resources */}
            <div className="lg:col-span-3">
              <TeamAccountCard 
                compact={false}
                showTeamInfo={false}
                className="h-full"
              />
            </div>
          </div>

          {/* Team Members */}
          <Paper className="border border-gray-100 dark:border-gray-800 shadow-none">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <Typography variant="h6" className="font-medium text-gray-900 dark:text-white">
                  {t('teamManagement.TEAM_MEMBERS')}
                </Typography>
              </div>
              
              <div className="space-y-2">
                {team.members
                  .filter(member => member.status === 'ACTIVE')
                  .map((member, index) => (
                    <div key={member.id} className={`flex items-center justify-between py-4 ${index !== team.members.filter(m => m.status === 'ACTIVE').length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center text-sm font-medium">
                          {member.user.firstName && member.user.lastName
                            ? `${member.user.firstName[0]}${member.user.lastName[0]}`
                            : member.user.username[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
                              {member.user.firstName && member.user.lastName
                                ? `${member.user.firstName} ${member.user.lastName}`
                                : member.user.username}
                            </Typography>
                            {member.user.id === team.leader.id && (
                              <div className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs font-medium text-blue-700 dark:text-blue-300">
                                {t('teamManagement.LEADER')}
                              </div>
                            )}
                          </div>
                          <Typography variant="body2" color="text.secondary" className="mt-1">
                            {member.user.email}
                          </Typography>
                        </div>
                      </div>
                      <Typography variant="body2" color="text.secondary">
                        {t('teamManagement.JOINED')} {TeamAccountService.formatDate(member.joinedAt, i18n.language)}
                      </Typography>
                    </div>
                  ))}
              </div>
            </div>
          </Paper>

          {/* Actions */}
          <div>
            <Typography variant="h6" className="font-medium text-gray-900 dark:text-white mb-6">
              {t('teamManagement.ACTIONS')}
            </Typography>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outlined"
                onClick={() => router.push('/team-management/transfers')}
                className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white justify-start p-6 h-auto"
              >
                <div className="text-left">
                  <div className="font-medium">{t('teamManagement.TRANSFER_RESOURCES')}</div>
                  <div className="text-sm opacity-70 mt-1">{t('teamManagement.SEND_RESOURCES_TO_MEMBERS')}</div>
                </div>
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push('/team-management/history')}
                className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white justify-start p-6 h-auto"
              >
                <div className="text-left">
                  <div className="font-medium">{t('teamManagement.VIEW_HISTORY')}</div>
                  <div className="text-sm opacity-70 mt-1">{t('teamManagement.REVIEW_TEAM_TRANSACTIONS')}</div>
                </div>
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push('/team-management/transfers/gold')}
                className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white justify-start p-6 h-auto"
              >
                <div className="text-left">
                  <div className="font-medium">{t('teamManagement.SEND_GOLD')}</div>
                  <div className="text-sm opacity-70 mt-1">{t('teamManagement.TRANSFER_GOLD_RESOURCES')}</div>
                </div>
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push('/team-management/transfers/carbon')}
                className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white justify-start p-6 h-auto"
              >
                <div className="text-left">
                  <div className="font-medium">{t('teamManagement.SEND_CARBON')}</div>
                  <div className="text-sm opacity-70 mt-1">{t('teamManagement.TRANSFER_CARBON_CREDITS')}</div>
                </div>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      <CreateTeamModal
        open={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleTeamCreateSuccess}
      />
    </div>
  );
}

export default TeamDashboard;