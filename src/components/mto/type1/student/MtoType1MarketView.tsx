'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Typography,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Stack,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  LocalShipping as DeliveryIcon,
  TrendingUp as TrendingIcon,
  Timer as TimerIcon,
  Science as FormulaIcon,
  Close as CloseIcon,
  Category as CategoryIcon,
  Inventory as MaterialIcon,
  Map as MapIcon
} from '@mui/icons-material';
import { MtoType1Requirement } from '@/lib/types/mtoType1';
import MtoType1Service from '@/lib/services/mtoType1Service';
import { enqueueSnackbar } from 'notistack';
import { formatDistanceToNow, format } from 'date-fns';

interface MtoType1MarketViewProps {
  onViewDetails: (requirement: any) => void;
  onMakeDelivery: (requirement: any) => void;
}

const MtoType1MarketView: React.FC<MtoType1MarketViewProps> = ({
  onViewDetails,
  onMakeDelivery
}) => {
  const { t } = useTranslation();
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'urgent' | 'soon' | 'later'>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Formula modal state
  const [formulaModalOpen, setFormulaModalOpen] = useState(false);
  const [selectedFormulaId, setSelectedFormulaId] = useState<number | null>(null);
  const [formulaData, setFormulaData] = useState<any>(null);
  const [formulaLoading, setFormulaLoading] = useState(false);

  // Tile requirements modal state
  const [tilesModalOpen, setTilesModalOpen] = useState(false);
  const [selectedRequirementId, setSelectedRequirementId] = useState<number | null>(null);
  const [tilesData, setTilesData] = useState<any[]>([]);
  const [tilesLoading, setTilesLoading] = useState(false);

  useEffect(() => {
    loadAvailableRequirements();
  }, []);

  const loadAvailableRequirements = async () => {
    setLoading(true);
    try {
      const response = await MtoType1Service.getAvailableRequirements();
      setRequirements(response);
    } catch (error) {
      console.error('Failed to load requirements:', error);
      enqueueSnackbar(t('mto.student.errors.loadFailed'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleViewFormula = async (formulaId: number) => {
    setSelectedFormulaId(formulaId);
    setFormulaModalOpen(true);
    setFormulaLoading(true);

    try {
      const data = await MtoType1Service.getManagerFormula(formulaId);
      setFormulaData(data);
    } catch (error) {
      console.error('Failed to load formula:', error);
      enqueueSnackbar(t('mto.student.errors.loadFormulaFailed'), { variant: 'error' });
    } finally {
      setFormulaLoading(false);
    }
  };

  const handleCloseFormulaModal = () => {
    setFormulaModalOpen(false);
    setSelectedFormulaId(null);
    setFormulaData(null);
  };

  const handleViewTiles = async (requirementId: number) => {
    setSelectedRequirementId(requirementId);
    setTilesModalOpen(true);
    setTilesLoading(true);

    try {
      const data = await MtoType1Service.getTileViewForTeam(requirementId);
      setTilesData(data);
    } catch (error) {
      console.error('Failed to load tile requirements:', error);
      enqueueSnackbar(t('mto.student.errors.loadFailed'), { variant: 'error' });
    } finally {
      setTilesLoading(false);
    }
  };

  const handleCloseTilesModal = () => {
    setTilesModalOpen(false);
    setSelectedRequirementId(null);
    setTilesData([]);
  };

  const handleSearch = () => {
    if (searchTerm) {
      const filtered = requirements.filter(req =>
        req.managerProductFormula?.productName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setRequirements(filtered);
    } else {
      loadAvailableRequirements();
    }
  };

  const getFilteredRequirements = () => {
    let filtered = requirements;

    // Apply price filter
    if (priceFilter === 'low') {
      filtered = filtered.filter(r => parseFloat(r.purchaseGoldPrice) < 100);
    } else if (priceFilter === 'medium') {
      filtered = filtered.filter(r => parseFloat(r.purchaseGoldPrice) >= 100 && parseFloat(r.purchaseGoldPrice) < 500);
    } else if (priceFilter === 'high') {
      filtered = filtered.filter(r => parseFloat(r.purchaseGoldPrice) >= 500);
    }

    return filtered;
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'RELEASED': return 'success';
      case 'IN_PROGRESS': return 'warning';
      case 'SETTLED': return 'error';
      default: return 'default';
    }
  };

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numValue);
  };

  const calculateTimeRemaining = (settlementTime: string) => {
    const now = new Date();
    const settlement = new Date(settlementTime);
    const diffHours = Math.floor((settlement.getTime() - now.getTime()) / (1000 * 60 * 60));

    if (diffHours < 24) {
      return { label: formatDistanceToNow(settlement, { addSuffix: true }), urgent: true };
    }
    return { label: formatDistanceToNow(settlement, { addSuffix: true }), urgent: false };
  };

  const calculateFulfillmentProgress = (actual: number, overall: number) => {
    return Math.round((actual / overall) * 100);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const filteredRequirements = getFilteredRequirements();

  return (
    <Box>
      {/* Search and Filter Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder={t('mto.student.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            size="small"
            sx={{ flexGrow: 1, maxWidth: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t('mto.student.priceRange')}</InputLabel>
            <Select
              value={priceFilter}
              label={t('mto.student.priceRange')}
              onChange={(e) => setPriceFilter(e.target.value as any)}
            >
              <MenuItem value="all">{t('common.all')}</MenuItem>
              <MenuItem value="low">{'< 100 Gold'}</MenuItem>
              <MenuItem value="medium">{'100-500 Gold'}</MenuItem>
              <MenuItem value="high">{'> 500 Gold'}</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t('mto.student.timeRemaining')}</InputLabel>
            <Select
              value={timeFilter}
              label={t('mto.student.timeRemaining')}
              onChange={(e) => setTimeFilter(e.target.value as any)}
            >
              <MenuItem value="all">{t('common.all')}</MenuItem>
              <MenuItem value="urgent">{t('mto.student.urgent24h')}</MenuItem>
              <MenuItem value="soon">{t('mto.student.soon3days')}</MenuItem>
              <MenuItem value="later">{t('mto.student.later')}</MenuItem>
            </Select>
          </FormControl>

          <Button onClick={handleSearch} variant="contained" startIcon={<SearchIcon />}>
            {t('common.search')}
          </Button>

          <IconButton onClick={loadAvailableRequirements} color="primary">
            <RefreshIcon />
          </IconButton>
        </Stack>
      </Paper>

      {/* Requirements Table */}
      {filteredRequirements.length === 0 ? (
        <Alert severity="info">
          {t('mto.student.noAvailableRequirements')}
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('mto.student.requirementId')}</TableCell>
                <TableCell>{t('mto.student.productName')}</TableCell>
                <TableCell>{t('mto.student.formula')}</TableCell>
                <TableCell align="right">{t('mto.student.unitPrice')}</TableCell>
                <TableCell align="right">{t('mto.student.baseQuantity')}</TableCell>
                <TableCell align="right">{t('mto.student.totalQuantity')}</TableCell>
                <TableCell align="right">{t('mto.student.budget')}</TableCell>
                <TableCell align="right">{t('mto.student.fulfillment')}</TableCell>
                <TableCell>{t('mto.student.releaseTime')}</TableCell>
                <TableCell>{t('mto.student.settlementTime')}</TableCell>
                <TableCell>{t('mto.student.timeRemaining')}</TableCell>
                <TableCell>{t('mto.student.status')}</TableCell>
                <TableCell align="center">{t('mto.student.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequirements
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((requirement, index) => {
                  const timeInfo = calculateTimeRemaining(requirement.settlementTime);
                  const fulfillmentRate = calculateFulfillmentProgress(
                    requirement.actualPurchasedNumber || 0,
                    requirement.overallPurchaseNumber
                  );

                  return (
                    <TableRow key={requirement.id || `requirement-${index}`} hover>
                      <TableCell>#{requirement.id}</TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <FormulaIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {requirement.managerProductFormula?.name || requirement.managerProductFormula?.productName || 'N/A'}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`Formula #${requirement.managerProductFormula?.id || requirement.managerProductFormula?.formulaNumber || 'N/A'}`}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {formatCurrency(requirement.purchaseGoldPrice)} Gold
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(requirement.basePurchaseNumber)}
                      </TableCell>
                      <TableCell align="right">
                        <Stack spacing={0}>
                          <Typography variant="body2">
                            {formatCurrency(requirement.actualPurchasedNumber || 0)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            / {formatCurrency(requirement.overallPurchaseNumber)}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Stack spacing={0}>
                          <Typography variant="body2" color="success.main">
                            {formatCurrency(requirement.overallPurchaseBudget)}
                          </Typography>
                          {requirement.actualSpentBudget && (
                            <Typography variant="caption" color="text.secondary">
                              Spent: {formatCurrency(requirement.actualSpentBudget)}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Stack spacing={0}>
                          <Typography variant="body2">
                            {fulfillmentRate}%
                          </Typography>
                          <Box sx={{ width: 60, mt: 0.5 }}>
                            <Box
                              sx={{
                                height: 4,
                                bgcolor: 'grey.200',
                                borderRadius: 2,
                                overflow: 'hidden'
                              }}
                            >
                              <Box
                                sx={{
                                  width: `${fulfillmentRate}%`,
                                  height: '100%',
                                  bgcolor: fulfillmentRate > 75 ? 'success.main' :
                                          fulfillmentRate > 50 ? 'warning.main' : 'error.main',
                                  transition: 'width 0.3s'
                                }}
                              />
                            </Box>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {format(new Date(requirement.releaseTime), 'MMM dd, HH:mm')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {format(new Date(requirement.settlementTime), 'MMM dd, HH:mm')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <TimerIcon
                            fontSize="small"
                            color={timeInfo.urgent ? 'error' : 'action'}
                          />
                          <Typography
                            variant="caption"
                            color={timeInfo.urgent ? 'error' : 'text.secondary'}
                          >
                            {timeInfo.label}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={t(`mto.type1.statuses.${requirement.status.toLowerCase()}`)}
                          size="small"
                          color={getStatusColor(requirement.status)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title={t('mto.student.viewTileRequirements')}>
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => handleViewTiles(requirement.id)}
                            >
                              <MapIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('mto.student.viewFormula')}>
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => handleViewFormula(requirement.managerProductFormulaId)}
                            >
                              <FormulaIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('mto.student.makeDelivery')}>
                            <span>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => onMakeDelivery(requirement)}
                                disabled={requirement.status !== 'RELEASED' && requirement.status !== 'IN_PROGRESS'}
                              >
                                <DeliveryIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredRequirements.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage={t('common.rowsPerPage')}
          />
        </TableContainer>
      )}

      {/* Formula Details Modal */}
      <Dialog
        open={formulaModalOpen}
        onClose={handleCloseFormulaModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{t('mto.student.formulaDetails')}</Typography>
            <IconButton onClick={handleCloseFormulaModal} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {formulaLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : formulaData ? (
            <Stack spacing={3}>
              {/* Formula Basic Info */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  {formulaData.name || formulaData.productName}
                </Typography>
                {formulaData.description && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {formulaData.description}
                  </Typography>
                )}
                <Stack direction="row" spacing={2}>
                  <Chip
                    label={`${t('mto.student.formulaNumber')}: ${formulaData.formulaNumber || formulaData.id}`}
                    size="small"
                    variant="outlined"
                  />
                  {formulaData.isLocked && (
                    <Chip
                      label={t('mto.student.locked')}
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Box>

              <Divider />

              {/* Raw Materials */}
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <MaterialIcon color="action" />
                  <Typography variant="subtitle1" fontWeight="bold">
                    {t('mto.student.rawMaterials')}
                  </Typography>
                </Stack>
                <List dense>
                  {formulaData.materials?.map((material: any, index: number) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2">
                              {material.rawMaterial?.name || material.name || 'Unknown Material'}
                            </Typography>
                            <Typography variant="body2" color="primary" fontWeight="bold">
                              {material.quantity} {material.rawMaterial?.unit || material.unit || 'units'}
                            </Typography>
                          </Stack>
                        }
                        secondary={material.rawMaterial?.description || material.description}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Divider />

              {/* Craft Categories */}
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <CategoryIcon color="action" />
                  <Typography variant="subtitle1" fontWeight="bold">
                    {t('mto.student.craftCategories')}
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  {formulaData.craftCategories?.map((category: any, index: number) => (
                    <Paper key={index} variant="outlined" sx={{ p: 1.5 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight="medium">
                          {category.craftCategory?.name || category.name || 'Unknown Category'}
                        </Typography>
                        {(category.craftCategory?.type || category.type) && (
                          <Chip
                            label={category.craftCategory?.type || category.type}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        )}
                      </Stack>
                      {(category.craftCategory?.description || category.description) && (
                        <Typography variant="caption" color="text.secondary">
                          {category.craftCategory?.description || category.description}
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </Stack>
              </Box>

              {/* Cost Summary */}
              {formulaData.totalMaterialCost && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {t('mto.student.costSummary')}
                    </Typography>
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">{t('mto.student.materialCost')}:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(formulaData.totalMaterialCost)} Gold
                        </Typography>
                      </Stack>
                      {formulaData.totalSetupWaterCost && (
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2">{t('mto.student.waterCost')}:</Typography>
                          <Typography variant="body2">
                            {formulaData.totalSetupWaterCost} ({formulaData.totalWaterPercent}%)
                          </Typography>
                        </Stack>
                      )}
                      {formulaData.totalSetupPowerCost && (
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2">{t('mto.student.powerCost')}:</Typography>
                          <Typography variant="body2">
                            {formulaData.totalSetupPowerCost} ({formulaData.totalPowerPercent}%)
                          </Typography>
                        </Stack>
                      )}
                      {formulaData.productFormulaCarbonEmission && (
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2">{t('mto.student.carbonEmission')}:</Typography>
                          <Typography variant="body2">
                            {formulaData.productFormulaCarbonEmission}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  </Box>
                </>
              )}
            </Stack>
          ) : (
            <Alert severity="error">{t('mto.student.errors.formulaNotFound')}</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFormulaModal}>
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tile Requirements Modal */}
      <Dialog
        open={tilesModalOpen}
        onClose={handleCloseTilesModal}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{t('mto.student.tileRequirements')}</Typography>
            <IconButton onClick={handleCloseTilesModal} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {tilesLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : tilesData.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('mto.student.tileId')}</TableCell>
                    <TableCell>{t('mto.student.tileName')}</TableCell>
                    <TableCell align="right">{t('mto.student.tilePopulation')}</TableCell>
                    <TableCell align="right">{t('mto.student.initialRequirement')}</TableCell>
                    <TableCell align="right">{t('mto.student.adjustedRequirement')}</TableCell>
                    <TableCell align="right">{t('mto.student.delivered')}</TableCell>
                    <TableCell align="right">{t('mto.student.settled')}</TableCell>
                    <TableCell align="right">{t('mto.student.remainingQty')}</TableCell>
                    <TableCell align="right">{t('mto.student.budget')}</TableCell>
                    <TableCell align="center">{t('mto.student.status')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tilesData.map((tile: any, index: number) => {
                    const progressPercentage = tile.adjustedRequirementNumber > 0
                      ? Math.round((tile.deliveredNumber / tile.adjustedRequirementNumber) * 100)
                      : 0;

                    return (
                      <TableRow key={tile.id || index}>
                        <TableCell>#{tile.mapTileId}</TableCell>
                        <TableCell>{tile.tileName || `Tile ${tile.mapTileId}`}</TableCell>
                        <TableCell align="right">{formatCurrency(tile.tilePopulation)}</TableCell>
                        <TableCell align="right">{formatCurrency(tile.initialRequirementNumber)}</TableCell>
                        <TableCell align="right">{formatCurrency(tile.adjustedRequirementNumber)}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="primary">
                            {formatCurrency(tile.deliveredNumber || 0)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="success.main">
                            {formatCurrency(tile.settledNumber || 0)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack spacing={0}>
                            <Typography variant="body2" fontWeight="bold" color="warning.main">
                              {formatCurrency(tile.remainingNumber || 0)}
                            </Typography>
                            <Box sx={{ width: 80, mt: 0.5 }}>
                              <Box
                                sx={{
                                  height: 4,
                                  bgcolor: 'grey.200',
                                  borderRadius: 2,
                                  overflow: 'hidden'
                                }}
                              >
                                <Box
                                  sx={{
                                    width: `${progressPercentage}%`,
                                    height: '100%',
                                    bgcolor: progressPercentage === 100 ? 'success.main' :
                                            progressPercentage > 50 ? 'warning.main' : 'error.main',
                                    transition: 'width 0.3s'
                                  }}
                                />
                              </Box>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(tile.requirementBudget)} Gold
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={tile.isActive ? t('mto.student.active') : t('mto.student.inactive')}
                            size="small"
                            color={tile.isActive ? 'success' : 'default'}
                            variant={tile.isActive ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">{t('mto.student.noTileRequirements')}</Alert>
          )}

          {/* Summary Statistics */}
          {tilesData.length > 0 && (
            <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
              <Stack spacing={2}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {t('mto.student.summary')}
                </Typography>
                <Stack direction="row" spacing={4}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('mto.student.totalTiles')}:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {tilesData.length}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('mto.student.totalRequired')}:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {formatCurrency(
                        tilesData.reduce((sum, t) => sum + (t.adjustedRequirementNumber || 0), 0)
                      )}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('mto.student.totalDelivered')}:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="primary">
                      {formatCurrency(
                        tilesData.reduce((sum, t) => sum + (t.deliveredNumber || 0), 0)
                      )}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('mto.student.totalRemaining')}:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="warning.main">
                      {formatCurrency(
                        tilesData.reduce((sum, t) => sum + (t.remainingNumber || 0), 0)
                      )}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('mto.student.overallProgress')}:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {tilesData.reduce((sum, t) => sum + (t.adjustedRequirementNumber || 0), 0) > 0
                        ? Math.round(
                            (tilesData.reduce((sum, t) => sum + (t.deliveredNumber || 0), 0) /
                            tilesData.reduce((sum, t) => sum + (t.adjustedRequirementNumber || 0), 0)) * 100
                          )
                        : 0}%
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTilesModal}>
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MtoType1MarketView;