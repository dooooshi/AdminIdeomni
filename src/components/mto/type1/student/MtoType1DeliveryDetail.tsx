'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Tabs,
  Tab,
  Grid,
  Divider,
  Chip,
  Card,
  CardContent,
  Stack,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
// Remove Timeline imports as they may cause compatibility issues
import {
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import type { MtoType1DeliveryDetail } from '@/lib/types/mtoType1';
import MtoType1Service from '@/lib/services/mtoType1Service';
import { format } from 'date-fns';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`delivery-tabpanel-${index}`}
      aria-labelledby={`delivery-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

interface MtoType1DeliveryDetailProps {
  open: boolean;
  deliveryId: string | null;
  onClose: () => void;
  onReturnRequest?: (deliveryId: string) => void;
}

export default function MtoType1DeliveryDetail({
  open,
  deliveryId,
  onClose,
  onReturnRequest
}: MtoType1DeliveryDetailProps) {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [delivery, setDelivery] = useState<MtoType1DeliveryDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && deliveryId) {
      fetchDeliveryDetails();
    }
  }, [open, deliveryId]);

  const fetchDeliveryDetails = async () => {
    if (!deliveryId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await MtoType1Service.getDeliveryFullDetails(deliveryId);
      setDelivery(data);
    } catch (err) {
      console.error('Failed to fetch delivery details:', err);
      setError(t('mto.student.deliveries.error.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'default';

    switch (status) {
      case 'FULLY_SETTLED':
        return 'success';
      case 'PARTIALLY_SETTLED':
        return 'warning';
      case 'REJECTED':
        return 'error';
      case 'PENDING':
      case 'VALIDATED':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string | undefined) => {
    if (!status) return null;

    switch (status) {
      case 'FULLY_SETTLED':
        return <CheckIcon />;
      case 'PARTIALLY_SETTLED':
        return <WarningIcon />;
      case 'REJECTED':
        return <CancelIcon />;
      default:
        return null;
    }
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `$${num.toFixed(2)}`;
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { minHeight: '80vh' } }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            {t('mto.student.deliveries.details.title')} #{delivery?.deliveryNumber}
          </Typography>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {delivery && !loading && (
          <>
            {/* Status Summary */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('mto.student.deliveries.table.status')}
                    </Typography>
                    {delivery.deliveryStatus ? (
                      <Chip
                        label={t(`mto.student.deliveries.status.${delivery.deliveryStatus.toLowerCase().replace('_', '')}`)}
                        color={getStatusColor(delivery.deliveryStatus)}
                        icon={getStatusIcon(delivery.deliveryStatus)}
                        sx={{ mt: 0.5 }}
                      />
                    ) : (
                      <Chip
                        label={t('mto.student.deliveries.details.unknown')}
                        color="default"
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </Box>
                  <Divider orientation="vertical" flexItem />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('mto.student.deliveries.table.delivered')}
                    </Typography>
                    <Typography variant="h6">{delivery.quantities?.delivered || 0}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('mto.student.deliveries.table.settled')}
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {delivery.quantities?.settled || 0}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('mto.student.deliveries.table.unsettled')}
                    </Typography>
                    <Typography variant="h6" color="warning.main">
                      {delivery.quantities?.unsettled || 0}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('mto.student.deliveries.table.rejected')}
                    </Typography>
                    <Typography variant="h6" color="error.main">
                      {delivery.quantities?.rejected || 0}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tab label={t('mto.student.deliveries.details.overview')} icon={<AssignmentIcon />} iconPosition="start" />
              <Tab label={t('mto.student.deliveries.details.products')} icon={<InventoryIcon />} iconPosition="start" />
              <Tab label={t('mto.student.deliveries.details.settlementBreakdown')} icon={<PaymentIcon />} iconPosition="start" />
              <Tab label={t('mto.student.deliveries.details.timeline')} icon={<ScheduleIcon />} iconPosition="start" />
            </Tabs>

            {/* Tab Panels */}
            <TabPanel value={tabValue} index={0}>
              {/* Overview Tab */}
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('mto.student.deliveries.details.mtoRequirement')}
                  </Typography>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack spacing={1}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {t('mto.student.deliveries.details.requirementName')}
                          </Typography>
                          <Typography>
                            {delivery.mtoRequirement?.requirementName || `Requirement #${delivery.mtoType1Id}`}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {t('mto.student.deliveries.details.unitPrice')}
                          </Typography>
                          <Typography>{formatCurrency(delivery.mtoRequirement?.purchaseGoldPrice || 0)}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {t('mto.student.deliveries.details.releaseTime')}
                          </Typography>
                          <Typography>
                            {delivery.mtoRequirement?.releaseTime ? format(new Date(delivery.mtoRequirement.releaseTime), 'PPp') : t('mto.student.deliveries.details.na')}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {t('mto.student.deliveries.details.settlementTime')}
                          </Typography>
                          <Typography>
                            {delivery.mtoRequirement?.settlementTime ? format(new Date(delivery.mtoRequirement.settlementTime), 'PPp') : t('mto.student.deliveries.details.na')}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('mto.student.deliveries.details.tileLocation')}
                  </Typography>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack spacing={1}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {t('mto.student.deliveries.details.tileName')}
                          </Typography>
                          <Typography>{delivery.tileLocation?.tileName || t('mto.student.deliveries.details.unknown')}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {t('mto.student.deliveries.details.coordinates')}
                          </Typography>
                          <Typography>
                            Q: {delivery.tileLocation?.coordinates?.q || 0}, R: {delivery.tileLocation?.coordinates?.r || 0}
                          </Typography>
                        </Box>
                        {delivery.tileLocation?.population && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {t('mto.student.deliveries.details.population')}
                            </Typography>
                            <Typography>{delivery.tileLocation?.population?.toLocaleString() || 0}</Typography>
                          </Box>
                        )}
                        {delivery.tileLocation?.tileRequirement && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {t('mto.student.deliveries.details.tileRequirementProgress')}
                            </Typography>
                            <Typography>
                              {delivery.tileLocation?.tileRequirement?.settledNumber || 0} / {delivery.tileLocation?.tileRequirement?.adjustedRequirementNumber || 0}
                              {' '}({((delivery.tileLocation?.tileRequirement?.adjustedRequirementNumber || 0) > 0 ? ((delivery.tileLocation?.tileRequirement?.settledNumber || 0) / (delivery.tileLocation?.tileRequirement?.adjustedRequirementNumber || 1)) * 100 : 0).toFixed(1)}%)
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {/* Products Tab */}
              <Stack spacing={3}>
                {/* Manager Formula Requirements */}
                {delivery.managerFormula && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Manager Formula Requirements
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell align="center">Product Name</TableCell>
                              <TableCell align="center">Materials</TableCell>
                              <TableCell align="center">Craft Categories</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell align="center">
                                <Typography variant="body2">{delivery.managerFormula.productName}</Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Stack spacing={0.5}>
                                  {delivery.managerFormula.materials.map((material) => (
                                    <Typography key={material.rawMaterialId} variant="caption">
                                      • {material.rawMaterial.nameEn}: {material.quantity} units
                                    </Typography>
                                  ))}
                                </Stack>
                              </TableCell>
                              <TableCell align="center">
                                <Stack direction="row" spacing={0.5} flexWrap="wrap" justifyContent="center">
                                  {delivery.managerFormula.craftCategories.map((category) => (
                                    <Chip
                                      key={category.craftCategoryId}
                                      label={category.craftCategory.nameEn}
                                      size="small"
                                      variant="outlined"
                                    />
                                  ))}
                                </Stack>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Submitted Products */}
                {delivery.submittedProducts && delivery.submittedProducts.length > 0 ? (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Submitted Products
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell align="center">Product Name</TableCell>
                              <TableCell align="center">Quantity</TableCell>
                              <TableCell align="center">Materials</TableCell>
                              <TableCell align="center">Craft Categories</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {delivery.submittedProducts.map((product, index) => (
                              <TableRow key={product.inventoryItemId || `product-${index}`}>
                                <TableCell align="center">
                                  <Typography variant="body2">{product.productName || '-'}</Typography>
                                </TableCell>
                                <TableCell align="center">{product.quantity || 0} units</TableCell>
                                <TableCell align="center">
                                  {product.teamProductFormula ? (
                                    <Stack spacing={0.5}>
                                      {product.teamProductFormula.materials.map((material) => (
                                        <Typography key={material.rawMaterialId} variant="caption">
                                          • {material.rawMaterial.nameEn}: {material.quantity} units
                                        </Typography>
                                      ))}
                                    </Stack>
                                  ) : (
                                    '-'
                                  )}
                                </TableCell>
                                <TableCell align="center">
                                  {product.teamProductFormula ? (
                                    <Stack direction="row" spacing={0.5} flexWrap="wrap" justifyContent="center">
                                      {product.teamProductFormula.craftCategories.map((category) => (
                                        <Chip
                                          key={category.craftCategoryId}
                                          label={category.craftCategory.nameEn}
                                          size="small"
                                          variant="outlined"
                                        />
                                      ))}
                                    </Stack>
                                  ) : (
                                    '-'
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>

                    </CardContent>
                  </Card>
                ) : (
                  <Alert severity="info">{t('mto.student.deliveries.details.noProducts')}</Alert>
                )}
              </Stack>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              {/* Settlement Breakdown Tab */}
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {t('mto.student.deliveries.details.settlementSummary')}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              {t('mto.student.deliveries.details.totalDelivered')}
                            </Typography>
                            <Typography variant="h4">{delivery.quantities?.delivered || 0}</Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              {t('mto.student.deliveries.details.productsSettled')}
                            </Typography>
                            <Typography variant="h4" color="success.main">
                              {delivery.quantities?.settled || 0}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              {t('mto.student.deliveries.details.productsRejected')}
                            </Typography>
                            <Typography variant="h4" color="error.main">
                              {delivery.quantities?.rejected || 0}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              {t('mto.student.deliveries.details.settlementRate')}
                            </Typography>
                            <Typography variant="h4">
                              {(delivery.quantities?.delivered || 0) > 0
                                ? `${(((delivery.quantities?.settled || 0) / (delivery.quantities?.delivered || 0)) * 100).toFixed(1)}%`
                                : '0%'}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" gutterBottom>
                        {t('mto.student.deliveries.details.paymentCalculation')}
                      </Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>{t('mto.student.deliveries.details.settledQuantity')}</Typography>
                          <Typography>{delivery.quantities?.settled || 0}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>× {t('mto.student.deliveries.details.unitPrice')}</Typography>
                          <Typography>{formatCurrency(delivery.financial?.unitPrice || 0)}</Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="h6">{t('mto.student.deliveries.details.totalSettlement')}</Typography>
                          <Typography variant="h6" color="primary.main">
                            {formatCurrency(delivery.financial?.settlementAmount || 0)}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {delivery.returnStatus && (
                  <Grid size={{ xs: 12 }}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {t('mto.student.deliveries.details.returnStatus')}
                        </Typography>
                        <Stack spacing={1}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {t('mto.student.deliveries.details.returnRequestedStatus')}
                            </Typography>
                            <Typography>
                              {delivery.returnStatus?.requested ? t('mto.student.deliveries.details.yes') : t('mto.student.deliveries.details.no')}
                            </Typography>
                          </Box>
                          {delivery.returnStatus?.returnFacilityId && (
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {t('mto.student.deliveries.details.returnFacility')}
                              </Typography>
                              <Typography>{delivery.returnStatus?.returnFacilityId}</Typography>
                            </Box>
                          )}
                          {delivery.returnStatus?.returnTransportationFee && (
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {t('mto.student.deliveries.details.returnTransportationFee')}
                              </Typography>
                              <Typography>
                                {formatCurrency(delivery.returnStatus?.returnTransportationFee || 0)}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              {/* Timeline Tab - Custom implementation without @mui/lab */}
              <Stack spacing={3}>
                {/* Delivery Submitted */}
                <Card variant="outlined">
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          {delivery.timestamps?.deliveredAt ? format(new Date(delivery.timestamps.deliveredAt), 'PPp') : t('mto.student.deliveries.details.na')}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 1 }}>
                        <Box sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          color: 'white'
                        }}>
                          <ShippingIcon />
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 8 }}>
                        <Typography variant="h6" gutterBottom>
                          {t('mto.student.deliveries.details.deliverySubmitted')}
                        </Typography>
                        <Typography color="text.secondary">
                          {delivery.quantities?.delivered || 0} {t('mto.student.deliveries.details.productsDeliveredTo')} {delivery.tileLocation?.tileName || t('mto.student.deliveries.details.unknown')}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Settlement Completed */}
                {delivery.timestamps?.settledAt && (
                  <Card variant="outlined">
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, sm: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            {delivery.timestamps?.settledAt ? format(new Date(delivery.timestamps.settledAt), 'PPp') : t('mto.student.deliveries.details.na')}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 1 }}>
                          <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: 'success.main',
                            color: 'white'
                          }}>
                            <PaymentIcon />
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 8 }}>
                          <Typography variant="h6" gutterBottom>
                            {t('mto.student.deliveries.details.settlementCompleted')}
                          </Typography>
                          <Typography color="text.secondary">
                            {delivery.quantities?.settled || 0} {t('mto.student.deliveries.details.productsSettledPayment')} {formatCurrency(delivery.financial?.settlementAmount || 0)} {t('mto.student.deliveries.details.paid')}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {/* Return Requested */}
                {delivery.timestamps?.returnRequestedAt && (
                  <Card variant="outlined">
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, sm: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            {delivery.timestamps?.returnRequestedAt ? format(new Date(delivery.timestamps.returnRequestedAt), 'PPp') : t('mto.student.deliveries.details.na')}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 1 }}>
                          <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: 'warning.main',
                            color: 'white'
                          }}>
                            <WarningIcon />
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 8 }}>
                          <Typography variant="h6" gutterBottom>
                            {t('mto.student.deliveries.details.returnRequestedStatus')}
                          </Typography>
                          <Typography color="text.secondary">
                            {t('mto.student.deliveries.details.returnRequestedFor')} {delivery.quantities?.unsettled || 0} {t('mto.student.deliveries.details.unsettledProducts')}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {/* Return Completed */}
                {delivery.timestamps?.returnCompletedAt && (
                  <Card variant="outlined">
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, sm: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            {delivery.timestamps?.returnCompletedAt ? format(new Date(delivery.timestamps.returnCompletedAt), 'PPp') : t('mto.student.deliveries.details.na')}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 1 }}>
                          <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: 'info.main',
                            color: 'white'
                          }}>
                            <CheckIcon />
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 8 }}>
                          <Typography variant="h6" gutterBottom>
                            {t('mto.student.deliveries.details.returnCompleted')}
                          </Typography>
                          <Typography color="text.secondary">
                            {t('mto.student.deliveries.details.productsReturned')}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                )}
              </Stack>
            </TabPanel>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          {t('mto.student.deliveries.details.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}