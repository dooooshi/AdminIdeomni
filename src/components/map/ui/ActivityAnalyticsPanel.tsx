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
  IconButton,
  Tooltip,
  Divider,
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
  Refresh as RefreshIcon,
  Info as InfoIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { motion, AnimatePresence } from 'motion/react';

import AdminTileStateService, { 
  BackendAnalyticsResponse,
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
  const [analytics, setAnalytics] = useState<BackendAnalyticsResponse | null>(null);
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
      
      // Use the enhanced service with caching and retry logic
      const analyticsData = await AdminTileStateService.getActivityAnalyticsCached(
        activity.id,
        {
          landType: landTypeFilter !== 'all' ? landTypeFilter : undefined,
        }
      );
      
      setAnalytics(analyticsData);
      console.log('Loaded analytics:', analyticsData);
    } catch (error: any) {
      console.error('Failed to load analytics:', error);
      setError(error.message || 'Failed to load analytics data');
      setAnalytics(null);
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

  // Cleanup effect to clear cache when component unmounts
  useEffect(() => {
    return () => {
      // Only clear cache if this is the last instance of the component
      AdminTileStateService.clearAnalyticsCache();
    };
  }, []);

  // Manual refresh handler that clears cache
  const handleManualRefresh = useCallback(async () => {
    AdminTileStateService.clearAnalyticsCache();
    await loadAnalytics();
  }, [loadAnalytics]);

  // Get land type color
  const getLandTypeColor = (landType: string) => {
    switch (landType) {
      case 'MARINE': return '#2196f3';
      case 'COASTAL': return '#4caf50';
      case 'PLAIN': return '#ff9800';
      case 'GRASSLANDS': return '#66BB6A';
      case 'FORESTS': return '#388E3C';
      case 'HILLS': return '#8D6E63';
      case 'MOUNTAINS': return '#616161';
      case 'PLATEAUS': return '#795548';
      case 'DESERTS': return '#FF9800';
      case 'WETLANDS': return '#00ACC1';
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
              <FormControl size="small" sx={{ minWidth: 150 }}>
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
                  <MenuItem value="GRASSLANDS">{t('GRASSLANDS')}</MenuItem>
                  <MenuItem value="FORESTS">{t('FORESTS')}</MenuItem>
                  <MenuItem value="HILLS">{t('HILLS')}</MenuItem>
                  <MenuItem value="MOUNTAINS">{t('MOUNTAINS')}</MenuItem>
                  <MenuItem value="PLATEAUS">{t('PLATEAUS')}</MenuItem>
                  <MenuItem value="DESERTS">{t('DESERTS')}</MenuItem>
                  <MenuItem value="WETLANDS">{t('WETLANDS')}</MenuItem>
                </Select>
              </FormControl>
              
              <Tooltip title={t('REFRESH_ANALYTICS')}>
                <IconButton onClick={handleManualRefresh} disabled={isLoading}>
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
                <IconButton onClick={handleManualRefresh} size="small">
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
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50' }}>
                        <LandscapeIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="h4" color="primary" fontWeight="bold">
                          {analytics.activitySummary.totalTiles || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight="medium">
                          {t('TOTAL_TILES')}
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
                        <AttachMoneyIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="h4" color="success.main" fontWeight="bold">
                          ${analytics.activitySummary.averagePrice?.toFixed(0) || '0'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight="medium">
                          {t('AVERAGE_GOLD_PRICE')}
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50' }}>
                        <PeopleIcon color="info" sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="h4" color="info.main" fontWeight="bold">
                          {analytics.activitySummary.averagePopulation?.toLocaleString() || '0'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight="medium">
                          {t('AVERAGE_POPULATION')}
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50' }}>
                        <AssessmentIcon color="warning" sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="h4" color="warning.main" fontWeight="bold">
                          ${analytics.activitySummary.totalValue?.toLocaleString() || '0'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight="medium">
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
                      <Grid key={landType} size={{ xs: 12, md: 4 }}>
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
                                  ${data.averagePrice?.toFixed(2) || '0.00'}
                                </Typography>
                              </Box>
                              
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                  {t('AVERAGE_POPULATION')}:
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {data.averagePopulation?.toLocaleString() || '0'}
                                </Typography>
                              </Box>
                              
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                  {t('TOTAL_VALUE')}:
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  ${data.totalValue?.toLocaleString() || '0'}
                                </Typography>
                              </Box>
                              
                              <Divider />
                              
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  {t('PRICE_RANGE')}: ${data.priceRange?.min || 0} - ${data.priceRange?.max || 0}
                                </Typography>
                                <br />
                                <Typography variant="caption" color="text.secondary">
                                  {t('POPULATION_RANGE')}: {data.populationRange?.min?.toLocaleString() || '0'} - {data.populationRange?.max?.toLocaleString() || '0'}
                                </Typography>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
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