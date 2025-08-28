'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Breadcrumbs,
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  LinearProgress,
  Alert,
  Button,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Dashboard as DashboardIcon,
  PowerSettingsNew as PowerIcon,
  WaterDrop as WaterIcon,
  CellTower as BaseStationIcon,
  LocalFireDepartment as FireStationIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import IdeomniPageSimple from '@ideomni/core/IdeomniPageSimple';
import {
  InfrastructureOverview,
  ConnectionManager,
  ServiceManager,
  ProviderDashboard,
  DiscoveryPanel,
} from '@/components/infrastructure';
import infrastructureService, { OperationalStatus } from '@/lib/services/infrastructureService';

const InfrastructurePage: React.FC = () => {
  const { t } = useTranslation('infrastructure');
  const theme = useTheme();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>(['overview']);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Data states
  const [teamFacilitiesStatus, setTeamFacilitiesStatus] = useState<any>(null);
  const [hasProviderFacilities, setHasProviderFacilities] = useState(false);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load team facilities status
      const status = await infrastructureService.getTeamFacilitiesStatus();
      setTeamFacilitiesStatus(status);
      
      // Check if team has any provider facilities
      const providerTypes = ['WATER_PLANT', 'POWER_PLANT', 'BASE_STATION', 'FIRE_STATION'];
      const hasProvider = status.facilities.some((f: any) => 
        providerTypes.includes(f.facilityType)
      );
      setHasProviderFacilities(hasProvider);
    } catch (err: any) {
      setError(err.message || t('ERROR_LOADING_DATA'));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSectionChange = (section: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSections(prev => 
      isExpanded 
        ? [...prev, section]
        : prev.filter(s => s !== section)
    );
  };

  const getOperationalStatusColor = (status: OperationalStatus) => {
    switch (status) {
      case OperationalStatus.FULL:
        return theme.palette.success.main;
      case OperationalStatus.PARTIAL:
        return theme.palette.warning.main;
      case OperationalStatus.NON_OPERATIONAL:
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getOperationalStatusIcon = (status: OperationalStatus) => {
    switch (status) {
      case OperationalStatus.FULL:
        return <CheckIcon fontSize="small" />;
      case OperationalStatus.PARTIAL:
        return <WarningIcon fontSize="small" />;
      case OperationalStatus.NON_OPERATIONAL:
        return <CancelIcon fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <IdeomniPageSimple
      header={
        <Box sx={{ p: 3 }}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link color="inherit" href="/" underline="hover">
              <DashboardIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              {t('DASHBOARD')}
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <PowerIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              {t('INFRASTRUCTURE_MANAGEMENT')}
            </Typography>
          </Breadcrumbs>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {t('INFRASTRUCTURE_MANAGEMENT')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('INFRASTRUCTURE_SUBTITLE')}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
            >
              {t('REFRESH')}
            </Button>
          </Box>

          {/* Summary Statistics */}
          {teamFacilitiesStatus && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'background.paper', height: '100%' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('TOTAL_FACILITIES')}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {teamFacilitiesStatus.summary.totalFacilities}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText', height: '100%' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="body2" gutterBottom sx={{ opacity: 0.9 }}>
                      {t('FULLY_OPERATIONAL')}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {teamFacilitiesStatus.summary.fullyOperational}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText', height: '100%' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="body2" gutterBottom sx={{ opacity: 0.9 }}>
                      {t('PARTIALLY_OPERATIONAL')}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {teamFacilitiesStatus.summary.partiallyOperational}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText', height: '100%' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="body2" gutterBottom sx={{ opacity: 0.9 }}>
                      {t('NON_OPERATIONAL')}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {teamFacilitiesStatus.summary.nonOperational}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      }
      content={
        <Box sx={{ p: 3 }}>
          {loading && <LinearProgress sx={{ mb: 2 }} />}
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Infrastructure Overview Section - Always Expanded */}
          <Accordion 
            expanded={expandedSections.includes('overview')}
            onChange={handleSectionChange('overview')}
            sx={{ mb: 2, bgcolor: 'background.paper' }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <DashboardIcon />
                <Typography variant="h6">{t('INFRASTRUCTURE_OVERVIEW')}</Typography>
                {teamFacilitiesStatus && (
                  <Box sx={{ ml: 'auto', mr: 2, display: 'flex', gap: 1 }}>
                    <Chip 
                      icon={<WaterIcon />} 
                      label={t('WATER')} 
                      size="small" 
                      color={teamFacilitiesStatus.facilities.some((f: any) => 
                        f.infrastructureStatus?.water?.connected
                      ) ? 'success' : 'default'}
                    />
                    <Chip 
                      icon={<PowerIcon />} 
                      label={t('POWER')} 
                      size="small"
                      color={teamFacilitiesStatus.facilities.some((f: any) => 
                        f.infrastructureStatus?.power?.connected
                      ) ? 'success' : 'default'}
                    />
                    <Chip 
                      icon={<BaseStationIcon />} 
                      label={t('BASE_STATION')} 
                      size="small"
                      color={teamFacilitiesStatus.facilities.some((f: any) => 
                        f.infrastructureStatus?.baseStation?.covered
                      ) ? 'success' : 'default'}
                    />
                    <Chip 
                      icon={<FireStationIcon />} 
                      label={t('FIRE_STATION')} 
                      size="small"
                      color={teamFacilitiesStatus.facilities.some((f: any) => 
                        f.infrastructureStatus?.fireStation?.covered
                      ) ? 'success' : 'default'}
                    />
                  </Box>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <InfrastructureOverview 
                facilities={teamFacilitiesStatus?.facilities || []}
                onRefresh={handleRefresh}
              />
            </AccordionDetails>
          </Accordion>

          {/* Discovery Panel Section */}
          <Accordion 
            expanded={expandedSections.includes('discovery')}
            onChange={handleSectionChange('discovery')}
            sx={{ mb: 2, bgcolor: 'background.paper' }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <BaseStationIcon />
                <Typography variant="h6">{t('DISCOVER_PROVIDERS')}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('FIND_AVAILABLE_INFRASTRUCTURE')}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <DiscoveryPanel 
                facilities={teamFacilitiesStatus?.facilities || []}
                onRequestConnection={handleRefresh}
                onSubscribeService={handleRefresh}
              />
            </AccordionDetails>
          </Accordion>

          {/* Connections Management Section */}
          <Accordion 
            expanded={expandedSections.includes('connections')}
            onChange={handleSectionChange('connections')}
            sx={{ mb: 2, bgcolor: 'background.paper' }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <WaterIcon />
                <Typography variant="h6">{t('CONNECTIONS_MANAGEMENT')}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('WATER_POWER_CONNECTIONS')}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <ConnectionManager 
                facilities={teamFacilitiesStatus?.facilities || []}
                onUpdate={handleRefresh}
              />
            </AccordionDetails>
          </Accordion>

          {/* Service Subscriptions Section */}
          <Accordion 
            expanded={expandedSections.includes('services')}
            onChange={handleSectionChange('services')}
            sx={{ mb: 2, bgcolor: 'background.paper' }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FireStationIcon />
                <Typography variant="h6">{t('SERVICE_SUBSCRIPTIONS')}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('BASE_FIRE_STATION_SERVICES')}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <ServiceManager 
                facilities={teamFacilitiesStatus?.facilities || []}
                onUpdate={handleRefresh}
              />
            </AccordionDetails>
          </Accordion>

          {/* Provider Dashboard - Only show if team has infrastructure facilities */}
          {hasProviderFacilities && (
            <Accordion 
              expanded={expandedSections.includes('provider')}
              onChange={handleSectionChange('provider')}
              sx={{ mb: 2, bgcolor: 'background.paper' }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PowerIcon />
                  <Typography variant="h6">{t('PROVIDER_DASHBOARD')}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('MANAGE_YOUR_INFRASTRUCTURE')}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <ProviderDashboard 
                  facilities={teamFacilitiesStatus?.facilities.filter((f: any) => 
                    ['WATER_PLANT', 'POWER_PLANT', 'BASE_STATION', 'FIRE_STATION'].includes(f.facilityType)
                  ) || []}
                  onUpdate={handleRefresh}
                />
              </AccordionDetails>
            </Accordion>
          )}
        </Box>
      }
    />
  );
};

export default InfrastructurePage;