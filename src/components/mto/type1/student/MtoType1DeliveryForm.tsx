'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  LocalShipping as ShippingIcon,
  AttachMoney as MoneyIcon,
  LocationOn as LocationIcon,
  Calculate as CalculateIcon,
  Info as InfoIcon,
  Inventory as InventoryIcon,
  Warehouse as WarehouseIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import {
  MtoType1TeamView,
  MtoType1DeliveryRequest
} from '@/lib/types/mtoType1';
import MtoType1Service from '@/lib/services/mtoType1Service';
import { enqueueSnackbar } from 'notistack';

interface MtoType1DeliveryFormProps {
  requirement: MtoType1TeamView;
  onSave: () => void;
  onCancel: () => void;
}

interface FacilityInfo {
  facilityId: string;
  inventoryId: string;
  facilityType: string;
  coordinates: { axialQ: number; axialR: number };
  level: number;
  space: {
    totalSpace: string;
    usedSpace: string;
    availableSpace: string;
    utilizationRate: number;
  };
  canSend: boolean;
}

interface InventoryItem {
  id: string;
  materialId?: number;
  formulaId?: number;
  formulaNumber?: number;
  name: string;
  nameZh?: string;
  productName?: string;
  productDescription?: string;
  quantity: string;
  unitSpaceOccupied: string;
  totalSpaceOccupied: string;
  unitCost: string;
  totalValue: string;
  metadata?: {
    batchNumber?: string;
    qualityGrade?: string;
  };
}

interface TransportCost {
  tier: string;
  available: boolean;
  costPerSpaceUnit: string;
  totalCost: string;
  carbonEmission: string;
  description: string;
}

