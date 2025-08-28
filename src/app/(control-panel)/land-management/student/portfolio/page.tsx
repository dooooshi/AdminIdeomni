'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DatePicker,
  Badge
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Landscape as LandscapeIcon,
  AttachMoney as MoneyIcon,
  Timeline as TimelineIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingUpIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import LandService from '@/lib/services/landService';
import {
  TeamLandSummary,
  LandPurchase,
  LandPurchaseHistoryQuery,
  PaginatedResponse
} from '@/types/land';
import { format } from 'date-fns';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';

const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100]}`,
  boxShadow: 'none',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[600] : theme.palette.grey[300],
  },
}));

const FilterContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100]}`,
  boxShadow: 'none',
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'center',
  flexWrap: 'wrap',
}));

interface StudentPortfolioPageProps {}

const StudentPortfolioPage: React.FC<StudentPortfolioPageProps> = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  
  // State management
  const [teamSummary, setTeamSummary] = useState<TeamLandSummary | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<PaginatedResponse<LandPurchase> | null>(null);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<LandPurchaseHistoryQuery>({
    page: 1,
    pageSize: 10,
  });
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Load initial data
  useEffect(() => {
    loadPortfolioData();
  }, []);

  // Load purchase history when filters change
  useEffect(() => {
    loadPurchaseHistory();
  }, [page, rowsPerPage, filters]);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load team summary and initial purchase history
      const [summaryData, historyData] = await Promise.all([
        LandService.getTeamLandSummary(),
        LandService.getPurchaseHistory({ page: 1, pageSize: rowsPerPage })
      ]);

      setTeamSummary(summaryData);
      setPurchaseHistory(historyData);
    } catch (err: any) {
      console.error('Failed to load portfolio data:', err);
      setError(LandService.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const loadPurchaseHistory = async () => {
    try {
      setHistoryLoading(true);
      
      const queryParams: LandPurchaseHistoryQuery = {
        ...filters,
        page: page + 1, // Convert 0-based to 1-based
        pageSize: rowsPerPage,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      };

      const historyData = await LandService.getPurchaseHistory(queryParams);
      setPurchaseHistory(historyData);
    } catch (err: any) {
      console.error('Failed to load purchase history:', err);
      setError(LandService.getErrorMessage(err));
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleRefresh = () => {
    loadPortfolioData();
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (key: keyof LandPurchaseHistoryQuery, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPage(0); // Reset to first page
  };

  const clearFilters = () => {
    setFilters({ page: 1, pageSize: rowsPerPage });
    setStartDate(null);
    setEndDate(null);
    setPage(0);
  };

  const hasActiveFilters = () => {
    return !!(
      filters.tileId ||
      filters.status ||
      startDate ||
      endDate
    );
  };

  const renderStatCard = (
    title: string,
    value: string | number,
    icon: React.ReactNode,
    color: string = theme.palette.primary.main,
    subtitle?: string
  ) => (
    <StatsCard>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
            {icon}
          </Avatar>
        </Box>
        
        <Typography variant="h4" component="div" gutterBottom>
          {value}
        </Typography>
        
        <Typography color="text.secondary" variant="body2">
          {title}
        </Typography>
        
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </StatsCard>
  );

  const renderFilters = () => (
    <FilterContainer elevation={1}>
      <IconButton
        onClick={() => setShowFilters(!showFilters)}
        color={hasActiveFilters() ? 'primary' : 'default'}
      >
        <Badge color="primary" variant="dot" invisible={!hasActiveFilters()}>
          <FilterIcon />
        </Badge>
      </IconButton>
      
      <Typography variant="subtitle2" sx={{ minWidth: 'max-content' }}>
        {t('landManagement.FILTERS')}:
      </Typography>

      <TextField
        label={t('landManagement.TILE_ID')}
        size="small"
        type="number"
        value={filters.tileId || ''}
        onChange={(e) => handleFilterChange('tileId', e.target.value ? Number(e.target.value) : undefined)}
        sx={{ minWidth: 120 }}
      />

      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>{t('landManagement.STATUS')}</InputLabel>
        <Select
          value={filters.status || ''}
          label="Status"
          onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
        >
          <MenuItem value="">{t('common.ALL')}</MenuItem>
          <MenuItem value="ACTIVE">{t('landManagement.ACTIVE')}</MenuItem>
          <MenuItem value="CANCELLED">{t('landManagement.CANCELLED')}</MenuItem>
          <MenuItem value="EXPIRED">{t('landManagement.EXPIRED')}</MenuItem>
        </Select>
      </FormControl>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <MuiDatePicker
          label={t('landManagement.START_DATE')}
          value={startDate}
          onChange={setStartDate}
          slotProps={{ textField: { size: 'small' } }}
        />
        
        <MuiDatePicker
          label={t('landManagement.END_DATE')}
          value={endDate}
          onChange={setEndDate}
          slotProps={{ textField: { size: 'small' } }}
        />
      </LocalizationProvider>

      <Button
        variant="outlined"
        size="small"
        onClick={clearFilters}
        disabled={!hasActiveFilters()}
        className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white"
      >
        {t('landManagement.CLEAR_FILTERS')}
      </Button>

      <Button
        variant="outlined"
        size="small"
        onClick={loadPurchaseHistory}
        className="border-gray-900 dark:border-white text-gray-900 dark:text-white hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900"
        startIcon={<FilterIcon />}
      >
        {t('landManagement.APPLY_FILTERS')}
      </Button>
    </FilterContainer>
  );

  const renderPurchaseHistoryTable = () => {
    if (!purchaseHistory) return null;

    return (
      <Paper className="border border-gray-100 dark:border-gray-800 shadow-none">
        <Box p={3}>
          <Typography variant="h6" className="font-medium text-gray-900 dark:text-white mb-2">
            {t('landManagement.PURCHASE_HISTORY')}
          </Typography>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('landManagement.PURCHASE_DATE')}</TableCell>
                <TableCell>{t('landManagement:TILE_ID')}</TableCell>
                <TableCell align="right">{t('landManagement.OWNED_AREA')}</TableCell>
                <TableCell align="right">{t('landManagement.GOLD_COST')}</TableCell>
                <TableCell align="right">{t('landManagement.CARBON_COST')}</TableCell>
                <TableCell align="right">{t('landManagement.TOTAL_COST')}</TableCell>
                <TableCell align="center">{t('landManagement.STATUS')}</TableCell>
                <TableCell>{t('landManagement.DESCRIPTION')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historyLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : purchaseHistory.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" className="py-16">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                      <AssessmentIcon className="text-gray-400 dark:text-gray-500" />
                    </div>
                    <Typography variant="body1" className="font-medium text-gray-900 dark:text-white mb-1">
                      {t('landManagement.NO_PURCHASES_FOUND')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Start investing in land to see your portfolio here
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                purchaseHistory.data.map((purchase) => (
                  <TableRow key={purchase.id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(purchase.purchaseDate), 'MMM dd, yyyy')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(purchase.purchaseDate), 'HH:mm')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {purchase.tileId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {LandService.formatArea(purchase.purchasedArea)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {LandService.formatCurrency(purchase.goldCost, 'gold')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {LandService.formatCurrency(purchase.carbonCost, 'carbon')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        {LandService.formatCurrency(purchase.goldCost + purchase.carbonCost)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={purchase.status}
                        size="small"
                        sx={{
                          bgcolor: LandService.getPurchaseStatusColor(purchase.status),
                          color: 'white'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {purchase.description || '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {purchaseHistory.data.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={purchaseHistory.total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </Paper>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-900 flex items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-900">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              {t('landManagement.RETRY')}
            </Button>
          }>
            {error}
          </Alert>
        </div>
      </div>
    );
  }

  if (!teamSummary) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-900">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <Alert severity="info">
            {t('landManagement.NO_TEAM_DATA')}
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <Typography variant="h4" className="font-light text-gray-900 dark:text-white mb-2">
              {t('navigation.TEAM_LAND_MANAGEMENT')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('landManagement.PORTFOLIO_DESCRIPTION')}
            </Typography>
          </div>
          <Stack direction="row" spacing={2}>
            <Tooltip title={t('common.EXPORT_DATA')}>
              <IconButton className="border border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white shadow-none">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('common.REFRESH_DATA')}>
              <IconButton onClick={handleRefresh} className="border border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white shadow-none">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </div>

        {/* Team Summary Cards */}
        <Grid container spacing={6} sx={{ mb: 6 }}>
        </Grid>

        {/* Filters */}
        {renderFilters()}

        {/* Purchase History Table */}
        {renderPurchaseHistoryTable()}
      </div>
    </div>
  );
};

export default StudentPortfolioPage;