'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  AttachMoney,
  LocalShipping,
  Inventory,
  Store,
  CheckCircle,
  Cancel,
  Schedule,
  SwapHoriz,
  Info,
  Person,
  CalendarToday,
  Close,
  ArrowForward,
  ArrowBack,
  LocationOn,
  AccountBalance,
  Visibility,
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { TradeService } from '@/lib/services/tradeService';
import {
  TradeOrder,
  TradeHistory,
  TradeStatus,
  TradeOperation,
  toNumber,
  TradeOperationLabels,
} from '@/types/trade';
import TradeStatusBadge from './TradeStatusBadge';

interface TradeDetailsModalProps {
  open: boolean;
  trade: TradeOrder | any;
  onClose: () => void;
}

export const TradeDetailsModal: React.FC<TradeDetailsModalProps> = ({
  open,
  trade,
  onClose,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([]);

  useEffect(() => {
    if (open && trade) {
      loadTradeHistory();
    }
  }, [open, trade]);

  const loadTradeHistory = async () => {
    if (!trade) return;

    setLoading(true);
    try {
      // Mock history data for now
      const mockHistory: TradeHistory[] = [
        {
          id: 'h1',
          tradeOrderId: trade.id,
          operation: TradeOperation.CREATED,
          previousStatus: undefined,
          newStatus: TradeStatus.PENDING,
          actorId: trade.createdBy || 'user_1',
          actor: trade.createdByUser || { id: 'user_1', name: 'Sender User' },
          actorTeamId: trade.senderTeamId || 'team_1',
          actorTeam: trade.senderTeam,
          description: `Trade offer created with ${trade.items?.length || 0} items`,
          metadata: {
            itemsCost: toNumber(trade.totalPrice),
          },
          createdAt: trade.createdAt,
        },
      ];

      // Add additional history based on current status
      if (trade.status === TradeStatus.ACCEPTED || trade.status === TradeStatus.COMPLETED) {
        mockHistory.push({
          id: 'h2',
          tradeOrderId: trade.id,
          operation: TradeOperation.ACCEPTED,
          previousStatus: TradeStatus.PENDING,
          newStatus: TradeStatus.ACCEPTED,
          actorId: trade.respondedBy || 'user_2',
          actor: trade.respondedByUser || { id: 'user_2', name: 'Receiver User' },
          actorTeamId: trade.targetTeamId || 'team_2',
          actorTeam: trade.targetTeam,
          description: 'Trade offer accepted',
          metadata: {
            destinationInventoryId: trade.destInventoryId,
          },
          createdAt: trade.respondedAt || new Date().toISOString(),
        });
      }

      if (trade.status === TradeStatus.COMPLETED) {
        mockHistory.push({
          id: 'h3',
          tradeOrderId: trade.id,
          operation: TradeOperation.COMPLETED,
          previousStatus: TradeStatus.ACCEPTED,
          newStatus: TradeStatus.COMPLETED,
          actorId: 'system',
          actor: { id: 'system', name: 'System' },
          actorTeamId: '',
          description: 'Trade completed successfully',
          metadata: {
            transportCost: trade.transaction?.transportCost,
            totalPaid: trade.transaction?.totalPaid,
          },
          createdAt: trade.transaction?.executedAt || new Date().toISOString(),
        });
      }

      if (trade.status === TradeStatus.REJECTED) {
        mockHistory.push({
          id: 'h2',
          tradeOrderId: trade.id,
          operation: TradeOperation.REJECTED,
          previousStatus: TradeStatus.PENDING,
          newStatus: TradeStatus.REJECTED,
          actorId: trade.respondedBy || 'user_2',
          actor: trade.respondedByUser || { id: 'user_2', name: 'Receiver User' },
          actorTeamId: trade.targetTeamId || 'team_2',
          actorTeam: trade.targetTeam,
          description: trade.responseReason || 'Trade offer rejected',
          metadata: {
            rejectionReason: trade.responseReason,
          },
          createdAt: trade.respondedAt || new Date().toISOString(),
        });
      }

      setTradeHistory(mockHistory);
    } catch (error) {
      console.error('Failed to load trade history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOperationIcon = (operation: TradeOperation) => {
    switch (operation) {
      case TradeOperation.CREATED:
        return <SwapHoriz className="text-white" />;
      case TradeOperation.ACCEPTED:
        return <CheckCircle className="text-white" />;
      case TradeOperation.REJECTED:
        return <Cancel className="text-white" />;
      case TradeOperation.COMPLETED:
        return <LocalShipping className="text-white" />;
      case TradeOperation.CANCELLED:
        return <Cancel className="text-white" />;
      case TradeOperation.PREVIEWED:
        return <Visibility className="text-white" />;
      default:
        return <Info className="text-white" />;
    }
  };

  const getOperationColor = (operation: TradeOperation): 'primary' | 'success' | 'error' | 'warning' | 'grey' => {
    switch (operation) {
      case TradeOperation.CREATED:
        return 'primary';
      case TradeOperation.ACCEPTED:
      case TradeOperation.COMPLETED:
        return 'success';
      case TradeOperation.REJECTED:
      case TradeOperation.CANCELLED:
        return 'error';
      case TradeOperation.PREVIEWED:
        return 'warning';
      default:
        return 'grey';
    }
  };

  if (!trade) return null;

  const totalPrice = toNumber(trade.totalPrice);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h6">
              {t('trade.detailsTitle')}
            </Typography>
            <TradeStatusBadge status={trade.status} />
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          {/* Basic Information */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('trade.summary.basicInfo', 'Basic Information')}
            </Typography>
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('trade.table.id')}
                </Typography>
                <Typography variant="body2" className="font-mono">
                  {trade.id}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('trade.table.created')}
                </Typography>
                <Typography variant="body2">
                  {new Date(trade.createdAt).toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('trade.table.sender')}
                </Typography>
                <Typography variant="body2">
                  {trade.senderTeam?.name || 'Unknown'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('trade.table.receiver')}
                </Typography>
                <Typography variant="body2">
                  {trade.targetTeam?.name || 'Unknown'}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Items */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              <Inventory sx={{ mr: 1, verticalAlign: 'middle' }} />
              {t('trade.field.items')}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('trade.field.itemName')}</TableCell>
                    <TableCell align="right">{t('trade.field.quantity')}</TableCell>
                    <TableCell align="right">{t('trade.field.unitSpace', 'Unit Space')}</TableCell>
                    <TableCell align="right">{t('trade.field.totalSpace', 'Total Space')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trade.items?.map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{item.itemName}</TableCell>
                      <TableCell align="right">{toNumber(item.quantity)}</TableCell>
                      <TableCell align="right">{toNumber(item.unitSpace || 0)}</TableCell>
                      <TableCell align="right">
                        {toNumber(item.quantity) * toNumber(item.unitSpace || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Pricing Information */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              <AttachMoney sx={{ mr: 1, verticalAlign: 'middle' }} />
              {t('trade.summary.price')}
            </Typography>
            <Stack spacing={1}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">
                  {t('trade.field.itemsCost')}:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {TradeService.formatCurrency(totalPrice)} 🪙
                </Typography>
              </Box>
              {trade.transaction && (
                <>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">
                      {t('trade.field.transportCost')}:
                    </Typography>
                    <Typography variant="body2">
                      {TradeService.formatCurrency(toNumber(trade.transaction.transportCost))} 🪙
                    </Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body1" fontWeight="bold">
                      {t('trade.field.totalPaid', 'Total Paid')}:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="primary">
                      {TradeService.formatCurrency(toNumber(trade.transaction.totalPaid))} 🪙
                    </Typography>
                  </Box>
                </>
              )}
            </Stack>
          </Paper>

          {/* Location Information */}
          {(trade.sourceFacility || trade.destInventory) && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                <Store sx={{ mr: 1, verticalAlign: 'middle' }} />
                {t('trade.summary.location')}
              </Typography>
              <Stack spacing={2}>
                {trade.sourceFacility && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('trade.field.sourceLocation', 'Source Location')}
                    </Typography>
                    <Typography variant="body2">
                      {trade.sourceFacility.name} (Level {trade.sourceFacility.level})
                    </Typography>
                    {trade.sourceFacility.location && (
                      <Typography variant="caption">
                        Location: ({trade.sourceFacility.location.q}, {trade.sourceFacility.location.r})
                      </Typography>
                    )}
                  </Box>
                )}
                {trade.destInventory && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('trade.field.destinationLocation', 'Destination Location')}
                    </Typography>
                    <Typography variant="body2">
                      {trade.destInventory.facility?.name}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
          )}

          {/* Message */}
          {trade.message && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {t('trade.field.message')}
              </Typography>
              <Typography variant="body2">
                {trade.message}
              </Typography>
            </Paper>
          )}

          {/* Trade History Timeline */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="subtitle2">
                <CalendarToday sx={{ mr: 1, verticalAlign: 'middle' }} />
                {t('trade.historyTimeline')}
              </Typography>
              {trade.status === TradeStatus.PENDING && (
                <Chip
                  icon={<Schedule />}
                  label={t('trade.status.waitingForResponse')}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              )}
            </Box>

            {/* Progress Indicator */}
            {trade.status === TradeStatus.PENDING && (
              <LinearProgress
                variant="indeterminate"
                sx={{ mb: 2, height: 2 }}
                color="warning"
              />
            )}

            <Timeline position="alternate" sx={{ mt: 2, '& .MuiTimelineItem-root:before': { flex: 0.3 } }}>
              {tradeHistory.map((history, index) => {
                const isLast = index === tradeHistory.length - 1;
                const operationColor = getOperationColor(history.operation);

                return (
                  <TimelineItem key={history.id}>
                    <TimelineOppositeContent sx={{ m: 'auto 0' }}>
                      <Box textAlign={index % 2 === 0 ? 'right' : 'left'}>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(history.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {new Date(history.createdAt).toLocaleTimeString()}
                        </Typography>
                        {history.actor && (
                          <Box display="flex" alignItems="center" gap={0.5}
                            justifyContent={index % 2 === 0 ? 'flex-end' : 'flex-start'} mt={0.5}>
                            <Person sx={{ fontSize: 14 }} />
                            <Typography variant="caption" fontWeight="medium">
                              {history.actor.name}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineConnector sx={{ display: index === 0 ? 'none' : 'block' }} />
                      <TimelineDot
                        color={operationColor}
                        variant={isLast ? 'filled' : 'outlined'}
                        sx={{
                          boxShadow: isLast ? 3 : 1,
                          width: isLast ? 48 : 40,
                          height: isLast ? 48 : 40,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {getOperationIcon(history.operation)}
                      </TimelineDot>
                      <TimelineConnector sx={{ display: isLast ? 'none' : 'block' }} />
                    </TimelineSeparator>
                    <TimelineContent sx={{ py: '12px', px: 2 }}>
                      <Paper elevation={isLast ? 2 : 0} sx={{ p: 2, bgcolor: isLast ? 'action.hover' : 'transparent' }}>
                        <Typography variant="body2" fontWeight="bold" gutterBottom>
                          {t(`trade.operation.${history.operation.toLowerCase()}`) || TradeOperationLabels[history.operation]}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                          {history.description}
                        </Typography>

                        {/* Team Info */}
                        {history.actorTeam && (
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <AccountBalance sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {history.actorTeam.name}
                            </Typography>
                          </Box>
                        )}

                        {/* Metadata Chips */}
                        {history.metadata && Object.keys(history.metadata).length > 0 && (
                          <Box mt={1} display="flex" flexWrap="wrap" gap={0.5}>
                            {Object.entries(history.metadata).map(([key, value]) => {
                              if (!value) return null;

                              let icon = null;
                              let label = '';
                              let color: any = 'default';

                              if (key === 'itemsCost' || key === 'totalPaid') {
                                icon = <AttachMoney sx={{ fontSize: 14 }} />;
                                label = TradeService.formatCurrency(Number(value));
                                color = 'warning';
                              } else if (key === 'transportCost') {
                                icon = <LocalShipping sx={{ fontSize: 14 }} />;
                                label = TradeService.formatCurrency(Number(value));
                                color = 'info';
                              } else if (key === 'destinationInventoryId') {
                                icon = <LocationOn sx={{ fontSize: 14 }} />;
                                label = t('trade.field.destinationSelected', 'Destination Selected');
                                color = 'success';
                              } else if (key === 'rejectionReason') {
                                icon = <Info sx={{ fontSize: 14 }} />;
                                label = String(value);
                                color = 'error';
                              } else {
                                label = `${key}: ${value}`;
                              }

                              return (
                                <Chip
                                  key={key}
                                  icon={icon}
                                  label={label}
                                  size="small"
                                  variant="outlined"
                                  color={color}
                                />
                              );
                            })}
                          </Box>
                        )}

                        {/* Flow Direction for Transfers */}
                        {history.operation === TradeOperation.CREATED && (
                          <Box display="flex" alignItems="center" gap={1} mt={1}>
                            <Typography variant="caption" color="primary">
                              {trade.senderTeam?.name}
                            </Typography>
                            <ArrowForward sx={{ fontSize: 16, color: 'primary.main' }} />
                            <Typography variant="caption" color="secondary">
                              {trade.targetTeam?.name}
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    </TimelineContent>
                  </TimelineItem>
                );
              })}
            </Timeline>

            {/* Pending Action Alert */}
            {trade.status === TradeStatus.PENDING && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="caption">
                  {t('trade.misc.waitingResponse', 'This trade is waiting for response from {{team}}', { team: trade.targetTeam?.name })}
                </Typography>
              </Alert>
            )}
          </Paper>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {t('trade.misc.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TradeDetailsModal;