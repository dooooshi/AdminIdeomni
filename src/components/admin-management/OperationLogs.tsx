'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Card,
  CardContent,
  Collapse,
  Alert,
  CircularProgress,
  TablePagination,
  Stack,
  Tooltip,
  Divider,
  TableSortLabel,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  Computer as ComputerIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AdminService, { 
  Admin, 
  AdminOperationLogsParams, 
  OperationLogsSearchResponseDto,
  OperationLogDetailsDto 
} from '@/lib/services/adminService';

interface OperationLogsProps {
  open: boolean;
  onClose: () => void;
  admin?: Admin | null; // If provided, show logs for specific admin
  title?: string;
}

interface LogsFilter {
  search: string;
  action: string;
  resource: string;
  startDate: Date | null;
  endDate: Date | null;
  sortBy: 'createdAt' | 'action' | 'resource';
  sortOrder: 'asc' | 'desc';
}

const OperationLogs: React.FC<OperationLogsProps> = ({
  open,
  onClose,
  admin,
  title,
}) => {
  const { t } = useTranslation('adminManagement');
  const [logsData, setLogsData] = useState<OperationLogsSearchResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  
  // Filters state
  const [filters, setFilters] = useState<LogsFilter>({
    search: '',
    action: '',
    resource: '',
    startDate: null,
    endDate: null,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Debounced search to avoid too many API calls
  const [searchValue, setSearchValue] = useState('');
  const [searchDebounceTimeout, setSearchDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  // Available filter options (loaded from current data)
  const [filterOptions, setFilterOptions] = useState<{
    actions: string[];
    resources: string[];
  }>({
    actions: [],
    resources: [],
  });

  const loadLogs = async (params?: Partial<AdminOperationLogsParams>) => {
    if (!admin) return;

    try {
      setLoading(true);
      setError(null);

      const requestParams: AdminOperationLogsParams = {
        page: page + 1, // Convert to 1-based pagination for API
        pageSize,
        action: filters.action || undefined,
        resource: filters.resource || undefined,
        startDate: filters.startDate?.toISOString(),
        endDate: filters.endDate?.toISOString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...params
      };

      // Add search filter if provided
      if (filters.search) {
        // Since the API doesn't support text search, we'll handle it client-side
        // This is a limitation that should be addressed in the backend
      }

      const data = await AdminService.getAdminLogs(admin.id, requestParams);
      setLogsData(data);

      // Update filter options based on current data
      const actions = new Set<string>();
      const resources = new Set<string>();
      
      data.data.forEach(log => {
        if (log.action) actions.add(log.action);
        if (log.resource) resources.add(log.resource);
      });

      setFilterOptions({
        actions: Array.from(actions).sort(),
        resources: Array.from(resources).sort(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('LOADING_LOGS'));
      setLogsData(null);
    } finally {
      setLoading(false);
    }
  };

  // Load data when dependencies change
  useEffect(() => {
    if (open && admin) {
      loadLogs();
    }
  }, [open, admin, page, pageSize, filters.action, filters.resource, filters.startDate, filters.endDate, filters.sortBy, filters.sortOrder, filters.search]);

  // Handle search with debouncing - only trigger when user actually types
  useEffect(() => {
    // Skip if searchValue is empty on initial load
    if (!searchValue) {
      return;
    }

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

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setPage(0);
      setExpandedLog(null);
      setError(null);
    }
  }, [open]);

  const handleFilterChange = (field: keyof LogsFilter, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const handleSortChange = (field: 'createdAt' | 'action' | 'resource') => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
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

  const handleExpandLog = (logId: string) => {
    setExpandedLog(expandedLog === logId ? null : logId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatAction = (action: string) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getActionIcon = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('create')) return <CheckIcon color="success" />;
    if (actionLower.includes('update')) return <InfoIcon color="info" />;
    if (actionLower.includes('delete')) return <ErrorIcon color="error" />;
    return <ScheduleIcon color="primary" />;
  };

  const getActionColor = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('create')) return 'success';
    if (actionLower.includes('update')) return 'info';
    if (actionLower.includes('delete')) return 'error';
    return 'primary';
  };

  const renderLogDetails = (log: OperationLogDetailsDto) => {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          {t('LOG_DETAILS')}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">{t('ADMIN')}</Typography>
            <Typography variant="body2">{log.admin.username}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">{t('RESOURCE_ID')}</Typography>
            <Typography variant="body2">{log.resourceId || t('NOT_AVAILABLE')}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">{t('IP_ADDRESS')}</Typography>
            <Typography variant="body2">{log.ipAddress || t('UNKNOWN')}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">{t('USER_AGENT')}</Typography>
            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
              {log.userAgent || t('UNKNOWN')}
            </Typography>
          </Box>
        </Box>

        {/* Details object */}
        {log.details && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('OPERATION_DETAILS')}
            </Typography>
            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(log.details, null, 2)}
              </pre>
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  const logs = logsData?.data || [];
  const totalCount = logsData?.total || 0;

  // Client-side search filtering (since API doesn't support text search)
  const filteredLogs = useMemo(() => {
    if (!filters.search) return logs;
    
    const searchLower = filters.search.toLowerCase();
    return logs.filter(log => 
      log.action.toLowerCase().includes(searchLower) ||
      log.resource.toLowerCase().includes(searchLower) ||
      log.resourceId?.toLowerCase().includes(searchLower) ||
      log.ipAddress?.toLowerCase().includes(searchLower) ||
      log.admin.username.toLowerCase().includes(searchLower)
    );
  }, [logs, filters.search]);

  // Stats calculations
  const stats = useMemo(() => {
    if (!logsData) return { total: 0, actions: 0, resources: 0 };
    
    return {
      total: logsData.total,
      actions: filterOptions.actions.length,
      resources: filterOptions.resources.length,
    };
  }, [logsData, filterOptions]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="xl" 
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              {title || (admin ? `${t('ADMIN_LOGS_TITLE')} - ${admin.username}` : t('SYSTEM_LOGS_TITLE'))}
            </Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
          {admin && (
            <Typography variant="body2" color="text.secondary">
              {admin.email} ({admin.role || (admin.adminType === 1 ? t('SUPER_ADMIN') : t('LIMITED_ADMIN'))})
            </Typography>
          )}
        </DialogTitle>

        <DialogContent>
          {/* Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                  <TextField
                    placeholder={t('SEARCH_LOGS_PLACEHOLDER')}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    size="small"
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                    sx={{ minWidth: 300 }}
                  />
                  
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>{t('ACTION')}</InputLabel>
                    <Select
                      value={filters.action}
                      label={t('ACTION')}
                      onChange={(e) => handleFilterChange('action', e.target.value)}
                    >
                      <MenuItem value="">{t('ALL_ACTIONS')}</MenuItem>
                      {filterOptions.actions.map(action => (
                        <MenuItem key={action} value={action}>
                          {formatAction(action)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>{t('RESOURCE')}</InputLabel>
                    <Select
                      value={filters.resource}
                      label={t('RESOURCE')}
                      onChange={(e) => handleFilterChange('resource', e.target.value)}
                    >
                      <MenuItem value="">{t('ALL_RESOURCES')}</MenuItem>
                      {filterOptions.resources.map(resource => (
                        <MenuItem key={resource} value={resource}>
                          {resource}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => loadLogs()}
                    size="small"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={20} /> : 'Refresh'}
                  </Button>
                </Stack>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <DatePicker
                    label={t('START_DATE')}
                    value={filters.startDate}
                    onChange={(date) => handleFilterChange('startDate', date)}
                    slotProps={{ textField: { size: 'small' } }}
                  />
                  <DatePicker
                    label={t('END_DATE')}
                    value={filters.endDate}
                    onChange={(date) => handleFilterChange('endDate', date)}
                    slotProps={{ textField: { size: 'small' } }}
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Stats */}
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Chip
                icon={<ScheduleIcon />}
                label={`${stats.total} Operations`}
                variant="outlined"
              />
              <Chip
                icon={<InfoIcon />}
                label={`${stats.actions} Action Types`}
                color="info"
                variant="outlined"
              />
              <Chip
                icon={<PersonIcon />}
                label={`${stats.resources} Resource Types`}
                color="primary"
                variant="outlined"
              />
            </Stack>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Loading */}
          {loading && !logsData && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Logs Table */}
          {!loading || logsData ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width={40}></TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={filters.sortBy === 'action'}
                        direction={filters.sortBy === 'action' ? filters.sortOrder : 'asc'}
                        onClick={() => handleSortChange('action')}
                      >
                        Operation
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={filters.sortBy === 'resource'}
                        direction={filters.sortBy === 'resource' ? filters.sortOrder : 'asc'}
                        onClick={() => handleSortChange('resource')}
                      >
                        Resource
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Admin</TableCell>
                    <TableCell>IP Address</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={filters.sortBy === 'createdAt'}
                        direction={filters.sortBy === 'createdAt' ? filters.sortOrder : 'asc'}
                        onClick={() => handleSortChange('createdAt')}
                      >
                        Timestamp
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No operation logs found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <React.Fragment key={log.id}>
                        <TableRow hover>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleExpandLog(log.id)}
                            >
                              {expandedLog === log.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          </TableCell>
                          
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getActionIcon(log.action)}
                              <Chip
                                label={formatAction(log.action)}
                                color={getActionColor(log.action) as any}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          </TableCell>
                          
                          <TableCell>
                            <Chip
                              label={log.resource}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {log.admin.username}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {log.admin.email}
                              </Typography>
                            </Box>
                          </TableCell>
                          
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ComputerIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {log.ipAddress || 'Unknown'}
                              </Typography>
                            </Box>
                          </TableCell>
                          
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(log.createdAt)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        
                        {/* Expanded Row */}
                        <TableRow>
                          <TableCell colSpan={6} sx={{ py: 0 }}>
                            <Collapse in={expandedLog === log.id} timeout="auto" unmountOnExit>
                              <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
                                {renderLogDetails(log)}
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
              
              <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={handlePageChange}
                rowsPerPage={pageSize}
                onRowsPerPageChange={handlePageSizeChange}
                rowsPerPageOptions={[10, 20, 50, 100]}
                showFirstButton
                showLastButton
              />
            </TableContainer>
          ) : null}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default OperationLogs; 