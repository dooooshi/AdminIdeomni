'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Alert,
  Tooltip,
  Stack,
  Chip,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Cancel as CancelIcon,
  CheckCircle as AcceptIcon,
  DoDisturbAlt as RejectIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  SwapHoriz as SwapIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { TradeStatus, TradeListItem, TradeType } from '@/types/trade';
import { TradeService } from '@/lib/services/tradeService';
import TradeStatusBadge from './TradeStatusBadge';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';

interface TradeListProps {
  defaultType?: TradeType;
  onTradeSelect?: (tradeId: string) => void;
  onCreateNew?: () => void;
}

export const TradeList: React.FC<TradeListProps> = ({
  defaultType = 'incoming',
  onTradeSelect,
  onCreateNew,
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trades, setTrades] = useState<TradeListItem[]>([]);
  const [tradeType, setTradeType] = useState<TradeType | 'all'>(defaultType);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch trades
  const fetchTrades = async (showLoadingState = true) => {
    if (showLoadingState) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await TradeService.listTrades({
        type: tradeType,
      });
      setTrades(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trades');
      console.error('Error fetching trades:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, [tradeType]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTrades(false);
  };

  const handleViewTrade = (tradeId: string) => {
    if (onTradeSelect) {
      onTradeSelect(tradeId);
    } else {
      router.push(`/student-trade/${tradeId}`);
    }
  };

  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew();
    } else {
      router.push('/student-trade/create');
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTradeType(newValue as TradeType | 'all');
  };

  const getTradeIcon = (type: 'incoming' | 'outgoing') => {
    return type === 'incoming' ? '📥' : '📤';
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={48} />
            <Skeleton variant="rectangular" height={400} />
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h2">
            {t('trade.title', 'Trade Management')}
          </Typography>
          <Box display="flex" gap={1}>
            <Tooltip title={t('common.refresh', 'Refresh')}>
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing}
                size="small"
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateNew}
            >
              {t('trade.createNew', 'Create Trade')}
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Tabs
          value={tradeType}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <span>📥</span>
                {t('trade.incoming', 'Incoming')}
              </Box>
            }
            value="incoming"
          />
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <span>📤</span>
                {t('trade.outgoing', 'Outgoing')}
              </Box>
            }
            value="outgoing"
          />
          <Tab
            label={t('trade.all', 'All Trades')}
            value="all"
          />
        </Tabs>

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('trade.type', 'Type')}</TableCell>
                <TableCell>{t('trade.team', 'Team')}</TableCell>
                <TableCell>{t('trade.items', 'Items')}</TableCell>
                <TableCell align="right">{t('trade.price', 'Price')}</TableCell>
                <TableCell>{t('trade.status', 'Status')}</TableCell>
                <TableCell>{t('trade.date', 'Date')}</TableCell>
                <TableCell align="center">{t('common.actions', 'Actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box py={4}>
                      <Typography color="textSecondary">
                        {t('trade.noTrades', 'No trades found')}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                trades.map((trade) => {
                  const isIncoming = tradeType === 'incoming' ||
                    (tradeType === 'all' && trade.targetTeam);
                  const teamName = isIncoming
                    ? trade.senderTeam.name
                    : trade.targetTeam?.name || 'Unknown';

                  return (
                    <TableRow
                      key={trade.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleViewTrade(trade.id)}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <span>{getTradeIcon(isIncoming ? 'incoming' : 'outgoing')}</span>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {teamName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Chip
                            label={`${trade.itemCount} ${t('trade.itemsCount', 'items')}`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={`${trade.totalQuantity} ${t('trade.units', 'units')}`}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={500}>
                          {TradeService.formatCurrency(trade.totalPrice)} 🪙
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <TradeStatusBadge status={trade.status} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {TradeService.formatTradeDate(trade.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" gap={1} justifyContent="center">
                          <Tooltip title={t('common.view', 'View')}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewTrade(trade.id);
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {trade.status === TradeStatus.PENDING && isIncoming && (
                            <>
                              <Tooltip title={t('trade.accept', 'Accept')}>
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewTrade(trade.id);
                                  }}
                                >
                                  <AcceptIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t('trade.reject', 'Reject')}>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewTrade(trade.id);
                                  }}
                                >
                                  <RejectIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}

                          {trade.status === TradeStatus.PENDING && !isIncoming && (
                            <Tooltip title={t('trade.cancel', 'Cancel')}>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewTrade(trade.id);
                                }}
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {trades.length > 0 && (
          <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="textSecondary">
              {t('trade.showing', 'Showing {{count}} trades', { count: trades.length })}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TradeList;