'use client';

import React from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Info as InfoIcon,
  Calculate as CalculateIcon,
  AttachMoney as MoneyIcon,
  Speed as SpeedIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { AvailableTile } from '@/types/land';

interface TileContextMenuProps {
  open: boolean;
  anchorPosition: { top: number; left: number } | null;
  tile: AvailableTile | null;
  onClose: () => void;
  onQuickPurchase: (tile: AvailableTile) => void;
  onPurchaseMax: (tile: AvailableTile) => void;
  onViewDetails: (tile: AvailableTile) => void;
  onCalculateCost: (tile: AvailableTile) => void;
}

const TileContextMenu: React.FC<TileContextMenuProps> = ({
  open,
  anchorPosition,
  tile,
  onClose,
  onQuickPurchase,
  onPurchaseMax,
  onViewDetails,
  onCalculateCost
}) => {
  const { t } = useTranslation();

  if (!tile) return null;

  const canPurchase = Boolean(tile.canPurchase);
  const hasAvailableArea = (tile.availableArea || 0) > 0;

  return (
    <Menu
      open={open}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      PaperProps={{
        sx: {
          minWidth: 220,
          boxShadow: 3,
          border: '1px solid',
          borderColor: 'divider',
        }
      }}
    >
      {/* Tile Header */}
      <Box sx={{ px: 2, py: 1, bgcolor: 'action.hover' }}>
        <Typography variant="subtitle2" fontWeight="bold">
          {t('land.TILE')} {tile.tileId}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {t(`TERRAIN_${tile.landType}`)} • {t('land.AVAILABLE')}: {tile.availableArea?.toFixed(1) || 0} {t('land.AREA_UNITS')}
        </Typography>
      </Box>

      <Divider />

      {/* Quick Purchase Actions */}
      {canPurchase && hasAvailableArea && (
        <>
          <MenuItem 
            onClick={() => {
              onQuickPurchase(tile);
              onClose();
            }}
            sx={{ py: 1.5 }}
          >
            <ListItemIcon>
              <SpeedIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary={t('land.QUICK_PURCHASE')}
              secondary={`${t('land.BUY')} 1 ${t('land.AREA_UNIT')} (${((tile.currentGoldPrice || 0) + (tile.currentCarbonPrice || 0)).toFixed(2)})`}
            />
          </MenuItem>

          <MenuItem 
            onClick={() => {
              onPurchaseMax(tile);
              onClose();
            }}
            sx={{ py: 1.5 }}
          >
            <ListItemIcon>
              <ShoppingCartIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary={t('land.PURCHASE_MAX_AVAILABLE')}
              secondary={`${t('land.BUY')} ${tile.availableArea?.toFixed(1)} ${t('land.AREA_UNITS')}`}
            />
          </MenuItem>

          <Divider />
        </>
      )}

      {/* Information Actions */}
      <MenuItem 
        onClick={() => {
          onViewDetails(tile);
          onClose();
        }}
        sx={{ py: 1.5 }}
      >
        <ListItemIcon>
          <InfoIcon color="primary" />
        </ListItemIcon>
        <ListItemText
          primary={t('land.VIEW_DETAILS')}
          secondary={t('land.VIEW_TILE_INFORMATION')}
        />
      </MenuItem>

      <MenuItem 
        onClick={() => {
          onCalculateCost(tile);
          onClose();
        }}
        sx={{ py: 1.5 }}
      >
        <ListItemIcon>
          <CalculateIcon color="info" />
        </ListItemIcon>
        <ListItemText
          primary={t('land.CALCULATE_COST')}
          secondary={t('land.ESTIMATE_PURCHASE_COST')}
        />
      </MenuItem>

      {/* Disabled actions for unavailable tiles */}
      {!canPurchase && (
        <>
          <Divider />
          <MenuItem disabled sx={{ py: 1.5 }}>
            <ListItemIcon>
              <CloseIcon color="disabled" />
            </ListItemIcon>
            <ListItemText
              primary={t('land.PURCHASE_UNAVAILABLE')}
              secondary={
                tile.isOwned 
                  ? t('land.ALREADY_OWNED_BY_TEAM')
                  : t('land.NOT_AVAILABLE_FOR_PURCHASE')
              }
            />
          </MenuItem>
        </>
      )}
    </Menu>
  );
};

export default TileContextMenu;