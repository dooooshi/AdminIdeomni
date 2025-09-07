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
import Grid from '@mui/material/Grid';
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
  const [transferQuantity, setTransferQuantity] = useState(1);
  const [costPreview, setCostPreview] = useState<TransportationCostPreview | null>(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);
  const [transferResult, setTransferResult] = useState<TransferResult | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItemForTransport[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    fetchFacilities();
    fetchTransferHistory();
  }, []);

  useEffect(() => {
    if (sourceFacility) {
      fetchInventoryItems();
      setSelectedItem(null); // Reset selected item when source changes
      setTransferQuantity(1);
    } else {
      setInventoryItems([]);
      setSelectedItem(null);
    }
  }, [sourceFacility]);

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
    
    try {
      setLoadingItems(true);
      // Use the new transportation API to fetch inventory items
      const response = await TransportationService.getFacilityInventoryItems(
        sourceFacility.inventoryId
      );
      
      // The response structure is { success, businessCode, message, data: {...} }
      // After extractResponseData, we get the whole response object
      const inventoryData = response.data || response;
      
      if (inventoryData?.inventory) {
        // Combine raw materials and products into a single list
        const allItems: InventoryItemForTransport[] = [];
        
        // Add raw materials
        if (inventoryData.inventory.rawMaterials?.items) {
          inventoryData.inventory.rawMaterials.items.forEach((item) => {
            allItems.push({
              id: item.id,
              inventoryItemId: item.id, // Use the item ID directly for the API
              name: item.nameEn || item.name || item.nameZh || 'Unknown Material',
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
              name: item.nameEn || item.name || item.nameZh || item.productName || 'Unknown Product',
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
        page: historyPage,
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
    setCostPreview(null);
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

    try {
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
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={facility.id}>
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
                        {t('transportation.TYPE')}: {facility.facilityType}
                      </Typography>
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
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={facility.id}>
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
                          Type: {facility.facilityType}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Location: ({facility.tileX}, {facility.tileY})
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
                <Grid size={{ xs: 12, md: 6 }}>
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
                          {item.name} ({Math.floor(item.availableQuantity || 0)} {t('common.AVAILABLE')})
                        </MenuItem>
                      ))
                    )}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label={t('transportation.QUANTITY')}
                    value={isNaN(transferQuantity) ? 1 : transferQuantity}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      if (inputValue === '') {
                        setTransferQuantity(1);
                        return;
                      }
                      const value = parseInt(inputValue, 10);
                      if (isNaN(value)) {
                        setTransferQuantity(1);
                        return;
                      }
                      const max = Math.floor(selectedItem?.availableQuantity || 1);
                      setTransferQuantity(Math.min(Math.max(1, value), max));
                    }}
                    disabled={!selectedItem}
                    inputProps={{
                      min: 1,
                      max: Math.floor(selectedItem?.availableQuantity || 1)
                    }}
                    helperText={selectedItem ? `${t('common.MAX')}: ${Math.floor(selectedItem.availableQuantity)}` : ''}
                  />
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
              <Grid size={{ xs: 12, md: 6 }}>
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
              
              <Grid size={{ xs: 12, md: 6 }}>
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

              <Grid size={12}>
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
                disabled={loading || !costPreview}
              >
                {t('transportation.EXECUTE_TRANSFER')}
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
                    (activeStep === 2 && (!selectedItem || transferQuantity <= 0))
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
                <TableCell>{t('common.DATE')}</TableCell>
                <TableCell>{t('transportation.FROM')}</TableCell>
                <TableCell>{t('transportation.TO')}</TableCell>
                <TableCell>{t('transportation.ITEM')}</TableCell>
                <TableCell align="right">{t('transportation.QUANTITY')}</TableCell>
                <TableCell>{t('transportation.TIER')}</TableCell>
                <TableCell align="right">{t('transportation.COST')}</TableCell>
                <TableCell>{t('common.STATUS')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transferHistory.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{order.sourceFacilityId}</TableCell>
                  <TableCell>{order.destFacilityId}</TableCell>
                  <TableCell>{order.itemType}</TableCell>
                  <TableCell align="right">{order.quantity}</TableCell>
                  <TableCell>
                    <Chip size="small" label={order.tier} />
                  </TableCell>
                  <TableCell align="right">{t('transportation.TOTAL_GOLD_COST', { cost: order.totalGoldCost })}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={order.status}
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
        />
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>{t('transportation.CONFIRM_TRANSFER')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('transportation.CONFIRM_TRANSFER_MESSAGE')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>
            {t('common.CANCEL')}
          </Button>
          <Button onClick={executeTransfer} variant="contained" color="primary">
            {t('common.CONFIRM')}
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
        <DialogContent>
          <Typography>
            {t('transportation.TRANSFER_SUCCESS_MESSAGE')}
          </Typography>
          {transferResult && (
            <Box mt={2}>
              <Typography variant="body2">
                {t('transportation.ORDER_ID')}: {transferResult.orderId}
              </Typography>
              <Typography variant="body2">
                {t('transportation.GOLD_DEDUCTED')}: {transferResult.goldDeducted}
              </Typography>
              <Typography variant="body2">
                {t('transportation.CARBON_EMITTED_RESULT')}: {transferResult.carbonEmitted}
              </Typography>
            </Box>
          )}
        </DialogContent>
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