'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Card,
  CardContent,

  Typography,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import UserService, { UserStatisticsDto, UserGrowthAnalyticsDto } from '@/lib/services/userService';

interface UserStatisticsProps {
  refreshTrigger?: number;
  onRefresh?: () => void;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = 'primary', trend }) => {
  const theme = useTheme();
  
  const getColorValue = () => {
    switch (color) {
      case 'success': return theme.palette.success.main;
      case 'error': return theme.palette.error.main;
      case 'warning': return theme.palette.warning.main;
      case 'info': return theme.palette.info.main;
      case 'secondary': return theme.palette.secondary.main;
      default: return theme.palette.primary.main;
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${getColorValue()}15 0%, transparent 50%)`,
        border: `1px solid ${getColorValue()}30`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[8],
        }
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '12px',
              backgroundColor: `${getColorValue()}20`,
              color: getColorValue(),
            }}
          >
            {icon}
          </Box>
          {trend && (
            <Box display="flex" alignItems="center">
              {trend.direction === 'up' ? (
                <TrendingUpIcon sx={{ color: theme.palette.success.main, fontSize: 20 }} />
              ) : (
                <TrendingDownIcon sx={{ color: theme.palette.error.main, fontSize: 20 }} />
              )}
              <Typography 
                variant="caption" 
                sx={{ 
                  ml: 0.5,
                  color: trend.direction === 'up' ? theme.palette.success.main : theme.palette.error.main,
                  fontWeight: 600
                }}
              >
                {trend.value}%
              </Typography>
            </Box>
          )}
        </Box>
        
        <Typography 
          variant="h4" 
          component="div" 
          sx={{ 
            fontWeight: 700,
            color: theme.palette.text.primary,
            mb: 1
          }}
        >
          {value.toLocaleString()}
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            color: theme.palette.text.secondary,
            fontWeight: 500
          }}
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

const UserStatistics: React.FC<UserStatisticsProps> = ({ refreshTrigger, onRefresh }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [statistics, setStatistics] = useState<UserStatisticsDto | null>(null);
  const [growthData, setGrowthData] = useState<UserGrowthAnalyticsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsData, growthAnalytics] = await Promise.all([
        UserService.getUserStatistics(),
        UserService.getUserGrowthAnalytics('month')
      ]);
      
      setStatistics(statsData);
      setGrowthData(growthAnalytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('userStats.USER_LOAD_ERROR'));
      setStatistics(null);
      setGrowthData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, [refreshTrigger]);

  const handleRefresh = () => {
    loadStatistics();
    if (onRefresh) {
      onRefresh();
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          {t('userStats.LOADING')}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <IconButton color="inherit" size="small" onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
        }
      >
        {error}
      </Alert>
    );
  }

  if (!statistics) {
    return (
      <Alert severity="info">
        {t('userStats.NO_RESULTS')}
      </Alert>
    );
  }

  const statCards = [
    {
      title: t('userStats.TOTAL_USERS'),
      value: statistics.totalUsers || 0,
      icon: <PeopleIcon />,
      color: 'primary' as const,
    },
    {
      title: t('userStats.ACTIVE_USERS'),
      value: statistics.activeUsers || 0,
      icon: <PersonAddIcon />,
      color: 'success' as const,
    },
    {
      title: t('userStats.INACTIVE_USERS'),
      value: statistics.inactiveUsers || 0,
      icon: <PeopleIcon />,
      color: 'warning' as const,
    },
    {
      title: t('userStats.MANAGERS'),
      value: statistics.byUserType?.managers || 0,
      icon: <BusinessIcon />,
      color: 'info' as const,
    },
    {
      title: t('userStats.WORKERS'),
      value: statistics.byUserType?.workers || 0,
      icon: <WorkIcon />,
      color: 'secondary' as const,
    },
    {
      title: t('userStats.STUDENTS'),
      value: statistics.byUserType?.students || 0,
      icon: <SchoolIcon />,
      color: 'error' as const,
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
          {t('userStats.USER_STATISTICS')}
        </Typography>
        <Tooltip title={t('userStats.REFRESH_DATA')}>
          <IconButton onClick={handleRefresh} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Main Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        {statCards.map((card, index) => (
          <Grid key={index} item xs={12}>
            <StatCard {...card} />
          </Grid>
        ))}
      </Grid>

      {/* Recent Registrations */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            {t('userStats.RECENT_REGISTRATIONS')}
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Box 
                sx={{ 
                  p: 2, 
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  textAlign: 'center'
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                  {statistics.recentRegistrations?.today || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('userStats.TODAY')}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box 
                sx={{ 
                  p: 2, 
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  textAlign: 'center'
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.secondary.main }}>
                  {statistics.recentRegistrations?.thisWeek || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('userStats.THIS_WEEK')}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box 
                sx={{ 
                  p: 2, 
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  textAlign: 'center'
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                  {statistics.recentRegistrations?.thisMonth || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('userStats.THIS_MONTH')}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Growth Analytics */}
          {growthData && (
            <Box mt={3}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                {t('userStats.USER_GROWTH')} ({growthData.period})
              </Typography>
              
              <Box display="flex" alignItems="center" gap={2}>
                <Chip
                  icon={(growthData.percentageChange || 0) >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                  label={`${(growthData.percentageChange || 0) >= 0 ? '+' : ''}${(growthData.percentageChange || 0).toFixed(1)}%`}
                  color={(growthData.percentageChange || 0) >= 0 ? 'success' : 'error'}
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  {t('userStats.PERCENTAGE_CHANGE')} vs previous period
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserStatistics; 