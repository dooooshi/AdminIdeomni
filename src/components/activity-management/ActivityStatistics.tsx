'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Event as EventIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CheckCircleIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import ActivityService, { ActivityStatistics, ActivityType } from '@/lib/services/activityService';

interface StatisticCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  description?: string;
}

const StatisticCard: React.FC<StatisticCardProps> = ({
  title,
  value,
  icon,
  color,
  description,
}) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ height: '100%', minHeight: 120 }}>
      <CardContent>
        <Stack direction="row" alignItems="flex-start" spacing={2}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: `${color}.main`,
              color: 'white',
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h4" component="div" fontWeight="bold" color={`${color}.main`}>
              {value.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {title}
            </Typography>
            {description && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {description}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

interface ActivityTypeCardProps {
  type: ActivityType;
  count: number;
  total: number;
}

const ActivityTypeCard: React.FC<ActivityTypeCardProps> = ({ type, count, total }) => {
  const { t } = useTranslation('activityManagement');
  const theme = useTheme();
  
  const getTypeDisplayName = (type: ActivityType): string => {
    switch (type) {
      case ActivityType.BizSimulation2_0:
        return t('BIZSIMULATION2_0');
      case ActivityType.BizSimulation2_2:
        return t('BIZSIMULATION2_2');
      case ActivityType.BizSimulation3_1:
        return t('BIZSIMULATION3_1');
      default:
        return type;
    }
  };

  const getTypeColor = (type: ActivityType): string => {
    switch (type) {
      case ActivityType.BizSimulation2_0:
        return theme.palette.primary.main;
      case ActivityType.BizSimulation2_2:
        return theme.palette.secondary.main;
      case ActivityType.BizSimulation3_1:
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1" fontWeight={600}>
              {getTypeDisplayName(type)}
            </Typography>
            <Chip 
              label={count} 
              size="small" 
              sx={{ 
                backgroundColor: getTypeColor(type),
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          </Stack>
          
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {t('PERCENTAGE_OF_TOTAL')}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {percentage.toFixed(1)}%
              </Typography>
            </Stack>
            <LinearProgress 
              variant="determinate" 
              value={percentage} 
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: theme.palette.grey[200],
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getTypeColor(type),
                  borderRadius: 4,
                }
              }}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

const ActivityStatisticsComponent: React.FC = () => {
  const { t } = useTranslation('activityManagement');
  const [statistics, setStatistics] = useState<ActivityStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ActivityService.getActivityStatistics();
      setStatistics(data);
    } catch (err) {
      console.error('Failed to load activity statistics:', err);
      setError(err instanceof Error ? err.message : t('STATISTICS_LOAD_ERROR'));
      
      // Set fallback data for development
      setStatistics({
        total: 0,
        active: 0,
        upcoming: 0,
        ongoing: 0,
        byType: {
          [ActivityType.BizSimulation2_0]: 0,
          [ActivityType.BizSimulation2_2]: 0,
          [ActivityType.BizSimulation3_1]: 0,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <CircularProgress size={20} />
          <Typography variant="h5">{t('LOADING_STATISTICS')}</Typography>
        </Stack>
      </Box>
    );
  }

  if (error && !statistics) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  if (!statistics) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          {t('NO_STATISTICS_AVAILABLE')}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {t('ACTIVITY_STATISTICS')}
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {t('STATISTICS_LOAD_ERROR_PARTIAL')}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Overview Cards */}
        <Box>
          <Typography variant="h6" gutterBottom>
            {t('OVERVIEW')}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 2,
            }}
          >
            <StatisticCard
              title={t('TOTAL_ACTIVITIES')}
              value={statistics.total}
              icon={<EventIcon />}
              color="primary"
              description={t('ALL_ACTIVITIES_TOTAL')}
            />
            <StatisticCard
              title={t('ACTIVE_ACTIVITIES')}
              value={statistics.active}
              icon={<CheckCircleIcon />}
              color="success"
              description={t('CURRENTLY_ACTIVE')}
            />
            <StatisticCard
              title={t('UPCOMING_ACTIVITIES')}
              value={statistics.upcoming}
              icon={<ScheduleIcon />}
              color="warning"
              description={t('STARTING_SOON')}
            />
            <StatisticCard
              title={t('ONGOING_ACTIVITIES')}
              value={statistics.ongoing}
              icon={<PlayIcon />}
              color="info"
              description={t('IN_PROGRESS_NOW')}
            />
          </Box>
        </Box>

        {/* Activity Types Breakdown */}
        <Box>
          <Typography variant="h6" gutterBottom>
            {t('ACTIVITY_TYPES_BREAKDOWN')}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
              },
              gap: 2,
            }}
          >
            <ActivityTypeCard
              type={ActivityType.BizSimulation2_0}
              count={statistics.byType[ActivityType.BizSimulation2_0]}
              total={statistics.total}
            />
            <ActivityTypeCard
              type={ActivityType.BizSimulation2_2}
              count={statistics.byType[ActivityType.BizSimulation2_2]}
              total={statistics.total}
            />
            <ActivityTypeCard
              type={ActivityType.BizSimulation3_1}
              count={statistics.byType[ActivityType.BizSimulation3_1]}
              total={statistics.total}
            />
          </Box>
        </Box>

        {/* Summary */}
        <Card variant="outlined">
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <BarChartIcon color="primary" />
              <Typography variant="h6">{t('STATISTICS_SUMMARY')}</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {statistics.total > 0 ? (
                t('STATISTICS_SUMMARY_TEXT', {
                  total: statistics.total,
                  active: statistics.active,
                  upcoming: statistics.upcoming,
                  ongoing: statistics.ongoing,
                })
              ) : (
                t('NO_ACTIVITIES_CREATED_YET')
              )}
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default ActivityStatisticsComponent; 