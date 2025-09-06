'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Pagination from '@mui/material/Pagination';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import IdeomniLoading from '@ideomni/core/IdeomniLoading';
import { useGetAvailableTeamsQuery, useJoinTeamMutation } from '../TeamApi';
import { useGetCurrentUserTeamAccountQuery } from '../TeamAccountApi';

/**
 * Browse Teams Component - Minimalist Business Design
 */
function BrowseTeams() {
  const { t } = useTranslation();
  const router = useRouter();
  const [page, setPage] = useState(1);
  
  const pageSize = 12;
  
  const { 
    data: teamsResponse, 
    isLoading, 
    error 
  } = useGetAvailableTeamsQuery({ page, pageSize });
  
  const [joinTeam, { isLoading: isJoining }] = useJoinTeamMutation();
  
  // Check if user already belongs to a team
  const { data: currentTeamAccount } = useGetCurrentUserTeamAccountQuery();

  const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.3 } }
  };

  const handleJoinTeam = async (teamId: string) => {
    try {
      await joinTeam(teamId).unwrap();
      router.push('/team-management/dashboard');
    } catch (err) {
      console.error('Failed to join team:', err);
    }
  };

  if (isLoading) {
    return <IdeomniLoading />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Header */}
          <div>
            <Typography variant="h4" className="font-light text-gray-900 dark:text-white mb-2">
              {t('teamManagement.BROWSE_TEAMS')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('teamManagement.DISCOVER_JOIN_TEAMS')}
            </Typography>
          </div>

          {/* Results Count */}
          {teamsResponse && (
            <Typography variant="body2" color="text.secondary">
              {t('teamManagement.FOUND_TEAMS')} {teamsResponse.total} {t('teamManagement.TEAMS')}
            </Typography>
          )}

          {/* Teams Grid */}
          {error ? (
            <Paper className="p-16 text-center border border-gray-100 dark:border-gray-800 shadow-none">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center justify-center">
                <IdeomniSvgIcon size={24} className="text-red-500 dark:text-red-400">
                  heroicons-outline:exclamation-triangle
                </IdeomniSvgIcon>
              </div>
              <Typography variant="h6" className="font-medium mb-3 text-gray-900 dark:text-white">
                {t('teamManagement.FAILED_TO_LOAD_TEAMS')}
              </Typography>
              <Typography color="text.secondary">
                {t('teamManagement.FAILED_TO_LOAD_TEAMS_MESSAGE')}
              </Typography>
            </Paper>
          ) : teamsResponse?.data?.length === 0 ? (
            <Paper className="p-16 text-center border border-gray-100 dark:border-gray-800 shadow-none">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                <IdeomniSvgIcon size={24} className="text-gray-400 dark:text-gray-500">
                  heroicons-outline:user-group
                </IdeomniSvgIcon>
              </div>
              <Typography variant="h6" className="font-medium mb-3 text-gray-900 dark:text-white">
                {t('teamManagement.NO_TEAMS_FOUND')}
              </Typography>
              <Typography color="text.secondary" className="mb-8 max-w-md mx-auto">
                {t('teamManagement.NO_TEAMS_AVAILABLE')}
              </Typography>
              {!currentTeamAccount && (
                <Button
                  variant="outlined"
                  onClick={() => router.push('/team-management/dashboard')}
                  className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white"
                  startIcon={<IdeomniSvgIcon>heroicons-outline:plus</IdeomniSvgIcon>}
                >
                  {t('teamManagement.CREATE_NEW_TEAM_BUTTON')}
                </Button>
              )}
            </Paper>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamsResponse?.data?.map((team) => (
                <Paper key={team.id} className="p-6 border border-gray-100 dark:border-gray-800 shadow-none hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                  <div className="flex flex-col h-full">
                    {/* Team Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <Typography variant="h6" className="font-medium mb-2 text-gray-900 dark:text-white">
                          {team.name}
                        </Typography>
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${team.isOpen ? 'bg-green-400' : 'bg-gray-400'}`} />
                          <Typography variant="body2" color="text.secondary">
                            {team.currentMembers}/{team.maxMembers} {t('teamManagement.MEMBERS')}
                          </Typography>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {team.description && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        className="mb-4 flex-1 leading-relaxed"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {team.description}
                      </Typography>
                    )}

                    {/* Team Leader */}
                    <div className="mb-4">
                      <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-medium">
                        {t('teamManagement.TEAM_LEADER')}
                      </Typography>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center text-sm font-medium">
                          {team.leader.firstName && team.leader.lastName
                            ? `${team.leader.firstName[0]}${team.leader.lastName[0]}`
                            : team.leader.username[0].toUpperCase()}
                        </div>
                        <Typography variant="body2" className="font-medium text-gray-900 dark:text-white">
                          {team.leader.firstName && team.leader.lastName
                            ? `${team.leader.firstName} ${team.leader.lastName}`
                            : team.leader.username}
                        </Typography>
                      </div>
                    </div>

                    {/* Created Date */}
                    <Typography variant="caption" color="text.secondary" className="mb-6">
                      {t('teamManagement.CREATED')} {new Date(team.createdAt).toLocaleDateString()}
                    </Typography>

                    {/* Actions */}
                    <div className="flex gap-3 mt-auto">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => router.push(`/team-management/teams/${team.id}`)}
                        className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white flex-1"
                        startIcon={<IdeomniSvgIcon>heroicons-outline:eye</IdeomniSvgIcon>}
                      >
                        {t('teamManagement.VIEW_DETAILS')}
                      </Button>
                      {team.isOpen && team.currentMembers < team.maxMembers && !currentTeamAccount && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleJoinTeam(team.id)}
                          disabled={isJoining}
                          className="border-gray-900 dark:border-white text-gray-900 dark:text-white hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900"
                          startIcon={<IdeomniSvgIcon>heroicons-outline:plus</IdeomniSvgIcon>}
                        >
                          {t('teamManagement.JOIN')}
                        </Button>
                      )}
                    </div>
                  </div>
                </Paper>
              ))}
            </div>
          )}

          {/* Pagination */}
          {teamsResponse && teamsResponse.totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                count={teamsResponse.totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
              />
            </div>
          )}

          {/* Create Team CTA - Only show if user doesn't have a team */}
          {!currentTeamAccount && (
            <Paper className="p-8 text-center border border-gray-100 dark:border-gray-800 shadow-none">
              <Typography variant="h6" className="font-medium mb-3 text-gray-900 dark:text-white">
                {t('teamManagement.CANT_FIND_RIGHT_TEAM')}
              </Typography>
              <Typography color="text.secondary" className="mb-6 max-w-md mx-auto">
                {t('teamManagement.CREATE_OWN_TEAM_MESSAGE')}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => router.push('/team-management/dashboard')}
                className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white"
                startIcon={<IdeomniSvgIcon>heroicons-outline:plus</IdeomniSvgIcon>}
              >
                {t('teamManagement.CREATE_NEW_TEAM_BUTTON')}
              </Button>
            </Paper>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default BrowseTeams;