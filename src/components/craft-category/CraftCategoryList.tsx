'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
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
  Divider
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  Factory as FactoryIcon,
  Science as ScienceIcon,
  Engineering as EngineeringIcon,
  ElectricBolt as EnergyIcon,
  ContentCut as TextileIcon,
  Restaurant as FoodIcon,
  Memory as ElectronicIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
  Build as BuildIcon
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import CraftCategoryService from '@/lib/services/craftCategoryService';
import {
  CraftCategory,
  CraftCategoryType,
  TechnologyLevel,
  CraftCategorySearchParams,
  CraftCategorySearchResponse
} from '@/types/craftCategory';

interface CraftCategoryListProps {
  onCreateCategory?: () => void;
  onEditCategory?: (category: CraftCategory) => void;
  onViewCategory?: (category: CraftCategory) => void;
}

interface CraftCategoryListFilter {
  categoryType: string;
  technologyLevel: string;
  status: string;
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const CraftCategoryList: React.FC<CraftCategoryListProps> = ({
  onCreateCategory,
  onEditCategory,
  onViewCategory,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  
  // State management
  const [categoryData, setCategoryData] = useState<CraftCategorySearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CraftCategory | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [categoryToView, setCategoryToView] = useState<CraftCategory | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filter state
  const [filters, setFilters] = useState<CraftCategoryListFilter>({
    categoryType: '',
    technologyLevel: '',
    status: '',
    search: '',
    sortBy: 'categoryType',
    sortOrder: 'asc'
  });

  // Fetch craft categories
  const fetchCraftCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params: CraftCategorySearchParams = {
        page: page + 1,
        limit: rowsPerPage,
        sort: filters.sortBy,
        order: filters.sortOrder,
        search: filters.search || undefined,
        categoryType: filters.categoryType as CraftCategoryType || undefined,
        technologyLevel: filters.technologyLevel as TechnologyLevel || undefined,
        isActive: filters.status === 'active' ? true : filters.status === 'inactive' ? false : undefined
      };
      
      const response = await CraftCategoryService.searchCraftCategories(params);
      setCategoryData(response);
    } catch (err: any) {
      setError(err.message || t('craftCategory.LOAD_ERROR'));
      console.error('Error fetching craft categories:', err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters, t]);

  useEffect(() => {
    fetchCraftCategories();
  }, [fetchCraftCategories]);

  // Get icon for category type
  const getCategoryIcon = (type: CraftCategoryType) => {
    const iconMap: Record<CraftCategoryType, React.ReactElement> = {
      [CraftCategoryType.MECHANICAL_MANUFACTURING]: <EngineeringIcon />,
      [CraftCategoryType.MATERIALS_PROCESSING]: <BuildIcon />,
      [CraftCategoryType.BIOCHEMICAL]: <ScienceIcon />,
      [CraftCategoryType.ELECTRONIC_EQUIPMENT]: <ElectronicIcon />,
      [CraftCategoryType.ENERGY_UTILIZATION]: <EnergyIcon />,
      [CraftCategoryType.CUTTING_TEXTILE]: <TextileIcon />,
      [CraftCategoryType.FOOD_PROCESSING]: <FoodIcon />
    };
    return iconMap[type] || <FactoryIcon />;
  };

  // Get color for technology level
  const getLevelColor = (level: TechnologyLevel): 'default' | 'primary' | 'secondary' | 'success' | 'warning' => {
    const colorMap: Record<TechnologyLevel, 'default' | 'primary' | 'secondary' | 'success' | 'warning'> = {
      [TechnologyLevel.LEVEL_1]: 'default',
      [TechnologyLevel.LEVEL_2]: 'primary',
      [TechnologyLevel.LEVEL_3]: 'secondary',
      [TechnologyLevel.LEVEL_4]: 'success'
    };
    return colorMap[level] || 'default';
  };

  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle filters
  const handleFilterChange = (field: keyof CraftCategoryListFilter, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({
      categoryType: '',
      technologyLevel: '',
      status: '',
      search: '',
      sortBy: 'categoryType',
      sortOrder: 'asc'
    });
    setPage(0);
  };

  // Handle sorting
  const handleSort = (property: string) => {
    const isAsc = filters.sortBy === property && filters.sortOrder === 'asc';
    setFilters(prev => ({
      ...prev,
      sortBy: property,
      sortOrder: isAsc ? 'desc' : 'asc'
    }));
  };

  // Handle delete
  const handleDeleteClick = (category: CraftCategory) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    
    try {
      await CraftCategoryService.deleteCraftCategory(categoryToDelete.id);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      fetchCraftCategories();
    } catch (err: any) {
      setError(err.message || t('craftCategory.DELETE_ERROR'));
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (category: CraftCategory) => {
    try {
      await CraftCategoryService.toggleCraftCategoryStatus(category.id);
      fetchCraftCategories();
    } catch (err: any) {
      setError(err.message || t('craftCategory.STATUS_UPDATE_ERROR'));
    }
  };

  // Handle view
  const handleViewClick = (category: CraftCategory) => {
    setCategoryToView(category);
    setViewDialogOpen(true);
  };

  const hasActiveFilters = filters.categoryType || filters.technologyLevel || filters.status || filters.search;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t('craftCategory.CRAFT_CATEGORY_MANAGEMENT')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('craftCategory.CRAFT_CATEGORY_SUBTITLE')}
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* First row - Search */}
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder={t('craftCategory.SEARCH_PLACEHOLDER')}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            
            {/* First row - Actions */}
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                {hasActiveFilters && (
                  <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={handleClearFilters}
                  >
                    {t('craftCategory.CLEAR_FILTERS')}
                  </Button>
                )}
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchCraftCategories}
                >
                  {t('craftCategory.REFRESH')}
                </Button>
                {onCreateCategory && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={onCreateCategory}
                  >
                    {t('craftCategory.CREATE')}
                  </Button>
                )}
              </Stack>
            </Grid>
            
            {/* Second row - Filter dropdowns */}
            <Grid item xs={12} sm={4} md={4}>
              <FormControl fullWidth sx={{ minWidth: 200 }}>
                <InputLabel>{t('craftCategory.FILTER_BY_CATEGORY')}</InputLabel>
                <Select
                  value={filters.categoryType}
                  onChange={(e) => handleFilterChange('categoryType', e.target.value)}
                  label={t('craftCategory.FILTER_BY_CATEGORY')}
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="">{t('craftCategory.ALL_CATEGORIES')}</MenuItem>
                  {Object.values(CraftCategoryType).map(type => (
                    <MenuItem key={type} value={type}>
                      {t(`craftCategory.type.${type}`)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4} md={4}>
              <FormControl fullWidth sx={{ minWidth: 200 }}>
                <InputLabel>{t('craftCategory.FILTER_BY_LEVEL')}</InputLabel>
                <Select
                  value={filters.technologyLevel}
                  onChange={(e) => handleFilterChange('technologyLevel', e.target.value)}
                  label={t('craftCategory.FILTER_BY_LEVEL')}
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="">{t('craftCategory.ALL_LEVELS')}</MenuItem>
                  {Object.values(TechnologyLevel).map(level => (
                    <MenuItem key={level} value={level}>
                      {t(`craftCategory.level.${level}`)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4} md={4}>
              <FormControl fullWidth sx={{ minWidth: 150 }}>
                <InputLabel>{t('craftCategory.FILTER_BY_STATUS')}</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label={t('craftCategory.FILTER_BY_STATUS')}
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="">{t('craftCategory.ALL_STATUSES')}</MenuItem>
                  <MenuItem value="active">{t('craftCategory.ACTIVE')}</MenuItem>
                  <MenuItem value="inactive">{t('craftCategory.INACTIVE')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table sx={{ minWidth: 900 }}>
            <TableHead sx={{ 
              backgroundColor: theme.palette.mode === 'dark' 
                ? theme.palette.grey[900] 
                : theme.palette.grey[50] 
            }}>
              <TableRow>
                <TableCell 
                  align="center" 
                  sx={{ fontWeight: 600, borderBottom: `2px solid ${theme.palette.primary.main}` }}
                >
                  <TableSortLabel
                    active={filters.sortBy === 'categoryType'}
                    direction={filters.sortBy === 'categoryType' ? filters.sortOrder : 'asc'}
                    onClick={() => handleSort('categoryType')}
                    sx={{ 
                      '& .MuiTableSortLabel-icon': { 
                        color: theme.palette.primary.main + ' !important' 
                      }
                    }}
                  >
                    {t('craftCategory.CATEGORY_TYPE')}
                  </TableSortLabel>
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ fontWeight: 600, borderBottom: `2px solid ${theme.palette.primary.main}` }}
                >
                  <TableSortLabel
                    active={filters.sortBy === 'technologyLevel'}
                    direction={filters.sortBy === 'technologyLevel' ? filters.sortOrder : 'asc'}
                    onClick={() => handleSort('technologyLevel')}
                    sx={{ 
                      '& .MuiTableSortLabel-icon': { 
                        color: theme.palette.primary.main + ' !important' 
                      }
                    }}
                  >
                    {t('craftCategory.TECHNOLOGY_LEVEL')}
                  </TableSortLabel>
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ fontWeight: 600, borderBottom: `2px solid ${theme.palette.primary.main}` }}
                >
                  {t('craftCategory.FIXED_COSTS')}
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ fontWeight: 600, borderBottom: `2px solid ${theme.palette.primary.main}` }}
                >
                  {t('craftCategory.VARIABLE_COSTS')}
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ fontWeight: 600, borderBottom: `2px solid ${theme.palette.primary.main}` }}
                >
                  <TableSortLabel
                    active={filters.sortBy === 'yieldPercentage'}
                    direction={filters.sortBy === 'yieldPercentage' ? filters.sortOrder : 'asc'}
                    onClick={() => handleSort('yieldPercentage')}
                    sx={{ 
                      '& .MuiTableSortLabel-icon': { 
                        color: theme.palette.primary.main + ' !important' 
                      }
                    }}
                  >
                    {t('craftCategory.YIELD')}
                  </TableSortLabel>
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ fontWeight: 600, borderBottom: `2px solid ${theme.palette.primary.main}` }}
                >
                  {t('craftCategory.ACTIONS')}
                </TableCell>
              </TableRow>
            </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" color="text.secondary">
                      {t('craftCategory.LOADING')}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : !categoryData?.items || categoryData.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <FactoryIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                    <Typography variant="body1" color="text.secondary" fontWeight={500}>
                      {t('craftCategory.NO_CATEGORIES_FOUND')}
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      {t('craftCategory.CREATE_FIRST_CATEGORY')}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              categoryData?.items?.map((category, index) => (
                <TableRow 
                  key={category.id} 
                  hover 
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: theme.palette.action.hover,
                      transform: 'scale(1.001)',
                      transition: 'all 0.1s ease-in-out'
                    },
                    backgroundColor: index % 2 === 0 ? 'transparent' : (
                      theme.palette.mode === 'dark' 
                        ? alpha(theme.palette.grey[800], 0.3)
                        : theme.palette.grey[25]
                    )
                  }}
                >
                  <TableCell align="center" sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
                      <Paper 
                        elevation={1} 
                        sx={{ 
                          p: 1, 
                          borderRadius: 2, 
                          backgroundColor: theme.palette.primary.light,
                          color: theme.palette.primary.contrastText,
                          minWidth: 40,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {getCategoryIcon(category.categoryType)}
                      </Paper>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                          {t(`craftCategory.type.${category.categoryType}`)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {category.nameZh}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2 }}>
                    <Chip
                      label={t(`craftCategory.level.${category.technologyLevel}`)}
                      size="small"
                      color={getLevelColor(category.technologyLevel)}
                      variant="filled"
                      sx={{ fontWeight: 500, borderRadius: 2 }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2 }}>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 1.5, 
                        borderRadius: 2, 
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? alpha(theme.palette.grey[800], 0.3)
                          : theme.palette.grey[50],
                        border: `1px solid ${theme.palette.mode === 'dark' 
                          ? theme.palette.grey[700] 
                          : theme.palette.grey[200]}`,
                        display: 'inline-block'
                      }}
                    >
                      <Stack spacing={0.5} alignItems="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box 
                            sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              backgroundColor: theme.palette.primary.main 
                            }} 
                          />
                          <Typography variant="caption" color="text.secondary">
                            {t('craftCategory.WATER_COST')}: {category.fixedWaterCost}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box 
                            sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              backgroundColor: theme.palette.warning.main 
                            }} 
                          />
                          <Typography variant="caption" color="text.secondary">
                            {t('craftCategory.POWER_COST')}: {category.fixedPowerCost}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box 
                            sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              backgroundColor: theme.palette.secondary.main 
                            }} 
                          />
                          <Typography variant="caption" color="text.secondary">
                            {t('craftCategory.GOLD_COST')}: {category.fixedGoldCost}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2 }}>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 1.5, 
                        borderRadius: 2, 
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? alpha(theme.palette.grey[800], 0.3)
                          : theme.palette.grey[50],
                        border: `1px solid ${theme.palette.mode === 'dark' 
                          ? theme.palette.grey[700] 
                          : theme.palette.grey[200]}`,
                        display: 'inline-block'
                      }}
                    >
                      <Stack spacing={0.5} alignItems="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box 
                            sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              backgroundColor: theme.palette.primary.main 
                            }} 
                          />
                          <Typography variant="caption" color="text.secondary">
                            {category.variableWaterPercent}%
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box 
                            sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              backgroundColor: theme.palette.warning.main 
                            }} 
                          />
                          <Typography variant="caption" color="text.secondary">
                            {category.variablePowerPercent}%
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box 
                            sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              backgroundColor: theme.palette.secondary.main 
                            }} 
                          />
                          <Typography variant="caption" color="text.secondary">
                            {category.variableGoldPercent}%
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2 }}>
                    <Box 
                      sx={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: 1,
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        backgroundColor: category.yieldPercentage >= 85 
                          ? alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.15 : 0.1)
                          : category.yieldPercentage >= 70 
                            ? alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.15 : 0.1)
                            : alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.15 : 0.1),
                        color: category.yieldPercentage >= 85 
                          ? theme.palette.success.main
                          : category.yieldPercentage >= 70 
                            ? theme.palette.warning.main
                            : theme.palette.error.main,
                        border: `1px solid ${
                          category.yieldPercentage >= 85 
                            ? alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.6 : 0.3)
                            : category.yieldPercentage >= 70 
                              ? alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.6 : 0.3)
                              : alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.6 : 0.3)
                        }`,
                      }}
                    >
                      <Typography variant="body2" fontWeight={600}>
                        {category.yieldPercentage}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2 }}>
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title={t('craftCategory.VIEW')} placement="top">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewClick(category)}
                          sx={{ 
                            color: theme.palette.info.main,
                            '&:hover': { backgroundColor: theme.palette.info.light }
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {onEditCategory && (
                        <Tooltip title={t('craftCategory.EDIT')} placement="top">
                          <IconButton 
                            size="small" 
                            onClick={() => onEditCategory(category)}
                            sx={{ 
                              color: theme.palette.primary.main,
                              '&:hover': { backgroundColor: theme.palette.primary.light }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title={category.isActive ? t('craftCategory.DEACTIVATE') : t('craftCategory.ACTIVATE')} placement="top">
                        <IconButton 
                          size="small" 
                          onClick={() => handleToggleStatus(category)}
                          sx={{ 
                            color: category.isActive ? theme.palette.warning.main : theme.palette.success.main,
                            '&:hover': { backgroundColor: category.isActive ? theme.palette.warning.light : theme.palette.success.light }
                          }}
                        >
                          {category.isActive ? <ToggleOffIcon fontSize="small" /> : <ToggleOnIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('craftCategory.DELETE')} placement="top">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteClick(category)}
                          sx={{ 
                            color: theme.palette.error.main,
                            '&:hover': { backgroundColor: theme.palette.error.light }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {categoryData && (
          <TablePagination
            component="div"
            count={categoryData.total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage={t('common.rowsPerPage')}
          />
        )}
        </TableContainer>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('craftCategory.DELETE_CONFIRMATION')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('craftCategory.DELETE_CONFIRMATION_MESSAGE', {
              category: categoryToDelete ? t(`craftCategory.type.${categoryToDelete.categoryType}`) : '',
              level: categoryToDelete ? t(`craftCategory.level.${categoryToDelete.technologyLevel}`) : ''
            })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('common.CANCEL')}
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            {t('common.DELETE')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 0,
            boxShadow: 'none',
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            px: 3,
            py: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 400, color: theme.palette.text.primary }}>
                {categoryToView && t(`craftCategory.type.${categoryToView.categoryType}`)}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
                {categoryToView && t(`craftCategory.level.${categoryToView.technologyLevel}`)}
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setViewDialogOpen(false)} 
              size="small"
              sx={{ 
                color: theme.palette.text.secondary,
                '&:hover': { 
                  backgroundColor: alpha(theme.palette.text.secondary, 0.1)
                }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {categoryToView && (
            <Stack spacing={3}>
              {/* Basic Info */}
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {t('craftCategory.BASIC_INFORMATION')}
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {t('craftCategory.YIELD_PERCENTAGE')}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 300 }}>
                      {categoryToView.yieldPercentage}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {t('craftCategory.STATUS')}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 300 }}>
                      {categoryToView.isActive ? t('craftCategory.ACTIVE') : t('craftCategory.INACTIVE')}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Fixed Costs */}
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {t('craftCategory.FIXED_COSTS')}
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {t('craftCategory.WATER_COST')}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 300 }}>
                      {categoryToView.fixedWaterCost}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {t('craftCategory.POWER_COST')}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 300 }}>
                      {categoryToView.fixedPowerCost}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {t('craftCategory.GOLD_COST')}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 300 }}>
                      {categoryToView.fixedGoldCost}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Variable Costs */}
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {t('craftCategory.VARIABLE_COSTS')}
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {t('craftCategory.WATER_PERCENT')}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 300 }}>
                      {categoryToView.variableWaterPercent}%
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {t('craftCategory.POWER_PERCENT')}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 300 }}>
                      {categoryToView.variablePowerPercent}%
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {t('craftCategory.GOLD_PERCENT')}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 300 }}>
                      {categoryToView.variableGoldPercent}%
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions 
          sx={{ 
            px: 3,
            py: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            justifyContent: 'flex-end',
          }}
        >
          <Button 
            onClick={() => setViewDialogOpen(false)}
            variant="contained"
            size="small"
            sx={{ 
              backgroundColor: theme.palette.text.primary,
              color: theme.palette.background.paper,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: alpha(theme.palette.text.primary, 0.8),
                boxShadow: 'none',
              }
            }}
          >
            {t('common.CLOSE')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CraftCategoryList;