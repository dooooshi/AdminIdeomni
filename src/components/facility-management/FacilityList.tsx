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
  Factory as FactoryIcon,
  Business as BusinessIcon,
  Construction as ConstructionIcon,
  Domain as DomainIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import FacilityService, {
  Facility,
  FacilityType,
  FacilityCategory,
  FacilitySearchParams,
  FacilitySearchResponse,
} from '@/lib/services/facilityService';

interface FacilityListProps {
  onCreateFacility: () => void;
  onEditFacility: (facility: Facility) => void;
  onViewFacility: (facility: Facility) => void;
}

interface FacilityListFilter {
  search: string;
  facilityType: string;
  category: string;
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const FacilityList: React.FC<FacilityListProps> = ({
  onCreateFacility,
  onEditFacility,
  onViewFacility,
}) => {
  const { t } = useTranslation('facilityManagement');
  const theme = useTheme();
  const [facilityData, setFacilityData] = useState<FacilitySearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [facilityToDelete, setFacilityToDelete] = useState<Facility | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [facilityToRestore, setFacilityToRestore] = useState<Facility | null>(null);
  const [restoring, setRestoring] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  
  // Filters state
  const [filters, setFilters] = useState<FacilityListFilter>({
    search: '',
    facilityType: '',
    category: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Debounced search
  const [searchValue, setSearchValue] = useState('');
  const [searchDebounceTimeout, setSearchDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  const loadFacilities = async (params?: Partial<FacilitySearchParams>) => {
    try {
      setLoading(true);
      setError(null);
      
      const requestParams: FacilitySearchParams = {
        page: page + 1,
        pageSize,
        search: filters.search || undefined,
        facilityType: filters.facilityType as FacilityType || undefined,
        category: filters.category as FacilityCategory || undefined,
        isActive: filters.status === 'active' ? true : filters.status === 'inactive' ? false : undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...params
      };

      const data = await FacilityService.searchFacilities(requestParams);
      setFacilityData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('FACILITY_LOAD_ERROR'));
      setFacilityData(null);
    } finally {
      setLoading(false);
    }
  };

  // Load data when dependencies change
  useEffect(() => {
    loadFacilities();
  }, [page, pageSize, filters.facilityType, filters.category, filters.status, filters.sortBy, filters.sortOrder, filters.search]);

  // Handle search with debounce
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);

    if (searchDebounceTimeout) {
      clearTimeout(searchDebounceTimeout);
    }

    const timeout = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: value }));
      setPage(0);
    }, 500);

    setSearchDebounceTimeout(timeout);
  };

  const handleFilterChange = (field: keyof FacilityListFilter, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const handleSort = (field: string) => {
    const isAsc = filters.sortBy === field && filters.sortOrder === 'asc';
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: isAsc ? 'desc' : 'asc'
    }));
  };

  const handleDeleteClick = (facility: Facility) => {
    setFacilityToDelete(facility);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!facilityToDelete) return;

    try {
      setDeleting(true);
      await FacilityService.deleteFacility(facilityToDelete.id);
      setDeleteDialogOpen(false);
      setFacilityToDelete(null);
      loadFacilities();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('FACILITY_DELETE_ERROR'));
    } finally {
      setDeleting(false);
    }
  };

  const handleRestoreClick = (facility: Facility) => {
    setFacilityToRestore(facility);
    setRestoreDialogOpen(true);
  };

  const handleRestoreConfirm = async () => {
    if (!facilityToRestore) return;

    try {
      setRestoring(true);
      await FacilityService.restoreFacility(facilityToRestore.id);
      setRestoreDialogOpen(false);
      setFacilityToRestore(null);
      loadFacilities();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('FACILITY_RESTORE_ERROR'));
    } finally {
      setRestoring(false);
    }
  };

  const handleToggleStatus = async (facility: Facility) => {
    try {
      await FacilityService.toggleFacilityStatus(facility.id);
      loadFacilities();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('FACILITY_UPDATE_ERROR'));
    }
  };

  const getCategoryIcon = (category: FacilityCategory) => {
    switch (category) {
      case FacilityCategory.RAW_MATERIAL_PRODUCTION:
        return <ConstructionIcon fontSize="small" />;
      case FacilityCategory.FUNCTIONAL:
        return <FactoryIcon fontSize="small" />;
      case FacilityCategory.INFRASTRUCTURE:
        return <DomainIcon fontSize="small" />;
      case FacilityCategory.OTHER:
        return <BusinessIcon fontSize="small" />;
      default:
        return <BusinessIcon fontSize="small" />;
    }
  };

  const getCategoryColor = (category: FacilityCategory) => {
    switch (category) {
      case FacilityCategory.RAW_MATERIAL_PRODUCTION:
        return 'success';
      case FacilityCategory.FUNCTIONAL:
        return 'primary';
      case FacilityCategory.INFRASTRUCTURE:
        return 'warning';
      case FacilityCategory.OTHER:
        return 'secondary';
      default:
        return 'default';
    }
  };

  const facilityTypes = Object.values(FacilityType);
  const facilityCategories = Object.values(FacilityCategory);

  return (
    <Box>
      {/* Statistics Cards */}
      {facilityData && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="h6">
                  {t('TOTAL_FACILITIES')}
                </Typography>
                <Typography variant="h4">
                  {facilityData.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="h6">
                  {t('ACTIVE_FACILITIES')}
                </Typography>
                <Typography variant="h4" color="success.main">
                  {facilityData.data.filter(f => f.isActive).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="h6">
                  {t('INACTIVE_FACILITIES')}
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {facilityData.data.filter(f => !f.isActive).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="h6">
                  {t('FACILITIES_BY_CATEGORY')}
                </Typography>
                <Typography variant="h4">
                  {facilityCategories.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder={t('SEARCH_PLACEHOLDER')}
                value={searchValue}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>{t('FILTER_BY_CATEGORY')}</InputLabel>
                <Select
                  value={filters.category}
                  label={t('FILTER_BY_CATEGORY')}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  sx={{ minWidth: 180 }}
                >
                  <MenuItem value="">{t('ALL_CATEGORIES')}</MenuItem>
                  {facilityCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {t(category)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>{t('FILTER_BY_TYPE')}</InputLabel>
                <Select
                  value={filters.facilityType}
                  label={t('FILTER_BY_TYPE')}
                  onChange={(e) => handleFilterChange('facilityType', e.target.value)}
                  sx={{ minWidth: 160 }}
                >
                  <MenuItem value="">{t('ALL_TYPES')}</MenuItem>
                  {facilityTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {t(type)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>{t('FILTER_BY_STATUS')}</InputLabel>
                <Select
                  value={filters.status}
                  label={t('FILTER_BY_STATUS')}
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
                  onClick={onCreateFacility}
                  fullWidth
                >
                  {t('CREATE_FACILITY')}
                </Button>
                <IconButton onClick={() => loadFacilities()}>
                  <RefreshIcon />
                </IconButton>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Data Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={filters.sortBy === 'name'}
                    direction={filters.sortBy === 'name' ? filters.sortOrder : 'asc'}
                    onClick={() => handleSort('name')}
                  >
                    {t('NAME')}
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={filters.sortBy === 'facilityType'}
                    direction={filters.sortBy === 'facilityType' ? filters.sortOrder : 'asc'}
                    onClick={() => handleSort('facilityType')}
                  >
                    {t('TYPE')}
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
                <TableCell>{t('CAPACITY')}</TableCell>
                <TableCell>{t('BUILD_COST')}</TableCell>
                <TableCell>{t('STATUS')}</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={filters.sortBy === 'createdAt'}
                    direction={filters.sortBy === 'createdAt' ? filters.sortOrder : 'asc'}
                    onClick={() => handleSort('createdAt')}
                  >
                    {t('CREATED_AT')}
                  </TableSortLabel>
                </TableCell>
                <TableCell>{t('ACTIONS')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {t('LOADING_FACILITIES')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : facilityData?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="textSecondary">
                      {t('NO_FACILITIES_FOUND')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                facilityData?.data.map((facility) => (
                  <TableRow key={facility.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {facility.name}
                        </Typography>
                        {facility.description && (
                          <Typography variant="caption" color="textSecondary">
                            {facility.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {FacilityService.getFacilityTypeName(facility.facilityType)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getCategoryIcon(facility.category)}
                        label={t(facility.category)}
                        color={getCategoryColor(facility.category) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {FacilityService.formatCapacity(facility.capacity)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {FacilityService.formatCurrency(facility.buildCost)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={facility.isActive ? t('ACTIVE') : t('INACTIVE')}
                        color={facility.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(facility.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title={t('VIEW')}>
                          <IconButton
                            size="small"
                            onClick={() => onViewFacility(facility)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('EDIT')}>
                          <IconButton
                            size="small"
                            onClick={() => onEditFacility(facility)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('TOGGLE_STATUS')}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleStatus(facility)}
                          >
                            {facility.isActive ? <ToggleOffIcon /> : <ToggleOnIcon />}
                          </IconButton>
                        </Tooltip>
                        {facility.deletedAt ? (
                          <Tooltip title={t('RESTORE')}>
                            <IconButton
                              size="small"
                              onClick={() => handleRestoreClick(facility)}
                              color="success"
                            >
                              <RestoreIcon />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title={t('DELETE')}>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(facility)}
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
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {facilityData && (
          <TablePagination
            rowsPerPageOptions={[10, 20, 50]}
            component="div"
            count={facilityData.total}
            rowsPerPage={pageSize}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setPageSize(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('DELETE_FACILITY')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('DELETE_FACILITY_CONFIRM')}
          </Typography>
          {facilityToDelete && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {facilityToDelete.name}
            </Typography>
          )}
          <Alert severity="info" sx={{ mt: 2 }}>
            {t('DELETE_FACILITY_WARNING')}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('CANCEL')}
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : undefined}
          >
            {t('DELETE')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog open={restoreDialogOpen} onClose={() => setRestoreDialogOpen(false)}>
        <DialogTitle>{t('RESTORE_FACILITY')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('RESTORE_FACILITY_CONFIRM')}
          </Typography>
          {facilityToRestore && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {facilityToRestore.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialogOpen(false)}>
            {t('CANCEL')}
          </Button>
          <Button
            onClick={handleRestoreConfirm}
            color="success"
            disabled={restoring}
            startIcon={restoring ? <CircularProgress size={16} /> : undefined}
          >
            {t('RESTORE')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FacilityList; 