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
  const { t } = useTranslation();
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
      setError(err.message || t('infrastructure.ERROR_LOADING_DATA'));
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
              {t('infrastructure.DASHBOARD')}
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <PowerIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              {t('infrastructure.INFRASTRUCTURE_MANAGEMENT')}
            </Typography>
          </Breadcrumbs>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {t('infrastructure.INFRASTRUCTURE_MANAGEMENT')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('infrastructure.INFRASTRUCTURE_SUBTITLE')}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
            >
              {t('infrastructure.REFRESH')}
            </Button>
          </Box>

          {/* Summary Statistics */}
          {teamFacilitiesStatus && (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
              <Card sx={{ 
                flex: '1 1 200px', 
                minWidth: 150,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 1
              }}>
                <CardContent sx={{ textAlign: 'center', py: 2, px: 3 }}>
                  <Typography 
                    variant="overline" 
                    color="text.secondary" 
                    display="block"
                    sx={{ fontSize: '0.7rem', letterSpacing: 1, mb: 0.5 }}
                  >
                    {t('infrastructure.TOTAL_FACILITIES')}
                  </Typography>
                  <Typography variant="h3" fontWeight={600} color="primary.main">
                    {teamFacilitiesStatus.summary.totalFacilities}
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ 
                flex: '1 1 200px', 
                minWidth: 150,
                bgcolor: 'success.main',
                color: 'white',
                boxShadow: 1
              }}>
                <CardContent sx={{ textAlign: 'center', py: 2, px: 3 }}>
                  <Typography 
                    variant="overline" 
                    display="block"
                    sx={{ fontSize: '0.7rem', letterSpacing: 1, mb: 0.5, opacity: 0.95 }}
                  >
                    {t('infrastructure.FULLY_OPERATIONAL')}
                  </Typography>
                  <Typography variant="h3" fontWeight={600}>
                    {teamFacilitiesStatus.summary.fullyOperational}
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ 
                flex: '1 1 200px', 
                minWidth: 150,
                bgcolor: 'warning.main',
                color: 'white',
                boxShadow: 1
              }}>
                <CardContent sx={{ textAlign: 'center', py: 2, px: 3 }}>
                  <Typography 
                    variant="overline" 
                    display="block"
                    sx={{ fontSize: '0.7rem', letterSpacing: 1, mb: 0.5, opacity: 0.95 }}
                  >
                    {t('infrastructure.PARTIALLY_OPERATIONAL')}
                  </Typography>
                  <Typography variant="h3" fontWeight={600}>
                    {teamFacilitiesStatus.summary.partiallyOperational}
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ 
                flex: '1 1 200px', 
                minWidth: 150,
                bgcolor: 'error.main',
                color: 'white',
                boxShadow: 1
              }}>
                <CardContent sx={{ textAlign: 'center', py: 2, px: 3 }}>
                  <Typography 
                    variant="overline" 
                    display="block"
                    sx={{ fontSize: '0.7rem', letterSpacing: 1, mb: 0.5, opacity: 0.95 }}
                  >
                    {t('infrastructure.NON_OPERATIONAL')}
                  </Typography>
                  <Typography variant="h3" fontWeight={600}>
                    {teamFacilitiesStatus.summary.nonOperational}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
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
                <Typography variant="h6">{t('infrastructure.INFRASTRUCTURE_OVERVIEW')}</Typography>
                {teamFacilitiesStatus && (
                  <Box sx={{ ml: 'auto', mr: 2, display: 'flex', gap: 1 }}>
                    <Chip 
                      icon={<WaterIcon />} 
                      label={t('infrastructure.WATER')} 
                      size="small" 
                      color={teamFacilitiesStatus.facilities.some((f: any) => 
                        f.infrastructureStatus?.water?.connected
                      ) ? 'success' : 'default'}
                    />
                    <Chip 
                      icon={<PowerIcon />} 
                      label={t('infrastructure.POWER')} 
                      size="small"
                      color={teamFacilitiesStatus.facilities.some((f: any) => 
                        f.infrastructureStatus?.power?.connected
                      ) ? 'success' : 'default'}
                    />
                    <Chip 
                      icon={<BaseStationIcon />} 
                      label={t('infrastructure.BASE_STATION')} 
                      size="small"
                      color={teamFacilitiesStatus.facilities.some((f: any) => 
                        f.infrastructureStatus?.baseStation?.covered
                      ) ? 'success' : 'default'}
                    />
                    <Chip 
                      icon={<FireStationIcon />} 
                      label={t('infrastructure.FIRE_STATION')} 
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
                <Typography variant="h6">{t('infrastructure.DISCOVER_PROVIDERS')}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('infrastructure.FIND_AVAILABLE_INFRASTRUCTURE')}
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
                <Typography variant="h6">{t('infrastructure.CONNECTIONS_MANAGEMENT')}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('infrastructure.WATER_POWER_CONNECTIONS')}
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
                <Typography variant="h6">{t('infrastructure.SERVICE_SUBSCRIPTIONS')}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('infrastructure.BASE_FIRE_STATION_SERVICES')}
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
                  <Typography variant="h6">{t('infrastructure.PROVIDER_DASHBOARD')}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('infrastructure.MANAGE_YOUR_INFRASTRUCTURE')}
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