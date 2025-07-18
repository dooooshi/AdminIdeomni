'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  TablePagination,
  Stack,
  Card,
  CardContent,
  TableSortLabel,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Restore as RestoreIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Event as EventIcon,
  AccessTime as TimeIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// Import locales for DatePicker
import { enUS } from 'date-fns/locale/en-US';
import { zhCN } from 'date-fns/locale/zh-CN';
import { format } from 'date-fns';
import useI18n from '@i18n/useI18n';
import ActivityService, { 
  Activity, 
  ActivitySearchParams, 
  ActivitySearchResponse, 
  ActivityType 
} from '@/lib/services/activityService';

interface ActivityListProps {
  onCreateActivity: () => void;
  onEditActivity: (activity: Activity) => void;
  onViewActivity?: (activity: Activity) => void;
}

interface ActivityListFilter {
  search: string;
  activityType: ActivityType | '';
  isActive: boolean | '';
  includeDeleted: boolean;
  startFrom?: Date | null;
  startUntil?: Date | null;
  endFrom?: Date | null;
  endUntil?: Date | null;
}

const ActivityList: React.FC<ActivityListProps> = ({
  onCreateActivity,
  onEditActivity,
  onViewActivity,
}) => {
  const { t } = useTranslation('activityManagement');
  const { languageId } = useI18n();
  const theme = useTheme();
  const [activityData, setActivityData] = useState<ActivitySearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);
  const [activityToRestore, setActivityToRestore] = useState<Activity | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(0); // Material-UI uses 0-based pagination
  const [pageSize, setPageSize] = useState(20);
  
  // Get the appropriate date-fns locale
  const dateLocale = languageId === 'zh-CN' ? zhCN : enUS;
  
  // Filters state
  const [filters, setFilters] = useState<ActivityListFilter>({
    search: '',
    activityType: '',
    isActive: '',
    includeDeleted: false,
    startFrom: null,
    startUntil: null,
    endFrom: null,
    endUntil: null,
  });

  // Search debouncing
  const [searchValue, setSearchValue] = useState('');
  const [searchDebounceTimeout, setSearchDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  const loadActivities = async (params?: Partial<ActivitySearchParams>) => {
    try {
      setLoading(true);
      setError(null);
      
      const requestParams: ActivitySearchParams = {
        page: page + 1, // Convert to 1-based pagination for API
        pageSize,
        name: filters.search || undefined,
        activityType: filters.activityType || undefined,
        isActive: filters.isActive !== '' ? filters.isActive : undefined,
        includeDeleted: filters.includeDeleted,
        startFrom: filters.startFrom?.toISOString(),
        startUntil: filters.startUntil?.toISOString(),
        endFrom: filters.endFrom?.toISOString(),
        endUntil: filters.endUntil?.toISOString(),
        ...params
      };

      const data = await ActivityService.searchActivities(requestParams);
      
      // Development mode logging
      if (process.env.NODE_ENV === 'development') {
        console.log('API Response:', data);
        console.log('Request Params:', requestParams);
      }
      
      // Validate response structure
      if (data && typeof data === 'object') {
        setActivityData(data);
      } else {
        console.error('Invalid API response structure:', data);
        setError(t('ACTIVITY_LOAD_ERROR'));
        setActivityData({ data: [], total: 0, page: 1, pageSize: 20, totalPages: 0, hasNext: false, hasPrevious: false });
      }
    } catch (err) {
      console.error('Activity loading error:', err);
      
      // Check if it's a 404 or network error (API endpoint doesn't exist)
      const isApiNotFound = err instanceof Error && (
        err.message.includes('404') || 
        err.message.includes('Not Found') ||
        err.message.includes('Network Error')
      );
      
      if (isApiNotFound && process.env.NODE_ENV === 'development') {
        // Show a helpful message for development
        setError(`${t('ACTIVITY_LOAD_ERROR')} - API endpoint /api/activity may not be implemented yet. This is expected during development.`);
      } else {
        setError(err instanceof Error ? err.message : t('ACTIVITY_LOAD_ERROR'));
      }
      
      // Set empty data structure to prevent map errors
      setActivityData({ data: [], total: 0, page: 1, pageSize: 20, totalPages: 0, hasNext: false, hasPrevious: false });
    } finally {
      setLoading(false);
    }
  };

  // Load data when dependencies change
  useEffect(() => {
    loadActivities();
  }, [page, pageSize, filters]);

  // Handle search with debouncing
  useEffect(() => {
    if (!searchValue && filters.search) {
      setFilters(prev => ({ ...prev, search: '' }));
      setPage(0);
      return;
    }

    if (!searchValue) return;

    if (searchDebounceTimeout) {
      clearTimeout(searchDebounceTimeout);
    }

    const timeout = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchValue }));
      setPage(0);
    }, 500);

    setSearchDebounceTimeout(timeout);

    return () => {
      if (searchDebounceTimeout) {
        clearTimeout(searchDebounceTimeout);
      }
    };
  }, [searchValue]);

  const handleFilterChange = (field: keyof ActivityListFilter, value: any) => {
    // Convert string boolean values back to actual booleans for isActive
    let processedValue = value;
    if (field === 'isActive' && typeof value === 'string') {
      if (value === 'true') processedValue = true;
      else if (value === 'false') processedValue = false;
      else processedValue = '';
    }
    setFilters(prev => ({ ...prev, [field]: processedValue }));
    setPage(0);
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPageSize = parseInt(event.target.value, 10);
    setPageSize(newPageSize);
    setPage(0);
  };

  const handleDeleteClick = (activity: Activity) => {
    setActivityToDelete(activity);
    setDeleteDialogOpen(true);
  };

  const handleRestoreClick = (activity: Activity) => {
    setActivityToRestore(activity);
    setRestoreDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!activityToDelete) return;

    try {
      setDeleting(true);
      await ActivityService.deleteActivity(activityToDelete.id);
      await loadActivities();
      setDeleteDialogOpen(false);
      setActivityToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('ACTIVITY_DELETE_ERROR'));
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setActivityToDelete(null);
  };

  const handleRestoreConfirm = async () => {
    if (!activityToRestore) return;

    try {
      setRestoring(true);
      await ActivityService.restoreActivity(activityToRestore.id);
      await loadActivities();
      setRestoreDialogOpen(false);
      setActivityToRestore(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('ACTIVITY_RESTORE_ERROR'));
    } finally {
      setRestoring(false);
    }
  };

  const handleRestoreCancel = () => {
    setRestoreDialogOpen(false);
    setActivityToRestore(null);
  };

  const getActivityTypeDisplayName = (type: ActivityType) => {
    switch (type) {
      case ActivityType.BizSimulation2_0:
        return t('BIZSIMULATION2_0');
      case ActivityType.BizSimulation2_2:
        return t('BIZSIMULATION2_2');
      case ActivityType.BizSimulation3_1:
        return t('BIZSIMULATION3_1');
      default:
        return type;
    }
  };

  const getActivityStatusColor = (activity: Activity) => {
    if (activity.deletedAt) return 'default';
    
    const status = ActivityService.getActivityStatus(activity);
    switch (status) {
      case 'upcoming':
        return 'info';
      case 'ongoing':
        return 'success';
      case 'completed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getActivityStatusName = (activity: Activity) => {
    if (activity.deletedAt) return t('DELETED');
    
    const status = ActivityService.getActivityStatus(activity);
    switch (status) {
      case 'upcoming':
        return t('UPCOMING');
      case 'ongoing':
        return t('ONGOING');
      case 'completed':
        return t('COMPLETED');
      default:
        return t('UNKNOWN');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    try {
      return format(date, 'PPp', { locale: dateLocale });
    } catch (error) {
      // Fallback to basic formatting if locale formatting fails
      return date.toLocaleDateString(languageId, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const formatDuration = (startAt: string, endAt: string) => {
    const start = new Date(startAt);
    const end = new Date(endAt);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return t('DURATION_DAYS', { days });
    } else {
      return t('DURATION_HOURS', { hours });
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      activityType: '',
      isActive: '',
      includeDeleted: false,
      startFrom: null,
      startUntil: null,
      endFrom: null,
      endUntil: null,
    });
    setSearchValue('');
    setPage(0);
  };

  // Safely extract activities array with fallback
  const activities = React.useMemo(() => {
    if (!activityData) return [];
    
    // Development mode debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('ActivityList - Processing activityData:', activityData);
      console.log('ActivityList - activityData type:', typeof activityData);
      console.log('ActivityList - is Array:', Array.isArray(activityData));
      if (activityData.data) {
        console.log('ActivityList - activityData.data:', activityData.data);
        console.log('ActivityList - activityData.data is Array:', Array.isArray(activityData.data));
      }
    }
    
    // Handle different possible response structures
    if (Array.isArray(activityData)) {
      console.log('ActivityList - Using activityData directly as array, length:', activityData.length);
      return activityData;
    }
    
    if (activityData.data && Array.isArray(activityData.data)) {
      console.log('ActivityList - Using activityData.data as array, length:', activityData.data.length);
      return activityData.data;
    }
    
    // Log unexpected structure for debugging
    console.warn('ActivityList - Unexpected activity data structure:', activityData);
    return [];
  }, [activityData]);

  const totalCount = activityData?.total || 0;
  const currentPageData = activities || [];

  if (loading && !activityData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>{t('LOADING_ACTIVITIES')}</Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={dateLocale}>
      <Box>
              {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="h2">
          {t('ACTIVITY_LIST')}
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => loadActivities()}
            disabled={loading}
          >
            {t('REFRESH_DATA')}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateActivity}
          >
            {t('CREATE_ACTIVITY')}
          </Button>
        </Stack>
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
            <Typography variant="h6" gutterBottom>
              {t('FILTER_BY_TYPE')}
            </Typography>
            <Stack spacing={3}>
              {/* First row - search and basic filters */}
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                <TextField
                  placeholder={t('SEARCH_ACTIVITIES')}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                  fullWidth
                  sx={{ maxWidth: { md: 400 } }}
                />
                
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>{t('ACTIVITY_TYPE_LABEL')}</InputLabel>
                  <Select
                    value={filters.activityType}
                    label={t('ACTIVITY_TYPE_LABEL')}
                    onChange={(e) => handleFilterChange('activityType', e.target.value)}
                  >
                    <MenuItem value="">{t('ALL_TYPES')}</MenuItem>
                    <MenuItem value={ActivityType.BizSimulation2_0}>{t('BIZSIMULATION2_0')}</MenuItem>
                    <MenuItem value={ActivityType.BizSimulation2_2}>{t('BIZSIMULATION2_2')}</MenuItem>
                    <MenuItem value={ActivityType.BizSimulation3_1}>{t('BIZSIMULATION3_1')}</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>{t('STATUS')}</InputLabel>
                  <Select
                    value={filters.isActive}
                    label={t('STATUS')}
                    onChange={(e) => handleFilterChange('isActive', e.target.value)}
                  >
                    <MenuItem value="">{t('ALL_STATUSES')}</MenuItem>
                    <MenuItem value="true">{t('ACTIVE')}</MenuItem>
                    <MenuItem value="false">{t('INACTIVE')}</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.includeDeleted}
                      onChange={(e) => handleFilterChange('includeDeleted', e.target.checked)}
                    />
                  }
                  label={t('INCLUDE_DELETED')}
                />
              </Stack>

              {/* Second row - date filters */}
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                <DatePicker
                  label={t('DATE_FROM')}
                  value={filters.startFrom}
                  onChange={(date) => handleFilterChange('startFrom', date)}
                  slotProps={{ textField: { size: 'small', sx: { minWidth: 150 } } }}
                />
                <DatePicker
                  label={t('DATE_TO')}
                  value={filters.startUntil}
                  onChange={(date) => handleFilterChange('startUntil', date)}
                  slotProps={{ textField: { size: 'small', sx: { minWidth: 150 } } }}
                />
                
                <Button
                  variant="outlined"
                  onClick={clearFilters}
                  sx={{ minWidth: 100 }}
                >
                  {t('CLEAR_FILTERS')}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Activities Table */}
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('ACTIVITY_NAME')}</TableCell>
                <TableCell>{t('ACTIVITY_TYPE')}</TableCell>
                <TableCell>{t('START_DATE')}</TableCell>
                <TableCell>{t('END_DATE')}</TableCell>
                <TableCell>{t('DURATION')}</TableCell>
                <TableCell>{t('STATUS')}</TableCell>
                <TableCell>{t('CREATED_BY')}</TableCell>
                <TableCell>{t('ACTIONS')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentPageData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Stack spacing={2} alignItems="center">
                      <EventIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                      <Typography variant="h6" color="text.secondary">
                        {t('NO_ACTIVITIES_FOUND')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {t('NO_ACTIVITIES_MESSAGE')}
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={onCreateActivity}
                      >
                        {t('CREATE_ACTIVITY')}
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                activities.map((activity) => (
                  <TableRow key={activity.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {activity.name}
                        </Typography>
                        {activity.description && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {activity.description.length > 100 ? 
                              `${activity.description.substring(0, 100)}...` : 
                              activity.description
                            }
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getActivityTypeDisplayName(activity.activityType)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(activity.startAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(activity.endAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDuration(activity.startAt, activity.endAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Chip
                          label={getActivityStatusName(activity)}
                          size="small"
                          color={getActivityStatusColor(activity)}
                        />
                        {!activity.isActive && !activity.deletedAt && (
                          <Chip
                            label={t('INACTIVE')}
                            size="small"
                            color="default"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {activity.createdBy.username}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(activity.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {!activity.deletedAt ? (
                          <>
                            <Tooltip title={t('EDIT_TOOLTIP')}>
                              <IconButton
                                size="small"
                                onClick={() => onEditActivity(activity)}
                                color="primary"
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('DELETE_TOOLTIP')}>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(activity)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : (
                          <Tooltip title={t('RESTORE_TOOLTIP')}>
                            <IconButton
                              size="small"
                              onClick={() => handleRestoreClick(activity)}
                              color="success"
                            >
                              <RestoreIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {totalCount > 0 && (
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={pageSize}
            onRowsPerPageChange={handlePageSizeChange}
            rowsPerPageOptions={[10, 20, 50, 100]}
            labelRowsPerPage={t('ACTIVITIES_PER_PAGE')}
            labelDisplayedRows={({ from, to, count }) =>
              t('SHOWING_ACTIVITIES', { start: from, end: to, total: count !== -1 ? count : `more than ${to}` })
            }
          />
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} maxWidth="sm" fullWidth>
          <DialogTitle>{t('DELETE_ACTIVITY_TITLE')}</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              {t('DELETE_ACTIVITY_MESSAGE', { activityName: activityToDelete?.name })}
            </Typography>
            <Typography variant="body2" color="warning.main">
              {t('DELETE_ACTIVITY_WARNING')}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} disabled={deleting}>
              {t('DELETE_CANCEL')}
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              disabled={deleting}
              startIcon={deleting ? <CircularProgress size={16} /> : <DeleteIcon />}
            >
              {deleting ? t('DELETING_ACTIVITY') : t('DELETE_CONFIRM')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Restore Confirmation Dialog */}
        <Dialog open={restoreDialogOpen} onClose={handleRestoreCancel} maxWidth="sm" fullWidth>
          <DialogTitle>{t('RESTORE_ACTIVITY_TITLE')}</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              {t('RESTORE_ACTIVITY_MESSAGE', { activityName: activityToRestore?.name })}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleRestoreCancel} disabled={restoring}>
              {t('RESTORE_CANCEL')}
            </Button>
            <Button
              onClick={handleRestoreConfirm}
              color="success"
              variant="contained"
              disabled={restoring}
              startIcon={restoring ? <CircularProgress size={16} /> : <RestoreIcon />}
            >
              {restoring ? t('RESTORING_ACTIVITY') : t('RESTORE_CONFIRM')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default ActivityList; 