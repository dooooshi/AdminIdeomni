'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  CircularProgress,
  Chip,
  TextField,
  MenuItem,
  Grid
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  FileDownload as ExportIcon,
  Water as WaterIcon,
  Power as PowerIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ResourceTransaction, ResourceType, TransactionStatus } from '@/types/resourceConsumption';
import resourceConsumptionService from '@/lib/services/resourceConsumptionService';

interface ResourceConsumptionHistoryProps {
  facilityId?: string;
  teamId?: string;
  activityId?: string;
  defaultPageSize?: number;
  showSummary?: boolean;
}

const ResourceConsumptionHistory: React.FC<ResourceConsumptionHistoryProps> = ({
  facilityId,
  teamId,
  activityId,
  defaultPageSize = 10,
  showSummary = true
}) => {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<ResourceTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [summary, setSummary] = useState<any>(null);
  
  const [filters, setFilters] = useState({
    resourceType: 'all' as 'all' | ResourceType,
    purpose: 'all' as 'all' | string,
    status: 'all' as 'all' | TransactionStatus,
    dateRange: '7d' as '7d' | '30d' | '90d' | 'all'
  });

  useEffect(() => {
    loadTransactions();
    if (showSummary) {
      loadSummary();
    }
  }, [facilityId, teamId, activityId, page, rowsPerPage, filters]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const startDate = getStartDate(filters.dateRange);
      const endDate = new Date().toISOString();
      
      const history = await resourceConsumptionService.getConsumptionHistory({
        facilityId,
        teamId,
        resourceType: filters.resourceType !== 'all' ? filters.resourceType : undefined,
        purpose: filters.purpose !== 'all' ? filters.purpose : undefined,
        startDate: startDate?.toISOString(),
        endDate,
        limit: rowsPerPage
      });

      // Filter by status on client side if needed
      const filteredHistory = filters.status !== 'all' 
        ? history.filter(tx => tx.status === filters.status)
        : history;

      setTransactions(filteredHistory);
      setTotalCount(filteredHistory.length);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const startDate = getStartDate(filters.dateRange);
      const summaryData = await resourceConsumptionService.getConsumptionSummary({
        startDate: startDate?.toISOString(),
        endDate: new Date().toISOString()
      });
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to load summary:', error);
    }
  };

  const getStartDate = (range: string): Date | undefined => {
    if (range === 'all') return undefined;
    
    const now = new Date();
    const days = parseInt(range.replace('d', ''));
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    return startDate;
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (filterName: string, value: any) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setPage(0);
  };

  const formatDate = (date: Date | string) => {
    try {
      return format(new Date(date), 'MMM dd, yyyy HH:mm');
    } catch {
      return String(date);
    }
  };

  const getResourceIcon = (type: ResourceType) => {
    return type === ResourceType.WATER ? (
      <WaterIcon fontSize="small" color="primary" />
    ) : (
      <PowerIcon fontSize="small" color="warning" />
    );
  };

  const getStatusChip = (status: TransactionStatus) => {
    return (
      <Chip
        label={status}
        size="small"
        color={status === TransactionStatus.SUCCESS ? 'success' : 'error'}
      />
    );
  };

  const getPurposeLabel = (purpose: string) => {
    const labels: Record<string, string> = {
      'RAW_MATERIAL_PRODUCTION': t('resources.purpose.rawMaterial'),
      'PRODUCT_MANUFACTURING': t('resources.purpose.manufacturing')
    };
    return labels[purpose] || purpose;
  };

  const handleExport = async () => {
    try {
      const allTransactions = await resourceConsumptionService.getConsumptionHistory({
        facilityId,
        teamId,
        limit: 500
      });
      
      const csv = convertToCSV(allTransactions);
      downloadCSV(csv, 'resource-consumption-history.csv');
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const convertToCSV = (data: ResourceTransaction[]) => {
    const headers = ['Date', 'Resource', 'Quantity', 'Unit Price', 'Total Amount', 'Purpose', 'Status', 'Facility', 'Team'];
    const rows = data.map(tx => [
      formatDate(tx.transactionDate),
      tx.resourceType,
      tx.quantity,
      tx.unitPrice,
      tx.totalAmount,
      tx.purpose,
      tx.status,
      tx.consumerFacilityId,
      tx.consumerTeamId
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Box>
      {showSummary && summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('resources.totalTransactions')}
              </Typography>
              <Typography variant="h4">
                {summary.totalTransactions || 0}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('resources.totalCost')}
              </Typography>
              <Typography variant="h4">
                ${(summary.totalCost || 0).toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('resources.water.title')}
              </Typography>
              <Typography variant="h4">
                ${(summary.byResourceType?.WATER?.amount || 0).toFixed(2)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {summary.byResourceType?.WATER?.count || 0} {t('resources.transactions')}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('resources.power.title')}
              </Typography>
              <Typography variant="h4">
                ${(summary.byResourceType?.POWER?.amount || 0).toFixed(2)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {summary.byResourceType?.POWER?.count || 0} {t('resources.transactions')}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {t('resources.history.title')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={t('resources.export')}>
              <IconButton onClick={handleExport}>
                <ExportIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('common.refresh')}>
              <IconButton onClick={loadTransactions} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label={t('resources.filter.resource')}
              value={filters.resourceType}
              onChange={(e) => handleFilterChange('resourceType', e.target.value)}
            >
              <MenuItem value="all">{t('common.all')}</MenuItem>
              <MenuItem value={ResourceType.WATER}>{t('resources.water.title')}</MenuItem>
              <MenuItem value={ResourceType.POWER}>{t('resources.power.title')}</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label={t('resources.filter.purpose')}
              value={filters.purpose}
              onChange={(e) => handleFilterChange('purpose', e.target.value)}
            >
              <MenuItem value="all">{t('common.all')}</MenuItem>
              <MenuItem value="RAW_MATERIAL_PRODUCTION">
                {t('resources.purpose.rawMaterial')}
              </MenuItem>
              <MenuItem value="PRODUCT_MANUFACTURING">
                {t('resources.purpose.manufacturing')}
              </MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label={t('resources.filter.status')}
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="all">{t('common.all')}</MenuItem>
              <MenuItem value={TransactionStatus.SUCCESS}>{t('resources.status.success')}</MenuItem>
              <MenuItem value={TransactionStatus.FAILED}>{t('resources.status.failed')}</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label={t('resources.filter.dateRange')}
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            >
              <MenuItem value="7d">{t('resources.dateRange.7days')}</MenuItem>
              <MenuItem value="30d">{t('resources.dateRange.30days')}</MenuItem>
              <MenuItem value="90d">{t('resources.dateRange.90days')}</MenuItem>
              <MenuItem value="all">{t('resources.dateRange.all')}</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('resources.table.date')}</TableCell>
                  <TableCell>{t('resources.table.resource')}</TableCell>
                  <TableCell align="right">{t('resources.table.quantity')}</TableCell>
                  <TableCell align="right">{t('resources.table.unitPrice')}</TableCell>
                  <TableCell align="right">{t('resources.table.totalAmount')}</TableCell>
                  <TableCell>{t('resources.table.purpose')}</TableCell>
                  <TableCell>{t('resources.table.provider')}</TableCell>
                  <TableCell>{t('resources.table.consumer')}</TableCell>
                  <TableCell align="center">{t('resources.table.status')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        {t('resources.noTransactions')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TableRow key={tx.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(tx.transactionDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getResourceIcon(tx.resourceType)}
                          <Typography variant="body2">
                            {tx.resourceType}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {tx.quantity.toFixed(0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          ${tx.unitPrice.toFixed(4)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                          <MoneyIcon fontSize="small" color="success" />
                          <Typography variant="body2" fontWeight="medium">
                            ${tx.totalAmount.toFixed(2)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {getPurposeLabel(tx.purpose)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {tx.metadata?.providerFacilityName || tx.providerFacilityId?.substring(0, 8) || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {tx.metadata?.facilityName || tx.consumerFacilityId?.substring(0, 8) || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {getStatusChip(tx.status)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </>
      )}
    </Paper>
    </Box>
  );
};

export default ResourceConsumptionHistory;