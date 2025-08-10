'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  Stack,
  Card,
  CardContent,
  Grid,
  Avatar,
  Tooltip,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  History as HistoryIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { format, differenceInDays, isPast, isFuture } from 'date-fns';
import UserActivityService, {
  ActivityParticipant,
  UserActivityStatus,
  UserActivityHistoryParams,
  ParticipantsResponse,
} from '@/lib/services/userActivityService';
import { UserService, User } from '@/lib/services/userService';

interface UserActivityHistoryProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

interface HistoryFilters {
  status: UserActivityStatus | '';
  includeUpcoming: boolean;
  includePast: boolean;
}

const UserActivityHistory: React.FC<UserActivityHistoryProps> = ({
  open,
  onClose,
  userId,
}) => {
  const { t } = useTranslation('activityManagement');
  const theme = useTheme();

  // State management
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<ParticipantsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  
  // Filter state
  const [filters, setFilters] = useState<HistoryFilters>({
    status: '',
    includeUpcoming: true,
    includePast: true,
  });

  // Load user data
  useEffect(() => {
    if (open && userId) {
      loadUserData();
    }
  }, [open, userId]);

  const loadUserData = async () => {
    try {
      setUserLoading(true);
      const userData = await UserService.getUserById(userId);
      setUser(userData);
    } catch (err) {
      console.error('Failed to load user data:', err);
      setError(t('FAILED_TO_LOAD_USER'));
    } finally {
      setUserLoading(false);
    }
  };

  // Load activity history
  const loadActivityHistory = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      
      const params: UserActivityHistoryParams = {
        page: page + 1, // Convert to 1-based pagination
        pageSize,
        status: filters.status || undefined,
        includeUpcoming: filters.includeUpcoming,
        includePast: filters.includePast,
      };

      const data = await UserActivityService.getUserActivityHistory(userId, params);
      setActivities(data);
    } catch (err) {
      console.error('Failed to load activity history:', err);
      setError(err instanceof Error ? err.message : t('HISTORY_LOAD_ERROR'));
      // Set empty data structure to prevent errors
      setActivities({
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
  }, [userId, page, pageSize, filters, t]);

  // Load data when dependencies change
  useEffect(() => {
    if (open) {
      loadActivityHistory();
    }
  }, [open, loadActivityHistory]);

  // Handle filter changes
  const handleFilterChange = (field: keyof HistoryFilters, value: any) => {
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

  // Format display values
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
  };

  const formatUserDisplayName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
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

  const getActivityTimeStatus = (activity: any) => {
    const now = new Date();
    const startTime = new Date(activity.activity.startAt);
    const endTime = new Date(activity.activity.endAt);

    if (isFuture(startTime)) {
      return {
        label: t('UPCOMING'),
        color: 'info' as const,
        icon: <CalendarTodayIcon fontSize="small" />
      };
    } else if (isPast(endTime)) {
      return {
        label: t('COMPLETED_TIME'),
        color: 'default' as const,
        icon: <AccessTimeIcon fontSize="small" />
      };
    } else {
      return {
        label: t('ONGOING'),
        color: 'success' as const,
        icon: <AccessTimeIcon fontSize="small" />
      };
    }
  };

  const getActivityDuration = (startAt: string, endAt: string) => {
    const start = new Date(startAt);
    const end = new Date(endAt);
    const diffInHours = Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const minutes = Math.round(diffInHours * 60);
      return `${minutes} ${t('MINUTES')}`;
    } else if (diffInHours < 24) {
      return `${diffInHours.toFixed(1)} ${t('HOURS')}`;
    } else {
      const days = Math.round(diffInHours / 24);
      return `${days} ${t('DAYS')}`;
    }
  };

  const handleClose = () => {
    onClose();
    // Reset state when closing
    setUser(null);
    setActivities(null);
    setPage(0);
    setFilters({
      status: '',
      includeUpcoming: true,
      includePast: true,
    });
    setError(null);
  };

  if (!open) {
    return null;
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon />
          {t('USER_ACTIVITY_HISTORY')}
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* User Information */}
        {userLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <CircularProgress size={20} />
            <Typography>{t('LOADING_USER_INFO')}</Typography>
          </Box>
        ) : user ? (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 56, height: 56 }}>
                  {formatUserDisplayName(user).charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">
                    {formatUserDisplayName(user)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={UserActivityService.getUserTypeDisplayName(user.userType)}
                      color={UserActivityService.getUserTypeColor(user.userType)}
                      size="small"
                    />
                    {!user.isActive && (
                      <Chip
                        label={t('INACTIVE')}
                        color="error"
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ) : null}

        {/* Statistics */}
        {activities?.statistics && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="primary">
                    {activities.statistics.totalParticipants}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('TOTAL_ACTIVITIES')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="success.main">
                    {activities.statistics.completed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('COMPLETED')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="info.main">
                    {activities.statistics.enrolled}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('ENROLLED')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="warning.main">
                    {activities.statistics.cancelled + activities.statistics.noShow}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('CANCELLED_NO_SHOW')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              {t('FILTERS')}
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.includeUpcoming}
                      onChange={(e) => handleFilterChange('includeUpcoming', e.target.checked)}
                    />
                  }
                  label={t('INCLUDE_UPCOMING')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.includePast}
                      onChange={(e) => handleFilterChange('includePast', e.target.checked)}
                    />
                  }
                  label={t('INCLUDE_PAST')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadActivityHistory}
                  disabled={loading}
                  fullWidth
                >
                  {t('REFRESH')}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Activities Table */}
        {loading && !activities ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>{t('LOADING_ACTIVITY_HISTORY')}</Typography>
          </Box>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('ACTIVITY')}</TableCell>
                    <TableCell>{t('TYPE')}</TableCell>
                    <TableCell>{t('STATUS')}</TableCell>
                    <TableCell>{t('TIME_STATUS')}</TableCell>
                    <TableCell>{t('DURATION')}</TableCell>
                    <TableCell>{t('START_DATE')}</TableCell>
                    <TableCell>{t('END_DATE')}</TableCell>
                    <TableCell>{t('ENROLLED_AT')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activities?.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                        <Stack spacing={2} alignItems="center">
                          <EventIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                          <Typography variant="h6" color="text.secondary">
                            {t('NO_ACTIVITY_HISTORY')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t('NO_ACTIVITY_HISTORY_MESSAGE')}
                          </Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ) : (
                    activities?.data.map((participation) => {
                      const timeStatus = getActivityTimeStatus(participation);
                      return (
                        <TableRow key={participation.id}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {participation.activity.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {participation.activity.activityType}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(participation.status)}
                              label={UserActivityService.getStatusDisplayName(participation.status)}
                              color={UserActivityService.getStatusColor(participation.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={timeStatus.icon}
                              label={timeStatus.label}
                              color={timeStatus.color}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {getActivityDuration(participation.activity.startAt, participation.activity.endAt)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(participation.activity.startAt)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(participation.activity.endAt)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(participation.enrolledAt)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {activities && activities.total > 0 && (
              <TablePagination
                component="div"
                count={activities.total}
                page={page}
                onPageChange={handlePageChange}
                rowsPerPage={pageSize}
                onRowsPerPageChange={handlePageSizeChange}
                rowsPerPageOptions={[10, 20, 50, 100]}
              />
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="contained">
          {t('CLOSE')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserActivityHistory; 