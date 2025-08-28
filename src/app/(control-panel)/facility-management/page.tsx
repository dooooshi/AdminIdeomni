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
  Grid,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Settings as SettingsIcon,
  BarChart as BarChartIcon,
  Dashboard as DashboardIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import IdeomniPageSimple from '@ideomni/core/IdeomniPageSimple';
import {
  FacilityList,
  FacilityForm,
  FacilityStatistics,
  FacilityConfigList,
  FacilityConfigForm,
  Facility,
  FacilityConfig,
} from '@/components/facility-management';
import FacilityConfigService from '@/lib/services/facilityConfigService';

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
      id={`facility-tabpanel-${index}`}
      aria-labelledby={`facility-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `facility-tab-${index}`,
    'aria-controls': `facility-tabpanel-${index}`,
  };
}

const FacilityManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [facilityFormOpen, setFacilityFormOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [viewingFacility, setViewingFacility] = useState<Facility | null>(null);
  const [facilityDetailsOpen, setFacilityDetailsOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Configuration management state
  const [configFormOpen, setConfigFormOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<FacilityConfig | null>(null);
  const [viewingConfig, setViewingConfig] = useState<FacilityConfig | null>(null);
  const [configDetailsOpen, setConfigDetailsOpen] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateFacility = () => {
    setEditingFacility(null);
    setFacilityFormOpen(true);
  };

  const handleEditFacility = (facility: Facility) => {
    setEditingFacility(facility);
    setFacilityFormOpen(true);
  };

  const handleViewFacility = (facility: Facility) => {
    setViewingFacility(facility);
    setFacilityDetailsOpen(true);
  };

  const handleFacilityFormSuccess = (facility: Facility) => {
    // Trigger refresh of facility list and statistics
    setRefreshTrigger(prev => prev + 1);
    setFacilityFormOpen(false);
    setEditingFacility(null);
  };

  const handleCloseFacilityForm = () => {
    setFacilityFormOpen(false);
    setEditingFacility(null);
  };

  const handleCloseFacilityDetails = () => {
    setFacilityDetailsOpen(false);
    setViewingFacility(null);
  };

  // Configuration management handlers
  const handleCreateConfig = () => {
    setEditingConfig(null);
    setConfigFormOpen(true);
  };

  const handleEditConfig = (config: FacilityConfig) => {
    setEditingConfig(config);
    setConfigFormOpen(true);
  };

  const handleViewConfig = (config: FacilityConfig) => {
    setViewingConfig(config);
    setConfigDetailsOpen(true);
  };

  const handleConfigFormSuccess = (config: FacilityConfig) => {
    // Trigger refresh of configuration list
    setRefreshTrigger(prev => prev + 1);
    setConfigFormOpen(false);
    setEditingConfig(null);
  };

  const handleCloseConfigForm = () => {
    setConfigFormOpen(false);
    setEditingConfig(null);
  };

  const handleCloseConfigDetails = () => {
    setConfigDetailsOpen(false);
    setViewingConfig(null);
  };

  return (
    <IdeomniPageSimple
      header={
        <Box sx={{ p: 3 }}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link color="inherit" href="/" underline="hover">
              <DashboardIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              {t('facilityManagement.DASHBOARD')}
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <BusinessIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              {t('facilityManagement.FACILITY_MANAGEMENT')}
            </Typography>
          </Breadcrumbs>
          
          <Typography variant="h4" component="h1" gutterBottom>
            {t('facilityManagement.FACILITY_MANAGEMENT')}
          </Typography>
          
          <Typography variant="body1" color="text.secondary">
            {t('facilityManagement.FACILITY_MANAGEMENT_SUBTITLE')}
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
                aria-label="facility management tabs"
                variant="fullWidth"
              >
                <Tab 
                  label={t('facilityManagement.FACILITY_LIST_TAB')} 
                  icon={<ViewListIcon />} 
                  iconPosition="start"
                  {...a11yProps(0)} 
                />
                <Tab 
                  label={t('facilityManagement.CONFIGURATIONS_TAB')} 
                  icon={<SettingsIcon />} 
                  iconPosition="start"
                  {...a11yProps(1)} 
                />
                <Tab 
                  label={t('facilityManagement.STATISTICS_TAB')} 
                  icon={<BarChartIcon />} 
                  iconPosition="start"
                  {...a11yProps(2)} 
                />
              </Tabs>
            </Box>

            {/* Tab Content */}
            <CardContent sx={{ p: 0 }}>
              {/* Facility List Tab */}
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ p: 3 }}>
                  <FacilityList
                    key={refreshTrigger} // Force re-render when facility changes
                    onCreateFacility={handleCreateFacility}
                    onEditFacility={handleEditFacility}
                    onViewFacility={handleViewFacility}
                  />
                </Box>
              </TabPanel>

              {/* Configuration Tab */}
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ p: 3 }}>
                  <FacilityConfigList
                    key={refreshTrigger} // Force re-render when configuration changes
                    onCreateConfig={handleCreateConfig}
                    onEditConfig={handleEditConfig}
                    onViewConfig={handleViewConfig}
                  />
                </Box>
              </TabPanel>

              {/* Statistics Tab */}
              <TabPanel value={tabValue} index={2}>
                <Box sx={{ p: 3 }}>
                  <FacilityStatistics
                    refreshTrigger={refreshTrigger}
                    onRefresh={() => setRefreshTrigger(prev => prev + 1)}
                  />
                </Box>
              </TabPanel>
            </CardContent>
          </Card>

          {/* Facility Form Dialog */}
          <FacilityForm
            open={facilityFormOpen}
            onClose={handleCloseFacilityForm}
            facility={editingFacility}
            onSuccess={handleFacilityFormSuccess}
          />

          {/* Facility Details Dialog */}
          <Dialog 
            open={facilityDetailsOpen} 
            onClose={handleCloseFacilityDetails}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={2}>
                <BusinessIcon />
                <Box>
                  <Typography variant="h6">
                    {t('facilityManagement.VIEW_FACILITY')}
                  </Typography>
                  {viewingFacility && (
                    <Typography variant="body2" color="textSecondary">
                      {viewingFacility.name}
                    </Typography>
                  )}
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              {viewingFacility && (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="textSecondary">
                      {t('facilityManagement.NAME')}
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {viewingFacility.name}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="textSecondary">
                      {t('facilityManagement.TYPE')}
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {t(viewingFacility.facilityType)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="textSecondary">
                      {t('facilityManagement.CATEGORY')}
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {t(viewingFacility.category)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="textSecondary">
                      {t('facilityManagement.STATUS')}
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" color={viewingFacility.isActive ? 'success.main' : 'warning.main'}>
                      {viewingFacility.isActive ? t('facilityManagement.ACTIVE') : t('facilityManagement.INACTIVE')}
                    </Typography>
                  </Grid>
                  {viewingFacility.description && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="body2" color="textSecondary">
                        {t('facilityManagement.DESCRIPTION')}
                      </Typography>
                      <Typography variant="body1">
                        {viewingFacility.description}
                      </Typography>
                    </Grid>
                  )}
                  {viewingFacility.capacity && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="body2" color="textSecondary">
                        {t('facilityManagement.CAPACITY')}
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {viewingFacility.capacity.toLocaleString()}
                      </Typography>
                    </Grid>
                  )}
                  {viewingFacility.buildCost && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="body2" color="textSecondary">
                        {t('facilityManagement.BUILD_COST')}
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        ${viewingFacility.buildCost.toLocaleString()}
                      </Typography>
                    </Grid>
                  )}
                  {viewingFacility.maintenanceCost && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="body2" color="textSecondary">
                        {t('facilityManagement.MAINTENANCE_COST')}
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        ${viewingFacility.maintenanceCost.toLocaleString()} {t('facilityManagement.PER_MONTH')}
                      </Typography>
                    </Grid>
                  )}
                  {viewingFacility.operationCost && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="body2" color="textSecondary">
                        {t('facilityManagement.OPERATION_COST')}
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        ${viewingFacility.operationCost.toLocaleString()} {t('facilityManagement.PER_DAY')}
                      </Typography>
                    </Grid>
                  )}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="textSecondary">
                      {t('facilityManagement.CREATED_AT')}
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {new Date(viewingFacility.createdAt).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="textSecondary">
                      {t('facilityManagement.UPDATED_AT')}
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {new Date(viewingFacility.updatedAt).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseFacilityDetails}>
                {t('facilityManagement.CLOSE')}
              </Button>
              {viewingFacility && (
                <Button 
                  variant="contained"
                  onClick={() => {
                    handleCloseFacilityDetails();
                    handleEditFacility(viewingFacility);
                  }}
                >
                  {t('facilityManagement.EDIT')}
                </Button>
              )}
            </DialogActions>
          </Dialog>

          {/* Configuration Form Dialog */}
          <FacilityConfigForm
            open={configFormOpen}
            onClose={handleCloseConfigForm}
            config={editingConfig}
            onSuccess={handleConfigFormSuccess}
          />

          {/* Configuration Details Dialog */}
          <Dialog 
            open={configDetailsOpen} 
            onClose={handleCloseConfigDetails}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={2}>
                <SettingsIcon />
                <Box>
                  <Typography variant="h6">
                    {t('facilityManagement.CONFIGURATION_DETAILS')}
                  </Typography>
                  {viewingConfig && (
                    <Typography variant="body2" color="text.secondary">
                      {t(`FACILITY_TYPE_${viewingConfig.facilityType}`)} - {t(`FACILITY_CATEGORY_${viewingConfig.category}`)}
                    </Typography>
                  )}
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              {viewingConfig && (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {t('facilityManagement.BASIC_INFORMATION')}
                    </Typography>
                    <Typography><strong>{t('facilityManagement.FACILITY_TYPE')}:</strong> {t(`FACILITY_TYPE_${viewingConfig.facilityType}`)}</Typography>
                    <Typography><strong>{t('facilityManagement.CATEGORY')}:</strong> {t(`FACILITY_CATEGORY_${viewingConfig.category}`)}</Typography>
                    <Typography><strong>{t('facilityManagement.STATUS')}:</strong> {viewingConfig.isActive ? t('facilityManagement.ACTIVE') : t('facilityManagement.INACTIVE')}</Typography>
                    <Typography><strong>{t('facilityManagement.CREATED_DATE')}:</strong> {new Date(viewingConfig.createdAt).toLocaleString()}</Typography>
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {t('facilityManagement.CAPACITY_CONFIGURATION')}
                    </Typography>
                    <Typography><strong>{t('facilityManagement.MIN_CAPACITY')}:</strong> {FacilityConfigService.formatCapacity(viewingConfig.minCapacity)}</Typography>
                    <Typography><strong>{t('facilityManagement.MAX_CAPACITY')}:</strong> {FacilityConfigService.formatCapacity(viewingConfig.maxCapacity)}</Typography>
                    {viewingConfig.defaultCapacity && (
                      <Typography><strong>{t('facilityManagement.DEFAULT_CAPACITY')}:</strong> {FacilityConfigService.formatCapacity(viewingConfig.defaultCapacity)}</Typography>
                    )}
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {t('facilityManagement.BUILD_COST')}
                    </Typography>
                    <Typography><strong>{t('facilityManagement.MIN')}:</strong> {FacilityConfigService.formatCurrency(viewingConfig.minBuildCost)}</Typography>
                    <Typography><strong>{t('facilityManagement.MAX')}:</strong> {FacilityConfigService.formatCurrency(viewingConfig.maxBuildCost)}</Typography>
                    {viewingConfig.defaultBuildCost && (
                      <Typography><strong>{t('facilityManagement.DEFAULT')}:</strong> {FacilityConfigService.formatCurrency(viewingConfig.defaultBuildCost)}</Typography>
                    )}
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {t('facilityManagement.MAINTENANCE_COST')}
                    </Typography>
                    <Typography><strong>{t('facilityManagement.MIN')}:</strong> {FacilityConfigService.formatCurrency(viewingConfig.minMaintenanceCost)}</Typography>
                    <Typography><strong>{t('facilityManagement.MAX')}:</strong> {FacilityConfigService.formatCurrency(viewingConfig.maxMaintenanceCost)}</Typography>
                    {viewingConfig.defaultMaintenanceCost && (
                      <Typography><strong>{t('facilityManagement.DEFAULT')}:</strong> {FacilityConfigService.formatCurrency(viewingConfig.defaultMaintenanceCost)}</Typography>
                    )}
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {t('facilityManagement.OPERATION_COST')}
                    </Typography>
                    <Typography><strong>{t('facilityManagement.MIN')}:</strong> {FacilityConfigService.formatCurrency(viewingConfig.minOperationCost)}</Typography>
                    <Typography><strong>{t('facilityManagement.MAX')}:</strong> {FacilityConfigService.formatCurrency(viewingConfig.maxOperationCost)}</Typography>
                    {viewingConfig.defaultOperationCost && (
                      <Typography><strong>{t('facilityManagement.DEFAULT')}:</strong> {FacilityConfigService.formatCurrency(viewingConfig.defaultOperationCost)}</Typography>
                    )}
                  </Grid>
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseConfigDetails}>
                {t('facilityManagement.CLOSE')}
              </Button>
              {viewingConfig && (
                <Button 
                  variant="contained"
                  onClick={() => {
                    handleCloseConfigDetails();
                    handleEditConfig(viewingConfig);
                  }}
                >
                  {t('facilityManagement.EDIT')}
                </Button>
              )}
            </DialogActions>
          </Dialog>
        </Box>
      }
    />
  );
};

export default FacilityManagementPage; 