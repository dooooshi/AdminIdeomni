'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Collapse,
  IconButton,
  Tooltip,
  Divider,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Badge,
  FormHelperText,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Factory as FactoryIcon,
  Science as ScienceIcon,
  Calculate as CalculateIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  WaterDrop as WaterIcon,
  Bolt as PowerIcon,
  AttachMoney as MoneyIcon,
  Inventory as InventoryIcon,
  LocalShipping as ShippingIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  PlayArrow as PlayIcon,
  History as HistoryIcon,
  CheckBox as CheckBoxIcon,
  Close as CloseIcon
} from '@mui/icons-material';

import ProductProductionService from '@/lib/services/productProductionService';
import ProductFormulaService from '@/lib/services/productFormulaService';
import {
  Factory,
  CalculateCostRequest,
  CostCalculationResponse,
  ProductionRequest,
  ProductionResponse,
  ProductionHistoryItem,
  HistoryParams,
  ValidationStatus,
  SpaceImpact,
  ProductionCosts,
  ResourceRequirements,
  ExpectedOutput
} from '@/lib/types/productProduction';
import { ProductFormula } from '@/lib/types/productFormula';
import { formatNumber } from '@/lib/utils/format';
import { useSnackbar } from 'notistack';

export default function ProductProductionPage() {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  
  // Production Wizard Steps
  const steps = [
    t('productProduction.steps.selectformula'),
    t('productProduction.steps.setquantity'),
    t('productProduction.steps.reviewcosts'),
    t('productProduction.steps.confirmproduction')
  ];

  // Core State
  const [factories, setFactories] = useState<Factory[]>([]);
  const [selectedFactory, setSelectedFactory] = useState<Factory | null>(null);
  const [formulas, setFormulas] = useState<ProductFormula[]>([]);
  const [selectedFormula, setSelectedFormula] = useState<ProductFormula | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [debouncedQuantity, setDebouncedQuantity] = useState<number>(1);
  const [costData, setCostData] = useState<CostCalculationResponse['data'] | null>(null);
  const [productionHistory, setProductionHistory] = useState<ProductionHistoryItem[]>([]);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // UI State
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalHistoryCount, setTotalHistoryCount] = useState(0);
  
  // Load initial data
  useEffect(() => {
    loadFactories();
    loadFormulas();
    loadProductionHistory();
  }, []);

  // Debounce quantity changes
  useEffect(() => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set a new timer to update the debounced quantity after 800ms
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuantity(quantity);
    }, 800);

    // Cleanup function to clear timer on unmount or when quantity changes
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [quantity]);

  // Calculate costs when inputs change (using debounced quantity)
  useEffect(() => {
    if (selectedFactory && selectedFormula && debouncedQuantity > 0) {
      calculateCosts();
    }
  }, [selectedFactory, selectedFormula, debouncedQuantity]);

  // Data Loading Functions
  const loadFactories = async () => {
    setLoading(true);
    try {
      const response = await ProductProductionService.getFactories();
      if (response.data?.factories) {
        setFactories(response.data.factories);
        if (response.data.factories.length > 0 && !selectedFactory) {
          setSelectedFactory(response.data.factories[0]);
        }
      }
    } catch (error) {
      enqueueSnackbar(t('productProduction.errorLoadingFactories'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadFormulas = async () => {
    try {
      const response = await ProductFormulaService.searchProductFormulas({
        page: 1,
        limit: 100,
        isActive: true
      });
      if (response.items) {
        setFormulas(response.items);
      } else {
        setFormulas([]);
      }
    } catch (error) {
      enqueueSnackbar(t('productProduction.errorLoadingFormulas'), { variant: 'error' });
    }
  };

  const loadProductionHistory = async () => {
    try {
      const response = await ProductProductionService.getHistory({
        page: page + 1,
        limit: rowsPerPage
      });
      if (response.data?.history) {
        setProductionHistory(response.data.history);
        setTotalHistoryCount(response.data.pagination?.total || 0);
      }
    } catch (error) {
      // Error already handled by showing error state
    }
  };

  const calculateCosts = async () => {
    if (!selectedFactory || !selectedFormula || debouncedQuantity <= 0) return;

    setCalculating(true);
    try {
      const request: CalculateCostRequest = {
        factoryId: selectedFactory.id,
        formulaId: selectedFormula.id,
        quantity: debouncedQuantity
      };
      const response = await ProductProductionService.calculateCost(request);
      if (response.data) {
        setCostData(response.data);
      } else if (response.success && response.data) {
        setCostData(response.data);
      }
    } catch (error) {
      enqueueSnackbar(t('productProduction.errorCalculatingCost'), { variant: 'error' });
    } finally {
      setCalculating(false);
    }
  };

  const executeProduction = async () => {
    if (!selectedFactory || !selectedFormula || !costData) return;

    setLoading(true);
    try {
      const request: ProductionRequest = {
        factoryId: selectedFactory.id,
        formulaId: selectedFormula.id,
        quantity,
        costConfirmation: {
          expectedCost: costData.costs?.finalCosts?.totalCost || 0,
          acceptPrice: true
        }
      };

      const response = await ProductProductionService.executeProduction(request);
      if (response.success || response.data) {
        enqueueSnackbar(t('productProduction.productionSuccess'), { variant: 'success' });
        
        // Reset wizard
        setActiveStep(0);
        setSelectedFormula(null);
        setQuantity(1);
        setCostData(null);
        setConfirmDialog(false);
        
        // Reload data
        loadFactories();
        loadProductionHistory();
      } else if (response.error) {
        enqueueSnackbar(
          `${t('productProduction.productionFailed')}: ${response.error.message || response.message}`,
          { variant: 'error' }
        );
      }
    } catch (error) {
      enqueueSnackbar(t('productProduction.errorExecutingProduction'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Navigation Functions
  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      setConfirmDialog(true);
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0: return selectedFormula !== null;
      case 1: return quantity > 0;
      case 2: return costData !== null;
      case 3: return costData !== null;
      default: return false;
    }
  };

  // Header Section Component
  const HeaderSection = () => (
    <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          {t('productProduction.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('productProduction.subtitle')}
        </Typography>
      </Box>
    </Paper>
  );

  // Factory Selection Panel
  const FactoryPanel = () => (
    <Stack spacing={2}>
      <Card>
        <CardHeader 
          title={t('productProduction.selectFactory')}
          action={
            <IconButton onClick={loadFactories} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          }
        />
        <CardContent>
          <FormControl fullWidth>
            <InputLabel>{t('productProduction.factory')}</InputLabel>
            <Select
              value={selectedFactory?.id || ''}
              onChange={(e) => {
                const factory = factories.find(f => f.id === e.target.value);
                setSelectedFactory(factory || null);
              }}
              disabled={loading || factories.length === 0}
            >
              {factories.map((factory) => (
                <MenuItem key={factory.id} value={factory.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <FactoryIcon sx={{ mr: 1 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2">{factory.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('productProduction.levelAndTile', { level: factory.level, tileId: factory.location?.tileId })}
                      </Typography>
                    </Box>
                    {factory.infrastructure?.hasWaterConnection && factory.infrastructure?.hasPowerConnection ? (
                      <CheckCircleIcon color="success" fontSize="small" />
                    ) : (
                      <WarningIcon color="warning" fontSize="small" />
                    )}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {factories.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {t('productProduction.noFactoriesAvailable')}
            </Alert>
          )}
        </CardContent>
      </Card>

      {selectedFactory && (
        <Card>
          <CardHeader title={t('productProduction.factoryDetails')} />
          <CardContent>
            <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('productProduction.spaceUsage')}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(selectedFactory.space?.usedSpace / selectedFactory.space?.totalSpace) * 100 || 0}
                    sx={{ height: 8, borderRadius: 1, mb: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {formatNumber(selectedFactory.space?.usedSpace || 0)} / {formatNumber(selectedFactory.space?.totalSpace || 0)} {t('productProduction.carbonUnits')}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('productProduction.infrastructure')}
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <WaterIcon color={selectedFactory.infrastructure?.hasWaterConnection ? 'primary' : 'disabled'} />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('productProduction.water')}
                        secondary={
                          selectedFactory.infrastructure?.waterProvider
                            ? `${selectedFactory.infrastructure.waterProvider.providerName} - $${selectedFactory.infrastructure.waterProvider.unitPrice}/unit`
                            : selectedFactory.infrastructure?.hasWaterConnection
                            ? t('productProduction.connected')
                            : t('productProduction.notConnected')
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PowerIcon color={selectedFactory.infrastructure?.hasPowerConnection ? 'primary' : 'disabled'} />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('productProduction.power')}
                        secondary={
                          selectedFactory.infrastructure?.powerProvider
                            ? `${selectedFactory.infrastructure.powerProvider.providerName} - $${selectedFactory.infrastructure.powerProvider.unitPrice}/unit`
                            : selectedFactory.infrastructure?.hasPowerConnection
                            ? t('productProduction.connected')
                            : t('productProduction.notConnected')
                        }
                      />
                    </ListItem>
                  </List>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>
    );

  // Formula Selection Step
  const FormulaSelectionStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('productProduction.selectFormulaTitle')}
      </Typography>
      
      {formulas.length === 0 ? (
        <Card variant="outlined" sx={{ mt: 2, p: 4, textAlign: 'center' }}>
          <ScienceIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {t('productProduction.noFormulasAvailable')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('productProduction.noFormulasDescription')}
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {formulas.map((formula) => {
          const isSelected = selectedFormula?.id === formula.id;
          const canProduce = selectedFactory?.productionCapability?.canProduce || false;
          
          return (
            <Grid item xs={12} sm={6} md={4} key={formula.id}>
              <Card
                variant={isSelected ? 'elevation' : 'outlined'}
                sx={{
                  cursor: 'pointer',
                  border: isSelected ? 2 : 1,
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  '&:hover': { 
                    boxShadow: 3,
                    borderColor: 'primary.light'
                  }
                }}
                onClick={() => setSelectedFormula(formula)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {formula.productName}
                    </Typography>
                    {isSelected && (
                      <CheckCircleIcon color="primary" />
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {t('productProduction.formulaNumber', { number: formula.formulaNumber })}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Chip
                      size="small"
                      label={t('productProduction.materialCount', { count: formula.materialCount || 0 })}
                      icon={<InventoryIcon />}
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip
                      size="small"
                      label={t('productProduction.processCount', { count: formula.craftCategoryCount || 0 })}
                      icon={<ScienceIcon />}
                      sx={{ mb: 1 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {t('productProduction.totalCostLabel')}: ${formatNumber(formula.totalMaterialCost || 0, 2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
        </Grid>
      )}
    </Box>
  );

  // Quantity Input Step
  const QuantityInputStep = () => {
    // Calculate max quantity based on available materials
    let maxQuantity = 0;
    if (costData?.resources?.materials && costData.resources.materials.length > 0) {
      // Find the limiting material (smallest ratio of available/required)
      const maxQuantities = costData.resources.materials.map(material => {
        if (material.quantityRequired > 0) {
          return Math.floor(material.quantityAvailable / material.quantityRequired);
        }
        return 9999;
      });
      maxQuantity = Math.min(...maxQuantities);
    } else {
      maxQuantity = selectedFactory?.productionCapability?.maxQuantity || 0;
    }
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          {t('productProduction.setQuantityTitle')}
        </Typography>
        
        <Card sx={{ mt: 3, p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                {t('productProduction.productionQuantity')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <IconButton
                  onClick={() => {
                    const newQuantity = Math.max(1, quantity - 1);
                    setQuantity(newQuantity);
                    // Immediately update debounced quantity for button clicks
                    if (debounceTimerRef.current) {
                      clearTimeout(debounceTimerRef.current);
                    }
                    setDebouncedQuantity(newQuantity);
                  }}
                  disabled={quantity <= 1}
                >
                  <RemoveIcon />
                </IconButton>
                <TextField
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setQuantity(Math.min(Math.max(1, val), 9999));
                  }}
                  onBlur={() => {
                    // Immediately update debounced quantity on blur
                    if (debounceTimerRef.current) {
                      clearTimeout(debounceTimerRef.current);
                    }
                    setDebouncedQuantity(quantity);
                  }}
                  inputProps={{
                    min: 1,
                    max: 9999,
                    style: { textAlign: 'center' }
                  }}
                  sx={{ mx: 2, width: 120 }}
                />
                <IconButton
                  onClick={() => {
                    const newQuantity = Math.min(9999, quantity + 1);
                    setQuantity(newQuantity);
                    // Immediately update debounced quantity for button clicks
                    if (debounceTimerRef.current) {
                      clearTimeout(debounceTimerRef.current);
                    }
                    setDebouncedQuantity(newQuantity);
                  }}
                  disabled={quantity >= 9999}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              {selectedFormula && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('productProduction.productionSummary')}
                  </Typography>
                  <Stack spacing={1} sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">{t('productProduction.product')}:</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {selectedFormula?.productName}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">{t('productProduction.quantity')}:</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {t('productProduction.unitsWithCount', { count: quantity })}
                      </Typography>
                    </Box>
                    {calculating ? (
                      <CircularProgress size={20} />
                    ) : costData?.output && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">{t('productProduction.expectedOutput')}:</Typography>
                        <Typography variant="body2" fontWeight="medium" color="success.main">
                          {t('productProduction.unitsWithCount', { count: costData.output?.expectedQuantity || 0 })}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Paper>
              )}
            </Grid>
          </Grid>
        </Card>
      </Box>
    );
  };

  // Cost Review Step
  const CostReviewStep = () => {
    if (!costData) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          {t('productProduction.reviewCosts')}
        </Typography>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Material Costs */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title={t('productProduction.materialCosts')}
                avatar={<InventoryIcon />}
              />
              <CardContent>
                <List dense>
                  {costData.resources?.materials?.map((material) => (
                    <ListItem key={material.rawMaterialId}>
                      <ListItemText
                        primary={material.materialName}
                        secondary={t('productProduction.quantityAndPrice', { quantity: material.quantityRequired, unitPrice: material.unitCost })}
                      />
                      <ListItemSecondaryAction>
                        <Typography variant="body2" fontWeight="medium">
                          ${formatNumber(material.totalCost, 2)}
                        </Typography>
                        {!material.sufficient && (
                          <Chip size="small" label={t('productProduction.insufficient')} color="error" sx={{ ml: 1 }} />
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                  )) || []}
                </List>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1">
                    {t('productProduction.totalMaterialCost')}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ${formatNumber(costData.costs?.materialCostA || 0, 2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Resource Consumption */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title={t('productProduction.resourceConsumption')}
                avatar={<PowerIcon />}
              />
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <WaterIcon sx={{ mr: 1 }} color="primary" />
                      <Typography variant="subtitle2">{t('productProduction.water')}</Typography>
                    </Box>
                    <Box sx={{ pl: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('productProduction.quantityAndPrice', { 
                          quantity: costData.costs?.finalCosts?.waterConsumption || costData.resources?.water?.unitsRequired || 0, 
                          unitPrice: costData.resources?.water?.unitPrice || 0 
                        })}
                      </Typography>
                      <Typography variant="h6">${formatNumber(costData.costs?.finalCosts?.waterCost !== undefined ? costData.costs.finalCosts.waterCost : costData.resources?.water?.totalCost || 0, 2)}</Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PowerIcon sx={{ mr: 1 }} color="primary" />
                      <Typography variant="subtitle2">{t('productProduction.power')}</Typography>
                    </Box>
                    <Box sx={{ pl: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('productProduction.quantityAndPrice', { 
                          quantity: costData.costs?.finalCosts?.powerConsumption || costData.resources?.power?.unitsRequired || 0, 
                          unitPrice: costData.resources?.power?.unitPrice || 0 
                        })}
                      </Typography>
                      <Typography variant="h6">${formatNumber(costData.costs?.finalCosts?.powerCost !== undefined ? costData.costs.finalCosts.powerCost : costData.resources?.power?.totalCost || 0, 2)}</Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <MoneyIcon sx={{ mr: 1 }} color="primary" />
                      <Typography variant="subtitle2">{t('productProduction.laborCost')}</Typography>
                    </Box>
                    <Box sx={{ pl: 4 }}>
                      <Typography variant="h6">${formatNumber(costData.costs?.finalCosts?.goldCost || 0, 2)}</Typography>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Space Impact */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title={t('productProduction.spaceImpact')}
                avatar={<TimelineIcon />}
              />
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('productProduction.currentAvailable')}
                    </Typography>
                    <Typography variant="h6">{formatNumber(costData.space?.currentAvailableSpace || 0)} {t('productProduction.units')}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('productProduction.materialSpaceFreed')}
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      -{formatNumber(costData.space?.materialSpaceToFree || 0)} {t('productProduction.units')}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('productProduction.productSpaceNeeded')}
                    </Typography>
                    <Typography variant="h6" color="warning.main">
                      +{formatNumber(costData.space?.productSpaceNeeded || 0)} {t('productProduction.units')}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('productProduction.netChange')}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color={costData.space?.netSpaceChange < 0 ? 'success.main' : 'warning.main'}
                    >
                      {costData.space?.netSpaceChange < 0 ? '' : '+'}{formatNumber(costData.space?.netSpaceChange)} {t('productProduction.units')}
                    </Typography>
                  </Box>
                </Stack>
                {!costData.space?.hasEnoughSpace && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {t('productProduction.insufficientSpace')}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Production Output */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title={t('productProduction.expectedOutput')}
                avatar={<AssessmentIcon />}
              />
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('productProduction.inputQuantity')}
                    </Typography>
                    <Typography variant="h6">{costData.output?.inputQuantity} {t('productProduction.units')}</Typography>
                  </Box>
                  
                  {costData.output?.yields?.map((yieldData) => (
                    <Box key={yieldData.craftCategoryId}>
                      <Typography variant="body2" color="text.secondary">
                        {yieldData.categoryName} (Level {yieldData.level})
                      </Typography>
                      <Typography variant="body1">{t('productProduction.yieldPercentage', { percentage: yieldData.yieldPercentage })}</Typography>
                    </Box>
                  )) || []}
                  
                  <Divider />
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('productProduction.finalOutput')}
                    </Typography>
                    <Typography variant="h5" color="success.main">
                      {t('productProduction.unitsWithCount', { count: costData.output?.expectedQuantity || 0 })}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('productProduction.carbonEmission')}
                    </Typography>
                    <Typography variant="body1">
                      {t('productProduction.carbonEmissionValue', { amount: formatNumber(costData.output?.carbonEmission || 0, 3) })}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Cost Summary */}
          <Grid item xs={12}>
            <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
              <CardContent>
                <Grid container alignItems="center" spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" gutterBottom>
                      {t('productProduction.totalProductionCost')}
                    </Typography>
                    <Typography variant="h3">
                      ${formatNumber(costData.costs?.finalCosts?.totalCost || 0, 2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1}>
                      {costData.validation?.validations?.map((validation, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                          {validation.passed ? (
                            <CheckCircleIcon sx={{ mr: 1 }} />
                          ) : (
                            <ErrorIcon sx={{ mr: 1 }} />
                          )}
                          <Typography variant="body2">
                            {t('productProduction.validationResult', { check: validation.check, result: validation.passed ? t('productProduction.passed') : validation.message || t('productProduction.failed') })}
                          </Typography>
                        </Box>
                      )) || []}
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // Confirmation Step
  const ConfirmationStep = () => {
    if (!selectedFactory || !selectedFormula || !costData) return null;

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          {t('productProduction.confirmProduction')}
        </Typography>

        <Alert severity="info" sx={{ mt: 2, mb: 3 }}>
          {t('productProduction.confirmationMessage')}
        </Alert>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('productProduction.productionSummary')}
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  {t('productProduction.factory')}
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {selectedFactory?.name}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  {t('productProduction.formula')}
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {selectedFormula?.productName}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  {t('productProduction.requestedQuantity')}
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {t('productProduction.unitsWithCount', { count: quantity })}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  {t('productProduction.expectedOutput')}
                </Typography>
                <Typography variant="body1" fontWeight="medium" color="success.main">
                  {t('productProduction.unitsWithCount', { count: costData.output?.expectedQuantity || 0 })}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h5" color="primary">
                  {t('productProduction.totalCost')}: ${formatNumber(costData.costs?.finalCosts?.totalCost || 0, 2)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    );
  };

  // Production Panel with Wizard
  const ProductionPanel = () => (
    <Card>
      <CardContent>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: 400 }}>
          {activeStep === 0 && <FormulaSelectionStep />}
          {activeStep === 1 && <QuantityInputStep />}
          {activeStep === 2 && <CostReviewStep />}
          {activeStep === 3 && <ConfirmationStep />}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            {t('common.back')}
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!canProceed() || loading}
            startIcon={activeStep === steps.length - 1 && <PlayIcon />}
          >
            {activeStep === steps.length - 1 
              ? t('productProduction.startProduction')
              : t('common.next')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  // Recent History Panel
  const RecentHistoryPanel = () => (
    <Card>
      <CardHeader 
        title={t('productProduction.recentHistory')}
        action={
          <IconButton onClick={() => setHistoryExpanded(!historyExpanded)}>
            {historyExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
      />
      <CardContent>
        <List>
          {productionHistory.slice(0, 5).map((item) => (
            <ListItem key={item.id}>
              <ListItemText
                primary={item.formula?.name || t('productProduction.unknownFormula')}
                secondary={t('productProduction.productionSummaryLine', { 
                  quantity: item.quantities?.produced || 0, 
                  date: item.timestamps?.completed ? new Date(item.timestamps.completed).toLocaleDateString() : t('productProduction.notAvailable') 
                })}
              />
              <ListItemSecondaryAction>
                {item.status === 'SUCCESS' ? (
                  <CheckCircleIcon color="success" />
                ) : (
                  <ErrorIcon color="error" />
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        
        {productionHistory.length === 0 && (
          <Typography variant="body2" color="text.secondary" align="center">
            {t('productProduction.noHistory')}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  // Production History Table
  const ProductionHistoryTable = () => (
    <Collapse in={historyExpanded} timeout="auto" unmountOnExit>
      <Card sx={{ mt: 3 }}>
        <CardHeader 
          title={t('productProduction.fullHistory')}
          action={
            <Stack direction="row" spacing={1}>
              <IconButton onClick={loadProductionHistory}>
                <RefreshIcon />
              </IconButton>
              <IconButton>
                <DownloadIcon />
              </IconButton>
            </Stack>
          }
        />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('productProduction.date')}</TableCell>
                  <TableCell>{t('productProduction.factory')}</TableCell>
                  <TableCell>{t('productProduction.formula')}</TableCell>
                  <TableCell align="right">{t('productProduction.requested')}</TableCell>
                  <TableCell align="right">{t('productProduction.produced')}</TableCell>
                  <TableCell align="right">{t('productProduction.cost')}</TableCell>
                  <TableCell align="center">{t('productProduction.status')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productionHistory.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      {row.timestamps?.started ? new Date(row.timestamps.started).toLocaleDateString() : t('productProduction.notAvailable')}
                    </TableCell>
                    <TableCell>{row.factory?.name || t('productProduction.unknown')}</TableCell>
                    <TableCell>{row.formula?.name || t('productProduction.unknown')}</TableCell>
                    <TableCell align="right">{row.quantities?.requested || 0}</TableCell>
                    <TableCell align="right">{row.quantities?.produced || 0}</TableCell>
                    <TableCell align="right">${formatNumber(row.costs?.total || 0, 2)}</TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={row.status || t('productProduction.unknownStatus')}
                        color={row.status === 'SUCCESS' ? 'success' : 'error'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={totalHistoryCount}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </CardContent>
      </Card>
    </Collapse>
  );

  // Confirmation Dialog
  const ProductionConfirmationDialog = () => (
    <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)} maxWidth="sm" fullWidth>
      <DialogTitle>{t('productProduction.confirmProductionTitle')}</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t('productProduction.confirmationWarning')}
        </Alert>
        <Typography variant="body1">
          {t('productProduction.confirmProductionMessage', {
            quantity: quantity,
            product: selectedFormula?.productName,
            cost: formatNumber(costData?.costs.finalCosts.totalCost || 0, 2)
          })}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setConfirmDialog(false)}>
          {t('common.cancel')}
        </Button>
        <Button 
          variant="contained" 
          onClick={executeProduction}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <PlayIcon />}
        >
          {loading ? t('productProduction.processing') : t('productProduction.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Main Render
  return (
    <Box sx={{ p: 3 }}>
      <HeaderSection />
      
      <Grid container spacing={3}>
        {/* Left Panel - Factory Selection */}
        <Grid item xs={12} md={3}>
          <FactoryPanel />
        </Grid>
        
        {/* Center Panel - Production Wizard */}
        <Grid item xs={12} md={6}>
          <ProductionPanel />
        </Grid>
        
        {/* Right Panel - History */}
        <Grid item xs={12} md={3}>
          <Stack spacing={2}>
            <RecentHistoryPanel />
            <Button
              fullWidth
              variant="outlined"
              startIcon={<HistoryIcon />}
              onClick={() => setHistoryExpanded(!historyExpanded)}
            >
              {historyExpanded 
                ? t('productProduction.hideFullHistory')
                : t('productProduction.viewFullHistory')}
            </Button>
          </Stack>
        </Grid>
      </Grid>

      <ProductionHistoryTable />
      <ProductionConfirmationDialog />
    </Box>
  );
}