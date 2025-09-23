'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Card,
  CardContent,
  Typography,

  Tabs,
  Tab,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import AdminUserActivityService, {
  UserActivityStatistics,
  AdminUserActivitySearchParams,
  UserWithActivityDto,
  PaginationResult,
} from '@/lib/services/adminUserActivityService';
import UserSearchAndAssignment from './UserSearchAndAssignment';
import TeamManagementPanel from './TeamManagementPanel';
import StatisticsPanel from './StatisticsPanel';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
}

const AdminUserActivityDashboard: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [statistics, setStatistics] = useState<UserActivityStatistics | null>(null);
  const [statisticsLoading, setStatisticsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load statistics on mount
  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = useCallback(async () => {
    try {
      setStatisticsLoading(true);
      setError(null);
      const data = await AdminUserActivityService.getUserActivityStatistics();
      setStatistics(data);
    } catch (err) {
      console.error('Failed to load statistics:', err);
      setError(err instanceof Error ? err.message : t('activityManagement.STATISTICS_LOAD_ERROR'));
    } finally {
      setStatisticsLoading(false);
    }
  }, [t]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStatistics();
    setRefreshing(false);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Statistics cards data
  const getStatisticsCards = () => {
    if (!statistics) return [];

    return [
      {
        title: t('activityManagement.TOTAL_USERS'),
        value: statistics.totalUsers,
        subtitle: t('activityManagement.REGISTERED_USERS'),
        color: 'primary',
        icon: <PeopleIcon />,
      },
      {
        title: t('activityManagement.USERS_WITH_ACTIVITY'),
        value: statistics.usersWithActivity,
        subtitle: `${((statistics.usersWithActivity / statistics.totalUsers) * 100).toFixed(1)}% ${t('activityManagement.ASSIGNED')}`,
        color: 'success',
        icon: <AssignmentIcon />,
      },
      {
        title: t('activityManagement.USERS_WITHOUT_ACTIVITY'),
        value: statistics.usersWithoutActivity,
        subtitle: `${((statistics.usersWithoutActivity / statistics.totalUsers) * 100).toFixed(1)}% ${t('activityManagement.UNASSIGNED')}`,
        color: 'warning',
        icon: <PeopleIcon />,
      },
      {
        title: t('activityManagement.TOTAL_TEAMS'),
        value: statistics.teamStatistics.totalTeams,
        subtitle: `${statistics.teamStatistics.averageTeamSize.toFixed(1)} ${t('activityManagement.AVERAGE_SIZE')}`,
        color: 'info',
        icon: <GroupIcon />,
      },
    ];
  };

  if (statisticsLoading && !statistics) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={40} />
        <Typography sx={{ ml: 2 }}>{t('activityManagement.LOADING_DASHBOARD')}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              <DashboardIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
              {t('activityManagement.ADMIN_USER_ACTIVITY_DASHBOARD')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('activityManagement.COMPREHENSIVE_ADMIN_MANAGEMENT_DESCRIPTION')}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Tooltip title={t('activityManagement.REFRESH_DASHBOARD')}>
              <IconButton onClick={handleRefresh} disabled={refreshing}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => {
                // TODO: Implement settings dialog
                console.log('Settings dialog not yet implemented');
              }}
            >
              {t('activityManagement.SETTINGS')}
            </Button>
          </Stack>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {getStatisticsCards().map((card, index) => (
            <Grid key={index} item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Box sx={{ mb: 2, color: `${card.color}.main` }}>
                    {card.icon}
                  </Box>
                  <Typography variant="h4" color={`${card.color}.main`} gutterBottom>
                    {card.value.toLocaleString()}
                  </Typography>
                  <Typography variant="h6" color="text.primary" gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.subtitle}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent Activity Summary */}
        {statistics && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('activityManagement.RECENT_ACTIVITY')}
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="primary">
                      {statistics.recentAssignments.today}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('activityManagement.ASSIGNMENTS_TODAY')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="info.main">
                      {statistics.recentAssignments.thisWeek}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('activityManagement.ASSIGNMENTS_THIS_WEEK')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="success.main">
                      {statistics.recentAssignments.thisMonth}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('activityManagement.ASSIGNMENTS_THIS_MONTH')}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Main Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="admin dashboard tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              label={t('activityManagement.USER_SEARCH_ASSIGNMENT')} 
              icon={<PeopleIcon />} 
              iconPosition="start"
              {...a11yProps(0)} 
            />
            <Tab 
              label={t('activityManagement.TEAM_MANAGEMENT')} 
              icon={<GroupIcon />} 
              iconPosition="start"
              {...a11yProps(1)} 
            />
            <Tab 
              label={t('activityManagement.STATISTICS_ANALYTICS')} 
              icon={<AnalyticsIcon />} 
              iconPosition="start"
              {...a11yProps(2)} 
            />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={activeTab} index={0}>
          <UserSearchAndAssignment 
            onDataChange={handleRefresh}
            statistics={statistics}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <TeamManagementPanel 
            onDataChange={handleRefresh}
            statistics={statistics}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <StatisticsPanel 
            statistics={statistics}
            onRefresh={handleRefresh}
            loading={statisticsLoading}
          />
        </TabPanel>

      </Card>
    </Box>
  );
};

export default AdminUserActivityDashboard;