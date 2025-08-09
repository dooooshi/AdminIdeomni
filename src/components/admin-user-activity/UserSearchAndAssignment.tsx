'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/@i18n/hooks/useTranslation';
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
  Avatar,
  Checkbox,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  SwapHoriz as SwapHorizIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  History as HistoryIcon,
  Email as EmailIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
import AdminUserActivityService, {
  AdminUserActivitySearchParams,
  UserWithActivityDto,
  PaginationResult,
  AssignUserToActivityRequest,
  TransferUserActivityRequest,
  BulkAssignUsersRequest,
  AssignmentResult,
  BulkOperationResult,
  UserActivityStatistics,
  USER_TYPES,
  UserActivityStatus,
} from '@/lib/services/adminUserActivityService';
import { Activity } from '@/lib/services/activityService';
import ActivityService from '@/lib/services/activityService';
import EnhancedErrorDisplay from '@/components/common/EnhancedErrorDisplay';
import { AdminUserActivityError } from '@/lib/errors/AdminUserActivityError';

interface UserSearchAndAssignmentProps {
  onDataChange: () => void;
  statistics?: UserActivityStatistics | null;
}

interface SearchFilters {
  q: string;
  userType: number | '';
  activityStatus: 'assigned' | 'unassigned' | 'all';
  activityId: string;
  enrollmentStatus: UserActivityStatus | '';
  includeInactive: boolean;
  sortBy: 'username' | 'email' | 'createdAt' | 'enrolledAt' | 'firstName' | 'lastName';
  sortOrder: 'asc' | 'desc';
}

