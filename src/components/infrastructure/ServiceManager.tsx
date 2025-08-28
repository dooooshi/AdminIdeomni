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
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  Divider,
} from '@mui/material';
import {
  CellTower as BaseStationIcon,
  LocalFireDepartment as FireStationIcon,
  CheckCircle as ActiveIcon,
  Schedule as PendingIcon,
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import infrastructureService, {
  ServiceSubscription,
  TeamFacility,
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

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const data = await infrastructureService.getConsumerSubscriptions();
      setSubscriptions(data.subscriptions || []);
    } catch (err: any) {
      setError(err.message || t('ERROR_LOADING_SUBSCRIPTIONS'));
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    setLoading(true);
    try {
      await infrastructureService.cancelSubscription(subscriptionId, t('NO_LONGER_NEEDED'));
      loadSubscriptions();
      onUpdate();
    } catch (err: any) {
      setError(err.message || t('ERROR_CANCELING_SUBSCRIPTION'));
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (type: string) => {
    return type === 'BASE_STATION' ? <BaseStationIcon /> : <FireStationIcon />;
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('ACTIVE_SERVICE_SUBSCRIPTIONS')}
      </Typography>
      
      {!subscriptions || subscriptions.length === 0 ? (
        <Alert severity="info">
          {t('NO_ACTIVE_SUBSCRIPTIONS')}
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {subscriptions.filter(Boolean).map((subscription) => {
            if (!subscription) return null;
            return (
              <Grid key={subscription.subscriptionId || Math.random()} size={{ xs: 12, md: 6 }}>
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
                        icon={subscription.status === 'ACTIVE' ? <ActiveIcon /> : <PendingIcon />}
                        label={t(subscription.status || 'UNKNOWN')}
                        color={subscription.status === 'ACTIVE' ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                      {t('FACILITY')}: {subscription.consumerFacility?.type || subscription.consumerFacility?.facilityType || t('UNKNOWN')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('ANNUAL_FEE')}: ${subscription.annualFee || 0}
                    </Typography>
                    {subscription.nextBillingDate && (
                      <Typography variant="body2" color="text.secondary">
                        {t('NEXT_BILLING')}: {new Date(subscription.nextBillingDate).toLocaleDateString()}
                      </Typography>
                    )}
                    
                    {subscription.subscriptionId && (
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleCancelSubscription(subscription.subscriptionId)}
                        sx={{ mt: 2 }}
                      >
                        {t('CANCEL_SUBSCRIPTION')}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default ServiceManager;