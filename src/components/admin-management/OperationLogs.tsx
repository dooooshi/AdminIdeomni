'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
import AdminService, { Admin, AdminOperationLog, LogsQueryParams } from '@/lib/services/adminService';

interface OperationLogsProps {
  open: boolean;
  onClose: () => void;
  admin?: Admin | null; // If provided, show logs for specific admin
  title?: string;
}

interface LogsFilter {
  search: string;
  action: string;
  success: 'all' | 'true' | 'false';
  startDate: Date | null;
  endDate: Date | null;
  resource: string;
}

const OperationLogs: React.FC<OperationLogsProps> = ({
  open,
  onClose,
  admin,
  title,
}) => {
  const { t } = useTranslation('adminManagement');
  const [logs, setLogs] = useState<AdminOperationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filters
  const [filters, setFilters] = useState<LogsFilter>({
    search: '',
    action: 'all',
    success: 'all',
    startDate: null,
    endDate: null,
    resource: 'all',
  });

  const isSystemLogs = !admin; // If no admin specified, show system logs

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: LogsQueryParams = {
        limit: 1000, // Get more logs for client-side filtering
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      // Add filter parameters
      if (filters.action !== 'all') params.action = filters.action;
      if (filters.success !== 'all') params.success = filters.success === 'true';
      if (filters.resource !== 'all') params.resource = filters.resource;
      if (filters.startDate) params.startDate = filters.startDate.toISOString();
      if (filters.endDate) params.endDate = filters.endDate.toISOString();

      let data: AdminOperationLog[];
      if (isSystemLogs) {
        data = await AdminService.getSystemLogs(params);
      } else if (admin) {
        data = await AdminService.getAdminLogs(admin.id, params);
      } else {
        data = await AdminService.getOwnLogs(params);
      }

      // Ensure we always set an array
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load operation logs');
      setLogs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadLogs();
    }
  }, [open, admin]);

  // Filter logs based on search
  const filteredLogs = useMemo(() => {
    // Ensure logs is always an array
    const logsArray = Array.isArray(logs) ? logs : [];
    
    if (!filters.search) return logsArray;
    
    const searchLower = filters.search.toLowerCase();
    return logsArray.filter(log => 
      log.action.toLowerCase().includes(searchLower) ||
      log.description?.toLowerCase().includes(searchLower) ||
      log.resource?.toLowerCase().includes(searchLower) ||
      log.ipAddress?.toLowerCase().includes(searchLower)
    );
  }, [logs, filters.search]);

  // Paginated logs
  const paginatedLogs = useMemo(() => {
    // Ensure filteredLogs is always an array
    const logsArray = Array.isArray(filteredLogs) ? filteredLogs : [];
    const startIndex = page * rowsPerPage;
    return logsArray.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredLogs, page, rowsPerPage]);

  // Get unique actions and resources for filter dropdowns
  const uniqueActions = useMemo(() => {
    const logsArray = Array.isArray(logs) ? logs : [];
    const actions = new Set(logsArray.map(log => log.action));
    return Array.from(actions).sort();
  }, [logs]);

  const uniqueResources = useMemo(() => {
    const logsArray = Array.isArray(logs) ? logs : [];
    const resources = new Set(logsArray.map(log => log.resource).filter(Boolean));
    return Array.from(resources).sort();
  }, [logs]);

  const handleFilterChange = (field: keyof LogsFilter, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const handleExpandLog = (logId: string) => {
    setExpandedLog(expandedLog === logId ? null : logId);
  };

  const getSuccessIcon = (success: boolean) => {
    return success ? <CheckIcon color="success" /> : <ErrorIcon color="error" />;
  };

  const getSuccessColor = (success: boolean) => {
    return success ? 'success' : 'error';
  };

  const getSeverityIcon = (log: AdminOperationLog) => {
    const severity = AdminService.getOperationSeverity(log);
    switch (severity) {
      case 'critical': return <ErrorIcon color="error" />;
      case 'high': return <WarningIcon color="warning" />;
      case 'medium': return <InfoIcon color="info" />;
      default: return <CheckIcon color="success" />;
    }
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

  const formatDuration = (duration: number) => {
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(2)}s`;
  };

  const renderLogMetadata = (log: AdminOperationLog) => {
    const { metadata } = log;
    
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          {t('LOG_DETAILS')}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">{t('DURATION')}</Typography>
            <Typography variant="body2">{formatDuration(metadata.duration)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">{t('SUCCESS')}</Typography>
            <Typography variant="body2" color={getSuccessColor(metadata.success)}>
              {metadata.success ? t('YES') : t('NO')}
            </Typography>
          </Box>
          {metadata.responseSize && (
            <Box>
              <Typography variant="caption" color="text.secondary">{t('RESPONSE_SIZE')}</Typography>
              <Typography variant="body2">{metadata.responseSize} bytes</Typography>
            </Box>
          )}
          {metadata.error && (
            <Box>
              <Typography variant="caption" color="text.secondary">{t('ERROR_MESSAGE')}</Typography>
              <Typography variant="body2" color="error">{metadata.error}</Typography>
            </Box>
          )}
        </Box>

        {/* Changes (for update operations) */}
        {metadata.changes && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Changes Made
            </Typography>
            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
              <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                {JSON.stringify(metadata.changes, null, 2)}
              </pre>
            </Box>
          </Box>
        )}

        {/* Additional metadata */}
        {Object.keys(metadata).filter(key => 
          !['duration', 'success', 'responseSize', 'error', 'changes'].includes(key)
        ).length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Additional Information
            </Typography>
            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
              {Object.entries(metadata)
                .filter(([key]) => !['duration', 'success', 'responseSize', 'error', 'changes'].includes(key))
                .map(([key, value]) => (
                  <Box key={key} sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {key}:
                    </Typography>
                    <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </Typography>
                  </Box>
                ))}
            </Box>
          </Box>
        )}
      </Box>
    );
  };

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
              {admin.email} ({admin.adminType === 1 ? t('SUPER_ADMIN') : t('LIMITED_ADMIN')})
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
                    placeholder="Search logs..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    size="small"
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                    sx={{ minWidth: 300 }}
                  />
                  
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Action</InputLabel>
                    <Select
                      value={filters.action}
                      label="Action"
                      onChange={(e) => handleFilterChange('action', e.target.value)}
                    >
                      <MenuItem value="all">All Actions</MenuItem>
                      {uniqueActions.map(action => (
                        <MenuItem key={action} value={action}>
                          {AdminService.formatOperationAction(action)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Result</InputLabel>
                    <Select
                      value={filters.success}
                      label="Result"
                      onChange={(e) => handleFilterChange('success', e.target.value)}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="true">Success</MenuItem>
                      <MenuItem value="false">Failed</MenuItem>
                    </Select>
                  </FormControl>

                  {uniqueResources.length > 0 && (
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Resource</InputLabel>
                      <Select
                        value={filters.resource}
                        label="Resource"
                        onChange={(e) => handleFilterChange('resource', e.target.value)}
                      >
                        <MenuItem value="all">All Resources</MenuItem>
                        {uniqueResources.map(resource => (
                          <MenuItem key={resource} value={resource}>
                            {resource}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={loadLogs}
                    size="small"
                    disabled={loading}
                  >
                    Refresh
                  </Button>
                </Stack>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <DatePicker
                    label="Start Date"
                    value={filters.startDate}
                    onChange={(date) => handleFilterChange('startDate', date)}
                    slotProps={{ textField: { size: 'small' } }}
                  />
                  <DatePicker
                    label="End Date"
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
                label={`${filteredLogs.length} Operations`}
                variant="outlined"
              />
              <Chip
                icon={<CheckIcon />}
                label={`${filteredLogs.filter(l => l.metadata.success).length} Successful`}
                color="success"
                variant="outlined"
              />
              <Chip
                icon={<ErrorIcon />}
                label={`${filteredLogs.filter(l => !l.metadata.success).length} Failed`}
                color="error"
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
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Logs Table */}
          {!loading && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width={40}></TableCell>
                    <TableCell>Operation</TableCell>
                    <TableCell>Result</TableCell>
                    <TableCell>Resource</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>IP Address</TableCell>
                    <TableCell>Timestamp</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No operation logs found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedLogs.map((log) => (
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
                              {getSeverityIcon(log)}
                              <Box>
                                <Typography variant="subtitle2">
                                  {AdminService.formatOperationAction(log.action)}
                                </Typography>
                                {log.description && (
                                  <Typography variant="caption" color="text.secondary">
                                    {log.description}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          
                          <TableCell>
                            <Chip
                              icon={getSuccessIcon(log.metadata.success)}
                              label={log.metadata.success ? 'Success' : 'Failed'}
                              color={getSuccessColor(log.metadata.success)}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          
                          <TableCell>
                            {log.resource && (
                              <Chip
                                label={log.resource}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </TableCell>
                          
                          <TableCell>
                            <Typography variant="body2">
                              {formatDuration(log.metadata.duration)}
                            </Typography>
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
                          <TableCell colSpan={7} sx={{ py: 0 }}>
                            <Collapse in={expandedLog === log.id} timeout="auto" unmountOnExit>
                              <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
                                {renderLogMetadata(log)}
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
                count={filteredLogs.length}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </TableContainer>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default OperationLogs; 