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
        Filters:
      </Typography>

      <TextField
        label="Tile ID"
        size="small"
        type="number"
        value={filters.tileId || ''}
        onChange={(e) => handleFilterChange('tileId', e.target.value ? Number(e.target.value) : undefined)}
        sx={{ minWidth: 120 }}
      />

      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={filters.status || ''}
          label="Status"
          onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="ACTIVE">Active</MenuItem>
          <MenuItem value="CANCELLED">Cancelled</MenuItem>
          <MenuItem value="EXPIRED">Expired</MenuItem>
        </Select>
      </FormControl>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <MuiDatePicker
          label="Start Date"
          value={startDate}
          onChange={setStartDate}
          slotProps={{ textField: { size: 'small' } }}
        />
        
        <MuiDatePicker
          label="End Date"
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
        Clear
      </Button>

      <Button
        variant="contained"
        size="small"
        onClick={loadPurchaseHistory}
        startIcon={<FilterIcon />}
      >
        Apply
      </Button>
    </FilterContainer>
  );

  const renderPurchaseHistoryTable = () => {
    if (!purchaseHistory) return null;

    return (
      <Paper elevation={2}>
        <Box p={2}>
          <Typography variant="h6" gutterBottom>
            Purchase History
          </Typography>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Tile</TableCell>
                <TableCell align="right">Area</TableCell>
                <TableCell align="right">Gold Cost</TableCell>
                <TableCell align="right">Carbon Cost</TableCell>
                <TableCell align="right">Total Cost</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell>Description</TableCell>
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
                      No purchase history found
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
          Retry
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  if (!teamSummary) {
    return (
      <Alert severity="info">
        No team portfolio data available. Join a team to start purchasing land.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Team Land Portfolio
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and monitor your team's land ownership and purchase history
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
        <Grid item xs={12} sm={6} md={3}>
          {renderStatCard(
            'Total Owned Area',
            LandService.formatArea(teamSummary.totalOwnedArea),
            <LandscapeIcon />,
            theme.palette.primary.main,
            'Square units owned'
          )}
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          {renderStatCard(
            'Total Investment',
            LandService.formatCurrency(teamSummary.totalSpent),
            <MoneyIcon />,
            theme.palette.success.main,
            'Gold & Carbon combined'
          )}
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          {renderStatCard(
            'Tiles Owned',
            teamSummary.tilesOwnedCount,
            <LocationIcon />,
            theme.palette.warning.main,
            'Unique tiles with ownership'
          )}
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          {renderStatCard(
            'Total Purchases',
            teamSummary.totalPurchases,
            <TimelineIcon />,
            theme.palette.info.main,
            'All-time transactions'
          )}
        </Grid>
      </Grid>

      {/* Portfolio Details */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Investment Breakdown
              </Typography>
              <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Gold Spent:</Typography>
                  <Typography variant="h6" color="warning.main">
                    {LandService.formatCurrency(teamSummary.totalGoldSpent, 'gold')}
                  </Typography>
                </Box>
                <Divider />
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Carbon Spent:</Typography>
                  <Typography variant="h6" color="success.main">
                    {LandService.formatCurrency(teamSummary.totalCarbonSpent, 'carbon')}
                  </Typography>
                </Box>
                <Divider />
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" fontWeight="bold">Average Cost per Area:</Typography>
                  <Typography variant="h6" color="primary.main">
                    {teamSummary.totalOwnedArea > 0 
                      ? LandService.formatCurrency(teamSummary.totalSpent / teamSummary.totalOwnedArea)
                      : '0'
                    }
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Portfolio Timeline
              </Typography>
              <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">First Purchase:</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {teamSummary.firstPurchaseDate 
                      ? format(new Date(teamSummary.firstPurchaseDate), 'MMM dd, yyyy')
                      : 'N/A'
                    }
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Latest Purchase:</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {teamSummary.lastPurchaseDate 
                      ? format(new Date(teamSummary.lastPurchaseDate), 'MMM dd, yyyy')
                      : 'N/A'
                    }
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Activity Period:</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {teamSummary.firstPurchaseDate && teamSummary.lastPurchaseDate
                      ? `${Math.ceil(
                          (new Date(teamSummary.lastPurchaseDate).getTime() - 
                           new Date(teamSummary.firstPurchaseDate).getTime()) / 
                          (1000 * 60 * 60 * 24)
                        )} days`
                      : 'N/A'
                    }
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      {renderFilters()}

      {/* Purchase History Table */}
      {renderPurchaseHistoryTable()}
    </Box>
  );
};

export default StudentPortfolioPage;