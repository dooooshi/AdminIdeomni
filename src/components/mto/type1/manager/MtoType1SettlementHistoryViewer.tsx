'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
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
  Grid,
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

      let data: MtoType1SettlementHistory[];
      if (mockMode) {
        const { mtoType1MockService } = await import('@/lib/services/mtoType1MockService');
        data = await mtoType1MockService.getSettlementHistory(mtoType1Id);
      } else {
        const response = await MtoType1Service.getSettlementHistory(Number(mtoType1Id));
        data = response;
      }

      setHistory(data.sort((a, b) => a.id - b.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settlement history');
    } finally {
      setLoading(false);
    }
  };

  const toggleTileExpansion = (tileId: string) => {
    const newExpanded = new Set(expandedTiles);
    if (newExpanded.has(tileId)) {
      newExpanded.delete(tileId);
    } else {
      newExpanded.add(tileId);
    }
    setExpandedTiles(newExpanded);
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
    const grouped = new Map<string, MtoType1SettlementHistory[]>();
    history.forEach(step => {
      if (step.tileId) {
        const existing = grouped.get(step.tileId) || [];
        existing.push(step);
        grouped.set(step.tileId, existing);
      }
    });
    return grouped;
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
  const totalProducts = history.reduce((sum, step) => sum + (step.productsSettled || 0), 0);
  const totalPayments = history.reduce((sum, step) => sum + (step.totalPaymentAmount || 0), 0);
  const totalDeliveries = history.reduce((sum, step) => sum + (step.deliveriesProcessed || 0), 0);

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <AssessmentIcon sx={{ mr: 1 }} />
        {t('mto:mtoType1.settlementHistory.title')}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
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
        <Grid item xs={12} md={4}>
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
        <Grid item xs={12} md={4}>
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

      {Array.from(tileGroups.entries()).map(([tileId, tileHistory]) => {
        const tileStart = tileHistory.find(h => h.stepType === 'TILE_PROCESSING_START');
        const tileComplete = tileHistory.find(h => h.stepType === 'TILE_PROCESSING_COMPLETE');
        const deliveryValidation = tileHistory.find(h => h.stepType === 'DELIVERY_VALIDATION');
        const productValidations = tileHistory.filter(h => h.stepType === 'PRODUCT_VALIDATION');
        const paymentProcessing = tileHistory.filter(h => h.stepType === 'PAYMENT_PROCESSING');

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
                    <TimelineOppositeContent color="textSecondary">
                      <Typography variant="caption">
                        Settlement #{step.id}
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
                                  <Grid item xs={4}>
                                    <Typography variant="body2" color="textSecondary">
                                      Validated
                                    </Typography>
                                    <Typography variant="h6">
                                      {step.productsValidated}
                                    </Typography>
                                  </Grid>
                                )}
                                {step.productsSettled !== undefined && (
                                  <Grid item xs={4}>
                                    <Typography variant="body2" color="textSecondary">
                                      Settled
                                    </Typography>
                                    <Typography variant="h6" color="success.main">
                                      {step.productsSettled}
                                    </Typography>
                                  </Grid>
                                )}
                                {step.productsRejected !== undefined && step.productsRejected > 0 && (
                                  <Grid item xs={4}>
                                    <Typography variant="body2" color="textSecondary">
                                      Rejected
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
                                    Validation Details
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
                                Payment Processed: {formatCurrency(step.totalPaymentAmount)}
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
                                Settlement Complete
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