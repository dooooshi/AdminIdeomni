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
  Water as WaterIcon,
  Power as PowerIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { ResourceTransaction, ResourceType, TransactionStatus } from '@/types/resourceConsumption';
import resourceConsumptionService from '@/lib/services/resourceConsumptionService';

interface ResourceConsumptionHistoryProps {
  facilityId?: string;
  teamId?: string;
  activityId?: string;
  defaultPageSize?: number;
}

const ResourceConsumptionHistory: React.FC<ResourceConsumptionHistoryProps> = ({
  facilityId,
  teamId,
  activityId,
  defaultPageSize = 10
}) => {
  const { t, i18n } = useTranslation();
  const [transactions, setTransactions] = useState<ResourceTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultPageSize);
  const [totalCount, setTotalCount] = useState(0);
  
  const [filters, setFilters] = useState({
    resourceType: 'all' as 'all' | ResourceType,
    purpose: 'all' as 'all' | string,
    status: 'all' as 'all' | TransactionStatus,
    dateRange: '7d' as '7d' | '30d' | '90d' | 'all'
  });

  useEffect(() => {
    loadTransactions();
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
      const currentLocale = i18n.language;
      const isChineseLocale = currentLocale?.startsWith('zh');
      const dateLocale = isChineseLocale ? zhCN : enUS;
      const dateFormat = isChineseLocale ? 'yyyy年MM月dd日 HH:mm' : 'MMM dd, yyyy HH:mm';
      return format(new Date(date), dateFormat, { locale: dateLocale });
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

  const getResourceTypeLabel = (type: ResourceType) => {
    return type === ResourceType.WATER 
      ? t('resources.type.water')
      : t('resources.type.power');
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


  return (
    <Box>
      <Paper sx={{ p: 3, overflow: 'visible' }}>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              {t('resources.history.title')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={t('common.refresh')}>
                <IconButton onClick={loadTransactions} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              select
              size="small"
              label={t('resources.filter.resource')}
              value={filters.resourceType}
              onChange={(e) => handleFilterChange('resourceType', e.target.value)}
              sx={{ minWidth: 150 }}
              SelectProps={{
                MenuProps: {
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  },
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                },
              }}
            >
              <MenuItem value="all">{t('common.all')}</MenuItem>
              <MenuItem value={ResourceType.WATER}>{t('resources.water.title')}</MenuItem>
              <MenuItem value={ResourceType.POWER}>{t('resources.power.title')}</MenuItem>
            </TextField>
            
            <TextField
              select
              size="small"
              label={t('resources.filter.purpose')}
              value={filters.purpose}
              onChange={(e) => handleFilterChange('purpose', e.target.value)}
              sx={{ minWidth: 150 }}
              SelectProps={{
                MenuProps: {
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  },
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                },
              }}
            >
              <MenuItem value="all">{t('common.all')}</MenuItem>
              <MenuItem value="RAW_MATERIAL_PRODUCTION">
                {t('resources.purpose.rawMaterial')}
              </MenuItem>
              <MenuItem value="PRODUCT_MANUFACTURING">
                {t('resources.purpose.manufacturing')}
              </MenuItem>
            </TextField>
            
            <TextField
              select
              size="small"
              label={t('resources.filter.status')}
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              sx={{ minWidth: 150 }}
              SelectProps={{
                MenuProps: {
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  },
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                },
              }}
            >
              <MenuItem value="all">{t('common.all')}</MenuItem>
              <MenuItem value={TransactionStatus.SUCCESS}>{t('resources.status.success')}</MenuItem>
              <MenuItem value={TransactionStatus.FAILED}>{t('resources.status.failed')}</MenuItem>
            </TextField>
            
            <TextField
              select
              size="small"
              label={t('resources.filter.dateRange')}
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              sx={{ minWidth: 150 }}
              SelectProps={{
                MenuProps: {
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  },
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                },
              }}
            >
              <MenuItem value="7d">{t('resources.dateRange.7days')}</MenuItem>
              <MenuItem value="30d">{t('resources.dateRange.30days')}</MenuItem>
              <MenuItem value="90d">{t('resources.dateRange.90days')}</MenuItem>
              <MenuItem value="all">{t('resources.dateRange.all')}</MenuItem>
            </TextField>
          </Box>
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
                  <TableCell align="center">{t('resources.table.date')}</TableCell>
                  <TableCell align="center">{t('resources.table.resource')}</TableCell>
                  <TableCell align="center">{t('resources.table.quantity')}</TableCell>
                  <TableCell align="center">{t('resources.table.unitPrice')}</TableCell>
                  <TableCell align="center">{t('resources.table.totalAmount')}</TableCell>
                  <TableCell align="center">{t('resources.table.purpose')}</TableCell>
                  <TableCell align="center">{t('resources.table.provider')}</TableCell>
                  <TableCell align="center">{t('resources.table.consumer')}</TableCell>
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
                      <TableCell align="center">
                        <Typography variant="body2">
                          {formatDate(tx.transactionDate)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          {getResourceIcon(tx.resourceType)}
                          <Typography variant="body2">
                            {getResourceTypeLabel(tx.resourceType)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {tx.quantity.toFixed(0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          ${tx.unitPrice.toFixed(4)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <MoneyIcon fontSize="small" color="success" />
                          <Typography variant="body2" fontWeight="medium">
                            ${tx.totalAmount.toFixed(2)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="caption">
                          {getPurposeLabel(tx.purpose)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="caption" color="text.secondary">
                          {tx.metadata?.providerFacilityName || tx.providerFacilityId?.substring(0, 8) || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
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