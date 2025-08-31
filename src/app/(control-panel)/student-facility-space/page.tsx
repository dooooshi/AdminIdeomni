'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  LinearProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Divider,
  Container,
  Fade,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  Warehouse as WarehouseIcon,
  Factory as FactoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  Inventory as InventoryIcon,
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import StudentFacilitySpaceService from '@/lib/services/studentFacilitySpaceService';
import type {
  TeamFacilitySpaceOverviewResponse,
  FacilitySpaceDetailsResponse,
  TeamSpaceUtilizationResponse,
  FacilitySpaceTableRow,
  UtilizationSummaryTableRow,
  AlertsTableRow,
  SpaceAlertSeverity,
} from '@/types/studentFacilitySpace';
import { FacilityType } from '@/types/facilities';

export default function StudentFacilitySpacePage() {
  const { t } = useTranslation();
  const theme = useTheme();
  
  // State for data
  const [overviewData, setOverviewData] = useState<TeamFacilitySpaceOverviewResponse['data'] | null>(null);
  const [utilizationData, setUtilizationData] = useState<TeamSpaceUtilizationResponse['data'] | null>(null);
  const [selectedFacilityDetails, setSelectedFacilityDetails] = useState<FacilitySpaceDetailsResponse['data'] | null>(null);
  
  // State for tables
  const [facilityTableRows, setFacilityTableRows] = useState<FacilitySpaceTableRow[]>([]);
  const [utilizationTableRows, setUtilizationTableRows] = useState<UtilizationSummaryTableRow[]>([]);
  const [alertTableRows, setAlertTableRows] = useState<AlertsTableRow[]>([]);
  
  // State for UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [facilityTypeFilter, setFacilityTypeFilter] = useState<FacilityType | 'ALL'>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [overview, utilization] = await Promise.all([
        StudentFacilitySpaceService.getTeamFacilitySpaceOverview(),
        StudentFacilitySpaceService.getTeamSpaceUtilization(),
      ]);

      console.log('API Response - Overview:', overview);
      console.log('API Response - Utilization:', utilization);

      setOverviewData(overview.data);
      setUtilizationData(utilization.data);

      if (overview.data?.facilities) {
        const tableRows = overview.data.facilities.map(f => 
          StudentFacilitySpaceService.transformToTableRow(f)
        );
        setFacilityTableRows(tableRows);
      }

      if (utilization.data?.utilization?.byFacilityType) {
        const utilRows = StudentFacilitySpaceService.transformToUtilizationSummaryRows(
          utilization.data.utilization.byFacilityType
        );
        setUtilizationTableRows(utilRows);
      }

      if (utilization.data?.utilization?.alerts) {
        const alertRows = StudentFacilitySpaceService.transformToAlertRows(
          utilization.data.utilization.alerts
        );
        setAlertTableRows(alertRows);
      }
    } catch (err) {
      console.error('Error fetching facility space data:', err);
      setError(t('studentFacilitySpace.errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Fetch facility details
  const fetchFacilityDetails = async (facilityInstanceId: string) => {
    try {
      const response = await StudentFacilitySpaceService.getFacilitySpaceDetails(facilityInstanceId);
      setSelectedFacilityDetails(response.data);
      setDetailsDialogOpen(true);
    } catch (err) {
      console.error('Error fetching facility details:', err);
      setError(t('studentFacilitySpace.errors.detailsFetchFailed'));
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  // Filter facilities
  const filteredFacilities = useMemo(() => {
    return facilityTableRows.filter(row => {
      const matchesSearch = searchTerm === '' || 
        row.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.location.includes(searchTerm);
      const matchesType = facilityTypeFilter === 'ALL' || row.facilityType === facilityTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [facilityTableRows, searchTerm, facilityTypeFilter]);

  // Handlers
  const handleExport = () => {
    StudentFacilitySpaceService.exportToCSV(filteredFacilities, 'facility-space-report.csv');
  };

  // Get severity color
  const getSeverityColor = (severity: SpaceAlertSeverity) => {
    switch (severity) {
      case 'CRITICAL': return 'error';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      default: return 'success';
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'background.default'
    }}>
      <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '1200px', mx: 'auto' }}>
          {/* Clean Header Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', md: 'center' }, 
              mb: 2,
              gap: 2
            }}>
              <Box>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 500,
                    color: 'text.primary',
                    mb: 0.5,
                    fontSize: { xs: '1.75rem', md: '2rem' }
                  }}
                >
                  {t('studentFacilitySpace.title')}
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: '0.875rem'
                  }}
                >
                  Monitor and manage facility space utilization
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Error Alert */}
          {error && (
            <Fade in timeout={600}>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 4, 
                  borderRadius: 3,
                  border: 'none',
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  color: 'error.main',
                  boxShadow: `0 4px 20px ${alpha(theme.palette.error.main, 0.2)}`
                }} 
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            </Fade>
          )}

          {/* Metrics Cards */}
          {overviewData && (
            <Box sx={{ mb: 4 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    boxShadow: 'none',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: 1
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <WarehouseIcon sx={{ fontSize: '1.5rem', color: 'primary.main', mr: 1 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          {t('studentFacilitySpace.metrics.totalFacilities')}
                        </Typography>
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                        {overviewData.summary.totalFacilities}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {t('studentFacilitySpace.metrics.withStorage', { count: overviewData.summary.storageFacilities })}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    boxShadow: 'none',
                    '&:hover': {
                      borderColor: 'success.main',
                      boxShadow: 1
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <StorageIcon sx={{ fontSize: '1.5rem', color: 'success.main', mr: 1 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          {t('studentFacilitySpace.metrics.totalCapacity')}
                        </Typography>
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                        {(overviewData.summary.totalSpaceCapacity / 1000).toFixed(0)}K
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {t('studentFacilitySpace.metrics.carbonUnits')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    boxShadow: 'none',
                    '&:hover': {
                      borderColor: 'info.main',
                      boxShadow: 1
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <InventoryIcon sx={{ fontSize: '1.5rem', color: 'info.main', mr: 1 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          {t('studentFacilitySpace.metrics.spaceUsed')}
                        </Typography>
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                        {(overviewData.summary.totalSpaceUsed / 1000).toFixed(0)}K
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {(overviewData.summary.totalSpaceAvailable / 1000).toFixed(0)}K available
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{
                    height: '100%',
                    border: '1px solid',
                    borderColor: overviewData.summary.utilizationRate > 80 
                      ? 'error.main' : overviewData.summary.utilizationRate > 60 
                      ? 'warning.main' : 'success.main',
                    bgcolor: 'background.paper',
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: 1
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <SpeedIcon sx={{ 
                          fontSize: '1.5rem', 
                          color: overviewData.summary.utilizationRate > 80 
                            ? 'error.main' : overviewData.summary.utilizationRate > 60 
                            ? 'warning.main' : 'success.main',
                          mr: 1 
                        }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          {t('studentFacilitySpace.metrics.utilizationRate')}
                        </Typography>
                      </Box>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 600, 
                        color: overviewData.summary.utilizationRate > 80 
                          ? 'error.main' : overviewData.summary.utilizationRate > 60 
                          ? 'warning.main' : 'success.main',
                        mb: 2
                      }}>
                        {overviewData.summary.utilizationRate.toFixed(0)}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={overviewData.summary.utilizationRate} 
                        sx={{ height: 6, borderRadius: 3, mb: 1 }}
                        color={overviewData.summary.utilizationRate > 80 ? 'error' : 
                               overviewData.summary.utilizationRate > 60 ? 'warning' : 'success'}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {overviewData.summary.utilizationRate > 80 ? 'Critical' : 
                         overviewData.summary.utilizationRate > 60 ? 'High Usage' : 'Optimal'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

      {/* Alerts */}
      {alertTableRows.length > 0 && (
        <Paper 
          elevation={0}
          sx={{ 
            mb: 4, 
            p: 3,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
            <WarningIcon sx={{ fontSize: '1.1rem', color: 'warning.main', mr: 1.5 }} />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                color: 'text.primary'
              }}
            >
              {t('studentFacilitySpace.alerts.activeAlerts', { count: alertTableRows.length })}
            </Typography>
          </Box>
          <Stack spacing={1.5}>
            {alertTableRows.map((alert) => (
              <Alert 
                key={alert.id}
                severity={getSeverityColor(alert.severity)}
                sx={{
                  borderRadius: 1.5,
                  border: 'none',
                  bgcolor: `${getSeverityColor(alert.severity)}.50`,
                  '& .MuiAlert-icon': {
                    fontSize: '1.1rem'
                  },
                  '& .MuiAlert-message': {
                    fontSize: '0.9rem'
                  }
                }}
                action={
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={() => fetchFacilityDetails(alert.facilityInstanceId)}
                    sx={{ 
                      borderRadius: 1.5,
                      textTransform: 'none',
                      fontWeight: 500,
                      minWidth: 'auto',
                      fontSize: '0.8rem'
                    }}
                  >
                    {t('studentFacilitySpace.actions.view')}
                  </Button>
                }
              >
                <strong>{alert.facilityName}:</strong> {alert.message}
              </Alert>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Main Table */}
      <Paper 
        elevation={0}
        sx={{ 
          mb: 4,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 2.5, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 500, color: 'text.primary', mb: 2 }}>
            {t('studentFacilitySpace.facilitiesOverview')}
          </Typography>
          
          {/* Search and Filter */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder={t('studentFacilitySpace.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1, maxWidth: 280 }}
            />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>{t('studentFacilitySpace.filter.type')}</InputLabel>
              <Select
                value={facilityTypeFilter}
                onChange={(e) => setFacilityTypeFilter(e.target.value as FacilityType | 'ALL')}
                label={t('studentFacilitySpace.filter.type')}
              >
                <MenuItem value="ALL">{t('studentFacilitySpace.filter.allTypes')}</MenuItem>
                {Object.values(FacilityType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {StudentFacilitySpaceService.getFacilityTypeName(type)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary">
              {filteredFacilities.length} facilities
            </Typography>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 500, py: 2, fontSize: '0.875rem' }}>
                  {t('studentFacilitySpace.table.facility')}
                </TableCell>
                <TableCell sx={{ fontWeight: 500, py: 2, fontSize: '0.875rem' }}>
                  {t('studentFacilitySpace.table.type')}
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 500, py: 2, fontSize: '0.875rem' }}>
                  {t('studentFacilitySpace.table.level')}
                </TableCell>
                <TableCell sx={{ fontWeight: 500, py: 2, fontSize: '0.875rem' }}>
                  {t('studentFacilitySpace.table.spaceUtilization')}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 500, py: 2, fontSize: '0.875rem' }}>
                  {t('studentFacilitySpace.table.actions')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFacilities
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {row.facilityType === FacilityType.WAREHOUSE ? 
                          <WarehouseIcon sx={{ fontSize: '1.25rem', color: 'primary.main', mr: 1 }} /> : 
                          <FactoryIcon sx={{ fontSize: '1.25rem', color: 'secondary.main', mr: 1 }} />
                        }
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {row.facilityName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {StudentFacilitySpaceService.getFacilityTypeName(row.facilityType)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {row.level}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ width: '32%', py: 2 }}>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {row.usedSpace.toLocaleString()} / {row.totalSpace.toLocaleString()}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              fontWeight: 500,
                              color: row.utilizationRate > 80 ? 'error.main' : 
                                     row.utilizationRate > 60 ? 'warning.main' : 'success.main'
                            }}
                          >
                            {row.utilizationRate.toFixed(1)}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={row.utilizationRate}
                          sx={{ height: 4, bgcolor: 'action.hover' }}
                          color={
                            row.utilizationRate > 80 ? 'error' : 
                            row.utilizationRate > 60 ? 'warning' : 'success'
                          }
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ py: 2 }}>
                      <IconButton 
                        size="small" 
                        onClick={() => fetchFacilityDetails(row.id)}
                        sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                      >
                        <InfoIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredFacilities.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Utilization Summary */}
      {utilizationTableRows.length > 0 && (
        <Paper 
          elevation={0}
          sx={{ 
            p: 2.5,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 500, color: 'text.primary' }}>
            {t('studentFacilitySpace.utilizationByType')}
          </Typography>
          <Grid container spacing={2}>
            {utilizationTableRows.map((row) => (
              <Grid item xs={12} sm={6} md={4} key={row.id}>
                <Paper 
                  elevation={0}
                  sx={{
                    p: 2,
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    '&:hover': { 
                      borderColor: row.category === FacilityType.WAREHOUSE ? 'primary.main' : 'secondary.main'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    {row.category === FacilityType.WAREHOUSE ? 
                      <WarehouseIcon sx={{ fontSize: '1.25rem', color: 'primary.main', mr: 1 }} /> : 
                      <FactoryIcon sx={{ fontSize: '1.25rem', color: 'secondary.main', mr: 1 }} />
                    }
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {StudentFacilitySpaceService.getFacilityTypeName(row.category)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {t('studentFacilitySpace.facilityCount', { count: row.facilityCount })}
                  </Typography>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {row.usedSpace.toLocaleString()} / {row.totalSpace.toLocaleString()}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontWeight: 500,
                          color: row.utilizationRate > 80 ? 'error.main' : 
                                 row.utilizationRate > 60 ? 'warning.main' : 'success.main'
                        }}
                      >
                        {row.utilizationRate.toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={row.utilizationRate}
                      sx={{ height: 4, bgcolor: 'action.hover' }}
                      color={
                        row.utilizationRate > 80 ? 'error' : 
                        row.utilizationRate > 60 ? 'warning' : 'success'
                      }
                    />
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Facility Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }
        }}
      >
        {selectedFacilityDetails && (
          <>
            <DialogTitle sx={{ p: 2.5, pb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 500, color: 'text.primary', mb: 0.5 }}>
                    {selectedFacilityDetails.facilityName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {StudentFacilitySpaceService.getFacilityTypeName(selectedFacilityDetails.facilityType)} • Level {selectedFacilityDetails.facilityInfo.level}
                  </Typography>
                </Box>
                <IconButton 
                  onClick={() => setDetailsDialogOpen(false)}
                  sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
              {/* Space Utilization Summary */}
              <Box sx={{ p: 3, bgcolor: 'action.hover' }}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      {t('studentFacilitySpace.details.utilization')}: {selectedFacilityDetails.spaceMetrics.utilizationRate.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedFacilityDetails.spaceMetrics.usedSpace.toLocaleString()} / {selectedFacilityDetails.spaceMetrics.totalSpace.toLocaleString()}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={selectedFacilityDetails.spaceMetrics.utilizationRate}
                    sx={{ height: 8, borderRadius: 4 }}
                    color={
                      selectedFacilityDetails.spaceMetrics.utilizationRate > 80 ? 'error' : 
                      selectedFacilityDetails.spaceMetrics.utilizationRate > 60 ? 'warning' : 'success'
                    }
                  />
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">{t('studentFacilitySpace.details.available')}</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {selectedFacilityDetails.spaceMetrics.availableSpace.toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">{t('studentFacilitySpace.details.rawMaterials')}</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {selectedFacilityDetails.spaceMetrics.rawMaterialSpace.toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">{t('studentFacilitySpace.details.products')}</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                        {selectedFacilityDetails.spaceMetrics.productSpace.toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">{t('studentFacilitySpace.details.status')}</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main', textTransform: 'capitalize' }}>
                        {selectedFacilityDetails.facilityInfo.status.toLowerCase()}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Inventory Items */}
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    {t('studentFacilitySpace.details.inventorySummary')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('studentFacilitySpace.details.totalItems')}: {selectedFacilityDetails.inventorySummary.totalItems}
                  </Typography>
                </Box>
                
                {selectedFacilityDetails.inventorySummary.topItemsBySpace.length > 0 ? (
                  <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                          <TableCell sx={{ fontWeight: 500, py: 1.5 }}>{t('TYPE')}</TableCell>
                          <TableCell sx={{ fontWeight: 500, py: 1.5 }}>{t('NAME')}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500, py: 1.5 }}>{t('studentFacilitySpace.table.quantity')}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500, py: 1.5 }}>{t('studentFacilitySpace.table.spaceUsed')}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500, py: 1.5 }}>{t('studentFacilitySpace.table.percentOfTotal')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedFacilityDetails.inventorySummary.topItemsBySpace.map((item, index) => (
                          <TableRow key={index} hover>
                            <TableCell sx={{ py: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: item.itemType === 'RAW_MATERIAL' ? 'primary.main' : 'secondary.main',
                                  mr: 1
                                }} />
                                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                  {item.itemType === 'RAW_MATERIAL' ? t('studentFacilitySpace.details.rawMaterials') : t('studentFacilitySpace.details.products')}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {item.name}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {item.quantity.toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {item.spaceOccupied.toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                {item.percentageOfTotal.toFixed(1)}%
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">{t('studentFacilitySpace.noInventoryItems')}</Typography>
                  </Box>
                )}
              </Box>

              {/* Footer */}
              <Box sx={{ px: 3, pb: 2 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="caption" color="text.secondary">
                  {t('studentFacilitySpace.details.coordinates')}: ({selectedFacilityDetails.tileCoordinates.q}, {selectedFacilityDetails.tileCoordinates.r}, {selectedFacilityDetails.tileCoordinates.s}) • 
                  {t('studentFacilitySpace.details.lastUpdated')}: {new Date(selectedFacilityDetails.lastUpdated).toLocaleString()}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, pt: 1 }}>
              <Button onClick={() => setDetailsDialogOpen(false)} sx={{ textTransform: 'none' }}>
                {t('studentFacilitySpace.actions.close')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      </Box>
    </Box>
  );
}