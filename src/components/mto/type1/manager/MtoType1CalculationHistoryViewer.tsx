'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Collapse,
  IconButton,
  Alert,
  AlertTitle,
  CircularProgress,
  Button,
  Divider
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Calculate as CalculateIcon,
  CheckCircle as CheckCircleIcon,
  RemoveCircle as RemoveCircleIcon,
  Info as InfoIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { MtoType1CalculationHistory } from '@/lib/types/mtoType1';
import MtoType1Service from '@/lib/services/mtoType1Service';

interface Props {
  mtoType1Id: string;
  mockMode?: boolean;
}

interface ParsedTileAdjustment {
  tileId: string;
  tileName: string;
  population: number;
  initialReq: number;
  adjustedReq: number;
  reason: string;
}

const MtoType1CalculationHistoryViewer: React.FC<Props> = ({ mtoType1Id, mockMode = false }) => {
  const { t } = useTranslation(['mto']);
  const [history, setHistory] = useState<MtoType1CalculationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    loadCalculationHistory();
  }, [mtoType1Id]);

  const loadCalculationHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await MtoType1Service.getCalculationHistory(Number(mtoType1Id));

      // Ensure data is an array before sorting
      const historyArray = Array.isArray(data) ? data : [];
      setHistory(historyArray.sort((a, b) => a.id - b.id));
      setActiveStep(historyArray.length - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('mto:mtoType1.calculationHistory.error'));
    } finally {
      setLoading(false);
    }
  };

  const toggleStepExpansion = (step: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(step)) {
      newExpanded.delete(step);
    } else {
      newExpanded.add(step);
    }
    setExpandedSteps(newExpanded);
  };

  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case 'INITIAL_CALCULATION':
        return <CalculateIcon />;
      case 'BUDGET_CONSTRAINT_CHECK':
        return <InfoIcon />;
      case 'TILE_ELIMINATION':
        return <RemoveCircleIcon color="warning" />;
      case 'FINAL_DISTRIBUTION':
        return <CheckCircleIcon color="success" />;
      default:
        return <TimelineIcon />;
    }
  };

  const getStepColor = (stepType: string) => {
    switch (stepType) {
      case 'INITIAL_CALCULATION':
        return 'primary';
      case 'BUDGET_CONSTRAINT_CHECK':
        return 'info';
      case 'TILE_ELIMINATION':
        return 'warning';
      case 'FINAL_DISTRIBUTION':
        return 'success';
      default:
        return 'default';
    }
  };

  const parseTileAdjustments = (adjustmentsJson: string | null): ParsedTileAdjustment[] => {
    if (!adjustmentsJson) return [];
    try {
      return JSON.parse(adjustmentsJson);
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
        <AlertTitle>{t('mto:mtoType1.calculationHistory.error')}</AlertTitle>
        {error}
      </Alert>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Alert severity="info">
        <AlertTitle>{t('mto:mtoType1.calculationHistory.noHistory')}</AlertTitle>
        {t('mto:mtoType1.calculationHistory.noHistoryDescription')}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <TimelineIcon sx={{ mr: 1 }} />
        {t('mto:mtoType1.calculationHistory.title')}
      </Typography>

      <Stepper activeStep={activeStep} orientation="vertical">
        {history.map((step, index) => {
          const isExpanded = expandedSteps.has(index);
          const tileAdjustments = step.details?.tileCalculations || [];

          return (
            <Step key={step.id} expanded={true}>
              <StepLabel
                StepIconComponent={() => getStepIcon(step.calculationType || 'INITIAL')}
                optional={
                  <Typography variant="caption">
                    {t('mto:mtoType1.calculationHistory.step')} {step.id}
                  </Typography>
                }
              >
                <Box display="flex" alignItems="center">
                  <Typography variant="subtitle1" fontWeight="bold">
                    {t('mto:mtoType1.calculationHistory.calculationNumber', { id: step.id })}
                  </Typography>
                  {step.calculationType && (
                    <Chip
                      label={step.calculationType.replace(/_/g, ' ')}
                      color={getStepColor(step.calculationType) as any}
                      size="small"
                      sx={{ ml: 2 }}
                    />
                  )}
                </Box>
              </StepLabel>
              <StepContent>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" color="textSecondary">
                          {t('mto:mtoType1.calculationHistory.initialRequirement')}
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {formatNumber(step.totalCalculatedRequirement || 0)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" color="textSecondary">
                          {t('mto:mtoType1.calculationHistory.adjustedRequirement')}
                        </Typography>
                        <Typography variant="h6" color={step.calculationType === 'ADJUSTMENT' ? 'warning.main' : 'primary'}>
                          {formatNumber(step.totalAdjustedRequirement || 0)}
                        </Typography>
                      </Grid>
                      {step.excludedTiles > 0 && (
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2" color="textSecondary">
                            {t('mto:mtoType1.calculationHistory.tilesEliminated')}
                          </Typography>
                          <Typography variant="h6" color="error">
                            {step.excludedTiles}
                          </Typography>
                        </Grid>
                      )}
                      {step.adjustmentReason && (
                        <Grid item xs={12}>
                          <Alert severity="info" variant="outlined">
                            <Typography variant="body2">
                              {step.adjustmentReason}
                            </Typography>
                          </Alert>
                        </Grid>
                      )}
                    </Grid>

                    {tileAdjustments.length > 0 && (
                      <Box mt={2}>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Typography variant="subtitle2" color="textSecondary">
                            {t('mto:mtoType1.calculationHistory.tileDetails')}
                          </Typography>
                          <IconButton size="small" onClick={() => toggleStepExpansion(index)}>
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </Box>

                        <Collapse in={isExpanded}>
                          <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell align="center">{t('mto:mtoType1.calculationHistory.tileName')}</TableCell>
                                  <TableCell align="center">{t('mto:mtoType1.calculationHistory.population')}</TableCell>
                                  <TableCell align="center">{t('mto:mtoType1.calculationHistory.initial')}</TableCell>
                                  <TableCell align="center">{t('mto:mtoType1.calculationHistory.adjusted')}</TableCell>
                                  <TableCell align="center">{t('mto:mtoType1.calculationHistory.reason')}</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {tileAdjustments.map((tile, tileIndex) => (
                                  <TableRow
                                    key={`${tile.tileId}-${tileIndex}`}
                                    sx={{
                                      backgroundColor: tile.excluded ? 'error.light' : 'transparent',
                                      opacity: tile.excluded ? 0.7 : 1
                                    }}
                                  >
                                    <TableCell align="center">
                                      <Typography variant="body2" fontWeight="medium">
                                        {t('mto:mtoType1.calculationHistory.tile', { id: tile.tileId })}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="center">{formatNumber(tile.population)}</TableCell>
                                    <TableCell align="center">{formatNumber(tile.calculated)}</TableCell>
                                    <TableCell align="center">
                                      {tile.excluded ? (
                                        <Chip label={t('mto:mtoType1.calculationHistory.excluded')} color="error" size="small" />
                                      ) : (
                                        formatNumber(tile.adjusted)
                                      )}
                                    </TableCell>
                                    <TableCell align="center">
                                      <Typography variant="caption" color={tile.excluded ? 'error' : 'textSecondary'}>
                                        {tile.excluded ? t('mto:mtoType1.calculationHistory.excluded') : t('mto:mtoType1.calculationHistory.active')}
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Collapse>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </StepContent>
            </Step>
          );
        })}
      </Stepper>

      <Box mt={3} display="flex" justifyContent="center">
        <Button
          variant="contained"
          onClick={() => setActiveStep(history.length - 1)}
          disabled={activeStep === history.length - 1}
        >
          {t('mto:mtoType1.calculationHistory.showFinal')}
        </Button>
      </Box>
    </Box>
  );
};

export default MtoType1CalculationHistoryViewer;