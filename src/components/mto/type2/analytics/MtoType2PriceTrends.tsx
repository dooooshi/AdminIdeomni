'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Chip,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as FlatIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Timeline as TimelineIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { MtoType2Service } from '@/lib/services/mtoType2Service';
import { MtoType2PriceTrend } from '@/lib/types/mtoType2';
import { useToast } from '@/components/common/ToastProvider';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

interface MtoType2PriceTrendsProps {
  activityId: string;
  formulaId?: number;
}

const MtoType2PriceTrends: React.FC<MtoType2PriceTrendsProps> = ({
  activityId,
  formulaId: initialFormulaId
}) => {
  const { t } = useTranslation();
  const { showError } = useToast();

  const [loading, setLoading] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState<number>(initialFormulaId || 0);
  const [formulas, setFormulas] = useState<Array<{ id: number; name: string }>>([]);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [priceTrend, setPriceTrend] = useState<MtoType2PriceTrend | null>(null);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  const loadFormulas = async () => {
    try {
      const data = await MtoType2Service.getManagerFormulas(activityId);
      setFormulas(data);
      if (data.length > 0 && !selectedFormula) {
        setSelectedFormula(data[0].id);
      }
    } catch (error: any) {
      showError(t('mto.type2.errors.loadFormulas'));
    }
  };

  const loadPriceTrends = async () => {
    if (!selectedFormula) return;

    setLoading(true);
    try {
      const data = await MtoType2Service.getPriceTrends(selectedFormula, period);
      setPriceTrend(data);
    } catch (error: any) {
      showError(t('mto.type2.errors.loadPriceTrends'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFormulas();
  }, [activityId]);

  useEffect(() => {
    if (selectedFormula) {
      loadPriceTrends();
    }
  }, [selectedFormula, period]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'INCREASING': return <TrendingUpIcon color="success" />;
      case 'DECREASING': return <TrendingDownIcon color="error" />;
      case 'STABLE': return <FlatIcon color="info" />;
      default: return null;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'INCREASING': return 'success';
      case 'DECREASING': return 'error';
      case 'STABLE': return 'info';
      default: return 'default';
    }
  };

  const formatPercentChange = (change: number) => {
    const prefix = change > 0 ? '+' : '';
    return `${prefix}${change.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  // Prepare chart data
  const chartData = priceTrend ? {
    labels: priceTrend.trends.map(t => new Date(t.date).toLocaleDateString()),
    datasets: [
      {
        label: t('mto.type2.priceTrends.averagePrice'),
        data: priceTrend.trends.map(t => t.averagePrice),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
        fill: false
      },
      {
        label: t('mto.type2.priceTrends.maxPrice'),
        data: priceTrend.trends.map(t => t.maxPrice),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderDash: [5, 5],
        tension: 0.1,
        fill: false
      },
      {
        label: t('mto.type2.priceTrends.minPrice'),
        data: priceTrend.trends.map(t => t.minPrice),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderDash: [5, 5],
        tension: 0.1,
        fill: false
      }
    ]
  } : null;

  const volumeData = priceTrend ? {
    labels: priceTrend.trends.map(t => new Date(t.date).toLocaleDateString()),
    datasets: [{
      label: t('mto.type2.priceTrends.volume'),
      data: priceTrend.trends.map(t => t.volume),
      backgroundColor: 'rgba(153, 102, 255, 0.5)',
      borderColor: 'rgb(153, 102, 255)',
      borderWidth: 1
    }]
  } : null;

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            {t('mto.type2.priceTrends.title')}
          </Typography>
          <Stack direction="row" spacing={1}>
            <IconButton onClick={loadPriceTrends} size="small">
              <RefreshIcon />
            </IconButton>
          </Stack>
        </Stack>

        {/* Controls */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('mto.type2.priceTrends.selectFormula')}</InputLabel>
              <Select
                value={selectedFormula}
                onChange={(e) => setSelectedFormula(Number(e.target.value))}
                label={t('mto.type2.priceTrends.selectFormula')}
              >
                {formulas.map((formula) => (
                  <MenuItem key={formula.id} value={formula.id}>
                    {formula.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <ToggleButtonGroup
              value={period}
              exclusive
              onChange={(e, v) => v && setPeriod(v)}
              size="small"
              fullWidth
            >
              <ToggleButton value="7d">7D</ToggleButton>
              <ToggleButton value="30d">30D</ToggleButton>
              <ToggleButton value="90d">90D</ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid item xs={12} md={3}>
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={(e, v) => v && setChartType(v)}
              size="small"
              fullWidth
            >
              <ToggleButton value="line">
                <TimelineIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="bar">
                <AssessmentIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>

        {priceTrend && (
          <>
            {/* Summary Cards */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {t('mto.type2.priceTrends.currentAvg')}
                        </Typography>
                        <Typography variant="h6">
                          ${priceTrend.summary.currentAverage.toFixed(2)}
                        </Typography>
                        <Typography
                          variant="caption"
                          color={priceTrend.summary.percentChange > 0 ? 'success.main' : 'error.main'}
                        >
                          {formatPercentChange(priceTrend.summary.percentChange)}
                        </Typography>
                      </Box>
                      <MoneyIcon color="primary" fontSize="small" />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {t('mto.type2.priceTrends.trend')}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Chip
                            label={priceTrend.summary.trend}
                            color={getTrendColor(priceTrend.summary.trend)}
                            size="small"
                            icon={getTrendIcon(priceTrend.summary.trend)}
                          />
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {t('mto.type2.priceTrends.volatility')}
                        </Typography>
                        <Typography variant="h6">
                          {priceTrend.summary.volatility.toFixed(2)}%
                        </Typography>
                      </Box>
                      <Tooltip title={t('mto.type2.priceTrends.volatilityHelp')}>
                        <InfoIcon fontSize="small" color="action" />
                      </Tooltip>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {t('mto.type2.priceTrends.dataPoints')}
                        </Typography>
                        <Typography variant="h6">
                          {priceTrend.trends.length}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Price Chart */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t('mto.type2.priceTrends.priceChart')}
              </Typography>
              <Box height={400}>
                {chartData && chartType === 'line' && (
                  <Line
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top' as const
                        },
                        tooltip: {
                          mode: 'index',
                          intersect: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: false,
                          title: {
                            display: true,
                            text: t('mto.type2.priceTrends.price')
                          }
                        }
                      }
                    }}
                  />
                )}
                {chartData && chartType === 'bar' && (
                  <Bar
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top' as const
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: t('mto.type2.priceTrends.price')
                          }
                        }
                      }
                    }}
                  />
                )}
              </Box>
            </Paper>

            {/* Volume Chart */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t('mto.type2.priceTrends.volumeChart')}
              </Typography>
              <Box height={200}>
                {volumeData && (
                  <Bar
                    data={volumeData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: t('mto.type2.priceTrends.quantity')
                          }
                        }
                      }
                    }}
                  />
                )}
              </Box>
            </Paper>

            {/* Insights */}
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                {t('mto.type2.priceTrends.insights')}
              </Typography>
              <Typography variant="body2">
                {priceTrend.summary.trend === 'INCREASING' &&
                  t('mto.type2.priceTrends.insightIncreasing', {
                    change: priceTrend.summary.percentChange.toFixed(2),
                    period: period
                  })
                }
                {priceTrend.summary.trend === 'DECREASING' &&
                  t('mto.type2.priceTrends.insightDecreasing', {
                    change: Math.abs(priceTrend.summary.percentChange).toFixed(2),
                    period: period
                  })
                }
                {priceTrend.summary.trend === 'STABLE' &&
                  t('mto.type2.priceTrends.insightStable', {
                    volatility: priceTrend.summary.volatility.toFixed(2)
                  })
                }
              </Typography>
            </Alert>
          </>
        )}

        {!priceTrend && !loading && (
          <Alert severity="info">
            {t('mto.type2.priceTrends.noData')}
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default MtoType2PriceTrends;