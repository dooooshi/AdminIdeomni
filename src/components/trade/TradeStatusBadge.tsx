'use client';

import React from 'react';
import { Chip } from '@mui/material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { TradeStatus, TradeStatusColors, TradeStatusTranslationKeys } from '@/types/trade';

interface TradeStatusBadgeProps {
  status: TradeStatus;
  size?: 'small' | 'medium';
}

export const TradeStatusBadge: React.FC<TradeStatusBadgeProps> = ({
  status,
  size = 'small',
}) => {
  const { t } = useTranslation();
  const translationKey = TradeStatusTranslationKeys[status];
  const fallback = status.charAt(0) + status.slice(1).toLowerCase();
  const label = translationKey ? t(translationKey, { defaultValue: fallback }) : fallback;

  return (
    <Chip
      label={label}
      color={TradeStatusColors[status] as any}
      size={size}
      variant="filled"
    />
  );
};

export default TradeStatusBadge;
