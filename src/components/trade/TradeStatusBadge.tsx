'use client';

import React from 'react';
import { Chip } from '@mui/material';
import { TradeStatus, TradeStatusColors, TradeStatusLabels } from '@/types/trade';

interface TradeStatusBadgeProps {
  status: TradeStatus;
  size?: 'small' | 'medium';
}

export const TradeStatusBadge: React.FC<TradeStatusBadgeProps> = ({
  status,
  size = 'small',
}) => {
  return (
    <Chip
      label={TradeStatusLabels[status]}
      color={TradeStatusColors[status] as any}
      size={size}
      variant="filled"
    />
  );
};

export default TradeStatusBadge;