'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  LinearProgress,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  People as PeopleIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarTodayIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import AdminUserActivityService, {
  UserActivityStatistics,
  UserActivityStatus,
} from '@/lib/services/adminUserActivityService';

interface StatisticsPanelProps {
  statistics: UserActivityStatistics | null;
  onRefresh: () => void;
  loading: boolean;
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
  statistics,
  onRefresh,
  loading,
}) => {
  const { t } = useTranslation('activityManagement');
  const theme = useTheme();

  // Get participation percentage
  const getParticipationPercentage = () => {
    if (!statistics) return 0;
    return (statistics.usersWithActivity / statistics.totalUsers) * 100;
  };

  // Get user type statistics with percentages
  const getUserTypeStats = () => {
    if (!statistics) return [];

    const { byUserType, totalUsers } = statistics;
    return [
      {
        type: t('MANAGERS'),
        total: byUserType.managers.total,
        withActivity: byUserType.managers.withActivity,
        withoutActivity: byUserType.managers.withoutActivity,
        percentage: (byUserType.managers.total / totalUsers) * 100,
        participationRate: (byUserType.managers.withActivity / byUserType.managers.total) * 100,
        color: 'primary',
        icon: <PeopleIcon />,
      },
      {
        type: t('WORKERS'),
        total: byUserType.workers.total,
        withActivity: byUserType.workers.withActivity,
        withoutActivity: byUserType.workers.withoutActivity,
        percentage: (byUserType.workers.total / totalUsers) * 100,
        participationRate: (byUserType.workers.withActivity / byUserType.workers.total) * 100,
        color: 'secondary',
        icon: <PeopleIcon />,
      },
      {
        type: t('STUDENTS'),
        total: byUserType.students.total,
        withActivity: byUserType.students.withActivity,
        withoutActivity: byUserType.students.withoutActivity,
        percentage: (byUserType.students.total / totalUsers) * 100,
        participationRate: (byUserType.students.withActivity / byUserType.students.total) * 100,
        color: 'info',
        icon: <PeopleIcon />,
      },
    ];
  };

  // Get status icon for activity status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ENROLLED':
        return <ScheduleIcon fontSize="small" />;
      case 'COMPLETED':
        return <CheckCircleIcon fontSize="small" />;
      case 'CANCELLED':
        return <CancelIcon fontSize="small" />;
      case 'NO_SHOW':
        return <ErrorIcon fontSize="small" />;
      default:
        return null;
    }
  };

  if (loading && !statistics) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>{t('LOADING_STATISTICS')}</Typography>
      </Box>
    );
  }

  if (!statistics) {
    return (
      <Alert severity="warning">
        {t('NO_STATISTICS_AVAILABLE')}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AnalyticsIcon />
          {t('COMPREHENSIVE_STATISTICS')}
        </Typography>
        <Stack direction="row" spacing={2}>
          <Tooltip title={t('REFRESH_STATISTICS')}>
            <IconButton onClick={onRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => {/* TODO: Export statistics */}}
          >
            {t('EXPORT_REPORT')}
          </Button>
        </Stack>
      </Box>

      {/* Overall Statistics */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('OVERALL_PARTICIPATION')}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="primary">
                  {statistics.totalUsers.toLocaleString()}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {t('TOTAL_USERS')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="success.main">
                  {statistics.usersWithActivity.toLocaleString()}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {t('USERS_WITH_ACTIVITY')}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={getParticipationPercentage()}
                  color="success"
                  sx={{ mt: 1, height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {getParticipationPercentage().toFixed(1)}% {t('PARTICIPATION_RATE')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="warning.main">
                  {statistics.usersWithoutActivity.toLocaleString()}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {t('UNASSIGNED_USERS')}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={100 - getParticipationPercentage()}
                  color="warning"
                  sx={{ mt: 1, height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {(100 - getParticipationPercentage()).toFixed(1)}% {t('UNASSIGNED')}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* User Type Breakdown */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('USER_TYPE_BREAKDOWN')}
          </Typography>
          <Grid container spacing={3}>
            {getUserTypeStats().map((userType, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Box sx={{ color: `${userType.color}.main` }}>
                        {userType.icon}
                      </Box>
                      <Typography variant="h6">
                        {userType.type}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h4" color={`${userType.color}.main`}>
                        {userType.total.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {userType.percentage.toFixed(1)}% {t('OF_TOTAL_USERS')}
                      </Typography>
                    </Box>

                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">
                          {t('WITH_ACTIVITY')}:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium" color="success.main">
                          {userType.withActivity}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">
                          {t('WITHOUT_ACTIVITY')}:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium" color="warning.main">
                          {userType.withoutActivity}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={userType.participationRate}
                        color={userType.color as any}
                        sx={{ mt: 1, height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="caption" color="text.secondary" textAlign="center">
                        {userType.participationRate.toFixed(1)}% {t('PARTICIPATION_RATE')}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Activity Statistics */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('ACTIVITY_STATISTICS')}
          </Typography>
          {statistics.byActivity.length === 0 ? (
            <Alert severity="info">
              {t('NO_ACTIVITIES_WITH_PARTICIPANTS')}
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('ACTIVITY')}</TableCell>
                    <TableCell align="center">{t('TOTAL_PARTICIPANTS')}</TableCell>
                    <TableCell align="center">{t('ENROLLED')}</TableCell>
                    <TableCell align="center">{t('COMPLETED')}</TableCell>
                    <TableCell align="center">{t('CANCELLED')}</TableCell>
                    <TableCell align="center">{t('NO_SHOW')}</TableCell>
                    <TableCell align="center">{t('COMPLETION_RATE')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {statistics.byActivity.map((activity, index) => {
                    const completionRate = activity.totalParticipants > 0 
                      ? (activity.completedCount / activity.totalParticipants) * 100 
                      : 0;
                    
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {activity.activityName}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight="medium">
                            {activity.totalParticipants}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={activity.enrolledCount}
                            color="info"
                            size="small"
                            icon={getStatusIcon('ENROLLED')}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={activity.completedCount}
                            color="success"
                            size="small"
                            icon={getStatusIcon('COMPLETED')}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={activity.cancelledCount}
                            color="warning"
                            size="small"
                            icon={getStatusIcon('CANCELLED')}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={activity.noShowCount}
                            color="error"
                            size="small"
                            icon={getStatusIcon('NO_SHOW')}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight="medium">
                              {completionRate.toFixed(1)}%
                            </Typography>
                            {completionRate >= 80 ? (
                              <TrendingUpIcon color="success" fontSize="small" />
                            ) : completionRate >= 50 ? (
                              <ScheduleIcon color="warning" fontSize="small" />
                            ) : (
                              <TrendingDownIcon color="error" fontSize="small" />
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Team Statistics */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('TEAM_STATISTICS')}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {statistics.teamStatistics.totalTeams}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('TOTAL_TEAMS')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {statistics.teamStatistics.usersInTeams}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('USERS_IN_TEAMS')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {statistics.teamStatistics.usersWithoutTeams}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('USERS_WITHOUT_TEAMS')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {statistics.teamStatistics.averageTeamSize.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('AVERAGE_TEAM_SIZE')}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {statistics.teamStatistics.teamsByActivity.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t('TEAMS_BY_ACTIVITY')}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('ACTIVITY')}</TableCell>
                      <TableCell align="center">{t('TOTAL_TEAMS')}</TableCell>
                      <TableCell align="center">{t('TOTAL_MEMBERS')}</TableCell>
                      <TableCell align="center">{t('AVERAGE_SIZE')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statistics.teamStatistics.teamsByActivity.map((activity, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2">
                            {activity.activityName}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {activity.totalTeams}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {activity.totalMembers}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {activity.averageTeamSize.toFixed(1)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Trends */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('RECENT_ACTIVITY_TRENDS')}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <CalendarTodayIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" color="primary">
                    {statistics.recentAssignments.today}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('ASSIGNMENTS_TODAY')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <CalendarTodayIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" color="info.main">
                    {statistics.recentAssignments.thisWeek}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('ASSIGNMENTS_THIS_WEEK')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <CalendarTodayIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" color="success.main">
                    {statistics.recentAssignments.thisMonth}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('ASSIGNMENTS_THIS_MONTH')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StatisticsPanel;