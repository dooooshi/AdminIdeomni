'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from '@/@i18n/hooks/useTranslation';
import {
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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  TablePagination,
  Stack,
  Card,
  CardContent,
  TableSortLabel,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Restore as RestoreIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  Settings as SettingsIcon,
  Factory as FactoryIcon,
  Business as BusinessIcon,
  Construction as ConstructionIcon,
  Domain as DomainIcon,
  ExpandMore as ExpandMoreIcon,
  Autorenew as InitializeIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import FacilityConfigService, {
  FacilityConfig,
  FacilityConfigSearchParams,
  FacilityConfigSearchResponse,
  FacilityConfigStatistics
} from '@/lib/services/facilityConfigService';
import { FacilityType, FacilityCategory } from '@/lib/services/facilityService';

interface FacilityConfigListProps {
  onCreateConfig?: () => void;
  onEditConfig?: (config: FacilityConfig) => void;
  onViewConfig?: (config: FacilityConfig) => void;
}

interface FacilityConfigListFilter {
  facilityType: string;
  category: string;
  status: string;
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const FacilityConfigList: React.FC<FacilityConfigListProps> = ({
  onCreateConfig,
  onEditConfig,
  onViewConfig,
}) => {
  const { t } = useTranslation('facilityManagement');
  const theme = useTheme();
  
  // State management
  const [configData, setConfigData] = useState<FacilityConfigSearchResponse | null>(null);
  const [statistics, setStatistics] = useState<FacilityConfigStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<FacilityConfig | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [configToRestore, setConfigToRestore] = useState<FacilityConfig | null>(null);
  const [initializeDialogOpen, setInitializeDialogOpen] = useState(false);
  const [initializing, setInitializing] = useState(false);
  
  // Pagination and filtering
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState<FacilityConfigListFilter>({
    facilityType: '',
    category: '',
    status: '',
    search: '',
    sortBy: 'facilityType',
    sortOrder: 'asc',
  });
  const [searchValue, setSearchValue] = useState('');

  // Load configurations with search and filters
  const loadConfigurations = useCallback(async (params?: Partial<FacilityConfigSearchParams>) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams: FacilityConfigSearchParams = {
        page: page + 1,
        pageSize,
        facilityType: filters.facilityType as FacilityType || undefined,
        category: filters.category as FacilityCategory || undefined,
        isActive: filters.status === 'active' ? true : filters.status === 'inactive' ? false : undefined,
        search: filters.search || undefined,
        sortBy: filters.sortBy || 'facilityType',
        sortOrder: filters.sortOrder || 'asc',
        ...params,
      };

      console.log('🔍 Loading configurations with params:', {
        requestParams: searchParams,
        currentPage: page,
        pageSize,
        filters
      });

      const [configResponse, statsResponse] = await Promise.all([
        FacilityConfigService.searchFacilityConfigs(searchParams),
        FacilityConfigService.getFacilityConfigStatistics(),
      ]);

      console.log('📊 API Response received:', {
        configResponse: {
          total: configResponse?.total,
          page: configResponse?.page,
          pageSize: configResponse?.pageSize,
          totalPages: configResponse?.totalPages,
          hasNext: configResponse?.hasNext,
          hasPrevious: configResponse?.hasPrevious,
          dataLength: configResponse?.data?.length
        },
        expectedPage: page + 1,
        currentUIPage: page
      });

      // Validate pagination response
      if (configResponse && typeof configResponse.total === 'number' && configResponse.total >= 0) {
        // Check if current page is beyond available pages
        if (configResponse.totalPages > 0 && (page + 1) > configResponse.totalPages) {
          console.warn('⚠️ Current page exceeds total pages, resetting to last page', {
            currentPage: page + 1,
            totalPages: configResponse.totalPages
          });
          setPage(Math.max(0, configResponse.totalPages - 1));
          return; // Return early to prevent setting invalid data
        }

        setConfigData(configResponse);
        setStatistics(statsResponse);
        
        console.log('✅ Data set successfully:', {
          totalItems: configResponse.total,
          currentPage: configResponse.page,
          itemsOnPage: configResponse.data?.length
        });
      } else {
        console.error('❌ Invalid API response structure:', configResponse);
        setError(t('ERROR_INVALID_RESPONSE'));
      }
    } catch (err) {
      console.error('❌ Error loading facility configurations:', err);
      setError(t('ERROR_LOADING_CONFIGURATIONS'));
      
      // Reset pagination on error if we're not on the first page
      if (page > 0) {
        console.log('🔄 Resetting to first page due to error');
        setPage(0);
      }
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters, t]);

  // Load data on component mount and when filters change
  useEffect(() => {
    console.log('🔄 Triggering loadConfigurations due to dependency change:', {
      page,
      pageSize,
      filters,
      timestamp: new Date().toISOString()
    });
    loadConfigurations();
  }, [loadConfigurations]);

  // Separate effect to handle page validation after data loads
  useEffect(() => {
    if (configData && configData.totalPages > 0) {
      const maxPage = configData.totalPages - 1;
      if (page > maxPage) {
        console.log('🔧 Auto-correcting page due to data change:', {
          currentPage: page,
          maxPage,
          totalPages: configData.totalPages
        });
        setPage(maxPage);
      }
    }
  }, [configData, page]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        console.log('🔍 Search change (debounced):', {
          from: filters.search,
          to: searchValue,
          resetPage: true
        });
        setFilters(prev => ({ ...prev, search: searchValue }));
        setPage(0); // Reset to first page when search changes
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue, filters.search]);

  // Event handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handleFilterChange = (field: keyof FacilityConfigListFilter, value: string) => {
    console.log('🔍 Filter change:', {
      field,
      from: filters[field],
      to: value,
      resetPage: true
    });
    
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0); // Always reset to first page when filters change
  };

  const handleSort = (field: string) => {
    const isAsc = filters.sortBy === field && filters.sortOrder === 'asc';
    const newSortOrder = isAsc ? 'desc' : 'asc';
    
    console.log('🔀 Sort change:', {
      field,
      from: `${filters.sortBy} ${filters.sortOrder}`,
      to: `${field} ${newSortOrder}`,
      resetPage: true
    });
    
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: newSortOrder,
    }));
    setPage(0); // Reset to first page when sorting changes
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    console.log('📄 Page change requested:', {
      from: page,
      to: newPage,
      totalPages: configData?.totalPages,
      hasNext: configData?.hasNext,
      hasPrevious: configData?.hasPrevious
    });
    
    if (configData && newPage >= 0 && newPage < (configData.totalPages || 1)) {
      setPage(newPage);
    } else {
      console.warn('⚠️ Invalid page change attempt:', {
        requestedPage: newPage,
        validRange: `0 to ${(configData?.totalPages || 1) - 1}`
      });
    }
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPageSize = parseInt(event.target.value, 10);
    console.log('📏 Page size change requested:', {
      from: pageSize,
      to: newPageSize,
      currentPage: page,
      totalItems: configData?.total
    });
    
    setPageSize(newPageSize);
    setPage(0); // Reset to first page when page size changes
  };

  const handleDeleteClick = (config: FacilityConfig) => {
    setConfigToDelete(config);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!configToDelete) return;

    try {
      await FacilityConfigService.deleteFacilityConfig(configToDelete.id);
      setDeleteDialogOpen(false);
      setConfigToDelete(null);
      await loadConfigurations();
    } catch (err) {
      console.error('Error deleting facility configuration:', err);
      setError(t('ERROR_DELETING_CONFIGURATION'));
    }
  };

  const handleRestoreClick = (config: FacilityConfig) => {
    setConfigToRestore(config);
    setRestoreDialogOpen(true);
  };

  const handleRestoreConfirm = async () => {
    if (!configToRestore) return;

    try {
      await FacilityConfigService.restoreFacilityConfig(configToRestore.id);
      setRestoreDialogOpen(false);
      setConfigToRestore(null);
      await loadConfigurations();
    } catch (err) {
      console.error('Error restoring facility configuration:', err);
      setError(t('ERROR_RESTORING_CONFIGURATION'));
    }
  };

  const handleToggleStatus = async (config: FacilityConfig) => {
    try {
      await FacilityConfigService.toggleFacilityConfigStatus(config.id);
      await loadConfigurations();
    } catch (err) {
      console.error('Error toggling facility configuration status:', err);
      setError(t('ERROR_UPDATING_CONFIGURATION'));
    }
  };

  const handleInitializeDefaults = () => {
    setInitializeDialogOpen(true);
  };

  const handleInitializeConfirm = async () => {
    try {
      setInitializing(true);
      const result = await FacilityConfigService.initializeDefaultConfigs();
      setInitializeDialogOpen(false);
      await loadConfigurations();
      setError(null);
      // Show success message
      setTimeout(() => {
        setError(t('INITIALIZE_SUCCESS', { count: result.count }));
      }, 100);
    } catch (err) {
      console.error('Error initializing default configurations:', err);
      setError(t('ERROR_INITIALIZING_CONFIGURATIONS'));
    } finally {
      setInitializing(false);
    }
  };

  // Helper functions
  const getCategoryIcon = (category: FacilityCategory) => {
    switch (category) {
      case FacilityCategory.RAW_MATERIAL_PRODUCTION:
        return <FactoryIcon />;
      case FacilityCategory.FUNCTIONAL:
        return <BusinessIcon />;
      case FacilityCategory.INFRASTRUCTURE:
        return <ConstructionIcon />;
      case FacilityCategory.OTHER:
        return <DomainIcon />;
      default:
        return <SettingsIcon />;
    }
  };

  const getCategoryColor = (category: FacilityCategory) => {
    switch (category) {
      case FacilityCategory.RAW_MATERIAL_PRODUCTION:
        return theme.palette.warning.main;
      case FacilityCategory.FUNCTIONAL:
        return theme.palette.info.main;
      case FacilityCategory.INFRASTRUCTURE:
        return theme.palette.success.main;
      case FacilityCategory.OTHER:
        return theme.palette.secondary.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Memoized values
  const facilityTypes = useMemo(() => Object.values(FacilityType), []);
  const facilityCategories = useMemo(() => Object.values(FacilityCategory), []);

  if (loading && !configData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Statistics Summary */}
      {statistics && (
        <Accordion defaultExpanded sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{t('CONFIGURATION_STATISTICS')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      {t('TOTAL_CONFIGURATIONS')}
                    </Typography>
                    <Typography variant="h4">
                      {statistics.totalConfigs}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      {t('ACTIVE_CONFIGURATIONS')}
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {statistics.activeConfigs}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      {t('INACTIVE_CONFIGURATIONS')}
                    </Typography>
                    <Typography variant="h4" color="error.main">
                      {statistics.inactiveConfigs}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      {t('DELETED_CONFIGURATIONS')}
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      {statistics.deletedConfigs}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Error Alert */}
      {error && (
        <Alert 
          severity={error.includes('SUCCESS') ? 'success' : 'error'} 
          sx={{ mb: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Filters and Actions */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder={t('SEARCH_CONFIGURATIONS_PLACEHOLDER')}
              value={searchValue}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel>{t('FACILITY_TYPE')}</InputLabel>
              <Select
                value={filters.facilityType}
                label={t('FACILITY_TYPE')}
                onChange={(e) => handleFilterChange('facilityType', e.target.value)}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="">{t('ALL_TYPES')}</MenuItem>
                {facilityTypes?.map((type) => (
                  <MenuItem key={type} value={type}>
                    {t(`FACILITY_TYPE_${type}`)}
                  </MenuItem>
                )) || []}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel>{t('CATEGORY')}</InputLabel>
              <Select
                value={filters.category}
                label={t('CATEGORY')}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="">{t('ALL_CATEGORIES')}</MenuItem>
                {facilityCategories?.map((category) => (
                  <MenuItem key={category} value={category}>
                    {t(`FACILITY_CATEGORY_${category}`)}
                  </MenuItem>
                )) || []}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 1 }}>
            <FormControl fullWidth>
              <InputLabel>{t('STATUS')}</InputLabel>
              <Select
                value={filters.status}
                label={t('STATUS')}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                sx={{ minWidth: 140 }}
              >
                <MenuItem value="">{t('ALL_STATUSES')}</MenuItem>
                <MenuItem value="active">{t('ACTIVE')}</MenuItem>
                <MenuItem value="inactive">{t('INACTIVE')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onCreateConfig}
                size="small"
              >
                {t('CREATE_CONFIGURATION')}
              </Button>
              <Tooltip title={t('INITIALIZE_DEFAULT_CONFIGURATIONS')}>
                <IconButton
                  onClick={handleInitializeDefaults}
                  color="primary"
                  size="small"
                >
                  <InitializeIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('REFRESH')}>
                <IconButton
                  onClick={() => loadConfigurations()}
                  disabled={loading}
                  size="small"
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Configurations Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={filters.sortBy === 'facilityType'}
                    direction={filters.sortBy === 'facilityType' ? filters.sortOrder : 'asc'}
                    onClick={() => handleSort('facilityType')}
                  >
                    {t('FACILITY_TYPE')}
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={filters.sortBy === 'category'}
                    direction={filters.sortBy === 'category' ? filters.sortOrder : 'asc'}
                    onClick={() => handleSort('category')}
                  >
                    {t('CATEGORY')}
                  </TableSortLabel>
                </TableCell>
                <TableCell>{t('CAPACITY_RANGE')}</TableCell>
                <TableCell>{t('BUILD_COST_RANGE')}</TableCell>
                <TableCell>{t('STATUS')}</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={filters.sortBy === 'createdAt'}
                    direction={filters.sortBy === 'createdAt' ? filters.sortOrder : 'asc'}
                    onClick={() => handleSort('createdAt')}
                  >
                    {t('CREATED_DATE')}
                  </TableSortLabel>
                </TableCell>
                <TableCell>{t('ACTIONS')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {configData?.data?.length > 0 ? (
                configData.data.map((config) => (
                <TableRow key={config.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      {getCategoryIcon(config.category)}
                      <Box ml={1}>
                        <Typography variant="subtitle2">
                          {t(`FACILITY_TYPE_${config.facilityType}`)}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {config.facilityType}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t(`FACILITY_CATEGORY_${config.category}`)}
                      size="small"
                      sx={{ 
                        backgroundColor: getCategoryColor(config.category) + '20',
                        color: getCategoryColor(config.category),
                        fontWeight: 'medium'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {FacilityConfigService.formatCapacity(config.minCapacity)} - {FacilityConfigService.formatCapacity(config.maxCapacity)}
                    </Typography>
                    {config.defaultCapacity && (
                      <Typography variant="caption" color="textSecondary">
                        {t('DEFAULT')}: {FacilityConfigService.formatCapacity(config.defaultCapacity)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {FacilityConfigService.formatCurrency(config.minBuildCost)} - {FacilityConfigService.formatCurrency(config.maxBuildCost)}
                    </Typography>
                    {config.defaultBuildCost && (
                      <Typography variant="caption" color="textSecondary">
                        {t('DEFAULT')}: {FacilityConfigService.formatCurrency(config.defaultBuildCost)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={config.isActive ? t('ACTIVE') : t('INACTIVE')}
                      color={config.isActive ? 'success' : 'default'}
                      size="small"
                    />
                    {config.isDeleted && (
                      <Chip
                        label={t('DELETED')}
                        color="error"
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(config.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title={t('VIEW_DETAILS')}>
                        <IconButton
                          size="small"
                          onClick={() => onViewConfig?.(config)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('EDIT')}>
                        <IconButton
                          size="small"
                          onClick={() => onEditConfig?.(config)}
                          disabled={config.isDeleted}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={config.isActive ? t('DEACTIVATE') : t('ACTIVATE')}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleStatus(config)}
                          disabled={config.isDeleted}
                        >
                          {config.isActive ? <ToggleOffIcon /> : <ToggleOnIcon />}
                        </IconButton>
                      </Tooltip>
                      {config.isDeleted ? (
                        <Tooltip title={t('RESTORE')}>
                          <IconButton
                            size="small"
                            onClick={() => handleRestoreClick(config)}
                            color="warning"
                          >
                            <RestoreIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title={t('DELETE')}>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(config)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box py={4}>
                      <Typography variant="h6" color="textSecondary">
                        {loading ? t('LOADING_CONFIGURATIONS') : t('NO_CONFIGURATIONS_FOUND')}
                      </Typography>
                      {!loading && (
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={onCreateConfig}
                          sx={{ mt: 2 }}
                        >
                          {t('CREATE_FIRST_CONFIGURATION')}
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {configData && (
          <Box sx={{ position: 'relative' }}>
            <TablePagination
              rowsPerPageOptions={[10, 20, 50, 100]}
              component="div"
              count={configData.total || 0}
              rowsPerPage={pageSize}
              page={Math.min(page, Math.max(0, (configData.totalPages || 1) - 1))}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handlePageSizeChange}
              labelRowsPerPage={t('ROWS_PER_PAGE')}
              labelDisplayedRows={({ from, to, count }) =>
                t('PAGINATION_LABEL', { from, to, count })
              }
              sx={{
                opacity: loading ? 0.6 : 1,
                pointerEvents: loading ? 'none' : 'auto'
              }}
            />
            {loading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 1
                }}
              >
                <CircularProgress size={20} />
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('CONFIRM_DELETE_CONFIGURATION')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('DELETE_CONFIGURATION_CONFIRMATION_MESSAGE', {
              type: configToDelete ? t(`FACILITY_TYPE_${configToDelete.facilityType}`) : '',
            })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('CANCEL')}
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            {t('DELETE')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog open={restoreDialogOpen} onClose={() => setRestoreDialogOpen(false)}>
        <DialogTitle>{t('CONFIRM_RESTORE_CONFIGURATION')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('RESTORE_CONFIGURATION_CONFIRMATION_MESSAGE', {
              type: configToRestore ? t(`FACILITY_TYPE_${configToRestore.facilityType}`) : '',
            })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialogOpen(false)}>
            {t('CANCEL')}
          </Button>
          <Button onClick={handleRestoreConfirm} color="warning" variant="contained">
            {t('RESTORE')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Initialize Default Configurations Dialog */}
      <Dialog open={initializeDialogOpen} onClose={() => setInitializeDialogOpen(false)}>
        <DialogTitle>{t('INITIALIZE_DEFAULT_CONFIGURATIONS')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('INITIALIZE_DEFAULT_CONFIGURATIONS_MESSAGE')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInitializeDialogOpen(false)} disabled={initializing}>
            {t('CANCEL')}
          </Button>
          <Button 
            onClick={handleInitializeConfirm} 
            color="primary" 
            variant="contained"
            disabled={initializing}
            startIcon={initializing ? <CircularProgress size={20} /> : <CheckCircleIcon />}
          >
            {initializing ? t('INITIALIZING') : t('INITIALIZE')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FacilityConfigList; 