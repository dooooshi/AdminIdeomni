'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
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
  Switch,
  FormControlLabel,
  Stack,
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
  Settings as SettingsIcon,
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
  const { t } = useTranslation('infrastructure');
  const [loading, setLoading] = useState(false);
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
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceSubscription | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<TeamFacility | null>(null);
  const [annualFee, setAnnualFee] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [baseFee, setBaseFee] = useState('');
  
  // Check if user has provider facilities
  const hasProviderFacilities = facilities.some(f => 
    ['BASE_STATION', 'FIRE_STATION'].includes(f.facilityType)
  );
  
  const providerFacilities = facilities.filter(f =>
    ['BASE_STATION', 'FIRE_STATION'].includes(f.facilityType)
  );

  useEffect(() => {
    loadAllData();
  }, []);

  // Reload data when tab changes
  useEffect(() => {
    loadAllData();
  }, [activeTab]);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Always load consumer data for the badge count
      const consumerData = await infrastructureService.getConsumerSubscriptions();
      setSubscriptions(consumerData.subscriptions || []);
      
      // Load consumer subscription requests
      const consumerPending = (consumerData.subscriptions || []).filter(
        (s: ServiceSubscription) => s.status === SubscriptionStatus.PENDING
      );
      setConsumerRequests(consumerPending);
      setPendingConsumerCount(consumerPending.length);
      
      // Load provider subscription data if user has provider facilities
      if (hasProviderFacilities) {
        const providerData = await infrastructureService.getProviderSubscriptions();
        
        // Separate active and pending provider subscriptions
        const providerPending = (providerData.subscriptions || []).filter(
          (s: ServiceSubscription) => s.status === SubscriptionStatus.PENDING
        );
        const providerActive = (providerData.subscriptions || []).filter(
          (s: ServiceSubscription) => s.status === SubscriptionStatus.ACTIVE
        );
        
        setProviderRequests(providerPending);
        setProviderActiveSubscriptions(providerActive);
        setPendingProviderCount(providerPending.length);
      }
      
    } catch (err: any) {
      setError(err.message || t('ERROR_LOADING_SUBSCRIPTIONS'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    setLoading(true);
    try {
      await infrastructureService.cancelSubscription(subscriptionId, t('NO_LONGER_NEEDED'));
      loadAllData();
      onUpdate();
    } catch (err: any) {
      setError(err.message || t('ERROR_CANCELING_SUBSCRIPTION'));
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
      setError(err.message || t('ERROR_ACCEPTING_REQUEST'));
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
        rejectReason || t('REQUEST_REJECTED')
      );
      setRejectDialogOpen(false);
      setSelectedRequest(null);
      setRejectReason('');
      loadAllData();
      onUpdate();
    } catch (err: any) {
      setError(err.message || t('ERROR_REJECTING_REQUEST'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdatePricing = async () => {
    if (!selectedFacility || !baseFee) return;
    
    // This would typically call an API to update pricing
    // For now, just close the dialog
    setPricingDialogOpen(false);
    setSelectedFacility(null);
    setBaseFee('');
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
  
  const openPricingDialog = (facility: TeamFacility) => {
    setSelectedFacility(facility);
    setBaseFee('1000'); // Default value
    setPricingDialogOpen(true);
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

  if (loading && subscriptions.length === 0 && providerRequests.length === 0) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {t('SERVICE_SUBSCRIPTIONS')}
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
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        <Tab label={t('CONSUMER_VIEW')} icon={<PeopleIcon />} iconPosition="start" />
        {hasProviderFacilities && (
          <Tab 
            label={
              <Badge badgeContent={pendingProviderCount} color="warning">
                {t('PROVIDER_VIEW')}
              </Badge>
            } 
            icon={<TrendingUpIcon />} 
            iconPosition="start"
          />
        )}
      </Tabs>
      
      {/* Tab Content with consistent height to prevent layout shift */}
      <Box sx={{ minHeight: '500px', position: 'relative' }}>
        {/* Consumer View Tab */}
        <Box sx={{ display: activeTab === 0 ? 'block' : 'none', position: 'relative' }}>
          {loading && (
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 1
            }}>
              <CircularProgress />
            </Box>
          )}
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1 }}>
            {t('MY_ACTIVE_SUBSCRIPTIONS')}
          </Typography>
          
          {!subscriptions || subscriptions.filter(s => s.status === SubscriptionStatus.ACTIVE).length === 0 ? (
            <Alert severity="info">
              {t('NO_ACTIVE_SUBSCRIPTIONS')}
            </Alert>
          ) : (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {subscriptions
                .filter(s => s && s.status === SubscriptionStatus.ACTIVE)
                .map((subscription, index) => (
                  <Grid key={subscription.id || `active-sub-${index}`} item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getServiceIcon(subscription.serviceType)}
                            <Typography variant="h6">
                              {t(subscription.serviceType || 'SERVICE')}
                            </Typography>
                          </Box>
                          <Chip
                            icon={<ActiveIcon />}
                            label={t('ACTIVE')}
                            color="success"
                            size="small"
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary">
                          {t('PROVIDER')}: {subscription.providerTeamName || t('UNKNOWN')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('FACILITY')}: {subscription.providerFacility || t('UNKNOWN')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('ANNUAL_FEE')}: ${subscription.annualFee || 0}
                        </Typography>
                        {subscription.nextBillingDate && (
                          <Typography variant="body2" color="text.secondary">
                            {t('NEXT_BILLING')}: {new Date(subscription.nextBillingDate).toLocaleDateString()}
                          </Typography>
                        )}
                        
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleCancelSubscription(subscription.id)}
                          sx={{ mt: 2 }}
                        >
                          {t('CANCEL_SUBSCRIPTION')}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
              ))}
            </Grid>
          )}
          
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, mb: 1 }}>
            {t('MY_PENDING_REQUESTS')}
          </Typography>
          
          {consumerRequests.length === 0 ? (
            <Alert severity="info">
              {t('NO_PENDING_SERVICE_REQUESTS')}
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('SERVICE_TYPE')}</TableCell>
                    <TableCell>{t('PROVIDER')}</TableCell>
                    <TableCell>{t('ANNUAL_FEE')}</TableCell>
                    <TableCell>{t('STATUS')}</TableCell>
                    <TableCell>{t('ACTIONS')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {consumerRequests.map((request, index) => (
                    <TableRow key={request.id || `consumer-request-${index}`}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getServiceIcon(request.serviceType)}
                          <Typography variant="body2">
                            {t(request.serviceType)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{request.providerTeamName || t('UNKNOWN')}</TableCell>
                      <TableCell>${request.annualFee}</TableCell>
                      <TableCell>
                        <Chip 
                          label={t('PENDING')} 
                          color="warning"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={() => handleCancelSubscription(request.subscriptionId)}
                        >
                          {t('CANCEL')}
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
          <Box sx={{ display: activeTab === 1 ? 'block' : 'none', position: 'relative' }}>
          {loading && (
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 1
            }}>
              <CircularProgress />
            </Box>
          )}
          {/* Provider Facilities Overview */}
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1 }}>
            {t('MY_SERVICE_FACILITIES')}
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {providerFacilities.map((facility) => (
              <Grid key={facility.facilityId} item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getFacilityIcon(facility.facilityType)}
                        <Box>
                          <Typography variant="h6">
                            {t(facility.facilityType)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t('LEVEL')} {facility.level}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton 
                        size="small" 
                        onClick={() => openPricingDialog(facility)}
                        color="primary"
                      >
                        <SettingsIcon />
                      </IconButton>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {t('COVERAGE_RADIUS')}
                        </Typography>
                        <Typography variant="h6">
                          {facility.level + 2} {t('TILES')}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {t('ACTIVE_SUBSCRIBERS')}
                        </Typography>
                        <Typography variant="h6">
                          {providerActiveSubscriptions.filter(s => 
                            s.serviceType === (facility.facilityType === 'BASE_STATION' ? 'BASE_STATION' : 'FIRE_STATION')
                          ).length}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        ({facility.tileCoordinates.q}, {facility.tileCoordinates.r})
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Active Provider Subscriptions */}
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, mb: 1 }}>
            {t('ACTIVE_SUBSCRIBERS')}
          </Typography>
          
          {providerActiveSubscriptions.length === 0 ? (
            <Alert severity="info">
              {t('NO_ACTIVE_SUBSCRIBERS')}
            </Alert>
          ) : (
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('SERVICE_TYPE')}</TableCell>
                    <TableCell>{t('SUBSCRIBER')}</TableCell>
                    <TableCell>{t('FACILITY')}</TableCell>
                    <TableCell>{t('LOCATION')}</TableCell>
                    <TableCell>{t('ANNUAL_FEE')}</TableCell>
                    <TableCell>{t('NEXT_BILLING')}</TableCell>
                    <TableCell>{t('STATUS')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {providerActiveSubscriptions.map((subscription, index) => (
                    <TableRow key={subscription.id || `provider-active-${index}`}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getServiceIcon(subscription.serviceType)}
                          <Typography variant="body2">
                            {t(subscription.serviceType)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{subscription.consumerFacility?.teamName || t('UNKNOWN')}</TableCell>
                      <TableCell>{subscription.consumerFacility?.facilityType || t('UNKNOWN')}</TableCell>
                      <TableCell>
                        {subscription.consumerFacility?.location ? (
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
                        {subscription.nextBillingDate 
                          ? new Date(subscription.nextBillingDate).toLocaleDateString() 
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={t('ACTIVE')} 
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
            {t('INCOMING_SUBSCRIPTION_REQUESTS')}
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
            <Alert severity="info">
              {t('NO_INCOMING_SERVICE_REQUESTS')}
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('SERVICE_TYPE')}</TableCell>
                    <TableCell>{t('REQUESTER')}</TableCell>
                    <TableCell>{t('FACILITY')}</TableCell>
                    <TableCell>{t('LOCATION')}</TableCell>
                    <TableCell>{t('PROPOSED_FEE')}</TableCell>
                    <TableCell>{t('ACTIONS')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {providerRequests.map((request, index) => (
                    <TableRow key={request.id || `provider-request-${index}`}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getServiceIcon(request.serviceType)}
                          <Typography variant="body2">
                            {t(request.serviceType)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{request.consumerFacility?.teamName || t('UNKNOWN')}</TableCell>
                      <TableCell>{request.consumerFacility?.facilityType || t('UNKNOWN')}</TableCell>
                      <TableCell>
                        {request.consumerFacility?.location ? (
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
                          <Tooltip title={t('ACCEPT_REQUEST')}>
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => openAcceptDialog(request)}
                            >
                              <AcceptIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('REJECT_REQUEST')}>
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
        <DialogTitle>{t('ACCEPT_SERVICE_REQUEST')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            {t('ACCEPTING_REQUEST_FROM')}: {selectedRequest?.consumerFacility?.teamName}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {t('SERVICE_TYPE')}: {selectedRequest && t(selectedRequest.serviceType)}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label={t('ANNUAL_FEE')}
            type="number"
            fullWidth
            variant="outlined"
            value={annualFee}
            onChange={(e) => setAnnualFee(e.target.value)}
            InputProps={{ inputProps: { min: 0 } }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAcceptDialogOpen(false)}>
            {t('CANCEL')}
          </Button>
          <Button onClick={handleAcceptRequest} color="success" disabled={!annualFee || loading}>
            {t('ACCEPT')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <DialogTitle>{t('REJECT_SERVICE_REQUEST')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            {t('REJECTING_REQUEST_FROM')}: {selectedRequest?.consumerFacility?.teamName}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {t('SERVICE_TYPE')}: {selectedRequest && t(selectedRequest.serviceType)}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label={t('REASON_OPTIONAL')}
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
            {t('CANCEL')}
          </Button>
          <Button onClick={handleRejectRequest} color="error" disabled={loading}>
            {t('REJECT')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Pricing Configuration Dialog */}
      <Dialog open={pricingDialogOpen} onClose={() => setPricingDialogOpen(false)}>
        <DialogTitle>{t('CONFIGURE_SERVICE_PRICING')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            {t('FACILITY')}: {selectedFacility && t(selectedFacility.facilityType)}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {t('LEVEL')}: {selectedFacility?.level}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label={t('BASE_ANNUAL_FEE')}
            type="number"
            fullWidth
            variant="outlined"
            value={baseFee}
            onChange={(e) => setBaseFee(e.target.value)}
            InputProps={{ inputProps: { min: 0 } }}
            sx={{ mt: 2 }}
            helperText={t('DEFAULT_FEE_FOR_NEW_SUBSCRIPTIONS')}
          />
          <FormControlLabel
            control={<Switch defaultChecked />}
            label={t('AUTO_ACCEPT_REQUESTS')}
            sx={{ mt: 2 }}
          />
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            {t('AUTO_ACCEPT_HELP')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPricingDialogOpen(false)}>
            {t('CANCEL')}
          </Button>
          <Button onClick={handleUpdatePricing} color="primary">
            {t('SAVE_SETTINGS')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServiceManager;