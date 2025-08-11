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
} from '@mui/material';
import {
  SupervisorAccount as SupervisorAccountIcon,
  History as HistoryIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import IdeomniPageSimple from '@ideomni/core/IdeomniPageSimple';
import AdminList from '@/components/admin-management/AdminList';
import AdminForm from '@/components/admin-management/AdminForm';
import OperationLogs from '@/components/admin-management/OperationLogs';

import { Admin } from '@/lib/services/adminService';

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
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
}

const AdminManagementPage: React.FC = () => {
  const { t } = useTranslation('adminManagement');
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [adminFormOpen, setAdminFormOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [logsDialogOpen, setLogsDialogOpen] = useState(false);
  const [selectedAdminForLogs, setSelectedAdminForLogs] = useState<Admin | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateAdmin = () => {
    setEditingAdmin(null);
    setAdminFormOpen(true);
  };

  const handleEditAdmin = (admin: Admin) => {
    setEditingAdmin(admin);
    setAdminFormOpen(true);
  };

  const handleViewLogs = (admin: Admin) => {
    setSelectedAdminForLogs(admin);
    setLogsDialogOpen(true);
  };

  const handleViewSystemLogs = () => {
    setSelectedAdminForLogs(null);
    setLogsDialogOpen(true);
  };

  const handleAdminFormSuccess = (admin: Admin) => {
    // Trigger refresh of admin list
    setRefreshTrigger(prev => prev + 1);
    setAdminFormOpen(false);
    setEditingAdmin(null);
  };

  const handleCloseAdminForm = () => {
    setAdminFormOpen(false);
    setEditingAdmin(null);
  };

  const handleCloseLogsDialog = () => {
    setLogsDialogOpen(false);
    setSelectedAdminForLogs(null);
  };

  return (
    <IdeomniPageSimple
      header={
        <Box sx={{ p: 3 }}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link color="inherit" href="/" underline="hover">
              <DashboardIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              {t('DASHBOARD', { ns: 'navigation' })}
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <SupervisorAccountIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              {t('ADMIN_MANAGEMENT')}
            </Typography>
          </Breadcrumbs>
          
          <Typography variant="h4" component="h1" gutterBottom>
            {t('ADMIN_MANAGEMENT')}
          </Typography>
          
          <Typography variant="body1" color="text.secondary">
            {t('ADMIN_MANAGEMENT_SUBTITLE')}
          </Typography>
        </Box>
      }
      content={
        <Box sx={{ p: 3 }}>
          {/* Tabs */}
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="admin management tabs"
                variant="fullWidth"
              >
                <Tab 
                  label={t('ADMIN_ACCOUNTS')} 
                  icon={<SupervisorAccountIcon />} 
                  iconPosition="start"
                  {...a11yProps(0)} 
                />
                <Tab 
                  label={t('SYSTEM_LOGS')} 
                  icon={<HistoryIcon />} 
                  iconPosition="start"
                  {...a11yProps(1)} 
                />
              </Tabs>
            </Box>

            {/* Tab Content */}
            <CardContent sx={{ p: 0 }}>
              {/* Admin Accounts Tab */}
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ p: 3 }}>
                  <AdminList
                    key={refreshTrigger} // Force re-render when admin changes
                    onCreateAdmin={handleCreateAdmin}
                    onEditAdmin={handleEditAdmin}
                    onViewLogs={handleViewLogs}
                  />
                </Box>
              </TabPanel>

              {/* System Logs Tab */}
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ p: 3 }}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center', py: 8 }}>
                      <HistoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        {t('SYSTEM_LOGS_TITLE')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {t('SYSTEM_LOGS_DESCRIPTION')}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="primary"
                        sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={handleViewSystemLogs}
                      >
                        {t('OPEN_SYSTEM_LOGS_VIEWER')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </TabPanel>
            </CardContent>
          </Card>

          {/* Admin Form Dialog */}
          <AdminForm
            open={adminFormOpen}
            onClose={handleCloseAdminForm}
            admin={editingAdmin}
            onSuccess={handleAdminFormSuccess}
          />

          {/* Operation Logs Dialog */}
          <OperationLogs
            open={logsDialogOpen}
            onClose={handleCloseLogsDialog}
            admin={selectedAdminForLogs}
            title={selectedAdminForLogs ? undefined : t('SYSTEM_OPERATION_LOGS')}
          />
        </Box>
      }
    />
  );
};

export default AdminManagementPage; 