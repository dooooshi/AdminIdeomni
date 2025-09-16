'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  useTheme,
  alpha
} from '@mui/material';
import Grid2 from '@mui/material/GridLegacy';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  History as HistoryIcon,
  SwapHoriz as SwapIcon,
  LocalShipping as ShippingIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import TradeService from '@/lib/services/tradeService';
import { TradeSummary, TradeStatus, TradeStats } from '@/types/trade';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';

export default function TradeDashboardPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();

  const [stats, setStats] = useState<TradeStats | null>(null);
  const [recentTrades, setRecentTrades] = useState<TradeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const [statsData, tradesData] = await Promise.all([
        TradeService.getTradeStats(),
        TradeService.listTrades({
          pageSize: 5,
          status: TradeStatus.PENDING
        })
      ]);

      setStats(statsData);
      setRecentTrades(tradesData.trades);
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData(false);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const getStatusColor = (status: TradeStatus) => {
    switch (status) {
      case TradeStatus.PENDING: return 'warning';
      case TradeStatus.ACCEPTED: return 'info';
      case TradeStatus.COMPLETED: return 'success';
      case TradeStatus.REJECTED: return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" gutterBottom>
            Trade Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your team's trading activities and resource exchanges
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/student-trade/create')}
          >
            New Trade
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Overview */}
      <Grid2 container spacing={3} sx={{ mb: 3 }}>
        <Grid2 item xs={12} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      Total Trades
                    </Typography>
                    <Typography variant="h4">
                      {stats?.totalTrades || 0}
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      <TrendingUpIcon fontSize="small" color="success" />
                      <Typography variant="body2" color="success.main" sx={{ ml: 0.5 }}>
                        +{stats?.growth?.trades || 0}% this week
                      </Typography>
                    </Box>
                  </Box>
                  <SwapIcon fontSize="large" color="primary" />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid2>

        <Grid2 item xs={12} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      Pending Trades
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      {stats?.pendingCount || 0}
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      <Chip
                        label="Action Required"
                        size="small"
                        color="warning"
                      />
                    </Box>
                  </Box>
                  <ArrowDownIcon fontSize="large" color="warning" />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid2>

        <Grid2 item xs={12} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      Total Value
                    </Typography>
                    <Typography variant="h4">
                      {formatNumber(stats?.totalValue || 0)}
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      <Typography variant="body2" color="text.secondary">
                        Gold exchanged
                      </Typography>
                    </Box>
                  </Box>
                  <MoneyIcon fontSize="large" color="success" />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid2>

        <Grid2 item xs={12} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      Transport Costs
                    </Typography>
                    <Typography variant="h4">
                      {formatNumber(stats?.transportCosts || 0)}
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      <Typography variant="body2" color="text.secondary">
                        Total spent
                      </Typography>
                    </Box>
                  </Box>
                  <ShippingIcon fontSize="large" color="info" />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid2>
      </Grid2>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid2 container spacing={2}>
          <Grid2 item>
            <Button
              variant="outlined"
              startIcon={<ArrowDownIcon />}
              onClick={() => router.push('/student-trade/incoming')}
            >
              Incoming ({stats?.incomingCount || 0})
            </Button>
          </Grid2>
          <Grid2 item>
            <Button
              variant="outlined"
              startIcon={<ArrowUpIcon />}
              onClick={() => router.push('/student-trade/outgoing')}
            >
              My Offers ({stats?.outgoingCount || 0})
            </Button>
          </Grid2>
          <Grid2 item>
            <Button
              variant="outlined"
              startIcon={<HistoryIcon />}
              onClick={() => router.push('/student-trade/history')}
            >
              History
            </Button>
          </Grid2>
        </Grid2>
      </Paper>

      {/* Recent Activity */}
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Recent Pending Trades
          </Typography>
          <Button
            size="small"
            onClick={() => router.push('/student-trade/incoming')}
          >
            View All
          </Button>
        </Box>

        {recentTrades.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary">
              No pending trades at the moment
            </Typography>
          </Box>
        ) : (
          <Grid2 container spacing={2}>
            {recentTrades.map((trade) => (
              <Grid2 item xs={12} key={trade.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="subtitle1">
                          {trade.type === 'incoming' ? 'From' : 'To'}: {trade.partnerTeam.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {trade.itemCount} items • {trade.totalValue.toLocaleString()} gold
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={trade.status}
                          size="small"
                          color={getStatusColor(trade.status)}
                        />
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => router.push(`/student-trade/${trade.id}`)}
                        >
                          View
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid2>
            ))}
          </Grid2>
        )}
      </Paper>

      {/* Trade Completion Rate */}
      {stats && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Trade Success Rate
          </Typography>
          <Box mt={2}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Completion Rate</Typography>
              <Typography variant="body2">
                {((stats.completedCount / Math.max(stats.totalTrades, 1)) * 100).toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(stats.completedCount / Math.max(stats.totalTrades, 1)) * 100}
              sx={{
                height: 10,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.success.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  bgcolor: 'success.main'
                }
              }}
            />
            <Box display="flex" justifyContent="space-between" mt={2}>
              <Typography variant="caption" color="text.secondary">
                {stats.completedCount} Completed
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stats.rejectedCount} Rejected
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
}