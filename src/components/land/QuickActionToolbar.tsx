'use client';

import React from 'react';
import {
  Box,
  Paper,
  IconButton,
  Tooltip,
  Typography,
  Chip,
  Stack,
  Divider,
  keyframes
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Speed as SpeedIcon,
  Calculate as CalculateIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  GroupWork as BulkIcon,
  AttachMoney as MoneyIcon,
  Nature as EcoIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import LandService from '@/lib/services/landService';
import { AvailableTile } from '@/types/land';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';

const slideUpAnimation = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const ToolbarContainer = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1200,
  padding: theme.spacing(2),
  borderRadius: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.background.paper}f8 0%, rgba(255, 255, 255, 0.95) 100%)`,
  backdropFilter: 'blur(12px)',
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: `0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 16px rgba(0, 0, 0, 0.08)`,
  animation: `${slideUpAnimation} 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)`,
  minWidth: 320,
  maxWidth: 600,
  [theme.breakpoints.down('sm')]: {
    left: theme.spacing(2),
    right: theme.spacing(2),
    transform: 'none',
    minWidth: 'auto',
    maxWidth: 'none',
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: theme.spacing(1.5),
  transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
  '&:hover': {
    transform: 'translateY(-3px) scale(1.05)',
    boxShadow: theme.shadows[8],
  },
  '&:active': {
    transform: 'translateY(-1px) scale(0.98)',
  },
}));

const TileInfoChip = styled(Chip)(({ theme }) => ({
  height: 32,
  borderRadius: theme.spacing(2),
  '& .MuiChip-label': {
    fontWeight: 600,
  },
}));

const PriceDisplay = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.spacing(1),
  background: theme.palette.grey[100],
  border: `1px solid ${theme.palette.grey[200]}`,
}));

interface QuickActionToolbarProps {
  tile: AvailableTile | null;
  onClose: () => void;
  onPurchase: (tile: AvailableTile) => void;
  onQuickPurchase: (tile: AvailableTile) => void;
  onCalculateCost: (tile: AvailableTile) => void;
  onViewDetails: (tile: AvailableTile) => void;
  bulkMode?: boolean;
  onToggleBulkMode?: () => void;
}

const QuickActionToolbar: React.FC<QuickActionToolbarProps> = ({
  tile,
  onClose,
  onPurchase,
  onQuickPurchase,
  onCalculateCost,
  onViewDetails,
  bulkMode = false,
  onToggleBulkMode
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  if (!tile) return null;

  const totalPrice = (tile.currentGoldPrice || 0) + (tile.currentCarbonPrice || 0);
  const canPurchase = tile.canPurchase;
  const isOwned = tile.teamOwnedArea > 0;

  const getLandTypeColor = (landType: string) => {
    switch (landType) {
      case 'PLAIN':
        return 'success';
      case 'COASTAL':
        return 'info';
      case 'MARINE':
        return 'primary';
      case 'GRASSLANDS':
        return 'success';
      case 'FORESTS':
        return 'success';
      case 'HILLS':
        return 'warning';
      case 'MOUNTAINS':
        return 'default';
      case 'PLATEAUS':
        return 'warning';
      case 'DESERTS':
        return 'warning';
      case 'WETLANDS':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <ToolbarContainer elevation={12}>
      <Stack spacing={2}>
        {/* Tile Information Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1.5}>
            <LocationIcon 
              sx={{ 
                fontSize: '1.5rem', 
                color: `${getLandTypeColor(tile.landType)}.main` 
              }} 
            />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Tile {tile.tileId}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {tile.axialQ}, {tile.axialR}
              </Typography>
            </Box>
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            <TileInfoChip
              label={LandService.formatLandType(tile.landType)}
              color={getLandTypeColor(tile.landType) as any}
              size="small"
            />
            
            {isOwned && (
              <TileInfoChip
                label={`Owned: ${LandService.formatArea(tile.teamOwnedArea)}`}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
            
            <Tooltip title={String(t('land.CLOSE_TOOLBAR'))}>
              <IconButton size="small" onClick={onClose}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Price Information */}
        <Box display="flex" alignItems="center" gap={2} justifyContent="center">
          <PriceDisplay>
            <MoneyIcon sx={{ fontSize: '1rem', color: 'warning.main' }} />
            <Typography variant="body2" color="warning.main" fontWeight="bold">
              {LandService.formatCurrency(tile.currentGoldPrice || 0, 'gold')}
            </Typography>
          </PriceDisplay>
          
          <PriceDisplay>
            <EcoIcon sx={{ fontSize: '1rem', color: 'success.main' }} />
            <Typography variant="body2" color="success.main" fontWeight="bold">
              {LandService.formatCurrency(tile.currentCarbonPrice || 0, 'carbon')}
            </Typography>
          </PriceDisplay>
          
          <PriceDisplay sx={{ backgroundColor: 'primary.light', borderColor: 'primary.main' }}>
            <Typography variant="body2" color="primary.main" fontWeight="bold">
              Total: {LandService.formatCurrency(totalPrice)}
            </Typography>
          </PriceDisplay>
        </Box>

        <Divider />

        {/* Action Buttons */}
        <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
          <Tooltip title={String(t('land.QUICK_PURCHASE_TOOLTIP'))} arrow>
            <span>
              <ActionButton
                color="success"
                disabled={!canPurchase}
                onClick={() => onQuickPurchase(tile)}
                sx={{
                  bgcolor: canPurchase ? 'success.main' : 'grey.300',
                  color: canPurchase ? 'success.contrastText' : 'grey.500',
                  '&:hover': {
                    bgcolor: canPurchase ? 'success.dark' : 'grey.300',
                  },
                }}
              >
                <SpeedIcon />
              </ActionButton>
            </span>
          </Tooltip>

          <Tooltip title={String(t('land.PURCHASE_LAND_TOOLTIP'))} arrow>
            <span>
              <ActionButton
                color="primary"
                disabled={!canPurchase}
                onClick={() => onPurchase(tile)}
                sx={{
                  bgcolor: canPurchase ? 'primary.main' : 'grey.300',
                  color: canPurchase ? 'primary.contrastText' : 'grey.500',
                  '&:hover': {
                    bgcolor: canPurchase ? 'primary.dark' : 'grey.300',
                  },
                }}
              >
                <ShoppingCartIcon />
              </ActionButton>
            </span>
          </Tooltip>

          <Tooltip title={String(t('land.CALCULATE_COSTS_TOOLTIP'))} arrow>
            <ActionButton
              color="info"
              onClick={() => onCalculateCost(tile)}
              sx={{
                bgcolor: 'info.main',
                color: 'info.contrastText',
                '&:hover': {
                  bgcolor: 'info.dark',
                },
              }}
            >
              <CalculateIcon />
            </ActionButton>
          </Tooltip>

          <Tooltip title={String(t('land.VIEW_DETAILS_TOOLTIP'))} arrow>
            <ActionButton
              color="secondary"
              onClick={() => onViewDetails(tile)}
              sx={{
                bgcolor: 'secondary.main',
                color: 'secondary.contrastText',
                '&:hover': {
                  bgcolor: 'secondary.dark',
                },
              }}
            >
              <InfoIcon />
            </ActionButton>
          </Tooltip>

          {onToggleBulkMode && (
            <>
              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
              <Tooltip title={bulkMode ? "Exit Bulk Mode" : "Bulk Selection Mode"} arrow>
                <ActionButton
                  onClick={onToggleBulkMode}
                  sx={{
                    bgcolor: bulkMode ? 'warning.main' : 'grey.200',
                    color: bulkMode ? 'warning.contrastText' : 'grey.600',
                    '&:hover': {
                      bgcolor: bulkMode ? 'warning.dark' : 'grey.300',
                    },
                  }}
                >
                  <BulkIcon />
                </ActionButton>
              </Tooltip>
            </>
          )}
        </Box>

        {/* Status Information */}
        <Box display="flex" justifyContent="center">
          <Chip
            label={canPurchase ? '✓ Available for Purchase' : '✗ Not Available'}
            color={canPurchase ? 'success' : 'error'}
            variant="filled"
            size="small"
            sx={{ 
              fontWeight: 600,
              '& .MuiChip-label': {
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }
            }}
          />
        </Box>
      </Stack>
    </ToolbarContainer>
  );
};

export default QuickActionToolbar;