'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  Paper,
  Chip,
  Divider,
} from '@mui/material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  InventoryItemType,
  TradeFormulaDetails,
  TradeItem,
  TradeOrder,
  toNumber,
} from '@/types/trade';
import { TradeService } from '@/lib/services/tradeService';

interface TradeDetailsModalProps {
  open: boolean;
  trade: TradeOrder | null;
  onClose: () => void;
}

const formatCurrency = (value?: number | string | null, fallback = '—'): string => {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  return TradeService.formatCurrency(value, false);
};

const FormulaDetails: React.FC<{ details: TradeFormulaDetails }> = ({ details }) => {
  const { t } = useTranslation();

  return (
    <Stack spacing={1.5} mt={1.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline">
        <Typography variant="subtitle2">
          {t('trade.product.formulaLabel', {
            id: details.formulaNumber ?? '—',
          })}
        </Typography>
        {details.carbonEmission !== undefined && (
          <Typography variant="caption" color="text.secondary">
            {t('trade.product.carbonEmission')}: {Number(details.carbonEmission).toFixed(2)}
          </Typography>
        )}
      </Stack>

      {details.description && (
        <Typography variant="body2" color="text.secondary">
          {details.description}
        </Typography>
      )}

      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">
          {t('trade.product.materialCost')}
        </Typography>
        <Typography variant="body2" fontWeight={500}>
          {formatCurrency(details.totalMaterialCost, '0')}
        </Typography>
      </Stack>

      {details.materials && details.materials.length > 0 && (
        <Stack spacing={0.75}>
          <Typography variant="caption" color="text.secondary">
            {t('trade.product.materials')}
          </Typography>
          {details.materials.map((material) => (
            <Box
              key={material.materialId}
              display="flex"
              justifyContent="space-between"
              gap={1}
            >
              <Typography variant="body2" sx={{ flex: 1 }}>
                {material.materialName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {material.quantity} {material.unit}
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {formatCurrency(material.materialCost, '0')}
              </Typography>
            </Box>
          ))}
        </Stack>
      )}

      {details.craftCategories && details.craftCategories.length > 0 && (
        <Stack spacing={0.5}>
          <Typography variant="caption" color="text.secondary">
            {t('trade.product.craftCategories')}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {details.craftCategories.map((category) => (
              <Chip key={category.categoryId} label={category.categoryName} size="small" variant="outlined" />
            ))}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};

const TradeItemCard: React.FC<{ item: TradeItem }> = ({ item }) => {
  const { t } = useTranslation();
  const quantity = toNumber(item.quantity);
  const isProduct = String(item.itemType).toUpperCase() === InventoryItemType.PRODUCT;

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {item.itemName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isProduct
                ? t('trade.itemType.product')
                : t('trade.itemType.material')}
            </Typography>
          </Box>
          <Chip label={`${quantity}`} size="small" variant="outlined" />
        </Stack>

        {isProduct && item.formulaDetails && (
          <FormulaDetails details={item.formulaDetails} />
        )}
      </Stack>
    </Paper>
  );
};

export const TradeDetailsModal: React.FC<TradeDetailsModalProps> = ({ open, trade, onClose }) => {
  const { t } = useTranslation();

  if (!trade) {
    return null;
  }

  const statusLabel = TradeService.getStatusText(trade.status, t);
  const statusColor = TradeService.getStatusColor(trade.status);
  const createdAt = trade.createdAt
    ? TradeService.formatTradeDate(trade.createdAt)
    : t('trade.misc.notAvailable');
  const totalPrice = TradeService.formatCurrency(toNumber(trade.totalPrice));
  const senderName = trade.senderTeam?.name || t('trade.misc.unknownTeam');
  const targetName = trade.targetTeam?.name || t('trade.misc.unknownTeam');
  const facilityLabel =
    trade.sourceFacility?.name ||
    trade.sourceFacility?.type ||
    t('trade.misc.unknownFacility');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t('trade.detailsTitle')}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                spacing={1.5}
              >
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    {t('trade.field.from')}
                  </Typography>
                  <Typography variant="h6">{senderName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {facilityLabel}
                  </Typography>
                </Box>
                <Stack spacing={1} alignItems={{ xs: 'flex-start', sm: 'flex-end' }}>
                  <Chip label={statusLabel} color={statusColor} size="small" />
                  <Typography variant="caption" color="text.secondary">
                    {t('trade.field.createdAt')}: {createdAt}
                  </Typography>
                </Stack>
              </Stack>

              <Divider />

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                spacing={1.5}
              >
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    {t('trade.field.to')}
                  </Typography>
                  <Typography variant="h6">{targetName}</Typography>
                </Box>
                <Box textAlign={{ xs: 'left', sm: 'right' }}>
                  <Typography variant="overline" color="text.secondary">
                    {t('trade.field.price')}
                  </Typography>
                  <Typography variant="h5" fontWeight={600}>
                    {totalPrice} 🪙
                  </Typography>
                </Box>
              </Stack>

              {trade.message && (
                <>
                  <Divider />
                  <Typography variant="body2" color="text.secondary">
                    {trade.message}
                  </Typography>
                </>
              )}
            </Stack>
          </Paper>

          <Stack spacing={2}>
            <Typography variant="subtitle1">
              {t('trade.field.items')}
            </Typography>

            {trade.items && trade.items.length > 0 ? (
              <Stack spacing={1.5}>
                {trade.items.map((item, index) => (
                  <TradeItemCard key={`${item.itemName}-${index}`} item={item} />
                ))}
              </Stack>
            ) : (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {t('trade.field.noItems')}
                </Typography>
              </Paper>
            )}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('trade.misc.close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TradeDetailsModal;
