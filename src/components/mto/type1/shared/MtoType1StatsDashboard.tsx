'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon,
  LocalShipping as DeliveryIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Timer as TimerIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

interface MtoStatistics {
  totalRequirement: number;
  totalDelivered: number;
  totalSettled: number;
  totalUnsettled: number;
  fulfillmentRate: number;
  activeTiles: number;
  tilesWithDelivery: number;
  averageDeliveryPerTile: number;
  totalBudget: number;
  spentBudget: number;
  remainingBudget: number;
  uniqueTeams: number;
}

interface Props {
  statistics: MtoStatistics;
  tileData?: Array<{
    tileName: string;
    requirement: number;
    delivered: number;
    settled: number;
  }>;
  timeSeriesData?: Array<{
    time: string;
    deliveries: number;
    settlements: number;
  }>;
}

const MtoType1StatsDashboard: React.FC<Props> = ({ statistics, tileData = [], timeSeriesData = [] }) => {
  const { t } = useTranslation(['mto']);

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

  const formatPercentage = (rate: number) => {
    return `${rate.toFixed(1)}%`;
  };

  const pieData = [
    { name: 'Settled', value: statistics.totalSettled, color: '#4caf50' },
    { name: 'Unsettled', value: statistics.totalUnsettled, color: '#ff9800' },
    { name: 'Remaining', value: statistics.totalRequirement - statistics.totalDelivered, color: '#9e9e9e' }
  ];

  const budgetData = [
    { name: 'Spent', value: statistics.spentBudget, color: '#2196f3' },
    { name: 'Remaining', value: statistics.remainingBudget, color: '#e0e0e0' }
  ];

  const COLORS = ['#4caf50', '#ff9800', '#9e9e9e', '#2196f3', '#e0e0e0'];

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    {t('mto:mto.type1.stats.fulfillmentRate')}
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {formatPercentage(statistics.fulfillmentRate)}
                  </Typography>
                </Box>
                {statistics.fulfillmentRate >= 70 ? (
                  <TrendingUpIcon color="success" fontSize="large" />
                ) : (
                  <TrendingDownIcon color="error" fontSize="large" />
                )}
              </Box>
              <LinearProgress
                variant="determinate"
                value={statistics.fulfillmentRate}
                color={statistics.fulfillmentRate >= 70 ? 'success' : 'warning'}
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <LocationIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" gutterBottom variant="body2">
                  {t('mto:mto.type1.stats.tilesCoverage')}
                </Typography>
              </Box>
              <Typography variant="h4">
                {statistics.tilesWithDelivery}/{statistics.activeTiles}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {formatPercentage((statistics.tilesWithDelivery / statistics.activeTiles) * 100)} {t('mto:mto.type1.stats.coverage')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <GroupIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" gutterBottom variant="body2">
                  {t('mto:mto.type1.stats.participatingTeams')}
                </Typography>
              </Box>
              <Typography variant="h4">
                {statistics.uniqueTeams}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {t('mto:mto.type1.stats.avgPerTile', { avg: formatNumber(statistics.averageDeliveryPerTile) })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <MoneyIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" gutterBottom variant="body2">
                  {t('mto:mto.type1.stats.budgetUtilization')}
                </Typography>
              </Box>
              <Typography variant="h5">
                {formatCurrency(statistics.spentBudget)}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {t('mto:mto.type1.stats.ofTotal', { total: formatCurrency(statistics.totalBudget) })}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(statistics.spentBudget / statistics.totalBudget) * 100}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              {t('mto:mto.type1.stats.deliveryDistribution')}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${formatNumber(value)} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatNumber(value)} />
              </PieChart>
            </ResponsiveContainer>

            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 4 }}>
                  <Box display="flex" alignItems="center">
                    <CheckIcon color="success" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">{t('mto:mto.type1.stats.settled')}</Typography>
                      <Typography variant="h6">{formatNumber(statistics.totalSettled)}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Box display="flex" alignItems="center">
                    <CancelIcon color="warning" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">{t('mto:mto.type1.stats.unsettled')}</Typography>
                      <Typography variant="h6">{formatNumber(statistics.totalUnsettled)}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Box display="flex" alignItems="center">
                    <TimerIcon color="action" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">{t('mto:mto.type1.stats.remaining')}</Typography>
                      <Typography variant="h6">{formatNumber(statistics.totalRequirement - statistics.totalDelivered)}</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              {t('mto:mto.type1.stats.budgetAllocation')}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={budgetData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {budgetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>

            <List>
              <ListItem>
                <ListItemIcon>
                  <DeliveryIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={t('mto:mto.type1.stats.totalDeliveries')}
                  secondary={formatNumber(statistics.totalDelivered)}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <AssessmentIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={t('mto:mto.type1.stats.totalRequirement')}
                  secondary={formatNumber(statistics.totalRequirement)}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {tileData.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('mto:mto.type1.stats.tilePerformance')}
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={tileData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tileName" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatNumber(value)} />
                  <Legend />
                  <Bar dataKey="requirement" fill="#8884d8" name={t('mto:mto.type1.stats.requirement')} />
                  <Bar dataKey="delivered" fill="#82ca9d" name={t('mto:mto.type1.stats.delivered')} />
                  <Bar dataKey="settled" fill="#ffc658" name={t('mto:mto.type1.stats.settled')} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {timeSeriesData.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('mto:mto.type1.stats.deliveryTimeline')}
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatNumber(value)} />
                  <Legend />
                  <Area type="monotone" dataKey="deliveries" stackId="1" stroke="#8884d8" fill="#8884d8" name={t('mto:mto.type1.stats.deliveries')} />
                  <Area type="monotone" dataKey="settlements" stackId="1" stroke="#82ca9d" fill="#82ca9d" name={t('mto:mto.type1.stats.settlements')} />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default MtoType1StatsDashboard;