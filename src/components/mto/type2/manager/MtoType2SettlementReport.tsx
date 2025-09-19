'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Divider,
  IconButton,
  Button,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import Grid2 from '@mui/material/Grid';import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  Store as StoreIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  PieChart as PieChartIcon
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { MtoType2Service } from '@/lib/services/mtoType2Service';
import { useToast } from '@/components/common/ToastProvider';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface MtoType2SettlementReportProps {
  requirementId: number;
  isManager: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`settlement-tabpanel-${index}`}
    aria-labelledby={`settlement-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const MtoType2SettlementReport: React.FC<MtoType2SettlementReportProps> = ({
  requirementId,
  isManager
}) => {
  const { t } = useTranslation();
  const { showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [report, setReport] = useState<any>(null);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await MtoType2Service.getSettlementReport(requirementId);
      setReport(data);
    } catch (error: any) {
      showError(error.message || t('mto.type2.errors.loadReport'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [requirementId]);

  const exportReport = () => {
    if (!report) return;

    const csvContent = [
      ['Settlement Report'],
      [''],
      ['Summary'],
      ['Total Budget', report.summary.totalBudget],
      ['Spent Budget', report.summary.spentBudget],
      ['Utilization Rate', `${report.summary.utilizationRate}%`],
      ['Total Submissions', report.summary.totalSubmissions],
      ['Settled Submissions', report.summary.settledSubmissions],
      ['Participating MALLs', report.summary.participatingMalls],
      [''],
      ['Price Analytics'],
      ['Average Price', report.priceAnalytics.averagePrice],
      ['Min Price', report.priceAnalytics.minPrice],
      ['Max Price', report.priceAnalytics.maxPrice],
      ['Median Price', report.priceAnalytics.medianPrice]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `settlement-report-${requirementId}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (!report) {
    return (
      <Alert severity="info">
        {t('mto.type2.settlementReport.noData')}
      </Alert>
    );
  }

  // Chart data preparation
  const budgetUtilizationData = {
    labels: [
      t('mto.type2.settlementReport.spent'),
      t('mto.type2.settlementReport.remaining')
    ],
    datasets: [{
      data: [
        parseFloat(report.summary.spentBudget),
        parseFloat(report.summary.totalBudget) - parseFloat(report.summary.spentBudget)
      ],
      backgroundColor: ['#4caf50', '#e0e0e0'],
      borderWidth: 0
    }]
  };

  const tileDistributionData = {
    labels: report.tileBreakdown.map((tile: any) => tile.tileName),
    datasets: [{
      label: t('mto.type2.settlementReport.allocatedBudget'),
      data: report.tileBreakdown.map((tile: any) => parseFloat(tile.allocatedBudget)),
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }, {
      label: t('mto.type2.settlementReport.spentBudget'),
      data: report.tileBreakdown.map((tile: any) => parseFloat(tile.spentBudget)),
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1
    }]
  };

  const priceDistributionData = {
    labels: report.topSuppliers.map((s: any) => `Level ${s.mallLevel}`),
    datasets: [{
      label: t('mto.type2.settlementReport.averagePrice'),
      data: report.topSuppliers.map((s: any) => parseFloat(s.averagePrice)),
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
      type: 'bar' as const
    }, {
      label: t('mto.type2.settlementReport.revenue'),
      data: report.topSuppliers.map((s: any) => parseFloat(s.revenue)),
      backgroundColor: 'rgba(255, 206, 86, 0.5)',
      borderColor: 'rgba(255, 206, 86, 1)',
      borderWidth: 1,
      type: 'bar' as const
    }]
  };

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">
            {t('mto.type2.settlementReport.title')}
          </Typography>
          <Stack direction="row" spacing={1}>
            <IconButton onClick={loadReport} size="small">
              <RefreshIcon />
            </IconButton>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={exportReport}
            >
              {t('common.export')}
            </Button>
          </Stack>
        </Stack>

        {/* Summary Cards */}
        <Grid2 container spacing={3} mb={3}>
          <Grid2 size={{ xs: 12, md: 3 }}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('mto.type2.settlementReport.totalBudget')}
                    </Typography>
                    <Typography variant="h6">
                      ${parseFloat(report.summary.totalBudget).toLocaleString()}
                    </Typography>
                  </Box>
                  <MoneyIcon color="primary" />
                </Stack>
              </CardContent>
            </Card>
          </Grid2>

          <Grid2 size={{ xs: 12, md: 3 }}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('mto.type2.settlementReport.utilizationRate')}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="h6">
                        {report.summary.utilizationRate}%
                      </Typography>
                      {report.summary.utilizationRate > 80 ? (
                        <TrendingUpIcon color="success" fontSize="small" />
                      ) : (
                        <TrendingDownIcon color="warning" fontSize="small" />
                      )}
                    </Stack>
                  </Box>
                  <PieChartIcon color="secondary" />
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={report.summary.utilizationRate}
                  sx={{ mt: 1 }}
                  color={report.summary.utilizationRate > 80 ? 'success' : 'warning'}
                />
              </CardContent>
            </Card>
          </Grid2>

          <Grid2 size={{ xs: 12, md: 3 }}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('mto.type2.settlementReport.settlements')}
                    </Typography>
                    <Typography variant="h6">
                      {report.summary.settledSubmissions} / {report.summary.totalSubmissions}
                    </Typography>
                  </Box>
                  <AssessmentIcon color="info" />
                </Stack>
              </CardContent>
            </Card>
          </Grid2>

          <Grid2 size={{ xs: 12, md: 3 }}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('mto.type2.settlementReport.participatingMalls')}
                    </Typography>
                    <Typography variant="h6">
                      {report.summary.participatingMalls}
                    </Typography>
                  </Box>
                  <StoreIcon color="success" />
                </Stack>
              </CardContent>
            </Card>
          </Grid2>
        </Grid2>

        {/* Tabs for Detailed Views */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label={t('mto.type2.settlementReport.overview')} />
            <Tab label={t('mto.type2.settlementReport.tileAnalysis')} />
            <Tab label={t('mto.type2.settlementReport.priceAnalysis')} />
            <Tab label={t('mto.type2.settlementReport.topSuppliers')} />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid2 container spacing={3}>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {t('mto.type2.settlementReport.budgetUtilization')}
                </Typography>
                <Box height={300}>
                  <Doughnut
                    data={budgetUtilizationData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom' as const
                        }
                      }
                    }}
                  />
                </Box>
              </Paper>
            </Grid2>

            <Grid2 size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {t('mto.type2.settlementReport.priceStatistics')}
                </Typography>
                <Stack spacing={2} sx={{ mt: 3 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      {t('mto.type2.settlementReport.averagePrice')}
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      ${report.priceAnalytics.averagePrice}
                    </Typography>
                  </Stack>
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      {t('mto.type2.settlementReport.priceRange')}
                    </Typography>
                    <Typography variant="body1">
                      ${report.priceAnalytics.minPrice} - ${report.priceAnalytics.maxPrice}
                    </Typography>
                  </Stack>
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      {t('mto.type2.settlementReport.medianPrice')}
                    </Typography>
                    <Typography variant="body1">
                      ${report.priceAnalytics.medianPrice}
                    </Typography>
                  </Stack>
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      {t('mto.type2.settlementReport.priceStdDev')}
                    </Typography>
                    <Typography variant="body1">
                      ${report.priceAnalytics.priceStdDev || '0.00'}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
            </Grid2>
          </Grid2>
        </TabPanel>

        {/* Tile Analysis Tab */}
        <TabPanel value={tabValue} index={1}>
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('mto.type2.settlementReport.budgetByTile')}
            </Typography>
            <Box height={400}>
              <Bar
                data={tileDistributionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const
                    }
                  }
                }}
              />
            </Box>
          </Paper>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('mto.type2.settlementReport.tileName')}</TableCell>
                  <TableCell align="center">{t('mto.type2.settlementReport.population')}</TableCell>
                  <TableCell align="center">{t('mto.type2.settlementReport.mallCount')}</TableCell>
                  <TableCell align="right">{t('mto.type2.settlementReport.allocated')}</TableCell>
                  <TableCell align="right">{t('mto.type2.settlementReport.spent')}</TableCell>
                  <TableCell align="center">{t('mto.type2.settlementReport.utilization')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.tileBreakdown.map((tile: any) => {
                  const utilization = (parseFloat(tile.spentBudget) / parseFloat(tile.allocatedBudget)) * 100;
                  return (
                    <TableRow key={tile.tileId}>
                      <TableCell>{tile.tileName}</TableCell>
                      <TableCell align="center">{tile.population.toLocaleString()}</TableCell>
                      <TableCell align="center">
                        <Chip label={tile.mallCount} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        ${parseFloat(tile.allocatedBudget).toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        ${parseFloat(tile.spentBudget).toLocaleString()}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${utilization.toFixed(1)}%`}
                          size="small"
                          color={utilization > 80 ? 'success' : 'warning'}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Price Analysis Tab */}
        <TabPanel value={tabValue} index={2}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('mto.type2.settlementReport.priceByMallLevel')}
            </Typography>
            <Box height={400}>
              <Bar
                data={priceDistributionData}
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
                      beginAtZero: true
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </TabPanel>

        {/* Top Suppliers Tab */}
        <TabPanel value={tabValue} index={3}>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('mto.type2.settlementReport.rank')}</TableCell>
                  <TableCell>{t('mto.type2.settlementReport.team')}</TableCell>
                  <TableCell align="center">{t('mto.type2.settlementReport.mallLevel')}</TableCell>
                  <TableCell align="right">{t('mto.type2.settlementReport.quantitySold')}</TableCell>
                  <TableCell align="right">{t('mto.type2.settlementReport.revenue')}</TableCell>
                  <TableCell align="right">{t('mto.type2.settlementReport.avgPrice')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.topSuppliers.map((supplier: any, index: number) => (
                  <TableRow key={supplier.teamId}>
                    <TableCell>
                      <Chip
                        label={`#${index + 1}`}
                        color={index === 0 ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack>
                        <Typography variant="body2">{supplier.teamName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {supplier.teamId}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`Level ${supplier.mallLevel}`}
                        size="small"
                        color={supplier.mallLevel === 5 ? 'error' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">{supplier.quantitySold}</TableCell>
                    <TableCell align="right">
                      <Typography color="success.main" fontWeight="bold">
                        ${parseFloat(supplier.revenue).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">${supplier.averagePrice}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default MtoType2SettlementReport;