'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Pagination from '@mui/material/Pagination';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import IdeomniLoading from '@ideomni/core/IdeomniLoading';
import { useGetAvailableTeamsQuery, useJoinTeamMutation } from '../TeamApi';

/**
 * Browse Teams Component
 */
function BrowseTeams() {
  const { t } = useTranslation();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  const pageSize = 12;
  
  const { 
    data: teamsResponse, 
    isLoading, 
    error 
  } = useGetAvailableTeamsQuery({ page, pageSize, search });
  
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

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1); // Reset to first page on new search
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
    <div className="flex flex-col flex-1 relative overflow-hidden">
      <div className="flex flex-col flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        <motion.div
          className="flex flex-col gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Header */}
          <motion.div variants={item}>
            <Typography variant="h3" className="font-semibold">
              {t('teamManagement:BROWSE_TEAMS')}
            </Typography>
            <Typography color="text.secondary" className="mt-2">
              {t('teamManagement:DISCOVER_JOIN_TEAMS')}
            </Typography>
          </motion.div>

          {/* Search */}
          <motion.div variants={item}>
            <Paper className="p-4">
              <div className="flex gap-3">
                <TextField
                  fullWidth
                  placeholder={t('teamManagement:SEARCH_TEAMS_PLACEHOLDER')}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IdeomniSvgIcon>heroicons-outline:search</IdeomniSvgIcon>
                      </InputAdornment>
                    )
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  startIcon={<IdeomniSvgIcon>heroicons-outline:search</IdeomniSvgIcon>}
                >
                  {t('teamManagement:SEARCH')}
                </Button>
              </div>
            </Paper>
          </motion.div>

          {/* Results Count */}
          {teamsResponse && (
            <motion.div variants={item}>
              <Typography color="text.secondary">
                {t('teamManagement:FOUND_TEAMS')} {teamsResponse.total} {t('teamManagement:TEAMS')}
              </Typography>
            </motion.div>
          )}

          {/* Teams Grid */}
          {error ? (
            <motion.div variants={item}>
              <Paper className="p-8 text-center">
                <IdeomniSvgIcon size={64} className="text-gray-400 mx-auto mb-4">
                  heroicons-outline:exclamation-triangle
                </IdeomniSvgIcon>
                <Typography variant="h6" className="mb-2">
                  {t('teamManagement:FAILED_TO_LOAD_TEAMS')}
                </Typography>
                <Typography color="text.secondary">
                  {t('teamManagement:FAILED_TO_LOAD_TEAMS_MESSAGE')}
                </Typography>
              </Paper>
            </motion.div>
          ) : teamsResponse?.data?.length === 0 ? (
            <motion.div variants={item}>
              <Paper className="p-8 text-center">
                <IdeomniSvgIcon size={64} className="text-gray-400 mx-auto mb-4">
                  heroicons-outline:user-group
                </IdeomniSvgIcon>
                <Typography variant="h6" className="mb-2">
                  {t('teamManagement:NO_TEAMS_FOUND')}
                </Typography>
                <Typography color="text.secondary" className="mb-4">
                  {search ? t('teamManagement:NO_TEAMS_ADJUST_SEARCH') : t('teamManagement:NO_TEAMS_AVAILABLE')}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => router.push('/team-management/dashboard')}
                  startIcon={<IdeomniSvgIcon>heroicons-outline:plus</IdeomniSvgIcon>}
                >
                  {t('teamManagement:CREATE_NEW_TEAM_BUTTON')}
                </Button>
              </Paper>
            </motion.div>
          ) : (
            <motion.div 
              variants={item}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {teamsResponse?.data?.map((team) => (
                <Paper key={team.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col h-full">
                    {/* Team Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <Typography variant="h6" className="font-semibold mb-1">
                          {team.name}
                        </Typography>
                        <div className="flex items-center gap-2">
                          <Chip
                            size="small"
                            label={team.isOpen ? t('teamManagement:OPEN') : t('teamManagement:CLOSED')}
                            color={team.isOpen ? 'success' : 'default'}
                            variant="outlined"
                          />
                          <Typography variant="body2" color="text.secondary">
                            {team.currentMembers}/{team.maxMembers} {t('teamManagement:MEMBERS')}
                          </Typography>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {team.description && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        className="mb-4 flex-1"
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
                      <Typography variant="body2" color="text.secondary" className="mb-1">
                        {t('teamManagement:TEAM_LEADER')}
                      </Typography>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-semibold">
                          {team.leader.firstName && team.leader.lastName
                            ? `${team.leader.firstName[0]}${team.leader.lastName[0]}`
                            : team.leader.username[0].toUpperCase()}
                        </div>
                        <Typography variant="body2">
                          {team.leader.firstName && team.leader.lastName
                            ? `${team.leader.firstName} ${team.leader.lastName}`
                            : team.leader.username}
                        </Typography>
                      </div>
                    </div>

                    {/* Created Date */}
                    <Typography variant="body2" color="text.secondary" className="mb-4">
                      {t('teamManagement:CREATED')} {new Date(team.createdAt).toLocaleDateString()}
                    </Typography>

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => router.push(`/team-management/teams/${team.id}`)}
                        startIcon={<IdeomniSvgIcon>heroicons-outline:eye</IdeomniSvgIcon>}
                      >
                        {t('teamManagement:VIEW_DETAILS')}
                      </Button>
                      {team.isOpen && team.currentMembers < team.maxMembers && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleJoinTeam(team.id)}
                          disabled={isJoining}
                          startIcon={<IdeomniSvgIcon>heroicons-outline:plus</IdeomniSvgIcon>}
                        >
                          {t('teamManagement:JOIN')}
                        </Button>
                      )}
                    </div>
                  </div>
                </Paper>
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {teamsResponse && teamsResponse.totalPages > 1 && (
            <motion.div variants={item} className="flex justify-center">
              <Pagination
                count={teamsResponse.totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
              />
            </motion.div>
          )}

          {/* Create Team CTA */}
          <motion.div variants={item}>
            <Paper className="p-6 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
              <div className="text-center">
                <Typography variant="h6" className="mb-2">
                  {t('teamManagement:CANT_FIND_RIGHT_TEAM')}
                </Typography>
                <Typography color="text.secondary" className="mb-4">
                  {t('teamManagement:CREATE_OWN_TEAM_MESSAGE')}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => router.push('/team-management/dashboard')}
                  startIcon={<IdeomniSvgIcon>heroicons-outline:plus</IdeomniSvgIcon>}
                >
                  {t('teamManagement:CREATE_NEW_TEAM_BUTTON')}
                </Button>
              </div>
            </Paper>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default BrowseTeams;