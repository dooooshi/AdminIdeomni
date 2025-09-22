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
  Stack,
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
  Group as GroupIcon,
  PlayArrow as StartIcon,
  Stop as CompleteIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { format, parseISO } from 'date-fns';
import {
  MtoType1SettlementHistoryResponse,
  MtoType1SettlementHistoryStep,
  MtoType1SettlementHistorySummary
} from '@/lib/types/mtoType1';
import MtoType1Service from '@/lib/services/mtoType1Service';

interface Props {
  mtoType1Id: string;
  mockMode?: boolean;
}

const MtoType1SettlementHistoryViewerV2: React.FC<Props> = ({ mtoType1Id, mockMode = false }) => {
  const { t } = useTranslation();
  const [historyData, setHistoryData] = useState<MtoType1SettlementHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadSettlementHistory();
  }, [mtoType1Id]);

  const loadSettlementHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await MtoType1Service.getSettlementHistoryV2(Number(mtoType1Id));
      setHistoryData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('mto.type1.settlementHistory.error'));
    } finally {
      setLoading(false);
    }
  };

  const toggleStepExpansion = (stepNumber: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepNumber)) {
      newExpanded.delete(stepNumber);
    } else {
      newExpanded.add(stepNumber);
    }
    setExpandedSteps(newExpanded);
  };

  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case 'SETTLEMENT_INITIATED':
        return <StartIcon />;
      case 'SETTLEMENT_COMPLETED':
        return <CompleteIcon />;
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

  const getStepColor = (stepType: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'grey' => {
    switch (stepType) {
      case 'SETTLEMENT_INITIATED':
        return 'info';
      case 'SETTLEMENT_COMPLETED':
        return 'success';
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
        return 'grey';
    }
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case 'PENDING':
        return 'default';
      case 'IN_PROGRESS':
        return 'warning';
      case 'SETTLED':
        return 'success';
      case 'FAILED':
        return 'error';
      default:
        return 'default';
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
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(parseISO(timestamp), 'MMM dd, yyyy HH:mm:ss');
    } catch {
      return timestamp;
    }
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
        <AlertTitle>{t('mto.type1.settlementHistory.error')}</AlertTitle>
        {error}
      </Alert>
    );
  }

  if (!historyData) {
    return (
      <Alert severity="info">
        <AlertTitle>{t('mto.type1.settlementHistory.noHistory')}</AlertTitle>
        {t('mto.type1.settlementHistory.noHistoryDescription')}
      </Alert>
    );
  }

  const { summary, steps, settlementStatus, settlementStarted, settlementCompleted, totalSteps } = historyData;

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <AssessmentIcon sx={{ mr: 1 }} />
        {t('mto.type1.settlementHistory.title')}
      </Typography>

      {/* Settlement Status */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                {t('mto.type1.settlementHistory.settlementStatus')}
              </Typography>
              <Chip
                label={settlementStatus}
                color={getStatusColor(settlementStatus)}
                size="medium"
                sx={{ mt: 0.5 }}
              />
            </Box>
            <Box textAlign="center">
              <Typography variant="subtitle2" color="textSecondary">
                {t('mto.type1.settlementHistory.started')}
              </Typography>
              <Typography variant="body1">
                {formatTimestamp(settlementStarted)}
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="subtitle2" color="textSecondary">
                {t('mto.type1.settlementHistory.completed')}
              </Typography>
              <Typography variant="body1">
                {settlementCompleted ? formatTimestamp(settlementCompleted) : '-'}
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="subtitle2" color="textSecondary">
                {t('mto.type1.settlementHistory.totalSteps')}
              </Typography>
              <Typography variant="h6" color="primary">
                {totalSteps}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                {t('mto.type1.settlementHistory.totalTilesProcessed')}
              </Typography>
              <Typography variant="h4" color="primary">
                {formatNumber(summary.totalTilesProcessed)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                {t('mto.type1.settlementHistory.productsValidated')}
              </Typography>
              <Typography variant="h4" color="info.main">
                {formatNumber(summary.totalProductsValidated)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                {t('mto.type1.settlementHistory.productsSettled')}
              </Typography>
              <Typography variant="h4" color="success.main">
                {formatNumber(summary.totalProductsSettled)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                {t('mto.type1.settlementHistory.productsRejected')}
              </Typography>
              <Typography variant="h4" color={summary.totalProductsRejected > 0 ? 'error.main' : 'text.secondary'}>
                {formatNumber(summary.totalProductsRejected)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                {t('mto.type1.settlementHistory.deliveriesProcessed')}
              </Typography>
              <Typography variant="h5">
                {formatNumber(summary.totalDeliveriesProcessed)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                {t('mto.type1.settlementHistory.paymentsProcessed')}
              </Typography>
              <Typography variant="h5" color="warning.main">
                {formatNumber(summary.totalPaymentsProcessed)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                {t('mto.type1.settlementHistory.processingTime')}
              </Typography>
              <Typography variant="h5">
                {formatDuration(summary.totalProcessingTime)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Settlement Steps Timeline */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          {t('mto.type1.settlementHistory.settlementProcessTimeline')}
        </Typography>

        <Timeline position="alternate">
          {steps.map((step, index) => {
            const isExpanded = expandedSteps.has(step.step);
            const hasDetails = step.productsValidated > 0 || step.productsSettled > 0 || step.productsRejected > 0;

            return (
              <TimelineItem key={step.step}>
                <TimelineOppositeContent sx={{ m: 'auto 0' }}>
                  <Typography variant="caption" color="textSecondary">
                    {t('mto.type1.settlementHistory.step')} {step.step}
                  </Typography>
                  <Typography variant="body2">
                    {formatTimestamp(step.timestamp)}
                  </Typography>
                </TimelineOppositeContent>

                <TimelineSeparator>
                  <TimelineConnector sx={{ bgcolor: index === 0 ? 'transparent' : 'grey.300' }} />
                  <TimelineDot color={getStepColor(step.stepType)}>
                    {getStepIcon(step.stepType)}
                  </TimelineDot>
                  <TimelineConnector sx={{ bgcolor: index === steps.length - 1 ? 'transparent' : 'grey.300' }} />
                </TimelineSeparator>

                <TimelineContent sx={{ py: '12px', px: 2 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      cursor: hasDetails ? 'pointer' : 'default',
                      '&:hover': hasDetails ? { boxShadow: 2 } : {}
                    }}
                    onClick={() => hasDetails && toggleStepExpansion(step.step)}
                  >
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box flex={1}>
                          <Typography variant="subtitle1" component="span" fontWeight="bold">
                            {step.stepDescription}
                          </Typography>
                          {step.tileName && (
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                              <LocationIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                              {step.tileName}
                            </Typography>
                          )}
                        </Box>
                        {hasDetails && (
                          <ExpandMoreIcon
                            sx={{
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.3s'
                            }}
                          />
                        )}
                      </Stack>

                      {/* Quick Stats */}
                      {hasDetails && (
                        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                          {step.productsValidated > 0 && (
                            <Chip
                              size="small"
                              label={`${t('mto.type1.settlementHistory.validated')}: ${step.productsValidated}`}
                              color="info"
                              variant="outlined"
                            />
                          )}
                          {step.productsSettled > 0 && (
                            <Chip
                              size="small"
                              label={`${t('mto.type1.settlementHistory.settled')}: ${step.productsSettled}`}
                              color="success"
                              variant="outlined"
                            />
                          )}
                          {step.productsRejected > 0 && (
                            <Chip
                              size="small"
                              label={`${t('mto.type1.settlementHistory.rejected')}: ${step.productsRejected}`}
                              color="error"
                              variant="outlined"
                            />
                          )}
                          {step.processingDuration && (
                            <Chip
                              size="small"
                              icon={<TimerIcon />}
                              label={formatDuration(step.processingDuration)}
                              variant="outlined"
                            />
                          )}
                        </Stack>
                      )}

                      {/* Expanded Details */}
                      {isExpanded && step.validationDetails && (
                        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            {t('mto.type1.settlementHistory.validationDetails')}
                          </Typography>
                          <Box sx={{
                            mt: 1,
                            p: 1,
                            bgcolor: 'grey.50',
                            borderRadius: 1,
                            maxHeight: 200,
                            overflow: 'auto'
                          }}>
                            <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                              {JSON.stringify(JSON.parse(step.validationDetails), null, 2)}
                            </pre>
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </TimelineContent>
              </TimelineItem>
            );
          })}
        </Timeline>
      </Paper>
    </Box>
  );
};

export default MtoType1SettlementHistoryViewerV2;