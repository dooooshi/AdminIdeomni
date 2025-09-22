'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  AlertTitle,
  CircularProgress,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import Grid from '@mui/material/Grid';
import {
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Payment as PaymentIcon,
  LocalShipping as ShippingIcon,
  Assessment as AssessmentIcon,
  Timer as TimerIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { MtoType1SettlementHistory } from '@/lib/types/mtoType1';
import MtoType1Service from '@/lib/services/mtoType1Service';

interface Props {
  mtoType1Id: string;
  mockMode?: boolean;
}

interface ValidationDetail {
  productId: string;
  valid: boolean;
  settled?: boolean;
  paymentAmount?: number;
  reason?: string;
  details?: any;
}

const MtoType1SettlementHistoryViewer: React.FC<Props> = ({ mtoType1Id, mockMode = false }) => {
  const { t } = useTranslation(['mto']);
  const [history, setHistory] = useState<MtoType1SettlementHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTiles, setExpandedTiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSettlementHistory();
  }, [mtoType1Id]);

  const loadSettlementHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await MtoType1Service.getSettlementHistory(Number(mtoType1Id));

      // Ensure data is an array before sorting
      const historyArray = Array.isArray(data) ? data : [];
      setHistory(historyArray.sort((a, b) => a.id - b.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('mto:mtoType1.settlementHistory.error'));
    } finally {
      setLoading(false);
    }
  };

  const toggleTileExpansion = (tileId: string) => {
    // Not used since we don't have tileId
  };

  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case 'TILE_PROCESSING_START':
        return <LocationIcon />;
      case 'DELIVERY_VALIDATION':
        return <ShippingIcon />;
      case 'PRODUCT_VALIDATION':
        return <AssessmentIcon />;
      case 'PAYMENT_PROCESSING':
        return <PaymentIcon />;
      case 'TILE_PROCESSING_COMPLETE':
        return <CheckCircleIcon />;
      default:
        return <TimerIcon />;
    }
  };

  const getStepColor = (stepType: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' => {
    switch (stepType) {
      case 'TILE_PROCESSING_START':
        return 'info';
      case 'DELIVERY_VALIDATION':
        return 'primary';
      case 'PRODUCT_VALIDATION':
        return 'secondary';
      case 'PAYMENT_PROCESSING':
        return 'warning';
      case 'TILE_PROCESSING_COMPLETE':
        return 'success';
      default:
        return 'primary';
    }
  };

  const parseValidationDetails = (detailsJson: string | null): ValidationDetail[] => {
    if (!detailsJson) return [];
    try {
      return JSON.parse(detailsJson);
    } catch {
      return [];
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  };

  const groupHistoryByTile = () => {
    // Settlement history doesn't have tileId, return empty map
    return new Map<string, MtoType1SettlementHistory[]>();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        <AlertTitle>{t('mto:mtoType1.settlementHistory.error')}</AlertTitle>
        {error}
      </Alert>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Alert severity="info">
        <AlertTitle>{t('mto:mtoType1.settlementHistory.noHistory')}</AlertTitle>
        {t('mto:mtoType1.settlementHistory.noHistoryDescription')}
      </Alert>
    );
  }

  const tileGroups = groupHistoryByTile();
  const totalProducts = history.reduce((sum, step) => sum + (step.totalSettledQuantity || 0), 0);
  const totalPayments = history.reduce((sum, step) => sum + (step.totalSettlementAmount || 0), 0);
  const totalDeliveries = history.reduce((sum, step) => sum + (step.totalDeliveries || 0), 0);

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <AssessmentIcon sx={{ mr: 1 }} />
        {t('mto:mtoType1.settlementHistory.title')}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {t('mto:mtoType1.settlementHistory.totalTiles')}
              </Typography>
              <Typography variant="h4" color="primary">
                {tileGroups.size}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {t('mto:mtoType1.settlementHistory.totalProducts')}
              </Typography>
              <Typography variant="h4" color="success.main">
                {formatNumber(totalProducts)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {t('mto:mtoType1.settlementHistory.totalPayments')}
              </Typography>
              <Typography variant="h4" color="warning.main">
                {formatCurrency(totalPayments)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tile groups feature disabled - MtoType1SettlementHistory doesn't have tileId */}
      {false && Array.from(tileGroups.entries()).map(([tileId, tileHistory]: [any, any]) => {
        // Properties like stepType, tileName etc don't exist in MtoType1SettlementHistory
        const tileStart: any = undefined;
        const tileComplete: any = undefined;
        const deliveryValidation: any = undefined;
        const productValidations: any = [];
        const paymentProcessing: any = [];
        const isExpanded = expandedTiles.has(tileId);

        return (
          <Accordion
            key={tileId}
            expanded={isExpanded}
            onChange={() => toggleTileExpansion(tileId)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  {tileStart?.tileName || `Tile ${tileId}`}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {tileStart?.tileRequirement && (
                    <Chip
                      label={`Requirement: ${formatNumber(tileStart.tileRequirement)}`}
                      color="info"
                      size="small"
                    />
                  )}
                  {deliveryValidation?.deliveriesProcessed && (
                    <Chip
                      icon={<GroupIcon />}
                      label={`${deliveryValidation.deliveriesProcessed} Deliveries`}
                      color="primary"
                      size="small"
                    />
                  )}
                  {tileComplete?.productsSettled !== undefined && (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label={`${formatNumber(tileComplete.productsSettled)} Settled`}
                      color="success"
                      size="small"
                    />
                  )}
                  {tileComplete?.processingDuration && (
                    <Chip
                      icon={<TimerIcon />}
                      label={formatDuration(tileComplete.processingDuration)}
                      size="small"
                    />
                  )}
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Timeline position="alternate">
                {tileHistory.map((step, index) => (
                  <TimelineItem key={step.id}>
                    <TimelineOppositeContent>
                      <Typography variant="caption">
                        {t('mto:mtoType1.settlementHistory.settlementNumber', { id: step.id })}
                      </Typography>
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color={getStepColor(step.stepType)}>
                        {getStepIcon(step.stepType)}
                      </TimelineDot>
                      {index < tileHistory.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {step.stepDescription}
                          </Typography>

                          {step.stepType === 'PRODUCT_VALIDATION' && (
                            <Box mt={2}>
                              <Grid container spacing={1}>
                                {step.productsValidated !== undefined && (
                                  <Grid size={{ xs: 4 }}>
                                    <Typography variant="body2" color="textSecondary">
                                      {t('mto:mtoType1.settlementHistory.validated')}
                                    </Typography>
                                    <Typography variant="h6">
                                      {step.productsValidated}
                                    </Typography>
                                  </Grid>
                                )}
                                {step.productsSettled !== undefined && (
                                  <Grid size={{ xs: 4 }}>
                                    <Typography variant="body2" color="textSecondary">
                                      {t('mto:mtoType1.settlementHistory.settled')}
                                    </Typography>
                                    <Typography variant="h6" color="success.main">
                                      {step.productsSettled}
                                    </Typography>
                                  </Grid>
                                )}
                                {step.productsRejected !== undefined && step.productsRejected > 0 && (
                                  <Grid size={{ xs: 4 }}>
                                    <Typography variant="body2" color="textSecondary">
                                      {t('mto:mtoType1.settlementHistory.rejected')}
                                    </Typography>
                                    <Typography variant="h6" color="error">
                                      {step.productsRejected}
                                    </Typography>
                                  </Grid>
                                )}
                              </Grid>

                              {step.validationDetails && (
                                <Box mt={2}>
                                  <Typography variant="caption" color="textSecondary">
                                    {t('mto:mtoType1.settlementHistory.validationDetails')}
                                  </Typography>
                                  {parseValidationDetails(step.validationDetails).map((detail, idx) => (
                                    <Box key={idx} sx={{ mt: 1 }}>
                                      <Chip
                                        icon={detail.valid ? <CheckCircleIcon /> : <CancelIcon />}
                                        label={`Product ${idx + 1}: ${detail.valid ? 'Valid' : detail.reason || 'Invalid'}`}
                                        color={detail.valid ? 'success' : 'error'}
                                        size="small"
                                        sx={{ mr: 1 }}
                                      />
                                      {detail.paymentAmount && (
                                        <Typography variant="caption" color="success.main">
                                          {formatCurrency(detail.paymentAmount)}
                                        </Typography>
                                      )}
                                    </Box>
                                  ))}
                                </Box>
                              )}
                            </Box>
                          )}

                          {step.stepType === 'PAYMENT_PROCESSING' && step.totalPaymentAmount && (
                            <Alert severity="success" variant="outlined" sx={{ mt: 2 }}>
                              <Typography variant="body2">
                                {t('mto:mtoType1.settlementHistory.paymentProcessed')}: {formatCurrency(step.totalPaymentAmount)}
                              </Typography>
                            </Alert>
                          )}

                          {step.stepType === 'TILE_PROCESSING_COMPLETE' && (
                            <Box mt={2}>
                              <LinearProgress
                                variant="determinate"
                                value={100}
                                color="success"
                                sx={{ mb: 1 }}
                              />
                              <Typography variant="body2" color="success.main">
                                {t('mto:mtoType1.settlementHistory.settlementComplete')}
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default MtoType1SettlementHistoryViewer;