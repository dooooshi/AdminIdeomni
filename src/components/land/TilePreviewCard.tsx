'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip,
  Divider,
  keyframes
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Nature as EcoIcon,
  TrendingUp as TrendingUpIcon,
  ShoppingCart as ShoppingCartIcon,
  Speed as SpeedIcon,
  People as GroupIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import LandService from '@/lib/services/landService';
import { AvailableTile } from '@/types/land';

const floatAnimation = keyframes`
  0% {
    transform: translateY(0px) scale(0.95);
    opacity: 0;
  }
  50% {
    transform: translateY(-5px) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-8px) scale(1);
    opacity: 1;
  }
`;

const shimmerAnimation = keyframes`
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
`;

const PreviewCard = styled(Card)(({ theme }) => ({
  position: 'absolute',
  zIndex: 1000,
  minWidth: 320,
  maxWidth: 380,
  animation: `${floatAnimation} 0.3s ease-out`,
  backdropFilter: 'blur(12px)',
  background: `linear-gradient(135deg, ${theme.palette.background.paper}f5 0%, ${theme.palette.background.paper}f0 100%)`,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: `0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 16px rgba(0, 0, 0, 0.08)`,
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '2px',
    background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}, transparent)`,
    animation: `${shimmerAnimation} 2s infinite`,
  },
}));

const LandTypeChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.75rem',
  '& .MuiChip-icon': {
    fontSize: '1rem',
  },
}));

const PriceBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  background: `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[100]} 100%)`,
  border: `1px solid ${theme.palette.grey[200]}`,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.primary.light}20 0%, ${theme.palette.primary.main}10 100%)`,
    borderColor: theme.palette.primary.main,
  },
}));

