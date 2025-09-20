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
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Collapse,

  TextField,
  TablePagination,
  Stack,
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Close as CloseIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Create as CreateIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Computer as ComputerIcon,
  Description as ReasonIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import RawMaterialService from '@/lib/services/rawMaterialService';
import {
  RawMaterial,
  RawMaterialAuditLog as AuditLog,
  AuditAction,
  AuditLogSearchParams,
  AuditLogSearchResponse,
} from '@/lib/types/rawMaterial';

interface RawMaterialAuditLogProps {
  open: boolean;
  onClose: () => void;
  material: RawMaterial | null;
}

interface ExpandedRows {
  [key: number]: boolean;
}

const RawMaterialAuditLog: React.FC<RawMaterialAuditLogProps> = ({
  open,
  onClose,
  material,
}) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const [auditData, setAuditData] = useState<AuditLogSearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<ExpandedRows>({});
  
  // Pagination
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  
  // Filters
  const [adminFilter, setAdminFilter] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Fetch audit logs
  const fetchAuditLogs = useCallback(async () => {
    if (!material) return;
    
    setLoading(true);
    setError(null);

    try {
      const params: AuditLogSearchParams = {
        materialId: material.id,
        page: page + 1,
        limit: pageSize,
      };

      if (adminFilter) params.adminId = adminFilter;
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();

      const response = await RawMaterialService.getAuditLog(params);
      setAuditData(response);
    } catch (err: any) {
      setError(err.message || t('rawMaterial.error.auditFetchFailed'));
    } finally {
      setLoading(false);
    }
  }, [material, page, pageSize, adminFilter, startDate, endDate, t]);

  useEffect(() => {
    if (open && material) {
      fetchAuditLogs();
    }
  }, [open, material, fetchAuditLogs]);

  // Handle row expand/collapse
  const handleRowToggle = (id: number) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Clear filters
  const handleClearFilters = () => {
    setAdminFilter('');
    setStartDate(null);
    setEndDate(null);
    setPage(0);
  };

  // Get action icon
  const getActionIcon = (action: AuditAction) => {
    switch (action) {
      case AuditAction.CREATE:
        return <CreateIcon fontSize="small" color="success" />;
      case AuditAction.UPDATE:
        return <EditIcon fontSize="small" color="primary" />;
      case AuditAction.DELETE:
        return <DeleteIcon fontSize="small" color="error" />;
      case AuditAction.RESTORE:
        return <RestoreIcon fontSize="small" color="info" />;
      default:
        return null;
    }
  };

  // Get action color
  const getActionColor = (action: AuditAction) => {
    switch (action) {
      case AuditAction.CREATE:
        return 'success';
      case AuditAction.UPDATE:
        return 'primary';
      case AuditAction.DELETE:
        return 'error';
      case AuditAction.RESTORE:
        return 'info';
      default:
        return 'default';
    }
  };

  // Format change value
  const formatChangeValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? t('common.yes') : t('common.no');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  // Render change details
  const renderChangeDetails = (log: AuditLog) => {
    if (!log.changes || Object.keys(log.changes).length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          {t('rawMaterial.audit.noChanges')}
        </Typography>
      );
    }

    return (
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('rawMaterial.audit.field')}</TableCell>
            <TableCell>{t('rawMaterial.audit.oldValue')}</TableCell>
            <TableCell>{t('rawMaterial.audit.newValue')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(log.changes).map(([field, change]) => (
            <TableRow key={field}>
              <TableCell>
                <Typography variant="body2" fontWeight="medium">
                  {t(`rawMaterial.${field}`)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {formatChangeValue(change.old)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {formatChangeValue(change.new)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6">
              {t('rawMaterial.audit.title')}
            </Typography>
            {material && (
              <Typography variant="body2" color="text.secondary">
                #{material.materialNumber} - {locale === 'zh' ? material.nameZh : material.nameEn}
              </Typography>
            )}
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {/* Filters */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label={t('rawMaterial.audit.filterByAdmin')}
                value={adminFilter}
                onChange={(e) => {
                  setAdminFilter(e.target.value);
                  setPage(0);
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label={t('rawMaterial.audit.startDate')}
                  value={startDate}
                  onChange={(date) => {
                    setStartDate(date);
                    setPage(0);
                  }}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true, 
                      size: 'small' 
                    } 
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label={t('rawMaterial.audit.endDate')}
                  value={endDate}
                  onChange={(date) => {
                    setEndDate(date);
                    setPage(0);
                  }}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true, 
                      size: 'small' 
                    } 
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={3}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                >
                  {t('common.clear')}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FilterIcon />}
                  onClick={fetchAuditLogs}
                >
                  {t('common.apply')}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Audit Log Table */}
        <TableContainer component={Paper}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : auditData?.logs.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h6" color="text.secondary">
                {t('rawMaterial.audit.noData')}
              </Typography>
            </Box>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width={50} />
                    <TableCell>{t('rawMaterial.audit.action')}</TableCell>
                    <TableCell>{t('rawMaterial.audit.modifiedBy')}</TableCell>
                    <TableCell>{t('rawMaterial.audit.modifiedAt')}</TableCell>
                    <TableCell>{t('rawMaterial.audit.reason')}</TableCell>
                    <TableCell>{t('rawMaterial.audit.ipAddress')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditData?.logs.map((log) => (
                    <React.Fragment key={log.id}>
                      <TableRow hover>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleRowToggle(log.id)}
                          >
                            {expandedRows[log.id] ? <CollapseIcon /> : <ExpandIcon />}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getActionIcon(log.action)}
                            <Chip
                              label={t(`rawMaterial.audit.actions.${log.action}`)}
                              size="small"
                              color={getActionColor(log.action) as any}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon fontSize="small" />
                            <Box>
                              <Typography variant="body2">
                                {log.modifiedBy}
                              </Typography>
                              {log.adminEmail && (
                                <Typography variant="caption" color="text.secondary">
                                  {log.adminEmail}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TimeIcon fontSize="small" />
                            <Typography variant="body2">
                              {new Date(log.modifiedAt).toLocaleString(locale)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {log.reason ? (
                            <Tooltip title={log.reason}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ReasonIcon fontSize="small" />
                                <Typography
                                  variant="body2"
                                  sx={{
                                    maxWidth: 200,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {log.reason}
                                </Typography>
                              </Box>
                            </Tooltip>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {log.ipAddress ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ComputerIcon fontSize="small" />
                              <Typography variant="body2">
                                {log.ipAddress}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={6} sx={{ py: 0 }}>
                          <Collapse in={expandedRows[log.id]} timeout="auto" unmountOnExit>
                            <Box sx={{ py: 2, px: 4 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                {t('rawMaterial.audit.changeDetails')}
                              </Typography>
                              {renderChangeDetails(log)}
                              {log.userAgent && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                  {t('rawMaterial.audit.userAgent')}: {log.userAgent}
                                </Typography>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={auditData?.pagination.total || 0}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={pageSize}
                onRowsPerPageChange={(e) => {
                  setPageSize(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[25, 50, 100]}
              />
            </>
          )}
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RawMaterialAuditLog;