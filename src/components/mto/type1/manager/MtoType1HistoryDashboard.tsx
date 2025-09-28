'use client';

import React, { useState, useEffect } from 'react';
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
  IconButton,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Button,
  Tooltip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  InputAdornment,
  TablePagination
} from '@mui/material';
import {
  History as HistoryIcon,
  Assessment as AssessmentIcon,
  Receipt as ReceiptIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FileDownload as DownloadIcon,
  FilterList as FilterIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { useRouter } from 'next/navigation';
import { MtoType1Requirement, MtoType1Status } from '@/lib/types/mtoType1';
import MtoType1Service from '@/lib/services/mtoType1Service';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale/zh-CN';
import { enqueueSnackbar } from 'notistack';


const MtoType1HistoryDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isChineseLocale = i18n.language === 'zh' || i18n.language === 'zh-CN';
  const router = useRouter();
  const [requirements, setRequirements] = useState<MtoType1Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<keyof MtoType1Status | 'ALL'>('ALL');
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month' | 'quarter'>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadData();
  }, [page, rowsPerPage, statusFilter, dateFilter]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load requirements
      const requirementsResponse = await MtoType1Service.searchRequirements({
        page: page + 1,
        limit: rowsPerPage,
        q: searchTerm || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      setRequirements(requirementsResponse.data);
      setTotalCount(requirementsResponse.extra?.pagination?.total || requirementsResponse.data.length);
    } catch (error) {
      console.error('Failed to load history data:', error);
      enqueueSnackbar(t('mto.type1.history.loadError'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    loadData();
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleViewCalculationHistory = (requirementId: number) => {
    router.push(`/mto-management/mto-type-1/history/calculation/${requirementId}`);
  };

  const handleViewSettlementHistory = (requirementId: number) => {
    router.push(`/mto-management/mto-type-1/history/settlement/${requirementId}`);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: keyof MtoType1Status): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' => {
    const colors: Record<keyof MtoType1Status, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
      DRAFT: 'default',
      RELEASED: 'primary',
      IN_PROGRESS: 'warning',
      SETTLING: 'info',
      SETTLED: 'success',
      CANCELLED: 'error'
    };
    return colors[status];
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading && requirements.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            size="small"
            placeholder={t('mto.type1.history.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t('mto.type1.history.statusFilter')}</InputLabel>
            <Select
              value={statusFilter}
              label={t('mto.type1.history.statusFilter')}
              onChange={(e) => setStatusFilter(e.target.value as keyof MtoType1Status | 'ALL')}
            >
              <MenuItem value="ALL">{t('mto.type1.history.allStatuses')}</MenuItem>
              <MenuItem value="DRAFT">{t('mto.type1.status.draft')}</MenuItem>
              <MenuItem value="RELEASED">{t('mto.type1.status.released')}</MenuItem>
              <MenuItem value="IN_PROGRESS">{t('mto.type1.status.inProgress')}</MenuItem>
              <MenuItem value="SETTLING">{t('mto.type1.status.settling')}</MenuItem>
              <MenuItem value="SETTLED">{t('mto.type1.status.settled')}</MenuItem>
              <MenuItem value="CANCELLED">{t('mto.type1.status.cancelled')}</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t('mto.type1.history.dateFilter')}</InputLabel>
            <Select
              value={dateFilter}
              label={t('mto.type1.history.dateFilter')}
              onChange={(e) => setDateFilter(e.target.value as 'all' | 'week' | 'month' | 'quarter')}
            >
              <MenuItem value="all">{t('mto.type1.history.allTime')}</MenuItem>
              <MenuItem value="week">{t('mto.type1.history.lastWeek')}</MenuItem>
              <MenuItem value="month">{t('mto.type1.history.lastMonth')}</MenuItem>
              <MenuItem value="quarter">{t('mto.type1.history.lastQuarter')}</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleSearch}
            startIcon={<SearchIcon />}
          >
            {t('common.search')}
          </Button>

          <Box sx={{ flexGrow: 1 }} />

          <Tooltip title={t('common.refresh')}>
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {/* Requirements Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('mto.type1.history.requirementId')}</TableCell>
              <TableCell>{t('mto.type1.history.requirementName')}</TableCell>
              <TableCell>{t('mto.type1.history.activity')}</TableCell>
              <TableCell align="center">{t('mto.type1.history.status')}</TableCell>
              <TableCell>{t('mto.type1.history.releaseTime')}</TableCell>
              <TableCell>{t('mto.type1.history.settlementTime')}</TableCell>
              <TableCell align="right">{t('mto.type1.history.fulfillmentRate')}</TableCell>
              <TableCell align="center">{t('mto.type1.history.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requirements.map((requirement) => (
              <TableRow key={requirement.id}>
                <TableCell>#{requirement.id}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {requirement.managerProductFormula?.productName || requirement.metadata?.name || `${t('mto.type1.history.requirementPrefix')} ${requirement.id}`}
                  </Typography>
                </TableCell>
                <TableCell>{requirement.activityId}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={t(`mto.type1.status.${requirement.status.toLowerCase().replace(/_/g, '')}`)}
                    color={getStatusColor(requirement.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {isChineseLocale
                    ? format(parseISO(requirement.releaseTime), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })
                    : format(parseISO(requirement.releaseTime), 'MMM dd, yyyy HH:mm')
                  }
                </TableCell>
                <TableCell>
                  {isChineseLocale
                    ? format(parseISO(requirement.settlementTime), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })
                    : format(parseISO(requirement.settlementTime), 'MMM dd, yyyy HH:mm')
                  }
                </TableCell>
                <TableCell align="right">
                  <Typography
                    color={requirement.fulfillmentRate >= 0.8 ? 'success.main' : 'warning.main'}
                  >
                    {formatPercent(requirement.fulfillmentRate)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Tooltip title={t('mto.type1.history.viewCalculationHistory')}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleViewCalculationHistory(requirement.id)}
                      >
                        <TimelineIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('mto.type1.history.viewSettlementHistory')}>
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleViewSettlementHistory(requirement.id)}
                        disabled={requirement.status === 'DRAFT' || requirement.status === 'RELEASED'}
                      >
                        <ReceiptIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {requirements.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Alert severity="info">
                    {t('mto.type1.history.noRequirements')}
                  </Alert>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={t('common.rowsPerPage')}
        />
      </TableContainer>
    </Box>
  );
};

export default MtoType1HistoryDashboard;