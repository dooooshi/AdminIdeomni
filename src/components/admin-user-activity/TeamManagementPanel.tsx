'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
  Grid,
  Avatar,
  AvatarGroup,
  Divider,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Star as StarIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
import AdminUserActivityService, {
  Team,
  TeamSearchParams,
  PaginationResult,
  AssignUserToTeamRequest,
  DisbandTeamRequest,
  UserActivityStatistics,
  AssignmentResult,
} from '@/lib/services/adminUserActivityService';

interface TeamManagementPanelProps {
  onDataChange: () => void;
  statistics?: UserActivityStatistics | null;
}

interface TeamFilters {
  q: string;
  activityId: string;
  includeInactive: boolean;
  sortBy: 'name' | 'createdAt' | 'memberCount';
  sortOrder: 'asc' | 'desc';
}

const TeamManagementPanel: React.FC<TeamManagementPanelProps> = ({
  onDataChange,
  statistics,
}) => {
  const { t } = useTranslation('activityManagement');
  const theme = useTheme();

  // State management
  const [teams, setTeams] = useState<PaginationResult<Team> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Filter state
  const [filters, setFilters] = useState<TeamFilters>({
    q: '',
    activityId: '',
    includeInactive: false,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // Dialog states
  const [teamDetailsDialog, setTeamDetailsDialog] = useState<{
    open: boolean;
    team: Team | null;
  }>({
    open: false,
    team: null,
  });

  const [assignUserDialog, setAssignUserDialog] = useState<{
    open: boolean;
    team: Team | null;
    selectedUser: string;
    reason: string;
  }>({
    open: false,
    team: null,
    selectedUser: '',
    reason: '',
  });

  const [disbandDialog, setDisbandDialog] = useState<{
    open: boolean;
    team: Team | null;
    reason: string;
  }>({
    open: false,
    team: null,
    reason: '',
  });

  const [operationLoading, setOperationLoading] = useState(false);

  // Load teams data
  const loadTeams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: TeamSearchParams = {
        page: page + 1, // Convert to 1-based pagination
        pageSize,
        q: filters.q || undefined,
        activityId: filters.activityId || undefined,
        includeInactive: filters.includeInactive,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };

      const data = await AdminUserActivityService.getAllTeams(params);
      setTeams(data);
    } catch (err) {
      console.error('Failed to load teams:', err);
      setError(err instanceof Error ? err.message : t('TEAMS_LOAD_ERROR'));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters, t]);

  // Load data when dependencies change
  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  // Handle filter changes
  const handleFilterChange = (field: keyof TeamFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  // Handle pagination
  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle assign user to team
  const handleAssignUser = async () => {
    if (!assignUserDialog.team || !assignUserDialog.selectedUser) return;

    try {
      setOperationLoading(true);
      
      const request: AssignUserToTeamRequest = {
        userId: assignUserDialog.selectedUser,
        teamId: assignUserDialog.team.id,
        reason: assignUserDialog.reason.trim() || undefined,
      };

      await AdminUserActivityService.assignUserToTeam(request);
      await loadTeams();
      onDataChange();
      
      setAssignUserDialog({
        open: false,
        team: null,
        selectedUser: '',
        reason: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('TEAM_ASSIGNMENT_ERROR'));
    } finally {
      setOperationLoading(false);
    }
  };

  // Handle disband team
  const handleDisbandTeam = async () => {
    if (!disbandDialog.team) return;

    try {
      setOperationLoading(true);
      
      const request: DisbandTeamRequest = {
        reason: disbandDialog.reason.trim() || undefined,
      };

      await AdminUserActivityService.forceDisbandTeam(disbandDialog.team.id, request);
      await loadTeams();
      onDataChange();
      
      setDisbandDialog({
        open: false,
        team: null,
        reason: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('TEAM_DISBAND_ERROR'));
    } finally {
      setOperationLoading(false);
    }
  };

  // Format display values
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
  };

  const getTeamStatusChip = (team: Team) => {
    if (team.memberCount >= team.maxMembers) {
      return <Chip label={t('FULL')} color="error" size="small" />;
    } else if (team.isOpen) {
      return <Chip label={t('OPEN')} color="success" size="small" />;
    } else {
      return <Chip label={t('CLOSED')} color="default" size="small" />;
    }
  };

  if (loading && !teams) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>{t('LOADING_TEAMS')}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Team Statistics Cards */}
      {statistics && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="primary">
                  {statistics.teamStatistics.totalTeams}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('TOTAL_TEAMS')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="success.main">
                  {statistics.teamStatistics.usersInTeams}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('USERS_IN_TEAMS')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="warning.main">
                  {statistics.teamStatistics.usersWithoutTeams}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('USERS_WITHOUT_TEAMS')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="info.main">
                  {statistics.teamStatistics.averageTeamSize.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('AVERAGE_TEAM_SIZE')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Search and Filter Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SearchIcon />
            {t('TEAM_SEARCH_FILTERS')}
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            {/* Search Query */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label={t('SEARCH_TEAMS')}
                value={filters.q}
                onChange={(e) => handleFilterChange('q', e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                placeholder={t('SEARCH_BY_TEAM_NAME')}
              />
            </Grid>

            {/* Activity Filter */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>{t('ACTIVITY')}</InputLabel>
                <Select
                  value={filters.activityId}
                  onChange={(e) => handleFilterChange('activityId', e.target.value)}
                  label={t('ACTIVITY')}
                >
                  <MenuItem value="">{t('ALL_ACTIVITIES')}</MenuItem>
                  {/* TODO: Load from real activities API */}
                  <MenuItem value="activity1">Business Strategy Simulation</MenuItem>
                  <MenuItem value="activity2">Advanced Leadership Training</MenuItem>
                  <MenuItem value="activity3">Team Building Workshop</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Sort By */}
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>{t('SORT_BY')}</InputLabel>
                <Select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  label={t('SORT_BY')}
                >
                  <MenuItem value="name">{t('TEAM_NAME')}</MenuItem>
                  <MenuItem value="createdAt">{t('CREATED_DATE')}</MenuItem>
                  <MenuItem value="memberCount">{t('MEMBER_COUNT')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Actions */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadTeams}
                  disabled={loading}
                >
                  {t('REFRESH')}
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={() => {
                    setFilters({
                      q: '',
                      activityId: '',
                      includeInactive: false,
                      sortBy: 'name',
                      sortOrder: 'asc',
                    });
                    setPage(0);
                  }}
                >
                  {t('CLEAR')}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Teams Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('TEAM')}</TableCell>
              <TableCell>{t('ACTIVITY')}</TableCell>
              <TableCell>{t('LEADER')}</TableCell>
              <TableCell>{t('MEMBERS')}</TableCell>
              <TableCell>{t('STATUS')}</TableCell>
              <TableCell>{t('CREATED')}</TableCell>
              <TableCell>{t('ACTIONS')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teams?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Stack spacing={2} alignItems="center">
                    <GroupIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                    <Typography variant="h6" color="text.secondary">
                      {t('NO_TEAMS_FOUND')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('NO_TEAMS_MESSAGE')}
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              teams?.data.map((team) => (
                <TableRow key={team.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {team.name}
                      </Typography>
                      {team.description && (
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {team.description}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {team.activity.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {team.activity.activityType}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {AdminUserActivityService.formatUserDisplayName(team.leader)?.charAt(0)?.toUpperCase() || '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">
                          {AdminUserActivityService.formatUserDisplayName(team.leader) || 'Unknown User'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {team.leader.email || 'No Email'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PeopleIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {team.memberCount}/{team.maxMembers}
                      </Typography>
                      {team.memberCount > 0 && (
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => setTeamDetailsDialog({ open: true, team })}
                        >
                          {t('VIEW_MEMBERS')}
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {getTeamStatusChip(team)}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(team.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title={t('VIEW_TEAM_DETAILS')}>
                        <IconButton
                          size="small"
                          onClick={() => setTeamDetailsDialog({ open: true, team })}
                        >
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('ASSIGN_USER_TO_TEAM')}>
                        <IconButton
                          size="small"
                          onClick={() => setAssignUserDialog({
                            open: true,
                            team,
                            selectedUser: '',
                            reason: '',
                          })}
                          disabled={team.memberCount >= team.maxMembers}
                        >
                          <PersonAddIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('DISBAND_TEAM')}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDisbandDialog({
                            open: true,
                            team,
                            reason: '',
                          })}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {teams && teams.total > 0 && (
        <TablePagination
          component="div"
          count={teams.total}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handlePageSizeChange}
          rowsPerPageOptions={[10, 20, 50, 100]}
        />
      )}

      {/* Team Details Dialog */}
      <Dialog
        open={teamDetailsDialog.open}
        onClose={() => setTeamDetailsDialog({ open: false, team: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupIcon />
            {teamDetailsDialog.team?.name} - {t('TEAM_DETAILS')}
          </Box>
        </DialogTitle>
        <DialogContent>
          {teamDetailsDialog.team && (
            <Box>
              {/* Team Info */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('TEAM_NAME')}:
                  </Typography>
                  <Typography variant="body1">
                    {teamDetailsDialog.team.name}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('ACTIVITY')}:
                  </Typography>
                  <Typography variant="body1">
                    {teamDetailsDialog.team.activity.name}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('DESCRIPTION')}:
                  </Typography>
                  <Typography variant="body1">
                    {teamDetailsDialog.team.description || t('NO_DESCRIPTION')}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ mb: 3 }} />

              {/* Team Leader */}
              <Typography variant="h6" gutterBottom>
                {t('TEAM_LEADER')}
              </Typography>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 40, height: 40 }}>
                      {AdminUserActivityService.formatUserDisplayName(teamDetailsDialog.team.leader)?.charAt(0)?.toUpperCase() || '?'}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {AdminUserActivityService.formatUserDisplayName(teamDetailsDialog.team.leader) || 'Unknown User'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {teamDetailsDialog.team.leader.email || 'No Email'}
                      </Typography>
                    </Box>
                    <StarIcon color="warning" />
                  </Box>
                </CardContent>
              </Card>

              {/* Team Members */}
              <Typography variant="h6" gutterBottom>
                {t('TEAM_MEMBERS')} ({teamDetailsDialog.team.memberCount})
              </Typography>
              {teamDetailsDialog.team.memberCount === 0 ? (
                <Alert severity="info">
                  {t('NO_TEAM_MEMBERS')}
                </Alert>
              ) : (
                <Card variant="outlined">
                  <List>
                    {/* TODO: Load actual team members from API */}
                    <ListItem>
                      <ListItemText
                        primary={t('TEAM_MEMBERS_LOADING')}
                        secondary={t('IMPLEMENT_TEAM_MEMBERS_API')}
                      />
                    </ListItem>
                  </List>
                </Card>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTeamDetailsDialog({ open: false, team: null })}>
            {t('CLOSE')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign User to Team Dialog */}
      <Dialog
        open={assignUserDialog.open}
        onClose={() => setAssignUserDialog({ ...assignUserDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('ASSIGN_USER_TO_TEAM')}</DialogTitle>
        <DialogContent>
          {assignUserDialog.team && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" gutterBottom>
                <strong>{t('TEAM')}:</strong> {assignUserDialog.team.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('CURRENT_MEMBERS')}: {assignUserDialog.team.memberCount}/{assignUserDialog.team.maxMembers}
              </Typography>
            </Box>
          )}
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>{t('SELECT_USER')}</InputLabel>
                <Select
                  value={assignUserDialog.selectedUser}
                  onChange={(e) => setAssignUserDialog({
                    ...assignUserDialog,
                    selectedUser: e.target.value
                  })}
                  label={t('SELECT_USER')}
                >
                  {/* TODO: Load from unassigned users API */}
                  <MenuItem value="user1">John Doe (john@example.com)</MenuItem>
                  <MenuItem value="user2">Jane Smith (jane@example.com)</MenuItem>
                  <MenuItem value="user3">Bob Johnson (bob@example.com)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label={t('REASON')}
                multiline
                rows={3}
                value={assignUserDialog.reason}
                onChange={(e) => setAssignUserDialog({
                  ...assignUserDialog,
                  reason: e.target.value
                })}
                placeholder={t('TEAM_ASSIGNMENT_REASON_PLACEHOLDER')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setAssignUserDialog({ ...assignUserDialog, open: false })}
            disabled={operationLoading}
          >
            {t('CANCEL')}
          </Button>
          <Button
            onClick={handleAssignUser}
            variant="contained"
            disabled={operationLoading || !assignUserDialog.selectedUser}
          >
            {operationLoading ? <CircularProgress size={20} /> : t('ASSIGN')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Disband Team Dialog */}
      <Dialog
        open={disbandDialog.open}
        onClose={() => setDisbandDialog({ ...disbandDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
            <WarningIcon />
            {t('DISBAND_TEAM')}
          </Box>
        </DialogTitle>
        <DialogContent>
          {disbandDialog.team && (
            <Box sx={{ mb: 3 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                {t('DISBAND_TEAM_WARNING')}
              </Alert>
              <Typography variant="body1" gutterBottom>
                <strong>{t('TEAM')}:</strong> {disbandDialog.team.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>{t('MEMBERS')}:</strong> {disbandDialog.team.memberCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>{t('ACTIVITY')}:</strong> {disbandDialog.team.activity.name}
              </Typography>
            </Box>
          )}
          <Divider sx={{ mb: 3 }} />
          <TextField
            fullWidth
            label={t('REASON')}
            multiline
            rows={3}
            value={disbandDialog.reason}
            onChange={(e) => setDisbandDialog({
              ...disbandDialog,
              reason: e.target.value
            })}
            placeholder={t('DISBAND_REASON_PLACEHOLDER')}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDisbandDialog({ ...disbandDialog, open: false })}
            disabled={operationLoading}
          >
            {t('CANCEL')}
          </Button>
          <Button
            onClick={handleDisbandTeam}
            variant="contained"
            color="error"
            disabled={operationLoading || !disbandDialog.reason.trim()}
          >
            {operationLoading ? <CircularProgress size={20} /> : t('DISBAND')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeamManagementPanel;