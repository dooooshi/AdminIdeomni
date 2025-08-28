'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  Breadcrumbs,
  Link,
  Alert,
  Button,
} from '@mui/material';
import {
  Event as EventIcon,
  BarChart as BarChartIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import IdeomniPageSimple from '@ideomni/core/IdeomniPageSimple';
import {
  ActivityList,
  ActivityForm,
  ActivityStatistics,
} from '@/components/activity-management';

import { Activity } from '@/lib/services/activityService';

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
      id={`activity-tabpanel-${index}`}
      aria-labelledby={`activity-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `activity-tab-${index}`,
    'aria-controls': `activity-tabpanel-${index}`,
  };
}

const ActivityManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [activityFormOpen, setActivityFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateActivity = () => {
    setEditingActivity(null);
    setActivityFormOpen(true);
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setActivityFormOpen(true);
  };


  const handleActivityFormSuccess = () => {
    // Trigger refresh of activity list
    setRefreshTrigger(prev => prev + 1);
    setActivityFormOpen(false);
    setEditingActivity(null);
  };

  const handleCloseActivityForm = () => {
    setActivityFormOpen(false);
    setEditingActivity(null);
  };


  return (
    <IdeomniPageSimple
      header={
        <Box sx={{ p: 3 }}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link color="inherit" href="/" underline="hover">
              <DashboardIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Dashboard
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <EventIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              {t('activityManagement.ACTIVITY_MANAGEMENT')}
            </Typography>
          </Breadcrumbs>
          
          <Typography variant="h4" component="h1" gutterBottom>
            {t('activityManagement.ACTIVITY_MANAGEMENT')}
          </Typography>
          
          <Typography variant="body1" color="text.secondary">
            {t('activityManagement.ACTIVITY_MANAGEMENT_SUBTITLE')}
          </Typography>
        </Box>
      }
      content={
        <Box sx={{ p: 3 }}>
          <Card>
            {/* Tabs Header */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="activity management tabs"
                variant="fullWidth"
              >
                <Tab 
                  label={t('activityManagement.ACTIVITY_LIST')} 
                  icon={<EventIcon />} 
                  iconPosition="start"
                  {...a11yProps(0)} 
                />
                <Tab 
                  label={t('activityManagement.ACTIVITY_STATISTICS')} 
                  icon={<BarChartIcon />} 
                  iconPosition="start"
                  {...a11yProps(1)} 
                />
              </Tabs>
            </Box>

            <CardContent sx={{ p: 0 }}>
              {/* Activity List Tab */}
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ p: 3 }}>
                  <ActivityList
                    key={refreshTrigger} // Force re-render when activities change
                    onCreateActivity={handleCreateActivity}
                    onEditActivity={handleEditActivity}
                  />
                </Box>
              </TabPanel>

              {/* Statistics Tab */}
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ p: 3 }}>
                  <ActivityStatistics />
                </Box>
              </TabPanel>

            </CardContent>
          </Card>

          {/* Activity Form Dialog */}
          <ActivityForm
            open={activityFormOpen}
            onClose={handleCloseActivityForm}
            activity={editingActivity}
            onSuccess={handleActivityFormSuccess}
          />

        </Box>
      }
    />
  );
};

export default ActivityManagementPage; 