'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  LinearProgress,
  Alert,
  Button,
  Tooltip,
  IconButton,
  Badge,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress
} from '@mui/material';
import Grid2 from '@mui/material/Grid';
import {
  Schedule as ScheduleIcon,
  Publish as PublishIcon,
  LocalShipping as DeliveryIcon,
  AccountBalance as SettlingIcon,
  CheckCircle as SettledIcon,
  Cancel as CancelledIcon,
  Refresh as RefreshIcon,
  Notifications as NotificationIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { MtoType1Requirement } from '@/lib/types/mtoType1';

type MtoType1RequirementStatus = 'DRAFT' | 'RELEASED' | 'IN_PROGRESS' | 'SETTLING' | 'SETTLED' | 'CANCELLED';

interface Props {
  requirement: MtoType1Requirement;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onStatusChange?: (newStatus: MtoType1RequirementStatus) => void;
  showNotifications?: boolean;
}

const MtoType1StatusTracker: React.FC<Props> = ({
  requirement,
  autoRefresh = true,
  refreshInterval = 30000,
  onStatusChange,
  showNotifications = true
}) => {
  const { t } = useTranslation(['mto']);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [lastStatus, setLastStatus] = useState(requirement.status);

  const statusSteps = [
    { status: 'DRAFT', label: t('mto:mto.type1.statusTracker.draft'), icon: <ScheduleIcon /> },
    { status: 'RELEASED', label: t('mto:mto.type1.statusTracker.published'), icon: <PublishIcon /> },
    { status: 'IN_PROGRESS', label: t('mto:mto.type1.statusTracker.inDelivery'), icon: <DeliveryIcon /> },
    { status: 'SETTLING', label: t('mto:mto.type1.statusTracker.settling'), icon: <SettlingIcon /> },
    { status: 'SETTLED', label: t('mto:mto.type1.statusTracker.settled'), icon: <SettledIcon /> }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const refreshTimer = setInterval(() => {
        // In a real app, this would fetch updated requirement data
        console.log('Auto-refreshing requirement status...');
      }, refreshInterval);

      return () => clearInterval(refreshTimer);
    }
  }, [autoRefresh, refreshInterval]);

  useEffect(() => {
    calculateTimeRemaining();
    calculateProgress();
    checkStatusChange();
  }, [currentTime, requirement]);

  const calculateTimeRemaining = () => {
    const now = currentTime.getTime();
    let targetTime: Date | null = null;
    let label = '';

    switch (requirement.status) {
      case 'DRAFT':
        targetTime = new Date(requirement.releaseTime);
        label = t('mto:mto.type1.statusTracker.untilRelease');
        break;
      case 'RELEASED':
      case 'IN_PROGRESS':
        targetTime = new Date(requirement.settlementTime);
        label = t('mto:mto.type1.statusTracker.untilSettlement');
        break;
      default:
        setTimeRemaining('');
        return;
    }

    if (targetTime) {
      const diff = targetTime.getTime() - now;

      if (diff <= 0) {
        setTimeRemaining(t('mto:mto.type1.statusTracker.timeExpired'));
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      let timeStr = '';
      if (days > 0) timeStr += `${days}d `;
      if (hours > 0 || days > 0) timeStr += `${hours}h `;
      if (minutes > 0 || hours > 0 || days > 0) timeStr += `${minutes}m `;
      timeStr += `${seconds}s`;

      setTimeRemaining(`${timeStr} ${label}`);
    }
  };

  const calculateProgress = () => {
    const releaseTime = new Date(requirement.releaseTime).getTime();
    const settlementTime = new Date(requirement.settlementTime).getTime();
    const now = currentTime.getTime();

    if (now < releaseTime) {
      setProgress(0);
    } else if (now > settlementTime) {
      setProgress(100);
    } else {
      const total = settlementTime - releaseTime;
      const elapsed = now - releaseTime;
      setProgress((elapsed / total) * 100);
    }
  };

  const checkStatusChange = () => {
    if (requirement.status !== lastStatus) {
      setLastStatus(requirement.status);

      if (onStatusChange) {
        onStatusChange(requirement.status as MtoType1RequirementStatus);
      }

      if (showNotifications) {
        addNotification(t('mto:mto.type1.statusTracker.statusChanged', { status: requirement.status }));
      }
    }
  };

  const addNotification = (message: string) => {
    setNotifications(prev => [message, ...prev].slice(0, 5));
  };

  const getStatusColor = (status: MtoType1RequirementStatus) => {
    switch (status) {
      case 'DRAFT': return 'default';
      case 'RELEASED': return 'info';
      case 'IN_PROGRESS': return 'primary';
      case 'SETTLING': return 'warning';
      case 'SETTLED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getCurrentStepIndex = () => {
    return statusSteps.findIndex(step => step.status === requirement.status);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (requirement.status === 'CANCELLED') {
    return (
      <Alert severity="error" icon={<CancelledIcon />}>
        <Typography variant="h6">
          {t('mto:mto.type1.statusTracker.cancelled')}
        </Typography>
        {requirement.cancellationReason && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {t('mto:mto.type1.statusTracker.reason')}: {requirement.cancellationReason}
          </Typography>
        )}
        {requirement.cancelledAt && (
          <Typography variant="caption" color="textSecondary">
            {t('mto:mto.type1.statusTracker.cancelledAt')}: {new Date(requirement.cancelledAt).toLocaleString()}
          </Typography>
        )}
      </Alert>
    );
  }

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" display="flex" alignItems="center">
              <Badge
                badgeContent={notifications.length}
                color="error"
                invisible={notifications.length === 0}
              >
                <NotificationIcon sx={{ mr: 1 }} />
              </Badge>
              {t('mto:mtoType1.statusTracker.title')}
            </Typography>

            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                label={requirement.status}
                color={getStatusColor(requirement.status as MtoType1RequirementStatus) as any}
                size="small"
              />
              {autoRefresh && (
                <Tooltip title={t('mto:mto.type1.statusTracker.autoRefreshEnabled')}>
                  <IconButton size="small">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>

          {timeRemaining && (
            <Alert severity="info" icon={<TimerIcon />} sx={{ mb: 2 }}>
              <Typography variant="body2">
                {timeRemaining}
              </Typography>
            </Alert>
          )}

          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ mb: 3, height: 8, borderRadius: 1 }}
          />

          <Stepper activeStep={getCurrentStepIndex()} orientation="vertical">
            {statusSteps.map((step, index) => {
              const isCompleted = index < getCurrentStepIndex();
              const isActive = index === getCurrentStepIndex();

              return (
                <Step key={step.status} completed={isCompleted}>
                  <StepLabel
                    StepIconComponent={() => (
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: isCompleted ? 'success.main' : isActive ? 'primary.main' : 'grey.300',
                          color: 'white'
                        }}
                      >
                        {React.cloneElement(step.icon, { fontSize: 'small' })}
                      </Box>
                    )}
                  >
                    <Typography variant="subtitle1" fontWeight={isActive ? 'bold' : 'normal'}>
                      {step.label}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    {step.status === 'RELEASED' && requirement.status === 'RELEASED' && (
                      <Alert severity="success" variant="outlined">
                        <Typography variant="body2">
                          {t('mto:mto.type1.statusTracker.openForDeliveries')}
                        </Typography>
                      </Alert>
                    )}
                    {step.status === 'IN_PROGRESS' && requirement.status === 'IN_PROGRESS' && (
                      <Grid2 container spacing={2}>
                        <Grid2 size={{ xs: 6 }}>
                          <Typography variant="body2" color="textSecondary">
                            {t('mto:mto.type1.statusTracker.deliveries')}
                          </Typography>
                          <Typography variant="h6">
                            {formatNumber(requirement.totalDeliveredNumber || 0)}
                          </Typography>
                        </Grid2>
                        <Grid2 size={{ xs: 6 }}>
                          <Typography variant="body2" color="textSecondary">
                            {t('mto:mto.type1.statusTracker.teams')}
                          </Typography>
                          <Typography variant="h6">
                            {requirement.uniqueTeamsDelivered || 0}
                          </Typography>
                        </Grid2>
                      </Grid2>
                    )}
                    {step.status === 'SETTLING' && requirement.status === 'SETTLING' && (
                      <Box>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        <Typography variant="body2" component="span">
                          {t('mto:mto.type1.statusTracker.processingSettlements')}
                        </Typography>
                      </Box>
                    )}
                    {step.status === 'SETTLED' && requirement.status === 'SETTLED' && (
                      <Grid2 container spacing={2}>
                        <Grid2 size={{ xs: 6 }}>
                          <Typography variant="body2" color="textSecondary">
                            {t('mto:mto.type1.statusTracker.fulfillmentRate')}
                          </Typography>
                          <Typography variant="h6" color="success.main">
                            {formatPercentage(requirement.fulfillmentRate || 0)}
                          </Typography>
                        </Grid2>
                        <Grid2 size={{ xs: 6 }}>
                          <Typography variant="body2" color="textSecondary">
                            {t('mto:mto.type1.statusTracker.totalSettled')}
                          </Typography>
                          <Typography variant="h6">
                            {formatNumber(requirement.totalSettledNumber || 0)}
                          </Typography>
                        </Grid2>
                      </Grid2>
                    )}
                  </StepContent>
                </Step>
              );
            })}
          </Stepper>

          {showNotifications && notifications.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                {t('mto:mto.type1.statusTracker.recentUpdates')}
              </Typography>
              <List dense>
                {notifications.map((notification, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <NotificationIcon fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary={notification}
                      secondary={index === 0 ? t('mto:mto.type1.statusTracker.justNow') : t('mto:mto.type1.statusTracker.minutesAgo', { minutes: index })}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}

          <Divider sx={{ my: 2 }} />

          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 6 }}>
              <Paper variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  {t('mto:mto.type1.statusTracker.requirement')}
                </Typography>
                <Typography variant="h6" color="primary">
                  {formatNumber(requirement.totalAdjustedRequirement)}
                </Typography>
              </Paper>
            </Grid2>
            <Grid2 size={{ xs: 6 }}>
              <Paper variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  {t('mto:mto.type1.statusTracker.progress')}
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="center">
                  <Typography variant="h6" color={progress >= 70 ? 'success.main' : 'warning.main'}>
                    {formatPercentage(progress)}
                  </Typography>
                  {progress >= 70 ? <TrendingUpIcon color="success" sx={{ ml: 1 }} /> : <WarningIcon color="warning" sx={{ ml: 1 }} />}
                </Box>
              </Paper>
            </Grid2>
          </Grid2>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MtoType1StatusTracker;