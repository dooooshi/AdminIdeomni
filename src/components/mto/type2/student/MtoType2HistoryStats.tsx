import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Stack,
  Chip,
  Avatar
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  LocalShipping as DeliveryIcon,
  Store as StoreIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { MtoType2SubmissionHistoryItem } from '@/lib/types/mtoType2';

interface Props {
  items: MtoType2SubmissionHistoryItem[];
}

interface StatCard {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  progress?: number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const MtoType2HistoryStats: React.FC<Props> = ({ items }) => {
  const { t } = useTranslation();

  const stats = useMemo(() => {
    if (!items || items.length === 0) {
      return {
        totalSubmissions: 0,
        totalRevenue: 0,
        averagePrice: 0,
        totalQuantitySubmitted: 0,
        totalQuantitySettled: 0,
        fulfillmentRate: 0,
        successfulSubmissions: 0,
        partialSubmissions: 0,
        unsettledSubmissions: 0,
        topPerformingMall: null,
        averageFulfillmentRate: 0,
        totalUnsettledValue: 0
      };
    }

    const totalSubmissions = items.length;
    const totalRevenue = items.reduce((sum, item) =>
      sum + parseFloat(item.settlementResults.settledValue), 0);
    const totalQuantitySubmitted = items.reduce((sum, item) =>
      sum + item.submission.productNumber, 0);
    const totalQuantitySettled = items.reduce((sum, item) =>
      sum + item.settlementResults.settledNumber, 0);
    const fulfillmentRate = totalQuantitySubmitted > 0 ?
      (totalQuantitySettled / totalQuantitySubmitted) * 100 : 0;

    const successfulSubmissions = items.filter(item =>
      item.settlementResults.settlementStatus === 'FULL').length;
    const partialSubmissions = items.filter(item =>
      item.settlementResults.settlementStatus === 'PARTIAL').length;
    const unsettledSubmissions = items.filter(item =>
      item.settlementResults.settlementStatus === 'UNSETTLED').length;

    const averagePrice = totalQuantitySettled > 0 ?
      totalRevenue / totalQuantitySettled : 0;

    const averageFulfillmentRate = items.reduce((sum, item) =>
      sum + item.settlementResults.fulfillmentRate, 0) / totalSubmissions;

    const totalUnsettledValue = items.reduce((sum, item) => {
      if (item.settlementResults.settlementStatus === 'UNSETTLED') {
        return sum + parseFloat(item.submission.totalValue);
      }
      return sum;
    }, 0);

    // Find top performing mall
    const mallPerformance = new Map<string, {
      name: string;
      revenue: number;
      submissions: number;
      level: number;
    }>();

    items.forEach(item => {
      const mallId = item.mallInfo.facilityInstanceId;
      const existing = mallPerformance.get(mallId) || {
        name: item.mallInfo.facilityName,
        revenue: 0,
        submissions: 0,
        level: item.mallInfo.mallLevel
      };
      existing.revenue += parseFloat(item.settlementResults.settledValue);
      existing.submissions += 1;
      mallPerformance.set(mallId, existing);
    });

    const topPerformingMall = Array.from(mallPerformance.entries())
      .sort((a, b) => b[1].revenue - a[1].revenue)[0]?.[1] || null;

    return {
      totalSubmissions,
      totalRevenue,
      averagePrice,
      totalQuantitySubmitted,
      totalQuantitySettled,
      fulfillmentRate,
      successfulSubmissions,
      partialSubmissions,
      unsettledSubmissions,
      topPerformingMall,
      averageFulfillmentRate,
      totalUnsettledValue
    };
  }, [items]);

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const statCards: StatCard[] = [
    {
      title: t('mto.type2.history.stats.totalRevenue'),
      value: formatCurrency(stats.totalRevenue),
      subtitle: t('mto.type2.history.stats.fromSettledSubmissions'),
      icon: <MoneyIcon />,
      color: '#4caf50',
      progress: 100
    },
    {
      title: t('mto.type2.history.stats.totalSubmissions'),
      value: stats.totalSubmissions,
      subtitle: `${stats.successfulSubmissions} ${t('mto.type2.history.stats.successful')}`,
      icon: <CartIcon />,
      color: '#2196f3',
      progress: (stats.successfulSubmissions / Math.max(stats.totalSubmissions, 1)) * 100
    },
    {
      title: t('mto.type2.history.stats.fulfillmentRate'),
      value: formatPercentage(stats.fulfillmentRate),
      subtitle: `${formatNumber(stats.totalQuantitySettled)} / ${formatNumber(stats.totalQuantitySubmitted)}`,
      icon: <CheckCircleIcon />,
      color: '#ff9800',
      progress: stats.fulfillmentRate
    },
    {
      title: t('mto.type2.history.stats.averagePrice'),
      value: formatCurrency(stats.averagePrice),
      subtitle: t('mto.type2.history.stats.perUnit'),
      icon: <AssessmentIcon />,
      color: '#9c27b0',
      progress: undefined
    }
  ];

