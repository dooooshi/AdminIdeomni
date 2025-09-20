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

  InputAdornment,
  FormControlLabel,
  Switch,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Restore as RestoreIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
  History as HistoryIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Science as ScienceIcon,
  Factory as FactoryIcon,
  Park as ParkIcon,
  Agriculture as AgricultureIcon,
  Water as WaterIcon,
  Bolt as BoltIcon,
  AttachMoney as MoneyIcon,
  Nature as EcoIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import RawMaterialService from '@/lib/services/rawMaterialService';
import {
  RawMaterial,
  RawMaterialOrigin,
  RawMaterialSearchParams,
  RawMaterialSearchResponse,
} from '@/lib/types/rawMaterial';

interface RawMaterialListProps {
  onCreateMaterial: () => void;
  onEditMaterial: (material: RawMaterial) => void;
  onViewMaterial: (material: RawMaterial) => void;
  onViewAuditLog: (material: RawMaterial) => void;
  isSuperAdmin: boolean;
}

interface RawMaterialListFilter {
  search: string;
  origin: string;
  isActive: boolean;
  showDeleted: boolean;
  minCost: string;
  maxCost: string;
  minCarbon: string;
  maxCarbon: string;
  sortBy: 'materialNumber' | 'nameEn' | 'nameZh' | 'totalCost' | 'carbonEmission';
  sortOrder: 'asc' | 'desc';
}

