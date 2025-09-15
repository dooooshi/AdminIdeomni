'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  Stack,
  LinearProgress,
  IconButton,
  Tooltip,
  Button
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Group as GroupIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import LandService from '@/lib/services/landService';
import { TileOwnershipDetail } from '@/types/land';
import { format } from 'date-fns';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
  },
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

export interface LandOwnershipCardProps {
  ownership: TileOwnershipDetail;
  showActions?: boolean;
  compact?: boolean;
  maxArea?: number;
  onViewDetails?: () => void;
  onViewTeam?: () => void;
}

const LandOwnershipCard: React.FC<LandOwnershipCardProps> = ({
  ownership,
  showActions = false,
  compact = false,
  maxArea = 25,
  onViewDetails,
  onViewTeam
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Calculate ownership percentage
  const ownershipPercentage = LandService.calculateOwnershipPercentage(ownership.ownedArea || 0, maxArea);
  
  // Calculate average cost per area  
  const avgCostPerArea = (ownership.ownedArea || 0) > 0 ? (ownership.totalPurchased || 0) / (ownership.ownedArea || 0) : 0;
  
  // Calculate days since first purchase
  const daysSinceFirst = Math.ceil(
    (new Date().getTime() - new Date(ownership.firstPurchaseDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  const renderProgressBar = () => (
    <ProgressContainer>
      <LinearProgress
        variant="determinate"
        value={ownershipPercentage}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: theme.palette.grey[200],
          '& .MuiLinearProgress-bar': {
            backgroundColor: ownershipPercentage > 75 
              ? theme.palette.error.main
              : ownershipPercentage > 50 
              ? theme.palette.warning.main 
              : theme.palette.success.main,
            borderRadius: 4,
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: -2,
          left: '50%',
          transform: 'translateX(-50%)',
          minWidth: 35,
          textAlign: 'center',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.75rem',
            fontWeight: 'bold',
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.background.paper,
            px: 0.5,
            borderRadius: 1,
            boxShadow: 1,
          }}
        >
          {ownershipPercentage}%
        </Typography>
      </Box>
    </ProgressContainer>
  );

  if (compact) {
    return (
      <StyledCard variant="outlined">
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                <GroupIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" noWrap>
                  {ownership.teamName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('landManagement.TILE')} {ownership.tileId}
                </Typography>
              </Box>
            </Box>
            <Box textAlign="right">
              <Typography variant="body2" fontWeight="bold">
                {LandService.formatArea(ownership.ownedArea || 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('PERCENT_OWNED', { percent: ownershipPercentage })}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </StyledCard>
    );
  }

  return (
    <StyledCard>
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
              <GroupIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" component="h3">
                {ownership.teamName}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <LocationIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {t('landManagement.TILE')} {ownership.tileId}
                </Typography>
              </Box>
            </Box>
          </Box>
          {showActions && (
            <Tooltip title={t('landManagement.VIEW_DETAILS')}>
              <IconButton onClick={onViewDetails} size="small">
                <InfoIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Ownership Progress */}
        {renderProgressBar()}

        {/* Key Metrics */}
        <Stack spacing={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {t('landManagement.AREA_OWNED')}
            </Typography>
            <Typography variant="h6" color="primary.main">
              {LandService.formatArea(ownership.ownedArea || 0)}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {t('landManagement.TOTAL_INVESTED')}
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {LandService.formatCurrency(ownership.totalPurchased || 0)}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {t('landManagement.PURCHASES_MADE')}
            </Typography>
            <Typography variant="body2">
              {ownership.purchaseCount || 0}
            </Typography>
          </Box>
        </Stack>

        {/* Investment Breakdown */}
        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            {t('landManagement.INVESTMENT_BREAKDOWN')}
          </Typography>
          <Stack spacing={1}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="caption">{t('landManagement.GOLD_SPENT')}:</Typography>
              <Typography variant="caption" fontWeight="bold" color="warning.main">
                {LandService.formatCurrency(ownership.totalGoldSpent || 0, 'gold')}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="caption">{t('landManagement.CARBON_SPENT')}:</Typography>
              <Typography variant="caption" fontWeight="bold" color="success.main">
                {LandService.formatCurrency(ownership.totalCarbonSpent || 0, 'carbon')}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="caption">{t('landManagement.AVG_COST_PER_AREA')}:</Typography>
              <Typography variant="caption" fontWeight="bold">
                {LandService.formatCurrency(avgCostPerArea)}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Timeline */}
        <Box sx={{ mt: 2 }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <CalendarIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              {t('landManagement.ACTIVITY_TIMELINE')}
            </Typography>
          </Box>
          <Stack spacing={0.5}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="caption">{t('landManagement.FIRST_PURCHASE')}:</Typography>
              <Typography variant="caption">
                {format(new Date(ownership.firstPurchaseDate), 'MMM dd, yyyy')}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="caption">{t('landManagement.LATEST_PURCHASE')}:</Typography>
              <Typography variant="caption">
                {format(new Date(ownership.lastPurchaseDate), 'MMM dd, yyyy')}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="caption">{t('landManagement.ACTIVE_DAYS')}:</Typography>
              <Typography variant="caption" fontWeight="bold" color="primary.main">
                {t('DAYS_COUNT', { count: daysSinceFirst })}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Performance Indicator */}
        <Box sx={{ mt: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              {t('landManagement.PERFORMANCE_LEVEL')}
            </Typography>
            <Chip
              size="small"
              label={
                ownershipPercentage > 15 ? t('landManagement.HIGH_IMPACT') :
                ownershipPercentage > 5 ? t('landManagement.MODERATE_IMPACT') :
                t('landManagement.LOW_IMPACT')
              }
              color={
                ownershipPercentage > 15 ? 'success' :
                ownershipPercentage > 5 ? 'warning' :
                'default'
              }
              icon={<TrendingUpIcon />}
            />
          </Box>
        </Box>

        {/* Actions */}
        {showActions && (
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={onViewTeam}
              startIcon={<GroupIcon />}
            >
              {t('landManagement.VIEW_TEAM')}
            </Button>
            <Button 
              variant="contained" 
              size="small" 
              onClick={onViewDetails}
              startIcon={<InfoIcon />}
            >
              {t('landManagement.DETAILS')}
            </Button>
          </Stack>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default LandOwnershipCard;