const UserSearchAndAssignment: React.FC<UserSearchAndAssignmentProps> = ({
  onDataChange,
  statistics,
}) => {
  const { t } = useTranslation('activityManagement');
  const theme = useTheme();

  // Helper function to get user type translation key
  const getUserTypeTranslationKey = (userType: number): string => {
    switch (userType) {
      case 1: return 'MANAGER';
      case 2: return 'WORKER'; 
      case 3: return 'STUDENT';
      default: return 'UNKNOWN';
    }
  };

  // State management
  const [users, setUsers] = useState<PaginationResult<UserWithActivityDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Search and filter state
  const [filters, setFilters] = useState<SearchFilters>({
    q: '',
    userType: '',
    activityStatus: 'all',
    activityId: '',
    enrollmentStatus: '',
    includeInactive: false,
    sortBy: 'username',
    sortOrder: 'asc',
  });

  // Dialog states
  const [assignDialog, setAssignDialog] = useState<{
    open: boolean;
    user: UserWithActivityDto | null;
    selectedActivity: string;
    reason: string;
    forceAssignment: boolean;
  }>({
    open: false,
    user: null,
    selectedActivity: '',
    reason: '',
    forceAssignment: false,
  });

  const [transferDialog, setTransferDialog] = useState<{
    open: boolean;
    user: UserWithActivityDto | null;
    newActivity: string;
    reason: string;
  }>({
    open: false,
    user: null,
    newActivity: '',
    reason: '',
  });

  const [bulkAssignDialog, setBulkAssignDialog] = useState<{
    open: boolean;
    activityId: string;
    reason: string;
    forceAssignment: boolean;
  }>({
    open: false,
    activityId: '',
    reason: '',
    forceAssignment: false,
  });

  const [operationLoading, setOperationLoading] = useState(false);
  const [operationResult, setOperationResult] = useState<BulkOperationResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Available activities for selection
  const [availableActivities, setAvailableActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Load available activities for selection
  const loadAvailableActivities = useCallback(async () => {
    try {
      setLoadingActivities(true);
      const response = await ActivityService.searchActivities({
        pageSize: 100, // Load many activities for selection
        isActive: true, // Only load active activities
      });
      setAvailableActivities(response.data);
    } catch (error) {
      console.error('Failed to load activities:', error);
      setError('Failed to load activities for selection');
    } finally {
      setLoadingActivities(false);
    }
  }, []);

  // Load users data
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: AdminUserActivitySearchParams = {
        page: page + 1, // Convert to 1-based pagination
        pageSize,
        q: filters.q || undefined,
        userType: filters.userType || undefined,
        activityStatus: filters.activityStatus === 'all' ? undefined : filters.activityStatus,
        activityId: filters.activityId || undefined,
        enrollmentStatus: filters.enrollmentStatus || undefined,
        includeInactive: filters.includeInactive,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };

      const data = await AdminUserActivityService.searchUsersWithActivityStatus(params);
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError(err instanceof Error ? err.message : t('USERS_LOAD_ERROR'));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters, t]);

  // Load data when dependencies change
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle filter changes
  const handleFilterChange = (field: keyof SearchFilters, value: any) => {
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
  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      }
      return [...prev, userId];
    });
  };

  const handleSelectAll = () => {
    if (!users?.data) return;
    
    if (selectedUsers.length === users.data.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.data.map(u => u.user.id));
    }
  };

  // Handle user assignment
  const handleAssignUser = async () => {
    if (!assignDialog.user || !assignDialog.selectedActivity) return;

    try {
      setOperationLoading(true);
      
      const request: AssignUserToActivityRequest = {
        userId: assignDialog.user.user.id,
        activityId: assignDialog.selectedActivity,
        reason: assignDialog.reason.trim() || undefined,
        forceAssignment: assignDialog.forceAssignment,
      };

      await AdminUserActivityService.assignUserToActivity(request);
      await loadUsers();
      onDataChange();
      
      setAssignDialog({
        open: false,
        user: null,
        selectedActivity: '',
        reason: '',
        forceAssignment: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('ASSIGNMENT_ERROR'));
    } finally {
      setOperationLoading(false);
    }
  };

  // Handle user transfer
  const handleTransferUser = async () => {
    if (!transferDialog.user || !transferDialog.newActivity) return;

    try {
      setOperationLoading(true);
      
      const request: TransferUserActivityRequest = {
        userId: transferDialog.user.user.id,
        newActivityId: transferDialog.newActivity,
        reason: transferDialog.reason.trim() || undefined,
      };

      await AdminUserActivityService.transferUserBetweenActivities(request);
      await loadUsers();
      onDataChange();
      
      setTransferDialog({
        open: false,
        user: null,
        newActivity: '',
        reason: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('TRANSFER_ERROR'));
    } finally {
      setOperationLoading(false);
    }
  };

  // Handle bulk assignment
  const handleBulkAssign = async () => {
    if (selectedUsers.length === 0 || !bulkAssignDialog.activityId) return;

    try {
      setOperationLoading(true);
      
      const request: BulkAssignUsersRequest = {
        userIds: selectedUsers,
        activityId: bulkAssignDialog.activityId,
        reason: bulkAssignDialog.reason.trim() || undefined,
        forceAssignment: bulkAssignDialog.forceAssignment,
      };

      const result = await AdminUserActivityService.bulkAssignUsersToActivity(request);
      setOperationResult(result);
      setShowResults(true);
      
      await loadUsers();
      onDataChange();
      setSelectedUsers([]);
      
      setBulkAssignDialog({
        open: false,
        activityId: '',
        reason: '',
        forceAssignment: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('BULK_ASSIGNMENT_ERROR'));
    } finally {
      setOperationLoading(false);
    }
  };

  // Handle remove user from activity
  const handleRemoveUser = async (userWithActivity: UserWithActivityDto) => {
    if (!userWithActivity.currentActivity) return;

    try {
      setOperationLoading(true);
      await AdminUserActivityService.removeUserFromActivity(userWithActivity.user.id);
      await loadUsers();
      onDataChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('REMOVE_USER_ERROR'));
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

  const canAssignUser = (userWithActivity: UserWithActivityDto) => {
    return !userWithActivity.currentActivity;
  };

  if (loading && !users) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>{t('LOADING_USERS')}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Search and Filter Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SearchIcon />
            {t('ADVANCED_USER_SEARCH')}
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            {/* Search Query */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={t('SEARCH_USERS')}
                value={filters.q}
                onChange={(e) => handleFilterChange('q', e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                placeholder={t('SEARCH_BY_NAME_EMAIL_USERNAME')}
              />
            </Grid>

            {/* User Type Filter */}
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
                  <MenuItem value={USER_TYPES.MANAGER}>{t('MANAGER')}</MenuItem>
                  <MenuItem value={USER_TYPES.WORKER}>{t('WORKER')}</MenuItem>
                  <MenuItem value={USER_TYPES.STUDENT}>{t('STUDENT')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Activity Status Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>{t('ACTIVITY_STATUS')}</InputLabel>
                <Select
                  value={filters.activityStatus}
                  onChange={(e) => handleFilterChange('activityStatus', e.target.value)}
                  label={t('ACTIVITY_STATUS')}
                  sx={{ minWidth: 170 }}
                >
                  <MenuItem value="all">{t('ALL_USERS')}</MenuItem>
                  <MenuItem value="assigned">{t('ASSIGNED_USERS')}</MenuItem>
                  <MenuItem value="unassigned">{t('UNASSIGNED_USERS')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Enrollment Status Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>{t('STATUS')}</InputLabel>
                <Select
                  value={filters.enrollmentStatus}
                  onChange={(e) => handleFilterChange('enrollmentStatus', e.target.value)}
                  label={t('STATUS')}
                  sx={{ minWidth: 140 }}
                >
                  <MenuItem value="">{t('ALL_STATUSES')}</MenuItem>
                  {Object.values(UserActivityStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {t(status)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Include Inactive Toggle */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.includeInactive}
                    onChange={(e) => handleFilterChange('includeInactive', e.target.checked)}
                  />
                }
                label={t('INCLUDE_INACTIVE')}
              />
            </Grid>

            {/* Actions */}
            <Grid item xs={12} md={12} sx={{ mt: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadUsers}
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
                      userType: '',
                      activityStatus: 'all',
                      activityId: '',
                      enrollmentStatus: '',
                      includeInactive: false,
                      sortBy: 'username',
                      sortOrder: 'asc',
                    });
                    setPage(0);
                  }}
                >
                  {t('CLEAR_FILTERS')}
                </Button>

                {selectedUsers.length > 0 && (
                  <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={() => {
                      setBulkAssignDialog({ ...bulkAssignDialog, open: true });
                      loadAvailableActivities();
                    }}
                  >
                    {t('BULK_ASSIGN')} ({selectedUsers.length})
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Enhanced Error Display */}
      {error && (
        <Box sx={{ mb: 3 }}>
          <EnhancedErrorDisplay
            error={error}
            onRetry={loadUsers}
            onDismiss={() => setError(null)}
            showDetails={false}
            context="User Search and Assignment"
          />
        </Box>
      )}

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={users?.data.length > 0 && selectedUsers.length === users?.data.length}
                  indeterminate={selectedUsers.length > 0 && selectedUsers.length < (users?.data.length || 0)}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>{t('USER')}</TableCell>
              <TableCell>{t('USER_TYPE')}</TableCell>
              <TableCell>{t('CURRENT_ACTIVITY')}</TableCell>
              <TableCell>{t('CURRENT_TEAM')}</TableCell>
              <TableCell>{t('STATUS')}</TableCell>
              <TableCell>{t('ASSIGNED_AT')}</TableCell>
              <TableCell>{t('ACTIONS')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                  <Stack spacing={2} alignItems="center">
                    <PersonIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                    <Typography variant="h6" color="text.secondary">
                      {t('NO_USERS_FOUND')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('TRY_ADJUSTING_FILTERS')}
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              users?.data.map((userWithActivity) => (
                <TableRow key={userWithActivity.user.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedUsers.includes(userWithActivity.user.id)}
                      onChange={() => handleSelectUser(userWithActivity.user.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 40, height: 40 }}>
                        {AdminUserActivityService.formatUserDisplayName(userWithActivity.user)?.charAt(0)?.toUpperCase() || '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {AdminUserActivityService.formatUserDisplayName(userWithActivity.user) || t('UNKNOWN')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {userWithActivity.user.email || t('NO_EMAIL')}
                        </Typography>
                        {!userWithActivity.user.isActive && (
                          <Chip
                            label={t('ACTIVITY_STATUS_INACTIVE')}
                            color="error"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t(getUserTypeTranslationKey(userWithActivity.user.userType))}
                      color={AdminUserActivityService.getUserTypeColor(userWithActivity.user.userType)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {userWithActivity.currentActivity ? (
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {userWithActivity.currentActivity.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {userWithActivity.currentActivity.activityType}
                        </Typography>
                      </Box>
                    ) : (
                      <Chip
                        label={t('UNASSIGNED')}
                        color="default"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {userWithActivity.currentTeam ? (
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {userWithActivity.currentTeam.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {userWithActivity.currentTeam.isLeader ? t('TEAM_LEADER') : t('TEAM_MEMBER')}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {t('NO_TEAM')}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {userWithActivity.currentActivity ? (
                      <Chip
                        icon={getStatusIcon(userWithActivity.currentActivity.status)}
                        label={t(userWithActivity.currentActivity.status)}
                        color={AdminUserActivityService.getStatusColor(userWithActivity.currentActivity.status)}
                        size="small"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {t('N_A')}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {userWithActivity.currentActivity ? (
                      <Typography variant="body2">
                        {formatDate(userWithActivity.currentActivity.enrolledAt)}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {t('N_A')}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {canAssignUser(userWithActivity) ? (
                        <Tooltip title={t('ASSIGN_TO_ACTIVITY')}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setAssignDialog({
                                open: true,
                                user: userWithActivity,
                                selectedActivity: '',
                                reason: '',
                                forceAssignment: false,
                              });
                              loadAvailableActivities();
                            }}
                          >
                            <PersonAddIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <>
                          <Tooltip title={t('TRANSFER_TO_ANOTHER_ACTIVITY')}>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setTransferDialog({
                                  open: true,
                                  user: userWithActivity,
                                  newActivity: '',
                                  reason: '',
                                });
                                loadAvailableActivities();
                              }}
                            >
                              <SwapHorizIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('REMOVE_FROM_ACTIVITY')}>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveUser(userWithActivity)}
                            >
                              <PersonRemoveIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      <Tooltip title={t('VIEW_USER_HISTORY')}>
                        <IconButton
                          size="small"
                          onClick={() => {/* TODO: Open user history */}}
                        >
                          <HistoryIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('SEND_EMAIL')}>
                        <IconButton
                          size="small"
                          onClick={() => window.open(`mailto:${userWithActivity.user.email}`, '_blank')}
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
      {users && users.total > 0 && (
        <TablePagination
          component="div"
          count={users.total}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handlePageSizeChange}
          rowsPerPageOptions={[10, 20, 50, 100]}
        />
      )}

      {/* Assignment Dialog */}
      <Dialog
        open={assignDialog.open}
        onClose={() => setAssignDialog({ ...assignDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('ASSIGN_USER_TO_ACTIVITY')}</DialogTitle>
        <DialogContent>
          {assignDialog.user && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" gutterBottom>
                <strong>{t('USER')}:</strong> {AdminUserActivityService.formatUserDisplayName(assignDialog.user.user)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {assignDialog.user.user.email}
              </Typography>
            </Box>
          )}
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{t('SELECT_ACTIVITY')}</InputLabel>
                <Select
                  value={assignDialog.selectedActivity}
                  onChange={(e) => setAssignDialog({
                    ...assignDialog,
                    selectedActivity: e.target.value
                  })}
                  label={t('SELECT_ACTIVITY')}
                  disabled={loadingActivities}
                >
                  {loadingActivities ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      {t('LOADING_ACTIVITIES')}
                    </MenuItem>
                  ) : (
                    availableActivities.map((activity) => (
                      <MenuItem key={activity.id} value={activity.id}>
                        <Tooltip 
                          title={
                            <Box>
                              <Typography variant="body2" fontWeight="medium">{activity.name}</Typography>
                              <Typography variant="caption">{activity.activityType}</Typography>
                              <Typography variant="caption" display="block">
                                {format(new Date(activity.startAt), 'yyyy-MM-dd')} - {format(new Date(activity.endAt), 'yyyy-MM-dd')}
                              </Typography>
                            </Box>
                          }
                          arrow
                          placement="right"
                        >
                          <Box sx={{ width: '100%', minWidth: 0 }}>
                            <Typography 
                              variant="body2" 
                              fontWeight="medium"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '300px'
                              }}
                            >
                              {activity.name}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'block',
                                maxWidth: '300px'
                              }}
                            >
                              {activity.activityType} • {format(new Date(activity.startAt), 'MM-dd')} - {format(new Date(activity.endAt), 'MM-dd')}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('REASON')}
                multiline
                rows={3}
                value={assignDialog.reason}
                onChange={(e) => setAssignDialog({
                  ...assignDialog,
                  reason: e.target.value
                })}
                placeholder={t('ASSIGNMENT_REASON_PLACEHOLDER')}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={assignDialog.forceAssignment}
                    onChange={(e) => setAssignDialog({
                      ...assignDialog,
                      forceAssignment: e.target.checked
                    })}
                  />
                }
                label={t('FORCE_ASSIGNMENT')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setAssignDialog({ ...assignDialog, open: false })}
            disabled={operationLoading}
          >
            {t('CANCEL')}
          </Button>
          <Button
            onClick={handleAssignUser}
            variant="contained"
            disabled={operationLoading || !assignDialog.selectedActivity}
          >
            {operationLoading ? <CircularProgress size={20} /> : t('ASSIGN')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transfer User to Another Activity Dialog */}
      <Dialog
        open={transferDialog.open}
        onClose={() => setTransferDialog({ ...transferDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('TRANSFER_USER_ACTIVITY')}</DialogTitle>
        <DialogContent>
          {transferDialog.user && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" gutterBottom>
                <strong>{t('USER')}:</strong> {AdminUserActivityService.formatUserDisplayName(transferDialog.user.user)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {transferDialog.user.user.email}
              </Typography>
              {transferDialog.user.currentActivity && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <strong>{t('CURRENT_ACTIVITY')}:</strong> {transferDialog.user.currentActivity.name}
                </Typography>
              )}
            </Box>
          )}
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{t('SELECT_NEW_ACTIVITY')}</InputLabel>
                <Select
                  value={transferDialog.newActivity}
                  onChange={(e) => setTransferDialog({
                    ...transferDialog,
                    newActivity: e.target.value
                  })}
                  label={t('SELECT_NEW_ACTIVITY')}
                  disabled={loadingActivities}
                >
                  {loadingActivities ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      {t('LOADING_ACTIVITIES')}
                    </MenuItem>
                  ) : (
                    availableActivities
                      .filter(activity => activity.id !== transferDialog.user?.currentActivity?.id) // Exclude current activity
                      .map((activity) => (
                        <MenuItem key={activity.id} value={activity.id}>
                          <Tooltip 
                            title={
                              <Box>
                                <Typography variant="body2" fontWeight="medium">{activity.name}</Typography>
                                <Typography variant="caption">{activity.activityType}</Typography>
                                <Typography variant="caption" display="block">
                                  {format(new Date(activity.startAt), 'yyyy-MM-dd')} - {format(new Date(activity.endAt), 'yyyy-MM-dd')}
                                </Typography>
                              </Box>
                            }
                            arrow
                            placement="right"
                          >
                            <Box sx={{ width: '100%', minWidth: 0 }}>
                              <Typography 
                                variant="body2" 
                                fontWeight="medium"
                                sx={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: '300px'
                                }}
                              >
                                {activity.name}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                color="text.secondary"
                                sx={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  display: 'block',
                                  maxWidth: '300px'
                                }}
                              >
                                {activity.activityType} • {format(new Date(activity.startAt), 'MM-dd')} - {format(new Date(activity.endAt), 'MM-dd')}
                              </Typography>
                            </Box>
                          </Tooltip>
                        </MenuItem>
                      ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('REASON')}
                multiline
                rows={3}
                value={transferDialog.reason}
                onChange={(e) => setTransferDialog({
                  ...transferDialog,
                  reason: e.target.value
                })}
                placeholder={t('TRANSFER_REASON_PLACEHOLDER')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setTransferDialog({ ...transferDialog, open: false })}
            disabled={operationLoading}
          >
            {t('CANCEL')}
          </Button>
          <Button
            onClick={handleTransferUser}
            variant="contained"
            disabled={operationLoading || !transferDialog.newActivity}
          >
            {operationLoading ? <CircularProgress size={20} /> : t('TRANSFER')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Assign Dialog */}
      <Dialog
        open={bulkAssignDialog.open}
        onClose={() => setBulkAssignDialog({ ...bulkAssignDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('BULK_ASSIGN_USERS')}</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" gutterBottom>
              <strong>{t('SELECTED_USERS')}:</strong> {selectedUsers.length} {t('USERS')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('BULK_ASSIGN_DESCRIPTION')}
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{t('SELECT_ACTIVITY')}</InputLabel>
                <Select
                  value={bulkAssignDialog.activityId}
                  onChange={(e) => setBulkAssignDialog({
                    ...bulkAssignDialog,
                    activityId: e.target.value
                  })}
                  label={t('SELECT_ACTIVITY')}
                  disabled={loadingActivities}
                >
                  {loadingActivities ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      {t('LOADING_ACTIVITIES')}
                    </MenuItem>
                  ) : (
                    availableActivities.map((activity) => (
                      <MenuItem key={activity.id} value={activity.id}>
                        <Tooltip 
                          title={
                            <Box>
                              <Typography variant="body2" fontWeight="medium">{activity.name}</Typography>
                              <Typography variant="caption">{activity.activityType}</Typography>
                              <Typography variant="caption" display="block">
                                {format(new Date(activity.startAt), 'yyyy-MM-dd')} - {format(new Date(activity.endAt), 'yyyy-MM-dd')}
                              </Typography>
                            </Box>
                          }
                          arrow
                          placement="right"
                        >
                          <Box sx={{ width: '100%', minWidth: 0 }}>
                            <Typography 
                              variant="body2" 
                              fontWeight="medium"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '300px'
                              }}
                            >
                              {activity.name}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'block',
                                maxWidth: '300px'
                              }}
                            >
                              {activity.activityType} • {format(new Date(activity.startAt), 'MM-dd')} - {format(new Date(activity.endAt), 'MM-dd')}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('REASON')}
                multiline
                rows={3}
                value={bulkAssignDialog.reason}
                onChange={(e) => setBulkAssignDialog({
                  ...bulkAssignDialog,
                  reason: e.target.value
                })}
                placeholder={t('BULK_ASSIGNMENT_REASON_PLACEHOLDER')}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={bulkAssignDialog.forceAssignment}
                    onChange={(e) => setBulkAssignDialog({
                      ...bulkAssignDialog,
                      forceAssignment: e.target.checked
                    })}
                  />
                }
                label={t('FORCE_ASSIGNMENT')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setBulkAssignDialog({ ...bulkAssignDialog, open: false })}
            disabled={operationLoading}
          >
            {t('CANCEL')}
          </Button>
          <Button
            onClick={handleBulkAssign}
            variant="contained"
            disabled={operationLoading || !bulkAssignDialog.activityId}
          >
            {operationLoading ? <CircularProgress size={20} /> : t('BULK_ASSIGN')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Operation Results Dialog */}
      <Dialog
        open={showResults && operationResult !== null}
        onClose={() => {
          setShowResults(false);
          setOperationResult(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t('BULK_OPERATION_RESULTS')}</DialogTitle>
        <DialogContent>
          {operationResult && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h6" color="success.main">
                      {operationResult.successCount}
                    </Typography>
                    <Typography variant="body2">
                      {t('SUCCESSFUL')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <ErrorIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                    <Typography variant="h6" color="error.main">
                      {operationResult.failedCount}
                    </Typography>
                    <Typography variant="body2">
                      {t('FAILED')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <WarningIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                    <Typography variant="h6" color="warning.main">
                      {operationResult.totalCount - operationResult.successCount - operationResult.failedCount}
                    </Typography>
                    <Typography variant="body2">
                      {t('SKIPPED')}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {operationResult.details?.filter(d => !d.success).length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom color="error.main">
                    {t('FAILED_ASSIGNMENTS')}
                  </Typography>
                  {operationResult.details?.filter(d => !d.success).map((result, index) => (
                    <Alert key={index} severity="error" sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        <strong>{result.userId}:</strong> {result.error || 'Unknown error'}
                      </Typography>
                    </Alert>
                  ))}
                </Box>
              )}

              {operationResult.successCount > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom color="success.main">
                    {t('SUCCESSFUL_ASSIGNMENTS')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {operationResult.successCount} {t('USERS_SUCCESSFULLY_ASSIGNED')}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowResults(false);
              setOperationResult(null);
            }}
            variant="contained"
          >
            {t('CLOSE')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserSearchAndAssignment;