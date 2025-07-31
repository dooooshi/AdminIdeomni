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
import { useTranslation } from 'react-i18next';

const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const FilterContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'center',
  flexWrap: 'wrap',
}));

interface StudentPortfolioPageProps {}

const StudentPortfolioPage: React.FC<StudentPortfolioPageProps> = () => {
  const theme = useTheme();
  const { t } = useTranslation(['landManagement', 'navigation', 'common']);
  
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
        {t('landManagement:FILTERS')}:
      </Typography>

      <TextField
        label={t('landManagement:TILE_ID')}
        size="small"
        type="number"
        value={filters.tileId || ''}
        onChange={(e) => handleFilterChange('tileId', e.target.value ? Number(e.target.value) : undefined)}
        sx={{ minWidth: 120 }}
      />

      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>{t('landManagement:STATUS')}</InputLabel>
        <Select
          value={filters.status || ''}
          label="Status"
          onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
        >
          <MenuItem value="">{t('common:ALL')}</MenuItem>
          <MenuItem value="ACTIVE">{t('landManagement:ACTIVE')}</MenuItem>
          <MenuItem value="CANCELLED">{t('landManagement:CANCELLED')}</MenuItem>
          <MenuItem value="EXPIRED">{t('landManagement:EXPIRED')}</MenuItem>
        </Select>
      </FormControl>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <MuiDatePicker
          label={t('landManagement:START_DATE')}
          value={startDate}
          onChange={setStartDate}
          slotProps={{ textField: { size: 'small' } }}
        />
        
        <MuiDatePicker
          label={t('landManagement:END_DATE')}
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
      >
        {t('landManagement:CLEAR_FILTERS')}
      </Button>

      <Button
        variant="contained"
        size="small"
        onClick={loadPurchaseHistory}
        startIcon={<FilterIcon />}
      >
        {t('landManagement:APPLY_FILTERS')}
      </Button>
    </FilterContainer>
  );

  const renderPurchaseHistoryTable = () => {
    if (!purchaseHistory) return null;

    return (
      <Paper elevation={2}>
        <Box p={2}>
          <Typography variant="h6" gutterBottom>
            {t('landManagement:PURCHASE_HISTORY')}
          </Typography>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('landManagement:PURCHASE_DATE')}</TableCell>
                <TableCell>{t('landManagement:TILE_ID')}</TableCell>
                <TableCell align="right">{t('landManagement:OWNED_AREA')}</TableCell>
                <TableCell align="right">{t('landManagement:GOLD_COST')}</TableCell>
                <TableCell align="right">{t('landManagement:CARBON_COST')}</TableCell>
                <TableCell align="right">{t('landManagement:TOTAL_COST')}</TableCell>
                <TableCell align="center">{t('landManagement:STATUS')}</TableCell>
                <TableCell>{t('landManagement:DESCRIPTION')}</TableCell>
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
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary">
                      {t('landManagement:NO_PURCHASES_FOUND')}
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" size="small" onClick={handleRefresh}>
          {t('landManagement:RETRY')}
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  if (!teamSummary) {
    return (
      <Alert severity="info">
        {t('landManagement:NO_TEAM_DATA')}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('navigation:TEAM_LAND_MANAGEMENT')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('landManagement:PORTFOLIO_DESCRIPTION')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Export Data">
            <IconButton size="large">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} size="large">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Team Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
      </Grid>


      {/* Filters */}
      {renderFilters()}

      {/* Purchase History Table */}
      {renderPurchaseHistoryTable()}
    </Box>
  );
};

export default StudentPortfolioPage;