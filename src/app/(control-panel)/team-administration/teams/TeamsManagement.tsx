'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Pagination from '@mui/material/Pagination';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import IdeomniLoading from '@ideomni/core/IdeomniLoading';
import managerTeamApiService from '../ManagerTeamApi';
import { TeamListItem, PaginatedResponse } from 'src/types/team';

/**
 * Teams Management Component
 */
function TeamsManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filter, setFilter] = useState<string>(searchParams.get('filter') || 'all');
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedTeam, setSelectedTeam] = useState<TeamListItem | null>(null);
  const [showDisbandDialog, setShowDisbandDialog] = useState(false);
  const [teamsResponse, setTeamsResponse] = useState<PaginatedResponse<TeamListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDisbanding, setIsDisbanding] = useState(false);
  
  const pageSize = 12;

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

  // Fetch teams data
  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await managerTeamApiService.getAllTeams({ page, pageSize, search });
      console.log('Teams API response:', response); // Debug log
      setTeamsResponse(response);
    } catch (err: any) {
      console.error('Failed to fetch teams:', err);
      setError(err.message || 'Failed to load teams');
      // Set empty response to prevent filter errors
      setTeamsResponse({ data: [], total: 0, page: 1, pageSize, totalPages: 0, hasNext: false, hasPrevious: false });
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filter from URL on mount
  useEffect(() => {
    const urlFilter = searchParams.get('filter');
    if (urlFilter && urlFilter !== filter) {
      setFilter(urlFilter);
    }
  }, [searchParams, filter]);

  // Fetch teams when dependencies change
  useEffect(() => {
    fetchTeams();
  }, [page, search]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleTeamAction = (event: React.MouseEvent<HTMLButtonElement>, team: TeamListItem) => {
    event.stopPropagation();
    setSelectedTeam(team);
    setActionMenuAnchor(event.currentTarget);
  };

  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null);
    setSelectedTeam(null);
  };

  const handleDisbandTeam = async () => {
    if (!selectedTeam) return;
    
    try {
      setIsDisbanding(true);
      await managerTeamApiService.forceDisbandTeam(selectedTeam.id);
      setShowDisbandDialog(false);
      handleCloseActionMenu();
      // Refresh the teams list
      await fetchTeams();
    } catch (err: any) {
      console.error('Failed to disband team:', err);
    } finally {
      setIsDisbanding(false);
    }
  };

  // Filter teams based on selected filter
  const filteredTeams = (teamsResponse?.data && Array.isArray(teamsResponse.data) 
    ? teamsResponse.data.filter(team => {
        switch (filter) {
          case 'open':
            return team.isOpen && team.currentMembers < team.maxMembers;
          case 'closed':
            return !team.isOpen;
          case 'full':
            return team.currentMembers >= team.maxMembers;
          default:
            return true;
        }
      })
    : []);

  if (isLoading) {
    return <IdeomniLoading />;
  }

  return (
    <div className="flex flex-col flex-1 relative overflow-hidden">
      <div className="flex flex-col flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <motion.div
          className="flex flex-col gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Header */}
          <motion.div variants={item} className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Button
                  variant="text"
                  onClick={() => router.push('/team-administration/overview')}
                  startIcon={<IdeomniSvgIcon>heroicons-outline:arrow-left</IdeomniSvgIcon>}
                >
                  {t('teamAdministration:TEAM_ADMIN_OVERVIEW')}
                </Button>
              </div>
              <Typography variant="h3" className="font-semibold">
                {t('teamAdministration:MANAGE_TEAMS')}
              </Typography>
              <Typography color="text.secondary" className="mt-1">
                {t('teamAdministration:TEAMS_OVERVIEW')}
              </Typography>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div variants={item}>
            <Paper className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex gap-3 flex-1">
                  <TextField
                    fullWidth
                    placeholder={t('teamAdministration:SEARCH_BY_TEAM_NAME')}
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
                    {t('teamAdministration:SEARCH_TEAMS')}
                  </Button>
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                  <Chip
                    label={t('teamAdministration:FILTER_ALL')}
                    variant={filter === 'all' ? 'filled' : 'outlined'}
                    onClick={() => setFilter('all')}
                    color={filter === 'all' ? 'primary' : 'default'}
                  />
                  <Chip
                    label={t('teamAdministration:OPEN')}
                    variant={filter === 'open' ? 'filled' : 'outlined'}
                    onClick={() => setFilter('open')}
                    color={filter === 'open' ? 'success' : 'default'}
                  />
                  <Chip
                    label={t('teamAdministration:CLOSED')}
                    variant={filter === 'closed' ? 'filled' : 'outlined'}
                    onClick={() => setFilter('closed')}
                    color={filter === 'closed' ? 'warning' : 'default'}
                  />
                  <Chip
                    label={t('teamAdministration:FULL')}
                    variant={filter === 'full' ? 'filled' : 'outlined'}
                    onClick={() => setFilter('full')}
                    color={filter === 'full' ? 'error' : 'default'}
                  />
                </div>
              </div>
            </Paper>
          </motion.div>

          {/* Results Count */}
          {teamsResponse && (
            <motion.div variants={item}>
              <Typography color="text.secondary">
                {t('teamAdministration:SHOWING_TEAMS')} {filteredTeams.length} {t('teamAdministration:OF_TOTAL_TEAMS')} {teamsResponse.total} {t('teamAdministration:TOTAL_TEAMS').toLowerCase()}
              </Typography>
            </motion.div>
          )}

          {/* Teams List */}
          {error ? (
            <motion.div variants={item}>
              <Paper className="p-8 text-center">
                <IdeomniSvgIcon size={64} className="text-gray-400 mx-auto mb-4">
                  heroicons-outline:exclamation-triangle
                </IdeomniSvgIcon>
                <Typography variant="h6" className="mb-2">
                  {t('teamAdministration:TEAMS_LOAD_ERROR')}
                </Typography>
                <Typography color="text.secondary">
                  {t('teamAdministration:TEAMS_LOAD_ERROR')}
                </Typography>
              </Paper>
            </motion.div>
          ) : filteredTeams.length === 0 ? (
            <motion.div variants={item}>
              <Paper className="p-8 text-center">
                <IdeomniSvgIcon size={64} className="text-gray-400 mx-auto mb-4">
                  heroicons-outline:user-group
                </IdeomniSvgIcon>
                <Typography variant="h6" className="mb-2">
                  {t('teamAdministration:NO_TEAMS_FOUND')}
                </Typography>
                <Typography color="text.secondary">
                  {t('teamAdministration:NO_TEAMS_MESSAGE')}
                </Typography>
              </Paper>
            </motion.div>
          ) : (
            <motion.div variants={item}>
              <Paper className="overflow-hidden">
                <div className="space-y-0">
                  {filteredTeams.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => router.push(`/team-administration/teams/${team.id}`)}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold">
                          {team.name.substring(0, 2).toUpperCase()}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Typography variant="h6" className="font-medium truncate">
                              {team.name}
                            </Typography>
                            <Chip
                              size="small"
                              label={team.isOpen ? t('teamAdministration:OPEN') : t('teamAdministration:CLOSED')}
                              color={team.isOpen ? 'success' : 'default'}
                              variant="outlined"
                            />
                            {team.currentMembers >= team.maxMembers && (
                              <Chip
                                size="small"
                                label={t('teamAdministration:FULL')}
                                color="error"
                                variant="outlined"
                              />
                            )}
                          </div>
                          <Typography variant="body2" color="text.secondary" className="truncate">
                            {team.description || t('common:NO_DESCRIPTION')}
                          </Typography>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <Typography variant="body2" color="text.secondary">
                            {t('teamAdministration:MEMBERS')}
                          </Typography>
                          <Typography variant="subtitle1" className="font-medium">
                            {team.currentMembers}/{team.maxMembers}
                          </Typography>
                        </div>
                        
                        <div className="text-center min-w-0">
                          <Typography variant="body2" color="text.secondary">
                            {t('teamAdministration:LEADER')}
                          </Typography>
                          <Typography variant="subtitle1" className="font-medium truncate">
                            {team.leader.firstName && team.leader.lastName
                              ? `${team.leader.firstName} ${team.leader.lastName}`
                              : team.leader.username}
                          </Typography>
                        </div>
                        
                        <div className="text-center">
                          <Typography variant="body2" color="text.secondary">
                            {t('teamAdministration:CREATED')}
                          </Typography>
                          <Typography variant="subtitle1" className="font-medium">
                            {new Date(team.createdAt).toLocaleDateString()}
                          </Typography>
                        </div>

                        <Button
                          variant="outlined"
                          size="small"
                          onClick={(e) => handleTeamAction(e, team)}
                          startIcon={<IdeomniSvgIcon>heroicons-outline:cog</IdeomniSvgIcon>}
                        >
                          {t('teamAdministration:ACTIONS')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Paper>
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
        </motion.div>
      </div>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleCloseActionMenu}
      >
        <MenuItem onClick={() => {
          if (selectedTeam) {
            router.push(`/team-administration/teams/${selectedTeam.id}`);
          }
          handleCloseActionMenu();
        }}>
          <IdeomniSvgIcon className="mr-2">heroicons-outline:eye</IdeomniSvgIcon>
          {t('teamAdministration:VIEW_TEAM_DETAILS')}
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setShowDisbandDialog(true);
          }}
          className="text-red-600"
        >
          <IdeomniSvgIcon className="mr-2">heroicons-outline:trash</IdeomniSvgIcon>
          {t('teamAdministration:DISBAND_TEAM')}
        </MenuItem>
      </Menu>

      {/* Disband Confirmation Dialog */}
      <Dialog
        open={showDisbandDialog}
        onClose={() => setShowDisbandDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <div className="flex items-center gap-2">
            <IdeomniSvgIcon className="text-red-500">
              heroicons-outline:exclamation-triangle
            </IdeomniSvgIcon>
            {t('teamAdministration:DISBAND_TEAM_CONFIRMATION')}
          </div>
        </DialogTitle>
        <DialogContent>
          <Typography className="mb-4">
            {t('teamAdministration:DISBAND_WARNING')}: <strong>{selectedTeam?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('teamAdministration:DISBAND_WARNING')} {t('teamAdministration:CANNOT_UNDO')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDisbandDialog(false)}>
            {t('teamAdministration:CANCEL')}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDisbandTeam}
            disabled={isDisbanding}
            startIcon={<IdeomniSvgIcon>heroicons-outline:trash</IdeomniSvgIcon>}
          >
            {isDisbanding ? t('teamAdministration:DISBANDING') : t('teamAdministration:DISBAND_TEAM')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default TeamsManagement;