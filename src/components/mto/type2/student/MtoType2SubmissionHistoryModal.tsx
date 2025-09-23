import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  LocalShipping as LocalShippingIcon,
  Payment as PaymentIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { MtoType2SubmissionHistoryItem } from '@/lib/types/mtoType2';

interface Props {
  open: boolean;
  item: MtoType2SubmissionHistoryItem | null;
  onClose: () => void;
}

export const MtoType2SubmissionHistoryModal: React.FC<Props> = ({ open, item, onClose }) => {
  const { t } = useTranslation();

  if (!item) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount: string | number) => {
    return `$${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status) {
      case 'FULL': return 'success';
      case 'PARTIAL': return 'warning';
      case 'PENDING': return 'info';
      case 'UNSETTLED': return 'error';
      case 'RETURNED': return 'secondary';
      default: return 'default';
    }
  };

  const getPaymentStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'PROCESSING': return 'info';
      case 'PENDING': return 'warning';
      case 'FAILED': return 'error';
      default: return 'default';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {t('mto.type2.history.submissionDetails')} #{item.submissionNumber}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* MTO Type 2 Overview */}
        <Box mb={3}>
          <Typography variant="subtitle1" gutterBottom color="primary">
            {t('mto.type2.history.mtoOverview')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="textSecondary">
                {t('mto.type2.history.mtoId')}
              </Typography>
              <Typography variant="body2">#{item.mtoType2Id}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="textSecondary">
                {t('mto.type2.history.mtoStatus')}
              </Typography>
              <Typography variant="body2">{item.mtoType2.status}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="textSecondary">
                {t('mto.type2.history.releaseTime')}
              </Typography>
              <Typography variant="body2">{formatDate(item.mtoType2.releaseTime)}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="textSecondary">
                {t('mto.type2.history.settlementTime')}
              </Typography>
              <Typography variant="body2">{formatDate(item.mtoType2.settlementTime)}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="textSecondary">
                {t('mto.type2.history.totalBudget')}
              </Typography>
              <Typography variant="h6" color="secondary">
                {formatCurrency(item.mtoType2.overallPurchaseBudget)}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Manager's Product Formula */}
        <Box mb={3}>
          <Typography variant="subtitle1" gutterBottom color="primary">
            <InventoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            {t('mto.type2.history.managerFormula')}
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="textSecondary">
                {t('mto.type2.history.productName')}
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {item.managerProductFormula.productName}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="textSecondary">
                {t('mto.type2.history.formulaNumber')}
              </Typography>
              <Typography variant="body2">#{item.managerProductFormula.formulaNumber}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="textSecondary">
                {t('mto.type2.history.totalMaterialCost')}
              </Typography>
              <Typography variant="body2">
                {formatCurrency(item.managerProductFormula.totalMaterialCost)}
              </Typography>
            </Grid>
          </Grid>

          {/* Materials Table */}
          <Typography variant="subtitle2" gutterBottom>
            {t('mto.type2.history.requiredMaterials')}
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('mto.type2.history.material')}</TableCell>
                  <TableCell align="right">{t('mto.type2.history.quantity')}</TableCell>
                  <TableCell>{t('mto.type2.history.unit')}</TableCell>
                  <TableCell align="right">{t('mto.type2.history.cost')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {item.managerProductFormula.materials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell>{material.rawMaterialName}</TableCell>
                    <TableCell align="right">{material.quantity}</TableCell>
                    <TableCell>{material.unit}</TableCell>
                    <TableCell align="right">{formatCurrency(material.materialCost)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Craft Categories */}
          <Typography variant="subtitle2" gutterBottom>
            {t('mto.type2.history.requiredCategories')}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {item.managerProductFormula.craftCategories.map((category) => (
              <Chip
                key={category.id}
                icon={<CategoryIcon />}
                label={`${category.categoryName} (Level ${category.categoryLevel})`}
                size="small"
                variant="outlined"
              />
            ))}
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Submission Details */}
        <Box mb={3}>
          <Typography variant="subtitle1" gutterBottom color="primary">
            <LocalShippingIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            {t('mto.type2.history.submissionInfo')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="textSecondary">
                {t('mto.type2.history.quantitySubmitted')}
              </Typography>
              <Typography variant="h6">{item.submission.productNumber}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="textSecondary">
                {t('mto.type2.history.unitPrice')}
              </Typography>
              <Typography variant="h6">{formatCurrency(item.submission.unitPrice)}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="textSecondary">
                {t('mto.type2.history.totalValue')}
              </Typography>
              <Typography variant="h6" color="primary">
                {formatCurrency(item.submission.totalValue)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="textSecondary">
                {t('mto.type2.history.submittedAt')}
              </Typography>
              <Typography variant="body2">{formatDate(item.submission.submittedAt)}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* MALL Facility Information */}
        <Box mb={3}>
          <Typography variant="subtitle1" gutterBottom color="primary">
            {t('mto.type2.history.mallInfo')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="caption" color="textSecondary">
                {t('mto.type2.history.facilityName')}
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {item.mallInfo.facilityName}
              </Typography>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="caption" color="textSecondary">
                {t('mto.type2.history.mallLevel')}
              </Typography>
              <Typography variant="body2">Level {item.mallInfo.mallLevel}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="textSecondary">
                {t('mto.type2.history.tileName')}
              </Typography>
              <Typography variant="body2">{item.mallInfo.tileName}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="textSecondary">
                {t('mto.type2.history.tilePopulation')}
              </Typography>
              <Typography variant="body2">{item.mallInfo.tilePopulation.toLocaleString()}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Settlement Results */}
        <Box mb={3}>
          <Typography variant="subtitle1" gutterBottom color="primary">
            <PaymentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            {t('mto.type2.history.settlementResults')}
          </Typography>

          <Box mb={2}>
            <Chip
              label={item.settlementResults.settlementStatus}
              color={getStatusColor(item.settlementResults.settlementStatus)}
              sx={{ mb: 2 }}
            />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="textSecondary">
                {t('mto.type2.history.settledQuantity')}
              </Typography>
              <Typography variant="h6">
                {item.settlementResults.settledNumber} / {item.submission.productNumber}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="textSecondary">
                {t('mto.type2.history.settledValue')}
              </Typography>
              <Typography variant="h6" color="success.main">
                {formatCurrency(item.settlementResults.settledValue)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="textSecondary">
                {t('mto.type2.history.fulfillmentRate')}
              </Typography>
              <Typography variant="h6">{item.settlementResults.fulfillmentRate}%</Typography>
            </Grid>
            {item.settlementResults.settlementOrder && (
              <Grid item xs={12} md={3}>
                <Typography variant="caption" color="textSecondary">
                  {t('mto.type2.history.settlementOrder')}
                </Typography>
                <Typography variant="h6">#{item.settlementResults.settlementOrder}</Typography>
              </Grid>
            )}
          </Grid>

          {item.settlementResults.settlementDetails && (
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                {t('mto.type2.history.paymentDetails')}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip
                  label={item.settlementResults.settlementDetails.paymentStatus}
                  color={getPaymentStatusColor(item.settlementResults.settlementDetails.paymentStatus)}
                  size="small"
                />
                {item.settlementResults.settlementDetails.paymentTransactionId && (
                  <Typography variant="caption">
                    Transaction: {item.settlementResults.settlementDetails.paymentTransactionId}
                  </Typography>
                )}
              </Stack>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Product Validation (if available) */}
        {item.productValidation && (
          <>
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom color="primary">
                <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                {t('mto.type2.history.formulaValidation')}
              </Typography>

              <Alert
                severity={item.productValidation.formulaValidated ? 'success' : 'error'}
                sx={{ mb: 2 }}
              >
                {item.productValidation.formulaValidated ?
                  t('mto.type2.history.formulaValidatedSuccess') :
                  t('mto.type2.history.formulaValidatedFailed')}
              </Alert>

              {item.productValidation.validationDetails && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Box display="flex" alignItems="center">
                      {item.productValidation.validationDetails.materialsMatch ?
                        <CheckCircleIcon color="success" sx={{ mr: 1 }} /> :
                        <CancelIcon color="error" sx={{ mr: 1 }} />}
                      <Typography variant="body2">
                        {t('mto.type2.history.materialsMatch')}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box display="flex" alignItems="center">
                      {item.productValidation.validationDetails.categoriesMatch ?
                        <CheckCircleIcon color="success" sx={{ mr: 1 }} /> :
                        <CancelIcon color="error" sx={{ mr: 1 }} />}
                      <Typography variant="body2">
                        {t('mto.type2.history.categoriesMatch')}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box display="flex" alignItems="center">
                      {item.productValidation.validationDetails.isFullyCompatible ?
                        <CheckCircleIcon color="success" sx={{ mr: 1 }} /> :
                        <InfoIcon color="warning" sx={{ mr: 1 }} />}
                      <Typography variant="body2">
                        {t('mto.type2.history.fullyCompatible')}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              )}

              {item.productValidation.validationDetails?.materialsDifference &&
               item.productValidation.validationDetails.materialsDifference.length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('mto.type2.history.materialDifferences')}
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('mto.type2.history.material')}</TableCell>
                          <TableCell align="right">{t('mto.type2.history.required')}</TableCell>
                          <TableCell align="right">{t('mto.type2.history.actual')}</TableCell>
                          <TableCell align="right">{t('mto.type2.history.difference')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {item.productValidation.validationDetails.materialsDifference.map((diff) => (
                          <TableRow key={diff.materialId}>
                            <TableCell>{diff.materialName}</TableCell>
                            <TableCell align="right">{diff.requiredQuantity} {diff.unit}</TableCell>
                            <TableCell align="right">{diff.actualQuantity || '-'} {diff.unit}</TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                color={diff.difference === '0' ? 'success.main' : 'error.main'}
                              >
                                {diff.difference || '-'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* Tile Budget Information */}
        <Box>
          <Typography variant="subtitle1" gutterBottom color="primary">
            {t('mto.type2.history.tileBudgetInfo')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="textSecondary">
                {t('mto.type2.history.allocatedBudget')}
              </Typography>
              <Typography variant="body1">
                {formatCurrency(item.tileBudgetInfo.allocatedBudget)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="textSecondary">
                {t('mto.type2.history.spentBudget')}
              </Typography>
              <Typography variant="body1">
                {formatCurrency(item.tileBudgetInfo.spentBudget)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="textSecondary">
                {t('mto.type2.history.remainingBudget')}
              </Typography>
              <Typography variant="body1">
                {formatCurrency(item.tileBudgetInfo.remainingBudget)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="textSecondary">
                {t('mto.type2.history.populationRatio')}
              </Typography>
              <Typography variant="body1">
                {(item.tileBudgetInfo.populationRatio * 100).toFixed(2)}%
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MtoType2SubmissionHistoryModal;