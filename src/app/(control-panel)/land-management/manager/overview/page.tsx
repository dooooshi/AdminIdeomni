'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Divider,
  Stack,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Group as GroupIcon,
  Landscape as LandscapeIcon,
  AttachMoney as MoneyIcon,
  EmojiEvents as TrophyIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import LandService from '@/lib/services/landService';
import {
  ActivityLandOverview,
  LandPurchaseAnalytics,
  RecentPurchase
} from '@/types/land';

const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const MetricBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.background.default,
}));

interface ManagerLandOverviewPageProps {}

const ManagerLandOverviewPage: React.FC<ManagerLandOverviewPageProps> = () => {
  const theme = useTheme();
  
  // State management
  const [overview, setOverview] = useState<ActivityLandOverview | null>(null);
  const [analytics, setAnalytics] = useState<LandPurchaseAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load overview and analytics data in parallel
      const [overviewData, analyticsData] = await Promise.all([
        LandService.getActivityLandOverview(),
        LandService.getLandPurchaseAnalytics()
      ]);

      setOverview(overviewData);
      setAnalytics(analyticsData);
    } catch (err: any) {
      console.error('Failed to load overview data:', err);
      setError(LandService.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadOverviewData();
  };

  const renderStatCard = (
    title: string,
    value: string | number,
    icon: React.ReactNode,
    color: string = theme.palette.primary.main,
    subtitle?: string,
    trend?: { value: number; label: string }
  ) => (
    <StatsCard>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
            {icon}
          </Avatar>
          {trend && (
            <Box display="flex" alignItems="center" gap={0.5}>
              {trend.value >= 0 ? (
                <TrendingUpIcon fontSize="small" color="success" />
              ) : (
                <TrendingDownIcon fontSize="small" color="error" />
              )}
              <Typography
                variant="body2"
                color={trend.value >= 0 ? 'success.main' : 'error.main'}
                fontWeight="bold"
              >
                {Math.abs(trend.value)}%
              </Typography>
            </Box>
          )}
        </Box>
        
        <Typography variant="h4" component="div" gutterBottom>
          {value}
        </Typography>
        
        <Typography color="text.secondary" variant="body2">
          {title}
        </Typography>
        
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </StatsCard>
  );

  const renderRecentPurchases = () => {
    if (!overview?.recentPurchases || overview.recentPurchases.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          No recent investment activity to display
        </Typography>
      );
    }

    return (
      <List sx={{ width: '100%' }}>
        {overview.recentPurchases.map((purchase, index) => (
          <React.Fragment key={purchase.id}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: LandService.getLandTypeColor(purchase.landType) }}>
                  <LocationIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="subtitle2">
                      {purchase.teamName}
                    </Typography>
                    <Chip
                      label={LandService.formatLandType(purchase.landType)}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={
                  <Stack spacing={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Tile {purchase.tileId} ({purchase.tileCoordinates})
                    </Typography>
                    <Box display="flex" gap={2}>
                      <Typography variant="body2">
                        Area: {LandService.formatArea(purchase.area)}
                      </Typography>
                      <Typography variant="body2">
                        Cost: {LandService.formatCurrency(purchase.totalCost)}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(purchase.purchaseDate).toLocaleString()}
                    </Typography>
                  </Stack>
                }
              />
            </ListItem>
            {index < overview.recentPurchases.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>
    );
  };

  const renderTopTeams = () => {
    if (!analytics?.teamRankings) return null;

    const topByArea = analytics.teamRankings.byArea.slice(0, 5);
    const topBySpending = analytics.teamRankings.bySpending.slice(0, 5);

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Leading Territory Holders
              </Typography>
              <Stack spacing={2}>
                {topByArea.map((team, index) => (
                  <Box key={team.teamId} display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      {index + 1}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="subtitle2">
                        {team.teamName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {LandService.formatArea(team.totalArea)} territory
                      </Typography>
                    </Box>
                    <TrophyIcon color={index === 0 ? 'warning' : 'action'} />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Highest Capital Deployment
              </Typography>
              <Stack spacing={2}>
                {topBySpending.map((team, index) => (
                  <Box key={team.teamId} display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                      {index + 1}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="subtitle2">
                        {team.teamName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {LandService.formatCurrency(team.totalSpent)} invested
                      </Typography>
                    </Box>
                    <MoneyIcon color={index === 0 ? 'warning' : 'action'} />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
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

  if (!overview || !analytics) {
    return (
      <Alert severity="info">
        No land management data available for this activity.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Territory Management Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Executive oversight of strategic land operations in {overview.activityName}
          </Typography>
        </Box>
        <Tooltip title="Refresh Data">
          <IconButton onClick={handleRefresh} size="large">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Key Metrics Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          {renderStatCard(
            'Investment Transactions',
            overview.totalLandPurchases.toLocaleString(),
            <TimelineIcon />,
            theme.palette.primary.main,
            'Total acquisition events'
          )}
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          {renderStatCard(
            'Territory Acquired',
            LandService.formatArea(overview.totalAreaPurchased),
            <LandscapeIcon />,
            theme.palette.success.main,
            'Total area under management'
          )}
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          {renderStatCard(
            'Capital Generated',
            LandService.formatCurrency(overview.totalRevenue),
            <MoneyIcon />,
            theme.palette.warning.main,
            'Combined resource value'
          )}
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          {renderStatCard(
            'Strategic Units',
            overview.teamsWithLand,
            <GroupIcon />,
            theme.palette.info.main,
            'Teams with active holdings'
          )}
        </Grid>
      </Grid>

      {/* Additional Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <MetricBox>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <LandscapeIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">
                {overview.tilesWithOwnership}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Properties
              </Typography>
            </Box>
          </MetricBox>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <MetricBox>
            <Avatar sx={{ bgcolor: 'success.main' }}>
              <MoneyIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">
                {LandService.formatArea(overview.averageAreaPerTeam)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg. Holdings per Unit
              </Typography>
            </Box>
          </MetricBox>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <MetricBox>
            <Avatar sx={{ bgcolor: 'warning.main' }}>
              <TrophyIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">
                Tile {overview.mostActiveTile.tileId}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Highest Activity Property ({overview.mostActiveTile.purchaseCount} transactions)
              </Typography>
            </Box>
          </MetricBox>
        </Grid>
      </Grid>

      {/* Recent Activity and Top Teams */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Strategic Acquisitions
              </Typography>
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                {renderRecentPurchases()}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Strategic Leader
              </Typography>
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Avatar 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    mx: 'auto', 
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '2rem'
                  }}
                >
                  <TrophyIcon fontSize="large" />
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {overview.topTeamByArea.teamName}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {LandService.formatArea(overview.topTeamByArea.totalArea)} total territory controlled
                </Typography>
                <Chip 
                  label="Market Leader" 
                  color="primary" 
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Team Rankings */}
      {renderTopTeams()}
    </Box>
  );
};

export default ManagerLandOverviewPage;