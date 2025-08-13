'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useMapTemplateTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Grid,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Alert,
  LinearProgress,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  Build as BuildIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Calculate as CalculateIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';

import {
  TileFacilityBuildConfig,
  GetTileFacilityConfigsQueryParams,
  LandType,
  FacilityType,
  PaginatedResponse,
} from '@/components/map/types';
import TileFacilityBuildConfigService from '@/lib/services/tileFacilityBuildConfigService';
import TileFacilityConfigForm from './TileFacilityConfigForm';

interface TileFacilityConfigListProps {
  templateId: number;
  onConfigSelect?: (config: TileFacilityBuildConfig) => void;
  showActions?: boolean;
  maxHeight?: number;
}

type SortField = 'landType' | 'facilityType' | 'requiredGold' | 'requiredCarbon' | 'maxLevel' | 'isAllowed';
type SortOrder = 'asc' | 'desc';

const TileFacilityConfigList: React.FC<TileFacilityConfigListProps> = ({
  templateId,
  onConfigSelect,
  showActions = true,
  maxHeight = 600,
}) => {
  const { t } = useMapTemplateTranslation();

  // State
  const [configs, setConfigs] = useState<TileFacilityBuildConfig[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<SortField>('landType');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [landTypeFilter, setLandTypeFilter] = useState<LandType | ''>('');
  const [facilityTypeFilter, setFacilityTypeFilter] = useState<FacilityType | ''>('');
  const [allowedFilter, setAllowedFilter] = useState<boolean | ''>('');
  const [activeFilter, setActiveFilter] = useState<boolean | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<TileFacilityBuildConfig | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<TileFacilityBuildConfig | null>(null);

  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuConfig, setMenuConfig] = useState<TileFacilityBuildConfig | null>(null);

  // Load configurations
  const loadConfigs = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const params: GetTileFacilityConfigsQueryParams = {
        page: page + 1, // API uses 1-based pagination
        pageSize,
        sortBy: sortField,
        sortOrder,
      };

      if (landTypeFilter) params.landType = landTypeFilter;
      if (facilityTypeFilter) params.facilityType = facilityTypeFilter;
      if (allowedFilter !== '') params.isAllowed = allowedFilter;
      if (activeFilter !== '') params.isActive = activeFilter;

      const response = await TileFacilityBuildConfigService.getTileFacilityConfigs(templateId, params);
      
      setConfigs(response.data || []);
      setTotalCount(response.meta?.total || 0);
    } catch (error) {
      console.error('Failed to load facility configurations:', error);
      setConfigs([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [templateId, page, pageSize, sortField, sortOrder, landTypeFilter, facilityTypeFilter, allowedFilter, activeFilter]);

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  const handleSort = (field: SortField) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreateConfig = () => {
    setSelectedConfig(null);
    setFormMode('create');
    setFormDialogOpen(true);
  };

  const handleEditConfig = (config: TileFacilityBuildConfig) => {
    setSelectedConfig(config);
    setFormMode('edit');
    setFormDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfig = (config: TileFacilityBuildConfig) => {
    setConfigToDelete(config);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleRestoreConfig = async (config: TileFacilityBuildConfig) => {
    try {
      await TileFacilityBuildConfigService.restoreTileFacilityConfig(templateId, config.id);
      loadConfigs(); // Refresh the list
      handleMenuClose();
    } catch (error) {
      console.error('Failed to restore configuration:', error);
    }
  };

  const handleConfigSave = (config: TileFacilityBuildConfig) => {
    setFormDialogOpen(false);
    loadConfigs(); // Refresh the list
    if (onConfigSelect) {
      onConfigSelect(config);
    }
  };

  const handleConfigDelete = async () => {
    if (!configToDelete) return;

    try {
      await TileFacilityBuildConfigService.deleteTileFacilityConfig(templateId, configToDelete.id);
      setDeleteDialogOpen(false);
      setConfigToDelete(null);
      loadConfigs(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete configuration:', error);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, config: TileFacilityBuildConfig) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuConfig(config);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuConfig(null);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setLandTypeFilter('');
    setFacilityTypeFilter('');
    setAllowedFilter('');
    setActiveFilter('');
    setPage(0);
  };

  const getLandTypeColor = (landType: LandType): 'primary' | 'secondary' | 'success' => {
    switch (landType) {
      case LandType.MARINE: return 'primary';
      case LandType.COASTAL: return 'secondary';
      case LandType.PLAIN: return 'success';
      default: return 'primary';
    }
  };

  const getFacilityTypeIcon = (facilityType: FacilityType) => {
    // You can customize these icons based on facility type
    return <BuildIcon />;
  };

  return (
    <Card sx={{ height: maxHeight, display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h6">
              {t('FACILITY_CONFIGURATIONS')}
            </Typography>
            <Chip 
              label={`${totalCount} ${t('CONFIGURATIONS')}`} 
              size="small" 
              variant="outlined" 
            />
          </Box>
        }
        action={
          <Box display="flex" gap={1}>
            <Tooltip title={t('TOGGLE_FILTERS')}>
              <IconButton 
                onClick={() => setShowFilters(!showFilters)}
                color={showFilters ? 'primary' : 'default'}
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            {showActions && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateConfig}
                size="small"
              >
                {t('ADD_CONFIG')}
              </Button>
            )}
          </Box>
        }
      />

      <CardContent sx={{ pt: 0, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Filters */}
        {showFilters && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  label={t('SEARCH')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>{t('LAND_TYPE')}</InputLabel>
                  <Select
                    value={landTypeFilter}
                    label={t('LAND_TYPE')}
                    onChange={(e) => setLandTypeFilter(e.target.value as LandType | '')}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          minWidth: 200,
                        },
                      },
                    }}
                  >
                    <MenuItem value="" sx={{ minWidth: 180 }}>{t('ALL')}</MenuItem>
                    {Object.values(LandType).map((type) => (
                      <MenuItem key={type} value={type} sx={{ minWidth: 180 }}>
                        {t(`LAND_TYPE_${type}`)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>{t('FACILITY_TYPE')}</InputLabel>
                  <Select
                    value={facilityTypeFilter}
                    label={t('FACILITY_TYPE')}
                    onChange={(e) => setFacilityTypeFilter(e.target.value as FacilityType | '')}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          minWidth: 280,
                        },
                      },
                    }}
                  >
                    <MenuItem value="" sx={{ minWidth: 260 }}>{t('ALL')}</MenuItem>
                    {Object.values(FacilityType).map((type) => (
                      <MenuItem key={type} value={type} sx={{ minWidth: 260 }}>
                        {t(`FACILITY_TYPE_${type}`)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>{t('STATUS')}</InputLabel>
                  <Select
                    value={allowedFilter}
                    label={t('STATUS')}
                    onChange={(e) => setAllowedFilter(e.target.value as boolean | '')}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          minWidth: 170,
                        },
                      },
                    }}
                  >
                    <MenuItem value="" sx={{ minWidth: 150 }}>{t('ALL')}</MenuItem>
                    <MenuItem value={true} sx={{ minWidth: 150 }}>{t('ALLOWED')}</MenuItem>
                    <MenuItem value={false} sx={{ minWidth: 150 }}>{t('NOT_ALLOWED')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={activeFilter === true}
                      onChange={(e) => setActiveFilter(e.target.checked ? true : '')}
                    />
                  }
                  label={t('ACTIVE_ONLY')}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 1 }}>
                <Button onClick={resetFilters} size="small">
                  {t('RESET')}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Loading */}
        {isLoading && <LinearProgress sx={{ mb: 2 }} />}

        {/* Table */}
        <TableContainer component={Paper} sx={{ flex: 1, overflow: 'auto' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'landType'}
                    direction={sortField === 'landType' ? sortOrder : 'asc'}
                    onClick={() => handleSort('landType')}
                  >
                    {t('LAND_TYPE')}
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'facilityType'}
                    direction={sortField === 'facilityType' ? sortOrder : 'asc'}
                    onClick={() => handleSort('facilityType')}
                  >
                    {t('FACILITY_TYPE')}
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'requiredGold'}
                    direction={sortField === 'requiredGold' ? sortOrder : 'asc'}
                    onClick={() => handleSort('requiredGold')}
                  >
                    {t('GOLD_COST')}
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'requiredCarbon'}
                    direction={sortField === 'requiredCarbon' ? sortOrder : 'asc'}
                    onClick={() => handleSort('requiredCarbon')}
                  >
                    {t('CARBON_COST')}
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">
                  <TableSortLabel
                    active={sortField === 'maxLevel'}
                    direction={sortField === 'maxLevel' ? sortOrder : 'asc'}
                    onClick={() => handleSort('maxLevel')}
                  >
                    {t('MAX_LEVEL')}
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">
                  <TableSortLabel
                    active={sortField === 'isAllowed'}
                    direction={sortField === 'isAllowed' ? sortOrder : 'asc'}
                    onClick={() => handleSort('isAllowed')}
                  >
                    {t('STATUS')}
                  </TableSortLabel>
                </TableCell>
                {showActions && <TableCell align="center">{t('ACTIONS')}</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {configs.map((config) => (
                <TableRow 
                  key={config.id}
                  hover
                  onClick={() => onConfigSelect?.(config)}
                  sx={{ 
                    cursor: onConfigSelect ? 'pointer' : 'default',
                    opacity: config.deletedAt ? 0.6 : 1,
                  }}
                >
                  <TableCell>
                    <Chip
                      label={t(`LAND_TYPE_${config.landType}`)}
                      color={getLandTypeColor(config.landType)}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getFacilityTypeIcon(config.facilityType)}
                      <Typography variant="body2">
                        {t(`FACILITY_TYPE_${config.facilityType}`)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontFamily="monospace">
                      {TileFacilityBuildConfigService.formatCurrency(config.requiredGold)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontFamily="monospace">
                      {TileFacilityBuildConfigService.formatNumber(config.requiredCarbon)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={config.maxLevel}
                      color={config.maxLevel > 5 ? 'success' : 'default'}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {config.isAllowed ? (
                      <CheckIcon color="success" fontSize="small" />
                    ) : (
                      <CloseIcon color="error" fontSize="small" />
                    )}
                  </TableCell>
                  {showActions && (
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, config);
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {configs.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={showActions ? 7 : 6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('NO_CONFIGURATIONS_FOUND')}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderTop: 1,
          borderColor: 'divider',
          mt: 1,
          pt: 1,
          backgroundColor: 'background.paper'
        }}>
          <Typography variant="body2" color="text.secondary">
            {totalCount > 0 ? (
              t('SHOWING_RESULTS', {
                from: page * pageSize + 1,
                to: Math.min((page + 1) * pageSize, totalCount),
                total: totalCount
              })
            ) : (
              t('NO_RESULTS')
            )}
          </Typography>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={pageSize}
            onRowsPerPageChange={handlePageSizeChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage={t('ROWS_PER_PAGE')}
            showFirstButton
            showLastButton
            sx={{ 
              '& .MuiTablePagination-toolbar': {
                minHeight: '52px',
              },
              '& .MuiTablePagination-selectLabel': {
                margin: 0,
              },
              '& .MuiTablePagination-displayedRows': {
                margin: 0,
              }
            }}
          />
        </Box>

        {/* Action Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => menuConfig && handleEditConfig(menuConfig)}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('EDIT')}</ListItemText>
          </MenuItem>
          
          <MenuItem onClick={() => menuConfig && onConfigSelect?.(menuConfig)}>
            <ListItemIcon>
              <VisibilityIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('VIEW_DETAILS')}</ListItemText>
          </MenuItem>

          {menuConfig?.deletedAt ? (
            <MenuItem onClick={() => menuConfig && handleRestoreConfig(menuConfig)}>
              <ListItemIcon>
                <RestoreIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t('RESTORE')}</ListItemText>
            </MenuItem>
          ) : (
            <MenuItem onClick={() => menuConfig && handleDeleteConfig(menuConfig)}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t('DELETE')}</ListItemText>
            </MenuItem>
          )}
        </Menu>

        {/* Form Dialog */}
        <Dialog 
          open={formDialogOpen} 
          onClose={() => setFormDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <TileFacilityConfigForm
            templateId={templateId}
            config={selectedConfig || undefined}
            mode={formMode}
            onSave={handleConfigSave}
            onCancel={() => setFormDialogOpen(false)}
            onDelete={() => {
              setFormDialogOpen(false);
              if (selectedConfig) {
                handleDeleteConfig(selectedConfig);
              }
            }}
          />
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>{t('CONFIRM_DELETE')}</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              {t('DELETE_CONFIG_WARNING')}
            </Alert>
            {configToDelete && (
              <Typography>
                {t('DELETE_CONFIG_CONFIRM', {
                  facilityType: t(`FACILITY_TYPE_${configToDelete.facilityType}`),
                  landType: t(`LAND_TYPE_${configToDelete.landType}`)
                })}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              {t('CANCEL')}
            </Button>
            <LoadingButton
              onClick={handleConfigDelete}
              color="error"
              variant="contained"
            >
              {t('DELETE')}
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TileFacilityConfigList;