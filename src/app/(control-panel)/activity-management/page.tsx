'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  Badge,
  Button,
} from '@mui/material';
import {
  Event as EventIcon,
  BarChart as BarChartIcon,
  Dashboard as DashboardIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import IdeomniPageSimple from '@ideomni/core/IdeomniPageSimple';
import {
  ActivityList,
  ActivityForm,
  ActivityStatistics,
  ActivityParticipantsList,
  BulkUserOperations,
  UserActivityHistory,
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
  const { t } = useTranslation('activityManagement');
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [activityFormOpen, setActivityFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Participants management state
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [bulkOperationsOpen, setBulkOperationsOpen] = useState(false);
  const [bulkOperation, setBulkOperation] = useState<'add' | 'remove'>('add');
  const [preSelectedUserIds, setPreSelectedUserIds] = useState<string[]>([]);
  const [userHistoryOpen, setUserHistoryOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

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

  const handleViewActivity = (activity: Activity) => {
    // Switch to participants tab and set selected activity
    setSelectedActivity(activity);
    setTabValue(2); // Switch to participants tab
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

  // Participants management handlers
  const handleAddUsers = () => {
    setBulkOperation('add');
    setPreSelectedUserIds([]);
    setBulkOperationsOpen(true);
  };

  const handleRemoveUsers = (userIds: string[]) => {
    setBulkOperation('remove');
    setPreSelectedUserIds(userIds);
    setBulkOperationsOpen(true);
  };

  const handleUserHistoryView = (userId: string) => {
    setSelectedUserId(userId);
    setUserHistoryOpen(true);
  };

  const handleBulkOperationSuccess = () => {
    // Refresh participants list
    setRefreshTrigger(prev => prev + 1);
    setBulkOperationsOpen(false);
  };

  const handleCloseBulkOperations = () => {
    setBulkOperationsOpen(false);
    setPreSelectedUserIds([]);
  };

  const handleCloseUserHistory = () => {
    setUserHistoryOpen(false);
    setSelectedUserId('');
  };

  return (
    <IdeomniPageSimple
      header={
        <Box sx={{ p: 3 }}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link color="inherit" href="/dashboards" underline="hover">
              <DashboardIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Dashboard
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <EventIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              {t('ACTIVITY_MANAGEMENT')}
            </Typography>
          </Breadcrumbs>
          
          <Typography variant="h4" component="h1" gutterBottom>
            {t('ACTIVITY_MANAGEMENT')}
          </Typography>
          
          <Typography variant="body1" color="text.secondary">
            {t('ACTIVITY_MANAGEMENT_SUBTITLE')}
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
                  label={t('ACTIVITY_LIST')} 
                  icon={<EventIcon />} 
                  iconPosition="start"
                  {...a11yProps(0)} 
                />
                <Tab 
                  label={t('ACTIVITY_STATISTICS')} 
                  icon={<BarChartIcon />} 
                  iconPosition="start"
                  {...a11yProps(1)} 
                />
                <Tab 
                  label={
                    selectedActivity ? 
                      `${t('PARTICIPANTS_MANAGEMENT')} - ${selectedActivity.name}` : 
                      t('PARTICIPANTS_MANAGEMENT')
                  }
                  icon={selectedActivity ? <Badge color="primary" variant="dot"><GroupIcon /></Badge> : <GroupIcon />}
                  iconPosition="start"
                  {...a11yProps(2)}
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
                    onViewActivity={handleViewActivity}
                  />
                </Box>
              </TabPanel>

              {/* Statistics Tab */}
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ p: 3 }}>
                  <ActivityStatistics />
                </Box>
              </TabPanel>

              {/* Participants Management Tab */}
              <TabPanel value={tabValue} index={2}>
                <Box sx={{ p: 3 }}>
                  {selectedActivity ? (
                    <ActivityParticipantsList
                      key={`${selectedActivity.id}-${refreshTrigger}`}
                      activity={selectedActivity}
                      onAddUsers={handleAddUsers}
                      onRemoveUsers={handleRemoveUsers}
                      onUserHistoryView={handleUserHistoryView}
                    />
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <GroupIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        {t('NO_ACTIVITY_SELECTED')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {t('SELECT_ACTIVITY_TO_MANAGE_PARTICIPANTS')}
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<EventIcon />}
                        onClick={() => setTabValue(0)}
                        size="large"
                      >
                        {t('GO_TO_ACTIVITIES')}
                      </Button>
                    </Box>
                  )}
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

          {/* Bulk User Operations Dialog */}
          {selectedActivity && (
            <BulkUserOperations
              open={bulkOperationsOpen}
              onClose={handleCloseBulkOperations}
              activity={selectedActivity}
              operation={bulkOperation}
              preSelectedUserIds={preSelectedUserIds}
              onSuccess={handleBulkOperationSuccess}
            />
          )}

          {/* User Activity History Dialog */}
          <UserActivityHistory
            open={userHistoryOpen}
            onClose={handleCloseUserHistory}
            userId={selectedUserId}
          />
        </Box>
      }
    />
  );
};

export default ActivityManagementPage; 