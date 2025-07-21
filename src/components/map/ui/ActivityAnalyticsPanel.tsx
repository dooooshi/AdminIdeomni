/**
 * ActivityAnalyticsPanel Component - Analytics and statistics for activity tile states
 * 
 * Features:
 * - Real-time activity analytics and metrics
 * - Land type breakdown with visual charts
 * - Top performing tiles
 * - Recent changes tracking
 * - Economic indicators and trends
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Stack,
  Paper,
  LinearProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as AttachMoneyIcon,
  People as PeopleIcon,
  Landscape as LandscapeIcon,
  Assessment as AssessmentIcon,
  Star as StarIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  FilterList as FilterIcon,
  Timer as TimerIcon,
  Place as PlaceIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';

import AdminTileStateService, { 
  TileStateAnalytics, 
  Activity 
} from '@/lib/services/adminTileStateService';

interface ActivityAnalyticsPanelProps {
  activity: Activity | null;
  isVisible: boolean;
  className?: string;
}

const ActivityAnalyticsPanel: React.FC<ActivityAnalyticsPanelProps> = ({
  activity,
  isVisible,
  className,
}) => {
  const { t } = useTranslation(['map', 'activity']);
  const [analytics, setAnalytics] = useState<TileStateAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number>(30); // seconds
  const [landTypeFilter, setLandTypeFilter] = useState<'all' | 'MARINE' | 'COASTAL' | 'PLAIN'>('all');

  // Load analytics data
  const loadAnalytics = useCallback(async () => {
    if (!activity) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const analyticsData = await AdminTileStateService.getActivityAnalytics(activity.id, {
        landType: landTypeFilter !== 'all' ? landTypeFilter : undefined,
      });
      
      setAnalytics(analyticsData);
      console.log('Loaded analytics:', analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setError('Failed to load analytics data');
      
      // Mock analytics data for development
      const mockAnalytics: TileStateAnalytics = {
        activitySummary: {
          activityId: activity.id,
          activityName: activity.name,
          totalTiles: 105,
          averagePrice: 125.50,
          averagePopulation: 850,
          totalValue: 13177.50
        },
        landTypeBreakdown: {
          MARINE: {
            count: 60,
            averagePrice: 75.00,
            averagePopulation: 100,
            totalValue: 4500.00,
            priceRange: { min: 50.00, max: 100.00 },
            populationRange: { min: 0, max: 200 }
          },
          COASTAL: {
            count: 30,
            averagePrice: 150.00,
            averagePopulation: 1200,
            totalValue: 4500.00,
            priceRange: { min: 100.00, max: 200.00 },
            populationRange: { min: 800, max: 1600 }
          },
          PLAIN: {
            count: 15,
            averagePrice: 200.00,
            averagePopulation: 1800,
            totalValue: 3000.00,
            priceRange: { min: 150.00, max: 250.00 },
            populationRange: { min: 1200, max: 2400 }
          }
        },
        topTiles: [
          {
            tileId: 15,
            currentPrice: 250.00,
            currentPopulation: 2400,
            totalValue: 490.00,
            landType: 'PLAIN',
            coordinates: { q: 0, r: 0 }
          },
          {
            tileId: 23,
            currentPrice: 200.00,
            currentPopulation: 1600,
            totalValue: 320.00,
            landType: 'COASTAL',
            coordinates: { q: 1, r: -1 }
          },
          {
            tileId: 7,
            currentPrice: 180.00,
            currentPopulation: 1400,
            totalValue: 252.00,
            landType: 'COASTAL',
            coordinates: { q: -1, r: 1 }
          }
        ],
        recentChanges: {
          last24Hours: 15,
          lastWeek: 45,
          lastMonth: 120,
          mostActiveAdmin: 'admin123'
        }
      };
      setAnalytics(mockAnalytics);
    } finally {
      setIsLoading(false);
    }
  }, [activity, landTypeFilter]);

  // Auto-refresh analytics
  useEffect(() => {
    if (!activity || refreshInterval <= 0) return;
    
    const interval = setInterval(loadAnalytics, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [loadAnalytics, refreshInterval]);

  // Load initial data
  useEffect(() => {
    if (activity) {
      loadAnalytics();
    }
  }, [loadAnalytics]);

  // Get land type color
  const getLandTypeColor = (landType: string) => {
    switch (landType) {
      case 'MARINE': return '#2196f3';
      case 'COASTAL': return '#4caf50';
      case 'PLAIN': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  // Get change trend icon
  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUpIcon color="success" fontSize="small" />;
    if (change < 0) return <TrendingDownIcon color="error" fontSize="small" />;
    return null;
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card>
        <CardHeader
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <AnalyticsIcon />
              <Typography variant="h6">
                {t('ACTIVITY_ANALYTICS')}
              </Typography>
            </Box>
          }
          action={
            <Stack direction="row" spacing={1} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>{t('LAND_TYPE')}</InputLabel>
                <Select
                  value={landTypeFilter}
                  onChange={(e) => setLandTypeFilter(e.target.value as any)}
                  label={t('LAND_TYPE')}
                >
                  <MenuItem value="all">{t('ALL_TYPES')}</MenuItem>
                  <MenuItem value="MARINE">{t('MARINE')}</MenuItem>
                  <MenuItem value="COASTAL">{t('COASTAL')}</MenuItem>
                  <MenuItem value="PLAIN">{t('PLAIN')}</MenuItem>
                </Select>
              </FormControl>
              
              <Tooltip title={t('REFRESH_ANALYTICS')}>
                <IconButton onClick={loadAnalytics} disabled={isLoading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          }
        />
        
        <CardContent>
          <Stack spacing={3}>
            {/* No Activity Selected */}
            {!activity && (
              <Alert severity="info">
                {t('SELECT_ACTIVITY_FOR_ANALYTICS')}
              </Alert>
            )}

            {/* Loading */}
            {isLoading && <LinearProgress />}

            {/* Error */}
            {error && (
              <Alert severity="error" action={
                <IconButton onClick={loadAnalytics} size="small">
                  <RefreshIcon />
                </IconButton>
              }>
                {error}
              </Alert>
            )}

            {/* Activity Summary */}
            {analytics && (
              <>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {t('ACTIVITY_SUMMARY')}
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <LandscapeIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="h4" color="primary">
                          {analytics.activitySummary.totalTiles}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('TOTAL_TILES')}
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <AttachMoneyIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="h4" color="success.main">
                          ${analytics.activitySummary.averagePrice.toFixed(0)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('AVERAGE_PRICE')}
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <PeopleIcon color="info" sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="h4" color="info.main">
                          {analytics.activitySummary.averagePopulation.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('AVERAGE_POPULATION')}
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <AssessmentIcon color="warning" sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="h4" color="warning.main">
                          ${analytics.activitySummary.totalValue.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('TOTAL_VALUE')}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>

                {/* Land Type Breakdown */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {t('LAND_TYPE_BREAKDOWN')}
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {Object.entries(analytics.landTypeBreakdown).map(([landType, data]) => (
                      <Grid item xs={12} md={4} key={landType}>
                        <Card variant="outlined" sx={{ borderColor: getLandTypeColor(landType) }}>
                          <CardContent>
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  backgroundColor: getLandTypeColor(landType)
                                }}
                              />
                              <Typography variant="h6">
                                {t(landType)}
                              </Typography>
                              <Chip size="small" label={`${data.count} ${t('TILES')}`} />
                            </Box>
                            
                            <Stack spacing={1}>
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                  {t('AVERAGE_PRICE')}:
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  ${data.averagePrice.toFixed(2)}
                                </Typography>
                              </Box>
                              
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                  {t('AVERAGE_POPULATION')}:
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {data.averagePopulation.toLocaleString()}
                                </Typography>
                              </Box>
                              
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                  {t('TOTAL_VALUE')}:
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  ${data.totalValue.toLocaleString()}
                                </Typography>
                              </Box>
                              
                              <Divider />
                              
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  {t('PRICE_RANGE')}: ${data.priceRange.min} - ${data.priceRange.max}
                                </Typography>
                                <br />
                                <Typography variant="caption" color="text.secondary">
                                  {t('POPULATION_RANGE')}: {data.populationRange.min.toLocaleString()} - {data.populationRange.max.toLocaleString()}
                                </Typography>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {/* Top Performing Tiles */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {t('TOP_PERFORMING_TILES')}
                  </Typography>
                  
                  <Card variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('RANK')}</TableCell>
                          <TableCell>{t('TILE_ID')}</TableCell>
                          <TableCell>{t('COORDINATES')}</TableCell>
                          <TableCell>{t('LAND_TYPE')}</TableCell>
                          <TableCell align="right">{t('PRICE')}</TableCell>
                          <TableCell align="right">{t('POPULATION')}</TableCell>
                          <TableCell align="right">{t('VALUE')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analytics.topTiles.map((tile, index) => (
                          <TableRow key={tile.tileId}>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                {index < 3 && <StarIcon color="warning" fontSize="small" />}
                                #{index + 1}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {tile.tileId}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                ({tile.coordinates.q}, {tile.coordinates.r})
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={t(tile.landType)}
                                sx={{
                                  backgroundColor: getLandTypeColor(tile.landType),
                                  color: 'white'
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">
                                ${tile.currentPrice.toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">
                                {tile.currentPopulation.toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="bold" color="success.main">
                                ${tile.totalValue.toFixed(2)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                </Box>

                {/* Recent Activity */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {t('RECENT_ACTIVITY')}
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <TimerIcon color="primary" sx={{ fontSize: 24, mb: 1 }} />
                        <Typography variant="h5">
                          {analytics.recentChanges.last24Hours}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('CHANGES_LAST_24H')}
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <HistoryIcon color="secondary" sx={{ fontSize: 24, mb: 1 }} />
                        <Typography variant="h5">
                          {analytics.recentChanges.lastWeek}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('CHANGES_LAST_WEEK')}
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <AssessmentIcon color="info" sx={{ fontSize: 24, mb: 1 }} />
                        <Typography variant="h5">
                          {analytics.recentChanges.lastMonth}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('CHANGES_LAST_MONTH')}
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <PeopleIcon color="warning" sx={{ fontSize: 24, mb: 1 }} />
                        <Typography variant="h6" noWrap>
                          {analytics.recentChanges.mostActiveAdmin}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('MOST_ACTIVE_ADMIN')}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>

                {/* Auto-refresh info */}
                <Alert severity="info" icon={<InfoIcon />}>
                  <Typography variant="body2">
                    {t('ANALYTICS_AUTO_REFRESH_INFO', { interval: refreshInterval })}
                  </Typography>
                </Alert>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ActivityAnalyticsPanel; 