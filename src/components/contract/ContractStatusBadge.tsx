'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, ChipProps } from '@mui/material';
import {
  Schedule as PendingIcon,
  CheckCircle as SignedIcon,
  Cancel as RejectedIcon
} from '@mui/icons-material';
import { ContractStatus } from '@/types/contract';

interface ContractStatusBadgeProps {
  status: ContractStatus;
  size?: 'small' | 'medium';
  showIcon?: boolean;
}

const ContractStatusBadge: React.FC<ContractStatusBadgeProps> = ({ 
  status, 
  size = 'small',
  showIcon = true 
}) => {
  const { t } = useTranslation();

  // Get status configuration
  const getStatusConfig = (): {
    label: string;
    color: ChipProps['color'];
    icon?: React.ReactElement;
  } => {
    switch (status) {
      case ContractStatus.PENDING_APPROVAL:
        return {
          label: t('contract.STATUS_PENDING_APPROVAL'),
          color: 'warning',
          icon: showIcon ? <PendingIcon /> : undefined
        };
      case ContractStatus.SIGNED:
        return {
          label: t('contract.STATUS_SIGNED'),
          color: 'success',
          icon: showIcon ? <SignedIcon /> : undefined
        };
      case ContractStatus.REJECTED:
        return {
          label: t('contract.STATUS_REJECTED'),
          color: 'error',
          icon: showIcon ? <RejectedIcon /> : undefined
        };
      default:
        return {
          label: status,
          color: 'default',
          icon: undefined
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      icon={config.icon}
      variant="filled"
    />
  );
};

export default ContractStatusBadge;