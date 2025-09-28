'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Card,
  CardContent,
  Alert,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  LocalShipping as LocalShippingIcon,
  Warehouse as WarehouseIcon,
  ArrowForward as ArrowForwardIcon,
  Calculate as CalculateIcon,
  AttachMoney as AttachMoneyIcon,
  Park as EcoIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import TransportationService from '@/lib/services/transportationService';
import StudentFacilitySpaceService from '@/lib/services/studentFacilitySpaceService';
import {
  TransferRequest,
  TransferCostRequest,
  TransportationCostPreview,
  TransportationOrder,
  TransportationTier,
  InventoryItemType,
  FacilityForTransport,
  InventoryItemForTransport,
  TransferResult
} from '@/types/transportation';

const steps = [
  'transportation.STEPS.SELECT_SOURCE',
  'transportation.STEPS.SELECT_DESTINATION',
  'transportation.STEPS.CHOOSE_ITEMS',
  'transportation.STEPS.REVIEW_TRANSFER'
];

export default function TransportationPage() {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [facilities, setFacilities] = useState<FacilityForTransport[]>([]);
  const [transferHistory, setTransferHistory] = useState<TransportationOrder[]>([]);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyRowsPerPage, setHistoryRowsPerPage] = useState(10);
  const [historyTotal, setHistoryTotal] = useState(0);

  // Transfer state
  const [sourceFacility, setSourceFacility] = useState<FacilityForTransport | null>(null);
  const [destFacility, setDestFacility] = useState<FacilityForTransport | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItemForTransport | null>(null);
  const [transferQuantity, setTransferQuantity] = useState<number>(1);
  const [costPreview, setCostPreview] = useState<TransportationCostPreview | null>(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);
  const [transferResult, setTransferResult] = useState<TransferResult | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItemForTransport[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Validation state for quantity input
  const [quantityError, setQuantityError] = useState<string>('');
  const [isValidatingQuantity, setIsValidatingQuantity] = useState(false);
  const [quantityInputValue, setQuantityInputValue] = useState<string>('1');

  useEffect(() => {
    fetchFacilities();
    fetchTransferHistory();
  }, []);

  useEffect(() => {
    fetchTransferHistory();
  }, [historyPage, historyRowsPerPage]);

  useEffect(() => {
    if (sourceFacility) {
      fetchInventoryItems();
      setSelectedItem(null); // Reset selected item when source changes
      setTransferQuantity(1);
      setQuantityInputValue('1');
      setQuantityError('');
    } else {
      setInventoryItems([]);
      setSelectedItem(null);
    }
  }, [sourceFacility]);

  // Validate quantity whenever selectedItem changes
  useEffect(() => {
    if (selectedItem) {
      validateQuantity(quantityInputValue);
    }
  }, [selectedItem]);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const response = await StudentFacilitySpaceService.getTeamFacilitySpaceOverview();
      // Map the response data to FacilityForTransport type
      const facilitiesData = response.data?.facilities || [];
      const mappedFacilities: FacilityForTransport[] = facilitiesData.map((f: { 
        facilityInstanceId?: string; 
        inventoryId?: string; // API provides inventoryId
        facilityName?: string; 
        facilityType?: string; 
        tileCoordinates?: { q?: number; r?: number; s?: number }; 
        spaceMetrics?: { 
          availableSpace?: number; 
          totalSpace?: number;
          usedSpace?: number;
          utilizationRate?: number;
          rawMaterialSpace?: number;
          productSpace?: number;
        } 
      }) => ({
        id: f.facilityInstanceId || '',
        facilityName: f.facilityName || '',
        facilityType: f.facilityType || '',
        inventoryId: f.inventoryId || '', // Use the actual inventoryId from API
        tileX: f.tileCoordinates?.q || 0,
        tileY: f.tileCoordinates?.r || 0,
        currentInventory: f.spaceMetrics?.usedSpace || 0, // Use actual space metrics
        availableSpace: f.spaceMetrics?.availableSpace || 0,
        totalSpace: f.spaceMetrics?.totalSpace || 0
      }));
      setFacilities(mappedFacilities);
    } catch (error) {
      console.error('Failed to fetch facilities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryItems = async () => {
    if (!sourceFacility) return;

    // Check if inventoryId exists before making the API call
    if (!sourceFacility.inventoryId) {
      console.warn('Source facility has no inventoryId:', sourceFacility);
      setInventoryItems([]);
      setLoadingItems(false);
      return;
    }

    try {
      setLoadingItems(true);
      // Use the new transportation API to fetch inventory items
      const response = await TransportationService.getFacilityInventoryItems(
        sourceFacility.inventoryId
      );
      
      // The response structure is { success, businessCode, message, data: {...} }
      // After extractResponseData, we get the whole response object
      const inventoryData = response.data || response;
      
      if ('inventory' in inventoryData && inventoryData?.inventory) {
        // Combine raw materials and products into a single list
        const allItems: InventoryItemForTransport[] = [];

        // Add raw materials
        if (inventoryData.inventory.rawMaterials?.items) {
          inventoryData.inventory.rawMaterials.items.forEach((item) => {
            allItems.push({
              id: item.id,
              inventoryItemId: item.id, // Use the item ID directly for the API
              name: item.name || 'Unknown Material', // Always use name field
              type: InventoryItemType.RAW_MATERIAL,
              availableQuantity: parseFloat(item.quantity || '0')
            });
          });
        }

        // Add products
        if (inventoryData.inventory.products?.items) {
          inventoryData.inventory.products.items.forEach((item) => {
            allItems.push({
              id: item.id,
              inventoryItemId: item.id, // Use the item ID directly for the API
              name: item.name || item.productName || 'Unknown Product', // Always use name field
              type: InventoryItemType.PRODUCT,
              availableQuantity: parseFloat(item.quantity || '0')
            });
          });
        }
        
        console.log('Fetched inventory items:', allItems);
        setInventoryItems(allItems);
      } else {
        console.log('No inventory data found in response:', response);
        setInventoryItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch inventory items:', error);
      setInventoryItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const fetchTransferHistory = async () => {
    try {
      const response = await TransportationService.getTransferHistory({
        page: historyPage + 1, // API expects 1-based page index
        limit: historyRowsPerPage
      });
      setTransferHistory(response.items);
      setHistoryTotal(response.total);
    } catch (error) {
      console.error('Failed to fetch transfer history:', error);
    }
  };

  const handleNext = async () => {
    if (activeStep === 2 && sourceFacility && destFacility && selectedItem) {
      // Calculate cost before proceeding to review
      await calculateTransferCost();
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSourceFacility(null);
    setDestFacility(null);
    setSelectedItem(null);
    setTransferQuantity(1);
    setQuantityInputValue('1');
    setQuantityError('');
    setCostPreview(null);
  };

  // Validate quantity input with detailed error messages
  const validateQuantity = (value: string): boolean => {
    if (!selectedItem) {
      setQuantityError('');
      return false;
    }

    // Check if empty
    if (value === '' || value === null || value === undefined) {
      setQuantityError(t('transportation.QUANTITY_REQUIRED'));
      return false;
    }

    // Check if valid number
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setQuantityError(t('transportation.INVALID_NUMBER'));
      return false;
    }

    // Check minimum value
    if (numValue <= 0) {
      setQuantityError(t('transportation.QUANTITY_MUST_BE_POSITIVE'));
      return false;
    }

    // Check if too small
    if (numValue < 0.01) {
      setQuantityError(t('transportation.QUANTITY_MIN', { min: '0.01' }));
      return false;
    }

    // Check maximum value
    const max = selectedItem.availableQuantity || 0;
    if (numValue > max) {
      setQuantityError(t('transportation.QUANTITY_EXCEEDS_AVAILABLE', { max: max.toFixed(2) }));
      return false;
    }

    // Check decimal places (max 2)
    const decimalPlaces = (value.split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      setQuantityError(t('transportation.MAX_TWO_DECIMALS'));
      return false;
    }

    setQuantityError('');
    return true;
  };

  // Handle quantity input change with debounced validation
  const handleQuantityChange = (inputValue: string) => {
    setQuantityInputValue(inputValue);
    setIsValidatingQuantity(true);

    // Allow empty input temporarily
    if (inputValue === '') {
      setTransferQuantity(0);
      setQuantityError(t('transportation.QUANTITY_REQUIRED'));
      setIsValidatingQuantity(false);
      return;
    }

    // Basic format validation - allow only numbers and one decimal point
    if (!/^\d*\.?\d*$/.test(inputValue)) {
      setQuantityError(t('transportation.INVALID_NUMBER_FORMAT'));
      setIsValidatingQuantity(false);
      return;
    }

    // Perform validation
    const isValid = validateQuantity(inputValue);

    if (isValid) {
      const numValue = parseFloat(inputValue);
      const max = selectedItem?.availableQuantity || 1;
      const validValue = Math.min(Math.max(0.01, numValue), max);
      setTransferQuantity(Math.round(validValue * 100) / 100);
    } else {
      setTransferQuantity(0);
    }

    setIsValidatingQuantity(false);
  };

  // Handle input blur to auto-correct values
  const handleQuantityBlur = () => {
    if (!selectedItem) return;

    const numValue = parseFloat(quantityInputValue);

    if (isNaN(numValue) || numValue <= 0) {
      // Reset to minimum valid value
      setQuantityInputValue('0.01');
      setTransferQuantity(0.01);
      setQuantityError('');
    } else {
      const max = selectedItem.availableQuantity || 1;
      const validValue = Math.min(Math.max(0.01, numValue), max);
      const roundedValue = Math.round(validValue * 100) / 100;
      setQuantityInputValue(roundedValue.toString());
      setTransferQuantity(roundedValue);
      setQuantityError('');
    }
  };

  const calculateTransferCost = async () => {
    if (!sourceFacility || !destFacility || !selectedItem) return;

    try {
      setLoading(true);
      const request: TransferCostRequest = {
        sourceInventoryId: sourceFacility.inventoryId,
        destInventoryId: destFacility.inventoryId,
        inventoryItemId: selectedItem.inventoryItemId.toString(), // Use inventoryItemId as string
        quantity: transferQuantity.toString() // Convert quantity to string per API spec
      };
      const preview = await TransportationService.calculateTransferCost(request);
      setCostPreview(preview);
    } catch (error) {
      console.error('Failed to calculate cost:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeTransfer = async () => {
    if (!sourceFacility || !destFacility || !selectedItem || !costPreview) return;
    if (isExecuting) return; // Prevent double execution

    try {
      setIsExecuting(true);
      setLoading(true);
      const availableTier = costPreview.availableTiers.find(t => t.available);
      if (!availableTier) {
        throw new Error('No available tier for transfer');
      }

      const request: TransferRequest = {
        sourceInventoryId: sourceFacility.inventoryId,
        destInventoryId: destFacility.inventoryId,
        inventoryItemId: selectedItem.inventoryItemId.toString(), // Ensure it's a string
        quantity: transferQuantity.toString(), // Convert quantity to string per API spec
        tier: availableTier.tier
      };

      const result = await TransportationService.executeTransfer(request);
      setTransferResult(result as TransferResult);
      setConfirmDialog(false);
      setSuccessDialog(true);

      // Refresh data
      await fetchFacilities();
      await fetchTransferHistory();
    } catch (error) {
      console.error('Failed to execute transfer:', error);
    } finally {
      setLoading(false);
      setIsExecuting(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('transportation.SELECT_SOURCE_FACILITY')}
            </Typography>
            <Grid container spacing={2}>
              {facilities.map((facility) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={facility.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: sourceFacility?.id === facility.id ? '2px solid' : '1px solid',
                      borderColor: sourceFacility?.id === facility.id ? 'primary.main' : 'divider'
                    }}
                    onClick={() => setSourceFacility(facility)}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" fontWeight={600}>
                          {facility.facilityName}
                        </Typography>
                        <WarehouseIcon color="action" />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {t('transportation.LOCATION')}: ({facility.tileX}, {facility.tileY})
                      </Typography>
                      <Box mt={1}>
                        <Chip
                          size="small"
                          label={t('transportation.ITEMS_COUNT', { count: facility.currentInventory || 0 })}
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('transportation.SELECT_DESTINATION_FACILITY')}
            </Typography>
            <Grid container spacing={2}>
              {facilities
                .filter(f => f.id !== sourceFacility?.id)
                .map((facility) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={facility.id}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        border: destFacility?.id === facility.id ? '2px solid' : '1px solid',
                        borderColor: destFacility?.id === facility.id ? 'primary.main' : 'divider'
                      }}
                      onClick={() => setDestFacility(facility)}
                    >
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1" fontWeight={600}>
                            {facility.facilityName}
                          </Typography>
                          <WarehouseIcon color="action" />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {t('transportation.LOCATION')}: ({facility.tileX}, {facility.tileY})
                        </Typography>
                        <Box mt={1}>
                          <Chip
                            size="small"
                            label={t('transportation.SPACE_INFO', { available: facility.availableSpace || 0, total: facility.totalSpace || 0 })}
                            color="success"
                            variant="outlined"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('transportation.SELECT_ITEMS_TO_TRANSFER')}
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              {t('transportation.SELECT_ITEMS_FROM', { facility: sourceFacility?.facilityName })}
            </Alert>
            {loadingItems ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label={t('transportation.SELECT_ITEM')}
                    value={selectedItem?.id || ''}
                    onChange={(e) => {
                      const item = inventoryItems.find(i => i.id === e.target.value);
                      if (item) {
                        setSelectedItem(item);
                        setTransferQuantity(1);
                        setQuantityInputValue('1');
                        setQuantityError('');
                      }
                    }}
                    disabled={inventoryItems.length === 0}
                    helperText={inventoryItems.length === 0 ? t('transportation.NO_ITEMS_AVAILABLE') : ''}
                  >
                    {inventoryItems.length === 0 ? (
                      <MenuItem value="" disabled>
                        {t('transportation.NO_ITEMS_IN_INVENTORY')}
                      </MenuItem>
                    ) : (
                      inventoryItems.map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                          {item.name} ({(item.availableQuantity || 0).toFixed(2)} {t('transportation.AVAILABLE')})
                        </MenuItem>
                      ))
                    )}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="text"
                    label={t('transportation.QUANTITY')}
                    value={quantityInputValue}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    onBlur={handleQuantityBlur}
                    disabled={!selectedItem}
                    error={!!quantityError}
                    helperText={
                      quantityError ||
                      (selectedItem
                        ? `${t('common.MAX')}: ${selectedItem.availableQuantity.toFixed(2)}`
                        : '')
                    }
                    InputProps={{
                      endAdornment: isValidatingQuantity ? (
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                      ) : quantityError ? (
                        <Tooltip title={quantityError}>
                          <CloseIcon color="error" sx={{ mr: 1 }} />
                        </Tooltip>
                      ) : transferQuantity > 0 && !quantityError ? (
                        <CheckIcon color="success" sx={{ mr: 1 }} />
                      ) : null
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-error': {
                          '& fieldset': {
                            borderColor: 'error.main',
                            borderWidth: 2
                          }
                        },
                        '&:not(.Mui-error):has(input:valid:not(:placeholder-shown))': {
                          '& fieldset': {
                            borderColor: transferQuantity > 0 && !quantityError ? 'success.main' : 'inherit'
                          }
                        }
                      }
                    }}
                  />
                  {selectedItem && transferQuantity > 0 && !quantityError && (
                    <Box mt={1} display="flex" alignItems="center" gap={1}>
                      <CheckIcon fontSize="small" color="success" />
                      <Typography variant="caption" color="success.main">
                        {t('transportation.QUANTITY_VALID', { amount: transferQuantity.toFixed(2) })}
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
            )}
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('transportation.REVIEW_TRANSFER')}
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {t('transportation.FROM')}
                    </Typography>
                    <Typography variant="h6">{sourceFacility?.facilityName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('transportation.LOCATION')}: ({sourceFacility?.tileX}, {sourceFacility?.tileY})
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {t('transportation.TO')}
                    </Typography>
                    <Typography variant="h6">{destFacility?.facilityName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('transportation.LOCATION')}: ({destFacility?.tileX}, {destFacility?.tileY})
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {t('transportation.TRANSFER_DETAILS')}
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary={t('transportation.ITEM')}
                          secondary={selectedItem?.name}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary={t('transportation.QUANTITY')}
                          secondary={transferQuantity}
                        />
                      </ListItem>
                      {costPreview && (
                        <>
                          <ListItem>
                            <ListItemText 
                              primary={t('transportation.DISTANCE')}
                              secondary={`${costPreview.hexDistance} ${t('transportation.HEX_UNITS')}`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary={t('transportation.TIER_AVAILABLE')}
                              secondary={costPreview.availableTiers.find(t => t.available)?.tier}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <AttachMoneyIcon color="warning" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={t('transportation.TOTAL_COST')}
                              secondary={t('transportation.TOTAL_GOLD_COST', { cost: costPreview.availableTiers.find(t => t.available)?.totalCost || 0 })}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <EcoIcon color="success" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={t('transportation.CARBON_EMISSION')}
                              secondary={t('transportation.CARBON_COST', { carbon: costPreview.availableTiers.find(t => t.available)?.carbonEmission || 0 })}
                            />
                          </ListItem>
                        </>
                      )}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box mt={3} display="flex" justifyContent="center">
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<LocalShippingIcon />}
                onClick={() => setConfirmDialog(true)}
                disabled={loading || !costPreview || isExecuting}
              >
                {isExecuting ? t('transportation.EXECUTING') : t('transportation.EXECUTE_TRANSFER')}
              </Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('transportation.FACILITY_TRANSPORTATION')}
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{t(label)}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {getStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                {t('common.BACK')}
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button onClick={handleReset}>
                  {t('transportation.NEW_TRANSFER')}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={
                    (activeStep === 0 && !sourceFacility) ||
                    (activeStep === 1 && !destFacility) ||
                    (activeStep === 2 && (!selectedItem || transferQuantity <= 0 || !!quantityError))
                  }
                >
                  {t('common.NEXT')}
                </Button>
              )}
            </Box>
          </>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            {t('transportation.TRANSFER_HISTORY')}
          </Typography>
          <IconButton onClick={fetchTransferHistory}>
            <RefreshIcon />
          </IconButton>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">{t('common.DATE')}</TableCell>
                <TableCell align="center">{t('transportation.FROM')}</TableCell>
                <TableCell align="center">{t('transportation.TO')}</TableCell>
                <TableCell align="center">{t('transportation.ITEM')}</TableCell>
                <TableCell align="center">{t('transportation.QUANTITY')}</TableCell>
                <TableCell align="center">{t('transportation.TIER')}</TableCell>
                <TableCell align="center">{t('transportation.COST')}</TableCell>
                <TableCell align="center">{t('common.STATUS')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transferHistory.map((order: any) => (
                <TableRow key={order.orderId || order.id}>
                  <TableCell align="center">
                    {new Date(order.timestamp || order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">{order.sourceFacility || order.sourceFacilityId || '-'}</TableCell>
                  <TableCell align="center">{order.destFacility || order.destFacilityId || '-'}</TableCell>
                  <TableCell align="center">{order.itemName || order.itemType || '-'}</TableCell>
                  <TableCell align="center">{order.quantity || 0}</TableCell>
                  <TableCell align="center">
                    <Chip size="small" label={order.tier || 'N/A'} />
                  </TableCell>
                  <TableCell align="center">{t('transportation.TOTAL_GOLD_COST', { cost: order.totalCost || order.totalGoldCost || 0 })}</TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={order.status || 'UNKNOWN'}
                      color={order.status === 'COMPLETED' ? 'success' : 'default'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={historyTotal}
          page={historyPage}
          onPageChange={(e, page) => setHistoryPage(page)}
          rowsPerPage={historyRowsPerPage}
          onRowsPerPageChange={(e) => setHistoryRowsPerPage(parseInt(e.target.value, 10))}
          labelRowsPerPage={t('common.rowsPerPage')}
        />
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => !isExecuting && setConfirmDialog(false)}>
        <DialogTitle>{t('transportation.CONFIRM_TRANSFER')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('transportation.CONFIRM_TRANSFER_MESSAGE')}
          </Typography>
          {isExecuting && (
            <Box mt={2} display="flex" justifyContent="center">
              <CircularProgress size={24} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)} disabled={isExecuting}>
            {t('common.CANCEL')}
          </Button>
          <Button onClick={executeTransfer} variant="contained" color="primary" disabled={isExecuting}>
            {isExecuting ? t('transportation.EXECUTING') : t('common.CONFIRM')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successDialog} onClose={() => setSuccessDialog(false)}>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <CheckIcon color="success" />
            {t('transportation.TRANSFER_SUCCESS')}
          </Box>
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => {
            setSuccessDialog(false);
            handleReset();
          }} variant="contained">
            {t('common.CLOSE')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}