  return (
    <Box mb={3}>
      <Grid container spacing={2}>
        {/* Main Statistics Cards */}
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      {stat.title}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {stat.value}
                    </Typography>
                    {stat.subtitle && (
                      <Typography variant="caption" color="textSecondary">
                        {stat.subtitle}
                      </Typography>
                    )}
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: stat.color + '20',
                      color: stat.color,
                      width: 48,
                      height: 48
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                </Box>
                {stat.progress !== undefined && (
                  <Box mt={2}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(stat.progress, 100)}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: stat.color + '20',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: stat.color
                        }
                      }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Status Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                {t('mto.type2.history.stats.statusDistribution')}
              </Typography>
              <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center">
                    <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {t('mto.type2.history.stats.fullySettled')}
                    </Typography>
                  </Box>
                  <Chip
                    label={stats.successfulSubmissions}
                    size="small"
                    color="success"
                  />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center">
                    <DeliveryIcon color="warning" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {t('mto.type2.history.stats.partiallySettled')}
                    </Typography>
                  </Box>
                  <Chip
                    label={stats.partialSubmissions}
                    size="small"
                    color="warning"
                  />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center">
                    <CancelIcon color="error" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {t('mto.type2.history.stats.unsettled')}
                    </Typography>
                  </Box>
                  <Chip
                    label={stats.unsettledSubmissions}
                    size="small"
                    color="error"
                  />
                </Box>
                {stats.totalUnsettledValue > 0 && (
                  <Box mt={1} p={1} bgcolor="error.light" borderRadius={1}>
                    <Typography variant="caption" color="error.contrastText">
                      {t('mto.type2.history.stats.unsettledValue')}: {formatCurrency(stats.totalUnsettledValue)}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Performing Mall */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                {t('mto.type2.history.stats.topPerformingMall')}
              </Typography>
              {stats.topPerformingMall ? (
                <Box>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <StoreIcon />
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="body1" fontWeight="medium">
                        {stats.topPerformingMall.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Level {stats.topPerformingMall.level} MALL
                      </Typography>
                    </Box>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">
                        {t('mto.type2.history.stats.revenue')}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {formatCurrency(stats.topPerformingMall.revenue)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">
                        {t('mto.type2.history.stats.submissions')}
                      </Typography>
                      <Typography variant="h6">
                        {stats.topPerformingMall.submissions}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  {t('mto.type2.history.stats.noDataAvailable')}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Summary */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                {t('mto.type2.history.stats.performanceSummary')}
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <Box flex={1}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <TrendingUpIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      {t('mto.type2.history.stats.averageFulfillment')}
                    </Typography>
                  </Box>
                  <Typography variant="h4" color={stats.averageFulfillmentRate >= 80 ? 'success.main' : 'warning.main'}>
                    {formatPercentage(stats.averageFulfillmentRate)}
                  </Typography>
                </Box>
                <Box flex={1}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <MoneyIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      {t('mto.type2.history.stats.revenuePerSubmission')}
                    </Typography>
                  </Box>
                  <Typography variant="h4" color="primary">
                    {formatCurrency(stats.totalSubmissions > 0 ? stats.totalRevenue / stats.totalSubmissions : 0)}
                  </Typography>
                </Box>
                <Box flex={1}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <CartIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      {t('mto.type2.history.stats.averageQuantity')}
                    </Typography>
                  </Box>
                  <Typography variant="h4">
                    {formatNumber(Math.round(stats.totalSubmissions > 0 ? stats.totalQuantitySubmitted / stats.totalSubmissions : 0))}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MtoType2HistoryStats;