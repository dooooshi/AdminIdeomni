'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Stack,
  Skeleton,
} from '@mui/material';
import {
  CellTower as BaseStationIcon,
  LocalFireDepartment as FireStationIcon,
  CheckCircle as ActiveIcon,
  Schedule as PendingIcon,
  Cancel as CancelIcon,
  Check as AcceptIcon,
  Close as RejectIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import infrastructureService, {
  ServiceSubscription,
  TeamFacility,
  SubscriptionStatus,
} from '@/lib/services/infrastructureService';

interface ServiceManagerProps {
  facilities: TeamFacility[];
  onUpdate: () => void;
}

const ServiceManager: React.FC<ServiceManagerProps> = ({ facilities, onUpdate }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<ServiceSubscription[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Request management states
  const [providerRequests, setProviderRequests] = useState<ServiceSubscription[]>([]);
  const [providerActiveSubscriptions, setProviderActiveSubscriptions] = useState<ServiceSubscription[]>([]);
  const [consumerRequests, setConsumerRequests] = useState<ServiceSubscription[]>([]);
  const [pendingProviderCount, setPendingProviderCount] = useState(0);
  const [pendingConsumerCount, setPendingConsumerCount] = useState(0);
  
  // Dialog states
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceSubscription | null>(null);
  const [annualFee, setAnnualFee] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  
  // Check if user has provider facilities - will update when facilities prop changes
  const hasProviderFacilities = facilities.some(f => 
    ['BASE_STATION', 'FIRE_STATION'].includes(f.facilityType)
  );
  
  const providerFacilities = facilities.filter(f =>
    ['BASE_STATION', 'FIRE_STATION'].includes(f.facilityType)
  );

  useEffect(() => {
    loadAllData();
  }, []);
  
  // Update provider facilities visibility when facilities prop changes
  useEffect(() => {
    // This ensures the tab visibility updates when facilities are loaded
  }, [facilities, hasProviderFacilities]);

  // Only reload data initially, not on tab changes to prevent layout shift
  // Tab switching should just show already loaded data

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Always load consumer data for the badge count
      const consumerData = await infrastructureService.getConsumerSubscriptions();
      setSubscriptions(consumerData.subscriptions || []);
      
      // Load consumer subscription requests - compare status as string
      const consumerPending = (consumerData.subscriptions || []).filter(
        (s: ServiceSubscription) => s.status === 'PENDING' || s.status === SubscriptionStatus.PENDING
      );
      setConsumerRequests(consumerPending);
      setPendingConsumerCount(consumerPending.length);
      
      // Always try to load provider subscription data
      // The backend will return empty if user has no provider facilities
      try {
        // Fetch pending and active subscriptions separately for better performance
        const [pendingData, activeData] = await Promise.all([
          infrastructureService.getProviderSubscriptions(undefined, SubscriptionStatus.PENDING),
          infrastructureService.getProviderSubscriptions(undefined, SubscriptionStatus.ACTIVE)
        ]);
        
        const providerPending = pendingData.subscriptions || [];
        const providerActive = activeData.subscriptions || [];
        
        setProviderRequests(providerPending);
        setProviderActiveSubscriptions(providerActive);
        setPendingProviderCount(providerPending.length);
      } catch (providerErr) {
        // If provider fetch fails, it might be because user has no provider facilities
        // This is not a critical error, so we just silently handle it
        setProviderRequests([]);
        setProviderActiveSubscriptions([]);
        setPendingProviderCount(0);
      }
      
    } catch (err: any) {
      setError(err.message || t('infrastructure.ERROR_LOADING_SUBSCRIPTIONS'));
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    setLoading(true);
    try {
      await infrastructureService.cancelSubscription(subscriptionId, t('infrastructure.NO_LONGER_NEEDED'));
      loadAllData();
      onUpdate();
    } catch (err: any) {
      setError(err.message || t('infrastructure.ERROR_CANCELING_SUBSCRIPTION'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleAcceptRequest = async () => {
    if (!selectedRequest || !annualFee) return;
    
    setLoading(true);
    try {
      await infrastructureService.acceptSubscription(
        selectedRequest.id, // Changed from subscriptionId
        parseFloat(annualFee)
      );
      setAcceptDialogOpen(false);
      setSelectedRequest(null);
      setAnnualFee('');
      loadAllData();
      onUpdate();
    } catch (err: any) {
      setError(err.message || t('infrastructure.ERROR_ACCEPTING_REQUEST'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleRejectRequest = async () => {
    if (!selectedRequest) return;
    
    setLoading(true);
    try {
      await infrastructureService.cancelSubscription(
        selectedRequest.id, // Changed from subscriptionId
        rejectReason || t('infrastructure.REQUEST_REJECTED')
      );
      setRejectDialogOpen(false);
      setSelectedRequest(null);
      setRejectReason('');
      loadAllData();
      onUpdate();
    } catch (err: any) {
      setError(err.message || t('infrastructure.ERROR_REJECTING_REQUEST'));
    } finally {
      setLoading(false);
    }
  };
  
  
  const openAcceptDialog = (request: ServiceSubscription) => {
    setSelectedRequest(request);
    setAnnualFee(request.annualFee?.toString() || '');
    setAcceptDialogOpen(true);
  };
  
  const openRejectDialog = (request: ServiceSubscription) => {
    setSelectedRequest(request);
    setRejectDialogOpen(true);
  };

  const getServiceIcon = (type: string) => {
    return type === 'BASE_STATION' ? <BaseStationIcon /> : <FireStationIcon />;
  };
  
  const getFacilityIcon = (type: string) => {
    switch (type) {
      case 'BASE_STATION':
        return <BaseStationIcon />;
      case 'FIRE_STATION':
        return <FireStationIcon />;
      default:
        return null;
    }
  };
  
  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return 'success';
      case SubscriptionStatus.PENDING:
        return 'warning';
      case SubscriptionStatus.CANCELLED:
      case SubscriptionStatus.REJECTED:
        return 'error';
      case SubscriptionStatus.SUSPENDED:
        return 'default';
      default:
        return 'default';
    }
  };

  // Create skeleton components for loading states
  const SkeletonCard = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="text" width={120} />
          </Box>
          <Skeleton variant="rounded" width={60} height={24} />
        </Box>
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="rectangular" width={100} height={32} sx={{ mt: 2 }} />
      </CardContent>
    </Card>
  );

  if (initialLoading) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
        
        <Skeleton variant="rectangular" width="100%" height={48} sx={{ mb: 2 }} />
        
        <Box sx={{ minHeight: '600px' }}>
          <Skeleton variant="text" width={150} height={24} sx={{ mb: 1 }} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '300px' }}>
              <SkeletonCard />
            </Box>
            <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '300px' }}>
              <SkeletonCard />
            </Box>
          </Box>
          
          <Skeleton variant="text" width={150} height={24} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" width="100%" height={200} />
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {t('infrastructure.SERVICE_SUBSCRIPTIONS')}
        </Typography>
        <IconButton onClick={loadAllData} disabled={loading} size="small">
          <RefreshIcon />
        </IconButton>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Tabs 
        value={activeTab} 
        onChange={(e, newValue) => {
          setActiveTab(newValue);
          loadAllData(); // Refresh data when switching tabs
        }}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        <Tab label={t('infrastructure.CONSUMER_VIEW')} icon={<PeopleIcon />} iconPosition="start" />
        {hasProviderFacilities && (
          <Tab 
            label={
              <Badge badgeContent={pendingProviderCount} color="warning">
                {t('infrastructure.PROVIDER_VIEW')}
              </Badge>
            } 
            icon={<TrendingUpIcon />} 
            iconPosition="start"
          />
        )}
      </Tabs>
      
      {/* Tab Content with consistent height to prevent layout shift */}
      <Box sx={{ minHeight: '600px', position: 'relative' }}>
        {/* Consumer View Tab */}
        <Box sx={{ 
          display: activeTab === 0 ? 'block' : 'none', 
          position: 'relative',
          minHeight: '600px'
        }}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1 }}>
            {t('infrastructure.MY_ACTIVE_SUBSCRIPTIONS')}
          </Typography>
          
          {!subscriptions || subscriptions.filter(s => s.status === 'ACTIVE' || s.status === SubscriptionStatus.ACTIVE).length === 0 ? (
            <Alert severity="info" sx={{ minHeight: '56px', mb: 3 }}>
              {t('infrastructure.NO_ACTIVE_SUBSCRIPTIONS')}
            </Alert>
          ) : (
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('infrastructure.SERVICE_TYPE')}</TableCell>
                    <TableCell>{t('infrastructure.PROVIDER')}</TableCell>
                    <TableCell>{t('infrastructure.PROVIDER_FACILITY')}</TableCell>
                    <TableCell>{t('infrastructure.PROVIDER_TILE')}</TableCell>
                    <TableCell>{t('infrastructure.CONSUMER_FACILITY')}</TableCell>
                    <TableCell>{t('infrastructure.CONSUMER_TILE')}</TableCell>
                    <TableCell>{t('infrastructure.ANNUAL_FEE')}</TableCell>
                    <TableCell>{t('infrastructure.STATUS')}</TableCell>
                    <TableCell>{t('infrastructure.ACTIONS')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subscriptions
                    .filter(s => s && (s.status === 'ACTIVE' || s.status === SubscriptionStatus.ACTIVE))
                    .map((subscription, index) => (
                      <TableRow key={subscription.id || `active-sub-${index}`}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getServiceIcon(subscription.serviceType)}
                            <Typography variant="body2">
                              {t(`infrastructure.${subscription.serviceType || 'SERVICE'}`)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{subscription.providerTeamName || t('infrastructure.UNKNOWN')}</TableCell>
                        <TableCell>{
                          typeof subscription.providerFacility === 'string'
                            ? t(`infrastructure.${subscription.providerFacility}`)
                            : subscription.providerFacility?.facilityType
                              ? t(`infrastructure.${subscription.providerFacility.facilityType}`)
                              : t('infrastructure.UNKNOWN')
                        }</TableCell>
                        <TableCell>{
                          subscription.providerFacilityTileId ||
                          (typeof subscription.providerFacility === 'object' ? subscription.providerFacility?.tileId : undefined) ||
                          '-'
                        }</TableCell>
                        <TableCell>{
                          typeof subscription.consumerFacility === 'string'
                            ? t(`infrastructure.${subscription.consumerFacility}`)
                            : subscription.consumerFacility?.facilityType
                              ? t(`infrastructure.${subscription.consumerFacility.facilityType}`)
                              : t('infrastructure.UNKNOWN')
                        }</TableCell>
                        <TableCell>{
                          subscription.consumerFacilityTileId ||
                          (typeof subscription.consumerFacility === 'object' ? subscription.consumerFacility?.tileId : undefined) ||
                          '-'
                        }</TableCell>
                        <TableCell>${subscription.annualFee || 0}</TableCell>
                        <TableCell>
                          <Chip
                            icon={<ActiveIcon />}
                            label={t('infrastructure.ACTIVE')}
                            color="success"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={() => handleCancelSubscription(subscription.id)}
                          >
                            {t('infrastructure.CANCEL')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, mb: 1 }}>
            {t('infrastructure.MY_PENDING_REQUESTS')}
          </Typography>
          
          {consumerRequests.length === 0 ? (
            <Alert severity="info" sx={{ minHeight: '56px' }}>
              {t('infrastructure.NO_PENDING_SERVICE_REQUESTS')}
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('infrastructure.SERVICE_TYPE')}</TableCell>
                    <TableCell>{t('infrastructure.PROVIDER')}</TableCell>
                    <TableCell>{t('infrastructure.PROVIDER_FACILITY')}</TableCell>
                    <TableCell>{t('infrastructure.PROVIDER_TILE')}</TableCell>
                    <TableCell>{t('infrastructure.CONSUMER_FACILITY')}</TableCell>
                    <TableCell>{t('infrastructure.CONSUMER_TILE')}</TableCell>
                    <TableCell>{t('infrastructure.ANNUAL_FEE')}</TableCell>
                    <TableCell>{t('infrastructure.STATUS')}</TableCell>
                    <TableCell>{t('infrastructure.ACTIONS')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {consumerRequests.map((request, index) => (
                    <TableRow key={request.id || `consumer-request-${index}`}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getServiceIcon(request.serviceType)}
                          <Typography variant="body2">
                            {t(`infrastructure.${request.serviceType}`)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{request.providerTeamName || t('infrastructure.UNKNOWN')}</TableCell>
                      <TableCell>{
                        typeof request.providerFacility === 'string'
                          ? t(`infrastructure.${request.providerFacility}`)
                          : request.providerFacility?.facilityType
                            ? t(`infrastructure.${request.providerFacility.facilityType}`)
                            : '-'
                      }</TableCell>
                      <TableCell>{
                        request.providerFacilityTileId ||
                        (typeof request.providerFacility === 'object' ? request.providerFacility?.tileId : undefined) ||
                        '-'
                      }</TableCell>
                      <TableCell>{
                        typeof request.consumerFacility === 'string'
                          ? t(`infrastructure.${request.consumerFacility}`)
                          : request.consumerFacility?.facilityType
                            ? t(`infrastructure.${request.consumerFacility.facilityType}`)
                            : '-'
                      }</TableCell>
                      <TableCell>{
                        request.consumerFacilityTileId ||
                        (typeof request.consumerFacility === 'object' ? request.consumerFacility?.tileId : undefined) ||
                        '-'
                      }</TableCell>
                      <TableCell>${request.annualFee}</TableCell>
                      <TableCell>
                        <Chip 
                          label={t('infrastructure.PENDING')} 
                          color="warning"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={() => handleCancelSubscription(request.id)}
                        >
                          {t('infrastructure.CANCEL')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
        
        {/* Provider View Tab */}
        {hasProviderFacilities && (
          <Box sx={{ 
            display: activeTab === 1 ? 'block' : 'none', 
            position: 'relative',
            minHeight: '600px'
          }}>
          {/* Provider Facilities Overview */}
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1 }}>
            {t('infrastructure.MY_SERVICE_FACILITIES')}
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            {providerFacilities.map((facility) => (
              <Box key={facility.facilityId} sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '300px' }}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getFacilityIcon(facility.facilityType)}
                        <Box>
                          <Typography variant="h6">
                            {t(`infrastructure.${facility.facilityType}`)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t('infrastructure.LEVEL')} {facility.level}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    {/* Removed coverage radius and active subscribers display */}
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        ({facility.tileCoordinates.q}, {facility.tileCoordinates.r})
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
          
          {/* Active Provider Subscriptions */}
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, mb: 1 }}>
            {t('infrastructure.ACTIVE_SUBSCRIBERS')}
          </Typography>
          
          {providerActiveSubscriptions.length === 0 ? (
            <Alert severity="info" sx={{ minHeight: '56px' }}>
              {t('infrastructure.NO_ACTIVE_SUBSCRIBERS')}
            </Alert>
          ) : (
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('infrastructure.SERVICE_TYPE')}</TableCell>
                    <TableCell>{t('infrastructure.SUBSCRIBER')}</TableCell>
                    <TableCell>{t('infrastructure.FACILITY')}</TableCell>
                    <TableCell>{t('infrastructure.LOCATION')}</TableCell>
                    <TableCell>{t('infrastructure.ANNUAL_FEE')}</TableCell>
                    <TableCell>{t('infrastructure.STATUS')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {providerActiveSubscriptions.map((subscription, index) => (
                    <TableRow key={subscription.id || `provider-active-${index}`}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getServiceIcon(subscription.serviceType)}
                          <Typography variant="body2">
                            {t(`infrastructure.${subscription.serviceType}`)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{
                        typeof subscription.consumerFacility === 'object' && subscription.consumerFacility?.teamName
                          ? subscription.consumerFacility.teamName
                          : t('infrastructure.UNKNOWN')
                      }</TableCell>
                      <TableCell>{
                        typeof subscription.consumerFacility === 'string'
                          ? t(`infrastructure.${subscription.consumerFacility}`)
                          : subscription.consumerFacility && typeof subscription.consumerFacility === 'object' && subscription.consumerFacility.facilityType
                            ? t(`infrastructure.${subscription.consumerFacility.facilityType}`)
                            : t('infrastructure.UNKNOWN')
                      }</TableCell>
                      <TableCell>
                        {(typeof subscription.consumerFacility === 'object' && subscription.consumerFacility?.tileId) ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {t('infrastructure.TILE')} {subscription.consumerFacility.tileId}
                            </Typography>
                          </Box>
                        ) : (typeof subscription.consumerFacility === 'object' && subscription.consumerFacility?.location) ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              ({subscription.consumerFacility.location.q}, {subscription.consumerFacility.location.r})
                            </Typography>
                          </Box>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <MoneyIcon fontSize="small" color="action" />
                          ${subscription.annualFee}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={t('infrastructure.ACTIVE')} 
                          color="success"
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {/* Incoming Provider Requests */}
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, mb: 1 }}>
            {t('infrastructure.INCOMING_SUBSCRIPTION_REQUESTS')}
            {pendingProviderCount > 0 && (
              <Chip 
                label={pendingProviderCount} 
                color="warning" 
                size="small" 
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
          
          {providerRequests.length === 0 ? (
            <Alert severity="info" sx={{ minHeight: '56px' }}>
              {t('infrastructure.NO_INCOMING_SERVICE_REQUESTS')}
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('infrastructure.SERVICE_TYPE')}</TableCell>
                    <TableCell>{t('infrastructure.REQUESTER')}</TableCell>
                    <TableCell>{t('infrastructure.FACILITY')}</TableCell>
                    <TableCell>{t('infrastructure.LOCATION')}</TableCell>
                    <TableCell>{t('infrastructure.PROPOSED_FEE')}</TableCell>
                    <TableCell>{t('infrastructure.ACTIONS')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {providerRequests.map((request, index) => (
                    <TableRow key={request.id || `provider-request-${index}`}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getServiceIcon(request.serviceType)}
                          <Typography variant="body2">
                            {t(`infrastructure.${request.serviceType}`)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{
                        typeof request.consumerFacility === 'object' && request.consumerFacility?.teamName
                          ? request.consumerFacility.teamName
                          : t('infrastructure.UNKNOWN')
                      }</TableCell>
                      <TableCell>{
                        typeof request.consumerFacility === 'string'
                          ? t(`infrastructure.${request.consumerFacility}`)
                          : request.consumerFacility && typeof request.consumerFacility === 'object' && request.consumerFacility.facilityType
                            ? t(`infrastructure.${request.consumerFacility.facilityType}`)
                            : t('infrastructure.UNKNOWN')
                      }</TableCell>
                      <TableCell>
                        {(typeof request.consumerFacility === 'object' && request.consumerFacility?.tileId) ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {t('infrastructure.TILE')} {request.consumerFacility.tileId}
                            </Typography>
                          </Box>
                        ) : (typeof request.consumerFacility === 'object' && request.consumerFacility?.location) ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              ({request.consumerFacility.location.q}, {request.consumerFacility.location.r})
                            </Typography>
                          </Box>
                        ) : '-'}
                      </TableCell>
                      <TableCell>${request.annualFee}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title={t('infrastructure.ACCEPT_REQUEST')}>
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => openAcceptDialog(request)}
                            >
                              <AcceptIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('infrastructure.REJECT_REQUEST')}>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => openRejectDialog(request)}
                            >
                              <RejectIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          </Box>
        )}
      </Box>
      
      {/* Accept Dialog */}
      <Dialog open={acceptDialogOpen} onClose={() => setAcceptDialogOpen(false)}>
        <DialogTitle>{t('infrastructure.ACCEPT_SERVICE_REQUEST')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            {t('infrastructure.ACCEPTING_REQUEST_FROM')}: {
              (typeof selectedRequest?.consumerFacility === 'object' && selectedRequest?.consumerFacility?.teamName) ||
              selectedRequest?.providerTeamName
            }
          </Typography>
          <Typography variant="body2" gutterBottom>
            {t('infrastructure.SERVICE_TYPE')}: {selectedRequest && t(`infrastructure.${selectedRequest.serviceType}`)}
          </Typography>
          <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
            {t('infrastructure.ACCEPT_SERVICE_CONFIRMATION')}
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {t('infrastructure.ANNUAL_FEE')}: 
            </Typography>
            <Typography variant="h6">
              ${annualFee || selectedRequest?.annualFee || '0'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAcceptDialogOpen(false)}>
            {t('infrastructure.CANCEL')}
          </Button>
          <Button onClick={handleAcceptRequest} color="success" disabled={loading}>
            {t('infrastructure.ACCEPT')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <DialogTitle>{t('infrastructure.REJECT_SERVICE_REQUEST')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            {t('infrastructure.REJECTING_REQUEST_FROM')}: {
              (typeof selectedRequest?.consumerFacility === 'object' && selectedRequest?.consumerFacility?.teamName) ||
              selectedRequest?.providerTeamName
            }
          </Typography>
          <Typography variant="body2" gutterBottom>
            {t('infrastructure.SERVICE_TYPE')}: {selectedRequest && t(`infrastructure.${selectedRequest.serviceType}`)}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label={t('infrastructure.REASON_OPTIONAL')}
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>
            {t('infrastructure.CANCEL')}
          </Button>
          <Button onClick={handleRejectRequest} color="error" disabled={loading}>
            {t('infrastructure.REJECT')}
          </Button>
        </DialogActions>
      </Dialog>
      
    </Box>
  );
};

export default ServiceManager;