'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Card,
  CardContent,
  Typography,

  Alert,
  CircularProgress,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  Factory as FactoryIcon,
  Construction as ConstructionIcon,
  Domain as DomainIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import FacilityService, {
  FacilityStatistics as FacilityStatsType,
  FacilityCategory,
  FacilityType,
} from '@/lib/services/facilityService';

interface FacilityStatisticsProps {
  refreshTrigger?: number;
  onRefresh?: () => void;
}

const FacilityStatistics: React.FC<FacilityStatisticsProps> = ({
  refreshTrigger,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [statistics, setStatistics] = useState<FacilityStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await FacilityService.getFacilityStatistics();
      setStatistics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('facilityManagement.STATISTICS_LOAD_ERROR'));
      setStatistics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, [refreshTrigger]);

  const handleRefresh = () => {
    loadStatistics();
    onRefresh?.();
  };

  const getCategoryIcon = (category: FacilityCategory) => {
    switch (category) {
      case FacilityCategory.RAW_MATERIAL_PRODUCTION:
        return <ConstructionIcon />;
      case FacilityCategory.FUNCTIONAL:
        return <FactoryIcon />;
      case FacilityCategory.INFRASTRUCTURE:
        return <DomainIcon />;
      case FacilityCategory.OTHER:
        return <BusinessIcon />;
      default:
        return <BusinessIcon />;
    }
  };

  const getCategoryColor = (category: FacilityCategory) => {
    switch (category) {
      case FacilityCategory.RAW_MATERIAL_PRODUCTION:
        return theme.palette.success.main;
      case FacilityCategory.FUNCTIONAL:
        return theme.palette.primary.main;
      case FacilityCategory.INFRASTRUCTURE:
        return theme.palette.warning.main;
      case FacilityCategory.OTHER:
        return theme.palette.secondary.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getTypeIcon = (type: FacilityType) => {
    // Simplified icon mapping based on category
    const category = FacilityService.getFacilityTypesForCategory(FacilityCategory.RAW_MATERIAL_PRODUCTION).includes(type) 
      ? FacilityCategory.RAW_MATERIAL_PRODUCTION
      : FacilityService.getFacilityTypesForCategory(FacilityCategory.FUNCTIONAL).includes(type)
      ? FacilityCategory.FUNCTIONAL
      : FacilityService.getFacilityTypesForCategory(FacilityCategory.INFRASTRUCTURE).includes(type)
      ? FacilityCategory.INFRASTRUCTURE
      : FacilityCategory.OTHER;
    
    return getCategoryIcon(category);
  };

  const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          {t('facilityManagement.LOADING_STATISTICS')}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!statistics) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        {t('facilityManagement.NO_DATA')}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header with Refresh */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          {t('facilityManagement.FACILITY_STATISTICS')}
        </Typography>
        <Tooltip title={t('facilityManagement.REFRESH_DATA')}>
          <IconButton onClick={handleRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    {t('facilityManagement.TOTAL_FACILITIES')}
                  </Typography>
                  <Typography variant="h4" component="div">
                    {statistics.totalFacilities}
                  </Typography>
                </Box>
                <TrendingUpIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    {t('facilityManagement.ACTIVE_FACILITIES')}
                  </Typography>
                  <Typography variant="h4" component="div" color="success.main">
                    {statistics.activeFacilities}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {calculatePercentage(statistics.activeFacilities, statistics.totalFacilities)}%
                  </Typography>
                </Box>
                <BusinessIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    {t('facilityManagement.INACTIVE_FACILITIES')}
                  </Typography>
                  <Typography variant="h4" component="div" color="warning.main">
                    {statistics.inactiveFacilities}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {calculatePercentage(statistics.inactiveFacilities, statistics.totalFacilities)}%
                  </Typography>
                </Box>
                <BusinessIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    {t('facilityManagement.FACILITIES_BY_CATEGORY')}
                  </Typography>
                  <Typography variant="h4" component="div">
                    {Object.keys(statistics.facilitiesByCategory).length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t('facilityManagement.CATEGORY_BREAKDOWN')}
                  </Typography>
                </Box>
                <PieChartIcon color="secondary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Category and Type Breakdown */}
      <Grid container spacing={3}>
        {/* Facilities by Category */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <PieChartIcon color="primary" />
                <Typography variant="h6" component="h3">
                  {t('facilityManagement.FACILITIES_BY_CATEGORY')}
                </Typography>
              </Box>
              
              <List dense>
                {Object.entries(statistics.facilitiesByCategory).map(([category, count], index) => (
                  <React.Fragment key={category}>
                    <ListItem>
                      <ListItemIcon>
                        {getCategoryIcon(category as FacilityCategory)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body1">
                              {t(category as FacilityCategory)}
                            </Typography>
                            <Chip
                              size="small"
                              label={count}
                              sx={{
                                backgroundColor: getCategoryColor(category as FacilityCategory),
                                color: 'white',
                                minWidth: '40px'
                              }}
                            />
                          </Box>
                        }
                        secondaryTypographyProps={{ component: 'div' }}
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="textSecondary">
                              {calculatePercentage(count, statistics.totalFacilities)}% {t('facilityManagement.OF_TOTAL')}
                            </Typography>
                            <Box
                              sx={{
                                width: '100%',
                                height: 4,
                                backgroundColor: 'grey.200',
                                borderRadius: 2,
                                mt: 0.5,
                                overflow: 'hidden'
                              }}
                            >
                              <Box
                                sx={{
                                  width: `${calculatePercentage(count, statistics.totalFacilities)}%`,
                                  height: '100%',
                                  backgroundColor: getCategoryColor(category as FacilityCategory),
                                  borderRadius: 2,
                                }}
                              />
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < Object.entries(statistics.facilitiesByCategory).length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Facilities by Type */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <BarChartIcon color="secondary" />
                <Typography variant="h6" component="h3">
                  {t('facilityManagement.FACILITIES_BY_TYPE')}
                </Typography>
              </Box>
              
              <Paper sx={{ maxHeight: 400, overflow: 'auto' }}>
                <List dense>
                  {Object.entries(statistics.facilitiesByType)
                    .sort(([, a], [, b]) => b - a) // Sort by count descending
                    .map(([type, count], index) => (
                    <React.Fragment key={type}>
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {getTypeIcon(type as FacilityType)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                              <Typography variant="body2">
                                {FacilityService.getFacilityTypeName(type as FacilityType)}
                              </Typography>
                              <Chip
                                size="small"
                                label={count}
                                color="default"
                                sx={{ minWidth: '40px' }}
                              />
                            </Box>
                          }
                          secondaryTypographyProps={{ component: 'div' }}
                          secondary={
                            <Box sx={{ mt: 0.5 }}>
                              <Box
                                sx={{
                                  width: '100%',
                                  height: 3,
                                  backgroundColor: 'grey.200',
                                  borderRadius: 1.5,
                                  overflow: 'hidden'
                                }}
                              >
                                <Box
                                  sx={{
                                    width: `${calculatePercentage(count, statistics.totalFacilities)}%`,
                                    height: '100%',
                                    backgroundColor: 'primary.main',
                                    borderRadius: 1.5,
                                  }}
                                />
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < Object.entries(statistics.facilitiesByType).length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Summary Information */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            {t('facilityManagement.SUMMARY')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                {t('facilityManagement.MOST_POPULAR_CATEGORY')}
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {Object.entries(statistics.facilitiesByCategory)
                  .sort(([, a], [, b]) => b - a)[0]?.[0] 
                  ? t(Object.entries(statistics.facilitiesByCategory).sort(([, a], [, b]) => b - a)[0][0] as FacilityCategory)
                  : 'N/A'
                }
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                {t('facilityManagement.MOST_POPULAR_TYPE')}
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {Object.entries(statistics.facilitiesByType)
                  .sort(([, a], [, b]) => b - a)[0]?.[0]
                  ? FacilityService.getFacilityTypeName(Object.entries(statistics.facilitiesByType).sort(([, a], [, b]) => b - a)[0][0] as FacilityType)
                  : 'N/A'
                }
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                {t('facilityManagement.ACTIVE_RATE')}
              </Typography>
              <Typography variant="body1" fontWeight="medium" color="success.main">
                {calculatePercentage(statistics.activeFacilities, statistics.totalFacilities)}%
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                {t('facilityManagement.TOTAL_CATEGORIES')}
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {Object.keys(statistics.facilitiesByCategory).length}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FacilityStatistics; 