const MtoType1DeliveryForm: React.FC<MtoType1DeliveryFormProps> = ({
  requirement,
  onSave,
  onCancel
}) => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Step 1: Source Selection
  const [facilities, setFacilities] = useState<FacilityInfo[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<FacilityInfo | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [deliveryQuantity, setDeliveryQuantity] = useState('');

  // Step 2: Destination Selection
  const [availableTiles, setAvailableTiles] = useState<any[]>([]);
  const [selectedTile, setSelectedTile] = useState<any | null>(null);

  // Step 3: Cost Calculation
  const [transportCosts, setTransportCosts] = useState<TransportCost[]>([]);
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [calculatingCost, setCalculatingCost] = useState(false);
  const [isFeasible, setIsFeasible] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    t('mto.student.selectSource'),
    t('mto.student.selectDestination'),
    t('mto.student.confirmDelivery')
  ];

  // Fetch facilities on component mount
  useEffect(() => {
    loadFacilities();
    loadAvailableTiles();
  }, []);

  // Load inventory items when facility is selected
  useEffect(() => {
    if (selectedFacility) {
      loadInventoryItems();
    }
  }, [selectedFacility]);

  // Calculate cost when all parameters are set
  useEffect(() => {
    if (selectedItem && deliveryQuantity && selectedTile) {
      calculateTransportationCost();
    }
  }, [selectedItem, deliveryQuantity, selectedTile]);

  const loadFacilities = async () => {
    setLoading(true);
    try {
      const response = await MtoType1Service.getTeamFacilitiesWithSpace();
      const facilitiesData = response.facilities || [];
      // Filter facilities that can send items
      const sendableFacilities = facilitiesData.filter((f: FacilityInfo) => f.canSend);
      setFacilities(sendableFacilities);
    } catch (error) {
      console.error('Failed to load facilities:', error);
      enqueueSnackbar(t('mto.student.errors.loadFacilitiesFailed'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableTiles = async () => {
    try {
      // Use requirement.id or requirement.requirementId depending on the data structure
      const requirementId = (requirement as any).id || requirement.requirementId;
      if (!requirementId) {
        console.error(t('mto.type1.delivery.requirementIdMissing'), requirement);
        enqueueSnackbar(t('mto.student.errors.invalidRequirement'), { variant: 'error' });
        return;
      }
      const tiles = await MtoType1Service.getRequirementTiles(requirementId);
      setAvailableTiles(tiles);
    } catch (error) {
      console.error('Failed to load tiles:', error);
      enqueueSnackbar(t('mto.student.errors.loadTilesFailed'), { variant: 'error' });
    }
  };

  const loadInventoryItems = async () => {
    if (!selectedFacility) return;

    setLoading(true);
    try {
      const response = await MtoType1Service.getFacilityInventoryItems(
        selectedFacility.inventoryId,
        'PRODUCT'
      );

      // Check if the facility has the required product
      const items = response.inventory?.products?.items || [];
      // For now, return all product items since we don't have the formula ID
      // TODO: Filter items that match the requirement's product formula
      const matchingItems = items;

      setInventoryItems(matchingItems);

      if (matchingItems.length === 0) {
        enqueueSnackbar(t('mto.student.errors.noMatchingProducts'), { variant: 'warning' });
      }
    } catch (error) {
      console.error('Failed to load inventory items:', error);
      enqueueSnackbar(t('mto.student.errors.loadInventoryFailed'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const calculateTransportationCost = async () => {
    if (!selectedItem || !deliveryQuantity || !selectedTile) return;

    setCalculatingCost(true);
    try {
      // Use MTO-specific transportation cost calculation
      const tileId = selectedTile.mapTileId || selectedTile.tileId;
      const response = await MtoType1Service.calculateMtoTransportationCost(
        selectedItem.id,
        deliveryQuantity,
        selectedFacility!.inventoryId,
        tileId.toString()
      );

      // Check feasibility - but for MTO, ignore tile occupation issues
      // Every team can deliver to any tile regardless of other deliveries
      const feasibilityMessages = response.transportationCost?.feasibility?.messages || [];

      // Filter out tile occupation messages since multiple teams can deliver to same tile for MTO
      const relevantMessages = feasibilityMessages.filter(
        (msg: string) => !msg.includes('occupied') && !msg.includes('another team')
      );

      // For MTO deliveries, we allow delivery even if API says not feasible due to tile occupation
      // Only mark as not feasible if there are OTHER issues (like insufficient funds, quantity, etc.)
      const hasRealIssues = relevantMessages.length > 0 &&
        (response.transportationCost?.feasibility?.sufficientQuantity === false ||
         response.transportationCost?.feasibility?.sufficientFunds === false);

      setIsFeasible(!hasRealIssues);

      if (relevantMessages.length > 0 && hasRealIssues) {
        enqueueSnackbar(
          relevantMessages.join('. '),
          { variant: 'warning' }
        );
      }

      // Map the response to our transport cost structure
      if (response.availableTiers) {
        const transportCostOptions = response.availableTiers.map((tier: any) => ({
          tier: tier.tier,
          available: tier.available,
          costPerSpaceUnit: tier.unitCost,
          totalCost: tier.totalCost,
          carbonEmission: tier.carbonEmission,
          description: tier.name || tier.tier
        }));

        setTransportCosts(transportCostOptions);

        // Auto-select the required tier
        if (response.transportationCost?.requiredTier) {
          setSelectedTier(response.transportationCost.requiredTier);
        }
      }
    } catch (error) {
      console.error('Failed to calculate transportation cost:', error);
      enqueueSnackbar(t('mto.student.errors.calculateCostFailed'), { variant: 'error' });
    } finally {
      setCalculatingCost(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate source selection
      if (!selectedFacility || !selectedItem || !deliveryQuantity) {
        enqueueSnackbar(t('mto.student.validation.selectSourceFirst'), { variant: 'error' });
        return;
      }

      const quantity = parseFloat(deliveryQuantity);
      const available = parseFloat(selectedItem.quantity);
      if (quantity > available) {
        enqueueSnackbar(t('mto.student.validation.insufficientQuantity'), { variant: 'error' });
        return;
      }
    } else if (activeStep === 1) {
      // Validate destination selection
      if (!selectedTile) {
        enqueueSnackbar(t('mto.student.validation.selectDestinationFirst'), { variant: 'error' });
        return;
      }
    }

    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleTileSelection = (tile: any) => {
    setSelectedTile(tile);
    // Reset feasibility when a new tile is selected
    setIsFeasible(true);
    // For MTO deliveries, products are delivered directly to tiles
    // No need to manage a destination facility
  };

  const handleSubmit = async () => {
    if (!selectedItem || !selectedTile || !selectedTier || !selectedFacility) return;

    setSaving(true);
    try {
      // Submit the MTO delivery directly with the product inventory items
      const requirementId = (requirement as any).id || requirement.requirementId;
      const tileId = selectedTile.id || selectedTile.mapTileId || selectedTile.tileId;

      // Based on the validation error, the backend expects tileRequirementId and deliveryNumber
      // instead of mapTileId and productInventoryItemIds
      const mtoDeliveryData = {
        mtoType1Id: requirementId,
        tileRequirementId: parseInt(tileId), // Using tile requirement ID
        deliveryNumber: parseInt(deliveryQuantity), // Number of items to deliver
        productInventoryItemIds: [selectedItem.id],
        sourceFacilityInstanceId: selectedFacility.facilityId
      };

      const deliveryResult = await MtoType1Service.submitMtoDelivery(mtoDeliveryData);

      enqueueSnackbar(
        t('mto.student.messages.deliveryCreated', {
          deliveryId: deliveryResult.deliveryId || deliveryResult.deliveryNumber,
          estimatedPayment: formatCurrency(deliveryResult.estimatedSettlementAmount || 0)
        }),
        { variant: 'success' }
      );

      onSave();
    } catch (error: any) {
      console.error('Failed to create delivery:', error);
      const message = error.response?.data?.message || t('mto.student.errors.deliveryFailed');
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setSaving(false);
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

  const renderSourceSelection = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('mto.student.selectSourceFacility')}
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth>
              <InputLabel>{t('mto.student.sourceFacility')}</InputLabel>
              <Select
                value={selectedFacility?.inventoryId || ''}
                label={t('mto.student.sourceFacility')}
                onChange={(e) => {
                  const facility = facilities.find(f => f.inventoryId === e.target.value);
                  setSelectedFacility(facility || null);
                  setSelectedItem(null);
                  setInventoryItems([]);
                }}
              >
                {facilities.map((facility) => (
                  <MenuItem key={facility.inventoryId} value={facility.inventoryId}>
                    <Stack direction="row" spacing={2} alignItems="center" width="100%">
                      <WarehouseIcon fontSize="small" />
                      <Typography>{facility.facilityType}</Typography>
                      <Chip
                        label={`Level ${facility.level}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {t('mto.student.available')}: {formatCurrency(facility.space.availableSpace)}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {selectedFacility && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t('mto.student.availableProducts')}
              </Typography>
              {inventoryItems.length === 0 ? (
                <Alert severity="warning">
                  {t('mto.student.noMatchingProductsInFacility')}
                </Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('mto.student.product')}</TableCell>
                        <TableCell align="right">{t('mto.student.availableQty')}</TableCell>
                        <TableCell align="right">{t('mto.student.unitSpace')}</TableCell>
                        <TableCell align="center">{t('mto.student.select')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {inventoryItems.map((item) => (
                        <TableRow
                          key={item.id}
                          hover
                          selected={selectedItem?.id === item.id}
                          onClick={() => setSelectedItem(item)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>
                            {item.productName || item.name}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(item.quantity)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(item.unitSpaceOccupied)}
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              variant={selectedItem?.id === item.id ? 'contained' : 'outlined'}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedItem(item);
                              }}
                            >
                              {t('common.select')}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Grid>
          )}

          {selectedItem && (
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                type="number"
                label={t('mto.student.deliveryQuantity')}
                value={deliveryQuantity}
                onChange={(e) => setDeliveryQuantity(e.target.value)}
                helperText={t('mto.student.maxAvailable', {
                  max: formatCurrency(selectedItem.quantity)
                })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <InventoryIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );

  const renderDestinationSelection = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('mto.student.selectDestinationTile')}
      </Typography>

      <Grid container spacing={2}>
        {availableTiles.map((tile) => {
          // Handle both API response formats
          const tileId = tile.mapTileId || tile.tileId;
          const tileName = tile.tileName || `Tile #${tileId}`;
          const requirement = tile.adjustedRequirementNumber || tile.requirement || 0;
          const delivered = tile.deliveredNumber || tile.delivered || 0;
          const remaining = tile.remainingNumber || tile.remaining || 0;
          const population = tile.tilePopulation || tile.population || 0;

          const isSelected = selectedTile && (
            (selectedTile.mapTileId === tileId) ||
            (selectedTile.tileId === tileId)
          );

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={tileId}>
              <Card
                variant={isSelected ? 'elevation' : 'outlined'}
                sx={{
                  cursor: 'pointer',
                  border: isSelected ? '2px solid' : '1px solid',
                  borderColor: isSelected ? 'primary.main' : 'grey.300',
                  '&:hover': {
                    boxShadow: 3
                  }
                }}
                onClick={() => handleTileSelection(tile)}
              >
                <CardContent>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="subtitle1">
                          {tileName}
                        </Typography>
                        {population > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            {t('mto.student.population')}: {formatCurrency(population)}
                          </Typography>
                        )}
                      </Box>
                      <LocationIcon color="action" />
                    </Stack>

                    <Divider />

                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        {t('mto.student.required')}:
                      </Typography>
                      <Typography variant="body2">
                        {formatCurrency(requirement)}
                      </Typography>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        {t('mto.student.delivered')}:
                      </Typography>
                      <Typography variant="body2" color="primary">
                        {formatCurrency(delivered)}
                      </Typography>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        {t('mto.student.remaining')}:
                      </Typography>
                      <Typography variant="body2" color="warning.main" fontWeight="bold">
                        {formatCurrency(remaining)}
                      </Typography>
                    </Stack>

                    <Box sx={{ mt: 1 }}>
                      <Box sx={{
                        height: 4,
                        bgcolor: 'grey.200',
                        borderRadius: 2,
                        overflow: 'hidden'
                      }}>
                        <Box sx={{
                          width: `${(delivered / (requirement || 1)) * 100}%`,
                          height: '100%',
                          bgcolor: 'success.main',
                          transition: 'width 0.3s'
                        }} />
                      </Box>
                    </Box>

                    {isSelected && (
                      <Chip
                        label={t('common.selected')}
                        color="primary"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );

  const renderCostConfirmation = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('mto.student.confirmDeliveryDetails')}
      </Typography>

      {/* Delivery Summary */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          {t('mto.student.deliverySummary')}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">
              {t('mto.student.from')}:
            </Typography>
            <Typography variant="body1">
              {selectedFacility?.facilityType} (Level {selectedFacility?.level})
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">
              {t('mto.student.to')}:
            </Typography>
            <Typography variant="body1">
              {selectedTile?.tileName || t('mto.student.tile', { id: selectedTile?.mapTileId || selectedTile?.tileId })}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">
              {t('mto.student.product')}:
            </Typography>
            <Typography variant="body1">
              {selectedItem?.productName || selectedItem?.name}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">
              {t('mto.student.quantity')}:
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {formatCurrency(deliveryQuantity)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Transportation Cost Options */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <CalculateIcon color={isFeasible ? "primary" : "error"} />
          <Typography variant="subtitle1">
            {t('mto.student.transportationOptions')}
          </Typography>
          {calculatingCost && <CircularProgress size={20} />}
        </Stack>

        {!isFeasible && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {t('mto.student.deliveryNotFeasibleMessage')}
          </Alert>
        )}

        {transportCosts.length > 0 ? (
          <Grid container spacing={2}>
            {transportCosts.map((tier) => (
              <Grid size={{ xs: 12, md: 6 }} key={tier.tier}>
                <Card
                  variant={selectedTier === tier.tier ? 'elevation' : 'outlined'}
                  sx={{
                    opacity: tier.available ? 1 : 0.5,
                    cursor: tier.available ? 'pointer' : 'not-allowed',
                    border: selectedTier === tier.tier ? '2px solid' : '1px solid',
                    borderColor: selectedTier === tier.tier ? 'primary.main' : 'grey.300'
                  }}
                  onClick={() => tier.available && setSelectedTier(tier.tier)}
                >
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography variant="subtitle2">
                        {tier.description || tier.tier.replace(/_/g, ' ')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tier: {tier.tier}
                      </Typography>
                      <Divider />
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">{t('mto.student.cost')}:</Typography>
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {formatCurrency(tier.totalCost)} Gold
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">{t('mto.student.carbonEmission')}:</Typography>
                        <Typography variant="body2">
                          {formatCurrency(tier.carbonEmission)}
                        </Typography>
                      </Stack>
                      {!tier.available && (
                        <Chip
                          label={t('mto.student.notAvailable')}
                          size="small"
                          color="default"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="info">
            {t('mto.student.calculatingCosts')}
          </Alert>
        )}
      </Paper>

      {/* Final Cost Summary */}
      {selectedTier && (
        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle1" gutterBottom>
            {t('mto.student.finalCostSummary')}
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell>{t('mto.student.unitPrice')}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(requirement.unitPrice || 0)} Gold
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('mto.student.quantity')}</TableCell>
                  <TableCell align="right">{deliveryQuantity}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('mto.student.revenue')}</TableCell>
                  <TableCell align="right">
                    <Typography color="success.main">
                      {formatCurrency(parseFloat(deliveryQuantity || '0') * parseFloat(String(requirement.unitPrice || '0')))} Gold
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('mto.student.transportationCost')}</TableCell>
                  <TableCell align="right">
                    <Typography color="error.main">
                      -{formatCurrency(transportCosts.find(t => t.tier === selectedTier)?.totalCost || 0)} Gold
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography fontWeight="bold">
                      {t('mto.student.estimatedProfit')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      fontWeight="bold"
                      color={
                        (parseFloat(deliveryQuantity || '0') * parseFloat(String(requirement.unitPrice || '0')) -
                        parseFloat(transportCosts.find(t => t.tier === selectedTier)?.totalCost || '0')) > 0
                        ? 'success.main' : 'error.main'
                      }
                    >
                      {formatCurrency(
                        parseFloat(deliveryQuantity || '0') * parseFloat(String(requirement.unitPrice || '0')) -
                        parseFloat(transportCosts.find(t => t.tier === selectedTier)?.totalCost || '0')
                      )} Gold
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {t('mto.student.createDelivery')}
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        {t('mto.student.deliveryInfo', {
          requirement: requirement.requirementName || `#${(requirement as any).id || requirement.requirementId}`,
          price: formatCurrency(requirement.unitPrice || 0)
        })}
      </Alert>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mb: 3 }}>
        {activeStep === 0 && renderSourceSelection()}
        {activeStep === 1 && renderDestinationSelection()}
        {activeStep === 2 && renderCostConfirmation()}
      </Box>

      <Stack direction="row" spacing={2} justifyContent="space-between">
        <Button
          variant="outlined"
          startIcon={<CancelIcon />}
          onClick={onCancel}
          disabled={saving}
        >
          {t('common.cancel')}
        </Button>

        <Stack direction="row" spacing={2}>
          {activeStep > 0 && (
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={saving}
            >
              {t('common.back')}
            </Button>
          )}

          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ArrowIcon />}
            >
              {t('common.next')}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSubmit}
              disabled={saving || !selectedTier || !isFeasible}
            >
              {!isFeasible ? t('mto.student.deliveryNotFeasible') : t('mto.student.submitDelivery')}
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default MtoType1DeliveryForm;