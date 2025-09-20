'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/GridLegacy';
import Box from '@mui/material/Box';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import IdeomniLoading from '@ideomni/core/IdeomniLoading';
import managerTeamApiService from '../ManagerTeamApi';
import { TeamStatistics, TeamListItem, PaginatedResponse } from 'src/types/team';

/**
 * Team Administration Overview Component
 */
function TeamAdministrationOverview() {
  const router = useRouter();
  const { t } = useTranslation();
  
  const [statistics, setStatistics] = useState<TeamStatistics | null>(null);
  const [teamsResponse, setTeamsResponse] = useState<PaginatedResponse<TeamListItem> | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [teamsLoading, setTeamsLoading] = useState(true);

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

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      setStatsLoading(true);
      const response = await managerTeamApiService.getTeamStatistics();
      setStatistics(response);
    } catch (err: any) {
      console.error('Failed to fetch statistics:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch recent teams
  const fetchRecentTeams = async () => {
    try {
      setTeamsLoading(true);
      const response = await managerTeamApiService.getAllTeams({ page: 1, pageSize: 5 });
      console.log('Overview teams API response:', response); // Debug log
      setTeamsResponse(response);
    } catch (err: any) {
      console.error('Failed to fetch recent teams:', err);
      // Set empty response to prevent undefined access
      setTeamsResponse({ data: [], total: 0, page: 1, pageSize: 5, totalPages: 0, hasNext: false, hasPrevious: false });
    } finally {
      setTeamsLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchStatistics();
    fetchRecentTeams();
  }, []);

  if (statsLoading && teamsLoading) {
    return <IdeomniLoading />;
  }

  return (
    <div className="flex flex-col flex-1 relative overflow-hidden">
      <div className="flex flex-col flex-1 max-w-6xl w-full mx-auto px-6 py-8">
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
                {t('teamAdministration:TEAM_ADMINISTRATION')}
              </Typography>
              <Typography color="text.secondary" className="mt-2">
                {t('teamAdministration:TEAMS_OVERVIEW')}
              </Typography>
            </div>
            <Button
              variant="contained"
              onClick={() => router.push('/team-administration/teams')}
              startIcon={<IdeomniSvgIcon>heroicons-outline:user-group</IdeomniSvgIcon>}
            >
              {t('teamAdministration:MANAGE_TEAMS')}
            </Button>
          </motion.div>

          {/* Statistics Cards */}
          {statistics && (
            <motion.div variants={item}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper className="p-6 text-center">
                    <IdeomniSvgIcon size={48} className="text-blue-500 mx-auto mb-2">
                      heroicons-outline:user-group
                    </IdeomniSvgIcon>
                    <Typography variant="h4" className="font-bold text-blue-600">
                      {statistics.totalTeams}
                    </Typography>
                    <Typography color="text.secondary">
                      {t('teamAdministration:TOTAL_TEAMS')}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper className="p-6 text-center">
                    <IdeomniSvgIcon size={48} className="text-green-500 mx-auto mb-2">
                      heroicons-outline:users
                    </IdeomniSvgIcon>
                    <Typography variant="h4" className="font-bold text-green-600">
                      {statistics.totalMembers}
                    </Typography>
                    <Typography color="text.secondary">
                      {t('teamAdministration:TOTAL_MEMBERS')}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper className="p-6 text-center">
                    <IdeomniSvgIcon size={48} className="text-purple-500 mx-auto mb-2">
                      heroicons-outline:chart-bar
                    </IdeomniSvgIcon>
                    <Typography variant="h4" className="font-bold text-purple-600">
                      {statistics.averageTeamSize?.toFixed(1)}
                    </Typography>
                    <Typography color="text.secondary">
                      {t('teamAdministration:MEMBER_DISTRIBUTION')}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper className="p-6 text-center">
                    <IdeomniSvgIcon size={48} className="text-orange-500 mx-auto mb-2">
                      heroicons-outline:plus-circle
                    </IdeomniSvgIcon>
                    <Typography variant="h4" className="font-bold text-orange-600">
                      {statistics.teamsWithOpenSlots}
                    </Typography>
                    <Typography color="text.secondary">
                      {t('teamAdministration:ACTIVE_TEAMS')}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </motion.div>
          )}

          {/* Recent Teams */}
          <motion.div variants={item}>
            <Paper className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Typography variant="h6">
                  {t('teamAdministration:RECENT_TEAMS')}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => router.push('/team-administration/teams')}
                  endIcon={<IdeomniSvgIcon>heroicons-outline:arrow-right</IdeomniSvgIcon>}
                >
                  {t('teamAdministration:VIEW')}
                </Button>
              </div>
              
              {teamsLoading ? (
                <IdeomniLoading />
              ) : teamsResponse?.data?.length === 0 ? (
                <div className="text-center py-8">
                  <IdeomniSvgIcon size={64} className="text-gray-400 mx-auto mb-4">
                    heroicons-outline:user-group
                  </IdeomniSvgIcon>
                  <Typography variant="h6" className="mb-2">
                    {t('teamAdministration:NO_TEAMS_FOUND')}
                  </Typography>
                  <Typography color="text.secondary">
                    {t('teamAdministration:NO_TEAMS_MESSAGE')}
                  </Typography>
                </div>
              ) : (
                <div className="space-y-3">
                  {teamsResponse?.data && Array.isArray(teamsResponse.data) 
                    ? teamsResponse.data.slice(0, 5).map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      onClick={() => router.push(`/team-administration/teams/${team.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold">
                          {team.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <Typography variant="subtitle1" className="font-medium">
                            {team.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {team.description || t('common:NO_DESCRIPTION')}
                          </Typography>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <Typography variant="body2" color="text.secondary">
                            {t('teamAdministration:MEMBERS')}
                          </Typography>
                          <Typography variant="subtitle2">
                            {team.currentMembers}/{team.maxMembers}
                          </Typography>
                        </div>
                        
                        <div className="text-center">
                          <Typography variant="body2" color="text.secondary">
                            {t('teamAdministration:LEADER')}
                          </Typography>
                          <Typography variant="subtitle2">
                            {team.leader.firstName && team.leader.lastName
                              ? `${team.leader.firstName} ${team.leader.lastName}`
                              : team.leader.username}
                          </Typography>
                        </div>
                        
                        <div className="text-center">
                          <Typography variant="body2" color="text.secondary">
                            {t('teamAdministration:STATUS')}
                          </Typography>
                          <Typography 
                            variant="subtitle2" 
                            className={team.isOpen ? 'text-green-600' : 'text-gray-600'}
                          >
                            {team.isOpen ? t('teamAdministration:OPEN') : t('teamAdministration:CLOSED')}
                          </Typography>
                        </div>

                        <IdeomniSvgIcon className="text-gray-400">
                          heroicons-outline:chevron-right
                        </IdeomniSvgIcon>
                      </div>
                    </div>
                  ))
                    : <div className="text-center py-8">
                        <Typography color="text.secondary">
                          {t('teamAdministration:NO_TEAMS_FOUND')}
                        </Typography>
                      </div>
                  }
                </div>
              )}
            </Paper>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={item}>
            <Paper className="p-6">
              <Typography variant="h6" className="mb-4">
                {t('teamAdministration:ACTIONS')}
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push('/team-administration/teams')}
                  startIcon={<IdeomniSvgIcon>heroicons-outline:user-group</IdeomniSvgIcon>}
                  className="justify-start p-4"
                >
                  <div className="text-left">
                    <Typography variant="subtitle1" className="font-medium">
                      {t('teamAdministration:MANAGE_TEAMS')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('teamAdministration:TEAMS_OVERVIEW')}
                    </Typography>
                  </div>
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push('/team-administration/teams?filter=open')}
                  startIcon={<IdeomniSvgIcon>heroicons-outline:plus-circle</IdeomniSvgIcon>}
                  className="justify-start p-4"
                >
                  <div className="text-left">
                    <Typography variant="subtitle1" className="font-medium">
                      {t('teamAdministration:OPEN')} {t('teamAdministration:TOTAL_TEAMS')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('teamAdministration:ACTIVE_TEAMS')}
                    </Typography>
                  </div>
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push('/team-administration/teams?filter=full')}
                  startIcon={<IdeomniSvgIcon>heroicons-outline:users</IdeomniSvgIcon>}
                  className="justify-start p-4"
                >
                  <div className="text-left">
                    <Typography variant="subtitle1" className="font-medium">
                      {t('teamAdministration:FULL')} {t('teamAdministration:TOTAL_TEAMS')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('teamAdministration:TOTAL_MEMBERS')}
                    </Typography>
                  </div>
                </Button>
              </div>
            </Paper>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default TeamAdministrationOverview;