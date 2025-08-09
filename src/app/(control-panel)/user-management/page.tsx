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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  FormControlLabel,
  Switch,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  GetApp as GetAppIcon,
  Dashboard as DashboardIcon,
  VpnKey as VpnKeyIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import IdeomniPageSimple from '@ideomni/core/IdeomniPageSimple';
import {
  UserList,
  UserForm,
  UserStatistics,
  AdminUserDetailsDto,
} from '@/components/user-management';
import UserService from '@/lib/services/userService';

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
      id={`user-management-tabpanel-${index}`}
      aria-labelledby={`user-management-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `user-management-tab-${index}`,
    'aria-controls': `user-management-tabpanel-${index}`,
  };
}

const UserManagementPage: React.FC = () => {
  const { t } = useTranslation('userManagement');
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserDetailsDto | null>(null);
  const [viewingUser, setViewingUser] = useState<AdminUserDetailsDto | null>(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [passwordResetOpen, setPasswordResetOpen] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<AdminUserDetailsDto | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Password reset form state
  const [passwordResetSettings, setPasswordResetSettings] = useState({
    generateTemporary: true,
    requireChange: true,
    sendEmail: false,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setUserFormOpen(true);
  };

  const handleEditUser = (user: AdminUserDetailsDto) => {
    setEditingUser(user);
    setUserFormOpen(true);
  };

  const handleViewUser = (user: AdminUserDetailsDto) => {
    setViewingUser(user);
    setUserDetailsOpen(true);
  };

  const handleResetPassword = (user: AdminUserDetailsDto) => {
    setResetPasswordUser(user);
    setPasswordResetOpen(true);
  };

  const handleUserFormSuccess = (user: AdminUserDetailsDto) => {
    // Trigger refresh of user list
    setRefreshTrigger(prev => prev + 1);
    setUserFormOpen(false);
    setEditingUser(null);
  };

  const handleCloseUserForm = () => {
    setUserFormOpen(false);
    setEditingUser(null);
  };

  const handleCloseUserDetails = () => {
    setUserDetailsOpen(false);
    setViewingUser(null);
  };

  const handleConfirmPasswordReset = async () => {
    if (!resetPasswordUser) return;

    try {
      await UserService.resetUserPassword(resetPasswordUser.id, passwordResetSettings);
      setPasswordResetOpen(false);
      setResetPasswordUser(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to reset password:', error);
    }
  };

  const handleClosePasswordReset = () => {
    setPasswordResetOpen(false);
    setResetPasswordUser(null);
  };

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <IdeomniPageSimple
      header={
        <Box className="flex flex-col w-full px-24 sm:px-32">
          {/* Breadcrumbs */}
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link
              underline="hover"
              color="inherit"
              href="/"
              className="flex items-center"
            >
              <DashboardIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              {t('DASHBOARDS', { ns: 'navigation' })}
            </Link>
            <Typography color="text.primary" className="flex items-center">
              <PeopleIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              {t('USER_MANAGEMENT')}
            </Typography>
          </Breadcrumbs>

          {/* Page Header */}
          <div className="flex flex-col space-y-8 sm:space-y-0 sm:space-x-16 sm:flex-row w-full justify-between items-start sm:items-center">
            <div className="flex flex-col">
              <Typography
                component="h1"
                className="text-4xl md:text-5xl font-extrabold tracking-tight leading-7 sm:leading-10 truncate"
              >
                {t('USER_MANAGEMENT')}
              </Typography>
              <Typography
                className="text-lg opacity-80 tracking-tight max-w-md"
                color="text.secondary"
              >
                {t('USER_MANAGEMENT_SUBTITLE')}
              </Typography>
            </div>
          </div>
        </Box>
      }
      content={
        <div className="flex flex-col w-full px-24 sm:px-32 pb-24">
          {/* Main Content */}
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="user management tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab 
                  icon={<PeopleIcon />} 
                  label={t('USERS')} 
                  {...a11yProps(0)} 
                  iconPosition="start"
                />
                <Tab 
                  icon={<AnalyticsIcon />} 
                  label={t('USER_ANALYTICS')} 
                  {...a11yProps(1)} 
                  iconPosition="start"
                />
                <Tab 
                  icon={<GetAppIcon />} 
                  label={t('DATA_EXPORT')} 
                  {...a11yProps(2)} 
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            <CardContent sx={{ p: 0 }}>
              {/* Users Management Tab */}
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ p: 3 }}>
                  <UserList
                    key={refreshTrigger}
                    onCreateUser={handleCreateUser}
                    onEditUser={handleEditUser}
                    onViewUser={handleViewUser}
                    onResetPassword={handleResetPassword}
                    refreshTrigger={refreshTrigger}
                  />
                </Box>
              </TabPanel>

              {/* User Analytics Tab */}
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ p: 3 }}>
                  <UserStatistics
                    refreshTrigger={refreshTrigger}
                    onRefresh={refreshData}
                  />
                </Box>
              </TabPanel>

              {/* Data Export Tab */}
              <TabPanel value={tabValue} index={2}>
                <Box sx={{ p: 3 }}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center', py: 8 }}>
                      <GetAppIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        {t('DATA_EXPORT')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Export user data in various formats for reporting and analysis
                      </Typography>
                      <Alert severity="info" sx={{ mt: 2 }}>
                        Data export functionality will be available in the next update.
                      </Alert>
                    </CardContent>
                  </Card>
                </Box>
              </TabPanel>
            </CardContent>
          </Card>

          {/* User Form Dialog */}
          <UserForm
            open={userFormOpen}
            onClose={handleCloseUserForm}
            user={editingUser}
            onSuccess={handleUserFormSuccess}
          />

          {/* User Details Dialog */}
          <Dialog 
            open={userDetailsOpen} 
            onClose={handleCloseUserDetails}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">
                  {t('USER_DETAILS')}
                </Typography>
                <IconButton onClick={handleCloseUserDetails} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              {viewingUser && (
                <Box>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('USERNAME')}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {viewingUser.username}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('EMAIL')}
                      </Typography>
                      <Typography variant="body1">
                        {viewingUser.email}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 6 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('FIRST_NAME')}
                      </Typography>
                      <Typography variant="body1">
                        {viewingUser.firstName || '-'}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 6 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('LAST_NAME')}
                      </Typography>
                      <Typography variant="body1">
                        {viewingUser.lastName || '-'}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 6 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('USER_TYPE')}
                      </Typography>
                      <Chip
                        label={UserService.getUserTypeName(viewingUser.userType)}
                        size="small"
                        color="primary"
                      />
                    </Grid>

                    <Grid size={{ xs: 6 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('STATUS')}
                      </Typography>
                      <Chip
                        label={viewingUser.isActive ? t('ACTIVE') : t('INACTIVE')}
                        size="small"
                        color={viewingUser.isActive ? 'success' : 'default'}
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('ROLES')}
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {viewingUser.roles && viewingUser.roles.length > 0 ? (
                          viewingUser.roles.map((role) => (
                            <Chip key={role} label={role} size="small" variant="outlined" />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            {t('NONE')}
                          </Typography>
                        )}
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 6 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('LAST_LOGIN')}
                      </Typography>
                      <Typography variant="body2">
                        {viewingUser.lastLoginAt ? formatDate(viewingUser.lastLoginAt) : t('NEVER')}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 6 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('CREATED_AT')}
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(viewingUser.createdAt)}
                      </Typography>
                    </Grid>

                    {viewingUser.statistics && (
                      <>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                            {t('USER_ACTIVITIES')}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 4 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            {t('ACTIVITIES_PARTICIPATED')}
                          </Typography>
                          <Typography variant="h6" color="primary">
                            {viewingUser.statistics.activitiesParticipated}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 4 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            {t('ACTIVITIES_COMPLETED')}
                          </Typography>
                          <Typography variant="h6" color="success.main">
                            {viewingUser.statistics.activitiesCompleted}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 4 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            {t('TOTAL_LOGIN_COUNT')}
                          </Typography>
                          <Typography variant="h6" color="info.main">
                            {viewingUser.statistics.totalLoginCount}
                          </Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseUserDetails}>
                {t('CLOSE')}
              </Button>
              {viewingUser && (
                <Button 
                  variant="contained" 
                  onClick={() => {
                    handleCloseUserDetails();
                    handleEditUser(viewingUser);
                  }}
                >
                  {t('EDIT_USER')}
                </Button>
              )}
            </DialogActions>
          </Dialog>

          {/* Password Reset Dialog */}
          <Dialog 
            open={passwordResetOpen} 
            onClose={handleClosePasswordReset}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">
                  {t('RESET_PASSWORD_TITLE')}
                </Typography>
                <IconButton onClick={handleClosePasswordReset} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              {resetPasswordUser && (
                <Box>
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    {t('RESET_PASSWORD_CONFIRM')}
                    <br />
                    <strong>{resetPasswordUser.username} ({resetPasswordUser.email})</strong>
                  </Alert>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={passwordResetSettings.generateTemporary}
                            onChange={(e) => setPasswordResetSettings(prev => ({
                              ...prev,
                              generateTemporary: e.target.checked
                            }))}
                          />
                        }
                        label={t('GENERATE_TEMPORARY')}
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={passwordResetSettings.requireChange}
                            onChange={(e) => setPasswordResetSettings(prev => ({
                              ...prev,
                              requireChange: e.target.checked
                            }))}
                          />
                        }
                        label={t('REQUIRE_CHANGE')}
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={passwordResetSettings.sendEmail}
                            onChange={(e) => setPasswordResetSettings(prev => ({
                              ...prev,
                              sendEmail: e.target.checked
                            }))}
                          />
                        }
                        label={t('SEND_EMAIL')}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClosePasswordReset}>
                {t('CANCEL')}
              </Button>
              <Button 
                variant="contained" 
                color="warning"
                onClick={handleConfirmPasswordReset}
                startIcon={<VpnKeyIcon />}
              >
                {t('RESET_PASSWORD')}
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      }
    />
  );
};

export default UserManagementPage; 