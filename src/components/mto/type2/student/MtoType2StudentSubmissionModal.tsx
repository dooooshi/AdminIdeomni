import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  IconButton,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Close as CloseIcon,
  Send as SendIcon,
  Store as StoreIcon,
  AttachMoney as AttachMoneyIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Calculate as CalculateIcon,
} from '@mui/icons-material';

import {
  MtoType2SubmissionRequest,
  MtoType2SubmissionEligibility,
} from '@/lib/types/mtoType2';
import { MtoType2Service } from '@/lib/services/mtoType2Service';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';

interface MtoType2StudentSubmissionModalProps {
  open: boolean;
  requirementId: number | null;
  requirementName?: string;
  onClose: () => void;
  onSubmissionCreated?: () => void;
}

interface FormData {
  facilityInstanceId: string;
  selectedProductId: string;
  productQuantity: number;
  unitPrice: number;
}

interface FormErrors {
  facilityInstanceId?: string;
  selectedProductId?: string;
  productQuantity?: string;
  unitPrice?: string;
}

export const MtoType2StudentSubmissionModal: React.FC<MtoType2StudentSubmissionModalProps> = ({
  open,
  requirementId,
  requirementName,
  onClose,
  onSubmissionCreated,
}) => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [eligibility, setEligibility] = useState<MtoType2SubmissionEligibility | null>(null);

  const [formData, setFormData] = useState<FormData>({
    facilityInstanceId: '',
    selectedProductId: '',
    productQuantity: 0,
    unitPrice: 0,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedMall, setSelectedMall] = useState<typeof eligibility.eligibleFacilities[0] | null>(null);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);

  // Load eligibility data when modal opens
  useEffect(() => {
    if (open && requirementId) {
      loadEligibility();
    }
  }, [open, requirementId]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({
        facilityInstanceId: '',
        selectedProductId: '',
        productQuantity: 0,
        unitPrice: 0,
      });
      setErrors({});
      setSelectedMall(null);
      setEligibility(null);
      setAlertMessage(null);
    }
  }, [open]);

  const loadEligibility = async () => {
    if (!requirementId) return;

    try {
      setLoading(true);
      const data = await MtoType2Service.getSubmissionEligibility(requirementId);
      setEligibility(data);

      // Check if team has no MALL facilities
      if (data.teamInfo.totalMALLs === 0) {
        setAlertMessage({ type: 'info', message: t('mto.type2.student.noMallFacilities') });
      } else if (data.eligibleFacilities.length === 0) {
        setAlertMessage({ type: 'warning', message: t('mto.type2.student.noEligibleFacilities') });
      }
    } catch (error) {
      console.error('Error loading submission eligibility:', error);
      setAlertMessage({
        type: 'error',
        message: `${t('mto.type2.student.eligibilityLoadError')}: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMallSelection = (facilityId: string) => {
    const mall = eligibility?.eligibleFacilities.find(f => f.facilityId === facilityId);
    if (!mall) return;

    setSelectedMall(mall);
    setFormData(prev => ({
      ...prev,
      facilityInstanceId: facilityId
    }));

    // Clear any previous errors for this field
    setErrors(prev => ({ ...prev, facilityInstanceId: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.facilityInstanceId) {
      newErrors.facilityInstanceId = t('mto.type2.student.selectMallRequired');
    }

    if (!formData.selectedProductId) {
      newErrors.selectedProductId = t('mto.type2.student.selectProductRequired');
    }

    if (!formData.productQuantity || formData.productQuantity <= 0) {
      newErrors.productQuantity = t('mto.type2.student.quantityRequired');
    }

    if (!formData.unitPrice || formData.unitPrice <= 0) {
      newErrors.unitPrice = t('mto.type2.student.priceRequired');
    }

    // Check if quantity exceeds available inventory
    if (selectedMall && formData.selectedProductId && formData.productQuantity > 0) {
      const selectedProduct = selectedMall.inventory.products.find(
        p => p.inventoryItemId === formData.selectedProductId
      );
      if (selectedProduct && formData.productQuantity > selectedProduct.quantity) {
        newErrors.productQuantity = t('mto.type2.student.exceedsInventory', {
          available: selectedProduct.quantity
        });
      }
    }

    // Validate against budget allocation
    if (selectedMall && formData.productQuantity > 0 && formData.unitPrice > 0) {
      const totalValue = formData.productQuantity * formData.unitPrice;
      const allocatedBudget = parseFloat(selectedMall.tile.budgetAllocation.allocatedBudget);

      if (totalValue > allocatedBudget) {
        newErrors.productQuantity = t('mto.type2.student.exceedsBudget', {
          total: totalValue.toLocaleString(),
          budget: allocatedBudget.toLocaleString()
        });
      }
    }

    // Check if already submitted
    if (selectedMall?.submissionStatus.hasSubmitted) {
      newErrors.facilityInstanceId = t('mto.type2.student.alreadySubmitted');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotalValue = () => {
    return formData.productQuantity * formData.unitPrice;
  };

  const calculateExpectedRevenue = () => {
    if (!selectedMall) return 0;
    const totalValue = calculateTotalValue();
    const budgetAllocation = parseFloat(selectedMall.tile.budgetAllocation.allocatedBudget);
    return Math.min(totalValue, budgetAllocation);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setAlertMessage({ type: 'error', message: t('mto.type2.student.fixValidationErrors') });
      return;
    }

    if (!requirementId) return;

    try {
      setSubmitting(true);

      const submissionData: MtoType2SubmissionRequest = {
        requirementId: requirementId,
        facilityInstanceId: formData.facilityInstanceId,
        productNumber: formData.productQuantity,
        unitPrice: formData.unitPrice,
      };

      await MtoType2Service.createSubmission(submissionData);
      setAlertMessage({ type: 'success', message: t('mto.type2.student.submissionSuccess') });
      // Delay closing to show success message
      setTimeout(() => {
        onSubmissionCreated?.();
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error creating submission:', error);
      setAlertMessage({
        type: 'error',
        message: `${t('mto.type2.student.submissionError')}: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setSubmitting(false);
    }
  };

  const hasEligibleFacilities = eligibility && eligibility.eligibleFacilities.length > 0;
  const canSubmit = hasEligibleFacilities && eligibility.mtoType2.isOpenForSubmission;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6">
              {t('mto.type2.student.submitProducts')}
            </Typography>
            {requirementName && (
              <Typography variant="body2" color="textSecondary" component="div">
                {requirementName}
              </Typography>
            )}
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {alertMessage && (
          <Alert
            severity={alertMessage.type}
            onClose={() => setAlertMessage(null)}
            sx={{ mb: 2 }}
          >
            {alertMessage.message}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress />
          </Box>
        ) : eligibility ? (
          <Box sx={{ pt: 2 }}>
            {/* Team Information */}
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {t('mto.type2.student.teamInfo')}
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip
                  label={`${t('mto.type2.student.totalMalls')}: ${eligibility.teamInfo.totalMALLs}`}
                  size="small"
                />
                <Chip
                  label={`${t('mto.type2.student.eligibleMalls')}: ${eligibility.teamInfo.eligibleMALLs}`}
                  size="small"
                  color="primary"
                />
                {eligibility.mtoType2.isOpenForSubmission ? (
                  <Chip
                    label={t('mto.type2.student.submissionsOpen')}
                    size="small"
                    color="success"
                  />
                ) : (
                  <Chip
                    label={t('mto.type2.student.submissionsClosed')}
                    size="small"
                    color="error"
                  />
                )}
              </Box>
            </Alert>

            {!hasEligibleFacilities ? (
              <Alert severity="warning">
                {eligibility.teamInfo.totalMALLs === 0
                  ? t('mto.type2.student.noMallOwnership')
                  : t('mto.type2.student.noEligibleMalls')}
              </Alert>
            ) : !canSubmit ? (
              <Alert severity="warning">
                {t('mto.type2.student.submissionsNotOpen')}
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {/* MALL Selection */}
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth error={!!errors.facilityInstanceId}>
                    <InputLabel>{t('mto.type2.student.selectMall')}</InputLabel>
                    <Select
                      value={selectedMall?.facilityId || ''}
                      onChange={(e) => handleMallSelection(e.target.value)}
                      label={t('mto.type2.student.selectMall')}
                      disabled={submitting}
                    >
                      {eligibility.eligibleFacilities.map((facility) => (
                        <MenuItem
                          key={facility.facilityId}
                          value={facility.facilityId}
                          disabled={facility.submissionStatus.hasSubmitted}
                        >
                          <Box display="flex" justifyContent="space-between" width="100%">
                            <Box>
                              <Typography>
                                {facility.facilityName} - {t('mto.type2.student.level')} {facility.mallLevel}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {facility.tile.tileName} | {t('mto.type2.student.budget')}: ${parseFloat(facility.tile.budgetAllocation.allocatedBudget).toLocaleString()}
                              </Typography>
                            </Box>
                            {facility.submissionStatus.hasSubmitted && (
                              <Chip
                                label={t('mto.type2.student.submitted')}
                                size="small"
                                color="success"
                              />
                            )}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.facilityInstanceId && (
                      <Typography variant="caption" color="error">
                        {errors.facilityInstanceId}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                {/* Product Selection from Inventory */}
                {selectedMall && selectedMall.inventory.products.length > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <FormControl fullWidth error={!!errors.selectedProductId}>
                      <InputLabel>{t('mto.type2.student.selectProduct')}</InputLabel>
                      <Select
                        value={formData.selectedProductId || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          selectedProductId: e.target.value
                        }))}
                        label={t('mto.type2.student.selectProduct')}
                        disabled={submitting}
                      >
                        {selectedMall.inventory.products.map((product) => (
                          <MenuItem
                            key={product.inventoryItemId}
                            value={product.inventoryItemId}
                          >
                            <Box display="flex" justifyContent="space-between" width="100%">
                              <Box>
                                <Typography>
                                  {product.productName}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {t('mto.type2.student.availableQuantity')}: {product.quantity.toLocaleString()} |
                                  {' '}{t('mto.type2.student.spaceUsed')}: {product.totalSpaceUsed.toFixed(2)}
                                </Typography>
                              </Box>
                              {product.productDetails.qualityLevel && (
                                <Chip
                                  label={product.productDetails.qualityLevel}
                                  size="small"
                                  color={
                                    product.productDetails.qualityLevel === 'HIGH' ? 'success' :
                                    product.productDetails.qualityLevel === 'MEDIUM' ? 'primary' :
                                    'default'
                                  }
                                />
                              )}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.selectedProductId && (
                        <Typography variant="caption" color="error">
                          {errors.selectedProductId}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                )}

                {/* No Products Available Alert */}
                {selectedMall && selectedMall.inventory.products.length === 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="warning" icon={<WarningIcon />}>
                      {t('mto.type2.student.noProductsInInventory')}
                    </Alert>
                  </Grid>
                )}

                {/* Selected Product Details */}
                {selectedMall && formData.selectedProductId && (
                  <Grid size={{ xs: 12 }}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          {t('mto.type2.student.selectedProductDetails')}
                        </Typography>
                        {(() => {
                          const product = selectedMall.inventory.products.find(
                            p => p.inventoryItemId === formData.selectedProductId
                          );
                          if (!product) return null;

                          return (
                            <Grid container spacing={2}>
                              <Grid size={{ xs: 6, sm: 3 }}>
                                <Typography variant="caption" color="textSecondary">
                                  {t('mto.type2.student.productName')}
                                </Typography>
                                <Typography variant="body2">
                                  {product.productName}
                                </Typography>
                              </Grid>
                              <Grid size={{ xs: 6, sm: 3 }}>
                                <Typography variant="caption" color="textSecondary">
                                  {t('mto.type2.student.availableQuantity')}
                                </Typography>
                                <Typography variant="body2">
                                  {product.quantity.toLocaleString()}
                                </Typography>
                              </Grid>
                              <Grid size={{ xs: 6, sm: 3 }}>
                                <Typography variant="caption" color="textSecondary">
                                  {t('mto.type2.student.qualityLevel')}
                                </Typography>
                                <Typography variant="body2">
                                  {product.productDetails.qualityLevel || '-'}
                                </Typography>
                              </Grid>
                              <Grid size={{ xs: 6, sm: 3 }}>
                                <Typography variant="caption" color="textSecondary">
                                  {t('mto.type2.student.craftCategories')}
                                </Typography>
                                <Typography variant="body2">
                                  {product.productDetails.craftCategories.join(', ')}
                                </Typography>
                              </Grid>
                              {product.productDetails.materials && product.productDetails.materials.length > 0 && (
                                <Grid size={{ xs: 12 }}>
                                  <Typography variant="caption" color="textSecondary">
                                    {t('mto.type2.student.materials')}
                                  </Typography>
                                  <Typography variant="body2">
                                    {product.productDetails.materials.map(m =>
                                      `${m.name} (${m.quantity})`
                                    ).join(', ')}
                                  </Typography>
                                </Grid>
                              )}
                            </Grid>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* Selected MALL Details */}
                {selectedMall && (
                  <Grid size={{ xs: 12 }}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          {t('mto.type2.student.mallDetails')}
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="caption" color="textSecondary">
                              {t('mto.type2.student.tile')}
                            </Typography>
                            <Typography variant="body2">
                              {selectedMall.tile.tileName}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="caption" color="textSecondary">
                              {t('mto.type2.student.population')}
                            </Typography>
                            <Typography variant="body2">
                              {selectedMall.tile.population.toLocaleString()}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="caption" color="textSecondary">
                              {t('mto.type2.student.allocatedBudget')}
                            </Typography>
                            <Typography variant="body2" color="primary">
                              ${parseFloat(selectedMall.tile.budgetAllocation.allocatedBudget).toLocaleString()}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="caption" color="textSecondary">
                              {t('mto.type2.student.availableInventory')}
                            </Typography>
                            <Typography variant="body2">
                              {selectedMall.inventory.products.reduce((sum, p) => sum + p.quantity, 0).toLocaleString()} {t('mto.type2.student.items')}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* Product Quantity */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={t('mto.type2.student.productQuantity')}
                    type="number"
                    value={formData.productQuantity || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      productQuantity: parseInt(e.target.value) || 0
                    }))}
                    error={!!errors.productQuantity}
                    helperText={errors.productQuantity}
                    InputProps={{
                      inputProps: { min: 0, step: 1 },
                    }}
                    disabled={submitting}
                  />
                </Grid>

                {/* Unit Price */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={t('mto.type2.student.unitPrice')}
                    type="number"
                    value={formData.unitPrice || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      unitPrice: parseFloat(e.target.value) || 0
                    }))}
                    error={!!errors.unitPrice}
                    helperText={errors.unitPrice}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      inputProps: { min: 0, step: 0.01 },
                    }}
                    disabled={submitting}
                  />
                </Grid>

                {/* Calculation Summary */}
                {formData.productQuantity > 0 && formData.unitPrice > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          <CalculateIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                          {t('mto.type2.student.submissionSummary')}
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <Box textAlign="center">
                              <Typography variant="h6" color="primary">
                                ${calculateTotalValue().toLocaleString()}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {t('mto.type2.student.totalValue')}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <Box textAlign="center">
                              <Typography variant="h6" color="success.main">
                                ${calculateExpectedRevenue().toLocaleString()}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {t('mto.type2.student.expectedRevenue')}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <Box textAlign="center">
                              <Chip
                                label={`${t('mto.type2.student.mallLevel')} ${selectedMall?.mallLevel || '-'}`}
                                color="primary"
                                size="small"
                              />
                              <Typography variant="caption" display="block" color="textSecondary" mt={0.5}>
                                {t('mto.type2.student.settlementPriority')}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* Warnings */}
                {selectedMall && calculateTotalValue() > parseFloat(selectedMall.tile.budgetAllocation.allocatedBudget) && (
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="warning" icon={<WarningIcon />}>
                      {t('mto.type2.student.exceedsBudgetWarning')}
                    </Alert>
                  </Grid>
                )}
              </Grid>
            )}
          </Box>
        ) : (
          <Alert severity="error">
            {t('mto.type2.student.noEligibilityData')}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          {t('common.cancel')}
        </Button>
        {hasEligibleFacilities && canSubmit && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || !selectedMall || loading}
            startIcon={submitting ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {submitting ? t('mto.type2.student.submitting') : t('mto.type2.student.submit')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default MtoType2StudentSubmissionModal;