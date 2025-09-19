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
  Grid,
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
import { MtoType1Requirement, MtoType1RequirementStatus } from '@/lib/types/mtoType1';

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
  const [lastStatus, setLastStatus] = useState(requirement.requirementStatus);

  const statusSteps = [
    { status: 'DRAFT', label: t('mto:mtoType1.status.draft'), icon: <ScheduleIcon /> },
    { status: 'RELEASED', label: t('mto:mtoType1.status.released'), icon: <PublishIcon /> },
    { status: 'IN_PROGRESS', label: t('mto:mtoType1.status.inProgress'), icon: <DeliveryIcon /> },
    { status: 'SETTLING', label: t('mto:mtoType1.status.settling'), icon: <SettlingIcon /> },
    { status: 'SETTLED', label: t('mto:mtoType1.status.settled'), icon: <SettledIcon /> }
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

    switch (requirement.requirementStatus) {
      case 'DRAFT':
        targetTime = new Date(requirement.releaseTime);
        label = 'until release';
        break;
      case 'RELEASED':
      case 'IN_PROGRESS':
        targetTime = new Date(requirement.settlementTime);
        label = 'until settlement';
        break;
      default:
        setTimeRemaining('');
        return;
    }

    if (targetTime) {
      const diff = targetTime.getTime() - now;

      if (diff <= 0) {
        setTimeRemaining('Time expired');
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
    if (requirement.requirementStatus !== lastStatus) {
      setLastStatus(requirement.requirementStatus);

      if (onStatusChange) {
        onStatusChange(requirement.requirementStatus);
      }

      if (showNotifications) {
        addNotification(`Status changed to ${requirement.requirementStatus}`);
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
    return statusSteps.findIndex(step => step.status === requirement.requirementStatus);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (requirement.requirementStatus === 'CANCELLED') {
    return (
      <Alert severity="error" icon={<CancelledIcon />}>
        <Typography variant="h6">
          {t('mto:mtoType1.status.cancelled')}
        </Typography>
        {requirement.cancellationReason && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Reason: {requirement.cancellationReason}
          </Typography>
        )}
        {requirement.cancelledAt && (
          <Typography variant="caption" color="textSecondary">
            Cancelled at: {new Date(requirement.cancelledAt).toLocaleString()}
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
                label={requirement.requirementStatus}
                color={getStatusColor(requirement.requirementStatus) as any}
                size="small"
              />
              {autoRefresh && (
                <Tooltip title="Auto-refresh enabled">
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
                    {step.status === 'RELEASED' && requirement.requirementStatus === 'RELEASED' && (
                      <Alert severity="success" variant="outlined">
                        <Typography variant="body2">
                          Requirement is now open for deliveries
                        </Typography>
                      </Alert>
                    )}
                    {step.status === 'IN_PROGRESS' && requirement.requirementStatus === 'IN_PROGRESS' && (
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">
                            Deliveries
                          </Typography>
                          <Typography variant="h6">
                            {formatNumber(requirement.totalDeliveredNumber || 0)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">
                            Teams
                          </Typography>
                          <Typography variant="h6">
                            {requirement.uniqueTeamsDelivered || 0}
                          </Typography>
                        </Grid>
                      </Grid>
                    )}
                    {step.status === 'SETTLING' && requirement.requirementStatus === 'SETTLING' && (
                      <Box>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        <Typography variant="body2" component="span">
                          Processing settlements...
                        </Typography>
                      </Box>
                    )}
                    {step.status === 'SETTLED' && requirement.requirementStatus === 'SETTLED' && (
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">
                            Fulfillment Rate
                          </Typography>
                          <Typography variant="h6" color="success.main">
                            {formatPercentage(requirement.fulfillmentRate || 0)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">
                            Total Settled
                          </Typography>
                          <Typography variant="h6">
                            {formatNumber(requirement.totalSettledNumber || 0)}
                          </Typography>
                        </Grid>
                      </Grid>
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
                Recent Updates
              </Typography>
              <List dense>
                {notifications.map((notification, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <NotificationIcon fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary={notification}
                      secondary={`${index === 0 ? 'Just now' : `${index} min ago`}`}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  Requirement
                </Typography>
                <Typography variant="h6" color="primary">
                  {formatNumber(requirement.totalAdjustedRequirement)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  Progress
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="center">
                  <Typography variant="h6" color={progress >= 70 ? 'success.main' : 'warning.main'}>
                    {formatPercentage(progress)}
                  </Typography>
                  {progress >= 70 ? <TrendingUpIcon color="success" sx={{ ml: 1 }} /> : <WarningIcon color="warning" sx={{ ml: 1 }} />}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MtoType1StatusTracker;