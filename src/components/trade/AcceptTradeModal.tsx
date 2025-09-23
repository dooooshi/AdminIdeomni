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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Stack,
  Chip,
  Divider,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  LocalShipping as ShippingIcon,
  Inventory as InventoryIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { TradeService } from '@/lib/services/tradeService';
import {
  TradeOrder,
  FacilitySpaceInventory,
  AcceptTradeRequest,
  PreviewTradeRequest,
  TradePreviewResponse,
  toNumber,
} from '@/types/trade';

interface AcceptTradeModalProps {
  open: boolean;
  trade: TradeOrder | null;
  onClose: () => void;
  onSuccess: (tradeId: string) => void;
  isIncoming: boolean;
}

export const AcceptTradeModal: React.FC<AcceptTradeModalProps> = ({
  open,
  trade,
  onClose,
  onSuccess,
  isIncoming,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Form data
  const [destinationInventoryId, setDestinationInventoryId] = useState<string>('');
  const [destinations, setDestinations] = useState<FacilitySpaceInventory[]>([]);
  const [preview, setPreview] = useState<TradePreviewResponse | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  useEffect(() => {
    if (open && trade && isIncoming) {
      loadDestinations();
    }
  }, [open, trade, isIncoming]);

  useEffect(() => {
    if (destinationInventoryId && trade) {
      loadPreview();
    }
  }, [destinationInventoryId, trade]);

  const loadDestinations = async () => {
    setLoading(true);
    setError(null);

    try {
      const dests = await TradeService.getAvailableDestinations();
      setDestinations(dests);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('trade.error.loadDestinations'));
    } finally {
      setLoading(false);
    }
  };

  const loadPreview = async () => {
    if (!trade || !destinationInventoryId) return;

    setError(null);
    setLoadingPreview(true);

    try {
      const previewRequest: PreviewTradeRequest = {
        destinationInventoryId,
      };
      const previewData = await TradeService.previewTrade(trade.id, previewRequest);
      console.log('Preview data received:', previewData);
      setPreview(previewData);
    } catch (err) {
      console.error('Error loading preview:', err);
      setError(err instanceof Error ? err.message : t('trade.error.calculateTransport'));
      setPreview(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleAccept = async () => {
    if (!trade || !destinationInventoryId) return;

    setSubmitting(true);
    setError(null);

    try {
      const request: AcceptTradeRequest = {
        destinationInventoryId,
      };

      await TradeService.acceptTrade(trade.id, request);
      onSuccess(trade.id);
      handleReset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('trade.error.acceptTrade'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!trade) return;

    setSubmitting(true);
    setError(null);

    try {
      await TradeService.rejectTrade(trade.id, { reason: rejectReason || t('trade.error.notInterested') });
      onSuccess(trade.id);
      handleReset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('trade.error.rejectTrade'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!trade) return;

    setSubmitting(true);
    setError(null);

    try {
      await TradeService.cancelTrade(trade.id);
      onSuccess(trade.id);
      handleReset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('trade.error.cancelTrade'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setDestinationInventoryId('');
    setPreview(null);
    setRejectReason('');
    setError(null);
  };

  if (!trade) return null;

  const totalPrice = toNumber(trade.totalPrice);
  const facilityLabel =
    trade.sourceFacility?.name ||
    trade.sourceFacility?.type ||
    t('trade.misc.unknownFacility');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isIncoming
          ? t('trade.reviewIncomingOffer')
          : t('trade.viewTradeDetails')}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={3}>
          {/* Trade Summary */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              <StoreIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              {t('trade.field.from')}
            </Typography>
            <Typography variant="body1">
              {trade.senderTeam?.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {facilityLabel}
            </Typography>
          </Paper>

          {/* Items */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              <InventoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              {t('trade.field.items')}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {trade.items?.map((item, index) => (
                <Chip
                  key={index}
                  label={`${item.itemName} x${toNumber(item.quantity)}`}
                  size="small"
                />
              ))}
            </Stack>
          </Paper>

          {/* Price */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              <MoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              {t('trade.field.price')}
            </Typography>
            <Typography variant="h6" color="primary">
              {TradeService.formatCurrency(totalPrice)} 🪙
            </Typography>
          </Paper>

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

          {/* Destination Selection (for incoming trades only) */}
          {isIncoming && trade.status === 'PENDING' && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  {t('trade.field.selectDestination')}
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>{t('trade.field.destinationInventory')}</InputLabel>
                  <Select
                    value={destinationInventoryId}
                    onChange={(e) => setDestinationInventoryId(e.target.value)}
                    label={t('trade.field.destinationInventory')}
                    disabled={loading}
                  >
                    {destinations.map((dest) => (
                      <MenuItem key={dest.inventoryId} value={dest.inventoryId}>
                        <Box>
                          <Typography variant="body1">
                            {dest.facility?.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {t('trade.inventory.space', 'Used {{used}}/{{total}} space', {
                              used: (dest.space?.total || 0) - (dest.space?.available || 0),
                              total: dest.space?.total || 0,
                            })}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Transport Cost Preview */}
              {!destinationInventoryId && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  {t('trade.misc.selectDestinationToSeeCost', 'Please select a destination to see the transport cost')}
                </Alert>
              )}
              {loadingPreview && (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress size={24} />
                </Box>
              )}
              {!loadingPreview && preview && (
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    <ShippingIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    {t('trade.summary.costBreakdown')}
                  </Typography>
                  <Stack spacing={1}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">
                        {t('trade.field.itemsCost')}:
                      </Typography>
                      <Typography variant="body2">
                        {TradeService.formatCurrency(toNumber(preview.itemsCost))} 🪙
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">
                        {t('trade.field.transportCost')}:
                      </Typography>
                      <Typography variant="body2">
                        {TradeService.formatCurrency(toNumber(preview.transportCost))} 🪙
                      </Typography>
                    </Box>
                    <Divider />
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body1" fontWeight="bold">
                        {t('trade.field.totalCost')}:
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" color="primary">
                        {TradeService.formatCurrency(toNumber(preview.totalCost))} 🪙
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Validation Status */}
                  {preview.validation && (
                    <Box mt={2}>
                      {!preview.validation.hasFunds && (
                        <Alert severity="error">
                          {t('trade.error.insufficientFunds')}
                        </Alert>
                      )}
                      {!preview.validation.hasSpace && (
                        <Alert severity="error">
                          {t('trade.error.insufficientSpace')}
                        </Alert>
                      )}
                    </Box>
                  )}
                </Paper>
              )}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          {t('trade.misc.close')}
        </Button>
        {trade.status === 'PENDING' && (
          <>
            {isIncoming ? (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleReject}
                  disabled={submitting}
                >
                  {t('trade.actions.reject')}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAccept}
                  disabled={
                    submitting ||
                    !destinationInventoryId ||
                    !preview?.validation?.canAccept
                  }
                >
                  {submitting ? (
                    <CircularProgress size={20} />
                  ) : (
                    t('trade.actions.accept')
                  )}
                </Button>
              </>
            ) : (
              <Button
                variant="outlined"
                color="error"
                onClick={handleCancel}
                disabled={submitting}
              >
                {t('trade.actions.cancel')}
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AcceptTradeModal;
