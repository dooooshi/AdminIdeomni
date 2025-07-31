'use client';

import React from 'react';
import { 
  Card, 
  CardContent, 
  Box, 
  Typography, 
  IconButton, 
  Chip,
  Stack,
  Divider
} from '@mui/material';
import { 
  UpgradeOutlined, 
  InfoOutlined, 
  WarningAmberOutlined 
} from '@mui/icons-material';
import type { TileFacilityInstance } from '@/types/facilities';
import { StudentFacilityService } from '@/lib/services/studentFacilityService';
import { useTranslation } from 'react-i18next';

interface FacilityCardProps {
  facility: TileFacilityInstance;
  onClick?: (facility: TileFacilityInstance) => void;
  onUpgrade?: (facility: TileFacilityInstance) => void;
  onViewDetails?: (facility: TileFacilityInstance) => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

const FacilityCard: React.FC<FacilityCardProps> = ({
  facility,
  onClick,
  onUpgrade,
  onViewDetails,
  showActions = true,
  compact = false,
  className,
}) => {
  const { t } = useTranslation(['facilityManagement', 'common']);

  const handleCardClick = () => {
    if (onClick) {
      onClick(facility);
    }
  };

  const handleUpgradeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpgrade) {
      onUpgrade(facility);
    }
  };

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(facility);
    }
  };

  const statusColor = StudentFacilityService.getStatusColor(facility.status);
  const statusText = StudentFacilityService.getStatusText(facility.status);
  const facilityIcon = StudentFacilityService.getFacilityIcon(facility.facilityType);
  const facilityName = StudentFacilityService.getFacilityTypeName(facility.facilityType);
  const totalInvestment = StudentFacilityService.calculateTotalInvestment(facility);
  const needsAttention = StudentFacilityService.needsAttention(facility);

  const maxLevel = 4;

  return (
    <Card
      className={className}
      onClick={handleCardClick}
      variant="outlined"
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.2s ease',
        '&:hover': onClick ? {
          borderColor: 'primary.main',
        } : {},
        height: '100%',
        ...(needsAttention && {
          borderLeftColor: 'warning.main',
          borderLeftWidth: 3,
        }),
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box flex={1}>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <Typography sx={{ fontSize: '1.25rem', lineHeight: 1 }}>
                {facilityIcon}
              </Typography>
              <Typography variant="h6" fontWeight={500} color="text.primary">
                {facilityName}
              </Typography>
              {needsAttention && (
                <WarningAmberOutlined color="warning" sx={{ fontSize: 18 }} />
              )}
            </Stack>
            
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={statusText}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  backgroundColor: `${statusColor}.50`,
                  color: `${statusColor}.800`,
                  border: `1px solid ${statusColor}.200`,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Tile {facility.tileId}
              </Typography>
            </Stack>
          </Box>

          {/* Actions */}
          {showActions && (
            <Stack direction="row" spacing={0.5}>
              {onViewDetails && (
                <IconButton 
                  size="small" 
                  onClick={handleDetailsClick}
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { color: 'primary.main' }
                  }}
                >
                  <InfoOutlined sx={{ fontSize: 18 }} />
                </IconButton>
              )}
              {onUpgrade && facility.level < maxLevel && (
                <IconButton 
                  size="small" 
                  onClick={handleUpgradeClick}
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { color: 'primary.main' }
                  }}
                >
                  <UpgradeOutlined sx={{ fontSize: 18 }} />
                </IconButton>
              )}
            </Stack>
          )}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* Stats Grid */}
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Level
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {facility.level} / {maxLevel}
            </Typography>
          </Box>
          
          {facility.capacity && (
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Capacity
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {new Intl.NumberFormat().format(facility.capacity)}
              </Typography>
            </Box>
          )}
          
          {facility.efficiency && (
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Efficiency
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {facility.efficiency}%
              </Typography>
            </Box>
          )}
          
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Investment
            </Typography>
            <Typography variant="body2" fontWeight={500} color="primary.main">
              {StudentFacilityService.formatCurrency(totalInvestment, 0)}
            </Typography>
          </Box>
        </Box>

        {/* Description */}
        {facility.description && !compact && (
          <Box mb={2}>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              Description
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.4,
              }}
            >
              {facility.description}
            </Typography>
          </Box>
        )}

        {/* Footer */}
        {!compact && (
          <Box pt={1} borderTop={1} borderColor="divider">
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Built by {facility.builder.firstName} {facility.builder.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Intl.DateTimeFormat('en-US', {
                  month: 'short',
                  day: 'numeric',
                }).format(new Date(facility.constructionStarted))}
              </Typography>
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default FacilityCard;