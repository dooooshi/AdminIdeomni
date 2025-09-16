'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Badge,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  AttachMoney as MoneyIcon,
  LocalShipping as ShippingIcon
} from '@mui/icons-material';
import Grid2 from '@mui/material/GridLegacy';
import { AnimatePresence } from 'motion/react';
import TradeCard from '@/components/trade/TradeCard';
import DestinationSelector from '@/components/trade/DestinationSelector';
import TradeService from '@/lib/services/tradeService';
import {
  TradeOrder,
  TradeSummary,
  TradeStatus,
  TradeListQuery,
  TradePreviewResponse
} from '@/types/trade';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { useRouter } from 'next/navigation';

/**
 * Incoming Trades Page
 * Allows students to view and manage incoming trade offers
 * Key feature: Destination selection for accepted trades
 */
export default function IncomingTradesPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();

  // State
  const [trades, setTrades] = useState<TradeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<TradeStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Destination selection state
  const [selectedTrade, setSelectedTrade] = useState<TradeOrder | null>(null);
  const [destinationModalOpen, setDestinationModalOpen] = useState(false);
  const [processingTradeId, setProcessingTradeId] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch trades
  const fetchTrades = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const query: TradeListQuery = {
        type: 'incoming',
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page,
        pageSize: 12
      };

      const response = await TradeService.listTrades(query);
      setTrades(response.trades);
      setTotalPages(response.pagination.pages);
      setTotalCount(response.pagination.total);
    } catch (err: any) {
      console.error('Failed to fetch trades:', err);
      setError(TradeService.getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, page]);

  // Initial fetch
  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // Refresh handler
  const handleRefresh = () => {
    setRefreshing(true);
    fetchTrades(false);
  };

  // Open destination selector for accepting trade
  const handleAcceptTrade = async (tradeId: string) => {
    try {
      // Fetch full trade details
      const tradeDetails = await TradeService.getTradeDetails(tradeId);
      setSelectedTrade(tradeDetails as any);
      setDestinationModalOpen(true);
    } catch (err: any) {
      console.error('Failed to fetch trade details:', err);
      setError('Failed to load trade details');
    }
  };

  // Complete trade acceptance with selected destination
  const handleDestinationSelected = async (
    destinationId: string,
    preview: TradePreviewResponse
  ) => {
    if (!selectedTrade) return;

    setProcessingTradeId(selectedTrade.id);
    setDestinationModalOpen(false);

    try {
      // Accept the trade with selected destination
      await TradeService.acceptTrade(selectedTrade.id, destinationId);

      // Show success message
      console.log('Trade accepted successfully!');

      // Refresh trades list
      await fetchTrades(false);
    } catch (err: any) {
      console.error('Failed to accept trade:', err);
      setError(TradeService.getErrorMessage(err));
    } finally {
      setProcessingTradeId(null);
      setSelectedTrade(null);
    }
  };

  // Reject trade
  const handleRejectTrade = async (tradeId: string) => {
    if (!confirm('Are you sure you want to reject this trade?')) return;

    setProcessingTradeId(tradeId);

    try {
      await TradeService.rejectTrade(tradeId, 'Not interested');
      console.log('Trade rejected');
      await fetchTrades(false);
    } catch (err: any) {
      console.error('Failed to reject trade:', err);
      setError(TradeService.getErrorMessage(err));
    } finally {
      setProcessingTradeId(null);
    }
  };

  // View trade details
  const handleViewTrade = (tradeId: string) => {
    router.push(`/student-trade/${tradeId}`);
  };

  // Count trades by status
  const getStatusCount = (status: TradeStatus) => {
    return trades.filter(t => t.status === status).length;
  };

  // Filter trades by status
  const filteredTrades = trades.filter(trade => {
    if (statusFilter === 'all') return true;
    return trade.status === statusFilter;
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          Incoming Trade Offers
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and accept trade offers from other teams. Choose where to receive items.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid2 container spacing={2} sx={{ mb: 3 }}>
        <Grid2 item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Pending Offers
                </Typography>
                <Typography variant="h4">
                  {getStatusCount(TradeStatus.PENDING)}
                </Typography>
              </Box>
              <Chip label="Action Required" color="warning" size="small" />
            </Box>
          </Paper>
        </Grid2>
        <Grid2 item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Accepted
              </Typography>
              <Typography variant="h4">
                {getStatusCount(TradeStatus.ACCEPTED)}
              </Typography>
            </Box>
          </Paper>
        </Grid2>
        <Grid2 item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Completed
              </Typography>
              <Typography variant="h4">
                {getStatusCount(TradeStatus.COMPLETED)}
              </Typography>
            </Box>
          </Paper>
        </Grid2>
        <Grid2 item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Total Offers
              </Typography>
              <Typography variant="h4">
                {totalCount}
              </Typography>
            </Box>
          </Paper>
        </Grid2>
      </Grid2>

      {/* Filters and Actions */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={statusFilter}
            onChange={(e, v) => setStatusFilter(v)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label="All"
              value="all"
              icon={<Badge badgeContent={totalCount} color="default" />}
            />
            <Tab
              label="Pending"
              value={TradeStatus.PENDING}
              icon={<Badge badgeContent={getStatusCount(TradeStatus.PENDING)} color="warning" />}
            />
            <Tab
              label="Accepted"
              value={TradeStatus.ACCEPTED}
              icon={<Badge badgeContent={getStatusCount(TradeStatus.ACCEPTED)} color="info" />}
            />
            <Tab
              label="Completed"
              value={TradeStatus.COMPLETED}
              icon={<Badge badgeContent={getStatusCount(TradeStatus.COMPLETED)} color="success" />}
            />
            <Tab
              label="Rejected"
              value={TradeStatus.REJECTED}
              icon={<Badge badgeContent={getStatusCount(TradeStatus.REJECTED)} color="error" />}
            />
          </Tabs>
        </Box>

        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box display="flex" gap={1}>
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Filter">
              <IconButton>
                <FilterIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Box display="flex" gap={1}>
            <Tooltip title="Grid View">
              <IconButton
                onClick={() => setViewMode('grid')}
                color={viewMode === 'grid' ? 'primary' : 'default'}
              >
                <GridViewIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="List View">
              <IconButton
                onClick={() => setViewMode('list')}
                color={viewMode === 'list' ? 'primary' : 'default'}
              >
                <ListViewIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Trades List/Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : filteredTrades.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No trades found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {statusFilter === 'all'
              ? 'You have no incoming trade offers at the moment'
              : `No ${statusFilter.toLowerCase()} trades found`}
          </Typography>
        </Paper>
      ) : (
        <Grid2 container spacing={3}>
          <AnimatePresence>
            {filteredTrades.map((trade) => (
              <Grid2
                item
                xs={12}
                md={viewMode === 'grid' ? 6 : 12}
                lg={viewMode === 'grid' ? 4 : 12}
                key={trade.id}
              >
                <TradeCard
                  trade={trade}
                  type="incoming"
                  onView={() => handleViewTrade(trade.id)}
                  onAccept={
                    trade.status === TradeStatus.PENDING
                      ? () => handleAcceptTrade(trade.id)
                      : undefined
                  }
                  onReject={
                    trade.status === TradeStatus.PENDING
                      ? () => handleRejectTrade(trade.id)
                      : undefined
                  }
                />
              </Grid2>
            ))}
          </AnimatePresence>
        </Grid2>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <Box mx={2} display="flex" alignItems="center">
            <Typography>
              Page {page} of {totalPages}
            </Typography>
          </Box>
          <Button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </Box>
      )}

      {/* Destination Selection Modal */}
      <DestinationSelector
        open={destinationModalOpen}
        onClose={() => {
          setDestinationModalOpen(false);
          setSelectedTrade(null);
        }}
        trade={selectedTrade}
        onDestinationSelected={handleDestinationSelected}
      />
    </Box>
  );
}