const RawMaterialList: React.FC<RawMaterialListProps> = ({
  onCreateMaterial,
  onEditMaterial,
  onViewMaterial,
  onViewAuditLog,
  isSuperAdmin,
}) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const theme = useTheme();
  const [materialData, setMaterialData] = useState<RawMaterialSearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<RawMaterial | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [materialToRestore, setMaterialToRestore] = useState<RawMaterial | null>(null);
  const [restoreReason, setRestoreReason] = useState('');
  const [restoring, setRestoring] = useState(false);

  // Pagination state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Filters state
  const [filters, setFilters] = useState<RawMaterialListFilter>({
    search: '',
    origin: '',
    isActive: true,
    showDeleted: false,
    minCost: '',
    maxCost: '',
    minCarbon: '',
    maxCarbon: '',
    sortBy: 'materialNumber',
    sortOrder: 'asc',
  });

  // Fetch materials
  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: RawMaterialSearchParams = {
        page: page + 1,
        limit: pageSize,
        sort: filters.sortBy,
        order: filters.sortOrder,
        isActive: filters.isActive,
        isDeleted: filters.showDeleted,
      };

      if (filters.search) params.search = filters.search;
      if (filters.origin) params.origin = filters.origin as RawMaterialOrigin;
      if (filters.minCost) params.minCost = parseFloat(filters.minCost);
      if (filters.maxCost) params.maxCost = parseFloat(filters.maxCost);
      if (filters.minCarbon) params.minCarbon = parseFloat(filters.minCarbon);
      if (filters.maxCarbon) params.maxCarbon = parseFloat(filters.maxCarbon);

      const response = await RawMaterialService.searchRawMaterials(params);
      setMaterialData(response);
    } catch (err: any) {
      setError(err.message || t('rawMaterial.error.fetchFailed'));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters, t]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  // Handle filter change
  const handleFilterChange = (field: keyof RawMaterialListFilter, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  // Handle sort
  const handleSort = (property: RawMaterialListFilter['sortBy']) => {
    const isAsc = filters.sortBy === property && filters.sortOrder === 'asc';
    handleFilterChange('sortOrder', isAsc ? 'desc' : 'asc');
    handleFilterChange('sortBy', property);
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({
      search: '',
      origin: '',
      isActive: true,
      showDeleted: false,
      minCost: '',
      maxCost: '',
      minCarbon: '',
      maxCarbon: '',
      sortBy: 'materialNumber',
      sortOrder: 'asc',
    });
    setPage(0);
  };

  // Handle delete
  const handleDeleteClick = (material: RawMaterial) => {
    setMaterialToDelete(material);
    setDeleteReason('');
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!materialToDelete || !deleteReason.trim()) return;

    setDeleting(true);
    try {
      await RawMaterialService.deleteRawMaterial(materialToDelete.id, {
        reason: deleteReason,
      });
      setDeleteDialogOpen(false);
      fetchMaterials();
    } catch (err: any) {
      setError(err.message || t('rawMaterial.error.deleteFailed'));
    } finally {
      setDeleting(false);
    }
  };

  // Handle restore
  const handleRestoreClick = (material: RawMaterial) => {
    setMaterialToRestore(material);
    setRestoreReason('');
    setRestoreDialogOpen(true);
  };

  const handleRestoreConfirm = async () => {
    if (!materialToRestore || !restoreReason.trim()) return;

    setRestoring(true);
    try {
      await RawMaterialService.restoreRawMaterial(materialToRestore.id, restoreReason);
      setRestoreDialogOpen(false);
      fetchMaterials();
    } catch (err: any) {
      setError(err.message || t('rawMaterial.error.restoreFailed'));
    } finally {
      setRestoring(false);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const params: RawMaterialSearchParams = {
        page: 1,
        limit: 10000,
        sort: filters.sortBy,
        order: filters.sortOrder,
        isActive: filters.isActive,
        isDeleted: filters.showDeleted,
      };
      
      if (filters.search) params.search = filters.search;
      if (filters.origin) params.origin = filters.origin as RawMaterialOrigin;
      if (filters.minCost) params.minCost = parseFloat(filters.minCost);
      if (filters.maxCost) params.maxCost = parseFloat(filters.maxCost);
      if (filters.minCarbon) params.minCarbon = parseFloat(filters.minCarbon);
      if (filters.maxCarbon) params.maxCarbon = parseFloat(filters.maxCarbon);
      
      const blob = await RawMaterialService.exportRawMaterials(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `raw-materials-${new Date().toISOString()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || t('rawMaterial.error.exportFailed'));
    }
  };

  // Get origin icon
  const getOriginIcon = (origin: RawMaterialOrigin) => {
    switch (origin) {
      case RawMaterialOrigin.MINE:
        return <FactoryIcon fontSize="small" />;
      case RawMaterialOrigin.QUARRY:
        return <ScienceIcon fontSize="small" />;
      case RawMaterialOrigin.FOREST:
        return <ParkIcon fontSize="small" />;
      case RawMaterialOrigin.FARM:
      case RawMaterialOrigin.RANCH:
        return <AgricultureIcon fontSize="small" />;
      case RawMaterialOrigin.FISHERY:
        return <WaterIcon fontSize="small" />;
      case RawMaterialOrigin.SHOPS:
        return <MoneyIcon fontSize="small" />;
      default:
        return null;
    }
  };


  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t('rawMaterial.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('rawMaterial.subtitle')}
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label={t('rawMaterial.search')}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>{t('rawMaterial.origin')}</InputLabel>
                <Select
                  value={filters.origin}
                  onChange={(e) => handleFilterChange('origin', e.target.value)}
                  label={t('rawMaterial.origin')}
                >
                  <MenuItem value="">
                    <em>{t('common.all')}</em>
                  </MenuItem>
                  {Object.values(RawMaterialOrigin).map((origin) => (
                    <MenuItem key={origin} value={origin}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getOriginIcon(origin)}
                        {t(`rawMaterial.origin.${origin}`)}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('rawMaterial.minCost')}
                type="number"
                value={filters.minCost}
                onChange={(e) => handleFilterChange('minCost', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('rawMaterial.maxCost')}
                type="number"
                value={filters.maxCost}
                onChange={(e) => handleFilterChange('maxCost', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('rawMaterial.minCarbon')}
                type="number"
                value={filters.minCarbon}
                onChange={(e) => handleFilterChange('minCarbon', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('rawMaterial.maxCarbon')}
                type="number"
                value={filters.maxCarbon}
                onChange={(e) => handleFilterChange('maxCarbon', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.isActive}
                    onChange={(e) => handleFilterChange('isActive', e.target.checked)}
                  />
                }
                label={t('rawMaterial.activeOnly')}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.showDeleted}
                    onChange={(e) => handleFilterChange('showDeleted', e.target.checked)}
                  />
                }
                label={t('rawMaterial.showDeleted')}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                >
                  {t('common.clearFilters')}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchMaterials}
                >
                  {t('common.refresh')}
                </Button>
                {isSuperAdmin && (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={onCreateMaterial}
                    >
                      {t('rawMaterial.create')}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<ExportIcon />}
                      onClick={handleExport}
                    >
                      {t('rawMaterial.export')}
                    </Button>
                  </>
                )}
              </Stack>
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
      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : materialData?.items.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="h6" color="text.secondary">
              {t('rawMaterial.noData')}
            </Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="left">
                    <TableSortLabel
                      active={filters.sortBy === 'materialNumber'}
                      direction={filters.sortBy === 'materialNumber' ? filters.sortOrder : 'asc'}
                      onClick={() => handleSort('materialNumber')}
                    >
                      {t('rawMaterial.materialNumber')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="left">{t('rawMaterial.origin')}</TableCell>
                  <TableCell align="left">
                    <TableSortLabel
                      active={filters.sortBy === 'nameEn'}
                      direction={filters.sortBy === 'nameEn' ? filters.sortOrder : 'asc'}
                      onClick={() => handleSort('nameEn')}
                    >
                      {t('rawMaterial.name')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={filters.sortBy === 'totalCost'}
                      direction={filters.sortBy === 'totalCost' ? filters.sortOrder : 'asc'}
                      onClick={() => handleSort('totalCost')}
                    >
                      {t('rawMaterial.totalCost')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">{t('rawMaterial.resources')}</TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={filters.sortBy === 'carbonEmission'}
                      direction={filters.sortBy === 'carbonEmission' ? filters.sortOrder : 'asc'}
                      onClick={() => handleSort('carbonEmission')}
                    >
                      {t('rawMaterial.carbonEmission')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {materialData?.items.map((material) => {
                  return (
                    <TableRow key={material.id} hover>
                      <TableCell align="left">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight="medium">
                            #{material.materialNumber}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="left">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getOriginIcon(material.origin)}
                          <Typography variant="body2">
                            {t(`rawMaterial.origin.${material.origin}`)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="left">
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {locale === 'zh' ? material.nameZh : material.nameEn}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {locale === 'zh' ? material.nameEn : material.nameZh}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {material.totalCost}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {t('rawMaterial.gold')}: {material.goldCost}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Stack spacing={0.5}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                            <WaterIcon fontSize="small" color="primary" />
                            <Typography variant="body2">{material.waterRequired}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                            <BoltIcon fontSize="small" color="warning" />
                            <Typography variant="body2">{material.powerRequired}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                          <EcoIcon fontSize="small" color="success" />
                          <Typography variant="body2">{material.carbonEmission}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title={t('common.view')}>
                            <IconButton size="small" onClick={() => onViewMaterial(material)}>
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {isSuperAdmin && (
                            <>
                              <Tooltip title={t('common.edit')}>
                                <IconButton size="small" onClick={() => onEditMaterial(material)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t('rawMaterial.viewHistory')}>
                                <IconButton size="small" onClick={() => onViewAuditLog(material)}>
                                  <HistoryIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {material.isDeleted ? (
                                <Tooltip title={t('common.restore')}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleRestoreClick(material)}
                                  >
                                    <RestoreIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Tooltip title={t('common.delete')}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteClick(material)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={materialData?.pagination.total || 0}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={pageSize}
              onRowsPerPageChange={(e) => {
                setPageSize(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[20, 50, 100]}
            />
          </>
        )}
      </TableContainer>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('rawMaterial.deleteConfirm.title')}</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            {t('rawMaterial.deleteConfirm.message', {
              material: materialToDelete
                ? `#${materialToDelete.materialNumber} - ${
                    locale === 'zh' ? materialToDelete.nameZh : materialToDelete.nameEn
                  }`
                : '',
            })}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label={t('rawMaterial.deleteReason')}
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting || !deleteReason.trim()}
            startIcon={deleting && <CircularProgress size={20} />}
          >
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restore Dialog */}
      <Dialog open={restoreDialogOpen} onClose={() => setRestoreDialogOpen(false)}>
        <DialogTitle>{t('rawMaterial.restoreConfirm.title')}</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            {t('rawMaterial.restoreConfirm.message', {
              material: materialToRestore
                ? `#${materialToRestore.materialNumber} - ${
                    locale === 'zh' ? materialToRestore.nameZh : materialToRestore.nameEn
                  }`
                : '',
            })}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label={t('rawMaterial.restoreReason')}
            value={restoreReason}
            onChange={(e) => setRestoreReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialogOpen(false)} disabled={restoring}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleRestoreConfirm}
            color="primary"
            variant="contained"
            disabled={restoring || !restoreReason.trim()}
            startIcon={restoring && <CircularProgress size={20} />}
          >
            {t('common.restore')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RawMaterialList;