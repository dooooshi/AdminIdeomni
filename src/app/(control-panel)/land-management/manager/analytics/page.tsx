'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  Button,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import LandService from '@/lib/services/landService';
import { useTranslation } from 'react-i18next';
import {
  LandPurchaseAnalytics,
  ActivityLandOverview,
  LandStatusSummary
} from '@/types/land';

const ChartContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '400px',
  display: 'flex',
  flexDirection: 'column',
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

interface ManagerLandAnalyticsPageProps {}

const ManagerLandAnalyticsPage: React.FC<ManagerLandAnalyticsPageProps> = () => {
  const theme = useTheme();
  const { t } = useTranslation(['landManagement', 'navigation', 'common']);
  
  // State management
  const [analytics, setAnalytics] = useState<LandPurchaseAnalytics | null>(null);
  const [overview, setOverview] = useState<ActivityLandOverview | null>(null);
  const [summary, setSummary] = useState<LandStatusSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'total'>('month');

  // Load data on component mount
  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all analytics data in parallel
      const [analyticsData, overviewData, summaryData] = await Promise.all([
        LandService.getLandPurchaseAnalytics(),
        LandService.getActivityLandOverview(),
        LandService.getLandStatusSummary()
      ]);

      setAnalytics(analyticsData);
      setOverview(overviewData);
      setSummary(summaryData);
    } catch (err: any) {
      console.error('Failed to load analytics data:', err);
      setError(LandService.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadAnalyticsData();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Chart colors
  const chartColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];

  // Purchase trends chart data
  const purchaseTrendsData = analytics?.purchaseTrends?.map(trend => ({
    date: new Date(trend.date).toLocaleDateString(),
    purchases: trend.purchases,
    area: trend.area,
    revenue: trend.revenue,
  })) || [];

  // Land type data for pie chart
  const landTypeData = analytics?.purchasesByLandType?.map((type, index) => ({
    name: LandService.formatLandType(type.landType),
    value: type.purchases,
    area: type.area,
    revenue: type.revenue,
    color: chartColors[index % chartColors.length],
  })) || [];

  // Revenue comparison data
  const revenueData = analytics?.purchasesByLandType?.map(type => ({
    landType: LandService.formatLandType(type.landType),
    revenue: type.revenue,
    area: type.area,
    purchases: type.purchases,
  })) || [];

  // Top performing tiles data
  const topTilesData = analytics?.topPerformingTiles?.slice(0, 10).map(tile => ({
    tile: `Tile ${tile.tileId}`,
    revenue: tile.totalRevenue,
    area: tile.totalArea,
    purchases: tile.purchases,
    landType: LandService.formatLandType(tile.landType),
  })) || [];

  const renderPurchaseTrendsChart = () => (
    <ChartContainer elevation={2}>
      <Typography variant="h6" gutterBottom>
        Purchase Trends Over Time
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={purchaseTrendsData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <ChartTooltip 
            formatter={(value: any, name: string) => {
              if (name === 'revenue') return [LandService.formatCurrency(value), 'Revenue'];
              if (name === 'area') return [LandService.formatArea(value), 'Area'];
              return [value, 'Purchases'];
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="purchases"
            stackId="1"
            stroke={theme.palette.primary.main}
            fill={theme.palette.primary.main}
            fillOpacity={0.6}
            name="Purchases"
          />
          <Area
            type="monotone"
            dataKey="area"
            stackId="2"
            stroke={theme.palette.success.main}
            fill={theme.palette.success.main}
            fillOpacity={0.6}
            name="Area"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );

  const renderLandTypeDistribution = () => (
    <ChartContainer elevation={2}>
      <Typography variant="h6" gutterBottom>
        Land Type Distribution
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={landTypeData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={5}
            dataKey="value"
          >
            {landTypeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <ChartTooltip 
            formatter={(value: any, name: string) => [
              `${value} purchases`, 
              name
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );

  const renderRevenueByLandType = () => (
    <ChartContainer elevation={2}>
      <Typography variant="h6" gutterBottom>
        Revenue by Land Type
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={revenueData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="landType" />
          <YAxis />
          <ChartTooltip 
            formatter={(value: any) => [LandService.formatCurrency(value), 'Capital Generated']}
          />
          <Bar 
            dataKey="revenue" 
            fill={theme.palette.primary.main}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );

  const renderTopPerformingTiles = () => (
    <ChartContainer elevation={2}>
      <Typography variant="h6" gutterBottom>
        Top Performing Tiles
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={topTilesData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="tile" type="category" width={80} />
          <ChartTooltip 
            formatter={(value: any) => [LandService.formatCurrency(value), 'Capital Generated']}
          />
          <Bar 
            dataKey="revenue" 
            fill={theme.palette.secondary.main}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );

  const renderTeamRankingsTable = () => {
    if (!analytics?.teamRankings) return null;

    const combinedRankings = analytics.teamRankings.byArea.map(areaTeam => {
      const spendingTeam = analytics.teamRankings.bySpending.find(
        s => s.teamId === areaTeam.teamId
      );
      return {
        ...areaTeam,
        totalSpent: spendingTeam?.totalSpent || 0,
        spendingRank: spendingTeam?.rank || 0,
      };
    });

    return (
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Team Name</TableCell>
              <TableCell align="right">Total Area</TableCell>
              <TableCell align="right">Total Spent</TableCell>
              <TableCell align="right">Avg Cost/Area</TableCell>
              <TableCell align="center">Performance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {combinedRankings.slice(0, 10).map((team) => {
              const avgCost = team.totalArea > 0 ? team.totalSpent / team.totalArea : 0;
              return (
                <TableRow key={team.teamId}>
                  <TableCell>
                    <Chip 
                      label={`#${team.rank}`} 
                      color={team.rank <= 3 ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {team.teamName}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {LandService.formatArea(team.totalArea)}
                  </TableCell>
                  <TableCell align="right">
                    {LandService.formatCurrency(team.totalSpent)}
                  </TableCell>
                  <TableCell align="right">
                    {LandService.formatCurrency(avgCost)}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={team.rank <= 3 ? 'Excellent' : team.rank <= 6 ? 'Good' : 'Average'}
                      color={team.rank <= 3 ? 'success' : team.rank <= 6 ? 'warning' : 'default'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" size="small" onClick={handleRefresh}>
          Retry
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  if (!analytics) {
    return (
      <Alert severity="info">
        No analytics data available for this activity.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Land Analytics Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive analytics and insights for land management activities
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value as any)}
            >
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="total">All Time</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Export Data">
            <IconButton size="large">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} size="large">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <TimelineIcon color="primary" />
                <Box>
                  <Typography variant="h5">
                    {analytics.totalPurchases[timeRange].toLocaleString()}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Total Purchases
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <TrendingUpIcon color="primary" />
                <Box>
                  <Typography variant="h5">
                    {LandService.formatCurrency(analytics.totalRevenue[timeRange])}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Total Revenue
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <PieChartIcon color="primary" />
                <Box>
                  <Typography variant="h5">
                    {analytics.purchasesByLandType.length}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Land Types
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <BarChartIcon color="primary" />
                <Box>
                  <Typography variant="h5">
                    {analytics.topPerformingTiles.length}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Active Tiles
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Analytics Tabs */}
      <Paper elevation={2}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Trends" />
          <Tab label="Land Types" />
          <Tab label="Performance" />
          <Tab label="Team Rankings" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              {renderPurchaseTrendsChart()}
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderLandTypeDistribution()}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderRevenueByLandType()}
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              {renderTopPerformingTiles()}
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Team Performance Rankings
            </Typography>
            {renderTeamRankingsTable()}
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default ManagerLandAnalyticsPage;