const QuickActionButton = styled(IconButton)(({ theme }) => ({
  width: 36,
  height: 36,
  borderRadius: theme.spacing(1),
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

interface TilePreviewCardProps {
  tile: AvailableTile;
  position: { x: number; y: number };
  onQuickPurchase?: (tile: AvailableTile) => void;
  onViewDetails?: (tile: AvailableTile) => void;
  onCalculateCost?: (tile: AvailableTile) => void;
}

const TilePreviewCard: React.FC<TilePreviewCardProps> = ({
  tile,
  position,
  onQuickPurchase,
  onViewDetails,
  onCalculateCost
}) => {
  const theme = useTheme();

  // Calculate derived values
  const totalPrice = (tile.currentGoldPrice || 0) + (tile.currentCarbonPrice || 0);
  const ownershipPercentage = tile.teamOwnedArea > 0 ? (tile.teamOwnedArea / (tile.teamOwnedArea + tile.availableArea)) * 100 : 0;
  const isOwnedByTeam = tile.teamOwnedArea > 0;
  const canAfford = tile.canPurchase;

  // Get land type configuration
  const getLandTypeConfig = (landType: string) => {
    switch (landType) {
      case 'PLAIN':
        return { 
          color: 'success' as const, 
          icon: <LocationIcon />, 
          description: 'Balanced terrain with moderate pricing' 
        };
      case 'COASTAL':
        return { 
          color: 'info' as const, 
          icon: <LocationIcon />, 
          description: 'Premium coastal location with strategic value' 
        };
      case 'MARINE':
        return { 
          color: 'primary' as const, 
          icon: <LocationIcon />, 
          description: 'High-value marine territory with unique benefits' 
        };
      default:
        return { 
          color: 'default' as const, 
          icon: <LocationIcon />, 
          description: 'Unknown terrain type' 
        };
    }
  };

  const landConfig = getLandTypeConfig(tile.landType);

  // Calculate position with viewport boundaries
  const cardWidth = 380;
  const cardHeight = 280;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const isMobile = viewportWidth < theme.breakpoints.values.md;
  
  let adjustedX = position.x;
  let adjustedY = position.y - 20; // Default offset above cursor

  // On mobile, positioning is handled by CSS fixed positioning
  if (!isMobile) {
    // Adjust horizontal position
    if (adjustedX + cardWidth > viewportWidth - 20) {
      adjustedX = viewportWidth - cardWidth - 20;
    }
    if (adjustedX < 20) {
      adjustedX = 20;
    }

    // Adjust vertical position
    if (adjustedY + cardHeight > viewportHeight - 20) {
      adjustedY = position.y - cardHeight - 20; // Show above cursor
    }
    if (adjustedY < 20) {
      adjustedY = 20;
    }
  }

  return (
    <PreviewCard
      elevation={8}
      style={{
        left: isMobile ? 'auto' : adjustedX,
        top: isMobile ? 'auto' : adjustedY,
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar 
              sx={{ 
                bgcolor: `${landConfig.color}.main`, 
                width: 40, 
                height: 40,
                boxShadow: 2
              }}
            >
              {landConfig.icon}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Tile {tile.tileId}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tile.axialQ}, {tile.axialR}
              </Typography>
            </Box>
          </Box>
          <LandTypeChip
            label={LandService.formatLandType(tile.landType)}
            color={landConfig.color}
            icon={landConfig.icon}
            size="small"
          />
        </Box>

        {/* Land type description */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
          {landConfig.description}
        </Typography>

        {/* Ownership status */}
        {isOwnedByTeam && (
          <Box mb={2}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Your Team's Ownership
              </Typography>
              <Typography variant="body2" fontWeight="bold" color="primary.main">
                {ownershipPercentage.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={ownershipPercentage}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: theme.palette.grey[200],
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                },
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Owned: {LandService.formatArea(tile.teamOwnedArea)} units
            </Typography>
          </Box>
        )}

        {/* Price Information */}
        <Stack spacing={1.5} mb={2}>
          <Box display="flex" gap={1}>
            <PriceBox flex={1}>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <MoneyIcon sx={{ fontSize: '1rem', color: 'warning.main' }} />
                <Typography variant="caption" color="text.secondary">
                  Gold
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="bold" color="warning.main">
                {LandService.formatCurrency(tile.currentGoldPrice || 0, 'gold')}
              </Typography>
            </PriceBox>
            
            <PriceBox flex={1}>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <EcoIcon sx={{ fontSize: '1rem', color: 'success.main' }} />
                <Typography variant="caption" color="text.secondary">
                  Carbon
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="bold" color="success.main">
                {LandService.formatCurrency(tile.currentCarbonPrice || 0, 'carbon')}
              </Typography>
            </PriceBox>
          </Box>

          <PriceBox>
            <Box display="flex" alignItems="center" justifyContent="between">
              <Box flex={1}>
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <TrendingUpIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />
                  <Typography variant="caption" color="text.secondary">
                    Total per unit
                  </Typography>
                </Box>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  {LandService.formatCurrency(totalPrice)}
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="caption" color="text.secondary">
                  Available
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="primary.main">
                  Unlimited
                </Typography>
              </Box>
            </Box>
          </PriceBox>
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        {/* Quick Actions */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={canAfford ? 'Available' : 'Unavailable'}
              color={canAfford ? 'success' : 'error'}
              size="small"
              variant="filled"
            />
            {isOwnedByTeam && (
              <Chip
                label="Owned"
                color="primary"
                size="small"
                variant="outlined"
                icon={<GroupIcon />}
              />
            )}
          </Box>

          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Quick Purchase (1 unit)">
              <span>
                <QuickActionButton
                  size="small"
                  color="success"
                  disabled={!canAfford}
                  onClick={() => onQuickPurchase?.(tile)}
                >
                  <SpeedIcon fontSize="small" />
                </QuickActionButton>
              </span>
            </Tooltip>
            
            <Tooltip title="Purchase Land">
              <span>
                <QuickActionButton
                  size="small"
                  color="primary"
                  disabled={!canAfford}
                  onClick={() => onViewDetails?.(tile)}
                >
                  <ShoppingCartIcon fontSize="small" />
                </QuickActionButton>
              </span>
            </Tooltip>
            
            <Tooltip title="Calculate Costs">
              <QuickActionButton
                size="small"
                color="info"
                onClick={() => onCalculateCost?.(tile)}
              >
                <StarIcon fontSize="small" />
              </QuickActionButton>
            </Tooltip>
          </Stack>
        </Box>
      </CardContent>
    </PreviewCard>
  );
};

export default TilePreviewCard;