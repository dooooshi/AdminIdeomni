import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Tooltip,
  IconButton,
  InputAdornment,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Send as SendIcon,
  Preview as PreviewIcon,
  Calculate as CalculateIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Store as StoreIcon,
  AttachMoney as AttachMoneyIcon,
  TrendingUp as TrendingUpIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

import {
  MtoType2MallOwnerView,
  MtoType2SubmissionRequest,
  MtoType2CompetitorAnalysis,
} from '@/lib/types/mtoType2';
import { MtoType2Service } from '@/lib/services/mtoType2Service';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { useToast } from '@/components/common/ToastProvider';

interface MtoType2SubmissionFormProps {
  requirement: MtoType2MallOwnerView;
  onSubmissionCreated?: () => void;
  onClose?: () => void;
}

interface FormData {
  mallFacilitySpaceId: number;
  productQuantity: number;
  unitPrice: number;
}

interface FormErrors {
  mallFacilitySpaceId?: string;
  productQuantity?: string;
  unitPrice?: string;
}

export const MtoType2SubmissionForm: React.FC<MtoType2SubmissionFormProps> = ({
  requirement,
  onSubmissionCreated,
  onClose,
}) => {
  const { t } = useTranslation();
  const { showSuccess, showError, showWarning } = useToast();

  const [formData, setFormData] = useState<FormData>({
    mallFacilitySpaceId: 0,
    productQuantity: 0,
    unitPrice: 0,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [competitorAnalysis, setCompetitorAnalysis] = useState<MtoType2CompetitorAnalysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [selectedMall, setSelectedMall] = useState<typeof requirement.myMalls[0] | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.mallFacilitySpaceId || formData.mallFacilitySpaceId <= 0) {
      newErrors.mallFacilitySpaceId = 'Please select a MALL facility';
    }

    if (!formData.productQuantity || formData.productQuantity <= 0) {
      newErrors.productQuantity = 'Product quantity must be greater than 0';
    }

    if (!formData.unitPrice || formData.unitPrice <= 0) {
      newErrors.unitPrice = 'Unit price must be greater than 0';
    }

    // Validate against estimated budget
    if (selectedMall && formData.productQuantity > 0 && formData.unitPrice > 0) {
      const totalValue = formData.productQuantity * formData.unitPrice;
      if (totalValue > selectedMall.estimatedBudgetShare) {
        newErrors.productQuantity = `Total value ($${totalValue.toLocaleString()}) exceeds estimated budget share ($${selectedMall.estimatedBudgetShare.toLocaleString()})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMallSelection = async (mallId: number) => {
    const mall = requirement.myMalls.find(m => m.mallId === mallId);
    if (!mall) return;

    setSelectedMall(mall);
    setFormData(prev => ({ ...prev, mallFacilitySpaceId: mallId }));

    // Load competitor analysis for this tile
    try {
      setLoadingAnalysis(true);
      const analysis = await MtoType2Service.getCompetitorAnalysis(requirement.requirementId, mall.tileId);
      setCompetitorAnalysis(analysis);
    } catch (error) {
      console.error('Error loading competitor analysis:', error);
      // Don't show error for competitor analysis as it's supplementary info
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const calculateTotalValue = () => {
    return formData.productQuantity * formData.unitPrice;
  };

  const calculateExpectedRevenue = () => {
    if (!selectedMall) return 0;
    const totalValue = calculateTotalValue();
    const budgetShare = selectedMall.estimatedBudgetShare;
    return Math.min(totalValue, budgetShare);
  };

  const getCompetitivenessLevel = () => {
    if (!competitorAnalysis || !formData.unitPrice) return null;

    const { recommendedStrategy } = competitorAnalysis;
    if (!recommendedStrategy) return null;

    if (formData.unitPrice <= recommendedStrategy.priceRange.min) {
      return { level: 'High', color: 'success' as const };
    } else if (formData.unitPrice <= recommendedStrategy.priceRange.max) {
      return { level: 'Medium', color: 'warning' as const };
    } else {
      return { level: 'Low', color: 'error' as const };
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showError('Please fix form validation errors');
      return;
    }

    try {
      setLoading(true);

      const submissionData: MtoType2SubmissionRequest = {
        requirementId: requirement.requirementId,
        productQuantity: formData.productQuantity,
        unitPrice: formData.unitPrice,
        mallFacilitySpaceId: formData.mallFacilitySpaceId,
      };

      await MtoType2Service.createSubmission(submissionData);
      showSuccess('Submission created successfully');
      onSubmissionCreated?.();
      onClose?.();
    } catch (error) {
      console.error('Error creating submission:', error);
      showError('Failed to create submission', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const competitivenessInfo = getCompetitivenessLevel();

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Card>
        <CardHeader
          title="Create Product Submission"
          subheader={`${requirement.requirementName || `Requirement ${requirement.requirementId}`} - Total Budget: $${requirement.totalBudget.toLocaleString()}`}
          action={
            onClose && (
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            )
          }
        />
        <CardContent>
          <Grid container spacing={3}>
            {/* MALL Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.mallFacilitySpaceId}>
                <InputLabel>Select Your MALL</InputLabel>
                <Select
                  value={formData.mallFacilitySpaceId}
                  onChange={(e) => handleMallSelection(e.target.value as number)}
                  label="Select Your MALL"
                >
                  {requirement.myMalls.map((mall) => (
                    <MenuItem key={mall.mallId} value={mall.mallId}>
                      <Box display="flex" justifyContent="space-between" width="100%">
                        <Typography>
                          Tile {mall.tileId} - Level {mall.level}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Budget: ${mall.estimatedBudgetShare.toLocaleString()}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.mallFacilitySpaceId && (
                  <Typography variant="caption" color="error">
                    {errors.mallFacilitySpaceId}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Selected MALL Info */}
            {selectedMall && (
              <Grid item xs={12}>
                <Alert severity="info" icon={<StoreIcon />}>
                  <Typography variant="subtitle2" gutterBottom>
                    MALL Information
                  </Typography>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    <Chip
                      label={`Tile ${selectedMall.tileId}`}
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      label={`Level ${selectedMall.level}`}
                      color="primary"
                      size="small"
                    />
                    <Chip
                      label={`Population: ${selectedMall.population.toLocaleString()}`}
                      color="secondary"
                      size="small"
                    />
                    <Chip
                      label={`Competitors: ${selectedMall.competitorCount}`}
                      color={selectedMall.competitorCount > 5 ? 'error' : selectedMall.competitorCount > 2 ? 'warning' : 'success'}
                      size="small"
                    />
                  </Box>
                </Alert>
              </Grid>
            )}

            {/* Product Quantity */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Product Quantity"
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
              />
            </Grid>

            {/* Unit Price */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Unit Price"
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
              />
            </Grid>

            {/* Calculation Summary */}
            {formData.productQuantity > 0 && formData.unitPrice > 0 && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Submission Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Box textAlign="center">
                          <Typography variant="h6" color="primary">
                            ${calculateTotalValue().toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Total Value
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box textAlign="center">
                          <Typography variant="h6" color="success.main">
                            ${calculateExpectedRevenue().toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Expected Revenue
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box textAlign="center">
                          {competitivenessInfo && (
                            <Chip
                              label={`${competitivenessInfo.level} Competitiveness`}
                              color={competitivenessInfo.color}
                              size="small"
                            />
                          )}
                          <Typography variant="caption" display="block" color="textSecondary">
                            Market Position
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Competitor Analysis */}
            {competitorAnalysis && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardHeader
                    title="Competitor Analysis"
                    avatar={<TrendingUpIcon />}
                    titleTypographyProps={{ variant: 'subtitle2' }}
                  />
                  <CardContent>
                    {loadingAnalysis ? (
                      <Box display="flex" justifyContent="center" p={2}>
                        <CircularProgress size={24} />
                      </Box>
                    ) : (
                      <>
                        <Box display="flex" gap={2} mb={2}>
                          <Chip
                            label={`${competitorAnalysis.competitors.length} Competitors`}
                            variant="outlined"
                            size="small"
                          />
                          <Chip
                            label={`${competitorAnalysis.estimatedCompetition} Competition`}
                            color={
                              competitorAnalysis.estimatedCompetition === 'HIGH' ? 'error' :
                              competitorAnalysis.estimatedCompetition === 'MEDIUM' ? 'warning' :
                              'success'
                            }
                            size="small"
                          />
                        </Box>

                        {competitorAnalysis.recommendedStrategy && (
                          <Alert severity="info" sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Recommended Strategy
                            </Typography>
                            <Typography variant="body2">
                              Price Range: ${competitorAnalysis.recommendedStrategy.priceRange.min.toLocaleString()} - ${competitorAnalysis.recommendedStrategy.priceRange.max.toLocaleString()}
                            </Typography>
                            <Typography variant="body2">
                              Quantity Range: {competitorAnalysis.recommendedStrategy.quantityRange.min.toLocaleString()} - {competitorAnalysis.recommendedStrategy.quantityRange.max.toLocaleString()}
                            </Typography>
                            <Typography variant="body2">
                              Confidence: {(competitorAnalysis.recommendedStrategy.confidence * 100).toFixed(0)}%
                            </Typography>
                          </Alert>
                        )}

                        <TableContainer component={Paper} elevation={0}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Team</TableCell>
                                <TableCell>MALL Level</TableCell>
                                <TableCell align="right">Avg Price</TableCell>
                                <TableCell align="right">Success Rate</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {competitorAnalysis.competitors.map((competitor) => (
                                <TableRow key={competitor.teamId}>
                                  <TableCell>{competitor.teamName || competitor.teamId}</TableCell>
                                  <TableCell>
                                    <Chip label={competitor.mallLevel} size="small" />
                                  </TableCell>
                                  <TableCell align="right">
                                    {competitor.historicalPerformance
                                      ? `$${competitor.historicalPerformance.averagePrice.toLocaleString()}`
                                      : 'N/A'
                                    }
                                  </TableCell>
                                  <TableCell align="right">
                                    {competitor.historicalPerformance
                                      ? `${(competitor.historicalPerformance.successRate * 100).toFixed(0)}%`
                                      : 'N/A'
                                    }
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Market Insights */}
            {requirement.marketInsights && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="subtitle2" gutterBottom>
                    Market Insights
                  </Typography>
                  <Typography variant="body2">
                    Participating MALLs: {requirement.marketInsights.participatingMalls}
                  </Typography>
                  <Typography variant="body2">
                    Average Submission Size: {requirement.marketInsights.averageSubmissionSize.toLocaleString()}
                  </Typography>
                  {requirement.marketInsights.priceRange && (
                    <Typography variant="body2">
                      Price Range: ${requirement.marketInsights.priceRange.min.toLocaleString()} - ${requirement.marketInsights.priceRange.max.toLocaleString()} (Median: ${requirement.marketInsights.priceRange.median.toLocaleString()})
                    </Typography>
                  )}
                </Alert>
              </Grid>
            )}

            {/* Warnings */}
            {selectedMall && calculateTotalValue() > selectedMall.estimatedBudgetShare && (
              <Grid item xs={12}>
                <Alert severity="warning" icon={<WarningIcon />}>
                  Your submission value exceeds the estimated budget share for this tile.
                  Consider reducing quantity or price to improve settlement chances.
                </Alert>
              </Grid>
            )}

            {competitorAnalysis?.estimatedCompetition === 'HIGH' && (
              <Grid item xs={12}>
                <Alert severity="warning">
                  High competition detected in this tile. Consider competitive pricing to improve your chances.
                </Alert>
              </Grid>
            )}

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" gap={2} justifyContent="flex-end">
                {onClose && (
                  <Button
                    variant="outlined"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  variant="outlined"
                  startIcon={<PreviewIcon />}
                  onClick={() => setPreviewOpen(true)}
                  disabled={!validateForm() || loading}
                >
                  Preview
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SendIcon />}
                  onClick={handleSubmit}
                  disabled={loading || !validateForm()}
                >
                  {loading ? <CircularProgress size={20} /> : 'Submit'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Submission Preview</DialogTitle>
        <DialogContent>
          {selectedMall && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">MALL:</Typography>
                  <Typography variant="body2">
                    Tile {selectedMall.tileId}, Level {selectedMall.level}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Quantity:</Typography>
                  <Typography variant="body2">
                    {formData.productQuantity.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Unit Price:</Typography>
                  <Typography variant="body2">
                    ${formData.unitPrice.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Total Value:</Typography>
                  <Typography variant="body2" color="primary" fontWeight="bold">
                    ${calculateTotalValue().toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Expected Revenue:</Typography>
                  <Typography variant="body2" color="success.main" fontWeight="bold">
                    ${calculateExpectedRevenue().toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Competition Level:</Typography>
                  <Typography variant="body2">
                    {selectedMall.competitorCount} competitors
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>
            Close
          </Button>
          <Button
            onClick={() => {
              setPreviewOpen(false);
              handleSubmit();
            }}
            variant="contained"
            disabled={loading}
          >
            Confirm & Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MtoType2SubmissionForm;