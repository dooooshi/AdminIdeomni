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
  Autocomplete,
  FormControlLabel,
  Switch,
  Divider,
  Badge,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
import useI18n from '@i18n/useI18n';
import UserActivityService, {
  ActivityParticipant,
  UserActivityStatus,
  GetParticipantsParams,
  ParticipantsResponse,
  UpdateUserActivityStatusRequest,
  BulkUpdateStatusRequest,
} from '@/lib/services/userActivityService';
import { Activity } from '@/lib/services/activityService';

interface ActivityParticipantsListProps {
  activity: Activity;
  onAddUsers: () => void;
  onRemoveUsers: (userIds: string[]) => void;
  onUserHistoryView: (userId: string) => void;
}

interface ParticipantFilters {
  status: UserActivityStatus | '';
  userType: number | '';
  searchName: string;
  includeInactive: boolean;
}

const ActivityParticipantsList: React.FC<ActivityParticipantsListProps> = ({
  activity,
  onAddUsers,
  onRemoveUsers,
  onUserHistoryView,
}) => {
  const { t } = useTranslation('activityManagement');
  const { languageId } = useI18n();
  const theme = useTheme();

  // State management
  const [participants, setParticipants] = useState<ParticipantsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  
  // Filter state
  const [filters, setFilters] = useState<ParticipantFilters>({
    status: '',
    userType: '',
    searchName: '',
    includeInactive: false,
  });
  
  // Search debouncing
  const [searchValue, setSearchValue] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Dialog states
  const [statusUpdateDialog, setStatusUpdateDialog] = useState<{
    open: boolean;
    participant: ActivityParticipant | null;
    newStatus: UserActivityStatus;
    reason: string;
    sendNotification: boolean;
  }>({
    open: false,
    participant: null,
    newStatus: UserActivityStatus.ENROLLED,
    reason: '',
    sendNotification: true,
  });

  const [bulkStatusDialog, setBulkStatusDialog] = useState<{
    open: boolean;
    status: UserActivityStatus;
    reason: string;
    sendNotification: boolean;
  }>({
    open: false,
    status: UserActivityStatus.ENROLLED,
    reason: '',
    sendNotification: true,
  });

  const [operationLoading, setOperationLoading] = useState(false);

  // Load participants data
  const loadParticipants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: GetParticipantsParams = {
        page: page + 1, // Convert to 1-based pagination
        pageSize,
        status: filters.status || undefined,
        userType: filters.userType || undefined,
        searchName: filters.searchName || undefined,
        includeInactive: filters.includeInactive,
        sortBy: 'enrolledAt',
        sortOrder: 'desc',
      };

      const data = await UserActivityService.getActivityParticipants(activity.id, params);
      setParticipants(data);
    } catch (err) {
      console.error('Failed to load participants:', err);
      setError(err instanceof Error ? err.message : t('PARTICIPANTS_LOAD_ERROR'));
      // Set empty data structure to prevent errors
      setParticipants({
        data: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
        statistics: {
          totalParticipants: 0,
          enrolled: 0,
          completed: 0,
          cancelled: 0,
          noShow: 0,
        },
      });
    } finally {
      setLoading(false);
    }
  }, [activity.id, page, pageSize, filters, t]);

  // Load data when dependencies change
  useEffect(() => {
    loadParticipants();
  }, [loadParticipants]);

  // Handle search with debouncing
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      setFilters(prev => ({ ...prev, searchName: searchValue }));
      setPage(0);
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchValue]);

  // Handle filter changes
  const handleFilterChange = (field: keyof ParticipantFilters, value: any) => {
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

  // Handle selection
  const handleSelectParticipant = (participantId: string) => {
    setSelectedParticipants(prev => {
      if (prev.includes(participantId)) {
        return prev.filter(id => id !== participantId);
      }
      return [...prev, participantId];
    });
  };

  const handleSelectAll = () => {
    if (!participants?.data) return;
    
    if (selectedParticipants.length === participants.data.length) {
      setSelectedParticipants([]);
    } else {
      setSelectedParticipants(participants.data.map(p => p.user.id));
    }
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!statusUpdateDialog.participant) return;

    try {
      setOperationLoading(true);
      
      const request: UpdateUserActivityStatusRequest = {
        userId: statusUpdateDialog.participant.user.id,
        status: statusUpdateDialog.newStatus,
        reason: statusUpdateDialog.reason,
        sendNotification: statusUpdateDialog.sendNotification,
      };

      await UserActivityService.updateUserActivityStatus(activity.id, request);
      await loadParticipants();
      
      setStatusUpdateDialog({
        open: false,
        participant: null,
        newStatus: UserActivityStatus.ENROLLED,
        reason: '',
        sendNotification: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('STATUS_UPDATE_ERROR'));
    } finally {
      setOperationLoading(false);
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async () => {
    if (selectedParticipants.length === 0) return;

    try {
      setOperationLoading(true);
      
      const request: BulkUpdateStatusRequest = {
        updates: selectedParticipants.map(userId => ({
          userId,
          status: bulkStatusDialog.status,
          reason: bulkStatusDialog.reason,
        })),
        sendNotification: bulkStatusDialog.sendNotification,
      };

      await UserActivityService.bulkUpdateUserActivityStatus(activity.id, request);
      await loadParticipants();
      setSelectedParticipants([]);
      
      setBulkStatusDialog({
        open: false,
        status: UserActivityStatus.ENROLLED,
        reason: '',
        sendNotification: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('BULK_STATUS_UPDATE_ERROR'));
    } finally {
      setOperationLoading(false);
    }
  };

  // Format display values
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
  };

  const getStatusIcon = (status: UserActivityStatus) => {
    switch (status) {
      case UserActivityStatus.ENROLLED:
        return <ScheduleIcon fontSize="small" />;
      case UserActivityStatus.COMPLETED:
        return <CheckCircleIcon fontSize="small" />;
      case UserActivityStatus.CANCELLED:
        return <CancelIcon fontSize="small" />;
      case UserActivityStatus.NO_SHOW:
        return <ErrorIcon fontSize="small" />;
      default:
        return null;
    }
  };

  if (loading && !participants) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>{t('LOADING_PARTICIPANTS')}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with Statistics */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h3">
            {t('ACTIVITY_PARTICIPANTS')} - {activity.name}
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadParticipants}
              disabled={loading}
            >
              {t('REFRESH')}
            </Button>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={onAddUsers}
            >
              {t('ADD_USERS')}
            </Button>
            {selectedParticipants.length > 0 && (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<PersonRemoveIcon />}
                  onClick={() => onRemoveUsers(selectedParticipants)}
                >
                  {t('REMOVE_SELECTED')} ({selectedParticipants.length})
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setBulkStatusDialog({ ...bulkStatusDialog, open: true })}
                >
                  {t('UPDATE_STATUS')}
                </Button>
              </>
            )}
          </Stack>
        </Box>

        {/* Statistics Cards */}
        {participants?.statistics && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="primary">
                    {participants.statistics.totalParticipants}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('TOTAL_PARTICIPANTS')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="info.main">
                    {participants.statistics.enrolled}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('ENROLLED')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="success.main">
                    {participants.statistics.completed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('COMPLETED')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="warning.main">
                    {participants.statistics.cancelled}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('CANCELLED')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="error.main">
                    {participants.statistics.noShow}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('NO_SHOW')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon />
            {t('FILTERS')}
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label={t('SEARCH_PARTICIPANTS')}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                placeholder={t('SEARCH_BY_NAME_EMAIL')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>{t('STATUS')}</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label={t('STATUS')}
                  sx={{ minWidth: 140 }}
                >
                  <MenuItem value="">{t('ALL_STATUSES')}</MenuItem>
                  {Object.values(UserActivityStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {UserActivityService.getStatusDisplayName(status)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>{t('USER_TYPE')}</InputLabel>
                <Select
                  value={filters.userType}
                  onChange={(e) => handleFilterChange('userType', e.target.value)}
                  label={t('USER_TYPE')}
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="">{t('ALL_TYPES')}</MenuItem>
                  <MenuItem value={1}>{t('MANAGER')}</MenuItem>
                  <MenuItem value={2}>{t('WORKER')}</MenuItem>
                  <MenuItem value={3}>{t('STUDENT')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.includeInactive}
                    onChange={(e) => handleFilterChange('includeInactive', e.target.checked)}
                  />
                }
                label={t('INCLUDE_INACTIVE_USERS')}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Participants Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <input
                  type="checkbox"
                  checked={participants?.data.length > 0 && selectedParticipants.length === participants?.data.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>{t('USER')}</TableCell>
              <TableCell>{t('USER_TYPE')}</TableCell>
              <TableCell>{t('STATUS')}</TableCell>
              <TableCell>{t('ENROLLED_AT')}</TableCell>
              <TableCell>{t('UPDATED_AT')}</TableCell>
              <TableCell>{t('ADDED_BY')}</TableCell>
              <TableCell>{t('ACTIONS')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {participants?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                  <Stack spacing={2} alignItems="center">
                    <GroupIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                    <Typography variant="h6" color="text.secondary">
                      {t('NO_PARTICIPANTS_FOUND')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('NO_PARTICIPANTS_MESSAGE')}
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<PersonAddIcon />}
                      onClick={onAddUsers}
                    >
                      {t('ADD_FIRST_PARTICIPANTS')}
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              participants?.data.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell padding="checkbox">
                    <input
                      type="checkbox"
                      checked={selectedParticipants.includes(participant.user.id)}
                      onChange={() => handleSelectParticipant(participant.user.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon color="primary" />
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {UserActivityService.formatUserDisplayName(participant.user)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {participant.user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={UserActivityService.getUserTypeDisplayName(participant.user.userType)}
                      color={UserActivityService.getUserTypeColor(participant.user.userType)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(participant.status)}
                      label={UserActivityService.getStatusDisplayName(participant.status)}
                      color={UserActivityService.getStatusColor(participant.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(participant.enrolledAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(participant.updatedAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {participant.addedByAdmin ? (
                      <Typography variant="body2">
                        {participant.addedByAdmin.username}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {t('SYSTEM')}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title={t('UPDATE_STATUS')}>
                        <IconButton
                          size="small"
                          onClick={() => setStatusUpdateDialog({
                            open: true,
                            participant,
                            newStatus: participant.status,
                            reason: '',
                            sendNotification: true,
                          })}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('VIEW_USER_HISTORY')}>
                        <IconButton
                          size="small"
                          onClick={() => onUserHistoryView(participant.user.id)}
                        >
                          <HistoryIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('SEND_EMAIL')}>
                        <IconButton
                          size="small"
                          onClick={() => window.open(`mailto:${participant.user.email}`, '_blank')}
                        >
                          <EmailIcon />
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
      {participants && participants.total > 0 && (
        <TablePagination
          component="div"
          count={participants.total}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handlePageSizeChange}
          rowsPerPageOptions={[10, 20, 50, 100]}
        />
      )}

      {/* Status Update Dialog */}
      <Dialog
        open={statusUpdateDialog.open}
        onClose={() => setStatusUpdateDialog({ ...statusUpdateDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('UPDATE_PARTICIPANT_STATUS')}</DialogTitle>
        <DialogContent>
          {statusUpdateDialog.participant && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" gutterBottom>
                <strong>{t('USER')}:</strong> {UserActivityService.formatUserDisplayName(statusUpdateDialog.participant.user)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {statusUpdateDialog.participant.user.email}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2">
                  <strong>{t('CURRENT_STATUS')}:</strong>
                </Typography>
                <Chip
                  label={UserActivityService.getStatusDisplayName(statusUpdateDialog.participant.status)}
                  color={UserActivityService.getStatusColor(statusUpdateDialog.participant.status)}
                  size="small"
                />
              </Box>
            </Box>
          )}
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{t('NEW_STATUS')}</InputLabel>
                <Select
                  value={statusUpdateDialog.newStatus}
                  onChange={(e) => setStatusUpdateDialog({
                    ...statusUpdateDialog,
                    newStatus: e.target.value as UserActivityStatus
                  })}
                  label={t('NEW_STATUS')}
                >
                  {Object.values(UserActivityStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {UserActivityService.getStatusDisplayName(status)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('REASON')}
                multiline
                rows={3}
                value={statusUpdateDialog.reason}
                onChange={(e) => setStatusUpdateDialog({
                  ...statusUpdateDialog,
                  reason: e.target.value
                })}
                placeholder={t('REASON_PLACEHOLDER')}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={statusUpdateDialog.sendNotification}
                    onChange={(e) => setStatusUpdateDialog({
                      ...statusUpdateDialog,
                      sendNotification: e.target.checked
                    })}
                  />
                }
                label={t('SEND_EMAIL_NOTIFICATION')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setStatusUpdateDialog({ ...statusUpdateDialog, open: false })}
            disabled={operationLoading}
          >
            {t('CANCEL')}
          </Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            disabled={operationLoading}
          >
            {operationLoading ? <CircularProgress size={20} /> : t('UPDATE_STATUS')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Status Update Dialog */}
      <Dialog
        open={bulkStatusDialog.open}
        onClose={() => setBulkStatusDialog({ ...bulkStatusDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('BULK_UPDATE_STATUS')} ({selectedParticipants.length} {t('PARTICIPANTS')})
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{t('NEW_STATUS')}</InputLabel>
                <Select
                  value={bulkStatusDialog.status}
                  onChange={(e) => setBulkStatusDialog({
                    ...bulkStatusDialog,
                    status: e.target.value as UserActivityStatus
                  })}
                  label={t('NEW_STATUS')}
                >
                  {Object.values(UserActivityStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {UserActivityService.getStatusDisplayName(status)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('REASON')}
                multiline
                rows={3}
                value={bulkStatusDialog.reason}
                onChange={(e) => setBulkStatusDialog({
                  ...bulkStatusDialog,
                  reason: e.target.value
                })}
                placeholder={t('BULK_REASON_PLACEHOLDER')}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={bulkStatusDialog.sendNotification}
                    onChange={(e) => setBulkStatusDialog({
                      ...bulkStatusDialog,
                      sendNotification: e.target.checked
                    })}
                  />
                }
                label={t('SEND_EMAIL_NOTIFICATION')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setBulkStatusDialog({ ...bulkStatusDialog, open: false })}
            disabled={operationLoading}
          >
            {t('CANCEL')}
          </Button>
          <Button
            onClick={handleBulkStatusUpdate}
            variant="contained"
            disabled={operationLoading}
          >
            {operationLoading ? <CircularProgress size={20} /> : t('UPDATE_ALL')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActivityParticipantsList; 